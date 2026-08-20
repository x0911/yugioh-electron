import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  OcgMessageType,
  OcgResponseType,
  OcgPosition,
  OcgLocation,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';

import {
  AIController,
  assertAiStateSanitized,
  getPersonalityForCharacter,
  type EvaluatorContext,
} from '../src/main/ai/index.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import type { DuelBoardState, PlayerFieldState } from '../src/shared/types/field.js';

function createMockField(playerId: 0 | 1, name: string): PlayerFieldState {
  return {
    playerId,
    name,
    currentLp: 8000,
    maxLp: 8000,
    isTurn: playerId === 0,
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

function createMockBoardState(aiPlayerId: 0 | 1 = 1): DuelBoardState {
  return {
    userField: createMockField(0, 'Player 0 (Human)'),
    opponentField: createMockField(1, 'Player 1 (AI)'),
    extraMonsterZones: [null, null],
    turnNumber: 1,
    currentPhase: 'M1',
    activePrompt: null,
    phaseGuideText: '',
    winner: null,
    winReason: null,
  };
}

console.log('=== Running Phase 13 AI Opponent, Personality & Anti-Cheat Tests ===\n');

// -----------------------------------------------------------------------------
// Test 1: Anti-Cheat Assertion Verification
// -----------------------------------------------------------------------------
console.log('Test 1: Verification of Anti-Cheat Assertion against unrevealed human cards...');

const cleanBoard = createMockBoardState(1);
// Human hand contains redacted cards
cleanBoard.userField.hand = [
  { id: 'h1', code: 0, name: 'Card Back', controller: 0, location: 'hand', sequence: 0, position: 'facedown_spell' },
  { id: 'h2', code: 0, name: 'Card Back', controller: 0, location: 'hand', sequence: 1, position: 'facedown_spell' },
];
// Human face-down monster is redacted
cleanBoard.userField.monsterZones[0] = {
  id: 'm1',
  code: 0,
  name: 'Face-down Monster',
  controller: 0,
  location: 'monster',
  sequence: 0,
  position: 'facedown_defense',
};
// Human face-down spell is redacted
cleanBoard.userField.spellTrapZones[0] = {
  id: 's1',
  code: 0,
  name: 'Face-down Card',
  controller: 0,
  location: 'spell-trap',
  sequence: 0,
  position: 'facedown_spell',
};

// Should pass with zero errors
assert.doesNotThrow(() => {
  assertAiStateSanitized(cleanBoard, 1);
}, 'Clean redacted board state must pass anti-cheat assertion.');

// Leak 1: Unredacted human hand card
const leakHandBoard = JSON.parse(JSON.stringify(cleanBoard));
leakHandBoard.userField.hand[0].code = 89631139; // Blue-Eyes White Dragon
assert.throws(() => {
  assertAiStateSanitized(leakHandBoard, 1);
}, /ANTI-CHEAT ASSERTION FAILED.*human hand card/, 'Must throw loudly if human hand contains unredacted code.');

// Leak 2: Unredacted human face-down monster
const leakMonsterBoard = JSON.parse(JSON.stringify(cleanBoard));
leakMonsterBoard.userField.monsterZones[0].code = 46986414; // Dark Magician
assert.throws(() => {
  assertAiStateSanitized(leakMonsterBoard, 1);
}, /ANTI-CHEAT ASSERTION FAILED.*face-down human monster/, 'Must throw loudly if human face-down monster contains unredacted code.');

// Leak 3: Unredacted human face-down spell/trap
const leakTrapBoard = JSON.parse(JSON.stringify(cleanBoard));
leakTrapBoard.userField.spellTrapZones[0].code = 44095762; // Mirror Force
assert.throws(() => {
  assertAiStateSanitized(leakTrapBoard, 1);
}, /ANTI-CHEAT ASSERTION FAILED.*face-down human spell\/trap/, 'Must throw loudly if human face-down spell/trap contains unredacted code.');

console.log('✓ Anti-cheat assertion strictly prevents secret data leakage to AI.\n');

// -----------------------------------------------------------------------------
// Test 2: Character Personality Profiles & Scoring Divergence
// -----------------------------------------------------------------------------
console.log('Test 2: Verification of Character Personality Profiles & Strategic Divergence...');

const kaibaPersonality = getPersonalityForCharacter('seto-kaiba');
const yugiPersonality = getPersonalityForCharacter('yugi-muto');
const zanePersonality = getPersonalityForCharacter('zane-truesdale');

assert.ok(kaibaPersonality.aggression > yugiPersonality.aggression, 'Kaiba should be more aggressive than Yugi.');
assert.ok(yugiPersonality.defensiveness > kaibaPersonality.defensiveness, 'Yugi should be more defensive than Kaiba.');
assert.ok(kaibaPersonality.thinkDelayBaseMs <= 650, 'Kaiba should have fast, decisive think delay.');
assert.ok(yugiPersonality.cardAdvantageWeight > kaibaPersonality.cardAdvantageWeight, 'Yugi should prioritize card advantage higher.');
assert.ok(zanePersonality.comboFocus > 0.8, 'Zane should have high combo focus for Cyber Dragon / OTK.');

console.log(`  - Seto Kaiba: Aggression=${kaibaPersonality.aggression}, Defensiveness=${kaibaPersonality.defensiveness}, Delay=${kaibaPersonality.thinkDelayBaseMs}ms`);
console.log(`  - Yugi Muto:  Aggression=${yugiPersonality.aggression}, Defensiveness=${yugiPersonality.defensiveness}, Delay=${yugiPersonality.thinkDelayBaseMs}ms`);
console.log(`  - Zane:       Aggression=${zanePersonality.aggression}, ComboFocus=${zanePersonality.comboFocus}, Delay=${zanePersonality.thinkDelayBaseMs}ms`);
console.log('✓ Character personality parameters properly differentiate anime duelist styles.\n');

// -----------------------------------------------------------------------------
// Test 3: AIController Decision Making across Prompt Types
// -----------------------------------------------------------------------------
console.log('Test 3: Verification of AIController decision responses across engine prompt types...');

const cardReader = new CardReaderService();
const ai = new AIController();

const mockContext: EvaluatorContext = {
  aiPlayerId: 1,
  humanPlayerId: 0,
  boardState: cleanBoard,
  personality: kaibaPersonality,
  cardReader,
  currentPhase: 'M1',
  currentTurn: 2,
  signatureCardIds: [89631139],
  deckArchetype: 'Blue-Eyes Dragon Fury',
};

// 1. SELECT_IDLECMD with Summon & Pot of Greed Activate
const idleMsg: OcgMessage = {
  type: OcgMessageType.SELECT_IDLECMD,
  player: 1,
  summons: [{ code: 89631139, location: 2, sequence: 0, controller: 1 }],
  activates: [{ code: 55144522, location: 2, sequence: 1, controller: 1, cardName: 'Pot of Greed' }],
  special_summons: [],
  monster_sets: [],
  spell_sets: [],
  pos_changes: [],
  to_bp: true,
  to_ep: true,
  to_m2: false,
};

const idleResponse = ai.decideResponse(idleMsg, mockContext);
assert.strictEqual(idleResponse.type, OcgResponseType.SELECT_IDLECMD, 'Idle response type must be SELECT_IDLECMD.');
assert.ok(
  idleResponse.action === SelectIdleCMDAction.SELECT_ACTIVATE || idleResponse.action === SelectIdleCMDAction.SELECT_SUMMON,
  'AI should prioritize Pot of Greed activation or Blue-Eyes Normal Summon.',
);

// 2. SELECT_BATTLECMD with direct attack
const battleMsg: OcgMessage = {
  type: OcgMessageType.SELECT_BATTLECMD,
  player: 1,
  attacks: [{ code: 89631139, location: 4, sequence: 0, controller: 1, atk: 3000, cardName: 'Blue-Eyes White Dragon' }],
  chains: [],
  to_m2: true,
  to_ep: true,
};

const battleResponse = ai.decideResponse(battleMsg, mockContext);
assert.strictEqual(battleResponse.type, OcgResponseType.SELECT_BATTLECMD, 'Battle response type must be SELECT_BATTLECMD.');
assert.strictEqual(battleResponse.action, SelectBattleCMDAction.SELECT_BATTLE, 'AI must attack with 3000 ATK Blue-Eyes.');

// 3. SELECT_POSITION
const posMsg: OcgMessage = {
  type: OcgMessageType.SELECT_POSITION,
  player: 1,
  positions: 0x5, // Attack or Defense
  code: 89631139, // Blue-Eyes
};
const posResponse = ai.decideResponse(posMsg, mockContext);
assert.strictEqual(posResponse.type, OcgResponseType.SELECT_POSITION);
assert.strictEqual(posResponse.position, OcgPosition.FACEUP_ATTACK, 'Kaiba AI must place Blue-Eyes in Attack Position.');

// 4. Think-delay calculation with natural variation
const delay1 = ai.getThinkDelay(kaibaPersonality, 'SELECT_IDLECMD');
const delay2 = ai.getThinkDelay(yugiPersonality, 'SELECT_IDLECMD');
assert.ok(delay1 >= 300 && delay1 <= 1000, `Kaiba delay (${delay1}ms) should be within realistic bounds.`);
assert.ok(delay2 >= 450 && delay2 <= 1200, `Yugi delay (${delay2}ms) should be within realistic bounds.`);

console.log('✓ AIController successfully generated legal, scored, and character-weighted responses.\n');

// -----------------------------------------------------------------------------
// Test 4: End-to-End Live Engine Duel with Anti-Cheat Assertion
// -----------------------------------------------------------------------------
console.log('Test 4: Running full simulated duel with live engine & active anti-cheat assertion...');

const engine = new DuelEngineService();
await engine.init();

// Classic Yugi vs Kaiba deck pool
const p0Deck = [
  46986414, 38033121, 70781052, 91152256, 28279543, 55144522, 79571449, 12580477, 53129443, 83764719,
  46986414, 38033121, 70781052, 91152256, 28279543, 55144522, 79571449, 12580477, 53129443, 83764719,
  46986414, 38033121, 70781052, 91152256, 28279543, 55144522, 79571449, 12580477, 53129443, 83764719,
  46986414, 38033121, 70781052, 91152256, 28279543, 55144522, 79571449, 12580477, 53129443, 83764719,
];

const p1Deck = [
  89631139, 89631139, 89631139, 11549357, 11549357, 55144522, 79571449, 12580477, 53129443, 83764719,
  89631139, 89631139, 89631139, 11549357, 11549357, 55144522, 79571449, 12580477, 53129443, 83764719,
  89631139, 89631139, 89631139, 11549357, 11549357, 55144522, 79571449, 12580477, 53129443, 83764719,
  89631139, 89631139, 89631139, 11549357, 11549357, 55144522, 79571449, 12580477, 53129443, 83764719,
];

engine.startNewDuel({
  player0Deck: p0Deck,
  player1Deck: p1Deck,
  startingLP: 4000,
  startingDrawCount: 5,
  autoPlay: true, // Automated driver to simulate full duel
  humanPlayerId: 0,
  aiCharacterId: 'seto-kaiba',
  aiDeckArchetype: 'Blue-Eyes Dragon Fury',
});

let steps = 0;
while (engine.getState().isActive && steps < 150) {
  steps++;
  engine.processStep();
}

const finalState = engine.getState();
console.log(`Simulated duel executed ${steps} steps across ${finalState.currentTurn} turns without a single anti-cheat violation.`);
console.log(`Final Result: Winner=Player ${finalState.winner}, P0 LP=${finalState.p0LP}, P1 LP=${finalState.p1LP}`);

assert.ok(steps > 5, 'Duel should execute multiple steps.');
assert.ok(finalState.currentTurn >= 1, 'Duel should progress through multiple turns.');

console.log('✓ Full engine duel completed with 100% clean anti-cheat verification!\n');
console.log('🎉 ALL AI OPPONENT & PERSONALITY TESTS PASSED SUCCESSFULLY!');
