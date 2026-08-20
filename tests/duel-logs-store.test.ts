import assert from 'node:assert/strict';
import { useDuelLogsStore, type SavedDuelLog } from '../src/renderer/stores/duelLogsStore.js';
import { createPinia, setActivePinia } from 'pinia';

const mockStore = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => mockStore.get(k) || null,
    setItem: (k: string, v: string) => mockStore.set(k, v),
    removeItem: (k: string) => mockStore.delete(k),
    clear: () => mockStore.clear(),
  },
  writable: true,
  configurable: true,
});

async function runLogsStoreTests() {
  console.log('=== RUNNING DUEL LOGS STORE & MAX-10 PRUNING TESTS ===\n');

  setActivePinia(createPinia());
  const logsStore = useDuelLogsStore();
  logsStore.clearAllDuels();

  // Test 1: Record a duel
  console.log('▶ Test 1: Record completed duel');
  const d1 = logsStore.recordDuel({
    playerName: 'Player (You)',
    playerStartingLp: 8000,
    playerFinalLp: 8000,
    opponentId: 'yami-yugi',
    opponentName: 'Yami Yugi',
    opponentTitle: 'King of Games',
    opponentSeries: 'DM',
    opponentStartingLp: 8000,
    opponentFinalLp: 0,
    turns: 12,
    outcome: 'victory',
    outcomeLabel: 'VICTORY',
    winReason: 'Opponent LP Reduced to 0',
    totalEvents: 45,
    markdownLog: '```yugioh-duel-log\n=== YU-GI-OH! DUEL LOG & DIAGNOSTIC REPORT ===\n```',
    logs: [
      { time: '00:01.2', type: 'DRAW', description: 'Player 0 drew 5 cards.' },
      { time: '00:05.4', type: 'WIN', description: 'Player 0 won the duel!' },
    ],
  });

  assert.equal(logsStore.savedDuels.length, 1);
  assert.equal(logsStore.savedDuels[0].outcome, 'victory');
  assert.equal(logsStore.victoryCount, 1);
  console.log('  ✓ Duel successfully recorded!\n');

  // Test 2: Max 10 limit pruning
  console.log('▶ Test 2: Max 10 limit pruning (Adding 15 duels)');
  for (let i = 2; i <= 15; i++) {
    logsStore.recordDuel({
      playerName: 'Player (You)',
      playerStartingLp: 8000,
      playerFinalLp: i % 2 === 0 ? 0 : 4000,
      opponentId: `opponent-${i}`,
      opponentName: `Opponent ${i}`,
      opponentStartingLp: 8000,
      opponentFinalLp: i % 2 === 0 ? 8000 : 0,
      turns: i + 3,
      outcome: i % 2 === 0 ? 'defeat' : 'victory',
      outcomeLabel: i % 2 === 0 ? 'DEFEAT' : 'VICTORY',
      totalEvents: 30 + i,
      markdownLog: '```yugioh-duel-log\nDuel #' + i + '\n```',
      logs: [],
    });
  }

  assert.equal(logsStore.savedDuels.length, 10, 'Must never exceed 10 saved duels');
  assert.equal(logsStore.savedDuels[0].opponentName, 'Opponent 15', 'Latest duel must be at index 0');
  console.log('  ✓ Exactly 10 duels retained, oldest pruned automatically!\n');

  // Test 3: Markdown report building
  console.log('▶ Test 3: Standard Markdown Diagnostic Report generation');
  const mockBoardState: any = {
    turnNumber: 5,
    currentPhase: 'M1',
    userField: {
      isTurn: true,
      currentLp: 6000,
      maxLp: 8000,
      monsterZones: [
        { code: 10000020, name: 'Slifer the Sky Dragon', atk: 3000, def: 3000, position: 'faceup_attack' },
      ],
      hand: [{ name: 'Pot of Greed' }, { name: 'Monster Reborn' }],
    },
    opponentField: {
      name: 'Seto Kaiba',
      currentLp: 1200,
      maxLp: 8000,
      monsterZones: [],
      hand: [{}, {}],
    },
  };

  const mdReport = logsStore.buildMarkdownReport(mockBoardState, [
    { time: '01:23.4', type: 'SUMMONING', description: 'Player 0 is Normal Summoning Slifer the Sky Dragon' },
  ], {
    outcome: 'victory',
    winReason: 'Direct Attack by Slifer',
  });

  assert(mdReport.includes('```yugioh-duel-log'), 'Must be formatted with yugioh-duel-log tag');
  assert(mdReport.includes('Slifer the Sky Dragon'), 'Must include active monster details');
  assert(mdReport.includes('Seto Kaiba'), 'Must include opponent name');
  assert(mdReport.includes('Direct Attack by Slifer'), 'Must include win reason');
  console.log('  ✓ Markdown report generated cleanly!\n');

  console.log('================================================================');
  console.log('🎉 ALL DUEL LOGS STORE TESTS PASSED 100%!');
  console.log('================================================================\n');
}

runLogsStoreTests().catch((err) => {
  console.error('❌ Tests Failed:', err);
  process.exit(1);
});
