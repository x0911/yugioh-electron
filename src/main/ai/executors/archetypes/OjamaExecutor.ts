import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class OjamaExecutor extends DefaultExecutor {
  public override readonly id = 'ojama-lockdown';
  public override readonly name = 'Ojama Zone Lockdown & Delta Hurricane Executor';
  public override readonly description = 'Ojama disruption tactics: Ojama Trio / King monster zone blocking, Ojama Country ATK/DEF reversal, Ojama Red swarming, and Ojama Delta Hurricane board wipe.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('ojama');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(8251996) ||  // Ojama Delta Hurricane
      cards.includes(90140980) || // Ojama King
      cards.includes(40391316) || // Ojama Knight
      cards.includes(90011152) || // Ojama Country
      cards.includes(29843091);   // Ojama Trio
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const onFieldCodes = new Set((aiField.monsterZones || []).filter(Boolean).map((m) => m.code));
    const hasGreen = onFieldCodes.has(12482652);
    const hasYellow = onFieldCodes.has(42941100);
    const hasBlack = onFieldCodes.has(79335209);
    const hasTrioOnField = hasGreen && hasYellow && hasBlack;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Ojama Delta Hurricane!! (8251996): Wipe entire opponent field!
      if (code === 8251996 && hasTrioOnField) {
        c.score += 7500;
        c.reason = `[DELTA HURRICANE] Wipe all cards on opponent's side of the field!`;
      }

      // 2. Ojama Country (90011152): Field spell activation
      else if (code === 90011152 && aiField.fieldZone?.code !== 90011152) {
        c.score += 4500;
        c.reason = `[OJAMA COUNTRY] Activate field spell to reverse ATK/DEF and empower Ojama bosses!`;
      }

      // 3. Normal Summon Priority:
      // Ojama Red (37132349, swarms from hand) > Ojama Blue (64627453, search recruiter)
      else if (code === 37132349) {
        c.score += 3800;
        c.reason = `[OJAMA RED SUMMON] Normal summon Ojama Red to flood field with Ojama monsters!`;
      }
      else if (code === 64627453) {
        c.score += 3200;
        c.reason = `[OJAMA BLUE SUMMON] Normal summon Ojama Blue for double search on battle destruction!`;
      }

      // 4. Fusion Boss Summons: Ojama King (90140980) / Ojama Knight (40391316)
      else if (code === 90140980 || code === 40391316) {
        c.score += 4800;
        c.reason = `[OJAMA LOCKDOWN BOSS] Summon Ojama King/Knight to shut down opponent monster zones!`;
      }
    }

    return baseCandidates;
  }
}
