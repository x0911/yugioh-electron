<template>
  <div class="deck-column glass-panel glass-panel--elevated">
    <!-- Top Deck Management Bar -->
    <div class="deck-header">
      <!-- Premium Custom Deck Autocomplete Selector -->
      <div class="deck-select-row">
        <DeckSelectorAutocomplete
          :model-value="store.activeDeckId"
          :decks="store.customDecks"
          @update:model-value="onDeckAutocompleteSelect"
        />
      </div>

      <!-- Editable Deck Name -->
      <div class="deck-name-row">
        <input
          v-model="deckNameInput"
          type="text"
          class="deck-name-input"
          placeholder="Deck Name..."
          maxlength="40"
          @input="onNameInput"
        />
        <span v-if="store.isDirty" class="dirty-indicator" title="Unsaved changes">●</span>
      </div>

      <!-- Deck Action Toolbar / Drag-to-Trash Zone -->
      <div class="deck-toolbar-container">
        <!-- Normal Action Buttons -->
        <div
          v-if="!isDraggingFromDeck"
          class="deck-toolbar"
        >
          <button
            type="button"
            class="tool-btn tool-btn--save"
            :disabled="!store.isDirty || !validity.isValid"
            :title="
              !validity.isValid
                ? store.mainDeckCount < 40
                  ? `Cannot save: Main deck has ${store.mainDeckCount}/40 cards minimum`
                  : (validity.errors && validity.errors.length > 0)
                  ? `Cannot save: ${validity.errors[0]}`
                  : 'Cannot save: Deck is invalid'
                : !store.isDirty
                ? 'Deck already saved'
                : 'Save deck changes'
            "
            @click="handleSaveDeck"
          >
            <span class="tool-icon">💾</span> Save
          </button>
          <button
            type="button"
            class="tool-btn"
            title="Create a new deck"
            @click="onNewDeckClick"
          >
            <span class="tool-icon">➕</span> New
          </button>
          <button
            type="button"
            class="tool-btn"
            title="Clone current deck"
            @click="store.duplicateCurrentDeck"
          >
            <span class="tool-icon">📋</span> Clone
          </button>
          <button
            type="button"
            class="tool-btn tool-btn--danger"
            title="Clear all cards from this deck"
            @click="showClearModal = true"
          >
            <span class="tool-icon">🧹</span> Clear
          </button>
          <button
            type="button"
            class="tool-btn tool-btn--danger"
            :disabled="store.customDecks.length <= 1"
            title="Delete this custom deck"
            @click="showDeleteModal = true"
          >
            <span class="tool-icon">🗑️</span> Delete
          </button>
        </div>

        <!-- Active Drag-to-Trash Zone when dragging from deck -->
        <div
          v-else
          class="deck-trash-zone"
          :class="{ 'deck-trash-zone--hover': isTrashDragOver }"
          @dragover="onTrashDragOver"
          @dragleave="isTrashDragOver = false"
          @drop="onTrashDrop"
        >
          <span class="trash-icon">🗑️</span>
          <span class="trash-text">Drop here to remove "{{ store.draggingCard?.name || 'Card' }}"</span>
        </div>
      </div>
    </div>

    <!-- Live Deck Validity Banner -->
    <div
      class="validity-banner"
      :class="{
        'validity-banner--legal': validity.isValid,
        'validity-banner--illegal': !validity.isValid,
      }"
    >
      <div class="validity-header">
        <span class="validity-badge">
          {{ validity.isValid ? '✓ LEGAL DECK' : '⚠️ ILLEGAL DECK' }}
        </span>
        <span class="validity-summary">
          Main: {{ store.mainDeckCount }}/40-60 • Extra: {{ store.extraDeckCount }}/15
        </span>
      </div>
      <div v-if="!validity.isValid && validity.errors?.length > 0" class="validity-errors">
        <div v-for="(err, idx) in validity.errors" :key="idx" class="error-item">
          • {{ err }}
        </div>
      </div>
    </div>

    <!-- Main Deck Section (40 - 60 Cards in Columns Grid Dropzone) -->
    <div
      class="deck-section deck-section--main"
      :class="{
        'deck-section--drop-active': isPoolDraggingToMain,
        'deck-section--drag-over': isMainDragOver,
      }"
      @dragover="onMainDragOver"
      @dragleave="onMainDragLeave"
      @drop="onMainDrop"
    >
      <div class="section-title-bar">
        <div class="title-left">
          <span class="section-title">Main Deck</span>
          <span
            class="count-badge"
            :class="{
              'count-badge--legal': store.mainDeckCount >= 40 && store.mainDeckCount <= 60,
              'count-badge--illegal': store.mainDeckCount < 40 || store.mainDeckCount > 60,
            }"
          >
            {{ store.mainDeckCount }} / 60
          </span>
          <button
            type="button"
            class="view-toggle-pill"
            :title="isGroupedView ? 'Currently showing grouped stacks. Click to view all 40+ individual cards.' : 'Currently showing individual cards. Click to group duplicate cards into stacks.'"
            @click="isGroupedView = !isGroupedView"
          >
            {{ isGroupedView ? `🗂️ Stacks (${store.mainDeckGrouped.length})` : `🃏 All (${store.mainDeckCount})` }}
          </button>
        </div>
        <div class="stats-pills">
          <span class="stat-pill stat-pill--monsters" title="Monsters">
            ⚔ {{ store.deckStats.monsters }}
          </span>
          <span class="stat-pill stat-pill--spells" title="Spells">
            📖 {{ store.deckStats.spells }}
          </span>
          <span class="stat-pill stat-pill--traps" title="Traps">
            ⚡ {{ store.deckStats.traps }}
          </span>
        </div>
      </div>

      <!-- Main Deck Grid (Cards arranged in columns) -->
      <div ref="mainScrollRef" class="deck-cards-scrollable">
        <div v-if="mainDeckCards.length > 0" class="deck-cards-grid">
          <div
            v-for="item in mainDeckCards"
            :key="item.uniqueKey || item.id"
            class="deck-card-tile"
            :class="{
              [`deck-card-tile--${getCardKindClass(item.card)}`]: true,
              'deck-card-tile--dragging': store.isDragging && store.draggingCard?.id === item.id,
            }"
            draggable="true"
            title="Drag to remove from deck"
            @mouseenter="onCardHover(item.card)"
            @click="onCardHover(item.card)"
            @contextmenu.prevent="onCardHover(item.card)"
            @dragstart="onDeckCardDragStart($event, item, false)"
            @dragend="onDeckCardDragEnd"
          >
            <!-- Card Thumbnail -->
            <div class="tile-thumb-wrap">
              <img
                :src="getCardImageUrl(item.id, 'mini')"
                :alt="item.card?.name || 'Card'"
                class="tile-thumb-img"
                loading="lazy"
                @error="handleImageError"
              />

              <!-- Quantity Pill Badge (x1, x2, x3) -->
              <div class="tile-count-badge" :class="`tile-count-badge--${item.count}`">
                x{{ item.count }}
              </div>

              <!-- Drag Handle Indicator Icon on Hover -->
              <div class="tile-drag-badge" title="Drag to remove">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
                </svg>
              </div>
            </div>

            <!-- Compact Title & Stats Strip -->
            <div class="tile-info-strip">
              <span class="tile-name" :title="item.card?.name">{{ item.card?.name || `Card #${item.id}` }}</span>
              <div class="tile-stats">
                <span v-if="item.card?.isMonster" class="tile-atk">
                  ⚔{{ (item.card?.atk ?? 0) < 0 ? '?' : (item.card?.atk ?? 0) }}
                </span>
                <span v-else class="tile-type">
                  {{ item.card?.isSpell ? 'SPELL' : 'TRAP' }}
                </span>
                <span v-if="item.card?.isMonster && (item.card?.level ?? 0) > 0" class="tile-lvl">
                  ★{{ item.card?.level }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="section-empty">
          <span class="empty-hint">Main Deck is empty. Drag or click cards from the card pool to add them.</span>
        </div>

        <!-- Main Deck Dropzone Overlay Highlight -->
        <transition name="fade">
          <div
            v-if="isMainDragOver"
            class="deck-drop-overlay deck-drop-overlay--main"
          >
            <span class="drop-action-icon">➕</span>
            <span class="drop-action-text">Drop to Add to Main Deck</span>
            <span class="drop-action-sub">
              {{ store.draggingCard?.name }}
            </span>
          </div>
        </transition>
      </div>
    </div>

    <!-- Extra Deck Section (0 - 15 Cards in Columns Grid Dropzone) -->
    <div
      class="deck-section deck-section--extra"
      :class="{
        'deck-section--drop-active': isPoolDraggingToExtra,
        'deck-section--drag-over': isExtraDragOver,
      }"
      @dragover="onExtraDragOver"
      @dragleave="onExtraDragLeave"
      @drop="onExtraDrop"
    >
      <div class="section-title-bar">
        <div class="title-left">
          <span class="section-title">Extra Deck (Fusion)</span>
          <span
            class="count-badge"
            :class="{
              'count-badge--legal': store.extraDeckCount <= 15,
              'count-badge--illegal': store.extraDeckCount > 15,
            }"
          >
            {{ store.extraDeckCount }} / 15
          </span>
        </div>
        <span class="stat-pill stat-pill--fusions">
          🌀 {{ store.deckStats.fusions }}
        </span>
      </div>

      <!-- Extra Deck Grid (Cards arranged in columns) -->
      <div ref="extraScrollRef" class="deck-cards-scrollable deck-cards-scrollable--extra">
        <div v-if="extraDeckCards.length > 0" class="deck-cards-grid">
          <div
            v-for="item in extraDeckCards"
            :key="item.id"
            class="deck-card-tile deck-card-tile--fusion"
            :class="{
              'deck-card-tile--dragging': store.isDragging && store.draggingCard?.id === item.id,
            }"
            draggable="true"
            title="Drag to remove from deck"
            @mouseenter="onCardHover(item.card)"
            @click="onCardHover(item.card)"
            @contextmenu.prevent="onCardHover(item.card)"
            @dragstart="onDeckCardDragStart($event, item, true)"
            @dragend="onDeckCardDragEnd"
          >
            <!-- Card Thumbnail -->
            <div class="tile-thumb-wrap">
              <img
                :src="getCardImageUrl(item.id, 'mini')"
                :alt="item.card?.name || 'Card'"
                class="tile-thumb-img"
                loading="lazy"
                @error="handleImageError"
              />

              <!-- Quantity Pill Badge (x1, x2, x3) -->
              <div class="tile-count-badge" :class="`tile-count-badge--${item.count}`">
                x{{ item.count }}
              </div>

              <!-- Drag Handle Indicator Icon on Hover -->
              <div class="tile-drag-badge" title="Drag to remove">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
                </svg>
              </div>
            </div>

            <!-- Compact Title & Stats Strip -->
            <div class="tile-info-strip">
              <span class="tile-name" :title="item.card?.name">{{ item.card?.name || `Card #${item.id}` }}</span>
              <div class="tile-stats">
                <span class="tile-atk">
                  ⚔{{ (item.card?.atk ?? 0) < 0 ? '?' : (item.card?.atk ?? 0) }}
                </span>
                <span v-if="(item.card?.level ?? 0) > 0" class="tile-lvl">
                  ★{{ item.card?.level }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="section-empty">
          <span class="empty-hint">Extra Deck empty (optional, max 15 Fusions). Drag fusion cards here.</span>
        </div>

        <!-- Extra Deck Dropzone Overlay Highlight -->
        <transition name="fade">
          <div
            v-if="isExtraDragOver"
            class="deck-drop-overlay deck-drop-overlay--extra"
          >
            <span class="drop-action-icon">🌀</span>
            <span class="drop-action-text">Drop to Add to Extra Deck</span>
            <span class="drop-action-sub">
              {{ store.draggingCard?.name }}
            </span>
          </div>
        </transition>
      </div>
    </div>

    <!-- Clear Deck Confirmation Modal -->
    <YugiModal
      v-model="showClearModal"
      title="Clear Deck Cards?"
      accent="ai"
      width="440px"
    >
      <p class="modal-body-text">
        Are you sure you want to remove all cards from <strong>"{{ store.activeDeck.name }}"</strong>?
        This action cannot be undone.
      </p>
      <template #footer>
        <div class="modal-footer-actions">
          <YugiButton variant="secondary" size="sm" @click="showClearModal = false">
            Cancel
          </YugiButton>
          <YugiButton variant="danger" size="sm" icon="🧹" @click="onConfirmClear">
            Clear Deck
          </YugiButton>
        </div>
      </template>
    </YugiModal>

    <!-- Delete Deck Confirmation Modal -->
    <YugiModal
      v-model="showDeleteModal"
      title="Delete Custom Deck?"
      accent="ai"
      width="440px"
    >
      <p class="modal-body-text">
        Are you sure you want to permanently delete <strong>"{{ store.activeDeck.name }}"</strong>?
      </p>
      <template #footer>
        <div class="modal-footer-actions">
          <YugiButton variant="secondary" size="sm" @click="showDeleteModal = false">
            Cancel
          </YugiButton>
          <YugiButton variant="danger" size="sm" icon="🗑️" @click="onConfirmDelete">
            Delete Deck
          </YugiButton>
        </div>
      </template>
    </YugiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import type { CardDetail } from '../../../shared/types/card.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
import YugiModal from '../common/YugiModal.vue';
import YugiButton from '../common/YugiButton.vue';
import DeckSelectorAutocomplete from './DeckSelectorAutocomplete.vue';
import { audioManager } from '../../audio/index.js';

const store = useDeckEditStore();

const deckNameInput = ref(store.activeDeck.name);
const showClearModal = ref(false);
const showDeleteModal = ref(false);

const isMainDragOver = ref(false);
const isExtraDragOver = ref(false);
const isTrashDragOver = ref(false);

const mainScrollRef = ref<HTMLElement | null>(null);
const extraScrollRef = ref<HTMLElement | null>(null);

watch(
  () => store.activeDeck.name,
  (newName) => {
    deckNameInput.value = newName;
  },
);

const validity = computed(() => store.deckValidity);

const isDraggingFromDeck = computed(
  () => store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck'),
);

const isPoolDraggingToMain = computed(
  () =>
    store.isDragging &&
    (store.dragSource === 'pool' || store.dragSource === 'previewer') &&
    (!store.draggingCard || !store.draggingCard.isExtraDeck),
);

const isPoolDraggingToExtra = computed(
  () =>
    store.isDragging &&
    (store.dragSource === 'pool' || store.dragSource === 'previewer') &&
    Boolean(store.draggingCard?.isExtraDeck),
);

interface EnrichedDeckCard {
  id: number;
  count: number;
  isExtra: boolean;
  uniqueKey?: string;
  card: CardDetail | null;
}

const isGroupedView = ref(true);

function sortEnrichedCards(a: EnrichedDeckCard, b: EnrichedDeckCard): number {
  const cardA = a.card;
  const cardB = b.card;
  if (!cardA || !cardB) return 0;

  const getCat = (c: CardDetail) => (c.isMonster ? 1 : c.isSpell ? 2 : 3);
  const catA = getCat(cardA);
  const catB = getCat(cardB);
  if (catA !== catB) return catA - catB;

  if (cardA.isMonster && cardB.isMonster) {
    if (cardA.level !== cardB.level) return cardB.level - cardA.level;
    if (cardA.atk !== cardB.atk) return cardB.atk - cardA.atk;
  }
  return cardA.name.localeCompare(cardB.name);
}

// Cleanly sort deck: Monsters first (Level desc, ATK desc, Name asc), then Spells, then Traps
const mainDeckCards = computed<EnrichedDeckCard[]>(() => {
  if (isGroupedView.value) {
    const list = store.mainDeckGrouped.map((item) => ({
      ...item,
      uniqueKey: `grouped-${item.id}`,
      card: store.cardMap.get(item.id) ?? null,
    }));
    return list.sort(sortEnrichedCards);
  } else {
    const list = store.activeDeck.main.map((id, index) => ({
      id,
      count: 1,
      isExtra: false,
      uniqueKey: `single-${id}-${index}`,
      card: store.cardMap.get(id) ?? null,
    }));
    return list.sort(sortEnrichedCards);
  }
});

const extraDeckCards = computed<EnrichedDeckCard[]>(() => {
  const list = store.extraDeckGrouped.map((item) => ({
    ...item,
    card: store.cardMap.get(item.id) ?? null,
  }));

  return list.sort((a, b) => {
    const cardA = a.card;
    const cardB = b.card;
    if (!cardA || !cardB) return 0;
    if (cardA.level !== cardB.level) return cardB.level - cardA.level;
    if (cardA.atk !== cardB.atk) return cardB.atk - cardA.atk;
    return cardA.name.localeCompare(cardB.name);
  });
});

function onDeckAutocompleteSelect(deckId: string): void {
  store.selectDeck(deckId);
}

function onNameInput(): void {
  store.setDeckName(deckNameInput.value);
}

function onNewDeckClick(): void {
  const nextNum = store.customDecks.length + 1;
  store.newDeck(`Custom Deck ${nextNum}`);
}

function onCardHover(card: CardDetail | null): void {
  if (card) {
    store.setHoveredCard(card);
  }
}

function onConfirmClear(): void {
  store.clearCurrentDeck();
  audioManager.playSfx('deck-card-trash');
  showClearModal.value = false;
}

function onConfirmDelete(): void {
  store.deleteCurrentDeck();
  audioManager.playSfx('deck-card-trash');
  showDeleteModal.value = false;
}

function handleSaveDeck(): void {
  store.saveCurrentDeck();
  audioManager.playSfx('deck-save');
}

function getCardKindClass(card: CardDetail | null): string {
  if (!card) return 'unknown';
  if (card.isFusion) return 'fusion';
  if (card.isSpell) return 'spell';
  if (card.isTrap) return 'trap';
  if (card.isEffect) return 'effect';
  return 'normal';
}

// Drag from Deck to Remove / Reorder
function onDeckCardDragStart(e: DragEvent, item: EnrichedDeckCard, isExtra: boolean): void {
  if (e.dataTransfer && item.card) {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ cardId: item.id, isExtra, source: isExtra ? 'extra-deck' : 'main-deck' }),
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  }
  if (item.card) {
    audioManager.playSfx('deck-drag-start');
    store.startDrag(item.card, isExtra ? 'extra-deck' : 'main-deck');
  }
}

function onDeckCardDragEnd(): void {
  store.endDrag();
  isMainDragOver.value = false;
  isExtraDragOver.value = false;
  isTrashDragOver.value = false;
}

// Main Deck Dropzone Handlers
function onMainDragOver(e: DragEvent): void {
  if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    isMainDragOver.value = true;
  }
}

function onMainDragLeave(e: DragEvent): void {
  const related = e.relatedTarget as HTMLElement | null;
  if (!mainScrollRef.value?.contains(related)) {
    isMainDragOver.value = false;
  }
}

function onMainDrop(e: DragEvent): void {
  isMainDragOver.value = false;
  if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
    e.preventDefault();
    audioManager.playSfx('deck-card-drop');
    store.dropOnMainDeck();
    store.endDrag();
  }
}

// Extra Deck Dropzone Handlers
function onExtraDragOver(e: DragEvent): void {
  if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    isExtraDragOver.value = true;
  }
}

function onExtraDragLeave(e: DragEvent): void {
  const related = e.relatedTarget as HTMLElement | null;
  if (!extraScrollRef.value?.contains(related)) {
    isExtraDragOver.value = false;
  }
}

function onExtraDrop(e: DragEvent): void {
  isExtraDragOver.value = false;
  if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
    e.preventDefault();
    audioManager.playSfx('deck-card-drop');
    store.dropOnExtraDeck();
    store.endDrag();
  }
}

// Trash Zone Drop Handlers
function onTrashDragOver(e: DragEvent): void {
  if (store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    isTrashDragOver.value = true;
  }
}

function onTrashDrop(e: DragEvent): void {
  isTrashDragOver.value = false;
  if (store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')) {
    e.preventDefault();
    audioManager.playSfx('deck-card-trash');
    store.dropOnRemove();
    store.endDrag();
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.deck-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: $space-3;
  box-sizing: border-box;
  background: rgba(14, 18, 26, 0.78);
  border: 1px solid rgba(201, 162, 39, 0.35);
  border-radius: 14px;
  gap: $space-2;
  overflow: hidden;
}

.deck-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: $space-2;
  border-bottom: 1px solid rgba(201, 162, 39, 0.25);
}

.deck-select-row {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.deck-label {
  font-family: $font-family-display;
  font-size: 0.75rem;
  font-weight: 700;
  color: $color-gold-300;
  text-transform: uppercase;
  white-space: nowrap;
}

.deck-dropdown {
  flex: 1;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 4px;
  font-family: $font-family-body;
  font-size: 0.85rem;
  color: $color-text-primary;
  padding: 0 8px;
  outline: none;

  &:focus {
    border-color: $color-gold-500;
  }

  option {
    background: #12161e;
    color: $color-text-primary;
  }
}

.deck-name-row {
  position: relative;
  display: flex;
  align-items: center;
}

.deck-name-input {
  width: 100%;
  height: 34px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 4px;
  padding: 0 24px 0 10px;
  font-family: $font-family-display;
  font-size: 0.95rem;
  font-weight: 700;
  color: $color-gold-100;
  outline: none;

  &:focus {
    border-color: $color-gold-500;
    box-shadow: 0 0 6px rgba(201, 162, 39, 0.3);
    background: rgba(0, 0, 0, 0.6);
  }
}

.dirty-indicator {
  position: absolute;
  right: 8px;
  color: $color-warning;
  font-size: 0.9rem;
}

.deck-toolbar-container {
  min-height: 32px;
  display: flex;
  align-items: center;
}

.deck-toolbar {
  display: flex;
  gap: 4px;
  width: 100%;
}

.deck-trash-zone {
  width: 100%;
  height: 32px;
  background: rgba(235, 87, 87, 0.2);
  border: 2px dashed rgba(235, 87, 87, 0.7);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 160ms ease;
  animation: pulse-border 1.5s infinite alternate;

  &--hover {
    background: rgba(235, 87, 87, 0.45);
    border-color: #ff6b6b;
    box-shadow: 0 0 12px rgba(235, 87, 87, 0.6);
    transform: scale(1.02);
  }
}

@keyframes pulse-border {
  0% { border-color: rgba(235, 87, 87, 0.4); }
  100% { border-color: rgba(235, 87, 87, 0.9); }
}

.trash-icon {
  font-size: 1rem;
}

.trash-text {
  font-family: $font-family-display;
  font-size: 0.76rem;
  font-weight: 700;
  color: #ff8787;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 30px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 4px;
  font-family: $font-family-display;
  font-size: 0.72rem;
  font-weight: 700;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(201, 162, 39, 0.2);
    border-color: $color-gold-500;
    color: $color-gold-100;
  }

  &--save {
    background: linear-gradient(180deg, rgba(201, 162, 39, 0.35) 0%, rgba(140, 110, 22, 0.45) 100%);
    border-color: $color-gold-500;
    color: $color-gold-100;

    &:hover {
      background: linear-gradient(180deg, rgba(227, 197, 103, 0.5) 0%, rgba(201, 162, 39, 0.6) 100%);
      box-shadow: 0 0 8px rgba(201, 162, 39, 0.3);
    }
  }

  &--danger {
    &:hover:not(:disabled) {
      background: rgba(235, 87, 87, 0.25);
      border-color: $color-danger;
      color: #fca5a5;
    }
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.validity-banner {
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 180ms ease;

  &--legal {
    background: rgba(46, 204, 113, 0.15);
    border: 1px solid rgba(46, 204, 113, 0.45);
  }

  &--illegal {
    background: rgba(235, 87, 87, 0.15);
    border: 1px solid rgba(235, 87, 87, 0.45);
  }
}

.validity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.validity-badge {
  font-family: $font-family-display;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;

  .validity-banner--legal & {
    color: #2ecc71;
    text-shadow: 0 0 6px rgba(46, 204, 113, 0.4);
  }

  .validity-banner--illegal & {
    color: #e74c3c;
    text-shadow: 0 0 6px rgba(231, 76, 60, 0.4);
  }
}

.validity-summary {
  font-size: 0.75rem;
  color: $color-text-secondary;
  font-family: $font-family-numeric;
}

.validity-errors {
  font-size: 0.75rem;
  color: #fca5a5;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 50px;
  overflow-y: auto;
}

.deck-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  transition: all 200ms ease;

  &--main {
    flex: 3;
  }

  &--extra {
    flex: 1.3;
  }

  &--drop-active {
    .deck-cards-scrollable {
      border: 2px dashed rgba(201, 162, 39, 0.6);
      background: rgba(201, 162, 39, 0.04);
    }
  }

  &--drag-over {
    .deck-cards-scrollable {
      border: 2px solid $color-gold-300;
      box-shadow: 0 0 20px rgba(201, 162, 39, 0.3) inset;
    }
  }
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(201, 162, 39, 0.2);
  border-radius: 6px 6px 0 0;
}

.title-left {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.section-title {
  font-family: $font-family-display;
  font-size: 0.82rem;
  font-weight: 700;
  color: $color-gold-300;
  text-transform: uppercase;
}

.count-badge {
  font-family: $font-family-numeric;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;

  &--legal {
    background: rgba(46, 204, 113, 0.2);
    border: 1px solid #2ecc71;
    color: #a3e4d7;
  }

  &--illegal {
    background: rgba(235, 87, 87, 0.2);
    border: 1px solid #e74c3c;
    color: #f5b7b1;
  }
}

.view-toggle-pill {
  font-family: $font-family-display;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(201, 162, 39, 0.15);
  border: 1px solid rgba(201, 162, 39, 0.35);
  color: $color-gold-300;
  cursor: pointer;
  transition: all 140ms ease;
  white-space: nowrap;

  &:hover {
    background: rgba(201, 162, 39, 0.35);
    border-color: $color-gold-500;
    color: #fff;
    box-shadow: 0 0 6px rgba(201, 162, 39, 0.3);
  }
}

.stats-pills {
  display: flex;
  gap: 4px;
}

.stat-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.05);

  &--monsters {
    color: #f1948a;
  }
  &--spells {
    color: #85c1e9;
  }
  &--traps {
    color: #f8c471;
  }
  &--fusions {
    color: #d2b4de;
  }
}

.deck-cards-scrollable {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: rgba(5, 7, 10, 0.5);
  border: 1px solid rgba(201, 162, 39, 0.15);
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 6px;
  transition: all 180ms ease;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.3);
    border-radius: 4px;
  }
}

// Columns Grid Layout for Cards in Deck
.deck-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
}

.deck-card-tile {
  display: flex;
  flex-direction: column;
  height: 154px;
  background: rgba(18, 22, 30, 0.9);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 160ms ease, border-color 160ms ease, opacity 160ms ease;
  user-select: none;
  box-sizing: border-box;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: $color-gold-300;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(227, 197, 103, 0.35);
    z-index: 2;

    .tile-remove-overlay {
      opacity: 1;
    }
    .tile-drag-badge {
      opacity: 1;
    }
  }

  &--normal {
    border-top: 2px solid #d4ac0d;
  }
  &--effect {
    border-top: 2px solid #e67e22;
  }
  &--spell {
    border-top: 2px solid #1abc9c;
  }
  &--trap {
    border-top: 2px solid #e91e63;
  }
  &--fusion {
    border-top: 2px solid #9b59b6;
  }

  &--dragging {
    opacity: 0.35;
    border-style: dashed;
    border-color: #ff6b6b;
    transform: scale(0.95);
  }
}

.tile-thumb-wrap {
  position: relative;
  width: 100%;
  height: 112px;
  background: #000;
  overflow: hidden;
}

.tile-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile-count-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  padding: 1px 5px;
  border-radius: 8px;
  font-family: $font-family-display;
  font-size: 0.68rem;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &--1 {
    background: rgba(255, 255, 255, 0.15);
    color: #f3f4f6;
  }
  &--2 {
    background: rgba(47, 128, 237, 0.85);
    border-color: #8dc5fe;
    box-shadow: 0 0 6px rgba(47, 128, 237, 0.6);
  }
  &--3 {
    background: rgba(46, 204, 113, 0.85);
    border-color: #a3e4d7;
    box-shadow: 0 0 6px rgba(46, 204, 113, 0.6);
  }
}

.tile-drag-badge {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(201, 162, 39, 0.5);
  color: $color-gold-300;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 140ms ease;
  pointer-events: none;
}

.tile-remove-overlay {
  position: absolute;
  inset: 0;
  background: rgba(235, 87, 87, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 140ms ease;
  pointer-events: none;
}

.remove-icon {
  font-size: 1.4rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.tile-info-strip {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 42px;
  padding: 3px 5px;
  background: rgba(10, 13, 18, 0.95);
  box-sizing: border-box;
}

.tile-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  color: $color-text-secondary;
}

.tile-atk {
  font-family: $font-family-numeric;
  color: #f1948a;
  font-weight: 700;
}

.tile-type {
  font-family: $font-family-display;
  font-weight: 700;
  color: #a3e4d7;
  font-size: 0.62rem;
}

.tile-lvl {
  color: #f4d03f;
  font-weight: 700;
}

.deck-drop-overlay {
  position: absolute;
  inset: 6px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  z-index: 30;
  backdrop-filter: blur(6px);
  pointer-events: none;

  &--main {
    background: rgba(15, 20, 30, 0.92);
    border: 2px dashed $color-gold-300;
    box-shadow: 0 0 20px rgba(201, 162, 39, 0.4) inset;
  }

  &--extra {
    background: rgba(22, 12, 32, 0.92);
    border: 2px dashed #9b59b6;
    box-shadow: 0 0 20px rgba(155, 89, 182, 0.4) inset;
  }
}

.drop-action-icon {
  font-size: 2rem;
}

.drop-action-text {
  font-family: $font-family-display;
  font-size: 1.1rem;
  font-weight: 800;
  color: $color-gold-100;
  letter-spacing: 0.05em;
  text-shadow: 0 0 10px rgba(201, 162, 39, 0.6);
}

.drop-action-sub {
  font-size: 0.82rem;
  color: $color-text-secondary;
  max-width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: $space-3;
  text-align: center;
}

.empty-hint {
  font-size: 0.78rem;
  color: $color-text-muted;
  line-height: 1.4;
}

.modal-body-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: $color-text-primary;
  margin: 0;

  strong {
    color: $color-gold-300;
  }
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: $space-2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
