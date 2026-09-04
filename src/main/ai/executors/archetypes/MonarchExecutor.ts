import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';

export class MonarchExecutor extends DefaultExecutor {
  public override readonly id = 'monarch-tribute';
  public override readonly name = 'Monarch Tribute Control Executor';
  public override readonly description = 'Treeborn Frog Standby loops, Soul Exchange steals, and optimal Caius/Raiza/Mobius targeting.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('monarch') ||
      arch.includes('soul control') ||
      arch.includes('tribute') ||
      arch.includes('frog');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(9748752) ||  // Caius the Shadow Monarch
      cards.includes(73125233) || // Raiza the Storm Monarch
      cards.includes(4929256) ||  // Mobius the Frost Monarch
      cards.includes(51945556) || // Zaborg the Thunder Monarch
      cards.includes(26205777) || // Thestalos the Firestorm Monarch
      cards.includes(12538374);   // Treeborn Frog
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);
    const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => !!m);
    const aiMonsters = aiField.monsterZones.filter((m): m is FieldCard => !!m);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Soul Exchange / Brain Control (Steal/Tribute opponent monster)
      if (code === 68005187 || code === 87910978) {
        if (oppMonsters.length > 0) {
          c.score += 3800;
          c.reason = `[MONARCH TRIBUTE ENGINE] Steal or target opponent monster for upcoming Tribute Summon`;
        }
      }
      // 2. Caius the Shadow Monarch (Banish 1 card on field; +1000 burn if DARK)
      else if (code === 9748752) {
        if (aiMonsters.length >= 1) {
          c.score += 3600;
          c.reason = `[CAIUS BANISH] Tribute Summon Caius to banish opponent's key card`;
        }
      }
      // 3. Raiza the Storm Monarch (Spin 1 card to top of deck)
      else if (code === 73125233) {
        if (aiMonsters.length >= 1) {
          c.score += 3500;
          c.reason = `[RAIZA BOUNCE] Tribute Summon Raiza to lock opponent draw`;
        }
      }
      // 4. Mobius the Frost Monarch (Destroy up to 2 Spell/Traps)
      else if (code === 4929256) {
        const oppBackrow = oppField.spellTrapZones.filter(Boolean);
        if (aiMonsters.length >= 1 && oppBackrow.length > 0) {
          c.score += 3500;
          c.reason = `[MOBIUS S/T WIPE] Tribute Summon Mobius to destroy 2 opponent Spell/Traps`;
        }
      }
      // 5. Zaborg the Thunder Monarch / Thestalos the Firestorm Monarch
      else if (code === 51945556 || code === 26205777) {
        if (aiMonsters.length >= 1) {
          c.score += 3300;
          c.reason = `[MONARCH SUMMON] Tribute Summon ${c.cardName}`;
        }
      }
    }

    return baseCandidates;
  }

  public override onSelectYesNo(msg: OcgMessage, context: EvaluatorContext): boolean | null {
    const code = (msg as any).code ?? 0;
    const { aiField } = getAiAndOpponentFields(context);
    const { boardState } = context;

    // Treeborn Frog (12538374):
    // In Standby Phase, if you have no Spells/Traps on your field, Special Summon from Graveyard
    if (code === 12538374 || (msg as any).desc === '12538374') {
      const isSP = boardState.currentPhase === 'SP' || boardState.currentPhase === 'STANDBY';
      const hasNoBackrow = aiField.spellTrapZones.filter(Boolean).length === 0;
      if (isSP && hasNoBackrow) {
        return true; // Revive Treeborn Frog!
      }
    }

    return null;
  }

  public override onSelectTribute(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    const minCount = Math.max(1, msg.min ?? 1);
    if (rawSelects.length < minCount) return null;

    // Score tribute sacrifice:
    // Highest priority to sacrifice Treeborn Frog (12538374) or stolen opponent monsters
    const scored = rawSelects.map((s: any, index: number) => {
      let score = 0;
      if (s.controller !== context.aiPlayerId) score += 20000; // Stolen monster
      if (s.code === 12538374) score += 15000; // Treeborn Frog (revives freely next turn)
      if (s.code === 31305911 || s.code === 23205979) score += 10000; // Token
      const detail = context.cardReader.getCardDetail(s.code);
      const atk = detail?.atk ?? 1000;
      score -= atk; // Lower ATK preferred
      return { index, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, minCount).map((s) => s.index);
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards, cardReader, humanPlayerId } = context;
    const minCount = Math.max(1, msg.min ?? 1);

    // 1. Caius the Shadow Monarch Banish Target (9748752)
    if (activeChainCards?.includes(9748752)) {
      const oppTargets = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId);

      if (oppTargets.length > 0) {
        // Prioritize opponent DARK monsters (+1000 burn), else highest ATK monster, else backrow
        oppTargets.sort((a, b) => {
          const detA = cardReader.getCardDetail(a.s.code);
          const detB = cardReader.getCardDetail(b.s.code);
          const isDarkA = ((detA?.attribute ?? 0) === 0x20 || detA?.attributeName === 'DARK') ? 1 : 0;
          const isDarkB = ((detB?.attribute ?? 0) === 0x20 || detB?.attributeName === 'DARK') ? 1 : 0;
          if (isDarkA !== isDarkB) return isDarkB - isDarkA;
          const atkA = detA?.atk ?? 0;
          const atkB = detB?.atk ?? 0;
          return atkB - atkA;
        });
        return [oppTargets[0].idx];
      }
    }

    // 2. Raiza the Storm Monarch Spin Target (73125233)
    if (activeChainCards?.includes(73125233)) {
      const oppTargets = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId);

      if (oppTargets.length > 0) {
        oppTargets.sort((a, b) => {
          const atkA = cardReader.getCardDetail(a.s.code)?.atk ?? 0;
          const atkB = cardReader.getCardDetail(b.s.code)?.atk ?? 0;
          return atkB - atkA;
        });
        return [oppTargets[0].idx];
      }
    }

    // 3. Mobius the Frost Monarch Backrow Wipe Target (4929256)
    if (activeChainCards?.includes(4929256)) {
      const oppBackrow = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId && (item.s.location === 8 || item.s.location === 256));

      if (oppBackrow.length > 0) {
        return oppBackrow.slice(0, Math.min(minCount, oppBackrow.length)).map((item) => item.idx);
      }
    }

    return null;
  }
}
