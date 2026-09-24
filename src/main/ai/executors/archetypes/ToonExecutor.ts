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

export class ToonExecutor extends DefaultExecutor {
  public override readonly id = 'toon-world';
  public override readonly name = 'Toon World & Kingdom Executor';
  public override readonly description = 'Maximillion Pegasus illusion magic: Toon Table of Contents chaining, Toon Kingdom protection, Comic Hand mind control, and direct attack lethal bypass.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('toon');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(89997728) || // Toon Table of Contents
      cards.includes(15259703) || // Toon World
      cards.includes(43175858) || // Toon Kingdom
      cards.includes(42386471) || // Toon Dark Magician Girl
      cards.includes(53183600);   // Blue-Eyes Toon Dragon
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // Check if Toon World or Toon Kingdom is active on field
    const hasToonWorld = (aiField.spellTrapZones || []).some((st) => {
      if (!st) return false;
      const code = st.code;
      return (code === 15259703 || code === 43175858) && st.position === 'faceup';
    });

    const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => !!m);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Toon Table of Contents (89997728): Highest priority searcher
      if (code === 89997728) {
        c.score += 4800;
        c.reason = `[TOON TABLE] Search Toon Kingdom / Toon monster to establish field dominance`;
      }

      // 2. Toon Kingdom (43175858) / Toon World (15259703): Foundation for all Toons
      else if (code === 43175858) {
        c.score += 4600;
        c.reason = `[TOON KINGDOM] Establish indestructible Toon Kingdom fortress`;
      }
      else if (code === 15259703) {
        c.score += hasToonWorld ? -2000 : 4200;
        c.reason = hasToonWorld ? `Hold extra Toon World` : `[TOON WORLD] Activate Toon World portal`;
      }

      // 3. Comic Hand (92841362): Take control of opponent's boss monster
      else if (code === 92841362) {
        if (hasToonWorld && oppMonsters.length > 0) {
          c.score += 4400;
          c.reason = `[COMIC HAND] Steal opponent's strongest monster and turn it into a direct-attacking Toon!`;
        }
      }

      // 4. Toon Dark Magician Girl (42386471): Can attack on the turn it is summoned!
      else if (code === 42386471) {
        if (hasToonWorld) {
          c.score += 3900;
          c.reason = `[TOON DMG] Special Summon Toon Dark Magician Girl for immediate direct attack!`;
        }
      }

      // 5. Blue-Eyes Toon Dragon (53183600): 3000 ATK direct hitter
      else if (code === 53183600) {
        if (hasToonWorld) {
          c.score += 3500;
          c.reason = `[BLUE-EYES TOON] Summon 3000 ATK Blue-Eyes Toon Dragon for massive direct pressure!`;
        }
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;
    const { aiField } = getAiAndOpponentFields(context);

    // Toon Table of Contents (89997728) Search:
    // If Toon Kingdom not active: Toon Kingdom (43175858) > Toon World (15259703)
    // If active: Comic Hand (92841362) > Toon DMG (42386471) > Blue-Eyes Toon (53183600)
    if (activeChainCards?.includes(89997728)) {
      const hasToonField = (aiField.spellTrapZones || []).some(
        (st) => st && (st.code === 15259703 || st.code === 43175858) && st.position === 'faceup',
      );

      if (!hasToonField) {
        const kingdomIdx = rawSelects.findIndex((s) => s.code === 43175858);
        if (kingdomIdx >= 0) return [kingdomIdx];

        const worldIdx = rawSelects.findIndex((s) => s.code === 15259703);
        if (worldIdx >= 0) return [worldIdx];
      }

      const comicIdx = rawSelects.findIndex((s) => s.code === 92841362);
      if (comicIdx >= 0) return [comicIdx];

      const dmgIdx = rawSelects.findIndex((s) => s.code === 42386471);
      if (dmgIdx >= 0) return [dmgIdx];

      const blueEyesIdx = rawSelects.findIndex((s) => s.code === 53183600);
      if (blueEyesIdx >= 0) return [blueEyesIdx];
    }

    return null;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Toon Briefcase (84536654): Shuffle back opponent summon
      if (code === 84536654) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4700,
          reason: `[TOON BRIEFCASE] Snap the briefcase shut to shuffle opponent's monster back into the deck!`,
          cardCode: code,
          cardName: 'Toon Briefcase',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
