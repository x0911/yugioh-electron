import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';

export class HeroFusionExecutor extends DefaultExecutor {
  public override readonly id = 'hero-fusion';
  public override readonly name = 'Elemental HERO Fusion Executor';
  public override readonly description = 'Search combos with Stratos/Shadow Mist and aggressive Miracle Fusion lines.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('hero') || arch.includes('neos');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(40044918) || // Stratos
      cards.includes(45906428) || // Miracle Fusion
      cards.includes(21844576);    // Avian
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Stratos (Search HERO or wipe backrow)
      if (code === 40044918) {
        c.score += 2700;
        c.reason = `[HERO SEARCH] Normal Summon Stratos to search combo HERO or pop backrow`;
      }
      // 2. Miracle Fusion (Graveyard Fusion boss summon)
      else if (code === 45906428) {
        c.score += 3000;
        c.reason = `[MIRACLE FUSION] Fuse materials from Graveyard into HERO Boss!`;
      }
      // 3. E - Emergency Call / A Hero Lives
      else if (code === 75043725 || code === 18063928) {
        c.score += 2400;
        c.reason = `[HERO EXTENDER] Search / Special Summon Elemental HERO from deck`;
      }
    }

    return baseCandidates;
  }
}
