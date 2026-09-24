import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class GravekeeperExecutor extends DefaultExecutor {
  public override readonly id = 'gravekeeper-necrovalley';
  public override readonly name = "Gravekeeper's Necrovalley Executor";
  public override readonly description = 'Ishizu Ishtar tomb guardian control: Necrovalley graveyard lockdown, Royal Tribute hand wipe, Spy wall recruitment, and Descendant spot destruction.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('gravekeeper') || arch.includes('necrovalley');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(47355498) || // Necrovalley
      cards.includes(24317029) || // Gravekeeper's Spy
      cards.includes(30213599) || // Gravekeeper's Descendant
      cards.includes(72405967);   // Royal Tribute
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // Check if Necrovalley is active
    const hasNecrovalley = (aiField.fieldZone && aiField.fieldZone.code === 47355498) ||
      (oppField.fieldZone && oppField.fieldZone.code === 47355498);

    const faceUpGkMonsters = (aiField.monsterZones || []).filter((m) => {
      if (!m) return false;
      const name = context.cardReader?.getCardName(m.code) || '';
      return name.toLowerCase().includes('gravekeeper');
    });

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Necrovalley (47355498): Top priority field spell
      if (code === 47355498) {
        c.score += hasNecrovalley ? -1500 : 4800;
        c.reason = hasNecrovalley ? `Hold duplicate Necrovalley` : `[NECROVALLEY LOCK] Activate Necrovalley to shut down all Graveyard recursion!`;
      }

      // 2. Royal Tribute (72405967): Discard all monsters from both hands if Necrovalley active
      else if (code === 72405967) {
        if (hasNecrovalley) {
          c.score += 4200;
          c.reason = `[ROYAL TRIBUTE] Force opponent to discard all monsters from hand under Necrovalley!`;
        }
      }

      // 3. Gravekeeper's Spy (24317029): Always prioritize SETTING face-down (2000 DEF)
      else if (code === 24317029) {
        const isSetAction = (c.action as any)?.idleAction === SelectIdleCMDAction.MSET;
        c.score += isSetAction ? 3900 : 1200;
        c.reason = isSetAction
          ? `[SPY DEFENSE WALL] Set Gravekeeper's Spy (2000 DEF) to recruit reinforcements upon flip!`
          : `Summon Gravekeeper's Spy`;
      }

      // 4. Gravekeeper's Descendant (30213599): Tribute another GK to destroy opponent card
      else if (code === 30213599) {
        if (faceUpGkMonsters.length >= 2) {
          c.score += 3800;
          c.reason = `[DESCENDANT REMOVAL] Tribute Gravekeeper to pop opponent threat!`;
        } else {
          c.score += 2600;
          c.reason = `Normal Summon Gravekeeper's Descendant (1500 ATK / 2000 under Necrovalley)`;
        }
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Gravekeeper's Spy (24317029) recruit:
    // Priority: Descendant (30213599) > Assailant (25262697) > Commandant (17390179)
    if (activeChainCards?.includes(24317029)) {
      const descIdx = rawSelects.findIndex((s) => s.code === 30213599);
      if (descIdx >= 0) return [descIdx];

      const assIdx = rawSelects.findIndex((s) => s.code === 25262697);
      if (assIdx >= 0) return [assIdx];

      const commIdx = rawSelects.findIndex((s) => s.code === 17390179);
      if (commIdx >= 0) return [commIdx];
    }

    return null;
  }
}
