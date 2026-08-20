// =============================================================================
// Media & Asset URL Resolvers (Local App-Resource Scheme with Fallbacks)
// =============================================================================

export type CardImageVariant = 'mini' | 'full' | 'art';

/**
 * Returns the URL for a card image variant.
 * In Electron environment, uses the registered `app-resource://` protocol.
 */
export function getCardImageUrl(cardId: number, variant: CardImageVariant = 'mini'): string {
  if (!cardId || cardId <= 0) {
    return 'app-resource://cards/placeholder.jpg';
  }
  return `app-resource://cards/${variant}/${cardId}.jpg`;
}

/**
 * Returns the official card-back image URL.
 */
export function getCardBackUrl(): string {
  return 'app-resource://cards/card-back.jpg';
}

/**
 * Returns the placeholder card image URL.
 */
export function getCardPlaceholderUrl(): string {
  return 'app-resource://cards/placeholder.jpg';
}

/**
 * Returns the coin heads face image URL.
 */
export function getCoinHeadsUrl(): string {
  return 'app-resource://ui/coin-heads.png';
}

/**
 * Returns the coin tails face image URL.
 */
export function getCoinTailsUrl(): string {
  return 'app-resource://ui/coin-tails.png';
}

/**
 * Returns the coin edge sliver image URL.
 */
export function getCoinEdgeUrl(): string {
  return 'app-resource://ui/coin-edge.png';
}

/**
 * Returns the character intro video URL.
 */
export function getCharacterVideoUrl(characterId: string): string {
  return `app-resource://videos/characters/${characterId}.mp4`;
}

/**
 * Returns the character portrait image URL.
 */
export function getCharacterPortraitUrl(characterId: string): string {
  return `app-resource://characters/portraits/${characterId}.png`;
}

/**
 * Returns background image URL by name.
 */
export function getBackgroundUrl(name: string): string {
  return `app-resource://backgrounds/${name}.jpg`;
}

/**
 * Returns menu card image URL by name ('duel' | 'deck' | 'settings' | 'exit').
 */
export function getMenuCardImageUrl(name: string): string {
  return `app-resource://ui/menu-${name}.jpg`;
}

/**
 * Returns the URL for a HUD/UI icon asset.
 */
export function getUiIconUrl(name: string): string {
  return `app-resource://ui/icons/${name}.png`;
}

/**
 * Returns location indicator icon URL.
 */
export function getLocationIconUrl(location: string): string {
  return `app-resource://ui/icons/location-${location}.png`;
}

/**
 * Returns status indicator icon URL.
 */
export function getStatusIconUrl(status: string): string {
  return `app-resource://ui/icons/status-${status}.png`;
}

/**
 * In-Memory LRU Image Cache (architecture.md §9)
 * Preloads and retains decoded image objects in memory to prevent refetches / layout shifts on hover.
 */
const MAX_CACHE_SIZE = 150;
const imageLruCache = new Map<string, HTMLImageElement>();

/**
 * Preloads a card image into the in-memory LRU cache.
 */
export function preloadCardImage(cardId: number, variant: CardImageVariant = 'full'): void {
  if (!cardId || cardId <= 0 || typeof window === 'undefined' || typeof Image === 'undefined') {
    return;
  }
  const url = getCardImageUrl(cardId, variant);
  if (imageLruCache.has(url)) {
    // Refresh position in LRU cache
    const img = imageLruCache.get(url)!;
    imageLruCache.delete(url);
    imageLruCache.set(url, img);
    return;
  }

  // Evict oldest item if at capacity
  if (imageLruCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = imageLruCache.keys().next().value;
    if (oldestKey) {
      imageLruCache.delete(oldestKey);
    }
  }

  const img = new Image();
  img.src = url;
  imageLruCache.set(url, img);
}

/**
 * Checks if a card image is currently retained in the in-memory cache.
 */
export function isCardImageCached(cardId: number, variant: CardImageVariant = 'full'): boolean {
  const url = getCardImageUrl(cardId, variant);
  return imageLruCache.has(url);
}

/**
 * Handles image error events by swapping to placeholder.
 */
export function handleImageError(event: Event): void {
  const target = event.target as HTMLImageElement | null;
  if (target) {
    target.src = getCardPlaceholderUrl();
  }
}

