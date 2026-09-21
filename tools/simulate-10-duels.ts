import fs from 'node:fs';
import path from 'node:path';
import { duelEngineService } from '../src/main/engine/DuelEngineService.js';
import type { CharacterData, CharacterDeckData } from '../src/shared/types/character.js';
import { OcgMessageType, OcgResponseType } from 'ocgcore-wasm';

interface DuelAuditRecord {
  duelIndex: number;
  char0: { id: string; name: string; deckName: string };
  char1: { id: string; name: string; deckName: string };
  winner: string;
  winnerPlayerId: number | null;
  winReason: number | null;
  turnsPlayed: number;
  finalLp0: number;
  finalLp1: number;
  totalEvents: number;
  stepsCount: number;
  keyMoments: string[];
  blundersDetected: string[];
  tacticalPraises: string[];
}

async function runSimulation() {
  // Filter out noisy per-step engine debug logs so duel summary is clean and readable
  const origLog = console.log;
  console.log = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('[AI Debug]')) {
      return;
    }
    origLog(...args);
  };

  console.log('='.repeat(80));
  console.log('  YU-GI-OH! HEADLESS SIMULATION: 10 REAL DUELS (AI VS AI)');
  console.log('  Testing Macro-Game Logic, Lethal Rush & Universal Evaluators');
  console.log('='.repeat(80));

  // 1. Initialize Engine
  await duelEngineService.init();

  // 2. Load Characters from data/characters.json
  const charactersJsonPath = path.resolve(process.cwd(), 'data/characters.json');
  const allCharacters: CharacterData[] = JSON.parse(fs.readFileSync(charactersJsonPath, 'utf-8'));
  console.log(`Loaded ${allCharacters.length} characters from data/characters.json\n`);

  const results: DuelAuditRecord[] = [];

  for (let duelIdx = 1; duelIdx <= 10; duelIdx++) {
    // Pick two distinct characters at random
    const idx0 = Math.floor(Math.random() * allCharacters.length);
    let idx1 = Math.floor(Math.random() * allCharacters.length);
    while (idx1 === idx0) {
      idx1 = Math.floor(Math.random() * allCharacters.length);
    }

    const char0 = allCharacters[idx0];
    const char1 = allCharacters[idx1];

    const deck0 = char0.decks[Math.floor(Math.random() * char0.decks.length)];
    const deck1 = char1.decks[Math.floor(Math.random() * char1.decks.length)];

    console.log(`\n>>> STARTING DUEL ${duelIdx}/10:`);
    console.log(`    Player 0: ${char0.name} (Deck: "${deck0.name}", ${deck0.mainCards.length} cards)`);
    console.log(`    Player 1: ${char1.name} (Deck: "${deck1.name}", ${deck1.mainCards.length} cards)`);

    const keyMoments: string[] = [];
    const blundersDetected: string[] = [];
    const tacticalPraises: string[] = [];
    let eventCount = 0;

    // Listen for events
    const unsub = duelEngineService.onEvent((ev: any) => {
      eventCount++;
      const desc = ev.description || ev.text || '';

      if (ev.type === 'NEW_TURN') {
        if (ev.turnNumber <= 5 || ev.turnNumber % 5 === 0) {
          keyMoments.push(`[T${ev.turnNumber}] Turn begins (Active: P${ev.player})`);
        }
      } else if (ev.type === 'SUMMONING' || ev.type === 'SPSUMMONING') {
        if (desc.includes('Dragon') || desc.includes('HERO') || desc.includes('Synchro') || desc.includes('Armed') || desc.includes('Monarch')) {
          keyMoments.push(`[T${ev.turnNumber || '?'}] Summon: ${desc}`);
        }
      } else if (ev.type === 'CHAINING') {
        if (desc.includes('Raigeki') || desc.includes('Dark Hole') || desc.includes('Mirror Force') || desc.includes('Solemn') || desc.includes('Destruction')) {
          keyMoments.push(`[T${ev.turnNumber || '?'}] Activation: ${desc}`);
        }
      } else if (ev.type === 'DAMAGE') {
        if (ev.damage >= 2000) {
          keyMoments.push(`[T${ev.turnNumber || '?'}] Heavy Damage: ${desc}`);
        }
      } else if (ev.type === 'WIN') {
        keyMoments.push(`[WIN] ${desc}`);
      }

      // Blunder Audit Rules
      if (ev.type === 'CHAINING') {
        if (desc.includes('Card Destruction') || desc.includes('Hand Destruction') || desc.includes('Morphing Jar')) {
          const state = duelEngineService.getState();
          const activePlayer = state.currentTurn % 2 === 1 ? 0 : 1;
          const oppPlayer = 1 - activePlayer;
          const activeLp = activePlayer === 0 ? state.p0LP : state.p1LP;
          const oppLp = activePlayer === 0 ? state.p1LP : state.p0LP;
          if (oppLp <= 2000 && activeLp >= 4000) {
            blundersDetected.push(`Activated ${desc} when opponent was low on LP (${oppLp} LP)!`);
          } else {
            tacticalPraises.push(`Properly timed ${desc} for card filtering.`);
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

    const winnerName = finalState.winner === 0 ? char0.name : (finalState.winner === 1 ? char1.name : 'Tie/Draw');

    console.log(`    Result: ${finalState.winner !== null ? `Winner: ${winnerName}` : 'Incomplete (Step limit)'}`);
    console.log(`    Turns: ${finalState.currentTurn} | Final LP: ${char0.name} ${finalState.p0LP} vs ${char1.name} ${finalState.p1LP} | Steps: ${loopCount}`);

    results.push({
      duelIndex: duelIdx,
      char0: { id: char0.id, name: char0.name, deckName: deck0.name },
      char1: { id: char1.id, name: char1.name, deckName: deck1.name },
      winner: winnerName,
      winnerPlayerId: finalState.winner,
      winReason: finalState.winReason,
      turnsPlayed: finalState.currentTurn,
      finalLp0: finalState.p0LP,
      finalLp1: finalState.p1LP,
      totalEvents: eventCount,
      stepsCount: loopCount,
      keyMoments,
      blundersDetected,
      tacticalPraises,
    });

    duelEngineService.close();
  }

  // Summary Report
  console.log('\n' + '='.repeat(80));
  console.log('  10-DUEL SIMULATION SUMMARY REPORT');
  console.log('='.repeat(80));

  for (const r of results) {
    console.log(`\n[Duel #${r.duelIndex}] ${r.char0.name} (${r.char0.deckName}) vs ${r.char1.name} (${r.char1.deckName})`);
    console.log(`  • Winner:          ${r.winner} (Reason Code: ${r.winReason ?? 'N/A'})`);
    console.log(`  • Length:          ${r.turnsPlayed} turns (${r.stepsCount} steps, ${r.totalEvents} engine events)`);
    console.log(`  • Final LifePoints: ${r.char0.name}: ${r.finalLp0} LP | ${r.char1.name}: ${r.finalLp1} LP`);
    if (r.blundersDetected.length > 0) {
      console.log(`  • ⚠️ Blunders:     ${r.blundersDetected.join('; ')}`);
    } else {
      console.log(`  • ✨ Blunders:     NONE (Clean play, no throws detected)`);
    }
    if (r.keyMoments.length > 0) {
      console.log(`  • Highlights:      ${r.keyMoments.slice(0, 5).join(' -> ')}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('  SIMULATION COMPLETED SUCCESSFULLY');
  console.log('='.repeat(80));
}

runSimulation().catch((err) => {
  console.error('[SIMULATION FATAL ERROR]:', err);
  process.exit(1);
});
