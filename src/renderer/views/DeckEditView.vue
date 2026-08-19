<template>
  <div class="deck-edit-view">
    <!-- Top Navigation & Header Bar -->
    <header class="deck-edit-header glass-panel">
      <div class="header-left">
        <YugiButton variant="ghost" size="sm" icon="←" to="/main-menu">
          Main Menu
        </YugiButton>
        <div class="header-title-wrap">
          <h1 class="header-title">DECK CONSTRUCTION</h1>
          <span class="header-subtitle">Build & customize your tournament-legal 40-60 card decks</span>
        </div>
      </div>

      <div class="header-right">
        <div
          class="deck-status-pill"
          :class="{
            'deck-status-pill--legal': store.deckValidity.isValid,
            'deck-status-pill--illegal': !store.deckValidity.isValid,
          }"
        >
          <span class="status-dot">●</span>
          <span class="status-name">{{ store.activeDeck.name }}</span>
          <span class="status-validity">
            {{ store.deckValidity.isValid ? 'Legal' : 'Illegal' }}
          </span>
        </div>

        <YugiButton
          variant="primary"
          size="sm"
          icon="💾"
          :disabled="!store.isDirty || !store.deckValidity.isValid || store.mainDeckCount < 40"
          :title="
            store.mainDeckCount < 40
              ? `Cannot save: Main deck has ${store.mainDeckCount}/40 cards minimum`
              : !store.deckValidity.isValid
                ? 'Cannot save: Deck contains illegal cards'
                : !store.isDirty
                  ? 'Deck already saved'
                  : 'Save deck changes'
          "
          @click="store.saveCurrentDeck"
        >
          Save Deck
        </YugiButton>
      </div>
    </header>

    <!-- Main 3-Column Workspace -->
    <main v-if="store.isLoaded" class="deck-workspace">
      <!-- Col-1: Deck Construction Column (24%) -->
      <section class="col-deck-management" aria-label="Deck Construction">
        <DeckColumn />
      </section>

      <!-- Col-2: Virtualized Card Pool & Filter Bar (48%) -->
      <section class="col-card-pool" aria-label="Card Database">
        <CardFilterBar />
        <div class="grid-wrapper">
          <CardGridVirtualized />
        </div>
      </section>

      <!-- Col-3: Sticky Live Card Previewer (28%) -->
      <aside class="col-card-preview" aria-label="Card Preview">
        <CardPreviewer />
      </aside>
    </main>

    <!-- Loading State -->
    <div v-else class="deck-loading-state">
      <LoadingSpinner variant="cyan" size="lg" message="Loading Card Database & Decks..." />
    </div>

    <!-- Floating Toast Notification -->
    <transition name="toast">
      <div
        v-if="store.toastMessage"
        class="deck-toast-alert"
        :class="`deck-toast-alert--${store.toastType}`"
      >
        <span class="toast-icon">
          {{
            store.toastType === 'success'
              ? '✓'
              : store.toastType === 'warning'
                ? '⚠️'
                : store.toastType === 'danger'
                  ? '✕'
                  : 'ℹ'
          }}
        </span>
        <span class="toast-msg">{{ store.toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDeckEditStore } from '../stores/deckEditStore.js';
import YugiButton from '../components/common/YugiButton.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import DeckColumn from '../components/deckEdit/DeckColumn.vue';
import CardFilterBar from '../components/deckEdit/CardFilterBar.vue';
import CardGridVirtualized from '../components/deckEdit/CardGridVirtualized.vue';
import CardPreviewer from '../components/deckEdit/CardPreviewer.vue';

const store = useDeckEditStore();

onMounted(async () => {
  await store.initStore();
});
</script>

<style scoped lang="scss">
@use '../assets/styles/abstracts' as *;

.deck-edit-view {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: $space-3;
  gap: $space-2;
  box-sizing: border-box;
  overflow: hidden;
  background-image:
    radial-gradient(circle at 50% 20%, rgba(201, 162, 39, 0.12) 0%, transparent 60%),
    linear-gradient(180deg, rgba(10, 12, 16, 0.72) 0%, rgba(10, 12, 16, 0.92) 100%),
    url('app-resource://backgrounds/deck-edit-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.deck-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-2 $space-4;
  border-radius: 12px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: rgba(14, 18, 26, 0.8);
  border: 1px solid rgba(201, 162, 39, 0.35);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.header-title-wrap {
  display: flex;
  flex-direction: column;
}

.header-title {
  margin: 0;
  font-family: $font-family-display;
  font-size: 1.25rem;
  font-weight: 800;
  color: $color-gold-300;
  letter-spacing: 0.08em;
  text-shadow: 0 0 10px rgba(201, 162, 39, 0.4);
}

.header-subtitle {
  font-size: 0.78rem;
  color: $color-text-secondary;
}

.header-right {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.deck-status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.45);
  font-size: 0.82rem;
  font-family: $font-family-display;
  font-weight: 700;

  &--legal {
    border: 1px solid rgba(46, 204, 113, 0.5);
    color: #a3e4d7;

    .status-dot {
      color: #2ecc71;
      text-shadow: 0 0 6px #2ecc71;
    }
  }

  &--illegal {
    border: 1px solid rgba(235, 87, 87, 0.5);
    color: #f5b7b1;

    .status-dot {
      color: #e74c3c;
      text-shadow: 0 0 6px #e74c3c;
    }
  }
}

.status-name {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-validity {
  padding-left: 4px;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.75rem;
}

.deck-workspace {
  flex: 1;
  display: grid;
  grid-template-columns: 37% 39% 24%;
  gap: $space-2;
  min-height: 0;
  overflow: hidden;
}

.col-deck-management {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.col-card-pool {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  min-height: 0;
  overflow: hidden;
}

.grid-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.col-card-preview {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.deck-loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deck-toast-alert {
  position: absolute;
  top: 70px;
  right: 24px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-family: $font-family-display;
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);

  &--success {
    background: rgba(46, 204, 113, 0.9);
    border: 1px solid #2ecc71;
    color: #fff;
  }

  &--warning {
    background: rgba(243, 156, 18, 0.9);
    border: 1px solid #f39c12;
    color: #fff;
  }

  &--danger {
    background: rgba(231, 76, 60, 0.9);
    border: 1px solid #e74c3c;
    color: #fff;
  }

  &--info {
    background: rgba(52, 152, 219, 0.9);
    border: 1px solid #3498db;
    color: #fff;
  }
}

.toast-icon {
  font-size: 1.1rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 250ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
