import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { DefaultExecutor } from '../DefaultExecutor.js';
import type { EvaluatorContext, ScoredAction } from '../../types.js';

export class CyberDragonExecutor extends DefaultExecutor {
  public override readonly id = 'cyber-dragon';
  public override readonly name = 'Cyber Dragon OTK Executor';
  public override readonly description = 'High-velocity Power Bond fusion lines and lethal machine beatdown.';

  public override isApplicable(context: EvaluatorContext, deckCards: number[] = []): boolean {
    const arch = (context.deckArchetype || '').toLowerCase();
    const isNamed = arch.includes('cyber') || arch.includes('machine');
    const cards = deckCards || [];
    const hasCards =
      cards.includes(70095154) || // Cyber Dragon
      cards.includes(23893227) || // Cyber Dragon Core
      cards.includes(37630732);    // Power Bond
    return isNamed || hasCards;
  }

  public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const baseCandidates = super.onIdleCmd(msg, context) || [];

    for (const c of baseCandidates) {
      const code = c.cardCode ?? 0;

      // 1. Cyber Dragon Core (Searches Cyber Emergency or Power Bond)
      if (code === 23893227) {
        c.score += 2600;
        c.reason = `[CYBER CORE] Normal Summon Cyber Dragon Core to search Cyber spell/trap`;
      }
      // 2. Power Bond (Summon Cyber Twin Dragon 5600 ATK x 2 attacks)
      else if (code === 37630732) {
        c.score += 3500;
        c.reason = `[POWER BOND OTK] Fuse machines with doubled ATK for lethal burst!`;
      }
      // 3. Overload Fusion / Cyberload Fusion
      else if (code === 3659803 || code === 70095154) {
        c.score += 2800;
        c.reason = `[CYBER FUSION] Special Summon Chimeratech / Cyber Dragon fusion boss`;
      }
      // 4. Cyber Emergency / Cyber Repair Plant
      else if (code === 60312991 || code === 77603950) {
        c.score += 2200;
        c.reason = `[CYBER SEARCH] Search Cyber Dragon monster from deck`;
      }
    }

    return baseCandidates;
  }

  public override onSelectCard(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    const rawSelects = msg.selects || [];
    if (rawSelects.length === 0) return null;

    const { activeChainCards } = context;
    const { aiField } = getAiAndOpponentFields(context);

    // Cyber Dragon Core (23893227) Search:
    // When Normal Summoned: Add 1 "Cyber" Spell/Trap from Deck to hand.
    // Priority: Power Bond (37630732) > Cyber Emergency (60312991) > Cyber Repair Plant (77603950)
    if (activeChainCards?.includes(23893227)) {
      const hasPowerBond = aiField.hand.some((c) => c === 37630732);
      if (!hasPowerBond) {
        const pbIdx = rawSelects.findIndex((s: any) => s.code === 37630732);
        if (pbIdx >= 0) return [pbIdx];
      }
      const emergencyIdx = rawSelects.findIndex((s: any) => s.code === 60312991);
      if (emergencyIdx >= 0) return [emergencyIdx];
      const plantIdx = rawSelects.findIndex((s: any) => s.code === 77603950);
      if (plantIdx >= 0) return [plantIdx];
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

      // Limiter Removal (23171610): Chain in Battle Phase for Machine OTK!
      if (code === 23171610 && isBattlePhase) {
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_CHAIN,
            index: i,
          },
          score: 4800,
          reason: `[CYBER LIMITER REMOVAL] Double Machine ATK during battle for lethal damage!`,
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
