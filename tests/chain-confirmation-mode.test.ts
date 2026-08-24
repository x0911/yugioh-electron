import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { useSettingsStore } from '../src/renderer/stores/settingsStore.js';
import { useDuelStore } from '../src/renderer/stores/duelStore.js';
import type { SelectChainPayload } from '../src/shared/types/duel.js';

(globalThis as any).window = globalThis;

async function runChainConfirmationTests() {
  console.log('=== RUNNING SMART CHAIN CONFIRMATION & SUPPRESSION TESTS ===\n');

  setActivePinia(createPinia());
  const settingsStore = useSettingsStore();
  const duelStore = useDuelStore();

  // Mock window.duelAPI sendCommand
  let lastSentCommand: any = null;
  (window as any).duelAPI = {
    sendCommand: async (cmd: any) => {
      lastSentCommand = cmd;
      return true;
    },
    newDuel: async () => true,
  };

  // Test 1: Settings store default and persistence
  console.log('▶ Test 1: Settings Store Chain Mode Default and Updates');
  assert.equal(settingsStore.chainConfirmationMode, 'auto');
  await settingsStore.setChainConfirmationMode('on');
  assert.equal(settingsStore.chainConfirmationMode, 'on');
  await settingsStore.setChainConfirmationMode('off');
  assert.equal(settingsStore.chainConfirmationMode, 'off');
  await settingsStore.resetToDefaults();
  assert.equal(settingsStore.chainConfirmationMode, 'auto');
  console.log('  ✓ Settings store defaults to "auto" and updates properly.\n');

  // Test 2: Mode toggling in duelStore
  console.log('▶ Test 2: Duel Store Chain Mode Toggling');
  duelStore.setChainMode('auto');
  assert.equal(duelStore.chainMode, 'auto');
  duelStore.toggleChainMode();
  assert.equal(duelStore.chainMode, 'on');
  duelStore.toggleChainMode();
  assert.equal(duelStore.chainMode, 'off');
  duelStore.toggleChainMode();
  assert.equal(duelStore.chainMode, 'auto');
  console.log('  ✓ Duel store cycles auto -> on -> off -> auto.\n');

  // Test 3: Smart Auto Mode - Prompt on First Window, Suppress Duplicate Fast Effects
  console.log('▶ Test 3: Smart Auto Mode Fast Effect Suppression (e.g. Wightprincess)');
  duelStore.setChainMode('auto');
  duelStore.clearPrompts();
  duelStore.lastDeclinedChainFingerprint = null;

  const wightprincessPayload: SelectChainPayload = {
    forced: false,
    selects: [
      {
        code: 98777992, // Wightprincess
        location: 2, // Hand
        sequence: 0,
        cardName: 'Wightprincess',
      },
    ],
  };

  // 3a. First prompt arrives -> prompts user
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: wightprincessPayload,
  });
  assert.notEqual(duelStore.activeSelectChain, null);
  assert.equal(duelStore.activeSelectChain?.selects?.[0].code, 98777992);
  console.log('  ✓ First chain window prompts user.');

  // 3b. User passes priority (declines to activate)
  await duelStore.executeSelectChain(null);
  assert.equal(lastSentCommand?.type, 8);
  assert.equal(lastSentCommand?.index, null);
  assert.equal(duelStore.lastDeclinedChainFingerprint, '98777992-2-0');
  console.log('  ✓ Decline fingerprint recorded.');

  // 3c. Next sub-step arrives with the same Wightprincess in unchanged state -> AUTO auto-passes!
  lastSentCommand = null;
  duelStore.clearPrompts();
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: wightprincessPayload,
  });
  // Auto-pass sent immediately without setting activeSelectChain
  assert.equal(lastSentCommand?.type, 8);
  assert.equal(lastSentCommand?.index, null);
  assert.equal(duelStore.activeSelectChain, null);
  console.log('  ✓ Duplicate unchanged chain window successfully suppressed in AUTO mode.');

  // 3d. Opponent takes an action (e.g. monster summoned / card moved) -> Fingerprint clears!
  await duelStore.handleEngineEvent({
    type: 'SUMMONED',
    player: 1,
  });
  assert.equal(duelStore.lastDeclinedChainFingerprint, null);

  // 3e. Now chain window should prompt again because a new action occurred
  duelStore.clearPrompts();
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: wightprincessPayload,
  });
  assert.notEqual(duelStore.activeSelectChain, null);
  console.log('  ✓ New board action resets suppression and prompts player again.\n');

  // Test 4: Strict "ON" Mode - Never Suppresses Prompts
  console.log('▶ Test 4: Strict "ON" Mode (Always Prompts)');
  duelStore.setChainMode('on');
  duelStore.clearPrompts();
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: wightprincessPayload,
  });
  assert.notEqual(duelStore.activeSelectChain, null);
  await duelStore.executeSelectChain(null);

  // Even with same fingerprint, ON mode prompts every window
  duelStore.clearPrompts();
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: wightprincessPayload,
  });
  assert.notEqual(duelStore.activeSelectChain, null);
  console.log('  ✓ "ON" mode strictly prompts every window.\n');

  // Test 5: "OFF" Mode - Auto-Passes Optional Chains, Still Prompts Forced
  console.log('▶ Test 5: "OFF" Mode (Auto-Pass Optional, Prompt Forced)');
  duelStore.setChainMode('off');
  duelStore.clearPrompts();
  lastSentCommand = null;

  // Optional chain auto-passes
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: wightprincessPayload,
  });
  assert.equal(lastSentCommand?.type, 8);
  assert.equal(lastSentCommand?.index, null);
  assert.equal(duelStore.activeSelectChain, null);

  // Mandatory/forced chain still prompts
  const forcedPayload: SelectChainPayload = {
    forced: true,
    selects: [
      {
        code: 40640057, // Sangan mandatory GY trigger
        location: 16,
        sequence: 0,
        cardName: 'Sangan',
      },
    ],
  };
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: forcedPayload,
  });
  assert.notEqual(duelStore.activeSelectChain, null);
  assert.equal(duelStore.activeSelectChain?.forced, true);
  console.log('  ✓ "OFF" mode auto-passes optional chains and respects mandatory triggers.\n');

  // Test 6: Mute for Current Phase
  console.log('▶ Test 6: Mute for Current Phase');
  duelStore.setChainMode('auto');
  duelStore.clearPrompts();
  duelStore.isMutedForCurrentPhase = false;

  duelStore.muteChainsForCurrentPhase();
  assert.equal(duelStore.isMutedForCurrentPhase, true);

  // Any optional chain during this phase is auto-passed
  lastSentCommand = null;
  await duelStore.handleEngineEvent({
    type: 'SELECT_CHAIN',
    isPrompt: true,
    promptPlayer: 0,
    promptType: 'SELECT_CHAIN',
    promptData: wightprincessPayload,
  });
  assert.equal(lastSentCommand?.type, 8);
  assert.equal(duelStore.activeSelectChain, null);

  // Moving to a new phase un-mutes
  await duelStore.handleEngineEvent({
    type: 'NEW_PHASE',
    phase: 'BP',
  });
  assert.equal(duelStore.isMutedForCurrentPhase, false);
  console.log('  ✓ Phase mute suppresses until next phase transition.\n');

  console.log('🎉 ALL SMART CHAIN CONFIRMATION TESTS PASSED 100%!');
}

runChainConfirmationTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
