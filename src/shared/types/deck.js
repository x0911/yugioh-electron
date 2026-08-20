// =============================================================================
// Deck Types and Deck Validation Rules
// =============================================================================
export const DECK_LIMITS = {
    MIN_MAIN: 40,
    MAX_MAIN: 60,
    MIN_EXTRA: 0,
    MAX_EXTRA: 15,
    MAX_COPIES_PER_CARD: 3,
};
/**
 * Computes validity for a given main and extra deck list.
 */
export function validateDeck(main, extra, getCardName) {
    const errors = [];
    const warnings = [];
    const mainCount = main.length;
    const extraCount = extra.length;
    if (mainCount < DECK_LIMITS.MIN_MAIN) {
        errors.push(`Main Deck has ${mainCount} cards (minimum ${DECK_LIMITS.MIN_MAIN} required — add ${DECK_LIMITS.MIN_MAIN - mainCount} more).`);
    }
    else if (mainCount > DECK_LIMITS.MAX_MAIN) {
        errors.push(`Main Deck has ${mainCount} cards (maximum ${DECK_LIMITS.MAX_MAIN} allowed — remove ${mainCount - DECK_LIMITS.MAX_MAIN}).`);
    }
    if (extraCount > DECK_LIMITS.MAX_EXTRA) {
        errors.push(`Extra Deck has ${extraCount} cards (maximum ${DECK_LIMITS.MAX_EXTRA} allowed — remove ${extraCount - DECK_LIMITS.MAX_EXTRA}).`);
    }
    // Count copies of each card across main + extra
    const counts = new Map();
    for (const id of main) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const id of extra) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    for (const [id, count] of counts.entries()) {
        if (count > DECK_LIMITS.MAX_COPIES_PER_CARD) {
            const cardTitle = getCardName ? getCardName(id) : `Card #${id}`;
            errors.push(`Exceeds maximum ${DECK_LIMITS.MAX_COPIES_PER_CARD} copies: "${cardTitle}" (${count} copies found).`);
        }
    }
    return {
        isValid: errors.length === 0,
        mainCount,
        extraCount,
        errors,
        warnings,
        monsterCount: 0,
        spellCount: 0,
        trapCount: 0,
        fusionCount: 0,
    };
}
