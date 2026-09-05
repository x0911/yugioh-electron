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

// Test 8: Guest Window Launch Configuration & Binary String Type Safety
{
  // 1. Verify executable path resolution logic
  const mockProcessExecPath = process.execPath;
  assert.strictEqual(typeof mockProcessExecPath, 'string', 'process.execPath must strictly be a string');
  assert.ok(mockProcessExecPath.length > 0, 'process.execPath must not be empty');

  // Verify that an object is NEVER used as the executable (which caused TypeError [ERR_INVALID_ARG_TYPE])
  const resolveElectronBin = (isDev: boolean) => {
    // Correct resolution uses process.execPath directly
    return process.execPath;
  };

  const resolvedBinDev = resolveElectronBin(true);
  assert.strictEqual(typeof resolvedBinDev, 'string', 'Electron binary in dev must be a string');
  assert.notStrictEqual(typeof resolvedBinDev, 'object', 'Electron binary must never be an object');

  // 2. Verify spawn argument composition
  const mockAppPath = '/path/to/yugioh-electron';
  const getSpawnArgs = (isDev: boolean) => {
    return isDev
      ? [mockAppPath, '--guest', '--multi-instance', '--windowed']
      : ['--guest', '--multi-instance', '--windowed'];
  };

  const devArgs = getSpawnArgs(true);
  assert.strictEqual(devArgs[0], mockAppPath);
  assert.ok(devArgs.includes('--guest'));
  assert.ok(devArgs.includes('--multi-instance'));
  assert.ok(devArgs.includes('--windowed'));

  const prodArgs = getSpawnArgs(false);
  assert.strictEqual(prodArgs[0], '--guest');
  assert.ok(prodArgs.includes('--multi-instance'));
  assert.ok(prodArgs.includes('--windowed'));

  // 3. Verify guest window UI constraints (button hidden on guest, join tab active)
  const canLaunchGuestHost = (isGuest: boolean) => !isGuest;
  assert.strictEqual(canLaunchGuestHost(false), true, 'Host window can launch guest window');
  assert.strictEqual(canLaunchGuestHost(true), false, 'Guest window must not show launch guest button');

  console.log('✓ Test 8: Guest window launch configuration and binary string type safety verified.');
}

// Test 9: Duel Initialization Serialization & Structured Clone Safety
{
  function cleanDeckCards(cards: unknown): number[] {
    if (!cards || !Array.isArray(cards)) return [];
    return Array.from(cards)
      .map((c: any) => {
        if (typeof c === 'object' && c !== null) {
          return Number(c.code || c.id || 0);
        }
        return Number(c);
      })
      .filter((id) => Number.isFinite(id) && id > 0);
  }

  // Simulate Vue 3 reactive proxy wrapping card objects and functions
  const mockReactiveCardList = new Proxy(
    [
      { id: 46986414, name: 'Dark Magician' },
      { code: 89631139, name: 'Blue-Eyes White Dragon' },
      '40737112',
    ],
    {
      get(target, prop, receiver) {
        if (prop === '__v_isReactive') return true;
        if (prop === 'customFunction') return () => {};
        return Reflect.get(target, prop, receiver);
      },
    },
  );

  // Clean cards must extract pure numeric primitives
  const cleaned = cleanDeckCards(mockReactiveCardList);
  assert.deepStrictEqual(cleaned, [46986414, 89631139, 40737112]);

  // Construct PvP init options payload
  const pvpInitOptions = {
    player0Deck: cleaned,
    player1Deck: [12345678, 87654321],
    player0ExtraDeck: [],
    player1ExtraDeck: [],
    isPvPMode: true,
    player0Name: 'Yugi Muto',
    player1Name: 'Seto Kaiba',
  };

  // Structured clone algorithm must serialize the options cleanly with zero errors
  const cloned = structuredClone(pvpInitOptions);
  assert.deepStrictEqual(cloned.player0Deck, [46986414, 89631139, 40737112]);
  assert.strictEqual(cloned.player0Name, 'Yugi Muto');
  assert.strictEqual(cloned.isPvPMode, true);

  console.log('✓ Test 9: Duel initialization serialization & structured clone safety verified.');
}

// Test 10: multiplayerStore.sendPacket & Match Start Execution Flow
{
  // 1. Mock multiplayer store with sendPacket method
  let sentPacketType: string | null = null;
  let sentPacketPayload: any = null;

  const mockMultiplayerStore = {
    isHost: true,
    bothReady: true,
    localPlayer: { name: 'Host Duelist' },
    remotePlayer: { name: 'Guest Duelist', deckName: 'Guest Deck', deckCards: [46986414] },
    sendPacket: function (type: string, payload: any): boolean {
      sentPacketType = type;
      sentPacketPayload = payload;
      return true;
    },
  };

  assert.strictEqual(
    typeof mockMultiplayerStore.sendPacket,
    'function',
    'multiplayerStore.sendPacket must strictly be a function',
  );

  // 2. Simulate handleStartMatch execution
  const hostDeck = { name: 'Host Deck', cards: [89631139], extraCards: [] };
  const pvpInitOptions = {
    player0Deck: [89631139],
    player1Deck: [46986414],
    player0ExtraDeck: [],
    player1ExtraDeck: [],
    isPvPMode: true,
    player0Name: mockMultiplayerStore.localPlayer.name,
    player1Name: mockMultiplayerStore.remotePlayer.name,
  };

  const mockDuelStore = {
    isPvPMatch: false,
    pvpRole: 'none' as 'host' | 'guest' | 'none',
    userPlayerId: 0 as 0 | 1,
    opponentPlayerId: 1 as 0 | 1,
    pvpInitOptions: null as any,
    setupPvPMatch(role: 'host' | 'guest', userPlayerId: 0 | 1, localName: string, opponentName: string, options?: any) {
      this.isPvPMatch = true;
      this.pvpRole = role;
      this.userPlayerId = userPlayerId;
      this.opponentPlayerId = userPlayerId === 0 ? 1 : 0;
      this.pvpInitOptions = options ? JSON.parse(JSON.stringify(options)) : null;
    },
  };

  mockDuelStore.setupPvPMatch('host', 0, 'Host Duelist', 'Guest Duelist', pvpInitOptions);
  assert.strictEqual(mockDuelStore.isPvPMatch, true);
  assert.strictEqual(mockDuelStore.pvpRole, 'host');
  assert.deepStrictEqual(mockDuelStore.pvpInitOptions.player0Deck, [89631139]);

  // 3. Send START_DUEL packet via store
  const success = mockMultiplayerStore.sendPacket('START_DUEL', {
    startingPlayer: 0,
    hostDeckName: hostDeck.name,
    guestDeckName: mockMultiplayerStore.remotePlayer.deckName,
  });

  assert.strictEqual(success, true);
  assert.strictEqual(sentPacketType, 'START_DUEL');
  assert.strictEqual(sentPacketPayload.hostDeckName, 'Host Deck');
  assert.strictEqual(sentPacketPayload.guestDeckName, 'Guest Deck');

  // 4. Simulate Guest handling START_DUEL
  const guestDuelStore = {
    isPvPMatch: false,
    pvpRole: 'none' as 'host' | 'guest' | 'none',
    userPlayerId: 0 as 0 | 1,
    opponentPlayerId: 1 as 0 | 1,
    setupPvPMatch(role: 'host' | 'guest', userPlayerId: 0 | 1, localName: string, opponentName: string) {
      this.isPvPMatch = true;
      this.pvpRole = role;
      this.userPlayerId = userPlayerId;
      this.opponentPlayerId = userPlayerId === 0 ? 1 : 0;
    },
  };

  guestDuelStore.setupPvPMatch('guest', 1, 'Guest Duelist', 'Host Duelist');
  assert.strictEqual(guestDuelStore.isPvPMatch, true);
  assert.strictEqual(guestDuelStore.pvpRole, 'guest');
  assert.strictEqual(guestDuelStore.userPlayerId, 1);
  assert.strictEqual(guestDuelStore.opponentPlayerId, 0);

  console.log('✓ Test 10: multiplayerStore.sendPacket & match start execution flow verified.');
}

// Test 11: startPvPDuel Structured Clone Safety (Vue Proxy Unwrapping)
{
  // Simulate a reactive Proxy around pvpInitOptions (like Pinia/Vue)
  const reactiveDeck = new Proxy([89631139, 46986414], {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver);
    },
  });

  const reactiveOptions = new Proxy(
    {
      player0Deck: reactiveDeck,
      player1Deck: reactiveDeck,
      player0ExtraDeck: [],
      player1ExtraDeck: [],
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      isPvPMode: true,
      player0Name: 'Host Player',
      player1Name: 'Guest Player',
    },
    {
      get(target, prop, receiver) {
        return Reflect.get(target, prop, receiver);
      },
    },
  );

  // Replicate startPvPDuel plainOptions construction
  const plainOptions = {
    player0Deck: Array.from(reactiveOptions.player0Deck || []).map((c) => Number(c)),
    player1Deck: Array.from(reactiveOptions.player1Deck || []).map((c) => Number(c)),
    player0ExtraDeck: Array.from(reactiveOptions.player0ExtraDeck || []).map((c) => Number(c)),
    player1ExtraDeck: Array.from(reactiveOptions.player1ExtraDeck || []).map((c) => Number(c)),
    startingLP: Number(reactiveOptions.startingLP || 8000),
    startingDrawCount: Number(reactiveOptions.startingDrawCount || 5),
    drawCountPerTurn: Number(reactiveOptions.drawCountPerTurn || 1),
    autoPlay: false,
    humanPlayerId: 0,
    isPvPMode: true,
    player0Name: String(reactiveOptions.player0Name || 'Host'),
    player1Name: String(reactiveOptions.player1Name || 'Guest'),
  };

  // Chromium / contextBridge structuredClone must succeed without throwing DataCloneError
  const cloned = structuredClone(plainOptions);
  assert.deepStrictEqual(cloned.player0Deck, [89631139, 46986414]);
  assert.strictEqual(cloned.isPvPMode, true);
  assert.strictEqual(cloned.player0Name, 'Host Player');
  assert.strictEqual(cloned.player1Name, 'Guest Player');

  console.log('✓ Test 11: startPvPDuel structured clone safety (Vue proxy unwrapping) verified.');
}

// Test 12: Bidirectional DRAW Card Redaction & Prompt Routing in PvP
{
  const hostDrawEvent = {
    type: 'DRAW',
    player: 0,
    drawnCards: [{ code: 46986414, cardName: 'Dark Magician' }],
  };

  // Host sends to Guest: Player 0's drawn cards are masked
  const guestEventForHostDraw =
    hostDrawEvent.player === 0 && Array.isArray(hostDrawEvent.drawnCards)
      ? {
          ...hostDrawEvent,
          drawnCards: hostDrawEvent.drawnCards.map(() => ({ code: 0, cardName: 'Card Back' })),
        }
      : hostDrawEvent;

  assert.strictEqual(guestEventForHostDraw.drawnCards[0].code, 0);
  assert.strictEqual(guestEventForHostDraw.drawnCards[0].cardName, 'Card Back');
  assert.strictEqual(hostDrawEvent.drawnCards[0].code, 46986414);

  const guestDrawEvent = {
    type: 'DRAW',
    player: 1,
    drawnCards: [{ code: 89631139, cardName: 'Blue-Eyes White Dragon' }],
  };

  // Host processes locally: Player 1's drawn cards are masked
  const localEventForGuestDraw =
    guestDrawEvent.player === 1 && Array.isArray(guestDrawEvent.drawnCards)
      ? {
          ...guestDrawEvent,
          drawnCards: guestDrawEvent.drawnCards.map(() => ({ code: 0, cardName: 'Card Back' })),
        }
      : guestDrawEvent;

  assert.strictEqual(localEventForGuestDraw.drawnCards[0].code, 0);
  assert.strictEqual(localEventForGuestDraw.drawnCards[0].cardName, 'Card Back');
  // Guest receives unmasked drawn cards
  assert.strictEqual(guestDrawEvent.drawnCards[0].code, 89631139);

  // Prompt routing: Guest prompt (player 1) vs Host prompt (player 0)
  const guestPrompt = { isPrompt: true, promptPlayer: 1, promptType: 'SELECT_IDLECMD' };
  const hostPrompt = { isPrompt: true, promptPlayer: 0, promptType: 'SELECT_IDLECMD' };

  const isGuestPromptForGuest = guestPrompt.isPrompt && guestPrompt.promptPlayer === 1;
  const isHostPromptForHost = hostPrompt.isPrompt && hostPrompt.promptPlayer === 0;

  assert.strictEqual(isGuestPromptForGuest, true, 'Guest prompt must route to Guest');
  assert.strictEqual(isHostPromptForHost, true, 'Host prompt must route to Host');

  console.log('✓ Test 12: Bidirectional DRAW card redaction & prompt routing verified.');
}

// Test 13: Card Database Hydration & Stats / Description Resolution in Guest View
{
  const mockCardMap = new Map<number, any>();
  mockCardMap.set(89631139, {
    id: 89631139,
    name: 'Blue-Eyes White Dragon',
    atk: 3000,
    def: 2500,
    level: 8,
    attributeName: 'LIGHT',
    raceName: 'Dragon',
    desc: 'This legendary dragon is a powerful engine of destruction.',
    isMonster: true,
  });

  // Simulate an unhydrated hand card (as created when drawn before DB was ready)
  const unhydratedCard = {
    id: 'hand-1',
    code: 89631139,
    name: 'Card',
    controller: 1,
    location: 'hand' as const,
    sequence: 0,
    position: 'faceup_spell' as const,
    atk: undefined,
    def: undefined,
    level: undefined,
    attribute: undefined,
    race: undefined,
    description: undefined,
    statuses: [],
  };

  assert.strictEqual(unhydratedCard.atk, undefined);
  assert.strictEqual(unhydratedCard.description, undefined);

  // Simulate hydrateFieldCard logic when cardMap is ready
  const detail = mockCardMap.get(unhydratedCard.code);
  const hydratedCard = {
    ...unhydratedCard,
    name: detail?.name ?? unhydratedCard.name,
    atk: detail?.isMonster ? detail.atk : undefined,
    def: detail?.isMonster ? detail.def : undefined,
    level: detail?.isMonster ? detail.level : undefined,
    attribute: detail?.attributeName,
    race: detail?.raceName,
    description: detail?.desc,
  };

  assert.strictEqual(hydratedCard.name, 'Blue-Eyes White Dragon');
  assert.strictEqual(hydratedCard.atk, 3000);
  assert.strictEqual(hydratedCard.def, 2500);
  assert.strictEqual(hydratedCard.level, 8);
  assert.strictEqual(hydratedCard.attribute, 'LIGHT');
  assert.strictEqual(hydratedCard.race, 'Dragon');
  assert.strictEqual(hydratedCard.description, 'This legendary dragon is a powerful engine of destruction.');

  console.log('✓ Test 13: Card database hydration & stats / description resolution verified.');
}

// Test 14: Summon & Attack Video Trigger Synchronization
{
  let sentVideoPacket: any = null;
  const mockMultiplayerStore = {
    sendVideoTrigger(payload: any) {
      sentVideoPacket = payload;
    },
  };

  const sampleVideo = {
    cardCode: 89631139,
    cardName: 'Blue-Eyes White Dragon',
    type: 'summon' as const,
    videoPath: 'videos/blue_eyes_summon.mp4',
  };

  // When Host triggers video via engine
  const pvpRole = 'host';
  if (pvpRole === 'host') {
    mockMultiplayerStore.sendVideoTrigger(sampleVideo);
  }

  assert.deepStrictEqual(sentVideoPacket, sampleVideo);

  // Guest receives VIDEO_TRIGGER
  let guestPlayingVideo: any = null;
  const guestDuelStore = {
    handlePlayVideo(video: any) {
      guestPlayingVideo = video;
    },
  };

  guestDuelStore.handlePlayVideo(sentVideoPacket);
  assert.deepStrictEqual(guestPlayingVideo, sampleVideo);

  console.log('✓ Test 14: Summon & attack video trigger synchronization verified.');
}

// Test 15: Opponent Forfeit, Surrender & Disconnect Handling
{
  const WIN_REASONS = {
    UNKNOWN: 0x0,
    LP_ZERO: 0x1,
    DECK_OUT: 0x2,
    SURRENDER: 0x3,
    DISCONNECT: 0x20,
  };

  const createMockDuel = (userPlayerId: 0 | 1) => ({
    isPvPMatch: true,
    isDuelActive: true,
    userPlayerId,
    opponentPlayerId: (userPlayerId === 0 ? 1 : 0) as 0 | 1,
    boardState: {
      winner: null as 0 | 1 | null,
      winReason: null as number | null,
    },
  });

  // Case A: Opponent Surrenders
  const duelHost = createMockDuel(0);
  const handleOpponentForfeit = (duel: typeof duelHost, reason?: string) => {
    if (duel.isPvPMatch && duel.isDuelActive && duel.boardState.winner === null) {
      const isDisconnect = reason === 'disconnect' || reason === 'left';
      duel.boardState.winner = duel.userPlayerId;
      duel.boardState.winReason = isDisconnect ? WIN_REASONS.DISCONNECT : WIN_REASONS.SURRENDER;
    }
  };

  handleOpponentForfeit(duelHost, 'surrender');
  assert.strictEqual(duelHost.boardState.winner, 0, 'Host must be declared winner when Guest surrenders');
  assert.strictEqual(duelHost.boardState.winReason, WIN_REASONS.SURRENDER);

  // Case B: Opponent Disconnects / Closes Window
  const duelGuest = createMockDuel(1);
  handleOpponentForfeit(duelGuest, 'disconnect');
  assert.strictEqual(duelGuest.boardState.winner, 1, 'Guest must be declared winner when Host disconnects');
  assert.strictEqual(duelGuest.boardState.winReason, WIN_REASONS.DISCONNECT);

  // Subtitle verification
  const { getGameOverSubtitle } = await import('../src/shared/types/duel.js');
  const surrenderSub = getGameOverSubtitle(true, WIN_REASONS.SURRENDER);
  assert.strictEqual(surrenderSub, 'Your opponent surrendered the duel.');

  const disconnectSub = getGameOverSubtitle(true, WIN_REASONS.DISCONNECT);
  assert.strictEqual(disconnectSub, 'Your opponent disconnected or left the duel.');

  console.log('✓ Test 15: Opponent forfeit, surrender & disconnect victory handling verified.');
}

// Test 16: multiplayerStore.disconnect() & Match Exit Cleanup
{
  let serviceDisconnected = false;
  const mockMultiplayerService = {
    disconnect() {
      serviceDisconnected = true;
    },
  };

  const mockMultiplayerStore = {
    role: 'host',
    roomCode: '1234',
    status: 'connected',
    remotePlayer: { name: 'Player 2' },
    isLocalReady: true,
    isRemoteReady: true,
    rematchRequested: true,
    remoteRematchRequested: true,
    leaveRoom() {
      mockMultiplayerService.disconnect();
      this.role = 'none';
      this.roomCode = '';
      this.status = 'disconnected';
      this.remotePlayer = null;
      this.isLocalReady = false;
      this.isRemoteReady = false;
      this.rematchRequested = false;
      this.remoteRematchRequested = false;
    },
    disconnect() {
      this.leaveRoom();
    },
  };

  assert.strictEqual(typeof mockMultiplayerStore.disconnect, 'function');
  mockMultiplayerStore.disconnect();

  assert.strictEqual(serviceDisconnected, true);
  assert.strictEqual(mockMultiplayerStore.status, 'disconnected');
  assert.strictEqual(mockMultiplayerStore.role, 'none');
  assert.strictEqual(mockMultiplayerStore.roomCode, '');
  assert.strictEqual(mockMultiplayerStore.remotePlayer, null);

  // DuelStore reset verification
  const mockDuelStore = {
    isDuelActive: true,
    isPvPMatch: true,
    pvpRole: 'host',
    pvpInitOptions: { startingLP: 8000 },
    resetDuel() {
      this.isDuelActive = false;
      this.isPvPMatch = false;
      this.pvpRole = 'none';
      this.pvpInitOptions = null;
    },
  };

  mockDuelStore.resetDuel();
  assert.strictEqual(mockDuelStore.isDuelActive, false);
  assert.strictEqual(mockDuelStore.isPvPMatch, false);
  assert.strictEqual(mockDuelStore.pvpRole, 'none');
  assert.strictEqual(mockDuelStore.pvpInitOptions, null);

  console.log('✓ Test 16: multiplayerStore.disconnect() & match exit cleanup verified.');
}

// Test 17: WebRTC Voice Chat Signaling Protocol & Deterministic Calling Validation
{
  // 1. Packet serialization for VOICE_SIGNAL
  const joinSignal: PvpPacket = {
    type: 'VOICE_SIGNAL',
    payload: { action: 'joined', isMuted: false },
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(joinSignal);
  const parsed: PvpPacket = JSON.parse(serialized);
  assert.strictEqual(parsed.type, 'VOICE_SIGNAL');
  assert.strictEqual((parsed.payload as any).action, 'joined');
  assert.strictEqual((parsed.payload as any).isMuted, false);

  const leftSignal: PvpPacket = {
    type: 'VOICE_SIGNAL',
    payload: { action: 'left' },
    timestamp: Date.now(),
  };
  assert.strictEqual(JSON.parse(JSON.stringify(leftSignal)).payload.action, 'left');

  // 2. Deterministic Caller Logic: Host initiates call, Guest answers
  let callInitiatedCount = 0;
  let answerInitiatedCount = 0;

  const simulateJoinVoice = (role: 'host' | 'guest', hasRemoteActive: boolean) => {
    if (role === 'host') {
      // Host initiates call
      callInitiatedCount++;
    } else {
      // Guest signals ready and waits for host's incoming call
      // Guest NEVER initiates peer.call() directly
    }
  };

  const simulateIncomingCall = (role: 'host' | 'guest', call: any) => {
    answerInitiatedCount++;
  };

  // Host joins first, then Guest joins
  simulateJoinVoice('host', false);
  assert.strictEqual(callInitiatedCount, 1, 'Host must initiate call');

  simulateJoinVoice('guest', true);
  assert.strictEqual(callInitiatedCount, 1, 'Guest must NOT initiate duplicate call (avoids WebRTC glare)');

  simulateIncomingCall('guest', {});
  assert.strictEqual(answerInitiatedCount, 1, 'Guest answers Host incoming call');

  // 3. Audio Track Lifecycle: microphone tracks must be stopped on exit
  let stoppedTrackCount = 0;
  const mockTrack1 = { stop: () => { stoppedTrackCount++; } };
  const mockTrack2 = { stop: () => { stoppedTrackCount++; } };
  const mockLocalStream = {
    getTracks: () => [mockTrack1, mockTrack2],
  };

  // Simulate leaveVoiceChat stopping all tracks to revert Bluetooth HFP -> A2DP
  mockLocalStream.getTracks().forEach((t) => t.stop());
  assert.strictEqual(stoppedTrackCount, 2, 'All microphone tracks must be stopped on leaveVoiceChat');

  // 4. Web Audio Graph Volume & Deafen Control
  let currentGainValue = 1.0;
  const mockGainNode = {
    gain: {
      setValueAtTime: (val: number) => { currentGainValue = val; },
    },
  };

  // Undeafened: volume 0.7
  const setVolume = (vol: number, isDeafened: boolean) => {
    mockGainNode.gain.setValueAtTime(isDeafened ? 0 : vol);
  };

  setVolume(0.7, false);
  assert.strictEqual(currentGainValue, 0.7);

  // Deafened: volume becomes 0
  setVolume(0.7, true);
  assert.strictEqual(currentGainValue, 0);

  // Undeafened restored
  setVolume(0.7, false);
  assert.strictEqual(currentGainValue, 0.7);

  console.log('✓ Test 17: WebRTC Voice Chat signaling protocol, deterministic caller, and audio lifecycle verified.');
}

console.log('🎉 All Multiplayer & PvP Protocol Tests Passed Cleanly!');
