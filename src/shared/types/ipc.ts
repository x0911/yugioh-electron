// =============================================================================
// IPC Channel Names and Interface Definitions
// =============================================================================

export const IPC_CHANNELS = {
  // App
  APP_GET_VERSION: 'app:get-version',
  APP_EXIT: 'app:exit',

  // Duel (to be fully expanded in Phase 2 & 10)
  DUEL_NEW: 'duel:new',
  DUEL_COMMAND: 'duel:command',
  DUEL_EVENT: 'duel:event',
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

// Window API surfaces exposed via contextBridge in preload.ts
export interface DuelAPI {
  sendCommand: (command: unknown) => Promise<void>;
  onEvent: (callback: (event: unknown) => void) => () => void;
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
  exitApp: () => Promise<void>;
  platform: NodeJS.Platform;
}
