import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgMessageType, OcgResponseType, OcgPosition } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

async function testOcgcorePatchIntegrity() {
  console.log('Test 1: Verify ocgcore-wasm dist/index.js contains the length: e.u8() patch...');
  const indexJsPath = path.resolve(process.cwd(), 'node_modules/ocgcore-wasm/dist/index.js');
  assert.ok(fs.existsSync(indexJsPath), 'node_modules/ocgcore-wasm/dist/index.js must exist');

  const content = fs.readFileSync(indexJsPath, 'utf8');
  assert.ok(
    content.includes('case 36:return{type:t,location:e.u8(),cards:Array.from({length:e.u8()}'),
    'case 36 must decode count as e.u8() to prevent EOF desync',
  );
  assert.ok(
    !content.includes('case 36:return{type:t,location:e.u8(),cards:Array.from({length:e.u32()}'),
    'case 36 must not decode count as e.u32()',
  );
  console.log('  ✓ ocgcore-wasm patch integrity verified.');
}

async function testCyberJarShuffleSetCardResolution() {
  console.log('Test 2: Cyber Jar resolution with multiple face-down monsters and SHUFFLE_SET_CARD...');

  const engine = new DuelEngineService();
  await engine.init();

  let shuffleSetCardReceived = false;
  let chainSolvedReceived = false;
  let chainEndReceived = false;
  let receivedCardsInShuffle: any[] = [];

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'SHUFFLE_SET_CARD') {
      shuffleSetCardReceived = true;
      receivedCardsInShuffle = (ev as any).cards || [];
    }
    if (ev.type === 'CHAIN_SOLVED') {
      chainSolvedReceived = true;
    }
    if (ev.type === 'CHAIN_END') {
      chainEndReceived = true;
    }
  });

  // Cyber Jar: 34124316
  // Spear Cretin: 58551308
  // Armed Samurai - Ben Kei: 23635815
  // Buster Blader: 78193831
  // The Forceful Sentry: 42829885
  engine.startNewDuel({
    humanPlayerId: 1,
    startingPlayer: 0,
    noShuffle: true,
    startingDrawCount: 0,
    drawCountPerTurn: 0,
    player0Deck: [42829885, 42829885, 42829885, 42829885, 23635815],
    player1Deck: [42829885, 42829885, 42829885, 58551308, 58551308],
    player0Monsters: [
      { code: 34124316, sequence: 0, position: 0x8 }, // Cyber Jar facedown defense
    ],
    player1Monsters: [
      { code: 78193831, sequence: 0, position: 0x1 }, // Buster Blader faceup attack
    ],
  });

  // Progress through prompts until Cyber Jar chain finishes solving
  for (let loop = 0; loop < 25; loop++) {
    await new Promise((r) => setTimeout(r, 100));

    if (chainEndReceived && shuffleSetCardReceived) {
      break;
    }

    if (engine.state.isWaitingResponse && engine['lastPromptMessage']) {
      const lastMsg = engine['lastPromptMessage'];
      const p = engine.state.waitingPlayer;

      if (p === 1) {
        if (lastMsg.type === OcgMessageType.SELECT_POSITION) {
          // Player 1 chooses facedown defense for Spear Cretin
          engine.sendResponse({
            type: OcgResponseType.SELECT_POSITION,
            position: OcgPosition.FACEDOWN_DEFENSE,
          });
        } else if (lastMsg.type === OcgMessageType.SELECT_CHAIN) {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        } else if (lastMsg.type === OcgMessageType.SELECT_IDLECMD) {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: 7, // To EP
          });
        }
      }
    }
  }

  assert.ok(shuffleSetCardReceived, 'SHUFFLE_SET_CARD message must be emitted by engine');
  assert.ok(receivedCardsInShuffle.length > 0, 'SHUFFLE_SET_CARD must contain shuffled card records');
  assert.ok(chainSolvedReceived, 'CHAIN_SOLVED must be emitted after Cyber Jar resolution');
  assert.ok(chainEndReceived, 'CHAIN_END must be emitted after Cyber Jar resolution');
  assert.strictEqual(engine.state.isActive, true, 'Duel must remain active and not frozen');

  console.log('  ✓ Cyber Jar flip summon and SHUFFLE_SET_CARD resolved successfully without freeze.');
}

async function runAll() {
  console.log('=== Running Cyber Jar & MSG_SHUFFLE_SET_CARD Test Suite ===');
  await testOcgcorePatchIntegrity();
  await testCyberJarShuffleSetCardResolution();
  console.log('\nAll Cyber Jar & MSG_SHUFFLE_SET_CARD tests passed successfully!\n');
}

runAll().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
