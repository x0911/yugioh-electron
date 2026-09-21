import test from 'node:test';
import assert from 'node:assert/strict';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { CHARACTER_PERSONALITIES } from '../src/main/ai/strategies/personalityProfiles.js';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { PlayerFieldState, FieldCard, DuelBoardState } from '../src/shared/types/field.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import {
  evaluateSpellActivation,
  evaluateBoardDominance,
} from '../src/main/ai/evaluators/spellTrapEvaluator.js';
import { DefaultExecutor } from '../src/main/ai/executors/DefaultExecutor.js';
import { AIController } from '../src/main/ai/AIController.js';

const cardReader = new CardReaderService();
const defaultExecutor = new DefaultExecutor();

function createEmptyPlayerField(playerId: 0 | 1, lp = 8000): PlayerFieldState {
  return {
    playerId,
    name: playerId === 0 ? 'Player' : 'Aster Phoenix',
    currentLp: lp,
    maxLp: 8000,
    isTurn: playerId === 1,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
    deckCount: 30,
    extraDeckCount: 15,
    hand: [],
  };
}

function createEmptyBoardState(): DuelBoardState {
  return {
    userField: createEmptyPlayerField(0),
    opponentField: createEmptyPlayerField(1),
    winner: null,
    winReason: null,
    currentPhase: 'M1',
    currentTurn: 2,
    turnPlayer: 1,
  };
}

function createMonsterCard(code: number, name: string, atk: number, def: number, pos: any, seq = 0): FieldCard {
  return {
    code,
    name,
    originalCode: code,
    type: 0x11,
    race: 'Warrior',
    attribute: 'DARK',
    level: 6,
    atk,
    def,
    baseAtk: atk,
    baseDef: def,
    position: pos,
    location: 'mzone',
    sequence: seq,
    controller: 1,
    owner: 1,
    description: '',
    canAttack: true,
  };
}

test('Lethal & Dominance Gatekeeper - Aster Phoenix Board Dominance Vetoes Card Destruction', () => {
  const boardState = createEmptyBoardState();
  boardState.currentPhase = 'M1';
  boardState.currentTurn = 2;

  // AI controls Aster's board: 2x Dark Armed Dragon (2800) + Destiny HERO - Dasher (2100) = 7700 ATK
  boardState.opponentField.monsterZones[0] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 0);
  boardState.opponentField.monsterZones[1] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 1);
  boardState.opponentField.monsterZones[2] = createMonsterCard(81056507, 'Destiny HERO - Dasher', 2100, 1000, 'faceup_attack', 2);

  // Player has empty field and 8000 LP
  boardState.userField.currentLp = 8000;
  boardState.userField.monsterZones = [null, null, null, null, null];
  boardState.userField.hand = [
    { code: 1, name: 'Exodia', location: 'hand' } as any,
    { code: 2, name: 'Graceful Charity', location: 'hand' } as any,
  ];

  // AI has 4 cards in hand including Card Destruction
  boardState.opponentField.hand = [
    { code: 72892473, name: 'Card Destruction', location: 'hand' } as any,
    { code: 10, name: 'Destiny Draw', location: 'hand' } as any,
    { code: 11, name: 'Malicious', location: 'hand' } as any,
    { code: 12, name: 'Plasma', location: 'hand' } as any,
  ];

  const personality = {
    ...CHARACTER_PERSONALITIES['aster-phoenix'],
    name: 'Aster Phoenix',
  };

  const context: EvaluatorContext = {
    boardState,
    aiPlayerId: 1,
    personality,
    cardReader,
    signatureCardIds: [],
    aiDeckCards: [],
    currentPhase: 'M1',
    currentTurn: 2,
  };

  const dominance = evaluateBoardDominance(context);
  assert.equal(dominance.isDominating, true, 'AI should be detected as dominating the board');
  assert.equal(dominance.aiTotalAtk, 7700);

  // Evaluate Card Destruction (ID 72892473 and legacy 72892420)
  const evalResult73 = evaluateSpellActivation(72892473, 'Card Destruction', context);
  assert.ok(evalResult73.score <= -10000, `Expected severe veto score <= -10000, got ${evalResult73.score}`);
  assert.ok(evalResult73.reason.includes('DOMINANCE VETO'), `Expected DOMINANCE VETO reason, got: ${evalResult73.reason}`);

  const evalResult20 = evaluateSpellActivation(72892420, 'Card Destruction', context);
  assert.ok(evalResult20.score <= -10000, `Expected legacy ID veto score <= -10000, got ${evalResult20.score}`);

  // Evaluate Hand Destruction & Morphing Jar
  const handDestructionEval = evaluateSpellActivation(74519184, 'Hand Destruction', context);
  assert.ok(handDestructionEval.score <= -10000, `Expected Hand Destruction veto score <= -10000, got ${handDestructionEval.score}`);

  const morphingJarEval = evaluateSpellActivation(33508719, 'Morphing Jar', context);
  assert.ok(morphingJarEval.score <= -10000, `Expected Morphing Jar veto score <= -10000, got ${morphingJarEval.score}`);
});

test('Lethal & Dominance Gatekeeper - Main Phase 2 Veto prevents throwing right before opponent turn', () => {
  const boardState = createEmptyBoardState();
  boardState.currentPhase = 'M2';
  boardState.currentTurn = 2;

  // AI has a solid board (1x 2400 ATK monster)
  boardState.opponentField.monsterZones[0] = createMonsterCard(12345, 'Monarch', 2400, 1000, 'faceup_attack', 0);
  boardState.opponentField.hand = [
    { code: 72892473, name: 'Card Destruction', location: 'hand' } as any,
    { code: 11, name: 'Card B', location: 'hand' } as any,
    { code: 12, name: 'Card C', location: 'hand' } as any,
  ];
  boardState.userField.hand = [
    { code: 1, name: 'Card 1', location: 'hand' } as any,
  ];

  const context: EvaluatorContext = {
    boardState,
    aiPlayerId: 1,
    personality: CHARACTER_PERSONALITIES['aster-phoenix'],
    cardReader,
    signatureCardIds: [],
    aiDeckCards: [],
    currentPhase: 'M2',
    currentTurn: 2,
  };

  const evalResult = evaluateSpellActivation(72892473, 'Card Destruction', context);
  assert.ok(evalResult.score <= -10000, `Expected MP2 veto score <= -10000, got ${evalResult.score}`);
  assert.ok(evalResult.reason.includes('MP2 VETO') || evalResult.reason.includes('DOMINANCE VETO'), `Expected MP2 or DOMINANCE VETO, got: ${evalResult.reason}`);
});

test('Lethal & Dominance Gatekeeper - On-Board Lethal triggers LETHAL RUSH in DefaultExecutor', () => {
  const boardState = createEmptyBoardState();
  boardState.currentPhase = 'M1';
  boardState.currentTurn = 2;

  // AI controls 7700 ATK
  boardState.opponentField.monsterZones[0] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 0);
  boardState.opponentField.monsterZones[1] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 1);
  boardState.opponentField.monsterZones[2] = createMonsterCard(81056507, 'Destiny HERO - Dasher', 2100, 1000, 'faceup_attack', 2);

  // Player has 7000 LP and no monsters (direct lethal!)
  boardState.userField.currentLp = 7000;
  boardState.userField.monsterZones = [null, null, null, null, null];

  const context: EvaluatorContext = {
    boardState,
    aiPlayerId: 1,
    personality: CHARACTER_PERSONALITIES['aster-phoenix'],
    cardReader,
    signatureCardIds: [],
    aiDeckCards: [],
    currentPhase: 'M1',
    currentTurn: 2,
  };

  const idleMsg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    to_bp: true,
    to_ep: true,
    activates: [
      { code: 72892473, name: 'Card Destruction' } as any,
    ],
  };

  const candidates = defaultExecutor.onIdleCmd(idleMsg, context);
  assert.ok(candidates, 'Candidates should not be null');

  const bpCandidate = candidates.find((c) => c.action?.action === SelectIdleCMDAction.TO_BP);
  assert.ok(bpCandidate, 'TO_BP candidate should be present');
  assert.equal(bpCandidate.score, 25000, 'Lethal rush TO_BP score should be 25000');
  assert.ok(bpCandidate.reason?.includes('LETHAL RUSH'), `Reason should include LETHAL RUSH, got: ${bpCandidate.reason}`);

  const cardDestructionCandidate = candidates.find((c) => c.action?.action === SelectIdleCMDAction.SELECT_ACTIVATE);
  assert.ok(cardDestructionCandidate, 'Card Destruction candidate should exist');
  assert.ok(cardDestructionCandidate.score <= -10000, 'Card Destruction should be strongly vetoed');
});

test('Lethal & Dominance Gatekeeper - Main Phase 2 Discipline Pass when Dominating', () => {
  const boardState = createEmptyBoardState();
  boardState.currentPhase = 'M2';
  boardState.currentTurn = 2;

  // AI controls dominant field (5600 ATK) vs empty field
  boardState.opponentField.monsterZones[0] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 0);
  boardState.opponentField.monsterZones[1] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 1);
  boardState.userField.monsterZones = [null, null, null, null, null];

  const context: EvaluatorContext = {
    boardState,
    aiPlayerId: 1,
    personality: CHARACTER_PERSONALITIES['aster-phoenix'],
    cardReader,
    signatureCardIds: [],
    aiDeckCards: [],
    currentPhase: 'M2',
    currentTurn: 2,
  };

  const idleMsg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    to_ep: true,
    activates: [],
  };

  const candidates = defaultExecutor.onIdleCmd(idleMsg, context);
  assert.ok(candidates, 'Candidates should not be null');

  const epCandidate = candidates.find((c) => c.action?.action === SelectIdleCMDAction.TO_EP);
  assert.ok(epCandidate, 'TO_EP candidate should be present');
  assert.equal(epCandidate.score, 1500, 'DISCIPLINE PASS score should be 1500');
  assert.ok(epCandidate.reason?.includes('DISCIPLINE PASS'), `Reason should include DISCIPLINE PASS, got: ${epCandidate.reason}`);
});

test('Lethal & Dominance Gatekeeper - AIController decides TO_BP for lethal on board', () => {
  const aiController = new AIController();
  const boardState = createEmptyBoardState();
  boardState.currentPhase = 'M1';
  boardState.currentTurn = 2;

  // AI controls 7700 ATK
  boardState.opponentField.monsterZones[0] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 0);
  boardState.opponentField.monsterZones[1] = createMonsterCard(67723438, 'Dark Armed Dragon', 2800, 1000, 'faceup_attack', 1);
  boardState.opponentField.monsterZones[2] = createMonsterCard(81056507, 'Destiny HERO - Dasher', 2100, 1000, 'faceup_attack', 2);

  // Player has 6000 LP and no monsters
  boardState.userField.currentLp = 6000;
  boardState.userField.monsterZones = [null, null, null, null, null];

  const context: EvaluatorContext = {
    boardState,
    aiPlayerId: 1,
    personality: CHARACTER_PERSONALITIES['aster-phoenix'],
    cardReader,
    signatureCardIds: [],
    aiDeckCards: [],
    currentPhase: 'M1',
    currentTurn: 2,
  };

  const idleMsg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    to_bp: true,
    to_ep: true,
    activates: [
      { code: 72892473, name: 'Card Destruction' } as any,
    ],
  };

  const response = aiController.decideResponse(idleMsg, context);
  assert.equal(response.type, OcgResponseType.SELECT_IDLECMD);
  assert.equal((response as any).action, SelectIdleCMDAction.TO_BP, 'AI should choose TO_BP over Card Destruction');
});
