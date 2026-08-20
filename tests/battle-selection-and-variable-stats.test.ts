import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { formatCombatStat } from '../src/renderer/utils/format.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Battle Selection, Multi-Step Cost & Variable Stats Tests ===\n');

function testCombatStatFormatter() {
  console.log('Test 1: Verification of combat stat formatter for variable and printed ? stats...');

  assert.strictEqual(formatCombatStat(3000), '3000');
  assert.strictEqual(formatCombatStat(0), '0');
  assert.strictEqual(formatCombatStat(-2), '?', 'Negative stat -2 must format as ?');
  assert.strictEqual(formatCombatStat(-1), '?', 'Negative stat -1 must format as ?');
  assert.strictEqual(formatCombatStat(undefined), '0');
  assert.strictEqual(formatCombatStat(null), '0');

  console.log('✓ formatCombatStat correctly formats numerical and variable "?" stats without emitting negative numbers.');
}

async function testSliferDynamicOnFieldStats() {
  console.log('\nTest 2: Slifer the Sky Dragon (10000020) dynamic on-field ATK/DEF calculation...');

  const engine = new DuelEngineService();
  await engine.init();

  const p0Deck: number[] = [10000020, 91152256, 91152256, 91152256, 91152256, 91152256];
  while (p0Deck.length < 40) p0Deck.push(91152256);

  const p1Deck: number[] = [];
  while (p1Deck.length < 40) p1Deck.push(91152256);

  // Start duel with Slifer on Player 0's field and 4 cards in hand
  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player0Monsters: [{ code: 10000020, sequence: 2 }],
    startingLP: 8000,
    startingDrawCount: 4,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
  });

  const boardState = engine.getBoardState();
  const sliferCard = boardState.userField.monsterZones[2];

  assert.ok(sliferCard, 'Slifer must exist on field');
  assert.strictEqual(sliferCard?.code, 10000020);
  assert.strictEqual(boardState.userField.hand.length, 4, 'User must have 4 cards in hand');
  assert.strictEqual(sliferCard?.atk, 4000, 'Slifer ATK on field must equal cards in hand * 1000 (4000)');
  assert.strictEqual(sliferCard?.def, 4000, 'Slifer DEF on field must equal cards in hand * 1000 (4000)');

  console.log(`✓ Slifer on-field stats dynamically computed: ${sliferCard?.atk} ATK / ${sliferCard?.def} DEF (4 cards in hand).`);
  engine.close();
}

async function testChaosSorcererMultiStepSelection() {
  console.log('\nTest 3: Chaos Sorcerer (9596126) 2-Monster Banish Cost Dialogue...');

  const engine = new DuelEngineService();
  await engine.init();

  let unselectPromptCount = 0;
  let csSummoned = false;
  const promptSteps: any[] = [];

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'SPSUMMONED') {
      csSummoned = true;
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;
      if (ev.promptType === 'SELECT_IDLECMD') {
        const csSpecial = pData.special_summons?.find((s: any) => s.code === 9596126);
        if (csSpecial) {
          const csIdx = pData.special_summons.indexOf(csSpecial);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
              index: csIdx,
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_UNSELECT_CARD') {
        unselectPromptCount++;
        promptSteps.push({
          step: unselectPromptCount,
          selects: pData.selects?.length,
          unselects: pData.unselect_cards?.length,
          canFinish: pData.can_finish,
        });

        if (pData.can_finish && (!pData.selects || pData.selects.length === 0)) {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_UNSELECT_CARD,
              index: null,
            });
          }, 5);
        } else if (pData.selects && pData.selects.length > 0) {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_UNSELECT_CARD,
              index: 0,
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_POSITION') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_POSITION,
            position: 1,
          });
        }, 5);
      } else if (ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: -1,
          });
        }, 5);
      }
    }
  });

  const p0Deck: number[] = [9596126, 9596126, 9596126, 9596126, 9596126];
  while (p0Deck.length < 40) p0Deck.push(9596126);

  const p1Deck: number[] = [];
  while (p1Deck.length < 40) p1Deck.push(46986414);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player0Graveyard: [89631139, 46986414], // 1 LIGHT + 1 DARK in GY
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
  });

  const start = Date.now();
  while (!csSummoned && Date.now() - start < 4000) {
    await new Promise((r) => setTimeout(r, 40));
  }

  assert.strictEqual(csSummoned, true, 'Chaos Sorcerer must be successfully Special Summoned');
  assert.ok(unselectPromptCount >= 2, 'Must process multiple interactive selection steps');
  console.log('✓ Multi-step SELECT_UNSELECT_CARD dialogue verified across steps:', promptSteps);
  engine.close();
}

async function testLocationVisibilityClassification() {
  console.log('\nTest 4: Visible vs Hidden Duel Location Classification...');

  const isHiddenLoc = (loc?: number) => {
    if (!loc) return false;
    return (
      loc === 1 ||
      loc === 16 ||
      loc === 32 ||
      loc === 64 ||
      (loc & 1) !== 0 ||
      (loc & 16) !== 0 ||
      (loc & 32) !== 0 ||
      (loc & 64) !== 0
    );
  };

  // Field monster attack target (Location: 4) -> Visible (No center modal)
  assert.strictEqual(isHiddenLoc(4), false, 'Monster Zone (4) is visible');
  // Spell/Trap zone (Location: 8) -> Visible (No center modal)
  assert.strictEqual(isHiddenLoc(8), false, 'Spell/Trap Zone (8) is visible');
  // Hand (Location: 2) -> Visible (No center modal)
  assert.strictEqual(isHiddenLoc(2), false, 'Hand (2) is visible');

  // Graveyard (Location: 16) -> Hidden (Opens center modal)
  assert.strictEqual(isHiddenLoc(16), true, 'Graveyard (16) is hidden');
  // Deck (Location: 1) -> Hidden (Opens center modal)
  assert.strictEqual(isHiddenLoc(1), true, 'Deck (1) is hidden');
  // Banished (Location: 32) -> Hidden (Opens center modal)
  assert.strictEqual(isHiddenLoc(32), true, 'Banished (32) is hidden');
  // Extra Deck (Location: 64) -> Hidden (Opens center modal)
  assert.strictEqual(isHiddenLoc(64), true, 'Extra Deck (64) is hidden');

  console.log('✓ Location visibility accurately differentiates field actions from hidden stack modals.');
}

async function runAll() {
  testCombatStatFormatter();
  await testSliferDynamicOnFieldStats();
  await testChaosSorcererMultiStepSelection();
  await testLocationVisibilityClassification();
  console.log('\n🎉 ALL BATTLE SELECTION, COST & VARIABLE STATS TESTS PASSED SUCCESSFULLY!');
}

runAll().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
