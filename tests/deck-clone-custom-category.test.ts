import test from 'node:test';
import assert from 'node:assert/strict';
import type { CustomDeck } from '../src/shared/types/deck.js';

function getDeckCategory(d: CustomDeck | null): 'character-dm' | 'character-gx' | 'popular' | 'custom' {
  if (!d) return 'custom';
  if (d.category === 'character-dm' || (d.series === 'DM' && d.characterName && d.characterName !== 'Community Popular')) return 'character-dm';
  if (d.category === 'character-gx' || (d.series === 'GX' && d.characterName && d.characterName !== 'Community Popular')) return 'character-gx';
  if (d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-') || d.characterName === 'Community Popular') return 'popular';
  return 'custom';
}

function cloneDeck(activeDeck: CustomDeck): CustomDeck {
  const id = `deck-${Date.now()}`;
  return {
    ...JSON.parse(JSON.stringify(activeDeck)),
    id,
    name: `${activeDeck.name} (Copy)`,
    category: 'custom',
    characterId: undefined,
    characterName: undefined,
    series: undefined,
    avatar: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

test('Deck Edit: Cloned Decks Route to "My Custom" Tab', async (t) => {
  await t.test('1. Cloning a DM character deck sets category to custom and clears duelist metadata', () => {
    const kaibaDeck: CustomDeck = {
      id: 'seto-kaiba_deck_1',
      name: 'Seto Kaiba - Blue-Eyes Ultimate Power',
      category: 'character-dm',
      characterId: 'seto-kaiba',
      characterName: 'Seto Kaiba',
      series: 'DM',
      avatar: 'app-resource://characters/avatars/seto-kaiba.png',
      archetype: 'Blue-Eyes',
      main: [89631139, 89631139, 89631139],
      extra: [23995346],
      createdAt: 1000,
      updatedAt: 1000,
    };

    assert.equal(getDeckCategory(kaibaDeck), 'character-dm');

    const cloned = cloneDeck(kaibaDeck);

    assert.equal(cloned.name, 'Seto Kaiba - Blue-Eyes Ultimate Power (Copy)');
    assert.equal(cloned.category, 'custom');
    assert.equal(cloned.characterId, undefined);
    assert.equal(cloned.characterName, undefined);
    assert.equal(cloned.series, undefined);
    assert.equal(cloned.avatar, undefined);
    assert.deepEqual(cloned.main, [89631139, 89631139, 89631139]);
    assert.deepEqual(cloned.extra, [23995346]);

    // Crucial check: Must be recognized under 'custom' tab
    assert.equal(getDeckCategory(cloned), 'custom', 'Cloned deck must be classified as custom');
  });

  await t.test('2. Cloning a GX character deck sets category to custom', () => {
    const jadenDeck: CustomDeck = {
      id: 'jaden-yuki_deck_1',
      name: 'Jaden Yuki - Elemental HERO Rising',
      category: 'character-gx',
      characterId: 'jaden-yuki',
      characterName: 'Jaden Yuki',
      series: 'GX',
      avatar: 'app-resource://characters/avatars/jaden-yuki.png',
      archetype: 'Elemental HERO',
      main: [21844576, 58932615],
      extra: [20721928],
      createdAt: 1000,
      updatedAt: 1000,
    };

    assert.equal(getDeckCategory(jadenDeck), 'character-gx');

    const cloned = cloneDeck(jadenDeck);
    assert.equal(getDeckCategory(cloned), 'custom', 'Cloned GX deck must be classified as custom');
  });

  await t.test('3. Cloning a Popular deck sets category to custom', () => {
    const popDeck: CustomDeck = {
      id: 'pop-goat-control',
      name: 'Goat Control (Classic 2005)',
      category: 'popular-dm',
      characterName: 'Community Popular',
      series: 'DM',
      archetype: 'Goat Control',
      main: [73915051],
      extra: [],
      createdAt: 1000,
      updatedAt: 1000,
    };

    assert.equal(getDeckCategory(popDeck), 'popular');

    const cloned = cloneDeck(popDeck);
    assert.equal(getDeckCategory(cloned), 'custom', 'Cloned Popular deck must be classified as custom');
  });

  await t.test('4. Deck filtering tabs strictly isolate custom decks from character tabs', () => {
    const kaibaDeck: CustomDeck = {
      id: 'seto-kaiba_deck_1',
      name: 'Seto Kaiba - Blue-Eyes',
      category: 'character-dm',
      characterId: 'seto-kaiba',
      characterName: 'Seto Kaiba',
      series: 'DM',
      main: [89631139],
      extra: [],
    };
    const cloned = cloneDeck(kaibaDeck);
    const allDecks = [kaibaDeck, cloned];

    const dmTabDecks = allDecks.filter((d) => getDeckCategory(d) === 'character-dm');
    assert.equal(dmTabDecks.length, 1);
    assert.equal(dmTabDecks[0].id, 'seto-kaiba_deck_1');

    const customTabDecks = allDecks.filter((d) => getDeckCategory(d) === 'custom');
    assert.equal(customTabDecks.length, 1);
    assert.equal(customTabDecks[0].id, cloned.id);
    assert.equal(customTabDecks[0].name, 'Seto Kaiba - Blue-Eyes (Copy)');
  });
});
