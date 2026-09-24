import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';

export class TimelordExecutor extends DefaultExecutor {
  public override readonly id = 'timelord-celestial';
  public override readonly name = 'Timelord Celestial Judgment Executor';
  public override readonly description = 'Zone\'s apocalyptic judgment: 0-tribute normal summons, battle/effect invulnerability, LP halving, and devastating direct burn.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('timelord');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(33015627) || // Sandaion
      (cards.length > 0 && arch.includes('timelord'));
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField } = getAiAndOpponentFields(context);

    const monstersOnField = (aiField.monsterZones || []).filter(Boolean);

    for (const c of baseCandidates) {
      const name = context.cardReader?.getCardName(c.cardCode ?? 0) || '';

      // Timelords can be Normal Summoned without tribute if you control no monsters!
      if (name.toLowerCase().includes('timelord') && monstersOnField.length === 0) {
        c.score += 5500;
        c.reason = `[TIMELORD DESCENT] Normal Summon Timelord with 0 tributes for invincible board presence!`;
      }
    }

    return baseCandidates;
  }
}
