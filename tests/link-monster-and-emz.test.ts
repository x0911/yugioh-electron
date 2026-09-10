import assert from 'node:assert/strict';
import { duelEngineService } from '../src/main/engine/DuelEngineService.js';
import { parseFieldMask } from '../src/main/engine/messageDecoder.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  OcgLocation,
} from 'ocgcore-wasm';

async function run() {
  console.log('=== Running Link Monster Summoning & EMZ Test Suite ===\n');
  await duelEngineService.init();

  // Test 1: parseFieldMask correctly parses Extra Monster Zone bits (bits 5 and 6)
  {
    console.log('Test 1: parseFieldMask parses Extra Monster Zone bits (bits 5 and 6)...');
    // 0xFFFFFF9F has bits 5 and 6 available (inverting gives 0x60 = 0x20 | 0x40)
    const fieldMask = 4294967199;
    const places = parseFieldMask(0, fieldMask, 2);

    assert.equal(places.length, 2, 'Should find 2 selectable places');
    assert.deepEqual(places[0], {
      player: 0,
      location: OcgLocation.MZONE,
      sequence: 5,
    });
    assert.deepEqual(places[1], {
      player: 0,
      location: OcgLocation.MZONE,
      sequence: 6,
    });
    console.log('  ✓ parseFieldMask correctly extracts EMZ sequences 5 and 6.');
  }

  // Test 2: Native Link Summoning to EMZ without freeze or RETRY
  {
    console.log('\nTest 2: Special Summon Xtra HERO Wonder Driver to EMZ 0...');
    duelEngineService.startNewDuel({
      player0Deck: [
        40044918, 40044918, 40044918, // Stratos
        ...Array(37).fill(25652259), // Sparks
      ],
      player0ExtraDeck: [
        1948619, // Xtra HERO Wonder Driver (Link-2)
      ],
      player0Monsters: [
        { code: 40044918, sequence: 0 }, // Stratos
        { code: 9411399, sequence: 1 },  // Malicious
      ],
      player1Deck: Array(40).fill(25652259),
      humanPlayerId: 0,
      noShuffle: true,
    });

    const prompt1 = (duelEngineService as any).lastPromptMessage;
    assert.equal(prompt1?.type, OcgMessageType.SELECT_IDLECMD, 'Initial prompt should be SELECT_IDLECMD');

    const spIndex = prompt1.special_summons?.findIndex((s: any) => s.code === 1948619);
    assert.ok(spIndex !== undefined && spIndex >= 0, 'Wonder Driver must be available for Special Summon');

    // Send Special Summon action for Wonder Driver
    duelEngineService.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
      index: spIndex,
    });

    // Handle material selection via SELECT_UNSELECT_CARD
    let p = (duelEngineService as any).lastPromptMessage;
    let steps = 0;
    while (p && p.type === OcgMessageType.SELECT_UNSELECT_CARD && steps < 10) {
      steps++;
      duelEngineService.sendResponse({
        type: OcgResponseType.SELECT_UNSELECT_CARD,
        index: 0,
      });
      p = (duelEngineService as any).lastPromptMessage;
    }

    // Engine should auto-resolve SELECT_PLACE and transition back to SELECT_IDLECMD
    const afterPrompt = (duelEngineService as any).lastPromptMessage;
    assert.ok(afterPrompt, 'Engine must have active prompt after Link Summon (no freeze/RETRY soft-lock)');
    assert.equal(afterPrompt?.type, OcgMessageType.SELECT_IDLECMD, 'Next prompt must be SELECT_IDLECMD');

    // Verify board state
    const boardState = duelEngineService.getBoardState();
    assert.equal(boardState.userField.monsterZones.length, 5, 'User MMZ must have exactly 5 slots');
    assert.equal(boardState.opponentField.monsterZones.length, 5, 'Opponent MMZ must have exactly 5 slots');

    // Wonder Driver is in EMZ 0 (left EMZ)
    assert.ok(boardState.extraMonsterZones[0], 'EMZ 0 must be occupied by Wonder Driver');
    assert.equal(boardState.extraMonsterZones[0]?.code, 1948619);
    assert.equal(boardState.extraMonsterZones[0]?.name, 'Xtra HERO Wonder Driver');
    assert.equal(boardState.extraMonsterZones[0]?.atk, 1900);
    assert.equal(boardState.extraMonsterZones[0]?.sequence, 5);
    assert.equal(boardState.extraMonsterZones[1], null, 'EMZ 1 must be empty');

    // Material monsters were cleared from main monster zones
    assert.equal(boardState.userField.monsterZones[0], null, 'MMZ 0 must be cleared');
    assert.equal(boardState.userField.monsterZones[1], null, 'MMZ 1 must be cleared');
    console.log('  ✓ Wonder Driver successfully Link Summoned to EMZ 0 and board state verified.');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL LINK MONSTER & EMZ INTEGRATION TESTS PASSED 100%!');
  console.log('================================================================\n');
}

run().catch((err) => {
  console.error('❌ Link monster test failed:', err);
  process.exit(1);
});
