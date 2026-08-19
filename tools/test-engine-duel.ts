import { duelEngineService } from '../src/main/engine/DuelEngineService.js';

// 40-Card Real Yugi Deck from Filtered Pool
const YUGI_DECK = [
  46986414,
  46986414,
  46986414, // Dark Magician x3
  70781052,
  70781052, // Summoned Skull x2
  91152256,
  91152256,
  91152256, // Celtic Guardian x3
  40640057,
  40640057,
  40640057, // Kuriboh x3
  26202165,
  26202165,
  26202165, // Sangan x3
  78193831,
  78193831, // Buster Blader x2
  13039848,
  13039848,
  13039848, // Giant Soldier of Stone x3
  15025844,
  15025844, // Mystical Elf x2
  41392891,
  41392891, // Feral Imp x2
  90357090,
  90357090, // Silver Fang x2
  55144522,
  55144522, // Pot of Greed x2
  12580477,
  12580477, // Raigeki x2
  53129443, // Dark Hole x1
  46130346,
  46130346, // Hinotama x2
  4206964,
  4206964,
  4206964, // Trap Hole x3
  44095762,
  44095762, // Mirror Force x2
  24068492,
  24068492, // Just Desserts x2
];

// 40-Card Real Kaiba Deck from Filtered Pool
const KAIBA_DECK = [
  89631139,
  89631139,
  89631139, // Blue-Eyes White Dragon x3
  14898066,
  14898066,
  14898066, // Vorse Raider x3
  5053103,
  5053103,
  5053103, // Battle Ox x3
  97590747,
  97590747,
  97590747, // La Jinn the Mystical Genie of the Lamp x3
  54652250,
  54652250,
  54652250, // Man-Eater Bug x3
  17985575,
  17985575, // Lord of D. x2
  43973174,
  43973174, // The Flute of Summoning Dragon x2
  55144522,
  55144522, // Pot of Greed x2
  53129443,
  53129443, // Dark Hole x2
  12580477, // Raigeki x1
  25833572,
  25833572,
  25833572, // Ookazi x3
  38480590,
  38480590,
  38480590, // Sparks x3
  4206964,
  4206964,
  4206964, // Trap Hole x3
  83555666,
  83555666, // Ring of Destruction x2
  99518961,
  99518961, // Dust Tornado x2
];

async function runTestDuel() {
  console.log('='.repeat(70));
  console.log('  TESTING REAL DUEL SIMULATION ON FILTERED DM CARD POOL');
  console.log('='.repeat(70));

  await duelEngineService.init();

  let eventCount = 0;
  duelEngineService.onEvent((event) => {
    eventCount++;
    if (
      event.type === 'SUMMONING' ||
      event.type === 'SPSUMMONING' ||
      event.type === 'CHAINING' ||
      event.type === 'ATTACK' ||
      event.type === 'WIN' ||
      event.type === 'NEW_TURN'
    ) {
      console.log(`  [Event #${eventCount}] ${event.type}: ${event.description}`);
    }
  });

  const success = duelEngineService.startNewDuel({
    player0Deck: YUGI_DECK,
    player1Deck: KAIBA_DECK,
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    autoPlay: true,
  });

  if (!success) {
    throw new Error('Failed starting duel!');
  }

  let loopCount = 0;
  const maxLoops = 2000;

  while (duelEngineService.getState().isActive && loopCount < maxLoops) {
    loopCount++;
    duelEngineService.processStep();
  }

  const finalState = duelEngineService.getState();

  console.log('\n' + '='.repeat(70));
  console.log('  DUEL SIMULATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`  • Status:           ${finalState.isActive ? 'IN PROGRESS' : 'FINISHED'}`);
  console.log(
    `  • Winner:           Player ${finalState.winner} (Reason code: ${finalState.winReason})`,
  );
  console.log(`  • Turns Played:     ${finalState.currentTurn}`);
  console.log(`  • Final LifePoints: P0: ${finalState.p0LP} LP | P1: ${finalState.p1LP} LP`);
  console.log(`  • Total Events:     ${eventCount}`);
  console.log(`  • Engine Steps:     ${finalState.stepCount}`);
  console.log('='.repeat(70));

  if (finalState.winner === null) {
    throw new Error('Duel simulation did not conclude within step limit!');
  }

  console.log('  [PASS] Real filtered card pool duel successfully ran to completion!\n');
  duelEngineService.close();
}

runTestDuel().catch((err) => {
  console.error('[TEST FATAL ERROR]:', err);
  process.exit(1);
});
