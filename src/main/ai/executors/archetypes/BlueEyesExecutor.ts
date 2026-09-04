import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class BlueEyesExecutor extends DefaultExecutor {
  public override readonly id = 'blue-eyes';
  public override readonly name = 'Blue-Eyes Dragon Executor';
  public override readonly description = 'High-level combos and lethal beatdown for Blue-Eyes Dragon decks.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('blue-eyes') || arch.includes('dragon');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(89631139) || // Blue-Eyes White Dragon
      cards.includes(23995346) || // Blue-Eyes Ultimate Dragon
      cards.includes(8240199);    // Sage with Eyes of Blue
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { oppField } = getAiAndOpponentFields(context);
    const oppMonsters = oppField.monsterZones.filter(Boolean);

    // Boost signature Blue-Eyes combos
    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Draw engine (Cards of Consonance with White Stone, Trade-In with Blue-Eyes)
      if (code === 39701395 || code === 38120068) {
        c.score += 2000;
        c.reason = `[BLUE-EYES DRAW ENGINE] Activate ${c.cardName} to cycle dragons and load Graveyard`;
      }
      // 2. Sage with Eyes of Blue (Searches White Stone or Maiden)
      else if (code === 8240199) {
        c.score += 2500;
        c.reason = `[BLUE-EYES COMBO] Normal Summon Sage with Eyes of Blue to search Level 1 LIGHT Tuner`;
      }
      // 3. GY Revivals (Silver's Cry, Return of the Dragon Lords)
      else if (code === 87025074 || code === 6853254) {
        c.score += 2200;
        c.reason = `[BLUE-EYES REVIVE] Special summon Blue-Eyes Dragon from Graveyard`;
      }
      // 4. Burst Stream of Destruction
      else if (code === 17655904) {
        if (oppMonsters.length > 0) {
          c.score += 3000;
          c.reason = `[BURST STREAM] Wipe all opponent monsters with Burst Stream of Destruction!`;
        }
      }
      // 5. Fusion / Dragon's Mirror (Summon Twin Burst / Ultimate Dragon)
      else if (code === 24094653 || code === 1482001) {
        c.score += 2400;
        c.reason = `[DRAGON FUSION] Fusion Summon Blue-Eyes boss monster`;
      }
    }

    return baseCandidates;
  }

  public override onSelectYesNo(msg: OcgMessage, context: EvaluatorContext): boolean | null {
    const code = (msg as any).code ?? 0;

    // The White Stone of Ancients (71039903) End Phase Trigger:
    // Once per turn, during the End Phase, if this card is in the GY because it was sent there this turn:
    // You can Special Summon 1 "Blue-Eyes" monster from your Deck.
    if (code === 71039903) {
      return true; // Always trigger End Phase dragon summon!
    }

    return null;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;
    const { oppField } = getAiAndOpponentFields(context);

    // 1. Sage with Eyes of Blue (8240199) Search:
    // When Normal Summoned: You can add 1 Level 1 LIGHT Tuner from your Deck to your hand.
    // Priority: The White Stone of Ancients (71039903) > White Stone of Legend (79814787) > Maiden (88241506)
    if (activeChainCards?.includes(8240199)) {
      const ancientsIdx = rawSelects.findIndex((s: any) => s.code === 71039903);
      if (ancientsIdx >= 0) return [ancientsIdx];
      const legendIdx = rawSelects.findIndex((s: any) => s.code === 79814787);
      if (legendIdx >= 0) return [legendIdx];
      const maidenIdx = rawSelects.findIndex((s: any) => s.code === 88241506);
      if (maidenIdx >= 0) return [maidenIdx];
    }

    // 2. Trade-In (38120068) Discard Cost: Discard Level 8 monster (Blue-Eyes White Dragon 89631139)
    if (activeChainCards?.includes(38120068)) {
      const bewdIdx = rawSelects.findIndex((s: any) => s.code === 89631139);
      if (bewdIdx >= 0) return [bewdIdx];
    }

    // 3. Cards of Consonance (39701395) Discard Cost: Discard Dragon Tuner with <= 1000 ATK
    if (activeChainCards?.includes(39701395)) {
      const ancientsIdx = rawSelects.findIndex((s: any) => s.code === 71039903);
      if (ancientsIdx >= 0) return [ancientsIdx];
      const legendIdx = rawSelects.findIndex((s: any) => s.code === 79814787);
      if (legendIdx >= 0) return [legendIdx];
    }

    // 4. The White Stone of Ancients (71039903) Special Summon from Deck:
    if (activeChainCards?.includes(71039903)) {
      const oppBackrow = oppField.spellTrapZones.filter(Boolean);
      if (oppBackrow.length > 0) {
        // Summon Dragon Spirit of White (45467446) to banish opponent backrow
        const dsowIdx = rawSelects.findIndex((s: any) => s.code === 45467446);
        if (dsowIdx >= 0) return [dsowIdx];
      }
      // Summon Blue-Eyes White Dragon (89631139)
      const bewdIdx = rawSelects.findIndex((s: any) => s.code === 89631139);
      if (bewdIdx >= 0) return [bewdIdx];
    }

    return null;
  }
}
