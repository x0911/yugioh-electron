import assert from 'node:assert';
import { ScriptReaderService } from '../src/main/engine/scriptReader.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';
import type { DecodedDuelEvent } from '../src/main/engine/messageDecoder.js';

console.log('=== Running Monster Reborn & Alias Card Script Activation Tests ===\n');

async function testScriptResolution() {
  console.log('Test 1: ScriptReaderService Alias & Direct Script Resolution...');

  const scriptReader = new ScriptReaderService();
  const cardReader = new CardReaderService();

  const stapleAliasCards = [
    { id: 83764719, alias: 83764718, name: 'Monster Reborn' },
    { id: 18144507, alias: 18144506, name: "Harpie's Feather Duster" },
    { id: 18807109, alias: 18807108, name: 'Spellbinding Circle' },
    { id: 19230408, alias: 19230407, name: 'Offerings to the Doomed' },
    { id: 35686188, alias: 35686187, name: 'Tragedy' },
    { id: 39751094, alias: 39751093, name: 'Otohime' },
    { id: 64335805, alias: 64335804, name: 'Red-Eyes Black Metal Dragon' },
    { id: 68540059, alias: 68540058, name: 'Metalmorph' },
    { id: 73134082, alias: 73134081, name: 'Final Flame' },
    { id: 80604092, alias: 80604091, name: 'Ultimate Offering' },
    { id: 83011278, alias: 83011277, name: 'Mystic Tomato' },
    { id: 84080939, alias: 84080938, name: 'The Forgiving Maiden' },
    { id: 84257640, alias: 84257639, name: 'Dian Keto the Cure Master' },
  ];

  for (const card of stapleAliasCards) {
    const directScript = scriptReader.readScript(`c${card.id}.lua`);
    const aliasScript = scriptReader.readScript(`c${card.alias}.lua`);

    assert.ok(
      directScript !== null && directScript.length > 50,
      `Direct script c${card.id}.lua for ${card.name} must be loaded and non-empty.`,
    );
    assert.ok(
      aliasScript !== null && aliasScript.length > 50,
      `Alias script c${card.alias}.lua for ${card.name} must be loaded and non-empty.`,
    );
  }

  scriptReader.close();
  cardReader.close();
  console.log('✓ All 13 staple alias-dependent card scripts loaded successfully.');
}

async function testMonsterRebornActivationFlow() {
  console.log('\nTest 2: Monster Reborn Activation Condition & Resolution Flow...');

  const engine = new DuelEngineService();
  await engine.init();

  let idleCount = 0;
  let rebornWasActivated = false;
  let targetPromptReceived = false;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.isPrompt && ev.promptType === 'SELECT_IDLECMD') {
      idleCount++;
      const pData = ev.promptData as any;

      const canSummonCeltic = pData.summons?.some((s: any) => s.code === 91152256);
      const canActivateDarkHole = pData.activates?.some((a: any) => a.code === 53129443);
      const canActivateReborn = pData.activates?.some((a: any) => a.code === 83764719 || a.code === 83764718);

      if (canActivateReborn) {
        const rebornIdx = pData.activates.findIndex((a: any) => a.code === 83764719 || a.code === 83764718);
        rebornWasActivated = true;
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_ACTIVATE,
            index: rebornIdx,
          });
        }, 10);
      } else if (canActivateDarkHole) {
        const dhIdx = pData.activates.findIndex((a: any) => a.code === 53129443);
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_ACTIVATE,
            index: dhIdx,
          });
        }, 10);
      } else if (canSummonCeltic) {
        const celticIdx = pData.summons.findIndex((s: any) => s.code === 91152256);
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_SUMMON,
            index: celticIdx,
          });
        }, 10);
      } else {
        // Pass turn to draw more cards
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.TO_EP,
            index: null,
          });
        }, 10);
      }
    } else if (ev.isPrompt && ev.promptType === 'SELECT_CHAIN') {
      setTimeout(() => {
        engine.sendResponse({
          type: OcgResponseType.SELECT_CHAIN,
          index: -1,
        });
      }, 10);
    } else if (ev.isPrompt && ev.promptType === 'SELECT_CARD') {
      targetPromptReceived = true;
      setTimeout(() => {
        engine.sendResponse({
          type: OcgResponseType.SELECT_CARD,
          cards: [0],
        });
      }, 10);
    }
  });

  const p0Deck: number[] = Array(40).fill(83764719);
  const p1Deck: number[] = Array(40).fill(91152256);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player0Graveyard: [91152256], // Celtic Guardian already in Graveyard
    startingLP: 8000,
    startingDrawCount: 5,
    drawCountPerTurn: 1,
    humanPlayerId: 0,
    autoPlay: false,
    noShuffle: true,
  });

  const start = Date.now();
  while (!targetPromptReceived && Date.now() - start < 5000) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  assert.ok(rebornWasActivated, 'Monster Reborn should have been successfully activated.');
  assert.ok(targetPromptReceived, 'Monster Reborn should prompt for target Graveyard selection.');
  console.log('✓ Monster Reborn GY requirement, activation, and target prompt verified.');

  engine.close();
}

async function runAllTests() {
  await testScriptResolution();
  await testMonsterRebornActivationFlow();
  console.log('\n🎉 ALL MONSTER REBORN & SCRIPT ACTIVATION TESTS PASSED SUCCESSFULLY!');
}

runAllTests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
