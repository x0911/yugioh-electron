// =============================================================================
// Procedural Web Audio Sound Synthesizer
// Zero-dependency, zero-latency synthesizer for retro/arcade Yu-Gi-Oh! SFX
// =============================================================================

export class SoundSynthesizer {
  private ctx: AudioContext;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  /**
   * Helper to create a noise buffer (for explosion, whooshes, and shatters).
   */
  private createNoiseBuffer(duration = 0.5): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Plays a synthesized sound based on the fallback key.
   */
  public play(synthKey: string, dest: AudioNode, volumeMultiplier = 1.0): void {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;

    switch (synthKey) {
      // ── UI Sounds ─────────────────────────────────────────────────────────
      case 'ui-hover': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);

        gain.gain.setValueAtTime(0.12 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'ui-click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

        gain.gain.setValueAtTime(0.3 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.065);
        break;
      }

      case 'ui-modal-open': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.15);

        gain.gain.setValueAtTime(0.2 * volumeMultiplier, now);
        gain.gain.linearRampToValueAtTime(0.25 * volumeMultiplier, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.17);
        break;
      }

      case 'ui-modal-close': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

        gain.gain.setValueAtTime(0.2 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }

      case 'ui-card-hover': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.035);

        gain.gain.setValueAtTime(0.08 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }

      case 'card-slide': {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.12);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);
        break;
      }

      case 'card-set':
      case 'card-set-monster':
      case 'card-set-spell': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

        gain.gain.setValueAtTime(0.4 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'card-trash': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

        gain.gain.setValueAtTime(0.2 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }

      case 'deck-save': {
        // Two-tone golden chime
        [523.25, 783.99].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gain.gain.setValueAtTime(0.25 * volumeMultiplier, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.26);
        });
        break;
      }

      // ── Coin Toss ───────────────────────────────────────────────────────────
      case 'coin-choice': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        gain.gain.setValueAtTime(0.25 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }

      case 'coin-flip': {
        // High-pitched ringing whistle
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2400, now);
        osc.frequency.linearRampToValueAtTime(3200, now + 0.3);
        osc.frequency.linearRampToValueAtTime(2100, now + 0.6);

        gain.gain.setValueAtTime(0.15 * volumeMultiplier, now);
        gain.gain.linearRampToValueAtTime(0.2 * volumeMultiplier, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.66);
        break;
      }

      case 'coin-land': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now);
        gain.gain.setValueAtTime(0.4 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.19);
        break;
      }

      case 'toss-won': {
        // Major triad triumphant jingle (C5 -> E5 -> G5)
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          gain.gain.setValueAtTime(0.3 * volumeMultiplier, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.3);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.32);
        });
        break;
      }

      case 'toss-lost': {
        // Minor descending tone
        [440, 370, 311.13].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0.18 * volumeMultiplier, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.26);
        });
        break;
      }

      // ── Card Draw & Movements ───────────────────────────────────────────────
      case 'card-draw': {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.16);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
        filter.Q.setValueAtTime(4.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);
        break;
      }

      case 'turn-start':
      case 'prompt-alert': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.06);

        gain.gain.setValueAtTime(0.28 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'phase-change': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      // ── Summoning & Effects ────────────────────────────────────────────────
      case 'summon-normal': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.linearRampToValueAtTime(3000, now + 0.18);

        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.23);
        break;
      }

      case 'summon-tribute': {
        // Heavy bass sub drop + surge
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);

        gain.gain.setValueAtTime(0.45 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.32);
        break;
      }

      case 'summon-special': {
        // Shimmering celestial harmonic chord
        [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.linearRampToValueAtTime(freq * 1.5, now + 0.25);

          gain.gain.setValueAtTime(0.18 * volumeMultiplier, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.32);
        });
        break;
      }

      case 'summon-flip':
      case 'position-change': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

        gain.gain.setValueAtTime(0.3 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'spell-activate': {
        // Magical energy sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(2400, now + 0.2);

        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }

      case 'trap-activate': {
        // Zap / electric shock buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.08);
        osc.frequency.linearRampToValueAtTime(200, now + 0.18);

        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'chain-link': {
        // High metallic chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

        gain.gain.setValueAtTime(0.3 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'field-activate':
      case 'card-banish': {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.3);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.28);
        filter.Q.setValueAtTime(5.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);
        break;
      }

      case 'card-to-gy': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

        gain.gain.setValueAtTime(0.25 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      // ── Combat & Attacks ───────────────────────────────────────────────────
      case 'attack-declare': {
        // Blade swoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.14);

        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'attack-clash':
      case 'card-destroy-monster': {
        // Explosion / metallic clash
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.25);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.24);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.45 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);
        break;
      }

      case 'attack-direct':
      case 'lp-damage-heavy': {
        // Deep sub-bass boom
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

        gain.gain.setValueAtTime(0.55 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.28);
        break;
      }

      case 'card-destroy-spell': {
        // Glass shatter bandpass noise
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.18);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2500, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);
        break;
      }

      // ── Life Points ────────────────────────────────────────────────────────
      case 'lp-tick': {
        // Retro rapid digital counter blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1500, now);

        gain.gain.setValueAtTime(0.14 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }

      case 'lp-heal': {
        // Ascending harmonic chime
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);

          gain.gain.setValueAtTime(0.2 * volumeMultiplier, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.2);
        });
        break;
      }

      case 'lp-low-alarm': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.1);

        gain.gain.setValueAtTime(0.25 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.24);
        break;
      }

      // ── Victory & Defeat ───────────────────────────────────────────────────
      case 'match-victory':
      case 'duel-start': {
        // Triumphant Fanfare (C5 -> E5 -> G5 -> C6)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);

          gain.gain.setValueAtTime(0.35 * volumeMultiplier, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.45);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.48);
        });
        break;
      }

      case 'match-defeat': {
        // Somber Defeat (G4 -> Eb4 -> C4)
        [392.0, 311.13, 261.63].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.18);

          gain.gain.setValueAtTime(0.25 * volumeMultiplier, now + i * 0.18);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.5);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + i * 0.18);
          osc.stop(now + i * 0.18 + 0.52);
        });
        break;
      }

      default: {
        // Default generic high-tech blip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

        gain.gain.setValueAtTime(0.2 * volumeMultiplier, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
    }
  }
}
