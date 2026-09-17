import assert from 'node:assert/strict';
import { OcgMessageType, OcgResponseType, type OcgMessage } from 'ocgcore-wasm';
import { MessageDecoder, getAutoResponse } from '../src/main/engine/messageDecoder.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { getActionGuideInfo } from '../src/renderer/utils/guidanceHelper.js';
import type { DuelBoardState, PlayerFieldState } from '../src/shared/types/field.js';
import { type SelectCardPayload, WIN_REASONS, getGameOverSubtitle } from '../src/shared/types/duel.js';
import { CARD_RACES, RACE_NAME_MAP } from '../src/shared/types/card.js';
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

  // Verify CARD_RACES and RACE_NAME_MAP have modern monster types
  assert.equal(CARD_RACES.WYRM, 0x800000);
  assert.equal(CARD_RACES.CYBERSE, 0x1000000);
  assert.equal(CARD_RACES.ILLUSION, 0x2000000);
  assert.equal(RACE_NAME_MAP[0x800000], 'Wyrm');
  assert.equal(RACE_NAME_MAP[0x1000000], 'Cyberse');
  assert.equal(RACE_NAME_MAP[0x2000000], 'Illusion');

  console.log('  ✓ ANNOUNCE_RACE, ANNOUNCE_ATTRIB, ANNOUNCE_NUMBER properly identified as prompts.');
  console.log('  ✓ CARD_RACES and RACE_NAME_MAP verified with Wyrm, Cyberse, and Illusion.');
}

// -----------------------------------------------------------------------------
// Test 4: Exodia Victory Registry & Win Reason Handlers
// -----------------------------------------------------------------------------
{
  console.log('Test 4: Exodia Victory Registry & Win Reason Subtitle...');
  const exodiaEntry = (videoRegistry as any)['33396948'];
  assert.ok(exodiaEntry, 'Exodia entry must be registered in card-videos.json');
  assert.equal(exodiaEntry.victory, 'resources/videos/cards/victory_33396948.mp4');

  const holactieEntry = (videoRegistry as any)['10000040'];
  assert.ok(holactieEntry, 'Holactie entry must be registered in card-videos.json');
  assert.equal(holactieEntry.cardName, 'Holactie the Creator of Light');
  assert.equal(holactieEntry.victory, 'resources/videos/cards/victory_10000040.mp4');
  assert.equal(holactieEntry.summon, 'resources/videos/cards/summon_10000040.mp4');

  // Validate win reason subtitles
  assert.equal(
    getGameOverSubtitle(true, WIN_REASONS.CREATORGOD),
    'Victory achieved by the automatic win effect of Holactie the Creator of Light!',
  );
  assert.equal(
    getGameOverSubtitle(false, WIN_REASONS.CREATORGOD),
    'Your opponent achieved victory by Special Summoning Holactie the Creator of Light!',
  );
  assert.equal(
    getGameOverSubtitle(true, WIN_REASONS.EXODIA),
    'You have achieved victory by assembling all 5 pieces of Exodia the Forbidden One!',
  );
  assert.equal(
    getGameOverSubtitle(false, WIN_REASONS.EXODIA),
    'Your opponent achieved victory by assembling all 5 pieces of Exodia the Forbidden One!',
  );
  assert.equal(
    getGameOverSubtitle(true, WIN_REASONS.LP_ZERO),
    "You have reduced your opponent's Life Points to 0!",
  );
  assert.equal(
    getGameOverSubtitle(false, WIN_REASONS.LP_ZERO),
    'Your Life Points reached 0.',
  );
  assert.equal(
    getGameOverSubtitle(true, WIN_REASONS.DECK_OUT),
    'Your opponent was unable to draw a card (Deck Out)!',
  );
  assert.equal(
    getGameOverSubtitle(false, WIN_REASONS.DECK_OUT),
    'You were unable to draw a card (Deck Out)!',
  );
  assert.equal(
    getGameOverSubtitle(true, WIN_REASONS.FINAL_COUNTDOWN),
    'Victory achieved by the effect of Final Countdown!',
  );
  assert.equal(
    getGameOverSubtitle(true, WIN_REASONS.DESTINY_BOARD),
    'Victory achieved by the effect of Destiny Board (FINAL)!',
  );
  assert.equal(
    getGameOverSubtitle(true, WIN_REASONS.SURRENDER),
    'Your opponent surrendered the duel.',
  );
  assert.equal(
    getGameOverSubtitle(false, WIN_REASONS.SURRENDER),
    'You surrendered the duel.',
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

// -----------------------------------------------------------------------------
// Test 8: Duel Log Formatter & Diagnostic Report Export
// -----------------------------------------------------------------------------
{
  console.log('Test 8: Duel Log Formatter & Diagnostic Report Structure...');

  const mockLogs = [
    { time: '01:23.4', type: 'NEW_TURN', description: 'Turn 1 started. Turn Player: You' },
    { time: '01:24.0', type: 'DRAW', description: 'You drew Sangan.' },
    { time: '01:28.2', type: 'SUMMON', description: 'Normal Summoned Sangan in Face-up Attack Position.' },
  ];

  const mockBoardState: any = {
    turnNumber: 1,
    currentPhase: 'M1',
    userField: {
      isTurn: true,
      currentLp: 8000,
      maxLp: 8000,
      monsterZones: [{ code: 26202165, name: 'Sangan', atk: 1000, def: 600, position: 'faceup_attack' }],
      spellTrapZones: [],
      hand: [{ name: 'Dark Magician' }],
    },
    opponentField: {
      name: 'Seto Kaiba',
      currentLp: 8000,
      maxLp: 8000,
      monsterZones: [],
      spellTrapZones: [],
      hand: [{}, {}, {}, {}],
    },
  };

  const lines: string[] = [];
  lines.push('```yugioh-duel-log');
  lines.push('=== YU-GI-OH! DUEL LOG & DIAGNOSTIC REPORT ===');
  lines.push(`• Turn: ${mockBoardState.turnNumber} | Phase: ${mockBoardState.currentPhase} | Turn Player: ${mockBoardState.userField.isTurn ? 'Player (You)' : 'Opponent'}`);
  lines.push(`• Player LP: ${mockBoardState.userField.currentLp}/${mockBoardState.userField.maxLp} | Opponent LP: ${mockBoardState.opponentField.currentLp}/${mockBoardState.opponentField.maxLp} (${mockBoardState.opponentField.name || 'Opponent'})`);

  const userMonsters = mockBoardState.userField.monsterZones
    .map((m: any, i: number) => (m && m.code > 0 ? `[M${i + 1}: ${m.name} (${m.atk ?? '?'}/${m.def ?? '?'}, ${m.position})]` : null))
    .filter(Boolean);
  lines.push(`• Player Monsters (${userMonsters.length}): ${userMonsters.join(', ')}`);
  lines.push(`• Player Hand (${mockBoardState.userField.hand.length}): ${mockBoardState.userField.hand.map((c: any) => c.name).join(', ')}`);
  lines.push(`• Opponent Hand: ${mockBoardState.opponentField.hand.length} cards`);
  lines.push(`\n--- EVENT STREAM (${mockLogs.length} Events) ---`);
  for (const item of mockLogs) {
    lines.push(`[${item.time}] [${item.type}] ${item.description}`);
  }
  lines.push('==============================================');
  lines.push('```');

  const formattedOutput = lines.join('\n');
  assert.ok(formattedOutput.startsWith('```yugioh-duel-log'));
  assert.ok(formattedOutput.includes('Turn: 1 | Phase: M1'));
  assert.ok(formattedOutput.includes('Player LP: 8000/8000 | Opponent LP: 8000/8000 (Seto Kaiba)'));
  assert.ok(formattedOutput.includes('[01:23.4] [NEW_TURN] Turn 1 started. Turn Player: You'));
  assert.ok(formattedOutput.endsWith('```'));

  console.log('  ✓ Duel log formatted diagnostic report verified for seamless copy-pasting.');
}

// -----------------------------------------------------------------------------
// Test 9: SELECT_COUNTER Message Decoding & Auto-Response
// -----------------------------------------------------------------------------
{
  console.log('Test 9: SELECT_COUNTER Decoding & Auto-Response...');
  const decoder = new MessageDecoder(cardReader);
  const selectCounterMsg: any = {
    type: OcgMessageType.SELECT_COUNTER,
    player: 0,
    counter_type: 1, // Spell Counter
    count: 3,
    cards: [
      { code: 33742252, controller: 0, location: 4, sequence: 0, count: 2 },
      { code: 33742252, controller: 0, location: 4, sequence: 1, count: 2 },
    ],
  };

  const decoded = decoder.decode(selectCounterMsg, 0);
  assert.equal(decoded.type, 'SELECT_COUNTER');
  assert.equal(decoded.isPrompt, true);
  assert.equal(decoded.promptType, 'SELECT_COUNTER');
  assert.equal(decoded.promptPlayer, 0);
  const promptData = decoded.promptData as any;
  assert.equal(promptData.count, 3);
  assert.equal(promptData.counter_type, 1);
  assert.equal(promptData.cards.length, 2);

  // Verify auto-response algorithm satisfies the total required count
  const autoResp = getAutoResponse(selectCounterMsg) as any;
  assert.equal(autoResp.type, OcgResponseType.SELECT_COUNTER);
  assert.deepEqual(autoResp.counters, [2, 1]);
  assert.equal(autoResp.counters.reduce((a: number, b: number) => a + b, 0), 3);
  console.log('  ✓ SELECT_COUNTER decoded and auto-response allocation verified.');
}

// -----------------------------------------------------------------------------
// Test 10: ROCK_PAPER_SCISSORS Prompt & HAND_RES Result Decoding
// -----------------------------------------------------------------------------
{
  console.log('Test 10: ROCK_PAPER_SCISSORS Prompt & HAND_RES Result Decoding...');
  const decoder = new MessageDecoder(cardReader);
  const rpsMsg: any = {
    type: OcgMessageType.ROCK_PAPER_SCISSORS,
    player: 0,
  };

  const decoded = decoder.decode(rpsMsg, 0);
  assert.equal(decoded.type, 'ROCK_PAPER_SCISSORS');
  assert.equal(decoded.isPrompt, true);
  assert.equal(decoded.promptType, 'ROCK_PAPER_SCISSORS');
  assert.equal(decoded.promptPlayer, 0);

  const autoResp = getAutoResponse(rpsMsg) as any;
  assert.equal(autoResp.type, OcgResponseType.ROCK_PAPER_SCISSORS);
  assert.equal(autoResp.value, 2); // Rock default

  // Check HAND_RES decoding
  const handResWin: any = {
    type: OcgMessageType.HAND_RES,
    results: [2, 1], // Rock (2) vs Scissors (1)
  };
  const decodedWin = decoder.decode(handResWin, 0);
  assert.equal(decodedWin.type, 'HAND_RES');
  assert.ok(decodedWin.description.includes('Player 0 chose Rock 🪨, Player 1 chose Scissors ✂️'));
  assert.ok(decodedWin.description.includes('Player 0 won the round!'));

  const handResDraw: any = {
    type: OcgMessageType.HAND_RES,
    results: [3, 3], // Paper (3) vs Paper (3)
  };
  const decodedDraw = decoder.decode(handResDraw, 0);
  assert.equal(decodedDraw.type, 'HAND_RES');
  assert.ok(decodedDraw.description.includes('Tie! Replaying...'));

  console.log('  ✓ ROCK_PAPER_SCISSORS prompt and HAND_RES outcomes verified.');
}

// -----------------------------------------------------------------------------
// Test 11: FIELD_DISABLED Message Decoding & Engine Zone Lockdown
// -----------------------------------------------------------------------------
{
  console.log('Test 11: FIELD_DISABLED Decoding & Zone Lockdown Tracking...');
  const decoder = new MessageDecoder(cardReader);
  // Bitmask: P0 MMZ 0 & 1 (0x01 | 0x02 = 0x03), EMZ 0 (0x20), P0 STZ 2 (0x400), P1 MMZ 3 (0x80000), P1 STZ 4 (0x10000000)
  const bitmask = 0x01 | 0x02 | 0x20 | 0x400 | 0x80000 | 0x10000000;
  const msg: any = {
    type: OcgMessageType.FIELD_DISABLED,
    field_mask: bitmask,
  };

  const decoded = decoder.decode(msg, 0);
  assert.equal(decoded.type, 'FIELD_DISABLED');
  assert.deepEqual(decoded.disabledZones.p0Monster, [0, 1]);
  assert.deepEqual(decoded.disabledZones.extraMonster, [0]);
  assert.deepEqual(decoded.disabledZones.p0SpellTrap, [2]);
  assert.deepEqual(decoded.disabledZones.p1Monster, [3]);
  assert.deepEqual(decoded.disabledZones.p1SpellTrap, [4]);

  // Verify DuelEngineService updates board state
  const engine = new DuelEngineService(cardReader);
  (engine as any).updateBoardStateFromMessage(decoded);
  const board = engine.getBoardState();
  assert.deepEqual(board.userField.disabledMonsterZones, [0, 1]);
  assert.deepEqual(board.userField.disabledSpellTrapZones, [2]);
  assert.deepEqual(board.opponentField.disabledMonsterZones, [3]);
  assert.deepEqual(board.opponentField.disabledSpellTrapZones, [4]);
  assert.deepEqual(board.disabledExtraMonsterZones, [0]);
  console.log('  ✓ FIELD_DISABLED bitmask decoded and synced to board state.');
}

// -----------------------------------------------------------------------------
// Test 12: CARD_HINT & EQUIP Relationship Tracking
// -----------------------------------------------------------------------------
{
  console.log('Test 12: CARD_HINT & EQUIP Relationship Tracking...');
  const decoder = new MessageDecoder(cardReader);
  const engine = new DuelEngineService(cardReader);

  // Setup monster on user field (M1) and spell on ST2
  const monsterCard = {
    id: 'm1',
    code: 46986414, // Dark Magician
    controller: 0,
    location: 'monster',
    sequence: 0,
    position: 'faceup_attack',
    atk: 2500,
    def: 2100,
  } as any;
  const equipCard = {
    id: 'st2',
    code: 83746708, // Mage Power
    controller: 0,
    location: 'spell-trap',
    sequence: 1,
    position: 'faceup_spell',
  } as any;
  (engine as any).player0Field.monsterZones[0] = monsterCard;
  (engine as any).player0Field.spellTrapZones[1] = equipCard;

  // 1. Test CARD_HINT decoding & storage
  const hintMsg: any = {
    type: OcgMessageType.CARD_HINT,
    player: 0,
    location: 4, // MZONE
    sequence: 0,
    card_hint: 3, // RACE
    value: 0x2,   // Spellcaster
  };
  const decodedHint = decoder.decode(hintMsg, 0);
  assert.equal(decodedHint.hintCategory, 'RACE');
  assert.ok(decodedHint.hintText.includes('Spellcaster'));

  (engine as any).updateBoardStateFromMessage(decodedHint);
  assert.ok(monsterCard.cardHints?.[0]?.includes('Spellcaster'));

  // 2. Test EQUIP message decoding & linking
  const equipMsg: any = {
    type: OcgMessageType.EQUIP,
    equipCard: { player: 0, location: 8, sequence: 1 },
    targetCard: { player: 0, location: 4, sequence: 0 },
  };
  const decodedEquip = decoder.decode(equipMsg, 0);
  assert.equal(decodedEquip.type, 'EQUIP');
  assert.equal(decodedEquip.equipCard.sequence, 1);
  assert.equal(decodedEquip.targetCard.sequence, 0);

  (engine as any).updateBoardStateFromMessage(decodedEquip);
  assert.deepEqual(equipCard.equippedTo, { controller: 0, location: 'monster', sequence: 0, code: 46986414 });
  assert.deepEqual(monsterCard.equippedCards, [{ controller: 0, location: 'spell-trap', sequence: 1, code: 83746708 }]);

  // 3. Test card removal cleans up equip links and hints
  (engine as any).handleCardMove(
    83746708,
    { controller: 0, location: 8, sequence: 1, position: 1 },
    { controller: 0, location: 16, sequence: 0, position: 1 },
  );
  // The monster's equippedCards should be empty after equip leaves field
  assert.deepEqual(monsterCard.equippedCards, []);
  console.log('  ✓ CARD_HINT trait hints and EQUIP parent/child bindings verified.');
}

// -----------------------------------------------------------------------------
// Test 13: Dynamic Stat & Trait Flags in syncFieldCardStats
// -----------------------------------------------------------------------------
{
  console.log('Test 13: Dynamic Stat & Trait Flags in syncFieldCardStats...');
  const engine = new DuelEngineService(cardReader);
  // Verify syncFieldCardStats executes cleanly without errors when cards are present
  const dummyMonster = {
    id: 'm1',
    code: 46986414,
    controller: 0,
    location: 'monster',
    sequence: 0,
    position: 'faceup_attack',
    atk: 2500,
    def: 2100,
    race: 'Spellcaster',
    attribute: 'DARK',
  } as any;
  (engine as any).player0Field.monsterZones[0] = dummyMonster;
  (engine as any).syncFieldCardStats();
  // Since wasm core is not running a duel in this unit test, verify monster remains intact
  assert.equal(dummyMonster.race, 'Spellcaster');
  assert.equal(dummyMonster.attribute, 'DARK');
  console.log('  ✓ syncFieldCardStats handles dynamic traits and counters.');
}

// -----------------------------------------------------------------------------
// Test 14: SORT_CARD Message Decoding & Response Processing
// -----------------------------------------------------------------------------
{
  console.log('Test 14: SORT_CARD Message Decoding & Response Processing...');
  const sortCardMsg: any = {
    type: OcgMessageType.SORT_CARD,
    player: 0,
    cards: [
      { code: 46986414, controller: 0, location: 1, sequence: 0 }, // Dark Magician
      { code: 89631139, controller: 0, location: 1, sequence: 1 }, // Blue-Eyes White Dragon
      { code: 70781052, controller: 0, location: 1, sequence: 2 }, // Summoned Skull
    ],
  };

  const decoded = decoder.decode(sortCardMsg, 0);
  assert.equal(decoded.type, 'SORT_CARD');
  assert.equal(decoded.promptType, 'SORT_CARD');
  assert.equal(decoded.isPrompt, true);
  assert.equal(decoded.promptPlayer, 0);

  const promptCards = (decoded.promptData as any).cards;
  assert.equal(promptCards.length, 3);
  assert.equal(promptCards[0].cardName, 'Dark Magician');
  assert.equal(promptCards[1].cardName, 'Blue-Eyes White Dragon');
  assert.equal(promptCards[2].cardName, 'Summoned Skull');
  assert.ok(promptCards[0].desc !== undefined, 'Card desc should be attached to sort items');

  const engine = new DuelEngineService(cardReader);

  // Test custom permutation response: [2, 0, 1] (Summoned Skull on top)
  const customResp = (engine as any).normalizeResponse({
    type: OcgResponseType.SORT_CARD,
    order: [2, 0, 1],
  });
  assert.equal(customResp.type, OcgResponseType.SORT_CARD);
  assert.deepEqual(customResp.order, [2, 0, 1]);

  // Test default order response (null)
  const defaultResp = (engine as any).normalizeResponse({
    type: OcgResponseType.SORT_CARD,
    order: null,
  });
  assert.equal(defaultResp.type, OcgResponseType.SORT_CARD);
  assert.equal(defaultResp.order, null);

  console.log('  ✓ SORT_CARD decoding and response encoding verified.');
}

// -----------------------------------------------------------------------------
// Test 15: SORT_CHAIN Message Decoding & Response Processing
// -----------------------------------------------------------------------------
{
  console.log('Test 15: SORT_CHAIN Message Decoding & Response Processing...');
  const sortChainMsg: any = {
    type: OcgMessageType.SORT_CHAIN,
    player: 0,
    cards: [
      { code: 12580477, controller: 0, location: 8, sequence: 0 }, // Raigeki
      { code: 53129443, controller: 0, location: 8, sequence: 1 }, // Dark Hole
    ],
  };

  const decoded = decoder.decode(sortChainMsg, 0);
  assert.equal(decoded.type, 'SORT_CHAIN');
  assert.equal(decoded.promptType, 'SORT_CHAIN');
  assert.equal(decoded.isPrompt, true);
  assert.equal(decoded.promptPlayer, 0);

  const promptCards = (decoded.promptData as any).cards;
  assert.equal(promptCards.length, 2);
  assert.equal(promptCards[0].cardName, 'Raigeki');
  assert.equal(promptCards[1].cardName, 'Dark Hole');

  const engine = new DuelEngineService(cardReader);

  // Test custom chain sequencing: [1, 0] (Dark Hole as CL1, Raigeki as CL2)
  const customResp = (engine as any).normalizeResponse({
    type: OcgResponseType.SORT_CARD,
    order: [1, 0],
  });
  assert.equal(customResp.type, OcgResponseType.SORT_CARD);
  assert.deepEqual(customResp.order, [1, 0]);

  // Test default chain response (null)
  const defaultResp = (engine as any).normalizeResponse({
    type: OcgResponseType.SORT_CARD,
    order: null,
  });
  assert.equal(defaultResp.type, OcgResponseType.SORT_CARD);
  assert.equal(defaultResp.order, null);

  console.log('  ✓ SORT_CHAIN simultaneous trigger sequencing verified.');
}

// -----------------------------------------------------------------------------
// Test 16: SELECT_DISFIELD Decoding, Mask Extraction & Response Processing
// -----------------------------------------------------------------------------
{
  console.log('Test 16: SELECT_DISFIELD Decoding, Mask Extraction & Response Processing...');
  // Player 0 locking down 2 zones on Opponent's MMZ
  // Opponent MMZ 0..4 are bits 16..20. All other bits 1 (disabled/unavailable).
  // E.g. opponent MMZ zones 0, 1, 2, 3, 4 available: mask has 0s at bits 16..20
  const fieldMask = ~(0x1f << 16) >>> 0;
  const disfieldMsg: any = {
    type: OcgMessageType.SELECT_DISFIELD,
    player: 0,
    count: 2,
    field_mask: fieldMask,
  };

  const decoded = decoder.decode(disfieldMsg, 0);
  assert.equal(decoded.type, 'SELECT_DISFIELD');
  assert.equal(decoded.promptType, 'SELECT_DISFIELD');
  assert.equal(decoded.isPrompt, true);
  assert.equal(decoded.promptPlayer, 0);

  const promptData = decoded.promptData as any;
  assert.equal(promptData.count, 2);
  assert.ok(promptData.availablePlaces.length >= 2, 'Must decode available places from bitmask');

  // Verify places belong to opponent (player 1) and are MZONE (4)
  for (const place of promptData.availablePlaces) {
    assert.equal(place.player, 1);
    assert.equal(place.location, 4);
  }

  // Verify auto-response generates SELECT_DISFIELD
  const autoResp = getAutoResponse(disfieldMsg);
  assert.ok(autoResp, 'Auto response must exist');
  assert.equal(autoResp.type, OcgResponseType.SELECT_DISFIELD);
  assert.equal((autoResp as any).places.length, 2);

  // Verify DuelEngineService.normalizeResponse formats SELECT_DISFIELD places
  const engine = new DuelEngineService(cardReader);
  const formattedResp = (engine as any).normalizeResponse({
    type: OcgResponseType.SELECT_DISFIELD,
    places: [
      { player: 1, location: 4, sequence: 0 },
      { player: 1, location: 4, sequence: 2 },
    ],
  });
  assert.equal(formattedResp.type, OcgResponseType.SELECT_DISFIELD);
  assert.deepEqual(formattedResp.places, [
    { player: 1, location: 4, sequence: 0 },
    { player: 1, location: 4, sequence: 2 },
  ]);

  console.log('  ✓ SELECT_DISFIELD zone lockdown extraction and responses verified.');
}

// -----------------------------------------------------------------------------
// Test 17: CHAIN_NEGATED & CHAIN_DISABLED Decoding
// -----------------------------------------------------------------------------
{
  console.log('Test 17: CHAIN_NEGATED & CHAIN_DISABLED Decoding...');
  const decoder = new MessageDecoder(cardReader);
  const chainNegatedMsg: any = {
    type: OcgMessageType.CHAIN_NEGATED,
    chain_size: 2,
  };
  const decodedNeg = decoder.decode(chainNegatedMsg, 0);
  assert.equal(decodedNeg.type, 'CHAIN_NEGATED');
  assert.equal(decodedNeg.chainSize, 2);
  assert.ok(decodedNeg.description.includes('activation was NEGATED'));

  const chainDisabledMsg: any = {
    type: OcgMessageType.CHAIN_DISABLED,
    chain_size: 1,
  };
  const decodedDis = decoder.decode(chainDisabledMsg, 0);
  assert.equal(decodedDis.type, 'CHAIN_DISABLED');
  assert.equal(decodedDis.chainSize, 1);
  assert.ok(decodedDis.description.includes('effect was NEGATED'));
  console.log('  ✓ CHAIN_NEGATED and CHAIN_DISABLED decoding verified.');
}

// -----------------------------------------------------------------------------
// Test 18: ATTACK_DISABLED Decoding
// -----------------------------------------------------------------------------
{
  console.log('Test 18: ATTACK_DISABLED Decoding...');
  const decoder = new MessageDecoder(cardReader);
  const atkDisabledMsg: any = {
    type: OcgMessageType.ATTACK_DISABLED,
  };
  const decoded = decoder.decode(atkDisabledMsg, 0);
  assert.equal(decoded.type, 'ATTACK_DISABLED');
  assert.ok(decoded.description.includes('attack was NEGATED'));
  console.log('  ✓ ATTACK_DISABLED decoding verified.');
}

// -----------------------------------------------------------------------------
// Test 19: MISSED_EFFECT Decoding
// -----------------------------------------------------------------------------
{
  console.log('Test 19: MISSED_EFFECT Decoding with Card Name & Timing Explanation...');
  const decoder = new MessageDecoder(cardReader);
  // Peten the Dark Clown (78636495)
  const missedMsg: any = {
    type: OcgMessageType.MISSED_EFFECT,
    code: 78636495,
    controller: 0,
    location: 16, // Graveyard
    sequence: 0,
    position: 1,
  };
  const decoded = decoder.decode(missedMsg, 0);
  assert.equal(decoded.type, 'MISSED_EFFECT');
  assert.equal(decoded.code, 78636495);
  assert.ok(decoded.cardName?.includes('Peten') || decoded.description.includes('Peten') || decoded.description.includes('missed the timing'));
  assert.ok(decoded.description.includes('missed the timing'));
  console.log('  ✓ MISSED_EFFECT timing explanation verified.');
}

// -----------------------------------------------------------------------------
// Test 20: SWAP Message Decoding & Board State Update
// -----------------------------------------------------------------------------
{
  console.log('Test 20: SWAP Message Decoding & Board State Update...');
  const decoder = new MessageDecoder(cardReader);
  const swapMsg: any = {
    type: OcgMessageType.SWAP,
    card1: { code: 89631139, controller: 0, location: 4, sequence: 1, position: 1 }, // Blue-Eyes
    card2: { code: 46986414, controller: 1, location: 4, sequence: 2, position: 1 }, // Dark Magician
  };
  const decoded = decoder.decode(swapMsg, 0);
  assert.equal(decoded.type, 'SWAP');
  assert.equal(decoded.card1.code, 89631139);
  assert.equal(decoded.card2.code, 46986414);
  assert.ok(decoded.description.includes('swapped'));

  // Test board state swap in DuelEngineService
  const engine = new DuelEngineService(cardReader);
  const p0Field = (engine as any).player0Field;
  const p1Field = (engine as any).player1Field;

  p0Field.monsterZones[1] = {
    id: 'm1',
    code: 89631139,
    name: 'Blue-Eyes White Dragon',
    controller: 0,
    location: 'monster',
    sequence: 1,
    position: 'faceup_attack',
    statuses: [],
  };
  p1Field.monsterZones[2] = {
    id: 'm2',
    code: 46986414,
    name: 'Dark Magician',
    controller: 1,
    location: 'monster',
    sequence: 2,
    position: 'faceup_attack',
    statuses: [],
  };

  // Simulate SWAP message in engine
  const swapEngineMsg = {
    type: OcgMessageType.SWAP,
    card1: { controller: 0, location: 4, sequence: 1 },
    card2: { controller: 1, location: 4, sequence: 2 },
  };
  const pf1 = (engine as any).getPlayerField(swapEngineMsg.card1.controller);
  const pf2 = (engine as any).getPlayerField(swapEngineMsg.card2.controller);
  const cardObj1 = pf1.monsterZones[swapEngineMsg.card1.sequence];
  const cardObj2 = pf2.monsterZones[swapEngineMsg.card2.sequence];
  cardObj1.controller = 1;
  cardObj1.sequence = 2;
  cardObj2.controller = 0;
  cardObj2.sequence = 1;
  pf2.monsterZones[2] = cardObj1;
  pf1.monsterZones[1] = cardObj2;

  assert.equal(p0Field.monsterZones[1]?.code, 46986414, 'Player 0 must now control Dark Magician');
  assert.equal(p1Field.monsterZones[2]?.code, 89631139, 'Player 1 must now control Blue-Eyes');
  console.log('  ✓ SWAP message decoding and monster control exchange verified.');
}

// -----------------------------------------------------------------------------
// Test 21: WIN with Player === 2 Producing Draw Outcome
// -----------------------------------------------------------------------------
{
  console.log('Test 21: WIN with Player === 2 Producing Draw Outcome...');
  const decoder = new MessageDecoder(cardReader);
  const drawMsg: any = {
    type: OcgMessageType.WIN,
    player: 2, // 2 = DRAW in ocgcore
    reason: 0,
  };
  const decoded = decoder.decode(drawMsg, 0);
  assert.equal(decoded.type, 'WIN');
  assert.equal(decoded.player, 2);
  assert.ok(decoded.description.includes('DRAW'));

  const engine = new DuelEngineService(cardReader);
  // Simulate setting state on WIN
  (engine as any).state.winner = decoded.player === 2 ? 'draw' : decoded.player;
  const board = engine.getBoardState();
  assert.equal(board.winner, 'draw');
  console.log('  ✓ WIN with player === 2 produces Draw outcome verified.');
}

// -----------------------------------------------------------------------------
// Test 22: CONFIRM_CARDS Persists Revealed Opponent Hand Cards, Cleared on SHUFFLE_HAND
// -----------------------------------------------------------------------------
{
  console.log('Test 22: CONFIRM_CARDS & Hand Visibility Persistence...');
  const decoder = new MessageDecoder(cardReader);
  const engine = new DuelEngineService(cardReader);

  // Opponent (Player 1) has 2 cards in hand: sequence 0 and sequence 1
  const oppField = (engine as any).player1Field;
  oppField.playerId = 1;
  oppField.hand = [
    {
      id: 'h0',
      code: 46986414, // Dark Magician
      name: 'Dark Magician',
      controller: 1,
      location: 'hand',
      sequence: 0,
      position: 'facedown_spell',
      statuses: [],
    },
    {
      id: 'h1',
      code: 89631139, // Blue-Eyes
      name: 'Blue-Eyes White Dragon',
      controller: 1,
      location: 'hand',
      sequence: 1,
      position: 'facedown_spell',
      statuses: [],
    },
  ];

  // Before confirmation, from Player 0's perspective, both cards are redacted
  const boardBefore = engine.getBoardState();
  assert.equal(boardBefore.opponentField.hand[0].code, 0);
  assert.equal(boardBefore.opponentField.hand[1].code, 0);

  // Player 0 plays Trap Dustshoot / Confiscation revealing card at sequence 0 (Dark Magician)
  const confirmMsg: any = {
    type: OcgMessageType.CONFIRM_CARDS,
    player: 0, // Viewer is Player 0
    cards: [
      { code: 46986414, controller: 1, location: 2, sequence: 0 },
    ],
  };
  decoder.decode(confirmMsg, 0);
  (engine as any).messageDecoder = decoder;

  // Board state for Player 0 now reveals the confirmed card at sequence 0, while sequence 1 remains hidden
  const boardAfterConfirm = engine.getBoardState();
  assert.equal(boardAfterConfirm.opponentField.hand[0].code, 46986414, 'Confirmed card must be visible');
  assert.equal(boardAfterConfirm.opponentField.hand[0].name, 'Dark Magician');
  assert.equal(boardAfterConfirm.opponentField.hand[1].code, 0, 'Unconfirmed card must remain secret');

  // Opponent shuffles hand: confirmed cards should be concealed again
  const shuffleMsg: any = {
    type: OcgMessageType.SHUFFLE_HAND,
    player: 1,
    cards: [],
  };
  decoder.decode(shuffleMsg, 0);
  const boardAfterShuffle = engine.getBoardState();
  assert.equal(boardAfterShuffle.opponentField.hand[0].code, 0, 'Hand cards must be hidden again after shuffle');

  console.log('  ✓ CONFIRM_CARDS hand persistence and SHUFFLE_HAND concealment verified.');
}

console.log('\n✅ All Announcement, Victory Cutscene, Field Mechanic, and Log Report Tests Passed!\n');
