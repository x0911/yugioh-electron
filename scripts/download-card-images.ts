import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import Database from 'better-sqlite3';

interface CardEntry {
  id: number;
  name: string;
  era: 'DM' | 'GX' | '5Ds';
  alias?: number;
  type?: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
}

type CardPoolWhitelist = Record<string, CardEntry>;

interface DownloadOptions {
  limit?: number;
  force?: boolean;
  concurrency?: number;
  rateLimitPerSec?: number;
}

// Global configuration
const CARD_WHITELIST_PATH = path.resolve(process.cwd(), 'data/card-pool-whitelist.json');
const FULL_DIR = path.resolve(process.cwd(), 'resources/cards/full');
const ART_DIR = path.resolve(process.cwd(), 'resources/cards/art');
const MINI_DIR = path.resolve(process.cwd(), 'resources/cards/mini');

const PLACEHOLDER_FULL_SIZES = new Set([87124]);
const PLACEHOLDER_MINI_SIZES = new Set([3278, 3133]);
const PLACEHOLDER_ART_SIZES = new Set([38031, 20957]);

const CUSTOM_CARD_IDS = new Set([99900001, 99937011]);

const CDN_FULL_URL = (id: number | string) =>
  `https://images.ygoprodeck.com/images/cards/${id}.jpg`;
const CDN_ART_URL = (id: number | string) =>
  `https://images.ygoprodeck.com/images/cards_cropped/${id}.jpg`;
const CDN_SMALL_URL = (id: number | string) =>
  `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`;

const MINI_TARGET_WIDTH = 96;
const MINI_TARGET_HEIGHT = 140;
const MAX_RETRIES = 4;
const DEFAULT_RATE_LIMIT = 18; // Strict <= 20 req/s to avoid CDN 429
const DEFAULT_CONCURRENCY = 10;

/**
 * Token bucket / rate limiter to enforce strict global requests-per-second limit.
 */
class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  private lastRefill: number;
  private waitQueue: Array<() => void> = [];

  constructor(requestsPerSecond: number) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.refillRate = requestsPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
      this.scheduleDrain();
    });
  }

  private scheduleDrain() {
    if (this.waitQueue.length === 0) return;
    const timeToNextToken = Math.max(10, Math.ceil((1 - this.tokens) / this.refillRate));
    setTimeout(() => {
      this.refill();
      while (this.tokens >= 1 && this.waitQueue.length > 0) {
        this.tokens -= 1;
        const next = this.waitQueue.shift();
        if (next) next();
      }
      if (this.waitQueue.length > 0) {
        this.scheduleDrain();
      }
    }, timeToNextToken);
  }
}

/**
 * Fetch a buffer with exponential backoff retry.
 */
async function fetchWithRetry(
  url: string,
  rateLimiter: RateLimiter,
  retries = MAX_RETRIES,
): Promise<Buffer | null> {
  let attempt = 0;
  while (attempt <= retries) {
    await rateLimiter.acquire();
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'YGO-Desktop-Duel-Offline-Client/0.1.0 (Asset-Pipeline)',
        },
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      if (response.status === 404) {
        // Image not on CDN
        return null;
      }

      if (response.status === 429 || response.status >= 500) {
        attempt++;
        const backoffMs = Math.pow(2, attempt) * 500 + Math.random() * 200;
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }

      // Other non-ok status
      attempt++;
      await new Promise((res) => setTimeout(res, 500));
    } catch {
      attempt++;
      if (attempt > retries) break;
      const backoffMs = Math.pow(2, attempt) * 500 + Math.random() * 200;
      await new Promise((res) => setTimeout(res, backoffMs));
    }
  }
  return null;
}

/**
 * Helper to check if a file exists, has non-zero size, and is not a placeholder file.
 */
function fileIsValid(filePath: string, placeholderSizes?: Set<number> | number): boolean {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size <= 0) return false;
    if (placeholderSizes instanceof Set) {
      if (placeholderSizes.has(stat.size)) return false;
    } else if (placeholderSizes !== undefined) {
      if (stat.size === placeholderSizes) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Process and save mini image with Sharp lanczos3 resizing.
 */
async function saveMiniVariant(inputBuffer: Buffer, targetPath: string): Promise<void> {
  await sharp(inputBuffer)
    .resize(MINI_TARGET_WIDTH, MINI_TARGET_HEIGHT, {
      fit: 'cover',
      kernel: 'lanczos3',
    })
    .jpeg({
      quality: 85,
      progressive: true,
      mozjpeg: true,
    })
    .toFile(targetPath);
}

/**
 * Copy fallback placeholder for a variant.
 */
function copyFallback(targetPath: string, variant: 'full' | 'art' | 'mini') {
  const fallbackPath = path.resolve(process.cwd(), `resources/cards/${variant}/0.jpg`);
  if (fs.existsSync(fallbackPath)) {
    fs.copyFileSync(fallbackPath, targetPath);
  }
}

const nameLookupCache = new Map<
  string,
  { fullUrl?: string; artUrl?: string; smallUrl?: string } | null
>();

/**
 * Fallback to query YGOPRODeck API by card name if ID/alias both 404.
 */
async function lookupByCardName(
  cardName: string,
  rateLimiter: RateLimiter,
): Promise<{ fullUrl?: string; artUrl?: string; smallUrl?: string } | null> {
  const cleanName = cardName.trim();
  if (!cleanName) return null;
  if (nameLookupCache.has(cleanName)) {
    return nameLookupCache.get(cleanName) || null;
  }

  await rateLimiter.acquire();
  try {
    const res = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cleanName)}`,
      {
        headers: {
          'User-Agent': 'YGO-Desktop-Duel-Offline-Client/0.1.0 (Asset-Pipeline)',
        },
      },
    );
    if (!res.ok) {
      nameLookupCache.set(cleanName, null);
      return null;
    }
    const data = (await res.json()) as any;
    if (data?.data?.[0]?.card_images?.[0]) {
      const img = data.data[0].card_images[0];
      const result = {
        fullUrl: img.image_url as string,
        artUrl: img.image_url_cropped as string,
        smallUrl: img.image_url_small as string,
      };
      nameLookupCache.set(cleanName, result);
      return result;
    }
  } catch {
    // Ignore network / parse errors
  }
  nameLookupCache.set(cleanName, null);
  return null;
}

/**
 * Helper to crop the card art frame from a full card image when cropped CDN asset is missing.
 */
async function cropArtFromFull(fullInput: Buffer | string, targetPath: string): Promise<boolean> {
  try {
    const img = sharp(fullInput);
    const meta = await img.metadata();
    if (!meta.width || !meta.height) return false;

    // Standard Yu-Gi-Oh card artwork frame proportions
    const left = Math.round(meta.width * (95 / 813));
    const top = Math.round(meta.height * (217 / 1185));
    const size = Math.round(meta.width * (624 / 813));

    await img
      .extract({ left, top, width: size, height: size })
      .resize(624, 624)
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download all 3 variants for a single card.
 */
async function processCard(
  card: CardEntry,
  rateLimiter: RateLimiter,
  force: boolean,
): Promise<{ full: boolean; art: boolean; mini: boolean; skipped: boolean }> {
  const fullPath = path.join(FULL_DIR, `${card.id}.jpg`);
  const artPath = path.join(ART_DIR, `${card.id}.jpg`);
  const miniPath = path.join(MINI_DIR, `${card.id}.jpg`);

  let fullExists = !force && fileIsValid(fullPath, PLACEHOLDER_FULL_SIZES);
  let artExists = !force && fileIsValid(artPath, PLACEHOLDER_ART_SIZES);
  let miniExists = !force && fileIsValid(miniPath, PLACEHOLDER_MINI_SIZES);

  if (fullExists && artExists && miniExists) {
    return { full: true, art: true, mini: true, skipped: true };
  }

  // If this card has an alias and the alias images already exist locally, copy them directly
  if (card.alias && card.alias > 0) {
    const aliasFullPath = path.join(FULL_DIR, `${card.alias}.jpg`);
    const aliasArtPath = path.join(ART_DIR, `${card.alias}.jpg`);
    const aliasMiniPath = path.join(MINI_DIR, `${card.alias}.jpg`);

    if (!fullExists && fileIsValid(aliasFullPath, PLACEHOLDER_FULL_SIZES)) {
      try {
        fs.copyFileSync(aliasFullPath, fullPath);
        fullExists = true;
      } catch {}
    }
    if (!artExists && fileIsValid(aliasArtPath, PLACEHOLDER_ART_SIZES)) {
      try {
        fs.copyFileSync(aliasArtPath, artPath);
        artExists = true;
      } catch {}
    }
    if (!miniExists && fileIsValid(aliasMiniPath, PLACEHOLDER_MINI_SIZES)) {
      try {
        fs.copyFileSync(aliasMiniPath, miniPath);
        miniExists = true;
      } catch {}
    }

    if (fullExists && artExists && miniExists) {
      return { full: true, art: true, mini: true, skipped: false };
    }
  }

  // Custom cards (e.g. 99900001 Egyxos) have no official CDN imagery; preserve local files
  if (CUSTOM_CARD_IDS.has(card.id)) {
    let miniSuccess = miniExists;
    let artSuccessCustom = artExists;
    if (fullExists && !miniExists) {
      try {
        const fullLocalBuf = fs.readFileSync(fullPath);
        await saveMiniVariant(fullLocalBuf, miniPath);
        miniSuccess = true;
      } catch {
        copyFallback(miniPath, 'mini');
      }
    }
    if (fullExists && !artExists) {
      const cropped = await cropArtFromFull(fullPath, artPath);
      if (cropped) artSuccessCustom = true;
      else copyFallback(artPath, 'art');
    }
    return {
      full: fullExists,
      art: artSuccessCustom,
      mini: miniSuccess,
      skipped: true,
    };
  }

  let fullSuccess = fullExists;
  let artSuccess = artExists;
  let miniSuccess = miniExists;
  let downloadedFullBuf: Buffer | null = null;
  let nameFallbackAttempted = false;
  let nameInfo: { fullUrl?: string; artUrl?: string; smallUrl?: string } | null = null;

  // 1. Full Image
  if (!fullExists) {
    let fullBuf = await fetchWithRetry(CDN_FULL_URL(card.id), rateLimiter);
    if (!fullBuf && card.alias && card.alias > 0) {
      fullBuf = await fetchWithRetry(CDN_FULL_URL(card.alias), rateLimiter);
    }
    if (!fullBuf) {
      if (!nameFallbackAttempted) {
        nameFallbackAttempted = true;
        nameInfo = await lookupByCardName(card.name, rateLimiter);
      }
      if (nameInfo?.fullUrl) {
        fullBuf = await fetchWithRetry(nameInfo.fullUrl, rateLimiter);
      }
    }

    if (fullBuf) {
      fs.writeFileSync(fullPath, fullBuf);
      fullSuccess = true;
      downloadedFullBuf = fullBuf;
    } else {
      copyFallback(fullPath, 'full');
    }
  }

  // 2. Cropped Art Image
  if (!artExists) {
    let artBuf = await fetchWithRetry(CDN_ART_URL(card.id), rateLimiter);
    if (!artBuf && card.alias && card.alias > 0) {
      artBuf = await fetchWithRetry(CDN_ART_URL(card.alias), rateLimiter);
    }
    if (!artBuf) {
      if (!nameFallbackAttempted) {
        nameFallbackAttempted = true;
        nameInfo = await lookupByCardName(card.name, rateLimiter);
      }
      if (nameInfo?.artUrl) {
        artBuf = await fetchWithRetry(nameInfo.artUrl, rateLimiter);
      }
    }

    if (artBuf) {
      fs.writeFileSync(artPath, artBuf);
      artSuccess = true;
    } else if (downloadedFullBuf) {
      const cropped = await cropArtFromFull(downloadedFullBuf, artPath);
      if (cropped) artSuccess = true;
      else copyFallback(artPath, 'art');
    } else if (fileIsValid(fullPath, PLACEHOLDER_FULL_SIZES)) {
      const cropped = await cropArtFromFull(fullPath, artPath);
      if (cropped) artSuccess = true;
      else copyFallback(artPath, 'art');
    } else {
      copyFallback(artPath, 'art');
    }
  }

  // 3. Mini Image (generate from full image buffer or local full file, with fallback to small CDN URL)
  if (!miniExists) {
    let sourceBuf = downloadedFullBuf;
    if (!sourceBuf && fileIsValid(fullPath, PLACEHOLDER_FULL_SIZES)) {
      try {
        sourceBuf = fs.readFileSync(fullPath);
      } catch {}
    }

    if (!sourceBuf) {
      let smallBuf = await fetchWithRetry(CDN_SMALL_URL(card.id), rateLimiter);
      if (!smallBuf && card.alias && card.alias > 0) {
        smallBuf = await fetchWithRetry(CDN_SMALL_URL(card.alias), rateLimiter);
      }
      if (!smallBuf) {
        if (!nameFallbackAttempted) {
          nameFallbackAttempted = true;
          nameInfo = await lookupByCardName(card.name, rateLimiter);
        }
        if (nameInfo?.smallUrl) {
          smallBuf = await fetchWithRetry(nameInfo.smallUrl, rateLimiter);
        }
      }
      sourceBuf = smallBuf;
    }

    if (sourceBuf) {
      try {
        await saveMiniVariant(sourceBuf, miniPath);
        miniSuccess = true;
      } catch {
        copyFallback(miniPath, 'mini');
      }
    } else {
      copyFallback(miniPath, 'mini');
    }
  }

  return {
    full: fullSuccess,
    art: artSuccess,
    mini: miniSuccess,
    skipped: false,
  };
}

/**
 * Download official card-back image from official server/CDN.
 */
async function downloadCardBack(rateLimiter: RateLimiter): Promise<void> {
  const cardBackPath = path.resolve(process.cwd(), 'resources/cards/card-back.jpg');
  const uiCardBackPath = path.resolve(process.cwd(), 'resources/ui/card-back.png');
  const miniCardBackPath = path.resolve(process.cwd(), 'resources/cards/mini/card-back.jpg');

  if (fileIsValid(cardBackPath) && fileIsValid(uiCardBackPath) && fileIsValid(miniCardBackPath)) {
    return;
  }

  console.log('[INFO] Downloading official card back image from server...');
  // Attempt high-res official Yugipedia asset first, fallback to YGOPRODeck back.jpg
  let buf: Buffer | null = await fetchWithRetry(
    'https://ms.yugipedia.com/e/e5/Back-EN.png',
    rateLimiter,
  );
  if (!buf) {
    buf = await fetchWithRetry('https://images.ygoprodeck.com/images/cards/back.jpg', rateLimiter);
  }

  if (buf) {
    try {
      await sharp(buf)
        .resize(813, 1185, { fit: 'cover' })
        .jpeg({ quality: 95, progressive: true })
        .toFile(cardBackPath);

      await sharp(buf).resize(813, 1185, { fit: 'cover' }).png().toFile(uiCardBackPath);

      await sharp(buf)
        .resize(MINI_TARGET_WIDTH, MINI_TARGET_HEIGHT, { fit: 'cover', kernel: 'lanczos3' })
        .jpeg({ quality: 90 })
        .toFile(miniCardBackPath);

      console.log('[INFO] Successfully downloaded and optimized official card back assets.');
    } catch (err) {
      console.warn('[WARN] Failed to process official card back image:', err);
    }
  }
}

/**
 * Main downloader routine.
 */
async function main() {
  const args = process.argv.slice(2);
  const options: DownloadOptions = {
    force: args.includes('--force'),
    concurrency: DEFAULT_CONCURRENCY,
    rateLimitPerSec: DEFAULT_RATE_LIMIT,
  };

  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    options.limit = parseInt(args[limitIndex + 1], 10);
  }

  const concurrencyIndex = args.indexOf('--concurrency');
  if (concurrencyIndex !== -1 && args[concurrencyIndex + 1]) {
    options.concurrency = parseInt(args[concurrencyIndex + 1], 10);
  }

  console.log('===============================================================');
  console.log('      Yu-Gi-Oh! Desktop Duel — Offline Card Asset Pipeline    ');
  console.log('===============================================================');

  if (!fs.existsSync(CARD_WHITELIST_PATH)) {
    console.error(`[ERROR] Whitelist file not found at: ${CARD_WHITELIST_PATH}`);
    console.error('Run "npm run build:cards" first to build the card whitelist.');
    process.exit(1);
  }

  // Ensure directories exist
  [FULL_DIR, ART_DIR, MINI_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const eraIndex = args.indexOf('--era');
  const targetEra = eraIndex !== -1 ? args[eraIndex + 1] : undefined;

  const decksOnly = args.includes('--decks-only');

  const whitelistContent = fs.readFileSync(CARD_WHITELIST_PATH, 'utf-8');
  const whitelist: CardPoolWhitelist = JSON.parse(whitelistContent);
  let cardList = Object.values(whitelist);

  // Read alias information and any extra cards from resources/cards.cdb
  const CDB_PATH = path.resolve(process.cwd(), 'resources/cards.cdb');
  if (fs.existsSync(CDB_PATH)) {
    try {
      const db = new Database(CDB_PATH, { readonly: true });
      const rows = db.prepare('SELECT id, alias FROM datas').all() as Array<{
        id: number;
        alias: number;
      }>;
      const names = db.prepare('SELECT id, name FROM texts').all() as Array<{
        id: number;
        name: string;
      }>;
      const nameMap = new Map<number, string>();
      for (const n of names) nameMap.set(n.id, n.name);

      const aliasMap = new Map<number, number>();
      for (const r of rows) {
        if (r.alias > 0) aliasMap.set(r.id, r.alias);
      }

      for (const card of cardList) {
        const alias = aliasMap.get(card.id);
        if (alias) {
          card.alias = alias;
        }
      }

      const existingIds = new Set(cardList.map((c) => c.id));
      let addedFromCdb = 0;
      for (const r of rows) {
        if (!existingIds.has(r.id)) {
          cardList.push({
            id: r.id,
            name: nameMap.get(r.id) || `Card #${r.id}`,
            era: 'DM',
            alias: r.alias > 0 ? r.alias : undefined,
          });
          existingIds.add(r.id);
          addedFromCdb++;
        }
      }

      console.log(
        `[INFO] Loaded ${aliasMap.size} card aliases from ${CDB_PATH}` +
          (addedFromCdb > 0 ? ` (${addedFromCdb} added from CDB)` : ''),
      );
      db.close();
    } catch (err) {
      console.warn('[WARN] Could not read aliases from cards.cdb:', err);
    }
  }

  if (targetEra) {
    cardList = cardList.filter((c) => c.era === targetEra);
    console.log(`[INFO] Filtering by era: ${targetEra} (${cardList.length} cards matched).`);
  }

  if (decksOnly) {
    const deckCards = new Set<number>();
    const charsPath = path.resolve(process.cwd(), 'data/characters.json');
    if (fs.existsSync(charsPath)) {
      const chars = JSON.parse(fs.readFileSync(charsPath, 'utf-8'));
      for (const char of chars) {
        for (const d of char.decks || []) {
          for (const id of d.mainCards || []) deckCards.add(id);
          for (const id of d.extraCards || []) deckCards.add(id);
        }
      }
    }
    const prebuiltPath = path.resolve(process.cwd(), 'data/prebuilt-decks.json');
    if (fs.existsSync(prebuiltPath)) {
      const prebuilt = JSON.parse(fs.readFileSync(prebuiltPath, 'utf-8'));
      for (const d of prebuilt) {
        for (const id of d.main || []) deckCards.add(id);
        for (const id of d.extra || []) deckCards.add(id);
      }
    }
    cardList = cardList.filter((c) => deckCards.has(c.id));
    console.log(`[INFO] Filtering to deck cards only (${cardList.length} cards matched).`);
  }

  if (options.limit && options.limit > 0) {
    cardList = cardList.slice(0, options.limit);
    console.log(`[INFO] Limiting download to first ${options.limit} cards (--limit).`);
  }

  const totalCards = cardList.length;
  console.log(`[INFO] Target card count: ${totalCards.toLocaleString()} cards`);
  console.log(
    `[INFO] Rate limit: ~${options.rateLimitPerSec} req/s | Concurrency: ${options.concurrency}`,
  );
  console.log(
    `[INFO] Target mini resolution: ${MINI_TARGET_WIDTH}x${MINI_TARGET_HEIGHT}px (Sharp lanczos3)`,
  );
  console.log('---------------------------------------------------------------');

  const rateLimiter = new RateLimiter(options.rateLimitPerSec || DEFAULT_RATE_LIMIT);
  await downloadCardBack(rateLimiter);

  let completed = 0;
  let skippedCount = 0;
  let downloadedCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  let lastLogTime = 0;
  const logProgress = (final = false) => {
    const now = Date.now();
    if (!final && now - lastLogTime < 500) return;
    lastLogTime = now;

    const elapsedSec = (now - startTime) / 1000;
    const speed = elapsedSec > 0 ? (downloadedCount / elapsedSec).toFixed(1) : '0.0';
    const percent = ((completed / totalCards) * 100).toFixed(1);
    const remainingCards = totalCards - completed;
    const estRemainingSec =
      speed > '0' && parseFloat(speed) > 0 ? Math.round(remainingCards / parseFloat(speed)) : 0;
    const etaFormatted =
      estRemainingSec > 60
        ? `${Math.floor(estRemainingSec / 60)}m ${estRemainingSec % 60}s`
        : `${estRemainingSec}s`;

    const progressLine =
      `\r[PROGRESS] ${completed}/${totalCards} (${percent}%) | ` +
      `New: ${downloadedCount} | Skipped: ${skippedCount} | Speed: ${speed} cards/s | ` +
      `ETA: ${etaFormatted}  `;

    process.stdout.write(progressLine);
  };

  // Run in chunks with concurrency pool
  let activeIndex = 0;
  const worker = async () => {
    while (activeIndex < cardList.length) {
      const idx = activeIndex++;
      const card = cardList[idx];
      try {
        const result = await processCard(card, rateLimiter, options.force || false);
        completed++;
        if (result.skipped) {
          skippedCount++;
        } else {
          downloadedCount++;
        }
        if (!result.full || !result.art || !result.mini) {
          errorCount++;
        }
        logProgress();
      } catch {
        completed++;
        errorCount++;
        logProgress();
      }
    }
  };

  const pool = Array.from({ length: options.concurrency || DEFAULT_CONCURRENCY }, () => worker());
  await Promise.all(pool);
  logProgress(true);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n---------------------------------------------------------------');
  console.log(`[COMPLETE] Download pipeline finished in ${totalTime}s`);
  console.log(`- Total processed: ${completed}`);
  console.log(`- Downloaded: ${downloadedCount}`);
  console.log(`- Existing (skipped): ${skippedCount}`);
  console.log(`- Fallbacks / warnings: ${errorCount}`);
  console.log('===============================================================');
}

main().catch((err) => {
  console.error('\n[FATAL ERROR]', err);
  process.exit(1);
});
