import test from 'node:test';
import assert from 'node:assert/strict';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { OcgResponseType, SelectIdleCMDAction, OcgMessageType } from 'ocgcore-wasm';

test('Scapegoat activation: Spawns 4 Sheep Tokens (73915052..73915055) onto the field in Face-Up Defense', async () => {
  const cardReader = new CardReaderService();
  const service = new DuelEngineService();
  await service.init();

  // Check that Sheep Token exists in CardReader
  const sheepToken = cardReader.getCardDetail(73915052);
  assert.ok(sheepToken !== null, 'Sheep Token (73915052) must exist in database');
  assert.strictEqual(sheepToken?.name, 'Sheep Token');
  assert.strictEqual(sheepToken?.atk, 0);
  assert.strictEqual(sheepToken?.def, 0);
  assert.strictEqual(sheepToken?.level, 1);
  assert.strictEqual(sheepToken?.attributeName, 'EARTH');
  assert.strictEqual(sheepToken?.raceName, 'Beast');

  // Let all 40 cards in deck be Scapegoat (73915051)
  const p0Deck = Array(40).fill(73915051);
  const p1Deck = Array(40).fill(89631139);

  service.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    noShuffle: true,
    humanPlayerId: 0,
    startingLP: 8000,
  });

  // Step through initial chain prompts until Main Phase 1 (SELECT_IDLECMD)
  let prompt = (service as any).lastPromptMessage;
  while (prompt && prompt.type !== OcgMessageType.SELECT_IDLECMD) {
    if (prompt.type === OcgMessageType.SELECT_CHAIN) {
      service.sendResponse({ type: OcgResponseType.SELECT_CHAIN, index: -1 });
      service.processStep();
    } else {
      service.processStep();
    }
    prompt = (service as any).lastPromptMessage;
  }

  assert.strictEqual(prompt?.type, OcgMessageType.SELECT_IDLECMD);
  const sgIndex = prompt?.activates?.findIndex((a: any) => a.code === 73915051);
  assert.ok(sgIndex >= 0, 'Scapegoat should be activatable in opening hand');

  // Activate Scapegoat
  service.sendResponse({
    type: OcgResponseType.SELECT_IDLECMD,
    action: SelectIdleCMDAction.SELECT_ACTIVATE,
    index: sgIndex,
  });
  service.processStep();

  // Pass response chain if asked
  prompt = (service as any).lastPromptMessage;
  if (prompt && prompt.type === OcgMessageType.SELECT_CHAIN) {
    service.sendResponse({ type: OcgResponseType.SELECT_CHAIN, index: -1 });
    service.processStep();
  }

  // Get board state
  const board = service.getBoardState();
  const monsters = board.userField.monsterZones.filter((m) => m !== null);
  console.log('Player 0 Monsters after Scapegoat:', monsters.map((m) => `${m?.name} (${m?.code}) [${m?.position}]`));

  assert.strictEqual(monsters.length, 4, 'Must have exactly 4 Sheep Tokens on the field');
  for (const token of monsters) {
    assert.strictEqual(token?.name, 'Sheep Token');
    assert.strictEqual(token?.position, 'faceup_defense');
    assert.strictEqual(token?.atk, 0);
    assert.strictEqual(token?.def, 0);
    assert.strictEqual(token?.level, 1);
    assert.strictEqual(token?.attribute, 'EARTH');
    assert.strictEqual(token?.race, 'Beast');
  }
});
