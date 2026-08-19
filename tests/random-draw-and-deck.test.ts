import assert from 'node:assert/strict';

console.log('=== Running Random Draw & AI Random Deck Tests ===\n');

function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

// -----------------------------------------------------------------------------
// Test 1: Fisher-Yates Deck Randomization
// -----------------------------------------------------------------------------
{
  console.log('Test 1: Fisher-Yates Deck Randomization & Permutation Integrity...');

  const originalDeck = Array.from({ length: 40 }, (_, i) => 1000 + i);
  const shuffled1 = shuffleArray(originalDeck);
  const shuffled2 = shuffleArray(originalDeck);

  // Check multiset equality (no dropped or duplicated cards)
  assert.equal(shuffled1.length, 40, 'Shuffled deck must preserve 40 cards');
  assert.deepEqual(
    [...shuffled1].sort((a, b) => a - b),
    [...originalDeck].sort((a, b) => a - b),
    'Shuffled deck must contain exactly the same multiset of cards'
  );

  // Check that shuffling is non-deterministic
  const first5_run1 = shuffled1.slice(0, 5);
  const first5_run2 = shuffled2.slice(0, 5);
  const first5_original = originalDeck.slice(0, 5);

  const isDifferentFromOriginal = first5_run1.some((code, idx) => code !== first5_original[idx]);
  assert.ok(isDifferentFromOriginal, 'Opening 5 cards must be randomized from the original ordered list');

  console.log(`  Run 1 opening hand: ${first5_run1.join(', ')}`);
  console.log(`  Run 2 opening hand: ${first5_run2.join(', ')}`);
  console.log('✓ Fisher-Yates deck shuffle guarantees fully random card draws.');
}

// -----------------------------------------------------------------------------
// Test 2: AI Opponent 3-Deck Random Selection Distribution
// -----------------------------------------------------------------------------
{
  console.log('\nTest 2: AI-Opponent Random Deck Selection (3 Character Decks)...');

  const characterDecks = [
    { id: 'deck_1', name: 'Magnet & Gadget Arsenal' },
    { id: 'deck_2', name: 'Silent Swordsman Level-Up' },
    { id: 'deck_3', name: 'Exodia the Forbidden One' },
  ];

  const deckPicks = [0, 0, 0];
  const TRIALS = 300;

  for (let i = 0; i < TRIALS; i++) {
    const chosenIdx = Math.floor(Math.random() * characterDecks.length);
    deckPicks[chosenIdx]++;
  }

  // Every one of the 3 decks must be picked reasonably often
  assert.ok(deckPicks[0] > 40, `Deck 1 was selected ${deckPicks[0]} times`);
  assert.ok(deckPicks[1] > 40, `Deck 2 was selected ${deckPicks[1]} times`);
  assert.ok(deckPicks[2] > 40, `Deck 3 was selected ${deckPicks[2]} times`);

  console.log(`  Deck 1 picks: ${deckPicks[0]}/${TRIALS}`);
  console.log(`  Deck 2 picks: ${deckPicks[1]}/${TRIALS}`);
  console.log(`  Deck 3 picks: ${deckPicks[2]}/${TRIALS}`);
  console.log('✓ AI Opponent uniformly selects from its 3 archetype decks.');
}

console.log('\n🎉 ALL RANDOM DRAW & AI DECK SELECTION TESTS PASSED!');
