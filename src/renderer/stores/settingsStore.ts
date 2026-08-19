import { defineStore } from 'pinia';
import type {
  CharacterData,
  CharacterDeckData,
  SettingsConfig,
} from '../../shared/types/character.js';

export interface SettingsState extends SettingsConfig {
  characters: CharacterData[];
  isLoading: boolean;
  isInitialized: boolean;
}

export const defaultSettings: SettingsConfig = {
  bgmVolume: 80,
  sfxVolume: 100,
  selectedOpponentId: 'yugi-muto',
  selectedSeriesFilter: 'ALL',
  devMode: true,
  skipPreDuelVideo: false,
};

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    ...defaultSettings,
    characters: [],
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    selectedCharacter(state): CharacterData | undefined {
      return state.characters.find((c) => c.id === state.selectedOpponentId) || state.characters[0];
    },
    selectedCharacterDecks(state): CharacterDeckData[] {
      const char =
        state.characters.find((c) => c.id === state.selectedOpponentId) || state.characters[0];
      return char ? char.decks : [];
    },
  },

  actions: {
    async initializeSettings(): Promise<void> {
      if (this.isInitialized) return;
      this.isLoading = true;

      try {
        if (window.settingsAPI) {
          // Load settings from electron-store
          const saved = await window.settingsAPI.getSettings();
          if (saved) {
            this.bgmVolume = saved.bgmVolume ?? defaultSettings.bgmVolume;
            this.sfxVolume = saved.sfxVolume ?? defaultSettings.sfxVolume;
            this.selectedOpponentId =
              saved.selectedOpponentId || defaultSettings.selectedOpponentId;
            this.selectedSeriesFilter =
              saved.selectedSeriesFilter || defaultSettings.selectedSeriesFilter;
            this.devMode = saved.devMode ?? defaultSettings.devMode;
            this.skipPreDuelVideo = saved.skipPreDuelVideo ?? defaultSettings.skipPreDuelVideo;
          }

          // Load characters list
          const chars = await window.settingsAPI.getCharacters();
          if (chars && chars.length > 0) {
            this.characters = chars;
          }
        }
      } catch (err) {
        console.warn('[SettingsStore] Failed to load settings from IPC:', err);
      } finally {
        this.isLoading = false;
        this.isInitialized = true;
      }
    },

    async setBgmVolume(volume: number): Promise<void> {
      this.bgmVolume = Math.max(0, Math.min(100, volume));
      await this.persist();
    },

    async setSfxVolume(volume: number): Promise<void> {
      this.sfxVolume = Math.max(0, Math.min(100, volume));
      await this.persist();
    },

    async setSelectedOpponent(id: string): Promise<void> {
      this.selectedOpponentId = id;
      await this.persist();
    },

    async setSelectedSeriesFilter(filter: 'ALL' | 'DM' | 'GX'): Promise<void> {
      this.selectedSeriesFilter = filter;
      await this.persist();
    },

    async toggleDevMode(): Promise<void> {
      this.devMode = !this.devMode;
      await this.persist();
    },

    async toggleSkipPreDuelVideo(): Promise<void> {
      this.skipPreDuelVideo = !this.skipPreDuelVideo;
      await this.persist();
    },

    async resetToDefaults(): Promise<void> {
      this.bgmVolume = defaultSettings.bgmVolume;
      this.sfxVolume = defaultSettings.sfxVolume;
      this.selectedOpponentId = defaultSettings.selectedOpponentId;
      this.selectedSeriesFilter = defaultSettings.selectedSeriesFilter;
      this.devMode = defaultSettings.devMode;
      this.skipPreDuelVideo = defaultSettings.skipPreDuelVideo;
      await this.persist();
    },

    async persist(): Promise<void> {
      if (window.settingsAPI) {
        try {
          await window.settingsAPI.saveSettings({
            bgmVolume: this.bgmVolume,
            sfxVolume: this.sfxVolume,
            selectedOpponentId: this.selectedOpponentId,
            selectedSeriesFilter: this.selectedSeriesFilter,
            devMode: this.devMode,
            skipPreDuelVideo: this.skipPreDuelVideo,
          });
        } catch (err) {
          console.error('[SettingsStore] Failed to save settings to IPC:', err);
        }
      }
    },

    getRandomDeckForOpponent(characterId?: string): {
      character: CharacterData;
      deck: CharacterDeckData;
      deckIndex: number;
    } | null {
      const targetId = characterId || this.selectedOpponentId;
      const char = this.characters.find((c) => c.id === targetId) || this.characters[0];
      if (!char || char.decks.length === 0) return null;

      const deckIndex = Math.floor(Math.random() * char.decks.length);
      return {
        character: char,
        deck: char.decks[deckIndex],
        deckIndex,
      };
    },
  },
});
