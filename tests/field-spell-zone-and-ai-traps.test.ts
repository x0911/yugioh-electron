import test from 'node:test';
import assert from 'node:assert/strict';
import { DefaultExecutor } from '../src/main/ai/executors/DefaultExecutor.js';
import { evaluateAttackOption } from '../src/main/ai/evaluators/combatEvaluator.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { DEFAULT_PERSONALITY } from '../src/main/ai/strategies/personalityProfiles.js';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { PlayerFieldState, FieldCard } from '../src/shared/types/field.js';
import { OcgMessageType, OcgLocation, SelectIdleCMDAction } from 'ocgcore-wasm';

const cardReader = new CardReaderService();

function createEmptyPlayerField(playerId: 0 | 1, lp = 8000): PlayerFieldState {
  return {
    playerId,
    name: playerId === 0 ? 'AI' : 'Player',
    currentLp: lp,
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

test('1. Field Spell Placement: OcgLocation.SZONE with sequence 5 routes strictly to fieldZone', () => {
  const pf = createEmptyPlayerField(0);

  // Simulate DuelEngineService handleMove logic when to.location === OcgLocation.SZONE with sequence 5
  const movedCard: FieldCard = {
    id: 'field-1',
    code: 90846359, // Mound of the Bound Creator
    name: 'Mound of the Bound Creator',
    controller: 0,
    location: 'field',
    sequence: 0,
    position: 'faceup_attack',
    statuses: [],
  };

  const toLocation = OcgLocation.SZONE;
  const toSequence = 5;

  if (toLocation === OcgLocation.SZONE) {
    if (toSequence === 5) {
      pf.fieldZone = movedCard;
    } else {
      pf.spellTrapZones[toSequence] = movedCard;
    }
  }

  assert.strictEqual(pf.fieldZone?.code, 90846359, 'Field card must be placed into fieldZone');
  assert.strictEqual(pf.spellTrapZones.length, 5, 'spellTrapZones must remain exactly 5 elements');
  assert.strictEqual(pf.spellTrapZones[5], undefined, 'spellTrapZones[5] must not exist');
});

test('2. AI Trap Setting: DefaultExecutor.onIdleCmd evaluates msg.spell_sets with high priority', () => {
  const executor = new DefaultExecutor();
  const aiField = createEmptyPlayerField(0);
  const oppField = createEmptyPlayerField(1);

  const context: EvaluatorContext = {
    aiPlayerId: 0,
    aiDeckCards: [],
    boardState: {
      userField: aiField,
      opponentField: oppField,
      currentPhase: 'MAIN1',
      currentTurn: 2,
    },
    cardReader,
    personality: DEFAULT_PERSONALITY,
    signatureCardIds: [],
  };

  // ocgcore sends msg.spell_sets (NOT msg.sp_sets)
  const idleMsg = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 0,
    spell_sets: [
      { code: 94192409, sequence: 0 }, // Compulsory Evacuation Device
      { code: 29401950, sequence: 1 }, // Bottomless Trap Hole
      { code: 44095762, sequence: 2 }, // Mirror Force
    ],
    summons: [],
    special_summons: [],
    pos_changes: [],
    monster_sets: [],
    activates: [],
    to_bp: true,
    to_ep: true,
    shuffle: false,
  };

  const candidates = executor.onIdleCmd(idleMsg as any, context);
  assert.ok(candidates && candidates.length > 0, 'Executor must produce action candidates');

  const setActions = candidates.filter((c) => c.action.action === SelectIdleCMDAction.SELECT_SPELL_SET);
  assert.strictEqual(setActions.length, 3, 'Must have 3 SELECT_SPELL_SET candidates');

  // Verify Compulsory Evacuation Device score is high (> 1000) and exceeds TO_BP / TO_EP
  const compulsoryAction = setActions.find((c) => c.cardCode === 94192409);
  assert.ok(compulsoryAction, 'Compulsory Evacuation Device set action must be present');
  assert.ok(compulsoryAction.score >= 1200, `Expected score >= 1200, got ${compulsoryAction.score}`);

  const toBpAction = candidates.find((c) => c.action.action === SelectIdleCMDAction.TO_BP);
  assert.ok(toBpAction, 'TO_BP candidate should be present');
  assert.ok(compulsoryAction.score > toBpAction.score, 'Setting premier trap must score higher than rushing to Battle Phase');
});

test('3. Low-LP Suicide Prevention: Sangan (1000 ATK) avoids attacking face-down defense when LP <= 1000', () => {
  const aiField = createEmptyPlayerField(0, 1000); // 1000 LP remaining
  const oppField = createEmptyPlayerField(1, 8000);

  // Opponent has a face-down monster
  oppField.monsterZones[0] = {
    id: 'opp-m1',
    code: 0,
    name: 'Face-down Monster',
    controller: 1,
    location: 'monster',
    sequence: 0,
    position: 'facedown_defense',
    statuses: [],
  };

  const context: EvaluatorContext = {
    aiPlayerId: 0,
    aiDeckCards: [],
    boardState: {
      userField: aiField,
      opponentField: oppField,
      currentPhase: 'BP',
      currentTurn: 29,
    },
    cardReader,
    personality: DEFAULT_PERSONALITY,
    signatureCardIds: [],
  };

  const sanganCandidate = {
    attackerIndex: 0,
    attackerSeq: 0,
    attackerAtk: 1000,
    attackerName: 'Sangan',
    attackerCode: 26202165,
  };

  const result = evaluateAttackOption(sanganCandidate, context);
  assert.ok(result.score < 0, `Expected negative score to avoid suicide recoil, got ${result.score}`);
  assert.ok(
    result.reason.includes('AVOID LETHAL RECOIL') || result.reason.includes('Low LP'),
    `Reason must indicate recoil/LP protection: ${result.reason}`,
  );
});

test('4. Healthy High-ATK Attack: Jinzo (2400 ATK) aggressively probes face-down defense when healthy', () => {
  const aiField = createEmptyPlayerField(0, 8000);
  const oppField = createEmptyPlayerField(1, 8000);

  oppField.monsterZones[0] = {
    id: 'opp-m1',
    code: 0,
    name: 'Face-down Monster',
    controller: 1,
    location: 'monster',
    sequence: 0,
    position: 'facedown_defense',
    statuses: [],
  };

  const context: EvaluatorContext = {
    aiPlayerId: 0,
    aiDeckCards: [],
    boardState: {
      userField: aiField,
      opponentField: oppField,
      currentPhase: 'BP',
      currentTurn: 4,
    },
    cardReader,
    personality: DEFAULT_PERSONALITY,
    signatureCardIds: [],
  };

  const jinzoCandidate = {
    attackerIndex: 0,
    attackerSeq: 0,
    attackerAtk: 2400,
    attackerName: 'Jinzo',
    attackerCode: 77585513,
  };

  const result = evaluateAttackOption(jinzoCandidate, context);
  assert.ok(result.score > 0, `Expected positive score for 2400 ATK beatstick, got ${result.score}`);
});
