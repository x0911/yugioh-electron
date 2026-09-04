import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';

export class ChaosDadExecutor extends DefaultExecutor {
  public override readonly id = 'chaos-dad';
  public override readonly name = 'Chaos & Dark Armed Dragon (DAD) Executor';
  public override readonly description = 'Exact 3 DARK GY count tracking, DAD multi-card destruction, and Chaos banish lines.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('dad') ||
      arch.includes('chaos') ||
      arch.includes('dark armed');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(65192027) || // Dark Armed Dragon
      cards.includes(9596126) ||  // Chaos Sorcerer
      cards.includes(72989439);   // Black Luster Soldier - Envoy of the Beginning
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);
    const oppCards = [
      ...oppField.monsterZones.filter(Boolean),
      ...oppField.spellTrapZones.filter(Boolean),
    ];
    const oppFaceUpMonsters = oppField.monsterZones.filter(
      (m): m is FieldCard => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense'),
    );

    // Count DARK and LIGHT monsters in AI GY
    const gyDarkCount = aiField.graveyard.filter((c) => {
      if (!c) return false;
      const det = context.cardReader.getCardDetail(c.code);
      return (
        (det?.isMonster ?? true) &&
        (det?.attribute === 0x20 || det?.attributeName === 'DARK' || c.attribute === 'DARK')
      );
    }).length;

    const gyLightCount = aiField.graveyard.filter((c) => {
      if (!c) return false;
      const det = context.cardReader.getCardDetail(c.code);
      return (
        (det?.isMonster ?? true) &&
        (det?.attribute === 0x10 || det?.attributeName === 'LIGHT' || c.attribute === 'LIGHT')
      );
    }).length;

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Dark Armed Dragon (65192027)
      if (code === 65192027) {
        if (gyDarkCount === 3) {
          c.score += 4800;
          c.reason = `[DARK ARMED DRAGON] Special Summon 2800 ATK DAD (exactly 3 DARKs in GY)!`;
        } else if (gyDarkCount >= 1 && oppCards.length > 0) {
          // Ignition effect to banish 1 DARK and destroy 1 card
          c.score += 4500;
          c.reason = `[DAD DESTRUCTION] Banish 1 DARK from GY to destroy opponent's card!`;
        }
      }
      // 2. Black Luster Soldier - Envoy of the Beginning (72989439)
      else if (code === 72989439) {
        if (gyLightCount >= 1 && gyDarkCount >= 1) {
          c.score += 4600;
          c.reason = `[BLS SUMMON] Banish 1 LIGHT and 1 DARK from GY to Special Summon 3000 ATK BLS!`;
        } else if (oppFaceUpMonsters.length > 0) {
          // Ignition effect to banish 1 face-up monster
          c.score += 4200;
          c.reason = `[BLS BANISH] Target and banish opponent's face-up monster`;
        }
      }
      // 3. Chaos Sorcerer (9596126)
      else if (code === 9596126) {
        if (gyLightCount >= 1 && gyDarkCount >= 1) {
          c.score += 3800;
          c.reason = `[CHAOS SORCERER SUMMON] Banish 1 LIGHT and 1 DARK from GY to summon Chaos Sorcerer`;
        } else if (oppFaceUpMonsters.length > 0) {
          c.score += 3600;
          c.reason = `[CHAOS BANISH] Target and banish opponent's face-up monster`;
        }
      }
      // 4. Allure of Darkness (1475311)
      else if (code === 1475311) {
        c.score += 3500;
        c.reason = `[ALLURE DRAW] Draw 2 cards, banish 1 DARK monster from hand`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards, cardReader, humanPlayerId } = context;

    // 1. DAD Destruction Target (65192027):
    if (activeChainCards?.includes(65192027)) {
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

    // 2. BLS (72989439) or Chaos Sorcerer (9596126) Banish Target:
    if (activeChainCards?.includes(72989439) || activeChainCards?.includes(9596126)) {
      const oppMonsters = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === humanPlayerId);

      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => {
          const atkA = cardReader.getCardDetail(a.s.code)?.atk ?? 0;
          const atkB = cardReader.getCardDetail(b.s.code)?.atk ?? 0;
          return atkB - atkA;
        });
        return [oppMonsters[0].idx];
      }
    }

    return null;
  }
}
