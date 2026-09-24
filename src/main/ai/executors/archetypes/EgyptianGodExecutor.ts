import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class EgyptianGodExecutor extends DefaultExecutor {
  public override readonly id = 'egyptian-god-divinity';
  public override readonly name = 'Egyptian God Divine Descent Executor (Obelisk, Ra, Slifer)';
  public override readonly description = 'Pharaonic divine mechanics: Ra\'s Disciple instant 3-tribute swarm, Mound of the Bound Creator protection, Obelisk Megaton Crush, and divine descent.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('egyptian god') ||
      arch.includes('obelisk') ||
      arch.includes('winged dragon of ra') ||
      arch.includes('slifer') ||
      arch.includes('divinity');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(10000000) || // Obelisk
      cards.includes(10000010) || // Ra
      cards.includes(10000020) || // Slifer
      cards.includes(74875003) || // Ra's Disciple
      cards.includes(269012);     // Mound of the Bound Creator
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const monstersOnField = (aiField.monsterZones || []).filter(Boolean);
    const hasMound = aiField.fieldZone?.code === 269012;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Mound of the Bound Creator (269012): Activate before God summons
      if (code === 269012 && !hasMound) {
        c.score += 5500;
        c.reason = `[MOUND OF BOUND CREATOR] Protect Divine Beasts from targeting and card destruction!`;
      }

      // 2. Ra's Disciple (74875003): Instant 3-tribute swarm on Normal Summon!
      else if (code === 74875003) {
        c.score += 4800;
        c.reason = `[RA'S DISCIPLE] Normal summon to flood field with 3 tributes for Egyptian God!`;
      }

      // 3. Obelisk the Tormentor (10000000) 3-Tribute Summon
      else if (code === 10000000 && monstersOnField.length >= 3) {
        c.score += 6500;
        c.reason = `[OBELISK THE TORMENTOR] Tribute 3 monsters to summon 4000 ATK God of Destruction!`;
      }

      // 4. Slifer the Sky Dragon (10000020) 3-Tribute Summon
      else if (code === 10000020 && monstersOnField.length >= 3) {
        c.score += 6200;
        c.reason = `[SLIFER THE SKY DRAGON] Tribute 3 monsters to summon the Heavenly Dragon!`;
      }

      // 5. The Winged Dragon of Ra (10000010) 3-Tribute Summon
      else if (code === 10000010 && monstersOnField.length >= 3) {
        c.score += 6000;
        c.reason = `[THE WINGED DRAGON OF RA] Tribute 3 monsters to summon the Sun God!`;
      }

      // 6. Obelisk Ignition: Tribute 2 monsters to wipe opponent's monsters!
      else if (code === 10000000 && c.action.type === OcgResponseType.SELECT_IDLECMD && monstersOnField.length >= 3) {
        c.score += 7000;
        c.reason = `[MEGATON CRUSH] Tribute 2 monsters to destroy ALL monsters opponent controls!`;
      }
    }

    return baseCandidates;
  }
}
