import { defineStore } from 'pinia';
import type {
  CharacterData,
  CharacterDeckData,
  SettingsConfig,
} from '../../shared/types/character.js';
import { audioManager, type DuckingIntensity } from '../audio/index.js';

export interface SettingsState extends SettingsConfig {
  characters: CharacterData[];
  isLoading: boolean;
  isInitialized: boolean;
}

export const defaultSettings: SettingsConfig = {
  selectedBgmTheme: 'passionate',
  masterVolume: 100,
  bgmVolume: 80,
  sfxVolume: 100,
  isMasterMuted: false,
  isBgmMuted: false,
  isSfxMuted: false,
  duckingIntensity: 'normal',
  selectedOpponentId: 'yugi-muto',
  selectedSeriesFilter: 'ALL',
  devMode: true,
  skipPreDuelVideo: false,
  chainConfirmationMode: 'auto',
  aiEngineType: 'builtin',
  aiProvider: 'builtin',
  aiApiKeys: {},
  aiModels: {},
  aiCustomEndpoints: {},
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
    hasKeyForProvider: (state) => (provider: string): boolean => {
      if (provider === 'builtin' || provider === 'ollama') return true;
      return !!(state.aiApiKeys && state.aiApiKeys[provider] && state.aiApiKeys[provider].trim().length > 0);
    },
    configuredProviders(state): { id: string; name: string; icon: string }[] {
      const all = [
        { id: 'builtin', name: 'Built-in Fast Engine', icon: '⚡' },
        { id: 'gemini', name: 'Google Gemini', icon: '✨' },
        { id: 'openai', name: 'OpenAI ChatGPT', icon: '🤖' },
        { id: 'deepseek', name: 'DeepSeek AI', icon: '🌌' },
        { id: 'anthropic', name: 'Anthropic Claude', icon: '🧠' },
        { id: 'groq', name: 'Groq Cloud', icon: '⚡' },
        { id: 'ollama', name: 'Ollama (Local LLM)', icon: '🦙' },
      ];
      return all.filter((p) => {
        if (p.id === 'builtin' || p.id === 'ollama') return true;
        return !!(state.aiApiKeys && state.aiApiKeys[p.id] && state.aiApiKeys[p.id].trim().length > 0);
      });
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
            this.selectedBgmTheme = saved.selectedBgmTheme || defaultSettings.selectedBgmTheme;
            this.masterVolume = saved.masterVolume ?? defaultSettings.masterVolume;
            this.bgmVolume = saved.bgmVolume ?? defaultSettings.bgmVolume;
            this.sfxVolume = saved.sfxVolume ?? defaultSettings.sfxVolume;
            this.isMasterMuted = saved.isMasterMuted ?? defaultSettings.isMasterMuted;
            this.isBgmMuted = saved.isBgmMuted ?? defaultSettings.isBgmMuted;
            this.isSfxMuted = saved.isSfxMuted ?? defaultSettings.isSfxMuted;
            this.duckingIntensity = saved.duckingIntensity || defaultSettings.duckingIntensity;
            this.selectedOpponentId =
              saved.selectedOpponentId || defaultSettings.selectedOpponentId;
            this.selectedSeriesFilter =
              saved.selectedSeriesFilter || defaultSettings.selectedSeriesFilter;
            this.devMode = saved.devMode ?? defaultSettings.devMode;
            this.skipPreDuelVideo = saved.skipPreDuelVideo ?? defaultSettings.skipPreDuelVideo;
            this.chainConfirmationMode =
              saved.chainConfirmationMode || defaultSettings.chainConfirmationMode;
            this.aiEngineType = saved.aiEngineType || defaultSettings.aiEngineType;
            this.aiProvider = saved.aiProvider || (saved.aiEngineType as any) || defaultSettings.aiProvider;
            this.aiApiKeys = saved.aiApiKeys || {};
            this.aiModels = saved.aiModels || {};
            this.aiCustomEndpoints = saved.aiCustomEndpoints || {};
          }

          // Apply saved volume settings to audioManager
          audioManager.setMasterVolume(this.masterVolume);
          audioManager.setBgmVolume(this.bgmVolume);
          audioManager.setSfxVolume(this.sfxVolume);
          audioManager.setMasterMute(this.isMasterMuted);
          audioManager.setBgmMute(this.isBgmMuted);
          audioManager.setSfxMute(this.isSfxMuted);
          audioManager.setDuckingIntensity(this.duckingIntensity);

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

    async setSelectedBgmTheme(themeId: string): Promise<void> {
      this.selectedBgmTheme = themeId;
      audioManager.playBgm(themeId);
      await this.persist();
    },

    async setMasterVolume(volume: number): Promise<void> {
      this.masterVolume = Math.max(0, Math.min(100, volume));
      audioManager.setMasterVolume(this.masterVolume);
      await this.persist();
    },

    async setBgmVolume(volume: number): Promise<void> {
      this.bgmVolume = Math.max(0, Math.min(100, volume));
      audioManager.setBgmVolume(this.bgmVolume);
      await this.persist();
    },

    async setSfxVolume(volume: number): Promise<void> {
      this.sfxVolume = Math.max(0, Math.min(100, volume));
      audioManager.setSfxVolume(this.sfxVolume);
      await this.persist();
    },

    async toggleMasterMute(): Promise<void> {
      this.isMasterMuted = !this.isMasterMuted;
      audioManager.setMasterMute(this.isMasterMuted);
      await this.persist();
    },

    async toggleBgmMute(): Promise<void> {
      this.isBgmMuted = !this.isBgmMuted;
      audioManager.setBgmMute(this.isBgmMuted);
      await this.persist();
    },

    async toggleSfxMute(): Promise<void> {
      this.isSfxMuted = !this.isSfxMuted;
      audioManager.setSfxMute(this.isSfxMuted);
      await this.persist();
    },

    async setDuckingIntensity(intensity: DuckingIntensity): Promise<void> {
      this.duckingIntensity = intensity;
      audioManager.setDuckingIntensity(intensity);
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

    async setChainConfirmationMode(mode: 'auto' | 'on' | 'off'): Promise<void> {
      this.chainConfirmationMode = mode;
      await this.persist();
    },

    async resetToDefaults(): Promise<void> {
      this.selectedBgmTheme = defaultSettings.selectedBgmTheme;
      this.masterVolume = defaultSettings.masterVolume;
      this.bgmVolume = defaultSettings.bgmVolume;
      this.sfxVolume = defaultSettings.sfxVolume;
      this.isMasterMuted = defaultSettings.isMasterMuted;
      this.isBgmMuted = defaultSettings.isBgmMuted;
      this.isSfxMuted = defaultSettings.isSfxMuted;
      this.duckingIntensity = defaultSettings.duckingIntensity;
      this.selectedOpponentId = defaultSettings.selectedOpponentId;
      this.selectedSeriesFilter = defaultSettings.selectedSeriesFilter;
      this.devMode = defaultSettings.devMode;
      this.skipPreDuelVideo = defaultSettings.skipPreDuelVideo;
      this.chainConfirmationMode = defaultSettings.chainConfirmationMode;
      this.aiEngineType = defaultSettings.aiEngineType;

      audioManager.setMasterVolume(this.masterVolume);
      audioManager.setBgmVolume(this.bgmVolume);
      audioManager.setSfxVolume(this.sfxVolume);
      audioManager.setMasterMute(false);
      audioManager.setBgmMute(false);
      audioManager.setSfxMute(false);
      audioManager.setDuckingIntensity('normal');
      audioManager.playBgm(this.selectedBgmTheme);

      await this.persist();
    },

    async setAiEngineType(type: 'builtin' | 'gemini'): Promise<void> {
      this.aiEngineType = type;
      this.aiProvider = type;
      await this.persist();
    },

    async setAiProvider(provider: import('../../shared/types/character.js').AiProviderType): Promise<void> {
      this.aiProvider = provider;
      this.aiEngineType = provider === 'gemini' ? 'gemini' : 'builtin';
      await this.persist();
    },

    async setAiApiKey(provider: string, key: string): Promise<void> {
      if (!this.aiApiKeys) this.aiApiKeys = {};
      this.aiApiKeys[provider] = key;
      await this.persist();
    },

    async setAiModel(provider: string, model: string): Promise<void> {
      if (!this.aiModels) this.aiModels = {};
      this.aiModels[provider] = model;
      await this.persist();
    },

    async setAiCustomEndpoint(provider: string, endpoint: string): Promise<void> {
      if (!this.aiCustomEndpoints) this.aiCustomEndpoints = {};
      this.aiCustomEndpoints[provider] = endpoint;
      await this.persist();
    },

    async testAiConnection(provider: string): Promise<{ success: boolean; message?: string; error?: string }> {
      if (provider === 'builtin') {
        return { success: true, message: 'Built-in local heuristic engine is always available offline!' };
      }
      if (!window.settingsAPI) {
        return { success: false, error: 'Settings API unavailable.' };
      }
      const apiKey = this.aiApiKeys?.[provider] || '';
      const customEndpoint = this.aiCustomEndpoints?.[provider];
      const model = this.aiModels?.[provider];
      return window.settingsAPI.testAiConnection({
        provider,
        apiKey,
        customEndpoint,
        model,
      });
    },

    async fetchAiModels(provider: string): Promise<{ success: boolean; models?: string[]; error?: string }> {
      if (!window.settingsAPI) {
        return { success: false, error: 'Settings API unavailable.' };
      }
      const apiKey = this.aiApiKeys?.[provider] || '';
      const customEndpoint = this.aiCustomEndpoints?.[provider];
      return window.settingsAPI.fetchAiModels({
        provider,
        apiKey,
        customEndpoint,
      });
    },

    async persist(): Promise<void> {
      if (window.settingsAPI) {
        try {
          await window.settingsAPI.saveSettings({
            selectedBgmTheme: this.selectedBgmTheme,
            masterVolume: this.masterVolume,
            bgmVolume: this.bgmVolume,
            sfxVolume: this.sfxVolume,
            isMasterMuted: this.isMasterMuted,
            isBgmMuted: this.isBgmMuted,
            isSfxMuted: this.isSfxMuted,
            duckingIntensity: this.duckingIntensity,
            selectedOpponentId: this.selectedOpponentId,
            selectedSeriesFilter: this.selectedSeriesFilter,
            devMode: this.devMode,
            skipPreDuelVideo: this.skipPreDuelVideo,
            chainConfirmationMode: this.chainConfirmationMode,
            aiEngineType: this.aiEngineType,
            aiProvider: this.aiProvider,
            aiApiKeys: this.aiApiKeys,
            aiModels: this.aiModels,
            aiCustomEndpoints: this.aiCustomEndpoints,
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
