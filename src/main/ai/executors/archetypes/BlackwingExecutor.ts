import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';
import { evaluateSynchroOpportunities } from '../../evaluators/synchroSolver.js';

export class BlackwingExecutor extends DefaultExecutor {
  public override readonly id = 'blackwing-swarming';
  public override readonly name = 'Blackwing Swarm & Synchro Executor';
  public override readonly description = 'Crow Hogan aerial assault: Black Whirlwind search chaining, Gale ATK halving, Kalut hand trap surprises, and Icarus Attack 2-for-1 disruption.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('blackwing');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(91351370) || // Black Whirlwind
      cards.includes(58820853) || // Shura the Blue Flame
      cards.includes(49003716) || // Bora the Spear
      cards.includes(2009101) ||  // Gale the Whirlwind
      cards.includes(85215458) || // Kalut the Moon Shadow
      cards.includes(69031175);   // Armor Master
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // Detect if Black Whirlwind is already active on field
    const hasActiveWhirlwind = (aiField.spellTrapZones || []).some(
      (st) => st && st.code === 91351370 && st.position === 'faceup',
    );

    // Count Blackwings on field
    const blackwingsOnField = (aiField.monsterZones || []).filter((m) => {
      if (!m) return false;
      const name = context.cardReader?.getCardName(m.code) || '';
      return name.toLowerCase().includes('blackwing');
    });

    // Synchro solver check
    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Black Whirlwind (91351370): MUST activate BEFORE any normal summon
      if (code === 91351370) {
        c.score += 6500;
        c.reason = `[WHIRLWIND PRIORITY] Activate Black Whirlwind face-up before Normal Summoning to search combo pieces!`;
      }

      // 2. Normal Summon with Whirlwind active: Priority Shura (1800) > Bora (1700) > Blizzard (1300)
      else if (code === 58820853) { // Shura
        c.score += hasActiveWhirlwind ? 3800 : 1200;
        c.reason = `[BLACKWING BEATDOWN] Normal Summon Shura (1800 ATK) to trigger Whirlwind and combat floating!`;
      }
      else if (code === 49003716) { // Bora
        if (blackwingsOnField.length > 0) {
          c.score += 3400;
          c.reason = `[BORA SWARM] Special Summon Bora the Spear from hand alongside active Blackwing!`;
        } else {
          c.score += hasActiveWhirlwind ? 3200 : 2000;
        }
      }
      else if (code === 2009101) { // Gale the Whirlwind
        if (blackwingsOnField.length > 0) {
          c.score += 3900;
          c.reason = `[GALE SPECIAL] Special Summon Gale the Whirlwind (Tuner) for ATK halving and Synchro climb!`;
        } else {
          c.score += 2400;
        }
      }

      // 3. Gale's on-field ignition effect: Halve ATK/DEF of opponent's strongest monster
      else if (c.action.type === OcgResponseType.SELECT_IDLECMD && code === 2009101) {
        c.score += 3600;
        c.reason = `[GALE EFFECT] Halve ATK and DEF of opponent monster permanently!`;
      }

      // 4. Synchro Boss Priority (Armor Master 69031175 / Armed Wing 76913983)
      if (topSynchro && code === topSynchro.synchroCode) {
        c.score += topSynchro.scoreBonus + 800;
        c.reason = `[BLACKWING SYNCHRO] Tune into ${topSynchro.synchroName} for devastating aerial assault!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Black Whirlwind (91351370) Search:
    // Priority: Kalut (85215458) > Gale (2009101) > Bora (49003716) > Blizzard (2283514)
    if (activeChainCards?.includes(91351370)) {
      const kalutIdx = rawSelects.findIndex((s) => s.code === 85215458);
      if (kalutIdx >= 0) return [kalutIdx];

      const galeIdx = rawSelects.findIndex((s) => s.code === 2009101);
      if (galeIdx >= 0) return [galeIdx];

      const boraIdx = rawSelects.findIndex((s) => s.code === 49003716);
      if (boraIdx >= 0) return [boraIdx];
    }

    // Shura the Blue Flame (58820853) float:
    // Priority: Gale the Whirlwind (2009101) > Vayu (72714392)
    if (activeChainCards?.includes(58820853)) {
      const galeIdx = rawSelects.findIndex((s) => s.code === 2009101);
      if (galeIdx >= 0) return [galeIdx];
    }

    // Icarus Attack (53567095) target selection:
    // Priority 1: Opponent monsters with ATK >= 2000
    // Priority 2: Opponent face-down backrow
    if (activeChainCards?.includes(53567095)) {
      const opponentTargets: number[] = [];
      for (let i = 0; i < rawSelects.length; i++) {
        const s = rawSelects[i];
        if (s.controler !== context.aiPlayerId) {
          opponentTargets.push(i);
        }
      }
      if (opponentTargets.length >= 2) {
        return opponentTargets.slice(0, 2);
      }
    }

    return null;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];
    const currentPhase = context.boardState.currentPhase;

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Kalut the Moon Shadow (85215458): Discard from hand during Damage Step (+1400 ATK!)
      if (code === 85215458 && currentPhase === 'DAMAGE_STEP') {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 5200,
          reason: `[KALUT COMBAT SURPRISE] Send Kalut from hand to GY for +1400 ATK surprise victory in battle!`,
          cardCode: code,
          cardName: 'Blackwing - Kalut the Moon Shadow',
        });
      }

      // Icarus Attack (53567095): 2-for-1 board destruction
      else if (code === 53567095) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4100,
          reason: `[ICARUS ATTACK] Tribute Winged Beast to destroy 2 enemy cards!`,
          cardCode: code,
          cardName: 'Icarus Attack',
        });
      }

      // Delta Crow - Anti Reverse (59839761): Wipe all opponent face-down backrow
      else if (code === 59839761) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4600,
          reason: `[DELTA CROW WIPE] Annihilate all opponent face-down Spells & Traps!`,
          cardCode: code,
          cardName: 'Delta Crow - Anti Reverse',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
