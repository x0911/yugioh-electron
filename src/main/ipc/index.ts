import { ipcMain, app } from 'electron';
import { IPC_CHANNELS } from '../../shared/types/ipc';

export function registerIpcHandlers(): void {
  // App
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => app.getVersion());
  ipcMain.handle(IPC_CHANNELS.APP_EXIT, () => {
    app.quit();
  });

  // Duel stubs (will be wired to DuelEngineService in Phase 2)
  ipcMain.handle(IPC_CHANNELS.DUEL_COMMAND, async (_event, command) => {
    console.log('[Main IPC] Duel command received (stub):', command);
  });

  ipcMain.handle(IPC_CHANNELS.DUEL_VIDEO_FINISHED, async () => {
    console.log('[Main IPC] Duel video finished notification received (stub)');
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
