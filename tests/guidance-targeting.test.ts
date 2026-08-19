import assert from 'node:assert/strict';
import { getActionGuideInfo } from '../src/renderer/utils/guidanceHelper.js';
import type { DuelBoardState, PlayerFieldState } from '../src/shared/types/field.js';
import type {
  SelectCardPayload,
  SelectChainPayload,
  SelectPositionPayload,
  SelectEffectYnPayload,
  SelectOptionPayload,
  SelectTributePayload,
} from '../src/shared/types/duel.js';

function createDummyField(playerId: 0 | 1): PlayerFieldState {
  return {
    playerId,
    name: playerId === 0 ? 'You' : 'Opponent',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: playerId === 0,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    deckCount: 40,
    extraDeckCount: 0,
    hand: [],
  };
}

function createDummyBoard(): DuelBoardState {
  return {
    userField: createDummyField(0),
    opponentField: createDummyField(1),
    extraMonsterZones: [null, null],
    turnNumber: 1,
    currentPhase: 'M1',
    activePrompt: null,
    phaseGuideText: '',
    winner: null,
    winReason: null,
  };
}

console.log('=== Running Phase 11 Targeting & Guidance Tests ===\n');

// -----------------------------------------------------------------------------
// Test 1: Plain Target Selection Effect
// -----------------------------------------------------------------------------
{
  console.log('Test 1: Plain Target Selection Effect...');
  const board = createDummyBoard();
  const selectCard: SelectCardPayload = {
    player: 0,
    can_cancel: true,
    min: 1,
    max: 1,
    selects: [
      { controller: 1, location: 4, sequence: 0, code: 89631139, cardName: 'Blue-Eyes White Dragon' },
      { controller: 1, location: 4, sequence: 1, code: 46986414, cardName: 'Dark Magician' },
    ],
  };

  const info = getActionGuideInfo(
    board,
    true,
    {
      selectCard,
      selectTribute: null,
      selectChain: null,
      selectPosition: null,
      selectEffectYn: null,
      selectOption: null,
    },
    0,
  );

  assert.equal(info.category, 'target');
  assert.equal(info.categoryLabel, 'Effect Target');
  assert.equal(info.categoryIcon, '🎯');
  assert.ok(info.instruction.includes('Select 1 card(s) on the field to target'));
  assert.equal(info.canCancel, true);
  assert.equal(info.isMandatory, false);
  assert.deepEqual(info.selectionProgress, { current: 0, requiredMin: 1, requiredMax: 1 });
  console.log('✓ Plain target selection translated correctly.');
}

// -----------------------------------------------------------------------------
// Test 2: Tribute Summon Requirement
// -----------------------------------------------------------------------------
{
  console.log('\nTest 2: Tribute Summon Requirement...');
  const board = createDummyBoard();
  const selectTribute: SelectTributePayload = {
    player: 0,
    min: 1,
    max: 1,
    selects: [
      { controller: 0, location: 4, sequence: 0, code: 91152256, cardName: 'Celtic Guardian' },
      { controller: 0, location: 4, sequence: 1, code: 6368038, cardName: 'Mystical Elf' },
    ],
  };

  const info = getActionGuideInfo(
    board,
    true,
    {
      selectCard: null,
      selectTribute,
      selectChain: null,
      selectPosition: null,
      selectEffectYn: null,
      selectOption: null,
    },
    1,
  );

  assert.equal(info.category, 'tribute');
  assert.equal(info.categoryLabel, 'Tribute Summon');
  assert.equal(info.categoryIcon, '🔥');
  assert.ok(info.instruction.includes('Tribute Summon: Select 1 monster'));
  assert.ok(info.subText?.includes('Only monsters on your own field'));
  assert.equal(info.canCancel, false);
  assert.deepEqual(info.selectionProgress, { current: 1, requiredMin: 1, requiredMax: 1 });
  console.log('✓ Tribute summon prompt translated correctly with eligible monster restriction.');
}

// -----------------------------------------------------------------------------
// Test 3: Chain Window Opportunity (Optional Pass vs Forced Mandatory)
// -----------------------------------------------------------------------------
{
  console.log('\nTest 3: Chain Window Opportunity...');
  const board = createDummyBoard();
  
  // 3a. Optional Chain Window
  const optionalChain: SelectChainPayload = {
    player: 0,
    forced: false,
    selects: [
      { code: 4206964, cardName: 'Trap Hole', location: 8, sequence: 0, description: 'Destroy Summoned Monster' },
    ],
  };

  const optInfo = getActionGuideInfo(
    board,
    false,
    {
      selectCard: null,
      selectTribute: null,
      selectChain: optionalChain,
      selectPosition: null,
      selectEffectYn: null,
      selectOption: null,
    },
    0,
  );

  assert.equal(optInfo.category, 'chain');
  assert.equal(optInfo.categoryLabel, 'Chain Opportunity');
  assert.equal(optInfo.categoryIcon, '⛓️');
  assert.ok(optInfo.instruction.includes('Chain Window: You may activate a Spell, Trap, or Quick Effect in response, or pass priority'));
  assert.ok(optInfo.subText?.includes('Pass (Do Not Chain)'));
  assert.equal(optInfo.canCancel, true);
  assert.equal(optInfo.isMandatory, false);
  console.log('✓ Optional chain window translates to Pass or Respond instruction.');

  // 3b. Forced Mandatory Chain Window
  const forcedChain: SelectChainPayload = {
    player: 0,
    forced: true,
    selects: [
      { code: 54652250, cardName: 'Man-Eater Bug', location: 4, sequence: 0, description: 'Flip: Destroy 1 monster' },
    ],
  };

  const forcedInfo = getActionGuideInfo(
    board,
    true,
    {
      selectCard: null,
      selectTribute: null,
      selectChain: forcedChain,
      selectPosition: null,
      selectEffectYn: null,
      selectOption: null,
    },
    0,
  );

  assert.equal(forcedInfo.category, 'chain');
  assert.ok(forcedInfo.instruction.includes('Mandatory Trigger Effect'));
  assert.equal(forcedInfo.canCancel, false);
  assert.equal(forcedInfo.isMandatory, true);
  console.log('✓ Forced mandatory chain correctly disallows cancelling or passing.');
}

// -----------------------------------------------------------------------------
// Test 4: Cost-Based Effect (Hand Discard Payment)
// -----------------------------------------------------------------------------
{
  console.log('\nTest 4: Cost-Based Effect...');
  const board = createDummyBoard();
  const costCard: SelectCardPayload = {
    player: 0,
    can_cancel: true,
    min: 1,
    max: 1,
    selects: [
      { controller: 0, location: 2, sequence: 0, code: 72892473, cardName: 'Kuriboh' },
      { controller: 0, location: 2, sequence: 1, code: 25280974, cardName: 'Giant Soldier of Stone' },
    ],
  };

  const costInfo = getActionGuideInfo(
    board,
    true,
    {
      selectCard: costCard,
      selectTribute: null,
      selectChain: null,
      selectPosition: null,
      selectEffectYn: null,
      selectOption: null,
    },
    0,
  );

  assert.equal(costInfo.category, 'cost');
  assert.equal(costInfo.categoryLabel, 'Cost Payment');
  assert.equal(costInfo.categoryIcon, '⚡');
  assert.ok(costInfo.instruction.includes('Cost Payment'));
  assert.ok(costInfo.instruction.includes('Choose 1 card(s) in your hand to discard as a cost'));
  assert.ok(costInfo.subText?.includes('This is a cost — it happens immediately'));
  assert.equal(costInfo.canCancel, true);
  console.log('✓ Cost-based discard distinguished from effect discard.');
}

// -----------------------------------------------------------------------------
// Test 5: End Phase Hand-Size Cleanup Discard
// -----------------------------------------------------------------------------
{
  console.log('\nTest 5: End Phase Hand-Size Cleanup...');
  const board = createDummyBoard();
  board.currentPhase = 'EP';
  const cleanupCard: SelectCardPayload = {
    player: 0,
    can_cancel: false,
    isDiscardPrompt: true,
    min: 2,
    max: 2,
    selects: [
      { controller: 0, location: 2, sequence: 0, code: 72892473, cardName: 'Kuriboh' },
      { controller: 0, location: 2, sequence: 1, code: 25280974, cardName: 'Giant Soldier of Stone' },
      { controller: 0, location: 2, sequence: 2, code: 91152256, cardName: 'Celtic Guardian' },
    ],
  };

  const cleanupInfo = getActionGuideInfo(
    board,
    true,
    {
      selectCard: cleanupCard,
      selectTribute: null,
      selectChain: null,
      selectPosition: null,
      selectEffectYn: null,
      selectOption: null,
    },
    1,
  );

  assert.equal(cleanupInfo.category, 'cleanup');
  assert.equal(cleanupInfo.categoryLabel, 'Hand Size Limit');
  assert.equal(cleanupInfo.categoryIcon, '⚠️');
  assert.ok(cleanupInfo.instruction.includes('Hand Size Limit Exceeded'));
  assert.ok(cleanupInfo.instruction.includes('Select 2 card(s) to discard'));
  assert.equal(cleanupInfo.canCancel, false);
  assert.equal(cleanupInfo.isMandatory, true);
  assert.deepEqual(cleanupInfo.selectionProgress, { current: 1, requiredMin: 2, requiredMax: 2 });
  console.log('✓ End Phase hand cleanup enforced strictly as non-cancelable mandatory discard.');
}

console.log('\n🎉 ALL PHASE 11 TARGETING & GUIDANCE TESTS PASSED SUCCESSFULLY!');
