import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class YubelSacredBeastExecutor extends DefaultExecutor {
  public override readonly id = 'yubel-sacred-beast';
  public override readonly name = 'Yubel & Sacred Beast Chaos Executor';
  public override readonly description = 'Dark anime boss mechanics: Yubel damage reflection suicide attacks, Terror Incarnate end-phase field wipe, Uria Continuous Trap revival/nuke, and Hamon 4000 ATK lock.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed =
      arch.includes('yubel') ||
      arch.includes('sacred beast') ||
      arch.includes('phantasm') ||
      arch.includes('uria') ||
      arch.includes('hamon') ||
      arch.includes('raviel') ||
      arch.includes('orichalcos') ||
      arch.includes('arcana') ||
      (arch.includes('beast') && !arch.includes('crystal') && !arch.includes('gladiator') && !arch.includes('winged'));
    const cards = deckCards || [];
    const hasCards =
      cards.includes(78371393) || // Yubel
      cards.includes(4779091) ||  // Yubel Terror Incarnate
      cards.includes(6007213) ||  // Uria
      cards.includes(32491822) || // Hamon
      cards.includes(69890967) || // Raviel
      cards.includes(48179391) || // The Seal of Orichalcos
      cards.includes(27134689) || // Master of Oz
      cards.includes(23846921) || // Arcana Force XXI - The World
      cards.includes(8062132);    // Vennominaga
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const continuousTrapsOnField = (aiField.spellTrapZones || []).filter(
      (st) => st && st.position === 'faceup' && st.type?.toLowerCase().includes('trap'),
    );

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Uria, Lord of Searing Flames (6007213): Special summon if 3 Continuous Traps on field
      if (code === 6007213 && continuousTrapsOnField.length >= 3) {
        c.score += 5500;
        c.reason = `[URIA SPECIAL SUMMON] Send 3 Continuous Traps to summon Uria (high ATK + trap immunity)!`;
      }

      // 2. Hamon, Lord of Striking Thunder (32491822)
      else if (code === 32491822) {
        c.score += 5200;
        c.reason = `[HAMON SPECIAL SUMMON] Summon 4000 ATK Lord of Striking Thunder!`;
      }

      // 3. Uria Ignition: Pop opponent set Spell/Trap without response
      else if (code === 6007213 && c.action.type === OcgResponseType.SELECT_IDLECMD) {
        c.score += 4400;
        c.reason = `[URIA POP] Destroy opponent face-down Spell/Trap card!`;
      }

      // 4. Normal Summon Priority:
      // Mystic Tomato (83011278) -> floats into Yubel
      else if (code === 83011278) {
        c.score += 3400;
        c.reason = `[MYSTIC TOMATO SUMMON] Normal summon Tomato to recruit Yubel on battle destruction!`;
      }
      // Yubel tribute summon if 2 monsters available
      else if (code === 78371393) {
        c.score += 3800;
        c.reason = `[YUBEL SUMMON] Summon Yubel for complete battle immunity and damage reflection!`;
      }
    }

    return baseCandidates;
  }

  public override onBattleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onBattleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // Find highest ATK monster opponent controls in Attack Position
    const oppAttackMonsters = (oppField.monsterZones || []).filter(
      (m) => m && m.position === 'faceup_attack' && (m.attack ?? 0) > 0,
    );
    const maxOppAtk = Math.max(0, ...oppAttackMonsters.map((m) => m.attack ?? 0));

    // Yubel (78371393) and Terror Incarnate (4779091) WANT to attack higher ATK monsters!
    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;
      if (code === 78371393 || code === 4779091 || code === 31764700) {
        if (maxOppAtk >= 1500) {
          c.score += 6000;
          c.reason = `[YUBEL DAMAGE REFLECTION] Crash into opponent monster to burn them for ${maxOppAtk} damage!`;
        }
      }
    }

    return baseCandidates;
  }
}
