<template>
  <div class="main-menu-view">
    <!-- Atmospheric Ambient Background -->
    <div class="main-menu-view__bg" />

    <!-- Top Header Bar -->
    <header class="main-menu-view__header">
      <div class="main-menu-view__brand">
        <div class="main-menu-view__brand-emblem">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="18,3 33,30 3,30" stroke="#c9a227" stroke-width="2" fill="rgba(18, 22, 30, 0.8)" />
            <circle cx="18" cy="20" r="4" fill="#e3c567" />
            <path d="M11 20 C13 16, 23 16, 25 20" stroke="#f4e4b8" stroke-width="1.5" />
          </svg>
        </div>
        <div class="main-menu-view__brand-text">
          <span class="main-menu-view__brand-title">YU-GI-OH!</span>
          <span class="main-menu-view__brand-sub">DESKTOP DUEL</span>
        </div>
      </div>

      <div class="main-menu-view__header-status">
        <div class="main-menu-view__status-badge">
          <span class="main-menu-view__status-dot" />
          <span>{{ engineBadgeText }}</span>
        </div>
      </div>
    </header>

    <!-- Center Hero Callout -->
    <div class="main-menu-view__hero">
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
          <div class="main-menu-view__card-art">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
              <line x1="13" y1="19" x2="19" y2="13" />
              <line x1="16" y1="16" x2="20" y2="20" />
              <line x1="19" y1="21" x2="21" y2="19" />
              <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
              <line x1="5" y1="14" x2="9" y2="18" />
              <line x1="7" y1="17" x2="4" y2="20" />
              <line x1="3" y1="19" x2="5" y2="21" />
            </svg>
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
          <div class="main-menu-view__card-art">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="13" height="17" rx="2" />
              <path d="M7 2h11a2 2 0 0 1 2 2v14" />
              <line x1="7" y1="9" x2="12" y2="9" />
              <line x1="7" y1="13" x2="12" y2="13" />
            </svg>
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
          <div class="main-menu-view__card-art">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
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
          <div class="main-menu-view__card-art">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
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
    <YugiModal
      v-model="showExitModal"
      title="Exit Duel Arena"
      accent="ai"
      width="480px"
    >
      <div class="main-menu-view__modal-body">
        <p>
          Are you sure you want to leave the Duel Arena and quit the application?
        </p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUIStore } from '../stores/uiStore.js';
import YugiButton from '../components/common/YugiButton.vue';
import YugiModal from '../components/common/YugiModal.vue';

const uiStore = useUIStore();
const showExitModal = ref(false);

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

