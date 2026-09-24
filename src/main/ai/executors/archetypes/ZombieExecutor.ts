import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class ZombieExecutor extends DefaultExecutor {
  public override readonly id = 'zombie-undead-rebirth';
  public override readonly name = 'Zombie Undead Rebirth Executor';
  public override readonly description = 'Zombie graveyard mastery: Zombie Master hand-discard revivals, Book of Life resurrection & banish, Mezuki GY triggers, and Pyramid Turtle battle recruitment.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('zombie') || arch.includes('vampire');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(17259470) || // Zombie Master
      cards.includes(2204140) ||  // Book of Life
      cards.includes(77044671) || // Pyramid Turtle
      cards.includes(92826944) || // Mezuki
      cards.includes(53839837);   // Vampire Lord
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const oppGyHasMonsters = (oppField.graveyard || []).some((c) => c && c.code > 0);
    const aiGyHasZombies = (aiField.graveyard || []).some((c) => c && c.code > 0);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Book of Life (2204140): Target 1 Zombie in our GY, banish 1 opponent GY monster
      if (code === 2204140 && oppGyHasMonsters && aiGyHasZombies) {
        c.score += 4600;
        c.reason = `[BOOK OF LIFE] Revive Zombie from GY and banish opponent graveyard asset!`;
      }

      // 2. Mezuki (92826944): Banish from GY to revive a Zombie
      else if (code === 92826944 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4400;
        c.reason = `[MEZUKI REVIVE] Banish Mezuki from Graveyard to Special Summon Zombie!`;
      }

      // 3. Zombie Master (17259470) Ignition Effect: Discard monster to revive Level 4 or lower Zombie
      else if (code === 17259470 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4200;
        c.reason = `[ZOMBIE MASTER EFFECT] Discard card to Special Summon Level 4 or lower Zombie!`;
      }

      // 4. Normal Summon Priority:
      // Zombie Master (17259470) > Pyramid Turtle (77044671) > Goblin Zombie (63665875)
      else if (code === 17259470) {
        c.score += 3500;
        c.reason = `[ZOMBIE MASTER SUMMON] Normal summon Zombie Master to ignite graveyard loops!`;
      }
      else if (code === 77044671) {
        c.score += 3100;
        c.reason = `[PYRAMID TURTLE SUMMON] Normal summon Pyramid Turtle for battle-destruction floating!`;
      }
      else if (code === 63665875) {
        c.score += 2600;
        c.reason = `[GOBLIN ZOMBIE SUMMON] Normal summon Goblin Zombie for graveyard search trigger!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Pyramid Turtle (77044671) combat float target:
    // Priority: Ryu Kokki (57281778, 2400 ATK) > Vampire Lord (53839837, 2000 ATK) > Zombie Master (17259470)
    if (activeChainCards?.includes(77044671)) {
      const kokkiIdx = rawSelects.findIndex((s) => s.code === 57281778);
      if (kokkiIdx >= 0) return [kokkiIdx];

      const vlordIdx = rawSelects.findIndex((s) => s.code === 53839837);
      if (vlordIdx >= 0) return [vlordIdx];

      const zmIdx = rawSelects.findIndex((s) => s.code === 17259470);
      if (zmIdx >= 0) return [zmIdx];
    }

    return super.onSelectCard(msg, context);
  }
}
