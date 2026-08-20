import assert from 'node:assert';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Option Strings & Human-Readable Prompt Resolution Tests ===\n');

async function testCardReaderStringResolution() {
  console.log('Test 1: CardReaderService string resolution for Fog King, multi-effect cards & system strings...');

  const cardReader = new CardReaderService();

  // 1. Fog King (ID 6614221)
  const fogKingCode = 6614221;
  const sysSummon = cardReader.resolveString(1);
  const fogOpt1 = cardReader.resolveString((BigInt(fogKingCode) << 20n) | 0n);
  const fogOpt2 = cardReader.resolveString((BigInt(fogKingCode) << 20n) | 1n);

  assert.strictEqual(sysSummon, 'Normal Summon', 'System string 1 must resolve to "Normal Summon"');
  assert.strictEqual(fogOpt1, 'Tribute Summon with 1 tribute', 'Fog King opt 1 must resolve to "Tribute Summon with 1 tribute"');
  assert.strictEqual(fogOpt2, 'Summon without tribute', 'Fog King opt 2 must resolve to "Summon without tribute"');

  console.log('✓ Fog King options successfully resolved:');
  console.log(`   - 1 -> "${sysSummon}"`);
  console.log(`   - 6935513399296 -> "${fogOpt1}"`);
  console.log(`   - 6935513399297 -> "${fogOpt2}"`);

  // 2. Lava Golem (ID 102380)
  const lavaGolemCode = 102380;
  const lavaOpt1 = cardReader.resolveString((BigInt(lavaGolemCode) << 20n) | 0n);
  const lavaOpt2 = cardReader.resolveString((BigInt(lavaGolemCode) << 20n) | 1n);
  assert.strictEqual(lavaOpt1, "Special Summon this card to the opponent's field", 'Lava Golem opt 1 must resolve');
  assert.strictEqual(lavaOpt2, '1000 damage', 'Lava Golem opt 2 must resolve');
  console.log('✓ Lava Golem options resolved correctly.');

  // 3. Penalty Game! (ID 967928)
  const penaltyCode = 967928;
  const penaltyOpt1 = cardReader.resolveString((BigInt(penaltyCode) << 20n) | 0n);
  const penaltyOpt2 = cardReader.resolveString((BigInt(penaltyCode) << 20n) | 1n);
  assert.strictEqual(penaltyOpt1, 'Your opponent cannot draw during their next Draw Phase');
  assert.strictEqual(penaltyOpt2, 'Your opponent cannot activate any Spell or Trap Cards this turn');
  console.log('✓ Penalty Game! multi-effect bullet options resolved correctly.');

  // 4. System Strings Coverage
  assert.strictEqual(cardReader.resolveString(2), 'Special Summon');
  assert.strictEqual(cardReader.resolveString(3), 'Flip Summon');
  assert.strictEqual(cardReader.resolveString(7), 'Activate Effect');
  assert.strictEqual(cardReader.resolveString(90), 'Normal Summon without tribute');
  assert.strictEqual(cardReader.resolveString(100), 'Go First');
  assert.strictEqual(cardReader.resolveString(101), 'Go Second');
  assert.strictEqual(cardReader.resolveString(555), 'Select an option');
  console.log('✓ Standard system string tags validated.');
}

async function testLiveDuelFogKingSelectOption() {
  console.log('\nTest 2: Live Duel Fog King Summon -> SELECT_OPTION prompt resolution...');

  const engine = new DuelEngineService();
  await engine.init();

  let selectOptionPromptReceived = false;
  let receivedOptions: string[] = [];
  let idleStep = 0;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.isPrompt) {
      if (ev.promptType === 'SELECT_IDLECMD' && ev.promptPlayer === 0) {
        idleStep++;
        const pData = ev.promptData as any;

        if (idleStep === 1) {
          // Turn 1: Summon Celtic Guardian so we have 1 tribute monster on field
          const celticIdx = pData.summons.findIndex((s: any) => s.code === 91152256);
          assert.ok(celticIdx >= 0, 'Celtic Guardian must be in hand');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SUMMON,
              index: celticIdx,
            });
          }, 10);
        } else if (idleStep === 2) {
          // Pass Turn 1 to Turn 3 by ending phase
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null,
            });
          }, 10);
        } else if (idleStep === 3) {
          // Turn 3: Normal Summon Fog King (player has Normal Summon and 1 tribute available)
          const fogKingIdx = pData.summons.findIndex((s: any) => s.code === 6614221);
          assert.ok(fogKingIdx >= 0, 'Fog King must be available to Normal Summon on Turn 3.');
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SUMMON,
              index: fogKingIdx,
            });
          }, 10);
        }
      } else if (ev.promptType === 'SELECT_OPTION' && ev.promptPlayer === 0) {
        selectOptionPromptReceived = true;
        const pData = ev.promptData as any;
        receivedOptions = pData.options;

        // Choose option 1: Summon without tribute
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_OPTION,
            index: 1,
          });
        }, 10);
      } else if (ev.promptType === 'SELECT_CHAIN') {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: -1,
          });
        }, 10);
      }
    }
  });

  // Player 0: 20 Celtic Guardian (91152256) and 20 Fog King (6614221) so both are in opening hand
  const p0Deck: number[] = [];
  for (let i = 0; i < 20; i++) p0Deck.push(91152256);
  for (let i = 0; i < 20; i++) p0Deck.push(6614221);

  // Player 1: Normal monsters
  const p1Deck: number[] = [];
  for (let i = 0; i < 40; i++) p1Deck.push(46986414);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
  });

  const start = Date.now();
  while (!selectOptionPromptReceived && Date.now() - start < 3000) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  assert.ok(selectOptionPromptReceived, 'SELECT_OPTION prompt must be emitted when summoning Fog King.');
  assert.ok(receivedOptions.length >= 2, 'Fog King must offer at least 2 summon procedures.');

  for (const opt of receivedOptions) {
    // Assert none of the options are raw BigInt numbers like 6935513399296 or 1
    assert.ok(!/^\d{5,}$/.test(opt), `Option string "${opt}" must be decoded into human readable text!`);
  }

  console.log('✓ Fog King live SELECT_OPTION prompt options received:');
  receivedOptions.forEach((opt, idx) => {
    console.log(`   [${idx + 1}] ${opt}`);
  });

  engine.close();
}

async function runAll() {
  await testCardReaderStringResolution();
  await testLiveDuelFogKingSelectOption();
  console.log('\n🎉 ALL OPTION STRINGS & PROMPT RESOLUTION TESTS PASSED SUCCESSFULLY!');
}

runAll().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
