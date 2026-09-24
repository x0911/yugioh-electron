import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import { evaluateSynchroOpportunities } from '../../evaluators/synchroSolver.js';

export class ResonatorExecutor extends DefaultExecutor {
  public override readonly id = 'resonator-archfiend';
  public override readonly name = 'Red Dragon Archfiend & Resonator Executor';
  public override readonly description = 'Jack Atlas absolute power: Vice Dragon free Level 5 tribute/tuner fodder, Dark Resonator protection, Red Dragon Archfiend defense wipes, and Fiendish Chain lockdowns.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('resonator') || arch.includes('red dragon');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(70902743) || // Red Dragon Archfiend
      cards.includes(54343893) || // Vice Dragon
      cards.includes(97021916) || // Dark Resonator
      cards.includes(13708425);   // Flare Resonator
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const oppMonsters = oppField.monsterZones.filter(Boolean);
    const aiMonsters = aiField.monsterZones.filter(Boolean);

    // Synchro solver check for Red Dragon Archfiend (Level 8)
    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Vice Dragon (54343893): Special summon from hand if opponent has monster and AI has none
      if (code === 54343893) {
        if (oppMonsters.length > 0 && aiMonsters.length === 0) {
          c.score += 4200;
          c.reason = `[VICE DRAGON] Special Summon Vice Dragon (Level 5 non-Tuner) for instant Level 8 Synchro tuning!`;
        }
      }

      // 2. Dark Resonator (97021916): Level 3 Tuner with battle immunity
      else if (code === 97021916) {
        const hasLevel5 = (aiField.monsterZones || []).some((m) => m && m.level === 5);
        if (hasLevel5) {
          c.score += 4500;
          c.reason = `[RESONATOR TUNING] Normal Summon Dark Resonator to tune 5 + 3 into Red Dragon Archfiend!`;
        } else {
          c.score += 2600;
          c.reason = `Normal Summon Dark Resonator (shielded from battle destruction)`;
        }
      }

      // 3. Flare Resonator (13708425): Level 3 Tuner that grants +300 ATK
      else if (code === 13708425) {
        const hasLevel5 = (aiField.monsterZones || []).some((m) => m && m.level === 5);
        if (hasLevel5) {
          c.score += 4400;
          c.reason = `[FLARE TUNING] Tune Flare Resonator into 3300 ATK Red Dragon Archfiend!`;
        }
      }

      // 4. Red Dragon Archfiend (70902743) Extra Deck Synchro Summon
      if (topSynchro && (code === 70902743 || code === topSynchro.synchroCode)) {
        c.score += topSynchro.scoreBonus + 1000;
        c.reason = `[ARCHFIEND DOMINANCE] Synchro Summon the tyrant king Red Dragon Archfiend (3000 ATK)!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Fiendish Chain (50078509): Lock down opponent monster attack and effects
      if (code === 50078509) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4300,
          reason: `[FIENDISH CHAIN] Bind opponent monster with chains to negate effects and prevent attacks!`,
          cardCode: code,
          cardName: 'Fiendish Chain',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
