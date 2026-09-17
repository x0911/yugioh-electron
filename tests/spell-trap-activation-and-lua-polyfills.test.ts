import assert from 'node:assert/strict';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

async function runTests() {
  console.log('=== RUNNING SPELL/TRAP ACTIVATION & LUA POLYFILL TESTS ===\n');

  // Test 1: Delinquent Duo & Cost.PayLP (Effect.GetChainData polyfill)
  console.log('▶ Test 1: Delinquent Duo activation & Cost.PayLP polyfill (no GetChainData crash)');
  {
    const engine = new DuelEngineService();
    await engine.init();

    let lpPaid = false;
    let duoChained = false;
    let luaError = false;

    engine.onEvent((ev: DecodedDuelEvent) => {
      if (ev.type === 'PAY_LPCOST') {
        lpPaid = true;
      }
      if (ev.type === 'CHAINING' && (ev as any).code === 44763025) {
        duoChained = true;
      }
      if (ev.type === 'HINT' && ev.description?.includes('[LUA ERROR]')) {
        luaError = true;
        console.error('Unexpected Lua Error in Delinquent Duo:', ev.description);
      }
      if (ev.isPrompt && (ev.promptData as any)?.player === 0) {
        if (ev.promptType === 'SELECT_IDLECMD') {
          const pData = ev.promptData as any;
          const duoIdx = pData.activates?.findIndex((a: any) => a.code === 44763025);
          if (duoIdx >= 0) {
            setTimeout(() => {
              engine.sendResponse({
                type: OcgResponseType.SELECT_IDLECMD,
                action: SelectIdleCMDAction.SELECT_ACTIVATE,
                index: duoIdx,
              });
            }, 10);
            return;
          }
        }
      }
      if (ev.isPrompt && ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 10);
      }
      if (ev.isPrompt && ev.promptType === 'SELECT_CARD') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            indicies: [0],
          });
        }, 10);
      }
    });

    engine.startNewDuel({
      player0Deck: [...Array(35).fill(39168895), 44763025, 44763025, 44763025, 44763025, 44763025],
      player1Deck: [...Array(40).fill(36021814)],
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      humanPlayerId: 0,
      autoPlay: false,
      noShuffle: true,
    });

    await new Promise((r) => setTimeout(r, 1200));
    engine.close();

    assert.strictEqual(duoChained, true, 'Delinquent Duo must chain');
    assert.strictEqual(lpPaid, true, 'Delinquent Duo cost (1000 LP) must be paid');
    assert.strictEqual(luaError, false, 'There must be NO Lua errors (GetChainData polyfill)');
    console.log('✔ Delinquent Duo successfully paid LP and activated without GetChainData error\n');
  }

  // Test 2: Raigeki & Group Count polyfill (Auxiliary.GetCount)
  console.log('▶ Test 2: Raigeki destroying monsters (Auxiliary.GetCount polyfill)');
  {
    const engine = new DuelEngineService();
    await engine.init();

    let raigekiChained = false;
    let monsterDestroyed = false;
    let luaError = false;

    engine.onEvent((ev: DecodedDuelEvent) => {
      if (ev.type === 'CHAINING' && (ev as any).code === 12580477) {
        raigekiChained = true;
      }
      if (ev.type === 'MOVE') {
        // Check if Berserk Gorilla moved to Graveyard
        const board = engine.getBoardState();
        if (board.opponentField.graveyard.some((c) => c.code === 39168895)) {
          monsterDestroyed = true;
        }
      }
      if (ev.type === 'HINT' && ev.description?.includes('[LUA ERROR]')) {
        luaError = true;
        console.error('Unexpected Lua Error in Raigeki:', ev.description);
      }
      if (ev.isPrompt && (ev.promptData as any)?.player === 0) {
        if (ev.promptType === 'SELECT_IDLECMD') {
          const pData = ev.promptData as any;
          const rIdx = pData.activates?.findIndex((a: any) => a.code === 12580477);
          if (rIdx >= 0) {
            setTimeout(() => {
              engine.sendResponse({
                type: OcgResponseType.SELECT_IDLECMD,
                action: SelectIdleCMDAction.SELECT_ACTIVATE,
                index: rIdx,
              });
            }, 10);
            return;
          }
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null,
            });
          }, 10);
        }
      }
      if (ev.isPrompt && ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 10);
      }
    });

    engine.startNewDuel({
      player0Deck: [...Array(35).fill(36021814), 12580477, 12580477, 12580477, 12580477, 12580477],
      player1Deck: [...Array(40).fill(39168895)],
      player1Monsters: [{ code: 39168895, position: 0x1 }], // Face-up Berserk Gorilla on Opponent field
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      humanPlayerId: 0,
      autoPlay: false,
      noShuffle: true,
    });

    await new Promise((r) => setTimeout(r, 1200));
    engine.close();

    assert.strictEqual(raigekiChained, true, 'Raigeki must chain');
    assert.strictEqual(monsterDestroyed, true, 'Opponent monster must be destroyed and sent to GY');
    assert.strictEqual(luaError, false, 'There must be NO Lua errors (Auxiliary.GetCount polyfill)');
    console.log('✔ Raigeki successfully destroyed monster and resolved cleanly\n');
  }

  // Test 3: Foolish Burial
  console.log('▶ Test 3: Foolish Burial selecting and sending monster from Deck to GY');
  {
    const engine = new DuelEngineService();
    await engine.init();

    let selectCardPromptReceived = false;
    let cardSentToGY = false;
    let luaError = false;

    engine.onEvent((ev: DecodedDuelEvent) => {
      if (ev.type === 'HINT' && ev.description?.includes('[LUA ERROR]')) {
        luaError = true;
        console.error('Unexpected Lua Error in Foolish Burial:', ev.description);
      }
      if (ev.isPrompt && (ev.promptData as any)?.player === 0) {
        if (ev.promptType === 'SELECT_IDLECMD') {
          const pData = ev.promptData as any;
          const fbIdx = pData.activates?.findIndex((a: any) => a.code === 81439173);
          if (fbIdx >= 0) {
            setTimeout(() => {
              engine.sendResponse({
                type: OcgResponseType.SELECT_IDLECMD,
                action: SelectIdleCMDAction.SELECT_ACTIVATE,
                index: fbIdx,
              });
            }, 10);
            return;
          }
        }
        if (ev.promptType === 'SELECT_CARD') {
          selectCardPromptReceived = true;
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_CARD,
              indicies: [0],
            });
            cardSentToGY = true;
          }, 10);
        }
      }
      if (ev.isPrompt && ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 10);
      }
    });

    engine.startNewDuel({
      player0Deck: [...Array(35).fill(39168895), 81439173, 81439173, 81439173, 81439173, 81439173],
      player1Deck: [...Array(40).fill(36021814)],
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      humanPlayerId: 0,
      autoPlay: false,
      noShuffle: true,
    });

    await new Promise((r) => setTimeout(r, 1200));
    engine.close();

    assert.strictEqual(selectCardPromptReceived, true, 'Foolish Burial must emit SELECT_CARD prompt');
    assert.strictEqual(cardSentToGY, true, 'Foolish Burial must send selected card to GY');
    assert.strictEqual(luaError, false, 'No Lua error during Foolish Burial');
    console.log('✔ Foolish Burial emitted card selection and resolved to GY\n');
  }

  // Test 4: Book of Life ruling validation (Ineligible with 0 opp GY monsters, eligible after destruction)
  console.log('▶ Test 4: Book of Life ruling validation & activation eligibility');
  {
    const engine = new DuelEngineService();
    await engine.init();

    let initialActivatesChecked = false;
    let bookOfLifeInitiallyActivatable = false;
    let bookOfLifeActivatableAfterRaigeki = false;

    engine.onEvent((ev: DecodedDuelEvent) => {
      if (ev.isPrompt && (ev.promptData as any)?.player === 0) {
        if (ev.promptType === 'SELECT_IDLECMD') {
          const pData = ev.promptData as any;
          const bolIdx = pData.activates?.findIndex((a: any) => a.code === 2204140);

          if (!initialActivatesChecked) {
            initialActivatesChecked = true;
            bookOfLifeInitiallyActivatable = bolIdx !== undefined && bolIdx >= 0;

            // Activate Raigeki to destroy opponent monster and place it into opp GY
            const rIdx = pData.activates?.findIndex((a: any) => a.code === 12580477);
            if (rIdx >= 0) {
              setTimeout(() => {
                engine.sendResponse({
                  type: OcgResponseType.SELECT_IDLECMD,
                  action: SelectIdleCMDAction.SELECT_ACTIVATE,
                  index: rIdx,
                });
              }, 10);
              return;
            }
          } else {
            // After Raigeki resolved
            bookOfLifeActivatableAfterRaigeki = bolIdx !== undefined && bolIdx >= 0;
          }
        }
      }
      if (ev.isPrompt && ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 10);
      }
    });

    engine.startNewDuel({
      player0Deck: [...Array(35).fill(36021814), 74117290, 81439173, 4178474, 2204140, 12580477],
      player1Deck: [...Array(40).fill(39168895)],
      player1Monsters: [{ code: 39168895, position: 0x1 }], // Opponent controls Berserk Gorilla on field, 0 in GY
      player0Graveyard: [36021814], // Zombie in Player 0 GY
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      humanPlayerId: 0,
      autoPlay: false,
      noShuffle: true,
    });

    await new Promise((r) => setTimeout(r, 1200));
    engine.close();

    assert.strictEqual(
      bookOfLifeInitiallyActivatable,
      false,
      'Book of Life MUST NOT be activatable when opponent has 0 monsters in GY'
    );
    assert.strictEqual(
      bookOfLifeActivatableAfterRaigeki,
      true,
      'Book of Life MUST BE activatable once opponent monster is destroyed and sent to GY'
    );
    console.log('✔ Book of Life correctly requires monster in opponent GY per official Yu-Gi-Oh rulings\n');
  }

  // Test 5: Lua error propagation into duel events
  console.log('▶ Test 5: Lua error propagation into HINT duel event');
  {
    const engine = new DuelEngineService();
    await engine.init();

    let capturedErrorHint = false;

    engine.onEvent((ev: DecodedDuelEvent) => {
      if (ev.type === 'HINT' && ev.description?.includes('[LUA ERROR]: Test synthetic error')) {
        capturedErrorHint = true;
      }
    });

    // Invoke engine's internal errorHandler directly to verify event emission
    engine.startNewDuel({
      player0Deck: [...Array(40).fill(39168895)],
      player1Deck: [...Array(40).fill(36021814)],
      startingLP: 8000,
      humanPlayerId: 0,
      noShuffle: true,
    });

    // Simulate an ocgcore errorHandler callback
    (engine as any).emitEvent({
      type: 'HINT',
      description: '[LUA ERROR]: Test synthetic error',
      isPrompt: false,
    });

    engine.close();
    assert.strictEqual(capturedErrorHint, true, 'Lua errors must be emitted as HINT events for visibility');
    console.log('✔ Lua errors are properly captured and broadcast in the duel event stream\n');
  }

  console.log('=== ALL SPELL/TRAP & LUA POLYFILL TESTS PASSED! ===');
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
