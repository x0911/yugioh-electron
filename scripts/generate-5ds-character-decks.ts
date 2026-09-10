import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { getFiveDsCharacters } from './characterDecks/fiveDsCharacters.js';
import { writeYdkFile } from './deckGenHelper.js';
import { generateManifest } from './generate-update-manifest.js';
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

export async function generateFiveDsCharacterDecks() {
  console.log('===========================================================');
  console.log('=== GENERATING & VERIFYING 10 5D\'s CHARACTER DECKS (100 DECKS) ===');
  console.log('===========================================================');

  const fiveDsCharacters = getFiveDsCharacters();
  console.log(`\nLoaded ${fiveDsCharacters.length} 5D's Characters.`);

  // Verify all 10 characters and write out their 100 decks
  let totalDecks = 0;
  let totalCardsChecked = 0;
  const new5DsPrebuiltDecks: CustomDeck[] = [];

  for (const char of fiveDsCharacters) {
    console.log(`\n▶ Processing [${char.series}] ${char.name} (${char.id}): ${char.decks.length} decks`);
    let deckIdx = 1;
    for (const deck of char.decks) {
      totalDecks++;

      // 1. Verify card count
      if (!deck.mainCards || deck.mainCards.length < 40) {
        throw new Error(
          `Deck "${deck.name}" for character ${char.name} has only ${deck.mainCards?.length || 0} cards (minimum 40 required)!`,
        );
      }
      if (deck.extraCards && deck.extraCards.length > 15) {
        throw new Error(
          `Deck "${deck.name}" for character ${char.name} has ${deck.extraCards.length} extra cards (maximum 15 allowed)!`,
        );
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
        characterId: char.id,
        characterName: char.name,
        avatar: `app-resource://characters/avatars/${char.id}.png`,
        portrait: `app-resource://characters/portraits/${char.id}.png`,
        category: 'character-5ds',
      };
      new5DsPrebuiltDecks.push(customDeck);

      console.log(`  ✓ Deck #${deckIdx}: "${deck.name}" — ${deck.mainCards.length} Main, ${deck.extraCards?.length || 0} Extra`);
      deckIdx++;
    }
  }

  // 5. Update data/characters.json preserving DM and GX characters
  const existingCharacters: CharacterData[] = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, 'utf-8'));
  const non5DsCharacters = existingCharacters.filter((c) => c.series !== '5Ds');
  console.log(`\nPreserving ${non5DsCharacters.length} DM and GX characters from ${CHARACTERS_JSON_PATH}.`);

  const updatedCharacters = [...non5DsCharacters, ...fiveDsCharacters];
  fs.writeFileSync(CHARACTERS_JSON_PATH, JSON.stringify(updatedCharacters, null, 2), 'utf-8');
  console.log(`✓ Successfully wrote ${updatedCharacters.length} total characters to ${CHARACTERS_JSON_PATH}`);

  // 6. Update data/prebuilt-decks.json preserving DM, GX, and Popular decks
  const existingPrebuilt: CustomDeck[] = JSON.parse(fs.readFileSync(PREBUILT_DECKS_PATH, 'utf-8'));
  const non5DsPrebuilt = existingPrebuilt.filter((d) => d.category !== 'character-5ds' && d.series !== '5Ds');
  console.log(`Preserving ${non5DsPrebuilt.length} existing prebuilt decks from ${PREBUILT_DECKS_PATH}.`);

  const updatedPrebuilt = [...non5DsPrebuilt, ...new5DsPrebuiltDecks];
  fs.writeFileSync(PREBUILT_DECKS_PATH, JSON.stringify(updatedPrebuilt, null, 2), 'utf-8');
  console.log(`✓ Successfully wrote ${updatedPrebuilt.length} total prebuilt decks to ${PREBUILT_DECKS_PATH}`);

  // 7. Regenerate update-manifest.json
  console.log('\nRegenerating update-manifest.json...');
  generateManifest();
  console.log('✓ update-manifest.json updated successfully.');

  console.log('\n===========================================================');
  console.log(`🎉 ALL ${totalDecks} 5D\'S CHARACTER DECKS GENERATED & VERIFIED!`);
  console.log(`Total card references checked: ${totalCardsChecked}`);
  console.log('===========================================================\n');
}

if (process.argv[1] && process.argv[1].endsWith('generate-5ds-character-decks.ts')) {
  generateFiveDsCharacterDecks()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
