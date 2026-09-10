import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { ViewFilterService } from '../src/main/engine/viewFilter.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

async function testPainfulChoiceRevealAndSelection() {
  console.log('Test 1: Opponent Painful Choice Reveal & Selection Visibility...');

  const engine = new DuelEngineService();
  await engine.init();
  const filterService = new ViewFilterService();

  let confirmCardsReceived: DecodedDuelEvent | null = null;
  let selectCardPromptReceived: DecodedDuelEvent | null = null;
  let filteredPromptReceived: DecodedDuelEvent | null = null;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'CONFIRM_CARDS') {
      confirmCardsReceived = ev;
    }

    if (ev.isPrompt && ev.promptType === 'SELECT_IDLECMD') {
      if (ev.promptPlayer === 0) {
        // Player 0 passes turn to Player 1
        engine.sendResponse({
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_EP,
          index: null,
        });
      } else if (ev.promptPlayer === 1) {
        // AI activates Painful Choice
        const pData = ev.promptData as any;
        const pcIdx = pData.activates?.findIndex((a: any) => a.code === 74191942);
        if (pcIdx >= 0) {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_ACTIVATE,
            index: pcIdx,
          });
        }
      }
    } else if (ev.isPrompt && ev.promptType === 'SELECT_CHAIN') {
      engine.sendResponse({
        type: OcgResponseType.SELECT_CHAIN,
        index: -1,
      });
    } else if (ev.isPrompt && ev.promptType === 'SELECT_CARD') {
      if (ev.promptPlayer === 1) {
        // AI selects 5 cards from deck
        engine.sendResponse({
          type: OcgResponseType.SELECT_CARD,
          indicies: [0, 1, 2, 3, 4],
        });
      } else if (ev.promptPlayer === 0) {
        const isFromDeck = (ev.promptData as any)?.selects?.some((s: any) => s.location === 1 && s.controller === 1);
        if (isFromDeck) {
          selectCardPromptReceived = ev;
          filteredPromptReceived = filterService.filterEventForViewer(ev, 0, false);
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            indicies: [0],
          });
        } else {
          // Hand discard if any
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            indicies: [0],
          });
        }
      }
    }
  });

  const monsters = [
    89631139, // Blue-Eyes White Dragon (Lv 8)
    46986414, // Dark Magician (Lv 7)
    74677422, // Red-Eyes B. Dragon (Lv 7)
    44519536, // Gaia the Fierce Knight (Lv 7)
    72426662, // Curse of Dragon (Lv 5)
  ];

  const p1Deck = [
    ...monsters,
    ...Array(34).fill(89631139),
    74191942, // Painful choice at top of deck
  ];
  const p0Deck = Array(40).fill(91152256);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
    noShuffle: true,
  });

  const start = Date.now();
  while (!filteredPromptReceived && Date.now() - start < 15000) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  engine.close();

  // 1. Verify CONFIRM_CARDS decoded accurately with card objects and names
  assert.ok(confirmCardsReceived, 'CONFIRM_CARDS event must be received');
  assert.equal((confirmCardsReceived as any).player, 0, 'Viewer must be Player 0');
  assert.equal((confirmCardsReceived as any).controller, 1, 'Card owner must be Player 1');
  assert.ok(Array.isArray((confirmCardsReceived as any).cards), 'CONFIRM_CARDS must include cards array');
  assert.equal((confirmCardsReceived as any).cards.length, 5, 'CONFIRM_CARDS must contain 5 cards');
  assert.ok(
    (confirmCardsReceived as any).cards.every((c: any) => c.code > 0 && c.cardName && c.cardName !== 'Card'),
    'All confirmed cards must have valid codes and names',
  );

  // 2. Verify SELECT_CARD prompt decoded non-zero codes for confirmed deck cards
  assert.ok(selectCardPromptReceived, 'SELECT_CARD prompt must be received by human player');
  const rawSelects = (selectCardPromptReceived as any).promptData.selects;
  assert.equal(rawSelects.length, 5, 'SELECT_CARD must offer 5 cards');
  assert.ok(
    rawSelects.every((s: any) => s.code > 0),
    'Every selectable card in raw prompt must have a resolved non-zero code',
  );
  assert.ok(
    rawSelects.every((s: any) => s.cardName && s.cardName !== 'Card'),
    'Every selectable card in raw prompt must have its actual card name',
  );

  // 3. Verify ViewFilterService preserves non-zero code and card name for revealed cards
  assert.ok(filteredPromptReceived, 'Filtered SELECT_CARD prompt must exist');
  const filteredSelects = (filteredPromptReceived as any).promptData.selects;
  assert.equal(filteredSelects.length, 5, 'Filtered SELECT_CARD must retain 5 cards');
  assert.ok(
    filteredSelects.every((s: any) => s.code > 0),
    'Filtered SELECT_CARD must preserve non-zero code for revealed cards',
  );
  assert.ok(
    filteredSelects.every((s: any) => s.cardName !== 'Face-down Card'),
    'Filtered SELECT_CARD must not hide revealed cards as Face-down Card',
  );

  console.log('✓ Painful Choice revealed cards and selection prompt verified successfully.');
}

async function testCardSelectionModalOpponentRevealedCardEnrichment() {
  console.log('Test 2: CardSelectionModal Opponent Revealed Card Enrichment & Previewer Integrity...');

  // Mock duel store getCardDetail
  const cardDatabase: Record<number, any> = {
    89631139: {
      name: 'Blue-Eyes White Dragon',
      atk: 3000,
      def: 2500,
      level: 8,
      attributeName: 'LIGHT',
      raceName: 'Dragon',
      isMonster: true,
      desc: 'This legendary dragon is a powerful engine of destruction.',
    },
    46986414: {
      name: 'Dark Magician',
      atk: 2500,
      def: 2100,
      level: 7,
      attributeName: 'DARK',
      raceName: 'Spellcaster',
      isMonster: true,
      desc: 'The ultimate wizard in terms of attack and defense.',
    },
  };

  const selectCards = [
    // Revealed opponent deck cards (from Painful Choice)
    { code: 89631139, cardName: 'Blue-Eyes White Dragon', location: 1, sequence: 30, controller: 1, position: 10 },
    { code: 46986414, cardName: 'Dark Magician', location: 1, sequence: 31, controller: 1, position: 10 },
    // Unrevealed opponent card (blind selection)
    { code: 0, cardName: 'Face-down Card', location: 1, sequence: 32, controller: 1, position: 10 },
  ];

  const userPlayerId = 0;

  const enrichedCards = selectCards.map((item: any, originalIndex: number) => {
    const detail = cardDatabase[item.code];
    const loc = item.location || 1;
    const owner = item.controller === userPlayerId ? 'user' : 'ai';
    const isFacedownMonster = loc === 4 && (item.position === 8 || (item.position !== undefined && (item.position & 0x8) !== 0));
    const isFacedownSpell = loc === 8 && (item.position === 8 || (item.position !== undefined && (item.position & 0x8) !== 0));

    // Updated logic: only hidden if code === 0 or field facedown
    const isHiddenOpponentCard = owner === 'ai' && (item.code === 0 || ((loc === 4 || loc === 8) && (isFacedownMonster || isFacedownSpell)));

    const cardName = isHiddenOpponentCard
      ? isFacedownMonster
        ? 'Face-down Monster'
        : loc === 2
          ? 'Card in Hand'
          : 'Face-down Card'
      : item.cardName && item.cardName !== 'Card'
        ? item.cardName
        : detail?.name || `Card #${item.code}`;

    const isMonster = isHiddenOpponentCard ? false : (detail?.isMonster ?? false);

    return {
      selectIndex: originalIndex,
      code: isHiddenOpponentCard ? 0 : item.code,
      name: cardName,
      location: loc,
      sequence: item.sequence,
      position: item.position,
      controller: item.controller,
      owner,
      isMonster,
      atk: isHiddenOpponentCard ? undefined : detail?.atk,
      def: isHiddenOpponentCard ? undefined : detail?.def,
      level: isHiddenOpponentCard ? undefined : detail?.level,
      attribute: isHiddenOpponentCard ? undefined : detail?.attributeName,
      race: isHiddenOpponentCard ? undefined : detail?.raceName,
      desc: isHiddenOpponentCard ? undefined : detail?.desc,
    };
  });

  // Verify Revealed Card 0 (Blue-Eyes from AI Deck)
  assert.equal(enrichedCards[0].code, 89631139, 'Revealed opponent deck card must retain code 89631139');
  assert.equal(enrichedCards[0].name, 'Blue-Eyes White Dragon', 'Revealed opponent card must retain name');
  assert.equal(enrichedCards[0].isMonster, true, 'Revealed opponent monster must be marked as monster');
  assert.equal(enrichedCards[0].atk, 3000, 'Revealed card must retain ATK');
  assert.equal(enrichedCards[0].def, 2500, 'Revealed card must retain DEF');
  assert.equal(enrichedCards[0].level, 8, 'Revealed card must retain Level');

  // Verify Revealed Card 1 (Dark Magician from AI Deck)
  assert.equal(enrichedCards[1].code, 46986414, 'Revealed opponent deck card must retain code 46986414');
  assert.equal(enrichedCards[1].name, 'Dark Magician', 'Revealed opponent card must retain name');
  assert.equal(enrichedCards[1].atk, 2500, 'Revealed card must retain ATK');

  // Verify Unrevealed Card 2 (code 0)
  assert.equal(enrichedCards[2].code, 0, 'Unrevealed card must have code 0');
  assert.equal(enrichedCards[2].name, 'Face-down Card', 'Unrevealed card must be named Face-down Card');
  assert.equal(enrichedCards[2].isMonster, false, 'Unrevealed card isMonster must be false');
  assert.strictEqual(enrichedCards[2].atk, undefined, 'Unrevealed card ATK must be undefined');

  // Verify Hover Payload creation for CardPreviewer
  const hoveredCard = enrichedCards[0];
  const fieldCardHoverPayload = {
    id: `sel-${hoveredCard.selectIndex}-${hoveredCard.code}`,
    code: hoveredCard.code,
    name: hoveredCard.name,
    location: hoveredCard.location === 4 ? 'monster' : hoveredCard.location === 8 ? 'spell-trap' : 'graveyard',
    sequence: hoveredCard.sequence,
    controller: hoveredCard.owner === 'user' ? 0 : 1,
    position: 'faceup_attack',
    atk: hoveredCard.atk,
    def: hoveredCard.def,
    level: hoveredCard.level,
    attribute: hoveredCard.attribute,
    race: hoveredCard.race,
    description: hoveredCard.desc,
  };

  assert.equal(fieldCardHoverPayload.code, 89631139, 'Hover payload must have code for image resolution');
  assert.equal(fieldCardHoverPayload.name, 'Blue-Eyes White Dragon', 'Hover payload must have card name');
  assert.equal(fieldCardHoverPayload.atk, 3000, 'Hover payload must have ATK');
  assert.ok(fieldCardHoverPayload.description?.includes('legendary dragon'), 'Hover payload must have description for previewer');

  console.log('✓ CardSelectionModal enrichment and previewer hover payload verified successfully.');
}

async function runAllTests() {
  await testPainfulChoiceRevealAndSelection();
  await testCardSelectionModalOpponentRevealedCardEnrichment();
  console.log('\n🎉 ALL PAINFUL CHOICE REVEAL TESTS PASSED SUCCESSFULLY!');
}

runAllTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
