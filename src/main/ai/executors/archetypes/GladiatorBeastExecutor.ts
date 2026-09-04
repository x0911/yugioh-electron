import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';

export class GladiatorBeastExecutor extends DefaultExecutor {
  public override readonly id = 'gladiator-beast';
  public override readonly name = 'Gladiator Beast Tag-Out & Contact Fusion Executor';
  public override readonly description = 'End of Battle Phase tag-outs, Bestiari/Murmillo removal, Gyzarus multi-pops, and War Chariot negates.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('gladiator') || arch.includes('gladiator beast');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(48156348) || // Gyzarus
      cards.includes(41470137) || // Bestiari
      cards.includes(78868776) || // Laquari
      cards.includes(96216229) || // War Chariot
      cards.includes(5975022);    // Murmillo
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);
    const aiMonsters = aiField.monsterZones.filter((m): m is FieldCard => !!m);
    const hasBestiari = aiMonsters.some((m) => m.code === 41470137);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Gyzarus Contact Fusion (Shuffle Bestiari + 1 GB into deck to Special Summon Gyzarus)
      if (code === 48156348) {
        c.score += 3800;
        c.reason = `[GYZARUS CONTACT FUSION] Return Bestiari and 1 GB to deck to summon Gyzarus and destroy 2 cards!`;
      }
      // 2. Gladiator Proving Ground (Search Gladiator Beast)
      else if (code === 35224440) {
        c.score += 3200;
        c.reason = `[GLADIATOR SEARCH] Activate Proving Ground to fetch combo piece`;
      }
      // 3. Bestiari / Laquari Summons
      else if (code === 41470137 || code === 78868776) {
        c.score += 2600;
        c.reason = `[GLADIATOR SUMMON] Summon ${c.cardName} to establish combat pressure`;
      }
    }

    return baseCandidates;
  }

  public override onSelectYesNo(msg: OcgMessage, context: EvaluatorContext): boolean | null {
    const code = (msg as any).code ?? 0;
    const gbCodes = [41470137, 78868776, 5975022, 25924653, 57731460, 48156348];

    // Tag-out at End of Battle Phase
    if (gbCodes.includes(code)) {
      return true; // Always tag-out to fetch removal / revival
    }

    return null;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards, cardReader, humanPlayerId } = context;
    const { oppField, aiField } = getAiAndOpponentFields(context);
    const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => !!m);
    const oppBackrow = oppField.spellTrapZones.filter(Boolean);

    // 1. Gyzarus Target Selection: Destroy up to 2 cards on the field (48156348)
    if (activeChainCards?.includes(48156348)) {
      const oppCards = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId);

      if (oppCards.length > 0) {
        // Pick up to 2 highest value opponent cards (monsters first, then backrow)
        oppCards.sort((a, b) => {
          const detA = cardReader.getCardDetail(a.s.code);
          const detB = cardReader.getCardDetail(b.s.code);
          const atkA = detA?.isMonster ? (detA.atk ?? 0) : 1200;
          const atkB = detB?.isMonster ? (detB.atk ?? 0) : 1200;
          return atkB - atkA;
        });
        const maxPick = Math.min(msg.max ?? 2, oppCards.length);
        return oppCards.slice(0, maxPick).map((item) => item.idx);
      }
    }

    // 2. Murmillo Target Selection: Destroy 1 face-up monster (5975022)
    if (activeChainCards?.includes(5975022)) {
      const oppMonstersInSelect = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId);

      if (oppMonstersInSelect.length > 0) {
        oppMonstersInSelect.sort((a, b) => {
          const atkA = cardReader.getCardDetail(a.s.code)?.atk ?? 0;
          const atkB = cardReader.getCardDetail(b.s.code)?.atk ?? 0;
          return atkB - atkA;
        });
        return [oppMonstersInSelect[0].idx];
      }
    }

    // 3. Bestiari Target Selection: Destroy 1 Spell/Trap (41470137)
    if (activeChainCards?.includes(41470137)) {
      const oppBackrowInSelect = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId && (item.s.location === 8 || item.s.location === 256));

      if (oppBackrowInSelect.length > 0) {
        return [oppBackrowInSelect[0].idx];
      }
    }

    // 4. Tag-in selection from Deck (Select which GB to Special Summon)
    // Priority:
    // - If opponent has backrow: Bestiari (41470137)
    // - If opponent has monster: Murmillo (5975022)
    // - If GY has GB monster: Darius (25924653)
    // - If GY has War Chariot: Equeste (57731460)
    // - Else: Laquari (78868776)
    if (oppBackrow.length > 0) {
      const bestiariIdx = rawSelects.findIndex((s: any) => s.code === 41470137);
      if (bestiariIdx >= 0) return [bestiariIdx];
    }
    if (oppMonsters.length > 0) {
      const murmilloIdx = rawSelects.findIndex((s: any) => s.code === 5975022);
      if (murmilloIdx >= 0) return [murmilloIdx];
    }
    const gyHasGb = aiField.graveyard.some((c) => c && (c.name?.includes('Gladiator Beast') || c.name?.includes('Bestiari')));
    if (gyHasGb) {
      const dariusIdx = rawSelects.findIndex((s: any) => s.code === 25924653);
      if (dariusIdx >= 0) return [dariusIdx];
    }
    const gyHasChariot = aiField.graveyard.some((c) => c && c.code === 96216229);
    if (gyHasChariot) {
      const equesteIdx = rawSelects.findIndex((s: any) => s.code === 57731460);
      if (equesteIdx >= 0) return [equesteIdx];
    }
    const laquariIdx = rawSelects.findIndex((s: any) => s.code === 78868776);
    if (laquariIdx >= 0) return [laquariIdx];

    return null;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Gladiator Beast War Chariot (96216229)
      // When a monster effect is activated while you control a face-up "Gladiator Beast" monster: Negate & destroy!
      if (code === 96216229) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4500,
          reason: `[WAR CHARIOT] Negate and destroy opponent monster effect activation!`,
          cardCode: code,
          cardName: 'Gladiator Beast War Chariot',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
