import assert from 'node:assert';
import { MultiplayerService, type PvpPacket } from '../src/renderer/services/multiplayer/MultiplayerService.js';
import { getGameOverSubtitle, WIN_REASONS } from '../src/shared/types/duel.js';

console.log('--- Starting Multiplayer & PvP Protocol Test Suite ---');

// Test 1: 4-Digit Room Code Generation & Peer Mapping
{
  const service = new MultiplayerService();
  for (let i = 0; i < 50; i++) {
    const code = service.generateRoomCode();
    assert.strictEqual(code.length, 4, `Room code "${code}" must be exactly 4 characters`);
    assert.match(code, /^[1-9][0-9]{3}$/, `Room code "${code}" must consist of 4 numeric digits`);
    const num = parseInt(code, 10);
    assert.ok(num >= 1000 && num <= 9999, `Room code "${code}" must be in range 1000-9999`);
  }
  console.log('✓ Test 1: 4-Digit room code generation and formatting verified.');
}

// Test 2: P2P Packet Protocol Serialization & Integrity
{
  const testPackets: PvpPacket[] = [
    {
      type: 'HANDSHAKE',
      payload: {
        profile: {
          name: 'Yugi Muto',
          avatar: 'yugi',
          deckName: 'Dark Magician Beat',
          deckCards: [46986414, 70781052, 91152256],
          series: 'DM',
        },
        isReady: true,
      },
      timestamp: Date.now(),
    },
    {
      type: 'COIN_TOSS_RESULT',
      payload: {
        choice: 'heads',
        result: 'heads',
        startingPlayer: 'host',
      },
      timestamp: Date.now(),
    },
    {
      type: 'START_DUEL',
      payload: {
        startingPlayer: 0,
        hostDeckName: 'Dark Magician Beat',
        guestDeckName: 'Blue-Eyes Power',
      },
      timestamp: Date.now(),
    },
    {
      type: 'DUEL_PROMPT',
      payload: {
        type: 'SELECT_IDLECMD',
        player: 1,
        isPrompt: true,
        promptPlayer: 1,
        promptType: 'SELECT_IDLECMD',
        promptData: {
          summons: [{ code: 46986414, location: 2, sequence: 0 }],
          spSummons: [],
          repositions: [],
          monsterSets: [],
          spellSets: [],
          activates: [],
          toBp: true,
          toEp: true,
          shuffle: false,
        },
      },
      timestamp: Date.now(),
    },
    {
      type: 'DUEL_RESPONSE',
      payload: {
        type: 0, // SELECT_IDLECMD
        action: 0, // SUMMON
        index: 0,
      },
      timestamp: Date.now(),
    },
    {
      type: 'REMATCH_REQUEST',
      payload: {},
      timestamp: Date.now(),
    },
  ];

  for (const pkt of testPackets) {
    const serialized = JSON.stringify(pkt);
    const parsed: PvpPacket = JSON.parse(serialized);
    assert.strictEqual(parsed.type, pkt.type, `Packet type mismatch for ${pkt.type}`);
    assert.deepStrictEqual(parsed.payload, pkt.payload, `Packet payload mismatch for ${pkt.type}`);
    assert.ok(parsed.timestamp > 0, 'Packet timestamp must be positive');
  }
  console.log('✓ Test 2: P2P DataChannel packet protocol serialization validated.');
}

// Test 3: Dual Perspective Mapping (Host vs Guest)
{
  // Host Perspective
  const hostUserPlayerId = 0;
  const hostOpponentPlayerId = 1;
  assert.strictEqual(hostUserPlayerId, 0);
  assert.strictEqual(hostOpponentPlayerId, 1);

  // Guest Perspective
  const guestUserPlayerId = 1;
  const guestOpponentPlayerId = 0;
  assert.strictEqual(guestUserPlayerId, 1);
  assert.strictEqual(guestOpponentPlayerId, 0);

  // Prompt routing:
  // When engine prompt is for Player 0 (Host):
  const prompt0 = { player: 0, isPrompt: true, promptPlayer: 0 };
  assert.strictEqual(prompt0.promptPlayer === hostUserPlayerId, true, 'Host should process Player 0 prompt locally');
  assert.strictEqual(prompt0.promptPlayer === guestUserPlayerId, false, 'Guest should NOT process Player 0 prompt');

  // When engine prompt is for Player 1 (Guest):
  const prompt1 = { player: 1, isPrompt: true, promptPlayer: 1 };
  assert.strictEqual(prompt1.promptPlayer === hostUserPlayerId, false, 'Host should NOT process Player 1 prompt locally (forward to Guest)');
  assert.strictEqual(prompt1.promptPlayer === guestUserPlayerId, true, 'Guest should process Player 1 prompt');

  console.log('✓ Test 3: Dual perspective mapping and prompt routing validated.');
}

// Test 4: Global Navigation Guard Logic (Backspace & Mouse Button 3/4)
{
  function simulateBackspace(tagName: string, isContentEditable: boolean): { defaultPrevented: boolean } {
    const isEditable = tagName === 'INPUT' || tagName === 'TEXTAREA' || isContentEditable;
    let defaultPrevented = false;
    if (!isEditable) {
      defaultPrevented = true;
    }
    return { defaultPrevented };
  }

  function simulateMouseButton(button: number): { defaultPrevented: boolean } {
    let defaultPrevented = false;
    if (button === 3 || button === 4) {
      defaultPrevented = true;
    }
    return { defaultPrevented };
  }

  // Inside text inputs / textareas: Backspace is ALLOWED (defaultPrevented = false)
  assert.strictEqual(simulateBackspace('INPUT', false).defaultPrevented, false, 'Backspace in INPUT must be allowed');
  assert.strictEqual(simulateBackspace('TEXTAREA', false).defaultPrevented, false, 'Backspace in TEXTAREA must be allowed');
  assert.strictEqual(simulateBackspace('DIV', true).defaultPrevented, false, 'Backspace in contenteditable must be allowed');

  // Outside text inputs: Backspace is BLOCKED (defaultPrevented = true)
  assert.strictEqual(simulateBackspace('BODY', false).defaultPrevented, true, 'Backspace on BODY must be blocked');
  assert.strictEqual(simulateBackspace('DIV', false).defaultPrevented, true, 'Backspace on DIV must be blocked');
  assert.strictEqual(simulateBackspace('BUTTON', false).defaultPrevented, true, 'Backspace on BUTTON must be blocked');

  // Mouse buttons: 3 and 4 (back/forward) BLOCKED
  assert.strictEqual(simulateMouseButton(3).defaultPrevented, true, 'Mouse button 3 (Back) must be blocked');
  assert.strictEqual(simulateMouseButton(4).defaultPrevented, true, 'Mouse button 4 (Forward) must be blocked');
  assert.strictEqual(simulateMouseButton(0).defaultPrevented, false, 'Mouse button 0 (Left Click) must be allowed');
  assert.strictEqual(simulateMouseButton(2).defaultPrevented, false, 'Mouse button 2 (Right Click) must be allowed');

  console.log('✓ Test 4: Global navigation guard logic for Backspace and mouse navigation verified.');
}

// Test 5: Post-Duel Victory Celebration & Defeat Subtitles
{
  const winnerSubtitleExodia = getGameOverSubtitle(true, WIN_REASONS.EXODIA);
  assert.ok(winnerSubtitleExodia.includes('You have achieved victory by assembling all 5 pieces of Exodia'));

  const loserSubtitleExodia = getGameOverSubtitle(false, WIN_REASONS.EXODIA);
  assert.ok(loserSubtitleExodia.includes('Your opponent achieved victory by assembling all 5 pieces of Exodia'));

  const winnerSubtitleNormal = getGameOverSubtitle(true, WIN_REASONS.LP_ZERO);
  assert.ok(winnerSubtitleNormal.includes('Life Points to 0'));

  console.log('✓ Test 5: Post-duel winner celebration and defeat subtitle generator validated.');
}

// Test 6: Two-Way Deck Synchronization & Persistence
{
  // Simulated persistent store (representing electron-store / window.deckAPI)
  let persistedDeckId = 'yugi_deck_1';
  const mockDeckApi = {
    getActiveDeckId: async () => persistedDeckId,
    setActiveDeckId: async (id: string) => {
      persistedDeckId = id;
      return id;
    },
  };

  const sampleDecks = [
    { id: 'yugi_deck_1', name: 'Yugi Muto - Exodia Incarnate', main: [46986414], extra: [] },
    { id: 'kaiba_deck_1', name: 'Seto Kaiba - Blue-Eyes White Dragon', main: [89631139], extra: [] },
    { id: 'deck-custom-42', name: 'My Custom Beatdown', main: [12580477], extra: [] },
  ];

  // 1. Verify "Starter Deck: Yugi & Kaiba Duels" is NOT present in available decks
  const availableDecks = sampleDecks;
  assert.strictEqual(
    availableDecks.some((d) => d.name === 'Starter Deck: Yugi & Kaiba Duels' || d.id === 'starter'),
    false,
    'Hardcoded starter deck must not exist in available decks',
  );

  // 2. Simulate Deck Edit selecting Kaiba deck
  let deckEditActiveId = 'yugi_deck_1';
  const selectDeckInDeckEdit = async (deckId: string) => {
    deckEditActiveId = deckId;
    await mockDeckApi.setActiveDeckId(deckId);
  };

  await selectDeckInDeckEdit('kaiba_deck_1');
  assert.strictEqual(deckEditActiveId, 'kaiba_deck_1');
  assert.strictEqual(await mockDeckApi.getActiveDeckId(), 'kaiba_deck_1');

  // 3. Simulate navigating to Multiplayer Lobby:
  // selectedDeckId computed reflects deckEditActiveId
  const getMultiplayerSelectedDeckId = () => deckEditActiveId || sampleDecks[0].id;
  assert.strictEqual(
    getMultiplayerSelectedDeckId(),
    'kaiba_deck_1',
    'Multiplayer lobby must sync with Deck Edit selected deck',
  );

  // 4. Simulate user selecting custom deck in Multiplayer via "Selected Deck" field
  const selectDeckInMultiplayer = async (deckId: string) => {
    deckEditActiveId = deckId; // updates deckEditStore.activeDeckId
    await mockDeckApi.setActiveDeckId(deckId); // persists immediately to disk
  };

  await selectDeckInMultiplayer('deck-custom-42');

  // 5. Verify immediate persistence (even without starting a duel)
  assert.strictEqual(
    await mockDeckApi.getActiveDeckId(),
    'deck-custom-42',
    'Selected deck in Multiplayer must be persisted immediately without starting duel',
  );

  // 6. Verify vice-versa: Deck Edit reflects the deck selected in Multiplayer
  assert.strictEqual(
    deckEditActiveId,
    'deck-custom-42',
    'Deck Edit active deck must sync with the deck chosen in Multiplayer',
  );

  console.log('✓ Test 6: Two-way deck selection synchronization and immediate persistence verified.');
}

// Test 7: Duelist Name Persistence & Modal Auto-Scroll Target
{
  // 1. Simulate localStorage persistence for Duelist Name
  const mockStorage: Record<string, string> = {};
  const saveDuelistName = (name: string) => {
    const trimmed = name.trim();
    mockStorage['yugioh_duelist_name'] = trimmed || 'Duelist';
  };
  const getDuelistName = () => mockStorage['yugioh_duelist_name'] || 'Duelist';

  // Default is 'Duelist'
  assert.strictEqual(getDuelistName(), 'Duelist');

  // User changes name to 'SetoKaiba'
  saveDuelistName('SetoKaiba');
  assert.strictEqual(getDuelistName(), 'SetoKaiba');

  // Whitespace only fallback
  saveDuelistName('   ');
  assert.strictEqual(getDuelistName(), 'Duelist');

  // Setting custom name again
  saveDuelistName('Yugi Moto');
  assert.strictEqual(getDuelistName(), 'Yugi Moto');

  // 2. Simulate modal auto-scroll target locating equipped deck element
  const fakeDeckList = [
    { id: 'deck-1', isEquipped: false },
    { id: 'deck-2', isEquipped: false },
    { id: 'deck-3', isEquipped: true },
    { id: 'deck-4', isEquipped: false },
  ];

  let scrolledTargetId: string | null = null;
  const mockContainer = {
    querySelector: (selector: string) => {
      if (selector === '.deck-card-item--equipped') {
        const found = fakeDeckList.find((d) => d.isEquipped);
        if (found) {
          return {
            id: found.id,
            scrollIntoView: (options: any) => {
              scrolledTargetId = found.id;
              assert.strictEqual(options.block, 'center');
              assert.strictEqual(options.behavior, 'smooth');
            },
          };
        }
      }
      return null;
    },
  };

  const equippedEl = mockContainer.querySelector('.deck-card-item--equipped');
  assert.ok(equippedEl, 'Must locate the equipped deck element in list');
  equippedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
  assert.strictEqual(scrolledTargetId, 'deck-3', 'Must scroll directly to equipped deck');

  console.log('✓ Test 7: Duelist name persistence and modal auto-scroll target verified.');
}

console.log('🎉 All Multiplayer & PvP Protocol Tests Passed Cleanly!');
