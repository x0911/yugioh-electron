import { ipcMain, app, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc.js';
import type { DuelInitOptions } from '../../shared/types/duel.js';
import { duelEngineService } from '../engine/DuelEngineService.js';
import type { OcgResponse } from 'ocgcore-wasm';

import {
  getPersistedSettings,
  savePersistedSettings,
  getPersistedCustomDecks,
  savePersistedCustomDeck,
  deletePersistedCustomDeck,
  getPersistedActiveDeckId,
  savePersistedActiveDeckId,
} from '../persistence/store.js';
import {
  loadCharacters,
  getCharacterById,
  getRandomDeckForCharacter,
} from '../decks/deckLoader.js';

let isServiceInitialized = false;

export function registerIpcHandlers(): void {
  // Forward duel events to renderer process
  duelEngineService.onEvent((event) => {
    const wins = BrowserWindow.getAllWindows();
    for (const win of wins) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.DUEL_EVENT, event);
      }
    }
  });

  // App
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => app.getVersion());
  ipcMain.handle(IPC_CHANNELS.APP_INIT_ENGINE, async () => {
    try {
      const status = await duelEngineService.init();
      isServiceInitialized = true;
      return status;
    } catch (err: unknown) {
      console.error('[Main IPC] Error initializing duel engine:', err);
      return {
        initialized: false,
        engineVersion: 'unknown',
        cardCount: 0,
        scriptsCount: 0,
        ready: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });
  ipcMain.handle(IPC_CHANNELS.APP_GET_INIT_STATUS, async () => {
    return duelEngineService.getStatus();
  });
  ipcMain.handle(IPC_CHANNELS.APP_EXIT, () => {
    app.quit();
  });

  // Duel Handlers
  ipcMain.handle(IPC_CHANNELS.DUEL_NEW, async (_event, options: DuelInitOptions) => {
    if (!isServiceInitialized) {
      await duelEngineService.init();
      isServiceInitialized = true;
    }
    return duelEngineService.startNewDuel(options);
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_COMMAND, async (_event, response: OcgResponse) => {
    return duelEngineService.sendResponse(response);
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_STEP, async () => {
    return duelEngineService.processStep();
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_SET_AUTOPLAY, async (_event, autoPlay: boolean) => {
    duelEngineService.setAutoPlay(autoPlay);
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_GET_STATE, async () => {
    return duelEngineService.getState();
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_GET_BOARD, async () => {
    return duelEngineService.getBoardState();
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_GET_CARD_NAME, async (_event, code: number) => {
    return duelEngineService.getCardName(code);
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_VIDEO_FINISHED, async () => {
    console.log('[Main IPC] Duel video finished notification received');
  });

  // Deck & Card Pool Handlers (Phase 7)
  ipcMain.handle(IPC_CHANNELS.DECK_GET_ALL_CARDS, async () => {
    return duelEngineService.getAllCards();
  });

  ipcMain.handle(IPC_CHANNELS.DECK_GET_CUSTOM_DECKS, async () => {
    return getPersistedCustomDecks();
  });

  ipcMain.handle(IPC_CHANNELS.DECK_SAVE_CUSTOM_DECK, async (_event, deck) => {
    return savePersistedCustomDeck(deck);
  });

  ipcMain.handle(IPC_CHANNELS.DECK_DELETE_CUSTOM_DECK, async (_event, deckId: string) => {
    return deletePersistedCustomDeck(deckId);
  });

  ipcMain.handle(IPC_CHANNELS.DECK_GET_ACTIVE_ID, async () => {
    return getPersistedActiveDeckId();
  });

  ipcMain.handle(IPC_CHANNELS.DECK_SET_ACTIVE_ID, async (_event, deckId: string) => {
    return savePersistedActiveDeckId(deckId);
  });

  ipcMain.handle(IPC_CHANNELS.DECK_LIST, async () => {
    const decks = getPersistedCustomDecks();
    return decks.map((d) => d.name);
  });

  ipcMain.handle(IPC_CHANNELS.DECK_SAVE, async (_event, _deckName, deckData) => {
    if (deckData && typeof deckData === 'object') {
      savePersistedCustomDeck(deckData as import('../../shared/types/deck.js').CustomDeck);
    }
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.DECK_DELETE, async (_event, deckName: string) => {
    const decks = getPersistedCustomDecks();
    const found = decks.find((d) => d.name === deckName || d.id === deckName);
    if (found) {
      return deletePersistedCustomDeck(found.id);
    }
    return false;
  });

  // Settings & Characters (Phase 6)
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    return getPersistedSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, settings) => {
    return savePersistedSettings(settings);
  });

  ipcMain.handle(IPC_CHANNELS.CHARACTERS_GET, async () => {
    return loadCharacters();
  });

  ipcMain.handle(IPC_CHANNELS.CHARACTERS_GET_BY_ID, async (_event, id: string) => {
    return getCharacterById(id) || null;
  });

  ipcMain.handle(IPC_CHANNELS.CHARACTERS_GET_RANDOM_DECK, async (_event, characterId: string) => {
    const result = getRandomDeckForCharacter(characterId);
    return result || null;
  });
}
