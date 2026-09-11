import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

interface CardVideoEntry {
  cardName: string;
  series: string;
  summon?: string;
  attack?: string;
  victory?: string;
  isPlaceholder?: boolean;
}

interface VerificationResult {
  category: string;
  name: string;
  status: 'OK' | 'MISSING' | 'EMPTY';
  details?: string;
}

export function verifyReleaseAssets(options: { strict?: boolean } = {}) {
  const isStrict = options.strict ?? (process.argv.includes('--strict') || Boolean(process.env.CI));
  const results: VerificationResult[] = [];
  const errors: string[] = [];

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('       Yu-Gi-Oh! Duel Arena — Release Asset Verification       ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Check Core Card Database
  const cdbPath = path.join(ROOT_DIR, 'resources/cards.cdb');
  if (!fs.existsSync(cdbPath)) {
    results.push({ category: 'Database', name: 'resources/cards.cdb', status: 'MISSING' });
    errors.push('CRITICAL: resources/cards.cdb is missing!');
  } else {
    const size = fs.statSync(cdbPath).size;
    if (size < 1000000) {
      results.push({ category: 'Database', name: 'resources/cards.cdb', status: 'EMPTY', details: `${size} bytes` });
      errors.push(`CRITICAL: resources/cards.cdb appears corrupted (${size} bytes)`);
    } else {
      results.push({ category: 'Database', name: 'resources/cards.cdb', status: 'OK', details: `${(size / 1024 / 1024).toFixed(2)} MB` });
    }
  }

  // 2. Check Core Script Pool
  const scriptsDir = path.join(ROOT_DIR, 'resources/scripts/official');
  if (!fs.existsSync(scriptsDir)) {
    results.push({ category: 'Scripts', name: 'resources/scripts/official', status: 'MISSING' });
    errors.push('CRITICAL: resources/scripts/official directory missing!');
  } else {
    const scriptCount = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.lua')).length;
    if (scriptCount < 1000) {
      results.push({ category: 'Scripts', name: 'resources/scripts/official', status: 'EMPTY', details: `${scriptCount} scripts` });
      errors.push(`CRITICAL: resources/scripts/official has only ${scriptCount} scripts!`);
    } else {
      results.push({ category: 'Scripts', name: 'resources/scripts/official', status: 'OK', details: `${scriptCount} Lua scripts` });
    }
  }

  // 3. Check Card Videos / Cutscenes from data/card-videos.json
  const cardVideosPath = path.join(ROOT_DIR, 'data/card-videos.json');
  if (!fs.existsSync(cardVideosPath)) {
    results.push({ category: 'Cutscenes', name: 'data/card-videos.json', status: 'MISSING' });
    errors.push('CRITICAL: data/card-videos.json is missing!');
  } else {
    const cardVideos: Record<string, CardVideoEntry> = JSON.parse(fs.readFileSync(cardVideosPath, 'utf-8'));
    let activeMonsters = 0;
    let placeholderMonsters = 0;
    const missingVideoFiles: string[] = [];

    for (const [cardId, entry] of Object.entries(cardVideos)) {
      if (entry.isPlaceholder) {
        placeholderMonsters++;
        continue;
      }

      activeMonsters++;
      const videoTypes: Array<'summon' | 'attack' | 'victory'> = ['summon', 'attack', 'victory'];
      for (const vType of videoTypes) {
        const videoRel = entry[vType];
        if (!videoRel) continue;

        const absVideo = path.join(ROOT_DIR, videoRel);
        if (!fs.existsSync(absVideo)) {
          missingVideoFiles.push(`${entry.cardName} (${cardId}) -> missing ${vType}: ${videoRel}`);
          results.push({ category: 'Video Cutscene', name: `${entry.cardName} (${vType})`, status: 'MISSING', details: videoRel });
        } else {
          const stats = fs.statSync(absVideo);
          if (stats.size < 10000) {
            missingVideoFiles.push(`${entry.cardName} (${cardId}) -> corrupted ${vType}: ${videoRel} (${stats.size} bytes)`);
            results.push({ category: 'Video Cutscene', name: `${entry.cardName} (${vType})`, status: 'EMPTY', details: `${stats.size} bytes` });
          } else {
            results.push({ category: 'Video Cutscene', name: `${entry.cardName} (${vType})`, status: 'OK', details: `${(stats.size / 1024 / 1024).toFixed(1)} MB` });
          }
        }
      }
    }

    console.log(`ℹ Cutscene registry: ${activeMonsters} active monster cutscenes, ${placeholderMonsters} placeholders.`);
    if (missingVideoFiles.length > 0) {
      errors.push(`Missing or corrupted cutscene video files (${missingVideoFiles.length}):\n` + missingVideoFiles.map((m) => `   - ${m}`).join('\n'));
    }
  }

  // 4. Check Audio Tracks (BGM & SFX)
  const audioDir = path.join(ROOT_DIR, 'resources/audio');
  if (!fs.existsSync(audioDir)) {
    results.push({ category: 'Audio', name: 'resources/audio', status: 'MISSING' });
    errors.push('CRITICAL: resources/audio directory missing!');
  } else {
    const audioFiles = fs.readdirSync(audioDir, { recursive: true }).filter((f) => typeof f === 'string' && (f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.ogg')));
    if (audioFiles.length === 0) {
      results.push({ category: 'Audio', name: 'resources/audio', status: 'EMPTY', details: '0 audio files' });
      errors.push('CRITICAL: resources/audio contains 0 audio files!');
    } else {
      results.push({ category: 'Audio', name: 'resources/audio', status: 'OK', details: `${audioFiles.length} audio tracks` });
    }
  }

  // 5. Check Update Manifest Consistency
  const manifestPath = path.join(ROOT_DIR, 'data/update-manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const fileCount = Object.keys(manifest.files || {}).length;
      results.push({ category: 'Manifest', name: 'data/update-manifest.json', status: 'OK', details: `${fileCount} tracked files (v${manifest.version})` });
    } catch {
      results.push({ category: 'Manifest', name: 'data/update-manifest.json', status: 'EMPTY', details: 'Invalid JSON' });
      errors.push('CRITICAL: data/update-manifest.json is malformed!');
    }
  }

  // Print Summary Table
  console.log('\nAsset Verification Details:');
  for (const res of results) {
    const icon = res.status === 'OK' ? '✓' : '✗';
    const detailStr = res.details ? ` (${res.details})` : '';
    console.log(` [${icon}] ${res.category.padEnd(16)} | ${res.name.padEnd(35)} : ${res.status}${detailStr}`);
  }

  console.log('\n───────────────────────────────────────────────────────────────');
  if (errors.length === 0) {
    console.log('✓ ALL REQUIRED RELEASE ASSETS ARE PRESENT AND VALID!\n');
    return true;
  } else {
    console.error(`✗ FOUND ${errors.length} ISSUE(S) WITH RELEASE ASSETS:\n`);
    for (const err of errors) {
      console.error(`  • ${err}`);
    }
    console.log('\nSuggested Remediations:');
    console.log('  1. If videos are missing in CI, verify that assets-v1/game-media.tar.gz was updated with new cutscenes.');
    console.log('  2. Run "npm run pack:media" to bundle & push media to GitHub assets-v1 release.');
    console.log('  3. Re-run "npm run generate:manifest" to refresh SHA256 hashes.');
    console.log('───────────────────────────────────────────────────────────────\n');

    if (isStrict) {
      process.exit(1);
    }
    return false;
  }
}

if (process.argv[1] && process.argv[1].endsWith('verify-release-assets.ts')) {
  verifyReleaseAssets();
}
