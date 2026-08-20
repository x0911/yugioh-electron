import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';

export class AntiMetaStunExecutor extends DefaultExecutor {
  public override readonly id = 'anti-meta-stun';
  public override readonly name = 'Anti-Meta Stun & Control Executor';
  public override readonly description = 'Floodgate lockdowns, special summon denial, and Solemn counter traps.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('stun') ||
      arch.includes('anti-meta') ||
      arch.includes('control');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(98954124) || // Fossil Dyna
      cards.includes(19847532) || // Thunder King Rai-Oh
      cards.includes(30241314);    // Macro Cosmos
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Normal Summon Floodgate monsters (Fossil Dyna, Rai-Oh, Banisher)
      if (code === 98954124 || code === 19847532 || code === 94145021 || code === 15341821) {
        c.score += 2800;
        c.reason = `[FLOODGATE SUMMON] Normal Summon ${c.cardName} to lock opponent special summons/searches`;
      }
      // 2. Set Counter Traps & Continuous Floodgates
      else if (code === 41420027 || code === 84749824 || code === 40605147 || code === 30241314) {
        c.score += 2500;
        c.reason = `[STUN BACKROW] Set counter trap / floodgate ${c.cardName}`;
      }
    }

    return baseCandidates;
  }
}
