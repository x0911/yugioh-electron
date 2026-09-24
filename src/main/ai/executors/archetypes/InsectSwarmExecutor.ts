import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class InsectSwarmExecutor extends DefaultExecutor {
  public override readonly id = 'insect-swarm-evolution';
  public override readonly name = 'Insect Swarm & Evolution Executor';
  public override readonly description = 'Weevil Underwood insect swarming: Pinch Hopper hand dropping, Verdant Sanctuary search recursion, and Insect Queen devouring.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('insect') || arch.includes('moth');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(91512835) || // Insect Queen
      cards.includes(26185991) || // Pinch Hopper
      cards.includes(80402389);   // Verdant Sanctuary
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField } = getAiAndOpponentFields(context);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Verdant Sanctuary (80402389): Continuous Spell search engine
      if (code === 80402389) {
        c.score += 4800;
        c.reason = `[VERDANT SANCTUARY] Activate to search an Insect whenever one is destroyed!`;
      }

      // 2. Pinch Hopper (26185991): Normal summon to bait battle/effect destruction and drop boss
      else if (code === 26185991) {
        c.score += 3800;
        c.reason = `[PINCH HOPPER SUMMON] Normal summon Pinch Hopper to trigger high-level Insect summon on GY drop!`;
      }

      // 3. Insect Queen (91512835)
      else if (code === 91512835) {
        c.score += 3500;
        c.reason = `[INSECT QUEEN SUMMON] Tribute summon Insect Queen for token generation and swarming!`;
      }
    }

    return baseCandidates;
  }
}
