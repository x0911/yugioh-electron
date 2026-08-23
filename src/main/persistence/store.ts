import fs from 'node:fs';
import path from 'node:path';
import Store from 'electron-store';
import type { SettingsConfig } from '../../shared/types/character.js';
import type { CustomDeck } from '../../shared/types/deck.js';

export interface AppStoreSchema {
  settings: SettingsConfig;
  customDecks: Record<string, CustomDeck>;
  activeDeckId: string;
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
};

function loadAllPrebuiltDecks(): Record<string, CustomDeck> {
  try {
    const jsonPath = path.resolve(process.cwd(), 'data/prebuilt-decks.json');
    if (fs.existsSync(jsonPath)) {
      const list: CustomDeck[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const map: Record<string, CustomDeck> = {};
      for (const deck of list) {
        map[deck.id] = deck;
      }
      return map;
    }
  } catch (err) {
    console.warn('[store] Failed to load prebuilt-decks.json:', err);
  }
  return {};
}

export const defaultStarterDecks: Record<string, CustomDeck> = loadAllPrebuiltDecks();

export const appStore = new Store<AppStoreSchema>({
  name: 'yugioh-desktop-settings',
  projectName: 'yugioh-electron',
  defaults: {
    settings: defaultSettings,
    customDecks: defaultStarterDecks,
    activeDeckId: 'yugi_deck_1',
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

export function getPersistedCustomDecks(): CustomDeck[] {
  const decksMap = appStore.get('customDecks') || {};
  const prebuilt = defaultStarterDecks;
  let hasMissingPrebuilt = false;

  // Always synchronize prebuilt decks so users receive updated card lists, archetypes, and avatars
  for (const [id, deck] of Object.entries(prebuilt)) {
    const existing = decksMap[id];
    const isCustomUserDeck = existing && existing.category === 'custom' && !prebuilt[id];
    if (isCustomUserDeck) continue;

    if (
      !existing ||
      !existing.avatar ||
      existing.name !== deck.name ||
      JSON.stringify(existing.main) !== JSON.stringify(deck.main) ||
      JSON.stringify(existing.extra || []) !== JSON.stringify(deck.extra || [])
    ) {
      decksMap[id] = { ...deck };
      hasMissingPrebuilt = true;
    }
  }

  if (hasMissingPrebuilt || Object.keys(decksMap).length === 0) {
    appStore.set('customDecks', decksMap);
  }

  // Group and sort decks: Prebuilt DM/GX character decks (in canonical roster order), then Popular, then Custom
  const prebuiltOrder = Object.keys(prebuilt);
  const allDecks = Object.values(decksMap);

  allDecks.sort((a, b) => {
    const idxA = prebuiltOrder.indexOf(a.id);
    const idxB = prebuiltOrder.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  return allDecks;
}

export function savePersistedCustomDeck(deck: CustomDeck): CustomDeck {
  const decksMap = appStore.get('customDecks') || {};
  const updatedDeck: CustomDeck = {
    ...deck,
    updatedAt: Date.now(),
    createdAt: deck.createdAt || Date.now(),
  };
  decksMap[deck.id] = updatedDeck;
  appStore.set('customDecks', decksMap);
  return updatedDeck;
}

export function deletePersistedCustomDeck(deckId: string): boolean {
  const decksMap = appStore.get('customDecks') || {};
  if (decksMap[deckId]) {
    delete decksMap[deckId];
    appStore.set('customDecks', decksMap);
    return true;
  }
  return false;
}

export function getPersistedActiveDeckId(): string {
  return appStore.get('activeDeckId') || 'yugi_deck_1';
}

export function savePersistedActiveDeckId(deckId: string): string {
  appStore.set('activeDeckId', deckId);
  return deckId;
}

