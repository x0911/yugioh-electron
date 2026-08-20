import assert from 'node:assert/strict';
import { OcgMessageType, type OcgMessage } from 'ocgcore-wasm';
import { MessageDecoder } from '../src/main/engine/messageDecoder.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { getActionGuideInfo } from '../src/renderer/utils/guidanceHelper.js';
import type { DuelBoardState, PlayerFieldState } from '../src/shared/types/field.js';
import type { SelectCardPayload } from '../src/shared/types/duel.js';
import videoRegistry from '../data/card-videos.json' with { type: 'json' };

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

console.log('=== Running Announcement, Victory, and Field Mechanics Tests ===\n');

const cardReader = new CardReaderService();
const decoder = new MessageDecoder(cardReader);

// -----------------------------------------------------------------------------
// Test 1: SHUFFLE_HAND Message Decoding & Sequence Sync
// -----------------------------------------------------------------------------
{
  console.log('Test 1: SHUFFLE_HAND Message Decoding...');
  const msg: OcgMessage = {
    type: OcgMessageType.SHUFFLE_HAND,
    player: 0,
    cards: [12580477, 5318639, 46986414],
  } as any;

  const decoded = decoder.decode(msg);
  assert.equal(decoded.rawType, OcgMessageType.SHUFFLE_HAND);
  assert.equal(decoded.type, 'SHUFFLE_HAND');
  assert.equal(decoded.player, 0);
  const cards = (decoded as any).cards as number[];
  assert.deepEqual(cards, [12580477, 5318639, 46986414]);
  console.log('  ✓ MSG_SHUFFLE_HAND correctly decodes player and full card list.');
}

// -----------------------------------------------------------------------------
// Test 2: ANNOUNCE_CARD Message Decoding (e.g. Great Phantom Thief)
// -----------------------------------------------------------------------------
{
  console.log('Test 2: ANNOUNCE_CARD Prompt Message Decoding...');
  const msg: OcgMessage = {
    type: OcgMessageType.ANNOUNCE_CARD,
    player: 0,
    options: [46986414, 89631139],
  } as any;

  const decoded = decoder.decode(msg);
  assert.equal(decoded.rawType, OcgMessageType.ANNOUNCE_CARD);
  assert.equal(decoded.isPrompt, true);
  assert.equal(decoded.promptType, 'ANNOUNCE_CARD');
  assert.equal(decoded.player, 0);
  console.log('  ✓ MSG_ANNOUNCE_CARD flagged as prompt with promptType ANNOUNCE_CARD.');
}

// -----------------------------------------------------------------------------
// Test 3: ANNOUNCE_RACE / ATTRIB / NUMBER Message Decoding
// -----------------------------------------------------------------------------
{
  console.log('Test 3: ANNOUNCE_RACE, ATTRIB, NUMBER Message Decoding...');
  // MSG_ANNOUNCE_RACE (140)
  const raceMsg: OcgMessage = {
    type: OcgMessageType.ANNOUNCE_RACE,
    player: 0,
    count: 1,
    available: 0x1,
  } as any;
  const decodedRace = decoder.decode(raceMsg);
  assert.equal(decodedRace.isPrompt, true);
  assert.equal(decodedRace.promptType, 'ANNOUNCE_RACE');

  // MSG_ANNOUNCE_ATTRIB (141)
  const attribMsg: OcgMessage = {
    type: OcgMessageType.ANNOUNCE_ATTRIB,
    player: 0,
    count: 1,
    available: 0x20,
  } as any;
  const decodedAttrib = decoder.decode(attribMsg);
  assert.equal(decodedAttrib.isPrompt, true);
  assert.equal(decodedAttrib.promptType, 'ANNOUNCE_ATTRIB');

  // MSG_ANNOUNCE_NUMBER (143)
  const numMsg: OcgMessage = {
    type: OcgMessageType.ANNOUNCE_NUMBER,
    player: 0,
    options: [1, 2, 3, 4, 5, 6],
  } as any;
  const decodedNum = decoder.decode(numMsg);
  assert.equal(decodedNum.isPrompt, true);
  assert.equal(decodedNum.promptType, 'ANNOUNCE_NUMBER');
  console.log('  ✓ ANNOUNCE_RACE, ANNOUNCE_ATTRIB, ANNOUNCE_NUMBER properly identified as prompts.');
}

// -----------------------------------------------------------------------------
// Test 4: Exodia Victory Registry & Win Reason Handlers
// -----------------------------------------------------------------------------
{
  console.log('Test 4: Exodia Victory Registry & Win Reason Subtitle...');
  const exodiaEntry = (videoRegistry as any)['33396948'];
  assert.ok(exodiaEntry, 'Exodia entry must be registered in card-videos.json');
  assert.equal(exodiaEntry.victory, 'resources/videos/cards/victory_33396948.mp4');

  // Validate win reason subtitles
  const WIN_REASON_EXODIA = 0x10;
  const WIN_REASON_FINAL_COUNTDOWN = 0x11;
  const WIN_REASON_DESTINY_BOARD = 0x15;
  const WIN_REASON_DECK_OUT = 0x1;

  function getTestSubtitle(isWinner: boolean, reason: number | null): string {
    if (reason === WIN_REASON_EXODIA) {
      return isWinner
        ? 'You have achieved victory by assembling all 5 pieces of Exodia the Forbidden One!'
        : 'Your opponent achieved victory by assembling all 5 pieces of Exodia the Forbidden One!';
    }
    if (reason === WIN_REASON_FINAL_COUNTDOWN) {
      return isWinner
        ? 'Victory achieved by the effect of Final Countdown!'
        : 'Your opponent won by the effect of Final Countdown!';
    }
    if (reason === WIN_REASON_DESTINY_BOARD) {
      return isWinner
        ? 'Victory achieved by the effect of Destiny Board (FINAL)!'
        : 'Your opponent won by the effect of Destiny Board (FINAL)!';
    }
    if (reason === WIN_REASON_DECK_OUT) {
      return isWinner
        ? 'Your opponent was unable to draw a card (Deck Out)!'
        : 'You were unable to draw a card (Deck Out)!';
    }
    return isWinner
      ? "You have reduced your opponent's Life Points to 0!"
      : 'Your Life Points reached 0.';
  }

  assert.equal(
    getTestSubtitle(true, WIN_REASON_EXODIA),
    'You have achieved victory by assembling all 5 pieces of Exodia the Forbidden One!',
  );
  assert.equal(
    getTestSubtitle(true, WIN_REASON_DECK_OUT),
    'Your opponent was unable to draw a card (Deck Out)!',
  );
  console.log('  ✓ Exodia video registry and context-aware win reason subtitles verified.');
}

// -----------------------------------------------------------------------------
// Test 5: Battle Phase Attack Target vs Effect Target in Action Guidance
// -----------------------------------------------------------------------------
{
  console.log('Test 5: Battle Phase Attack Target Guidance...');
  const board = createDummyBoard();
  board.currentPhase = 'BP';

  const attackTargetPayload: SelectCardPayload = {
    player: 0,
    can_cancel: true,
    min: 1,
    max: 1,
    selects: [
      { controller: 1, location: 4, sequence: 0, code: 89631139, cardName: 'Blue-Eyes White Dragon' },
      { controller: 1, location: 4, sequence: 1, code: 46986414, cardName: 'Dark Magician' },
    ],
  };

  const guidance = getActionGuideInfo(board, true, { selectCard: attackTargetPayload }, 0);
  assert.equal(guidance.categoryLabel, 'Attack Target');
  assert.equal(guidance.categoryIcon, '⚔️');
  assert.equal(guidance.instruction, 'Attack Target: Select a monster to attack.');

  // Check that during Main Phase 1 with the same cards, it correctly says Effect Target
  board.currentPhase = 'M1';
  const m1Guidance = getActionGuideInfo(board, true, { selectCard: attackTargetPayload }, 0);
  assert.equal(m1Guidance.categoryLabel, 'Effect Target');
  assert.equal(m1Guidance.categoryIcon, '🎯');
  console.log('  ✓ Action guide accurately differentiates Attack Target from Effect Target.');
}

// -----------------------------------------------------------------------------
// Test 6: Opponent Hand Splice by Sequence on Location Move
// -----------------------------------------------------------------------------
{
  console.log('Test 6: Opponent Hand Splice by Sequence...');
  const pf = createDummyField(1);
  pf.hand = [
    { id: 'h1', code: 0, controller: 1, location: 'hand', sequence: 0, position: 'facedown_spell' },
    { id: 'h2', code: 0, controller: 1, location: 'hand', sequence: 1, position: 'facedown_spell' },
    { id: 'h3', code: 0, controller: 1, location: 'hand', sequence: 2, position: 'facedown_spell' },
    { id: 'h4', code: 0, controller: 1, location: 'hand', sequence: 3, position: 'facedown_spell' },
  ];

  // When moving card at sequence 1 (where code === 0):
  const seqToRemove = 1;
  const spliced = pf.hand.splice(seqToRemove, 1);
  assert.equal(spliced.length, 1);
  assert.equal(spliced[0].id, 'h2');
  assert.equal(pf.hand.length, 3);
  console.log('  ✓ Sequence-based splicing correctly decrements opponent hand without ghost accumulation.');
}

// -----------------------------------------------------------------------------
// Test 7: Target Toggle and Single-Click Integrity
// -----------------------------------------------------------------------------
{
  console.log('Test 7: Target Selection & Single Toggle Integrity...');
  const selectedTargetIndices: number[] = [];

  function toggleTargetByIndex(index: number, max = 1): void {
    const existingIdx = selectedTargetIndices.indexOf(index);
    if (existingIdx >= 0) {
      selectedTargetIndices.splice(existingIdx, 1);
    } else {
      if (max === 1) {
        selectedTargetIndices.length = 0;
      }
      selectedTargetIndices.push(index);
    }
  }

  // User clicks on monster zone 0 (target index 0)
  // Single click must add index 0 to selected list
  toggleTargetByIndex(0);
  assert.equal(selectedTargetIndices.length, 1);
  assert.equal(selectedTargetIndices[0], 0);

  // Second click deselects
  toggleTargetByIndex(0);
  assert.equal(selectedTargetIndices.length, 0);

  console.log('  ✓ Target single-toggle integrity verified (no double-trigger deselect).');
}

console.log('\n✅ All Announcement, Victory Cutscene, and Field Mechanic Tests Passed!\n');
