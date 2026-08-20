import type { OcgMessage } from 'ocgcore-wasm';
import type { EvaluatorContext, ScoredAction } from '../types.js';

/**
 * Interface for deck-specific strategy executors.
 * Provides custom high-level combo logic, negate priorities, and lethal calculations.
 */
export interface DeckExecutor {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  /**
   * Determines if this executor applies to the given deck / archetype.
   */
  isApplicable(context: EvaluatorContext, deckCards: number[]): boolean;

  /**
   * Called once at the start of the duel to initialize deck-specific combo memory.
   */
  onInit?(context: EvaluatorContext): void;

  /**
   * Evaluates Main Phase 1 / Main Phase 2 actions (Summons, Sets, Spell/Trap activations).
   * Return array of candidate actions with scores, or null to delegate to default evaluator.
   */
  onIdleCmd?(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null;

  /**
   * Evaluates Battle Phase actions (Attacks, Phase changes, Battle Step chains).
   */
  onBattleCmd?(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null;

  /**
   * Evaluates Chain Window opportunities (Counter-traps, Hand traps, Quick effects).
   */
  onSelectChain?(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null;

  /**
   * Selects optimal targets when prompted by SELECT_CARD (Search targets, destruction targets, etc.).
   */
  onSelectCard?(msg: OcgMessage, context: EvaluatorContext): number[] | null;

  /**
   * Selects optimal tribute candidates when performing a Tribute Summon.
   */
  onSelectTribute?(msg: OcgMessage, context: EvaluatorContext): number[] | null;

  /**
   * Decides optional effect triggers (SELECT_EFFECTYN / SELECT_YESNO).
   */
  onSelectYesNo?(msg: OcgMessage, context: EvaluatorContext): boolean | null;

  /**
   * Decides multi-choice effect options (SELECT_OPTION).
   */
  onSelectOption?(msg: OcgMessage, context: EvaluatorContext): number | null;
}
