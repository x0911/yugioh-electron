import assert from 'node:assert';
import { useDuelStore } from '../src/renderer/stores/duelStore.ts';
import { createPinia, setActivePinia } from 'pinia';
import type { FieldCard } from '../src/renderer/stores/duelStore.ts';

console.log('=== Running Action Ordering and Extra Deck Shift Tests ===\n');

setActivePinia(createPinia());
const store = useDuelStore();

// Test 1: Verify 'Activate' appears before 'Set Card' for a Spell in hand
console.log('▶ Test 1: Verify "Activate" appears before "Set Card" for Spell card in hand...');

// Setup activeIdleCmd with both activate and spell_set for Polymerization (24094653) in hand (location 2)
store.activeIdleCmd = {
  summons: [],
  special_summons: [],
  monster_sets: [],
  spell_sets: [{ code: 24094653, location: 2, sequence: 0 }],
  activates: [{ code: 24094653, location: 2, sequence: 0 }],
  to_bp: true,
  to_ep: true,
};
store.boardState.userField.isTurn = true;

const polyCard: FieldCard = {
  id: 'hand-0-poly',
  code: 24094653,
  name: 'Polymerization',
  controller: 0,
  location: 'hand',
  sequence: 0,
  position: 'faceup_attack',
};

const handActions = store.getLegalActionsForHandCard(polyCard);
console.log('Hand actions for Polymerization:', handActions.map((a) => a.label));

assert.strictEqual(handActions.length, 2, 'Should have 2 actions (Activate and Set Card)');
assert.strictEqual(handActions[0].label, 'Activate', '"Activate" must appear first');
assert.strictEqual(handActions[1].label, 'Set Card', '"Set Card" must appear second');
console.log('✓ "Activate" option appears before "Set Card" verified!\n');

// Test 2: Extra Deck Sequence Resilience
console.log('▶ Test 2: Verify Extra Deck sequence resilience after prior fusion summon...');

const egyxosCard: FieldCard = {
  id: 'extra-egyxos',
  code: 99900001,
  name: 'Elemental HERO Egyxos',
  controller: 0,
  location: 'extra',
  sequence: 14, // Stored as 14 prior to shift
  position: 'facedown_spell',
};

// Simulate ocgcore reporting special summon for Egyxos at shifted sequence 13 in Extra Deck (location 64)
store.activeIdleCmd = {
  summons: [],
  special_summons: [{ code: 99900001, location: 64, sequence: 13, description: 'Special Summon Egyxos' }],
  monster_sets: [],
  spell_sets: [],
  activates: [],
  to_bp: true,
  to_ep: true,
};

const extraActions = store.getLegalActionsForStackCard(egyxosCard, 'extra');
console.log('Extra deck actions for Egyxos with sequence mismatch (14 vs 13):', extraActions.map((a) => a.label));

assert.strictEqual(extraActions.length, 1, 'Egyxos must have Special Summon action despite sequence shift');
assert.strictEqual(extraActions[0].type, 'sp_summon');
console.log('✓ Extra deck sequence resilience verified!\n');

console.log('🎉 ALL ACTION ORDERING AND EXTRA SHIFT TESTS PASSED 100%!');
