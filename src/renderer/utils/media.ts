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
 * Handles image error events by swapping to placeholder.
 */
export function handleImageError(event: Event): void {
  const target = event.target as HTMLImageElement | null;
  if (target) {
    target.src = getCardPlaceholderUrl();
  }
}
