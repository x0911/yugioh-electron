import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { FieldCard, PlayerFieldState } from '../src/shared/types/field.js';
import { getCardImageUrl } from '../src/renderer/utils/media.js';

function createEmptyPlayerFieldState(): PlayerFieldState {
  return {
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

function isFaceUpFieldCard(card: FieldCard | null | undefined): boolean {
  if (!card || !card.code || card.code <= 0) return false;
  return (
    card.position === 'faceup_spell' ||
    (card.position as any) === 'faceup_attack' ||
    (typeof card.position === 'number' && (card.position & 0x1) !== 0) ||
    card.isFaceUp === true
  );
}

function resolveActiveFieldSpell(userState: PlayerFieldState, opponentState: PlayerFieldState): {
  card: FieldCard | null;
  artUrl: string | null;
} {
  let card: FieldCard | null = null;
  if (isFaceUpFieldCard(userState.fieldZone)) {
    card = userState.fieldZone;
  } else if (isFaceUpFieldCard(opponentState.fieldZone)) {
    card = opponentState.fieldZone;
  }

  const artUrl = card && card.code > 0 ? getCardImageUrl(card.code, 'art') : null;
  return { card, artUrl };
}

describe('Field Spell Dynamic Arena Floor Background Integration', () => {
  it('1. Default State: No Field Spell active -> artUrl is null (obsidian arena floor)', () => {
    const userState = createEmptyPlayerFieldState();
    const opponentState = createEmptyPlayerFieldState();

    const { card, artUrl } = resolveActiveFieldSpell(userState, opponentState);
    assert.equal(card, null, 'Active field card should be null');
    assert.equal(artUrl, null, 'Artwork URL should be null on default arena floor');
  });

  it('2. Face-Down Field Spell: Setting a Field Spell does not change arena floor', () => {
    const userState = createEmptyPlayerFieldState();
    const opponentState = createEmptyPlayerFieldState();

    // User sets Skyscraper face-down
    userState.fieldZone = {
      id: 'field_1',
      code: 63035430, // Skyscraper
      name: 'Skyscraper',
      controller: 0,
      location: 'field',
      sequence: 0,
      position: 'facedown_spell',
    };

    const { card, artUrl } = resolveActiveFieldSpell(userState, opponentState);
    assert.equal(card, null, 'Face-down field spell must not be active');
    assert.equal(artUrl, null, 'Artwork URL should remain null for face-down card');
  });

  it('3. User Activates Field Spell: Changes arena floor background to field spell artwork', () => {
    const userState = createEmptyPlayerFieldState();
    const opponentState = createEmptyPlayerFieldState();

    // User activates Mountain (50913601)
    userState.fieldZone = {
      id: 'field_1',
      code: 50913601, // Mountain
      name: 'Mountain',
      controller: 0,
      location: 'field',
      sequence: 0,
      position: 'faceup_spell',
    };

    const { card, artUrl } = resolveActiveFieldSpell(userState, opponentState);
    assert.notEqual(card, null, 'Active field card should be resolved');
    assert.equal(card?.code, 50913601);
    assert.equal(card?.name, 'Mountain');
    assert.equal(artUrl, 'app-resource://cards/art/50913601.jpg', 'Must resolve to Mountain art URL');
  });

  it('4. Opponent Activates Field Spell: Changes arena floor background to opponent field spell artwork', () => {
    const userState = createEmptyPlayerFieldState();
    const opponentState = createEmptyPlayerFieldState();

    // Opponent activates Toon Kingdom (43175858)
    opponentState.fieldZone = {
      id: 'field_2',
      code: 43175858, // Toon Kingdom
      name: 'Toon Kingdom',
      controller: 1,
      location: 'field',
      sequence: 0,
      position: 'faceup_spell',
    };

    const { card, artUrl } = resolveActiveFieldSpell(userState, opponentState);
    assert.notEqual(card, null);
    assert.equal(card?.code, 43175858);
    assert.equal(artUrl, 'app-resource://cards/art/43175858.jpg', 'Must resolve to Toon Kingdom art URL');
  });

  it('5. Field Spell Replacement: Activating a new Field Spell updates the arena background', () => {
    const userState = createEmptyPlayerFieldState();
    const opponentState = createEmptyPlayerFieldState();

    // First: Neo Space (42015635)
    userState.fieldZone = {
      id: 'field_1',
      code: 42015635, // Neo Space
      name: 'Neo Space',
      controller: 0,
      location: 'field',
      sequence: 0,
      position: 'faceup_spell',
    };

    let result = resolveActiveFieldSpell(userState, opponentState);
    assert.equal(result.artUrl, 'app-resource://cards/art/42015635.jpg');

    // Replaced by Golden Castle of Stromberg (72283691)
    userState.fieldZone = {
      id: 'field_3',
      code: 72283691, // Golden Castle of Stromberg
      name: 'Golden Castle of Stromberg',
      controller: 0,
      location: 'field',
      sequence: 0,
      position: 'faceup_spell',
    };

    result = resolveActiveFieldSpell(userState, opponentState);
    assert.equal(result.artUrl, 'app-resource://cards/art/72283691.jpg');
  });

  it('6. Field Spell Destruction: Destroying field spell reverts arena floor back to obsidian', () => {
    const userState = createEmptyPlayerFieldState();
    const opponentState = createEmptyPlayerFieldState();

    // Active field spell
    userState.fieldZone = {
      id: 'field_1',
      code: 63035430, // Skyscraper
      name: 'Skyscraper',
      controller: 0,
      location: 'field',
      sequence: 0,
      position: 'faceup_spell',
    };

    let result = resolveActiveFieldSpell(userState, opponentState);
    assert.equal(result.artUrl, 'app-resource://cards/art/63035430.jpg');

    // Destroyed to Graveyard (fieldZone becomes null)
    userState.fieldZone = null;
    userState.graveyard.push({
      id: 'field_1',
      code: 63035430,
      name: 'Skyscraper',
      controller: 0,
      location: 'graveyard',
      sequence: 0,
      position: 'faceup_spell',
    });

    result = resolveActiveFieldSpell(userState, opponentState);
    assert.equal(result.card, null, 'Active field spell should be null after destruction');
    assert.equal(result.artUrl, null, 'Artwork URL must revert to null to restore original arena floor');
  });
});
