import type { EvaluatorContext } from '../types.js';
import { getAiAndOpponentFields } from '../types.js';
import type { PlayerFieldState } from '../../../shared/types/field.js';

export interface AdvantageEvaluation {
  aiLp: number;
  oppLp: number;
  lpDifferential: number;
  isOpponentInLethalRange: boolean;
  isAiInCriticalDanger: boolean;
  aiHandSize: number;
  oppHandSize: number;
  handSizeAdvantage: number;
  totalCardAdvantageScore: number;
}

export function evaluateAdvantage(context: EvaluatorContext): AdvantageEvaluation {
  const { personality } = context;
  const { aiField, oppField } = getAiAndOpponentFields(context);

  const aiLp = aiField.currentLp;
  const oppLp = oppField.currentLp;
  const lpDifferential = aiLp - oppLp;

  const isOpponentInLethalRange = oppLp <= 3000;
  const isAiInCriticalDanger = aiLp <= 2000;

  const aiHandSize = aiField.hand.length;
  const oppHandSize = oppField.hand.length;
  const handSizeAdvantage = aiHandSize - oppHandSize;

  const handScore = aiHandSize * 150 * personality.cardAdvantageWeight;
  const fieldScore = (aiField.monsterZones.filter(Boolean).length + aiField.spellTrapZones.filter(Boolean).length) * 200;
  const lpScore = (lpDifferential / 40) * (personality.aggression + 0.5);

  const totalCardAdvantageScore = handScore + fieldScore + lpScore;

  return {
    aiLp,
    oppLp,
    lpDifferential,
    isOpponentInLethalRange,
    isAiInCriticalDanger,
    aiHandSize,
    oppHandSize,
    handSizeAdvantage,
    totalCardAdvantageScore,
  };
}
