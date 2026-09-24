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

export class SixSamuraiExecutor extends DefaultExecutor {
  public override readonly id = 'six-samurai-bushido';
  public override readonly name = 'Six Samurai Bushido Swarm Executor';
  public override readonly description = 'Six Samurai Bushido engine: Six Samurai United pre-summon counter accumulation, Grandmaster & Kizan free swarms, Zanji combat destruction, and Shi En omni-negation.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('six samurai') || arch.includes('shien') || arch.includes('bushido');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(83039729) || // Grandmaster
      cards.includes(72345736) || // Six Samurai United
      cards.includes(95519486) || // Zanji
      cards.includes(49721904) || // Kizan
      cards.includes(29981921);   // Shi En
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const sixSamOnField = (aiField.monsterZones || []).filter((m) => {
      if (!m) return false;
      const name = context.cardReader?.getCardName(m.code) || '';
      return name.toLowerCase().includes('six samurai') || name.toLowerCase().includes('shien');
    });

    // Check Synchro opportunities (e.g. Shi En 29981921)
    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Six Samurai United (72345736) & Gateway of the Six (27970830): Activate BEFORE summons!
      if (code === 72345736 || code === 27970830) {
        c.score += 6000;
        c.reason = `[BUSHIDO PRIORITY] Activate United / Gateway before summoning to collect Bushido counters!`;
      }

      // 2. Six Samurai United Draw 2 trigger (when on field with 2 counters)
      else if (code === 72345736 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4900;
        c.reason = `[SIX SAM UNITED DRAW] Send United with 2 counters to Graveyard to draw 2 cards!`;
      }

      // 3. Special Summon from hand: Grandmaster (83039729) / Kizan (49721904) when Six Sam on field
      else if ((code === 83039729 || code === 49721904) && sixSamOnField.length > 0) {
        c.score += 4200;
        c.reason = `[SIX SAM SWARM] Special Summon Grandmaster / Kizan while controlling a Six Samurai!`;
      }

      // 4. Normal Summon Priority:
      // Kageki (2511717) > Zanji (95519486) > Irou (27782503) > Yaichi (64398890)
      else if (code === 2511717) {
        c.score += 3800;
        c.reason = `[KAGEKI SUMMON] Normal summon Kageki to chain Special Summon from hand!`;
      }
      else if (code === 95519486) {
        c.score += 3400;
        c.reason = `[ZANJI SUMMON] Normal summon Zanji (1800 ATK combat executioner)!`;
      }
      else if (code === 27782503) {
        c.score += 3000;
        c.reason = `[IROU SUMMON] Normal summon Irou (1700 ATK face-down destroyer)!`;
      }

      // 5. Synchro Boss Priority (Shi En 29981921)
      if (topSynchro && code === topSynchro.synchroCode) {
        c.score += topSynchro.scoreBonus + 1000;
        c.reason = `[SHI EN SYNCHRO] Synchro Summon Legendary Six Samurai - Shi En for Spell/Trap omni-lock!`;
      }
    }

    return baseCandidates;
  }
}
