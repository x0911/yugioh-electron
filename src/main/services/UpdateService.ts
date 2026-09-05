import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import electronUpdaterPkg from 'electron-updater';
import type {
  UpdateCheckResult,
  UpdateProgressPayload,
} from '../../shared/types/ipc.js';

let _autoUpdater: typeof electronUpdaterPkg.autoUpdater | null = null;

function getAutoUpdater() {
  if (!_autoUpdater) {
    try {
      const pkg = (electronUpdaterPkg as any)?.default || electronUpdaterPkg;
      _autoUpdater = pkg.autoUpdater || pkg;
      if (_autoUpdater) {
        _autoUpdater.autoDownload = false;
        _autoUpdater.autoInstallOnAppQuit = true;
        _autoUpdater.allowDowngrade = false;
        if ('verifyUpdateCodeSignature' in _autoUpdater) {
          (_autoUpdater as any).verifyUpdateCodeSignature = false;
        }
      }
    } catch (err) {
      console.warn('[UpdateService] Failed to initialize electron-updater:', err);
    }
  }
  return _autoUpdater;
}

export class UpdateService {
  private cachedResult: UpdateCheckResult | null = null;
  private isDownloading = false;
  private isDownloaded = false;

  private compareSemver(v1: string, v2: string): number {
    const p1 = v1.replace(/^v/, '').split('.').map((x) => parseInt(x, 10) || 0);
    const p2 = v2.replace(/^v/, '').split('.').map((x) => parseInt(x, 10) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  public getInstalledVersion(): { version: string; isPatched: boolean } {
    return { version: app.getVersion(), isPatched: false };
  }

  public async checkForUpdates(): Promise<UpdateCheckResult> {
    const currentVersion = app.getVersion();

    // 1. In Development or Unpackaged Mode:
    // Query GitHub Releases API directly so dev/test builds show real latest GitHub release info
    if (!app.isPackaged || process.env.NODE_ENV === 'development') {
      console.log('[UpdateService] App is unpackaged (Dev Mode). Querying GitHub Releases API...');
      try {
        const response = await fetch(
          'https://api.github.com/repos/x0911/yugioh-electron/releases/latest',
          {
            headers: {
              'User-Agent': 'yugioh-electron-updater',
              'Accept': 'application/vnd.github.v3+json',
            },
          },
        );

        if (!response.ok) {
          throw new Error(`GitHub API HTTP ${response.status}: ${response.statusText}`);
        }

        const release = await response.json();
        const targetVersion = (release.tag_name || '').replace(/^v/, '');
        const updateAvailable = this.compareSemver(targetVersion, currentVersion) > 0;
        const totalDownloadSize = release.assets?.[0]?.size || 0;

        const result: UpdateCheckResult = {
          updateAvailable,
          currentVersion,
          targetVersion,
          releaseDate: release.published_at,
          releaseNotes: release.body || 'No release notes provided.',
          totalDownloadSize,
          changedFiles: [],
          hasPatchInstalled: false,
        };
        this.cachedResult = result;
        return result;
      } catch (err: any) {
        console.warn('[UpdateService] Dev mode GitHub check failed:', err);
        return {
          updateAvailable: false,
          currentVersion,
          targetVersion: currentVersion,
          totalDownloadSize: 0,
          changedFiles: [],
          hasPatchInstalled: false,
          error: err?.message || 'Failed to check GitHub releases',
        };
      }
    }

    // 2. In Packaged Mode (Production):
    // Use official electron-updater
    try {
      const updater = getAutoUpdater();
      if (!updater) throw new Error('autoUpdater failed to initialize');

      console.log('[UpdateService] Checking for updates via electron-updater...');
      const checkResult = await updater.checkForUpdates();
      if (!checkResult || !checkResult.updateInfo) {
        return {
          updateAvailable: false,
          currentVersion,
          targetVersion: currentVersion,
          totalDownloadSize: 0,
          changedFiles: [],
          hasPatchInstalled: false,
        };
      }

      const info = checkResult.updateInfo;
      const targetVersion = info.version;
      const updateAvailable = this.compareSemver(targetVersion, currentVersion) > 0;
      const releaseNotes = Array.isArray(info.releaseNotes)
        ? info.releaseNotes.map((n) => (typeof n === 'string' ? n : n.note)).join('\n')
        : String(info.releaseNotes || '');

      const totalDownloadSize = info.files?.[0]?.size || 0;

      const result: UpdateCheckResult = {
        updateAvailable,
        currentVersion,
        targetVersion,
        releaseDate: info.releaseDate,
        releaseNotes,
        totalDownloadSize,
        changedFiles: [],
        hasPatchInstalled: false,
      };
      this.cachedResult = result;
      return result;
    } catch (err: any) {
      console.error('[UpdateService] electron-updater checkForUpdates failed:', err);
      return {
        updateAvailable: false,
        currentVersion,
        targetVersion: currentVersion,
        totalDownloadSize: 0,
        changedFiles: [],
        hasPatchInstalled: false,
        error: err?.message || 'Update check failed',
      };
    }
  }

  public async downloadUpdate(
    onProgress?: (progress: UpdateProgressPayload) => void,
  ): Promise<boolean> {
    if (this.isDownloading) {
      throw new Error('A download is already in progress.');
    }

    this.isDownloading = true;

    // In dev mode (unpackaged):
    if (!app.isPackaged || process.env.NODE_ENV === 'development') {
      console.log('[UpdateService] Simulating update download in development mode...');
      const totalBytes = this.cachedResult?.totalDownloadSize || 50000000;
      for (let i = 1; i <= 10; i++) {
        await new Promise((r) => setTimeout(r, 200));
        const transferred = Math.round((totalBytes * i) / 10);
        onProgress?.({
          stage: 'downloading',
          totalFiles: 1,
          completedFiles: 0,
          currentFile: `yugioh-electron-setup-${this.cachedResult?.targetVersion || 'update'}.exe`,
          downloadedBytes: transferred,
          totalBytes,
          speedBytesPerSec: 5242880,
          percent: i * 10,
        });
      }
      onProgress?.({
        stage: 'ready',
        totalFiles: 1,
        completedFiles: 1,
        currentFile: 'Update ready to install',
        downloadedBytes: totalBytes,
        totalBytes,
        speedBytesPerSec: 0,
        percent: 100,
      });
      this.isDownloading = false;
      this.isDownloaded = true;
      return true;
    }

    // In production mode:
    const updater = getAutoUpdater();
    if (!updater) {
      this.isDownloading = false;
      throw new Error('autoUpdater unavailable');
    }

    return new Promise<boolean>((resolve, reject) => {
      const progressListener = (progressObj: any) => {
        onProgress?.({
          stage: 'downloading',
          totalFiles: 1,
          completedFiles: 0,
          currentFile: `Downloading Update (${Math.round(progressObj.percent)}%)...`,
          downloadedBytes: progressObj.transferred,
          totalBytes: progressObj.total,
          speedBytesPerSec: progressObj.bytesPerSecond || 0,
          percent: Math.round(progressObj.percent),
        });
      };

      const downloadedListener = () => {
        this.isDownloading = false;
        this.isDownloaded = true;
        onProgress?.({
          stage: 'ready',
          totalFiles: 1,
          completedFiles: 1,
          currentFile: 'Update ready to install',
          downloadedBytes: 100,
          totalBytes: 100,
          speedBytesPerSec: 0,
          percent: 100,
        });
        cleanup();
        resolve(true);
      };

      const errorListener = (err: any) => {
        this.isDownloading = false;
        console.error('[UpdateService] Download error:', err);
        onProgress?.({
          stage: 'error',
          totalFiles: 1,
          completedFiles: 0,
          currentFile: '',
          downloadedBytes: 0,
          totalBytes: 0,
          speedBytesPerSec: 0,
          percent: 0,
          error: err?.message || 'Download failed',
        });
        cleanup();
        reject(err);
      };

      const cleanup = () => {
        updater.removeListener('download-progress', progressListener);
        updater.removeListener('update-downloaded', downloadedListener);
        updater.removeListener('error', errorListener);
      };

      updater.on('download-progress', progressListener);
      updater.on('update-downloaded', downloadedListener);
      updater.on('error', errorListener);

      updater.downloadUpdate().catch((err) => {
        cleanup();
        this.isDownloading = false;
        reject(err);
      });
    });
  }

  public async applyUpdate(): Promise<void> {
    console.log('[UpdateService] Applying update and relaunching...');
    if (!app.isPackaged || process.env.NODE_ENV === 'development') {
      console.log('[UpdateService] Dev mode: relaunching application...');
      app.relaunch();
      app.exit(0);
      return;
    }

    const updater = getAutoUpdater();
    if (!updater) {
      app.relaunch();
      app.exit(0);
      return;
    }

    // quitAndInstall(isSilent, isForceRunAfter)
    updater.quitAndInstall(false, true);
  }

  public async rollback(): Promise<boolean> {
    // Remove legacy patch directory if one was left from older versions
    const patchDir = path.join(app.getPath('userData'), 'patch');
    if (fs.existsSync(patchDir)) {
      try {
        fs.rmSync(patchDir, { recursive: true, force: true });
        console.log('[UpdateService] Cleaned legacy patch directory.');
      } catch (e) {
        console.warn('[UpdateService] Failed to clean legacy patch directory:', e);
      }
    }
    app.relaunch();
    app.exit(0);
    return true;
  }

  public async getStatus(): Promise<UpdateCheckResult> {
    if (this.cachedResult) {
      return this.cachedResult;
    }
    const currentVersion = app.getVersion();
    return {
      updateAvailable: false,
      currentVersion,
      targetVersion: currentVersion,
      totalDownloadSize: 0,
      changedFiles: [],
      hasPatchInstalled: false,
    };
  }
}

export const updateService = new UpdateService();
