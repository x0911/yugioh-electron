import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { evaluateSynchroOpportunities } from '../../evaluators/synchroSolver.js';

export class NordicGodsExecutor extends DefaultExecutor {
  public override readonly id = 'nordic-aesir-synchro';
  public override readonly name = 'Nordic Gods & Aesir Synchro Executor';
  public override readonly description = 'Team Ragnarok divine power: Nordic beast/alfr swarming, and Thor, Loki, and Odin Level 10 Synchro descent.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('nordic') || arch.includes('aesir');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(30604579) || // Thor
      cards.includes(67098114) || // Loki
      cards.includes(93483212);   // Odin
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // Aesir Synchro Boss priority (Thor 30604579, Loki 67098114, Odin 93483212)
      if (topSynchro && code === topSynchro.synchroCode) {
        c.score += topSynchro.scoreBonus + 1200;
        c.reason = `[AESIR GOD SYNCHRO] Synchro Summon ${topSynchro.synchroName} to unleash divine wrath!`;
      }
    }

    return baseCandidates;
  }
}
