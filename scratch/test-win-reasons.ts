import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { getAutoResponse } from '../src/main/engine/messageDecoder.js';

async function testWinReasons() {
  const engine = new DuelEngineService();
  await engine.init();

  console.log('=== Testing DuelEngineService WIN reasons ===');

  // Test 1: LP reduced to 0 (Ookazi / Hinotama burn / combat)
  console.log('\n--- Test 1: LP reduced to 0 ---');
  engine.startNewDuel({
    player0Deck: [46918794, 46918794, 46918794, 46918794, 46918794, 89631139, 89631139, 89631139, 89631139, 89631139],
    player1Deck: [89631139, 89631139, 89631139, 89631139, 89631139, 89631139, 89631139, 89631139, 89631139, 89631139],
    startingLP: 500,
    startingDrawCount: 5,
    autoPlay: true,
  });

  let steps = 0;
  while (engine.getState().isActive && steps < 50) {
    steps++;
    const events = engine.processStep();
    for (const ev of events) {
      if (ev.type === 'WIN') {
        console.log('LP reduced to 0 -> Decoded WIN Event:', ev);
      }
    }
  }
  console.log('State at end of LP duel:', engine.getState());

  // Test 2: Deck Out (0 cards left in deck)
  console.log('\n--- Test 2: Deck Out ---');
  engine.startNewDuel({
    player0Deck: [89631139],
    player1Deck: [89631139],
    startingLP: 8000,
    startingDrawCount: 1,
    autoPlay: true,
  });

  steps = 0;
  while (engine.getState().isActive && steps < 50) {
    steps++;
    const events = engine.processStep();
    for (const ev of events) {
      if (ev.type === 'WIN') {
        console.log('Deck Out -> Decoded WIN Event:', ev);
      }
    }
  }
  console.log('State at end of Deck Out duel:', engine.getState());

  // Test 3: Exodia Assembly
  console.log('\n--- Test 3: Exodia assembly ---');
  engine.startNewDuel({
    player0Deck: [33396948, 70903634, 7902349, 44519536, 8124921, 89631139, 89631139],
    player1Deck: [89631139, 89631139, 89631139, 89631139, 89631139, 89631139, 89631139],
    startingLP: 8000,
    startingDrawCount: 5,
    autoPlay: true,
  });

  steps = 0;
  while (engine.getState().isActive && steps < 50) {
    steps++;
    const events = engine.processStep();
    for (const ev of events) {
      if (ev.type === 'WIN') {
        console.log('Exodia -> Decoded WIN Event:', ev);
      }
    }
  }
  console.log('State at end of Exodia duel:', engine.getState());
}

testWinReasons().catch(console.error);
