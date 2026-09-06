import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import * as tar from 'tar';
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

  public compareSemver(v1: string, v2: string): number {
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

  public getInstalledVersion(): { version: string; baseVersion: string; isPatched: boolean } {
    const baseVersion = app.getVersion();
    try {
      const patchFile = path.join(app.getPath('userData'), 'patch', 'version.json');
      if (fs.existsSync(patchFile)) {
        const patchData = JSON.parse(fs.readFileSync(patchFile, 'utf-8'));
        if (patchData && typeof patchData.version === 'string' && patchData.version.trim()) {
          const patchVer = patchData.version.trim();
          if (this.compareSemver(patchVer, baseVersion) > 0) {
            return { version: patchVer, baseVersion, isPatched: true };
          }
        }
      }
    } catch {
      // ignore
    }
    return { version: baseVersion, baseVersion, isPatched: false };
  }

  public async checkForUpdates(customManifestUrl?: string): Promise<UpdateCheckResult> {
    const installed = this.getInstalledVersion();
    const currentVersion = installed.version;

    const endpoint = customManifestUrl || 'https://api.github.com/repos/x0911/yugioh-electron/releases/latest';
    console.log(`[UpdateService] Checking for updates via ${endpoint}...`);

    try {
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'yugioh-electron-updater',
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API HTTP ${response.status}: ${response.statusText}`);
      }

      const release = await response.json();
      const targetVersion = (release.tag_name || '').replace(/^v/, '').trim();
      const updateAvailable = this.compareSemver(targetVersion, currentVersion) > 0;

      // Look for app-patch.tar.gz asset
      const patchAsset = release.assets?.find((a: any) => a.name === 'app-patch.tar.gz');
      // Look for full Windows setup installer asset
      const installerAsset = release.assets?.find((a: any) =>
        typeof a.name === 'string' &&
        a.name.endsWith('.exe') &&
        (a.name.includes('setup') || a.name.includes('installer'))
      ) || release.assets?.find((a: any) => typeof a.name === 'string' && a.name.endsWith('.exe'));

      const isPatchUpdate = Boolean(patchAsset);
      const patchDownloadUrl = patchAsset?.browser_download_url;
      const installerDownloadUrl = installerAsset?.browser_download_url;
      const totalDownloadSize = patchAsset ? patchAsset.size : (installerAsset?.size || 0);
      const fullInstallerSize = installerAsset?.size || 0;

      const result: UpdateCheckResult = {
        updateAvailable,
        currentVersion,
        targetVersion,
        releaseDate: release.published_at,
        releaseNotes: release.body || 'No release notes provided.',
        totalDownloadSize,
        fullInstallerSize,
        patchDownloadUrl,
        installerDownloadUrl,
        isPatchUpdate,
        changedFiles: [],
        hasPatchInstalled: installed.isPatched,
        installedPatchVersion: installed.isPatched ? installed.version : undefined,
      };

      this.cachedResult = result;
      return result;
    } catch (err: any) {
      console.warn('[UpdateService] Remote update check failed:', err);

      // In packaged mode, attempt electron-updater fallback if GitHub API call failed (e.g. rate limit)
      if (app.isPackaged && !customManifestUrl) {
        try {
          const updater = getAutoUpdater();
          if (updater) {
            console.log('[UpdateService] Attempting electron-updater fallback check...');
            const checkResult = await updater.checkForUpdates();
            if (checkResult && checkResult.updateInfo) {
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
                fullInstallerSize: totalDownloadSize,
                isPatchUpdate: false,
                changedFiles: [],
                hasPatchInstalled: installed.isPatched,
              };
              this.cachedResult = result;
              return result;
            }
          }
        } catch (fallbackErr) {
          console.error('[UpdateService] electron-updater fallback also failed:', fallbackErr);
        }
      }

      return {
        updateAvailable: false,
        currentVersion,
        targetVersion: currentVersion,
        totalDownloadSize: 0,
        changedFiles: [],
        hasPatchInstalled: installed.isPatched,
        error: err?.message || 'Failed to check releases',
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

    // 1. Hot Patch Download (~3.6 MB)
    if (this.cachedResult?.isPatchUpdate && this.cachedResult.patchDownloadUrl) {
      try {
        console.log('[UpdateService] Starting Fast Patch download from:', this.cachedResult.patchDownloadUrl);
        const patchUrl = this.cachedResult.patchDownloadUrl;
        const totalBytes = this.cachedResult.totalDownloadSize || 3600000;
        const userData = app.getPath('userData');
        const tempPatchFile = path.join(userData, 'temp-patch.tar.gz');
        const patchDir = path.join(userData, 'patch');

        onProgress?.({
          stage: 'downloading',
          totalFiles: 1,
          completedFiles: 0,
          currentFile: 'app-patch.tar.gz',
          downloadedBytes: 0,
          totalBytes,
          speedBytesPerSec: 0,
          percent: 0,
        });

        const response = await fetch(patchUrl, {
          headers: {
            'User-Agent': 'yugioh-electron-updater',
            'Accept': 'application/octet-stream',
          },
          redirect: 'follow',
        });

        if (!response.ok || !response.body) {
          throw new Error(`Failed to download patch: HTTP ${response.status} ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const fileStream = fs.createWriteStream(tempPatchFile);

        let downloadedBytes = 0;
        let lastTime = Date.now();
        let lastDownloaded = 0;
        let speedBytesPerSec = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            fileStream.write(Buffer.from(value));
            downloadedBytes += value.length;

            const now = Date.now();
            const elapsed = (now - lastTime) / 1000;
            if (elapsed >= 0.2) {
              speedBytesPerSec = Math.round((downloadedBytes - lastDownloaded) / elapsed);
              lastTime = now;
              lastDownloaded = downloadedBytes;

              const percent = totalBytes > 0
                ? Math.min(99, Math.round((downloadedBytes / totalBytes) * 100))
                : 50;

              onProgress?.({
                stage: 'downloading',
                totalFiles: 1,
                completedFiles: 0,
                currentFile: 'app-patch.tar.gz',
                downloadedBytes,
                totalBytes,
                speedBytesPerSec,
                percent,
              });
            }
          }
        }

        await new Promise<void>((resolve, reject) => {
          fileStream.end((err) => (err ? reject(err) : resolve()));
        });

        // Verification & Extraction stage
        onProgress?.({
          stage: 'verifying',
          totalFiles: 1,
          completedFiles: 0,
          currentFile: 'Extracting and installing fast patch package...',
          downloadedBytes: totalBytes,
          totalBytes,
          speedBytesPerSec: 0,
          percent: 100,
        });

        fs.mkdirSync(patchDir, { recursive: true });
        await tar.x({
          file: tempPatchFile,
          cwd: patchDir,
        });

        // Cleanup temp file
        if (fs.existsSync(tempPatchFile)) {
          fs.rmSync(tempPatchFile, { force: true });
        }

        // Save patch version metadata
        const metaFile = path.join(patchDir, 'version.json');
        fs.writeFileSync(
          metaFile,
          JSON.stringify(
            {
              version: this.cachedResult.targetVersion,
              baseVersion: app.getVersion(),
              installedAt: new Date().toISOString(),
            },
            null,
            2,
          ),
          'utf-8',
        );

        this.isDownloading = false;
        this.isDownloaded = true;

        onProgress?.({
          stage: 'ready',
          totalFiles: 1,
          completedFiles: 1,
          currentFile: 'Fast patch applied successfully! Restart required.',
          downloadedBytes: totalBytes,
          totalBytes,
          speedBytesPerSec: 0,
          percent: 100,
        });

        return true;
      } catch (err: any) {
        this.isDownloading = false;
        console.error('[UpdateService] Patch download/extraction error:', err);
        onProgress?.({
          stage: 'error',
          totalFiles: 1,
          completedFiles: 0,
          currentFile: '',
          downloadedBytes: 0,
          totalBytes: 0,
          speedBytesPerSec: 0,
          percent: 0,
          error: err?.message || 'Patch installation failed',
        });
        throw err;
      }
    }

    // 2. Dev mode simulation if no patch URL or offline
    if (!app.isPackaged || process.env.NODE_ENV === 'development') {
      console.log('[UpdateService] Simulating update download in development mode...');
      const totalBytes = this.cachedResult?.totalDownloadSize || 3600000;
      for (let i = 1; i <= 10; i++) {
        await new Promise((r) => setTimeout(r, 200));
        const transferred = Math.round((totalBytes * i) / 10);
        onProgress?.({
          stage: 'downloading',
          totalFiles: 1,
          completedFiles: 0,
          currentFile: this.cachedResult?.isPatchUpdate ? 'app-patch.tar.gz' : `yugioh-electron-setup-${this.cachedResult?.targetVersion || 'update'}.exe`,
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

    // 3. Fallback to electron-updater (full installer / differentialPackage NSIS blockmap)
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
    if (this.cachedResult?.isPatchUpdate && this.isDownloaded) {
      console.log('[UpdateService] Hot patch applied. Relaunching application...');
      app.relaunch();
      app.exit(0);
      return;
    }

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
    const patchDir = path.join(app.getPath('userData'), 'patch');
    if (fs.existsSync(patchDir)) {
      try {
        fs.rmSync(patchDir, { recursive: true, force: true });
        console.log('[UpdateService] Successfully removed patch directory.');
      } catch (e) {
        console.warn('[UpdateService] Failed to clean patch directory:', e);
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
    const installed = this.getInstalledVersion();
    return {
      updateAvailable: false,
      currentVersion: installed.version,
      targetVersion: installed.version,
      totalDownloadSize: 0,
      changedFiles: [],
      hasPatchInstalled: installed.isPatched,
      installedPatchVersion: installed.isPatched ? installed.version : undefined,
    };
  }
}

export const updateService = new UpdateService();
