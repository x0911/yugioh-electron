import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const ROOT_DIR = process.cwd();
const CACHE_DIR = path.resolve(ROOT_DIR, 'data/formatlibrary-cache');
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
const db = new Database(CDB_PATH, { readonly: true });
const checkDbStmt = db.prepare('SELECT d.id, t.name FROM datas d JOIN texts t ON d.id = t.id WHERE d.id = ?');

const RETRO_FORMATS = [
  'Goat',
  'Reaper',
  'Chaos Return',
  'Stein',
  'Chimeratech',
  'Trooper',
  'Perfect Circle',
  'Demise',
  'Zombie',
  'DAD Return',
  'Gladiator',
  'Chaos',
  'Yata',
  'Warrior',
  'Cyber',
  'Lightsworn',
  'Edison',
  'Critter',
  'Yugi-Kaiba'
];

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
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  return null;
}

export async function scrapeTournamentDecks(): Promise<TournamentDeckRecord[]> {
  const cacheFile = path.join(CACHE_DIR, 'validated-tournament-decks.json');
  if (fs.existsSync(cacheFile)) {
    console.log(`[Scraper] Loading cached validated tournament decks from ${cacheFile}...`);
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  }

  console.log('===============================================================');
  console.log('=== SCRAPING TOURNAMENT DECKS FROM FORMAT LIBRARY (DM + GX) ===');
  console.log('===============================================================\n');

  const deckSummaries: any[] = [];
  const seenIds = new Set<number>();

  for (const fmt of RETRO_FORMATS) {
    console.log(`▶ Querying event decks for format: "${fmt}"...`);
    const url = `https://formatlibrary.com/api/decks?page=1&limit=60&sort=placement:asc&filter=format:eq:${encodeURIComponent(fmt)},origin:eq:event`;
    const data = await fetchWithRetry(url);
    if (Array.isArray(data)) {
      for (const d of data) {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          deckSummaries.push(d);
        }
      }
      console.log(`  ✓ Found ${data.length} event decks in "${fmt}"`);
    }
  }

  console.log(`\nTotal unique tournament deck summaries fetched: ${deckSummaries.length}`);
  console.log(`Fetching full YDK card details with concurrency of 30...\n`);

  const validatedDecks: TournamentDeckRecord[] = [];
  const chunkSize = 30;

  for (let i = 0; i < deckSummaries.length; i += chunkSize) {
    const chunk = deckSummaries.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map(async (summary) => {
        const detail = await fetchWithRetry(`https://formatlibrary.com/api/decks/${summary.id}`);
        if (!detail || !detail.ydk) return null;

        const lines = detail.ydk.split('\n').map((l: string) => l.trim()).filter(Boolean);
        let section: 'main' | 'extra' | 'side' = 'main';
        const main: number[] = [];
        const extra: number[] = [];
        const side: number[] = [];
        let isLegal = true;

        for (const line of lines) {
          if (line.startsWith('#') || line.startsWith('!')) {
            if (line === '#main') section = 'main';
            else if (line === '#extra') section = 'extra';
            else if (line === '!side') section = 'side';
            continue;
          }
          const id = parseInt(line, 10);
          if (isNaN(id)) continue;

          if (section === 'main') {
            if (!pool[String(id)] || !checkDbStmt.get(id)) {
              isLegal = false;
              break;
            }
            main.push(id);
          } else if (section === 'extra') {
            if (pool[String(id)] && checkDbStmt.get(id)) {
              extra.push(id);
            }
          } else if (section === 'side') {
            if (pool[String(id)] && checkDbStmt.get(id)) {
              side.push(id);
            }
          }
        }

        if (!isLegal || main.length < 40) return null;

        return {
          id: detail.id,
          name: detail.name || detail.deckTypeName || 'Tournament Deck',
          deckTypeName: detail.deckTypeName || 'Tournament Deck',
          formatName: detail.formatName || summary.formatName || 'Retro',
          placement: detail.placement || summary.placement || 1,
          event: detail.event?.name || summary.event?.name || 'Tournament Event',
          builderName: detail.builderName || summary.builderName || 'Champion',
          main,
          extra,
          side,
        } as TournamentDeckRecord;
      })
    );

    for (const res of results) {
      if (res) {
        validatedDecks.push(res);
      }
    }

    process.stdout.write(`Processed ${Math.min(deckSummaries.length, i + chunkSize)}/${deckSummaries.length} decks (Valid: ${validatedDecks.length})...\r`);
  }

  console.log(`\n\n✓ Scrape complete! Validated ${validatedDecks.length} authentic, 100% legal tournament decks.`);
  fs.writeFileSync(cacheFile, JSON.stringify(validatedDecks, null, 2), 'utf-8');
  console.log(`Saved to ${cacheFile}`);

  return validatedDecks;
}

if (process.argv[1] && process.argv[1].endsWith('scrape-formatlibrary-decks.ts')) {
  scrapeTournamentDecks().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
