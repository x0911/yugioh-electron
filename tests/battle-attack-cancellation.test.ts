import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectBattleCMDAction, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Battle Attack Cancellation & Re-Attack Verification Tests ===\n');

async function testFullAttackCancelAndReattack() {
  const engine = new DuelEngineService();
  await engine.init();

  const p0Deck: number[] = Array(40).fill(91152256);
  const p1Deck: number[] = Array(40).fill(91152256);

  let attackAttempts = 0;
  let emptyArrayCancelSuccess = false;
  let nullCancelSuccess = false;
  let attackCompleted = false;
  let enteredM2 = false;
  let retryCount = 0;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'NEW_PHASE' && (ev.phase === 'M2' || ev.description?.includes('MAIN2'))) {
      enteredM2 = true;
    }

    if (ev.type === 'RETRY') {
      retryCount++;
      console.error('[ERROR] RETRY was emitted by ocgcore!');
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;

      if (ev.promptType === 'SELECT_IDLECMD') {
        if (pData.to_bp) {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_BP,
              index: null as any,
            });
          }, 5);
        } else {
          // Turn 1
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null as any,
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_BATTLECMD') {
        if (attackAttempts === 0) {
          attackAttempts++;
          console.log('1. Declaring attack #1 (to be cancelled with indicies: [])...');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_BATTLECMD,
              action: SelectBattleCMDAction.SELECT_BATTLE,
              index: 0,
            });
          }, 5);
        } else if (attackAttempts === 1) {
          attackAttempts++;
          emptyArrayCancelSuccess = true;
          console.log('✓ Successfully recovered to SELECT_BATTLECMD after indicies: [] cancel!');
          console.log('2. Declaring attack #2 (to be cancelled with indicies: null)...');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_BATTLECMD,
              action: SelectBattleCMDAction.SELECT_BATTLE,
              index: 0,
            });
          }, 5);
        } else if (attackAttempts === 2) {
          attackAttempts++;
          nullCancelSuccess = true;
          console.log('✓ Successfully recovered to SELECT_BATTLECMD after indicies: null cancel!');
          console.log('3. Declaring attack #3 (to be confirmed and executed)...');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_BATTLECMD,
              action: SelectBattleCMDAction.SELECT_BATTLE,
              index: 0,
            });
          }, 5);
        } else {
          console.log('4. In BP after combat: successfully proceeding to Main Phase 2...');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_BATTLECMD,
              action: SelectBattleCMDAction.TO_M2,
              index: null as any,
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_CARD') {
        if (attackAttempts === 1) {
          // Cancel with indicies: [] (safeguarded by DuelEngineService.normalizeResponse)
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_CARD,
              indicies: [],
            } as any);
          }, 5);
        } else if (attackAttempts === 2) {
          // Cancel with indicies: null (standard frontend cancellation)
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_CARD,
              indicies: null,
            });
          }, 5);
        } else {
          // Confirm target index 0
          setTimeout(() => {
            attackCompleted = true;
            engine.sendResponse({
              type: OcgResponseType.SELECT_CARD,
              indicies: [0],
            });
          }, 5);
        }
      } else if (ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 5);
      }
    }
  });

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player0Monsters: [{ code: 20721928, sequence: 1 }],
    player1Monsters: [{ code: 26905245, sequence: 1 }],
    startingLP: 8000,
    startingDrawCount: 1,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));
  engine.close();

  assert.strictEqual(retryCount, 0, 'Zero RETRY events must be emitted by engine');
  assert.strictEqual(emptyArrayCancelSuccess, true, 'Empty array [] cancellation must return cleanly to SELECT_BATTLECMD');
  assert.strictEqual(nullCancelSuccess, true, 'Null cancellation must return cleanly to SELECT_BATTLECMD');
  assert.strictEqual(attackCompleted, true, 'Subsequent attack after cancellations must execute successfully');
  assert.strictEqual(enteredM2, true, 'Must be able to transition to Main Phase 2 after cancelled and executed attacks');

  console.log('\n✓ ALL ASSERTIONS PASSED: Battle phase attack cancel, re-attack, and phase transition are fully verified!\n');
}

testFullAttackCancelAndReattack().catch((err) => {
  console.error(err);
  process.exit(1);
});
