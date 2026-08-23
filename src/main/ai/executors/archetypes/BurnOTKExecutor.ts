import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class BurnOTKExecutor extends DefaultExecutor {
  public override readonly id = 'burn-otk';
  public override readonly name = 'Direct Burn & Chain Strike Executor';
  public override readonly description = 'Lethal direct damage math, reverse-chain burn timings, and Wave-Motion Cannon accumulation.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('burn') ||
      arch.includes('stall') ||
      arch.includes('chain strike');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(38992735) || // Wave-Motion Cannon
      cards.includes(24068492) || // Just Desserts
      cards.includes(32274490);    // Secret Barrel
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { oppField } = getAiAndOpponentFields(context);
    const oppLp = oppField.currentLp;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Wave-Motion Cannon (Early activation to build standby counters)
      if (code === 38992735) {
        c.score += 3200;
        c.reason = `[WAVE-MOTION CANNON] Activate early to build standby counters for massive 8000 LP blast`;
      }
      // 2. Direct burn spells when in lethal range
      else if (code === 46918794 || code === 19523799 || code === 46130346) {
        if (oppLp <= 1000) {
          c.score += 15000;
          c.reason = `[LETHAL BURN] Activate ${c.cardName} to reduce opponent LP to 0!`;
        } else {
          c.score += 1200;
        }
      }
    }

    return baseCandidates;
  }
}
