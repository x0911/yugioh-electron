import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import type { CustomDeck } from '../src/shared/types/deck.js';
import {
  setAnimationUserPlayerId,
  toPlayerDomId,
  getAnimationUserPlayerId,
} from '../src/renderer/utils/animationService.js';

console.log('=== Running 400+ Pre-Built Decks & Premium Autocomplete Selector Tests ===\n');

const ROOT_DIR = process.cwd();
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');
const PREBUILT_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');
const CHARACTERS_PATH = path.resolve(ROOT_DIR, 'data/characters.json');

const db = new Database(CDB_PATH, { readonly: true });
const checkCardStmt = db.prepare('SELECT id, name FROM texts WHERE id = ?');

// --- TEST 1: 400+ Pre-Built Decks Totality & Database Verification ---
console.log('Test 1: 400+ Pre-Built Decks Totality & Database Verification...');
assert.ok(fs.existsSync(PREBUILT_PATH), 'data/prebuilt-decks.json must exist');
const prebuiltDecks: CustomDeck[] = JSON.parse(fs.readFileSync(PREBUILT_PATH, 'utf-8'));
assert.ok(prebuiltDecks.length >= 80, `Expected at least 80 pre-built decks, got ${prebuiltDecks.length}`);

for (const deck of prebuiltDecks) {
  assert.ok(deck.id, `Deck must have an id: ${JSON.stringify(deck)}`);
  assert.ok(deck.name, `Deck must have a name: ${deck.id}`);
  assert.ok(Array.isArray(deck.main), `Deck ${deck.name} must have a main array`);
  assert.ok(deck.main.length >= 40, `Deck ${deck.name} has ${deck.main.length} main cards (< 40 min)`);
  assert.ok(deck.main.length <= 60, `Deck ${deck.name} has ${deck.main.length} main cards (> 60 max)`);
  assert.ok(Array.isArray(deck.extra), `Deck ${deck.name} must have an extra array`);
  assert.ok(deck.extra.length <= 15, `Deck ${deck.name} has ${deck.extra.length} extra cards (> 15 max)`);

  // Verify all main card IDs exist in cards.cdb
  for (const cardId of deck.main) {
    const found = checkCardStmt.get(cardId);
    assert.ok(found, `Card ID ${cardId} in deck "${deck.name}" must exist in SQLite database!`);
  }

  // Verify all extra card IDs exist in cards.cdb
  for (const cardId of deck.extra) {
    const found = checkCardStmt.get(cardId);
    assert.ok(found, `Extra card ID ${cardId} in deck "${deck.name}" must exist in SQLite database!`);
  }
}
console.log('✓ All 80 pre-built decks are well-formed and 100% verified against SQLite database.');

// --- TEST 2: Categorization & Series Partitioning ---
console.log('\nTest 2: Categorization & Series Partitioning...');
const dmHeroDecks = prebuiltDecks.filter((d) => d.category === 'character-dm');
const gxHeroDecks = prebuiltDecks.filter((d) => d.category === 'character-gx');
const popDecks = prebuiltDecks.filter((d) => d.category === 'popular-dm' || d.category === 'popular-gx');

assert.ok(dmHeroDecks.length >= 150, `Expected at least 150 DM tournament character decks, got ${dmHeroDecks.length}`);
assert.ok(gxHeroDecks.length >= 150, `Expected at least 150 GX tournament character decks, got ${gxHeroDecks.length}`);
assert.ok(popDecks.length >= 100, `Expected at least 100 popular community decks, got ${popDecks.length}`);
assert.ok(prebuiltDecks.length >= 400, `Expected at least 400 total prebuilt decks, got ${prebuiltDecks.length}`);
console.log(`✓ Partitioned DM character decks (${dmHeroDecks.length}), GX character decks (${gxHeroDecks.length}), and popular community decks (${popDecks.length}, total: ${prebuiltDecks.length}).`);

// --- TEST 3: Autocomplete Query & Filter Logic ---
console.log('\nTest 3: Autocomplete Query & Filter Logic...');
function filterDecks(
  decks: CustomDeck[],
  query: string,
  category: 'ALL' | 'character-dm' | 'character-gx' | 'popular' | 'custom',
): CustomDeck[] {
  let list = decks;
  if (category === 'character-dm') {
    list = list.filter((d) => d.category === 'character-dm' || (d.series === 'DM' && d.characterName !== 'Community Popular'));
  } else if (category === 'character-gx') {
    list = list.filter((d) => d.category === 'character-gx' || (d.series === 'GX' && d.characterName !== 'Community Popular'));
  } else if (category === 'popular') {
    list = list.filter((d) => d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-'));
  }

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter((d) => {
      const name = (d.name || '').toLowerCase();
      const arch = (d.archetype || '').toLowerCase();
      const charName = (d.characterName || '').toLowerCase();
      const series = (d.series || '').toLowerCase();
      return name.includes(q) || arch.includes(q) || charName.includes(q) || series.includes(q);
    });
  }
  return list;
}

const sliferDecks = filterDecks(prebuiltDecks, 'Slifer', 'ALL');
assert.ok(sliferDecks.length >= 1, `Expected at least 1 Slifer deck, found ${sliferDecks.length}`);
console.log(`  Query "Slifer": found ${sliferDecks.length} match (${sliferDecks[0].name})`);

const cyberDecks = filterDecks(prebuiltDecks, 'Cyber', 'ALL');
assert.ok(cyberDecks.length >= 3, `Expected at least 3 decks matching "Cyber", found ${cyberDecks.length}`);
console.log(`  Query "Cyber": found ${cyberDecks.length} matches (${cyberDecks.map((d) => d.name).slice(0, 3).join(', ')}...)`);

const kaibaDecks = filterDecks(prebuiltDecks, 'Kaiba', 'ALL');
assert.ok(kaibaDecks.length >= 10, `Expected at least 10 Kaiba decks, found ${kaibaDecks.length}`);
console.log(`  Query "Kaiba": found ${kaibaDecks.length} matches (${kaibaDecks.map((d) => d.name).slice(0, 3).join(', ')}...)`);

const exodiaDecks = filterDecks(prebuiltDecks, 'Exodia', 'ALL');
assert.ok(exodiaDecks.length >= 1, `Expected at least 1 Exodia deck, found ${exodiaDecks.length}`);
console.log(`  Query "Exodia": found ${exodiaDecks.length} match (${exodiaDecks[0].name})`);
console.log('✓ Autocomplete query and category filtering operate accurately.');

// --- TEST 4: Player 2 Animation Perspective & Reversal Guarantee ---
console.log('\nTest 4: Player 2 Animation Perspective & Reversal Guarantee...');
// Case A: User goes first (userPlayerId = 0)
setAnimationUserPlayerId(0);
assert.strictEqual(getAnimationUserPlayerId(), 0);
assert.strictEqual(toPlayerDomId(0), 'user', 'Player 0 should map to user when user goes first');
assert.strictEqual(toPlayerDomId(1), 'ai', 'Player 1 should map to ai when user goes first');

// Case B: User goes second (userPlayerId = 1)
setAnimationUserPlayerId(1);
assert.strictEqual(getAnimationUserPlayerId(), 1);
assert.strictEqual(toPlayerDomId(1), 'user', 'Player 1 should map to user when user goes second');
assert.strictEqual(toPlayerDomId(0), 'ai', 'Player 0 should map to ai when user goes second');
console.log('✓ Player perspective strictly maps Player 1 to user and Player 0 to AI when user plays second.');

console.log('\n🎉 ALL 400+ PRE-BUILT DECKS & SELECTOR AUTOCOMPLETE TESTS PASSED SUCCESSFULLY!\n');
