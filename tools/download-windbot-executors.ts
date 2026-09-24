import fs from 'node:fs';
import path from 'node:path';

interface DeckEntry {
  name: string;
  download_url: string;
  size: number;
}

const decksJsonPath = '/tmp/windbot_decks.json';
const targetDir = path.resolve('tools/windbot-reference');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const entries: DeckEntry[] = JSON.parse(fs.readFileSync(decksJsonPath, 'utf8'));
console.log(`Found ${entries.length} executors to download/sync.`);

async function run() {
  let downloaded = 0;
  let skipped = 0;

  for (const entry of entries) {
    const destPath = path.join(targetDir, entry.name);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      skipped++;
      continue;
    }

    try {
      console.log(`Downloading ${entry.name}...`);
      const res = await fetch(entry.download_url, {
        headers: { 'User-Agent': 'Antigravity-YuGiOh-Downloader' },
      });
      if (!res.ok) {
        console.error(`Failed to download ${entry.name}: ${res.status} ${res.statusText}`);
        continue;
      }
      const text = await res.text();
      fs.writeFileSync(destPath, text, 'utf8');
      downloaded++;
      // Small pause to be polite
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      console.error(`Error downloading ${entry.name}:`, err);
    }
  }

  console.log(`Sync complete! Downloaded: ${downloaded}, Skipped (already present): ${skipped}`);
}

run();
