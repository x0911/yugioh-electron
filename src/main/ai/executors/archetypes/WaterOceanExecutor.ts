import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class WaterOceanExecutor extends DefaultExecutor {
  public override readonly id = 'water-ocean-daedalus';
  public override readonly name = 'WATER Ocean & Daedalus Tsunami Executor';
  public override readonly description = 'Mako Tsunami ocean tactics: A Legendary Ocean level-drop summons, Warrior of Atlantis searching, Levia-Dragon Daedalus field wipes, and Bugroth direct attacks.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('water') ||
      arch.includes('ocean') ||
      arch.includes('daedalus') ||
      arch.includes('umi') ||
      arch.includes('sea serpent');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(295517) ||   // A Legendary Ocean
      cards.includes(37721209) || // Levia-Dragon - Daedalus
      cards.includes(43797906) || // Warrior of Atlantis
      cards.includes(64342551) || // Amphibious Bugroth MK-3
      cards.includes(3643300);    // The Legendary Fisherman
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const hasOcean =
      aiField.fieldZone?.code === 295517 || aiField.fieldZone?.code === 22702055;

    const oppCardCount =
      (oppField.monsterZones || []).filter(Boolean).length +
      (oppField.spellTrapZones || []).filter(Boolean).length;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Warrior of Atlantis (43797906) search Ocean if not already active
      if (code === 43797906 && !hasOcean && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4800;
        c.reason = `[WARRIOR OF ATLANTIS SEARCH] Discard to add A Legendary Ocean from deck to hand!`;
      }

      // 2. A Legendary Ocean (295517) activate before summoning
      else if (code === 295517 && !hasOcean) {
        c.score += 5500;
        c.reason = `[LEGENDARY OCEAN] Activate field spell to lower WATER monster levels and boost ATK/DEF!`;
      }

      // 3. Levia-Dragon - Daedalus (37721209) Ignition Effect: Send Umi to GY to wipe all other cards!
      else if (code === 37721209 && c.action.type === OcgResponseType.SELECT_IDLECMD && hasOcean && oppCardCount >= 2) {
        c.score += 7000;
        c.reason = `[DAEDALUS TSUNAMI NUKE] Send Ocean to Graveyard to destroy all other cards on field!`;
      }

      // 4. Normal Summon Priority:
      // Levia-Dragon (37721209) under Ocean (requires only 1 tribute!) > Bugroth (64342551) > Warrior of Atlantis (43797906, 1900 ATK)
      else if (code === 37721209 && hasOcean) {
        c.score += 4200;
        c.reason = `[DAEDALUS TRIBUTE SUMMON] 1-Tribute summon 2600 ATK ocean apex predator!`;
      }
      else if (code === 64342551) {
        c.score += 3500;
        c.reason = `[BUGROTH SUMMON] Normal summon Amphibious Bugroth MK-3 for direct attacks!`;
      }
      else if (code === 43797906 && hasOcean) {
        c.score += 3200;
        c.reason = `[WARRIOR OF ATLANTIS SUMMON] Normal summon 2100 ATK ocean warrior!`;
      }
    }

    return baseCandidates;
  }
}
