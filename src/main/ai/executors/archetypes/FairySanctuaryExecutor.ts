import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class FairySanctuaryExecutor extends DefaultExecutor {
  public override readonly id = 'fairy-sanctuary';
  public override readonly name = 'Fairy Sanctuary & Counter Trap Executor';
  public override readonly description = 'Angelic friendship & sanctuary: The Sanctuary in the Sky battle damage negation, Shining Angel floating, and Counter Trap negations.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('fairy') || arch.includes('sanctuary');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(56433456) || // The Sanctuary in the Sky
      (cards.length > 0 && arch.includes('fairy'));
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField } = getAiAndOpponentFields(context);

    const hasSanctuary = aiField.fieldZone?.code === 56433456;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // Sanctuary in the Sky (56433456)
      if (code === 56433456 && !hasSanctuary) {
        c.score += 5200;
        c.reason = `[SANCTUARY IN THE SKY] Activate field spell to nullify all battle damage involving Fairies!`;
      }
    }

    return baseCandidates;
  }
}
