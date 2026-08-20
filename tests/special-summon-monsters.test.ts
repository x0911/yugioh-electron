import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Special Summon Monster Procedures & SELECT_UNSELECT_CARD Tests ===\n');

async function testBaseScriptsPreloaded() {
  console.log('Test 1: Verification of preloaded core procedure and helper Lua scripts...');

  const engine = new DuelEngineService();
  await engine.init();

  const csScript = (engine as any).scriptReader.getBaseScript('cards_specific_functions.lua');
  assert.ok(csScript && csScript.length > 1000, 'cards_specific_functions.lua must be present and non-empty');

  const fusionScript = (engine as any).scriptReader.getBaseScript('proc_fusion.lua');
  assert.ok(fusionScript && fusionScript.length > 1000, 'proc_fusion.lua must be present');

  const synchroScript = (engine as any).scriptReader.getBaseScript('proc_synchro.lua');
  assert.ok(synchroScript && synchroScript.length > 1000, 'proc_synchro.lua must be present');

  const xyzScript = (engine as any).scriptReader.getBaseScript('proc_xyz.lua');
  assert.ok(xyzScript && xyzScript.length > 1000, 'proc_xyz.lua must be present');

  console.log('✓ All core runtime Lua scripts validated and preloaded.');
  engine.close();
}

async function testChaosSorcererSpecialSummon() {
  console.log('\nTest 2: Chaos Sorcerer (9596126) Special Summon via GY Banishment (1 LIGHT + 1 DARK)...');

  const engine = new DuelEngineService();
  await engine.init();

  let csSummoned = false;
  let unselectPromptCount = 0;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'SPSUMMONED') {
      csSummoned = true;
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;
      if (ev.promptType === 'SELECT_IDLECMD') {
        const csSpecial = pData.special_summons?.find((s: any) => s.code === 9596126);
        const cdIdx = pData.activates?.findIndex((a: any) => a.code === 72892473);

        if (csSpecial) {
          const csIdx = pData.special_summons.indexOf(csSpecial);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
              index: csIdx,
            });
          }, 5);
        } else if (cdIdx !== undefined && cdIdx >= 0) {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_ACTIVATE,
              index: cdIdx,
            });
          }, 5);
        } else {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null,
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_UNSELECT_CARD') {
        unselectPromptCount++;
        if (pData.can_finish && pData.selects.length === 0) {
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
        } else {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_UNSELECT_CARD,
              index: null,
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_POSITION') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_POSITION,
            position: 1, // POS_FACEUP_ATTACK
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
  assert.ok(unselectPromptCount >= 2, 'Must emit SELECT_UNSELECT_CARD prompts for 1 LIGHT and 1 DARK');
  console.log('✓ Chaos Sorcerer special summon & GY banish cost resolution verified.');
  engine.close();
}

async function testBlackLusterSoldierSpecialSummon() {
  console.log('\nTest 3: Black Luster Soldier - Envoy of the Beginning (72989439) Special Summon...');

  const engine = new DuelEngineService();
  await engine.init();

  let blsSummoned = false;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'SPSUMMONED') {
      blsSummoned = true;
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;
      if (ev.promptType === 'SELECT_IDLECMD') {
        const blsSpecial = pData.special_summons?.find((s: any) => s.code === 72989439);

        if (blsSpecial) {
          const blsIdx = pData.special_summons.indexOf(blsSpecial);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
              index: blsIdx,
            });
          }, 5);
        } else {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null,
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_UNSELECT_CARD') {
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
        } else {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_UNSELECT_CARD,
              index: null,
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

  const p0Deck: number[] = [72989439, 72989439, 72989439, 72989439, 72989439];
  while (p0Deck.length < 40) p0Deck.push(72989439);

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
  while (!blsSummoned && Date.now() - start < 4000) {
    await new Promise((r) => setTimeout(r, 40));
  }

  assert.strictEqual(blsSummoned, true, 'BLS must be successfully Special Summoned');
  console.log('✓ Black Luster Soldier - Envoy of the Beginning summon verified.');
  engine.close();
}

async function runAll() {
  await testBaseScriptsPreloaded();
  await testChaosSorcererSpecialSummon();
  await testBlackLusterSoldierSpecialSummon();
  console.log('\n🎉 ALL SPECIAL SUMMON MONSTER PROCEDURAL TESTS PASSED SUCCESSFULLY!');
}

runAll();
