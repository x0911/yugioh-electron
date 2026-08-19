// =============================================================================
// IPC Channel Names and Interface Definitions
// =============================================================================

import type { DuelInitOptions, DuelEventPayload, DuelStateSummary } from './duel.js';

export const IPC_CHANNELS = {
  // App
  APP_GET_VERSION: 'app:get-version',
  APP_INIT_ENGINE: 'app:init-engine',
  APP_GET_INIT_STATUS: 'app:get-init-status',
  APP_EXIT: 'app:exit',

  // Duel
  DUEL_NEW: 'duel:new',
  DUEL_COMMAND: 'duel:command',
  DUEL_EVENT: 'duel:event',
  DUEL_GET_STATE: 'duel:get-state',
  DUEL_GET_BOARD: 'duel:get-board',
  DUEL_STEP: 'duel:step',
  DUEL_SET_AUTOPLAY: 'duel:set-autoplay',
  DUEL_GET_CARD_NAME: 'duel:get-card-name',
  DUEL_PLAY_VIDEO: 'duel:play-video',
  DUEL_VIDEO_FINISHED: 'duel:video-finished',

  // Deck & Card Pool (Phase 7)
  DECK_GET_ALL_CARDS: 'deck:get-all-cards',
  DECK_GET_CUSTOM_DECKS: 'deck:get-custom-decks',
  DECK_SAVE_CUSTOM_DECK: 'deck:save-custom-deck',
  DECK_DELETE_CUSTOM_DECK: 'deck:delete-custom-deck',
  DECK_GET_ACTIVE_ID: 'deck:get-active-id',
  DECK_SET_ACTIVE_ID: 'deck:set-active-id',
  DECK_LIST: 'deck:list',
  DECK_SAVE: 'deck:save',
  DECK_DELETE: 'deck:delete',

  // Settings & Characters (Phase 6)
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  CHARACTERS_GET: 'characters:get',
  CHARACTERS_GET_BY_ID: 'characters:get-by-id',
  CHARACTERS_GET_RANDOM_DECK: 'characters:get-random-deck',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

export interface EngineInitStatus {
  initialized: boolean;
  engineVersion: string;
  cardCount: number;
  scriptsCount: number;
  ready: boolean;
  error?: string;
}

// Window API surfaces exposed via contextBridge in preload.ts
export interface DuelAPI {
  newDuel: (options: DuelInitOptions) => Promise<boolean>;
  sendCommand: (response: unknown) => Promise<boolean>;
  step: () => Promise<DuelEventPayload[]>;
  setAutoPlay: (autoPlay: boolean) => Promise<void>;
  getState: () => Promise<DuelStateSummary>;
  getBoardState: () => Promise<import('./field.js').DuelBoardState>;
  getCardName: (code: number) => Promise<string>;
  onEvent: (callback: (event: DuelEventPayload) => void) => () => void;
  playVideo: (callback: (video: unknown) => void) => () => void;
  notifyVideoFinished: () => Promise<void>;
}

export interface DeckAPI {
  getAllCards: () => Promise<import('./card.js').CardDetail[]>;
  getCustomDecks: () => Promise<import('./deck.js').CustomDeck[]>;
  saveCustomDeck: (deck: import('./deck.js').CustomDeck) => Promise<import('./deck.js').CustomDeck>;
  deleteCustomDeck: (deckId: string) => Promise<boolean>;
  getActiveDeckId: () => Promise<string>;
  setActiveDeckId: (deckId: string) => Promise<string>;
  listDecks: () => Promise<string[]>;
  saveDeck: (deckName: string, deckData: unknown) => Promise<boolean>;
  deleteDeck: (deckName: string) => Promise<boolean>;
}

export interface RandomOpponentDeckPayload {
  character: import('./character.js').CharacterData;
  deck: import('./character.js').CharacterDeckData;
  deckIndex: number;
}

export interface SettingsAPI {
  getSettings: () => Promise<import('./character.js').SettingsConfig>;
  saveSettings: (
    settings: Partial<import('./character.js').SettingsConfig>,
  ) => Promise<import('./character.js').SettingsConfig>;
  getCharacters: () => Promise<import('./character.js').CharacterData[]>;
  getRandomOpponentDeck: (characterId: string) => Promise<RandomOpponentDeckPayload | null>;
}

export interface AppAPI {
  getVersion: () => Promise<string>;
  initEngine: () => Promise<EngineInitStatus>;
  getInitStatus: () => Promise<EngineInitStatus>;
  exitApp: () => Promise<void>;
  platform: NodeJS.Platform;
}
