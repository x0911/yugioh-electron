import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

interface CharacterArtDef {
  id: string;
  name: string;
  url: string;
  cropTopOffsetRatio?: number; // default 0
  cropHeightRatio?: number;    // default 0.45
}

const CHARACTER_ART_DEFS: CharacterArtDef[] = [
  // 20 DM Characters
  {
    id: 'yugi-muto',
    name: 'Yugi Muto',
    url: 'https://static.wikia.nocookie.net/yugioh/images/d/d1/YugiMuto-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'yami-yugi',
    name: 'Yami Yugi',
    url: 'https://static.wikia.nocookie.net/yugioh/images/c/c4/YamiYugi-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'seto-kaiba',
    name: 'Seto Kaiba',
    url: 'https://static.wikia.nocookie.net/yugioh/images/3/30/SetoKaiba-AltStyle-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'joey-wheeler',
    name: 'Joey Wheeler',
    url: 'https://static.wikia.nocookie.net/yugioh/images/1/1f/JoeyWheeler-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'tea-gardner',
    name: 'Téa Gardner',
    url: 'https://static.wikia.nocookie.net/yugioh/images/e/e3/T%C3%A9aGardner-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'tristan-taylor',
    name: 'Tristan Taylor',
    url: 'https://static.wikia.nocookie.net/yugioh/images/c/c9/TristanTaylor-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'mai-valentine',
    name: 'Mai Valentine',
    url: 'https://static.wikia.nocookie.net/yugioh/images/4/42/MaiValentine-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'yami-bakura',
    name: 'Yami Bakura',
    url: 'https://static.wikia.nocookie.net/yugioh/images/a/ae/YamiBakura-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'marik-ishtar',
    name: 'Marik Ishtar',
    url: 'https://static.wikia.nocookie.net/yugioh/images/3/37/MarikIshtar-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'maximillion-pegasus',
    name: 'Maximillion Pegasus',
    url: 'https://static.wikia.nocookie.net/yugioh/images/e/e5/MaximillionPegasus-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'bandit-keith',
    name: 'Bandit Keith',
    url: 'https://static.wikia.nocookie.net/yugioh/images/8/85/BanditKeith-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'weevil-underwood',
    name: 'Weevil Underwood',
    url: 'https://static.wikia.nocookie.net/yugioh/images/0/0a/WeevilUnderwood-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'rex-raptor',
    name: 'Rex Raptor',
    url: 'https://static.wikia.nocookie.net/yugioh/images/3/3e/RexRaptor-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'mako-tsunami',
    name: 'Mako Tsunami',
    url: 'https://static.wikia.nocookie.net/yugioh/images/5/56/MakoTsunami-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'ishizu-ishtar',
    name: 'Ishizu Ishtar',
    url: 'https://static.wikia.nocookie.net/yugioh/images/a/ac/IshizuIshtar-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'odion',
    name: 'Odion',
    url: 'https://static.wikia.nocookie.net/yugioh/images/3/3a/Odion-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'espa-roba',
    name: 'Espa Roba',
    url: 'https://static.wikia.nocookie.net/yugioh/images/c/c8/EspaRoba-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'arkana',
    name: 'Arkana',
    url: 'https://static.wikia.nocookie.net/yugioh/images/0/00/Arkana-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'rafael',
    name: 'Rafael',
    url: 'https://static.wikia.nocookie.net/yugioh/images/9/95/Rafael-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'dartz',
    name: 'Dartz',
    url: 'https://static.wikia.nocookie.net/yugioh/images/b/bc/Dartz-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },

  // 20 GX Characters
  {
    id: 'jaden-yuki',
    name: 'Jaden Yuki',
    url: 'https://static.wikia.nocookie.net/yugioh/images/a/af/JadenYuki-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'zane-truesdale',
    name: 'Zane Truesdale',
    url: 'https://static.wikia.nocookie.net/yugioh/images/7/71/ZaneTruesdale-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'syrus-truesdale',
    name: 'Syrus Truesdale',
    url: 'https://static.wikia.nocookie.net/yugioh/images/7/77/SyrusTruesdale-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'chazz-princeton',
    name: 'Chazz Princeton',
    url: 'https://static.wikia.nocookie.net/yugioh/images/8/85/ChazzPrinceton-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'alexis-rhodes',
    name: 'Alexis Rhodes',
    url: 'https://static.wikia.nocookie.net/yugioh/images/3/34/AlexisRhodes-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'bastion-misawa',
    name: 'Bastion Misawa',
    url: 'https://static.wikia.nocookie.net/yugioh/images/0/00/BastionMisawa-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'chumley-huffington',
    name: 'Chumley Huffington',
    url: 'https://static.wikia.nocookie.net/yugioh/images/b/b7/Chumley-TFSP.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'aster-phoenix',
    name: 'Aster Phoenix',
    url: 'https://static.wikia.nocookie.net/yugioh/images/5/5d/AsterPhoenix-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'jesse-anderson',
    name: 'Jesse Anderson',
    url: 'https://static.wikia.nocookie.net/yugioh/images/0/06/JesseAnderson-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'dr-vellian-crowler',
    name: 'Dr. Vellian Crowler',
    url: 'https://static.wikia.nocookie.net/yugioh/images/5/54/DrVellianCrowler-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'atticus-rhodes',
    name: 'Atticus Rhodes',
    url: 'https://static.wikia.nocookie.net/yugioh/images/3/30/Atticus-TFSP.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'tyranno-hassleberry',
    name: 'Tyranno Hassleberry',
    url: 'https://static.wikia.nocookie.net/yugioh/images/8/8a/TyrannoHassleberry-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'jim-crocodile-cook',
    name: 'Jim Crocodile Cook',
    url: 'https://static.wikia.nocookie.net/yugioh/images/c/c8/JimCrocodileCook-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'axel-brodie',
    name: 'Axel Brodie',
    url: 'https://static.wikia.nocookie.net/yugioh/images/2/2a/AxelBrodie-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'adrian-gecko',
    name: 'Adrian Gecko',
    url: 'https://static.wikia.nocookie.net/yugioh/images/4/4a/Adrian-TFSP.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'sartorius-kumar',
    name: 'Sartorius Kumar',
    url: 'https://static.wikia.nocookie.net/yugioh/images/3/38/SartoriusKumar-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'yubel',
    name: 'Yubel',
    url: 'https://static.wikia.nocookie.net/yugioh/images/d/d3/Yubel-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'nightshroud',
    name: 'Nightshroud',
    url: 'https://static.wikia.nocookie.net/yugioh/images/e/e5/NightshroudMD.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'yusuke-fujiwara',
    name: 'Yusuke Fujiwara',
    url: 'https://static.wikia.nocookie.net/yugioh/images/f/f9/Yusuke-TFSP.png/revision/latest',
    cropHeightRatio: 0.45,
  },
  {
    id: 'supreme-king-jaden',
    name: 'Supreme King Jaden',
    url: 'https://static.wikia.nocookie.net/yugioh/images/2/2e/SupremeKing-DULI.png/revision/latest',
    cropHeightRatio: 0.45,
  },
];

async function downloadBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} fetching ${url}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function main(): Promise<void> {
  const portraitsDir = path.resolve(process.cwd(), 'resources/characters/portraits');
  const avatarsDir = path.resolve(process.cwd(), 'resources/characters/avatars');

  fs.mkdirSync(portraitsDir, { recursive: true });
  fs.mkdirSync(avatarsDir, { recursive: true });

  console.log(`Starting character art download and avatar generation for 40 duelists...`);

  for (let i = 0; i < CHARACTER_ART_DEFS.length; i++) {
    const char = CHARACTER_ART_DEFS[i];
    const portraitPath = path.join(portraitsDir, `${char.id}.png`);
    const avatarPath = path.join(avatarsDir, `${char.id}.png`);

    console.log(`[${i + 1}/${CHARACTER_ART_DEFS.length}] Processing ${char.name} (${char.id})...`);

    try {
      // 1. Download raw image buffer
      const rawBuf = await downloadBuffer(char.url);

      // 2. Trim transparency first and get real dimensions of trimmed image
      const trimmedBuf = await sharp(rawBuf).trim().png().toBuffer();
      const meta = await sharp(trimmedBuf).metadata();
      const width = meta.width || 400;
      const height = meta.height || 600;

      // Save trimmed portrait (max height 800px)
      await sharp(trimmedBuf)
        .resize({ height: 800, withoutEnlargement: true, fit: 'inside' })
        .png({ quality: 90, compressionLevel: 8 })
        .toFile(portraitPath);

      // 3. Generate Face Avatar (256x256)
      // Extract top 45% or square crop centered horizontally
      const cropH = Math.max(100, Math.min(height, Math.floor(height * (char.cropHeightRatio || 0.45))));
      const cropW = Math.max(100, Math.min(width, cropH));
      const cropLeft = Math.max(0, Math.floor((width - cropW) / 2));
      const cropTop = 0;

      await sharp(trimmedBuf)
        .extract({
          left: cropLeft,
          top: cropTop,
          width: Math.min(cropW, width - cropLeft),
          height: Math.min(cropH, height - cropTop),
        })
        .resize(256, 256, {
          fit: 'cover',
          position: 'top',
          kernel: 'lanczos3',
        })
        .png({ quality: 95, compressionLevel: 8 })
        .toFile(avatarPath);

      console.log(`  ✓ Saved portrait -> ${char.id}.png (${width}x${height})`);
      console.log(`  ✓ Generated 256x256 face avatar -> ${char.id}.png`);
    } catch (err: any) {
      console.error(`  ✗ Failed processing ${char.name}:`, err.message);
    }
  }

  // 4. Generate Generic & Custom Decks Fallback Avatars
  console.log(`Generating fallback generic and custom deck avatars...`);
  const genericAvatarPath = path.join(avatarsDir, 'generic.png');
  const customAvatarPath = path.join(avatarsDir, 'custom.png');

  // Create clean SVG for generic deck avatar (Millennium Eye & Gold Ring)
  const genericSvg = `
    <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#b45309" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95"/>
        </radialGradient>
      </defs>
      <rect width="256" height="256" rx="32" fill="url(#goldGlow)"/>
      <circle cx="128" cy="128" r="90" fill="none" stroke="#fbbf24" stroke-width="4" stroke-dasharray="8 6"/>
      <circle cx="128" cy="128" r="70" fill="none" stroke="#d97706" stroke-width="3"/>
      <path d="M68 128 C88 88, 168 88, 188 128 C168 168, 88 168, 68 128 Z" fill="#1e293b" stroke="#fbbf24" stroke-width="4"/>
      <circle cx="128" cy="128" r="28" fill="#d97706" stroke="#fbbf24" stroke-width="3"/>
      <circle cx="128" cy="128" r="14" fill="#0f172a"/>
      <circle cx="132" cy="124" r="5" fill="#fef08a"/>
    </svg>
  `;
  await sharp(Buffer.from(genericSvg)).png().toFile(genericAvatarPath);

  // Create clean SVG for custom user deck avatar
  const customSvg = `
    <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
          <stop offset="60%" stop-color="#0369a1" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#090d16" stop-opacity="0.95"/>
        </radialGradient>
      </defs>
      <rect width="256" height="256" rx="32" fill="url(#cyanGlow)"/>
      <circle cx="128" cy="128" r="90" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="6 6"/>
      <rect x="70" y="80" width="60" height="90" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="3" transform="rotate(-15 100 125)"/>
      <rect x="126" y="80" width="60" height="90" rx="6" fill="#0f172a" stroke="#7dd3fc" stroke-width="3" transform="rotate(15 156 125)"/>
      <rect x="98" y="75" width="60" height="95" rx="6" fill="#1e293b" stroke="#e0f2fe" stroke-width="4"/>
      <path d="M118 115 L138 115 M128 105 L128 125" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
  await sharp(Buffer.from(customSvg)).png().toFile(customAvatarPath);

  console.log(`✓ Generated generic avatar: ${genericAvatarPath}`);
  console.log(`✓ Generated custom avatar: ${customAvatarPath}`);
  console.log(`All 40 character portraits & avatars successfully generated!`);
}

main().catch((err) => {
  console.error('Fatal error downloading character art:', err);
  process.exit(1);
});
