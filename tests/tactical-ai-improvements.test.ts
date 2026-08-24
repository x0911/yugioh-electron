import assert from 'node:assert/strict';
import { evaluateSpellActivation } from '../src/main/ai/evaluators/spellTrapEvaluator.js';
import { DefaultExecutor } from '../src/main/ai/executors/DefaultExecutor.js';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { BoardState } from '../src/shared/types/field.js';
import { OcgMessageType, SelectIdleCMDAction } from 'ocgcore-wasm';

function createMockContext(overrides?: Partial<EvaluatorContext>): EvaluatorContext {
  const boardState: BoardState = {
    turnNumber: 1,
    currentPhase: 'M1',
    winner: null,
    userField: {
      playerId: 0,
      name: 'AI Player',
      currentLp: 2000,
      maxLp: 8000,
      isTurn: true,
      hand: [
        { id: '1', code: 72892420, name: 'Card Destruction', isRevealed: true },
        { id: '2', code: 83764719, name: 'Monster Reborn', isRevealed: true },
      ],
      monsterZones: [null, null, null, null, null],
      spellTrapZones: [null, null, null, null, null],
      fieldZone: null,
      graveyard: [
        { id: 'g1', code: 10000000, name: 'Obelisk the Tormentor', atk: 4000, def: 4000, level: 10, isRevealed: true },
      ],
      banished: [],
      extraDeckCount: 0,
      deckCount: 35,
    },
    opponentField: {
      playerId: 1,
      name: 'Opponent',
      currentLp: 8000,
      maxLp: 8000,
      isTurn: false,
      hand: [
        { id: 'h1', code: 1, name: 'Card 1', isRevealed: false },
        { id: 'h2', code: 2, name: 'Card 2', isRevealed: false },
        { id: 'h3', code: 3, name: 'Card 3', isRevealed: false },
        { id: 'h4', code: 4, name: 'Card 4', isRevealed: false },
        { id: 'h5', code: 5, name: 'Card 5', isRevealed: false },
      ],
      monsterZones: [null, null, null, null, null],
      spellTrapZones: [null, null, null, null, null],
      fieldZone: null,
      graveyard: [],
      banished: [],
      extraDeckCount: 0,
      deckCount: 35,
    },
  };

  const defaultContext: EvaluatorContext = {
    boardState,
    aiPlayerId: 0,
    currentPhase: 'M1',
    personality: {
      name: 'Yami Yugi',
      aggression: 0.7,
      defensiveness: 0.5,
      comboFocus: 0.8,
      riskTolerance: 0.3,
      bluffFrequency: 0.1,
      cardAdvantageWeight: 1.2,
      signatureFavoritism: 1.0,
      chatFrequency: 0.5,
      tauntFrequency: 0.5,
    },
    cardReader: {
      getCardDetail: (code: number) => {
        if (code === 72892420) return { name: 'Card Destruction', isSpell: true };
        if (code === 83764719) return { name: 'Monster Reborn', isSpell: true };
        if (code === 83555666) return { name: 'Ring of Destruction', isTrap: true };
        if (code === 89631139) return { name: 'Blue-Eyes White Dragon', isMonster: true, atk: 3000, def: 2500, level: 8 };
        if (code === 10000000) return { name: 'Obelisk the Tormentor', isMonster: true, atk: 4000, def: 4000, level: 10 };
        if (code === 36021814) return { name: 'King of the Skull Servants', isMonster: true, atk: 0, def: 0, level: 1 };
        return null;
      },
      getCardName: (code: number) => {
        if (code === 72892420) return 'Card Destruction';
        if (code === 83764719) return 'Monster Reborn';
        if (code === 83555666) return 'Ring of Destruction';
        if (code === 89631139) return 'Blue-Eyes White Dragon';
        if (code === 10000000) return 'Obelisk the Tormentor';
        if (code === 36021814) return 'King of the Skull Servants';
        return 'Card';
      },
    } as any,
    deckArchetype: 'standard',
    signatureCardIds: [10000000],
    aiDeckCards: [],
  };

  return { ...defaultContext, ...overrides };
}

async function runTacticalTests() {
  console.log('=== RUNNING TACTICAL AI IMPROVEMENTS TEST SUITE ===\n');

  // Test 1: Card Destruction on Turn 1
  console.log('▶ Test 1: Card Destruction Restraint on Turn 1');
  const ctxTurn1 = createMockContext();
  const resCdTurn1 = evaluateSpellActivation(72892420, 'Card Destruction', ctxTurn1);
  assert.ok(resCdTurn1.score < 0, 'Card Destruction must be heavily penalized on Turn 1');
  console.log(`  ✓ Card Destruction on Turn 1 score: ${resCdTurn1.score} (${resCdTurn1.reason})\n`);

  // Test 2: Monster Reborn on Egyptian God Card on Turn 1
  console.log('▶ Test 2: Egyptian God Card Revival Restraint on Turn 1');
  const resGodTurn1 = evaluateSpellActivation(83764719, 'Monster Reborn', ctxTurn1);
  assert.ok(resGodTurn1.score < 0, 'Reviving Obelisk on Turn 1 must be penalized (dies at End Phase without attack)');
  console.log(`  ✓ Monster Reborn on God Card Turn 1 score: ${resGodTurn1.score} (${resGodTurn1.reason})\n`);

  // Test 3: Ring of Destruction Suicide Prevention
  console.log('▶ Test 3: Ring of Destruction Suicide Prevention');
  const ctxRingSuicide = createMockContext();
  ctxRingSuicide.boardState.userField.currentLp = 2000; // AI has 2000 LP
  ctxRingSuicide.boardState.opponentField.monsterZones[0] = {
    id: 'opp-m1',
    code: 36021814,
    name: 'King of the Skull Servants',
    atk: 6000,
    def: 0,
    position: 'faceup_attack',
    isRevealed: true,
  };
  const resRingSuicide = evaluateSpellActivation(83555666, 'Ring of Destruction', ctxRingSuicide);
  assert.ok(resRingSuicide.score < -10000, 'Ring of Destruction must NEVER be activated when target ATK >= AI LP');
  console.log(`  ✓ Ring of Destruction Suicide Prevention score: ${resRingSuicide.score} (${resRingSuicide.reason})\n`);

  // Test 4: Ring of Destruction Lethal Finisher
  console.log('▶ Test 4: Ring of Destruction Lethal Finisher');
  const ctxRingLethal = createMockContext();
  ctxRingLethal.boardState.userField.currentLp = 8000; // AI has 8000 LP
  ctxRingLethal.boardState.opponentField.currentLp = 2000; // Opponent has 2000 LP
  ctxRingLethal.boardState.opponentField.monsterZones[0] = {
    id: 'opp-m1',
    code: 89631139,
    name: 'Blue-Eyes White Dragon',
    atk: 3000,
    def: 2500,
    position: 'faceup_attack',
    isRevealed: true,
  };
  const resRingLethal = evaluateSpellActivation(83555666, 'Ring of Destruction', ctxRingLethal);
  assert.ok(resRingLethal.score >= 20000, 'Ring of Destruction must be prioritized when it inflicts lethal burn on opponent and AI survives');
  console.log(`  ✓ Ring of Destruction Lethal Finisher score: ${resRingLethal.score} (${resRingLethal.reason})\n`);

  // Test 5: Dynamic on-field ATK evaluation for King of the Skull Servants
  console.log('▶ Test 5: Dynamic On-Field ATK Evaluation in DefaultExecutor');
  const executor = new DefaultExecutor();
  const ctxStolenKing = createMockContext();
  ctxStolenKing.boardState.turnNumber = 3;
  ctxStolenKing.boardState.userField.monsterZones[0] = {
    id: 'stolen-king',
    code: 36021814,
    name: 'King of the Skull Servants',
    atk: 6000, // Live on-field ATK is 6000!
    def: 0,
    position: 'faceup_attack',
    sequence: 0,
    isRevealed: true,
  };

  const posChangeMsg = {
    type: OcgMessageType.SELECT_IDLECMD,
    pos_changes: [{ code: 36021814, sequence: 0 }],
    to_bp: true,
    to_ep: true,
  } as any;

  const actions = executor.onIdleCmd(posChangeMsg, ctxStolenKing);
  assert.ok(actions, 'Should return actions');

  // Should NOT switch 6000 ATK King of the Skull Servants to Defense
  const posChangeAction = actions.find((a) => a.action.action === SelectIdleCMDAction.SELECT_POS_CHANGE);
  assert.ok(posChangeAction && posChangeAction.score < 0, '6000 ATK King must have negative score for defense switch');

  // Should have high positive score to enter Battle Phase
  const toBpAction = actions.find((a) => a.action.action === SelectIdleCMDAction.TO_BP);
  assert.ok(toBpAction && toBpAction.score > 1500, 'Must enter Battle Phase with 6000 ATK King');
  console.log(`  ✓ Position change score for 6000 ATK King: ${posChangeAction?.score} (${posChangeAction?.reason})`);
  console.log(`  ✓ Battle Phase entry score for 6000 ATK King: ${toBpAction?.score} (${toBpAction?.reason})\n`);

  console.log('🎉 ALL TACTICAL AI IMPROVEMENT TESTS PASSED 100%!');
}

runTacticalTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
