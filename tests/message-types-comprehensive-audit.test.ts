import assert from 'node:assert';
import { MessageDecoder } from '../src/main/engine/messageDecoder.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { OcgMessageType } from 'ocgcore-wasm';

console.log('=== Running Yu-Gi-Oh! OcgMessageType Comprehensive Protocol Audit Suite ===\n');

function testMessageAuditDecoders() {
  console.log('▶ Test 1: Verifying comprehensive decoders for all audited OcgMessageType opcodes...');
  const cardReader = new CardReaderService();
  const decoder = new MessageDecoder(cardReader);

  // 1. RETRY (1)
  const retryMsg = decoder.decode({ type: OcgMessageType.RETRY } as any);
  assert.strictEqual(retryMsg.type, 'RETRY');
  assert.ok(retryMsg.description.includes('retry'));

  // 2. HINT (2)
  const hintMsg = decoder.decode({
    type: OcgMessageType.HINT,
    hint_type: 3, // SELECTMSG
    player: 0,
    hint: 500n,
  } as any);
  assert.strictEqual(hintMsg.type, 'HINT');
  assert.strictEqual(hintMsg.hintType, 3);
  assert.ok(hintMsg.description.startsWith('Hint:'));

  // 3. REQUEST_DECK (8)
  const reqDeckMsg = decoder.decode({ type: OcgMessageType.REQUEST_DECK } as any);
  assert.strictEqual(reqDeckMsg.type, 'REQUEST_DECK');

  // 4. REFRESH_DECK (34)
  const refreshDeckMsg = decoder.decode({ type: OcgMessageType.REFRESH_DECK } as any);
  assert.strictEqual(refreshDeckMsg.type, 'REFRESH_DECK');

  // 5. SWAP_GRAVE_DECK (35)
  const swapGraveMsg = decoder.decode({
    type: OcgMessageType.SWAP_GRAVE_DECK,
    player: 1,
    deck_size: 15,
    returned_to_extra: [],
  } as any);
  assert.strictEqual(swapGraveMsg.type, 'SWAP_GRAVE_DECK');
  assert.strictEqual(swapGraveMsg.deckSize, 15);
  assert.ok(swapGraveMsg.description.includes('swapped Graveyard and Deck'));

  // 6. REVERSE_DECK (37)
  const reverseDeckMsg = decoder.decode({ type: OcgMessageType.REVERSE_DECK } as any);
  assert.strictEqual(reverseDeckMsg.type, 'REVERSE_DECK');
  assert.ok(reverseDeckMsg.description.includes('reversed'));

  // 7. DECK_TOP (38)
  const deckTopMsg = decoder.decode({
    type: OcgMessageType.DECK_TOP,
    player: 0,
    count: 1,
    code: 20721928, // Sparkman
    position: 1,
  } as any);
  assert.strictEqual(deckTopMsg.type, 'DECK_TOP');
  assert.ok(deckTopMsg.description.includes('Sparkman'));

  // 8. SHUFFLE_EXTRA (39)
  const shuffleExtraMsg = decoder.decode({
    type: OcgMessageType.SHUFFLE_EXTRA,
    player: 1,
    cards: [99900001],
  } as any);
  assert.strictEqual(shuffleExtraMsg.type, 'SHUFFLE_EXTRA');
  assert.ok(shuffleExtraMsg.description.includes('Extra Deck'));

  // 9. CHAIN_SOLVING (72)
  const chainSolvingMsg = decoder.decode({
    type: OcgMessageType.CHAIN_SOLVING,
    chain_size: 2,
  } as any);
  assert.strictEqual(chainSolvingMsg.type, 'CHAIN_SOLVING');
  assert.strictEqual(chainSolvingMsg.chainSize, 2);

  // 10. CHAIN_END (74)
  const chainEndMsg = decoder.decode({ type: OcgMessageType.CHAIN_END } as any);
  assert.strictEqual(chainEndMsg.type, 'CHAIN_END');

  // 11. CARD_SELECTED (80)
  const cardSelectedMsg = decoder.decode({
    type: OcgMessageType.CARD_SELECTED,
    cards: [{ controller: 0, location: 4, sequence: 1, position: 1 }],
  } as any);
  assert.strictEqual(cardSelectedMsg.type, 'CARD_SELECTED');
  assert.strictEqual(cardSelectedMsg.cards?.length, 1);

  // 12. CANCEL_TARGET (97)
  const cancelTargetMsg = decoder.decode({
    type: OcgMessageType.CANCEL_TARGET,
    card: { controller: 0, location: 4, sequence: 0 },
    target: { controller: 1, location: 4, sequence: 0 },
  } as any);
  assert.strictEqual(cancelTargetMsg.type, 'CANCEL_TARGET');

  // 13. BE_CHAIN_TARGET (121)
  const beChainTargetMsg = decoder.decode({ type: OcgMessageType.BE_CHAIN_TARGET } as any);
  assert.strictEqual(beChainTargetMsg.type, 'BE_CHAIN_TARGET');

  // 14. CREATE_RELATION (122) & RELEASE_RELATION (123)
  const createRelMsg = decoder.decode({ type: OcgMessageType.CREATE_RELATION } as any);
  assert.strictEqual(createRelMsg.type, 'CREATE_RELATION');
  const releaseRelMsg = decoder.decode({ type: OcgMessageType.RELEASE_RELATION } as any);
  assert.strictEqual(releaseRelMsg.type, 'RELEASE_RELATION');

  // 15. TAG_SWAP (161)
  const tagSwapMsg = decoder.decode({
    type: OcgMessageType.TAG_SWAP,
    player: 0,
    deck_size: 30,
  } as any);
  assert.strictEqual(tagSwapMsg.type, 'TAG_SWAP');

  // 16. RELOAD_FIELD (162)
  const reloadFieldMsg = decoder.decode({ type: OcgMessageType.RELOAD_FIELD } as any);
  assert.strictEqual(reloadFieldMsg.type, 'RELOAD_FIELD');

  // 17. AI_NAME (163)
  const aiNameMsg = decoder.decode({
    type: OcgMessageType.AI_NAME,
    name: 'Yugi Muto',
  } as any);
  assert.strictEqual(aiNameMsg.type, 'AI_NAME');
  assert.strictEqual(aiNameMsg.name, 'Yugi Muto');

  // 18. SHOW_HINT (164)
  const showHintMsg = decoder.decode({
    type: OcgMessageType.SHOW_HINT,
    hint: 'Pay 1000 LP to activate',
  } as any);
  assert.strictEqual(showHintMsg.type, 'SHOW_HINT');
  assert.ok(showHintMsg.description.includes('Pay 1000 LP'));

  // 19. PLAYER_HINT (165)
  const playerHintMsg = decoder.decode({
    type: OcgMessageType.PLAYER_HINT,
    player: 0,
    player_hint: 1,
    description: 0n,
  } as any);
  assert.strictEqual(playerHintMsg.type, 'PLAYER_HINT');

  // 20. MATCH_KILL (170)
  const matchKillMsg = decoder.decode({
    type: OcgMessageType.MATCH_KILL,
    card: 89631139, // Blue-Eyes
  } as any);
  assert.strictEqual(matchKillMsg.type, 'MATCH_KILL');
  assert.ok(matchKillMsg.description.includes('won the match'));

  // 21. CUSTOM_MSG (180)
  const customMsg = decoder.decode({ type: OcgMessageType.CUSTOM_MSG } as any);
  assert.strictEqual(customMsg.type, 'CUSTOM_MSG');

  // 22. REMOVE_CARDS (190)
  const removeCardsMsg = decoder.decode({
    type: OcgMessageType.REMOVE_CARDS,
    cards: [{ controller: 1, location: 4, sequence: 0, position: 1 }],
  } as any);
  assert.strictEqual(removeCardsMsg.type, 'REMOVE_CARDS');

  console.log('✓ All 22 audited OcgMessageType decoders validated with rich formatting & zero fallthrough!\n');
}

testMessageAuditDecoders();
console.log('🎉 Audit test suite completed successfully!\n');
