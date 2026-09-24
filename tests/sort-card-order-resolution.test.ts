import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgMessageType, OcgResponseType } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

async function testOcgcorePatchIntegrity() {
  console.log('Test 1: Verify ocgcore-wasm dist/index.js contains the SORT_CARD case 15 serializer patch...');
  const indexJsPath = path.resolve(process.cwd(), 'node_modules/ocgcore-wasm/dist/index.js');
  assert.ok(fs.existsSync(indexJsPath), 'node_modules/ocgcore-wasm/dist/index.js must exist');

  const content = fs.readFileSync(indexJsPath, 'utf8');
  assert.ok(
    content.includes('case 15:if(!e.order){t.i8(-1);break}for(let r of e.order)t.i8(r);break;'),
    'case 15 must serialize order without the leading t.i8(e.order.length) byte',
  );
  assert.ok(
    !content.includes('case 15:if(!e.order){t.i8(-1);break}t.i8(e.order.length);'),
    'case 15 must not write order length header',
  );
  console.log('  ✓ ocgcore-wasm case 15 patch integrity verified.');
}

async function testSortCardConfirmOrderResolution() {
  console.log('Test 2: Dark Magical Circle SORT_CARD prompt with explicit user order...');

  const engine = new DuelEngineService();
  await engine.init();

  let sortCardPromptReceived = false;
  let retryCount = 0;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'SORT_CARD' && ev.isPrompt) {
      sortCardPromptReceived = true;
    }
    if (ev.type === 'RETRY') {
      retryCount++;
    }
  });

  // Dark Magical Circle: 47222536
  // Magician Navigation: 70781052
  // Dark Magician: 46986414
  // Thousand Knives: 63391643
  // Mirror Force: 44095762
  engine.startNewDuel({
    humanPlayerId: 0,
    startingPlayer: 0,
    noShuffle: true,
    startingDrawCount: 1, // Draw Dark Magical Circle
    drawCountPerTurn: 0,
    interactiveSort: true,
    player0Deck: [
      44095762,
      44095762,
      63391643, // Deck top 3: Thousand Knives
      46986414, // Deck top 2: Dark Magician
      70781052, // Deck top 1: Navigation
      47222536, // Hand: Dark Magical Circle (drawn first)
    ],
    player1Deck: [44095762, 44095762, 44095762, 44095762, 44095762],
  });

  let sortSubmitted = false;

  for (let loop = 0; loop < 50; loop++) {
    await new Promise((r) => setTimeout(r, 50));

    if (engine.state.isWaitingResponse && engine['lastPromptMessage']) {
      const lastMsg = engine['lastPromptMessage'];

      if (lastMsg.type === OcgMessageType.SELECT_IDLECMD) {
        if (sortSubmitted) {
          // Successfully progressed back to Idle Phase after sorting!
          break;
        }
        const actIdx = lastMsg.activates?.findIndex((a: any) => a.code === 47222536) ?? 0;
        engine.sendResponse({
          type: OcgResponseType.SELECT_IDLECMD,
          action: 5, // activate
          index: actIdx >= 0 ? actIdx : 0,
        });
      } else if (lastMsg.type === OcgMessageType.SELECT_YESNO) {
        engine.sendResponse({
          type: OcgResponseType.SELECT_YESNO,
          yes: true,
        });
      } else if (lastMsg.type === OcgMessageType.SELECT_CARD) {
        engine.sendResponse({
          type: OcgResponseType.SELECT_CARD,
          indicies: [0],
        });
      } else if (lastMsg.type === OcgMessageType.SORT_CARD) {
        sortSubmitted = true;
        // User clicked "Confirm Order" with [1, 0]
        engine.sendResponse({
          type: OcgResponseType.SORT_CARD,
          order: [1, 0],
        });
      }
    }
  }

  assert.ok(sortCardPromptReceived, 'SORT_CARD prompt must be emitted');
  assert.ok(sortSubmitted, 'SORT_CARD response must be submitted');
  assert.strictEqual(retryCount, 0, 'ocgcore must NOT emit RETRY when explicit order is submitted');
  assert.strictEqual(
    engine['lastPromptMessage']?.type,
    OcgMessageType.SELECT_IDLECMD,
    'Engine must successfully advance back to Idle Phase after SORT_CARD',
  );
  console.log('  ✓ SORT_CARD explicit order passed without any RETRY rejection.');
}

async function runAllTests() {
  await testOcgcorePatchIntegrity();
  await testSortCardConfirmOrderResolution();
  console.log('\nAll SORT_CARD tests passed successfully.');
}

runAllTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
