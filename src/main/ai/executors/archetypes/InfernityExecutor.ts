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

export class InfernityExecutor extends DefaultExecutor {
  public override readonly id = 'infernity-handless';
  public override readonly name = 'Infernity Handless Combo Executor';
  public override readonly description = 'Kalin Kessler Dark Signer handless loop: aggressive backrow emptying, Launcher double revivals, Archfiend searches, and Barrier omni-negate lock.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('infernity');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(99177923) || // Infernity Archfiend
      cards.includes(66957584) || // Infernity Launcher
      cards.includes(9059700) ||  // Infernity Barrier
      cards.includes(51717541) || // Infernity Break
      cards.includes(72896720);   // Infernity Doom Dragon
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const handCount = (aiField.hand || []).length;
    const isHandless = handCount === 0;

    // Synchro solver check
    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Handless enabler: Prioritize SETTING Spells and Traps to achieve 0 cards in hand
      if (c.action.type === OcgResponseType.SELECT_IDLECMD && ((c.action as any).action === SelectIdleCMDAction.SELECT_SPELL_SET || (c.action as any).action === SelectIdleCMDAction.SELECT_MONSTER_SET)) {
        c.score += 2500;
        c.reason = `[INFERNITY HANDLESS DUMP] Set card to accelerate towards 0 cards in hand!`;
      }

      // 2. Infernity Launcher (66957584):
      // If in hand: activate face-up
      // If on field and handless: send to GY to revive 2 Infernities!
      else if (code === 66957584) {
        if (isHandless || handCount <= 1) {
          c.score += 4800;
          c.reason = `[LAUNCHER RECURSION] Send Infernity Launcher to GY to resurrect 2 Infernity monsters from the dead!`;
        } else {
          c.score += 3200;
          c.reason = `Activate Infernity Launcher`;
        }
      }

      // 3. Infernity Archfiend (99177923): Summon when handless or normal summon beatstick
      else if (code === 99177923) {
        c.score += isHandless ? 4500 : 2600;
        c.reason = `[INFERNITY ARCHFIEND] Summon Archfiend to trigger deck search!`;
      }

      // 4. Infernity Doom Dragon (72896720) burn destruction effect
      else if (code === 72896720 && isHandless) {
        c.score += 4200;
        c.reason = `[DOOM DRAGON EFFECT] Annihilate opponent monster and burn their Life Points!`;
      }

      // 5. Extra Deck Synchro Summon (Doom Dragon 72896720 / Hundred Eyes 95453143)
      if (topSynchro && code === topSynchro.synchroCode) {
        c.score += topSynchro.scoreBonus + 600;
        c.reason = `[DARK SYNCHRO] Tune into ${topSynchro.synchroName} under handless state!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Infernity Archfiend (99177923) Search:
    // Priority: Infernity Barrier (9059700) > Infernity Launcher (66957584) > Infernity Break (51717541)
    if (activeChainCards?.includes(99177923)) {
      const barrierIdx = rawSelects.findIndex((s) => s.code === 9059700);
      if (barrierIdx >= 0) return [barrierIdx];

      const launcherIdx = rawSelects.findIndex((s) => s.code === 66957584);
      if (launcherIdx >= 0) return [launcherIdx];

      const breakIdx = rawSelects.findIndex((s) => s.code === 51717541);
      if (breakIdx >= 0) return [breakIdx];
    }

    return null;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Infernity Barrier (9059700): Omni-negate any Spell, Trap, or Monster effect
      if (code === 9059700) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 6000,
          reason: `[INFERNITY BARRIER] Omni-negate and destroy opponent activation under handless state!`,
          cardCode: code,
          cardName: 'Infernity Barrier',
        });
      }

      // Infernity Break (51717541): Spot destruction
      else if (code === 51717541) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4200,
          reason: `[INFERNITY BREAK] Banish Infernity from GY to destroy opponent card!`,
          cardCode: code,
          cardName: 'Infernity Break',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
