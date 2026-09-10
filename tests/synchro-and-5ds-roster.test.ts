import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { duelEngineService } from '../src/main/engine/DuelEngineService.js';
import { CHARACTER_PERSONALITIES } from '../src/main/ai/strategies/personalityProfiles.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
} from 'ocgcore-wasm';
import type { CharacterData } from '../src/shared/types/character.js';
import type { CustomDeck } from '../src/shared/types/deck.js';

const ROOT_DIR = process.cwd();
const CHARACTERS_JSON_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
const PREBUILT_DECKS_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');

const EXPECTED_5DS_IDS = [
  'yusei-fudo',
  'jack-atlas',
  'crow-hogan',
  'akiza-izinski',
  'leo',
  'luna',
  'kalin-kessler',
  'antinomy',
  'sherry-leblanc',
  'zone',
  'carly-carmine',
  'rex-goodwin',
  'roman-goodwin',
  'misty-tredwell',
  'greiger',
  'aporia',
  'paradox',
  'tetsu-trudge',
  'sayer',
  'halldor',
];

async function run() {
  console.log('===============================================================');
  console.log('=== Running Synchro Monsters & 5D\'s Era Expansion Test Suite ===');
  console.log('===============================================================\n');

  const db = new Database(CDB_PATH, { readonly: true });
  const checkDbStmt = db.prepare('SELECT id FROM datas WHERE id = ?');

  // ---------------------------------------------------------------------------
  // Test 1: Card Reader Decodes Synchro and Tuner Typing Correctly
  // ---------------------------------------------------------------------------
  console.log('Test 1: Card Reader decodes Synchro and Tuner card types...');
  const cardReader = new CardReaderService();

  // Stardust Dragon (44508094): Level 8 Dragon Synchro
  const stardust = cardReader.getCardDetail(44508094);
  assert.ok(stardust, 'Stardust Dragon must exist in card reader');
  assert.equal(stardust.isSynchro, true, 'Stardust Dragon must be marked as isSynchro: true');
  assert.equal(stardust.isTuner, false, 'Stardust Dragon is not a Tuner');
  assert.equal(stardust.isExtraDeck, true, 'Stardust Dragon must be marked as isExtraDeck: true');
  assert.ok(stardust.typeLabels.includes('Synchro'), 'Stardust Dragon typeLabels must include "Synchro"');
  console.log('  ✓ Stardust Dragon (44508094): isSynchro=true, isExtraDeck=true');

  // Junk Synchron (63977008): Level 3 Warrior Tuner Effect Monster
  const junkSynchron = cardReader.getCardDetail(63977008);
  assert.ok(junkSynchron, 'Junk Synchron must exist in card reader');
  assert.equal(junkSynchron.isSynchro, false, 'Junk Synchron is not a Synchro monster');
  assert.equal(junkSynchron.isTuner, true, 'Junk Synchron must be marked as isTuner: true');
  assert.equal(junkSynchron.isExtraDeck, false, 'Junk Synchron is a Main Deck monster');
  assert.ok(junkSynchron.typeLabels.includes('Tuner'), 'Junk Synchron typeLabels must include "Tuner"');
  console.log('  ✓ Junk Synchron (63977008): isTuner=true, isExtraDeck=false');

  // Formula Synchron (50091196): Level 2 Machine Synchro Tuner Monster
  const formula = cardReader.getCardDetail(50091196);
  assert.ok(formula, 'Formula Synchron must exist in card reader');
  assert.equal(formula.isSynchro, true, 'Formula Synchron must be marked as isSynchro: true');
  assert.equal(formula.isTuner, true, 'Formula Synchron must be marked as isTuner: true');
  assert.equal(formula.isExtraDeck, true, 'Formula Synchron is an Extra Deck monster');
  assert.ok(formula.typeLabels.includes('Synchro'), 'Formula Synchron typeLabels must include "Synchro"');
  assert.ok(formula.typeLabels.includes('Tuner'), 'Formula Synchron typeLabels must include "Tuner"');
  console.log('  ✓ Formula Synchron (50091196): isSynchro=true, isTuner=true (Synchro Tuner)');

  // Red Dragon Archfiend (70902743): Level 8 Dragon Synchro
  const rda = cardReader.getCardDetail(70902743);
  assert.ok(rda, 'Red Dragon Archfiend must exist');
  assert.equal(rda.isSynchro, true, 'Red Dragon Archfiend is a Synchro');
  assert.equal(rda.isExtraDeck, true, 'Red Dragon Archfiend is Extra Deck');

  // Dark Magician (46986414): Normal Monster baseline check
  const dm = cardReader.getCardDetail(46986414);
  assert.ok(dm, 'Dark Magician must exist');
  assert.equal(dm.isSynchro, false, 'Dark Magician is not a Synchro');
  assert.equal(dm.isTuner, false, 'Dark Magician is not a Tuner');
  console.log('  ✓ Non-Synchro/Tuner baseline verification passed.');

  // ---------------------------------------------------------------------------
  // Test 2: 5D's Character Roster Integrity (10 Characters, Avatars, Portraits)
  // ---------------------------------------------------------------------------
  console.log('\nTest 2: 5D\'s Character Roster Integrity in data/characters.json...');
  assert.ok(fs.existsSync(CHARACTERS_JSON_PATH), 'characters.json must exist');
  const allCharacters: CharacterData[] = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, 'utf-8'));

  assert.equal(allCharacters.length, 60, 'Total roster should be exactly 60 characters (20 DM + 20 GX + 20 5Ds)');

  const fiveDsCharacters = allCharacters.filter((c) => c.series === '5Ds');
  assert.equal(fiveDsCharacters.length, 20, 'There must be exactly 20 5D\'s characters');

  const fiveDsIds = fiveDsCharacters.map((c) => c.id);
  assert.deepEqual(
    fiveDsIds.sort(),
    [...EXPECTED_5DS_IDS].sort(),
    '5D\'s roster must match expected 10 characters',
  );

  for (const char of fiveDsCharacters) {
    // Check avatar file
    const avatarFilename = path.basename(char.avatar);
    const avatarPath = path.resolve(ROOT_DIR, 'resources/characters/avatars', avatarFilename);
    assert.ok(fs.existsSync(avatarPath), `Avatar file must exist for ${char.name} at ${avatarPath}`);
    assert.ok(fs.statSync(avatarPath).size > 1000, `Avatar for ${char.name} must not be empty`);

    // Check portrait file
    assert.ok(char.portrait, `Character ${char.name} must have a portrait property`);
    const portraitFilename = path.basename(char.portrait);
    const portraitPath = path.resolve(ROOT_DIR, 'resources/characters/portraits', portraitFilename);
    assert.ok(fs.existsSync(portraitPath), `Portrait file must exist for ${char.name} at ${portraitPath}`);
    assert.ok(fs.statSync(portraitPath).size > 5000, `Portrait for ${char.name} must not be empty`);

    // Check personality
    assert.ok(
      CHARACTER_PERSONALITIES[char.id],
      `Character personality profile must exist for ${char.id} in personalityProfiles.ts`,
    );

    // Check signature cards
    assert.ok(Array.isArray(char.signatureCards), `Signature cards must be array for ${char.name}`);
    assert.ok(char.signatureCards.length >= 1, `Character ${char.name} must have signature cards`);
    for (const sigId of char.signatureCards) {
      assert.ok(checkDbStmt.get(sigId), `Signature card ID ${sigId} for ${char.name} must exist in cards.cdb`);
    }

    console.log(`  ✓ [5Ds] ${char.name} (${char.id}): Avatar, Portrait, Personality, Signature Cards OK`);
  }

  // ---------------------------------------------------------------------------
  // Test 3: 100 5D's Decks Legality & YDK Files
  // ---------------------------------------------------------------------------
  console.log('\nTest 3: 100 5D\'s Decks Legality, Card References & YDK Files...');
  let totalDecksChecked = 0;

  for (const char of fiveDsCharacters) {
    assert.equal(char.decks.length, 10, `Character ${char.name} must have exactly 10 decks`);

    for (const deck of char.decks) {
      totalDecksChecked++;

      // Main deck count: 40-60
      assert.ok(
        deck.mainCards.length >= 40 && deck.mainCards.length <= 60,
        `Deck "${deck.name}" for ${char.name} has invalid main deck count: ${deck.mainCards.length}`,
      );

      // Extra deck count: <= 15
      assert.ok(
        !deck.extraCards || deck.extraCards.length <= 15,
        `Deck "${deck.name}" for ${char.name} has invalid extra deck count: ${deck.extraCards?.length}`,
      );

      // YDK file exists
      const ydkPath = path.resolve(ROOT_DIR, deck.ydkPath);
      assert.ok(fs.existsSync(ydkPath), `YDK file must exist at ${ydkPath}`);
      const ydkContent = fs.readFileSync(ydkPath, 'utf-8');
      assert.ok(ydkContent.includes('#main'), `YDK for "${deck.name}" must contain #main section`);
      assert.ok(ydkContent.includes('#extra'), `YDK for "${deck.name}" must contain #extra section`);

      // All card IDs exist in cards.cdb
      for (const cardId of deck.mainCards) {
        assert.ok(
          checkDbStmt.get(cardId),
          `Card ${cardId} in deck "${deck.name}" (${char.name}) must exist in cards.cdb`,
        );
      }
      if (deck.extraCards) {
        for (const cardId of deck.extraCards) {
          assert.ok(
            checkDbStmt.get(cardId),
            `Extra Card ${cardId} in deck "${deck.name}" (${char.name}) must exist in cards.cdb`,
          );
        }
      }
    }
  }

  assert.equal(totalDecksChecked, 200, 'Must have verified exactly 200 5D\'s decks');
  console.log(`  ✓ All 200 5D's decks verified (40+ Main, <=15 Extra, YDKs present, valid card IDs).`);

  // Check prebuilt-decks.json
  const prebuiltDecks: CustomDeck[] = JSON.parse(fs.readFileSync(PREBUILT_DECKS_PATH, 'utf-8'));
  const fiveDsPrebuilt = prebuiltDecks.filter((d) => d.category === 'character-5ds');
  assert.equal(fiveDsPrebuilt.length, 200, 'prebuilt-decks.json must contain exactly 200 character-5ds decks');
  console.log('  ✓ prebuilt-decks.json contains 200 character-5ds decks.');

  // ---------------------------------------------------------------------------
  // Test 4: In-Engine Synchro Summon Verification with ocgcore-wasm
  // ---------------------------------------------------------------------------
  console.log('\nTest 4: In-Engine Synchro Summoning with ocgcore-wasm...');
  await duelEngineService.init();

  duelEngineService.startNewDuel({
    player0Deck: Array(40).fill(25652259), // Sparks dummy cards
    player0ExtraDeck: [60800381], // Junk Warrior (Level 5 Synchro)
    player0Monsters: [
      { code: 63977008, sequence: 0 }, // Junk Synchron (Level 3 Tuner)
      { code: 9365703, sequence: 1 },  // Speed Warrior (Level 2 Non-Tuner)
    ],
    player1Deck: Array(40).fill(25652259),
    humanPlayerId: 0,
    noShuffle: true,
  });

  const prompt = (duelEngineService as any).lastPromptMessage;
  assert.equal(prompt?.type, OcgMessageType.SELECT_IDLECMD, 'Initial prompt must be SELECT_IDLECMD');

  // Verify Junk Warrior is available for Synchro Special Summon
  const spSummons = prompt.special_summons || [];
  const junkWarriorOption = spSummons.find((s: any) => s.code === 60800381);
  assert.ok(
    junkWarriorOption,
    'Junk Warrior (60800381) must be available in special_summons list for Synchro Summon',
  );
  console.log('  ✓ Engine detects Synchro Summon opportunity for Junk Warrior (Level 5 = 3 + 2).');

  // Perform the Special Summon command via sendResponse
  const spIndex = spSummons.indexOf(junkWarriorOption);
  duelEngineService.sendResponse({
    type: OcgResponseType.SELECT_IDLECMD,
    action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
    index: spIndex,
  });

  // ocgcore may prompt for material selection, position, or auto-resolve
  let currentPrompt = (duelEngineService as any).lastPromptMessage;
  let steps = 0;
  while (currentPrompt && currentPrompt.type !== OcgMessageType.SELECT_IDLECMD && steps < 10) {
    steps++;
    if (currentPrompt.type === OcgMessageType.SELECT_CARD) {
      const count = currentPrompt.min || 1;
      const indices = Array.from({ length: count }, (_, i) => i);
      duelEngineService.sendResponse({
        type: OcgResponseType.SELECT_CARD,
        indices,
      });
    } else if (currentPrompt.type === OcgMessageType.SELECT_UNSELECT_CARD) {
      duelEngineService.sendResponse({
        type: OcgResponseType.SELECT_UNSELECT_CARD,
        index: 0,
      });
    } else if (currentPrompt.type === OcgMessageType.SELECT_POSITION) {
      duelEngineService.sendResponse({
        type: OcgResponseType.SELECT_POSITION,
        position: 1, // Face-up attack
      });
    } else {
      break;
    }
    currentPrompt = (duelEngineService as any).lastPromptMessage;
  }

  // Verify board state has Junk Warrior summoned
  const boardState = duelEngineService.getBoardState();
  const allMonsters = [
    ...boardState.userField.monsterZones.filter(Boolean),
    ...boardState.extraMonsterZones.filter(Boolean),
  ];
  const hasJunkWarrior = allMonsters.some((m: any) => m?.code === 60800381);
  assert.ok(hasJunkWarrior, 'Junk Warrior must be on the board after Synchro Summon');
  console.log('  ✓ Junk Warrior successfully Synchro Summoned to the field!');

  console.log('  ✓ Synchro Summon sequence completed without engine error or crash.');

  console.log('\n===============================================================');
  console.log('🎉 ALL SYNCHRO & 5D\'S ROSTER TESTS PASSED CLEANLY (100% SUCCESS)!');
  console.log('===============================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
