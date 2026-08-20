// =============================================================================
// Shared Duel & Engine Type Definitions (mirrors ocgapi.h conventions)
// =============================================================================
export const CARD_LOCATIONS = {
    DECK: 0x01,
    HAND: 0x02,
    MZONE: 0x04,
    SZONE: 0x08,
    GRAVE: 0x10,
    REMOVED: 0x20,
    EXTRA: 0x40,
    OVERLAY: 0x80,
    ONFIELD: 0x0c,
};
export const CARD_POSITIONS = {
    FACEUP_ATTACK: 0x1,
    FACEDOWN_ATTACK: 0x2,
    FACEUP_DEFENSE: 0x4,
    FACEDOWN_DEFENSE: 0x8,
    FACEUP: 0x5,
    FACEDOWN: 0xa,
    ATTACK: 0x3,
    DEFENSE: 0xc,
};
