import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { useDuelStore } from '../src/renderer/stores/duelStore.js';
import { useSettingsStore } from '../src/renderer/stores/settingsStore.js';
import type { CharacterData, CharacterDeckData } from '../src/shared/types/character.js';

const mockCharacter: CharacterData = {
  id: 'yugi-muto',
  name: 'Yugi Muto',
  series: 'DM',
  title: 'King of Games',
  tagline: 'Silent LV & Toy Block Guardians',
  description: 'The King of Games',
  avatar: 'resources/characters/portraits/yugi-muto.png',
  video: 'resources/videos/characters/yugi-muto.mp4',
  themeColor: '#c9a227',
  decks: [
    {
      id: 'yugi_deck_1',
      name: 'Silent Swordsman LV Ascendance',
      archetype: 'Spellcaster / Warrior LV Growth',
      description: 'Levels up Silent Swordsman',
      characterId: 'yugi-muto',
      order: 1,
      mainCards: Array(40).fill(46986414),
      extraCards: [],
      signatureCards: [46986414],
    },
    {
      id: 'yugi_deck_2',
      name: 'Silent Magician LV Spell Silence',
      archetype: 'Spellcaster / Anti-Spell Control',
      description: 'Levels up Silent Magician',
      characterId: 'yugi-muto',
      order: 2,
      mainCards: Array(40).fill(46986414),
      extraCards: [],
      signatureCards: [46986414],
    },
  ],
};

test('1. Match Setup: Defaults to Random Opponent Deck (isOpponentDeckManual is false)', async () => {
  setActivePinia(createPinia());
  const duelStore = useDuelStore();
  const settingsStore = useSettingsStore();

  settingsStore.characters = [mockCharacter];
  settingsStore.selectedOpponentId = 'yugi-muto';
  settingsStore.isInitialized = true;

  await duelStore.setupMatch(mockCharacter);

  assert.strictEqual(duelStore.isOpponentDeckManual, false);
  assert.ok(duelStore.selectedOpponentDeck !== null);
  assert.ok(['yugi_deck_1', 'yugi_deck_2'].includes(duelStore.selectedOpponentDeck!.id));
});

test('2. Manual Opponent Deck Selection: Locks selection when setOpponentDeck is called', async () => {
  setActivePinia(createPinia());
  const duelStore = useDuelStore();
  const settingsStore = useSettingsStore();

  settingsStore.characters = [mockCharacter];
  settingsStore.selectedOpponentId = 'yugi-muto';
  settingsStore.isInitialized = true;

  await duelStore.setupMatch(mockCharacter);

  const targetDeck = mockCharacter.decks[1]; // Deck 2
  duelStore.setOpponentDeck(targetDeck);

  assert.strictEqual(duelStore.isOpponentDeckManual, true);
  assert.strictEqual(duelStore.selectedOpponentDeck?.id, 'yugi_deck_2');
  assert.strictEqual(duelStore.selectedOpponentDeckIndex, 1);
});

test('3. Reset to Random: setOpponentDeck(null) resets isOpponentDeckManual to false', async () => {
  setActivePinia(createPinia());
  const duelStore = useDuelStore();
  const settingsStore = useSettingsStore();

  settingsStore.characters = [mockCharacter];
  settingsStore.selectedOpponentId = 'yugi-muto';
  settingsStore.isInitialized = true;

  await duelStore.setupMatch(mockCharacter);
  duelStore.setOpponentDeck(mockCharacter.decks[0]);
  assert.strictEqual(duelStore.isOpponentDeckManual, true);

  duelStore.setOpponentDeck(null);
  assert.strictEqual(duelStore.isOpponentDeckManual, false);
  assert.ok(duelStore.selectedOpponentDeck !== null);
});
