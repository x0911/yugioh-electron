import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { verifyReleaseAssets } from '../scripts/verify-release-assets';

console.log('Testing Release Asset Integrity & Video Cutscene Registrations...');

// 1. Verify that the asset verification function runs and returns boolean
const isValid = verifyReleaseAssets({ strict: false });
assert.equal(typeof isValid, 'boolean', 'verifyReleaseAssets should return a boolean status');

// 2. Explicitly test card cutscenes in data/card-videos.json
const cardVideosPath = path.resolve(process.cwd(), 'data/card-videos.json');
assert.ok(fs.existsSync(cardVideosPath), 'data/card-videos.json must exist');

const cardVideos = JSON.parse(fs.readFileSync(cardVideosPath, 'utf-8'));

// Verify Stardust Dragon and Red Dragon Archfiend exist and are marked as non-placeholder
assert.ok(cardVideos['44508094'], 'Stardust Dragon (44508094) must be registered in card-videos.json');
assert.equal(cardVideos['44508094'].isPlaceholder, false, 'Stardust Dragon should not be a placeholder');

assert.ok(cardVideos['70902743'], 'Red Dragon Archfiend (70902743) must be registered in card-videos.json');
assert.equal(cardVideos['70902743'].isPlaceholder, false, 'Red Dragon Archfiend should not be a placeholder');

// Verify their actual video files exist on disk in the repository
for (const cardId of ['44508094', '70902743']) {
  const entry = cardVideos[cardId];
  assert.ok(entry.summon, `Card ${cardId} must specify a summon video path`);
  assert.ok(entry.attack, `Card ${cardId} must specify an attack video path`);
  
  const summonPath = path.resolve(process.cwd(), entry.summon);
  const attackPath = path.resolve(process.cwd(), entry.attack);

  assert.ok(fs.existsSync(summonPath), `Summon video for ${entry.cardName} (${entry.summon}) must exist on disk`);
  assert.ok(fs.existsSync(attackPath), `Attack video for ${entry.cardName} (${entry.attack}) must exist on disk`);
  
  assert.ok(fs.statSync(summonPath).size > 1000000, `Summon video for ${entry.cardName} must be > 1MB`);
  assert.ok(fs.statSync(attackPath).size > 1000000, `Attack video for ${entry.cardName} must be > 1MB`);
}

console.log('✓ Release Asset Integrity & Video Cutscene test passed successfully.');
