// =============================================================================
// Shared Duel & Engine Type Definitions (mirrors ocgapi.h conventions)
// =============================================================================

export type PlayerId = 0 | 1; // 0 = Player 1 (User), 1 = Player 2 (AI/Opponent)

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
} as const;

export const CARD_POSITIONS = {
  FACEUP_ATTACK: 0x1,
  FACEDOWN_ATTACK: 0x2,
  FACEUP_DEFENSE: 0x4,
  FACEDOWN_DEFENSE: 0x8,
  FACEUP: 0x5,
  FACEDOWN: 0xa,
  ATTACK: 0x3,
  DEFENSE: 0xc,
} as const;

export interface DuelCardSummary {
  code: number;
  location: number;
  sequence: number;
  position: number;
  overlayCount?: number;
}

export interface DuelFieldState {
  userLp: number;
  aiLp: number;
  turn: number;
  phase: string;
  isUserTurn: boolean;
}
