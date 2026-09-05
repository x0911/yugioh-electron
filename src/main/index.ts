import { app, BrowserWindow, shell, protocol, net, session } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { Readable } from 'node:stream';
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

// Multi-instance / Guest testing flags
const isMultiInstance = process.env.YUGIOH_MULTI_INSTANCE === 'true' || process.argv.includes('--multi-instance');
const isGuest = process.env.YUGIOH_INSTANCE_ROLE === 'guest' || process.argv.includes('--guest');
const forceWindowed = process.env.WINDOWED === 'true' || process.argv.includes('--windowed') || isMultiInstance || isGuest;

if (isMultiInstance || isGuest) {
  const instanceId = process.env.YUGIOH_INSTANCE_NAME || (isGuest ? 'guest' : `dev-${process.pid}`);
  const baseUserData = app.getPath('userData');
  app.setPath('userData', `${baseUserData}-${instanceId}`);
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const preloadPath = path.resolve(__dirname, '../preload/index.cjs');

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'build/icon.png')
    : path.resolve(__dirname, '../../build/icon.png');

  const isWindowed = forceWindowed;

  mainWindow = new BrowserWindow({
    title: isGuest ? `${APP_CONFIG.TITLE} [Player 2 - Guest]` : APP_CONFIG.TITLE,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    width: isWindowed ? 1280 : APP_CONFIG.DEFAULT_WIDTH,
    height: isWindowed ? 720 : APP_CONFIG.DEFAULT_HEIGHT,
    x: isGuest ? 820 : undefined,
    y: isGuest ? 80 : undefined,
    minWidth: APP_CONFIG.MIN_WIDTH,
    minHeight: APP_CONFIG.MIN_HEIGHT,
    backgroundColor: '#0a0c10',
    fullscreen: !isWindowed,
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
  });

  // Toggle fullscreen with F11
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow?.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
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

  // Prevent modern mouse back/forward buttons from navigating browser history
  mainWindow.webContents.on('app-command', (event, command) => {
    if (command === 'browser-backward' || command === 'browser-forward') {
      event.preventDefault();
    }
  });

  // Load URL or production build file
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    if (!isGuest) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    mainWindow.loadFile(path.resolve(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock (bypassed if explicitly running multi-instance / guest instance for development testing)
const gotTheLock = (isMultiInstance || isGuest) ? true : app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

function getResourceMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp3' || ext === '.wav') {
    try {
      const fd = fs.openSync(filePath, 'r');
      const headerBuf = Buffer.alloc(4);
      fs.readSync(fd, headerBuf, 0, 4, 0);
      fs.closeSync(fd);
      if (headerBuf.toString('ascii') === 'RIFF') {
        return 'audio/wav';
      }
    } catch {
      // ignore
    }
    return ext === '.wav' ? 'audio/wav' : 'audio/mpeg';
  }

  switch (ext) {
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.ogg':
      return 'audio/ogg';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.json':
      return 'application/json';
    case '.woff2':
      return 'font/woff2';
    case '.woff':
      return 'font/woff';
    case '.ttf':
      return 'font/ttf';
    default:
      return 'application/octet-stream';
  }
}

  app.whenReady().then(() => {
    // Explicitly grant microphone media permission for WebRTC Voice Chat
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') {
        callback(true);
        return;
      }
      callback(false);
    });
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      if (permission === 'media') {
        return true;
      }
      return false;
    });

    // Protocol handler for app-resource:// with full HTTP 206 Range support for video/audio streaming
    protocol.handle('app-resource', async (request) => {
      try {
        const urlObj = new URL(request.url);
        const rawSubPath = path.join(urlObj.hostname, decodeURIComponent(urlObj.pathname));
        const cleanSubPath = rawSubPath.replace(/^resources[\/\\]/, '');
        const basePath = app.isPackaged
          ? path.join(process.resourcesPath, 'resources')
          : path.resolve(process.cwd(), 'resources');

        const patchDir = path.join(app.getPath('userData'), 'patch');
        const patchSubDir = path.join(patchDir, 'resources');

        let targetPath = path.resolve(patchSubDir, cleanSubPath);
        if (!fs.existsSync(targetPath)) {
          targetPath = path.resolve(patchDir, cleanSubPath);
        }
        if (!fs.existsSync(targetPath)) {
          targetPath = path.resolve(basePath, cleanSubPath);
        }
        if (!fs.existsSync(targetPath)) {
          targetPath = path.resolve(basePath, rawSubPath);
        }
        if (!fs.existsSync(targetPath)) {
          targetPath = path.resolve(process.cwd(), rawSubPath);
        }
        if (!fs.existsSync(targetPath)) {
          if (cleanSubPath.startsWith('cards/')) {
            const fallbackPath = path.resolve(basePath, 'cards/placeholder.jpg');
            if (fs.existsSync(fallbackPath)) {
              targetPath = fallbackPath;
            }
          } else if (cleanSubPath.endsWith('.mp3')) {
            const wavCandidate = path.resolve(basePath, cleanSubPath.replace(/\.mp3$/, '.wav'));
            if (fs.existsSync(wavCandidate)) {
              targetPath = wavCandidate;
            }
          } else if (cleanSubPath.endsWith('.wav')) {
            const mp3Candidate = path.resolve(basePath, cleanSubPath.replace(/\.wav$/, '.mp3'));
            if (fs.existsSync(mp3Candidate)) {
              targetPath = mp3Candidate;
            }
          }
        }

        if (request.method === 'OPTIONS') {
          return new Response(null, {
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            },
          });
        }

        if (fs.existsSync(targetPath)) {
          const stats = fs.statSync(targetPath);
          const fileSize = stats.size;
          const mimeType = getResourceMimeType(targetPath);
          const rangeHeader = request.headers.get('range');

          // Support partial content range requests for video and audio (vital for MP4 seeking/demuxing)
          if (rangeHeader && (mimeType.startsWith('video/') || mimeType.startsWith('audio/'))) {
            const matches = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (matches) {
              const start = parseInt(matches[1], 10);
              const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

              if (start >= fileSize || end >= fileSize || start > end) {
                return new Response(null, {
                  status: 416,
                  headers: {
                    'Content-Range': `bytes */${fileSize}`,
                    'Access-Control-Allow-Origin': '*',
                  },
                });
              }

              const chunkSize = end - start + 1;
              const fileStream = fs.createReadStream(targetPath, { start, end });
              const webStream = Readable.toWeb(fileStream);

              return new Response(webStream as any, {
                status: 206,
                headers: {
                  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': String(chunkSize),
                  'Content-Type': mimeType,
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                  'Access-Control-Allow-Headers': '*',
                },
              });
            }
          }

          // Full file stream with accurate MIME type, CORS and Accept-Ranges
          const fileStream = fs.createReadStream(targetPath);
          const webStream = Readable.toWeb(fileStream);
          return new Response(webStream as any, {
            status: 200,
            headers: {
              'Accept-Ranges': 'bytes',
              'Content-Length': String(fileSize),
              'Content-Type': mimeType,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            },
          });
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
