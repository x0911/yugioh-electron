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

export const WIN_REASONS = {
  UNKNOWN: 0x0,
  LP_ZERO: 0x1,
  DECK_OUT: 0x2,
  SURRENDER: 0x3,
  TIME_LIMIT: 0x4,
  EXODIA: 0x10,
  FINAL_COUNTDOWN: 0x11,
  VENNOMINAGA: 0x12,
  CREATORGOD: 0x13,
  EXODIUS: 0x14,
  DESTINY_BOARD: 0x15,
  LAST_TURN: 0x16,
  PUPPET_LEO: 0x17,
  DISASTER_LEO: 0x18,
  JACKPOT7: 0x19,
  RELAY_SOUL: 0x1a,
  GHOSTRICK_MISCHIEF: 0x1b,
  PHANTASM_SPIRAL: 0x1c,
  FA_WINNERS: 0x1d,
  FLYING_ELEPHANT: 0x1e,
  EXODIA_DEFENDER: 0x1f,
} as const;

export function getGameOverSubtitle(isWinner: boolean, reason: number | null): string {
  switch (reason) {
    case WIN_REASONS.EXODIA:
      return isWinner
        ? 'You have achieved victory by assembling all 5 pieces of Exodia the Forbidden One!'
        : 'Your opponent achieved victory by assembling all 5 pieces of Exodia the Forbidden One!';
    case WIN_REASONS.FINAL_COUNTDOWN:
      return isWinner
        ? 'Victory achieved by the effect of Final Countdown!'
        : 'Your opponent won by the effect of Final Countdown!';
    case WIN_REASONS.VENNOMINAGA:
      return isWinner
        ? 'Victory achieved by Vennominaga the Deity of Poisonous Snakes (Hyper-Venom Counters)!'
        : 'Your opponent won by the effect of Vennominaga the Deity of Poisonous Snakes!';
    case WIN_REASONS.CREATORGOD:
      return isWinner
        ? 'Victory achieved by the automatic win effect of Holactie the Creator of Light!'
        : 'Your opponent achieved victory by Special Summoning Holactie the Creator of Light!';
    case WIN_REASONS.DESTINY_BOARD:
      return isWinner
        ? 'Victory achieved by the effect of Destiny Board (FINAL)!'
        : 'Your opponent won by the effect of Destiny Board (FINAL)!';
    case WIN_REASONS.LAST_TURN:
      return isWinner
        ? 'Victory achieved by the resolution of Last Turn!'
        : 'Your opponent achieved victory by the resolution of Last Turn!';
    case WIN_REASONS.DECK_OUT:
      return isWinner
        ? 'Your opponent was unable to draw a card (Deck Out)!'
        : 'You were unable to draw a card (Deck Out)!';
    case WIN_REASONS.SURRENDER:
      return isWinner
        ? 'Your opponent surrendered the duel.'
        : 'You surrendered the duel.';
    case WIN_REASONS.LP_ZERO:
    default:
      return isWinner
        ? "You have reduced your opponent's Life Points to 0!"
        : 'Your Life Points reached 0.';
  }
}

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
  player0Graveyard?: number[];
  player1Graveyard?: number[];
  player0Monsters?: Array<{ code: number; sequence: number; position?: number }>;
  player1Monsters?: Array<{ code: number; sequence: number; position?: number }>;
  noShuffle?: boolean;
  startingLP?: number;
  startingDrawCount?: number;
  drawCountPerTurn?: number;
  autoPlay?: boolean;
  humanPlayerId?: number; // 0 if user is Player 0, 1 if user is Player 1
  aiCharacterId?: string;
  aiDeckArchetype?: string;
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

export interface SelectUnselectCardPayload {
  player: number;
  can_finish: boolean;
  can_cancel: boolean;
  min: number;
  max: number;
  selects: OcgCardLocPosItem[];
  unselects: OcgCardLocPosItem[];
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

export interface SelectSumPayload {
  player: number;
  select_max: number;
  amount: number;
  min: number;
  max: number;
  selects: OcgCardLocItem[];
}

export interface AnnounceCardPayload {
  player: number;
  opcodes: (number | bigint)[];
  candidateCodes?: number[];
}

export interface AnnounceRacePayload {
  player: number;
  count: number;
  available: number | bigint;
}

export interface AnnounceAttribPayload {
  player: number;
  count: number;
  available: number;
}

export interface AnnounceNumberPayload {
  player: number;
  options: (number | bigint)[];
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
  cards?: number[];
  fieldStats?: Array<{
    controller: 0 | 1;
    sequence: number;
    atk?: number;
    def?: number;
    level?: number;
    baseAtk?: number;
    baseDef?: number;
  }>;
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
  isVideoPlaying?: boolean;
}

export interface CardVideoEntry {
  cardName: string;
  series: 'DM' | 'GX';
  summon?: string;
  attack?: string;
  victory?: string;
  isPlaceholder?: boolean;
}

export interface CardVideoPayload {
  code: number;
  cardName: string;
  videoType: 'summon' | 'attack' | 'victory';
  videoPath: string;
  controller: number;
  isPlaceholder?: boolean;
}


