<template>
  <YugiModal
    :model-value="modelValue"
    title="Select Opponent Deck"
    accent="gold"
    width="640px"
    @close="handleClose"
  >
    <div class="opponent-deck-select">
      <div class="opponent-deck-select__header-info">
        <span class="opponent-deck-select__target-name">{{ opponent?.name || 'Opponent' }}</span>
        <p class="opponent-deck-select__subtitle">
          Select which deck this duelist will wield in the upcoming duel, or choose Random for a surprise matchup.
        </p>
      </div>

      <!-- Random Deck Option (Default) -->
      <div
        class="opponent-deck-select__card opponent-deck-select__card--random"
        :class="{ 'opponent-deck-select__card--active': !isManual }"
        tabindex="0"
        role="button"
        @click="handleSelectRandom"
        @keydown.enter="handleSelectRandom"
        @keydown.space.prevent="handleSelectRandom"
      >
        <div class="opponent-deck-select__card-icon">🎲</div>
        <div class="opponent-deck-select__card-content">
          <div class="opponent-deck-select__card-top">
            <h4 class="opponent-deck-select__card-title">Random Deck (Default)</h4>
            <span v-if="!isManual" class="opponent-deck-select__badge opponent-deck-select__badge--active">
              ✓ ACTIVE
            </span>
          </div>
          <p class="opponent-deck-select__card-desc">
            A random deck is chosen from {{ opponent?.name || 'this character' }}'s {{ opponent?.decks.length || 10 }} authentic decks at the start of each match.
          </p>
        </div>
      </div>

      <div class="opponent-deck-select__divider">
        <span>OR CHOOSE SPECIFIC DECK</span>
      </div>

      <!-- Specific Decks List -->
      <div class="opponent-deck-select__list">
        <div
          v-for="(deck, idx) in opponent?.decks || []"
          :key="deck.id"
          class="opponent-deck-select__card"
          :class="{
            'opponent-deck-select__card--active': isManual && selectedDeck?.id === deck.id,
          }"
          tabindex="0"
          role="button"
          @click="handleSelectDeck(deck)"
          @keydown.enter="handleSelectDeck(deck)"
          @keydown.space.prevent="handleSelectDeck(deck)"
        >
          <div class="opponent-deck-select__card-num">
            {{ idx + 1 }}
          </div>
          <div class="opponent-deck-select__card-content">
            <div class="opponent-deck-select__card-top">
              <div class="opponent-deck-select__title-group">
                <h4 class="opponent-deck-select__card-title">{{ deck.name }}</h4>
                <span class="opponent-deck-select__tag">{{ deck.archetype }}</span>
              </div>
              <span
                v-if="isManual && selectedDeck?.id === deck.id"
                class="opponent-deck-select__badge opponent-deck-select__badge--active"
              >
                ✓ SELECTED
              </span>
            </div>

            <p class="opponent-deck-select__card-desc">{{ deck.description }}</p>

            <div class="opponent-deck-select__meta-row">
              <span class="opponent-deck-select__card-count">
                📦 {{ deck.mainCards.length }} Main Cards
              </span>
              <span v-if="deck.extraCards && deck.extraCards.length > 0" class="opponent-deck-select__extra-count">
                • 🔮 {{ deck.extraCards.length }} Extra Deck
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </YugiModal>
</template>

<script setup lang="ts">
import type { CharacterData, CharacterDeckData } from '../../../shared/types/character.js';
import { audioManager } from '../../audio/index.js';
import YugiModal from './YugiModal.vue';

interface Props {
  modelValue: boolean;
  opponent: CharacterData | null;
  selectedDeck: CharacterDeckData | null;
  isManual: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', deck: CharacterDeckData | null): void;
}>();

function handleClose(): void {
  emit('update:modelValue', false);
}

function handleSelectRandom(): void {
  audioManager.playSfx('ui-click');
  emit('select', null);
  handleClose();
}

function handleSelectDeck(deck: CharacterDeckData): void {
  audioManager.playSfx('ui-click');
  emit('select', deck);
  handleClose();
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.opponent-deck-select {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  max-height: 65vh;
  overflow-y: auto;
  padding-right: $space-2;

  &__header-info {
    border-bottom: 1px solid rgba($color-gold-500, 0.2);
    padding-bottom: $space-2;
  }

  &__target-name {
    font-family: $font-display;
    font-size: $font-size-lg;
    font-weight: 800;
    color: $color-gold-300;
    letter-spacing: 0.05em;
  }

  &__subtitle {
    font-family: $font-body;
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin: $space-1 0 0;
  }

  &__divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: $space-1 0;

    &::before,
    &::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba($color-gold-500, 0.15);
    }

    span {
      padding: 0 $space-2;
      font-family: $font-mono;
      font-size: $font-size-xs;
      color: $color-gold-500;
      letter-spacing: 0.1em;
      opacity: 0.8;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__card {
    display: flex;
    align-items: flex-start;
    gap: $space-3;
    background: rgba($color-bg-panel-solid, 0.7);
    border: 1px solid rgba($color-gold-500, 0.2);
    border-radius: $radius-md;
    padding: $space-3;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    outline: none;

    &:hover,
    &:focus-visible {
      background: rgba($color-bg-panel-solid, 0.95);
      border-color: rgba($color-gold-300, 0.6);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    }

    &--active {
      background: rgba($color-gold-900, 0.35);
      border-color: $color-gold-300;
      box-shadow: 0 0 16px rgba($color-gold-500, 0.25);
    }

    &--random {
      background: rgba(30, 41, 59, 0.5);
      border-color: rgba(96, 165, 250, 0.3);

      &:hover,
      &:focus-visible {
        border-color: rgba(96, 165, 250, 0.8);
      }

      &.opponent-deck-select__card--active {
        background: rgba(30, 58, 138, 0.4);
        border-color: #60a5fa;
        box-shadow: 0 0 16px rgba(96, 165, 250, 0.3);
      }
    }
  }

  &__card-icon {
    font-size: 24px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: $radius-sm;
    flex-shrink: 0;
  }

  &__card-num {
    font-family: $font-display;
    font-size: $font-size-md;
    font-weight: 800;
    color: $color-gold-300;
    width: 32px;
    height: 32px;
    background: rgba($color-gold-900, 0.4);
    border: 1px solid rgba($color-gold-500, 0.3);
    border-radius: $radius-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__card-content {
    flex: 1;
    min-width: 0;
  }

  &__card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $space-2;
  }

  &__title-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-2;
  }

  &__card-title {
    font-family: $font-display;
    font-size: $font-size-sm;
    font-weight: 700;
    color: $color-text-primary;
    margin: 0;
    letter-spacing: 0.02em;
  }

  &__tag {
    font-family: $font-mono;
    font-size: 11px;
    color: $color-gold-300;
    background: rgba($color-gold-900, 0.5);
    border: 1px solid rgba($color-gold-500, 0.3);
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  &__badge {
    font-family: $font-mono;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
    flex-shrink: 0;

    &--active {
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
  }

  &__card-desc {
    font-family: $font-body;
    font-size: $font-size-xs;
    color: $color-text-secondary;
    margin: $space-1 0 0;
    line-height: 1.4;
  }

  &__meta-row {
    display: flex;
    align-items: center;
    gap: $space-2;
    margin-top: $space-1;
    font-family: $font-mono;
    font-size: 11px;
    color: rgba($color-text-primary, 0.6);
  }
}
</style>
