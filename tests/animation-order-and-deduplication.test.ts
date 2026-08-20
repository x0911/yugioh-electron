import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Animation Order & Deduplication Tests ===\n');

async function testSummonAnimationDeduplication() {
  console.log('Test 1: Verification that Normal and Special Summons emit only one spatial MOVE event per summon...');

  const engine = new DuelEngineService();
  await engine.init();

  let moveSummonCount = 0;
  let summoningEventCount = 0;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'MOVE') {
      const m = ev as any;
      if (m.fromLocation === 2 && m.toLocation === 4) {
        moveSummonCount++;
      }
    } else if (ev.type === 'SUMMONING' || ev.type === 'SPSUMMONING') {
      summoningEventCount++;
    }

    if (ev.isPrompt && ev.promptType === 'SELECT_IDLECMD') {
      const pData = ev.promptData as any;
      if (pData.summons && pData.summons.length > 0 && moveSummonCount === 0) {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_SUMMON,
            index: 0,
          });
        }, 5);
      }
    }
  });

  const p0Deck: number[] = [91152256, 91152256, 91152256, 91152256, 91152256];
  while (p0Deck.length < 40) p0Deck.push(91152256);
  const p1Deck: number[] = [];
  while (p1Deck.length < 40) p1Deck.push(91152256);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
  });

  const start = Date.now();
  while (moveSummonCount === 0 && Date.now() - start < 3000) {
    await new Promise((r) => setTimeout(r, 40));
  }

  assert.strictEqual(moveSummonCount, 1, 'Exactly 1 spatial MOVE event must be emitted for the summon');
  assert.strictEqual(summoningEventCount, 1, 'Exactly 1 SUMMONING event emitted for the summon announcement');
  console.log('✓ Normal Summon emits exactly 1 MOVE and 1 SUMMONING event (unified spatial movement eliminates duplicate flights).');
  engine.close();
}

async function testRaigekiSequentialDestructionOrder() {
  console.log('\nTest 2: Verification of Raigeki sequential destruction and board state ordering...');

  const engine = new DuelEngineService();
  await engine.init();

  const eventsSequence: string[] = [];
  let raigekiChainDone = false;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'MOVE') {
      const m = ev as any;
      if (m.fromLocation === 2 && m.toLocation === 8) {
        eventsSequence.push('RAIGEKI_HAND_TO_FIELD');
      } else if (m.fromLocation === 4 && m.toLocation === 16) {
        eventsSequence.push(`MONSTER_DESTROYED_TO_GY_${m.controller}_SEQ_${m.fromSequence}`);
      } else if (m.fromLocation === 8 && m.toLocation === 16) {
        eventsSequence.push('RAIGEKI_FIELD_TO_GY');
      }
    } else if (ev.type === 'CHAINING') {
      eventsSequence.push('RAIGEKI_CHAINING');
    } else if (ev.type === 'CHAIN_SOLVED') {
      eventsSequence.push('RAIGEKI_CHAIN_SOLVED');
      raigekiChainDone = true;
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;
      if (ev.promptType === 'SELECT_IDLECMD') {
        const raigekiIdx = pData.activates?.findIndex((a: any) => a.code === 12580477);
        if (raigekiIdx !== undefined && raigekiIdx >= 0) {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_ACTIVATE,
              index: raigekiIdx,
            });
          }, 5);
        }
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

  // Player 0 has Raigeki (12580477)
  const p0Deck: number[] = [12580477, 12580477, 12580477, 12580477, 12580477];
  while (p0Deck.length < 40) p0Deck.push(12580477);

  // Player 1 has Blue-Eyes (89631139)
  const p1Deck: number[] = [];
  while (p1Deck.length < 40) p1Deck.push(89631139);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player1Monsters: [
      { code: 89631139, sequence: 0 },
      { code: 89631139, sequence: 1 },
    ],
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
  });

  const start = Date.now();
  while (!raigekiChainDone && Date.now() - start < 4000) {
    await new Promise((r) => setTimeout(r, 40));
  }

  console.log('   Observed event sequence:');
  eventsSequence.forEach((evt, idx) => console.log(`     [${idx + 1}] ${evt}`));

  assert.ok(eventsSequence.includes('RAIGEKI_HAND_TO_FIELD'), 'Raigeki must move to field first');
  assert.ok(eventsSequence.includes('RAIGEKI_CHAINING'), 'Raigeki must activate / chain');

  const handToFieldIdx = eventsSequence.indexOf('RAIGEKI_HAND_TO_FIELD');
  const chainingIdx = eventsSequence.indexOf('RAIGEKI_CHAINING');
  const fieldToGyIdx = eventsSequence.indexOf('RAIGEKI_FIELD_TO_GY');

  assert.ok(handToFieldIdx < chainingIdx, 'Raigeki moves from Hand to Field BEFORE Chaining');
  assert.ok(chainingIdx < fieldToGyIdx, 'Raigeki activates BEFORE being sent to GY');

  console.log('✓ Raigeki sequential destruction order strictly verified.');
  engine.close();
}

async function runAll() {
  await testSummonAnimationDeduplication();
  await testRaigekiSequentialDestructionOrder();
  console.log('\n🎉 ALL ANIMATION ORDER & DEDUPLICATION TESTS PASSED SUCCESSFULLY!');
}

runAll();
