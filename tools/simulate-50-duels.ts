import fs from 'node:fs';
import path from 'node:path';
import { duelEngineService } from '../src/main/engine/DuelEngineService.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { ExecutorRegistry } from '../src/main/ai/executors/registry.js';

interface DuelRecord {
  duelIndex: number;
  deck0: { id: string; name: string; archetype: string; executor: string };
  deck1: { id: string; name: string; archetype: string; executor: string };
  winner: string;
  winnerPlayerId: number | null;
  turnsPlayed: number;
  finalLp0: number;
  finalLp1: number;
  totalEvents: number;
  stepsCount: number;
  tacticalHighlights: string[];
  blundersDetected: string[];
}

async function run50Duels() {
  const origLog = console.log;
  console.log = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('[AI Debug]')) {
      return;
    }
    origLog(...args);
  };

  console.log('='.repeat(80));
  console.log('  YU-GI-OH! WINDBOT AI ENGINE VERIFICATION: 50 HEADLESS DUELS');
  console.log('  Testing 100% Decoupled Archetype Executors, Tactical Play & Decision Quality');
  console.log('='.repeat(80));

  await duelEngineService.init();

  const registry = ExecutorRegistry.getInstance();
  const cardReader = new CardReaderService();
  const mockContext: any = {
    aiPlayerId: 1,
    humanPlayerId: 0,
    boardState: { userField: {}, opponentField: {} },
    personality: {},
    cardReader,
    currentPhase: 'M1',
    currentTurn: 1,
    signatureCardIds: [],
    deckArchetype: '',
  };

  const prebuiltDecksPath = path.resolve(process.cwd(), 'data/prebuilt-decks.json');
  const allDecks: any[] = JSON.parse(fs.readFileSync(prebuiltDecksPath, 'utf-8'));
  console.log(`Loaded ${allDecks.length} prebuilt decks from data/prebuilt-decks.json\n`);

  const results: DuelRecord[] = [];
  let totalBlunders = 0;
  let totalTactics = 0;
  let specializedMatches = 0;

  for (let duelIdx = 1; duelIdx <= 50; duelIdx++) {
    // Pick two distinct decks from diverse archetypes
    const idx0 = (duelIdx * 7) % allDecks.length;
    let idx1 = (duelIdx * 13 + 5) % allDecks.length;
    if (idx1 === idx0) idx1 = (idx0 + 1) % allDecks.length;

    const deck0 = allDecks[idx0];
    const deck1 = allDecks[idx1];

    const exec0 = registry.getExecutor({ ...mockContext, deckArchetype: deck0.archetype || '' }, deck0.main || []);
    const exec1 = registry.getExecutor({ ...mockContext, deckArchetype: deck1.archetype || '' }, deck1.main || []);

    if (exec0.id !== 'default-universal') specializedMatches++;
    if (exec1.id !== 'default-universal') specializedMatches++;

    console.log(`\n>>> STARTING DUEL ${duelIdx}/50:`);
    console.log(`    Player 0: [${deck0.name}] (${deck0.archetype || 'N/A'}) -> Executor: ${exec0.name}`);
    console.log(`    Player 1: [${deck1.name}] (${deck1.archetype || 'N/A'}) -> Executor: ${exec1.name}`);

    const tacticalHighlights: string[] = [];
    const blundersDetected: string[] = [];
    let eventCount = 0;

    const unsub = duelEngineService.onEvent((ev: any) => {
      eventCount++;
      const desc = ev.description || ev.text || '';

      if (ev.type === 'NEW_TURN') {
        if (ev.turnNumber <= 4 || ev.turnNumber % 4 === 0) {
          tacticalHighlights.push(`[T${ev.turnNumber}] Turn begins`);
        }
      } else if (ev.type === 'SUMMONING' || ev.type === 'SPSUMMONING') {
        if (
          desc.includes('Dragon') ||
          desc.includes('HERO') ||
          desc.includes('Synchro') ||
          desc.includes('Pegasus') ||
          desc.includes('Whirlwind') ||
          desc.includes('Junk') ||
          desc.includes('Yubel') ||
          desc.includes('Hamon') ||
          desc.includes('Uria') ||
          desc.includes('Shi En') ||
          desc.includes('Obelisk')
        ) {
          tacticalHighlights.push(`[T${ev.turnNumber || '?'}] Summon: ${desc}`);
          totalTactics++;
        }
      } else if (ev.type === 'CHAINING') {
        if (
          desc.includes('Raigeki') ||
          desc.includes('Dark Hole') ||
          desc.includes('Mirror Force') ||
          desc.includes('Solemn') ||
          desc.includes('Whirlwind') ||
          desc.includes('Fossil Dig') ||
          desc.includes('Abundance') ||
          desc.includes('United') ||
          desc.includes('Dealings')
        ) {
          tacticalHighlights.push(`[T${ev.turnNumber || '?'}] Key Spell/Trap Chain: ${desc}`);
          totalTactics++;
        }
      } else if (ev.type === 'DAMAGE') {
        if (ev.damage >= 2000) {
          tacticalHighlights.push(`[T${ev.turnNumber || '?'}] Massive Strike: -${ev.damage} LP`);
        }
      }

      // Check for dump / blunders:
      // e.g. activating hand destruction or card destruction when opponent is nearly dead, giving them resources
      if (ev.type === 'CHAINING' && (desc.includes('Card Destruction') || desc.includes('Hand Destruction'))) {
        const state = duelEngineService.getState();
        const activePlayer = state.currentTurn % 2 === 1 ? 0 : 1;
        const oppLp = activePlayer === 0 ? state.p1LP : state.p0LP;
        if (oppLp <= 1000) {
          blundersDetected.push(`[BLUNDER] Discarded/refreshed opponent hand when they were at ${oppLp} LP`);
          totalBlunders++;
        }
      }
    });

    const success = duelEngineService.startNewDuel({
      player0Deck: deck0.main || [],
      player1Deck: deck1.main || [],
      player0Extra: deck0.extra || [],
      player1Extra: deck1.extra || [],
      player0Name: deck0.name.substring(0, 20),
      player1Name: deck1.name.substring(0, 20),
      player0DeckArchetype: deck0.archetype || '',
      aiDeckArchetype: deck1.archetype || '',
      player0CharacterId: 'popular',
      aiCharacterId: 'popular',
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      autoPlay: true,
      instantAi: true,
    });

    if (!success) {
      console.error(`Failed to start duel ${duelIdx}`);
      unsub();
      continue;
    }

    let loopCount = 0;
    const maxLoops = 200;

    while (duelEngineService.getState().isActive && loopCount < maxLoops) {
      loopCount++;
      duelEngineService.processStep();
    }

    const finalState = duelEngineService.getState();
    unsub();

    const winnerName = finalState.winner === 0 ? deck0.name : (finalState.winner === 1 ? deck1.name : 'Tie/Draw (Step Limit)');

    console.log(`    Result: ${finalState.winner !== null ? `Winner: ${winnerName}` : 'Incomplete (Step limit)'}`);
    console.log(`    Turns: ${finalState.currentTurn} | LP: [P0] ${finalState.p0LP} vs [P1] ${finalState.p1LP} | Steps: ${loopCount}`);
    if (blundersDetected.length > 0) {
      console.log(`    ⚠️ Blunders Detected: ${blundersDetected.join(', ')}`);
    } else {
      console.log(`    ✓ Clean Execution: 0 blunders detected.`);
    }

    results.push({
      duelIndex: duelIdx,
      deck0: { id: deck0.id, name: deck0.name, archetype: deck0.archetype, executor: exec0.name },
      deck1: { id: deck1.id, name: deck1.name, archetype: deck1.archetype, executor: exec1.name },
      winner: winnerName,
      winnerPlayerId: finalState.winner,
      turnsPlayed: finalState.currentTurn,
      finalLp0: finalState.p0LP,
      finalLp1: finalState.p1LP,
      totalEvents: eventCount,
      stepsCount: loopCount,
      tacticalHighlights: tacticalHighlights.slice(0, 6),
      blundersDetected,
    });

    duelEngineService.close();
  }

  console.log('\n' + '='.repeat(80));
  console.log('  50 HEADLESS DUELS SIMULATION AUDIT REPORT');
  console.log('='.repeat(80));
  const completed = results.filter(r => r.winnerPlayerId !== null).length;
  const avgTurns = results.reduce((a, b) => a + b.turnsPlayed, 0) / results.length;
  const p0Wins = results.filter(r => r.winnerPlayerId === 0).length;
  const p1Wins = results.filter(r => r.winnerPlayerId === 1).length;

  console.log(`Total Duels: 50`);
  console.log(`Completed to Decisive Finish: ${completed}/50 (${((completed/50)*100).toFixed(1)}%)`);
  console.log(`P0 (Turn 1) Wins: ${p0Wins} | P1 (Turn 2) Wins: ${p1Wins}`);
  console.log(`Average Turns per Duel: ${avgTurns.toFixed(1)} turns`);
  console.log(`Specialized Executor Resolution Rate: ${specializedMatches}/100 (${((specializedMatches/100)*100).toFixed(1)}%)`);
  console.log(`Total Blunders Detected: ${totalBlunders}`);
  console.log(`Total Strategic/Tactical Plays Logged: ${totalTactics}`);
  console.log('='.repeat(80));
}

run50Duels().catch(err => {
  console.error('Simulation error:', err);
  process.exit(1);
});
