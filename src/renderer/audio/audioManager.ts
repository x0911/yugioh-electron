// =============================================================================
// AudioManager — Master Web Audio Engine with Dynamic BGM Ducking & SFX
// =============================================================================

import { BGM_THEMES, SFX_CATALOG, type BgmTheme, type SfxDefinition } from './audioManifest.js';
import { SoundSynthesizer } from './soundSynthesizer.js';

export type DuckingIntensity = 'normal' | 'mute' | 'off';

// Global baseline mixing balance:
// BGM is mastered to sit comfortably in the background (0.22 ceiling with power curve)
// so that SFX (draws, summons, attacks, destructions, LP ticks) are always crisp and prominent.
export const BGM_GLOBAL_SCALE = 0.22;
export const SFX_GLOBAL_SCALE = 1.0;

export class AudioManager {
  private static instance: AudioManager | null = null;

  // Web Audio Nodes
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmDuckGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private synthesizer: SoundSynthesizer | null = null;

  // BGM Elements & State
  private bgmAudioEl: HTMLAudioElement | null = null;
  private previewAudioEl: HTMLAudioElement | null = null;
  private currentThemeId: string = 'passionate';
  private previewingThemeId: string | null = null;
  private previewTimer: ReturnType<typeof setTimeout> | null = null;

  // Volume & Mute Config (0 - 1.0)
  private masterVolume = 1.0;
  private bgmVolume = 0.8;
  private sfxVolume = 1.0;
  private isMasterMuted = false;
  private isBgmMuted = false;
  private isSfxMuted = false;
  private duckingIntensity: DuckingIntensity = 'normal';

  // Ducking Reference Counter & Safety Timers
  private activeDuckSources = new Set<string>();
  private duckSafetyTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // Autoplay Unlock
  private isAudioUnlocked = false;

  private constructor() {
    this.initAudioContext();
    this.setupAutoplayUnlock();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initializes the Web Audio graph.
   */
  private initAudioContext(): void {
    try {
      const AudioCtx =
        typeof window !== 'undefined'
          ? (window.AudioContext || (window as any).webkitAudioContext)
          : (globalThis as any).AudioContext;

      if (!AudioCtx) {
        return;
      }

      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // BGM Ducking Gain -> BGM Volume Gain -> Master Gain
      this.bgmDuckGain = this.ctx.createGain();
      this.bgmDuckGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);

      this.bgmDuckGain.connect(this.bgmGain);
      this.bgmGain.connect(this.masterGain);

      // SFX Gain -> Master Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Procedural synthesizer
      this.synthesizer = new SoundSynthesizer(this.ctx);
    } catch (err) {
      console.warn('[AudioManager] Failed to initialize Web Audio Context:', err);
    }
  }

  /**
   * Listens for first user gesture to unlock AudioContext.
   */
  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = async () => {
      if (this.isAudioUnlocked) return;
      if (this.ctx && this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {}
      }
      this.isAudioUnlocked = true;
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);

      // If BGM was requested prior to unlock, start playing now
      if (this.bgmAudioEl && this.bgmAudioEl.paused) {
        this.bgmAudioEl.play().catch(() => {});
      }
    };

    window.addEventListener('click', unlock, { once: false, passive: true });
    window.addEventListener('keydown', unlock, { once: false, passive: true });
    window.addEventListener('touchstart', unlock, { once: false, passive: true });
  }

  // ===========================================================================
  // Background Music (BGM) Management
  // ===========================================================================

  /**
   * Starts playing the specified BGM theme or currently selected theme.
   */
  public playBgm(themeId?: string): void {
    const targetId = themeId || this.currentThemeId;
    const theme = BGM_THEMES.find((t) => t.id === targetId) || BGM_THEMES[0];
    this.currentThemeId = theme.id;

    // Stop any active preview
    this.stopPreview();

    // Create or reuse audio element
    if (!this.bgmAudioEl && typeof Audio !== 'undefined') {
      this.bgmAudioEl = new Audio();
      this.bgmAudioEl.loop = true;
      this.bgmAudioEl.crossOrigin = 'anonymous';

      this.bgmAudioEl.addEventListener('error', (e) => {
        console.warn('[AudioManager] BGM audio element error:', e);
        if (this.bgmAudioEl && this.bgmAudioEl.src.endsWith('.mp3')) {
          const wavSrc = this.bgmAudioEl.src.replace(/\.mp3$/, '.wav');
          console.log('[AudioManager] Attempting WAV fallback:', wavSrc);
          this.bgmAudioEl.src = wavSrc;
          this.bgmAudioEl.load();
          this.bgmAudioEl.play().catch(() => {});
        }
      });

      // Connect to Web Audio graph
      if (this.ctx && this.bgmDuckGain) {
        try {
          const source = this.ctx.createMediaElementSource(this.bgmAudioEl);
          source.connect(this.bgmDuckGain);
        } catch (err) {
          // If media element source fails (e.g. cross-origin restrictions in testing), fallback directly
          console.warn('[AudioManager] createMediaElementSource fallback:', err);
        }
      }
    }

    if (this.bgmAudioEl) {
      if (this.bgmAudioEl.src !== theme.src) {
        this.bgmAudioEl.src = theme.src;
        this.bgmAudioEl.load();
      }

      // Set element volume directly as fallback if Web Audio graph isn't connected
      this.updateBgmGain();

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      this.bgmAudioEl.play().catch((err) => {
        // Autoplay blocked: will unlock on first user gesture
        console.log('[AudioManager] BGM autoplay deferred until user interaction.');
      });
    }
  }

  /**
   * Stops the active background music.
   */
  public stopBgm(): void {
    if (this.bgmAudioEl) {
      this.bgmAudioEl.pause();
      this.bgmAudioEl.currentTime = 0;
    }
  }

  /**
   * Previews a BGM theme for a limited duration (e.g. 15 seconds) in Settings.
   */
  public previewTheme(themeId: string, durationSec = 15): void {
    const theme = BGM_THEMES.find((t) => t.id === themeId);
    if (!theme) return;

    this.stopPreview();
    this.previewingThemeId = themeId;

    // Temporarily pause main BGM during preview
    if (this.bgmAudioEl && !this.bgmAudioEl.paused) {
      this.bgmAudioEl.pause();
    }

    if (typeof Audio !== 'undefined') {
      this.previewAudioEl = new Audio(theme.src);
      this.previewAudioEl.crossOrigin = 'anonymous';

      const basePct = this.isBgmMuted || this.isMasterMuted ? 0 : this.bgmVolume;
      const perceivedVol = Math.pow(basePct, 1.8) * BGM_GLOBAL_SCALE;
      const masterScale = this.isMasterMuted ? 0 : Math.pow(this.masterVolume, 1.5);
      this.previewAudioEl.volume = Math.max(0, Math.min(1, perceivedVol * masterScale));

      // Safely set currentTime after metadata has loaded
      const onLoaded = () => {
        if (this.previewAudioEl && theme.previewStartSec) {
          try {
            if (this.previewAudioEl.duration && theme.previewStartSec < this.previewAudioEl.duration) {
              this.previewAudioEl.currentTime = theme.previewStartSec;
            }
          } catch {}
        }
      };

      this.previewAudioEl.addEventListener('loadedmetadata', onLoaded, { once: true });
      this.previewAudioEl.addEventListener('error', (e) => {
        console.warn('[AudioManager] Preview audio error:', e);
      }, { once: true });

      this.previewAudioEl.play().catch((err) => {
        console.log('[AudioManager] Preview playback deferred/handled:', err.message);
      });
    }

    this.previewTimer = setTimeout(() => {
      this.stopPreview();
      // Resume main BGM
      if (this.bgmAudioEl) {
        this.bgmAudioEl.play().catch(() => {});
      }
    }, durationSec * 1000);
  }

  /**
   * Stops active theme preview.
   */
  public stopPreview(): void {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
    if (this.previewAudioEl) {
      this.previewAudioEl.pause();
      this.previewAudioEl.currentTime = 0;
      this.previewAudioEl = null;
    }
    this.previewingThemeId = null;
  }

  public getPreviewingThemeId(): string | null {
    return this.previewingThemeId;
  }

  public getCurrentThemeId(): string {
    return this.currentThemeId;
  }

  // ===========================================================================
  // Dynamic Audio Ducking Engine
  // ===========================================================================

  /**
   * Requests BGM volume reduction (ducking) when entering a cutscene.
   */
  public duckBgm(sourceId: string, durationMs = 200): void {
    if (this.duckingIntensity === 'off') return;

    this.activeDuckSources.add(sourceId);

    // Clear any previous safety timer for this source
    const prevTimer = this.duckSafetyTimers.get(sourceId);
    if (prevTimer) clearTimeout(prevTimer);

    // Fail-safe timer: auto-restore if cutscene does not finish within 25 seconds
    const safetyTimer = setTimeout(() => {
      this.restoreBgm(sourceId);
    }, 25000);
    this.duckSafetyTimers.set(sourceId, safetyTimer);

    const targetRatio = this.duckingIntensity === 'mute' ? 0.0 : 0.15;
    this.applyDuckGain(targetRatio, durationMs);
  }

  /**
   * Restores BGM volume when a cutscene ends or is skipped.
   */
  public restoreBgm(sourceId: string, durationMs = 350): void {
    this.activeDuckSources.delete(sourceId);

    const timer = this.duckSafetyTimers.get(sourceId);
    if (timer) {
      clearTimeout(timer);
      this.duckSafetyTimers.delete(sourceId);
    }

    // Only restore when all active ducking requests have completed
    if (this.activeDuckSources.size === 0) {
      this.applyDuckGain(1.0, durationMs);
    }
  }

  /**
   * Smoothly transitions the Ducking GainNode.
   */
  private applyDuckGain(targetValue: number, durationMs: number): void {
    if (this.ctx && this.bgmDuckGain) {
      const now = this.ctx.currentTime;
      const durationSec = durationMs / 1000;
      this.bgmDuckGain.gain.cancelScheduledValues(now);
      this.bgmDuckGain.gain.setValueAtTime(this.bgmDuckGain.gain.value, now);
      this.bgmDuckGain.gain.linearRampToValueAtTime(targetValue, now + durationSec);
    } else if (this.bgmAudioEl) {
      // Fallback direct element volume ramping
      const basePct = this.isBgmMuted || this.isMasterMuted ? 0 : this.bgmVolume;
      const perceivedBgm = Math.pow(basePct, 1.8) * BGM_GLOBAL_SCALE;
      const masterScale = this.isMasterMuted ? 0 : Math.pow(this.masterVolume, 1.5);
      const targetVol = perceivedBgm * masterScale * targetValue;
      this.bgmAudioEl.volume = Math.max(0, Math.min(1, targetVol));
    }
  }

  // ===========================================================================
  // Sound Effects (SFX) Playback
  // ===========================================================================

  /**
   * Plays a sound effect by its catalog identifier.
   */
  public playSfx(sfxId: string, volumeScale = 1.0): void {
    if (this.isSfxMuted || this.isMasterMuted || this.sfxVolume <= 0 || this.masterVolume <= 0) {
      return;
    }

    const def = SFX_CATALOG[sfxId];
    const synthKey = def?.synthFallback || sfxId;
    const volMult = (def?.volumeMultiplier || 1.0) * volumeScale;

    // Use procedural synthesizer (zero latency, zero dependencies)
    if (this.synthesizer && this.sfxGain) {
      try {
        this.synthesizer.play(synthKey, this.sfxGain, volMult);
      } catch (err) {
        console.warn('[AudioManager] Synthesizer error:', err);
      }
    }
  }

  /**
   * Specialized high-performance LP numerical tick.
   */
  public playLpTick(): void {
    if (this.isSfxMuted || this.isMasterMuted || this.sfxVolume <= 0) return;
    if (this.synthesizer && this.sfxGain) {
      this.synthesizer.play('lp-tick', this.sfxGain, 0.4);
    }
  }

  // ===========================================================================
  // Volume & Configuration Controls
  // ===========================================================================

  public setMasterVolume(pct: number): void {
    this.masterVolume = Math.max(0, Math.min(100, pct)) / 100;
    this.updateMasterGain();
  }

  public setBgmVolume(pct: number): void {
    this.bgmVolume = Math.max(0, Math.min(100, pct)) / 100;
    this.updateBgmGain();
  }

  public setSfxVolume(pct: number): void {
    this.sfxVolume = Math.max(0, Math.min(100, pct)) / 100;
    this.updateSfxGain();
  }

  public setMasterMute(muted: boolean): void {
    this.isMasterMuted = muted;
    this.updateMasterGain();
    this.updateBgmGain();
  }

  public setMasterMuted(muted: boolean): void {
    this.setMasterMute(muted);
  }

  public setBgmMute(muted: boolean): void {
    this.isBgmMuted = muted;
    this.updateBgmGain();
  }

  public setBgmMuted(muted: boolean): void {
    this.setBgmMute(muted);
  }

  public setSfxMute(muted: boolean): void {
    this.isSfxMuted = muted;
    this.updateSfxGain();
  }

  public setSfxMuted(muted: boolean): void {
    this.setSfxMute(muted);
  }

  public setDuckingIntensity(intensity: DuckingIntensity): void {
    this.duckingIntensity = intensity;
    if (intensity === 'off' && this.activeDuckSources.size > 0) {
      this.applyDuckGain(1.0, 100);
    }
  }

  public getMasterVolume(): number {
    return Math.round(this.masterVolume * 100);
  }

  public getBgmVolume(): number {
    return Math.round(this.bgmVolume * 100);
  }

  public getSfxVolume(): number {
    return Math.round(this.sfxVolume * 100);
  }

  public getIsMasterMuted(): boolean {
    return this.isMasterMuted;
  }

  public getIsBgmMuted(): boolean {
    return this.isBgmMuted;
  }

  public getIsSfxMuted(): boolean {
    return this.isSfxMuted;
  }

  public getActiveDuckCount(): number {
    return this.activeDuckSources.size;
  }

  public getCurrentBgmThemeId(): string {
    return this.currentThemeId;
  }

  public getDuckingIntensity(): DuckingIntensity {
    return this.duckingIntensity;
  }

  private updateMasterGain(): void {
    const vol = this.isMasterMuted ? 0 : Math.pow(this.masterVolume, 1.5);
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  private updateBgmGain(): void {
    const basePct = this.isBgmMuted || this.isMasterMuted ? 0 : this.bgmVolume;
    const perceivedBgm = Math.pow(basePct, 1.8) * BGM_GLOBAL_SCALE;
    const masterScale = this.isMasterMuted ? 0 : Math.pow(this.masterVolume, 1.5);

    if (this.ctx && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(perceivedBgm, this.ctx.currentTime);
    }
    if (this.bgmAudioEl) {
      this.bgmAudioEl.volume = Math.max(0, Math.min(1, perceivedBgm * masterScale));
    }
  }

  private updateSfxGain(): void {
    const basePct = this.isSfxMuted || this.isMasterMuted ? 0 : this.sfxVolume;
    const perceivedSfx = Math.pow(basePct, 1.2) * SFX_GLOBAL_SCALE;
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(perceivedSfx, this.ctx.currentTime);
    }
  }
}

// Global audioManager singleton export
export const audioManager = AudioManager.getInstance();
