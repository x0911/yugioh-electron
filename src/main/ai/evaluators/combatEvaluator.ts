import type { EvaluatorContext, ScoredAction } from '../types.js';
import type { FieldCard, PlayerFieldState } from '../../../shared/types/field.js';
import { SelectBattleCMDAction, type OcgResponse, OcgResponseType } from 'ocgcore-wasm';

export interface AttackCandidate {
  attackerIndex: number;
  attackerSeq: number;
  attackerAtk: number;
  attackerName: string;
  attackerCode?: number;
}

export function evaluateAttackOption(
  attacker: AttackCandidate,
  context: EvaluatorContext,
): ScoredAction {
  const { aiPlayerId, boardState, personality } = context;
  const oppField: PlayerFieldState = boardState.userField.playerId === aiPlayerId ? boardState.opponentField : boardState.userField;
  const oppLp = oppField.currentLp;

  const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => m !== null);

  // 1. Direct Attack case (Opponent has no monsters on field)
  if (oppMonsters.length === 0) {
    let score = attacker.attackerAtk * 1.5 * (personality.aggression + 0.3);

    // Lethal direct attack check
    if (attacker.attackerAtk >= oppLp) {
      score += 15000;
      return {
        action: {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.SELECT_BATTLE,
          index: attacker.attackerIndex,
        },
        score,
        reason: `[LETHAL] Direct attack with ${attacker.attackerName} (${attacker.attackerAtk} ATK) for game!`,
        cardName: attacker.attackerName,
      };
    }

    if (oppLp - attacker.attackerAtk <= 1500) {
      score += 3000;
    }

    return {
      action: {
        type: OcgResponseType.SELECT_BATTLECMD,
        action: SelectBattleCMDAction.SELECT_BATTLE,
        index: attacker.attackerIndex,
      },
      score,
      reason: `Direct attack with ${attacker.attackerName} dealing ${attacker.attackerAtk} damage (Opp LP: ${oppLp})`,
      cardName: attacker.attackerName,
    };
  }

  // 2. Monster Combat case: Find best combat matchup
  let bestTargetScore = -Infinity;
  let bestTargetReason = '';

  const attackerCode = attacker.attackerCode ?? 0;
  const isDefenseDestroyer =
    attackerCode === 4041838 || // Ninja Grandmaster Sasuke
    attackerCode === 4445745 || // Drillroid
    attackerCode === 40048328 || // Ehren, Lightsworn Monk
    attackerCode === 80344569 || // Neo-Spacian Grand Mole
    attackerCode === 78759558;  // Bull Blader

  for (const target of oppMonsters) {
    let targetScore = 0;
    let targetReason = '';

    // Check if target is known to have continuous battle immunity
    const isBattleImmune =
      target.code === 11662742 || // Gellenduo
      target.code === 31305911 || // Marshmallon
      target.code === 23205979 || // Spirit Reaper
      target.code === 37412656 || // Arcana Force 0 - The Fool
      target.code === 78371393 || // Yubel
      target.code === 4779091 ||  // Yubel - Terror Incarnate
      target.code === 31764782 || // Yubel - The Ultimate Nightmare
      target.code === 3657444 ||  // Cyber Valley
      (target.description &&
        (target.description.toLowerCase().includes('cannot be destroyed by battle') ||
          target.description.toLowerCase().includes('not destroyed by battle')));

    if (target.position === 'faceup_attack') {
      const targetAtk = target.atk ?? 0;
      if (attacker.attackerAtk > targetAtk) {
        const battleDamage = attacker.attackerAtk - targetAtk;
        const destroyBonus = isBattleImmune ? 0 : 400;
        targetScore = destroyBonus + battleDamage * 1.2 + targetAtk * 0.3;
        targetReason = isBattleImmune
          ? `Attack battle-immune ${target.name} in Attack Position -> Inflict ${battleDamage} battle damage`
          : `Attack ${target.name} (${targetAtk} ATK) -> Destroy monster & inflict ${battleDamage} battle damage`;

        if (battleDamage >= oppLp) {
          targetScore += 15000;
          targetReason = `[LETHAL] Destroy ${target.name} and reduce opponent to 0 LP!`;
        }
      } else if (attacker.attackerAtk === targetAtk) {
        // Mutual destruction
        targetScore = isBattleImmune ? -800 : (150 * personality.riskTolerance - 80 * personality.defensiveness + (targetAtk > 1800 ? 200 : 0));
        targetReason = isBattleImmune ? `[AVOID] Attack battle-immune ${target.name} with equal ATK` : `Mutual destruction trade with ${target.name} (${targetAtk} ATK)`;
      } else {
        // Attacker is weaker: suicide
        const selfDamage = targetAtk - attacker.attackerAtk;
        targetScore = -2500 - selfDamage * 2;
        targetReason = `[AVOID] Suicide attack into stronger ${target.name} (${targetAtk} ATK)`;
      }
    } else if (target.position === 'faceup_defense') {
      const targetDef = target.def ?? 0;
      if (isBattleImmune) {
        if (isDefenseDestroyer) {
          targetScore = 1500;
          targetReason = `Effect destroys face-up defense battle-immune ${target.name} before damage calculation!`;
        } else {
          // Futile attack: Deals 0 damage and does not destroy the monster
          targetScore = -3000;
          targetReason = `[AVOID] Futile attack against battle-immune ${target.name} in Defense Position`;
        }
      } else if (attacker.attackerAtk > targetDef || isDefenseDestroyer) {
        targetScore = 400 + targetDef * 0.2;
        targetReason = `Destroy defensive wall ${target.name} (${targetDef} DEF)`;
      } else if (attacker.attackerAtk === targetDef) {
        targetScore = -200;
        targetReason = `Stalemate clash with ${target.name} (${targetDef} DEF)`;
      } else {
        const recoil = targetDef - attacker.attackerAtk;
        targetScore = -1500 - recoil * 1.5;
        targetReason = `[AVOID] Recoil against higher DEF ${target.name} (${targetDef} DEF)`;
      }
    } else {
      // Face-down defense monster (hidden identity)
      if (isDefenseDestroyer) {
        targetScore = 800;
        targetReason = `Attack face-down monster with defense-destroying effect (${attacker.attackerName})`;
      } else if (attacker.attackerAtk >= 2000) {
        targetScore = 350 * personality.aggression;
        targetReason = `Attack face-down monster with overwhelming power (${attacker.attackerAtk} ATK)`;
      } else if (attacker.attackerAtk >= 1600) {
        targetScore = 200 * (personality.aggression + personality.riskTolerance * 0.5);
        targetReason = `Attack face-down monster with solid beatstick (${attacker.attackerAtk} ATK)`;
      } else if (attacker.attackerAtk >= 1200) {
        targetScore = 50 * personality.riskTolerance - 100 * personality.defensiveness;
        targetReason = `Cautious strike on face-down monster (${attacker.attackerAtk} ATK)`;
      } else {
        targetScore = -800 * (1 - personality.riskTolerance);
        targetReason = `Hold back low ATK monster (${attacker.attackerAtk} ATK) from unknown face-down defense`;
      }
    }

    if (targetScore > bestTargetScore) {
      bestTargetScore = targetScore;
      bestTargetReason = targetReason;
    }
  }

  // Weight final score by character personality aggression
  const finalScore = bestTargetScore < 0 ? bestTargetScore : bestTargetScore * (0.5 + personality.aggression * 0.8);

  return {
    action: {
      type: OcgResponseType.SELECT_BATTLECMD,
      action: SelectBattleCMDAction.SELECT_BATTLE,
      index: attacker.attackerIndex,
    },
    score: finalScore,
    reason: bestTargetReason || `Attack with ${attacker.attackerName}`,
    cardName: attacker.attackerName,
  };
}
