<template>
  <div class="card-previewer glass-panel glass-panel--elevated">
    <!-- Header with Card Name and Attribute Emblem -->
    <div v-if="card" class="previewer-header">
      <div class="header-main">
        <h3 class="card-name" :title="card.name">{{ card.name }}</h3>
        <span class="era-badge" :class="`era-badge--${card.era.toLowerCase()}`">{{ card.era }}</span>
      </div>
      <div class="attribute-tag" :class="`attribute-tag--${card.attributeName.toLowerCase()}`">
        {{ card.attributeName }}
      </div>
    </div>

    <!-- Main Card Body -->
    <div v-if="card" class="previewer-body">
      <!-- Full Image Container -->
      <div class="card-image-wrap">
        <div
          class="card-frame-container"
          draggable="true"
          title="Drag into Deck"
          @dragstart="onPreviewDragStart"
          @dragend="onPreviewDragEnd"
        >
          <img
            :src="fullImageUrl"
            :alt="card.name"
            class="card-full-image"
            loading="lazy"
            @error="handleImageError"
          />
          <div class="foil-sweep-layer"></div>
          <div class="preview-drag-hint">
            <span>✋ Drag into Deck</span>
          </div>
        </div>
      </div>

      <!-- Monster Stars / Level / Rank -->
      <div v-if="card.isMonster && card.level > 0" class="level-stars-row">
        <span class="level-label">Level / Rank:</span>
        <div class="stars-list">
          <span v-for="i in card.level" :key="i" class="star-icon">★</span>
        </div>
        <span class="level-number">({{ card.level }})</span>
      </div>

      <!-- Type & Race Badges -->
      <div class="type-labels-row">
        <span
          v-for="(label, idx) in card.typeLabels"
          :key="idx"
          class="type-pill"
          :class="`type-pill--${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`"
        >
          {{ label }}
        </span>
      </div>

      <!-- ATK / DEF Row (For Monsters) -->
      <div v-if="card.isMonster" class="stat-boxes-row">
        <div class="stat-box stat-box--atk">
          <span class="stat-label">ATK</span>
          <span class="stat-val">{{ card.atk < 0 ? '?' : card.atk }}</span>
        </div>
        <div class="stat-box stat-box--def">
          <span class="stat-label">DEF</span>
          <span class="stat-val">{{ card.def < 0 ? '?' : card.def }}</span>
        </div>
      </div>

      <!-- Card Effect / Lore Description -->
      <div class="card-desc-container">
        <div class="desc-header">
          <span class="desc-title">{{ card.isNormal ? 'Card Lore' : 'Effect & Description' }}</span>
          <span class="passcode">ID: {{ card.id }}</span>
        </div>
        <div class="desc-scrollable">
          <p class="desc-text" :class="{ 'desc-text--lore': card.isNormal }">
            {{ card.desc }}
          </p>
        </div>
      </div>

      <!-- In-Deck Quantity Status & Drag Indicator -->
      <div class="previewer-actions">
        <div class="deck-quantity-status">
          <span class="quantity-label">In Deck:</span>
          <span
            class="quantity-count"
            :class="{
              'quantity-count--max': currentCopies >= 3,
              'quantity-count--active': currentCopies > 0,
            }"
          >
            x{{ currentCopies }} / 3
          </span>
        </div>
        <div class="drag-hint-pill">
          <span class="drag-hint-icon">✋</span>
          <span class="drag-hint-text">Drag image to Deck</span>
        </div>
      </div>
    </div>

    <!-- Empty / Fallback State -->
    <div v-else class="previewer-empty">
      <div class="empty-icon">🎴</div>
      <p class="empty-text">Hover over any card in the grid or deck list to view its full details.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { CardDetail } from '../../../shared/types/card.js';
import { getCardImageUrl, handleImageError, preloadCardImage } from '../../utils/media.js';
import { useDeckEditStore } from '../../stores/deckEditStore.js';

const store = useDeckEditStore();

const card = computed<CardDetail | null>(() => store.hoveredCard);

watch(
  () => card.value?.id,
  (newId) => {
    if (newId && newId > 0) {
      preloadCardImage(newId, 'full');
    }
  },
  { immediate: true },
);

const fullImageUrl = computed(() => {
  if (!card.value) return '';
  return getCardImageUrl(card.value.id, 'full');
});

const currentCopies = computed(() => {
  if (!card.value) return 0;
  return store.deckCardCounts.get(card.value.id) ?? 0;
});

function onPreviewDragStart(e: DragEvent): void {
  if (e.dataTransfer && card.value) {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ cardId: card.value.id, isExtra: card.value.isExtraDeck, source: 'previewer' }),
    );
    e.dataTransfer.effectAllowed = 'copy';
  }
  if (card.value) {
    store.startDrag(card.value, 'previewer');
  }
}

function onPreviewDragEnd(): void {
  store.endDrag();
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.card-previewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: $space-3;
  box-sizing: border-box;
  background: rgba(14, 18, 26, 0.78);
  border: 1px solid rgba(201, 162, 39, 0.35);
  border-radius: 14px;
  overflow: hidden;
}

.previewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-2;
  padding-bottom: $space-2;
  border-bottom: 1px solid rgba(201, 162, 39, 0.25);
  margin-bottom: $space-2;
}

.header-main {
  display: flex;
  align-items: center;
  gap: $space-2;
  min-width: 0;
}

.card-name {
  margin: 0;
  font-family: $font-family-display;
  font-size: 1.15rem;
  font-weight: 700;
  color: $color-gold-300;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 8px rgba(227, 197, 103, 0.3);
}

.era-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &--dm {
    background: rgba(201, 162, 39, 0.2);
    border: 1px solid $color-gold-500;
    color: $color-gold-100;
  }

  &--gx {
    background: rgba(86, 204, 242, 0.2);
    border: 1px solid $color-info;
    color: #a4e5fb;
  }
}

.attribute-tag {
  font-family: $font-family-display;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.08em;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: $color-text-primary;

  &--dark {
    background: rgba(142, 68, 173, 0.3);
    border-color: #9b59b6;
    color: #e8d7f1;
  }
  &--light {
    background: rgba(241, 196, 15, 0.25);
    border-color: #f39c12;
    color: #fff9d2;
  }
  &--earth {
    background: rgba(160, 100, 40, 0.3);
    border-color: #cd853f;
    color: #f5deb3;
  }
  &--water {
    background: rgba(41, 128, 185, 0.3);
    border-color: #3498db;
    color: #d6eaf8;
  }
  &--fire {
    background: rgba(192, 57, 43, 0.3);
    border-color: #e74c3c;
    color: #fadbd8;
  }
  &--wind {
    background: rgba(39, 174, 96, 0.3);
    border-color: #2ecc71;
    color: #d5f5e3;
  }
  &--divine {
    background: rgba(212, 175, 55, 0.4);
    border-color: #ffd700;
    color: #fff;
    text-shadow: 0 0 6px gold;
  }
  &--spell {
    background: rgba(26, 188, 156, 0.3);
    border-color: #1abc9c;
    color: #a3e4d7;
  }
  &--trap {
    background: rgba(233, 30, 99, 0.3);
    border-color: #e91e63;
    color: #f8bbd0;
  }
}

.previewer-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: $space-2;
}

.card-image-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 250px;
  flex-shrink: 0;
}

.card-frame-container {
  position: relative;
  height: 240px;
  width: 165px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 12px rgba(201, 162, 39, 0.2);
  border: 1px solid rgba(201, 162, 39, 0.4);
  cursor: grab;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 160ms ease;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(201, 162, 39, 0.4);

    .preview-drag-hint {
      opacity: 1;
    }
  }
}

.preview-drag-hint {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(201, 162, 39, 0.6);
  border-radius: 12px;
  padding: 2px 8px;
  font-family: $font-family-display;
  font-size: 0.68rem;
  font-weight: 700;
  color: $color-gold-300;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 140ms ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.card-full-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.foil-sweep-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    125deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 40%,
    rgba(255, 215, 0, 0.18) 50%,
    rgba(255, 255, 255, 0.08) 60%,
    transparent 100%
  );
  opacity: 0.7;
}

.level-stars-row {
  display: flex;
  align-items: center;
  gap: $space-1;
  font-size: 0.8rem;
  color: $color-text-secondary;
}

.level-label {
  font-weight: 600;
  font-size: 0.75rem;
}

.stars-list {
  display: flex;
  gap: 1px;
}

.star-icon {
  color: #f1c40f;
  font-size: 0.85rem;
  text-shadow: 0 0 4px rgba(241, 196, 15, 0.6);
}

.level-number {
  font-family: $font-family-display;
  font-weight: 700;
  color: $color-gold-300;
  font-size: 0.8rem;
}

.type-labels-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.type-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 4px;
  color: $color-text-primary;
}

.stat-boxes-row {
  display: flex;
  gap: $space-2;
}

.stat-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 6px;

  &--atk {
    border-left: 3px solid #e74c3c;
  }

  &--def {
    border-left: 3px solid #3498db;
  }
}

.stat-label {
  font-family: $font-family-display;
  font-size: 0.75rem;
  font-weight: 700;
  color: $color-text-secondary;
}

.stat-val {
  font-family: $font-family-numeric;
  font-size: 1.1rem;
  font-weight: 700;
  color: $color-gold-100;
  font-variant-numeric: tabular-nums;
}

.card-desc-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 120px;
  background: rgba(5, 7, 10, 0.6);
  border: 1px solid rgba(201, 162, 39, 0.2);
  border-radius: 6px;
  padding: $space-2;
  box-sizing: border-box;
  overflow: hidden;
}

.desc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 6px;
}

.desc-title {
  font-family: $font-family-display;
  font-size: 0.75rem;
  font-weight: 600;
  color: $color-gold-300;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.passcode {
  font-family: $font-family-numeric;
  font-size: 0.7rem;
  color: $color-text-muted;
}

.desc-scrollable {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.3);
    border-radius: 4px;
  }
}

.desc-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: #ded9cd;
  white-space: pre-wrap;

  &--lore {
    font-style: italic;
    color: #c9c3b4;
  }
}

.previewer-actions {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding-top: $space-1;
}

.deck-quantity-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: $color-text-secondary;
}

.quantity-count {
  font-family: $font-family-display;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 1px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: $color-text-muted;

  &--active {
    background: rgba(47, 128, 237, 0.2);
    border: 1px solid $color-user;
    color: #8dc5fe;
  }

  &--max {
    background: rgba(61, 220, 151, 0.2);
    border: 1px solid $color-success;
    color: #92f3c7;
  }
}

.drag-hint-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(201, 162, 39, 0.12);
  border: 1px dashed rgba(201, 162, 39, 0.4);
  color: $color-gold-300;
  font-family: $font-family-display;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.drag-hint-icon {
  font-size: 0.95rem;
}

.previewer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: $space-4;
  color: $color-text-muted;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: $space-2;
  opacity: 0.6;
}

.empty-text {
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 240px;
}
</style>
