import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';
import { evaluateSynchroOpportunities } from '../../evaluators/synchroSolver.js';

export class SynchronExecutor extends DefaultExecutor {
  public override readonly id = 'synchron-stardust';
  public override readonly name = 'Synchron & Stardust Synchro Executor';
  public override readonly description = 'Yusei Fudo combo lines: Junk Synchron GY recursion, Quillbolt looping, Tuning searches, and Stardust Dragon omni-protection.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('synchron') ||
      arch.includes('stardust') ||
      arch.includes('junk');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(63977008) || // Junk Synchron
      cards.includes(44508094) || // Stardust Dragon
      cards.includes(96363153) || // Tuning
      cards.includes(20932152) || // Quickdraw Synchron
      cards.includes(23571046);   // Quillbolt Hedgehog
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // 1. Check for immediate Synchro opportunities
    const synchroOpps = evaluateSynchroOpportunities(context);
    const topSynchro = synchroOpps.length > 0 ? synchroOpps[0] : null;

    // Detect on-field Tuner presence
    const hasTunerOnField = (aiField.monsterZones || []).some((m) => {
      if (!m) return false;
      const data = context.cardReader?.getCardData(m.code);
      return data && (data.type & 0x1000) !== 0;
    });

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // --- SPELLS ---
      // Tuning (96363153): Add 1 "Synchron" Tuner from Deck to Hand
      if (code === 96363153) {
        c.score += 3600;
        c.reason = `[YUSEI TUNING] Search Synchron Tuner from deck to initiate Synchro climb`;
      }

      // --- MONSTER SUMMONS & EFFECTS ---
      // Junk Synchron (63977008): Normal summon to revive Level 2 or lower from GY
      else if (code === 63977008) {
        const hasGraveTarget = (aiField.graveyard || []).some((g) => {
          if (!g) return false;
          const data = context.cardReader?.getCardData(g.code);
          return data && data.level > 0 && data.level <= 2;
        });

        if (hasGraveTarget) {
          c.score += 4200;
          c.reason = `[JUNK RECURSION] Normal Summon Junk Synchron to revive Level 2 monster for immediate Level 5 Synchro!`;
        } else {
          c.score += 1500;
          c.reason = `Normal Summon Junk Synchron as field Tuner`;
        }
      }

      // Quillbolt Hedgehog (23571046): Special summon from GY if Tuner is face-up
      else if (code === 23571046) {
        if (hasTunerOnField) {
          c.score += 3800;
          c.reason = `[QUILLBOLT LOOP] Special Summon Quillbolt from GY alongside active Tuner for Synchro material!`;
        }
      }

      // Quickdraw Synchron (20932152): Discard monster from hand to special summon
      else if (code === 20932152) {
        const hasDiscardable = (aiField.hand || []).some(
          (h) => (h?.code ?? h) !== 20932152,
        );
        if (hasDiscardable) {
          c.score += 3100;
          c.reason = `[QUICKDRAW SUMMON] Special Summon Quickdraw Synchron for high-level warrior synchro`;
        }
      }

      // Level Stealer (21159309): Reduce Level of 5+ monster to revive from GY
      else if (code === 21159309) {
        const hasHighLevelMonster = (aiField.monsterZones || []).some(
          (m) => m && m.level && m.level >= 5,
        );
        if (hasHighLevelMonster) {
          c.score += 3400;
          c.reason = `[LEVEL STEALER] Reduce Level of boss monster to summon Synchro material from GY`;
        }
      }

      // Extra Deck Synchro Summon priority
      if (topSynchro && code === topSynchro.synchroCode) {
        c.score += topSynchro.scoreBonus;
        c.reason = `[SYNCHRO CLIMB] Tune field monsters into ${topSynchro.synchroName} (Level ${topSynchro.synchroLevel})!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Junk Synchron (63977008) trigger: select optimal Level 2 or lower target
    // Priority: Quillbolt Hedgehog (23571046) > Doppelwarrior (97489701) > Speed Warrior (80504804)
    if (activeChainCards?.includes(63977008)) {
      const quillboltIdx = rawSelects.findIndex((s) => s.code === 23571046);
      if (quillboltIdx >= 0) return [quillboltIdx];

      const doppelIdx = rawSelects.findIndex((s) => s.code === 97489701);
      if (doppelIdx >= 0) return [doppelIdx];

      const speedIdx = rawSelects.findIndex((s) => s.code === 80504804);
      if (speedIdx >= 0) return [speedIdx];
    }

    // Tuning (96363153) search:
    // Priority: Junk Synchron (63977008) > Quickdraw Synchron (20932152)
    if (activeChainCards?.includes(96363153)) {
      const junkIdx = rawSelects.findIndex((s) => s.code === 63977008);
      if (junkIdx >= 0) return [junkIdx];

      const quickdrawIdx = rawSelects.findIndex((s) => s.code === 20932152);
      if (quickdrawIdx >= 0) return [quickdrawIdx];
    }

    return null;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Stardust Dragon (44508094): Negate card or effect that would destroy card(s) on field
      if (code === 44508094) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 5500,
          reason: `[STARDUST PROTECTION] Tribute Stardust Dragon to negate destruction effect and protect field!`,
          cardCode: code,
          cardName: 'Stardust Dragon',
        });
      }

      // Scrap-Iron Scarecrow (98427577): Negate attack
      else if (code === 98427577) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4200,
          reason: `[SCARECROW NEGATE] Negate attack and reset Scrap-Iron Scarecrow face-down!`,
          cardCode: code,
          cardName: 'Scrap-Iron Scarecrow',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
