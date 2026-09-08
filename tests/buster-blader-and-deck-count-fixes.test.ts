import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { setElectronApp, getResourcePath } from '../src/main/decks/deckLoader.js';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { MessageDecoder } from '../src/main/engine/messageDecoder.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { OcgLocation, OcgMessageType, OcgPosition } from 'ocgcore-wasm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('=== Running Buster Blader Cutscene & Deck Count Sync Test Suite ===\n');

// -----------------------------------------------------------------------------
// Test 1: setElectronApp enables getResourcePath to resolve userData/patch/
// -----------------------------------------------------------------------------
{
  console.log('Test 1: getResourcePath correctly resolves files in userData/patch overlay...');

  const tempUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'ygo-patch-test-'));
  const patchDir = path.join(tempUserData, 'patch');
  const mockPatchVideoDir = path.join(patchDir, 'resources/videos/cards');
  fs.mkdirSync(mockPatchVideoDir, { recursive: true });

  const mockVideoFile = path.join(mockPatchVideoDir, 'test_mock_cutscene.mp4');
  fs.writeFileSync(mockVideoFile, 'MOCK_VIDEO_DATA_FOR_PATCH_TEST_1234567890');

  // Inject mock electron app
  const mockApp = {
    getPath: (name: string) => (name === 'userData' ? tempUserData : ''),
    getAppPath: () => ROOT_DIR,
    isPackaged: true,
  };
  setElectronApp(mockApp);

  const resolved = getResourcePath('resources/videos/cards/test_mock_cutscene.mp4');
  assert.equal(resolved, mockVideoFile, 'getResourcePath must resolve path in userData/patch/ overlay');

  // Cleanup
  fs.rmSync(tempUserData, { recursive: true, force: true });
  setElectronApp(null);
  console.log('  ✓ getResourcePath correctly locates files in userData/patch overlay.');
}

// -----------------------------------------------------------------------------
// Test 2: Buster Blader video mapping in card-videos.json
// -----------------------------------------------------------------------------
{
  console.log('\nTest 2: Buster Blader entry in card-videos.json...');

  const cardVideosPath = path.join(ROOT_DIR, 'data/card-videos.json');
  const cardVideos = JSON.parse(fs.readFileSync(cardVideosPath, 'utf-8'));

  assert.ok(cardVideos['78193831'], 'Buster Blader (78193831) must exist in card-videos.json');
  assert.equal(cardVideos['78193831'].cardName, 'Buster Blader');
  assert.equal(cardVideos['78193831'].summon, 'resources/videos/cards/summon_78193831.mp4');
  assert.equal(cardVideos['78193831'].attack, 'resources/videos/cards/attack_78193831.mp4');
  assert.equal(cardVideos['78193831'].isPlaceholder, false, 'Buster Blader must not be marked as placeholder');

  console.log('  ✓ Buster Blader is properly registered with summon and attack cutscenes.');
}

// -----------------------------------------------------------------------------
// Test 3: checkVideoTrigger triggers for Buster Blader Summon and Attack
// -----------------------------------------------------------------------------
{
  console.log('\nTest 3: checkVideoTrigger generates CardVideoPayload for Buster Blader...');

  const engine = new DuelEngineService();

  // Test Summon trigger
  const summonMsg = {
    type: OcgMessageType.SPSUMMONING,
    controller: 0,
    code: 78193831,
    location: OcgLocation.MZONE,
    sequence: 0,
    position: OcgPosition.FACEUP_ATTACK,
  };
  const summonPayload = (engine as any).checkVideoTrigger(summonMsg);
  assert.ok(summonPayload, 'Must generate video payload on Buster Blader special summon');
  assert.equal(summonPayload.code, 78193831);
  assert.equal(summonPayload.videoType, 'summon');
  assert.equal(summonPayload.videoPath, 'resources/videos/cards/summon_78193831.mp4');

  // Test Attack trigger
  const attackMsg = {
    type: OcgMessageType.ATTACK,
    card: {
      controller: 0,
      location: OcgLocation.MZONE,
      sequence: 0,
      code: 78193831,
    },
  };
  const attackPayload = (engine as any).checkVideoTrigger(attackMsg);
  assert.ok(attackPayload, 'Must generate video payload on Buster Blader attack declaration');
  assert.equal(attackPayload.code, 78193831);
  assert.equal(attackPayload.videoType, 'attack');
  assert.equal(attackPayload.videoPath, 'resources/videos/cards/attack_78193831.mp4');

  console.log('  ✓ checkVideoTrigger successfully triggers for both summon and attack.');
}

// -----------------------------------------------------------------------------
// Test 4: MessageDecoder includes fromController on MOVE events
// -----------------------------------------------------------------------------
{
  console.log('\nTest 4: MessageDecoder populates fromController on MOVE events...');

  const reader = new CardReaderService();
  const decoder = new MessageDecoder(reader);

  const rawMoveMsg = {
    type: OcgMessageType.MOVE,
    card: 78193831,
    from: {
      controller: 0,
      location: OcgLocation.DECK,
      sequence: 0,
      position: OcgPosition.FACEDOWN,
    },
    to: {
      controller: 0,
      location: OcgLocation.GRAVE,
      sequence: 0,
      position: OcgPosition.FACEUP,
    },
    reason: 0,
  };

  const decoded = decoder.decode(rawMoveMsg as any);
  assert.equal(decoded.type, 'MOVE');
  assert.equal(decoded.controller, 0);
  assert.equal(decoded.fromController, 0, 'fromController must match raw.from.controller');
  assert.equal(decoded.fromLocation, OcgLocation.DECK);
  assert.equal(decoded.toLocation, OcgLocation.GRAVE);

  reader.close();
  console.log('  ✓ MessageDecoder accurately provides fromController.');
}

// -----------------------------------------------------------------------------
// Test 5: handleCardMove tracks deckCount decrements and increments
// -----------------------------------------------------------------------------
{
  console.log('\nTest 5: handleCardMove decrements deckCount when moving from DECK...');

  const engine = new DuelEngineService();
  (engine as any).player0Field.deckCount = 40;
  (engine as any).player1Field.deckCount = 40;

  // Move 1: Card moves from Player 0 DECK to GRAVE (e.g. Monster Gate or Painful Choice)
  (engine as any).handleCardMove(
    78193831,
    { controller: 0, location: OcgLocation.DECK, sequence: 0, position: OcgPosition.FACEDOWN },
    { controller: 0, location: OcgLocation.GRAVE, sequence: 0, position: OcgPosition.FACEUP },
    0,
  );
  assert.equal((engine as any).player0Field.deckCount, 39, 'Player 0 deckCount must decrement to 39');

  // Move 2: 11 more cards milled from DECK (simulating Monster Gate excavation)
  for (let i = 0; i < 11; i++) {
    (engine as any).handleCardMove(
      46986414,
      { controller: 0, location: OcgLocation.DECK, sequence: 0, position: OcgPosition.FACEDOWN },
      { controller: 0, location: OcgLocation.GRAVE, sequence: 0, position: OcgPosition.FACEUP },
      0,
    );
  }
  assert.equal((engine as any).player0Field.deckCount, 28, 'Player 0 deckCount must decrement to 28');

  // Move 3: Card returned to DECK (e.g. Pot of Avarice or Raiza)
  (engine as any).handleCardMove(
    78193831,
    { controller: 0, location: OcgLocation.GRAVE, sequence: 0, position: OcgPosition.FACEUP },
    { controller: 0, location: OcgLocation.DECK, sequence: 0, position: OcgPosition.FACEDOWN },
    0,
  );
  assert.equal((engine as any).player0Field.deckCount, 29, 'Player 0 deckCount must increment to 29');

  console.log('  ✓ handleCardMove properly tracks deck additions and removals.');
}

console.log('\n🎉 All Buster Blader Cutscene & Deck Count Tests Passed Cleanly!\n');
