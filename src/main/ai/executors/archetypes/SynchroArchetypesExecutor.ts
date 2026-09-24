import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import { evaluateSynchroOpportunities } from '../../evaluators/synchroSolver.js';

export class SynchroArchetypesExecutor extends DefaultExecutor {
  public override readonly id = 'synchro-archetypes-5ds';
  public override readonly name = '5D\'s Synchro Masteries Executor (Plant, Morphtronic, Psychic, T.G.)';
  public override readonly description = '5D\'s anime synchro engines: Lonefire Blossom Plant tributes, Black Rose Dragon board nukes, Emergency Teleport Psychic tuning, Morphtronic Celfon excavations, and T.G. Accel swarming.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('plant') ||
      arch.includes('black rose') ||
      arch.includes('morphtronic') ||
      arch.includes('psychic') ||
      arch.includes('tech genus') ||
      arch.includes('t.g.');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(73580471) || // Black Rose Dragon
      cards.includes(48686504) || // Lonefire Blossom
      cards.includes(2403771) ||  // Power Tool Dragon
      cards.includes(93542102) || // Morphtronic Celfon
      cards.includes(67723438) || // Emergency Teleport
      cards.includes(59575539) || // Krebons
      cards.includes(1315120);    // T.G. Striker
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // Run Synchro solver
    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    const oppCardCount =
      (oppField.monsterZones || []).filter(Boolean).length +
      (oppField.spellTrapZones || []).filter(Boolean).length;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Emergency Teleport (67723438): Summon Krebons from deck for instant Synchro setup
      if (code === 67723438) {
        c.score += 5500;
        c.reason = `[EMERGENCY TELEPORT] Special Summon Psychic Tuner directly from deck!`;
      }

      // 2. Lonefire Blossom (48686504) Ignition: Tribute to summon Tytannial or Gigaplant from deck
      else if (code === 48686504 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 5200;
        c.reason = `[LONEFIRE BLOSSOM] Tribute Plant to Special Summon boss Plant from deck!`;
      }

      // 3. Morphtronic Celfon (93542102) Ignition: Roll die to excavate and summon
      else if (code === 93542102 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4800;
        c.reason = `[M氣PHTRONIC CELFON] Roll die to excavate and Special Summon Morphtronic!`;
      }

      // 4. Power Tool Dragon (2403771) Ignition: Search Equip Spell
      else if (code === 2403771 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4600;
        c.reason = `[POWER TOOL SEARCH] Search Equip Spell from deck!`;
      }

      // 5. Normal Summon Priorities:
      // Lonefire Blossom (48686504) > Celfon (93542102) > Krebons (59575539)
      else if (code === 48686504) {
        c.score += 4000;
        c.reason = `[LONEFIRE SUMMON] Normal summon Lonefire Blossom to ignite Plant toolbox!`;
      }
      else if (code === 93542102) {
        c.score += 3600;
        c.reason = `[CELFON SUMMON] Normal summon Celfon for free excavation swarm!`;
      }

      // 6. Synchro Boss Priority (Black Rose 73580471 nuke if opponent has cards, Power Tool 2403771, Thought Ruler 70780151)
      if (topSynchro && code === topSynchro.synchroCode) {
        if (code === 73580471 && oppCardCount >= 2) {
          c.score += topSynchro.scoreBonus + 1200;
          c.reason = `[BLACK ROSE NUKE] Synchro Summon Black Rose Dragon to wipe all cards on the field!`;
        } else {
          c.score += topSynchro.scoreBonus + 800;
          c.reason = `[SYNCHRO BOSS] Tune into ${topSynchro.synchroName}!`;
        }
      }
    }

    return baseCandidates;
  }
}
