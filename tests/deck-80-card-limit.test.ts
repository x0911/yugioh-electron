import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDeck, DECK_LIMITS } from '../src/shared/types/deck.js';

test('1. Deck Limits: MAX_MAIN is 80 cards', () => {
  assert.strictEqual(DECK_LIMITS.MAX_MAIN, 80, 'Maximum Main Deck size must be 80 cards');
  assert.strictEqual(DECK_LIMITS.MIN_MAIN, 40, 'Minimum Main Deck size must be 40 cards');
});

test('2. Validation: Deck with 60 cards is valid', () => {
  // 60-card deck (e.g. 20 cards x 3 copies = 60 cards)
  const main: number[] = [];
  for (let i = 1; i <= 20; i++) {
    main.push(i, i, i);
  }
  assert.strictEqual(main.length, 60);

  const validity = validateDeck(main);
  assert.strictEqual(validity.isValid, true);
  assert.strictEqual(validity.errors.length, 0);
});

test('3. Validation: Deck with 80 cards is valid', () => {
  // 80-card deck (e.g. 26 cards x 3 copies + 2 cards x 1 copy = 80 cards)
  const main: number[] = [];
  for (let i = 1; i <= 26; i++) {
    main.push(i, i, i);
  }
  main.push(27, 28);
  assert.strictEqual(main.length, 80);

  const validity = validateDeck(main);
  assert.strictEqual(validity.isValid, true);
  assert.strictEqual(validity.errors.length, 0);
  assert.strictEqual(validity.mainCount, 80);
});

test('4. Validation: Deck with 81 cards fails validation with clean message', () => {
  const main: number[] = [];
  for (let i = 1; i <= 27; i++) {
    main.push(i, i, i);
  }
  assert.strictEqual(main.length, 81);

  const validity = validateDeck(main);
  assert.strictEqual(validity.isValid, false);
  assert.ok(validity.errors.some((e) => e.includes('maximum 80 allowed')));
});
