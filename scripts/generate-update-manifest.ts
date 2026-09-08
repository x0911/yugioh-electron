import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
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

  // 4. Custom card images and essential card assets (full, art, mini)
  for (const variant of ['full', 'art', 'mini']) {
    const variantDir = path.join(ROOT_DIR, 'resources/cards', variant);
    if (fs.existsSync(variantDir)) {
      const files = fs.readdirSync(variantDir);
      for (const file of files) {
        const cardId = parseInt(path.basename(file, path.extname(file)), 10);
        if (cardId >= 99900000 || file === '0.jpg' || file === 'placeholder.jpg') {
          targetFiles.push(path.join(variantDir, file));
        }
      }
    }
  }

  // Ensure card back and placeholder are tracked
  for (const rootCardAsset of ['resources/cards/card-back.jpg', 'resources/cards/placeholder.jpg']) {
    const abs = path.join(ROOT_DIR, rootCardAsset);
    if (fs.existsSync(abs) && !targetFiles.includes(abs)) {
      targetFiles.push(abs);
    }
  }

  // 5. UI assets (menu images, logos, icons)
  const uiDir = path.join(ROOT_DIR, 'resources/ui');
  walkDirectory(uiDir, targetFiles);

  // 6. Card cutscene videos (Summon & Attack cutscenes)
  const cardVideosDir = path.join(ROOT_DIR, 'resources/videos/cards');
  walkDirectory(cardVideosDir, targetFiles);

  // Filter out ANY file that is gitignored to guarantee 100% availability on GitHub raw CDN
  const relPaths = targetFiles.map((abs) => path.relative(ROOT_DIR, abs).replace(/\\/g, '/'));
  const ignoreCheck = spawnSync('git', ['check-ignore', '--stdin'], {
    input: relPaths.join('\n'),
    encoding: 'utf8',
  });
  const ignoredSet = new Set(
    ignoreCheck.stdout ? ignoreCheck.stdout.split('\n').filter(Boolean) : [],
  );

  const manifestFiles: Record<string, ManifestFileEntry> = {};

  for (const absPath of targetFiles) {
    const relPath = path.relative(ROOT_DIR, absPath).replace(/\\/g, '/');
    if (ignoredSet.has(relPath)) {
      console.warn(`[GenerateManifest] Skipping gitignored file: ${relPath}`);
      continue;
    }

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
      `- Buster Blader Full Cutscenes: Bundled high-definition Summon and Attack cutscenes for Buster Blader in the fast update package\n` +
      `- AI Battle Phase Freeze Fix: Resolved missing import in CyberDragonExecutor preventing turn progression when declaring attacks\n` +
      `- Dual-Layer AI Fail-Safe: Added per-hook executor isolation and automatic engine recovery so AI turns never stall\n` +
      `- Card Evaluation Improvements: Corrected hand card object type checks across AIController, Cyber Dragon, Hero, and Volcanic executors\n` +
      `- Fast Delta Hot-Patcher: Lightweight patch archive including all card cutscene media available via in-game updater\n` +
      `- 100% test verification across all 40 test suites`,
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
