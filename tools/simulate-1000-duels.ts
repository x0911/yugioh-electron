import fs from 'node:fs';
import path from 'node:path';
import { duelEngineService } from '../src/main/engine/DuelEngineService.js';
import type { CharacterData } from '../src/shared/types/character.js';

interface DuelSummary {
  duelIndex: number;
  char0: string;
  deck0: string;
  char1: string;
  deck1: string;
  winner: string;
  winnerPlayerId: number | null;
  winReason: number | null;
  turnsPlayed: number;
  engineSteps: number;
  finalLp0: number;
  finalLp1: number;
  blunders: string[];
}

interface AggregateStats {
  totalDuels: number;
  p0Wins: number;
  p1Wins: number;
  draws: number;
  incompleteDuels: number;
  lpZeroWins: number;
  deckOutWins: number;
  otherWins: number;
  totalTurns: number;
  minTurns: number;
  maxTurns: number;
  avgTurns: number;
  blunderCounts: {
    cardDestructionThrows: number;
    suicideAttacks: number;
    missedDirectLethal: number;
    extremeStallsOver80Turns: number;
    emptyBoardPasses: number;
  };
  sampleBlunders: string[];
}

async function run1000Duels() {
  // Suppress verbose per-step debug logs
  const origLog = console.log;
  console.log = (...args: any[]) => {
    if (typeof args[0] === 'string' && (args[0].startsWith('[AI Debug]') || args[0].startsWith('[DuelEngineService] ocgcore-wasm'))) {
      return;
    }
    origLog(...args);
  };

  console.log('='.repeat(80));
  console.log('  YU-GI-OH! MASSIVE HEADLESS SIMULATION: 1,000 DUELS (AI VS AI)');
  console.log('  Roster-Wide Random Character & Deck Pairings | Full Engine Execution');
  console.log('='.repeat(80));

  await duelEngineService.init();

  const charactersJsonPath = path.resolve(process.cwd(), 'data/characters.json');
  const allCharacters: CharacterData[] = JSON.parse(fs.readFileSync(charactersJsonPath, 'utf-8'));
  console.log(`Loaded ${allCharacters.length} characters with over ${allCharacters.reduce((acc, c) => acc + c.decks.length, 0)} total decks.\n`);

  const totalTargetDuels = 1000;
  const summaries: DuelSummary[] = [];

  const stats: AggregateStats = {
    totalDuels: 0,
    p0Wins: 0,
    p1Wins: 0,
    draws: 0,
    incompleteDuels: 0,
    lpZeroWins: 0,
    deckOutWins: 0,
    otherWins: 0,
    totalTurns: 0,
    minTurns: Infinity,
    maxTurns: 0,
    avgTurns: 0,
    blunderCounts: {
      cardDestructionThrows: 0,
      suicideAttacks: 0,
      missedDirectLethal: 0,
      extremeStallsOver80Turns: 0,
      emptyBoardPasses: 0,
    },
    sampleBlunders: [],
  };

  const startTime = Date.now();

  for (let i = 1; i <= totalTargetDuels; i++) {
    // Pick two random characters
    const idx0 = Math.floor(Math.random() * allCharacters.length);
    let idx1 = Math.floor(Math.random() * allCharacters.length);
    while (idx1 === idx0) {
      idx1 = Math.floor(Math.random() * allCharacters.length);
    }

    const char0 = allCharacters[idx0];
    const char1 = allCharacters[idx1];

    const deck0 = char0.decks[Math.floor(Math.random() * char0.decks.length)];
    const deck1 = char1.decks[Math.floor(Math.random() * char1.decks.length)];

    const duelBlunders: string[] = [];

    const unsub = duelEngineService.onEvent((ev: any) => {
      const desc = ev.description || ev.text || '';

      // Audit 1: Card Destruction / Hand reload when dominating
      if (ev.type === 'CHAINING' && (desc.includes('Card Destruction') || desc.includes('Hand Destruction') || desc.includes('Morphing Jar'))) {
        const state = duelEngineService.getState();
        const activePlayer = state.currentTurn % 2 === 1 ? 0 : 1;
        const oppLp = activePlayer === 0 ? state.p1LP : state.p0LP;
        const activeLp = activePlayer === 0 ? state.p0LP : state.p1LP;
        if (oppLp <= 2000 && activeLp >= 4000) {
          const blunder = `[T${state.currentTurn}] Card Destruction throw: P${activePlayer} activated ${desc} when opponent had only ${oppLp} LP`;
          duelBlunders.push(blunder);
          stats.blunderCounts.cardDestructionThrows++;
        }
      }

      // Audit 2: Suicidal recoil damage exceeding 2500 LP
      if (ev.type === 'DAMAGE' && ev.damage >= 2500) {
        const state = duelEngineService.getState();
        if (state.currentPhase === 'BP') {
          const activePlayer = state.currentTurn % 2 === 1 ? 0 : 1;
          if (ev.player === activePlayer) {
            const blunder = `[T${state.currentTurn}] Heavy self-damage: Turn player P${activePlayer} took ${ev.damage} recoil damage in BP`;
            duelBlunders.push(blunder);
            stats.blunderCounts.suicideAttacks++;
          }
        }
      }
    });

    const success = duelEngineService.startNewDuel({
      player0Deck: deck0.mainCards,
      player1Deck: deck1.mainCards,
      player0Extra: deck0.extraCards || [],
      player1Extra: deck1.extraCards || [],
      player0Name: char0.name,
      player1Name: char1.name,
      player0CharacterId: char0.id,
      aiCharacterId: char1.id,
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      autoPlay: true,
      instantAi: true,
    });

    if (!success) {
      unsub();
      console.error(`Failed to start duel ${i}`);
      continue;
    }

    // Process steps until duel concludes or max iterations
    let iterations = 0;
    const maxIterations = 200; // In instantAi mode, each processStep processes up to 2500 sub-steps

    while (duelEngineService.getState().isActive && iterations < maxIterations) {
      iterations++;
      duelEngineService.processStep();
    }

    const finalState = duelEngineService.getState();
    unsub();

    const turns = finalState.currentTurn;
    const winnerId = finalState.winner;
    const winnerName = winnerId === 0 ? char0.name : (winnerId === 1 ? char1.name : (winnerId === 'draw' ? 'Draw' : 'Incomplete'));

    if (turns > 80) {
      stats.blunderCounts.extremeStallsOver80Turns++;
      duelBlunders.push(`[STALL] Duel dragged out to ${turns} turns (${char0.name} vs ${char1.name})`);
    }

    // Record stats
    stats.totalDuels++;
    if (winnerId === 0) {
      stats.p0Wins++;
    } else if (winnerId === 1) {
      stats.p1Wins++;
    } else if (winnerId === 'draw') {
      stats.draws++;
    } else {
      stats.incompleteDuels++;
    }

    if (finalState.winReason === 1) {
      stats.lpZeroWins++;
    } else if (finalState.winReason === 2) {
      stats.deckOutWins++;
    } else if (finalState.winReason !== null) {
      stats.otherWins++;
    }

    stats.totalTurns += turns;
    stats.minTurns = Math.min(stats.minTurns, turns);
    stats.maxTurns = Math.max(stats.maxTurns, turns);

    if (duelBlunders.length > 0) {
      stats.sampleBlunders.push(...duelBlunders);
    }

    summaries.push({
      duelIndex: i,
      char0: char0.name,
      deck0: deck0.name,
      char1: char1.name,
      deck1: deck1.name,
      winner: winnerName,
      winnerPlayerId: typeof winnerId === 'number' ? winnerId : null,
      winReason: finalState.winReason,
      turnsPlayed: turns,
      engineSteps: finalState.stepCount,
      finalLp0: finalState.p0LP,
      finalLp1: finalState.p1LP,
      blunders: duelBlunders,
    });

    duelEngineService.close();

    // Progress report every 100 duels
    if (i % 100 === 0 || i === totalTargetDuels) {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const avgT = (stats.totalTurns / stats.totalDuels).toFixed(1);
      console.log(
        `[Progress ${String(i).padStart(4, ' ')}/1000] Elapsed: ${elapsedSec}s | P0: ${stats.p0Wins} (${((stats.p0Wins/i)*100).toFixed(1)}%) | P1: ${stats.p1Wins} (${((stats.p1Wins/i)*100).toFixed(1)}%) | Draws: ${stats.draws} | Incomplete: ${stats.incompleteDuels} | Avg Turns: ${avgT}`
      );
    }
  }

  stats.avgTurns = Number((stats.totalTurns / Math.max(1, stats.totalDuels)).toFixed(2));

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(80));
  console.log('  1,000-DUEL AGGREGATE STATISTICAL REPORT');
  console.log('='.repeat(80));
  console.log(`• Total Duels Simulated:   ${stats.totalDuels} in ${totalTimeSec}s (${(stats.totalDuels / Number(totalTimeSec)).toFixed(1)} duels/sec)`);
  console.log(`• Player 0 (Going 1st) Wins: ${stats.p0Wins} (${((stats.p0Wins / stats.totalDuels) * 100).toFixed(2)}%)`);
  console.log(`• Player 1 (Going 2nd) Wins: ${stats.p1Wins} (${((stats.p1Wins / stats.totalDuels) * 100).toFixed(2)}%)`);
  console.log(`• Draws / Ties:              ${stats.draws} (${((stats.draws / stats.totalDuels) * 100).toFixed(2)}%)`);
  console.log(`• Incomplete / Stalled:      ${stats.incompleteDuels} (${((stats.incompleteDuels / stats.totalDuels) * 100).toFixed(2)}%)`);
  console.log(`• Win by LP Reduction to 0:  ${stats.lpZeroWins} (${((stats.lpZeroWins / stats.totalDuels) * 100).toFixed(2)}%)`);
  console.log(`• Win by Deck-Out:           ${stats.deckOutWins} (${((stats.deckOutWins / stats.totalDuels) * 100).toFixed(2)}%)`);
  console.log(`• Win by Special Condition:  ${stats.otherWins} (${((stats.otherWins / stats.totalDuels) * 100).toFixed(2)}%)`);
  console.log(`• Turn Statistics:           Min: ${stats.minTurns} | Max: ${stats.maxTurns} | Avg: ${stats.avgTurns} turns`);
  console.log('-'.repeat(80));
  console.log('  TACTICAL & BLUNDER AUDIT');
  console.log('-'.repeat(80));
  console.log(`• Card Destruction Throws:   ${stats.blunderCounts.cardDestructionThrows}`);
  console.log(`• Suicidal BP Recoil Damage: ${stats.blunderCounts.suicideAttacks}`);
  console.log(`• Extreme Stalls (>80 turns): ${stats.blunderCounts.extremeStallsOver80Turns}`);
  if (stats.sampleBlunders.length > 0) {
    console.log(`\nSample Blunder / Anomaly Logs (${Math.min(10, stats.sampleBlunders.length)} of ${stats.sampleBlunders.length}):`);
    for (const b of stats.sampleBlunders.slice(0, 10)) {
      console.log(`  - ${b}`);
    }
  } else {
    console.log('• Clean Duel Execution: ZERO game-throwing card blunders detected across all 1,000 duels!');
  }
  console.log('='.repeat(80));

  // Save report to JSON file
  const reportPath = path.resolve(process.cwd(), 'tools/simulation-1000-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({ stats, sampleSummaries: summaries.slice(0, 50) }, null, 2));
  console.log(`Detailed audit report saved to ${reportPath}\n`);
}

run1000Duels().catch((err) => {
  console.error('[SIMULATION FATAL ERROR]:', err);
  process.exit(1);
});
