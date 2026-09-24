import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class OldSchoolWarriorExecutor extends DefaultExecutor {
  public override readonly id = 'old-school-warrior-toolbox';
  public override readonly name = 'Old-School Warrior & Tribute Toolbox Executor';
  public override readonly description = 'Classic Yu-Gi-Oh! fundamentals: Jinzo trap lockdown tribute priority, Gadget hand resource chain, Marauding Captain swarming, and D.D. Warrior Lady banish removal.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      (arch.includes('warrior') && !arch.includes('six samurai') && !arch.includes('hero')) ||
      arch.includes('jinzo') ||
      arch.includes('gadget') ||
      arch.includes('magnet') ||
      arch.includes('gamble') ||
      arch.includes('rock') ||
      arch.includes('earth') ||
      arch.includes('fossil') ||
      arch.includes('labyrinth') ||
      arch.includes('gate') ||
      arch.includes('mask') ||
      arch.includes('exodia');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(77585513) || // Jinzo
      cards.includes(7572887) ||  // D.D. Warrior Lady
      cards.includes(70074904) || // D.D. Assailant
      cards.includes(41172955) || // Green Gadget
      cards.includes(47606319) || // Gigantes
      cards.includes(75347539);   // Valkyrion
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const monstersOnField = (aiField.monsterZones || []).filter(Boolean);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Jinzo (77585513) Tribute Summon Priority: Shuts down all Traps!
      if (code === 77585513 && monstersOnField.length >= 1) {
        c.score += 5500;
        c.reason = `[JINZO TRIBUTE] Tribute summon Jinzo (2400 ATK) to completely disable all Trap cards!`;
      }

      // 2. Marauding Captain (2460565): Swarm from hand
      else if (code === 2460565) {
        c.score += 4200;
        c.reason = `[MARAUDING CAPTAIN] Normal summon Captain to chain Special Summon from hand!`;
      }

      // 3. Gadgets (Green 41172955, Red 86445415, Yellow 13839120): Endless card advantage!
      else if (code === 41172955 || code === 86445415 || code === 13839120) {
        c.score += 3800;
        c.reason = `[GADGET SUMMON] Normal summon Gadget to search next Gadget and maintain card advantage!`;
      }

      // 4. D.D. Warrior Lady (7572887) / D.D. Assailant (70074904): Removal tech
      else if (code === 7572887 || code === 70074904) {
        c.score += 3400;
        c.reason = `[D.D. WARRIOR SUMMON] Normal summon D.D. Warrior to threaten banishment!`;
      }
    }

    return baseCandidates;
  }
}
