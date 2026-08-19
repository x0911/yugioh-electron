import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

interface CardEntry {
  id: number;
  name: string;
  era: 'DM' | 'GX';
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
 * Helper to check if a file exists and has non-zero size.
 */
function fileIsValid(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath);
    return stat.size > 0;
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

  const fullExists = !force && fileIsValid(fullPath);
  const artExists = !force && fileIsValid(artPath);
  const miniExists = !force && fileIsValid(miniPath);

  if (fullExists && artExists && miniExists) {
    return { full: true, art: true, mini: true, skipped: true };
  }

  let fullSuccess = fullExists;
  let artSuccess = artExists;
  let miniSuccess = miniExists;

  // 1. Full Image
  if (!fullExists) {
    const fullBuf = await fetchWithRetry(CDN_FULL_URL(card.id), rateLimiter);
    if (fullBuf) {
      fs.writeFileSync(fullPath, fullBuf);
      fullSuccess = true;
    } else {
      copyFallback(fullPath, 'full');
    }
  }

  // 2. Cropped Art Image
  if (!artExists) {
    const artBuf = await fetchWithRetry(CDN_ART_URL(card.id), rateLimiter);
    if (artBuf) {
      fs.writeFileSync(artPath, artBuf);
      artSuccess = true;
    } else {
      copyFallback(artPath, 'art');
    }
  }

  // 3. Mini Image (fetch small CDN variant, re-encode to 96x140 JPEG with Sharp)
  if (!miniExists) {
    // Prefer small CDN image as source for resizing to save bandwidth, fallback to full buffer if needed
    const smallBuf = await fetchWithRetry(CDN_SMALL_URL(card.id), rateLimiter);
    if (smallBuf) {
      try {
        await saveMiniVariant(smallBuf, miniPath);
        miniSuccess = true;
      } catch {
        copyFallback(miniPath, 'mini');
      }
    } else if (fileIsValid(fullPath)) {
      try {
        const fullLocalBuf = fs.readFileSync(fullPath);
        await saveMiniVariant(fullLocalBuf, miniPath);
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

  const whitelistContent = fs.readFileSync(CARD_WHITELIST_PATH, 'utf-8');
  const whitelist: CardPoolWhitelist = JSON.parse(whitelistContent);
  let cardList = Object.values(whitelist);

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
