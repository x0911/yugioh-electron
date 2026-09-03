<template>
  <div
    ref="containerRef"
    class="virtual-card-grid-container"
    :class="{
      'virtual-card-grid-container--drop-active': store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck'),
      'virtual-card-grid-container--drag-over': isPoolDragOver,
    }"
    @scroll="onScroll"
    @dragover="onPoolDragOver"
    @dragleave="onPoolDragLeave"
    @drop="onPoolDrop"
  >
    <!-- Virtual Spacer to provide total scroll height -->
    <div
      v-if="totalCards > 0"
      class="virtual-scroll-spacer"
      :style="{ height: `${totalGridHeight}px` }"
    ></div>

    <!-- Visible Virtual Rows Window -->
    <div
      v-if="totalCards > 0"
      class="virtual-items-viewport"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="card in visibleCards"
        :key="card.id"
        class="card-grid-item"
        :class="{
          'card-grid-item--in-deck': getCardCopies(card) > 0,
          'card-grid-item--max': getCardCopies(card) >= 3,
          'card-grid-item--dragging': store.isDragging && store.draggingCard?.id === card.id,
          'card-grid-item--filter-active': store.deckFilterCard?.id === card.id,
        }"
        draggable="true"
        @mouseenter="onCardHover(card)"
        @click="onCardClick(card)"
        @contextmenu.prevent="onCardRightClick(card)"
        @dragstart="onDragStart($event, card)"
        @dragend="onDragEnd"
      >
        <!-- Card Mini Thumbnail Container -->
        <div class="card-thumb-wrapper">
          <img
            :src="getCardImageUrl(card.id, 'mini')"
            :alt="card.name"
            class="card-thumb-img"
            loading="lazy"
            @error="handleImageError"
          />

          <!-- Active Filter Badge -->
          <div
            v-if="store.deckFilterCard?.id === card.id"
            class="card-filtered-badge"
            title="Filtering Decks with this Card"
          >
            🎴 FILTERED
          </div>

          <!-- Quantity Badge in Deck (x0, x1, x2, x3) -->
          <div
            class="card-count-badge"
            :class="{
              'card-count-badge--active': getCardCopies(card) > 0,
              'card-count-badge--max': getCardCopies(card) >= 3,
            }"
          >
            x{{ getCardCopies(card) }}
          </div>

          <!-- Quick Deck Filter Button on Card -->
          <button
            type="button"
            class="card-quick-find-decks-btn"
            :class="{ 'card-quick-find-decks-btn--active': store.deckFilterCard?.id === card.id }"
            :title="store.deckFilterCard?.id === card.id ? 'Clear deck filter' : `Find decks containing ${card.name}`"
            @click.stop="toggleCardDeckFilter(card)"
          >
            🗂️
          </button>

          <!-- Drag Handle / Indicator Icon on Hover -->
          <div class="card-drag-indicator" title="Drag to Deck">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
            </svg>
          </div>

          <!-- Extra Deck / Fusion Indicator -->
          <span v-if="card.isExtraDeck" class="extra-badge" title="Extra Deck (Fusion)">EX</span>

          <!-- Era Tag Pill -->
          <span class="card-era-tag" :class="`card-era-tag--${card.era.toLowerCase()}`">
            {{ card.era }}
          </span>
        </div>

        <!-- Compact Card Title & Stats -->
        <div class="card-info-strip">
          <span class="card-title-text" :title="card.name">{{ card.name }}</span>
          <div class="card-quick-stats">
            <span v-if="card.isMonster" class="quick-atk">
              ⚔ {{ card.atk < 0 ? '?' : card.atk }}
            </span>
            <span v-else class="quick-type">
              {{ card.isSpell ? 'SPELL' : 'TRAP' }}
            </span>
            <span v-if="card.isMonster && card.level > 0" class="quick-lvl">
              ★{{ card.level }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Drop to Remove Overlay (Appears when dragging a card from Deck into Card Pool) -->
    <transition name="fade">
      <div
        v-if="store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')"
        class="pool-drop-remove-zone"
        :class="{ 'pool-drop-remove-zone--hover': isPoolDragOver }"
      >
        <div class="drop-remove-content">
          <span class="drop-remove-icon">🗑️</span>
          <h3 class="drop-remove-title">Drop Here to Remove from Deck</h3>
          <p class="drop-remove-subtitle">
            Release "{{ store.draggingCard?.name || 'Card' }}" to remove 1 copy
          </p>
        </div>
      </div>
    </transition>

    <!-- Empty State -->
    <div v-if="totalCards === 0" class="grid-empty-state">
      <div class="empty-icon">🔍</div>
      <h4 class="empty-title">No Cards Found</h4>
      <p class="empty-desc">
        No cards match the active filters. Try adjusting your search query, attribute, or level filters.
      </p>
      <button type="button" class="clear-filters-cta" @click="store.resetFilters">
        Reset All Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import type { CardDetail } from '../../../shared/types/card.js';
import { getCardImageUrl, handleImageError, preloadCardImage } from '../../utils/media.js';

const store = useDeckEditStore();

const containerRef = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const containerHeight = ref(600);
const containerWidth = ref(800);
const isPoolDragOver = ref(false);

// Geometry constants (in pixels)
const ITEM_WIDTH = 110;
const ITEM_HEIGHT = 188;
const GAP = 12;
const OVERSCAN_ROWS = 3;

// Live deck card copy counts
const deckCounts = computed(() => store.deckCardCounts);
const deckCanonicalCounts = computed(() => store.deckCanonicalCounts);

function getCardCopies(card: CardDetail): number {
  const canonId = card.alias && card.alias > 0 ? card.alias : card.id;
  return deckCanonicalCounts.value.get(canonId) ?? (deckCounts.value.get(card.id) ?? 0);
}

// Filtered cards list from Pinia
const cards = computed(() => store.filteredCards);
const totalCards = computed(() => cards.value.length);

// Calculate columns per row based on container width
const columnsCount = computed(() => {
  const availableWidth = containerWidth.value - 24; // padding
  const cols = Math.floor((availableWidth + GAP) / (ITEM_WIDTH + GAP));
  return Math.max(1, cols);
});

// Calculate total rows and total virtual height
const totalRows = computed(() => {
  if (totalCards.value === 0 || columnsCount.value === 0) return 0;
  return Math.ceil(totalCards.value / columnsCount.value);
});

const rowHeight = ITEM_HEIGHT + GAP;

const totalGridHeight = computed(() => {
  return totalRows.value * rowHeight;
});

// Visible row calculation
const startRow = computed(() => {
  const row = Math.floor(scrollTop.value / rowHeight) - OVERSCAN_ROWS;
  return Math.max(0, row);
});

const endRow = computed(() => {
  const row = Math.ceil((scrollTop.value + containerHeight.value) / rowHeight) + OVERSCAN_ROWS;
  return Math.min(totalRows.value, row);
});

const offsetY = computed(() => {
  return startRow.value * rowHeight;
});

// Sliced visible cards (only ~20-36 cards in DOM at any time)
const visibleCards = computed(() => {
  const startIdx = startRow.value * columnsCount.value;
  const endIdx = Math.min(totalCards.value, endRow.value * columnsCount.value);
  return cards.value.slice(startIdx, endIdx);
});

function onScroll(e: Event): void {
  const target = e.target as HTMLElement;
  scrollTop.value = target.scrollTop;
}

function updateDimensions(): void {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight || 600;
    containerWidth.value = containerRef.value.clientWidth || 800;
  }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateDimensions();
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(containerRef.value);
  }
  window.addEventListener('resize', updateDimensions);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener('resize', updateDimensions);
});

// Scroll to top when search query or filter changes significantly
watch(
  () => store.filters.query,
  () => {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0;
      scrollTop.value = 0;
    }
  },
);

function onCardHover(card: CardDetail): void {
  preloadCardImage(card.id, 'full');
  store.setHoveredCard(card);
}

function onCardClick(card: CardDetail): void {
  store.setHoveredCard(card);
}

function toggleCardDeckFilter(card: CardDetail): void {
  store.setHoveredCard(card);
  if (store.deckFilterCard?.id === card.id) {
    store.clearDeckFilterCard();
  } else {
    store.setDeckFilterCard(card);
  }
}

function onCardRightClick(card: CardDetail): void {
  toggleCardDeckFilter(card);
}

// HTML5 Drag & Drop handlers
function onDragStart(e: DragEvent, card: CardDetail): void {
  if (e.dataTransfer) {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ cardId: card.id, isExtra: card.isExtraDeck, source: 'pool' }),
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  }
  store.startDrag(card, 'pool');
}

function onDragEnd(): void {
  store.endDrag();
}

function onPoolDragOver(e: DragEvent): void {
  if (store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    isPoolDragOver.value = true;
  }
}

function onPoolDragLeave(e: DragEvent): void {
  const related = e.relatedTarget as HTMLElement | null;
  if (!containerRef.value?.contains(related)) {
    isPoolDragOver.value = false;
  }
}

function onPoolDrop(e: DragEvent): void {
  isPoolDragOver.value = false;
  if (store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')) {
    e.preventDefault();
    store.dropOnRemove();
    store.endDrag();
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.virtual-card-grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: $space-3;
  box-sizing: border-box;
  background: rgba(8, 11, 16, 0.6);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 12px;
  transition: border-color 200ms ease, box-shadow 200ms ease;

  &--drop-active {
    border-color: rgba(235, 87, 87, 0.5);
  }

  &--drag-over {
    border-color: rgba(235, 87, 87, 0.9);
    box-shadow: 0 0 20px rgba(235, 87, 87, 0.35) inset;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.35);
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.3);

    &:hover {
      background: rgba(201, 162, 39, 0.6);
    }
  }
}

.virtual-scroll-spacer {
  width: 100%;
  pointer-events: none;
}

.virtual-items-viewport {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px;
  pointer-events: auto;
}

.card-grid-item {
  width: 110px;
  height: 188px;
  display: flex;
  flex-direction: column;
  background: rgba(18, 22, 30, 0.85);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 160ms ease, border-color 160ms ease, opacity 160ms ease;
  user-select: none;
  box-sizing: border-box;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: $color-gold-300;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.6), 0 0 12px rgba(227, 197, 103, 0.4);
    z-index: 2;

    .card-drag-indicator {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &--in-deck {
    border-color: rgba(47, 128, 237, 0.7);
  }

  &--max {
    border-color: rgba(61, 220, 151, 0.8);
  }

  &--filter-active {
    border-color: $color-gold-500;
    box-shadow: 0 0 16px rgba(201, 162, 39, 0.6), inset 0 0 8px rgba(201, 162, 39, 0.3);
  }

  &--dragging {
    opacity: 0.4;
    border-style: dashed;
    border-color: $color-gold-300;
    transform: scale(0.95);
  }
}

.card-thumb-wrapper {
  position: relative;
  width: 100%;
  height: 140px;
  background: #000;
  overflow: hidden;
}

.card-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-filtered-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 2px 5px;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.95) 0%, rgba(161, 98, 7, 0.95) 100%);
  border: 1px solid #fef08a;
  border-radius: 3px;
  font-family: $font-family-display;
  font-size: 0.58rem;
  font-weight: 800;
  color: #1a1200;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  z-index: 5;
}

.card-quick-find-decks-btn {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: rgba(10, 14, 22, 0.8);
  border: 1px solid rgba(201, 162, 39, 0.4);
  color: $color-gold-300;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0;
  transition: all 140ms ease;
  z-index: 4;

  .card-grid-item:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(201, 162, 39, 0.35);
    border-color: $color-gold-300;
    color: #ffffff;
    transform: scale(1.1);
  }

  &--active {
    opacity: 1;
    background: rgba(239, 68, 68, 0.4);
    border-color: #ef4444;
    color: #ffffff;
  }
}

.card-drag-indicator {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(201, 162, 39, 0.5);
  color: $color-gold-300;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 140ms ease;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

.card-count-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-family: $font-family-display;
  font-size: 0.7rem;
  font-weight: 700;
  color: $color-text-muted;

  &--active {
    background: rgba(47, 128, 237, 0.85);
    border-color: #8dc5fe;
    color: #fff;
    box-shadow: 0 0 6px rgba(47, 128, 237, 0.6);
  }

  &--max {
    background: rgba(46, 204, 113, 0.85);
    border-color: #a3e4d7;
    color: #fff;
    box-shadow: 0 0 6px rgba(46, 204, 113, 0.6);
  }
}

.extra-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(142, 68, 173, 0.85);
  border: 1px solid #d2b4de;
  font-family: $font-family-display;
  font-size: 0.65rem;
  font-weight: 800;
  color: #fff;
}

.card-era-tag {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.7);

  &--dm {
    color: $color-gold-300;
    border: 1px solid rgba(201, 162, 39, 0.4);
  }

  &--gx {
    color: #a4e5fb;
    border: 1px solid rgba(86, 204, 242, 0.4);
  }
}

.card-info-strip {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 48px;
  padding: 4px 6px;
  background: rgba(10, 13, 18, 0.95);
  box-sizing: border-box;
}

.card-title-text {
  font-size: 0.74rem;
  font-weight: 600;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-quick-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.68rem;
  color: $color-text-secondary;
}

.quick-atk {
  font-family: $font-family-numeric;
  color: #f1948a;
  font-weight: 700;
}

.quick-type {
  font-family: $font-family-display;
  font-weight: 700;
  color: #a3e4d7;
  font-size: 0.64rem;
}

.quick-lvl {
  color: #f4d03f;
  font-weight: 700;
}

.pool-drop-remove-zone {
  position: absolute;
  inset: 12px;
  background: rgba(18, 10, 12, 0.88);
  border: 2px dashed rgba(235, 87, 87, 0.6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(8px);
  pointer-events: auto;
  transition: all 180ms ease;

  &--hover {
    background: rgba(45, 12, 16, 0.94);
    border-color: #ff6b6b;
    box-shadow: 0 0 30px rgba(235, 87, 87, 0.5) inset;
    transform: scale(1.01);
  }
}

.drop-remove-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

.drop-remove-icon {
  font-size: 2.8rem;
}

.drop-remove-title {
  font-family: $font-family-display;
  font-size: 1.3rem;
  color: #ff6b6b;
  margin: 0;
  letter-spacing: 0.05em;
  text-shadow: 0 0 10px rgba(235, 87, 87, 0.4);
}

.drop-remove-subtitle {
  font-size: 0.9rem;
  color: $color-text-secondary;
  margin: 0;
}

.grid-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: $space-5;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: $space-2;
  opacity: 0.5;
}

.empty-title {
  font-family: $font-family-display;
  font-size: 1.2rem;
  color: $color-gold-300;
  margin: 0 0 $space-1 0;
}

.empty-desc {
  font-size: 0.88rem;
  color: $color-text-secondary;
  max-width: 320px;
  margin-bottom: $space-3;
  line-height: 1.5;
}

.clear-filters-cta {
  padding: 8px 18px;
  background: rgba(201, 162, 39, 0.2);
  border: 1px solid $color-gold-500;
  border-radius: 6px;
  font-family: $font-family-display;
  font-size: 0.85rem;
  font-weight: 700;
  color: $color-gold-100;
  cursor: pointer;
  transition: all 180ms ease;

  &:hover {
    background: rgba(201, 162, 39, 0.35);
    box-shadow: 0 0 10px rgba(201, 162, 39, 0.3);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
