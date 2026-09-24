import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class TrapMonsterExecutor extends DefaultExecutor {
  public override readonly id = 'trap-monster-apophis';
  public override readonly name = 'Trap Monster & Imperial Custom Executor';
  public override readonly description = 'Odion & Apophis trap tactics: Imperial Custom continuous trap invulnerability, Metal Reflect Slime 3000 DEF walls, Tiki Curse combat assassination, and Apophis swarming.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('trap monster') || arch.includes('apophis') || arch.includes('continuous trap');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(28649820) || // Embodiment of Apophis
      cards.includes(26905245) || // Metal Reflect Slime
      cards.includes(9995766) ||  // Imperial Custom
      cards.includes(3129635);    // Tiki Curse
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const hasImperialCustom = (aiField.spellTrapZones || []).some(
      (st) => st && st.code === 9995766 && st.position === 'faceup',
    );

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Imperial Custom (9995766): Activate to make all other face-up Continuous Traps indestructible
      if (code === 9995766) {
        c.score += 5500;
        c.reason = `[IMPERIAL CUSTOM] Activate to protect all Trap Monsters and Continuous Traps from destruction!`;
      }

      // 2. Metal Reflect Slime (26905245): Massive 3000 DEF shield
      else if (code === 26905245) {
        c.score += 4200;
        c.reason = `[METAL REFLECT SLIME] Special Summon impenetrable 3000 DEF battle-immune shield!`;
      }

      // 3. Tiki Curse (3129635): 1800 ATK Trap Monster that destroys monsters battled by Trap Monsters
      else if (code === 3129635) {
        c.score += 3800;
        c.reason = `[TIKI CURSE] Special Summon Tiki Curse (1800 ATK) to grant lethal deathtouch to all Trap Monsters!`;
      }

      // 4. Embodiment of Apophis (28649820)
      else if (code === 28649820) {
        c.score += 3400;
        c.reason = `[EMBODIMENT OF APOPHIS] Special Summon Apophis to establish board presence!`;
      }
    }

    return baseCandidates;
  }
}
