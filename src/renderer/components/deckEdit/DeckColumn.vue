<template>
  <div class="deck-column glass-panel glass-panel--elevated">
    <!-- Top Deck Management Bar -->
    <div class="deck-header">
      <!-- Deck Select Dropdown -->
      <div class="deck-select-row">
        <label class="deck-label">Active Deck:</label>
        <select
          :value="store.activeDeckId"
          class="deck-dropdown"
          @change="onSelectDeckChange"
        >
          <option v-for="d in store.customDecks" :key="d.id" :value="d.id">
            {{ d.name }} ({{ d.main.length }}/{{ d.extra.length }})
          </option>
        </select>
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

      <!-- Deck Action Toolbar Buttons -->
      <div class="deck-toolbar">
        <button
          type="button"
          class="tool-btn tool-btn--save"
          title="Save deck changes"
          @click="store.saveCurrentDeck"
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
      <div v-if="!validity.isValid && validity.errors.length > 0" class="validity-errors">
        <div v-for="(err, idx) in validity.errors" :key="idx" class="error-item">
          • {{ err }}
        </div>
      </div>
    </div>

    <!-- Main Deck Section (40 - 60 Cards in Columns Grid) -->
    <div class="deck-section deck-section--main">
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
      <div class="deck-cards-scrollable">
        <div v-if="mainDeckCards.length > 0" class="deck-cards-grid">
          <div
            v-for="item in mainDeckCards"
            :key="item.id"
            class="deck-card-tile"
            :class="`deck-card-tile--${getCardKindClass(item.card)}`"
            title="Click to remove 1 copy"
            @mouseenter="onCardHover(item.card)"
            @click="onRemoveCard(item.id, false)"
            @contextmenu.prevent="onCardHover(item.card)"
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

              <!-- Remove Overlay on Hover -->
              <div class="tile-remove-overlay">
                <span class="remove-icon">✕</span>
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
          <span class="empty-hint">Main Deck is empty. Click cards in the card pool to add them.</span>
        </div>
      </div>
    </div>

    <!-- Extra Deck Section (0 - 15 Cards in Columns Grid) -->
    <div class="deck-section deck-section--extra">
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
      <div class="deck-cards-scrollable deck-cards-scrollable--extra">
        <div v-if="extraDeckCards.length > 0" class="deck-cards-grid">
          <div
            v-for="item in extraDeckCards"
            :key="item.id"
            class="deck-card-tile deck-card-tile--fusion"
            title="Click to remove 1 copy"
            @mouseenter="onCardHover(item.card)"
            @click="onRemoveCard(item.id, true)"
            @contextmenu.prevent="onCardHover(item.card)"
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

              <!-- Remove Overlay on Hover -->
              <div class="tile-remove-overlay">
                <span class="remove-icon">✕</span>
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
          <span class="empty-hint">Extra Deck empty (optional, max 15 Fusions).</span>
        </div>
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

const store = useDeckEditStore();

const deckNameInput = ref(store.activeDeck.name);
const showClearModal = ref(false);
const showDeleteModal = ref(false);

watch(
  () => store.activeDeck.name,
  (newName) => {
    deckNameInput.value = newName;
  },
);

const validity = computed(() => store.deckValidity);

interface EnrichedDeckCard {
  id: number;
  count: number;
  isExtra: boolean;
  card: CardDetail | null;
}

// Cleanly sort deck: Monsters first (Level desc, ATK desc, Name asc), then Spells, then Traps
const mainDeckCards = computed<EnrichedDeckCard[]>(() => {
  const list = store.mainDeckGrouped.map((item) => ({
    ...item,
    card: store.cardMap.get(item.id) ?? null,
  }));

  return list.sort((a, b) => {
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
  });
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

function onSelectDeckChange(e: Event): void {
  const deckId = (e.target as HTMLSelectElement).value;
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

function onRemoveCard(cardId: number, isExtra: boolean): void {
  store.removeCardFromDeck(cardId, isExtra);
}

function onConfirmClear(): void {
  store.clearCurrentDeck();
  showClearModal.value = false;
}

function onConfirmDelete(): void {
  store.deleteCurrentDeck();
  showDeleteModal.value = false;
}

function getCardKindClass(card: CardDetail | null): string {
  if (!card) return 'unknown';
  if (card.isFusion) return 'fusion';
  if (card.isSpell) return 'spell';
  if (card.isTrap) return 'trap';
  if (card.isEffect) return 'effect';
  return 'normal';
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

.deck-toolbar {
  display: flex;
  gap: 4px;
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

  &--main {
    flex: 3;
  }

  &--extra {
    flex: 1.3;
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
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: rgba(5, 7, 10, 0.5);
  border: 1px solid rgba(201, 162, 39, 0.15);
  border-top: none;
  border-radius: 0 0 6px 6px;
  padding: 6px;

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
  cursor: pointer;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 160ms ease, border-color 160ms ease;
  user-select: none;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: $color-gold-300;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6), 0 0 10px rgba(227, 197, 103, 0.35);
    z-index: 2;

    .tile-remove-overlay {
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
</style>
