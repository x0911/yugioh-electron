import { contextBridge, ipcRenderer } from 'electron';
import {
  IPC_CHANNELS,
  type DuelAPI,
  type DeckAPI,
  type SettingsAPI,
  type AppAPI,
} from '../shared/types/ipc.js';
import type {
  DuelInitOptions,
  DuelEventPayload,
  DuelStateSummary,
  CardVideoPayload,
} from '../shared/types/duel.js';

const duelAPI: DuelAPI = {
  newDuel: (options: DuelInitOptions): Promise<boolean> => {
    const plainOptions = JSON.parse(JSON.stringify(options));
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_NEW, plainOptions);
  },
  sendCommand: (response: unknown): Promise<boolean> => {
    const plainResponse = JSON.parse(JSON.stringify(response));
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_COMMAND, plainResponse);
  },
  step: (): Promise<DuelEventPayload[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_STEP);
  },
  setAutoPlay: (autoPlay: boolean): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_SET_AUTOPLAY, autoPlay);
  },
  getState: (): Promise<DuelStateSummary> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_STATE);
  },
  getBoardState: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_BOARD);
  },
  getCardName: (code: number): Promise<string> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_CARD_NAME, code);
  },
  onEvent: (callback: (event: DuelEventPayload) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, event: DuelEventPayload) => callback(event);
    ipcRenderer.on(IPC_CHANNELS.DUEL_EVENT, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.DUEL_EVENT, handler);
    };
  },
  playVideo: (callback: (video: CardVideoPayload) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, video: CardVideoPayload) => callback(video);
    ipcRenderer.on(IPC_CHANNELS.DUEL_PLAY_VIDEO, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.DUEL_PLAY_VIDEO, handler);
    };
  },
  notifyVideoFinished: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_VIDEO_FINISHED);
  },
  getReview: (logMarkdown: string, opponentName?: string): Promise<any> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_REVIEW, logMarkdown, opponentName);
  },
  getTacticalMemory: (): Promise<any> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_TACTICAL_MEMORY);
  },
};

const deckAPI: DeckAPI = {
  getAllCards: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_GET_ALL_CARDS);
  },
  getCustomDecks: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_GET_CUSTOM_DECKS);
  },
  saveCustomDeck: (deck) => {
    const plainDeck = JSON.parse(JSON.stringify(deck));
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_SAVE_CUSTOM_DECK, plainDeck);
  },
  deleteCustomDeck: (deckId: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_DELETE_CUSTOM_DECK, deckId);
  },
  getActiveDeckId: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_GET_ACTIVE_ID);
  },
  setActiveDeckId: (deckId: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_SET_ACTIVE_ID, deckId);
  },
  listDecks: (): Promise<string[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_LIST);
  },
  saveDeck: (deckName: string, deckData: unknown): Promise<boolean> => {
    const plainData = JSON.parse(JSON.stringify(deckData));
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_SAVE, deckName, plainData);
  },
  deleteDeck: (deckName: string): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_DELETE, deckName);
  },
};

const settingsAPI: SettingsAPI = {
  getSettings: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET);
  },
  saveSettings: (settings) => {
    const plainSettings = JSON.parse(JSON.stringify(settings));
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, plainSettings);
  },
  getCharacters: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.CHARACTERS_GET);
  },
  getRandomOpponentDeck: (characterId: string) => {
    return ipcRenderer.invoke(IPC_CHANNELS.CHARACTERS_GET_RANDOM_DECK, characterId);
  },
  testAiConnection: (payload) => {
    const plainPayload = JSON.parse(JSON.stringify(payload));
    return ipcRenderer.invoke(IPC_CHANNELS.AI_TEST_CONNECTION, plainPayload);
  },
};

const appAPI: AppAPI = {
  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
  },
  initEngine: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.APP_INIT_ENGINE);
  },
  getInitStatus: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_INIT_STATUS);
  },
  exitApp: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.APP_EXIT);
  },
  platform: process.platform,
};

contextBridge.exposeInMainWorld('duelAPI', duelAPI);
contextBridge.exposeInMainWorld('deckAPI', deckAPI);
contextBridge.exposeInMainWorld('settingsAPI', settingsAPI);
contextBridge.exposeInMainWorld('appAPI', appAPI);
