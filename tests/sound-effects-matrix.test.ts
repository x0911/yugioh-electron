import assert from 'node:assert/strict';
import { SFX_CATALOG, type SfxKey } from '../src/renderer/audio/audioManifest.js';
import { AudioManager } from '../src/renderer/audio/audioManager.js';

// Setup Mock Window and AudioContext
class MockGainNode {
  gain = {
    value: 1,
    setValueAtTime: () => {},
    linearRampToValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
    cancelScheduledValues: () => {},
  };
  connect() {}
  disconnect() {}
}

class MockAudioContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  destination = {};
  createGain() {
    return new MockGainNode() as any;
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
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
    return { getChannelData: () => new Float32Array(50) } as any;
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 1000, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
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
};

async function runSfxMatrixTests() {
  console.log('=== RUNNING SOUND EFFECTS TRIGGER MATRIX TESTS ===\n');

  const audio = new AudioManager();

  // Trigger Matrix Mapping all Game & UI Actions
  const requiredTriggers: { action: string; key: SfxKey; category: string }[] = [
    // UI Category
    { action: 'Button Hover', key: 'ui-hover', category: 'UI' },
    { action: 'Button Click', key: 'ui-click', category: 'UI' },
    { action: 'Modal Open', key: 'ui-modal-open', category: 'UI' },
    { action: 'Modal Close', key: 'ui-modal-close', category: 'UI' },

    // Coin Toss & Match Jingles
    { action: 'Coin Side Choice Picked', key: 'coin-choice', category: 'Coin' },
    { action: 'Coin Mid-Air Flipping', key: 'coin-flip', category: 'Coin' },
    { action: 'Coin Arena Land Clink', key: 'coin-land', category: 'Coin' },
    { action: 'Coin Toss Won Fanfare', key: 'toss-won', category: 'Jingle' },
    { action: 'Coin Toss Lost Fanfare', key: 'toss-lost', category: 'Jingle' },
    { action: 'Duel Match Start Fanfare', key: 'duel-start', category: 'Jingle' },
    { action: 'Match Victory Fanfare', key: 'match-victory', category: 'Jingle' },
    { action: 'Match Defeat Jingle', key: 'match-defeat', category: 'Jingle' },

    // Deck Builder
    { action: 'Deck Drag Start', key: 'deck-drag-start', category: 'Deck' },
    { action: 'Deck Card Drop', key: 'deck-card-drop', category: 'Deck' },
    { action: 'Deck Card Trash / Delete', key: 'deck-card-trash', category: 'Deck' },
    { action: 'Deck Save Complete', key: 'deck-save', category: 'Deck' },

    // Duel Engine Events
    { action: 'Card Drawn from Deck', key: 'card-draw', category: 'Duel' },
    { action: 'Normal Summon Face-Up', key: 'summon-normal', category: 'Duel' },
    { action: 'Special Summon (GY/Extra/Banished)', key: 'summon-special', category: 'Duel' },
    { action: 'Flip Summon', key: 'summon-flip', category: 'Duel' },
    { action: 'Tribute Summon', key: 'summon-tribute', category: 'Duel' },
    { action: 'Monster Set Face-Down', key: 'card-set-monster', category: 'Duel' },
    { action: 'Spell/Trap Set Face-Down', key: 'card-set-spell', category: 'Duel' },
    { action: 'Spell Card Activation', key: 'spell-activate', category: 'Duel' },
    { action: 'Trap Card Activation', key: 'trap-activate', category: 'Duel' },
    { action: 'Field Spell Activation', key: 'field-activate', category: 'Duel' },
    { action: 'Chain Link Formed', key: 'chain-link', category: 'Duel' },
    { action: 'Monster Destroyed to GY', key: 'card-destroy-monster', category: 'Combat' },
    { action: 'Spell/Trap Destroyed to GY', key: 'card-destroy-spell', category: 'Combat' },
    { action: 'Card Discarded to GY', key: 'card-to-gy', category: 'Duel' },
    { action: 'Card Banished from Game', key: 'card-banish', category: 'Duel' },
    { action: 'Battle Attack Declared', key: 'attack-declare', category: 'Combat' },
    { action: 'Monster Battle Clash', key: 'attack-clash', category: 'Combat' },
    { action: 'Direct Attack on Life Points', key: 'attack-direct', category: 'Combat' },
    { action: 'Monster Position Changed', key: 'position-change', category: 'Duel' },
    { action: 'New Phase Announced', key: 'phase-change', category: 'Duel' },
    { action: 'New Turn Commenced', key: 'turn-start', category: 'Duel' },
    { action: 'Deck / Hand Shuffled', key: 'deck-shuffle', category: 'Duel' },
    { action: 'Player Prompt Alert', key: 'prompt-alert', category: 'Duel' },
    { action: 'Target Locked in Crosshair', key: 'target-locked', category: 'Duel' },

    // Life Points
    { action: 'LP Numerical Counter Tick', key: 'lp-tick', category: 'LP' },
    { action: 'Heavy Damage Impact (≥1000)', key: 'lp-damage-heavy', category: 'LP' },
    { action: 'LP Recovery / Healing Chime', key: 'lp-heal', category: 'LP' },
    { action: 'Critical Low LP Alarm (≤2000)', key: 'lp-low-alarm', category: 'LP' },
  ];

  console.log(`▶ Verifying all ${requiredTriggers.length} Sound Effects in Trigger Matrix:`);

  for (const trigger of requiredTriggers) {
    const sfxDef = SFX_CATALOG[trigger.key];
    assert.ok(sfxDef, `Trigger '${trigger.action}' (${trigger.key}) must be registered in SFX_CATALOG`);
    assert.ok((sfxDef.volumeMultiplier ?? 1) > 0, `Trigger '${trigger.key}' must have positive volume multiplier`);
    assert.ok(sfxDef.synthFallback, `Trigger '${trigger.key}' must have synth fallback key`);

    // Verify trigger executes without throws
    assert.doesNotThrow(() => {
      audio.playSfx(trigger.key);
    }, `playSfx('${trigger.key}') should execute without throwing`);

    console.log(`  ✓ [${trigger.category.padEnd(6)}] ${trigger.action.padEnd(35)} → '${trigger.key}'`);
  }

  console.log(`\n🎉 ALL ${requiredTriggers.length} TRIGGER MATRIX SOUND EFFECTS VERIFIED!\n`);
}

runSfxMatrixTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
