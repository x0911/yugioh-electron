import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class DarkWorldExecutor extends DefaultExecutor {
  public override readonly id = 'dark-world-discard';
  public override readonly name = 'Dark World Discard & Swarm Executor';
  public override readonly description = 'Dark World discard loops: Dark World Dealings & Lightning discard triggers, Goldd & Sillva explosive special summons, Broww card draw, and Brron battle discards.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('dark world');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(78004197) || // Goldd
      cards.includes(32619583) || // Sillva
      cards.includes(74117290) || // Dark World Dealings
      cards.includes(79126789);   // Broww
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const hand = aiField.hand || [];
    const hasDarkWorldDiscardTargets = hand.some(
      (c) => c && (c.code === 78004197 || c.code === 32619583 || c.code === 79126789),
    );

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Dark World Dealings (74117290): High priority when holding Goldd, Sillva, or Broww!
      if (code === 74117290 && hasDarkWorldDiscardTargets) {
        c.score += 4800;
        c.reason = `[DARK WORLD DEALINGS] Draw 1 and discard Goldd/Sillva/Broww to trigger graveyard special summon!`;
      }

      // 2. Dark World Lightning (93554166): Destroy face-down card and trigger discard
      else if (code === 93554166) {
        c.score += 4200;
        c.reason = `[DARK WORLD LIGHTNING] Destroy face-down card and discard Dark World monster!`;
      }

      // 3. Card Destruction (72892473): Mass swarm hand purge!
      else if (code === 72892473 && hasDarkWorldDiscardTargets) {
        c.score += 5500;
        c.reason = `[CARD DESTRUCTION SWARM] Discard hand to trigger multiple Goldd & Sillva resurrections!`;
      }

      // 4. Normal Summon Priority:
      // Brron (6214884, 1800 ATK) > Broww (79126789, 1400 ATK)
      else if (code === 6214884) {
        c.score += 3400;
        c.reason = `[BRRON SUMMON] Normal summon Brron (1800 ATK) to discard Dark World monsters on battle damage!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Discard Selection (Dark World Dealings 74117290 or Lightning 93554166):
    // Priority: Goldd (78004197) > Sillva (32619583) > Broww (79126789)
    if (activeChainCards?.includes(74117290) || activeChainCards?.includes(93554166)) {
      const golddIdx = rawSelects.findIndex((s) => s.code === 78004197);
      if (golddIdx >= 0) return [golddIdx];

      const sillvaIdx = rawSelects.findIndex((s) => s.code === 32619583);
      if (sillvaIdx >= 0) return [sillvaIdx];

      const browwIdx = rawSelects.findIndex((s) => s.code === 79126789);
      if (browwIdx >= 0) return [browwIdx];
    }

    return super.onSelectCard(msg, context);
  }
}
