import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const OUTPUT_PATH = path.join(ROOT_DIR, 'data/update-manifest.json');

const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
const currentVersion: string = packageJson.version || '0.1.0';

interface ManifestFileEntry {
  path: string;
  size: number;
  sha256: string;
}

interface UpdateManifest {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  remoteBaseUrl: string;
  files: Record<string, ManifestFileEntry>;
}

function getFileSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function walkDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath, fileList);
    } else if (entry.isFile()) {
      if (!entry.name.startsWith('.') && !entry.name.endsWith('.map')) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

export function generateManifest(): UpdateManifest {
  const targetFiles: string[] = [];

  // 1. Core data files
  const dataDir = path.join(ROOT_DIR, 'data');
  for (const file of fs.readdirSync(dataDir)) {
    if (file.endsWith('.json') && file !== 'update-manifest.json') {
      targetFiles.push(path.join(dataDir, file));
    }
  }

  // 2. Card database
  const cdbPath = path.join(ROOT_DIR, 'resources/cards.cdb');
  if (fs.existsSync(cdbPath)) {
    targetFiles.push(cdbPath);
  }

  // 3. Lua scripts
  const scriptsDir = path.join(ROOT_DIR, 'resources/scripts');
  walkDirectory(scriptsDir, targetFiles);

  // 4. Compiled distributions if they exist
  const distDir = path.join(ROOT_DIR, 'dist');
  walkDirectory(distDir, targetFiles);

  // 5. Custom card images and essential card assets (full, art, mini)
  for (const variant of ['full', 'art', 'mini']) {
    const variantDir = path.join(ROOT_DIR, 'resources/cards', variant);
    if (fs.existsSync(variantDir)) {
      const files = fs.readdirSync(variantDir);
      for (const file of files) {
        const cardId = parseInt(path.basename(file, path.extname(file)), 10);
        if (cardId >= 99000000 || file === '0.jpg' || file === 'placeholder.jpg') {
          targetFiles.push(path.join(variantDir, file));
        }
      }
    }
  }

  const manifestFiles: Record<string, ManifestFileEntry> = {};

  for (const absPath of targetFiles) {
    const relPath = path.relative(ROOT_DIR, absPath).replace(/\\/g, '/');
    const stats = fs.statSync(absPath);
    const hash = getFileSha256(absPath);

    manifestFiles[relPath] = {
      path: relPath,
      size: stats.size,
      sha256: hash,
    };
  }

  const manifest: UpdateManifest = {
    version: currentVersion,
    releaseDate: new Date().toISOString(),
    releaseNotes:
      `Yu-Gi-Oh! Duel Arena v${currentVersion}\n` +
      `- Added Egyptian God "Elemental HERO Egyxos" custom monster with Contact Special Summon\n` +
      `- 526 pre-built decks available for all duelists\n` +
      `- HTTP 206 Partial Content Range streaming for cinematic summon videos\n` +
      `- Enhanced LLM AI duelist integration with automated rate-limit fallbacks`,
    remoteBaseUrl: 'https://raw.githubusercontent.com/x0911/yugioh-electron/main',
    files: manifestFiles,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✓ Generated update manifest with ${Object.keys(manifestFiles).length} files for version ${currentVersion}`);
  return manifest;
}

if (process.argv[1] && process.argv[1].endsWith('generate-update-manifest.ts')) {
  generateManifest();
}
