import type { OcgResponse } from 'ocgcore-wasm';
import type { DuelBoardState, FieldCard, PlayerFieldState } from '../../shared/types/field.js';
import type { CharacterPersonality } from '../../shared/types/character.js';
import type { CardReaderService } from '../engine/cardReader.js';

export interface EvaluatorContext {
  aiPlayerId: number;
  humanPlayerId: number;
  boardState: DuelBoardState;
  personality: CharacterPersonality;
  cardReader: CardReaderService;
  currentPhase: 'DP' | 'SP' | 'M1' | 'BP' | 'M2' | 'EP';
  currentTurn: number;
  signatureCardIds: number[];
  deckArchetype: string;
  aiDeckCards?: number[];
  activeChainCards?: number[];
}

export interface ScoredAction<T = OcgResponse> {
  action: T;
  score: number;
  reason: string;
  cardCode?: number;
  cardName?: string;
  metadata?: Record<string, unknown>;
}

export type ArchetypeName =
  | 'BEATDOWN'
  | 'FUSION_HERO'
  | 'SPELLCASTER_DARK_MAGIC'
  | 'DRAGON_POWER'
  | 'ZOMBIE_GRAVE'
  | 'BURN_STALL'
  | 'CYBER_OTK'
  | 'TOON_WORLD'
  | 'EXODIA'
  | 'LEVEL_UP'
  | 'CRYSTAL_BEAST'
  | 'ANCIENT_GEAR'
  | 'MONARCH'
  | 'GLADIATOR_BEAST'
  | 'VOLCANIC'
  | 'LIGHTSWORN'
  | 'CHAOS_DAD'
  | 'RITUAL'
  | 'GENERIC_CONTROL'
  | 'GENERIC_AGGRO';

export function getAiAndOpponentFields(context: {
  aiPlayerId: number;
  boardState: DuelBoardState;
}): { aiField: PlayerFieldState; oppField: PlayerFieldState } {
  const isUserAi = context.boardState.userField.playerId === context.aiPlayerId;
  return {
    aiField: isUserAi ? context.boardState.userField : context.boardState.opponentField,
    oppField: isUserAi ? context.boardState.opponentField : context.boardState.userField,
  };
}
