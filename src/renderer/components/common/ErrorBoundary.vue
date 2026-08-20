<template>
  <div v-if="errorInfo" class="error-boundary-overlay">
    <div class="error-boundary-modal glass-panel glass-panel--elevated">
      <!-- Top Rune Header & Warning Icon -->
      <div class="error-header">
        <div class="error-icon-badge">
          <span class="error-glyph">⚠️</span>
        </div>
        <div class="error-title-group">
          <h2 class="error-title">{{ errorInfo.title || 'Duel Engine Disruption' }}</h2>
          <span class="error-subtitle">Ancient Duel Arena Recovery System</span>
        </div>
      </div>

      <!-- User-Facing Friendly Message -->
      <div class="error-body">
        <p class="error-description">
          The Duel Engine encountered an unexpected state or rules anomaly during execution.
          The simulator prevented an unhandled application crash so you can safely return to the arena.
        </p>

        <!-- Error Summary Box -->
        <div class="error-message-box">
          <span class="error-message-label">REASON:</span>
          <span class="error-message-text">{{ errorInfo.message }}</span>
        </div>

        <!-- Collapsible Diagnostic Stack Details -->
        <div v-if="errorInfo.stack" class="diagnostic-section">
          <button
            type="button"
            class="diagnostic-toggle-btn"
            @click="showDiagnostics = !showDiagnostics"
          >
            <span>{{ showDiagnostics ? '▼ Hide Diagnostics' : '▶ Show Diagnostic Stack Trace' }}</span>
          </button>

          <div v-if="showDiagnostics" class="diagnostic-content">
            <pre class="stack-trace-text">{{ errorInfo.stack }}</pre>
          </div>
        </div>
      </div>

      <!-- Recovery Actions -->
      <div class="error-actions">
        <button
          type="button"
          class="recovery-btn recovery-btn--primary"
          @click="handleReturnToMainMenu"
        >
          <span class="btn-icon">🏛️</span>
          <span class="btn-text">Return to Main Menu</span>
        </button>

        <button
          type="button"
          class="recovery-btn recovery-btn--secondary"
          @click="handleReload"
        >
          <span class="btn-icon">🔄</span>
          <span class="btn-text">Reload Arena</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../../stores/uiStore.js';
import { useDuelStore } from '../../stores/duelStore.js';

const router = useRouter();
const uiStore = useUIStore();
const duelStore = useDuelStore();

const showDiagnostics = ref(false);

const errorInfo = computed(() => uiStore.crashError);

function handleReturnToMainMenu(): void {
  uiStore.clearCrashError();
  duelStore.resetDuelState();
  router.push('/main-menu');
}

function handleReload(): void {
  uiStore.clearCrashError();
  duelStore.resetDuelState();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.error-boundary-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 7, 10, 0.88);
  backdrop-filter: blur(16px);
  padding: $space-4;
  box-sizing: border-box;
}

.error-boundary-modal {
  width: 100%;
  max-width: 580px;
  background: rgba(18, 14, 18, 0.94);
  border: 1px solid rgba(235, 87, 87, 0.5);
  border-top: 3px solid #eb5757;
  border-radius: 16px;
  padding: $space-5;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.9),
    0 0 30px rgba(235, 87, 87, 0.25);
  display: flex;
  flex-direction: column;
  gap: $space-4;
  animation: modal-enter 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.error-header {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding-bottom: $space-3;
  border-bottom: 1px solid rgba(235, 87, 87, 0.25);
}

.error-icon-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(235, 87, 87, 0.15);
  border: 1px solid rgba(235, 87, 87, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 16px rgba(235, 87, 87, 0.3);
}

.error-glyph {
  font-size: 1.6rem;
}

.error-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.error-title {
  margin: 0;
  font-family: $font-family-display;
  font-size: 1.4rem;
  font-weight: 700;
  color: #ff7675;
  letter-spacing: 0.03em;
  text-shadow: 0 0 10px rgba(235, 87, 87, 0.4);
}

.error-subtitle {
  font-family: $font-family-display;
  font-size: 0.75rem;
  color: $color-gold-500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.error-body {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.error-description {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: $color-text-secondary;
}

.error-message-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(10, 12, 16, 0.85);
  border: 1px solid rgba(235, 87, 87, 0.35);
  border-radius: 8px;
  padding: 10px 14px;
}

.error-message-label {
  font-family: $font-family-display;
  font-size: 0.7rem;
  font-weight: 800;
  color: #ff7675;
  letter-spacing: 0.08em;
}

.error-message-text {
  font-family: 'Barlow Semi Condensed', monospace, sans-serif;
  font-size: 0.92rem;
  color: #f5f1e6;
  word-break: break-word;
}

.diagnostic-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.diagnostic-toggle-btn {
  background: transparent;
  border: none;
  color: $color-text-muted;
  font-size: 0.78rem;
  cursor: pointer;
  text-align: left;
  padding: 0;
  transition: color 160ms ease;

  &:hover {
    color: $color-gold-300;
  }
}

.diagnostic-content {
  max-height: 140px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.3);
    border-radius: 3px;
  }
}

.stack-trace-text {
  margin: 0;
  font-family: monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  color: #e0d0c0;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: $space-3;
  padding-top: $space-2;
}

.recovery-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 8px;
  font-family: $font-family-display;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 180ms ease;

  &--primary {
    background: linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(201, 162, 39, 0.15) 100%);
    border: 1px solid $color-gold-500;
    color: $color-gold-100;

    &:hover {
      background: linear-gradient(135deg, rgba(201, 162, 39, 0.5) 0%, rgba(201, 162, 39, 0.25) 100%);
      box-shadow: 0 0 16px rgba(201, 162, 39, 0.4);
      transform: translateY(-1px);
    }
  }

  &--secondary {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: $color-text-secondary;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: $color-text-primary;
      border-color: rgba(255, 255, 255, 0.4);
    }
  }
}
</style>
