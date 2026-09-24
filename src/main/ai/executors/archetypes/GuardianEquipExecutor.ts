import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class GuardianEquipExecutor extends DefaultExecutor {
  public override readonly id = 'guardian-equip-arsenal';
  public override readonly name = 'Guardian & Equip Arsenal OTK Executor';
  public override readonly description = 'Rafael & Ben Kei equip strategies: Guardian Eatos free 2500 ATK special summon, Armed Samurai Ben Kei multi-attack OTK, and massive ATK equip boosts.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('guardian') || arch.includes('equip') || arch.includes('ben kei') || arch.includes('otk');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(34022290) || // Guardian Eatos
      cards.includes(18175965) || // Guardian Dreadscythe
      cards.includes(84430950) || // Armed Samurai - Ben Kei
      cards.includes(83746708) || // Mage Power
      cards.includes(56747793) || // United We Stand
      cards.includes(22046459) || // Megamorph
      cards.includes(69015963);   // Cyber-Stein
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const monstersOnField = (aiField.monsterZones || []).filter(Boolean);
    const gyMonsters = (aiField.graveyard || []).filter((c) => c && c.code > 0);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Guardian Eatos (34022290): Free special summon if no monsters in GY!
      if (code === 34022290 && gyMonsters.length === 0) {
        c.score += 6000;
        c.reason = `[GUARDIAN EATOS SPECIAL] Free summon 2500 ATK Guardian of Sacred Light!`;
      }

      // 2. Armed Samurai - Ben Kei (84430950): Normal summon priority when holding equip spells!
      else if (code === 84430950) {
        c.score += 4800;
        c.reason = `[BEN KEI SUMMON] Normal summon Ben Kei to stack Equip Spells for multi-attack OTK!`;
      }

      // 3. Equip Spells (Mage Power 83746708, United We Stand 56747793): Stack on active attacker!
      else if ((code === 83746708 || code === 56747793) && monstersOnField.length > 0) {
        c.score += 4500;
        c.reason = `[EQUIP ATK BURST] Equip massive ATK multiplier to active attacker!`;
      }
    }

    return baseCandidates;
  }
}
