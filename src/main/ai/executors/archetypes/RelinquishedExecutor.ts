import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class RelinquishedExecutor extends DefaultExecutor {
  public override readonly id = 'relinquished-illusion';
  public override readonly name = 'Relinquished Illusion Ritual Executor';
  public override readonly description = 'Maximillion Pegasus ritual magic: Manju/Senju search engine, Black Illusion Ritual summon, Relinquished monster absorption, and battle damage reflection.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('relinquished') || arch.includes('illusion') || arch.includes('thousand-eyes');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(64631466) || // Relinquished
      cards.includes(63519819) || // Thousand-Eyes Restrict
      cards.includes(41426869) || // Black Illusion Ritual
      cards.includes(95492061);   // Manju
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const oppMonsters = (oppField.monsterZones || []).filter(Boolean);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Relinquished (64631466) / Restrict (63519819) Ignition: Absorb opponent's monster!
      if ((code === 64631466 || code === 63519819) && c.action.type === OcgResponseType.SELECT_IDLECMD && oppMonsters.length > 0) {
        c.score += 7000;
        c.reason = `[RELINQUISHED ABSORPTION] Steal opponent's monster as equip spell and absorb its ATK!`;
      }

      // 2. Preparation of Rites (96729612): Search Ritual Monster
      else if (code === 96729612) {
        c.score += 5200;
        c.reason = `[PREPARATION OF RITES] Search Ritual Monster and recover Ritual Spell from GY!`;
      }

      // 3. Black Illusion Ritual (41426869): Ritual Summon Relinquished
      else if (code === 41426869) {
        c.score += 4800;
        c.reason = `[BLACK ILLUSION RITUAL] Ritual Summon Relinquished to steal opponent board!`;
      }

      // 4. Normal Summon Searchers:
      // Manju (95492061) > Senju (23401839)
      else if (code === 95492061) {
        c.score += 3800;
        c.reason = `[MANJU SEARCH] Normal summon Manju to search Ritual Monster or Spell!`;
      }
      else if (code === 23401839) {
        c.score += 3500;
        c.reason = `[SENJU SEARCH] Normal summon Senju to search Relinquished!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;

    // Manju (95492061) Search priority:
    // If hand has Ritual Spell, search Relinquished (64631466); else search Black Illusion Ritual (41426869)
    if (activeChainCards?.includes(95492061)) {
      const relIdx = rawSelects.findIndex((s) => s.code === 64631466);
      if (relIdx >= 0) return [relIdx];

      const ritualSpellIdx = rawSelects.findIndex((s) => s.code === 41426869);
      if (ritualSpellIdx >= 0) return [ritualSpellIdx];
    }

    // Absorption target: Pick opponent monster with highest ATK
    if (activeChainCards?.includes(64631466) || activeChainCards?.includes(63519819)) {
      let bestIdx = 0;
      let highestAtk = -1;
      rawSelects.forEach((s, idx) => {
        const atk = context.cardReader?.getCardDetail(s.code)?.atk || 0;
        if (atk > highestAtk) {
          highestAtk = atk;
          bestIdx = idx;
        }
      });
      return [bestIdx];
    }

    return null;
  }
}
