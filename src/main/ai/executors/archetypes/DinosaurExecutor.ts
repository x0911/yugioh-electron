import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class DinosaurExecutor extends DefaultExecutor {
  public override readonly id = 'dinosaur-beatdown';
  public override readonly name = 'Dinosaur Jurassic Swarm Executor';
  public override readonly description = 'Dinosaur Jurassic tactics: Fossil Dig searches, Hydrogeddon combat reproduction swarming, and Ultimate Tyranno / Super Conductor board-wiping aggression.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('dinosaur') || arch.includes('jurassic');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(15894048) || // Ultimate Tyranno
      cards.includes(85520851) || // Super Conductor Tyranno
      cards.includes(18940556) || // Ultimate Conductor Tyranno
      cards.includes(22587018) || // Hydrogeddon
      cards.includes(47325505);   // Fossil Dig
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const monstersOnField = (aiField.monsterZones || []).filter(Boolean);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Fossil Dig (47325505): Search deck starter before normal summon
      if (code === 47325505) {
        c.score += 6500;
        c.reason = `[FOSSIL DIG] Search key Dinosaur from deck into hand!`;
      }

      // 2. Gilasaurus (45894482): Free special summon from hand for tribute or swarming
      else if (code === 45894482 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 3200;
        c.reason = `[GILASAURUS] Free special summon to establish tribute/swarming fodder!`;
      }

      // 3. Boss Tribute / Special Summon: Ultimate Tyranno (15894048) / Super Conductor (85520851)
      else if ((code === 15894048 || code === 85520851 || code === 18940556) && monstersOnField.length >= 2) {
        c.score += 4500;
        c.reason = `[TYRANNO BOSS] Tribute summon apex predator (3000+ ATK)!`;
      }

      // 4. Normal Summon Priority:
      // Hydrogeddon (22587018) > Oxygeddon (58071123) > Black Veloci (52319752)
      else if (code === 22587018) {
        c.score += 3400;
        c.reason = `[HYDROGEDDON SUMMON] Normal summon Hydrogeddon for battle-destruction replication!`;
      }
      else if (code === 58071123) {
        c.score += 2600;
        c.reason = `[OXYGEDDON SUMMON] Normal summon Oxygeddon (1800 ATK beatdown)!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Fossil Dig (47325505) Search priority:
    // Hydrogeddon (22587018) > Souleating Oviraptor (44335251) > Babycerasaurus (36042004) > Oxygeddon (58071123)
    if (activeChainCards?.includes(47325505)) {
      const hydroIdx = rawSelects.findIndex((s) => s.code === 22587018);
      if (hydroIdx >= 0) return [hydroIdx];

      const oviIdx = rawSelects.findIndex((s) => s.code === 44335251);
      if (oviIdx >= 0) return [oviIdx];

      const babyIdx = rawSelects.findIndex((s) => s.code === 36042004);
      if (babyIdx >= 0) return [babyIdx];
    }

    return super.onSelectCard(msg, context);
  }
}
