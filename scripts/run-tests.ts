import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const testFiles = [
  'tests/guidance-targeting.test.ts',
  'tests/hand-and-pacing.test.ts',
  'tests/stack-inspection.test.ts',
  'tests/random-draw-and-deck.test.ts',
  'tests/status-animation-video.test.ts',
  'tests/prebuilt-decks-and-selector.test.ts',
  'tests/monster-reborn-activation.test.ts',
  'tests/card-selection-modal.test.ts',
  'tests/option-strings-resolution.test.ts',
  'tests/special-summon-monsters.test.ts',
  'tests/animation-order-and-deduplication.test.ts',
  'tests/battle-selection-and-variable-stats.test.ts',
  'tests/battle-attack-cancellation.test.ts',
  'tests/elemental-hero-egyxos.test.ts',
  'tests/ritual-summon-ai.test.ts',
  'tests/announcements-and-field-mechanics.test.ts',
  'tests/ai-opponent-personality.test.ts',
  'tests/phase14-qa-and-packaging.test.ts',
  'tests/card-mechanics-and-engine-fixes.test.ts',
  'tests/duel-logs-store.test.ts',
  'tests/legendary-ai-executors.test.ts',
  'tests/transition-animations-and-hand-integrity.test.ts',
  'tests/hand-reveal-mechanics.test.ts',
  'tests/audio-manager-and-ducking.test.ts',
  'tests/sound-effects-matrix.test.ts',
  'tests/ai-post-match-reviewer-and-tactics.test.ts',
  'tests/prebuilt-decks-and-roster-expansion.test.ts',
  'tests/field-spell-zone-and-ai-traps.test.ts',
  'tests/dice-coin-counters-and-flip-ai.test.ts',
  'tests/deck-card-filter.test.ts',
  'tests/legacy-cards-integrity.test.ts',
  'tests/legacy-archetype-duels.test.ts',
  'tests/gemini-duel-service.test.ts',
  'tests/llm-multi-provider.test.ts',
  'tests/smart-update-service.test.ts',
  'tests/action-ordering-and-extra-shift.test.ts',
  'tests/ai-core-engine-fixes.test.ts',
  'tests/ai-archetype-combos.test.ts',
  'tests/multiplayer-pvp-protocol.test.ts',
  'tests/multi-tribute-monsters.test.ts',
];

console.log(`=== Executing ${testFiles.length} Test Suites ===\n`);

let passed = 0;
let failed = 0;

for (const testFile of testFiles) {
  const filePath = path.resolve(process.cwd(), testFile);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Test file missing: ${testFile}`);
    failed++;
    continue;
  }

  process.stdout.write(`▶ Running ${testFile}... `);
  const result = spawnSync(process.execPath, [
    path.resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs'),
    filePath,
  ], {
    cwd: process.cwd(),
    encoding: 'utf-8',
    env: { ...process.env, NODE_ENV: 'test' },
  });

  if (result.status === 0) {
    console.log('✓ PASSED');
    passed++;
  } else {
    console.log(`❌ FAILED (Exit status: ${result.status}, signal: ${result.signal})`);
    if (result.error) {
      console.error('Process Error:', result.error);
    }
    console.error('\n--- STDOUT ---');
    console.error(result.stdout);
    console.error('--- STDERR ---');
    console.error(result.stderr);
    console.error('--------------\n');
    failed++;
    process.exit(1);
  }
}

console.log(`\n🎉 ALL ${passed} TEST SUITES PASSED CLEANLY!\n`);
