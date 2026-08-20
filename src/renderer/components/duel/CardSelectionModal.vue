<template>
  <YugiModal
    :model-value="modelValue"
    :width="'920px'"
    :accent="'user'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Modal Header -->
    <template #header>
      <div class="selection-modal-header">
        <div class="header-left">
          <span class="header-icon">{{ primaryLocationIcon }}</span>
          <div class="header-titles">
            <h3 class="header-title">{{ headerTitle }}</h3>
            <p class="header-subtitle">{{ instruction }}</p>
          </div>
        </div>

        <div class="header-right">
          <!-- Location Pill Badge -->
          <span class="location-pill" :class="`location-pill--${primaryLocationName.toLowerCase()}`">
            {{ primaryLocationName }}
          </span>
          <!-- Selection Counter Badge -->
          <span
            class="selection-counter-badge"
            :class="{
              'selection-counter-badge--complete': isSelectionComplete,
              'selection-counter-badge--pending': !isSelectionComplete,
            }"
          >
            {{ selectedIndices.length }} / {{ max }} Selected
          </span>
        </div>
      </div>
    </template>

    <!-- Modal Body: Search / Filter Bar & Card Grid -->
    <div class="selection-modal-body">
      <!-- Search & Filter Controls (If more than 6 cards) -->
      <div v-if="enrichedCards.length > 6" class="selection-filter-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filter cards by name, ATK, DEF, level, or type..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            class="search-clear-btn"
            title="Clear search"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>
        <div class="filter-count">
          Showing {{ filteredCards.length }} of {{ enrichedCards.length }}
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCards.length === 0" class="selection-empty">
        <span class="empty-icon">📭</span>
        <p class="empty-title">
          {{ searchQuery ? 'No cards match your filter' : 'No selectable cards available' }}
        </p>
        <p v-if="searchQuery" class="empty-subtitle">
          Try a different search term or clear the filter.
        </p>
      </div>

      <!-- Card Selection Grid -->
      <div v-else class="selection-grid">
        <div
          v-for="card in filteredCards"
          :key="`sel-${card.selectIndex}-${card.code}`"
          class="selection-tile"
          :class="{
            'selection-tile--selected': card.isSelected,
            'selection-tile--selectable': true,
          }"
          @mouseenter="onMouseEnter(card)"
          @mouseleave="onMouseLeave"
          @click="onCardClick(card)"
          @dblclick="onCardDblClick(card)"
        >
          <!-- Selection Order / Checkmark Overlay Badge -->
          <div v-if="card.isSelected" class="tile-selected-badge">
            <span class="check-icon">✓</span>
            <span v-if="max > 1" class="order-number">#{{ card.selectionOrder }}</span>
          </div>

          <!-- Card Art Thumbnail -->
          <div class="tile-art-container">
            <img
              :src="getCardImageUrl(card.code, 'full')"
              :alt="card.name"
              class="tile-art-img"
              @error="handleImageError"
            />
            <div class="tile-art-glow"></div>
          </div>

          <!-- Card Information Metadata -->
          <div class="tile-info">
            <div class="tile-name" :title="card.name">
              {{ card.name }}
            </div>

            <!-- Monster Combat & Level Stats -->
            <div v-if="card.isMonster" class="tile-stats">
              <div class="tile-meta-row">
                <span v-if="card.level" class="tile-level">⭐ {{ card.level }}</span>
                <span
                  v-if="card.attribute"
                  class="tile-attribute"
                  :class="`tile-attribute--${card.attribute.toLowerCase()}`"
                >
                  {{ card.attribute }}
                </span>
              </div>
              <div class="tile-combat-row">
                <span class="stat-atk">{{ card.atk ?? 0 }}</span>
                <span class="stat-separator">/</span>
                <span class="stat-def">{{ card.def ?? 0 }}</span>
              </div>
            </div>

            <!-- Spell / Trap Meta -->
            <div v-else class="tile-spell-meta">
              <span
                class="tile-type-tag"
                :class="card.attribute === 'TRAP' ? 'tag--trap' : 'tag--spell'"
              >
                {{ card.attribute === 'TRAP' ? 'TRAP' : 'SPELL' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <template #footer>
      <div class="selection-modal-footer">
        <div class="footer-left">
          <!-- Minimize / View Field Button -->
          <button
            type="button"
            class="action-btn action-btn--minimize"
            title="Temporarily minimize dialog to inspect field"
            @click="$emit('minimize')"
          >
            <span class="btn-icon">👁️</span>
            <span>View Field</span>
          </button>
        </div>

        <div class="footer-right">
          <!-- Cancel / Pass Button (if can_cancel or min === 0) -->
          <button
            v-if="canCancel || min === 0"
            type="button"
            class="action-btn action-btn--cancel"
            @click="$emit('cancel')"
          >
            <span>Cancel</span>
          </button>

          <!-- Confirm Selection Button -->
          <button
            type="button"
            class="action-btn action-btn--confirm"
            :disabled="!isSelectionValid"
            @click="$emit('confirm')"
          >
            <span class="btn-icon">✓</span>
            <span>Confirm ({{ selectedIndices.length }}/{{ max }})</span>
          </button>
        </div>
      </div>
    </template>
  </YugiModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { SelectCardPayload, SelectTributePayload } from '../../../shared/types/duel.js';
import type { FieldCard } from '../../../shared/types/field.js';
import { useDuelStore } from '../../stores/duelStore.js';
import YugiModal from '../common/YugiModal.vue';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';

interface EnrichedSelectCard {
  selectIndex: number;
  code: number;
  name: string;
  location: number;
  locationName: string;
  sequence: number;
  position?: number;
  controller: number;
  owner: 'user' | 'ai';
  isMonster: boolean;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  race?: string;
  type?: string;
  desc?: string;
  isSelected: boolean;
  selectionOrder: number;
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    selectPayload: SelectCardPayload | SelectTributePayload | null;
    selectedIndices: number[];
    canCancel?: boolean;
    min?: number;
    max?: number;
    instruction?: string;
    subText?: string;
  }>(),
  {
    canCancel: false,
    min: 1,
    max: 1,
    instruction: 'Select card(s) to proceed with the active effect.',
    subText: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'toggle-target', selectIndex: number): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'minimize'): void;
  (e: 'hover-card', card: FieldCard | null): void;
}>();

const duelStore = useDuelStore();
const searchQuery = ref('');

function getLocationName(loc: number): string {
  if (loc === 1) return 'DECK';
  if (loc === 2) return 'HAND';
  if (loc === 4) return 'MONSTER ZONE';
  if (loc === 8) return 'SPELL/TRAP';
  if (loc === 16) return 'GRAVEYARD';
  if (loc === 32) return 'BANISHED';
  if (loc === 64) return 'EXTRA DECK';
  return 'FIELD';
}

function getLocationIcon(loc: number): string {
  if (loc === 1) return '🎴';
  if (loc === 2) return '🃏';
  if (loc === 4) return '⚔️';
  if (loc === 8) return '📜';
  if (loc === 16) return '🪦';
  if (loc === 32) return '🌀';
  if (loc === 64) return '⚡';
  return '🎯';
}

const enrichedCards = computed<EnrichedSelectCard[]>(() => {
  if (!props.selectPayload || !props.selectPayload.selects) return [];

  return props.selectPayload.selects.map((item, originalIndex) => {
    const detail = duelStore.getCardDetail(item.code);
    const loc = item.location || 1;
    const locName = getLocationName(loc);
    const owner = item.controller === duelStore.userPlayerId ? 'user' : 'ai';
    const isMonster = detail?.isMonster ?? (detail?.atk !== undefined || (detail?.level ?? 0) > 0);

    const isSelected = props.selectedIndices.includes(originalIndex);
    const orderIdx = props.selectedIndices.indexOf(originalIndex);

    return {
      selectIndex: originalIndex,
      code: item.code,
      name: item.cardName && item.cardName !== 'Card' ? item.cardName : detail?.name || `Card #${item.code}`,
      location: loc,
      locationName: locName,
      sequence: item.sequence,
      position: 'position' in item ? (item as any).position : 1,
      controller: item.controller,
      owner,
      isMonster,
      atk: detail?.atk,
      def: detail?.def,
      level: detail?.level,
      attribute: detail?.attributeName,
      race: detail?.raceName,
      type: detail?.type,
      desc: detail?.desc,
      isSelected,
      selectionOrder: orderIdx >= 0 ? orderIdx + 1 : 0,
    };
  });
});

const filteredCards = computed<EnrichedSelectCard[]>(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return enrichedCards.value;

  return enrichedCards.value.filter((c) => {
    if (c.name.toLowerCase().includes(query)) return true;
    if (c.attribute && c.attribute.toLowerCase().includes(query)) return true;
    if (c.race && c.race.toLowerCase().includes(query)) return true;
    if (c.type && c.type.toLowerCase().includes(query)) return true;
    if (c.level && String(c.level) === query) return true;
    if (c.atk !== undefined && String(c.atk).includes(query)) return true;
    if (c.def !== undefined && String(c.def).includes(query)) return true;
    return false;
  });
});

const primaryLocation = computed<number>(() => {
  if (enrichedCards.value.length === 0) return 1;
  return enrichedCards.value[0].location;
});

const primaryLocationName = computed<string>(() => {
  return getLocationName(primaryLocation.value);
});

const primaryLocationIcon = computed<string>(() => {
  return getLocationIcon(primaryLocation.value);
});

const headerTitle = computed<string>(() => {
  const loc = primaryLocation.value;
  if (loc === 1) return 'Select Card from Deck';
  if (loc === 16) return 'Select Target from Graveyard';
  if (loc === 2) return 'Select Card from Hand';
  if (loc === 64) return 'Select from Extra Deck';
  if (loc === 32) return 'Select Banished Card';
  if (loc === 4) return 'Select Monster Target';
  return 'Select Card Target';
});

const isSelectionValid = computed<boolean>(() => {
  const count = props.selectedIndices.length;
  return count >= props.min && count <= props.max;
});

const isSelectionComplete = computed<boolean>(() => {
  return props.selectedIndices.length >= props.max;
});

function onMouseEnter(card: EnrichedSelectCard): void {
  const fieldCard: FieldCard = {
    id: `sel-${card.selectIndex}-${card.code}`,
    code: card.code,
    name: card.name,
    type: card.isMonster ? 'monster' : 'spell',
    location: card.location === 4 ? 'monster' : card.location === 8 ? 'spell-trap' : 'graveyard',
    sequence: card.sequence,
    controller: card.owner,
    position: 'faceup_attack',
    atk: card.atk,
    def: card.def,
    level: card.level,
    attribute: card.attribute,
    race: card.race,
    description: card.desc,
  };
  emit('hover-card', fieldCard);
}

function onMouseLeave(): void {
  emit('hover-card', null);
}

function onCardClick(card: EnrichedSelectCard): void {
  emit('toggle-target', card.selectIndex);
}

function onCardDblClick(card: EnrichedSelectCard): void {
  // If single selection, double click selects and confirms immediately
  if (props.max === 1) {
    if (!card.isSelected) {
      emit('toggle-target', card.selectIndex);
    }
    setTimeout(() => {
      emit('confirm');
    }, 50);
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.selection-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 1.5rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.header-icon {
  font-size: 1.8rem;
  line-height: 1;
  filter: drop-shadow(0 2px 8px rgba(201, 162, 39, 0.4));
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.header-title {
  font-family: $font-display;
  font-size: 1.3rem;
  font-weight: 700;
  color: $color-gold-300;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
  margin: 0;
}

.header-subtitle {
  font-family: $font-body;
  font-size: 0.85rem;
  color: $color-text-muted;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.location-pill {
  font-family: $font-mono;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  text-transform: uppercase;
  background: rgba(201, 162, 39, 0.15);
  color: $color-gold-300;
  border: 1px solid rgba(201, 162, 39, 0.4);

  &--deck {
    background: rgba(66, 153, 225, 0.2);
    color: #90cdf4;
    border-color: rgba(66, 153, 225, 0.5);
  }
  &--graveyard {
    background: rgba(159, 122, 234, 0.2);
    color: #d6bcfa;
    border-color: rgba(159, 122, 234, 0.5);
  }
  &--hand {
    background: rgba(72, 187, 120, 0.2);
    color: #9ae6b4;
    border-color: rgba(72, 187, 120, 0.5);
  }
}

.selection-counter-badge {
  font-family: $font-mono;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.05em;

  &--pending {
    background: rgba(237, 137, 54, 0.2);
    color: #fbd38d;
    border: 1px solid rgba(237, 137, 54, 0.5);
  }

  &--complete {
    background: rgba(72, 187, 120, 0.25);
    color: #68d391;
    border: 1px solid rgba(72, 187, 120, 0.6);
    box-shadow: 0 0 10px rgba(72, 187, 120, 0.3);
  }
}

.selection-modal-body {
  max-height: 62vh;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 162, 39, 0.3) rgba(0, 0, 0, 0.4);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.3);
    border-radius: 3px;
  }
}

.selection-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding: 0 0.25rem;
  gap: 1rem;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 450px;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 0.75rem;
    font-size: 0.9rem;
    color: $color-text-muted;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: rgba(12, 16, 22, 0.85);
    border: 1px solid rgba(201, 162, 39, 0.3);
    border-radius: 6px;
    padding: 0.45rem 2rem 0.45rem 2.2rem;
    font-family: $font-body;
    font-size: 0.85rem;
    color: $color-text-primary;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: $color-gold-300;
      box-shadow: 0 0 10px rgba(201, 162, 39, 0.3);
      background: rgba(16, 22, 30, 0.95);
    }

    &::placeholder {
      color: $color-text-muted;
    }
  }

  .search-clear-btn {
    position: absolute;
    right: 0.6rem;
    background: none;
    border: none;
    color: $color-text-muted;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0.2rem;

    &:hover {
      color: $color-text-primary;
    }
  }
}

.filter-count {
  font-family: $font-mono;
  font-size: 0.8rem;
  color: $color-text-muted;
}

.selection-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: $color-text-muted;

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  .empty-title {
    font-family: $font-display;
    font-size: 1.1rem;
    color: $color-gold-300;
    margin: 0 0 0.25rem 0;
  }
  .empty-subtitle {
    font-family: $font-body;
    font-size: 0.85rem;
    color: $color-text-muted;
    margin: 0;
  }
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 135px));
  justify-content: center;
  gap: 0.85rem;
}

.selection-tile {
  position: relative;
  background: rgba(18, 22, 28, 0.9);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 0.45rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

  &:hover {
    transform: translateY(-4px) scale(1.03);
    background: rgba(26, 32, 42, 0.95);
    border-color: rgba(201, 162, 39, 0.5);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.8), 0 0 12px rgba(201, 162, 39, 0.2);
  }

  &--selected {
    border-color: $color-gold-300 !important;
    background: rgba(35, 42, 54, 0.98) !important;
    box-shadow: 0 0 18px rgba(201, 162, 39, 0.5), 0 8px 24px rgba(0, 0, 0, 0.9) !important;
    transform: translateY(-5px) scale(1.04);
  }
}

.tile-selected-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 10;
  background: $color-gold-500;
  color: #0d1117;
  font-family: $font-mono;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  animation: pulse-badge 1.5s infinite ease-in-out;

  .check-icon {
    font-size: 0.85rem;
  }
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.tile-art-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1.45;
  border-radius: 4px;
  overflow: hidden;
  background: #0d1117;
  margin-bottom: 0.45rem;
}

.tile-art-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile-art-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 70%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

.tile-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tile-name {
  font-family: $font-display;
  font-size: 0.78rem;
  font-weight: 700;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
}

.tile-stats {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tile-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: $font-mono;
  font-size: 0.68rem;
  color: $color-text-muted;
}

.tile-level {
  color: #ecc94b;
  font-weight: 700;
}

.tile-attribute {
  font-weight: 700;
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.08);

  &--dark { color: #b794f4; background: rgba(183, 148, 244, 0.15); }
  &--light { color: #f6e05e; background: rgba(246, 224, 94, 0.15); }
  &--earth { color: #ed8936; background: rgba(237, 137, 54, 0.15); }
  &--water { color: #63b3ed; background: rgba(99, 179, 237, 0.15); }
  &--fire { color: #fc8181; background: rgba(252, 129, 129, 0.15); }
  &--wind { color: #68d391; background: rgba(104, 211, 145, 0.15); }
  &--divine { color: #f6ad55; background: rgba(246, 173, 85, 0.25); }
}

.tile-combat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-family: $font-mono;
  font-size: 0.75rem;
  font-weight: 700;
}

.stat-atk {
  color: #fc8181;
}

.stat-separator {
  color: $color-text-muted;
  opacity: 0.5;
}

.stat-def {
  color: #63b3ed;
}

.tile-spell-meta {
  display: flex;
  justify-content: center;
}

.tile-type-tag {
  font-family: $font-mono;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 3px;
  text-transform: uppercase;

  &.tag--spell {
    color: #4fd1c5;
    background: rgba(79, 209, 197, 0.15);
    border: 1px solid rgba(79, 209, 197, 0.3);
  }

  &.tag--trap {
    color: #f687b3;
    background: rgba(246, 135, 179, 0.15);
    border: 1px solid rgba(246, 135, 179, 0.3);
  }
}

.selection-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.25rem 0.25rem 0.25rem;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: $font-display;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.55rem 1.15rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid transparent;

  .btn-icon {
    font-size: 1rem;
  }

  &--minimize {
    background: rgba(255, 255, 255, 0.06);
    color: $color-text-secondary;
    border-color: rgba(255, 255, 255, 0.15);

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: $color-text-primary;
    }
  }

  &--cancel {
    background: rgba(229, 62, 62, 0.15);
    color: #feb2b2;
    border-color: rgba(229, 62, 62, 0.4);

    &:hover {
      background: rgba(229, 62, 62, 0.3);
      color: #fff;
    }
  }

  &--confirm {
    background: linear-gradient(135deg, $color-gold-500 0%, $color-gold-700 100%);
    color: #0d1117;
    border-color: $color-gold-300;
    box-shadow: 0 0 15px rgba(201, 162, 39, 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, $color-gold-300 0%, $color-gold-500 100%);
      box-shadow: 0 0 20px rgba(201, 162, 39, 0.6);
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
      filter: grayscale(0.5);
    }
  }
}
</style>
