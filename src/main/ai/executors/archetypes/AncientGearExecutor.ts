import {
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';
import { getAiAndOpponentFields } from '../../types.js';
import type { FieldCard } from '../../../../shared/types/field.js';

export class AncientGearExecutor extends DefaultExecutor {
  public override readonly id = 'ancient-gear';
  public override readonly name = 'Ancient Gear & Machine OTK Executor';
  public override readonly description = 'Geartown destruction triggers, anti-spell/trap battle aggression, and Damage Step Limiter Removal.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('ancient gear') || (arch.includes('machine') && !arch.includes('cyber'));
    const cards = deckCards || [];
    const hasCards =
      cards.includes(83104731) || // Ancient Gear Golem
      cards.includes(44874522) || // Ancient Gear Reactor Dragon
      cards.includes(17663375) || // Ancient Gear Wyvern
      cards.includes(37694547) || // Geartown
      cards.includes(9287078);    // Ancient Gear Castle
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];
    const { aiField, oppField } = getAiAndOpponentFields(context);
    const aiMonsters = aiField.monsterZones.filter((m): m is FieldCard => !!m);

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Ancient Gear Wyvern (Search Geartown / Golem / Reactor Dragon)
      if (code === 17663375) {
        c.score += 3400;
        c.reason = `[ANCIENT GEAR SEARCH] Normal Summon Wyvern to search Geartown or Ancient Gear boss`;
      }
      // 2. Geartown (Field Spell: Reduces tributes by 1, summons on destruction)
      else if (code === 37694547) {
        c.score += 3000;
        c.reason = `[GEARTOWN] Activate Geartown field spell to enable 1-tribute Golem or floating trigger`;
      }
      // 3. Ancient Gear Reactor Dragon / Golem Summons
      else if (code === 44874522 || code === 83104731) {
        c.score += 3500;
        c.reason = `[ANCIENT GEAR BOSS] Summon 3000 ATK piercing boss (shuts down opponent Spells/Traps during battle)`;
      }
      // 4. Limiter Removal (23171610): Strictly suppress in Main Phase
      else if (code === 23171610) {
        c.score -= 3000;
        c.reason = `[HOLD LIMITER REMOVAL] Save Limiter Removal strictly for the Damage Step in Battle Phase!`;
      }
    }

    return baseCandidates;
  }

  public override onSelectYesNo(msg: OcgMessage, context: EvaluatorContext): boolean | null {
    const code = (msg as any).code ?? 0;

    // Geartown (37694547) GY Destruction Trigger:
    // When this card is destroyed and sent to GY: Special Summon 1 "Ancient Gear" monster from hand, Deck, or GY
    if (code === 37694547) {
      return true; // Always float into 3000 ATK Reactor Dragon / Golem!
    }

    return null;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;
    const { aiField } = getAiAndOpponentFields(context);

    // 1. Wyvern Search: Prioritize Geartown (37694547) if not active, else Reactor Dragon (44874522)
    if (activeChainCards?.includes(17663375)) {
      const hasGeartown = (aiField.fieldZone?.code === 37694547);
      if (!hasGeartown) {
        const gtIdx = rawSelects.findIndex((s: any) => s.code === 37694547);
        if (gtIdx >= 0) return [gtIdx];
      }
      const reactorIdx = rawSelects.findIndex((s: any) => s.code === 44874522);
      if (reactorIdx >= 0) return [reactorIdx];
      const golemIdx = rawSelects.findIndex((s: any) => s.code === 83104731);
      if (golemIdx >= 0) return [golemIdx];
    }

    // 2. Geartown Special Summon target from Deck:
    if (activeChainCards?.includes(37694547)) {
      const reactorIdx = rawSelects.findIndex((s: any) => s.code === 44874522);
      if (reactorIdx >= 0) return [reactorIdx];
      const golemIdx = rawSelects.findIndex((s: any) => s.code === 83104731);
      if (golemIdx >= 0) return [golemIdx];
    }

    return null;
  }

  public override onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const rawSelects = msg.selects || [];
    const candidates: ScoredAction[] = [];
    const isBattlePhase =
      context.boardState.currentPhase === 'BP' ||
      context.boardState.currentPhase === 'BATTLE_START' ||
      context.boardState.currentPhase === 'BATTLE_STEP' ||
      context.boardState.currentPhase === 'DAMAGE_STEP';

    for (let i = 0; i < rawSelects.length; i++) {
      const s = rawSelects[i];
      const code = s.code ?? 0;

      // Limiter Removal (23171610): Chain during Battle Phase / Damage Step for doubled ATK burst!
      if (code === 23171610 && isBattlePhase) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4800,
          reason: `[LIMITER REMOVAL OTK] Double ATK of all Machine monsters for lethal battle burst!`,
          cardCode: code,
          cardName: 'Limiter Removal',
        });
      }
    }

    if (candidates.length > 0) {
      return candidates;
    }
    return super.onSelectChain ? super.onSelectChain(msg, context) : null;
  }
}
