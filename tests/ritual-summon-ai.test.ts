import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgMessageType, OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Ritual Summon AI Test ===\n');

if (process.platform === 'win32') {
  console.log('Skipping Ritual Summon AI test on Windows CI due to upstream ocgcore-wasm WASM buffer alignment in Node x64.');
  process.exit(0);
}

async function testAiRitualSummon() {
  console.log('Test 1: AI Player activating Black Luster Ritual (55761792) to summon Black Luster Soldier (5405694)...');

  const engine = new DuelEngineService();
  await engine.init();

  let blsRitualSummoned = false;
  const observedEvents: string[] = [];

  engine.onEvent((ev: DecodedDuelEvent) => {
    console.log(`[Event] type: ${ev.type}, isPrompt: ${ev.isPrompt}, promptType: ${ev.promptType}, promptPlayer: ${ev.promptPlayer}`);
    if (ev.isPrompt) {
      console.log(`  -> Prompt Data:`, JSON.stringify(ev.promptData));
    }
    if ((ev.type === 'SPSUMMONING' || ev.type === 'SPSUMMONED') && (ev.code === 5405694 || blsRitualSummoned)) {
      blsRitualSummoned = true;
    }
    if (ev.type === 'SPSUMMONING' && ev.code === 5405694) {
      blsRitualSummoned = true;
    }
  });

  // Player 0 (AI) has Black Luster Ritual (55761792), Black Luster Soldier (5405694), and two Celtic Guardians (91152256, Level 4 each -> Sum = 8) in opening hand!
  const p0Deck: number[] = [];
  while (p0Deck.length < 35) p0Deck.push(40640057); // Kuriboh
  p0Deck.push(91152256); // Celtic Guardian (Level 4)
  p0Deck.push(91152256); // Celtic Guardian (Level 4)
  p0Deck.push(40640057); // Kuriboh
  p0Deck.push(5405694);  // Black Luster Soldier (Ritual Monster, Level 8)
  p0Deck.push(55761792); // Black Luster Ritual

  const p1Deck: number[] = [];
  while (p1Deck.length < 40) p1Deck.push(91152256);

  // User is Player 1, AI is Player 0
  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    noShuffle: true,
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 1,
    autoPlay: true,
  });

  const start = Date.now();
  while (!blsRitualSummoned && Date.now() - start < 25000) {
    await new Promise((r) => setTimeout(r, 50));
  }

  assert.strictEqual(blsRitualSummoned, true, 'AI must successfully Ritual Summon Black Luster Soldier without freezing');
  console.log('✓ Black Luster Ritual AI execution successfully completed!');
  engine.close();
}

testAiRitualSummon().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
