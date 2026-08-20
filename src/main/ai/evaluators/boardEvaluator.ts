import type { EvaluatorContext } from '../types.js';
import type { FieldCard, PlayerFieldState } from '../../../shared/types/field.js';

export interface BoardEvaluation {
  aiMonsterCount: number;
  oppMonsterCount: number;
  aiTotalAtk: number;
  aiMaxAtk: number;
  oppVisibleTotalAtk: number;
  oppVisibleMaxAtk: number;
  oppFaceDownMonsterCount: number;
  aiFaceDownMonsterCount: number;
  boardDominance: number; // Positive = AI advantage, Negative = Opponent advantage
  aiSpellTrapCount: number;
  oppVisibleSpellTrapCount: number;
}

export function evaluateBoard(context: EvaluatorContext): BoardEvaluation {
  const { aiPlayerId, boardState } = context;
  const aiField: PlayerFieldState = aiPlayerId === 0 ? boardState.userField : boardState.opponentField;
  const oppField: PlayerFieldState = aiPlayerId === 0 ? boardState.opponentField : boardState.userField;

  let aiMonsterCount = 0;
  let aiTotalAtk = 0;
  let aiMaxAtk = 0;
  let aiFaceDownMonsterCount = 0;

  for (const card of aiField.monsterZones) {
    if (!card) continue;
    aiMonsterCount++;
    if (card.position === 'faceup_attack') {
      const atk = card.atk ?? 0;
      aiTotalAtk += atk;
      if (atk > aiMaxAtk) aiMaxAtk = atk;
    } else if (card.position === 'facedown_defense') {
      aiFaceDownMonsterCount++;
    }
  }

  let oppMonsterCount = 0;
  let oppVisibleTotalAtk = 0;
  let oppVisibleMaxAtk = 0;
  let oppFaceDownMonsterCount = 0;

  for (const card of oppField.monsterZones) {
    if (!card) continue;
    oppMonsterCount++;
    if (card.position === 'faceup_attack') {
      const atk = card.atk ?? 0;
      oppVisibleTotalAtk += atk;
      if (atk > oppVisibleMaxAtk) oppVisibleMaxAtk = atk;
    } else if (card.position === 'facedown_defense') {
      oppFaceDownMonsterCount++;
    }
  }

  const aiSpellTrapCount = aiField.spellTrapZones.filter(Boolean).length;
  const oppVisibleSpellTrapCount = oppField.spellTrapZones.filter(Boolean).length;

  // Board dominance: score based on ATK difference + monster count presence
  const atkDiff = aiTotalAtk - oppVisibleTotalAtk;
  const countDiff = aiMonsterCount - oppMonsterCount;
  const boardDominance = atkDiff / 10 + countDiff * 250;

  return {
    aiMonsterCount,
    oppMonsterCount,
    aiTotalAtk,
    aiMaxAtk,
    oppVisibleTotalAtk,
    oppVisibleMaxAtk,
    oppFaceDownMonsterCount,
    aiFaceDownMonsterCount,
    boardDominance,
    aiSpellTrapCount,
    oppVisibleSpellTrapCount,
  };
}
