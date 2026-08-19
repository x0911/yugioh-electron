import { app, BrowserWindow, shell, protocol, net } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerIpcHandlers } from './ipc/index';
import { APP_CONFIG } from '../shared/constants/index';

// Register custom protocol for local game resources (cards, audio, videos, ui)
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app-resource',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true,
    },
  },
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const preloadPath = path.resolve(__dirname, '../preload/index.cjs');

  mainWindow = new BrowserWindow({
    title: APP_CONFIG.TITLE,
    width: APP_CONFIG.DEFAULT_WIDTH,
    height: APP_CONFIG.DEFAULT_HEIGHT,
    minWidth: APP_CONFIG.MIN_WIDTH,
    minHeight: APP_CONFIG.MIN_HEIGHT,
    backgroundColor: '#0a0c10',
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
  });

  // Show window once ready to prevent visual flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Security: deny new window popups / external links outside app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Security: block navigation away from the application
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (isDev && devServerUrl && url.startsWith(devServerUrl)) {
      return;
    }
    if (!url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  // Load URL or production build file
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.resolve(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Protocol handler for app-resource://
    protocol.handle('app-resource', async (request) => {
      try {
        const urlObj = new URL(request.url);
        const subPath = path.join(urlObj.hostname, decodeURIComponent(urlObj.pathname));
        const basePath = app.isPackaged
          ? path.join(process.resourcesPath, 'resources')
          : path.resolve(process.cwd(), 'resources');

        let targetPath = path.resolve(basePath, subPath);
        if (!fs.existsSync(targetPath)) {
          if (subPath.startsWith('cards/')) {
            const fallbackPath = path.resolve(basePath, 'cards/placeholder.jpg');
            if (fs.existsSync(fallbackPath)) {
              targetPath = fallbackPath;
            }
          }
        }

        if (fs.existsSync(targetPath)) {
          return net.fetch(pathToFileURL(targetPath).toString());
        }
      } catch (err) {
        console.error('[Protocol app-resource] Error loading resource:', request.url, err);
      }
      return new Response('Not Found', { status: 404 });
    });

    registerIpcHandlers();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
