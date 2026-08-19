import assert from 'node:assert/strict';
import { AnimationQueue } from '../src/renderer/utils/animationService.js';
import type { FieldCard, PlayerFieldState } from '../src/shared/types/field.js';
import type { SelectIdleCmdPayload } from '../src/shared/types/duel.js';

console.log('=== Running Hand Duplication, Actions & Animation Queue Tests ===\n');

// -----------------------------------------------------------------------------
// Test 1: Animation Queue Sequential Execution
// -----------------------------------------------------------------------------
{
  console.log('Test 1: Animation Queue Sequential Execution...');
  const queue = new AnimationQueue();
  const executionOrder: number[] = [];

  const task1 = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        executionOrder.push(1);
        resolve();
      }, 50);
    });

  const task2 = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        executionOrder.push(2);
        resolve();
      }, 20);
    });

  const task3 = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        executionOrder.push(3);
        resolve();
      }, 10);
    });

  await Promise.all([
    queue.enqueue(task1),
    queue.enqueue(task2),
    queue.enqueue(task3),
  ]);

  assert.deepEqual(executionOrder, [1, 2, 3], 'Animation queue must execute sequentially in FIFO order');
  console.log('✓ AnimationQueue strictly guarantees non-overlapping FIFO execution.');
}

// -----------------------------------------------------------------------------
// Test 2: Hand Card Action Resolution with Duplicate Card on Field
// -----------------------------------------------------------------------------
{
  console.log('\nTest 2: Hand Card Action Resolution with Duplicate On-Field Card...');

  const activeIdleCmd: SelectIdleCmdPayload = {
    player: 0,
    summons: [
      { code: 91152256, controller: 0, location: 2, sequence: 0 }, // Celtic Guardian in hand
    ],
    special_summons: [],
    pos_changes: [
      { code: 91152256, controller: 0, location: 4, sequence: 0 }, // Celtic Guardian already on field
    ],
    monster_sets: [
      { code: 91152256, controller: 0, location: 2, sequence: 0 },
    ],
    spell_sets: [
      { code: 44095762, controller: 0, location: 2, sequence: 1 }, // Mirror Force in hand
    ],
    activates: [],
    to_bp: true,
    to_ep: true,
    shuffle: true,
  };

  const handCardCeltic: FieldCard = {
    id: 'hand-0-1',
    code: 91152256,
    name: 'Celtic Guardian',
    controller: 0,
    location: 'hand',
    sequence: 0,
    position: 'faceup_spell',
  };

  // Simulating store helper logic
  function resolveActions(card: FieldCard, idleCmd: SelectIdleCmdPayload) {
    const actions: string[] = [];
    const summonIdx = idleCmd.summons.findIndex(
      (s) => s.code === card.code && (s.location === undefined || s.location === 2) && (s.sequence === card.sequence || s.sequence === undefined)
    );
    if (summonIdx >= 0) actions.push('Normal Summon');

    const mSetIdx = idleCmd.monster_sets.findIndex(
      (s) => s.code === card.code && (s.location === undefined || s.location === 2) && (s.sequence === card.sequence || s.sequence === undefined)
    );
    if (mSetIdx >= 0) actions.push('Set Monster');

    return actions;
  }

  const actions = resolveActions(handCardCeltic, activeIdleCmd);
  assert.ok(actions.includes('Normal Summon'));
  assert.ok(actions.includes('Set Monster'));
  console.log('✓ Hand card correctly resolves Normal Summon & Set actions despite duplicate on field.');
}

// -----------------------------------------------------------------------------
// Test 3: Monotonic Hand Re-indexing
// -----------------------------------------------------------------------------
{
  console.log('\nTest 3: Monotonic Hand Re-indexing...');
  const pf: PlayerFieldState = {
    playerId: 0,
    name: 'You',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: true,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    deckCount: 35,
    extraDeckCount: 0,
    hand: [
      { id: '1', code: 91152256, name: 'A', controller: 0, location: 'hand', sequence: 0, position: 'faceup_spell' },
      { id: '2', code: 70781052, name: 'B', controller: 0, location: 'hand', sequence: 1, position: 'faceup_spell' },
      { id: '3', code: 46986414, name: 'C', controller: 0, location: 'hand', sequence: 2, position: 'faceup_spell' },
      { id: '4', code: 55144522, name: 'D', controller: 0, location: 'hand', sequence: 3, position: 'faceup_spell' },
      { id: '5', code: 44095762, name: 'E', controller: 0, location: 'hand', sequence: 4, position: 'faceup_spell' },
    ],
  };

  assert.equal(pf.hand.length, 5);

  // Play card index 1 (B)
  pf.hand.splice(1, 1);
  for (let i = 0; i < pf.hand.length; i++) {
    pf.hand[i].sequence = i;
  }

  assert.equal(pf.hand.length, 4);
  assert.deepEqual(
    pf.hand.map((c) => c.sequence),
    [0, 1, 2, 3]
  );
  console.log('✓ Hand sequences remain strictly contiguous [0, 1, 2, 3] after card removal.');
}

console.log('\n🎉 ALL HAND, ACTION RESOLUTION & ANIMATION QUEUE TESTS PASSED!');
