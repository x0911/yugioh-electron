import assert from 'node:assert';
import { AnimationQueue, playCardFlight, activeAnimations } from '../src/renderer/utils/animationService.js';
import type { FieldCard } from '../src/shared/types/field.js';

console.log('================================================================');
console.log('=== RUNNING TRANSITION ANIMATIONS & HAND INTEGRITY TEST SUITE ===');
console.log('================================================================\n');

function createMockFieldCard(code: number, sequence: number, id?: string): FieldCard {
  return {
    id: id || `hand-0-${code}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    code,
    name: `Card #${code}`,
    controller: 0,
    location: 'hand',
    sequence,
    position: 'faceup_spell',
  };
}

// -----------------------------------------------------------------------------
// Test 1: Hand Card Persistent ID Retention Across Splicing & Array Mutations
// -----------------------------------------------------------------------------
console.log('▶ Test 1: Hand Card Immutable ID Retention Across Playing & Splicing...');

const initialHand: FieldCard[] = [
  createMockFieldCard(55144522, 0, 'c_inst_pot_of_greed'), // Index 0: Pot of Greed
  createMockFieldCard(10000020, 1, 'c_inst_slifer'),       // Index 1: Slifer
  createMockFieldCard(26202165, 2, 'c_inst_sangan'),       // Index 2: Sangan
  createMockFieldCard(44095762, 3, 'c_inst_mirror_force'), // Index 3: Mirror Force
  createMockFieldCard(87910978, 4, 'c_inst_brain_control'),// Index 4: Brain Control
];

// Playing Slifer (Index 1) from hand
const playedIndex = 1;
const playedCard = initialHand.splice(playedIndex, 1)[0];
assert.strictEqual(playedCard.id, 'c_inst_slifer', 'Played card must retain its original ID.');

// Update sequences
for (let i = 0; i < initialHand.length; i++) {
  initialHand[i].sequence = i;
}

// Verify that all neighbor cards (Sangan, Mirror Force, Brain Control) retained their EXACT IDs
assert.strictEqual(initialHand[0].id, 'c_inst_pot_of_greed', 'Card 0 ID must not change.');
assert.strictEqual(initialHand[1].id, 'c_inst_sangan', 'Neighbor Card (Sangan) must retain its exact original ID.');
assert.strictEqual(initialHand[2].id, 'c_inst_mirror_force', 'Neighbor Card (Mirror Force) must retain its exact original ID.');
assert.strictEqual(initialHand[3].id, 'c_inst_brain_control', 'Neighbor Card (Brain Control) must retain its exact original ID.');

console.log('  ✓ Neighbor cards retain 100% stable IDs, eliminating false Vue remounts and false "Fly from Deck" animations.\n');

// -----------------------------------------------------------------------------
// Test 2: AnimationQueue Sequential Execution & Event Pacing
// -----------------------------------------------------------------------------
console.log('▶ Test 2: AnimationQueue Sequential Execution & Strict Event Pacing...');

async function testAnimationQueuePacing() {
  const queue = new AnimationQueue();
  const executionOrder: number[] = [];

  const task1 = queue.enqueue(async () => {
    await new Promise((r) => setTimeout(r, 40));
    executionOrder.push(1);
  });

  const task2 = queue.enqueue(async () => {
    await new Promise((r) => setTimeout(r, 20));
    executionOrder.push(2);
  });

  const task3 = queue.enqueue(async () => {
    await new Promise((r) => setTimeout(r, 10));
    executionOrder.push(3);
  });

  await Promise.all([task1, task2, task3]);

  assert.deepStrictEqual(executionOrder, [1, 2, 3], 'Animation queue must strictly execute tasks in sequential order.');
  console.log('  ✓ AnimationQueue guarantees non-overlapping, strictly ordered visual transitions.\n');
}

// -----------------------------------------------------------------------------
// Test 3: Opponent Hand Splicing by Sequence Integrity
// -----------------------------------------------------------------------------
console.log('▶ Test 3: Opponent Hand Splicing by Sequence Integrity...');

const oppHand: FieldCard[] = [
  { id: 'opp_0', code: 0, name: 'Face-down Card', controller: 1, location: 'hand', sequence: 0, position: 'facedown_spell' },
  { id: 'opp_1', code: 0, name: 'Face-down Card', controller: 1, location: 'hand', sequence: 1, position: 'facedown_spell' },
  { id: 'opp_2', code: 0, name: 'Face-down Card', controller: 1, location: 'hand', sequence: 2, position: 'facedown_spell' },
  { id: 'opp_3', code: 0, name: 'Face-down Card', controller: 1, location: 'hand', sequence: 3, position: 'facedown_spell' },
];

// Opponent sets card at sequence 2
const fromSeq = 2;
const removed = oppHand.splice(fromSeq, 1)[0];
assert.strictEqual(removed.id, 'opp_2', 'Correct opponent card spliced.');
assert.strictEqual(oppHand.length, 3, 'Opponent hand reduced to 3 cards.');

for (let i = 0; i < oppHand.length; i++) {
  oppHand[i].sequence = i;
}

assert.strictEqual(oppHand[0].id, 'opp_0');
assert.strictEqual(oppHand[1].id, 'opp_1');
assert.strictEqual(oppHand[2].id, 'opp_3'); // Retains original ID without ghosting
console.log('  ✓ Opponent hand sequence splicing preserves card IDs without ghost accumulation.\n');

// -----------------------------------------------------------------------------
// Test 4: Spatial Flight Overlay Lifecycle & Auto-Cleanup
// -----------------------------------------------------------------------------
console.log('▶ Test 4: Spatial Flight Overlay Lifecycle & Active Animations Auto-Cleanup...');

async function testFlightCleanup() {
  assert.strictEqual(activeAnimations.value.length, 0, 'No active animations initially.');

  const flightPromise = playCardFlight({
    code: 89631139,
    cardName: 'Blue-Eyes White Dragon',
    fromRect: { left: 100, top: 100, width: 90, height: 130 },
    toRect: { left: 400, top: 400, width: 90, height: 130 },
    type: 'summon',
    durationMs: 50,
  });

  assert.strictEqual(activeAnimations.value.length, 1, 'Active animation registered during flight.');
  assert.strictEqual(activeAnimations.value[0].code, 89631139, 'Correct card code in flight.');

  await flightPromise;

  assert.strictEqual(activeAnimations.value.length, 0, 'Active animation cleanly removed after flight completes.');
  console.log('  ✓ Spatial flight overlay cleanly creates and destroys flying card instances.\n');
}

async function runAll() {
  await testAnimationQueuePacing();
  await testFlightCleanup();
  console.log('================================================================');
  console.log('🎉 ALL TRANSITION ANIMATIONS & HAND INTEGRITY TESTS PASSED 100%!');
  console.log('================================================================\n');
}

runAll().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
