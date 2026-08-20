import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const iconsDir = path.join(buildDir, 'icons');

async function generateIcons() {
  console.log('[generate-icons] Generating icon assets for electron-builder...');

  const masterIconPath = path.join(buildDir, 'icon-master.png');
  if (!fs.existsSync(masterIconPath)) {
    console.error('[generate-icons] Error: build/icon-master.png not found!');
    process.exit(1);
  }

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

  for (const size of sizes) {
    const outPath = path.join(iconsDir, `${size}x${size}.png`);
    await sharp(masterIconPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`  ✓ Generated build/icons/${size}x${size}.png`);
  }

  // Generate primary build/icon.png (512x512)
  const primaryIconPath = path.join(buildDir, 'icon.png');
  await sharp(masterIconPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(primaryIconPath);
  console.log('  ✓ Generated build/icon.png (512x512)');

  // Generate public favicon for renderer
  const publicFaviconPath = path.join(rootDir, 'src/renderer/assets/icon.png');
  await sharp(masterIconPath)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(publicFaviconPath);
  console.log('  ✓ Generated src/renderer/assets/icon.png');

  console.log('[generate-icons] All icon assets successfully generated!');
}

generateIcons().catch((err) => {
  console.error('[generate-icons] Failed generating icons:', err);
  process.exit(1);
});
