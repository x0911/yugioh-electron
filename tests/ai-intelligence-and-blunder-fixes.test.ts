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
  OcgPosition,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { evaluateSpellActivation } from '../src/main/ai/evaluators/spellTrapEvaluator.js';

const cardReader = new CardReaderService();
const aiController = new AIController();

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

function createEmptyBoardState(turn = 2): DuelBoardState {
  return {
    userField: createEmptyPlayerField(0),
    opponentField: createEmptyPlayerField(1),
    winner: null,
    winReason: null,
    currentPhase: 'M1',
    currentTurn: turn,
    turnPlayer: 1,
  };
}

function createMockMonster(code: number, name: string, atk: number, def: number, pos: any, seq = 0, controller: 0 | 1 = 1): FieldCard {
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
    controller,
    owner: controller,
    description: '',
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };
}

function createMockContext(aiPlayerId: 0 | 1 = 1, currentPhase: 'M1' | 'BP' | 'M2' | 'EP' = 'M1', turn = 2): EvaluatorContext {
  const boardState = createEmptyBoardState(turn);
  boardState.currentPhase = currentPhase;
  return {
    aiPlayerId,
    humanPlayerId: (aiPlayerId === 0 ? 1 : 0) as 0 | 1,
    boardState,
    personality: CHARACTER_PERSONALITIES['seto-kaiba'] || DEFAULT_PERSONALITY,
    cardReader,
    currentPhase,
    currentTurn: turn,
    signatureCardIds: [89631139],
    deckArchetype: 'BEATDOWN',
    aiDeckCards: [],
  };
}

test('1. Attacker Tracking: Kuriboh does not evaluate targets using Blue-Eyes ATK', () => {
  const context = createMockContext(1, 'BP', 2);

  // AI controls Kuriboh (300 ATK) and Blue-Eyes (3000 ATK)
  context.boardState.opponentField.monsterZones[0] = createMockMonster(40640057, 'Kuriboh', 300, 200, 'faceup_attack', 0, 1);
  context.boardState.opponentField.monsterZones[1] = createMockMonster(89631139, 'Blue-Eyes White Dragon', 3000, 2500, 'faceup_attack', 1, 1);

  // Opponent controls a 1500 ATK monster
  context.boardState.userField.monsterZones[0] = createMockMonster(68516705, 'Celtic Guardian', 1500, 1200, 'faceup_attack', 0, 0);

  // Simulate AI actively choosing Kuriboh as the attacker
  aiController.currentBattleAttacker = {
    code: 40640057,
    sequence: 0,
    atk: 300,
  };

  // SELECT_CARD prompt for attack target
  const selectCardMsg: OcgMessage = {
    type: OcgMessageType.SELECT_CARD,
    player: 1,
    min: 1,
    max: 1,
    selects: [
      {
        code: 68516705,
        controller: 0,
        location: 0x4,
        sequence: 0,
        position: 1, // Face-up attack
      },
    ],
  };

  const response = aiController.decideResponse(selectCardMsg, context);
  assert.equal(response.type, OcgResponseType.SELECT_CARD);
  // Reset attacker
  aiController.currentBattleAttacker = null;
});

test('2. Self-Targeting Prevention: AI never targets its own monster when opponent monsters are available', () => {
  const context = createMockContext(1, 'M1', 2);

  // AI controls a 1000 ATK monster
  context.boardState.opponentField.monsterZones[0] = createMockMonster(88819587, 'Baby Dragon', 1200, 700, 'faceup_attack', 0, 1);
  // Opponent controls a facedown monster (properly redacted for anti-cheat)
  context.boardState.userField.monsterZones[0] = {
    code: 0,
    name: 'Facedown Monster',
    originalCode: 0,
    type: 0x11,
    race: '',
    attribute: '',
    level: 0,
    atk: undefined,
    def: undefined,
    baseAtk: undefined,
    baseDef: undefined,
    position: 'facedown_defense',
    location: 'mzone',
    sequence: 0,
    controller: 0,
    owner: 0,
    description: undefined,
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };

  // Removal card (e.g. Tribute to the Doomed or Compulsory Evacuation Device) targets a monster on field:
  // Candidate 0: AI's own Baby Dragon
  // Candidate 1: Opponent's facedown defense monster
  const selectCardMsg: OcgMessage = {
    type: OcgMessageType.SELECT_CARD,
    player: 1,
    min: 1,
    max: 1,
    selects: [
      {
        code: 88819587,
        controller: 1, // AI card
        location: 0x4,
        sequence: 0,
        position: 1,
      },
      {
        code: 0,
        controller: 0, // Opponent card
        location: 0x4,
        sequence: 0,
        position: 8, // Facedown defense
      },
    ],
  };

  const response = aiController.decideResponse(selectCardMsg, context);
  assert.equal(response.type, OcgResponseType.SELECT_CARD);
  const selectedIndices = (response as any).indicies;
  assert.deepEqual(selectedIndices, [1], 'AI MUST target opponent monster (index 1), NEVER its own monster (index 0)');
});

test('3. Flip Monster Setting: AI always Sets Cyber Jar face-down rather than Normal Summoning', () => {
  const context = createMockContext(1, 'M1', 2);

  const idleMsg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 1,
    summons: [
      {
        code: 34124316, // Cyber Jar (Flip effect, 900 ATK / 900 DEF)
      },
    ],
    monster_sets: [
      {
        code: 34124316, // Cyber Jar
      },
    ],
    spells: [],
    spell_sets: [],
    pos_changes: [],
    to_bp: true,
    to_ep: true,
  };

  const response = aiController.decideResponse(idleMsg, context);
  assert.equal(response.type, OcgResponseType.SELECT_IDLECMD);
  assert.equal(
    (response as any).action,
    SelectIdleCMDAction.SELECT_MONSTER_SET,
    'AI MUST Set Cyber Jar face-down, NEVER Normal Summon in Attack position',
  );
});

test('4. Turn 1 Defensive Setting: AI Sets high-DEF walls face-down on Turn 1', () => {
  const context = createMockContext(1, 'M1', 1); // Turn 1

  const idleMsg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 1,
    summons: [
      {
        code: 84327329, // Elemental HERO Clayman (800 ATK, 2000 DEF)
      },
    ],
    monster_sets: [
      {
        code: 84327329, // Elemental HERO Clayman
      },
    ],
    spells: [],
    spell_sets: [],
    pos_changes: [],
    to_ep: true,
  };

  const response = aiController.decideResponse(idleMsg, context);
  assert.equal(response.type, OcgResponseType.SELECT_IDLECMD);
  assert.equal(
    (response as any).action,
    SelectIdleCMDAction.SELECT_MONSTER_SET,
    'AI MUST Set Clayman face-down in defense on Turn 1 rather than summoning in 800 ATK',
  );
});

test('5. Position Selection: AI chooses Defense Position when facing superior opponent monster', () => {
  const context = createMockContext(1, 'M1', 2);
  // Opponent controls Blue-Eyes White Dragon (3000 ATK)
  context.boardState.userField.monsterZones[0] = createMockMonster(89631139, 'Blue-Eyes White Dragon', 3000, 2500, 'faceup_attack', 0, 0);

  // AI is prompted with SELECT_POSITION for a 1400 ATK / 1800 DEF monster
  const selectPosMsg: OcgMessage = {
    type: OcgMessageType.SELECT_POSITION,
    player: 1,
    code: 26378150, // 1400 ATK / 1800 DEF
    positions: OcgPosition.FACEUP_ATTACK | OcgPosition.FACEUP_DEFENSE,
  };

  const response = aiController.decideResponse(selectPosMsg, context);
  assert.equal(response.type, OcgResponseType.SELECT_POSITION);
  assert.equal(
    (response as any).position,
    OcgPosition.FACEUP_DEFENSE,
    'AI MUST choose Defense Position when facing a 3000 ATK boss monster',
  );
});

test('6. Token Tribute Priority: AI prioritizes tokens over real effect monsters for tributes', () => {
  const context = createMockContext(1, 'M1', 2);

  const selectTributeMsg: OcgMessage = {
    type: OcgMessageType.SELECT_TRIBUTE,
    player: 1,
    min: 1,
    max: 1,
    selects: [
      {
        code: 68516705, // Real monster: Celtic Guardian (1500 ATK)
        controller: 1,
        location: 0x4,
        sequence: 0,
        type: 0x11,
        release_param: 1,
      },
      {
        code: 0, // Sheep Token
        controller: 1,
        location: 0x4,
        sequence: 1,
        type: 0x4011, // TYPE_TOKEN
        release_param: 1,
      },
    ],
  };

  const response = aiController.decideResponse(selectTributeMsg, context);
  assert.equal(response.type, OcgResponseType.SELECT_TRIBUTE);
  const indices = (response as any).indicies;
  assert.deepEqual(indices, [1], 'AI MUST sacrifice the token (index 1), preserving the real monster (index 0)');
});

test('7. Chain Context: AI does not chain MST to non-continuous Normal Spells', () => {
  const context = createMockContext(1, 'M1', 2);
  // Opponent activated Dark Hole
  context.activeChainCards = [53129443]; // Dark Hole (Normal Spell)

  // Opponent has a set backrow so oppBackrowCount > 0
  context.boardState.userField.spellTrapZones[0] = {
    code: 0,
    name: 'Set Backrow',
    originalCode: 0,
    type: 0x2,
    position: 'facedown_spell',
    location: 'szone',
    sequence: 0,
    controller: 0,
    owner: 0,
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };

  // Opponent has 0 continuous / field spells
  const evalResult = evaluateSpellActivation(5318639, 'Mystical Space Typhoon', context);
  assert.ok(evalResult.score < 0, `MST should receive negative score when chaining to Dark Hole, got ${evalResult.score}`);
  assert.match(evalResult.reason, /non-continuous spell/);
});
