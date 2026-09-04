import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';

export class LightswornExecutor extends DefaultExecutor {
  public override readonly id = 'lightsworn';
  public override readonly name = 'Lightsworn Swarm & Board Wipe Executor';
  public override readonly description = 'Solar Recharge draw/mill acceleration, Lumina revivals, and Judgment Dragon field wipes.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('lightsworn');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(57774843) || // Judgment Dragon
      cards.includes(691925) ||   // Solar Recharge
      cards.includes(94886282) || // Charge of the Light Brigade
      cards.includes(95503687) || // Lumina, Lightsworn Summoner
      cards.includes(22624373);   // Lyla, Lightsworn Sorceress
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);
    const oppCards = [
      ...oppField.monsterZones.filter(Boolean),
      ...oppField.spellTrapZones.filter(Boolean),
    ];

    // Count unique Lightsworn names in AI GY
    const gyLsNames = new Set(
      aiField.graveyard
        .filter((c) => c && c.name && c.name.includes('Lightsworn'))
        .map((c) => c.name),
    );

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Judgment Dragon (57774843)
      if (code === 57774843) {
        if (gyLsNames.size >= 4) {
          c.score += 5000;
          c.reason = `[JUDGMENT DRAGON] Special Summon 3000 ATK Dragon (${gyLsNames.size} Lightsworns in GY)`;
        } else if (aiField.currentLp > 1000 && oppCards.length > 0) {
          // Field wipe ignition effect
          c.score += 4800;
          c.reason = `[JUDGMENT DRAGON WIPE] Pay 1000 LP to wipe the entire field!`;
        }
      }
      // 2. Solar Recharge (691925): Discard Lightsworn -> draw 2, mill 2
      else if (code === 691925) {
        c.score += 4000;
        c.reason = `[SOLAR RECHARGE] Discard Lightsworn, draw 2, and mill 2 cards to setup GY`;
      }
      // 3. Charge of the Light Brigade (94886282): Mill 3 -> search Level 4 or lower Lightsworn
      else if (code === 94886282) {
        c.score += 4100;
        c.reason = `[CHARGE OF THE LIGHT BRIGADE] Mill 3 and search combo Lightsworn`;
      }
      // 4. Lumina, Lightsworn Summoner (95503687): Discard 1 -> Special Summon Lightsworn from GY
      else if (code === 95503687) {
        const hasGraveTarget = aiField.graveyard.some((g) => g && g.level && g.level <= 4 && g.name?.includes('Lightsworn'));
        if (hasGraveTarget && aiField.hand.length >= 1) {
          c.score += 3600;
          c.reason = `[LUMINA REVIVAL] Discard 1 card to Special Summon Lightsworn from Graveyard`;
        } else {
          c.score += 2600;
          c.reason = `[LUMINA SUMMON] Normal Summon Lumina to establish board presence`;
        }
      }
      // 5. Lyla, Lightsworn Sorceress (22624373): Switch to DEF to destroy 1 opponent S/T
      else if (code === 22624373) {
        const oppBackrow = oppField.spellTrapZones.filter(Boolean);
        if (oppBackrow.length > 0) {
          c.score += 3400;
          c.reason = `[LYLA S/T WIPE] Change to Defense Position to destroy opponent backrow`;
        } else {
          c.score += 2600;
          c.reason = `[LYLA SUMMON] Normal Summon Lyla (1700 ATK)`;
        }
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards, cardReader, humanPlayerId } = context;

    // 1. Charge of the Light Brigade Search: Prioritize Lumina (95503687) or Lyla (22624373)
    if (activeChainCards?.includes(94886282)) {
      const luminaIdx = rawSelects.findIndex((s: any) => s.code === 95503687);
      if (luminaIdx >= 0) return [luminaIdx];
      const lylaIdx = rawSelects.findIndex((s: any) => s.code === 22624373);
      if (lylaIdx >= 0) return [lylaIdx];
      const rykoIdx = rawSelects.findIndex((s: any) => s.code === 21502796);
      if (rykoIdx >= 0) return [rykoIdx];
    }

    // 2. Solar Recharge Discard Cost: Discard Wulf (58996430), Garoth (59019082), or duplicates
    if (activeChainCards?.includes(691925)) {
      const wulfIdx = rawSelects.findIndex((s: any) => s.code === 58996430);
      if (wulfIdx >= 0) return [wulfIdx];
      const garothIdx = rawSelects.findIndex((s: any) => s.code === 59019082);
      if (garothIdx >= 0) return [garothIdx];
    }

    // 3. Lumina Revival Target: Revive Lyla (22624373) or Garoth (59019082)
    if (activeChainCards?.includes(95503687)) {
      const lylaIdx = rawSelects.findIndex((s: any) => s.code === 22624373);
      if (lylaIdx >= 0) return [lylaIdx];
      const garothIdx = rawSelects.findIndex((s: any) => s.code === 59019082);
      if (garothIdx >= 0) return [garothIdx];
    }

    // 4. Lyla Backrow Target: Destroy opponent face-down backrow
    if (activeChainCards?.includes(22624373)) {
      const oppBackrow = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId && (item.s.location === 8 || item.s.location === 256));
      if (oppBackrow.length > 0) {
        return [oppBackrow[0].idx];
      }
    }

    return null;
  }
}
