import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';

export class DarkMagicianExecutor extends DefaultExecutor {
  public override readonly id = 'dark-magician';
  public override readonly name = 'Dark Magician Executor';
  public override readonly description = 'Spellcaster control, Dark Magical Circle banishes, and Eternal Soul chains.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('dark magician') || arch.includes('spellcaster');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(46986414) || // Dark Magician
      cards.includes(70791372) || // Magician's Rod
      cards.includes(47222536);    // Dark Magical Circle
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Magician's Rod (Searches Circle / Navigation / Soul)
      if (code === 70791372) {
        c.score += 2600;
        c.reason = `[SPELLCASTER SEARCH] Normal Summon Magician's Rod to search Dark Magician spell/trap`;
      }
      // 2. Dark Magical Circle (Rearrange top 3 + banish on summon)
      else if (code === 47222536) {
        c.score += 2800;
        c.reason = `[DARK MAGICAL CIRCLE] Activate Circle to stack deck and prepare banish effect`;
      }
      // 3. Dark Magic Attack (Harpie's Feather Duster for DM)
      else if (code === 15256925) {
        c.score += 2900;
        c.reason = `[DARK MAGIC ATTACK] Wipe opponent backrow with Dark Magician`;
      }
      // 4. Eye of Timaeus (Fusion into Dark Paladin or Dragon Knight)
      else if (code === 10000000) {
        c.score += 2500;
        c.reason = `[TIMAEUS FUSION] Transform Dark Magician into powerful Fusion Knight`;
      }
    }

    return baseCandidates;
  }
}
