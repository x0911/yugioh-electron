import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { CardReaderService } from '../src/main/engine/cardReader.js';

describe('Pre-built Decks Card Filtering & Deck Quality Verification', () => {
  const cr = new CardReaderService();
  const prebuiltDecks = JSON.parse(fs.readFileSync('./data/prebuilt-decks.json', 'utf-8'));
  const characters = JSON.parse(fs.readFileSync('./data/characters.json', 'utf-8'));

  test('Deck sanitization: All prebuilt decks have >= 40 cards and zero dead cards', () => {
    assert.ok(prebuiltDecks.length >= 400, `Found ${prebuiltDecks.length} prebuilt decks, expected >= 400`);

    for (const deck of prebuiltDecks) {
      assert.ok(deck.main.length >= 40, `Deck ${deck.name} has ${deck.main.length} < 40 main cards`);

      const hasJinzo = deck.main.some((id: number) => [77585513, 17092736, 2403771, 59966558].includes(id));
      if (deck.main.includes(303660)) {
        assert.ok(hasJinzo, `Deck ${deck.name} has Amplifier without Jinzo`);
      }

      // Check Exodia FTK
      if (deck.id === 'pop-library-exodia-ftk') {
        assert.ok(deck.main.includes(33396948), 'Exodia head present');
        assert.ok(deck.main.includes(70791313), 'Royal Magical Library present');
        assert.ok(deck.main.includes(89997728), 'Toon Table of Contents present');
        assert.ok(!deck.main.includes(303660), 'No Amplifier in Exodia deck');
        assert.ok(!deck.main.includes(32864), 'No 13th Grave filler');
        assert.ok(!deck.main.includes(62121), 'No Castle of Dark Illusions filler');
      }
    }
  });

  test('Filtering by Dark Magician (46986414) finds Yugi and Arkana decks', () => {
    const dmId = 46986414;
    const matching = prebuiltDecks.filter((d: any) => d.main.includes(dmId) || (d.extra && d.extra.includes(dmId)));

    assert.ok(matching.length >= 1, `Expected at least 1 deck containing Dark Magician, found ${matching.length}`);
    const yugiMatch = matching.some((d: any) => d.characterName?.includes('Yugi') || d.characterName?.includes('Arkana'));
    assert.ok(yugiMatch, 'Yugi or Arkana decks found for Dark Magician filter');
  });

  test('Filtering by Blue-Eyes White Dragon (89631139) finds Kaiba decks', () => {
    const bewId = 89631139;
    const matching = prebuiltDecks.filter((d: any) => d.main.includes(bewId) || (d.extra && d.extra.includes(bewId)));

    assert.ok(matching.length >= 1, `Expected at least 1 deck containing Blue-Eyes, found ${matching.length}`);
    const kaibaMatch = matching.some((d: any) => d.characterName?.includes('Kaiba'));
    assert.ok(kaibaMatch, 'Kaiba decks found for Blue-Eyes filter');
  });

  test('Filtering by Polymerization (24094653) finds authentic fusion decks with valid Extra Decks', () => {
    const polyId = 24094653;
    const matching = prebuiltDecks.filter((d: any) => d.main.includes(polyId));

    assert.ok(matching.length > 0, 'Found decks with Polymerization');
    for (const d of matching) {
      assert.ok(d.extra && d.extra.length > 0, `Deck ${d.name} uses Polymerization but has empty Extra Deck`);
    }
  });

  test('In-deck card search: searching "Exodia" finds Exodia-based decks', () => {
    const exodiaDecks = prebuiltDecks.filter((d: any) => {
      return [...d.main, ...(d.extra || [])].some((cid: number) => {
        const detail = cr.getCardDetail(cid);
        return detail && detail.name.toLowerCase().includes('exodia');
      });
    });

    assert.ok(exodiaDecks.length >= 2, `Expected at least 2 Exodia decks, found ${exodiaDecks.length}`);
  });
});
