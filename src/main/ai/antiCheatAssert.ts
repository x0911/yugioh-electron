import type { DuelBoardState } from '../../shared/types/field.js';

/**
 * Dev-mode anti-cheat assertion ensuring that AIController is only ever
 * handed an AI-side redacted snapshot where human private zones (hand, face-down cards)
 * have all secret information redacted.
 *
 * Throws loudly if any unrevealed card information is detected.
 */
export function assertAiStateSanitized(boardState: DuelBoardState, aiPlayerId: number): void {
  // Human is the opposing player from the AI's perspective
  const humanField = aiPlayerId === 0 ? boardState.opponentField : boardState.userField;

  // 1. Check human hand cards (must have code === 0 and undefined stats)
  for (let i = 0; i < humanField.hand.length; i++) {
    const card = humanField.hand[i];
    if (card && card.code !== 0) {
      throw new Error(
        `[ANTI-CHEAT ASSERTION FAILED] AIController was handed unredacted human hand card at index ${i} (code=${card.code}, name="${card.name}")! AI must only receive redacted snapshots.`
      );
    }
    if (card && (card.atk !== undefined || card.def !== undefined || card.description !== undefined)) {
      throw new Error(
        `[ANTI-CHEAT ASSERTION FAILED] AIController was handed secret stats for human hand card at index ${i}!`
      );
    }
  }

  // 2. Check human face-down monster cards on field (must have code === 0 and undefined stats)
  for (let seq = 0; seq < humanField.monsterZones.length; seq++) {
    const card = humanField.monsterZones[seq];
    if (card && card.position === 'facedown_defense') {
      if (card.code !== 0) {
        throw new Error(
          `[ANTI-CHEAT ASSERTION FAILED] AIController was handed face-down human monster in zone M${seq + 1} (code=${card.code}, name="${card.name}")!`
        );
      }
      if (card.atk !== undefined || card.def !== undefined || card.description !== undefined) {
        throw new Error(
          `[ANTI-CHEAT ASSERTION FAILED] AIController was handed secret stats for face-down human monster in zone M${seq + 1}!`
        );
      }
    }
  }

  // 3. Check human face-down spell/trap cards on field (must have code === 0 and undefined stats)
  for (let seq = 0; seq < humanField.spellTrapZones.length; seq++) {
    const card = humanField.spellTrapZones[seq];
    if (card && card.position === 'facedown_spell') {
      if (card.code !== 0) {
        throw new Error(
          `[ANTI-CHEAT ASSERTION FAILED] AIController was handed face-down human spell/trap in zone S${seq + 1} (code=${card.code}, name="${card.name}")!`
        );
      }
      if (card.description !== undefined) {
        throw new Error(
          `[ANTI-CHEAT ASSERTION FAILED] AIController was handed secret description for face-down human spell/trap in zone S${seq + 1}!`
        );
      }
    }
  }
}
