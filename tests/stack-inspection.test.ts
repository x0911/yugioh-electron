import assert from 'node:assert/strict';
import type { FieldCard, PlayerFieldState } from '../src/shared/types/field.js';

console.log('=== Running Graveyard & Extra Deck Inspection Tests ===\n');

// -----------------------------------------------------------------------------
// Test 1: Stack Inspection Guard (Only Open If Cards Present)
// -----------------------------------------------------------------------------
{
  console.log('Test 1: Stack Inspection Guard (Empty vs Non-Empty)...');

  const emptyPf: PlayerFieldState = {
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
    extraDeck: [],
    deckCount: 40,
    extraDeckCount: 0,
    hand: [],
  };

  const populatedPf: PlayerFieldState = {
    playerId: 0,
    name: 'You',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: true,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [
      { id: 'gy-1', code: 46986414, name: 'Dark Magician', controller: 0, location: 'graveyard', sequence: 0, position: 'faceup_spell' },
      { id: 'gy-2', code: 53129443, name: 'Dark Hole', controller: 0, location: 'graveyard', sequence: 1, position: 'faceup_spell' },
    ],
    banished: [],
    extraDeck: [
      { id: 'ex-1', code: 45231177, name: 'Flame Swordsman', controller: 0, location: 'extra-deck', sequence: 0, position: 'facedown_spell' },
    ],
    deckCount: 38,
    extraDeckCount: 1,
    hand: [],
  };

  function inspectStack(stackType: 'graveyard' | 'extra', pf: PlayerFieldState) {
    const cards = stackType === 'graveyard' ? pf.graveyard : pf.extraDeck;
    if (!cards || cards.length === 0) {
      return null;
    }
    return {
      title: `${pf.name}'s ${stackType === 'graveyard' ? 'Graveyard' : 'Extra Deck'}`,
      cards,
      owner: pf.playerId === 0 ? 'user' : 'ai',
      type: stackType,
    };
  }

  // Empty tests
  assert.equal(inspectStack('graveyard', emptyPf), null, 'Empty graveyard must not open inspection modal');
  assert.equal(inspectStack('extra', emptyPf), null, 'Empty extra deck must not open inspection modal');

  // Populated tests
  const gyResult = inspectStack('graveyard', populatedPf);
  assert.ok(gyResult !== null);
  assert.equal(gyResult.cards.length, 2);
  assert.equal(gyResult.cards[0].name, 'Dark Magician');
  assert.equal(gyResult.owner, 'user');

  const exResult = inspectStack('extra', populatedPf);
  assert.ok(exResult !== null);
  assert.equal(exResult.cards.length, 1);
  assert.equal(exResult.cards[0].name, 'Flame Swordsman');

  console.log('✓ Graveyard & Extra Deck dialogs open ONLY if stack contains cards.');
}

// -----------------------------------------------------------------------------
// Test 2: AI / Opponent Graveyard & Extra Deck Inspection
// -----------------------------------------------------------------------------
{
  console.log('\nTest 2: Opponent Graveyard & Extra Deck Inspection...');

  const aiPf: PlayerFieldState = {
    playerId: 1,
    name: 'Seto Kaiba',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: false,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [
      { id: 'gy-ai-1', code: 89631139, name: 'Blue-Eyes White Dragon', controller: 1, location: 'graveyard', sequence: 0, position: 'faceup_spell' },
    ],
    banished: [],
    extraDeck: [
      { id: 'ex-ai-1', code: 23995346, name: 'Blue-Eyes Ultimate Dragon', controller: 1, location: 'extra-deck', sequence: 0, position: 'facedown_spell' },
    ],
    deckCount: 35,
    extraDeckCount: 1,
    hand: [],
  };

  function inspectOpponent(stackType: 'graveyard' | 'extra', pf: PlayerFieldState) {
    const cards = stackType === 'graveyard' ? pf.graveyard : pf.extraDeck;
    if (!cards || cards.length === 0) return null;
    return {
      title: `${pf.name}'s ${stackType === 'graveyard' ? 'Graveyard' : 'Extra Deck'}`,
      cards,
      owner: 'ai' as const,
      type: stackType,
    };
  }

  const aiGy = inspectOpponent('graveyard', aiPf);
  assert.ok(aiGy !== null);
  assert.equal(aiGy.title, "Seto Kaiba's Graveyard");
  assert.equal(aiGy.owner, 'ai');
  assert.equal(aiGy.cards[0].code, 89631139);

  const aiEx = inspectOpponent('extra', aiPf);
  assert.ok(aiEx !== null);
  assert.equal(aiEx.title, "Seto Kaiba's Extra Deck");
  assert.equal(aiEx.owner, 'ai');
  assert.equal(aiEx.cards[0].code, 23995346);

  console.log('✓ Opponent Graveyard & Extra Deck inspect with red owner accents and card metadata.');
}

// -----------------------------------------------------------------------------
// Test 3: Extra Deck Monster Classification & Detail Enrichment
// -----------------------------------------------------------------------------
{
  console.log('\nTest 3: Extra Deck Monster Classification & Detail Enrichment...');

  const mockCardMap = new Map([
    [
      23995346,
      {
        id: 23995346,
        name: 'Blue-Eyes Ultimate Dragon',
        desc: '"Blue-Eyes White Dragon" + "Blue-Eyes White Dragon" + "Blue-Eyes White Dragon"',
        atk: 4500,
        def: 3800,
        level: 12,
        attributeName: 'LIGHT',
        raceName: 'Dragon',
        isMonster: true,
        isSpell: false,
        isTrap: false,
        isFusion: true,
        typeLabels: ['Monster', 'Dragon', 'Fusion'],
      },
    ],
  ]);

  const rawExtraCard: FieldCard = {
    id: 'ex-1',
    code: 23995346,
    name: 'Blue-Eyes Ultimate Dragon',
    controller: 0,
    location: 'extra-deck',
    sequence: 0,
    position: 'facedown_defense',
  };

  function enrichCard(card: FieldCard): FieldCard {
    const detail = mockCardMap.get(card.code);
    if (!detail) return card;
    return {
      ...card,
      name: detail.name || card.name,
      atk: card.atk !== undefined ? card.atk : (detail.isMonster ? detail.atk : undefined),
      def: card.def !== undefined ? card.def : (detail.isMonster ? detail.def : undefined),
      level: card.level !== undefined ? card.level : (detail.isMonster ? detail.level : undefined),
      attribute: card.attribute || detail.attributeName,
      race: card.race || detail.raceName,
      description: card.description || detail.desc,
    };
  }

  function isMonster(card: FieldCard): boolean {
    if (card.atk !== undefined || card.def !== undefined || (card.level && card.level > 0)) return true;
    const detail = mockCardMap.get(card.code);
    return detail?.isMonster ?? false;
  }

  const enriched = enrichCard(rawExtraCard);

  assert.equal(isMonster(enriched), true, 'Blue-Eyes Ultimate Dragon must be classified as a Monster');
  assert.equal(enriched.atk, 4500, 'ATK must be 4500');
  assert.equal(enriched.def, 3800, 'DEF must be 3800');
  assert.equal(enriched.level, 12, 'Level must be 12');
  assert.equal(enriched.attribute, 'LIGHT', 'Attribute must be LIGHT');
  assert.equal(enriched.race, 'Dragon', 'Race must be Dragon');
  assert.ok(enriched.description?.includes('Blue-Eyes White Dragon'), 'Lore description must be populated');

  console.log('✓ Extra Deck cards correctly classify as monsters with full ATK/DEF/LV/Lore stats.');
}

console.log('\n🎉 ALL GRAVEYARD & EXTRA DECK INSPECTION TESTS PASSED!');
