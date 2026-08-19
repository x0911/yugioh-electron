import Store from 'electron-store';
import type { SettingsConfig } from '../../shared/types/character.js';
import type { CustomDeck } from '../../shared/types/deck.js';

export interface AppStoreSchema {
  settings: SettingsConfig;
  customDecks: Record<string, CustomDeck>;
  activeDeckId: string;
}

export const defaultSettings: SettingsConfig = {
  bgmVolume: 80,
  sfxVolume: 100,
  selectedOpponentId: 'yugi-muto',
  selectedSeriesFilter: 'ALL',
  devMode: true,
  skipPreDuelVideo: false,
};

export const defaultStarterDecks: Record<string, CustomDeck> = {
  'starter-yugi-dm': {
    id: 'starter-yugi-dm',
    name: 'Yugi — Dark Magician Beatdown',
    main: [
      46986414, 46986414, 46986414, // Dark Magician x3
      70781052, 70781052, 70781052, // Summoned Skull x3
      91152256, 91152256, 91152256, // Celtic Guardian x3
      40640057, 40640057, 40640057, // Kuriboh x3
      54652250, 54652250, 54652250, // Man-Eater Bug x3
      26202165, 26202165, 26202165, // Sangan x3
      13039848, 13039848, 13039848, // Giant Soldier of Stone x3
      6368038, 6368038, 6368038, // Mystical Elf x3
      78193831, 78193831, // Buster Blader x2
      55144522, 55144522, // Pot of Greed x2
      12580477, 12580477, // Raigeki x2
      53129443, 53129443, // Dark Hole x2
      83764719, 83764719, // Monster Reborn x2
      24094653, 24094653, // Polymerization x2
      4206964, 4206964, // Trap Hole x2
      44095762, 44095762, // Mirror Force x2
      24068492, 24068492, // Just Desserts x2
    ],
    extra: [
      98502113, 98502113, // Dark Paladin x2
      11901678, // B. Skull Dragon x1
    ],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  'starter-kaiba-blueeyes': {
    id: 'starter-kaiba-blueeyes',
    name: 'Kaiba — Blue-Eyes Power',
    main: [
      89631139, 89631139, 89631139, // Blue-Eyes White Dragon x3
      14898066, 14898066, 14898066, // Vorse Raider x3
      5053103, 5053103, 5053103, // Battle Ox x3
      97590747, 97590747, 97590747, // La Jinn x3
      17985575, 17985575, 17985575, // Lord of D. x3
      43973174, 43973174, 43973174, // The Flute of Summoning Dragon x3
      34627841, 34627841, 34627841, // Kaibaman x3
      24094653, 24094653, 24094653, // Polymerization x3
      55144522, 55144522, // Pot of Greed x2
      12580477, 12580477, // Raigeki x2
      53129443, 53129443, // Dark Hole x2
      83555666, 83555666, // Ring of Destruction x2
      57728570, 57728570, // Crush Card Virus x2
      4206964, 4206964, 4206964, // Trap Hole x3
      44095762, 44095762, 44095762, // Mirror Force x3
    ],
    extra: [
      23995346, 23995346, // Blue-Eyes Ultimate Dragon x2
    ],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  'starter-jaden-heroes': {
    id: 'starter-jaden-heroes',
    name: 'Jaden — Elemental HEROes',
    main: [
      21844576, 21844576, 21844576, // Avian x3
      58932615, 58932615, 58932615, // Burstinatrix x3
      84327329, 84327329, 84327329, // Clayman x3
      20721928, 20721928, 20721928, // Sparkman x3
      86188410, 86188410, 86188410, // Wildheart x3
      79979666, 79979666, 79979666, // Bubbleman x3
      24094653, 24094653, 24094653, // Polymerization x3
      26902560, 26902560, 26902560, // Fusion Sage x3
      45906428, 45906428, 45906428, // Miracle Fusion x3
      55144522, 55144522, // Pot of Greed x2
      12580477, 12580477, // Raigeki x2
      53129443, 53129443, // Dark Hole x2
      22020907, 22020907, 22020907, // Hero Signal x3
      44095762, 44095762, 44095762, // Mirror Force x3
      21597117, 21597117, 21597117, // A Hero Emerges x3
    ],
    extra: [
      35809262, 35809262, // Flame Wingman x2
      61204971, 61204971, // Thunder Giant x2
      25366484, // Shining Flare Wingman x1
    ],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
};

export const appStore = new Store<AppStoreSchema>({
  name: 'yugioh-desktop-settings',
  defaults: {
    settings: defaultSettings,
    customDecks: defaultStarterDecks,
    activeDeckId: 'starter-yugi-dm',
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
  const decksMap = appStore.get('customDecks');
  if (!decksMap || Object.keys(decksMap).length === 0) {
    appStore.set('customDecks', defaultStarterDecks);
    return Object.values(defaultStarterDecks);
  }
  return Object.values(decksMap);
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
  return appStore.get('activeDeckId') || 'starter-yugi-dm';
}

export function savePersistedActiveDeckId(deckId: string): string {
  appStore.set('activeDeckId', deckId);
  return deckId;
}

