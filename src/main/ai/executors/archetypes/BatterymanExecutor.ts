import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class BatterymanExecutor extends DefaultExecutor {
  public override readonly id = 'batteryman-short-circuit';
  public override readonly name = 'Batteryman Short Circuit OTK Executor';
  public override readonly description = 'Thunder OTK mechanics: Batteryman AA swarm ATK multiplication, Battery Charger revivals, and Short Circuit total board wipe.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('batteryman');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(63142001) || // Batteryman AA
      cards.includes(75967082);   // Short Circuit
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField } = getAiAndOpponentFields(context);

    const batterymenOnField = (aiField.monsterZones || []).filter((m) => {
      if (!m) return false;
      const name = context.cardReader?.getCardName(m.code) || '';
      return name.toLowerCase().includes('batteryman');
    });

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Short Circuit (75967082): Wipe opponent field if 3+ Batterymen on field!
      if (code === 75967082 && batterymenOnField.length >= 3) {
        c.score += 7500;
        c.reason = `[SHORT CIRCUIT] Destroy all cards on opponent's field with 3 Batterymen!`;
      }

      // 2. Batteryman AA (63142001) Summon:
      else if (code === 63142001) {
        c.score += 3800;
        c.reason = `[BATTERYMAN AA] Normal summon Batteryman AA to multiply ATK across copies!`;
      }
    }

    return baseCandidates;
  }
}
