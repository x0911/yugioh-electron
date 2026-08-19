import { contextBridge, ipcRenderer } from 'electron';
import {
  IPC_CHANNELS,
  type DuelAPI,
  type DeckAPI,
  type SettingsAPI,
  type AppAPI,
} from '../shared/types/ipc.js';
import type { DuelInitOptions, DuelEventPayload, DuelStateSummary } from '../shared/types/duel.js';

const duelAPI: DuelAPI = {
  newDuel: (options: DuelInitOptions): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_NEW, options);
  },
  sendCommand: (response: unknown): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_COMMAND, response);
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
  playVideo: (callback: (video: unknown) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, video: unknown) => callback(video);
    ipcRenderer.on(IPC_CHANNELS.DUEL_PLAY_VIDEO, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.DUEL_PLAY_VIDEO, handler);
    };
  },
  notifyVideoFinished: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DUEL_VIDEO_FINISHED);
  },
};

const deckAPI: DeckAPI = {
  listDecks: (): Promise<string[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_LIST);
  },
  saveDeck: (deckName: string, deckData: unknown): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_SAVE, deckName, deckData);
  },
  deleteDeck: (deckName: string): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DECK_DELETE, deckName);
  },
};

const settingsAPI: SettingsAPI = {
  getSettings: (): Promise<Record<string, unknown>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET);
  },
  saveSettings: (settings: Record<string, unknown>): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings);
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
