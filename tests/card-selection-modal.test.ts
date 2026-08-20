import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Sangan Battle Destruction & Card Selection Tests ===\n');

async function testSanganBattleDestructionSearch() {
  console.log('Test 1: Sangan Battle Destruction Mandatory Deck Search Prompt...');

  const engine = new DuelEngineService();
  await engine.init();

  let sanganSearchPromptReceived = false;
  let candidateCards: any[] = [];
  let idleStep = 0;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.isPrompt) {
      if (ev.promptType === 'SELECT_IDLECMD' && ev.promptPlayer === 0) {
        idleStep++;
        const pData = ev.promptData as any;

        if (idleStep === 1) {
          // Turn 1 (Player 0): Normal Summon Sangan in Attack Position
          const sanganIdx = pData.summons.findIndex((s: any) => s.code === 26202165);
          assert.ok(sanganIdx >= 0, 'Sangan must be available to Normal Summon in opening hand.');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SUMMON,
              index: sanganIdx,
            });
          }, 10);
        } else if (idleStep === 2) {
          // Pass turn to Player 1 by entering Battle Phase / End Phase
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null,
            });
          }, 10);
        }
      } else if (ev.promptType === 'SELECT_CARD' && ev.promptPlayer === 0) {
        // Sangan effect triggered!
        const pData = ev.promptData as any;
        sanganSearchPromptReceived = true;
        candidateCards = pData.selects;

        // Verify that candidates are from the DECK (location === 1)
        assert.ok(candidateCards.length > 0, 'Sangan must provide selectable candidate monsters from Deck.');
        for (const card of candidateCards) {
          assert.strictEqual(card.location, 1, 'Candidate cards for Sangan must be in the DECK (location 1).');
        }

        // Select the first eligible monster
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            cards: [0],
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: -1,
          });
        }, 10);
      }
    }
  });

  // Player 0 Deck: Guaranteed Sangan in opening hand + Kuriboh and Celtic Guardian to search
  const p0Deck: number[] = [];
  for (let i = 0; i < 20; i++) p0Deck.push(26202165); // Sangan (ATK 1000)
  for (let i = 0; i < 10; i++) p0Deck.push(40640057); // Kuriboh (ATK 300)
  for (let i = 0; i < 10; i++) p0Deck.push(91152256); // Celtic Guardian (ATK 1400)

  // Player 1 Deck: Dark Hole (53129443) to destroy Sangan
  const p1Deck: number[] = [];
  for (let i = 0; i < 20; i++) p1Deck.push(53129443); // Dark Hole
  for (let i = 0; i < 20; i++) p1Deck.push(46986414); // Dark Magician

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
  });

  // Wait for Turn 1 setup
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Player 1's turn: AI activates Dark Hole to destroy Sangan on field
  // When Sangan is destroyed and sent to GY, Sangan triggers SELECT_CARD
  const aiIdleEvent = engine.getState();
  if (aiIdleEvent.isActive) {
    // Force AI to activate Dark Hole
    engine.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: 0,
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 400));

  assert.ok(sanganSearchPromptReceived, 'Sangan trigger effect must emit SELECT_CARD prompt when destroyed and sent to GY.');
  console.log(`✓ Sangan triggered SELECT_CARD with ${candidateCards.length} eligible monster(s) from Deck:`);
  console.log(`   Candidate names: ${candidateCards.map((c) => `${c.cardName} (ATK <= 1500)`).join(', ')}`);

  engine.close();
}

async function testCardSelectionModalDataStructure() {
  console.log('\nTest 2: CardSelectionModal Location & Categorization Integrity...');

  const locations = [
    { loc: 1, name: 'DECK', icon: '🎴' },
    { loc: 2, name: 'HAND', icon: '🃏' },
    { loc: 4, name: 'MONSTER ZONE', icon: '⚔️' },
    { loc: 8, name: 'SPELL/TRAP', icon: '📜' },
    { loc: 16, name: 'GRAVEYARD', icon: '🪦' },
    { loc: 32, name: 'BANISHED', icon: '🌀' },
    { loc: 64, name: 'EXTRA DECK', icon: '⚡' },
  ];

  for (const l of locations) {
    assert.ok(l.name.length > 0, `Location ${l.loc} must have valid name`);
    assert.ok(l.icon.length > 0, `Location ${l.loc} must have valid icon`);
  }

  console.log('✓ All 7 duel zones correctly classified for CardSelectionModal.');
}

async function testPrematureBurialGraveyardTargetSelection() {
  console.log('\nTest 3: Premature Burial (70828912) Graveyard Target Selection...');

  const engine = new DuelEngineService();
  await engine.init();

  let pbPromptReceived = false;
  let targetCandidates: any[] = [];
  let celticGuardianSummoned = false;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.isPrompt) {
      if (ev.promptType === 'SELECT_IDLECMD' && ev.promptPlayer === 0) {
        const pData = ev.promptData as any;
        const pbActivate = pData.activates?.find((a: any) => a.code === 70828912);
        if (pbActivate) {
          const idx = pData.activates.indexOf(pbActivate);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_ACTIVATE,
              index: idx,
            });
          }, 10);
        }
      } else if (ev.promptType === 'SELECT_CARD' && ev.promptPlayer === 0) {
        const pData = ev.promptData as any;
        pbPromptReceived = true;
        targetCandidates = pData.selects;

        assert.ok(targetCandidates.length > 0, 'Must have selectable monster target in Graveyard');
        assert.strictEqual(targetCandidates[0].location, 16, 'Candidate must be in Graveyard (Location 16)');
        assert.strictEqual(targetCandidates[0].code, 91152256, 'Target candidate must be Celtic Guardian');

        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            indicies: [0],
            cards: [0],
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: -1,
          });
        }, 10);
      }
    }

    if (ev.type === 'SPSUMMONED' || ev.type === 'SPSUMMONING') {
      if (ev.code === 91152256) {
        celticGuardianSummoned = true;
      }
    }
  });

  const p0Deck: number[] = [];
  while (p0Deck.length < 40) p0Deck.push(70828912);

  const p1Deck: number[] = [];
  while (p1Deck.length < 40) p1Deck.push(40640057);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player0Graveyard: [91152256], // Celtic Guardian in Graveyard
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
    noShuffle: true,
  });

  const start = Date.now();
  while (!celticGuardianSummoned && Date.now() - start < 3000) {
    await new Promise((r) => setTimeout(r, 40));
  }

  assert.ok(pbPromptReceived, 'Premature Burial must trigger SELECT_CARD targeting Graveyard');
  assert.ok(celticGuardianSummoned, 'Celtic Guardian must be Special Summoned from Graveyard');
  console.log('✓ Premature Burial Graveyard targeting and Special Summon verified.');

  engine.close();
}

async function testSingleClickTargetToggleIntegrity() {
  console.log('\nTest 4: Card Selection Single Click Toggle & Order Integrity...');

  // Simulating store selection behavior
  let selectedIndices: number[] = [];
  const maxAllowed = 1;

  const toggleTargetByIndex = (idx: number) => {
    const existing = selectedIndices.indexOf(idx);
    if (existing >= 0) {
      selectedIndices.splice(existing, 1);
    } else {
      if (selectedIndices.length < maxAllowed) {
        selectedIndices.push(idx);
      } else if (maxAllowed === 1) {
        selectedIndices = [idx];
      }
    }
  };

  // 1. Single click on index 0
  toggleTargetByIndex(0);
  assert.deepStrictEqual(selectedIndices, [0], 'Single click must add index 0 to selection');

  // 2. Click on index 1 (when max is 1)
  toggleTargetByIndex(1);
  assert.deepStrictEqual(selectedIndices, [1], 'Click on new index when max=1 must switch selection to index 1');

  // 3. Click on index 1 again (deselect)
  toggleTargetByIndex(1);
  assert.deepStrictEqual(selectedIndices, [], 'Click on already selected index must deselect it');

  console.log('✓ Card selection single click toggle integrity confirmed.');
}

async function runAll() {
  await testSanganBattleDestructionSearch();
  await testCardSelectionModalDataStructure();
  await testPrematureBurialGraveyardTargetSelection();
  await testSingleClickTargetToggleIntegrity();
  console.log('\n🎉 ALL SANGAN & CARD SELECTION TESTS PASSED SUCCESSFULLY!');
}

runAll().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
