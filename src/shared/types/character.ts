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

export interface CharacterPersonality {
  aggression: number; // 0.0 to 1.0 (propensity to summon high ATK, attack, direct attack)
  defensiveness: number; // 0.0 to 1.0 (propensity to set monsters, hold backrow defensively)
  riskTolerance: number; // 0.0 to 1.0 (willingness to tribute/banish resources, take recoil)
  comboFocus: number; // 0.0 to 1.0 (propensity to activate spells, use special summons/fusion)
  cardAdvantageWeight: number; // 0.5 to 2.0 (how heavily AI values drawing cards and hand preservation)
  signatureFavoritism: number; // 0.0 to 1.0 (preference for summoning and protecting signature cards)
  thinkDelayBaseMs: number; // Base AI think delay in milliseconds
  thinkDelayJitterMs: number; // Random jitter in milliseconds
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
  personality?: CharacterPersonality;
}

export interface SettingsConfig {
  bgmVolume: number;
  sfxVolume: number;
  selectedOpponentId: string;
  selectedSeriesFilter: 'ALL' | 'DM' | 'GX';
  devMode: boolean;
  skipPreDuelVideo: boolean;
}
