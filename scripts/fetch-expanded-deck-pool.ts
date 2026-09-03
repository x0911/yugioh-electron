import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const ROOT_DIR = process.cwd();
const CACHE_DIR = path.resolve(ROOT_DIR, 'data/formatlibrary-cache');
const CACHE_FILE = path.join(CACHE_DIR, 'validated-tournament-decks.json');
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');

const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
const db = new Database(CDB_PATH, { readonly: true });
const checkDbStmt = db.prepare('SELECT d.id, t.name FROM datas d JOIN texts t ON d.id = t.id WHERE d.id = ?');

// Canonical card mappings for trivial alt-arts or equivalent promo codes
const ALT_ART_MAP: Record<number, number> = {
  83764718: 83764719, // Monster Reborn alt art -> canon Monster Reborn
  15735108: 68005187, // Spell Card "Soul Exchange" -> Soul Exchange
  17626381: 42664989, // Supply Squad -> Card of Sanctity
  24094654: 24094653, // Polymerization alt art -> canon Polymerization
  38033122: 38033121, // Dark Magician Girl alt art -> canon DMG
  89631140: 89631139, // Blue-Eyes alt art -> canon Blue-Eyes
  46986415: 46986414, // Dark Magician alt art -> canon Dark Magician
  74677423: 74677422, // Red-Eyes alt art -> canon Red-Eyes
};

interface TournamentDeckRecord {
  id: number;
  name: string;
  deckTypeName: string;
  formatName: string;
  placement: number;
  event: string;
  builderName: string;
  main: number[];
  extra: number[];
  side: number[];
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  return null;
}

const TARGET_KEYWORDS = [
  'dark magician', 'paladin', 'blue-eyes', 'red-eyes', 'dragon', 'gearfried', 'warrior',
  'relinquished', 'gravekeeper', 'demise', 'machine', 'coin', 'volcanic', 'baboon',
  'beast', 'earth beat', 'wind beat', 'water', 'ocean', 'umi', 'counter fairy', 'fairy',
  'six samurai', 'hero', 'diamond dude', 'dad', 'monarch', 'exodia', 'jar', 'scientist',
  'ben kei', 'horus', 'macro', 'ojama', 'ancient gear', 'cyber', 'evil hero', 'cloudian',
  'rock', 'dinosaur', 'jinzo', 'harpie', 'amazoness', 'crystal', 'yubel', 'lightsworn',
  'pacman', 'creator', 'flame wingman', 'neos', 'plasma', 'dreadmaster', 'gate turbo'
];

const KEYCARD_QUERIES = [
  'ydk:inc:10000021', // Slifer
  'ydk:inc:10000020',
  'ydk:inc:10000000', // Obelisk
  'ydk:inc:10000002',
  'ydk:inc:10000011', // Ra
  'ydk:inc:89943723', // Neos
  'ydk:inc:1546123',  // Cyber End
  'ydk:inc:90140980', // Ojama King
  'ydk:inc:73879377', // Armed Dragon LV7
  'ydk:inc:83965310', // Plasma
  'ydk:inc:40591390', // Dreadmaster
  'ydk:inc:58332301', // Dark Gaia
  'ydk:inc:78371393', // Yubel
  'ydk:inc:83104731', // Ancient Gear Golem
  'ydk:inc:27134689', // Master of Oz
  'ydk:inc:32543380', // Volcanic Doomfire
  'ydk:inc:79856792', // Rainbow Dragon
  'ydk:inc:64681432', // Gandora
  'ydk:inc:75347539', // Valkyrion
  'ydk:inc:78193831', // Buster Blader
  'ydk:inc:38033121', // Dark Magician Girl
  'ydk:inc:71625222', // Time Wizard
  'ydk:inc:36354007', // Gilford
  'ydk:inc:91998119', // XYZ-Dragon Cannon
  'ydk:inc:35809262', // Flame Wingman
  'ydk:inc:10248389', // Cyber Blader
  'ydk:inc:57610714', // Cloudian
  'ydk:inc:13893596', // Exodius
  'ydk:inc:42009836', // Fossil Dyna
  'ydk:inc:48179391', // The Seal of Orichalcos
  'ydk:inc:31829185', // Dark Necrofear
  'ydk:inc:94212438', // Destiny Board
  'ydk:inc:102380',   // Lava Golem
  'ydk:inc:64631466', // Relinquished
  'ydk:inc:66518841', // Toon Blue-Eyes
  'ydk:inc:81480460', // Barrel Dragon
  'ydk:inc:89632194', // Blowback Dragon
  'ydk:inc:7289672',  // Doom Dozer
  'ydk:inc:91512835', // Insect Queen
  'ydk:inc:15894048', // Ultimate Tyranno
  'ydk:inc:3643300',  // The Legendary Fisherman
  'ydk:inc:37721209', // Levia-Dragon - Daedalus
  'ydk:inc:89194033', // Mystical Beast of Serket
  'ydk:inc:77585513', // Jinzo
  'ydk:inc:34022290', // Guardian Eatos
  'ydk:inc:85066822', // Water Dragon
  'ydk:inc:42079445', // Green Baboon
  'ydk:inc:88264978', // Red-Eyes Darkness Metal Dragon
  'ydk:inc:23846921', // Arcana Force XXI
  'ydk:inc:5819279',  // Clear Vice Dragon
  'type:inc:Ojama',
  'type:inc:Evil Hero',
  'type:inc:Ancient Gear',
  'type:inc:Cyber Dragon',
  'type:inc:Cyberdark',
  'type:inc:Cloudian',
  'type:inc:Toons',
  'type:inc:Relinquished',
  'type:inc:Volcanic',
  'type:inc:Harpie',
  'type:inc:Amazoness',
  'type:inc:Jinzo',
  'type:inc:Gravekeeper',
  'type:inc:Gearfried',
  'type:inc:Counter Fairy',
  'type:inc:Rock',
  'type:inc:Baboon',
  'type:inc:Demise',
  'type:inc:Hero',
  'type:inc:Six Samurai',
  'type:inc:Crystal Beast'
];

export async function fetchAndValidateExpandedPool(): Promise<void> {
  let existingDecks: TournamentDeckRecord[] = [];
  if (fs.existsSync(CACHE_FILE)) {
    existingDecks = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    console.log(`Loaded ${existingDecks.length} existing decks from cache.`);
  }

  const seenIds = new Set<number>(existingDecks.map((d) => d.id));
  const candidateSummaries: any[] = [];

  // 1. Load DM & GX summaries
  const dmgxPath = path.join(CACHE_DIR, 'dmgx-deck-summaries.json');
  if (fs.existsSync(dmgxPath)) {
    const dmgx: any[] = JSON.parse(fs.readFileSync(dmgxPath, 'utf-8'));
    for (const d of dmgx) {
      if (seenIds.has(d.id)) continue;
      const type = (d.deckTypeName || '').toLowerCase();
      const name = (d.name || '').toLowerCase();
      if (TARGET_KEYWORDS.some((k) => type.includes(k) || name.includes(k))) {
        seenIds.add(d.id);
        candidateSummaries.push(d);
      }
    }
  }

  // 2. Load Edison summaries
  const edisonPath = path.join(CACHE_DIR, 'edison-deck-summaries.json');
  if (fs.existsSync(edisonPath)) {
    const edison: any[] = JSON.parse(fs.readFileSync(edisonPath, 'utf-8'));
    for (const d of edison) {
      if (seenIds.has(d.id)) continue;
      const type = (d.deckTypeName || '').toLowerCase();
      const name = (d.name || '').toLowerCase();
      if (TARGET_KEYWORDS.some((k) => type.includes(k) || name.includes(k))) {
        seenIds.add(d.id);
        candidateSummaries.push(d);
      }
    }
  }

  // 3. Query Format Library for keycards & archetypes
  console.log(`Fetching specific keycard & archetype queries (${KEYCARD_QUERIES.length} queries)...`);
  for (const q of KEYCARD_QUERIES) {
    const u = `https://formatlibrary.com/api/decks?page=1&limit=25&filter=${encodeURIComponent(q)}`;
    const data = await fetchWithRetry(u);
    if (Array.isArray(data)) {
      for (const d of data) {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          candidateSummaries.push(d);
        }
      }
    }
  }

  // Force include Deck 39153 (Egyptian God: Slifer, Obelisk, Ra) and Deck 46997 (HERO Neos)
  const mustIncludes = [39153, 46997, 25104, 15931, 3191, 24724, 48188, 36990, 3159, 52207, 82262, 83730, 83731];
  for (const id of mustIncludes) {
    if (!seenIds.has(id)) {
      seenIds.add(id);
      candidateSummaries.push({ id });
    }
  }

  console.log(`\nTotal candidate decks to fetch and validate: ${candidateSummaries.length}`);

  const chunkSize = 30;
  const newValidatedDecks: TournamentDeckRecord[] = [];

  for (let i = 0; i < candidateSummaries.length; i += chunkSize) {
    const chunk = candidateSummaries.slice(i, i + chunkSize);
    process.stdout.write(`Validating batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(candidateSummaries.length / chunkSize)}...\r`);

    const results = await Promise.all(
      chunk.map(async (summary) => {
        const detail = await fetchWithRetry(`https://formatlibrary.com/api/decks/${summary.id}`);
        if (!detail || !detail.ydk) return null;

        const lines = detail.ydk.split('\n').map((l: string) => l.trim());
        let sec: 'pre' | 'main' | 'extra' | 'side' = 'pre';
        const main: number[] = [];
        const extra: number[] = [];
        const side: number[] = [];
        let isLegal = true;

        for (const line of lines) {
          if (line === '#main') { sec = 'main'; continue; }
          if (line === '#extra') { sec = 'extra'; continue; }
          if (line === '!side') { sec = 'side'; continue; }
          if (line.startsWith('#') || line.startsWith('!') || !line || sec === 'pre') continue;

          let id = parseInt(line, 10);
          if (isNaN(id)) continue;

          if (ALT_ART_MAP[id]) {
            id = ALT_ART_MAP[id];
          }

          if (sec === 'main') {
            if (!checkDbStmt.get(id)) {
              isLegal = false;
              break;
            }
            main.push(id);
          } else if (sec === 'extra') {
            if (checkDbStmt.get(id)) {
              extra.push(id);
            }
          } else if (sec === 'side') {
            if (checkDbStmt.get(id)) {
              const dataRow = db.prepare('SELECT type FROM datas WHERE id = ?').get(id) as { type: number } | undefined;
              if (dataRow && (dataRow.type & 0x40) && extra.length < 15) {
                extra.push(id);
              } else {
                side.push(id);
              }
            }
          }
        }

        if (!isLegal || main.length < 40 || main.length > 60) return null;

        const record: TournamentDeckRecord = {
          id: detail.id,
          name: detail.name || detail.deckTypeName || 'Format Library Deck',
          deckTypeName: detail.deckTypeName || 'Format Library Deck',
          formatName: detail.formatName || summary.formatName || 'Retro',
          placement: detail.placement || summary.placement || 1,
          event: detail.event?.name || summary.event?.name || `${detail.formatName || 'Retro'} Format`,
          builderName: detail.builderName || summary.builderName || 'Format Library Builder',
          main,
          extra,
          side,
        };
        return record;
      }),
    );

    for (const r of results) {
      if (r) newValidatedDecks.push(r);
    }
  }

  console.log(`\n✓ Newly validated decks: ${newValidatedDecks.length}`);

  const combinedDecks = [...existingDecks, ...newValidatedDecks];
  fs.writeFileSync(CACHE_FILE, JSON.stringify(combinedDecks, null, 2), 'utf-8');
  console.log(`✓ Saved total ${combinedDecks.length} validated tournament/community decks to ${CACHE_FILE}`);
}

if (process.argv[1] && process.argv[1].endsWith('fetch-expanded-deck-pool.ts')) {
  fetchAndValidateExpandedPool().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
