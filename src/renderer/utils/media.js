// =============================================================================
// Media & Asset URL Resolvers (Local App-Resource Scheme with Fallbacks)
// =============================================================================
/**
 * Returns the URL for a card image variant.
 * In Electron environment, uses the registered `app-resource://` protocol.
 */
export function getCardImageUrl(cardId, variant = 'mini') {
    if (!cardId || cardId <= 0) {
        return 'app-resource://cards/placeholder.jpg';
    }
    return `app-resource://cards/${variant}/${cardId}.jpg`;
}
/**
 * Returns the official card-back image URL.
 */
export function getCardBackUrl() {
    return 'app-resource://cards/card-back.jpg';
}
/**
 * Returns the placeholder card image URL.
 */
export function getCardPlaceholderUrl() {
    return 'app-resource://cards/placeholder.jpg';
}
/**
 * Returns the coin heads face image URL.
 */
export function getCoinHeadsUrl() {
    return 'app-resource://ui/coin-heads.png';
}
/**
 * Returns the coin tails face image URL.
 */
export function getCoinTailsUrl() {
    return 'app-resource://ui/coin-tails.png';
}
/**
 * Returns the coin edge sliver image URL.
 */
export function getCoinEdgeUrl() {
    return 'app-resource://ui/coin-edge.png';
}
/**
 * Returns the character intro video URL.
 */
export function getCharacterVideoUrl(characterId) {
    return `app-resource://videos/characters/${characterId}.mp4`;
}
/**
 * Returns the character portrait image URL.
 */
export function getCharacterPortraitUrl(characterId) {
    return `app-resource://characters/portraits/${characterId}.png`;
}
/**
 * Returns background image URL by name.
 */
export function getBackgroundUrl(name) {
    return `app-resource://backgrounds/${name}.jpg`;
}
/**
 * Returns menu card image URL by name ('duel' | 'deck' | 'settings' | 'exit').
 */
export function getMenuCardImageUrl(name) {
    return `app-resource://ui/menu-${name}.jpg`;
}
/**
 * Returns the URL for a HUD/UI icon asset.
 */
export function getUiIconUrl(name) {
    return `app-resource://ui/icons/${name}.png`;
}
/**
 * Returns location indicator icon URL.
 */
export function getLocationIconUrl(location) {
    return `app-resource://ui/icons/location-${location}.png`;
}
/**
 * Returns status indicator icon URL.
 */
export function getStatusIconUrl(status) {
    return `app-resource://ui/icons/status-${status}.png`;
}
/**
 * Handles image error events by swapping to placeholder.
 */
export function handleImageError(event) {
    const target = event.target;
    if (target) {
        target.src = getCardPlaceholderUrl();
    }
}
