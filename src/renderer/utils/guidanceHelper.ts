import type {
  SelectCardPayload,
  SelectChainPayload,
  SelectPositionPayload,
  SelectEffectYnPayload,
  SelectOptionPayload,
  SelectTributePayload,
} from '../../shared/types/duel.js';
import type { DuelBoardState } from '../../shared/types/field.js';

export interface ActionGuideInfo {
  category: 'tribute' | 'cost' | 'target' | 'chain' | 'position' | 'effect-yn' | 'option' | 'cleanup' | 'idle' | 'battle' | 'opponent';
  categoryLabel: string;
  categoryIcon: string;
  instruction: string;
  subText?: string;
  isMandatory: boolean;
  canCancel: boolean;
  selectionProgress?: {
    current: number;
    requiredMin: number;
    requiredMax: number;
  };
}

/**
 * Translates active engine prompts and turn states into plain-language guidance instructions (§3.6).
 */
export function getActionGuideInfo(
  boardState: DuelBoardState,
  isUserTurn: boolean,
  prompts: {
    selectCard: SelectCardPayload | null;
    selectTribute: SelectTributePayload | null;
    selectChain: SelectChainPayload | null;
    selectPosition: SelectPositionPayload | null;
    selectEffectYn: SelectEffectYnPayload | null;
    selectOption: SelectOptionPayload | null;
  },
  selectedCount = 0,
): ActionGuideInfo {
  // 1. End Phase Hand-Size Cleanup Prompt (§3.4) - ONLY in End Phase ('EP')
  const isEndPhaseCleanup =
    boardState.currentPhase === 'EP' &&
    prompts.selectCard &&
    prompts.selectCard.selects.length > 0 &&
    prompts.selectCard.selects.every((s) => s.location === 2) &&
    !prompts.selectCard.can_cancel;

  if (isEndPhaseCleanup && prompts.selectCard) {
    const min = prompts.selectCard.min;
    return {
      category: 'cleanup',
      categoryLabel: 'Hand Size Limit',
      categoryIcon: '⚠️',
      instruction: `Hand Size Limit Exceeded: You hold more than 6 cards at End Phase. Select ${min} card(s) to discard.`,
      subText: 'This is a mandatory rules cleanup. You must discard down to 6 cards before turn passes.',
      isMandatory: true,
      canCancel: false,
      selectionProgress: {
        current: selectedCount,
        requiredMin: min,
        requiredMax: min,
      },
    };
  }

  // 2. Tribute Summon Selection Prompt (§3.6)
  if (prompts.selectTribute) {
    const min = prompts.selectTribute.min;
    const max = prompts.selectTribute.max;
    const monsterWord = min === 1 ? '1 monster' : `${min} monsters`;
    return {
      category: 'tribute',
      categoryLabel: 'Tribute Summon',
      categoryIcon: '🔥',
      instruction: `Tribute Summon: Select ${monsterWord} on your field to Tribute as cost to Summon your monster.`,
      subText: 'Only monsters on your own field can be chosen as Tributes.',
      isMandatory: true,
      canCancel: false,
      selectionProgress: {
        current: selectedCount,
        requiredMin: min,
        requiredMax: max,
      },
    };
  }

  // 3. General Card Selection Prompt (Cost vs. Effect vs. Target)
  if (prompts.selectCard) {
    const min = prompts.selectCard.min;
    const max = prompts.selectCard.max;
    const canCancel = !!prompts.selectCard.can_cancel;

    const isHandOnly =
      prompts.selectCard.selects.length > 0 &&
      prompts.selectCard.selects.every((s) => s.location === 2); // All in Hand (Location 2)

    // Check if target is on field (destroy/effect target)
    const isFieldTarget =
      prompts.selectCard.selects.length > 0 &&
      prompts.selectCard.selects.every((s) => s.location === 4 || s.location === 8 || s.location === 256);

    // Check if target is in Graveyard
    const isGraveTarget =
      prompts.selectCard.selects.length > 0 &&
      prompts.selectCard.selects.every((s) => s.location === 16);

    if (isHandOnly) {
      // Optional or multi-card special summon / effect from hand (e.g. The Flute of Summoning Dragon, Polymerization)
      if (min === 0) {
        return {
          category: 'target',
          categoryLabel: 'Card Effect Selection',
          categoryIcon: '🐉',
          instruction: `Card Effect: Select up to ${max} card(s) from your hand to proceed.`,
          subText: `You can select up to ${max} card(s), or press Confirm (0/${max}) to summon none / pass.`,
          isMandatory: false,
          canCancel: true,
          selectionProgress: {
            current: selectedCount,
            requiredMin: 0,
            requiredMax: max,
          },
        };
      }

      // If min > 0 and cancelable, likely an optional cost payment
      if (canCancel) {
        return {
          category: 'cost',
          categoryLabel: 'Cost Payment',
          categoryIcon: '⚡',
          instruction: `Cost Payment: Choose ${min}${max > min ? ` to ${max}` : ''} card(s) in your hand to discard as a cost.`,
          subText: 'This is a cost — it happens immediately and cannot be refunded even if the effect is negated.',
          isMandatory: false,
          canCancel: true,
          selectionProgress: {
            current: selectedCount,
            requiredMin: min,
            requiredMax: max,
          },
        };
      }

      // General mandatory card effect selection from hand
      return {
        category: 'target',
        categoryLabel: 'Card Effect Selection',
        categoryIcon: '🎴',
        instruction: `Card Effect: Select ${min}${max > min ? ` to ${max}` : ''} card(s) from your hand to proceed.`,
        subText: 'Click the highlighted card(s) in your hand, then click Confirm.',
        isMandatory: true,
        canCancel: false,
        selectionProgress: {
          current: selectedCount,
          requiredMin: min,
          requiredMax: max,
        },
      };
    }

    if (isFieldTarget) {
      return {
        category: 'target',
        categoryLabel: 'Effect Target',
        categoryIcon: '🎯',
        instruction: `Effect Target: Select ${min}${max > min ? ` to ${max}` : ''} card(s) on the field to target for this effect.`,
        subText: 'Click any eligible monster or spell/trap highlighted with a target icon on the field.',
        isMandatory: !canCancel,
        canCancel,
        selectionProgress: {
          current: selectedCount,
          requiredMin: min,
          requiredMax: max,
        },
      };
    }

    if (isGraveTarget) {
      return {
        category: 'target',
        categoryLabel: 'Graveyard Target',
        categoryIcon: '🪦',
        instruction: `Graveyard Target: Select ${min}${max > min ? ` to ${max}` : ''} card(s) in the Graveyard.`,
        subText: 'Choose from the eligible cards in the Graveyard stack.',
        isMandatory: !canCancel,
        canCancel,
        selectionProgress: {
          current: selectedCount,
          requiredMin: min,
          requiredMax: max,
        },
      };
    }

    return {
      category: 'target',
      categoryLabel: 'Card Selection',
      categoryIcon: '🎯',
      instruction: `Select ${min}${max > min ? ` to ${max}` : ''} card(s) to proceed with the active effect.`,
      subText: canCancel ? 'You may click Cancel if you do not wish to proceed.' : undefined,
      isMandatory: !canCancel,
      canCancel,
      selectionProgress: {
        current: selectedCount,
        requiredMin: min,
        requiredMax: max,
      },
    };
  }

  // 4. Chain Window Opportunity Prompt (§3.6)
  if (prompts.selectChain) {
    if (prompts.selectChain.forced) {
      return {
        category: 'chain',
        categoryLabel: 'Mandatory Chain',
        categoryIcon: '⛓️',
        instruction: 'Mandatory Trigger Effect: A card effect must activate now to respond to the chain.',
        subText: 'This effect is mandatory and cannot be skipped.',
        isMandatory: true,
        canCancel: false,
      };
    }
    return {
      category: 'chain',
      categoryLabel: 'Chain Opportunity',
      categoryIcon: '⛓️',
      instruction: 'Chain Window: You may activate a Spell, Trap, or Quick Effect in response, or pass priority.',
      subText: 'Select an available card to chain, or click "Pass (Do Not Chain)" to let the chain resolve.',
      isMandatory: false,
      canCancel: true,
    };
  }

  // 5. Battle Position Selection Prompt
  if (prompts.selectPosition) {
    return {
      category: 'position',
      categoryLabel: 'Battle Position',
      categoryIcon: '🛡️',
      instruction: `Select Battle Position: Choose Attack Position ⚔️ or Defense Position 🛡️ for ${prompts.selectPosition.cardName || 'your monster'}.`,
      subText: 'Monsters in Attack Position can declare attacks; monsters in Defense Position protect your Life Points.',
      isMandatory: true,
      canCancel: false,
    };
  }

  // 6. Optional Effect Trigger Prompt (Yes/No)
  if (prompts.selectEffectYn) {
    return {
      category: 'effect-yn',
      categoryLabel: 'Optional Trigger',
      categoryIcon: '❓',
      instruction: `Optional Effect: Do you want to activate the effect of "${prompts.selectEffectYn.cardName || 'this card'}"?`,
      subText: 'This is an optional effect. You can choose Yes to activate or No to decline.',
      isMandatory: false,
      canCancel: true,
    };
  }

  // 7. Option Selection Prompt
  if (prompts.selectOption) {
    return {
      category: 'option',
      categoryLabel: 'Choose Option',
      categoryIcon: '📋',
      instruction: 'Select one of the choices to resolve this card effect.',
      isMandatory: true,
      canCancel: false,
    };
  }

  // 8. Idle Phase Command State (Main Phase 1 & 2)
  if (isUserTurn) {
    const phase = boardState.currentPhase;
    if (phase === 'M1' || phase === 'M2') {
      const phaseNum = phase === 'M1' ? '1' : '2';
      return {
        category: 'idle',
        categoryLabel: `Main Phase ${phaseNum}`,
        categoryIcon: '⚔️',
        instruction: `Main Phase ${phaseNum}: Select a card in your hand to Summon, Set, or Activate — or proceed with the phase buttons.`,
        subText: phase === 'M1' ? 'You can enter Battle Phase when ready to attack.' : 'You can Set additional cards before ending your turn.',
        isMandatory: false,
        canCancel: false,
      };
    }

    if (phase === 'BP') {
      return {
        category: 'battle',
        categoryLabel: 'Battle Phase',
        categoryIcon: '⚔️',
        instruction: 'Battle Phase: Select an Attack Position monster on your field to declare an attack.',
        subText: 'Click your monster, then choose "Declare Attack". Proceed to Main Phase 2 or End Turn when finished.',
        isMandatory: false,
        canCancel: false,
      };
    }

    if (phase === 'DP') {
      return {
        category: 'idle',
        categoryLabel: 'Draw Phase',
        categoryIcon: '🎴',
        instruction: 'Draw Phase: 1 card drawn from your Main Deck.',
        isMandatory: false,
        canCancel: false,
      };
    }

    if (phase === 'SP') {
      return {
        category: 'idle',
        categoryLabel: 'Standby Phase',
        categoryIcon: '⏳',
        instruction: 'Standby Phase: Turn preparation and continuous effects resolve.',
        isMandatory: false,
        canCancel: false,
      };
    }

    if (phase === 'EP') {
      return {
        category: 'idle',
        categoryLabel: 'End Phase',
        categoryIcon: '⌛',
        instruction: 'End Phase: Concluding your turn and passing priority to the opponent.',
        isMandatory: false,
        canCancel: false,
      };
    }
  }

  // 9. Opponent Turn
  return {
    category: 'opponent',
    categoryLabel: "Opponent's Turn",
    categoryIcon: '👁️',
    instruction: `${boardState.opponentField.name || 'Opponent'} is contemplating their next move...`,
    subText: 'Watch for opportunities to respond with Fast Effects or Traps.',
    isMandatory: false,
    canCancel: false,
  };
}
