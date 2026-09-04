import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';

export class VolcanicExecutor extends DefaultExecutor {
  public override readonly id = 'volcanic-burn';
  public override readonly name = 'Volcanic Burn & Board Control Executor';
  public override readonly description = 'Volcanic Rocket searches, Blaze Accelerator + Scattershot board wipes, and Shell reloading.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('volcanic') || arch.includes('blaze');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(76459806) || // Volcanic Rocket
      cards.includes(69537999) || // Blaze Accelerator
      cards.includes(69750546) || // Volcanic Scattershot
      cards.includes(33365932) || // Volcanic Shell
      cards.includes(32543380);   // Volcanic Doomfire
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);
    const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => !!m);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Volcanic Rocket (Search Blaze Accelerator from Deck/GY)
      if (code === 76459806) {
        c.score += 3400;
        c.reason = `[VOLCANIC ROCKET] Normal Summon Rocket to search Blaze Accelerator`;
      }
      // 2. Blaze Accelerator / Tri-Blaze Accelerator (Activate Spell or Ignition Effect)
      else if (code === 69537999 || code === 21420702) {
        const hasAmmunition = aiField.hand.some((h) => h === 69750546 || h === 33365932);
        if (oppMonsters.length > 0 && hasAmmunition) {
          c.score += 3800;
          c.reason = `[BLAZE ACCELERATOR] Fire Pyro ammunition to destroy opponent monsters and burn LP!`;
        } else {
          c.score += 2600;
          c.reason = `[BLAZE ACCELERATOR] Place continuous accelerator on field`;
        }
      }
      // 3. Volcanic Shell in GY (Pay 500 LP to add another Shell from deck)
      else if (code === 33365932) {
        if (aiField.currentLp > 1000) {
          c.score += 3000;
          c.reason = `[SHELL RELOAD] Pay 500 LP to fetch another Volcanic Shell for ammunition`;
        }
      }
      // 4. Volcanic Doomfire
      else if (code === 32543380) {
        c.score += 3900;
        c.reason = `[VOLCANIC DOOMFIRE] Special Summon boss Doomfire to wipe all opponent monsters`;
      }
    }

    return baseCandidates;
  }

  public override onSelectYesNo(msg: OcgMessage, context: EvaluatorContext): boolean | null {
    const code = (msg as any).code ?? 0;

    // Volcanic Scattershot (69750546) GY Trigger:
    // "Send 2 other 'Volcanic Scattershot' from your hand/Deck to GY; destroy all monsters your opponent controls, inflict 500 damage per copy (1500 total)"
    if (code === 69750546) {
      return true; // Always trigger board wipe + burn
    }

    return null;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards, cardReader, humanPlayerId } = context;

    // 1. Volcanic Rocket Search: Fetch Blaze Accelerator (69537999) or Tri-Blaze (21420702)
    if (activeChainCards?.includes(76459806)) {
      const blazeIdx = rawSelects.findIndex((s: any) => s.code === 69537999);
      if (blazeIdx >= 0) return [blazeIdx];
      const triBlazeIdx = rawSelects.findIndex((s: any) => s.code === 21420702);
      if (triBlazeIdx >= 0) return [triBlazeIdx];
    }

    // 2. Blaze Accelerator Ammunition Discard Cost:
    // Send 1 Pyro monster with 500 or less ATK to Graveyard
    // Priority: Volcanic Scattershot (69750546) > Volcanic Shell (33365932)
    if (activeChainCards?.includes(69537999) || activeChainCards?.includes(21420702)) {
      const scatterIdx = rawSelects.findIndex((s: any) => s.code === 69750546);
      if (scatterIdx >= 0) return [scatterIdx];
      const shellIdx = rawSelects.findIndex((s: any) => s.code === 33365932);
      if (shellIdx >= 0) return [shellIdx];

      // If targeting an opponent monster to destroy:
      const oppMonsters = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId);
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => {
          const atkA = cardReader.getCardDetail(a.s.code)?.atk ?? 0;
          const atkB = cardReader.getCardDetail(b.s.code)?.atk ?? 0;
          return atkB - atkA;
        });
        return [oppMonsters[0].idx];
      }
    }

    return null;
  }
}
