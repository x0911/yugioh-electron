import fs from 'node:fs';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { ExecutorRegistry } from '../src/main/ai/executors/registry.js';

const decks = JSON.parse(fs.readFileSync('data/prebuilt-decks.json', 'utf8'));
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

const unhandled: any[] = [];
const handled: any[] = [];

for (const d of decks) {
  const ctx = { ...mockContext, deckArchetype: d.archetype || '' };
  const exec = registry.getExecutor(ctx, d.main || []);
  if (exec.id === 'default-universal') {
    unhandled.push({ id: d.id, name: d.name, archetype: d.archetype, mainLen: (d.main || []).length });
  } else {
    handled.push({ id: d.id, name: d.name, archetype: d.archetype, executor: exec.name });
  }
}

console.log('Total Decks:', decks.length);
console.log('Handled by specialized executor:', handled.length);
console.log('Unhandled (falling back to DefaultExecutor):', unhandled.length);

const unhandledArchs: Record<string, number> = {};
unhandled.forEach(u => {
  const a = u.archetype || 'Unknown';
  unhandledArchs[a] = (unhandledArchs[a] || 0) + 1;
});

console.log('\nTop unhandled archetypes in our game:');
const sorted = Object.entries(unhandledArchs).sort((a,b) => b[1] - a[1]);
sorted.forEach(([arch, count], i) => {
  console.log(`${i + 1}. ${arch}: ${count} deck(s)`);
});

console.log('\n--- Unhandled Decks List ---');
unhandled.forEach(u => {
  console.log(`[${u.id}] ${u.name} (${u.archetype})`);
});

