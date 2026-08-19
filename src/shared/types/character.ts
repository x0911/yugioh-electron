// =============================================================================
// Character and Character Deck Shared Types
// =============================================================================

export type CharacterSeries = 'DM' | 'GX';

export interface CharacterDeckData {
  id: string;
  name: string;
  archetype: string;
  description: string;
  ydkPath: string;
  mainCards: number[];
  extraCards: number[];
  signatureCardIds: number[];
}

export interface CharacterData {
  id: string;
  name: string;
  series: CharacterSeries;
  title: string;
  tagline: string;
  description: string;
  avatar: string;
  video: string;
  decks: CharacterDeckData[];
  signatureCards: number[];
  themeColor: string;
}

export interface SettingsConfig {
  bgmVolume: number;
  sfxVolume: number;
  selectedOpponentId: string;
  selectedSeriesFilter: 'ALL' | 'DM' | 'GX';
  devMode: boolean;
  skipPreDuelVideo: boolean;
}
