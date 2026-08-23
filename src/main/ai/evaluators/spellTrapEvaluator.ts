import type { EvaluatorContext } from '../types.js';
import type { PlayerFieldState } from '../../../shared/types/field.js';

export function evaluateSpellActivation(
  code: number,
  cardName: string,
  context: EvaluatorContext,
): { score: number; reason: string } {
  const { aiPlayerId, boardState, personality, signatureCardIds } = context;
  const aiField: PlayerFieldState = aiPlayerId === 0 ? boardState.userField : boardState.opponentField;
  const oppField: PlayerFieldState = aiPlayerId === 0 ? boardState.opponentField : boardState.userField;

  const oppMonsterCount = oppField.monsterZones.filter(Boolean).length;
  const aiMonsterCount = aiField.monsterZones.filter(Boolean).length;
  const oppLp = oppField.currentLp;

  // 1. Draw Power Spells (Pot of Greed, Graceful Charity, etc.)
  if (code === 55144522 || code === 79571449 || cardName.includes('Greed') || cardName.includes('Charity')) {
    return {
      score: 1800 * personality.cardAdvantageWeight,
      reason: `Activate draw spell ${cardName} (+2 card advantage)`,
    };
  }

  // 1b. Hand Refresh & Disruption: Card Destruction (72892420)
  if (code === 72892420 || cardName.includes('Card Destruction')) {
    const aiHandCount = aiField.hand.length;
    const oppHandCount = oppField.hand.length;

    // If AI has small hand (<= 2) and opponent has a larger hand (>= 3): DO NOT REFRESH OPPONENT HAND!
    if (aiHandCount <= 2 && oppHandCount >= 3) {
      return {
        score: -4500,
        reason: `Hold ${cardName}: would give opponent +${oppHandCount} fresh cards while AI only has ${aiHandCount}`,
      };
    }
    // If opponent has huge hand (5+ cards) or AI has larger hand than opponent:
    if (oppHandCount >= 5 || aiHandCount > oppHandCount) {
      return {
        score: 1600 * personality.cardAdvantageWeight,
        reason: `Activate ${cardName} to disrupt opponent hand (${oppHandCount} cards) and cycle AI cards (${aiHandCount} cards)`,
      };
    }
    return {
      score: 300,
      reason: `Activate ${cardName} to cycle hand`,
    };
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

    if (oppBackrowCount === 0) {
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

  // 4. Monster Reborn (83764719) / Special Summon Spells
  if (code === 83764719 || cardName.includes('Monster Reborn') || cardName.includes('Call of the Haunted') || cardName.includes('Premature Burial')) {
    const hasOppSlifer = oppField.monsterZones.some(
      (m) => m && m.code === 10000020 && (m.position === 'faceup_attack' || m.position === 'faceup_defense'),
    );
    const hasSurvivingGraveTarget = [...aiField.graveyard, ...oppField.graveyard].some(
      (c) => c && c.atk && c.atk > 2000,
    );
    if (hasOppSlifer && !hasSurvivingGraveTarget) {
      return {
        score: -2000,
        reason: `Hold ${cardName} (opponent has active Slifer that would instantly destroy revived monster)`,
      };
    }

    const hasGoodGraveTarget = [...aiField.graveyard, ...oppField.graveyard].some(
      (c) => c && c.atk && c.atk >= 1800,
    );
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
    code === 5318639 || // Sparks (50)
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

  // 7. Combat Stat Doubler / Quick-Play: Limiter Removal (2317163)
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

  // 8. Combat Stat Modifiers / Quick-Plays (Shrink: 55713623, Rush Recklessly: 70046172)
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

  // 9. Signature Card Priority
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
  const { aiPlayerId, boardState, personality } = context;
  const aiField: PlayerFieldState = aiPlayerId === 0 ? boardState.userField : boardState.opponentField;

  const currentBackrowCount = aiField.spellTrapZones.filter(Boolean).length;
  if (currentBackrowCount >= 5) {
    return {
      score: -1000,
      reason: `Backrow is completely full (5/5 set)`,
    };
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

  if (isPremierStaple) {
    const score = 1400 * (personality.defensiveness + 0.6) + (4 - currentBackrowCount) * 80;
    return {
      score,
      reason: `[PRIORITY SET] Set premier defensive trap/quick-play ${cardName} for opponent's turn`,
    };
  }

  if (isTrap || isQuickPlay) {
    const score = 950 * (personality.defensiveness + 0.5) + (4 - currentBackrowCount) * 60;
    return {
      score,
      reason: `Set defensive Trap/Quick-Play ${cardName} for opponent's turn`,
    };
  }

  // Setting normal spell (e.g. to save hand space or bluff)
  if (aiField.hand.length > 5) {
    return {
      score: 300,
      reason: `Set spell ${cardName} to manage hand size and prevent discard`,
    };
  }

  return {
    score: 150,
    reason: `Set spell ${cardName} to backrow`,
  };
}
