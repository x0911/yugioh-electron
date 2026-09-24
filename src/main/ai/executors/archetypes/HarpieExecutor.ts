import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class HarpieExecutor extends DefaultExecutor {
  public override readonly id = 'harpie-winged-beast';
  public override readonly name = 'Harpie Lady Winged Beast Swarm Executor';
  public override readonly description = 'Harpie aerial tactics: Harpies\' Hunting Ground field spell backrow disruption, Queen searches, Elegant Egotist duplication, and Hysteric Party mass revival.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('harpie') || arch.includes('winged beast') || arch.includes('nephthys');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(75782277) || // Harpies' Hunting Ground
      cards.includes(90219263) || // Elegant Egotist
      cards.includes(75064463) || // Harpie Queen
      cards.includes(91932350) || // Harpie Lady 1
      cards.includes(80316585) || // Cyber Harpie Lady
      cards.includes(61441708);   // Sacred Phoenix of Nephthys
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const hasHuntingGround = aiField.fieldZone?.code === 75782277;
    const hasHarpieOnField = (aiField.monsterZones || []).some((m) => {
      if (!m) return false;
      const name = context.cardReader?.getCardName(m.code) || '';
      return name.toLowerCase().includes('harpie');
    });

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Harpie Queen (75064463) discard to search Hunting Ground if field not present
      if (code === 75064463 && !hasHuntingGround && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4800;
        c.reason = `[HARPIE QUEEN SEARCH] Discard Queen to add Harpies' Hunting Ground to hand!`;
      }

      // 2. Harpies' Hunting Ground (75782277) activation: Before ANY monster summon!
      else if (code === 75782277) {
        c.score += 6500;
        c.reason = `[HUNTING GROUND PRIORITY] Activate Hunting Ground before summoning to trigger backrow pop!`;
      }

      // 3. Elegant Egotist (90219263): Swarm if Harpie is face-up
      else if (code === 90219263 && hasHarpieOnField) {
        c.score += 4200;
        c.reason = `[ELEGANT EGOTIST] Special summon Harpie Lady from deck!`;
      }

      // 4. Normal Summon Priority:
      // Harpie Lady 1 (91932350) > Cyber Harpie Lady (80316585) > Harpie Queen (75064463)
      else if (code === 91932350) {
        c.score += 3500;
        c.reason = `[HARPIE LADY 1] Normal summon team-buffing Harpie Lady 1 (+300 ATK to all WIND)!`;
      }
      else if (code === 80316585) {
        c.score += 3200;
        c.reason = `[CYBER HARPIE] Normal summon 1800 ATK Cyber Harpie Lady!`;
      }
      else if (code === 75064463 && hasHuntingGround) {
        c.score += 2900;
        c.reason = `[HARPIE QUEEN] Normal summon 1900 ATK Harpie Queen!`;
      }
    }

    return baseCandidates;
  }
}
