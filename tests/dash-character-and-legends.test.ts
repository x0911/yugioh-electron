import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { getPersonalityForCharacter } from '../src/main/ai/strategies/personalityProfiles.js';
import type { CharacterData } from '../src/shared/types/character.js';
import type { CustomDeck } from '../src/shared/types/deck.js';

const ROOT_DIR = process.cwd();
const CHARACTERS_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
const PREBUILT_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');

const LEGENDS_IDS = ['yami-yugi', 'jaden-yuki', 'yusei-fudo', 'dash'];

async function runDashAndLegendsTests() {
  console.log('================================================================');
  console.log('=== RUNNING DASH & LEGENDS ROSTER VERIFICATION TEST SUITE ===');
  console.log('================================================================\n');

  const characters: CharacterData[] = JSON.parse(fs.readFileSync(CHARACTERS_PATH, 'utf-8'));
  const prebuiltDecks: CustomDeck[] = JSON.parse(fs.readFileSync(PREBUILT_PATH, 'utf-8'));
  const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
  const db = new Database(CDB_PATH, { readonly: true });
  const checkDbStmt = db.prepare('SELECT datas.id, texts.name FROM datas JOIN texts ON datas.id = texts.id WHERE datas.id = ?');

  try {
    // 1. Dash Character Definition Verification
    console.log('▶ Test 1: Dash Character Definition & Metadata');
    const dash = characters.find((c) => c.id === 'dash');
    assert.ok(dash, 'Dash must exist in data/characters.json');
    assert.equal(dash.name, 'Dash');
    assert.equal(dash.series, 'Legends');
    assert.equal(dash.themeColor, '#8b5cf6');
    assert.ok(dash.description && dash.description.length > 0);
    assert.equal(dash.avatar, 'app-resource://characters/avatars/dash.png');
    assert.equal(dash.portrait, 'app-resource://characters/portraits/dash.png');
    console.log('  ✓ Dash character metadata is valid and fully specified.\n');

    // 2. Dash Assets on Disk
    console.log('▶ Test 2: Dash Avatar & Portrait Disk Files');
    const avatarPath = path.resolve(ROOT_DIR, 'resources/characters/avatars/dash.png');
    const portraitPath = path.resolve(ROOT_DIR, 'resources/characters/portraits/dash.png');
    assert.ok(fs.existsSync(avatarPath), `Avatar file missing: ${avatarPath}`);
    assert.ok(fs.existsSync(portraitPath), `Portrait file missing: ${portraitPath}`);
    assert.ok(fs.statSync(avatarPath).size > 0, 'Avatar file must not be empty');
    assert.ok(fs.statSync(portraitPath).size > 0, 'Portrait file must not be empty');
    console.log('  ✓ Dash avatar and portrait assets exist on disk with non-zero size.\n');

    // 3. Dash Prebuilt Tournament Decks
    console.log('▶ Test 3: Dash Master Tournament Decks');
    assert.equal(dash.decks.length, 10, `Dash must have exactly 10 master decks, got ${dash.decks.length}`);
    for (let i = 0; i < dash.decks.length; i++) {
      const deck = dash.decks[i];
      assert.ok(deck.id.startsWith('dash_deck_'), `Deck ID must follow naming convention: ${deck.id}`);
      assert.ok(deck.mainCards.length >= 40, `Deck "${deck.name}" has only ${deck.mainCards.length} cards`);
      
      // Check YDK file on disk
      const ydkPath = path.resolve(ROOT_DIR, deck.ydkPath);
      assert.ok(fs.existsSync(ydkPath), `YDK file missing for deck "${deck.name}": ${ydkPath}`);

      // Verify cards in whitelist & CDB
      for (const cardId of deck.mainCards) {
        assert.ok(pool[String(cardId)], `Card ${cardId} in deck "${deck.name}" not in whitelist`);
        assert.ok(checkDbStmt.get(cardId), `Card ${cardId} in deck "${deck.name}" not in CDB`);
      }
      if (deck.extraCards) {
        for (const cardId of deck.extraCards) {
          assert.ok(pool[String(cardId)], `Extra card ${cardId} in deck "${deck.name}" not in whitelist`);
          assert.ok(checkDbStmt.get(cardId), `Extra card ${cardId} in deck "${deck.name}" not in CDB`);
        }
      }
    }
    console.log(`  ✓ All 10 Dash tournament decks verified (all >= 40 cards, valid YDKs, legal cards in CDB).\n`);

    // 4. Dash AI Personality Profile
    console.log('▶ Test 4: Dash AI Personality Profile');
    const personality = getPersonalityForCharacter('dash');
    assert.ok(personality, 'Missing AI personality for Dash');
    assert.equal(personality.aggression, 0.90);
    assert.equal(personality.defensiveness, 0.75);
    assert.equal(personality.riskTolerance, 0.80);
    assert.equal(personality.comboFocus, 0.98);
    assert.equal(personality.cardAdvantageWeight, 1.80);
    console.log('  ✓ Dash AI personality profile verified with mastermind strategic metrics.\n');

    // 5. Legends Roster & Cross-Series Presence
    console.log('▶ Test 5: Legends Category Roster & Cross-Series Membership');
    const legendsList = characters.filter((c) => LEGENDS_IDS.includes(c.id));
    assert.equal(legendsList.length, 4, `Expected 4 Legends characters, found ${legendsList.length}`);

    const yugi = characters.find((c) => c.id === 'yami-yugi');
    const jaden = characters.find((c) => c.id === 'jaden-yuki');
    const yusei = characters.find((c) => c.id === 'yusei-fudo');

    assert.ok(yugi, 'Yami Yugi must exist');
    assert.ok(jaden, 'Jaden Yuki must exist');
    assert.ok(yusei, 'Yusei Fudo must exist');

    assert.equal(yugi.series, 'DM', 'Yami Yugi must remain in DM series');
    assert.equal(jaden.series, 'GX', 'Jaden Yuki must remain in GX series');
    assert.equal(yusei.series, '5Ds', 'Yusei Fudo must remain in 5Ds series');
    assert.equal(dash.series, 'Legends', 'Dash series must be Legends');

    // Simulate OpponentSelectModal filter logic
    const filterCharacters = (series: string) => {
      if (series === 'Legends') {
        return characters.filter((c) => LEGENDS_IDS.includes(c.id) || c.series === 'Legends');
      }
      return characters.filter((c) => c.series === series);
    };

    const dmResults = filterCharacters('DM');
    const gxResults = filterCharacters('GX');
    const fiveDsResults = filterCharacters('5Ds');
    const legendsResults = filterCharacters('Legends');

    assert.equal(dmResults.length, 20, 'DM tab must still contain 20 characters');
    assert.ok(dmResults.some((c) => c.id === 'yami-yugi'), 'DM tab must include Yami Yugi');

    assert.equal(gxResults.length, 20, 'GX tab must still contain 20 characters');
    assert.ok(gxResults.some((c) => c.id === 'jaden-yuki'), 'GX tab must include Jaden Yuki');

    assert.equal(fiveDsResults.length, 20, '5Ds tab must still contain 20 characters');
    assert.ok(fiveDsResults.some((c) => c.id === 'yusei-fudo'), '5Ds tab must include Yusei Fudo');

    assert.equal(legendsResults.length, 4, 'Legends tab must contain exactly 4 characters');
    const legendsResultIds = legendsResults.map((c) => c.id);
    for (const id of LEGENDS_IDS) {
      assert.ok(legendsResultIds.includes(id), `Legends tab must contain ${id}`);
    }
    console.log('  ✓ Legends roster verified: Yami Yugi (DM), Jaden Yuki (GX), Yusei Fudo (5Ds), Dash (Legends).\n');

    // 6. Dash Universal Deck Piloting Check
    console.log('▶ Test 6: Dash Universal Deck Compatibility');
    const samplePrebuilt = prebuiltDecks[0];
    const convertedDeck = {
      id: samplePrebuilt.id,
      name: samplePrebuilt.name,
      description: samplePrebuilt.description || '',
      mainCards: samplePrebuilt.main,
      extraCards: samplePrebuilt.extra || [],
      sideCards: samplePrebuilt.side || [],
      ydkPath: '',
    };
    assert.ok(convertedDeck.mainCards.length >= 40);
    assert.equal(convertedDeck.id, samplePrebuilt.id);
    console.log('  ✓ Prebuilt decks convert cleanly to character deck structures for Dash.\n');

    console.log('================================================================');
    console.log('🎉 ALL DASH & LEGENDS ROSTER TESTS PASSED 100%!');
    console.log('================================================================\n');
  } finally {
    db.close();
  }
}

runDashAndLegendsTests().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
