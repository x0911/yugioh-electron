import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class CloudianExecutor extends DefaultExecutor {
  public override readonly id = 'cloudian-fog-counters';
  public override readonly name = 'Cloudian Fog Counter Storm Executor';
  public override readonly description = 'Adrian Gecko cloud tactics: battle destruction immunity, Fog Counter accumulation, and Nimbusman ATK escalation.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('cloudian') || arch.includes('fog counter');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(20003527) || // Cloudian - Nimbusman
      (cards.length > 0 && arch.includes('cloudian'));
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // Nimbusman (20003527) Tribute Summon
      if (code === 20003527) {
        c.score += 4200;
        c.reason = `[NIMBUSMAN SUMMON] Tribute summon Cloudian - Nimbusman to channel Fog Counter power!`;
      }
    }

    return baseCandidates;
  }
}
