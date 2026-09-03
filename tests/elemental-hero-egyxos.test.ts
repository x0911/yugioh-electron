import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { getResourcePath } from '../src/main/decks/deckLoader.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Elemental HERO Egyxos Custom Card Test Suite ===\n');

// Test 1: Card Database & Reader Verification (DIVINE / Divine-Beast)
function testCardReader() {
  console.log('▶ Test 1: Database and CardReader Registration Verification (DIVINE / Divine-Beast)...');
  const cardReader = new CardReaderService(getResourcePath('resources/cards.cdb'));
  const card = cardReader.getCardDetail(99900001);

  assert.ok(card, 'Card 99900001 must exist in database');
  assert.strictEqual(card.name, 'Elemental HERO Egyxos');
  assert.strictEqual(card.isFusion, true);
  assert.strictEqual(card.level, 10);
  assert.strictEqual(card.raceName, 'Divine-Beast', 'Race must be Divine-Beast like Slifer');
  assert.strictEqual(card.attributeName, 'DIVINE', 'Attribute must be DIVINE like Slifer');
  assert.strictEqual(card.era, 'GX');

  const allCards = cardReader.getAllCards();
  const found = allCards.find((c) => c.id === 99900001);
  assert.ok(found, 'Elemental HERO Egyxos must be found in getAllCards()');

  console.log('✓ CardReader verified: DIVINE attribute & Divine-Beast race verified!\n');
  cardReader.close();
}

// Test 2: In-Game Contact Special Summon from Extra Deck & Dynamic ATK
async function testInGameSummon() {
  console.log('▶ Test 2: Extra Deck Contact Summon, Attribute Bonuses & Variable ATK...');
  const engine = new DuelEngineService();
  await engine.init();

  const p0Deck = Array(40).fill(20721928); // Sparkman (1600/1400, LIGHT)
  const p1Deck = Array(40).fill(91152256);

  let egyxosSummoned = false;
  let selectedCount = 0;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'SPSUMMONED' && ev.description?.includes('Elemental HERO Egyxos')) {
      egyxosSummoned = true;
      console.log('✓ SPSUMMONED event fired for Elemental HERO Egyxos!');
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;

      if (ev.promptType === 'SELECT_IDLECMD') {
        const specialSummon = pData.special_summons?.find((s: any) => s.code === 99900001);
        if (specialSummon && !egyxosSummoned) {
          const spSummonOptionIndex = pData.special_summons.indexOf(specialSummon);
          console.log(`-> Found Egyxos in Extra Deck special summons (index ${spSummonOptionIndex})! Activating summon...`);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
              index: spSummonOptionIndex,
            });
          }, 10);
        } else {
          // Pass turn
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null as any,
            });
          }, 10);
        }
      } else if (ev.promptType === 'SELECT_UNSELECT_CARD') {
        // We select both materials (1 from hand [Sparkman], 1 from field [Avian])
        if (selectedCount < 2 && pData.selects && pData.selects.length > 0) {
          selectedCount++;
          console.log(`-> Selecting material #${selectedCount} from selects (options: ${pData.selects.length})...`);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_UNSELECT_CARD,
              index: 0,
            });
          }, 10);
        } else if (pData.can_finish) {
          console.log('-> Both materials selected! Finishing selection with index: null...');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_UNSELECT_CARD,
              index: null,
            });
          }, 10);
        }
      } else if (ev.promptType === 'SELECT_CARD') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            indicies: [0],
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_POSITION') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_POSITION,
            position: 1, // Face-up attack
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 10);
      }
    }
  });

  // Start duel with:
  // - Avian (21844576, WIND, 1000/1000) on field (seq 0)
  // - Draws Sparkman (20721928, LIGHT, 1600/1400) into hand
  // - Elemental HERO Egyxos (99900001) in Extra Deck
  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player0Monsters: [{ code: 21844576, sequence: 0 }],
    player0ExtraDeck: [99900001],
    startingLP: 8000,
    startingDrawCount: 1, // Draw Sparkman
    drawCountPerTurn: 0,
    humanPlayerId: 0,
    autoPlay: false,
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const bState = engine.getBoardState();
  const summonedCard = bState.userField.monsterZones.find((m) => m && m.code === 99900001);

  assert.ok(summonedCard, 'Elemental HERO Egyxos must be on the user field');
  console.log(`-> Summoned Egyxos on field: ATK = ${summonedCard.atk}, DEF = ${summonedCard.def}`);

  // Base ATK calculation:
  // Avian: 1000 ATK, Sparkman: 1600 ATK -> 2600
  // Avian is WIND -> ATK doubled -> 2600 * 2 = 5200 ATK!
  // DEF calculation:
  // Avian: 1000 DEF, Sparkman: 1400 DEF -> 2400 DEF!
  assert.strictEqual(summonedCard.atk, 5200, 'Egyxos ATK must be (1000 + 1600) * 2 = 5200 due to WIND doubling');
  assert.strictEqual(summonedCard.def, 2400, 'Egyxos DEF must be 1000 + 1400 = 2400');

  console.log('✓ Dynamic ATK doubling (WIND) and DEF calculation verified perfectly!\n');
  engine.close();
}

// Test 3: Destruction Retribution (Opponent LP Halved, Opponent Field Wiped, HEROes Summoned)
async function testDestructionRetribution() {
  console.log('▶ Test 3: Destruction Retribution (Opponent LP Halved, Opponent Field Wiped, HEROes Summoned)...');
  const engine = new DuelEngineService();
  await engine.init();

  let spSummonedFromDeck = false;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === 'SPSUMMONING' && ev.description?.includes('Elemental HERO Sparkman')) {
      spSummonedFromDeck = true;
      console.log('✓ SPSUMMONED event fired for Sparkman from Deck!');
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;

      if (ev.promptType === 'SELECT_IDLECMD') {
        // Activate Dark Hole (code 53129443) from hand to destroy Egyxos
        const dhAct = pData.activates?.find((a: any) => a.code === 53129443);
        if (dhAct) {
          const actIdx = pData.activates.indexOf(dhAct);
          console.log(`-> Activating Dark Hole (index ${actIdx}) to destroy Egyxos...`);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_ACTIVATE,
              index: actIdx,
            });
          }, 10);
          return;
        }

        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.TO_EP,
            index: null as any,
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_YESNO') {
        console.log('-> Prompted SELECT_YESNO to Special Summon from Deck? Responding YES...');
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_YESNO,
            yes: true,
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_CARD') {
        // Select Sparkman from Deck
        console.log(`-> Selecting Sparkman from Deck (available: ${pData.selects?.length}, min: ${pData.min}, max: ${pData.max})...`);
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            indicies: [0],
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_POSITION') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_POSITION,
            position: 1, // Face-up attack
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 10);
      }
    }
  });

  // Start with:
  // - Player 0: Egyxos on field (seq 0), Dark Hole at top of deck, 39 Sparkman in Deck
  // - Player 1: Has Blue-Eyes White Dragon on field (seq 0), Mirror Force set (seq 0), and 8000 LP
  // noShuffle: true guarantees Dark Hole is drawn!
  engine.startNewDuel({
    player0Deck: [...Array(39).fill(20721928), 53129443],
    player1Deck: Array(40).fill(91152256),
    player0Monsters: [{ code: 99900001, sequence: 0 }],
    player1Monsters: [{ code: 89631139, sequence: 0 }], // Blue-Eyes White Dragon
    player1SpellTraps: [{ code: 44095762, sequence: 0 }], // Mirror Force set
    noShuffle: true,
    startingLP: 8000,
    startingDrawCount: 1, // Guaranteed Dark Hole draw!
    drawCountPerTurn: 0,
    humanPlayerId: 0,
    autoPlay: false,
  });

  // Wait for destruction and retribution resolution
  for (let i = 0; i < 40 && !spSummonedFromDeck; i++) {
    await new Promise((r) => setTimeout(r, 100));
  }

  const bState = engine.getBoardState();
  console.log(`-> After Egyxos destruction: Opponent LP = ${bState.opponentField.currentLp}`);
  console.log(`-> Opponent monsters remaining on field: ${bState.opponentField.monsterZones.filter(Boolean).length}`);
  console.log(`-> Opponent spells/traps remaining on field: ${bState.opponentField.spellTrapZones.filter(Boolean).length}`);

  // Assertions:
  // 1. Opponent's LP cut in half from 8000 -> 4000!
  assert.strictEqual(bState.opponentField.currentLp, 4000, 'Opponent LP must be halved from 8000 to 4000');

  // 2. All opponent monsters and spells/traps destroyed!
  assert.strictEqual(
    bState.opponentField.monsterZones.some((m) => m && m.code === 89631139),
    false,
    'Opponent Blue-Eyes White Dragon must be destroyed'
  );
  assert.strictEqual(
    bState.opponentField.spellTrapZones.some((s) => s && s.code === 44095762),
    false,
    'Opponent Mirror Force must be destroyed'
  );

  // 3. Special summoned from deck
  assert.strictEqual(spSummonedFromDeck, true, 'Sparkman must be special summoned from Deck');

  console.log('✓ Retribution effect verified: Opponent LP halved to 4000, opponent field cleared, and HERO summoned from Deck!\n');
  engine.close();
}

// Test 4: Polymerization MUST NOT be able to summon Egyxos
async function testPolymerizationCannotSummonEgyxos() {
  console.log('▶ Test 4: Verifying Polymerization CANNOT Fusion Summon Elemental HERO Egyxos...');
  const engine = new DuelEngineService();
  await engine.init();

  let idlePromptReceived = false;
  let polyCanBeActivated = false;
  let egyxosCanBeSpecialSummoned = false;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.isPrompt && ev.promptType === 'SELECT_IDLECMD') {
      idlePromptReceived = true;
      const pData = ev.promptData as any;

      // Check if Polymerization (24094653) is activatable
      polyCanBeActivated = !!pData.activates?.some((a: any) => a.code === 24094653);

      // Check if Egyxos (99900001) is in special summons
      egyxosCanBeSpecialSummoned = !!pData.special_summons?.some((s: any) => s.code === 99900001);

      setTimeout(() => {
        engine.sendResponse({
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_EP,
          index: null as any,
        });
      }, 10);
    }
  });

  // Player 0 has:
  // - Extra Deck: ONLY Elemental HERO Egyxos (99900001)
  // - Hand: Polymerization (24094653), Avian (21844576), Sparkman (20721928)
  // Since Egyxos cannot be summoned with Polymerization, Polymerization CANNOT be activated!
  engine.startNewDuel({
    player0Deck: [
      ...Array(37).fill(20721928),
      20721928, // Sparkman
      21844576, // Avian
      24094653, // Polymerization
    ],
    player1Deck: Array(40).fill(91152256),
    player0ExtraDeck: [99900001],
    noShuffle: true,
    startingLP: 8000,
    startingDrawCount: 3, // Draws Poly, Avian, Sparkman
    drawCountPerTurn: 0,
    humanPlayerId: 0,
    autoPlay: false,
  });

  for (let i = 0; i < 30 && !idlePromptReceived; i++) {
    await new Promise((r) => setTimeout(r, 100));
  }

  assert.strictEqual(idlePromptReceived, true, 'SELECT_IDLECMD prompt must be received');
  assert.strictEqual(polyCanBeActivated, false, 'Polymerization MUST NOT be activatable to summon Egyxos');
  assert.strictEqual(egyxosCanBeSpecialSummoned, true, 'Egyxos MUST be available for its own Special Summon effect');

  console.log('✓ Verified: Polymerization cannot summon Egyxos, only its own effect can!\n');
  engine.close();
}

async function run() {
  testCardReader();
  await testInGameSummon();
  await testDestructionRetribution();
  await testPolymerizationCannotSummonEgyxos();
  console.log('🎉 ALL ELEMENTAL HERO EGYXOS CUSTOM CARD TESTS PASSED 100%!\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

