import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class CrystalBeastExecutor extends DefaultExecutor {
  public override readonly id = 'crystal-beast-rainbow';
  public override readonly name = 'Crystal Beast Rainbow Swarm Executor';
  public override readonly description = 'Crystal Beast mechanics: Sapphire Pegasus placement, Crystal Beacon/Promise swarming, Crystal Abundance board clear OTK, and Rainbow Dragon descent.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('crystal beast') || arch.includes('rainbow dragon');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(7093411) ||  // Sapphire Pegasus
      cards.includes(79856792) || // Rainbow Dragon
      cards.includes(72881007) || // Crystal Abundance
      cards.includes(95326659) || // Crystal Beacon
      cards.includes(95600067);   // Topaz Tiger
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // Count Crystal Beasts in Spell/Trap zones (continuous spells)
    const crystalBeastsInSt = (aiField.spellTrapZones || []).filter((st) => {
      if (!st) return false;
      const name = context.cardReader?.getCardName(st.code) || '';
      return name.toLowerCase().includes('crystal beast');
    });

    const oppCardCount = (oppField.monsterZones || []).filter(Boolean).length +
                         (oppField.spellTrapZones || []).filter(Boolean).length;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Crystal Abundance (72881007): If we have >= 4 Crystal Beasts in ST zones, absolute game-winning nuke!
      if (code === 72881007 && crystalBeastsInSt.length >= 4 && oppCardCount > 0) {
        c.score += 7000;
        c.reason = `[CRYSTAL ABUNDANCE] Send 4 Crystal Beasts to GY to wipe opponent board and swarm field!`;
      }

      // 2. Crystal Beacon (95326659): Needs 2+ Crystal Beasts in ST zones
      else if (code === 95326659 && crystalBeastsInSt.length >= 2) {
        c.score += 4200;
        c.reason = `[CRYSTAL BEACON] Special Summon Sapphire Pegasus or Ruby Carbuncle from deck!`;
      }

      // 3. Crystal Promise (8275702): Special summon from ST zone
      else if (code === 8275702 && crystalBeastsInSt.length > 0) {
        c.score += 3500;
        c.reason = `[CRYSTAL PROMISE] Special Summon Crystal Beast from backrow!`;
      }

      // 4. Crystal Blessing (35486099): Place up to 2 Crystal Beasts from GY into ST zone
      else if (code === 35486099) {
        c.score += 3200;
        c.reason = `[CRYSTAL BLESSING] Replenish backrow with Crystal Beasts from Graveyard!`;
      }

      // 5. Rainbow Dragon (79856792): Special Summon when condition met (4000 ATK boss!)
      else if (code === 79856792) {
        c.score += 5500;
        c.reason = `[RAINBOW DRAGON] Summon 4000 ATK Divine Beast of the Rainbow!`;
      }

      // 6. Normal Summon Priorities:
      // Sapphire Pegasus (7093411) > Topaz Tiger (95600067) > Amber Mammoth (69937550)
      else if (code === 7093411) {
        c.score += 3800;
        c.reason = `[SAPPHIRE PEGASUS] Normal Summon Pegasus to place Crystal Beast directly from deck/hand/GY!`;
      }
      else if (code === 95600067) {
        c.score += 2600;
        c.reason = `[TOPAZ TIGER] Normal Summon Topaz Tiger (2000 ATK attacker)!`;
      }
      else if (code === 69937550) {
        c.score += 2200;
        c.reason = `[AMBER MAMMOTH] Normal Summon Amber Mammoth (1700 ATK defender)!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Pegasus (7093411) or Crystal Bond placement target:
    // Priority: Ruby Carbuncle (32710364) > Sapphire Pegasus (7093411) > Topaz Tiger (95600067)
    if (activeChainCards?.includes(7093411) || activeChainCards?.includes(9334391)) {
      const carbuncleIdx = rawSelects.findIndex((s) => s.code === 32710364);
      if (carbuncleIdx >= 0) return [carbuncleIdx];

      const pegasusIdx = rawSelects.findIndex((s) => s.code === 7093411);
      if (pegasusIdx >= 0) return [pegasusIdx];

      const tigerIdx = rawSelects.findIndex((s) => s.code === 95600067);
      if (tigerIdx >= 0) return [tigerIdx];
    }

    // Crystal Beacon (95326659) Summon Target:
    // Ruby Carbuncle (32710364) -> causes mass swarm from ST, else Sapphire Pegasus (7093411)
    if (activeChainCards?.includes(95326659)) {
      const carbuncleIdx = rawSelects.findIndex((s) => s.code === 32710364);
      if (carbuncleIdx >= 0) return [carbuncleIdx];

      const pegasusIdx = rawSelects.findIndex((s) => s.code === 7093411);
      if (pegasusIdx >= 0) return [pegasusIdx];
    }

    return super.onSelectCard(msg, context);
  }
}
