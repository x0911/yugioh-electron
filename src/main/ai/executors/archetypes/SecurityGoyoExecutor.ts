import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { evaluateSynchroOpportunities } from '../../evaluators/synchroSolver.js';

export class SecurityGoyoExecutor extends DefaultExecutor {
  public override readonly id = 'security-police-goyo';
  public override readonly name = 'Security Police & Goyo Beatdown Executor';
  public override readonly description = 'Sector Security arrest protocol: Jutte Fighter tuning, Goyo Guardian 2800 ATK synchro summon, and stolen monster reanimation.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('security') || arch.includes('goyo');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(7391448) || // Goyo Guardian
      (cards.length > 0 && arch.includes('police'));
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // Goyo Guardian (7391448) priority
      if (topSynchro && code === topSynchro.synchroCode) {
        c.score += topSynchro.scoreBonus + 1000;
        c.reason = `[GOYO GUARDIAN SYNCHRO] Synchro Summon Goyo Guardian (2800 ATK) to arrest and recruit opponent monsters!`;
      }
    }

    return baseCandidates;
  }
}
