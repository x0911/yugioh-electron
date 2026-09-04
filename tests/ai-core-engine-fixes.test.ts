import test from 'node:test';
import assert from 'node:assert/strict';
import { AIController } from '../src/main/ai/AIController.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { CHARACTER_PERSONALITIES, DEFAULT_PERSONALITY } from '../src/main/ai/strategies/personalityProfiles.js';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { PlayerFieldState, FieldCard, DuelBoardState } from '../src/shared/types/field.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { evaluateSpellTrapSet } from '../src/main/ai/evaluators/spellTrapEvaluator.js';
import { DefaultExecutor } from '../src/main/ai/executors/DefaultExecutor.js';

const cardReader = new CardReaderService();
const aiController = new AIController();
const defaultExecutor = new DefaultExecutor();

function createEmptyPlayerField(playerId: 0 | 1, lp = 8000): PlayerFieldState {
  return {
    playerId,
    name: playerId === 0 ? 'Player' : 'AI',
    currentLp: lp,
    maxLp: 8000,
    isTurn: playerId === 1,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
    deckCount: 35,
    extraDeckCount: 0,
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

function createMockMonster(code: number, name: string, atk: number, def: number, pos: any, seq = 0): FieldCard {
  return {
    code,
    name,
    originalCode: code,
    type: 0x11,
    race: 'Warrior',
    attribute: 'EARTH',
    level: 4,
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
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };
}

function createMockContext(aiPlayerId: 0 | 1 = 1, currentPhase: 'M1' | 'BP' | 'M2' | 'EP' = 'M1'): EvaluatorContext {
  const boardState = createEmptyBoardState();
  boardState.currentPhase = currentPhase;
  return {
    aiPlayerId,
    humanPlayerId: (aiPlayerId === 0 ? 1 : 0) as 0 | 1,
    boardState,
    personality: CHARACTER_PERSONALITIES['seto-kaiba'] || DEFAULT_PERSONALITY,
    cardReader,
    currentPhase,
    currentTurn: 2,
    signatureCardIds: [89631139], // Blue-Eyes White Dragon
    deckArchetype: 'BEATDOWN',
    aiDeckCards: [89631139, 55144522, 12580477],
  };
}

test('1. Discard & Cost Scoring: AI preserves Blue-Eyes White Dragon and Pot of Greed, discarding Sinister Serpent & Treeborn Frog', () => {
  const context = createMockContext(1, 'M1');

  // SELECT_CARD prompt asking to discard 2 cards from AI hand:
  // Candidate 0: Blue-Eyes White Dragon (89631139, 3000 ATK, Signature boss)
  // Candidate 1: Pot of Greed (55144522, Staple Spell)
  // Candidate 2: Sinister Serpent (8124921, 300 ATK, GY recursive)
  // Candidate 3: Treeborn Frog (12538374, 100 ATK, GY recursive)
  // Candidate 4: Elemental HERO Sparkman (20721928, 1600 ATK, vanilla)
  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_CARD,
    player: 1,
    can_cancel: false,
    min: 2,
    max: 2,
    selects: [
      { code: 89631139, controller: 1, location: 2, sequence: 0, position: 2 },
      { code: 55144522, controller: 1, location: 2, sequence: 1, position: 2 },
      { code: 8124921, controller: 1, location: 2, sequence: 2, position: 2 },
      { code: 12538374, controller: 1, location: 2, sequence: 3, position: 2 },
      { code: 20721928, controller: 1, location: 2, sequence: 4, position: 2 },
    ],
  };

  const res = aiController.decideResponse(msg, context);
  assert.equal(res.type, OcgResponseType.SELECT_CARD);
  const selectedIndices = (res as any).indicies;
  assert.equal(selectedIndices.length, 2);

  // Must select Sinister Serpent (index 2) and Treeborn Frog (index 3)
  assert.ok(selectedIndices.includes(2), 'Must discard Sinister Serpent first');
  assert.ok(selectedIndices.includes(3), 'Must discard Treeborn Frog second');
  assert.ok(!selectedIndices.includes(0), 'Must NOT discard Blue-Eyes White Dragon');
  assert.ok(!selectedIndices.includes(1), 'Must NOT discard Pot of Greed');
});

test('2. Turn Action Sequencing: Normal Summon beats TO_BP in MP1 when AI already has a monster on field', () => {
  const context = createMockContext(1, 'M1');
  const { aiField, oppField } = { aiField: context.boardState.opponentField, oppField: context.boardState.userField };

  // AI already controls an 1800 ATK monster
  aiField.monsterZones[0] = createMockMonster(14898066, 'Gene-Warped Warwolf', 2000, 100, 'faceup_attack', 0);
  // Opponent has 1 monster with 1500 ATK
  oppField.monsterZones[0] = createMockMonster(13073850, 'Celtic Guardian', 1400, 1200, 'faceup_attack', 0);

  // SELECT_IDLECMD offers:
  // Summon index 0: Vorse Raider (1900 ATK)
  // to_bp: true
  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 1,
    summons: [{ code: 14898066, sequence: 0 }],
    spells: [],
    monster_sets: [],
    spell_sets: [],
    pos_changes: [],
    activates: [],
    special_summons: [],
    to_bp: true,
    to_ep: true,
  };

  const res = aiController.decideResponse(msg, context);
  assert.equal(res.type, OcgResponseType.SELECT_IDLECMD);
  // Must choose SELECT_SUMMON, not TO_BP!
  assert.equal((res as any).action, SelectIdleCMDAction.SELECT_SUMMON, 'AI must Normal Summon its monster before advancing to Battle Phase');
  assert.equal((res as any).index, 0);
});

test('3. Draw Power Priority: Pot of Greed activates before Normal Summoning', () => {
  const context = createMockContext(1, 'M1');

  // AI hand has Pot of Greed and a monster to summon
  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 1,
    summons: [{ code: 14898066, sequence: 0 }],
    activates: [{ code: 55144522, cardName: 'Pot of Greed', sequence: 1 }],
    spells: [],
    monster_sets: [],
    spell_sets: [],
    pos_changes: [],
    special_summons: [],
    to_bp: true,
    to_ep: true,
  };

  const res = aiController.decideResponse(msg, context);
  assert.equal(res.type, OcgResponseType.SELECT_IDLECMD);
  // Must activate Pot of Greed first
  assert.equal((res as any).action, SelectIdleCMDAction.SELECT_ACTIVATE, 'AI must activate Pot of Greed before Normal Summon');
  assert.equal((res as any).index, 0);
});

test('4. Quick-Play Discipline: Quick-Play Spells are held in hand during MP1, but set in MP2', () => {
  // Test MP1: Book of Moon must NOT be set
  const contextM1 = createMockContext(1, 'M1');
  const mp1Result = evaluateSpellTrapSet(14087893, 'Book of Moon', contextM1);
  assert.ok(mp1Result.score <= -3000, `Book of Moon should be held in hand during MP1 (got ${mp1Result.score})`);
  assert.match(mp1Result.reason, /Keep Quick-Play Spell Book of Moon in hand during MP1/i);

  // Test MP2: Book of Moon and Mirror Force are high priority to set
  const contextM2 = createMockContext(1, 'M2');
  const mp2Result = evaluateSpellTrapSet(14087893, 'Book of Moon', contextM2);
  assert.ok(mp2Result.score >= 2000, `Book of Moon should be set during MP2 for defense (got ${mp2Result.score})`);

  const trapResult = evaluateSpellTrapSet(44095762, 'Mirror Force', contextM2);
  assert.ok(trapResult.score >= 2500, `Mirror Force should be set during MP2 (got ${trapResult.score})`);
});

test('5. Modal Option Selection: Enemy Controller chooses Option 1 (take control) when tribute fodder and opponent boss monster exist', () => {
  const context = createMockContext(1, 'M1');
  const { aiField, oppField } = { aiField: context.boardState.opponentField, oppField: context.boardState.userField };

  // AI has a weak tribute fodder monster (1000 ATK)
  aiField.monsterZones[0] = createMockMonster(23205979, 'Spirit Reaper', 300, 200, 'faceup_attack', 0);
  // Opponent has a 2500 ATK boss monster
  oppField.monsterZones[0] = createMockMonster(46986414, 'Dark Magician', 2500, 2100, 'faceup_attack', 0);

  // Active chain card is Enemy Controller
  context.activeChainCards = [98045062];

  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_OPTION,
    player: 1,
    options: [100, 101],
  };

  const res = aiController.decideResponse(msg, context);
  assert.equal(res.type, OcgResponseType.SELECT_OPTION);
  assert.equal((res as any).index, 1, 'Enemy Controller must pick Option 1 to steal opponent boss monster');
});

test('6. Suicidal Trigger Prevention: AI declines Cyber-Stein when LP is less than 5000', () => {
  const context = createMockContext(1, 'M1');
  const { aiField } = { aiField: context.boardState.opponentField };
  aiField.currentLp = 4000; // Less than 5000 needed for Cyber-Stein

  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_EFFECTYN,
    player: 1,
    code: 10397227, // Cyber-Stein
    description: 0,
  } as any;

  const res = aiController.decideResponse(msg, context);
  assert.equal(res.type, OcgResponseType.SELECT_EFFECTYN);
  assert.equal((res as any).yes, false, 'AI must decline Cyber-Stein when LP is under 5000');
});

test('7. Self-Mill Deck-Out Prevention: AI declines optional mill when deck count <= 3', () => {
  const context = createMockContext(1, 'M1');
  const { aiField } = { aiField: context.boardState.opponentField };
  aiField.deckCount = 2; // Critical deck count

  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_EFFECTYN,
    player: 1,
    code: 81439173, // Foolish Burial
    description: 0,
  } as any;

  const res = aiController.decideResponse(msg, context);
  assert.equal(res.type, OcgResponseType.SELECT_EFFECTYN);
  assert.equal((res as any).yes, false, 'AI must decline optional deck-milling effect when near deck-out');
});
