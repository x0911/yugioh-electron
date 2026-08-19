import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

async function main() {
  const root = process.cwd();
  const buildDir = path.join(root, 'build');
  const uiDir = path.join(root, 'resources/ui');
  const iconsDir = path.join(root, 'resources/ui/icons');

  await mkdir(buildDir, { recursive: true });
  await mkdir(uiDir, { recursive: true });
  await mkdir(iconsDir, { recursive: true });

  console.log('[Assets] Processing AI-generated master assets...');

  // 1. App Master Icon (1024x1024)
  const masterIconSrc = '/Users/dash/.gemini/antigravity/brain/75dd9733-6044-4c9e-8783-90784dbff984/app_master_icon_1787112612113.jpg';
  if (existsSync(masterIconSrc)) {
    const dest = path.join(buildDir, 'icon-master.png');
    await sharp(masterIconSrc)
      .resize(1024, 1024, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(dest);
    console.log(`✓ Processed ${dest}`);
  }

  // 2. Character Frame (800x1000)
  const frameSrc = '/Users/dash/.gemini/antigravity/brain/75dd9733-6044-4c9e-8783-90784dbff984/character_frame_1787112632732.jpg';
  if (existsSync(frameSrc)) {
    const dest = path.join(uiDir, 'character-frame.png');
    await sharp(frameSrc)
      .resize(800, 1000, { fit: 'cover' })
      .png({ quality: 95 })
      .toFile(dest);
    console.log(`✓ Processed ${dest}`);
  }

  // 3. Card Image Missing (512x716)
  const missingSrc = '/Users/dash/.gemini/antigravity/brain/75dd9733-6044-4c9e-8783-90784dbff984/card_missing_art_1787112577680.jpg';
  if (existsSync(missingSrc)) {
    const dest = path.join(uiDir, 'card-image-missing.png');
    await sharp(missingSrc)
      .resize(512, 716, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(dest);
    console.log(`✓ Processed ${dest}`);
  }

  // 4. Generate SVG-based Pixel-Crisp UI Icons with Gold & Transparent Gradients
  console.log('[Assets] Generating UI Icons...');

  const ICONS: Record<string, { size: number; svg: string }> = {
    // Menu Emblems (256x256, Gold)
    'menu-start-duel.png': {
      size: 256,
      svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="112" stroke="#c9a227" stroke-width="6" stroke-dasharray="8 8" opacity="0.6"/>
        <circle cx="128" cy="128" r="100" stroke="#f4e4b8" stroke-width="4"/>
        <path d="M72 184L172 84M172 84L184 96L164 116M172 84L160 72L140 92" stroke="#e3c567" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M184 184L84 84M84 84L72 96L92 116M84 84L96 72L116 92" stroke="#f4e4b8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="128" cy="128" r="14" fill="#c9a227" stroke="#f4e4b8" stroke-width="4"/>
      </svg>`,
    },
    'menu-deck-edit.png': {
      size: 256,
      svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="100" stroke="#c9a227" stroke-width="4"/>
        <rect x="64" y="80" width="80" height="110" rx="8" stroke="#8c6e16" stroke-width="6" fill="#12161e"/>
        <rect x="80" y="66" width="80" height="110" rx="8" stroke="#c9a227" stroke-width="6" fill="#181d26"/>
        <rect x="96" y="52" width="80" height="110" rx="8" stroke="#f4e4b8" stroke-width="6" fill="#202734"/>
        <path d="M136 100L180 60L196 76L152 116L132 120L136 100Z" fill="#e3c567" stroke="#f4e4b8" stroke-width="4"/>
        <circle cx="136" cy="107" r="12" fill="#c9a227" opacity="0.6"/>
      </svg>`,
    },
    'menu-settings.png': {
      size: 256,
      svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="100" stroke="#c9a227" stroke-width="4"/>
        <path d="M128 56V72M128 184V200M56 128H72M184 128H200M77 77L88 88M168 168L179 179M77 179L88 168M168 88L179 77" stroke="#e3c567" stroke-width="12" stroke-linecap="round"/>
        <circle cx="128" cy="128" r="48" stroke="#f4e4b8" stroke-width="8" fill="#12161e"/>
        <ellipse cx="128" cy="128" rx="24" ry="14" stroke="#c9a227" stroke-width="4"/>
        <circle cx="128" cy="128" r="6" fill="#f4e4b8"/>
      </svg>`,
    },
    'menu-exit.png': {
      size: 256,
      svg: `
      <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="100" stroke="#c9a227" stroke-width="4"/>
        <path d="M80 64H140C162 64 180 82 180 104V152C180 174 162 192 140 192H80" stroke="#8c6e16" stroke-width="8" stroke-linecap="round"/>
        <path d="M60 128H150M150 128L120 98M150 128L120 158" stroke="#f4e4b8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },

    // HUD Icons (128x128)
    'hud-menu.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="32" width="88" height="12" rx="6" fill="#e3c567" stroke="#f4e4b8" stroke-width="2"/>
        <rect x="20" y="58" width="88" height="12" rx="6" fill="#c9a227" stroke="#f4e4b8" stroke-width="2"/>
        <rect x="20" y="84" width="88" height="12" rx="6" fill="#8c6e16" stroke="#e3c567" stroke-width="2"/>
      </svg>`,
    },
    'hud-duel-log.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 28C32 23.58 35.58 20 40 20H92C96.42 20 100 23.58 100 28V96C100 100.42 96.42 104 92 104H40C35.58 104 32 100.42 32 96V28Z" fill="#181d26" stroke="#c9a227" stroke-width="4"/>
        <line x1="44" y1="36" x2="88" y2="36" stroke="#f4e4b8" stroke-width="4" stroke-linecap="round"/>
        <line x1="44" y1="52" x2="88" y2="52" stroke="#e3c567" stroke-width="4" stroke-linecap="round"/>
        <line x1="44" y1="68" x2="76" y2="68" stroke="#e3c567" stroke-width="4" stroke-linecap="round"/>
        <line x1="44" y1="84" x2="84" y2="84" stroke="#c9a227" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    },
    'hud-field-status.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="24" y="24" width="80" height="80" rx="8" stroke="#c9a227" stroke-width="4" fill="#12161e"/>
        <path d="M24 64H104M64 24V104" stroke="#8c6e16" stroke-width="2"/>
        <ellipse cx="64" cy="64" rx="24" ry="14" stroke="#f4e4b8" stroke-width="4"/>
        <circle cx="64" cy="64" r="6" fill="#c9a227"/>
      </svg>`,
    },
    'hud-activation-confirm.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 16L112 64L64 112L16 64L64 16Z" stroke="#e3c567" stroke-width="4" fill="#12161e"/>
        <path d="M42 66L58 82L86 48" stroke="#3ddc97" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },

    // Field Location Icons (128x128, White/Neutral for Runtime Tinting)
    'location-hand.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="44" y="20" width="40" height="60" rx="4" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.15)"/>
        <path d="M30 100C30 84 40 72 56 72C64 72 70 78 78 78C86 78 92 72 98 76C104 80 102 96 96 108H32" stroke="#ffffff" stroke-width="5" stroke-linecap="round" fill="none"/>
      </svg>`,
    },
    'location-field.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="64,18 106,36 106,92 64,110 22,92 22,36" stroke="#ffffff" stroke-width="5" fill="rgba(255,255,255,0.15)"/>
        <circle cx="64" cy="64" r="18" stroke="#ffffff" stroke-width="4"/>
      </svg>`,
    },
    'location-deck.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="44" width="56" height="74" rx="4" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.1)"/>
        <rect x="36" y="34" width="56" height="74" rx="4" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.2)"/>
        <rect x="44" y="24" width="56" height="74" rx="4" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.3)"/>
      </svg>`,
    },
    'location-extra-deck.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="44" width="56" height="74" rx="4" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.1)"/>
        <rect x="36" y="34" width="56" height="74" rx="4" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.2)"/>
        <rect x="44" y="24" width="56" height="74" rx="4" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.3)"/>
        <polygon points="72,40 76,50 86,52 78,60 80,70 72,64 64,70 66,60 58,52 68,50" fill="#f2c94c"/>
      </svg>`,
    },
    'location-graveyard.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M34 108V52C34 36 46 24 64 24C82 24 94 36 94 52V108H34Z" stroke="#ffffff" stroke-width="5" fill="rgba(255,255,255,0.15)"/>
        <line x1="64" y1="42" x2="64" y2="82" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <line x1="48" y1="56" x2="80" y2="56" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
        <line x1="24" y1="108" x2="104" y2="108" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
      </svg>`,
    },
    'location-banished.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="44" stroke="#ffffff" stroke-width="4" stroke-dasharray="6 6"/>
        <path d="M64 28C78 28 92 40 92 64C92 84 76 96 64 96C48 96 40 80 44 64C48 50 60 48 64 56C68 64 64 72 60 70" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
      </svg>`,
    },

    // Card Status Icons (128x128)
    'status-negated.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64 20L96 34V66C96 86 80 102 64 108C48 102 32 86 32 66V34L64 20Z" stroke="#ffffff" stroke-width="5" fill="rgba(255,255,255,0.15)"/>
        <line x1="36" y1="36" x2="92" y2="92" stroke="#eb5757" stroke-width="8" stroke-linecap="round"/>
      </svg>`,
    },
    'status-no-special-summon.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="64,24 74,48 100,52 80,72 86,98 64,84 42,98 48,72 28,52 54,48" stroke="#ffffff" stroke-width="4" fill="rgba(255,255,255,0.2)"/>
        <line x1="32" y1="32" x2="96" y2="96" stroke="#eb5757" stroke-width="8" stroke-linecap="round"/>
      </svg>`,
    },
    'status-temp-banished.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="44" stroke="#ffffff" stroke-width="4" stroke-dasharray="6 6"/>
        <path d="M52 44H76L64 60L52 44Z" stroke="#f2c94c" stroke-width="3" fill="#f2c94c"/>
        <path d="M52 84H76L64 68L52 84Z" stroke="#f2c94c" stroke-width="3" fill="#f2c94c"/>
      </svg>`,
    },
    'status-fusion-material.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="32" width="44" height="64" rx="4" stroke="#aa55ff" stroke-width="4" fill="rgba(170,85,255,0.2)"/>
        <rect x="56" y="32" width="44" height="64" rx="4" stroke="#55aaff" stroke-width="4" fill="rgba(85,170,255,0.2)"/>
        <path d="M48 64C56 52 72 52 80 64C72 76 56 76 48 64Z" fill="#ffffff"/>
      </svg>`,
    },
    'status-synchro-material.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="64" cy="64" r="38" stroke="#ffffff" stroke-width="4"/>
        <circle cx="64" cy="64" r="26" stroke="#ffffff" stroke-width="3" stroke-dasharray="4 4"/>
        <circle cx="64" cy="64" r="12" fill="#ffffff"/>
      </svg>`,
    },
    'status-destroyed-battle.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="32" y1="96" x2="96" y2="32" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <line x1="96" y1="96" x2="32" y2="32" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
        <path d="M56 64L64 54L72 68L80 58" stroke="#eb5757" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    },
    'status-no-attack.png': {
      size: 128,
      svg: `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="40" y1="88" x2="88" y2="40" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <line x1="88" y1="40" x2="96" y2="48" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <line x1="28" y1="28" x2="100" y2="100" stroke="#eb5757" stroke-width="8" stroke-linecap="round"/>
      </svg>`,
    },
  };

  for (const [filename, data] of Object.entries(ICONS)) {
    const dest = path.join(iconsDir, filename);
    await sharp(Buffer.from(data.svg))
      .resize(data.size, data.size)
      .png({ quality: 100 })
      .toFile(dest);
    console.log(`✓ Generated ${dest}`);
  }

  console.log('[Assets] All image and UI icon generation completed successfully!');
}

main().catch((err) => {
  console.error('[Error generating assets]', err);
  process.exit(1);
});
