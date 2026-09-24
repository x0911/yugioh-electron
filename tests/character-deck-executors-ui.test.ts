import assert from 'node:assert/strict';
import { loadCharacters } from '../src/main/decks/deckLoader.js';
import { resolveDeckExecutor } from '../src/main/ai/executors/registry.js';
import type { CharacterData, CharacterDeckData } from '../src/shared/types/character.js';

async function runTests() {
  console.log('Testing Character & Deck Executor UI/UX Metadata Integration...');

  // 1. resolveDeckExecutor accurately resolves specialized executors
  console.log('  1. Testing resolveDeckExecutor resolution...');
  const synchron = resolveDeckExecutor('Synchron / Stardust', [44508094, 96363153]);
  assert.equal(synchron.hasCustomExecutor, true);
  assert.equal(synchron.id, 'synchron-stardust');
  assert.ok(synchron.name.includes('Synchron'));

  const blueEyes = resolveDeckExecutor('Blue-Eyes White Dragon', [89631139]);
  assert.equal(blueEyes.hasCustomExecutor, true);
  assert.equal(blueEyes.id, 'blue-eyes');

  const sixSam = resolveDeckExecutor('Six Samurai Swarm', [74752631]);
  assert.equal(sixSam.hasCustomExecutor, true);
  assert.equal(sixSam.id, 'six-samurai-bushido');

  const crystal = resolveDeckExecutor('Crystal Beast', [34482634]);
  assert.equal(crystal.hasCustomExecutor, true);
  assert.equal(crystal.id, 'crystal-beast-rainbow');

  const unknown = resolveDeckExecutor('Completely Unknown Nonexistent Deck', [99999999]);
  assert.equal(unknown.hasCustomExecutor, false);
  assert.equal(unknown.id, 'default-universal');
  assert.equal(unknown.name, 'Universal Competitive Executor');

  // 2. loadCharacters() attaches executor metadata to all characters and decks
  console.log('  2. Testing loadCharacters() enrichment...');
  const characters = loadCharacters();
  assert.ok(characters.length > 0);

  for (const char of characters) {
    assert.equal(typeof char.hasCustomExecutorDecks, 'boolean');
    assert.ok(char.decks.length > 0);

    let expectedHasExecutor = false;
    for (const deck of char.decks) {
      assert.ok(deck.executor !== undefined);
      assert.equal(typeof deck.executor?.id, 'string');
      assert.equal(typeof deck.executor?.name, 'string');
      assert.equal(typeof deck.executor?.description, 'string');
      assert.equal(typeof deck.executor?.hasCustomExecutor, 'boolean');

      if (deck.executor?.hasCustomExecutor) {
        expectedHasExecutor = true;
      }
    }

    assert.equal(char.hasCustomExecutorDecks, expectedHasExecutor);
  }

  // 3. Decoupling: character badge is strictly derived from linked decks, never character identity
  console.log('  3. Testing strict character-deck decoupling...');
  const smartDeck: CharacterDeckData = {
    id: 'test-deck-1',
    name: 'Dark Magician Arsenal',
    archetype: 'Dark Magician / Spellcaster',
    description: 'Test deck',
    ydkPath: '',
    mainCards: [46986414],
    extraCards: [],
    signatureCardIds: [],
    executor: resolveDeckExecutor('Dark Magician / Spellcaster', [46986414]),
  };

  const mockCharA: CharacterData = {
    id: 'custom-char-a',
    name: 'Custom Character A',
    series: 'DM',
    title: 'Duelist',
    tagline: 'Hello',
    description: 'Desc',
    avatar: '',
    video: '',
    themeColor: '#fff',
    decks: [smartDeck],
    signatureCards: [],
    hasCustomExecutorDecks: [smartDeck].some((d) => d.executor?.hasCustomExecutor),
  };

  assert.equal(mockCharA.hasCustomExecutorDecks, true);
  assert.equal(mockCharA.decks[0].executor?.hasCustomExecutor, true);
  assert.equal(mockCharA.decks[0].executor?.id, 'dark-magician');

  const vanillaDeck: CharacterDeckData = {
    id: 'test-deck-2',
    name: 'Vanilla Normal Monsters',
    archetype: 'Random Unknown Generic',
    description: 'Generic deck',
    ydkPath: '',
    mainCards: [99999999],
    extraCards: [],
    signatureCardIds: [],
    executor: resolveDeckExecutor('Random Unknown Generic', [99999999]),
  };

  const mockCharB: CharacterData = {
    id: 'custom-char-b',
    name: 'Custom Character B',
    series: 'DM',
    title: 'Duelist',
    tagline: 'Hello',
    description: 'Desc',
    avatar: '',
    video: '',
    themeColor: '#fff',
    decks: [vanillaDeck],
    signatureCards: [],
    hasCustomExecutorDecks: [vanillaDeck].some((d) => d.executor?.hasCustomExecutor),
  };

  assert.equal(mockCharB.hasCustomExecutorDecks, false);
  assert.equal(mockCharB.decks[0].executor?.hasCustomExecutor, false);

  // 4. All major franchise protagonists & rivals have specialized deck executors
  console.log('  4. Testing protagonist and rival roster deck executors...');
  const iconicIds = ['yugi-muto', 'yami-yugi', 'seto-kaiba', 'jaden-yuki', 'zane-truesdale', 'yusei-fudo', 'jack-atlas', 'crow-hogan', 'dash'];

  for (const id of iconicIds) {
    const char = characters.find((c) => c.id === id);
    assert.ok(char !== undefined);
    assert.equal(char?.hasCustomExecutorDecks, true);
    for (const deck of char!.decks) {
      assert.equal(deck.executor?.hasCustomExecutor, true);
      assert.ok(deck.executor!.name.length > 0);
    }
  }

  console.log('✓ All Character & Deck Executor UI/UX tests passed cleanly!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
