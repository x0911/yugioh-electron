import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getResourcePath } from '../decks/deckLoader.js';
import type {
  UpdateCheckResult,
  UpdateFileDelta,
  UpdateProgressPayload,
} from '../../shared/types/ipc.js';

interface ManifestFileEntry {
  path: string;
  size: number;
  sha256: string;
}

interface UpdateManifest {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  remoteBaseUrl: string;
  files: Record<string, ManifestFileEntry>;
}

export class UpdateService {
  private defaultManifestUrl =
    'https://raw.githubusercontent.com/x0911/yugioh-electron/main/data/update-manifest.json';
  private latestManifest: UpdateManifest | null = null;
  private pendingDeltas: UpdateFileDelta[] = [];
  private isDownloading = false;

  public getPatchDir(): string {
    const patchDir = path.join(app.getPath('userData'), 'patch');
    if (!fs.existsSync(patchDir)) {
      fs.mkdirSync(patchDir, { recursive: true });
    }
    return patchDir;
  }

  public getStagingDir(): string {
    const stagingDir = path.join(app.getPath('userData'), 'staging_update');
    if (!fs.existsSync(stagingDir)) {
      fs.mkdirSync(stagingDir, { recursive: true });
    }
    return stagingDir;
  }

  public getInstalledVersion(): { version: string; isPatched: boolean } {
    const patchVersionFile = path.join(this.getPatchDir(), 'installed-version.json');
    if (fs.existsSync(patchVersionFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(patchVersionFile, 'utf-8'));
        return { version: data.version || app.getVersion(), isPatched: true };
      } catch {
        // ignore
      }
    }
    return { version: app.getVersion(), isPatched: false };
  }

  private computeFileSha256(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';
    const buf = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buf).digest('hex');
  }

  private resolveActiveLocalFilePath(relPath: string): string | null {
    // 1. Check patch directory overlay first
    const patchPath = path.join(this.getPatchDir(), relPath);
    if (fs.existsSync(patchPath)) {
      return patchPath;
    }

    // 2. Check engine resource path
    const resPath = getResourcePath(relPath);
    if (fs.existsSync(resPath)) {
      return resPath;
    }

    // 3. Check CWD fallback
    const cwdPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(cwdPath)) {
      return cwdPath;
    }

    return null;
  }

  public async checkForUpdates(customManifestUrl?: string): Promise<UpdateCheckResult> {
    const targetUrl = customManifestUrl || this.defaultManifestUrl;
    const { version: currentVersion, isPatched } = this.getInstalledVersion();

    try {
      console.log(`[UpdateService] Checking for updates from: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: HTTP ${response.status} ${response.statusText}`);
      }

      const manifest: UpdateManifest = await response.json();
      this.latestManifest = manifest;

      const changedFiles: UpdateFileDelta[] = [];
      let totalDownloadSize = 0;

      for (const [relPath, fileEntry] of Object.entries(manifest.files)) {
        const localPath = this.resolveActiveLocalFilePath(relPath);

        if (!localPath) {
          // Missing file on disk
          changedFiles.push({
            path: relPath,
            size: fileEntry.size,
            sha256: fileEntry.sha256,
            status: 'new',
          });
          totalDownloadSize += fileEntry.size;
        } else {
          const localHash = this.computeFileSha256(localPath);
          if (localHash !== fileEntry.sha256) {
            changedFiles.push({
              path: relPath,
              size: fileEntry.size,
              sha256: fileEntry.sha256,
              status: 'modified',
            });
            totalDownloadSize += fileEntry.size;
          }
        }
      }

      this.pendingDeltas = changedFiles;
      const updateAvailable = changedFiles.length > 0;

      return {
        updateAvailable,
        currentVersion,
        targetVersion: manifest.version,
        releaseDate: manifest.releaseDate,
        releaseNotes: manifest.releaseNotes,
        totalDownloadSize,
        changedFiles,
        hasPatchInstalled: isPatched,
        installedPatchVersion: isPatched ? currentVersion : undefined,
      };
    } catch (err: any) {
      console.error('[UpdateService] Update check failed:', err);
      return {
        updateAvailable: false,
        currentVersion,
        targetVersion: currentVersion,
        totalDownloadSize: 0,
        changedFiles: [],
        hasPatchInstalled: isPatched,
        error: err?.message || 'Failed to check for updates',
      };
    }
  }

  public async downloadUpdate(
    onProgress?: (progress: UpdateProgressPayload) => void,
  ): Promise<boolean> {
    if (this.isDownloading) {
      throw new Error('A download is already in progress');
    }
    if (!this.latestManifest || this.pendingDeltas.length === 0) {
      throw new Error('No pending update found. Check for updates first.');
    }

    this.isDownloading = true;
    const stagingDir = this.getStagingDir();
    const manifest = this.latestManifest;
    const totalFiles = this.pendingDeltas.length;
    const totalBytes = this.pendingDeltas.reduce((acc, f) => acc + f.size, 0);
    let downloadedBytes = 0;
    let completedFiles = 0;
    const startTime = Date.now();

    try {
      for (const delta of this.pendingDeltas) {
        const fileUrl = `${manifest.remoteBaseUrl}/${delta.path}`;
        const stagingFilePath = path.join(stagingDir, delta.path);
        const stagingFileDir = path.dirname(stagingFilePath);

        if (!fs.existsSync(stagingFileDir)) {
          fs.mkdirSync(stagingFileDir, { recursive: true });
        }

        const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
        const speedBytesPerSec = Math.round(downloadedBytes / elapsedSec);

        onProgress?.({
          stage: 'downloading',
          totalFiles,
          completedFiles,
          currentFile: delta.path,
          downloadedBytes,
          totalBytes,
          speedBytesPerSec,
          percent: Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)),
        });

        // Download file
        const res = await fetch(fileUrl);
        if (!res.ok) {
          throw new Error(`Failed to download file ${delta.path}: HTTP ${res.status}`);
        }
        const arrayBuf = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuf);

        // Verify SHA-256
        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        if (hash !== delta.sha256) {
          throw new Error(`Checksum mismatch for ${delta.path}: expected ${delta.sha256}, got ${hash}`);
        }

        fs.writeFileSync(stagingFilePath, buf);
        downloadedBytes += buf.byteLength;
        completedFiles++;
      }

      onProgress?.({
        stage: 'ready',
        totalFiles,
        completedFiles,
        currentFile: '',
        downloadedBytes: totalBytes,
        totalBytes,
        speedBytesPerSec: 0,
        percent: 100,
      });

      this.isDownloading = false;
      return true;
    } catch (err: any) {
      this.isDownloading = false;
      console.error('[UpdateService] Download failed:', err);
      onProgress?.({
        stage: 'error',
        totalFiles,
        completedFiles,
        currentFile: '',
        downloadedBytes,
        totalBytes,
        speedBytesPerSec: 0,
        percent: 0,
        error: err?.message || 'Download failed',
      });
      throw err;
    }
  }

  public async applyUpdate(): Promise<void> {
    const stagingDir = this.getStagingDir();
    const patchDir = this.getPatchDir();

    if (!fs.existsSync(stagingDir) || this.pendingDeltas.length === 0) {
      throw new Error('No verified update in staging directory.');
    }

    console.log('[UpdateService] Applying update files to patch overlay directory...');

    for (const delta of this.pendingDeltas) {
      const srcPath = path.join(stagingDir, delta.path);
      const destPath = path.join(patchDir, delta.path);
      const destDir = path.dirname(destPath);

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Write installed-version.json
    if (this.latestManifest) {
      const versionFile = path.join(patchDir, 'installed-version.json');
      fs.writeFileSync(
        versionFile,
        JSON.stringify(
          {
            version: this.latestManifest.version,
            installedAt: new Date().toISOString(),
            filesCount: this.pendingDeltas.length,
          },
          null,
          2,
        ),
        'utf-8',
      );
    }

    // Clean up staging
    fs.rmSync(stagingDir, { recursive: true, force: true });
    this.pendingDeltas = [];

    console.log('[UpdateService] Update successfully applied. Relaunching application...');
    app.relaunch();
    app.exit(0);
  }

  public async rollback(): Promise<boolean> {
    const patchDir = this.getPatchDir();
    console.log('[UpdateService] Rolling back all user patch overlays...');

    if (fs.existsSync(patchDir)) {
      fs.rmSync(patchDir, { recursive: true, force: true });
    }

    this.pendingDeltas = [];
    app.relaunch();
    app.exit(0);
    return true;
  }

  public async getStatus(): Promise<UpdateCheckResult> {
    const { version: currentVersion, isPatched } = this.getInstalledVersion();
    return {
      updateAvailable: this.pendingDeltas.length > 0,
      currentVersion,
      targetVersion: this.latestManifest?.version || currentVersion,
      totalDownloadSize: this.pendingDeltas.reduce((acc, f) => acc + f.size, 0),
      changedFiles: this.pendingDeltas,
      hasPatchInstalled: isPatched,
      installedPatchVersion: isPatched ? currentVersion : undefined,
    };
  }
}

export const updateService = new UpdateService();
