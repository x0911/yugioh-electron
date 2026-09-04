<template>
  <div class="loading-view">
    <!-- Atmospheric Background Overlay -->
    <div class="loading-view__bg" />

    <!-- Centered Glass Loading Card -->
    <GlassPanel elevated accent="gold" padding="40px 48px" class="loading-view__card">
      <!-- Duel Arena Official Logo -->
      <div class="loading-view__emblem">
        <img
          src="../assets/logo.png"
          alt="Yu-Gi-Oh! Logo"
          class="loading-view__logo-img"
        />
      </div>

      <!-- Title & Branding -->
      <div class="loading-view__title-group">
        <h1 class="loading-view__title">YU-GI-OH!</h1>
        <p class="loading-view__subtitle">DESKTOP DUEL • ANCIENT ARENA</p>
      </div>

      <!-- Celestial Spinner & Progress Visual -->
      <div class="loading-view__status-container">
        <template v-if="!hasError">
          <LoadingSpinner v-if="!isReady" :size="72" variant="gold" class="loading-view__spinner" />
          <div v-else class="loading-view__ready-icon">
            <svg
              viewBox="0 0 24 24"
              width="56"
              height="56"
              fill="none"
              stroke="#3ddc97"
              stroke-width="2.5"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#3ddc97"
                stroke-opacity="0.3"
                fill="rgba(61, 220, 151, 0.15)"
              />
              <polyline
                points="7 12 10.5 15.5 17 9"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </template>
        <template v-else>
          <div class="loading-view__error-icon">
            <svg
              viewBox="0 0 24 24"
              width="56"
              height="56"
              fill="none"
              stroke="#eb5757"
              stroke-width="2.5"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#eb5757"
                stroke-opacity="0.3"
                fill="rgba(235, 87, 87, 0.15)"
              />
              <line x1="12" y1="8" x2="12" y2="13" stroke-linecap="round" />
              <circle cx="12" cy="16.5" r="1" fill="#eb5757" />
            </svg>
          </div>
        </template>
      </div>

      <!-- Progress Meter -->
      <div class="loading-view__meter-group">
        <div class="loading-view__meter-bar">
          <div
            class="loading-view__meter-fill"
            :class="{
              'loading-view__meter-fill--error': hasError,
              'loading-view__meter-fill--ready': isReady,
            }"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
        <div class="loading-view__meter-info">
          <span
            class="loading-view__status-text"
            :class="{ 'loading-view__status-text--error': hasError }"
          >
            {{ statusMessage }}
          </span>
          <span class="loading-view__percent-text"> {{ progressPercent }}% </span>
        </div>
      </div>

      <!-- Detailed Real Stats Summary -->
      <div v-if="statsText" class="loading-view__stats-badge">
        <span class="loading-view__stats-dot" />
        <span class="loading-view__stats-label">{{ statsText }}</span>
      </div>

      <!-- Retry Button on Error -->
      <div v-if="hasError" class="loading-view__error-actions">
        <YugiButton variant="primary" size="md" icon="🔄" @click="startEngineInitialization">
          Retry Engine Initialization
        </YugiButton>
      </div>

      <!-- Version & Engine Footnote -->
      <footer class="loading-view__footer">
        <span>Powered by ProjectIgnis ygopro-core (WASM)</span>
        <span>•</span>
        <span>Duel Monsters & GX Series Pool</span>
      </footer>
    </GlassPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../stores/uiStore.js';
import GlassPanel from '../components/common/GlassPanel.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import YugiButton from '../components/common/YugiButton.vue';
import type { EngineInitStatus } from '../../shared/types/ipc.js';

const router = useRouter();
const uiStore = useUIStore();

const progressPercent = ref(15);
const statusMessage = ref('Summoning Ancient Duel Engine (WASM)...');
const statsText = ref('');
const isReady = ref(false);
const hasError = ref(false);

async function startEngineInitialization(): Promise<void> {
  hasError.value = false;
  isReady.value = false;
  progressPercent.value = 20;
  statusMessage.value = 'Awakening Duel Engine Core (WASM)...';
  statsText.value = '';

  try {
    // Check if Electron appAPI is available
    if (window.appAPI && typeof window.appAPI.initEngine === 'function') {
      // Step 1: Trigger engine init
      progressPercent.value = 45;
      statusMessage.value = 'Loading Ancient Card Database & Base Lua Scripts...';

      const status: EngineInitStatus = await window.appAPI.initEngine();

      if (!status.ready || status.error) {
        throw new Error(status.error || 'Card pool database or engine core not ready.');
      }

      // Step 2: Engine & DB verified
      progressPercent.value = 85;
      statusMessage.value = `Validating Legal DM & GX Card Pool (${status.cardCount.toLocaleString()} Cards)...`;
      statsText.value = `Engine ${status.engineVersion} • ${status.cardCount.toLocaleString()} Legal Cards • ${status.scriptsCount.toLocaleString()} Scripts`;

      uiStore.setEngineStatus(status);

      // Final Step: Complete
      await new Promise((resolve) => setTimeout(resolve, 300));
      progressPercent.value = 100;
      statusMessage.value = 'Ancient Duel Arena Ready!';
      isReady.value = true;

      // Smooth transition to target view (multiplayer lobby if guest window, otherwise main menu)
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (window.appAPI?.isGuest) {
        router.replace('/multiplayer');
      } else {
        router.replace('/main-menu');
      }
    } else {
      // Fallback for non-Electron or standalone browser environment
      console.warn('[LoadingView] window.appAPI not detected — running mock initialization');
      await new Promise((resolve) => setTimeout(resolve, 300));
      progressPercent.value = 60;
      statusMessage.value = 'Loading Mock Card Database...';
      await new Promise((resolve) => setTimeout(resolve, 300));
      progressPercent.value = 100;
      statusMessage.value = 'Arena Ready (Dev Fallback)';
      isReady.value = true;
      await new Promise((resolve) => setTimeout(resolve, 400));
      router.replace('/main-menu');
    }
  } catch (err: unknown) {
    console.error('[LoadingView] Engine initialization failed:', err);
    hasError.value = true;
    progressPercent.value = 100;
    const msg = err instanceof Error ? err.message : String(err);
    statusMessage.value = `Initialization Error: ${msg}`;
  }
}

onMounted(() => {
  startEngineInitialization();
});
</script>

<style scoped lang="scss">
@use '../assets/styles/abstracts' as *;

.loading-view {
  position: relative;
  width: 100%;
  height: 100%;
  @include flex-center;
  padding: $space-4;
  overflow: hidden;
  background-color: $color-bg-void;

  &__bg {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 50% 30%, rgba(201, 162, 39, 0.15) 0%, transparent 65%),
      radial-gradient(circle at 50% 80%, rgba(47, 128, 237, 0.08) 0%, transparent 55%),
      linear-gradient(180deg, rgba(10, 12, 16, 0.65) 0%, rgba(10, 12, 16, 0.94) 100%),
      url('app-resource://backgrounds/loading-bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    pointer-events: none;
  }

  &__card {
    position: relative;
    z-index: 2;
    max-width: 620px;
    width: 100%;
    @include flex-center;
    flex-direction: column;
    text-align: center;
    gap: $space-4;
    animation: fade-in 0.6s $ease-snappy forwards;
  }

  &__emblem {
    @include flex-center;
    width: 120px;
    height: 100px;
    filter: drop-shadow(0 0 20px rgba(201, 162, 39, 0.65));
    animation: pulse-glow 3s infinite ease-in-out;
  }

  &__logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-1;
  }

  &__title {
    margin: 0;
    font-family: $font-display;
    font-size: $fs-display;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: $color-gold-300;
    text-shadow:
      0 0 20px rgba(201, 162, 39, 0.6),
      0 4px 8px rgba(0, 0, 0, 0.9);
  }

  &__subtitle {
    margin: 0;
    font-family: $font-display;
    font-size: $fs-xs;
    font-weight: 600;
    letter-spacing: 0.25em;
    color: $color-gold-100;
    opacity: 0.85;
  }

  &__status-container {
    height: 80px;
    @include flex-center;
    margin: $space-2 0;
  }

  &__ready-icon,
  &__error-icon {
    @include flex-center;
    animation: scale-up 0.4s $ease-snappy;
  }

  &__ready-icon svg {
    filter: drop-shadow(0 0 12px rgba(61, 220, 151, 0.6));
  }

  &__error-icon svg {
    filter: drop-shadow(0 0 12px rgba(235, 87, 87, 0.6));
  }

  &__meter-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__meter-bar {
    width: 100%;
    height: 10px;
    background: rgba(10, 12, 16, 0.85);
    border: 1px solid rgba(201, 162, 39, 0.3);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.8);
  }

  &__meter-fill {
    height: 100%;
    background: linear-gradient(90deg, #8c6e16 0%, #c9a227 50%, #f4e4b8 100%);
    box-shadow: 0 0 12px rgba(201, 162, 39, 0.8);
    transition: width 0.35s ease;

    &--ready {
      background: linear-gradient(90deg, #27ae60 0%, #3ddc97 100%);
      box-shadow: 0 0 16px rgba(61, 220, 151, 0.8);
    }

    &--error {
      background: linear-gradient(90deg, #c0392b 0%, #eb5757 100%);
      box-shadow: 0 0 16px rgba(235, 87, 87, 0.8);
    }
  }

  &__meter-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $fs-sm;
  }

  &__status-text {
    color: $color-text-secondary;
    font-family: $font-body;
    font-weight: 500;
    letter-spacing: 0.02em;

    &--error {
      color: $color-danger;
      font-weight: 600;
    }
  }

  &__percent-text {
    color: $color-gold-300;
    font-family: $font-display;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &__stats-badge {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: $space-1 $space-3;
    background: rgba(10, 12, 16, 0.7);
    border: 1px solid rgba(201, 162, 39, 0.25);
    border-radius: 20px;
    font-size: $fs-xs;
    color: $color-gold-100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  &__stats-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: $color-success;
    box-shadow: 0 0 6px $color-success;
  }

  &__error-actions {
    margin-top: $space-2;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-top: $space-2;
    font-size: $fs-xs;
    color: $color-text-muted;
    font-family: $font-body;
  }
}
</style>
