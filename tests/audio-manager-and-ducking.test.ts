import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import { BGM_THEMES, SFX_CATALOG } from '../src/renderer/audio/audioManifest.js';
import { SoundSynthesizer } from '../src/renderer/audio/soundSynthesizer.js';
import { AudioManager, audioManager } from '../src/renderer/audio/audioManager.js';
import { useSettingsStore } from '../src/renderer/stores/settingsStore.js';

// Setup Mock Window and AudioContext for headless node environment
class MockGainNode {
  gain = {
    value: 1,
    setValueAtTime: (_val: number, _time: number) => {},
    linearRampToValueAtTime: (val: number, _time: number) => {
      this.gain.value = val;
    },
    exponentialRampToValueAtTime: (_val: number, _time: number) => {},
    cancelScheduledValues: (_time: number) => {},
  };
  connect(_dest: any) {}
  disconnect() {}
}

class MockAudioContext {
  state: AudioContextState = 'running';
  currentTime = 10;
  destination = {};

  createGain() {
    return new MockGainNode() as any;
  }

  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        value: 440,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
      },
      connect: () => {},
      start: () => {},
      stop: () => {},
    } as any;
  }

  createBufferSource() {
    return {
      buffer: null,
      playbackRate: { value: 1 },
      connect: () => {},
      start: () => {},
      stop: () => {},
    } as any;
  }

  createBuffer() {
    return {
      getChannelData: () => new Float32Array(100),
    } as any;
  }

  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: {
        value: 1000,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      Q: { value: 1 },
      connect: () => {},
    } as any;
  }

  async resume() {
    this.state = 'running';
  }
}

(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  settingsAPI: {
    getSettings: async () => ({
      masterVolume: 100,
      bgmVolume: 80,
      sfxVolume: 90,
      isMasterMuted: false,
      isBgmMuted: false,
      isSfxMuted: false,
      selectedBgmTheme: 'passionate',
      duckingIntensity: 'normal',
    }),
    saveSettings: async () => true,
    getOpponents: async () => [],
  },
};

async function runAudioAndDuckingTests() {
  console.log('=== RUNNING AUDIO MANAGER & DYNAMIC DUCKING TESTS ===\n');

  // Test 1: BGM Themes Catalog
  console.log('▶ Test 1: BGM Themes Catalog Completeness');
  assert.ok(BGM_THEMES.length >= 6, 'Should define at least 6 curated BGM themes');
  const themeIds = BGM_THEMES.map((t) => t.id);
  assert.ok(themeIds.includes('passionate'), 'Should include Passionate Duelist');
  assert.ok(themeIds.includes('master-duel'), 'Should include Master Duel Arena');
  assert.ok(themeIds.includes('gx-rock'), 'Should include GX Generation');
  assert.ok(themeIds.includes('millennium'), 'Should include Millennium Mystery');
  assert.ok(themeIds.includes('kaibacorp'), 'Should include KaibaCorp Cyber Matrix');
  assert.ok(themeIds.includes('lounge'), 'Should include Casual Duel Lounge');
  assert.ok(themeIds.includes('tag-force-3'), 'Should include Tag Force 3 Arena');
  console.log(`  ✓ All ${BGM_THEMES.length} BGM themes verified.\n`);

  // Test 2: SFX Catalog Definitions
  console.log('▶ Test 2: SFX Catalog Definitions and Multipliers');
  assert.ok(Object.keys(SFX_CATALOG).length >= 35, 'Should define at least 35 unique SFX triggers');
  for (const [key, sfx] of Object.entries(SFX_CATALOG)) {
    assert.ok(sfx.src?.startsWith('app-resource://audio/sfx/'), `${key} src must use app-resource://`);
    assert.ok((sfx.volumeMultiplier ?? 1) > 0 && (sfx.volumeMultiplier ?? 1) <= 2.0, `${key} volumeMultiplier valid`);
    assert.ok(sfx.synthFallback, `${key} must have synthFallback for procedural playback`);
  }
  console.log(`  ✓ All ${Object.keys(SFX_CATALOG).length} SFX catalog entries verified.\n`);

  // Test 3: Sound Synthesizer Fallbacks
  console.log('▶ Test 3: Procedural Sound Synthesizer Generation');
  const synth = new SoundSynthesizer(new MockAudioContext() as any);
  assert.doesNotThrow(() => synth.play('lp-tick', new MockGainNode() as any), 'play lp-tick should execute cleanly');
  assert.doesNotThrow(() => synth.play('coin-flip', new MockGainNode() as any), 'play coin-flip should execute cleanly');
  assert.doesNotThrow(() => synth.play('attack-blade', new MockGainNode() as any), 'play attack-blade should execute cleanly');
  assert.doesNotThrow(() => synth.play('monster-summon', new MockGainNode() as any), 'play monster-summon should execute cleanly');
  assert.doesNotThrow(() => synth.play('spell-chime', new MockGainNode() as any), 'play spell-chime should execute cleanly');
  assert.doesNotThrow(() => synth.play('destruction', new MockGainNode() as any), 'play destruction should execute cleanly');
  assert.doesNotThrow(() => synth.play('victory-fanfare', new MockGainNode() as any), 'play victory-fanfare should execute cleanly');
  assert.doesNotThrow(() => synth.play('defeat-jingle', new MockGainNode() as any), 'play defeat-jingle should execute cleanly');
  console.log('  ✓ Procedural synthesizer handles all audio waveforms.\n');

  // Test 4: AudioManager Volume and Mute Controls
  console.log('▶ Test 4: AudioManager Volume and Mute Controls');
  const audio = new AudioManager();
  audio.setMasterVolume(85);
  assert.equal(audio.getMasterVolume(), 85, 'Master volume should be 85%');

  audio.setBgmVolume(60);
  assert.equal(audio.getBgmVolume(), 60, 'BGM volume should be 60%');

  audio.setSfxVolume(75);
  assert.equal(audio.getSfxVolume(), 75, 'SFX volume should be 75%');

  audio.setMasterMuted(true);
  assert.equal(audio.getIsMasterMuted(), true, 'Master should be muted');

  audio.setMasterMuted(false);
  assert.equal(audio.getIsMasterMuted(), false, 'Master should be unmuted');
  console.log('  ✓ Volume and mute bus controls verified.\n');

  // Test 5: Dynamic Cutscene Ducking Ref-Counting
  console.log('▶ Test 5: Cutscene Ducking and Ref-Counting Lifecycle');
  audio.duckBgm('character-intro-video', 100);
  assert.equal(audio.getActiveDuckCount(), 1, 'Active duck count should be 1');

  // Second overlapping cutscene trigger (e.g. monster summon overlay)
  audio.duckBgm('monster-summon-video', 100);
  assert.equal(audio.getActiveDuckCount(), 2, 'Active duck count should be 2');

  // First cutscene finishes
  audio.restoreBgm('character-intro-video', 100);
  assert.equal(audio.getActiveDuckCount(), 1, 'Duck count should decrement to 1');

  // Second cutscene finishes
  audio.restoreBgm('monster-summon-video', 100);
  assert.equal(audio.getActiveDuckCount(), 0, 'Duck count should reach 0 (fully restored)');

  // Redundant restore call should safely no-op
  audio.restoreBgm('monster-summon-video', 100);
  assert.equal(audio.getActiveDuckCount(), 0, 'Redundant restore should remain 0 without errors');
  console.log('  ✓ Ref-counted ducking and automatic restoration verified.\n');

  // Test 6: Settings Store Synchronization
  console.log('▶ Test 6: SettingsStore Audio Synchronization');
  setActivePinia(createPinia());
  const settingsStore = useSettingsStore();
  await settingsStore.initializeSettings();

  settingsStore.setSelectedBgmTheme('gx-rock');
  assert.equal(settingsStore.selectedBgmTheme, 'gx-rock', 'Store should update selected theme');
  assert.equal(audioManager.getCurrentBgmThemeId(), 'gx-rock', 'AudioManager should synchronize theme');

  settingsStore.setDuckingIntensity('mute');
  assert.equal(settingsStore.duckingIntensity, 'mute', 'Store ducking intensity should be mute');
  assert.equal(audioManager.getDuckingIntensity(), 'mute', 'AudioManager should synchronize ducking intensity');

  settingsStore.toggleBgmMute();
  assert.equal(settingsStore.isBgmMuted, true, 'BGM should be muted');
  assert.equal(audioManager.getIsBgmMuted(), true, 'AudioManager should reflect BGM mute');

  settingsStore.toggleBgmMute();
  assert.equal(settingsStore.isBgmMuted, false, 'BGM should be unmuted');
  assert.equal(audioManager.getIsBgmMuted(), false, 'AudioManager should reflect BGM unmute');
  console.log('  ✓ SettingsStore and AudioManager reactivity verified.\n');

  console.log('🎉 ALL AUDIO MANAGER & DUCKING TESTS PASSED SUCCESSFULLY!\n');
}

runAudioAndDuckingTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
