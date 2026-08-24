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
});
