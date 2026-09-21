import type { EvaluatorContext } from '../types.js';
import { getAiAndOpponentFields } from '../types.js';
import type { PlayerFieldState } from '../../../shared/types/field.js';

export interface DominanceState {
  isDominating: boolean;
  isLethalOnBoard: boolean;
  aiTotalAtk: number;
  oppVisibleAtk: number;
  oppMonsterCount: number;
  reason: string;
}

export function evaluateBoardDominance(context: EvaluatorContext): DominanceState {
  const { aiField, oppField } = getAiAndOpponentFields(context);
  const oppLp = oppField.currentLp;

  const aiReadyAttackers = aiField.monsterZones
    .filter((m) => !!m && (m.position === 'faceup_attack' || m.position === 'attack'))
    .map((m) => m?.atk ?? 0);
  const aiTotalAtk = aiReadyAttackers.reduce((acc, a) => acc + a, 0);

  const oppMonsters = oppField.monsterZones.filter((m) => !!m);
  const oppMonsterCount = oppMonsters.length;
  const oppVisibleAtk = oppMonsters
    .filter((m) => m && (m.position === 'faceup_attack' || m.position === 'faceup_defense'))
    .reduce((acc, m) => acc + (m?.atk ?? 0), 0);
  const oppMaxAtk = Math.max(0, ...oppMonsters.map((m) => m?.atk ?? 0));

  // Condition 1: Direct lethal on board (opponent field empty and AI total ATK >= opponent LP)
  if (oppMonsterCount === 0 && aiTotalAtk >= oppLp && aiTotalAtk > 0) {
    return {
      isDominating: true,
      isLethalOnBoard: true,
      aiTotalAtk,
      oppVisibleAtk,
      oppMonsterCount,
      reason: `AI controls direct lethal on board (${aiTotalAtk} ready ATK vs ${oppLp} opponent LP with empty enemy field)`,
    };
  }

  // Condition 2: Overwhelming board advantage against empty field
  if (oppMonsterCount === 0 && aiTotalAtk >= 4000) {
    return {
      isDominating: true,
      isLethalOnBoard: false,
      aiTotalAtk,
      oppVisibleAtk,
      oppMonsterCount,
      reason: `AI dominates board with ${aiTotalAtk} uncontested ATK against empty enemy field`,
    };
  }

  // Condition 3: Total combat lethal capability (AI ATK overcomes defender ATK and finishes opponent LP)
  if (aiTotalAtk >= oppLp + oppVisibleAtk && aiTotalAtk >= 2500 && aiReadyAttackers.some(atk => atk > oppMaxAtk)) {
    return {
      isDominating: true,
      isLethalOnBoard: true,
      aiTotalAtk,
      oppVisibleAtk,
      oppMonsterCount,
      reason: `AI holds combat lethal capability (${aiTotalAtk} total ATK capable of clearing enemy field and depleting ${oppLp} LP)`,
    };
  }

  // Condition 4: Clear board dominance (AI controls >= 2 attackers with >= 3000 total ATK against empty field)
  if (oppMonsterCount === 0 && aiReadyAttackers.length >= 2 && aiTotalAtk >= 3000) {
    return {
      isDominating: true,
      isLethalOnBoard: false,
      aiTotalAtk,
      oppVisibleAtk,
      oppMonsterCount,
      reason: `AI controls superior board presence with ${aiReadyAttackers.length} attackers (${aiTotalAtk} ATK) vs empty field`,
    };
  }

  // Condition 5: Critical Opponent LP with Threatening Attackers
  if (oppLp <= 2000 && aiReadyAttackers.length > 0 && aiTotalAtk >= oppLp) {
    return {
      isDominating: true,
      isLethalOnBoard: oppMonsterCount === 0,
      aiTotalAtk,
      oppVisibleAtk,
      oppMonsterCount,
      reason: `Opponent in critical LP danger (${oppLp} LP) facing AI team of ${aiReadyAttackers.length} attackers (${aiTotalAtk} ATK)`,
    };
  }

  return {
    isDominating: false,
    isLethalOnBoard: false,
    aiTotalAtk,
    oppVisibleAtk,
    oppMonsterCount,
    reason: '',
  };
}

export function evaluateSpellActivation(
  code: number,
  cardName: string,
  context: EvaluatorContext,
): { score: number; reason: string } {
  const { boardState, personality: rawPersonality, signatureCardIds } = context;
  const personality = {
    aggression: 0.5,
    defensiveness: 0.5,
    riskTolerance: 0.5,
    comboFocus: 0.5,
    cardAdvantageWeight: 1.0,
    signatureFavoritism: 0.5,
    ...rawPersonality,
  };
  const { aiField, oppField } = getAiAndOpponentFields(context);

  const oppMonsterCount = oppField.monsterZones.filter(Boolean).length;
  const aiMonsterCount = aiField.monsterZones.filter(Boolean).length;
  const oppLp = oppField.currentLp;

  // Prevent self-chain loops: if this card code is already in the current unresolved chain, do not chain it again
  if (context.activeChainCards && context.activeChainCards.includes(code)) {
    return {
      score: -10000,
      reason: `[HOLD] ${cardName} is already activated in the current chain (prevent self-chain loop)`,
    };
  }

  // 0. Necro Gardna (62015408) - Graveyard Quick Attack Negation
  if (code === 62015408 || cardName.includes('Necro Gardna')) {
    const isBattlePhase = boardState.currentPhase === 'BP' || boardState.currentPhase === 'BATTLE_START' || boardState.currentPhase === 'BATTLE_STEP';
    if (!isBattlePhase) {
      return {
        score: -8000,
        reason: `[HOLD] Hold Necro Gardna in Graveyard until opponent declares an attack in Battle Phase`,
      };
    }
    return {
      score: 3500 * (personality.defensiveness + 0.5),
      reason: `[ATTACK NEGATION] Banish Necro Gardna from Graveyard to negate incoming attack`,
    };
  }

  // 1. Draw Power Spells (Pot of Greed, Graceful Charity, etc.)
  if (code === 55144522 || code === 79571449 || cardName.includes('Greed') || cardName.includes('Charity')) {
    return {
      score: 1800 * personality.cardAdvantageWeight,
      reason: `Activate draw spell ${cardName} (+2 card advantage)`,
    };
  }

  // 1a. Destiny Board Win Condition & Backrow Preservation (94212438)
  if (code === 94212438 || cardName.includes('Destiny Board')) {
    const hasActiveDestinyBoard = aiField.spellTrapZones.some(
      (c) => !!c && c.code === 94212438 && (c.position === 'faceup_attack' || c.position === 'faceup_spell'),
    );
    if (hasActiveDestinyBoard) {
      return {
        score: -10000,
        reason: `Hold duplicate Destiny Board: AI already controls an active Destiny Board (activating another would jam S/T zones and prevent victory)`,
      };
    }

    const hasDarkSanctuary =
      aiField.fieldZone?.code === 16625614 ||
      aiField.spellTrapZones.some((c) => !!c && c.code === 16625614);
    const currentBackrowCount = aiField.spellTrapZones.filter(Boolean).length;
    const openBackrow = 5 - currentBackrowCount;

    if (!hasDarkSanctuary && openBackrow < 4) {
      return {
        score: -6000,
        reason: `Hold Destiny Board: only ${openBackrow} open Spell/Trap zones (requires 4 open zones for Spirit Messages I, N, A, L)`,
      };
    }

    return {
      score: 2500 * (personality.comboFocus + 0.5),
      reason: `Activate Destiny Board to begin assembling Spirit Messages for alternate victory`,
    };
  }

  // 1b. Hand Refresh & Disruption: Card Destruction (72892420 / 72892473)
  if (code === 72892420 || code === 72892473 || cardName.includes('Card Destruction')) {
    if (oppField.currentLp <= 2000) {
      return {
        score: -15000,
        reason: `[LOW OPPONENT LP GATEKEEPER] Hold ${cardName}: Opponent is clinging to life at ${oppField.currentLp} LP. Refuse to give them fresh cards or answers!`,
      };
    }

    const dominance = evaluateBoardDominance(context);
    if (dominance.isDominating || dominance.isLethalOnBoard) {
      return {
        score: -15000,
        reason: `[DOMINANCE VETO] Hold ${cardName}: ${dominance.reason}. Symmetrical hand refresh risks gifting opponent board wipes, hand traps, or combo outs!`,
      };
    }

    const currentPhase = context.currentPhase || context.boardState.currentPhase;
    const isMainPhase2 = currentPhase === 'M2' || currentPhase === 'MAIN2';
    if (isMainPhase2 && (aiMonsterCount > 0 || aiField.currentLp >= oppField.currentLp)) {
      return {
        score: -12000,
        reason: `[MP2 VETO] Hold ${cardName} in Main Phase 2: would give opponent a brand new hand right before their turn begins!`,
      };
    }

    const aiHandCount = aiField.hand.length;
    const oppHandCount = oppField.hand.length;

    // Never activate on Turn 1 (gives opponent free 5-card GY setup and full hand refresh before their turn)
    if (boardState.turnNumber === 1) {
      return {
        score: -8000,
        reason: `Hold ${cardName} on Turn 1: would give opponent free graveyard setup and a fresh hand before their first turn`,
      };
    }

    // If AI has smaller or equal hand compared to opponent: DO NOT REFRESH OPPONENT HAND!
    if (aiHandCount <= oppHandCount) {
      return {
        score: -4500,
        reason: `Hold ${cardName}: would give opponent +${oppHandCount} fresh cards while AI only has ${aiHandCount}`,
      };
    }
    // If AI has larger hand than opponent:
    if (aiHandCount > oppHandCount && aiHandCount >= 3) {
      return {
        score: 1600 * personality.cardAdvantageWeight,
        reason: `Activate ${cardName} to disrupt opponent hand (${oppHandCount} cards) and cycle AI cards (${aiHandCount} cards)`,
      };
    }
    return {
      score: -2000,
      reason: `Hold ${cardName}`,
    };
  }

  // 1c. Symmetrical Hand Disruption: Hand Destruction (74519184)
  if (code === 74519184 || cardName.includes('Hand Destruction')) {
    if (oppField.currentLp <= 2000) {
      return {
        score: -15000,
        reason: `[LOW OPPONENT LP GATEKEEPER] Hold ${cardName}: Opponent is clinging to life at ${oppField.currentLp} LP. Refuse to give them fresh cards or answers!`,
      };
    }

    const dominance = evaluateBoardDominance(context);
    if (dominance.isDominating || dominance.isLethalOnBoard) {
      return {
        score: -15000,
        reason: `[DOMINANCE VETO] Hold ${cardName}: ${dominance.reason}. Symmetrical draw risks giving opponent outs!`,
      };
    }
    const currentPhase = context.currentPhase || context.boardState.currentPhase;
    const isMainPhase2 = currentPhase === 'M2' || currentPhase === 'MAIN2';
    if (isMainPhase2 && (aiMonsterCount > 0 || aiField.currentLp >= oppField.currentLp)) {
      return {
        score: -12000,
        reason: `[MP2 VETO] Hold ${cardName} in Main Phase 2: gives opponent fresh cards right before their turn!`,
      };
    }
    if (boardState.turnNumber === 1 || aiField.hand.length < 3 || oppField.hand.length < 2) {
      return {
        score: -6000,
        reason: `Hold ${cardName}: requires discarding 2 cards each and giving opponent fresh cards`,
      };
    }
    return {
      score: 600 * personality.cardAdvantageWeight,
      reason: `Activate ${cardName} to filter AI hand and discard Graveyard setup`,
    };
  }

  // 1d. Hand Reshuffle Spells: Reload (22589918) & Magical Mallet (85852291)
  if (code === 22589918 || code === 85852291 || cardName.includes('Reload') || cardName.includes('Magical Mallet')) {
    if (oppField.currentLp <= 2000 && aiMonsterCount > 0) {
      return {
        score: -8000,
        reason: `[LOW OPPONENT LP GATEKEEPER] Hold ${cardName}: Opponent is at ${oppField.currentLp} LP; focus on attacking to finish the duel rather than reshuffling hand`,
      };
    }

    const dominance = evaluateBoardDominance(context);
    if (dominance.isDominating || dominance.isLethalOnBoard) {
      return {
        score: -8000,
        reason: `[DOMINANCE VETO] Hold ${cardName}: AI holds dominant board presence; do not waste cards reshuffling`,
      };
    }
    const currentPhase = context.currentPhase || context.boardState.currentPhase;
    const isMainPhase2 = currentPhase === 'M2' || currentPhase === 'MAIN2';
    if (isMainPhase2) {
      return {
        score: -5000,
        reason: `Hold ${cardName} in MP2: unneeded reshuffle after battle`,
      };
    }
    if (aiField.hand.length >= 3 && aiMonsterCount === 0) {
      return {
        score: 800 * (personality.comboFocus + 0.3),
        reason: `Activate ${cardName} to unbrick hand and dig for playable monsters/extenders`,
      };
    }
    return {
      score: -2000,
      reason: `Hold ${cardName}: current hand is playable or too small`,
    };
  }

  // 1e. Symmetrical Flip Draw: Morphing Jar (33508719 / 79106360)
  if (code === 33508719 || code === 79106360 || cardName.includes('Morphing Jar')) {
    if (oppField.currentLp <= 2000) {
      return {
        score: -15000,
        reason: `[LOW OPPONENT LP GATEKEEPER] Hold ${cardName}: Opponent is clinging to life at ${oppField.currentLp} LP. Refuse to give them 5 fresh cards!`,
      };
    }

    const dominance = evaluateBoardDominance(context);
    if (dominance.isDominating || dominance.isLethalOnBoard) {
      return {
        score: -15000,
        reason: `[DOMINANCE VETO] Hold ${cardName}: ${dominance.reason}. Refilling opponent hand to 5 cards is suicidal when dominating!`,
      };
    }
    const currentPhase = context.currentPhase || context.boardState.currentPhase;
    const isMainPhase2 = currentPhase === 'M2' || currentPhase === 'MAIN2';
    if (isMainPhase2 && (aiMonsterCount > 0 || aiField.currentLp >= oppField.currentLp)) {
      return {
        score: -12000,
        reason: `[MP2 VETO] Hold ${cardName} in Main Phase 2: giving opponent 5 fresh cards right before their turn is suicidal!`,
      };
    }
  }

  // 2. Mass Monster Removal: Raigeki (12580477)
  if (code === 12580477 || cardName.includes('Raigeki')) {
    if (oppMonsterCount === 0) {
      return { score: -500, reason: `Hold ${cardName} (opponent has no monsters on field)` };
    }
    const score = 800 + oppMonsterCount * 400 * (personality.aggression + 0.5);
    return {
      score,
      reason: `Activate ${cardName} to destroy all ${oppMonsterCount} opponent monster(s)`,
    };
  }

  // 3. Symmetric Board Wipe: Dark Hole (53129443)
  if (code === 53129443 || cardName.includes('Dark Hole')) {
    if (oppMonsterCount === 0) {
      return { score: -1000, reason: `Hold ${cardName} (opponent has no monsters)` };
    }
    if (aiMonsterCount > oppMonsterCount) {
      return {
        score: -400 * (aiMonsterCount - oppMonsterCount),
        reason: `Hold ${cardName} (would destroy more AI monsters than opponent)`,
      };
    }
    const score = 600 + (oppMonsterCount - aiMonsterCount) * 500;
    return {
      score,
      reason: `Activate ${cardName} to clear opponent's superior field (${oppMonsterCount} vs ${aiMonsterCount})`,
    };
  }

  // 3b. Symmetric Summon Response: Torrential Tribute (53582587)
  if (code === 53582587 || cardName.includes('Torrential Tribute')) {
    if (oppMonsterCount === 0) {
      return {
        score: -10000,
        reason: `Hold ${cardName}: Opponent controls 0 monsters on field (would destroy own monster for nothing)`,
      };
    }
    const aiTotalAtk = aiField.monsterZones.reduce((sum, m) => sum + (m?.atk ?? 0), 0);
    const oppTotalAtk = oppField.monsterZones.reduce((sum, m) => sum + (m?.atk ?? 0), 0);
    const oppMaxAtk = Math.max(0, ...oppField.monsterZones.map((m) => m?.atk ?? 0));

    // If AI has greater field presence and opponent has no dangerous threat: do NOT blow up own field!
    if (aiTotalAtk > oppTotalAtk && oppMaxAtk < 1800 && aiMonsterCount >= oppMonsterCount) {
      return {
        score: -6000,
        reason: `Hold ${cardName}: AI controls superior board (${aiTotalAtk} ATK vs ${oppTotalAtk} ATK)`,
      };
    }

    const score = 900 + (oppMonsterCount - aiMonsterCount) * 500 + oppMaxAtk * 0.4;
    return {
      score,
      reason: `Activate ${cardName} to wipe opponent's dangerous board (${oppMonsterCount} monsters, ${oppMaxAtk} top ATK)`,
    };
  }

  // 3c. Spell & Trap Board Wipes: Heavy Storm (19613556), Harpie's Feather Duster (18144506), Giant Trunade (42703248)
  if (
    code === 19613556 || // Heavy Storm
    code === 42703248 || // Giant Trunade
    code === 18144506 || // Harpie's Feather Duster
    cardName.includes('Heavy Storm') ||
    cardName.includes('Feather Duster') ||
    cardName.includes('Giant Trunade')
  ) {
    const isSymmetric = code === 19613556 || code === 42703248 || cardName.includes('Heavy Storm') || cardName.includes('Giant Trunade');
    const oppBackrowCount = oppField.spellTrapZones.filter(Boolean).length;
    const aiBackrowCount = aiField.spellTrapZones.filter(Boolean).length;
    const aiMonsterCount = aiField.monsterZones.filter(Boolean).length;
    const hasPlayableMonsterInHand = aiField.hand.some((c) => {
      const d = c.code > 0 ? context.cardReader.getCardDetail(c.code) : null;
      return d?.isMonster && (d?.level ?? 4) <= 4;
    });

    if (oppBackrowCount === 0 && !oppField.fieldZone) {
      return {
        score: -8000,
        reason: `Hold ${cardName}: Opponent controls 0 Spells/Traps`,
      };
    }

    if (isSymmetric) {
      // Check for active protective continuous spells/traps (Swords of Revealing Light, Gravity Bind, Level Limit, Messenger of Peace, Imperial Order)
      const hasActiveProtectiveCard = aiField.spellTrapZones.some((s) => {
        if (!s) return false;
        return (
          s.code === 72302403 || // Swords of Revealing Light
          s.code === 8574277 ||  // Gravity Bind
          s.code === 3136426 ||  // Level Limit - Area B
          s.code === 44656491 || // Messenger of Peace
          s.code === 61740673 || // Imperial Order
          (s.name && (s.name.includes('Swords of Revealing') || s.name.includes('Gravity Bind') || s.name.includes('Messenger of Peace')))
        );
      });

      if (hasActiveProtectiveCard) {
        return {
          score: -9000,
          reason: `Hold ${cardName}: Would destroy AI's own active protective Swords of Revealing Light / floodgate!`,
        };
      }

      if (aiBackrowCount > oppBackrowCount) {
        return {
          score: -3500 - (aiBackrowCount - oppBackrowCount) * 800,
          reason: `Hold ${cardName}: Would destroy more AI backrow (${aiBackrowCount}) than opponent (${oppBackrowCount})`,
        };
      }
    }

    // If opponent has only 1 backrow and AI has no monsters and cannot summon any monster this turn, hold Heavy Storm
    if (oppBackrowCount === 1 && !oppField.fieldZone && aiMonsterCount === 0 && !hasPlayableMonsterInHand) {
      return {
        score: -2000,
        reason: `[HOLD] Hold ${cardName}: AI has no monsters on field or playable in hand; save heavy storm for when ready to mount an offensive`,
      };
    }

    const score = 1000 + oppBackrowCount * 500 * (personality.aggression + 0.4);
    return {
      score,
      reason: `Activate ${cardName} to clear all ${oppBackrowCount} opponent Spell/Trap card(s)`,
    };
  }

  // 3d. Monster Stealing Spells: Change of Heart (4031928), Snatch Steal (45986603), Brain Control (87910978), Mind Control (37576645)
  if (
    code === 4031928 || // Change of Heart
    code === 45986603 || // Snatch Steal
    code === 87910978 || // Brain Control
    code === 37576645 || // Mind Control
    cardName.includes('Change of Heart') ||
    cardName.includes('Snatch Steal') ||
    cardName.includes('Brain Control') ||
    cardName.includes('Mind Control')
  ) {
    if (oppMonsterCount === 0) {
      return {
        score: -8000,
        reason: `Hold ${cardName}: Opponent controls 0 monsters to steal`,
      };
    }
    const oppMaxAtk = Math.max(0, ...oppField.monsterZones.map((m) => m?.atk ?? 0));
    const score = 1800 + oppMaxAtk * 0.5 * (personality.aggression + 0.5);
    return {
      score,
      reason: `Activate ${cardName} to take control of opponent's strongest monster (${oppMaxAtk} ATK)`,
    };
  }

  // 3e. Protective Stall Spells: Swords of Revealing Light (72302403)
  if (code === 72302403 || cardName.includes('Swords of Revealing Light')) {
    const oppTotalAtk = oppField.monsterZones.reduce((sum, m) => sum + (m?.atk ?? 0), 0);
    const aiTotalAtk = aiField.monsterZones.reduce((sum, m) => sum + (m?.atk ?? 0), 0);
    if (oppMonsterCount > 0 && oppTotalAtk >= aiTotalAtk) {
      return {
        score: 1800 * (personality.defensiveness + 0.5),
        reason: `Activate ${cardName} to freeze all opponent attacks for 3 turns`,
      };
    }
    return {
      score: 1100,
      reason: `Activate ${cardName} to reveal opponent monsters and prevent attacks`,
    };
  }

  // 3f. Spot Monster Destruction & Burn: Ring of Destruction (83555666)
  if (code === 83555666 || cardName.includes('Ring of Destruction')) {
    const oppFaceupMonsters = oppField.monsterZones.filter(
      (m) => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense') && (m.atk ?? 0) > 0,
    );
    if (oppFaceupMonsters.length === 0) {
      return {
        score: -8000,
        reason: `Hold ${cardName}: Opponent controls 0 face-up attack monsters to destroy`,
      };
    }

    const aiLp = aiField.currentLp;
    const oppLp = oppField.currentLp;

    // Filter targets that AI can destroy without killing itself
    const safeTargets = oppFaceupMonsters.filter((m) => (m.atk ?? 0) < aiLp);
    const lethalTargets = oppFaceupMonsters.filter((m) => (m.atk ?? 0) >= oppLp && (m.atk ?? 0) < aiLp);

    if (lethalTargets.length > 0) {
      const topTarget = lethalTargets.reduce((max, m) => ((m.atk ?? 0) > (max.atk ?? 0) ? m : max), lethalTargets[0]);
      return {
        score: 25000,
        reason: `[LETHAL] Activate Ring of Destruction targeting ${topTarget.name} (${topTarget.atk} ATK) to deal ${topTarget.atk} lethal burn damage to opponent!`,
      };
    }

    if (safeTargets.length === 0) {
      return {
        score: -50000,
        reason: `[SUICIDE PREVENTION] Hold Ring of Destruction: destroying opponent's monster would inflict damage >= AI's remaining Life Points (${aiLp} LP)`,
      };
    }

    const bestTarget = safeTargets.reduce((max, m) => ((m.atk ?? 0) > (max.atk ?? 0) ? m : max), safeTargets[0]);
    if ((bestTarget.atk ?? 0) >= 1500 && aiLp - (bestTarget.atk ?? 0) > 1000) {
      return {
        score: 1800 * (personality.defensiveness + 0.5),
        reason: `Activate Ring of Destruction targeting ${bestTarget.name} (${bestTarget.atk} ATK) for monster removal and burn`,
      };
    }

    return {
      score: 600,
      reason: `Activate Ring of Destruction`,
    };
  }

  // 3g. Targeted Spot Disruption Gatekeepers: Book of Moon, Compulsory, Enemy Controller, MST, Breaker, Mind Crush
  const oppFaceupMonsters = oppField.monsterZones.filter(
    (m) => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense'),
  );
  const oppBackrowCount = oppField.spellTrapZones.filter(Boolean).length + (oppField.fieldZone ? 1 : 0);

  // Book of Moon (14087893) & Compulsory Evacuation Device (94145021)
  if (code === 14087893 || cardName.includes('Book of Moon') || code === 94145021 || cardName.includes('Compulsory Evacuation')) {
    if (oppFaceupMonsters.length === 0) {
      return {
        score: -8000,
        reason: `[NO OPPONENT TARGET] Hold ${cardName}: Opponent controls no face-up monsters to target`,
      };
    }
    return {
      score: 1800 * (personality.defensiveness + 0.5),
      reason: `Disrupt opponent face-up monster with ${cardName}`,
    };
  }

  // Enemy Controller (98045062)
  if (code === 98045062 || cardName.includes('Enemy Controller')) {
    if (oppFaceupMonsters.length === 0) {
      return {
        score: -8000,
        reason: `[NO OPPONENT TARGET] Hold Enemy Controller: Opponent controls no face-up monsters to target`,
      };
    }
    return {
      score: 1600 * (personality.defensiveness + 0.5),
      reason: `Disrupt opponent monster with Enemy Controller`,
    };
  }

  // Targeted S/T Removal: Mystical Space Typhoon (5318639), Dust Tornado (99518961), Breaker the Magical Warrior (71413901)
  if (code === 5318639 || code === 99518961 || code === 71413901 || cardName.includes('Mystical Space Typhoon') || cardName.includes('Dust Tornado')) {
    if (oppBackrowCount === 0) {
      return {
        score: -8000,
        reason: `[NO OPPONENT TARGET] Hold ${cardName}: Opponent controls no Spell/Trap cards to destroy`,
      };
    }
  }

  // Targeted/Single Monster Destruction: Smashing Ground (97169186), Fissure (66788016), Soul Exchange (68005187)
  if (code === 97169186 || code === 66788016 || code === 68005187 || cardName.includes('Smashing Ground') || cardName.includes('Fissure')) {
    if (oppMonsterCount === 0) {
      return {
        score: -8000,
        reason: `[NO OPPONENT TARGET] Hold ${cardName}: Opponent controls no monsters to target/destroy`,
      };
    }
  }

  // Hand Announcement Disruption: Mind Crush (15800838)
  if (code === 15800838 || cardName.includes('Mind Crush')) {
    if (oppField.hand.length === 0) {
      return {
        score: -8000,
        reason: `[NO OPPONENT HAND] Hold Mind Crush: Opponent has no cards in hand`,
      };
    }
  }

  // 4. Monster Reborn (83764719) / Special Summon Spells
  if (code === 83764719 || cardName.includes('Monster Reborn') || cardName.includes('Call of the Haunted') || cardName.includes('Premature Burial')) {
    const isGodCard = (c?: number) => c === 10000000 || c === 10000020 || c === 10000010;
    const graveMonsters = [...aiField.graveyard, ...oppField.graveyard].filter(
      (c) => c && (c.atk !== undefined || c.level !== undefined),
    );
    const nonGodGraveTargets = graveMonsters.filter((c) => !isGodCard(c.code));

    // Egyptian God cards die at End Phase when Special Summoned!
    // On Turn 1 (no Battle Phase) or outside Main Phase 1 of AI's own turn, do NOT revive God cards if they are the only target!
    if (boardState.turnNumber === 1 && nonGodGraveTargets.length === 0) {
      return {
        score: -8000,
        reason: `Hold ${cardName} on Turn 1: Special Summoned Egyptian God cards would be sent to the GY at End Phase without having a Battle Phase`,
      };
    }

    const hasOppSlifer = oppField.monsterZones.some(
      (m) => m && m.code === 10000020 && (m.position === 'faceup_attack' || m.position === 'faceup_defense'),
    );
    const hasSurvivingGraveTarget = graveMonsters.some((c) => c && c.atk && c.atk > 2000);
    if (hasOppSlifer && !hasSurvivingGraveTarget) {
      return {
        score: -2000,
        reason: `Hold ${cardName} (opponent has active Slifer that would instantly destroy revived monster)`,
      };
    }

    const hasGoodGraveTarget = nonGodGraveTargets.some((c) => c && c.atk && c.atk >= 1800);
    if (hasGoodGraveTarget) {
      return {
        score: 1200 * (personality.comboFocus + 0.5),
        reason: `Activate ${cardName} to revive powerful monster from GY`,
      };
    }
    return {
      score: 500,
      reason: `Activate ${cardName} to special summon monster from GY`,
    };
  }

  // 5. Polymerization (24094653) / Fusion Spells
  if (code === 24094653 || cardName.includes('Polymerization') || cardName.includes('Fusion')) {
    return {
      score: 1400 * personality.comboFocus,
      reason: `Activate ${cardName} to perform Fusion Summon`,
    };
  }

  // 6. Direct Burn Spells (Hinotama, Ookazi, Sparks, Tremendous Fire, Just Desserts)
  if (
    code === 46130346 || // Hinotama (500)
    code === 19523799 || // Ookazi (800)
    code === 76103675 || // Sparks (50)
    code === 24068492 || // Just Desserts
    code === 46918794 // Tremendous Fire (1000)
  ) {
    if (oppLp <= 1000) {
      return {
        score: 12000,
        reason: `[LETHAL] Activate burn spell ${cardName} to finish off opponent!`,
      };
    }
    return {
      score: 400 + (8000 - oppLp) / 20,
      reason: `Activate direct burn spell ${cardName} to reduce opponent LP`,
    };
  }

  // 7. Spot Spell & Trap Destruction (Mystical Space Typhoon: 5318639, Dust Tornado: 99518961, Twister: 284224)
  if (
    code === 5318639 || // Mystical Space Typhoon
    code === 99518961 || // Dust Tornado
    code === 284224 ||   // Twister
    cardName.includes('Mystical Space Typhoon') ||
    cardName.includes('Dust Tornado')
  ) {
    const oppBackrowCount = oppField.spellTrapZones.filter(Boolean).length;
    const hasOppFieldSpell = !!oppField.fieldZone;
    const oppFaceupContinuous = oppField.spellTrapZones.filter((s) => s && (s.position === 'faceup_spell' || s.position === 'faceup_attack'));

    if (oppBackrowCount === 0 && !hasOppFieldSpell) {
      return {
        score: -8000,
        reason: `[HOLD] Do not activate ${cardName}: opponent controls 0 Spell/Trap cards to target`,
      };
    }

    // In a chain response: check what triggered the chain
    if (context.activeChainCards && context.activeChainCards.length > 0) {
      const lastChainCode = context.activeChainCards[context.activeChainCards.length - 1];
      const lastDetail = context.cardReader.getCardDetail(lastChainCode);
      const isContinuousOrField =
        !!lastDetail?.type &&
        ((lastDetail.type & 0x20000) !== 0 || // TYPE_CONTINUOUS
          (lastDetail.type & 0x40000) !== 0 || // TYPE_EQUIP
          (lastDetail.type & 0x80000) !== 0); // TYPE_FIELD

      // If opponent just activated a normal spell / normal trap / quick-play spell (NOT continuous/field):
      // MST destroys but does NOT negate! Chaining MST to a normal spell does not stop it and wastes MST!
      if (!isContinuousOrField && oppFaceupContinuous.length === 0 && !hasOppFieldSpell) {
        return {
          score: -8000,
          reason: `[HOLD] Do not chain ${cardName} to non-continuous spell/trap (destroying does not negate resolution)`,
        };
      }
    }

    if (oppFaceupContinuous.length > 0 || hasOppFieldSpell) {
      const topTargetName = oppFaceupContinuous[0]?.name || oppField.fieldZone?.name || 'continuous card';
      return {
        score: 3500,
        reason: `[PRIORITY TARGET] Activate ${cardName} to destroy opponent's active face-up ${topTargetName}`,
      };
    }

    // During End Phase of opponent's turn, popping face-down backrow is optimal
    const isOppEndPhase = !aiField.isTurn && boardState.currentPhase === 'EP';
    if (isOppEndPhase && oppBackrowCount > 0) {
      return {
        score: 2200,
        reason: `[END PHASE POP] Activate ${cardName} during opponent's End Phase to safely destroy set backrow`,
      };
    }

    // In AI's main phase before making plays
    if (aiField.isTurn && oppBackrowCount > 0) {
      return {
        score: 1400,
        reason: `Activate ${cardName} to eliminate opponent set backrow before executing plays`,
      };
    }

    return {
      score: 500,
      reason: `Activate ${cardName} to destroy opponent Spell/Trap card`,
    };
  }

  // 8. Battle & Attack Response Traps
  if (
    code === 44095762 || // Mirror Force
    code === 38199696 || // Sakuretsu Armor
    code === 70342110 || // Dimensional Prison
    code === 77754944 || // Widespread Ruin
    code === 62279055 || // Magic Cylinder
    code === 36368606 || // Threatening Roar
    code === 12607053 || // Waboku
    cardName.includes('Mirror Force') ||
    cardName.includes('Sakuretsu') ||
    cardName.includes('Dimensional Prison') ||
    cardName.includes('Magic Cylinder') ||
    cardName.includes('Threatening Roar') ||
    cardName.includes('Waboku')
  ) {
    const isBattlePhase = boardState.currentPhase === 'BP' || boardState.currentPhase === 'BATTLE_START' || boardState.currentPhase === 'BATTLE_STEP';
    if (!isBattlePhase) {
      return {
        score: -4000,
        reason: `[HOLD] Hold ${cardName} for Battle Phase attack declaration`,
      };
    }

    const oppAttackMonsters = oppField.monsterZones.filter((m) => m && m.position === 'faceup_attack');
    const oppMaxAtk = Math.max(0, ...oppField.monsterZones.map((m) => m?.atk ?? 0));
    const aiLp = aiField.currentLp;

    // Mirror Force: Mass attack-position board wipe
    if (code === 44095762 || cardName.includes('Mirror Force')) {
      if (oppAttackMonsters.length >= 2) {
        return {
          score: 6000 + oppAttackMonsters.length * 1000,
          reason: `[MASS WIPEOUT] Activate Mirror Force to destroy all ${oppAttackMonsters.length} attacking monsters!`,
        };
      }
      if (oppMaxAtk >= 1500 || oppMaxAtk >= aiLp) {
        return {
          score: 3800,
          reason: `Activate Mirror Force to destroy attacking ${oppMaxAtk} ATK threat`,
        };
      }
      return {
        score: 1500,
        reason: `Activate Mirror Force against attacking monster`,
      };
    }

    // Magic Cylinder: Reflect damage
    if (code === 62279055 || cardName.includes('Magic Cylinder')) {
      if (oppMaxAtk >= oppField.currentLp) {
        return {
          score: 35000,
          reason: `[LETHAL REFLECT] Activate Magic Cylinder to reflect ${oppMaxAtk} damage for instant victory!`,
        };
      }
      if (oppMaxAtk >= 1500) {
        return {
          score: 3500 + oppMaxAtk,
          reason: `Activate Magic Cylinder to negate attack and inflict ${oppMaxAtk} damage to opponent`,
        };
      }
      if (oppMaxAtk < 1000 && oppField.monsterZones.some((m) => (m?.atk ?? 0) > oppMaxAtk)) {
        return {
          score: -2000,
          reason: `[HOLD] Hold Magic Cylinder: attacking monster only has ${oppMaxAtk} ATK; save for higher ATK attacker`,
        };
      }
      return {
        score: 1000,
        reason: `Activate Magic Cylinder to negate attack`,
      };
    }

    // Single Target Removal: Sakuretsu Armor, Dimensional Prison, Widespread Ruin
    if (
      code === 38199696 ||
      code === 70342110 ||
      code === 77754944 ||
      cardName.includes('Sakuretsu') ||
      cardName.includes('Dimensional Prison') ||
      cardName.includes('Widespread')
    ) {
      if (oppMaxAtk >= aiLp) {
        return {
          score: 30000,
          reason: `[LETHAL DEFENSE] Activate ${cardName} to stop fatal direct attack!`,
        };
      }
      // If attacker is very weak (< 1000 ATK, e.g. 0 ATK Wightprince) while opponent has bigger monsters
      const hasBiggerThreat = oppField.monsterZones.some((m) => (m?.atk ?? 0) >= 1500);
      if (oppMaxAtk < 1000 && hasBiggerThreat && aiLp > 2000) {
        return {
          score: -3000,
          reason: `[HOLD] Hold ${cardName}: attacking monster is weak (${oppMaxAtk} ATK); save removal for opponent's higher-ATK threats`,
        };
      }
      if (oppMaxAtk >= 1500) {
        return {
          score: 3200 * (personality.defensiveness + 0.5),
          reason: `Activate ${cardName} to remove attacking ${oppMaxAtk} ATK monster`,
        };
      }
      return {
        score: 1200,
        reason: `Activate ${cardName} to destroy attacking monster`,
      };
    }

    // Threatening Roar / Waboku: End battle phase / prevent damage
    if (code === 36368606 || code === 12607053 || cardName.includes('Threatening Roar') || cardName.includes('Waboku')) {
      const oppTotalAtk = oppField.monsterZones.reduce((sum, m) => sum + (m?.atk ?? 0), 0);
      if (oppTotalAtk >= aiLp || oppAttackMonsters.length >= 2) {
        return {
          score: 4000,
          reason: `Activate ${cardName} to prevent lethal battle damage and survive the turn`,
        };
      }
      return {
        score: 1800,
        reason: `Activate ${cardName} to protect life points during battle`,
      };
    }
  }

  // 9. Summon Response Removal Traps
  if (
    code === 94192409 || // Compulsory Evacuation Device
    code === 29401950 || // Bottomless Trap Hole
    code === 53582587 || // Torrential Tribute
    cardName.includes('Compulsory') ||
    cardName.includes('Bottomless') ||
    cardName.includes('Torrential')
  ) {
    const oppFaceupMonsters = oppField.monsterZones.filter((m) => m && (m.position === 'faceup_attack' || m.position === 'faceup_defense'));
    const oppMaxAtk = Math.max(0, ...oppFaceupMonsters.map((m) => m?.atk ?? 0));
    const aiMonsterCount = aiField.monsterZones.filter(Boolean).length;

    if (code === 53582587 || cardName.includes('Torrential')) {
      if (aiMonsterCount > oppFaceupMonsters.length && aiMonsterCount >= 2) {
        return {
          score: -3500,
          reason: `[HOLD] Hold Torrential Tribute: would destroy more AI monsters (${aiMonsterCount}) than opponent (${oppFaceupMonsters.length})`,
        };
      }
      if (oppFaceupMonsters.length >= 2 || oppMaxAtk >= 2000) {
        return {
          score: 4200,
          reason: `[BOARD WIPE] Activate Torrential Tribute to wipe ${oppFaceupMonsters.length} monsters (${oppMaxAtk} top ATK)`,
        };
      }
      return {
        score: 1200,
        reason: `Activate Torrential Tribute on summon`,
      };
    }

    if (code === 29401950 || cardName.includes('Bottomless')) {
      if (oppMaxAtk >= 1500) {
        return {
          score: 3500,
          reason: `[BANISH REMOVAL] Activate Bottomless Trap Hole to destroy & banish summoned monster (${oppMaxAtk} ATK)`,
        };
      }
      return {
        score: 800,
        reason: `Activate Bottomless Trap Hole on summon`,
      };
    }

    if (code === 94192409 || cardName.includes('Compulsory')) {
      if (oppMaxAtk >= 1500) {
        return {
          score: 3200,
          reason: `Activate Compulsory Evacuation Device to bounce summoned threat (${oppMaxAtk} ATK) back to hand`,
        };
      }
      return {
        score: 1000,
        reason: `Activate Compulsory Evacuation Device to bounce target`,
      };
    }
  }

  // 10. Combat Stat Doubler / Quick-Play: Limiter Removal (2317163)
  if (code === 2317163 || cardName.includes('Limiter Removal')) {
    const isBattlePhase = boardState.currentPhase === 'BP' || boardState.currentPhase === 'BATTLE_START' || boardState.currentPhase === 'BATTLE_STEP';
    const machineMonsters = aiField.monsterZones.filter((m) => m && (m.race === 'Machine' || m.race === 'MACHINE' || m.position === 'faceup_attack'));
    const totalMachineAtk = machineMonsters.reduce((sum, m) => sum + (m?.atk ?? 0), 0);
    const doubledTotalAtk = totalMachineAtk * 2;
    const isLethal = doubledTotalAtk >= oppLp && totalMachineAtk > 0;

    if (isLethal) {
      return {
        score: 16000,
        reason: `[LETHAL OTK] Activate Limiter Removal to double Machine ATK (${totalMachineAtk} -> ${doubledTotalAtk}) for game!`,
      };
    }
    if (!isBattlePhase) {
      return {
        score: -4000,
        reason: `Hold Limiter Removal until Battle Phase / Damage Step to avoid destroying machines at End Phase for no reason`,
      };
    }
    if (machineMonsters.length > 0) {
      return {
        score: 1200 * (personality.aggression + 0.5),
        reason: `Activate Limiter Removal in battle to double Machine monster ATK`,
      };
    }
    return {
      score: -2000,
      reason: `Hold Limiter Removal (no machine monsters on field)`,
    };
  }

  // 11. Combat Stat Modifiers / Quick-Plays (Shrink: 55713623, Rush Recklessly: 70046172)
  if (code === 55713623 || cardName.includes('Shrink') || code === 70046172 || cardName.includes('Rush Recklessly')) {
    const isBattlePhase = boardState.currentPhase === 'BP' || boardState.currentPhase === 'BATTLE_START' || boardState.currentPhase === 'BATTLE_STEP';
    if (!isBattlePhase) {
      return {
        score: -3000,
        reason: `Hold ${cardName} for battle damage calculation (do not waste in Main Phase)`,
      };
    }
    return {
      score: 800,
      reason: `Activate ${cardName} during combat to alter ATK in battle clash`,
    };
  }

  // 12. Signature Card Priority
  if (signatureCardIds.includes(code)) {
    return {
      score: 1000 * personality.signatureFavoritism,
      reason: `Activate signature card ${cardName}`,
    };
  }

  // Generic beneficial spell activation
  return {
    score: 500 * (personality.comboFocus + 0.3),
    reason: `Activate spell/effect ${cardName}`,
  };
}

export function evaluateSpellTrapSet(
  code: number,
  cardName: string,
  context: EvaluatorContext,
): { score: number; reason: string } {
  const { personality: rawPersonality } = context;
  const personality = {
    aggression: 0.5,
    defensiveness: 0.5,
    riskTolerance: 0.5,
    comboFocus: 0.5,
    cardAdvantageWeight: 1.0,
    signatureFavoritism: 0.5,
    ...rawPersonality,
  };
  const { aiField } = getAiAndOpponentFields(context);

  const currentBackrowCount = aiField.spellTrapZones.filter(Boolean).length;
  if (currentBackrowCount >= 5) {
    return {
      score: -1000,
      reason: `Backrow is completely full (5/5 set)`,
    };
  }

  // Preserve open Spell/Trap zones when Destiny Board is active on field
  const hasActiveDestinyBoard = aiField.spellTrapZones.some(
    (c) => !!c && c.code === 94212438 && (c.position === 'faceup_attack' || c.position === 'faceup_spell'),
  );
  const hasDarkSanctuary =
    aiField.fieldZone?.code === 16625614 ||
    aiField.spellTrapZones.some((c) => !!c && c.code === 16625614);

  if (hasActiveDestinyBoard && !hasDarkSanctuary) {
    // Count active spirit messages on field: I (31893528), N (67287533), A (94772232), L (30170981)
    const spiritMsgCount = aiField.spellTrapZones.filter(
      (c) => !!c && (c.code === 31893528 || c.code === 67287533 || c.code === 94772232 || c.code === 30170981),
    ).length;
    const remainingMessagesNeeded = 4 - spiritMsgCount;
    const openZones = 5 - currentBackrowCount;

    if (openZones <= remainingMessagesNeeded) {
      return {
        score: -9500,
        reason: `[PRESERVE BACKROW] Do not set ${cardName}: preserve open Spell/Trap zones for Destiny Board Spirit Messages (${openZones} open vs ${remainingMessagesNeeded} messages needed)`,
      };
    }
  }

  if (currentBackrowCount >= 4) {
    return {
      score: -200,
      reason: `Avoid backrow congestion (already ${currentBackrowCount}/5 set)`,
    };
  }

  // Score setting traps / defensive spells
  const detail = code > 0 ? context.cardReader.getCardDetail(code) : null;
  const isTrap = detail?.isTrap ?? (cardName.includes('Trap') || cardName.includes('Mirror') || cardName.includes('Hole') || cardName.includes('Armor') || cardName.includes('Cylinder') || cardName.includes('Prison') || cardName.includes('Bribe') || cardName.includes('Judgment'));
  const isQuickPlay = detail?.isQuickPlay ?? cardName.includes('Quick-Play');

  // Premier reactive disruption / protection staples
  const isPremierStaple =
    code === 94192409 || // Compulsory Evacuation Device
    code === 29401950 || // Bottomless Trap Hole
    code === 44095762 || // Mirror Force
    code === 53582587 || // Torrential Tribute
    code === 41420027 || // Solemn Judgment
    code === 70342110 || // Dimensional Prison
    code === 62279055 || // Magic Cylinder
    code === 38199696 || // Sakuretsu Armor
    code === 83555666 || // Ring of Destruction
    code === 36368606 || // Threatening Roar
    code === 12607053 || // Waboku
    code === 99518961 || // Dust Tornado
    code === 77414722 || // Dark Bribe
    code === 97077563 || // Call of the Haunted
    code === 14087893 || // Book of Moon
    code === 98045062 || // Enemy Controller
    code === 55713623 || // Shrink
    code === 70046172 || // Rush Recklessly
    code === 5318639 ||  // Mystical Space Typhoon
    cardName.includes('Compulsory') ||
    cardName.includes('Bottomless') ||
    cardName.includes('Mirror Force') ||
    cardName.includes('Torrential') ||
    cardName.includes('Solemn') ||
    cardName.includes('Dimensional Prison');

  // Phase timing:
  const currentPhase = context.currentPhase || context.boardState.currentPhase;
  const isMainPhase1 = currentPhase === 'M1' || currentPhase === 'DP' || currentPhase === 'SP';
  const isMainPhase2 = currentPhase === 'M2';
  const isTurn1 = context.boardState.turnNumber === 1;

  // In Main Phase 1 (before combat):
  // Quick-Play Spells (Book of Moon, Enemy Controller, MST, Shrink, Rush Recklessly)
  // CANNOT be activated the turn they are set!
  // Setting them in MP1 prevents using them from hand during Battle Phase.
  if (isQuickPlay && isMainPhase1 && !isTurn1) {
    return {
      score: -3500,
      reason: `[HOLD IN HAND] Keep Quick-Play Spell ${cardName} in hand during MP1 so it remains activatable during the Battle Phase`,
    };
  }

  // In Main Phase 2 or Turn 1:
  // Setting defensive traps and quick-plays receives a massive bonus so they are set before ending the turn.
  const phaseBonus = (isMainPhase2 || isTurn1) ? 1400 : 0;

  if (isPremierStaple) {
    const score = 1200 * (personality.defensiveness + 0.6) + (4 - currentBackrowCount) * 80 + phaseBonus;
    return {
      score,
      reason: `[PRIORITY SET] Set premier defensive trap/quick-play ${cardName} for opponent's turn`,
    };
  }

  if (isTrap || isQuickPlay) {
    const score = 850 * (personality.defensiveness + 0.5) + (4 - currentBackrowCount) * 60 + phaseBonus;
    return {
      score,
      reason: `Set defensive Trap/Quick-Play ${cardName} for opponent's turn`,
    };
  }

  // 5. Setting Normal Spell (Fissure, Raigeki, Dark Hole, Monster Reborn, Polymerization, Pot of Greed, etc.)
  // Normal Spells CANNOT be activated on the opponent's turn. Setting them face-down provides ZERO defense,
  // clogs backrow zones, and exposes them to destruction by Heavy Storm / MST.
  if (aiField.hand.length > 6) {
    return {
      score: -200,
      reason: `[BLUFF / DUMP] Set ${cardName} only to avoid discarding at End Phase hand limit`,
    };
  }

  return {
    score: -4500,
    reason: `[HOLD IN HAND] Do not set Normal Spell ${cardName} face-down; Normal Spells cannot be activated on opponent's turn and clog backrow zones`,
  };
}
