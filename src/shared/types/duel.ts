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

export interface DuelInitOptions {
  player0Deck: number[];
  player1Deck: number[];
  player0ExtraDeck?: number[];
  player1ExtraDeck?: number[];
  startingLP?: number;
  startingDrawCount?: number;
  drawCountPerTurn?: number;
  autoPlay?: boolean;
  humanPlayerId?: number; // 0 if user is Player 0, 1 if user is Player 1
}

export type CoinChoice = 'heads' | 'tails';
export type CoinWinner = 'user' | 'opponent';
export type StartingPlayer = 'user' | 'opponent';

export interface MatchSetupConfig {
  opponentId: string;
  opponentName: string;
  opponentSeries: 'DM' | 'GX';
  opponentAvatar: string;
  opponentVideo: string;
  opponentDeckName: string;
  opponentDeckArchetype: string;
  opponentDeckIndex: number;
  opponentDeckCards: number[];
  userDeckName: string;
  userDeckCards: number[];
  userChoice: CoinChoice | null;
  coinResult: CoinChoice | null;
  coinWinner: CoinWinner | null;
  startingPlayer: StartingPlayer;
  userPlayerId: 0 | 1;
  opponentPlayerId: 0 | 1;
}


export interface OcgCardLocItem {
  code: number;
  controller: number;
  location: number;
  sequence: number;
  cardName?: string;
}

export interface OcgCardLocActiveItem extends OcgCardLocItem {
  description: string;
  client_mode: number;
}

export interface OcgCardLocAttackItem extends OcgCardLocItem {
  can_direct: boolean;
}

export interface OcgCardLocPosItem extends OcgCardLocItem {
  position: number;
}

export interface SelectIdleCmdPayload {
  player: number;
  summons: OcgCardLocItem[];
  special_summons: OcgCardLocItem[];
  pos_changes: OcgCardLocItem[];
  monster_sets: OcgCardLocItem[];
  spell_sets: OcgCardLocItem[];
  activates: OcgCardLocActiveItem[];
  to_bp: boolean;
  to_ep: boolean;
  shuffle: boolean;
}

export interface SelectBattleCmdPayload {
  player: number;
  chains: OcgCardLocActiveItem[];
  attacks: OcgCardLocAttackItem[];
  to_m2: boolean;
  to_ep: boolean;
}

export interface SelectCardPayload {
  player: number;
  can_cancel: boolean;
  min: number;
  max: number;
  selects: OcgCardLocPosItem[];
  isDiscardPrompt?: boolean;
}

export interface SelectChainPayload {
  player: number;
  forced: boolean;
  selects: OcgCardLocActiveItem[];
}

export interface SelectPositionPayload {
  player: number;
  code: number;
  cardName?: string;
  positions: number[];
}

export interface SelectEffectYnPayload {
  player: number;
  code: number;
  cardName?: string;
  description: string;
}

export interface SelectOptionPayload {
  player: number;
  options: (string | number)[];
}

export interface SelectPlacePayload {
  player: number;
  count: number;
  field_mask: number;
}

export interface SelectTributePayload {
  player: number;
  min: number;
  max: number;
  selects: OcgCardLocItem[];
}

export interface DuelEventPayload {
  type: string;
  rawType: number;
  player?: number;
  controller?: number;
  code?: number;
  cardName?: string;
  location?: number;
  sequence?: number;
  position?: number;
  fromLocation?: number;
  fromSequence?: number;
  toLocation?: number;
  toSequence?: number;
  drawn?: { code: number; position: number; cardName: string }[];
  count?: number;
  phase?: string;
  turn?: number;
  amount?: number;
  lp?: number;
  reason?: number;
  target?: unknown;
  drawnCards?: { code: number; cardName: string }[];
  isPrompt: boolean;
  promptPlayer?: number;
  promptType?: string;
  promptData?: unknown;
  description: string;
  raw: unknown;
}

export interface DuelStateSummary {
  isActive: boolean;
  isWaitingResponse: boolean;
  waitingPlayer: number | null;
  currentTurn: number;
  currentPhase: string;
  p0LP: number;
  p1LP: number;
  winner: number | null;
  winReason: number | null;
  stepCount: number;
}

