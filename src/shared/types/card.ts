// =============================================================================
// Yu-Gi-Oh! Card Type Definitions, Bitmasks, and Dictionaries
// =============================================================================

// Card Type Bitmasks (from ocgcore/constant.lua)
export const CARD_TYPES = {
  MONSTER: 0x1,
  SPELL: 0x2,
  TRAP: 0x4,
  NORMAL: 0x10,
  EFFECT: 0x20,
  FUSION: 0x40,
  RITUAL: 0x80,
  TRAPMONSTER: 0x100,
  SPIRIT: 0x200,
  UNION: 0x400,
  GEMINI: 0x800,
  TUNER: 0x1000,
  SYNCHRO: 0x2000,
  TOKEN: 0x4000,
  QUICKPLAY: 0x10000,
  CONTINUOUS: 0x20000,
  EQUIP: 0x40000,
  FIELD: 0x80000,
  COUNTER: 0x100000,
  FLIP: 0x200000,
  TOON: 0x400000,
} as const;

// Attribute Bitmasks
export const CARD_ATTRIBUTES = {
  EARTH: 0x1,
  WATER: 0x2,
  FIRE: 0x4,
  WIND: 0x8,
  LIGHT: 0x10,
  DARK: 0x20,
  DIVINE: 0x40,
} as const;

export type CardAttributeName = 'EARTH' | 'WATER' | 'FIRE' | 'WIND' | 'LIGHT' | 'DARK' | 'DIVINE';

export const ATTRIBUTE_NAME_MAP: Record<number, CardAttributeName> = {
  0x1: 'EARTH',
  0x2: 'WATER',
  0x4: 'FIRE',
  0x8: 'WIND',
  0x10: 'LIGHT',
  0x20: 'DARK',
  0x40: 'DIVINE',
};

// Race / Monster Type Bitmasks
export const CARD_RACES = {
  WARRIOR: 0x1,
  SPELLCASTER: 0x2,
  FAIRY: 0x4,
  FIEND: 0x8,
  ZOMBIE: 0x10,
  MACHINE: 0x20,
  AQUA: 0x40,
  PYRO: 0x80,
  ROCK: 0x100,
  WINGEDBEAST: 0x200,
  PLANT: 0x400,
  INSECT: 0x800,
  THUNDER: 0x1000,
  DRAGON: 0x2000,
  BEAST: 0x4000,
  BEASTWARRIOR: 0x8000,
  DINOSAUR: 0x10000,
  FISH: 0x20000,
  SEASERPENT: 0x40000,
  REPTILE: 0x80000,
  PSYCHIC: 0x100000,
  DIVINE: 0x200000,
  CREATORGOD: 0x400000,
} as const;

export const RACE_NAME_MAP: Record<number, string> = {
  0x1: 'Warrior',
  0x2: 'Spellcaster',
  0x4: 'Fairy',
  0x8: 'Fiend',
  0x10: 'Zombie',
  0x20: 'Machine',
  0x40: 'Aqua',
  0x80: 'Pyro',
  0x100: 'Rock',
  0x200: 'Winged Beast',
  0x400: 'Plant',
  0x800: 'Insect',
  0x1000: 'Thunder',
  0x2000: 'Dragon',
  0x4000: 'Beast',
  0x8000: 'Beast-Warrior',
  0x10000: 'Dinosaur',
  0x20000: 'Fish',
  0x40000: 'Sea Serpent',
  0x80000: 'Reptile',
  0x100000: 'Psychic',
  0x200000: 'Divine-Beast',
  0x400000: 'Creator-God',
};

// Full Enriched Card Model used across Deck Edit and Duel UI
export interface CardDetail {
  id: number;
  alias: number;
  name: string;
  desc: string;
  type: number;
  atk: number;
  def: number;
  level: number;
  race: number;
  raceName: string;
  attribute: number;
  attributeName: string;
  isMonster: boolean;
  isSpell: boolean;
  isTrap: boolean;
  isFusion: boolean;
  isRitual: boolean;
  isEffect: boolean;
  isNormal: boolean;
  isFlip: boolean;
  isToon: boolean;
  isSpirit: boolean;
  isUnion: boolean;
  isGemini: boolean;
  isQuickPlay: boolean;
  isContinuous: boolean;
  isEquip: boolean;
  isField: boolean;
  isCounter: boolean;
  isExtraDeck: boolean;
  era: 'DM' | 'GX';
  typeLabels: string[];
}

export type CardKindFilter = 'ALL' | 'MONSTER' | 'SPELL' | 'TRAP' | 'EXTRA';
export type CardEraFilter = 'ALL' | 'DM' | 'GX';
export type CardSortBy = 'name' | 'id' | 'atk' | 'def' | 'level' | 'type';
export type CardSortOrder = 'asc' | 'desc';

export interface CardFilterState {
  query: string;
  kind: CardKindFilter;
  subType: string;
  attribute: number | 0;
  race: number | 0;
  level: number | 0;
  minAtk: number | null;
  maxAtk: number | null;
  minDef: number | null;
  maxDef: number | null;
  era: CardEraFilter;
  sortBy: CardSortBy;
  sortOrder: CardSortOrder;
}

export const DEFAULT_CARD_FILTER_STATE: CardFilterState = {
  query: '',
  kind: 'ALL',
  subType: 'ALL',
  attribute: 0,
  race: 0,
  level: 0,
  minAtk: null,
  maxAtk: null,
  minDef: null,
  maxDef: null,
  era: 'ALL',
  sortBy: 'name',
  sortOrder: 'asc',
};
