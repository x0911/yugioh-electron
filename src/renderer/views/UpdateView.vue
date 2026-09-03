<template>
  <div class="page-update">
    <!-- Atmospheric Background & Vignette -->
    <div class="update-backdrop" :style="{ backgroundImage: `url(${getBackgroundUrl('settings-bg')})` }"></div>
    <div class="update-vignette"></div>

    <!-- Main Container -->
    <div class="update-container">
      <!-- Header Banner -->
      <header class="update-header">
        <div class="update-header__title-group">
          <div class="update-header__badge">
            <span class="badge-icon">⚡</span>
            <span class="badge-text">SMART DELTA PATCHER</span>
          </div>
          <h1 class="update-header__title">Game Version & Updates</h1>
          <p class="update-header__subtitle">
            Synchronize your local Duel Arena rules, Lua scripts, card database, and 526 decks with GitHub.
          </p>
        </div>

        <div class="update-header__actions">
          <button
            v-if="status?.hasPatchInstalled"
            type="button"
            class="action-btn action-btn--danger"
            title="Remove all downloaded patch overlays and revert to base installation"
            :disabled="isBusy"
            @click="onRollback"
          >
            ↩️ Rollback to Base
          </button>
          <button
            type="button"
            class="action-btn action-btn--secondary"
            @click="router.push('/main-menu')"
          >
            🏠 Main Menu
          </button>
        </div>
      </header>

      <!-- Status Hero Card -->
      <section class="update-hero-card">
        <div class="version-display">
          <div class="version-block">
            <span class="version-label">CURRENT CLIENT</span>
            <div class="version-value">
              <span class="version-num">v{{ currentVersion }}</span>
              <span v-if="status?.hasPatchInstalled" class="patched-tag">PATCH ACTIVE</span>
            </div>
          </div>

          <div class="version-arrow">➜</div>

          <div class="version-block">
            <span class="version-label">LATEST ON GITHUB</span>
            <div class="version-value">
              <span class="version-num" :class="{ 'version-num--highlight': status?.updateAvailable }">
                {{ targetVersion ? `v${targetVersion}` : 'Checking...' }}
              </span>
              <span v-if="status?.updateAvailable" class="new-tag">NEW UPDATE</span>
            </div>
          </div>
        </div>

        <!-- Dynamic Status Message & Action -->
        <div class="status-box" :class="`status-box--${currentStage}`">
          <div class="status-box__icon">
            <span v-if="currentStage === 'checking'">🔄</span>
            <span v-else-if="currentStage === 'downloading'">⬇️</span>
            <span v-else-if="currentStage === 'ready'">🎉</span>
            <span v-else-if="currentStage === 'error'">⚠️</span>
            <span v-else-if="status?.updateAvailable">⚡</span>
            <span v-else>✨</span>
          </div>

          <div class="status-box__text">
            <h3 class="status-title">{{ statusTitle }}</h3>
            <p class="status-desc">{{ statusDescription }}</p>
          </div>

          <div class="status-box__cta">
            <button
              v-if="currentStage === 'ready'"
              type="button"
              class="primary-btn primary-btn--glow"
              @click="onApplyRestart"
            >
              🔄 Restart & Apply Update
            </button>
            <button
              v-else-if="status?.updateAvailable && currentStage !== 'downloading'"
              type="button"
              class="primary-btn"
              :disabled="isBusy"
              @click="onDownload"
            >
              ⬇️ Download Update ({{ formatBytes(status.totalDownloadSize) }})
            </button>
            <button
              v-else
              type="button"
              class="action-btn action-btn--accent"
              :disabled="isBusy"
              @click="onCheckUpdates"
            >
              <span v-if="currentStage === 'checking'">Checking...</span>
              <span v-else>🔍 Check for Updates</span>
            </button>
          </div>
        </div>

        <!-- Download Progress Bar (When Downloading) -->
        <div v-if="currentStage === 'downloading' || currentStage === 'ready'" class="progress-section">
          <div class="progress-info">
            <span class="progress-file">
              {{ progress?.currentFile ? `Downloading: ${progress.currentFile}` : 'Finalizing & Verifying SHA-256...' }}
            </span>
            <span class="progress-stats">
              {{ formatBytes(progress?.downloadedBytes || 0) }} / {{ formatBytes(progress?.totalBytes || 0) }}
              ({{ progress?.percent || 0 }}%)
              <span v-if="progress?.speedBytesPerSec" class="progress-speed">
                • {{ formatBytes(progress.speedBytesPerSec) }}/s
              </span>
            </span>
          </div>

          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{ width: `${progress?.percent || 0}%` }"
              :class="{ 'progress-bar-fill--complete': currentStage === 'ready' }"
            />
          </div>
        </div>
      </section>

      <!-- Delta Files & Release Notes Split Grid -->
      <div class="update-grid">
        <!-- Release Notes Column -->
        <section class="update-panel">
          <div class="panel-header">
            <span class="panel-icon">📝</span>
            <h2 class="panel-title">Release Notes & Changelog</h2>
          </div>

          <div class="panel-body">
            <div v-if="status?.releaseNotes" class="release-notes-content">
              <pre>{{ status.releaseNotes }}</pre>
            </div>
            <div v-else class="empty-placeholder">
              <span class="empty-icon">📜</span>
              <p>Check for updates to view latest patch notes and changes.</p>
            </div>
          </div>
        </section>

        <!-- Changed Files Delta Column -->
        <section class="update-panel">
          <div class="panel-header">
            <span class="panel-icon">📦</span>
            <h2 class="panel-title">
              File Deltas
              <span v-if="status?.changedFiles?.length" class="counter-badge">
                {{ status.changedFiles.length }}
              </span>
            </h2>
          </div>

          <div class="panel-body">
            <div v-if="status?.changedFiles && status.changedFiles.length > 0" class="deltas-list">
              <div
                v-for="file in status.changedFiles"
                :key="file.path"
                class="delta-item"
              >
                <span class="delta-badge" :class="`delta-badge--${file.status}`">
                  {{ file.status.toUpperCase() }}
                </span>
                <span class="delta-path" :title="file.path">{{ file.path }}</span>
                <span class="delta-size">{{ formatBytes(file.size) }}</span>
              </div>
            </div>
            <div v-else class="empty-placeholder">
              <span class="empty-icon">🛡️</span>
              <p>No modified or missing files detected. Everything is synchronized.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBackgroundUrl } from '../utils/media.js';
import type {
  UpdateCheckResult,
  UpdateProgressPayload,
} from '../../shared/types/ipc.js';

const router = useRouter();

const status = ref<UpdateCheckResult | null>(null);
const progress = ref<UpdateProgressPayload | null>(null);
const currentStage = ref<'idle' | 'checking' | 'downloading' | 'ready' | 'error'>('idle');
const errorMessage = ref<string | null>(null);
let unsubscribeProgress: (() => void) | null = null;

const currentVersion = computed(() => status.value?.currentVersion || '0.1.0');
const targetVersion = computed(() => status.value?.targetVersion || '');

const isBusy = computed(() => currentStage.value === 'checking' || currentStage.value === 'downloading');

const statusTitle = computed(() => {
  if (currentStage.value === 'checking') return 'Checking for updates...';
  if (currentStage.value === 'downloading') return 'Downloading patch files...';
  if (currentStage.value === 'ready') return 'Update Ready to Install!';
  if (currentStage.value === 'error') return 'Update Check Failed';
  if (status.value?.updateAvailable) return `Update Available (${status.value.changedFiles.length} files)`;
  return 'Your Game is Up to Date!';
});

const statusDescription = computed(() => {
  if (currentStage.value === 'checking') return 'Querying GitHub manifest and verifying local cryptographic hashes...';
  if (currentStage.value === 'downloading') return 'Streaming updated card definitions, decks, and engine code...';
  if (currentStage.value === 'ready') return 'All files have been verified with SHA-256 checksums. Restart the game to activate.';
  if (currentStage.value === 'error') return errorMessage.value || status.value?.error || 'An unexpected error occurred.';
  if (status.value?.updateAvailable) {
    return `A delta patch of ${formatBytes(status.value.totalDownloadSize)} is ready to download (instead of full 1.2GB installer).`;
  }
  return 'All card scripts, 526 prebuilt decks, and game mechanics match the latest GitHub build.';
});

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function onCheckUpdates(): Promise<void> {
  if (!window.updateAPI) return;
  currentStage.value = 'checking';
  errorMessage.value = null;

  try {
    const res = await window.updateAPI.checkForUpdates();
    status.value = res;
    if (res.error) {
      currentStage.value = 'error';
      errorMessage.value = res.error;
    } else {
      currentStage.value = res.updateAvailable ? 'idle' : 'idle';
    }
  } catch (err: any) {
    currentStage.value = 'error';
    errorMessage.value = err?.message || 'Failed to check updates';
  }
}

async function onDownload(): Promise<void> {
  if (!window.updateAPI) return;
  currentStage.value = 'downloading';
  errorMessage.value = null;

  try {
    await window.updateAPI.downloadUpdate();
    currentStage.value = 'ready';
  } catch (err: any) {
    currentStage.value = 'error';
    errorMessage.value = err?.message || 'Download failed';
  }
}

async function onApplyRestart(): Promise<void> {
  if (!window.updateAPI) return;
  try {
    await window.updateAPI.applyUpdate();
  } catch (err: any) {
    errorMessage.value = err?.message || 'Failed to apply update';
  }
}

async function onRollback(): Promise<void> {
  if (!window.updateAPI) return;
  const confirmed = window.confirm(
    'Are you sure you want to rollback all patch overlays? This will remove all downloaded delta patches and restore the original base game.',
  );
  if (!confirmed) return;

  try {
    await window.updateAPI.rollback();
  } catch (err: any) {
    errorMessage.value = err?.message || 'Rollback failed';
  }
}

onMounted(async () => {
  if (window.updateAPI) {
    unsubscribeProgress = window.updateAPI.onProgress((p) => {
      progress.value = p;
      if (p.stage === 'ready') currentStage.value = 'ready';
      if (p.stage === 'error') {
        currentStage.value = 'error';
        errorMessage.value = p.error || 'Download error';
      }
    });

    const initStatus = await window.updateAPI.getStatus();
    status.value = initStatus;
    // Auto-check on view entry
    await onCheckUpdates();
  }
});

onUnmounted(() => {
  if (unsubscribeProgress) {
    unsubscribeProgress();
    unsubscribeProgress = null;
  }
});
</script>

<style lang="scss" scoped>
.page-update {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0b0d13;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  user-select: none;
}

.update-backdrop {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.28) contrast(1.15) saturate(1.1);
  transform: scale(1.03);
  z-index: 1;
}

.update-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 35%, rgba(5, 7, 12, 0.85) 85%);
  pointer-events: none;
  z-index: 2;
}

.update-container {
  position: relative;
  z-index: 3;
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-sizing: border-box;
}

/* Header */
.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.6rem;
    background: rgba(212, 175, 55, 0.12);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #e6c875;
    margin-bottom: 0.35rem;
  }

  &__title {
    margin: 0;
    font-family: 'Cinzel', serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: #f7fafc;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    letter-spacing: 0.04em;
  }

  &__subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    color: #94a3b8;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
  }
}

/* Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(18, 24, 38, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #cbd5e1;

  &:hover:not(:disabled) {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(212, 175, 55, 0.6);
    color: #f8fafc;
    transform: translateY(-1px);
  }

  &--secondary {
    background: rgba(30, 41, 59, 0.7);
  }

  &--accent {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(180, 130, 20, 0.3));
    border-color: rgba(212, 175, 55, 0.6);
    color: #fce79a;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(180, 130, 20, 0.5));
      color: #fff;
    }
  }

  &--danger {
    background: rgba(153, 27, 27, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    color: #fca5a5;

    &:hover:not(:disabled) {
      background: rgba(153, 27, 27, 0.45);
      border-color: rgba(239, 68, 68, 0.8);
      color: #fff;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  background: linear-gradient(135deg, #d4af37, #aa8214);
  border: 1px solid #f6e05e;
  color: #1a1505;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transition: all 0.25s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(212, 175, 55, 0.5);
    filter: brightness(1.1);
  }

  &--glow {
    animation: glow-pulse 1.8s infinite;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
  }
  50% {
    box-shadow: 0 0 22px rgba(212, 175, 55, 0.8);
  }
}

/* Status Hero Card */
.update-hero-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 10px;
  padding: 1.25rem 1.75rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.version-display {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.version-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.version-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.version-value {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.version-num {
  font-family: 'Cinzel', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;

  &--highlight {
    color: #e6c875;
    text-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
  }
}

.patched-tag, .new-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.patched-tag {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.new-tag {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.version-arrow {
  font-size: 1.4rem;
  color: #64748b;
}

/* Status Box */
.status-box {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);

  &__icon {
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    flex: 1;
  }

  &__cta {
    display: flex;
    align-items: center;
  }
}

.status-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #f8fafc;
}

.status-desc {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.progress-file {
  color: #e2e8f0;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.progress-stats {
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.progress-speed {
  color: #38bdf8;
}

.progress-bar-track {
  width: 100%;
  height: 8px;
  background: rgba(2, 6, 23, 0.8);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #d4af37);
  transition: width 0.15s ease;

  &--complete {
    background: linear-gradient(90deg, #22c55e, #10b981);
  }
}

/* Split Grid */
.update-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  min-height: 0;
}

.update-panel {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(2, 6, 23, 0.5);
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.panel-icon {
  font-size: 1rem;
}

.panel-title {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.counter-badge {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #e6c875;
  border-radius: 999px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.release-notes-content pre {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.deltas-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.delta-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  background: rgba(2, 6, 23, 0.45);
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.delta-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  letter-spacing: 0.04em;

  &--new {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.4);
  }

  &--modified {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.4);
  }
}

.delta-path {
  flex: 1;
  font-family: monospace;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delta-size {
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
  font-size: 0.75rem;
}

.empty-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-align: center;
  gap: 0.5rem;

  .empty-icon {
    font-size: 2.2rem;
    opacity: 0.6;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
  }
}
</style>
