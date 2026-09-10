import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const ROOT_DIR = process.cwd();
const WHITELIST_SETS_PATH = path.join(ROOT_DIR, 'data/set-code-whitelist.json');
const POOL_WHITELIST_PATH = path.join(ROOT_DIR, 'data/card-pool-whitelist.json');
const TARGET_CDB_PATH = path.join(ROOT_DIR, 'resources/cards.cdb');
const OFFICIAL_SCRIPTS_DIR = path.join(ROOT_DIR, 'resources/scripts/official');
const TEMP_CDB_PATH = path.join(ROOT_DIR, 'temp_master_cards.cdb');
const TEMP_YGO_PATH = path.join(ROOT_DIR, 'temp_ygoprodeck.json');

// Ensure scripts directory exists
if (!fs.existsSync(OFFICIAL_SCRIPTS_DIR)) {
  fs.mkdirSync(OFFICIAL_SCRIPTS_DIR, { recursive: true });
}

interface SetInfo {
  code: string;
  name: string;
  date: string;
  type: string;
}

interface SetWhitelist {
  DM: SetInfo[];
  GX: SetInfo[];
  '5Ds': SetInfo[];
}

interface YgoprodeckCardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_price: string;
}

interface YgoprodeckCard {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  card_sets?: YgoprodeckCardSet[];
}

interface CardRow {
  id: number;
  ot: number;
  alias: number;
  setcode: bigint | number;
  type: number;
  atk: number;
  def: number;
  level: number;
  race: number;
  attribute: number;
  category: number;
  name: string;
  desc: string;
  str1?: string;
  str2?: string;
  str3?: string;
  str4?: string;
  str5?: string;
  str6?: string;
  str7?: string;
  str8?: string;
  str9?: string;
  str10?: string;
  str11?: string;
  str12?: string;
  str13?: string;
  str14?: string;
  str15?: string;
  str16?: string;
}

// 5D's Iconic Signer & Anime Aces to explicitly guarantee
const ICONIC_5DS_ALLOWLIST = new Set<number>([
  44508094, // Stardust Dragon
  60800381, // Junk Warrior
  24696029, // Shooting Star Dragon
  50091196, // Formula Synchron
  63977008, // Junk Synchron
  20932152, // Quickdraw Synchron
  3989465,  // Nitro Warrior
  6387204,  // Junk Archer
  37412656, // Junk Berserker
  21155323, // Junk Destroyer
  56655675, // Drill Warrior
  70902743, // Red Dragon Archfiend
  97489701, // Red Nova Dragon
  85489096, // Crimson Resonator
  43702890, // Vice Dragon
  732302,   // Exploder Dragonwing
  69031175, // Blackwing - Armor Master
  7691398,  // Blackwing - Armed Wing
  33236860, // Blackwing - Silverwind the Ascendant
  9012916,  // Black-Winged Dragon
  34206604, // Blackwing - Gale the Whirlwind
  63854005, // Blackwing - Bora the Spear
  81994591, // Blackwing - Sirocco the Dawn
  49003716, // Blackwing - Blizzard the Far North
  72714392, // Blackwing - Vayu the Emblem of Honor
  73580471, // Black Rose Dragon
  37478723, // Splendid Rose
  46548598, // Queen of Thorns
  2694423,  // Botanical Lion
  48686504, // Lonefire Blossom
  1174075,  // Spore
  84013237, // Glow-Up Bulb
  15341821, // Dandylion
  2403771,  // Power Tool Dragon
  25165047, // Life Stream Dragon
  4941482,  // Morphtronic Celfon
  44447466, // Morphtronic Boomboxen
  55749927, // Double Tool C&D
  25862681, // Ancient Fairy Dragon
  50920465, // Kuribon
  1929294,  // Regulus
  72896720, // Infernity Doom Dragon
  95453143, // Hundred-Eyes Dragon
  99177923, // Infernity Archfiend
  85475641, // Infernity Mirage
  56585806, // Infernity Necromancer
  74402414, // Infernity Barrier
  12598370, // Infernity Launcher
  51447164, // T.G. Blade Blaster
  97836201, // T.G. Halberd Cannon
  98558751, // T.G. Wonder Magician
  90953320, // T.G. Hyper Librarian
  44952065, // T.G. Striker
  60242619, // T.G. Warwolf
  45103815, // Chevalier de Fleur
  84815190, // Baronne de Fleur
  16353197, // Centaur Mina
  72443568, // Sorciere de Fleur
  19642774, // Fleur Synchron
  8967776,  // Sephylon, the Ultimate Timelord
  23064604, // Metaion, the Timelord
  91440242, // Kamion, the Timelord
  33015627, // Sandaion, the Timelord
  60967717, // Michion, the Timelord
  87383137, // Zaphion, the Timelord
  16638212, // Sadion, the Timelord
  57482479, // Gabrion, the Timelord
  84143008, // Raphion, the Timelord
  20509030, // Hailon, the Timelord
  50321796, // Brionac, Dragon of the Ice Barrier
  52687916, // Trishula, Dragon of the Ice Barrier
  73915051, // Goyo Guardian
  88033975, // Colossal Fighter
  95685352, // Thought Ruler Archfiend
  97268402, // Effect Veiler
  33420078, // Plaguespreader Zombie
  9411399,  // Krebons
  73915051, // Emergency Teleport
  44095762, // Mirror Force
  5318639,  // Mystical Space Typhoon
  70828912, // Heavy Storm
  68005187, // Solemn Judgment
  26202165, // Sangan
  23205979, // Snipe Hunter
  32807846, // Reinforcement of the Army
  41420027, // Solemn Warning
]);

async function downloadFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
}

async function downloadScriptWithRetry(cardId: number): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/ProjectIgnis/CardScripts/master/official/c${cardId}.lua`;
  try {
    const res = await fetch(url);
    if (res.status === 404 || !res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function run() {
  console.log('='.repeat(70));
  console.log('  5D\'S ERA CARD POOL & DATABASE IMPORT');
  console.log('='.repeat(70));

  // 1. Download BabelCDB master if missing
  if (!fs.existsSync(TEMP_CDB_PATH)) {
    console.log('\n[1/6] Downloading master BabelCDB cards.cdb...');
    await downloadFile('https://raw.githubusercontent.com/ProjectIgnis/BabelCDB/master/cards.cdb', TEMP_CDB_PATH);
    console.log('      ✓ Master BabelCDB downloaded.');
  } else {
    console.log('\n[1/6] Using cached master BabelCDB.');
  }

  // 2. Download YGOPRODeck metadata if missing
  if (!fs.existsSync(TEMP_YGO_PATH)) {
    console.log('\n[2/6] Fetching YGOPRODeck card metadata...');
    await downloadFile('https://db.ygoprodeck.com/api/v7/cardinfo.php', TEMP_YGO_PATH);
    console.log('      ✓ YGOPRODeck metadata downloaded.');
  } else {
    console.log('\n[2/6] Using cached YGOPRODeck metadata.');
  }

  // 3. Load set codes whitelist
  console.log('\n[3/6] Reading 5D\'s set whitelist...');
  const whitelistData: SetWhitelist = JSON.parse(fs.readFileSync(WHITELIST_SETS_PATH, 'utf-8'));
  const fiveDsSetCodes = new Set(whitelistData['5Ds'].map((s) => s.code.toUpperCase()));
  console.log(`      ✓ Loaded ${fiveDsSetCodes.size} 5D's set codes.`);

  // 4. Load YGOPRODeck card map
  const rawYgo = JSON.parse(fs.readFileSync(TEMP_YGO_PATH, 'utf-8'));
  const ygoMap = new Map<number, YgoprodeckCard>();
  for (const c of rawYgo.data as YgoprodeckCard[]) {
    ygoMap.set(c.id, c);
  }

  // 5. Open Master CDB and Target CDB
  console.log('\n[4/6] Filtering cards for 5D\'s era...');
  const masterDb = new Database(TEMP_CDB_PATH, { readonly: true });
  const targetDb = new Database(TARGET_CDB_PATH);

  const existingIds = new Set<number>(
    (targetDb.prepare('SELECT id FROM datas').all() as any[]).map((r) => r.id)
  );
  console.log(`      ✓ Current cards in resources/cards.cdb: ${existingIds.size}`);

  const allMasterCards: CardRow[] = masterDb.prepare(`
    SELECT d.*, t.name, t.desc, t.str1, t.str2, t.str3, t.str4, t.str5, t.str6, t.str7, t.str8, t.str9, t.str10, t.str11, t.str12, t.str13, t.str14, t.str15, t.str16
    FROM datas d JOIN texts t ON d.id = t.id
  `).all() as CardRow[];

  const toInsert: CardRow[] = [];
  const toInsertMap = new Map<number, CardRow>();

  // Filter types: Exclude XYZ (0x800000), Pendulum (0x1000000), Link (0x4000000)
  const TYPE_XYZ = 0x800000;
  const TYPE_PENDULUM = 0x1000000;
  const TYPE_LINK = 0x4000000;

  for (const card of allMasterCards) {
    if ((card.type & TYPE_XYZ) !== 0 || (card.type & TYPE_PENDULUM) !== 0 || (card.type & TYPE_LINK) !== 0) {
      continue;
    }

    let is5Ds = false;

    if (ICONIC_5DS_ALLOWLIST.has(card.id)) {
      is5Ds = true;
    } else {
      const ygo = ygoMap.get(card.id);
      if (ygo && ygo.card_sets && ygo.card_sets.length > 0) {
        for (const set of ygo.card_sets) {
          const prefix = set.set_code.split('-')[0].toUpperCase();
          if (fiveDsSetCodes.has(prefix)) {
            is5Ds = true;
            break;
          }
        }
      }
    }

    if (is5Ds && !existingIds.has(card.id) && !toInsertMap.has(card.id)) {
      toInsert.push(card);
      toInsertMap.set(card.id, card);
    }
  }

  console.log(`      ✓ Found ${toInsert.length} new 5D's cards to import!`);

  // 6. Insert into resources/cards.cdb
  console.log('\n[5/6] Inserting into resources/cards.cdb...');
  const insertDataStmt = targetDb.prepare(`
    INSERT OR REPLACE INTO datas (id, ot, alias, setcode, type, atk, def, level, race, attribute, category)
    VALUES (@id, @ot, @alias, @setcode, @type, @atk, @def, @level, @race, @attribute, @category)
  `);
  const insertTextStmt = targetDb.prepare(`
    INSERT OR REPLACE INTO texts (id, name, desc, str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14, str15, str16)
    VALUES (@id, @name, @desc, @str1, @str2, @str3, @str4, @str5, @str6, @str7, @str8, @str9, @str10, @str11, @str12, @str13, @str14, @str15, @str16)
  `);

  const insertTx = targetDb.transaction((cards: CardRow[]) => {
    for (const card of cards) {
      insertDataStmt.run({
        id: card.id,
        ot: card.ot,
        alias: card.alias,
        setcode: Number(card.setcode),
        type: card.type,
        atk: card.atk,
        def: card.def,
        level: card.level,
        race: card.race,
        attribute: card.attribute,
        category: card.category,
      });

      insertTextStmt.run({
        id: card.id,
        name: card.name,
        desc: card.desc,
        str1: card.str1 ?? '',
        str2: card.str2 ?? '',
        str3: card.str3 ?? '',
        str4: card.str4 ?? '',
        str5: card.str5 ?? '',
        str6: card.str6 ?? '',
        str7: card.str7 ?? '',
        str8: card.str8 ?? '',
        str9: card.str9 ?? '',
        str10: card.str10 ?? '',
        str11: card.str11 ?? '',
        str12: card.str12 ?? '',
        str13: card.str13 ?? '',
        str14: card.str14 ?? '',
        str15: card.str15 ?? '',
        str16: card.str16 ?? '',
      });
    }
  });

  insertTx(toInsert);

  const finalCount = (targetDb.prepare('SELECT COUNT(*) as count FROM datas').get() as any).count;
  console.log(`      ✓ resources/cards.cdb updated! Total cards now: ${finalCount}`);

  // 7. Update data/card-pool-whitelist.json
  console.log('\n[6/6] Updating data/card-pool-whitelist.json and syncing Lua scripts...');
  const poolWhitelist = JSON.parse(fs.readFileSync(POOL_WHITELIST_PATH, 'utf-8'));

  for (const card of toInsert) {
    const ygo = ygoMap.get(card.id);
    poolWhitelist[String(card.id)] = {
      id: card.id,
      name: card.name,
      era: '5Ds',
      type: ygo ? ygo.type : 'Monster',
      atk: card.atk >= 0 ? card.atk : undefined,
      def: card.def >= 0 ? card.def : undefined,
      level: card.level > 0 ? (card.level & 0xff) : undefined,
      race: ygo ? ygo.race : String(card.race),
      attribute: ygo?.attribute,
      hasScript: true,
    };
  }

  fs.writeFileSync(POOL_WHITELIST_PATH, JSON.stringify(poolWhitelist, null, 2), 'utf-8');
  console.log(`      ✓ Whitelist updated with ${Object.keys(poolWhitelist).length} total cards.`);

  // 8. Download missing Lua scripts
  console.log('\nSyncing Lua scripts for newly imported 5D\'s cards...');
  const newCardIds = toInsert.map((c) => c.id);
  const concurrency = 20;
  let downloadedScripts = 0;

  for (let i = 0; i < newCardIds.length; i += concurrency) {
    const batch = newCardIds.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (id) => {
        const scriptPath = path.join(OFFICIAL_SCRIPTS_DIR, `c${id}.lua`);
        if (fs.existsSync(scriptPath)) return;

        const content = await downloadScriptWithRetry(id);
        if (content) {
          fs.writeFileSync(scriptPath, content, 'utf-8');
          downloadedScripts++;
        }
      })
    );
    if ((i + concurrency) % 200 === 0 || i + concurrency >= newCardIds.length) {
      console.log(`      [Scripts] Processed ${Math.min(i + concurrency, newCardIds.length)} / ${newCardIds.length}... (Downloaded: ${downloadedScripts})`);
    }
  }

  console.log(`      ✓ Synced ${downloadedScripts} new Lua scripts.`);

  masterDb.close();
  targetDb.close();

  console.log('\n🎉 5D\'s Card Pool & Database import completed successfully!\n');
}

run().catch((err) => {
  console.error('Fatal error importing 5Ds cards:', err);
  process.exit(1);
});
