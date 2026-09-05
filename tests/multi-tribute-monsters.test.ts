import assert from 'node:assert';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { getAutoResponse } from '../src/main/engine/messageDecoder.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
} from 'ocgcore-wasm';

console.log('=== Running Multi-Tribute Monster Summon Tests (Egyptian God Slime & Double Coston) ===\n');

async function testObeliskWithGodSlimeOnly() {
  console.log('Test 1: Summon Obelisk (10000000) tributing ONLY Egyptian God Slime (42166000, release_param: 3)...');
  const service = new DuelEngineService();
  await service.init();

  let tributePromptData: any = null;
  service.onEvent((event) => {
    if (event.type === 'SELECT_TRIBUTE') {
      tributePromptData = event.promptData;
    }
  });

  service.startNewDuel({
    player0Deck: [...Array(35).fill(25652259), 10000000, 10000000, 10000000, 10000000, 10000000],
    player0Monsters: [
      { code: 42166000, sequence: 0, position: 0x1 }, // Egyptian God Slime
    ],
    player1Deck: Array(40).fill(25652259),
    noShuffle: true,
    humanPlayerId: 0,
    startingLP: 8000,
  });

  const prompt = (service as any).lastPromptMessage;
  const obeliskIdx = prompt?.summons?.findIndex((s: any) => s.code === 10000000);
  assert.ok(obeliskIdx >= 0, 'Obelisk should be available for Normal Summon in idlecmd');

  service.sendResponse({
    type: OcgResponseType.SELECT_IDLECMD,
    action: SelectIdleCMDAction.SELECT_SUMMON,
    index: obeliskIdx,
  });
  service.processStep();

  assert.ok(tributePromptData, 'SELECT_TRIBUTE prompt should be emitted');
  assert.strictEqual(tributePromptData.min, 3, 'Obelisk requires 3 tributes');
  assert.strictEqual(tributePromptData.max, 3, 'Obelisk requires max 3 tributes');
  assert.strictEqual(tributePromptData.selects.length, 1, 'Only God Slime is on field');
  assert.strictEqual(tributePromptData.selects[0].release_param, 3, 'Egyptian God Slime should have release_param: 3');

  // Respond with only God Slime [0]
  service.sendResponse({
    type: OcgResponseType.SELECT_TRIBUTE,
    indicies: [0],
  });
  service.processStep();

  const board = service.getBoardState();
  const obeliskOnField = board.userField.monsterZones.some((m) => m?.code === 10000000);
  const slimeInGrave = board.userField.graveyard.some((g) => g.code === 42166000);

  assert.ok(obeliskOnField, 'Obelisk must be successfully summoned on the field');
  assert.ok(slimeInGrave, 'Egyptian God Slime must be sent to the Graveyard');
  console.log('✓ Obelisk summoned successfully using only Egyptian God Slime as 3 tributes.');
  service.destroyCurrentDuel();
}

async function testObeliskWithGodSlimeAndNormalMonsters() {
  console.log('\nTest 2: Multi-tribute combinations with Egyptian God Slime + normal monsters...');

  // 2A: God Slime (as 2 tributes) + 1 normal monster (1 tribute) = 3 tributes
  {
    const service = new DuelEngineService();
    await service.init();
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 10000000, 10000000, 10000000, 10000000, 10000000],
      player0Monsters: [
        { code: 42166000, sequence: 0, position: 0x1 }, // God Slime (release_param: 3)
        { code: 25652259, sequence: 1, position: 0x1 }, // Normal monster 1
        { code: 25652259, sequence: 2, position: 0x1 }, // Normal monster 2
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const prompt = (service as any).lastPromptMessage;
    const obeliskIdx = prompt?.summons?.findIndex((s: any) => s.code === 10000000);
    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_SUMMON,
      index: obeliskIdx,
    });
    service.processStep();

    service.sendResponse({ type: OcgResponseType.SELECT_TRIBUTE, indicies: [0, 1] });
    service.processStep();
    const board = service.getBoardState();
    assert.ok(
      board.userField.monsterZones.some((m) => m?.code === 10000000),
      'Obelisk should be summoned using God Slime + 1 normal monster',
    );
    service.close();
    console.log('✓ Case 2A: God Slime (2 tributes) + 1 normal monster (1 tribute) succeeded.');
  }

  // 2B: God Slime (as 1 tribute) + 2 normal monsters (2 tributes) = 3 tributes
  {
    const service = new DuelEngineService();
    await service.init();
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 10000000, 10000000, 10000000, 10000000, 10000000],
      player0Monsters: [
        { code: 42166000, sequence: 0, position: 0x1 }, // God Slime (release_param: 3)
        { code: 25652259, sequence: 1, position: 0x1 }, // Normal monster 1
        { code: 25652259, sequence: 2, position: 0x1 }, // Normal monster 2
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const prompt = (service as any).lastPromptMessage;
    const obeliskIdx = prompt?.summons?.findIndex((s: any) => s.code === 10000000);
    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_SUMMON,
      index: obeliskIdx,
    });
    service.processStep();

    service.sendResponse({ type: OcgResponseType.SELECT_TRIBUTE, indicies: [0, 1, 2] });
    service.processStep();
    const board = service.getBoardState();
    assert.ok(
      board.userField.monsterZones.some((m) => m?.code === 10000000),
      'Obelisk should be summoned using God Slime + 2 normal monsters',
    );
    service.close();
    console.log('✓ Case 2B: God Slime (1 tribute) + 2 normal monsters (2 tributes) succeeded.');
  }
}

async function testDoubleCostonTribute() {
  console.log('\nTest 3: Summon Dark Magician (46986414) using Double Coston (44436472, 2 tributes for DARK)...');
  const service = new DuelEngineService();
  await service.init();

  let tributePromptData: any = null;
  service.onEvent((event) => {
    if (event.type === 'SELECT_TRIBUTE') {
      tributePromptData = event.promptData;
    }
  });

  // Dark Magician (46986414) requires 2 tributes; Double Coston (44436472) counts as 2 tributes for DARK
  service.startNewDuel({
    player0Deck: [...Array(35).fill(25652259), 46986414, 46986414, 46986414, 46986414, 46986414],
    player0Monsters: [
      { code: 44436472, sequence: 0, position: 0x1 }, // Double Coston
    ],
    player1Deck: Array(40).fill(25652259),
    noShuffle: true,
    humanPlayerId: 0,
    startingLP: 8000,
  });

  const prompt = (service as any).lastPromptMessage;
  const dmIdx = prompt?.summons?.findIndex((s: any) => s.code === 46986414);
  assert.ok(dmIdx >= 0, 'Dark Magician should be available for Normal Summon');

  service.sendResponse({
    type: OcgResponseType.SELECT_IDLECMD,
    action: SelectIdleCMDAction.SELECT_SUMMON,
    index: dmIdx,
  });
  service.processStep();

  assert.ok(tributePromptData, 'SELECT_TRIBUTE prompt should be emitted');
  assert.strictEqual(tributePromptData.min, 2, 'Dark Magician requires 2 tributes');
  assert.strictEqual(tributePromptData.selects[0].release_param, 2, 'Double Coston should have release_param: 2');

  // Respond with only Double Coston [0]
  service.sendResponse({
    type: OcgResponseType.SELECT_TRIBUTE,
    indicies: [0],
  });
  service.processStep();

  const board = service.getBoardState();
  const dmOnField = board.userField.monsterZones.some((m) => m?.code === 46986414);
  assert.ok(dmOnField, 'Dark Magician should be summoned with only Double Coston');
  console.log('✓ Dark Magician summoned successfully using only Double Coston as 2 tributes.');
  service.destroyCurrentDuel();
}

async function testAutoResponseTribute() {
  console.log('\nTest 4: MessageDecoder auto-response handles release_param greedily...');

  const mockMsg: any = {
    type: OcgMessageType.SELECT_TRIBUTE,
    min: 3,
    max: 3,
    selects: [
      { code: 42166000, release_param: 3 },
      { code: 25652259, release_param: 1 },
      { code: 25652259, release_param: 1 },
    ],
  };

  const autoResp = getAutoResponse(mockMsg) as any;
  assert.deepStrictEqual(
    autoResp.indicies,
    [0],
    'Auto response should only pick God Slime [0] because its release_param (3) satisfies minCount (3)',
  );
  console.log('✓ MessageDecoder auto-response correctly selects only index 0.');
}

async function runAll() {
  await testObeliskWithGodSlimeOnly();
  await testObeliskWithGodSlimeAndNormalMonsters();
  await testDoubleCostonTribute();
  await testAutoResponseTribute();
  console.log('\n🎉 ALL MULTI-TRIBUTE TESTS PASSED SUCCESSFULLY!\n');
}

runAll().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
