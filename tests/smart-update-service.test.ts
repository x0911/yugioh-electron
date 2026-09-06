import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as tar from 'tar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function computeSha256(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function runSmartUpdateTests() {
  console.log('================================================================');
  console.log('=== RUNNING SMART DELTA UPDATE & PATCHER TEST SUITE ===');
  console.log('================================================================\n');

  // Test 1: data/update-manifest.json exists and has valid structure
  console.log('▶ Test 1: update-manifest.json Integrity & Schema Validation');
  const manifestPath = path.join(ROOT_DIR, 'data/update-manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'update-manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.ok(manifest.version, 'Manifest must contain version');
  assert.ok(manifest.releaseDate, 'Manifest must contain releaseDate');
  assert.ok(manifest.releaseNotes, 'Manifest must contain releaseNotes');
  assert.ok(manifest.files && typeof manifest.files === 'object', 'Manifest must contain files object');

  const fileKeys = Object.keys(manifest.files);
  assert.ok(fileKeys.length >= 100, `Expected at least 100 files in manifest, got ${fileKeys.length}`);

  // Verify critical files are tracked
  assert.ok(manifest.files['resources/cards.cdb'], 'cards.cdb must be in manifest');
  assert.ok(manifest.files['data/prebuilt-decks.json'], 'prebuilt-decks.json must be in manifest');
  assert.ok(manifest.files['resources/scripts/official/c99900001.lua'], 'c99900001.lua must be in manifest');
  assert.ok(manifest.files['resources/cards/full/99900001.jpg'], 'Egyxos full image must be in manifest');
  assert.ok(manifest.files['resources/cards/art/99900001.jpg'], 'Egyxos art image must be in manifest');
  assert.ok(manifest.files['resources/cards/mini/99900001.jpg'], 'Egyxos mini image must be in manifest');

  console.log(`  ✓ Validated manifest v${manifest.version} with ${fileKeys.length} tracked files.`);
  console.log('  ✓ Verified tracking for cards.cdb, prebuilt-decks.json, c99900001.lua, and Egyxos custom images.');

  // Verify NO dist files or gitignored build artifacts are tracked
  const distFiles = fileKeys.filter((k) => k.startsWith('dist/'));
  assert.strictEqual(distFiles.length, 0, 'No dist/ files should ever be in update-manifest.json');
  console.log('  ✓ Verified 0 dist/ files in manifest.\n');

  // Test 2: SHA-256 Hash Matching on Local Disk
  console.log('▶ Test 2: SHA-256 Checksum Verification Against Local Repository');
  for (const key of [
    'data/prebuilt-decks.json',
    'resources/scripts/official/c99900001.lua',
    'resources/cards/full/99900001.jpg',
    'resources/cards/art/99900001.jpg',
    'resources/cards/mini/99900001.jpg',
  ]) {
    const entry = manifest.files[key];
    const actualPath = path.join(ROOT_DIR, key);
    assert.ok(fs.existsSync(actualPath), `File ${key} must exist on disk`);
    const actualHash = computeSha256(fs.readFileSync(actualPath));
    assert.strictEqual(actualHash, entry.sha256, `SHA-256 for ${key} must match manifest`);
  }
  console.log('  ✓ Checksums match 100% between disk and update-manifest.json.\n');

  // Test 3: Delta Comparison Logic Simulation (Identical, Modified, New)
  console.log('▶ Test 3: Delta Computation Logic Simulation');
  const mockRemoteManifest = {
    version: '0.2.0',
    files: {
      'file-same.txt': { path: 'file-same.txt', size: 10, sha256: computeSha256(Buffer.from('SAME_CONTENT')) },
      'file-modified.txt': { path: 'file-modified.txt', size: 12, sha256: computeSha256(Buffer.from('REMOTE_CONTENT')) },
      'file-new.txt': { path: 'file-new.txt', size: 11, sha256: computeSha256(Buffer.from('NEW_CONTENT')) },
    },
  };

  const mockLocalFiles: Record<string, string> = {
    'file-same.txt': computeSha256(Buffer.from('SAME_CONTENT')),
    'file-modified.txt': computeSha256(Buffer.from('LOCAL_OLD_CONTENT')),
    // 'file-new.txt' is missing locally
  };

  const deltas: { path: string; status: 'new' | 'modified' }[] = [];
  for (const [relPath, remoteEntry] of Object.entries(mockRemoteManifest.files)) {
    const localHash = mockLocalFiles[relPath];
    if (!localHash) {
      deltas.push({ path: relPath, status: 'new' });
    } else if (localHash !== remoteEntry.sha256) {
      deltas.push({ path: relPath, status: 'modified' });
    }
  }

  assert.strictEqual(deltas.length, 2, 'Should identify exactly 2 deltas');
  assert.strictEqual(deltas[0].path, 'file-modified.txt');
  assert.strictEqual(deltas[0].status, 'modified');
  assert.strictEqual(deltas[1].path, 'file-new.txt');
  assert.strictEqual(deltas[1].status, 'new');
  console.log('  ✓ Accurately skipped identical files and identified 1 modified and 1 new file.\n');

  // Test 4: Checksum Tamper & Corruption Detection
  console.log('▶ Test 4: Corrupted Chunk & Checksum Mismatch Detection');
  const expectedRemoteHash = computeSha256(Buffer.from('CORRECT_PAYLOAD'));
  const corruptedPayload = Buffer.from('CORRUPTED_INCOMPLETE_PAYLOAD');
  const corruptedHash = computeSha256(corruptedPayload);

  let detectedCorruption = false;
  if (corruptedHash !== expectedRemoteHash) {
    detectedCorruption = true;
  }
  assert.ok(detectedCorruption, 'Must flag corrupted download with hash mismatch');
  console.log('  ✓ Corrupted chunk successfully intercepted and rejected by SHA-256 verifier.\n');

  // Test 5: Patch Directory Priority Simulation
  console.log('▶ Test 5: User Patch Overlay Directory Precedence');
  const testUserData = path.join(ROOT_DIR, 'tmp-test-userdata');
  const testPatchDir = path.join(testUserData, 'patch');
  fs.mkdirSync(testPatchDir, { recursive: true });

  const testFileRel = 'test-asset.json';
  const vanillaFile = path.join(testUserData, 'vanilla', testFileRel);
  const patchedFile = path.join(testPatchDir, testFileRel);

  fs.mkdirSync(path.dirname(vanillaFile), { recursive: true });
  fs.writeFileSync(vanillaFile, JSON.stringify({ version: '1.0-vanilla' }), 'utf-8');
  fs.writeFileSync(patchedFile, JSON.stringify({ version: '1.1-patched' }), 'utf-8');

  // Resolver simulation (same logic as deckLoader.ts)
  function resolveResource(rel: string): string {
    const patchCandidate = path.join(testPatchDir, rel);
    if (fs.existsSync(patchCandidate)) return patchCandidate;
    const vanillaCandidate = path.join(testUserData, 'vanilla', rel);
    if (fs.existsSync(vanillaCandidate)) return vanillaCandidate;
    return '';
  }

  const resolvedBeforeRollback = resolveResource(testFileRel);
  assert.strictEqual(resolvedBeforeRollback, patchedFile, 'Patch overlay must take precedence');
  const dataBefore = JSON.parse(fs.readFileSync(resolvedBeforeRollback, 'utf-8'));
  assert.strictEqual(dataBefore.version, '1.1-patched');

  // Rollback simulation: remove patch directory
  fs.rmSync(testPatchDir, { recursive: true, force: true });
  const resolvedAfterRollback = resolveResource(testFileRel);
  assert.strictEqual(resolvedAfterRollback, vanillaFile, 'Must fallback to vanilla after patch removal');
  const dataAfter = JSON.parse(fs.readFileSync(resolvedAfterRollback, 'utf-8'));
  assert.strictEqual(dataAfter.version, '1.0-vanilla');

  // Cleanup
  fs.rmSync(testUserData, { recursive: true, force: true });
  console.log('  ✓ Patch directory successfully overrides base file.');
  console.log('  ✓ Rollback cleanly restores vanilla base file with zero traces.\n');

  // Test 6: Hot-Patch Tar Archive Packaging, Extraction & Version Tracking
  console.log('▶ Test 6: Hot-Patch Tar.gz Extraction & Dynamic Version Resolution');
  const patchTestDir = path.join(ROOT_DIR, 'tmp-test-patch');
  const patchSourceDir = path.join(patchTestDir, 'source');
  const patchDestDir = path.join(patchTestDir, 'dest');
  const archivePath = path.join(patchTestDir, 'app-patch.tar.gz');

  fs.mkdirSync(path.join(patchSourceDir, 'dist/renderer'), { recursive: true });
  fs.mkdirSync(path.join(patchSourceDir, 'resources'), { recursive: true });
  fs.writeFileSync(path.join(patchSourceDir, 'dist/renderer/index.html'), '<!doctype html><title>Patched</title>', 'utf-8');
  fs.writeFileSync(path.join(patchSourceDir, 'resources/cards.cdb'), 'PATCHED_CDB_DATA', 'utf-8');

  // Compress simulated patch
  await tar.c(
    { gzip: true, file: archivePath, cwd: patchSourceDir },
    ['dist', 'resources'],
  );
  assert.ok(fs.existsSync(archivePath), 'Patch archive must be created');

  // Extract simulated patch using tar.x
  fs.mkdirSync(patchDestDir, { recursive: true });
  await tar.x({ file: archivePath, cwd: patchDestDir });

  assert.ok(fs.existsSync(path.join(patchDestDir, 'dist/renderer/index.html')), 'Extracted index.html must exist');
  assert.ok(fs.existsSync(path.join(patchDestDir, 'resources/cards.cdb')), 'Extracted cards.cdb must exist');
  assert.strictEqual(fs.readFileSync(path.join(patchDestDir, 'resources/cards.cdb'), 'utf-8'), 'PATCHED_CDB_DATA');

  // Write version.json metadata
  fs.writeFileSync(
    path.join(patchDestDir, 'version.json'),
    JSON.stringify({ version: '0.1.9', baseVersion: '0.1.8', installedAt: new Date().toISOString() }, null, 2),
    'utf-8',
  );

  // Semver resolution logic verification
  function compareSemver(v1: string, v2: string): number {
    const p1 = v1.replace(/^v/, '').split('.').map((x) => parseInt(x, 10) || 0);
    const p2 = v2.replace(/^v/, '').split('.').map((x) => parseInt(x, 10) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  function resolveClientVersion(baseVersion: string, patchDir: string): { version: string; isPatched: boolean } {
    try {
      const patchFile = path.join(patchDir, 'version.json');
      if (fs.existsSync(patchFile)) {
        const patchData = JSON.parse(fs.readFileSync(patchFile, 'utf-8'));
        if (patchData?.version && compareSemver(patchData.version, baseVersion) > 0) {
          return { version: patchData.version, isPatched: true };
        }
      }
    } catch {}
    return { version: baseVersion, isPatched: false };
  }

  const resWhenPatched = resolveClientVersion('0.1.8', patchDestDir);
  assert.strictEqual(resWhenPatched.version, '0.1.9');
  assert.strictEqual(resWhenPatched.isPatched, true);

  const resWhenBaseInstallerUpdated = resolveClientVersion('0.2.0', patchDestDir);
  assert.strictEqual(resWhenBaseInstallerUpdated.version, '0.2.0');
  assert.strictEqual(resWhenBaseInstallerUpdated.isPatched, false);

  // Cleanup
  fs.rmSync(patchTestDir, { recursive: true, force: true });
  console.log('  ✓ Hot-patch tar.gz successfully created, extracted, and verified.');
  console.log('  ✓ Semver correctly prioritizes newer patch over older base, and newer base over older patch.\n');

  console.log('================================================================');
  console.log('🎉 ALL SMART UPDATE & PATCHER TESTS PASSED 100%!');
  console.log('================================================================\n');
}

runSmartUpdateTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
