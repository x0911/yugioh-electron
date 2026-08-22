import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ViewFilterService } from '../src/main/engine/viewFilter.js';
import type { FieldCard, PlayerFieldState } from '../src/shared/types/field.js';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

function createMockCard(params: Partial<FieldCard>): FieldCard {
  return {
    id: `card-${Math.random().toString(36).slice(2, 7)}`,
    code: params.code ?? 1000,
    name: params.name ?? 'Mock Monster',
    controller: params.controller ?? 0,
    location: params.location ?? 'monster',
    sequence: params.sequence ?? 0,
    position: params.position ?? 'faceup_attack',
    atk: 1000,
    def: 1000,
    level: 4,
    statuses: [],
    ...params,
  };
}

function createMockField(playerId: 0 | 1, isTurn = false): PlayerFieldState {
  return {
    playerId,
    name: `Player ${playerId}`,
    currentLp: 8000,
    maxLp: 8000,
    isTurn,
    deckCount: 35,
    extraDeckCount: 0,
    hand: [
      createMockCard({ code: 89631139, name: 'Blue-Eyes White Dragon', location: 'hand', controller: playerId, sequence: 0 }),
      createMockCard({ code: 55144522, name: 'Pot of Greed', location: 'hand', controller: playerId, sequence: 1 }),
    ],
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
  };
}

describe('Continuous Hand-Reveal Mechanics & ViewFilter Integrity', () => {
  const filterService = new ViewFilterService();

  it('Default State: Opponent hand cards are redacted to code: 0 and Card Back', () => {
    const userField = createMockField(0, true);
    const oppField = createMockField(1, false);

    const filteredOpp = filterService.filterPlayerFieldForViewer(oppField, 0, userField);
    assert.equal(filteredOpp.hand.length, 2);
    assert.equal(filteredOpp.hand[0].code, 0);
    assert.equal(filteredOpp.hand[0].name, 'Card Back');
    assert.equal(filteredOpp.hand[1].code, 0);
    assert.equal(filteredOpp.hand[1].name, 'Card Back');
  });

  it('Ceremonial Bell (Face-up Defense on Player 0 field): Reveals Player 1 hand to Player 0', () => {
    const userField = createMockField(0, true);
    const oppField = createMockField(1, false);

    // Player 0 controls face-up defense Ceremonial Bell (code 20228463)
    userField.monsterZones[0] = createMockCard({
      code: 20228463,
      name: 'Ceremonial Bell',
      controller: 0,
      position: 'faceup_defense',
      def: 1850,
    });

    assert.equal(filterService.isPlayerHandPublic(oppField, userField, 0), true);

    const filteredOpp = filterService.filterPlayerFieldForViewer(oppField, 0, userField);
    assert.equal(filteredOpp.hand[0].code, 89631139);
    assert.equal(filteredOpp.hand[0].name, 'Blue-Eyes White Dragon');
    assert.equal(filteredOpp.hand[1].code, 55144522);
    assert.equal(filteredOpp.hand[1].name, 'Pot of Greed');
  });

  it('Ceremonial Bell (Face-up Attack on Player 1 field): Reveals Player 1 hand to Player 0', () => {
    const userField = createMockField(0, true);
    const oppField = createMockField(1, false);

    // Player 1 controls face-up attack Ceremonial Bell
    oppField.monsterZones[2] = createMockCard({
      code: 20228463,
      name: 'Ceremonial Bell',
      controller: 1,
      position: 'faceup_attack',
      atk: 0,
    });

    assert.equal(filterService.isPlayerHandPublic(oppField, userField, 0), true);

    const filteredOpp = filterService.filterPlayerFieldForViewer(oppField, 0, userField);
    assert.equal(filteredOpp.hand[0].code, 89631139);
    assert.equal(filteredOpp.hand[1].code, 55144522);
  });

  it('Ceremonial Bell (Face-down Defense): Does NOT reveal hand', () => {
    const userField = createMockField(0, true);
    const oppField = createMockField(1, false);

    // Ceremonial Bell is face-down
    userField.monsterZones[0] = createMockCard({
      code: 20228463,
      name: 'Ceremonial Bell',
      controller: 0,
      position: 'facedown_defense',
    });

    assert.equal(filterService.isPlayerHandPublic(oppField, userField, 0), false);

    const filteredOpp = filterService.filterPlayerFieldForViewer(oppField, 0, userField);
    assert.equal(filteredOpp.hand[0].code, 0);
    assert.equal(filteredOpp.hand[0].name, 'Card Back');
  });

  it('Respect Play (Face-up Continuous Trap): Reveals active turn player hand', () => {
    const userField = createMockField(0, true); // P0 turn
    const oppField = createMockField(1, false);

    userField.spellTrapZones[0] = createMockCard({
      code: 8953736,
      name: 'Respect Play',
      location: 'spell-trap',
      position: 'faceup_spell',
      controller: 0,
    });

    // P0 is turn player: P0 hand is public to P1
    assert.equal(filterService.isPlayerHandPublic(userField, oppField, 1), true);
    // P1 is NOT turn player: P1 hand is NOT public to P0
    assert.equal(filterService.isPlayerHandPublic(oppField, userField, 0), false);
  });

  it('DRAW Event with Ceremonial Bell active preserves drawn card names', () => {
    const drawEvent: DecodedDuelEvent = {
      type: 'DRAW',
      player: 1,
      drawnCards: [{ code: 44095762, cardName: 'Mirror Force' }],
      description: 'Player 1 drew 1 card(s).',
      isPrompt: false,
    };

    // When isOpponentHandPublic is true:
    const filteredEvent = filterService.filterEventForViewer(drawEvent, 0, true);
    assert.equal(filteredEvent.drawnCards?.[0].code, 44095762);
    assert.equal(filteredEvent.drawnCards?.[0].cardName, 'Mirror Force');

    // When isOpponentHandPublic is false:
    const hiddenEvent = filterService.filterEventForViewer(drawEvent, 0, false);
    assert.equal(hiddenEvent.drawnCards?.[0].code, 0);
    assert.equal(hiddenEvent.drawnCards?.[0].cardName, 'Card Back');
  });
});
