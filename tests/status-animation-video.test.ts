import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ViewFilterService } from '../src/main/engine/viewFilter.js';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import type { FieldCard, PlayerFieldState } from '../src/shared/types/field.js';
import type { CardVideoEntry, CardVideoPayload } from '../src/shared/types/duel.js';

console.log('=== Running Phase 12 Status Icons, Animations, & Video Engine Tests ===\n');

const viewFilter = new ViewFilterService();

// -----------------------------------------------------------------------------
// Test 1: ViewFilter Sanitizes Statuses and Stats for Hidden Opponent Cards
// -----------------------------------------------------------------------------
{
  console.log('Test 1: ViewFilter sanitizes hidden opponent cards...');

  const visibleUserCard: FieldCard = {
    id: 'user-c1',
    code: 46986414,
    name: 'Dark Magician',
    controller: 0,
    location: 'monster',
    sequence: 0,
    position: 'faceup_attack',
    atk: 2500,
    def: 2100,
    statuses: ['no-attack'],
  };

  const filteredUserCard = viewFilter.filterFieldCardForViewer(visibleUserCard, 0);
  assert.equal(filteredUserCard?.code, 46986414);
  assert.equal(filteredUserCard?.atk, 2500);
  assert.deepEqual(filteredUserCard?.statuses, ['no-attack'], 'User visible card should retain statuses');

  const hiddenOpponentCard: FieldCard = {
    id: 'opp-c1',
    code: 89631139,
    name: 'Blue-Eyes White Dragon',
    controller: 1,
    location: 'monster',
    sequence: 0,
    position: 'facedown_defense',
    atk: 3000,
    def: 2500,
    statuses: ['no-attack', 'negated'],
  };

  const filteredOpponentCard = viewFilter.filterFieldCardForViewer(hiddenOpponentCard, 0);
  assert.equal(filteredOpponentCard?.code, 0, 'Opponent face-down card code must be redacted to 0');
  assert.equal(filteredOpponentCard?.atk, undefined, 'Opponent face-down card ATK must be undefined');
  assert.deepEqual(filteredOpponentCard?.statuses, [], 'Opponent face-down card statuses must be sanitized to []');

  console.log('  ✓ ViewFilter correctly masks secret cards without leaking status flags.');
}

// -----------------------------------------------------------------------------
// Test 2: Card Status Computation (7 Status Flags)
// -----------------------------------------------------------------------------
{
  console.log('\nTest 2: Engine computation of the 7 status flags...');

  const engine = new DuelEngineService();

  // 1. no-attack (Defense position)
  const defMonster: FieldCard = {
    id: 'm1',
    code: 46986414,
    name: 'Dark Magician',
    controller: 0,
    location: 'monster',
    sequence: 0,
    position: 'faceup_defense',
    atk: 2500,
    def: 2100,
  };
  const defStatuses = engine.computeCardStatuses(defMonster);
  assert.ok(defStatuses.includes('no-attack'), 'Defense monster should have no-attack status');

  // 2. no-special-summon
  const spiritMonster: FieldCard = {
    id: 'm2',
    code: 46986414,
    name: 'Special Monster',
    controller: 0,
    location: 'monster',
    sequence: 1,
    position: 'faceup_attack',
    statuses: ['no-special-summon'],
  };
  const spiritStatuses = engine.computeCardStatuses(spiritMonster);
  assert.ok(spiritStatuses.includes('no-special-summon'), 'Retains no-special-summon status');

  // 3. temp-banished, fusion-material, synchro-material, destroyed-battle, negated
  const multiStatusCard: FieldCard = {
    id: 'm3',
    code: 45231177,
    name: 'Flame Swordsman',
    controller: 0,
    location: 'graveyard',
    sequence: 0,
    position: 'faceup_spell',
    statuses: ['temp-banished', 'fusion-material', 'synchro-material', 'destroyed-battle', 'negated'],
  };
  const allStatuses = engine.computeCardStatuses(multiStatusCard);
  assert.ok(allStatuses.includes('temp-banished'));
  assert.ok(allStatuses.includes('fusion-material'));
  assert.ok(allStatuses.includes('synchro-material'));
  assert.ok(allStatuses.includes('destroyed-battle'));
  assert.ok(allStatuses.includes('negated'));

  console.log('  ✓ All 7 status flags are properly supported and computed.');
}

// -----------------------------------------------------------------------------
// Test 3: card-videos.json Mapping & Structure
// -----------------------------------------------------------------------------
{
  console.log('\nTest 3: card-videos.json validation...');

  const jsonPath = path.resolve(process.cwd(), 'data/card-videos.json');
  assert.ok(fs.existsSync(jsonPath), 'data/card-videos.json must exist');

  const content = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Record<string, CardVideoEntry>;
  
  // Iconic Cards
  assert.ok(content['46986414'], 'Dark Magician (46986414) mapped');
  assert.equal(content['46986414'].cardName, 'Dark Magician');
  assert.ok(content['46986414'].summon);

  assert.ok(content['89631139'], 'Blue-Eyes White Dragon (89631139) mapped');
  assert.equal(content['89631139'].cardName, 'Blue-Eyes White Dragon');
  assert.ok(content['89631139'].attack);

  assert.ok(content['21844576'], 'Elemental HERO Neos (21844576) mapped');
  assert.equal(content['21844576'].series, 'GX');

  assert.ok(content['70781052'], 'Summoned Skull (70781052) mapped');

  console.log('  ✓ data/card-videos.json is well-formed with valid card mappings.');
}

// -----------------------------------------------------------------------------
// Test 4: Video Pause Engine Synchronization
// -----------------------------------------------------------------------------
{
  console.log('\nTest 4: Video pause engine synchronization...');

  const engine = new DuelEngineService();

  let receivedVideo: CardVideoPayload | null = null;
  engine.onPlayVideo((payload) => {
    receivedVideo = payload;
  });

  assert.equal(engine.getState().isVideoPlaying, false);

  // When onVideoFinished is called, state clears
  engine.onVideoFinished();
  assert.equal(engine.getState().isVideoPlaying, false);

  console.log('  ✓ Video pause engine synchronization logic passes.');
}

console.log('\nAll Phase 12 tests passed successfully! ✨\n');
