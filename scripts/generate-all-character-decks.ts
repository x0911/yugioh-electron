import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { getDmCharacters } from './characterDecks/dmCharacters.js';
import { getGxCharacters } from './characterDecks/gxCharacters.js';
import { writeYdkFile } from './deckGenHelper.js';
import type { CharacterData } from '../src/shared/types/character.js';
import type { CustomDeck } from '../src/shared/types/deck.js';

const ROOT_DIR = process.cwd();
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');
const DECKS_DIR = path.resolve(ROOT_DIR, 'resources/decks');
const CHARACTERS_JSON_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
const PREBUILT_DECKS_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');

if (!fs.existsSync(DECKS_DIR)) {
  fs.mkdirSync(DECKS_DIR, { recursive: true });
}

const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
const db = new Database(CDB_PATH, { readonly: true });
const checkDbStmt = db.prepare('SELECT id FROM datas WHERE id = ?');

console.log('===========================================================');
console.log('=== GENERATING & VERIFYING ALL 40 CHARACTER DECKS (DM+GX) ===');
console.log('===========================================================');

const dmCharacters = getDmCharacters();
const gxCharacters = getGxCharacters();
const allCharacters: CharacterData[] = [...dmCharacters, ...gxCharacters];

console.log(`\nLoaded ${dmCharacters.length} DM Characters and ${gxCharacters.length} GX Characters (${allCharacters.length} total).`);

let totalDecks = 0;
let totalCardsChecked = 0;
const allPrebuiltDecks: CustomDeck[] = [];

for (const char of allCharacters) {
  console.log(`\n▶ Processing [${char.series}] ${char.name} (${char.id}): ${char.decks.length} decks`);
  let deckIdx = 1;
  for (const deck of char.decks) {
    totalDecks++;
    // 1. Verify card count
    if (!deck.mainCards || deck.mainCards.length < 40) {
      throw new Error(`Deck "${deck.name}" for character ${char.name} has only ${deck.mainCards?.length || 0} cards (minimum 40 required)!`);
    }

    // 2. Verify all card IDs exist in pool and cards.cdb
    for (const cardId of deck.mainCards) {
      totalCardsChecked++;
      if (!pool[String(cardId)]) {
        throw new Error(`Card ID ${cardId} in deck "${deck.name}" is not in card-pool-whitelist.json!`);
      }
      const inDb = checkDbStmt.get(cardId);
      if (!inDb) {
        throw new Error(`Card ID ${cardId} in deck "${deck.name}" is missing from cards.cdb datas table!`);
      }
    }

    if (deck.extraCards) {
      for (const cardId of deck.extraCards) {
        totalCardsChecked++;
        if (!pool[String(cardId)]) {
          throw new Error(`Extra Card ID ${cardId} in deck "${deck.name}" is not in card-pool-whitelist.json!`);
        }
        const inDb = checkDbStmt.get(cardId);
        if (!inDb) {
          throw new Error(`Extra Card ID ${cardId} in deck "${deck.name}" is missing from cards.cdb datas table!`);
        }
      }
    }

    // 3. Write YDK file
    const ydkFilename = `${char.id}_deck_${deckIdx}.ydk`;
    const ydkPath = path.join(DECKS_DIR, ydkFilename);
    deck.ydkPath = `resources/decks/${ydkFilename}`;
    writeYdkFile(ydkPath, deck.mainCards, deck.extraCards || []);

    // 4. Convert to CustomDeck format for prebuilt-decks.json
    const customDeck: CustomDeck = {
      id: deck.id,
      name: `${char.name} — ${deck.name}`,
      main: deck.mainCards,
      extra: deck.extraCards || [],
      createdAt: 1700000000000 + totalDecks * 1000,
      updatedAt: 1700000000000 + totalDecks * 1000,
      series: char.series,
      archetype: deck.archetype,
      characterName: char.name,
      category: char.series === 'DM' ? 'character-dm' : 'character-gx',
    };
    allPrebuiltDecks.push(customDeck);

    console.log(`  ✓ Deck #${deckIdx}: "${deck.name}" — ${deck.mainCards.length} Main, ${deck.extraCards?.length || 0} Extra`);
    deckIdx++;
  }
}

// 5. Preserve / merge existing popular decks from data/prebuilt-decks.json if present
if (fs.existsSync(PREBUILT_DECKS_PATH)) {
  try {
    const existing: CustomDeck[] = JSON.parse(fs.readFileSync(PREBUILT_DECKS_PATH, 'utf-8'));
    const popularDecks = existing.filter(
      (d) => d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-')
    );
    console.log(`\nPreserving ${popularDecks.length} community popular decks from previous prebuilt-decks.json.`);
    allPrebuiltDecks.push(...popularDecks);
  } catch (err) {
    console.warn('Could not read existing popular decks:', err);
  }
}

// 6. Write out data/characters.json
fs.writeFileSync(CHARACTERS_JSON_PATH, JSON.stringify(allCharacters, null, 2), 'utf-8');
console.log(`\n✓ Successfully saved ${allCharacters.length} characters to ${CHARACTERS_JSON_PATH}`);

// 7. Write out data/prebuilt-decks.json
fs.writeFileSync(PREBUILT_DECKS_PATH, JSON.stringify(allPrebuiltDecks, null, 2), 'utf-8');
console.log(`✓ Successfully saved ${allPrebuiltDecks.length} prebuilt decks to ${PREBUILT_DECKS_PATH}`);

console.log('\n===========================================================');
console.log(`🎉 ALL ${totalDecks} CANONICAL CHARACTER DECKS GENERATED & VERIFIED!`);
console.log(`Total card references checked: ${totalCardsChecked}`);
console.log('===========================================================\n');
