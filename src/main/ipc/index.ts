import { ipcMain, app, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc.js';
import type { DuelInitOptions } from '../../shared/types/duel.js';
import { duelEngineService } from '../engine/DuelEngineService.js';
import type { OcgResponse } from 'ocgcore-wasm';

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

  ipcMain.handle(IPC_CHANNELS.DUEL_GET_CARD_NAME, async (_event, code: number) => {
    return duelEngineService.getCardName(code);
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_VIDEO_FINISHED, async () => {
    console.log('[Main IPC] Duel video finished notification received');
  });

  // Deck stubs (will be wired in Phase 7)
  ipcMain.handle(IPC_CHANNELS.DECK_LIST, async () => {
    return ['Sample Starter Deck (DM)', 'Sample Hero Deck (GX)'];
  });

  ipcMain.handle(IPC_CHANNELS.DECK_SAVE, async (_event, deckName) => {
    console.log('[Main IPC] Save deck (stub):', deckName);
    return true;
  });

  ipcMain.handle(IPC_CHANNELS.DECK_DELETE, async (_event, deckName) => {
    console.log('[Main IPC] Delete deck (stub):', deckName);
    return true;
  });

  // Settings stubs (will be wired to electron-store in Phase 6)
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    return {
      bgmVolume: 80,
      sfxVolume: 100,
      selectedOpponent: 'yugi',
      devMode: true,
    };
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, settings) => {
    console.log('[Main IPC] Save settings (stub):', settings);
    return true;
  });
}
