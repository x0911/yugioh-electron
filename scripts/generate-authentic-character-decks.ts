import fs from 'node:fs';
import path from 'node:path';
import { compileDecks } from './characterDecks/deckValidatorHelper.ts';
import { DM_AUTHENTIC_DECKS } from './characterDecks/dmAuthenticDecks.ts';
import { GX_AUTHENTIC_DECKS } from './characterDecks/gxAuthenticDecks.ts';
import { FIVE_DS_AUTHENTIC_DECKS } from './characterDecks/fiveDsAuthenticDecks.ts';
import { generateManifest } from './generate-update-manifest.ts';

const ROOT_DIR = process.cwd();
const CHARACTERS_JSON_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
const PREBUILT_DECKS_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');
const DECKS_DIR = path.resolve(ROOT_DIR, 'resources/decks');

function writeYdkFile(filePath: string, mainCards: number[], extraCards: number[] = []) {
  let content = '#created by yugioh-electron authentic character decks\n#main\n';
  for (const id of mainCards) {
    content += `${id}\n`;
  }
  content += '#extra\n';
  for (const id of extraCards) {
    content += `${id}\n`;
  }
  content += '!side\n';
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function generateAuthenticCharacterDecks() {
  console.log('===============================================================');
  console.log('=== GENERATING AUTHENTIC CANONICAL CHARACTER DECKS ===');
  console.log('===============================================================\n');

  // 1. Compile all authentic deck definitions
  console.log('Compiling DM Authentic Decks...');
  const dmCompiled = compileDecks(DM_AUTHENTIC_DECKS);
  console.log(`✓ Compiled ${dmCompiled.length} DM decks.`);

  console.log('Compiling GX Authentic Decks...');
  const gxCompiled = compileDecks(GX_AUTHENTIC_DECKS);
  console.log(`✓ Compiled ${gxCompiled.length} GX decks.`);

  console.log('Compiling 5D\'s Authentic Decks...');
  const fiveDsCompiled = compileDecks(FIVE_DS_AUTHENTIC_DECKS);
  console.log(`✓ Compiled ${fiveDsCompiled.length} 5D's decks.`);

  const allCompiledDecks = [...dmCompiled, ...gxCompiled, ...fiveDsCompiled];
  console.log(`\nTotal compiled authentic decks: ${allCompiledDecks.length}`);

  // 2. Vanish old character YDK files from resources/decks
  console.log('\nScanning resources/decks to vanish old character decks...');
  const allYdkFiles = fs.readdirSync(DECKS_DIR).filter((f) => f.endsWith('.ydk'));
  let deletedCount = 0;
  let preservedCount = 0;

  for (const file of allYdkFiles) {
    // Preserve popular community decks
    if (file.startsWith('pop-')) {
      preservedCount++;
      continue;
    }
    // Preserve Dash's 10 master decks
    if (file.startsWith('dash_deck_')) {
      preservedCount++;
      continue;
    }

    // Otherwise, it's an old character deck - delete it
    fs.unlinkSync(path.join(DECKS_DIR, file));
    deletedCount++;
  }
  console.log(`✓ Vanished ${deletedCount} old character YDK files.`);
  console.log(`✓ Preserved ${preservedCount} non-character YDK files (Popular & Dash).`);

  // 3. Write out new authentic YDK files
  console.log('\nWriting new authentic YDK files to disk...');
  for (const deck of allCompiledDecks) {
    const ydkFilename = `${deck.id}.ydk`;
    const ydkFullPath = path.join(DECKS_DIR, ydkFilename);
    writeYdkFile(ydkFullPath, deck.mainCards, deck.extraCards);
  }
  console.log(`✓ Wrote ${allCompiledDecks.length} authentic YDK files.`);

  // 4. Update data/characters.json
  console.log('\nUpdating data/characters.json...');
  const characters = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, 'utf-8'));
  const deckMapByCharacter = new Map<string, typeof allCompiledDecks>();

  for (const deck of allCompiledDecks) {
    // Determine characterId from definition
    const charId = deck.id.split('_deck_')[0];
    if (!deckMapByCharacter.has(charId)) {
      deckMapByCharacter.set(charId, []);
    }
    deckMapByCharacter.get(charId)!.push(deck);
  }

  for (const char of characters) {
    if (char.id === 'dash') {
      console.log(`  - Preserving Dash's 10 Master Tournament decks.`);
      continue;
    }

    const decksForChar = deckMapByCharacter.get(char.id);
    if (!decksForChar || decksForChar.length === 0) {
      throw new Error(`FATAL: Character ${char.id} (${char.name}) has NO authentic decks assigned!`);
    }

    char.decks = decksForChar.map((d) => ({
      id: d.id,
      name: d.name,
      archetype: d.archetype,
      description: d.description,
      ydkPath: d.ydkPath,
      mainCards: d.mainCards,
      extraCards: d.extraCards,
    }));

    console.log(`  ✓ Updated ${char.name} (${char.id}) with ${char.decks.length} authentic deck(s).`);
  }

  fs.writeFileSync(CHARACTERS_JSON_PATH, JSON.stringify(characters, null, 2), 'utf-8');
  console.log(`✓ Saved ${characters.length} characters to ${CHARACTERS_JSON_PATH}`);

  // 5. Update data/prebuilt-decks.json
  console.log('\nUpdating data/prebuilt-decks.json...');
  const existingPrebuilt = JSON.parse(fs.readFileSync(PREBUILT_DECKS_PATH, 'utf-8'));
  const popularDecks = existingPrebuilt.filter((d: any) => d.id.startsWith('pop-') || d.category.startsWith('popular-'));
  console.log(`Preserving all ${popularDecks.length} Popular community decks.`);

  const newPrebuiltCharacterDecks: any[] = [];
  let deckCounter = 0;

  for (const char of characters) {
    if (char.id === 'dash') continue;

    for (const deck of char.decks) {
      const category =
        char.series === 'DM'
          ? 'character-dm'
          : char.series === 'GX'
            ? 'character-gx'
            : 'character-5ds';

      newPrebuiltCharacterDecks.push({
        id: deck.id,
        name: `${char.name} — ${deck.name}`,
        main: deck.mainCards,
        extra: deck.extraCards || [],
        createdAt: 1700000000000 + deckCounter * 1000,
        updatedAt: 1700000000000 + deckCounter * 1000,
        series: char.series,
        archetype: deck.archetype,
        characterId: char.id,
        characterName: char.name,
        avatar: `app-resource://characters/avatars/${char.id}.png`,
        portrait: `app-resource://characters/portraits/${char.id}.png`,
        category,
        side: [],
      });
      deckCounter++;
    }
  }

  const updatedPrebuilt = [...newPrebuiltCharacterDecks, ...popularDecks];
  fs.writeFileSync(PREBUILT_DECKS_PATH, JSON.stringify(updatedPrebuilt, null, 2), 'utf-8');
  console.log(`✓ Saved ${updatedPrebuilt.length} prebuilt decks to ${PREBUILT_DECKS_PATH} (${newPrebuiltCharacterDecks.length} character + ${popularDecks.length} popular).`);

  // 6. Regenerate update manifest
  console.log('\nRegenerating data/update-manifest.json...');
  generateManifest();
  console.log('✓ data/update-manifest.json regenerated successfully.');

  console.log('\n===============================================================');
  console.log('🎉 COMPLETED GENERATION OF AUTHENTIC CHARACTER DECKS!');
  console.log('===============================================================\n');
}

if (process.argv[1] && process.argv[1].endsWith('generate-authentic-character-decks.ts')) {
  generateAuthenticCharacterDecks();
}
