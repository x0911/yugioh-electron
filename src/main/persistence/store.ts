import Store from 'electron-store';
import type { SettingsConfig } from '../../shared/types/character.js';

export interface AppStoreSchema {
  settings: SettingsConfig;
  customDecks: Record<string, unknown>;
}

export const defaultSettings: SettingsConfig = {
  bgmVolume: 80,
  sfxVolume: 100,
  selectedOpponentId: 'yugi-muto',
  selectedSeriesFilter: 'ALL',
  devMode: true,
  skipPreDuelVideo: false,
};

export const appStore = new Store<AppStoreSchema>({
  name: 'yugioh-desktop-settings',
  defaults: {
    settings: defaultSettings,
    customDecks: {},
  },
});

export function getPersistedSettings(): SettingsConfig {
  const current = appStore.get('settings');
  return { ...defaultSettings, ...(current || {}) };
}

export function savePersistedSettings(settings: Partial<SettingsConfig>): SettingsConfig {
  const current = getPersistedSettings();
  const updated: SettingsConfig = { ...current, ...settings };
  appStore.set('settings', updated);
  return updated;
}
