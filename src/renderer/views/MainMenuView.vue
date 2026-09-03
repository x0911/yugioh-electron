<template>
  <div class="main-menu-view">
    <!-- Atmospheric Ambient Background -->
    <div class="main-menu-view__bg" />

    <!-- Top Header Bar -->
    <header class="main-menu-view__header">
      <div class="main-menu-view__brand">
        <img
          src="../assets/logo.png"
          alt="Yu-Gi-Oh! Logo"
          class="main-menu-view__brand-logo"
        />
        <div class="main-menu-view__brand-text">
          <span class="main-menu-view__brand-title">DUEL ARENA</span>
          <span class="main-menu-view__brand-sub">DM + GX SIMULATOR</span>
        </div>
      </div>

      <div class="main-menu-view__header-status">
        <router-link
          to="/logs"
          class="main-menu-view__about-btn"
          title="View Last 10 Duel Logs & Diagnostics"
        >
          <span class="about-icon">📜</span>
          <span>Logs</span>
        </router-link>

        <router-link
          to="/update"
          class="main-menu-view__about-btn"
          title="Check for Game Updates & Synchronize Decks"
        >
          <span class="about-icon">⚡</span>
          <span>Update</span>
        </router-link>

        <button
          type="button"
          class="main-menu-view__about-btn"
          title="About Duel Arena & Version Info"
          @click="showAboutModal = true"
        >
          <span class="about-icon">ℹ️</span>
          <span>About</span>
        </button>

        <div class="main-menu-view__status-badge">
          <span class="main-menu-view__status-dot" />
          <span>{{ engineBadgeText }}</span>
        </div>
      </div>
    </header>

    <!-- Center Hero Callout -->
    <div class="main-menu-view__hero">
      <img
        src="../assets/logo.png"
        alt="Yu-Gi-Oh!"
        class="main-menu-view__hero-logo"
      />
      <h1 class="main-menu-view__hero-title">ANCIENT DUEL ARENA</h1>
      <p class="main-menu-view__hero-subtitle">
        Step forth into the sacred arena. Choose your path, Duelist.
      </p>
    </div>

    <!-- 4 Interactive Card CTA Buttons -->
    <nav class="main-menu-view__cards-container" aria-label="Main Menu Navigation">
      <!-- 1. Start Duel -->
      <YugiButton
        variant="card"
        to="/coin-toss"
        class="main-menu-view__card-btn"
        aria-label="Start Duel — Face AI Opponents"
      >
        <template #header>
          <span class="main-menu-view__card-header">DUEL ARENA</span>
        </template>
        <template #art>
          <div class="main-menu-view__card-art-frame">
            <img
              :src="getMenuCardImageUrl('duel')"
              alt="Start Duel"
              class="main-menu-view__card-img"
            />
            <div class="main-menu-view__card-shine" />
          </div>
        </template>
        <template #footer>
          <div class="main-menu-view__card-label-block">
            <span class="main-menu-view__card-title">START DUEL</span>
            <span class="main-menu-view__card-desc">Face AI Opponents</span>
          </div>
        </template>
      </YugiButton>

      <!-- 2. Deck Edit -->
      <YugiButton
        variant="card"
        to="/deck-edit"
        class="main-menu-view__card-btn"
        aria-label="Deck Edit — Construct & Customize Decks"
      >
        <template #header>
          <span class="main-menu-view__card-header">DECK BUILDER</span>
        </template>
        <template #art>
          <div class="main-menu-view__card-art-frame">
            <img
              :src="getMenuCardImageUrl('deck')"
              alt="Deck Edit"
              class="main-menu-view__card-img"
            />
            <div class="main-menu-view__card-shine" />
          </div>
        </template>
        <template #footer>
          <div class="main-menu-view__card-label-block">
            <span class="main-menu-view__card-title">DECK EDIT</span>
            <span class="main-menu-view__card-desc">Construct & Customize</span>
          </div>
        </template>
      </YugiButton>

      <!-- 3. Settings -->
      <YugiButton
        variant="card"
        to="/settings"
        class="main-menu-view__card-btn"
        aria-label="Settings — Configure Rivals & Audio"
      >
        <template #header>
          <span class="main-menu-view__card-header">CONFIG & RIVALS</span>
        </template>
        <template #art>
          <div class="main-menu-view__card-art-frame">
            <img
              :src="getMenuCardImageUrl('settings')"
              alt="Settings"
              class="main-menu-view__card-img"
            />
            <div class="main-menu-view__card-shine" />
          </div>
        </template>
        <template #footer>
          <div class="main-menu-view__card-label-block">
            <span class="main-menu-view__card-title">SETTINGS</span>
            <span class="main-menu-view__card-desc">Opponents & Audio</span>
          </div>
        </template>
      </YugiButton>

      <!-- 4. Exit Game -->
      <YugiButton
        variant="card"
        class="main-menu-view__card-btn main-menu-view__card-btn--danger"
        aria-label="Exit Game — Quit Application"
        @click="handleExitClick"
      >
        <template #header>
          <span class="main-menu-view__card-header">DESKTOP</span>
        </template>
        <template #art>
          <div class="main-menu-view__card-art-frame main-menu-view__card-art-frame--danger">
            <img
              :src="getMenuCardImageUrl('exit')"
              alt="Exit Game"
              class="main-menu-view__card-img"
            />
            <div class="main-menu-view__card-shine" />
          </div>
        </template>
        <template #footer>
          <div class="main-menu-view__card-label-block">
            <span class="main-menu-view__card-title">EXIT GAME</span>
            <span class="main-menu-view__card-desc">Quit Application</span>
          </div>
        </template>
      </YugiButton>
    </nav>

    <!-- Bottom Footer Bar -->
    <footer class="main-menu-view__footer">
      <div class="main-menu-view__footer-left">
        <span>Yu-Gi-Oh! Desktop Duel</span>
        <span>•</span>
        <span>Version 0.1.0</span>
      </div>
      <div class="main-menu-view__footer-right">
        <span>Offline Single-Player Edition</span>
        <span>•</span>
        <span>Original & GX Eras</span>
      </div>
    </footer>

    <!-- Exit Game Confirmation Modal -->
    <YugiModal v-model="showExitModal" title="Exit Duel Arena" accent="ai" width="480px">
      <div class="main-menu-view__modal-body">
        <p>Are you sure you want to leave the Duel Arena and quit the application?</p>
        <p class="text-muted">
          Any unsaved deck modifications or in-progress duel sessions will be terminated.
        </p>
      </div>

      <template #footer>
        <div class="main-menu-view__modal-actions">
          <YugiButton variant="secondary" size="md" @click="showExitModal = false">
            Cancel
          </YugiButton>
          <YugiButton variant="danger" size="md" icon="🚪" @click="confirmExit">
            Quit Game
          </YugiButton>
        </div>
      </template>
    </YugiModal>

    <!-- About & Version Information Modal -->
    <AboutModal :is-open="showAboutModal" @close="showAboutModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUIStore } from '../stores/uiStore.js';
import { getMenuCardImageUrl } from '../utils/media.js';
import YugiButton from '../components/common/YugiButton.vue';
import YugiModal from '../components/common/YugiModal.vue';
import AboutModal from '../components/common/AboutModal.vue';

const uiStore = useUIStore();
const showExitModal = ref(false);
const showAboutModal = ref(false);

const engineBadgeText = computed(() => {
  if (uiStore.engineStatus?.ready) {
    return `Engine Ready • ${uiStore.engineStatus.cardCount.toLocaleString()} Cards`;
  }
  return 'Duel Engine Ready';
});

function handleExitClick(): void {
  showExitModal.value = true;
}

function confirmExit(): void {
  if (window.appAPI && typeof window.appAPI.exitApp === 'function') {
    window.appAPI.exitApp();
  } else {
    console.log('[MainMenuView] Exit requested (window.appAPI.exitApp)');
    showExitModal.value = false;
  }
}
</script>
