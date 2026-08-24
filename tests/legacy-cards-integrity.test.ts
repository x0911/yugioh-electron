import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import Database from 'better-sqlite3';
import { CardReaderService } from '../src/main/engine/cardReader';
import { ScriptReaderService } from '../src/main/engine/scriptReader';

test('DM & GX Legacy Support Cards Integrity & Script Reader Test Suite', async (t) => {
  const cdbPath = path.resolve('resources/cards.cdb');
  const db = new Database(cdbPath, { readonly: true });
  const cardReader = new CardReaderService(cdbPath);
  const scriptReader = new ScriptReaderService();

  await t.test('1. Verify Target Skull Servant Deck cards in Database & CardReader', () => {
    const skullServantDeckCodes = [
      32274490, // Skull Servant
      52467217, // Gozuki
      92826944, // Mezuki
      14536035, // Dark Grepher
      90243945, // Wightprincess
      40991587, // The Lady in Wight
      22339232, // Wightmare
      57473560, // Wightprince
      36021814, // King of the Skull Servants
      52512994, // Kasha
      49238328, // Pot of Extravagance
      81439173, // Foolish Burial
      74117290, // Dark World Dealings
      83764719, // Monster Reborn
      2295440,  // One for One
      1475311,  // Allure of Darkness
      24094653, // Polymerization
      48976825, // Burial from a Different Dimension
      12247206, // Inferno Reckless Summon
      10045474, // Infinite Impermanence
    ];

    for (const code of skullServantDeckCodes) {
      const card = cardReader.getCardRecord(code);
      assert.ok(card, `Card ${code} must exist in CardReaderService`);
      assert.ok(card.name && card.name.length > 0, `Card ${code} must have a valid name`);
      assert.ok(card.type > 0, `Card ${code} must have a valid type bitmask`);

      // Verify Lua script loads for non-normal cards
      if (code !== 32274490) {
        const script = scriptReader.readScript(`c${code}.lua`);
        assert.ok(script && script.length > 0, `Script for ${card.name} (c${code}.lua) must load successfully`);
      }
    }
  });

  await t.test('2. Verify Major DM Legacy Support Archetypes', () => {
    const dmCards = [
      { code: 97631303, name: "Magicians' Souls" },
      { code: 47222536, name: 'Dark Magical Circle' },
      { code: 48680970, name: 'Eternal Soul' },
      { code: 50237654, name: 'The Dark Magicians' },
      { code: 38517737, name: 'Blue-Eyes Alternative White Dragon' },
      { code: 66961194, name: 'Dictator of D.' },
      { code: 55410871, name: 'Blue-Eyes Chaos MAX Dragon' },
      { code: 43175858, name: 'Toon Kingdom' },
      { code: 42166000, name: 'Egyptian God Slime' },
      { code: 8505920, name: 'Gate Guardians Combined' },
      { code: 73714736, name: 'Flame Swordsrealm' },
    ];

    for (const item of dmCards) {
      const card = cardReader.getCardRecord(item.code);
      assert.ok(card, `DM Legacy Card ${item.name} (${item.code}) must exist in database`);
      assert.equal(card.name, item.name);
      const script = scriptReader.readScript(`c${item.code}.lua`);
      assert.ok(script && script.length > 0, `Script for ${item.name} (c${item.code}.lua) must load`);
    }
  });

  await t.test('3. Verify Major GX Legacy Support Archetypes', () => {
    const gxCards = [
      { code: 22908820, name: 'Elemental HERO Sunrise' },
      { code: 52947044, name: 'Fusion Destiny' },
      { code: 58481572, name: 'Masked HERO Dark Law' },
      { code: 23893227, name: 'Cyber Dragon Core' },
      { code: 5370235, name: 'Cyberdark Chimera' },
      { code: 80453041, name: 'Phantom of Yubel' },
      { code: 10938846, name: 'Rainbow Bridge of the Heart' },
      { code: 44052074, name: 'Ancient Gear Catapult' },
      { code: 46412900, name: 'Volcanic Emperor' },
      { code: 18940556, name: 'Ultimate Conductor Tyranno' },
    ];

    for (const item of gxCards) {
      const card = cardReader.getCardRecord(item.code);
      assert.ok(card, `GX Legacy Card ${item.name} (${item.code}) must exist in database`);
      assert.equal(card.name, item.name);
      const script = scriptReader.readScript(`c${item.code}.lua`);
      assert.ok(script && script.length > 0, `Script for ${item.name} (c${item.code}.lua) must load`);
    }
  });

  await t.test('4. Verify Database Scale and Integrity (>4000 cards, 0 corrupted names)', () => {
    const totalCount = (db.prepare('SELECT COUNT(*) as c FROM datas').get() as any).c;
    assert.ok(totalCount >= 4000, `Total cards in cards.cdb should be >= 4000, found: ${totalCount}`);

    const nameless = db.prepare("SELECT COUNT(*) as c FROM texts WHERE name IS NULL OR name = ''").get() as any;
    assert.equal(nameless.c, 0, 'No cards should have null or empty names in texts table');
  });

  db.close();
});
