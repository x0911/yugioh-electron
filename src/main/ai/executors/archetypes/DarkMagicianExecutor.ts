import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class DarkMagicianExecutor extends DefaultExecutor {
  public override readonly id = 'dark-magician';
  public override readonly name = 'Dark Magician Executor';
  public override readonly description = 'Spellcaster control, Dark Magical Circle banishes, and Eternal Soul chains.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('dark magician') || arch.includes('spellcaster');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(46986414) || // Dark Magician
      cards.includes(70791372) || // Magician's Rod
      cards.includes(47222536);    // Dark Magical Circle
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Magician's Rod (Searches Circle / Navigation / Soul)
      if (code === 70791372) {
        c.score += 2600;
        c.reason = `[SPELLCASTER SEARCH] Normal Summon Magician's Rod to search Dark Magician spell/trap`;
      }
      // 2. Dark Magical Circle (Rearrange top 3 + banish on summon)
      else if (code === 47222536) {
        c.score += 2800;
        c.reason = `[DARK MAGICAL CIRCLE] Activate Circle to stack deck and prepare banish effect`;
      }
      // 3. Dark Magic Attack (Harpie's Feather Duster for DM)
      else if (code === 15256925) {
        c.score += 2900;
        c.reason = `[DARK MAGIC ATTACK] Wipe opponent backrow with Dark Magician`;
      }
      // 4. Eye of Timaeus (Fusion into Dark Paladin or Dragon Knight)
      else if (code === 10000000) {
        c.score += 2500;
        c.reason = `[TIMAEUS FUSION] Transform Dark Magician into powerful Fusion Knight`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards, cardReader, humanPlayerId } = context;
    const { aiField } = getAiAndOpponentFields(context);

    // 1. Magician's Rod (70791372) Search:
    // When Normal Summoned: Add 1 Spell/Trap that lists "Dark Magician" from Deck to hand.
    // Priority: Dark Magical Circle (47222536) > Eternal Soul (48680970) > Magician Navigation (7922915)
    if (activeChainCards?.includes(70791372)) {
      const hasCircle = aiField.spellTrapZones.some((s) => s && s.code === 47222536);
      if (!hasCircle) {
        const circleIdx = rawSelects.findIndex((s: any) => s.code === 47222536);
        if (circleIdx >= 0) return [circleIdx];
      }
      const soulIdx = rawSelects.findIndex((s: any) => s.code === 48680970);
      if (soulIdx >= 0) return [soulIdx];
      const navIdx = rawSelects.findIndex((s: any) => s.code === 7922915);
      if (navIdx >= 0) return [navIdx];
    }

    // 2. Dark Magical Circle (47222536) Banish Target:
    // If "Dark Magician" is Normal or Special Summoned to your field: Target 1 card your opponent controls; banish it.
    if (activeChainCards?.includes(47222536)) {
      const oppCards = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId);

      if (oppCards.length > 0) {
        oppCards.sort((a, b) => {
          const detA = cardReader.getCardDetail(a.s.code);
          const detB = cardReader.getCardDetail(b.s.code);
          const atkA = detA?.isMonster ? (detA.atk ?? 0) : 1500;
          const atkB = detB?.isMonster ? (detB.atk ?? 0) : 1500;
          return atkB - atkA;
        });
        return [oppCards[0].idx];
      }
    }

    return null;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];
    const { aiField } = getAiAndOpponentFields(context);
    const hasCircle = aiField.spellTrapZones.some((s) => s && s.code === 47222536);

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Eternal Soul (48680970):
      // Chain to Special Summon Dark Magician from hand or GY (especially when Circle is active to banish!)
      if (code === 48680970) {
        const bonus = hasCircle ? 4500 : 3500;
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: bonus,
          reason: hasCircle
            ? `[ETERNAL SOUL + CIRCLE] Resurrect Dark Magician to trigger Dark Magical Circle banish!`
            : `[ETERNAL SOUL] Special Summon Dark Magician from hand or GY`,
          cardCode: code,
          cardName: 'Eternal Soul',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
