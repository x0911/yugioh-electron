import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';

export class CyberDragonExecutor extends DefaultExecutor {
  public override readonly id = 'cyber-dragon';
  public override readonly name = 'Cyber Dragon OTK Executor';
  public override readonly description = 'High-velocity Power Bond fusion lines and lethal machine beatdown.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('cyber') || arch.includes('machine');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(70095154) || // Cyber Dragon
      cards.includes(23893227) || // Cyber Dragon Core
      cards.includes(37630732);    // Power Bond
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Cyber Dragon Core (Searches Cyber Emergency or Power Bond)
      if (code === 23893227) {
        c.score += 2600;
        c.reason = `[CYBER CORE] Normal Summon Cyber Dragon Core to search Cyber spell/trap`;
      }
      // 2. Power Bond (Summon Cyber Twin Dragon 5600 ATK x 2 attacks)
      else if (code === 37630732) {
        c.score += 3500;
        c.reason = `[POWER BOND OTK] Fuse machines with doubled ATK for lethal burst!`;
      }
      // 3. Overload Fusion / Cyberload Fusion
      else if (code === 3659803 || code === 70095154) {
        c.score += 2800;
        c.reason = `[CYBER FUSION] Special Summon Chimeratech / Cyber Dragon fusion boss`;
      }
      // 4. Cyber Emergency / Cyber Repair Plant
      else if (code === 60312991 || code === 77603950) {
        c.score += 2200;
        c.reason = `[CYBER SEARCH] Search Cyber Dragon monster from deck`;
      }
    }

    return baseCandidates;
  }
}
