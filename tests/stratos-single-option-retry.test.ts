import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, OcgMessageType } from 'ocgcore-wasm';
import { getAutoResponse } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Elemental HERO Stratos Single-Option & Retry Recovery Test Suite ===\n');

async function testStratosSingleOptionSearch() {
  console.log('▶ Test 1: Stratos Normal Summon with 0 other HEROs -> SELECT_OPTION length 1 -> search HERO without RETRY...');
  const engine = new DuelEngineService();
  await engine.init();

  const p0Deck = [
    97077563, // Call of the Haunted
    ...Array(39).fill(20721928), // Sparkman
  ];
  const p1Deck = [
    ...Array(35).fill(40044918), // Elemental HERO Stratos
    ...Array(5).fill(21844576),  // Elemental HERO Avian
  ];

  let retryCount = 0;
  let selectOptionReceived = false;
  let selectOptionCount = 0;
  let chainLinkSolved = false;

  engine.onEvent((ev) => {
    if (ev.type === 'RETRY') {
      retryCount++;
      console.error(`[TEST] RETRY received! count=${retryCount}`);
    }

    if (ev.isPrompt) {
      if (ev.promptPlayer === 0) {
        if (ev.promptType === 'SELECT_IDLECMD') {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: 7, // TO_EP
            });
          }, 10);
        } else if (ev.promptType === 'SELECT_BATTLECMD') {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_BATTLECMD,
              action: 2, // TO_EP
            });
          }, 10);
        } else {
          setTimeout(() => {
            const raw = (engine as any).lastPromptMessage;
            if (raw) {
              const auto = getAutoResponse(raw);
              if (auto) engine.sendResponse(auto);
            }
          }, 10);
        }
      }
    }

    if (ev.type === 'CONFIRM_CARDS') {
      chainLinkSolved = true;
    }
  });

  const origDecide = (engine as any).aiController.decideResponse.bind((engine as any).aiController);
  (engine as any).aiController.decideResponse = (msg: any, ctx: any) => {
    if (msg.type === OcgMessageType.SELECT_OPTION) {
      selectOptionReceived = true;
      selectOptionCount = msg.options?.length ?? 0;
    }
    return origDecide(msg, ctx);
  };

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    startingLP: 8000,
    humanPlayerId: 0,
    aiCharacterId: 'jaden_yuki',
    aiDeckArchetype: 'hero',
    noShuffle: true,
  });

  // Wait for Turn 2 Stratos summon & resolution
  const start = Date.now();
  while (Date.now() - start < 6000 && !chainLinkSolved) {
    await new Promise((r) => setTimeout(r, 100));
  }

  assert.strictEqual(retryCount, 0, 'No RETRY messages should be emitted during Stratos resolution.');
  assert.strictEqual(selectOptionReceived, true, 'SELECT_OPTION prompt must have been sent to Stratos controller.');
  assert.strictEqual(selectOptionCount, 1, 'SELECT_OPTION prompt must have exactly 1 option when no other HEROs exist.');
  assert.strictEqual(chainLinkSolved, true, 'Stratos search chain link must resolve cleanly.');

  await engine.destroyCurrentDuel();
  console.log('✓ Stratos single-option resolution passed with ZERO retries!\n');
}

async function runAll() {
  try {
    await testStratosSingleOptionSearch();
    console.log('🎉 All Stratos tests passed cleanly!\n');
  } catch (err) {
    console.error('❌ Stratos test suite failed:', err);
    process.exit(1);
  }
}

runAll();
