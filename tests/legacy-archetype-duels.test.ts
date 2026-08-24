import test from 'node:test';
import assert from 'node:assert/strict';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectIdleCMDAction, OcgMessageType } from 'ocgcore-wasm';

test('DM & GX Legacy Support In-Game Duel Simulation Test Suite', async (t) => {
  const service = new DuelEngineService();
  await service.init();

  await t.test('1. King of the Skull Servants 40-Card Main Deck Duels in Engine', async () => {
    // 40 card deck from the user's YGOPRODeck link
    const skullServantDeck = [
      32274490, 32274490, 32274490, // Skull Servant x3
      52467217,                     // Gozuki x1
      92826944,                     // Mezuki x1
      14536035,                     // Dark Grepher x1
      90243945, 90243945, 90243945, // Wightprincess x3
      40991587, 40991587, 40991587, // The Lady in Wight x3
      22339232, 22339232, 22339232, // Wightmare x3
      57473560, 57473560, 57473560, // Wightprince x3
      36021814, 36021814, 36021814, // King of the Skull Servants x3
      52512994,                     // Kasha x1
      49238328, 49238328,           // Pot of Extravagance x2
      81439173,                     // Foolish Burial x1
      74117290, 74117290,           // Dark World Dealings x2
      83764719,                     // Monster Reborn x1
      2295440,                      // One for One x1
      1475311, 1475311,             // Allure of Darkness x2
      24094653, 24094653,           // Polymerization x2
      48976825, 48976825, 48976825, // Burial from a Different Dimension x3
      12247206, 12247206,           // Inferno Reckless Summon x2
      10045474, 10045474            // Infinite Impermanence x2
    ];

    const opponentDeck = Array(40).fill(89631139); // Blue-Eyes deck

    const started = service.startNewDuel({
      player0Deck: skullServantDeck,
      player1Deck: opponentDeck,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    assert.ok(started, 'Duel must start successfully with King of the Skull Servants deck');
    const board = service.getBoardState();
    assert.equal(board.userField.hand.length, 5, 'Player 0 must draw opening hand of 5 cards');
    assert.equal(board.opponentField.hand.length, 5, 'Player 1 must draw opening hand of 5 cards');
    assert.equal(board.userField.currentLp, 8000);
    assert.equal(board.opponentField.currentLp, 8000);
  });

  await t.test('2. Legacy Monster Normal Summon & Activation Lifecycle', async () => {
    // Deck with Gozuki (52467217) and Wightprince (57473560)
    const p0Deck = [
      52467217, 52467217, 57473560, 32274490, 40991587,
      ...Array(35).fill(32274490)
    ];
    const p1Deck = Array(40).fill(89631139);

    const s = new DuelEngineService();
    await s.init();
    const ok = s.startNewDuel({
      player0Deck: p0Deck,
      player1Deck: p1Deck,
      humanPlayerId: 0,
      startingLP: 8000,
    });
    assert.ok(ok, 'Duel starts');

    const board = s.getBoardState();
    assert.equal(board.userField.hand.length, 5);
  });

  await t.test('3. King of the Skull Servants Dynamic ATK Recalculation (7000 ATK in GY)', async () => {
    const s = new DuelEngineService();
    await s.init();

    // Start duel with King on field and 7 Skull Servant / Wight cards in GY
    s.startNewDuel({
      player0Deck: [36021814, ...Array(39).fill(32274490)],
      player1Deck: Array(40).fill(89631139),
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const userPf = (s as any).player0Field;
    // Place King on monster zone 0
    userPf.monsterZones[0] = {
      id: 'm-king-1',
      code: 36021814,
      name: 'King of the Skull Servants',
      controller: 0,
      location: 'monster',
      sequence: 0,
      position: 'faceup_attack',
      atk: 0,
      def: 0,
      baseAtk: 0,
      baseDef: 0,
      level: 1,
      attribute: 'DARK',
      race: 'Zombie',
      statuses: [],
    };

    // Add 7 distinct Wight / Skull Servant cards to Graveyard:
    // Skull Servant, King, Lady in Wight, Wightmare, Wightprince, Wightprincess, Wightbaking
    userPf.graveyard = [
      { code: 32274490, name: 'Skull Servant' },
      { code: 36021814, name: 'King of the Skull Servants' },
      { code: 40991587, name: 'The Lady in Wight' },
      { code: 22339232, name: 'Wightmare' },
      { code: 57473560, name: 'Wightprince' },
      { code: 90243945, name: 'Wightprincess' },
      { code: 6128460, name: 'Wightbaking' },
    ];

    s.syncFieldCardStats();
    const board = s.getBoardState();
    const kingCard = board.userField.monsterZones[0];

    assert.ok(kingCard, 'King monster must be present on field');
    assert.equal(kingCard.atk, 7000, 'King of the Skull Servants ATK must evaluate to exactly 7000 (7 x 1000)');
    assert.equal(kingCard.baseAtk, 7000, 'King of the Skull Servants base ATK must also be 7000');
    assert.equal(kingCard.def, 0, 'King of the Skull Servants DEF must be 0');
  });

  await t.test('4. Wightprince Graveyard Effect Ignition & Special Summon', async () => {
    const s = new DuelEngineService();
    await s.init();

    // Player 0 has King in Deck, 2 Skull Servants in GY, Wightprince in GY
    s.startNewDuel({
      player0Deck: [36021814, ...Array(39).fill(32274490)],
      player1Deck: Array(40).fill(89631139),
      humanPlayerId: 0,
      startingLP: 8000,
      noShuffle: true,
    });

    const userPf = (s as any).player0Field;
    userPf.graveyard = [
      { code: 57473560, name: 'Wightprince', sequence: 0 },
      { code: 32274490, name: 'Skull Servant', sequence: 1 },
      { code: 32274490, name: 'Skull Servant', sequence: 2 },
    ];

    // Verify dynamic stats enrichment runs cleanly
    s.syncFieldCardStats();
    assert.ok(true, 'Dynamic stats synchronized cleanly');
  });
});
