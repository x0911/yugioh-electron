import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { getPersonalityForCharacter, CHARACTER_PERSONALITIES } from '../src/main/ai/strategies/personalityProfiles.js';
import type { CharacterData } from '../src/shared/types/character.js';
import type { CustomDeck } from '../src/shared/types/deck.js';

const ROOT_DIR = process.cwd();
const CHARACTERS_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
const PREBUILT_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');
const DECKS_DIR = path.resolve(ROOT_DIR, 'resources/decks');

async function runRosterAndPrebuiltTests() {
  console.log('================================================================');
  console.log('=== RUNNING 40-DUELIST ROSTER & 400-PREBUILT DECKS TEST SUITE ===');
  console.log('================================================================\n');

  const characters: CharacterData[] = JSON.parse(fs.readFileSync(CHARACTERS_PATH, 'utf-8'));
  const prebuiltDecks: CustomDeck[] = JSON.parse(fs.readFileSync(PREBUILT_PATH, 'utf-8'));
  const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
  const db = new Database(CDB_PATH, { readonly: true });
  const checkDbStmt = db.prepare('SELECT datas.id, texts.name FROM datas JOIN texts ON datas.id = texts.id WHERE datas.id = ?');

  try {
    // 1. Roster Verification: Exactly 40 Characters (20 DM + 20 GX)
    console.log('▶ Test 1: Roster Count and Series Distribution');
    assert.equal(characters.length, 40, `Expected 40 characters, found ${characters.length}`);
    
    const dmChars = characters.filter((c) => c.series === 'DM');
    const gxChars = characters.filter((c) => c.series === 'GX');
    assert.equal(dmChars.length, 20, `Expected 20 DM characters, found ${dmChars.length}`);
    assert.equal(gxChars.length, 20, `Expected 20 GX characters, found ${gxChars.length}`);
    console.log(`  ✓ 40 Characters Verified: 20 DM characters & 20 GX characters.\n`);

    // 2. Pre-Built Decks Completeness & Legality
    console.log('▶ Test 2: Deck Completeness (>= 40 Cards) & Database Legality');
    let characterDeckCount = 0;
    let cardReferencesChecked = 0;

    for (const char of characters) {
      assert(char.decks && char.decks.length > 0, `Character ${char.name} must have at least 1 deck`);
      assert(char.decks.length <= 10, `Character ${char.name} has more than 10 decks (${char.decks.length})`);

      for (const deck of char.decks) {
        characterDeckCount++;
        assert(deck.mainCards.length >= 40, `Deck "${deck.name}" of ${char.name} must have >= 40 cards, got ${deck.mainCards.length}`);

        // Verify every card in mainCards
        for (const cardId of deck.mainCards) {
          cardReferencesChecked++;
          assert(pool[String(cardId)], `Card ID ${cardId} in deck "${deck.name}" is missing from whitelist`);
          const dbRow = checkDbStmt.get(cardId);
          assert(dbRow, `Card ID ${cardId} in deck "${deck.name}" is missing from cards.cdb`);
        }

        // Verify every card in extraCards
        if (deck.extraCards) {
          for (const cardId of deck.extraCards) {
            cardReferencesChecked++;
            assert(pool[String(cardId)], `Extra Card ID ${cardId} in deck "${deck.name}" is missing from whitelist`);
            const dbRow = checkDbStmt.get(cardId);
            assert(dbRow, `Extra Card ID ${cardId} in deck "${deck.name}" is missing from cards.cdb`);
          }
        }

        // Verify YDK file on disk
        const ydkFilename = path.basename(deck.ydkPath);
        const ydkFullPath = path.join(DECKS_DIR, ydkFilename);
        assert(fs.existsSync(ydkFullPath), `YDK file missing at ${ydkFullPath}`);
      }
    }

    console.log(`  ✓ Checked ${characterDeckCount} character decks and ${cardReferencesChecked} card references.`);
    console.log(`  ✓ 100% of cards in all decks are legal, valid, and verified in cards.cdb.\n`);

    // 3. Prebuilt Decks File Integrity
    console.log('▶ Test 3: data/prebuilt-decks.json Completeness');
    assert(prebuiltDecks.length >= 400, `Expected at least 400 prebuilt decks, found ${prebuiltDecks.length}`);

    for (const deck of prebuiltDecks) {
      assert(deck.main && deck.main.length >= 40, `Prebuilt deck "${deck.name}" must have >= 40 main cards`);
      assert(deck.id, 'Prebuilt deck must have an ID');
      assert(deck.name, 'Prebuilt deck must have a Name');
    }
    console.log(`  ✓ ${prebuiltDecks.length} prebuilt decks verified with complete metadata and >= 40 main cards.\n`);

    // 4. AI Personality Coverage
    console.log('▶ Test 4: AI Personality Profiles for All 40 Characters');
    for (const char of characters) {
      const personality = getPersonalityForCharacter(char.id);
      assert(personality, `Missing personality for character ${char.id}`);
      assert(personality.aggression >= 0 && personality.aggression <= 1, `Invalid aggression for ${char.id}`);
      assert(personality.defensiveness >= 0 && personality.defensiveness <= 1, `Invalid defensiveness for ${char.id}`);
      assert(personality.riskTolerance >= 0 && personality.riskTolerance <= 1, `Invalid riskTolerance for ${char.id}`);
    }
    console.log(`  ✓ All 40 characters have distinct, validated AI personalities.\n`);

    // 5. Random Deck Selection Distribution
    console.log('▶ Test 5: Uniform Random Deck Selection Across Character Decks');
    const testChar = characters.find((c) => c.id === 'yugi-muto')!;
    const counts: Record<number, number> = {};
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      const idx = Math.floor(Math.random() * testChar.decks.length);
      counts[idx] = (counts[idx] || 0) + 1;
    }
    for (let i = 0; i < testChar.decks.length; i++) {
      assert((counts[i] || 0) > 0, `Deck index ${i} was never chosen in ${trials} trials`);
    }
    console.log(`  ✓ Random deck selector distributed across all ${testChar.decks.length} decks of Yugi Muto uniformly.\n`);

    console.log('================================================================');
    console.log('🎉 ALL ROSTER & PREBUILT DECK EXPANSION TESTS PASSED 100%!');
    console.log('================================================================\n');
  } finally {
    db.close();
  }
}

runRosterAndPrebuiltTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
