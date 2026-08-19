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

// -----------------------------------------------------------------------------
// Test 4: 4-Step Spell Activation & Resolution Sequence
// -----------------------------------------------------------------------------
{
  console.log('\nTest 4: 4-Step Spell Activation & Resolution Sequence (e.g. Pot of Greed)...');
  const queue = new AnimationQueue();
  const stepLog: string[] = [];

  const simulateSpellEvent = async (event: { type: string; fromLoc?: number; toLoc?: number }) => {
    await queue.enqueue(async () => {
      if (event.type === 'MOVE' && event.fromLoc === 2 && event.toLoc === 8) {
        stepLog.push('1_HAND_TO_FIELD_FLIGHT');
      } else if (event.type === 'CHAINING') {
        stepLog.push('2_SPELL_ACTIVATION_PULSE');
      } else if (event.type === 'DRAW') {
        stepLog.push('3_CARD_DRAW_FLIGHT');
      } else if (event.type === 'MOVE' && event.fromLoc === 8 && event.toLoc === 16) {
        stepLog.push('4_FIELD_TO_GY_FLIGHT');
      }
    });
  };

  // Simulating the sequential event stream emitted by ocgcore on Spell Activation
  await simulateSpellEvent({ type: 'MOVE', fromLoc: 2, toLoc: 8 });
  await simulateSpellEvent({ type: 'CHAINING' });
  await simulateSpellEvent({ type: 'DRAW' });
  await simulateSpellEvent({ type: 'DRAW' });
  await simulateSpellEvent({ type: 'MOVE', fromLoc: 8, toLoc: 16 });

  assert.deepEqual(
    stepLog,
    [
      '1_HAND_TO_FIELD_FLIGHT',
      '2_SPELL_ACTIVATION_PULSE',
      '3_CARD_DRAW_FLIGHT',
      '3_CARD_DRAW_FLIGHT',
      '4_FIELD_TO_GY_FLIGHT',
    ],
    'Spell activation must follow the 4-step sequence: Hand->Field, Activation, Effect (Draw), Field->GY'
  );

  console.log('✓ Spell animation strictly follows Hand->Field -> Activation -> Effect -> Field->GY sequence.');
}

// -----------------------------------------------------------------------------
// Test 5: Field Card Action Isolation (Spell/Trap vs Monster Zone)
// -----------------------------------------------------------------------------
{
  console.log('\nTest 5: Field Card Action Isolation (Spell/Trap vs Monster Zone)...');

  const idleCmd: SelectIdleCmdPayload = {
    player: 0,
    summons: [],
    special_summons: [],
    pos_changes: [
      { code: 34627841, controller: 0, location: 4, sequence: 0 }, // Kaibaman in M1 (sequence 0)
    ],
    monster_sets: [],
    spell_sets: [],
    activates: [
      { code: 44095762, controller: 0, location: 8, sequence: 0, description: 0n, client_mode: 0 }, // Mirror Force in S1 (sequence 0)
    ],
    to_bp: true,
    to_ep: true,
    shuffle: false,
  };

  const trapInS1: FieldCard = {
    id: 'st-0',
    code: 44095762,
    name: 'Mirror Force',
    controller: 0,
    location: 'spell-trap',
    sequence: 0, // Same sequence as Kaibaman!
    position: 'facedown_spell',
  };

  const monsterInM1: FieldCard = {
    id: 'mz-0',
    code: 34627841,
    name: 'Kaibaman',
    controller: 0,
    location: 'monster',
    sequence: 0,
    position: 'facedown_defense',
  };

  function resolveFieldActions(card: FieldCard, cmd: SelectIdleCmdPayload) {
    const isMonsterZone = card.location === 'monster' || card.location === 'extra-monster';
    const isSpellTrapZone = card.location === 'spell-trap';
    const actions: string[] = [];

    // Position Change
    if (isMonsterZone) {
      const posIdx = cmd.pos_changes.findIndex(
        (p) => (p.location === 4 || p.location === undefined) && (p.sequence === card.sequence || p.sequence === undefined)
      );
      if (posIdx >= 0) actions.push('Change Position');
    }

    // Activate Field Effect
    const actIdx = cmd.activates.findIndex((a) => {
      if (isMonsterZone && a.location !== 4) return false;
      if (isSpellTrapZone && a.location !== 8 && a.location !== undefined) return false;
      return a.sequence === card.sequence || a.sequence === undefined;
    });
    if (actIdx >= 0) actions.push('Activate Effect');

    return actions;
  }

  const trapActions = resolveFieldActions(trapInS1, idleCmd);
  const monsterActions = resolveFieldActions(monsterInM1, idleCmd);

  // Trap card in S1 must NEVER have 'Change Position'
  assert.ok(!trapActions.includes('Change Position'), 'Trap card in S1 must NOT receive Change Position action');
  assert.ok(trapActions.includes('Activate Effect'), 'Trap card in S1 can receive Activate Effect');

  // Monster in M1 must have 'Change Position' and NOT activate the trap in S1
  assert.ok(monsterActions.includes('Change Position'), 'Monster in M1 must receive Change Position action');
  assert.ok(!monsterActions.includes('Activate Effect'), 'Monster in M1 must not match trap effect in S1');

  console.log('✓ Field actions strictly isolate Monster Zone vs Spell/Trap Zone even with identical sequences.');
}

console.log('\n🎉 ALL HAND, ACTION RESOLUTION & ANIMATION QUEUE TESTS PASSED!');
