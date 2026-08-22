import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const WHITELIST_SETS_PATH = path.join(rootDir, 'data/set-code-whitelist.json');
const OUTPUT_WHITELIST_PATH = path.join(rootDir, 'data/card-pool-whitelist.json');
const OUTPUT_CDB_PATH = path.join(rootDir, 'resources/cards.cdb');
const RESOURCES_SCRIPTS_DIR = path.join(rootDir, 'resources/scripts');
const RESOURCES_OFFICIAL_SCRIPTS_DIR = path.join(rootDir, 'resources/scripts/official');
const SPIKE_SCRIPTS_DIR = path.join(rootDir, 'tools/engine-spike/scripts');

// Iconic anime staples that might not have standard 2002-2008 set codes or are special releases
const ICONIC_ALLOWLIST_MAP = new Map<number, 'DM' | 'GX'>([
  // Egyptian Gods & Divine Support (DM)
  [10000000, 'DM'], // Obelisk the Tormentor
  [10000010, 'DM'], // The Winged Dragon of Ra
  [10000020, 'DM'], // Slifer the Sky Dragon
  [10000040, 'DM'], // Holactie the Creator of Light
  [10000080, 'DM'], // The Winged Dragon of Ra - Sphere Mode
  [10000090, 'DM'], // The Winged Dragon of Ra - Immortal Phoenix
  [269012, 'DM'],   // Mound of the Bound Creator
  [39913299, 'DM'], // The True Name
  [5253985, 'DM'],  // Soul Crossing
  [42469671, 'DM'], // Thunderforce Attack
  [79868386, 'DM'], // Fist of Fate
  [4059313, 'DM'],  // Blaze Cannon
  [69456283, 'DM'], // Millennium Revelation
  [95286165, 'DM'], // Ancient Chant
  [71703785, 'DM'], // Palladium Oracle Mahad
  [42006475, 'DM'], // Palladium Oracle Mana

  // Waking the Dragons (DM Season 4)
  [1784686, 'DM'],  // The Eye of Timaeus
  [11082056, 'DM'], // The Fang of Critias
  [46232525, 'DM'], // The Claw of Hermos
  [89397517, 'DM'], // Legend of Heart
  [75380687, 'DM'], // Amulet Dragon
  [43892408, 'DM'], // Dark Magician Girl the Dragon Knight
  [84687358, 'DM'], // Mirror Force Dragon
  [22804644, 'DM'], // Doom Virus Dragon
  [58293343, 'DM'], // Tyrant Burst Dragon
  [19747827, 'DM'], // Red-Eyes Black Dragon Sword
  [46354113, 'DM'], // Rocket Hermos Cannon
  [83743222, 'DM'], // Goddess Bow
  [10960419, 'DM'], // Time Magic Hammer
  [48179391, 'DM'], // The Seal of Orichalcos
  [7634581, 'DM'],  // Orichalcos Shunoros
  [34022290, 'DM'], // Guardian Eatos
  [18175965, 'DM'], // Guardian Dreadscythe
  [54447022, 'DM'], // Soul Charge
  [16404809, 'DM'], // Kuribandit
  [26439287, 'DM'], // Kuribabylon

  // The Dark Side of Dimensions (DSOD Movie Pack - DM Sequel)
  [55410871, 'DM'], // Blue-Eyes Chaos MAX Dragon
  [56532353, 'DM'], // Neo Blue-Eyes Ultimate Dragon
  [38517737, 'DM'], // Blue-Eyes Alternative White Dragon
  [21082832, 'DM'], // Chaos Form
  [22804410, 'DM'], // Deep-Eyes White Dragon
  [71525232, 'DM'], // Gandora-X the Dragon of Demolition
  [3428069, 'DM'],  // Buster Blader, the Destruction Swordmaster
  [45531624, 'DM'], // Celtic Guard of Noble Arms
  [47222536, 'DM'], // Dark Magical Circle
  [48680970, 'DM'], // Eternal Soul
  [7922915, 'DM'],  // Magician Navigation
  [30603688, 'DM'], // Magicians' Defense
  [15256925, 'DM'], // Magician's Robe
  [36414436, 'DM'], // Magician's Rod
  [23995346, 'DM'], // Blue-Eyes Alternative Ultimate Dragon
  [728264, 'DM'],   // Blue-Eyes Abyss Dragon
  [93717133, 'DM'], // Dragonic Tactics
  [87025074, 'DM'], // Dragon Revival Rhapsody
  [8240199, 'DM'],  // The Bingo Machine, Go!!!
  [66970002, 'DM'], // Dragon Shrine
  [39284521, 'DM'], // Silver's Cry
  [71039903, 'DM'], // Return of the Dragon Lords

  // Yu-Gi-Oh! R Manga (The Wicked Gods)
  [62180201, 'DM'], // The Wicked Dreadroot
  [21208154, 'DM'], // The Wicked Avatar
  [57793869, 'DM'], // The Wicked Eraser
  [50321796, 'DM'], // Divine Evolution

  // GX Anime & Special Edition Bosses
  [43378048, 'GX'], // Armityle the Chaos Phantasm
  [5861892, 'GX'],  // Arcana Force EX - The Light Ruler
  [50287060, 'GX'], // Arcana Force EX - The Dark Ruler
  [88264978, 'GX'], // Red-Eyes Darkness Metal Dragon
  [60417395, 'GX'], // Darkness Neosphere
  [97811903, 'GX'], // Clear Vice Dragon
  [33900648, 'GX'], // Clear World
  [76547525, 'GX'], // Cyber Larva
  [94886282, 'GX'], // Charge of the Light Brigade
  [63941215, 'GX'], // Dimension Fusion

  // GX Manga HERO & Cyber Lines
  [40854197, 'GX'], // Elemental HERO Absolute Zero
  [22061412, 'GX'], // Elemental HERO The Shining
  [3642509, 'GX'],  // Elemental HERO Great Tornado
  [16304628, 'GX'], // Elemental HERO Gaia
  [1945387, 'GX'],  // Elemental HERO Nova Master
  [33574806, 'GX'], // Elemental HERO Escuridao
  [25366484, 'GX'], // Elemental HERO Core
  [58481572, 'GX'], // Masked HERO Dark Law
  [29095552, 'GX'], // Masked HERO Acid
  [62624486, 'GX'], // Masked HERO Dian
  [10920352, 'GX'], // Masked HERO Vapor
  [58147549, 'GX'], // Masked HERO Goka
  [50608164, 'GX'], // Masked HERO Koga
  [59642500, 'GX'], // Masked HERO Anki
  [22093838, 'GX'], // Masked HERO Blast
  [21143940, 'GX'], // Mask Change
  [45898858, 'GX'], // Mask Change II
  [18094166, 'GX'], // Vision HERO Faris
  [22865492, 'GX'], // Vision HERO Increase
  [27780618, 'GX'], // Vision HERO Vyon
  [46759931, 'GX'], // Vision HERO Trinity
  [45170821, 'GX'], // Vision HERO Adoration
  [82697428, 'GX'], // Vision HERO Witch Raider
  [93600443, 'GX'], // Vision HERO Gravito
  [69610326, 'GX'], // Vision HERO Poisoner
  [3580032, 'GX'],  // Vision HERO Minimum Ray
  [60082869, 'GX'], // Destiny HERO - Dystopia
  [90579153, 'GX'], // Destiny HERO - Dangerous
  [74117290, 'GX'], // Destiny HERO - Dominance
  [41302052, 'GX'], // Destiny HERO - Celestial
  [78057208, 'GX'], // Destiny HERO - Decider
  [17124316, 'GX'], // Destiny HERO - Dynatag
  [51405049, 'GX'], // Cyber Repair Plant
  [29934351, 'GX'], // Cyber Emergency
  [58494728, 'GX'], // Cyberload Fusion
  [70243695, 'GX'], // Cyber Dragon Nachster
  [46724542, 'GX'], // Cyber Dragon Herz
  [30427699, 'GX'], // Cyber Dragon Core
  [56364287, 'GX'], // Cyber Dragon Drei
  [63224564, 'GX'], // Cyber Dragon Vier
  [3510565, 'GX'],  // Chimeratech Rampage Dragon
  [74157028, 'GX'], // Chimeratech Megafleet Dragon
  [10028593, 'GX'], // Cyber Eternal
  [43791861, 'GX'], // Cybernetic Overflow
  [29491031, 'GX'], // Cybernetic Revolution
  [40227329, 'GX'], // Super Strident Blaze
]);

interface SetInfo {
  code: string;
  name: string;
  date: string;
  type: string;
}

interface SetWhitelist {
  DM: SetInfo[];
  GX: SetInfo[];
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

interface FilteredCardEntry {
  id: number;
  name: string;
  era: 'DM' | 'GX';
  type: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  hasScript?: boolean;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

function copyDirectoryFiles(srcDir: string, destDir: string): void {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'official') {
        copyDirectoryFiles(srcPath, destPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.lua')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function downloadScriptWithRetry(cardId: number): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/ProjectIgnis/CardScripts/master/official/c${cardId}.lua`;
  try {
    const res = await fetch(url);
    if (res.status === 404) {
      // Normal monsters and cards with engine-native mechanics don't have scripts
      return null;
    }
    if (!res.ok) {
      return null;
    }
    return await res.text();
  } catch {
    return null;
  }
}

async function downloadBatchScripts(
  cardIds: number[],
  aliasMap?: Map<number, number>,
  concurrency = 15,
): Promise<{ downloaded: number; notFound: number }> {
  let downloaded = 0;
  let notFound = 0;

  for (let i = 0; i < cardIds.length; i += concurrency) {
    const batch = cardIds.slice(i, i + concurrency);
    const promises = batch.map(async (id) => {
      const scriptPath = path.join(RESOURCES_OFFICIAL_SCRIPTS_DIR, `c${id}.lua`);
      if (fs.existsSync(scriptPath)) {
        return;
      }

      let content = await downloadScriptWithRetry(id);
      const alias = aliasMap?.get(id);

      // If id script not found, try alias script
      if (!content && alias && alias > 0) {
        const aliasPath = path.join(RESOURCES_OFFICIAL_SCRIPTS_DIR, `c${alias}.lua`);
        if (fs.existsSync(aliasPath)) {
          content = fs.readFileSync(aliasPath, 'utf-8');
        } else {
          content = await downloadScriptWithRetry(alias);
          if (content) {
            fs.writeFileSync(aliasPath, content, 'utf-8');
            downloaded++;
          }
        }
      }

      if (content) {
        fs.writeFileSync(scriptPath, content, 'utf-8');
        downloaded++;
      } else {
        notFound++;
      }
    });

    await Promise.all(promises);
    if ((i + concurrency) % 300 === 0 || i + concurrency >= cardIds.length) {
      console.log(
        `      [Scripts Progress] Processed ${Math.min(i + concurrency, cardIds.length)} / ${cardIds.length} cards...`,
      );
    }
  }

  return { downloaded, notFound };
}

export async function buildCardPool(): Promise<void> {
  console.log('='.repeat(70));
  console.log('  YU-GI-OH! DESKTOP DUEL — CARD POOL FILTER PIPELINE');
  console.log('='.repeat(70));

  // 1. Read Set Code Whitelist
  console.log('\n[1/6] Reading Set Code Whitelist...');
  const whitelistData: SetWhitelist = JSON.parse(fs.readFileSync(WHITELIST_SETS_PATH, 'utf-8'));

  const dmSetCodes = new Set(whitelistData.DM.map((s) => s.code.toUpperCase()));
  const gxSetCodes = new Set(whitelistData.GX.map((s) => s.code.toUpperCase()));
  console.log(
    `      ✓ Loaded ${dmSetCodes.size} DM set codes and ${gxSetCodes.size} GX set codes.`,
  );

  // 2. Fetch full BabelCDB cards.cdb
  console.log('\n[2/6] Downloading ProjectIgnis/BabelCDB master cards.cdb...');
  const cdbBuffer = await fetchBuffer(
    'https://raw.githubusercontent.com/ProjectIgnis/BabelCDB/master/cards.cdb',
  );
  const tempCdbPath = path.join(rootDir, 'temp_raw_cards.cdb');
  fs.writeFileSync(tempCdbPath, cdbBuffer);
  console.log(
    `      ✓ Downloaded master cards.cdb (${(cdbBuffer.length / 1024 / 1024).toFixed(2)} MB).`,
  );

  const rawDb = new Database(tempCdbPath, { readonly: true });

  // 3. Fetch YGOPRODeck card metadata for set association and stats
  console.log('\n[3/6] Fetching YGOPRODeck card metadata...');
  const ygoprodeckData = await fetchJson<{ data: YgoprodeckCard[] }>(
    'https://db.ygoprodeck.com/api/v7/cardinfo.php',
  );
  console.log(`      ✓ Received metadata for ${ygoprodeckData.data.length} cards.`);

  // Map card metadata by ID
  const cardMap = new Map<number, YgoprodeckCard>();
  for (const card of ygoprodeckData.data) {
    cardMap.set(card.id, card);
  }

  // 4. Filter cards matching DM & GX Whitelist
  console.log('\n[4/6] Filtering cards for DM & GX anime eras...');
  const filteredWhitelist: Record<string, FilteredCardEntry> = {};
  const matchingCardIds = new Set<number>();

  const rawDatas = rawDb
    .prepare(
      'SELECT d.*, t.name, t.desc, t.str1, t.str2, t.str3, t.str4, t.str5, t.str6, t.str7, t.str8, t.str9, t.str10, t.str11, t.str12, t.str13, t.str14, t.str15, t.str16 FROM datas d JOIN texts t ON d.id = t.id',
    )
    .all() as {
    id: number;
    ot: number;
    alias: number;
    setcode: number | bigint;
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
  }[];

  const filteredRows: typeof rawDatas = [];

  for (const row of rawDatas) {
    const cardId = row.id;
    const ygoCard = cardMap.get(cardId);

    // Filter out modern card mechanics (Synchro, Xyz, Pendulum, Link)
    const TYPE_SYNCHRO = 0x2000;
    const TYPE_XYZ = 0x800000;
    const TYPE_PENDULUM = 0x1000000;
    const TYPE_LINK = 0x4000000;
    if (
      row.type & TYPE_SYNCHRO ||
      row.type & TYPE_XYZ ||
      row.type & TYPE_PENDULUM ||
      row.type & TYPE_LINK
    ) {
      continue;
    }

    let isMatched = false;
    let era: 'DM' | 'GX' = 'DM';

    if (ICONIC_ALLOWLIST_MAP.has(cardId)) {
      isMatched = true;
      era = ICONIC_ALLOWLIST_MAP.get(cardId)!;
    } else if (ygoCard && ygoCard.card_sets && ygoCard.card_sets.length > 0) {
      // Check if any set code belongs to DM or GX
      let isDM = false;
      let isGX = false;

      for (const set of ygoCard.card_sets) {
        const prefix = set.set_code.split('-')[0].toUpperCase();
        if (dmSetCodes.has(prefix)) {
          isDM = true;
          break;
        }
        if (gxSetCodes.has(prefix)) {
          isGX = true;
        }
      }

      if (isDM) {
        isMatched = true;
        era = 'DM';
      } else if (isGX) {
        isMatched = true;
        era = 'GX';
      }
    }

    if (isMatched) {
      matchingCardIds.add(cardId);
      filteredRows.push(row);
      filteredWhitelist[String(cardId)] = {
        id: cardId,
        name: row.name,
        era,
        type: ygoCard ? ygoCard.type : 'Unknown',
        atk: row.atk >= 0 ? row.atk : undefined,
        def: row.def >= 0 ? row.def : undefined,
        level: row.level > 0 ? row.level & 0xff : undefined,
        race: ygoCard ? ygoCard.race : String(row.race),
        attribute: ygoCard?.attribute,
      };
    }
  }

  console.log(`      ✓ Filter matched ${matchingCardIds.size} cards (DM + GX era compliant).`);

  // 5. Generate filtered resources/cards.cdb
  console.log('\n[5/6] Building filtered resources/cards.cdb...');
  if (fs.existsSync(OUTPUT_CDB_PATH)) {
    fs.unlinkSync(OUTPUT_CDB_PATH);
  }

  const outDb = new Database(OUTPUT_CDB_PATH);
  outDb.exec(`
    CREATE TABLE datas (
      id INTEGER PRIMARY KEY,
      ot INTEGER,
      alias INTEGER,
      setcode INTEGER,
      type INTEGER,
      atk INTEGER,
      def INTEGER,
      level INTEGER,
      race INTEGER,
      attribute INTEGER,
      category INTEGER
    );
    CREATE TABLE texts (
      id INTEGER PRIMARY KEY,
      name TEXT,
      desc TEXT,
      str1 TEXT,
      str2 TEXT,
      str3 TEXT,
      str4 TEXT,
      str5 TEXT,
      str6 TEXT,
      str7 TEXT,
      str8 TEXT,
      str9 TEXT,
      str10 TEXT,
      str11 TEXT,
      str12 TEXT,
      str13 TEXT,
      str14 TEXT,
      str15 TEXT,
      str16 TEXT
    );
    CREATE INDEX idx_datas_type ON datas (type);
  `);

  const insertData = outDb.prepare(`
    INSERT INTO datas (id, ot, alias, setcode, type, atk, def, level, race, attribute, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertText = outDb.prepare(`
    INSERT INTO texts (id, name, desc, str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14, str15, str16)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAll = outDb.transaction((rows: typeof filteredRows) => {
    for (const r of rows) {
      insertData.run(
        r.id,
        r.ot,
        r.alias,
        typeof r.setcode === 'bigint' ? Number(r.setcode) : r.setcode,
        r.type,
        r.atk,
        r.def,
        r.level,
        r.race,
        r.attribute,
        r.category,
      );
      insertText.run(
        r.id,
        r.name,
        r.desc,
        r.str1 || '',
        r.str2 || '',
        r.str3 || '',
        r.str4 || '',
        r.str5 || '',
        r.str6 || '',
        r.str7 || '',
        r.str8 || '',
        r.str9 || '',
        r.str10 || '',
        r.str11 || '',
        r.str12 || '',
        r.str13 || '',
        r.str14 || '',
        r.str15 || '',
        r.str16 || '',
      );
    }
  });

  insertAll(filteredRows);
  outDb.close();
  rawDb.close();
  if (fs.existsSync(tempCdbPath)) {
    fs.unlinkSync(tempCdbPath);
  }

  console.log(
    `      ✓ Saved filtered cards.cdb (${(fs.statSync(OUTPUT_CDB_PATH).size / 1024).toFixed(1)} KB).`,
  );

  // Write card pool whitelist JSON
  fs.writeFileSync(OUTPUT_WHITELIST_PATH, JSON.stringify(filteredWhitelist, null, 2), 'utf-8');
  console.log(`      ✓ Saved ${OUTPUT_WHITELIST_PATH}.`);

  // 6. Copy Base Scripts & Download Official Card Scripts
  console.log('\n[6/6] Syncing Lua runtime scripts...');
  copyDirectoryFiles(SPIKE_SCRIPTS_DIR, RESOURCES_SCRIPTS_DIR);
  console.log(`      ✓ Copied base engine scripts (constant.lua, utility.lua, proc_*.lua).`);

  if (!fs.existsSync(RESOURCES_OFFICIAL_SCRIPTS_DIR)) {
    fs.mkdirSync(RESOURCES_OFFICIAL_SCRIPTS_DIR, { recursive: true });
  }

  // Also copy any official scripts already in spike
  const spikeOfficialDir = path.join(SPIKE_SCRIPTS_DIR, 'official');
  if (fs.existsSync(spikeOfficialDir)) {
    const spikeFiles = fs.readdirSync(spikeOfficialDir);
    for (const f of spikeFiles) {
      if (f.endsWith('.lua')) {
        fs.copyFileSync(
          path.join(spikeOfficialDir, f),
          path.join(RESOURCES_OFFICIAL_SCRIPTS_DIR, f),
        );
      }
    }
  }

  console.log(
    `      • Fetching missing card scripts for ${matchingCardIds.size} filtered cards...`,
  );
  const aliasMap = new Map<number, number>();
  for (const r of filteredRows) {
    if (r.alias && r.alias > 0) {
      aliasMap.set(r.id, r.alias);
    }
  }
  const cardIdArray = Array.from(matchingCardIds);
  const result = await downloadBatchScripts(cardIdArray, aliasMap);
  console.log(
    `      ✓ Script sync complete! Downloaded ${result.downloaded} new scripts (${result.notFound} normal/vanilla cards without scripts).`,
  );

  console.log('\n' + '='.repeat(70));
  console.log('  CARD POOL BUILD COMPLETE');
  console.log('='.repeat(70));
  console.log(`  • Total Cards in Whitelist: ${matchingCardIds.size}`);
  console.log(`  • Database File:            ${OUTPUT_CDB_PATH}`);
  console.log(`  • Whitelist Manifest:       ${OUTPUT_WHITELIST_PATH}`);
  console.log(
    `  • Official Scripts Count:   ${fs.readdirSync(RESOURCES_OFFICIAL_SCRIPTS_DIR).length}`,
  );
  console.log('='.repeat(70) + '\n');
}

buildCardPool().catch((err) => {
  console.error('\n[FATAL ERROR in build-card-pool]:', err);
  process.exit(1);
});
