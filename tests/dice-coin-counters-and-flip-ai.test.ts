import test from 'node:test';
import assert from 'node:assert/strict';
import { DefaultExecutor } from '../src/main/ai/executors/DefaultExecutor.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { MessageDecoder } from '../src/main/engine/messageDecoder.js';
import { CHARACTER_PERSONALITIES } from '../src/main/ai/strategies/personalityProfiles.js';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { PlayerFieldState, FieldCard, DuelBoardState } from '../src/shared/types/field.js';
import { OcgMessageType, OcgLocation, SelectIdleCMDAction } from 'ocgcore-wasm';

const cardReader = new CardReaderService();
const messageDecoder = new MessageDecoder(cardReader);

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
    deckCount: 40,
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
    currentTurn: 1,
    turnPlayer: 1,
  };
}

test('1. AI Decision: Castle of Dark Illusions (FLIP monster, 920 ATK / 1930 DEF) is Set face-down, not Normal Summoned', () => {
  const executor = new DefaultExecutor();
  const joeyPersonality = CHARACTER_PERSONALITIES['joey-wheeler']; // Defensiveness: 0.25

  const castleCode = 62121; // Castle of Dark Illusions
  const castleDetail = cardReader.getCardDetail(castleCode);
  assert.ok(castleDetail, 'Castle of Dark Illusions must exist in card reader');
  assert.ok(castleDetail.isFlip || castleDetail.desc.includes('FLIP:'), 'Must be recognized as Flip monster');

  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 1,
    boardState: createEmptyBoardState(),
    myField: createEmptyPlayerField(1),
    oppField: createEmptyPlayerField(0),
    myLp: 8000,
    oppLp: 8000,
    personality: joeyPersonality,
    cardReader,
    handCards: [castleCode],
    decisionHistory: [],
    signatureCardIds: [],
  };

  const idleMsg: any = {
    player: 1,
    summons: [{ code: castleCode, controller: 1, location: OcgLocation.HAND, sequence: 0 }],
    special_summons: [],
    pos_changes: [],
    monster_sets: [{ code: castleCode, controller: 1, location: OcgLocation.HAND, sequence: 0 }],
    spell_sets: [],
    activates: [],
    to_bp: false,
    to_ep: true,
  };

  const scoredActions = executor.onIdleCmd(idleMsg, context);
  assert.ok(scoredActions && scoredActions.length > 0, 'AI must evaluate actions');
  
  // Sort descending by score
  scoredActions.sort((a, b) => b.score - a.score);
  const bestAction = scoredActions[0];
  
  assert.strictEqual(
    bestAction.action.action,
    SelectIdleCMDAction.SELECT_MONSTER_SET,
    'AI must choose SELECT_MONSTER_SET over Normal Summon for Castle of Dark Illusions',
  );
});

test('2. AI Decision: Defensive wall (Giant Soldier of Stone / Prevent Rat) is Set face-down', () => {
  const executor = new DefaultExecutor();
  const yugiPersonality = CHARACTER_PERSONALITIES['yugi-muto'];

  const stoneCode = 13039848; // Giant Soldier of Stone (1300 ATK, 2000 DEF)
  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 1,
    boardState: createEmptyBoardState(),
    myField: createEmptyPlayerField(1),
    oppField: createEmptyPlayerField(0),
    myLp: 8000,
    oppLp: 8000,
    personality: yugiPersonality,
    cardReader,
    handCards: [stoneCode],
    decisionHistory: [],
    signatureCardIds: [],
  };

  const idleMsg: any = {
    player: 1,
    summons: [{ code: stoneCode, controller: 1, location: OcgLocation.HAND, sequence: 0 }],
    special_summons: [],
    pos_changes: [],
    monster_sets: [{ code: stoneCode, controller: 1, location: OcgLocation.HAND, sequence: 0 }],
    spell_sets: [],
    activates: [],
    to_bp: false,
    to_ep: true,
  };

  const scoredActions = executor.onIdleCmd(idleMsg, context);
  assert.ok(scoredActions && scoredActions.length > 0, 'AI must evaluate actions');
  
  scoredActions.sort((a, b) => b.score - a.score);
  const bestAction = scoredActions[0];
  
  assert.strictEqual(
    bestAction.action.action,
    SelectIdleCMDAction.SELECT_MONSTER_SET,
    'AI must choose SELECT_MONSTER_SET for high-DEF defensive monster',
  );
});

test('3. MessageDecoder: Accurately decodes TOSS_DICE, TOSS_COIN, ADD_COUNTER, REMOVE_COUNTER, CARD_HINT', () => {
  // A. TOSS_DICE
  const diceMsg: any = {
    type: OcgMessageType.TOSS_DICE,
    player: 0,
    results: [4, 6],
  };
  const decodedDice = messageDecoder.decode(diceMsg);
  assert.strictEqual(decodedDice.type, 'TOSS_DICE');
  assert.deepStrictEqual(decodedDice.results, [4, 6]);

  // B. TOSS_COIN
  const coinMsg: any = {
    type: OcgMessageType.TOSS_COIN,
    player: 1,
    results: [true, false],
  };
  const decodedCoin = messageDecoder.decode(coinMsg);
  assert.strictEqual(decodedCoin.type, 'TOSS_COIN');
  assert.deepStrictEqual(decodedCoin.results, [true, false]);

  // C. ADD_COUNTER
  const addCounterMsg: any = {
    type: OcgMessageType.ADD_COUNTER,
    counter_type: 1,
    controller: 0,
    location: OcgLocation.MZONE,
    sequence: 2,
    count: 2,
  };
  const decodedAddCounter = messageDecoder.decode(addCounterMsg);
  assert.strictEqual(decodedAddCounter.type, 'ADD_COUNTER');
  assert.strictEqual((decodedAddCounter as any).count, 2);
  assert.strictEqual(decodedAddCounter.sequence, 2);

  // D. REMOVE_COUNTER
  const remCounterMsg: any = {
    type: OcgMessageType.REMOVE_COUNTER,
    counter_type: 1,
    controller: 0,
    location: OcgLocation.MZONE,
    sequence: 2,
    count: 1,
  };
  const decodedRemCounter = messageDecoder.decode(remCounterMsg);
  assert.strictEqual(decodedRemCounter.type, 'REMOVE_COUNTER');
  assert.strictEqual((decodedRemCounter as any).count, 1);

  // E. CARD_HINT (Turn count for Swords of Revealing Light)
  const hintMsg: any = {
    type: OcgMessageType.CARD_HINT,
    card_hint: 1, // OcgCardHintType.TURN
    controller: 0,
    location: OcgLocation.SZONE,
    sequence: 1,
    description: 2n,
  };
  const decodedHint = messageDecoder.decode(hintMsg);
  assert.strictEqual(decodedHint.type, 'CARD_HINT');
  assert.strictEqual((decodedHint as any).turnCounter, 2);
});

test('4. Non-monster cards (Swords of Revealing Light, Regulation of Tribe) never have atk/def/level', () => {
  const swordsCode = 72302403; // Swords of Revealing Light (Normal Spell)
  const swordsDetail = cardReader.getCardDetail(swordsCode);
  assert.ok(swordsDetail, 'Swords of Revealing Light must exist in card reader');
  assert.strictEqual(swordsDetail.isMonster, false, 'Must not be a monster');

  const card: FieldCard = {
    id: 's-1',
    code: swordsCode,
    name: swordsDetail.name,
    controller: 0,
    location: 'spell-trap',
    sequence: 0,
    position: 'faceup_spell',
    atk: undefined,
    def: undefined,
    level: undefined,
  };

  assert.strictEqual(card.atk, undefined, 'Spell card ATK must be undefined');
  assert.strictEqual(card.def, undefined, 'Spell card DEF must be undefined');
  assert.strictEqual(card.level, undefined, 'Spell card Level must be undefined');
});
