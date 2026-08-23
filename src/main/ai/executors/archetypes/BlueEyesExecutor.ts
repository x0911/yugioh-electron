import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class BlueEyesExecutor extends DefaultExecutor {
  public override readonly id = 'blue-eyes';
  public override readonly name = 'Blue-Eyes Dragon Executor';
  public override readonly description = 'High-level combos and lethal beatdown for Blue-Eyes Dragon decks.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('blue-eyes') || arch.includes('dragon');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(89631139) || // Blue-Eyes White Dragon
      cards.includes(23995346) || // Blue-Eyes Ultimate Dragon
      cards.includes(8240199);    // Sage with Eyes of Blue
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { oppField } = getAiAndOpponentFields(context);
    const oppMonsters = oppField.monsterZones.filter(Boolean);

    // Boost signature Blue-Eyes combos
    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Draw engine (Cards of Consonance with White Stone, Trade-In with Blue-Eyes)
      if (code === 39701395 || code === 38120068) {
        c.score += 2000;
        c.reason = `[BLUE-EYES DRAW ENGINE] Activate ${c.cardName} to cycle dragons and load Graveyard`;
      }
      // 2. Sage with Eyes of Blue (Searches White Stone or Maiden)
      else if (code === 8240199) {
        c.score += 2500;
        c.reason = `[BLUE-EYES COMBO] Normal Summon Sage with Eyes of Blue to search Level 1 LIGHT Tuner`;
      }
      // 3. GY Revivals (Silver's Cry, Return of the Dragon Lords)
      else if (code === 87025074 || code === 6853254) {
        c.score += 2200;
        c.reason = `[BLUE-EYES REVIVE] Special summon Blue-Eyes Dragon from Graveyard`;
      }
      // 4. Burst Stream of Destruction
      else if (code === 17655904) {
        if (oppMonsters.length > 0) {
          c.score += 3000;
          c.reason = `[BURST STREAM] Wipe all opponent monsters with Burst Stream of Destruction!`;
        }
      }
      // 5. Fusion / Dragon's Mirror (Summon Twin Burst / Ultimate Dragon)
      else if (code === 24094653 || code === 1482001) {
        c.score += 2400;
        c.reason = `[DRAGON FUSION] Fusion Summon Blue-Eyes boss monster`;
      }
    }

    return baseCandidates;
  }
}
