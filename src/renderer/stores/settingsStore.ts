import { defineStore } from 'pinia';

export interface SettingsState {
  bgmVolume: number;
  sfxVolume: number;
  selectedOpponentId: string;
  devMode: boolean;
  skipPreDuelVideo: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    bgmVolume: 80,
    sfxVolume: 100,
    selectedOpponentId: 'yugi',
    devMode: true,
    skipPreDuelVideo: false,
  }),
  actions: {
    setBgmVolume(volume: number): void {
      this.bgmVolume = Math.max(0, Math.min(100, volume));
    },
    setSfxVolume(volume: number): void {
      this.sfxVolume = Math.max(0, Math.min(100, volume));
    },
    setSelectedOpponent(id: string): void {
      this.selectedOpponentId = id;
    },
    toggleDevMode(): void {
      this.devMode = !this.devMode;
    },
  },
});
