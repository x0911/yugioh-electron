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
  DUEL_STEP: 'duel:step',
  DUEL_SET_AUTOPLAY: 'duel:set-autoplay',
  DUEL_GET_CARD_NAME: 'duel:get-card-name',
  DUEL_PLAY_VIDEO: 'duel:play-video',
  DUEL_VIDEO_FINISHED: 'duel:video-finished',

  // Deck (to be expanded in Phase 7)
  DECK_LIST: 'deck:list',
  DECK_SAVE: 'deck:save',
  DECK_DELETE: 'deck:delete',

  // Settings (to be expanded in Phase 6)
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
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
  getCardName: (code: number) => Promise<string>;
  onEvent: (callback: (event: DuelEventPayload) => void) => () => void;
  playVideo: (callback: (video: unknown) => void) => () => void;
  notifyVideoFinished: () => Promise<void>;
}

export interface DeckAPI {
  listDecks: () => Promise<string[]>;
  saveDeck: (deckName: string, deckData: unknown) => Promise<boolean>;
  deleteDeck: (deckName: string) => Promise<boolean>;
}

export interface SettingsAPI {
  getSettings: () => Promise<Record<string, unknown>>;
  saveSettings: (settings: Record<string, unknown>) => Promise<boolean>;
}

export interface AppAPI {
  getVersion: () => Promise<string>;
  initEngine: () => Promise<EngineInitStatus>;
  getInitStatus: () => Promise<EngineInitStatus>;
  exitApp: () => Promise<void>;
  platform: NodeJS.Platform;
}
