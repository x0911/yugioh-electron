import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';

export class HeroFusionExecutor extends DefaultExecutor {
  public override readonly id = 'hero-fusion';
  public override readonly name = 'Elemental & Destiny HERO Combo Executor';
  public override readonly description = 'Stratos modal branching, Malicious GY lines, Plasma absorption, and aggressive Miracle Fusions.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('hero') ||
      arch.includes('neos') ||
      arch.includes('diamond dude') ||
      arch.includes('destiny');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(40044918) || // Stratos
      cards.includes(45906428) || // Miracle Fusion
      cards.includes(9411399) ||  // Destiny HERO - Malicious
      cards.includes(83965310) || // Destiny HERO - Plasma
      cards.includes(45809008) || // Destiny Draw
      cards.includes(21844576);   // Avian
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);
    const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => !!m);
    const oppFaceUpMonsters = oppMonsters.filter(
      (m) => m.position === 'faceup_attack' || m.position === 'faceup_defense',
    );
    const aiMonsters = aiField.monsterZones.filter((m): m is FieldCard => !!m);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Stratos (Search HERO or wipe backrow)
      if (code === 40044918) {
        c.score += 2800;
        c.reason = `[HERO SEARCH] Normal Summon Stratos to search combo HERO or pop backrow`;
      }
      // 2. Destiny HERO - Malicious (Activate from Graveyard to Special Summon 2nd copy)
      else if (code === 9411399) {
        c.score += 3200;
        c.reason = `[MALICIOUS COMBO] Banish Malicious from GY to Special Summon 2nd Malicious as tribute/fusion fodder`;
      }
      // 3. Destiny HERO - Plasma (Special Summon by tributing 3 monsters)
      else if (code === 83965310) {
        if (aiMonsters.length >= 3) {
          c.score += 3500;
          c.reason = `[PLASMA BOSS SUMMON] Tribute 3 monsters to Special Summon Destiny HERO - Plasma (Skill Drain lock)`;
        } else if (oppFaceUpMonsters.length > 0) {
          // Plasma ignition effect to absorb opponent monster
          c.score += 3000;
          c.reason = `[PLASMA ABSORB] Target and absorb opponent's strongest monster`;
        }
      }
      // 4. Destiny Draw (Draw 2 by discarding Destiny HERO)
      else if (code === 45809008) {
        c.score += 3000;
        c.reason = `[DESTINY DRAW] Cycle Destiny HERO into 2 new cards and setup GY`;
      }
      // 5. Miracle Fusion (Graveyard Fusion boss summon)
      else if (code === 45906428) {
        c.score += 3200;
        c.reason = `[MIRACLE FUSION] Fuse materials from Graveyard into HERO Boss!`;
      }
      // 6. E - Emergency Call / A Hero Lives
      else if (code === 75043725 || code === 18063928) {
        c.score += 2400;
        c.reason = `[HERO EXTENDER] Search / Special Summon Elemental HERO from deck`;
      }
    }

    return baseCandidates;
  }

  public override onSelectOption(msg: OcgMessage, context: EvaluatorContext): number | null {
    const { activeChainCards } = context;
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // Stratos (40044918):
    // Option 0: Destroy Spells/Traps on the field up to the number of other HERO monsters you control.
    // Option 1: Add 1 "HERO" monster from your Deck to your hand.
    const isStratos = activeChainCards?.includes(40044918);
    if (isStratos) {
      const oppBackrow = oppField.spellTrapZones.filter(Boolean);
      const aiHeroes = aiField.monsterZones.filter(
        (m) => m && m.name && (m.name.includes('HERO') || m.name.includes('Hero')),
      );

      // If opponent has dangerous backrow and AI controls at least 2 HEROs, destroy backrow!
      if (oppBackrow.length > 0 && aiHeroes.length >= 2) {
        return 0; // Destroy Spell/Traps
      }
      // Default & primary choice: Add 1 HERO from Deck to Hand
      return 1;
    }

    return null;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;
    const { aiField } = getAiAndOpponentFields(context);

    // 1. Plasma Monster Absorption: Target opponent's face-up monster with highest ATK
    if (activeChainCards?.includes(83965310)) {
      const oppMonsters = rawSelects
        .map((s: any, idx: number) => ({ s, idx }))
        .filter((item) => item.s.controller === context.humanPlayerId);
      if (oppMonsters.length > 0) {
        oppMonsters.sort((a, b) => {
          const atkA = context.cardReader.getCardDetail(a.s.code)?.atk ?? 0;
          const atkB = context.cardReader.getCardDetail(b.s.code)?.atk ?? 0;
          return atkB - atkA;
        });
        return [oppMonsters[0].idx];
      }
    }

    // 2. Destiny Draw Discard: Prioritize discarding Malicious (9411399) or Dasher (8186303)
    if (activeChainCards?.includes(45809008)) {
      const malIdx = rawSelects.findIndex((s: any) => s.code === 9411399);
      if (malIdx >= 0) return [malIdx];
      const dasherIdx = rawSelects.findIndex((s: any) => s.code === 8186303);
      if (dasherIdx >= 0) return [dasherIdx];
    }

    // 3. HERO Searchers (Stratos 40044918, E-Call 75043725, ROTA 32807846):
    // Prioritize: Malicious (if deck has copy and GY has 0) -> Stratos -> Shadow Mist -> Prisma -> Bubbleman
    if (
      activeChainCards?.includes(40044918) ||
      activeChainCards?.includes(75043725) ||
      activeChainCards?.includes(32807846)
    ) {
      const gyHasMalicious = aiField.graveyard.some((c) => c && c.code === 9411399);
      if (!gyHasMalicious) {
        const malIdx = rawSelects.findIndex((s: any) => s.code === 9411399);
        if (malIdx >= 0) return [malIdx];
      }

      const handHasStratos = aiField.hand.some((c) => c === 40044918);
      if (!handHasStratos) {
        const stratosIdx = rawSelects.findIndex((s: any) => s.code === 40044918);
        if (stratosIdx >= 0) return [stratosIdx];
      }

      // Priority list: Shadow Mist, Prisma, Ocean, Bubbleman
      const priorityCodes = [50720316, 89312388, 47594939, 79979666];
      for (const pCode of priorityCodes) {
        const idx = rawSelects.findIndex((s: any) => s.code === pCode);
        if (idx >= 0) return [idx];
      }
    }

    return null;
  }

  public override onSelectTribute(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    const minCount = Math.max(1, msg.min ?? 1);
    if (rawSelects.length < minCount) return null;

    // When tributing (especially for Plasma 83965310):
    // Prioritize tokens, stolen monsters, or Malicious (9411399) over Stratos or beaters
    const scored = rawSelects.map((s: any, index: number) => {
      let score = 0;
      if (s.controller !== context.aiPlayerId) score += 10000; // Stolen monster
      if (s.code === 31305911 || s.code === 23205979) score += 8000; // Token
      if (s.code === 9411399) score += 5000; // Malicious (can activate in GY)
      const detail = context.cardReader.getCardDetail(s.code);
      const atk = detail?.atk ?? 1000;
      score -= atk; // Lower ATK preferred for tribute
      return { index, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, minCount).map((s) => s.index);
  }
}

export { HeroFusionExecutor as HeroComboExecutor };
