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

  // Forward special summon/attack video trigger events to renderer process
  duelEngineService.onPlayVideo((payload) => {
    const wins = BrowserWindow.getAllWindows();
    for (const win of wins) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.DUEL_PLAY_VIDEO, payload);
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
  ipcMain.handle(IPC_CHANNELS.APP_LAUNCH_GUEST, async () => {
    try {
      const { spawn } = await import('node:child_process');
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
      const electronBin = process.execPath;
      const appPath = app.getAppPath();
      const args = isDev
        ? [appPath, '--guest', '--multi-instance', '--windowed']
        : ['--guest', '--multi-instance', '--windowed'];

      const child = spawn(electronBin, args, {
        cwd: appPath,
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          NODE_ENV: isDev ? 'development' : 'production',
          VITE_DEV_SERVER_URL: devServerUrl,
          YUGIOH_MULTI_INSTANCE: 'true',
          YUGIOH_INSTANCE_ROLE: 'guest',
          WINDOWED: 'true',
        },
      });
      child.unref();
      return true;
    } catch (err) {
      console.error('[Main IPC] Failed to launch guest window:', err);
      return false;
    }
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
    duelEngineService.onVideoFinished();
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_GET_REVIEW, async (_event, logMarkdown: string, opponentName?: string) => {
    const { duelReviewer } = await import('../ai/reviewer/DuelReviewerService.js');
    const board = duelEngineService.getBoardState();
    return duelReviewer.reviewDuel(logMarkdown, board, 1, opponentName || 'Opponent');
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_GET_TACTICAL_MEMORY, async () => {
    const { tacticalMemory } = await import('../ai/reviewer/tacticalMemory.js');
    return tacticalMemory.getMemory();
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

  // AI Connection Test & Model Fetching
  ipcMain.handle(IPC_CHANNELS.AI_TEST_CONNECTION, async (_event, payload: import('../../shared/types/ipc.js').AiTestConnectionPayload) => {
    const { llmDuelService } = await import('../ai/LLMDuelService.js');
    return llmDuelService.testConnection(payload.provider, payload.apiKey, payload.customEndpoint, payload.model);
  });

  ipcMain.handle(IPC_CHANNELS.AI_FETCH_MODELS, async (_event, payload: import('../../shared/types/ipc.js').AiFetchModelsPayload) => {
    const { llmDuelService } = await import('../ai/LLMDuelService.js');
    return llmDuelService.fetchAvailableModels(payload.provider, payload.apiKey, payload.customEndpoint);
  });

  // Smart Delta Update handlers (Phase 16)
  ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, async (_event, customUrl?: string) => {
    const { updateService } = await import('../services/UpdateService.js');
    return updateService.checkForUpdates(customUrl);
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_DOWNLOAD, async () => {
    const { updateService } = await import('../services/UpdateService.js');
    return updateService.downloadUpdate((progress) => {
      const wins = BrowserWindow.getAllWindows();
      for (const win of wins) {
        if (!win.isDestroyed()) {
          win.webContents.send(IPC_CHANNELS.UPDATE_PROGRESS, progress);
        }
      }
    });
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_APPLY, async () => {
    const { updateService } = await import('../services/UpdateService.js');
    return updateService.applyUpdate();
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_ROLLBACK, async () => {
    const { updateService } = await import('../services/UpdateService.js');
    return updateService.rollback();
  });

  ipcMain.handle(IPC_CHANNELS.UPDATE_GET_STATUS, async () => {
    const { updateService } = await import('../services/UpdateService.js');
    return updateService.getStatus();
  });
}

