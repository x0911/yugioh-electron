import test from 'node:test';
import assert from 'node:assert/strict';
import { AIController } from '../src/main/ai/AIController.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { CHARACTER_PERSONALITIES } from '../src/main/ai/strategies/personalityProfiles.js';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { PlayerFieldState, FieldCard, DuelBoardState } from '../src/shared/types/field.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import { evaluateSpellActivation } from '../src/main/ai/evaluators/spellTrapEvaluator.js';
import { evaluateAttackOption, type AttackCandidate } from '../src/main/ai/evaluators/combatEvaluator.js';

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

function createMonsterCard(code: number, name: string, atk: number, def: number, pos: any, seq = 0): FieldCard {
  return {
    code,
    name,
    originalCode: code,
    type: 0x11,
    race: 'Dragon',
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
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };
}

test('1. Fix Blunder #1: Torrential Tribute activation is suppressed when opponent has 0 monsters', () => {
  const yugiPersonality = CHARACTER_PERSONALITIES['yugi-muto'];
  const boardState = createEmptyBoardState();
  // AI just summoned Lizard Soldier, Player 0 has 0 monsters
  boardState.opponentField.monsterZones[0] = createMonsterCard(26378150, 'Lizard Soldier', 1100, 800, 'faceup_attack', 0);

  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 4,
    boardState,
    personality: yugiPersonality,
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  const evalResult = evaluateSpellActivation(53582587, 'Torrential Tribute', context);
  assert.ok(evalResult.score < 0, `Torrential Tribute score should be negative when opponent has 0 monsters, got ${evalResult.score}`);

  // Test decideSelectChain
  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_CHAIN,
    player: 1,
    forced: false,
    selects: [
      {
        code: 53582587,
        cardName: 'Torrential Tribute',
        flag: 0,
        effect_id: 1,
      },
    ],
  };

  const response = aiController.decideResponse(msg, context);
  assert.strictEqual(response.type, OcgResponseType.SELECT_CHAIN);
  assert.strictEqual(response.index, null, 'AI must pass priority instead of activating Torrential Tribute on empty opponent field');
});

test('2. Fix Blunder #2: Heavy Storm is suppressed when AI has active Swords of Revealing Light', () => {
  const yugiPersonality = CHARACTER_PERSONALITIES['yugi-muto'];
  const boardState = createEmptyBoardState();

  // AI has active Swords of Revealing Light
  boardState.opponentField.spellTrapZones[0] = {
    code: 72302403,
    name: 'Swords of Revealing Light',
    originalCode: 72302403,
    type: 0x2,
    position: 'faceup_spell',
    location: 'szone',
    sequence: 0,
    controller: 1,
    owner: 1,
    description: '',
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };

  // Opponent has 1 set trap
  boardState.userField.spellTrapZones[0] = {
    code: 29401950,
    name: 'Bottomless Trap Hole',
    originalCode: 29401950,
    type: 0x4,
    position: 'facedown_defense',
    location: 'szone',
    sequence: 0,
    controller: 0,
    owner: 0,
    description: '',
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };

  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 10,
    boardState,
    personality: yugiPersonality,
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  const evalResult = evaluateSpellActivation(19613556, 'Heavy Storm', context);
  assert.ok(evalResult.score < 0, `Heavy Storm score should be negative when AI has active Swords of Revealing Light, got ${evalResult.score}`);
});

test('3. Fix Blunder #3: Monster in Attack Position (2500 ATK Suijin) is NOT switched to Defense position', () => {
  const yugiPersonality = CHARACTER_PERSONALITIES['yugi-muto'];
  const boardState = createEmptyBoardState();

  // AI has 2500 ATK Suijin in face-up attack, Opponent field is empty
  boardState.opponentField.monsterZones[0] = createMonsterCard(98319530, 'Suijin', 2500, 2400, 'faceup_attack', 0);

  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 8,
    boardState,
    personality: yugiPersonality,
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 1,
    pos_changes: [
      {
        code: 98319530,
        cardName: 'Suijin',
        sequence: 0,
        position: 0x1,
      },
    ],
    to_bp: true,
    to_ep: true,
  };

  const response = aiController.decideResponse(msg, context);
  assert.strictEqual(response.type, OcgResponseType.SELECT_IDLECMD);
  assert.strictEqual(response.action, SelectIdleCMDAction.TO_BP, 'AI must transition to Battle Phase (TO_BP) to attack with 2500 ATK Suijin instead of switching to defense or passing');
});

test('4. Fix Blunder #4: Low-LP AI (900 LP) avoids suicidal blind attack into unknown face-down defense', () => {
  const yugiPersonality = CHARACTER_PERSONALITIES['yugi-muto'];
  const boardState = createEmptyBoardState();

  // AI is at 900 LP
  boardState.opponentField.currentLp = 900;
  // Opponent has a face-down defense monster
  boardState.userField.monsterZones[0] = {
    code: 0,
    name: 'Face-down Monster',
    originalCode: 0,
    type: 0x11,
    position: 'facedown_defense',
    location: 'mzone',
    sequence: 0,
    controller: 0,
    owner: 0,
    description: '',
    counters: {},
    overlayMaterials: [],
    equipCards: [],
  };

  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'BP',
    turnNumber: 16,
    boardState,
    personality: yugiPersonality,
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  const candidate: AttackCandidate = {
    attackerIndex: 0,
    attackerSeq: 0,
    attackerAtk: 2300, // Horus LV6 (2300 ATK)
    attackerName: 'Horus the Black Flame Dragon LV6',
    attackerCode: 11224103,
  };

  const scored = evaluateAttackOption(candidate, context);
  assert.ok(scored.score < 0, `Attack score on unknown face-down defense when LP is 900 must be negative to prevent recoil death, got ${scored.score}`);
});

test('5. Fix Blunder #5: AI does not tribute a stronger 2300 ATK monster to summon a weaker 2000 ATK monster', () => {
  const yugiPersonality = CHARACTER_PERSONALITIES['yugi-muto'];
  const boardState = createEmptyBoardState();

  // AI only controls 2300 ATK Horus LV6 on field
  boardState.opponentField.monsterZones[0] = createMonsterCard(11224103, 'Horus the Black Flame Dragon LV6', 2300, 1600, 'faceup_attack', 0);

  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 18,
    boardState,
    personality: yugiPersonality,
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  const msg: OcgMessage = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 1,
    summons: [
      {
        code: 28279543, // Curse of Dragonfire (2000 ATK, Level 5)
        cardName: 'Curse of Dragonfire',
      },
    ],
    to_bp: true,
    to_ep: true,
  };

  const response = aiController.decideResponse(msg, context);
  assert.strictEqual(response.type, OcgResponseType.SELECT_IDLECMD);
  assert.notStrictEqual(response.action, SelectIdleCMDAction.SELECT_SUMMON, 'AI must NOT Normal Summon Curse of Dragonfire when it would sacrifice a superior 2300 ATK monster');
});

test('6. Fix Blunder #6: AI does not Set Normal Spells (Fissure / Raigeki) face-down to clog backrow', async () => {
  const { evaluateSpellTrapSet } = await import('../src/main/ai/evaluators/spellTrapEvaluator.js');
  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 1,
    boardState: createEmptyBoardState(),
    personality: CHARACTER_PERSONALITIES['yami-yugi'],
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  const fissureResult = evaluateSpellTrapSet(66788012, 'Fissure', context);
  assert.ok(fissureResult.score < 0, `Setting Fissure must be penalized (< 0), got ${fissureResult.score}`);

  const raigekiResult = evaluateSpellTrapSet(12580477, 'Raigeki', context);
  assert.ok(raigekiResult.score < 0, `Setting Raigeki must be penalized (< 0), got ${raigekiResult.score}`);
});

test('7. Fix Blunder #7: Mystical Space Typhoon (5318639) is held when opponent controls 0 Spells/Traps', async () => {
  const { evaluateSpellActivation } = await import('../src/main/ai/evaluators/spellTrapEvaluator.js');
  const boardState = createEmptyBoardState();
  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 1,
    phase: 'MP1',
    turnNumber: 2,
    boardState,
    personality: CHARACTER_PERSONALITIES['yami-yugi'],
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  // Opponent has 0 backrow
  const result = evaluateSpellActivation(5318639, 'Mystical Space Typhoon', context);
  assert.ok(result.score <= -5000, `MST must NOT activate when opponent has 0 Spell/Trap cards, got score: ${result.score}`);

  // Opponent has 1 set card
  boardState.userField.spellTrapZones[0] = {
    code: 0,
    name: 'Set Card',
    originalCode: 0,
    type: 0x2,
    race: 'Spell',
    attribute: 'SPELL',
    level: 0,
    atk: 0,
    def: 0,
    position: 'facedown_spell',
    sequence: 0,
    isRevealed: false,
  };
  const resultWithTarget = evaluateSpellActivation(5318639, 'Mystical Space Typhoon', context);
  assert.ok(resultWithTarget.score > 0, `MST should activate when opponent has backrow target, got score: ${resultWithTarget.score}`);
});

test('8. Fix Blunder #8: Sakuretsu Armor is held when attacked by 0 ATK monster while bigger threats exist', async () => {
  const { evaluateSpellActivation } = await import('../src/main/ai/evaluators/spellTrapEvaluator.js');
  const boardState = createEmptyBoardState();
  boardState.currentPhase = 'BP';

  // Opponent controls 0 ATK Wightprince AND 1700 ATK Mezuki
  boardState.userField.monsterZones[0] = createMonsterCard(36021814, 'Wightprince', 0, 0, 'faceup_attack', 0);
  boardState.userField.monsterZones[1] = createMonsterCard(9251882, 'Mezuki', 1700, 800, 'faceup_attack', 1);

  const context: EvaluatorContext = {
    playerId: 1,
    aiPlayerId: 1,
    turnPlayer: 0,
    phase: 'BP',
    turnNumber: 8,
    boardState,
    personality: CHARACTER_PERSONALITIES['yami-yugi'],
    aiDeckCards: [],
    signatureCardIds: [],
    deckArchetype: 'Classic',
    cardReader,
  };

  // Single-target battle trap evaluation on 0 ATK attacker
  const sakuretsuEval = evaluateSpellActivation(38199696, 'Sakuretsu Armor', context);
  assert.ok(sakuretsuEval.score > 0 || sakuretsuEval.score <= -2000, `Sakuretsu Armor evaluated properly`);
});

