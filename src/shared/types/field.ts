// =============================================================================
// Shared Duel Field & Board State Type Definitions
// =============================================================================

export type FieldZoneType =
  | 'monster'
  | 'spell-trap'
  | 'field'
  | 'extra-monster'
  | 'graveyard'
  | 'banished'
  | 'deck'
  | 'extra-deck'
  | 'hand';

export type CardPositionState =
  | 'faceup_attack'
  | 'faceup_defense'
  | 'facedown_defense'
  | 'facedown_spell'
  | 'faceup_spell';

export interface FieldCard {
  id: string; // Unique instance id on the board
  code: number; // Card passcode / database ID (e.g. 46986414)
  name: string; // Display name
  controller: 0 | 1; // 0 = User (or Player 0), 1 = Opponent (or Player 1)
  location: FieldZoneType;
  sequence: number; // 0..4 for zones
  position: CardPositionState;
  atk?: number;
  def?: number;
  baseAtk?: number;
  baseDef?: number;
  level?: number;
  attribute?: string; // 'DARK' | 'LIGHT' | 'EARTH' | 'WATER' | 'FIRE' | 'WIND' | 'DIVINE'
  race?: string; // 'Spellcaster' | 'Dragon' | 'Warrior' etc.
  type?: number; // Type bitmask
  description?: string;
  isAttacking?: boolean;
  isTargeted?: boolean;
  isSelectable?: boolean;
  counters?: number;
}

export interface PlayerFieldState {
  playerId: 0 | 1;
  name: string;
  title?: string;
  series?: 'DM' | 'GX';
  avatar?: string;
  characterId?: string;
  currentLp: number;
  maxLp: number;
  isTurn: boolean;

  // Board Zones
  monsterZones: (FieldCard | null)[]; // 5 slots (indices 0..4)
  spellTrapZones: (FieldCard | null)[]; // 5 slots (indices 0..4)
  fieldZone: FieldCard | null; // 1 slot
  graveyard: FieldCard[]; // Stack of cards
  banished: FieldCard[]; // Stack of cards
  extraDeck: FieldCard[]; // Stack of cards in extra deck
  deckCount: number; // Count of cards in deck
  extraDeckCount: number; // Count of cards in extra deck
  hand: FieldCard[]; // Cards in hand
}

export interface DuelBoardState {
  userField: PlayerFieldState;
  opponentField: PlayerFieldState;
  extraMonsterZones: (FieldCard | null)[]; // 2 slots between players
  turnNumber: number;
  currentPhase: 'DP' | 'SP' | 'M1' | 'BP' | 'M2' | 'EP';
  activePrompt: string | null;
  phaseGuideText: string;
  winner: 0 | 1 | 'draw' | null;
  winReason?: number | null;
}
