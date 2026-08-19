<template>
  <div v-if="hasActivePrompt" class="prompt-modal-backdrop">
    <div class="prompt-modal glass-panel" :class="{ 'prompt-modal--discard': isDiscardPrompt }">
      <!-- 1. End Phase Hand-Size Cleanup Discard Prompt -->
      <template v-if="isDiscardPrompt && selectCard">
        <div class="prompt-header prompt-header--warning">
          <span class="header-icon">⚠️</span>
          <div class="header-titles">
            <h3 class="header-title">Hand Size Limit Exceeded</h3>
            <p class="header-subtitle">
              You hold more than 6 cards at End Phase. Select {{ selectCard.min }} card(s) to discard.
            </p>
          </div>
        </div>

        <div class="card-selection-grid">
          <div
            v-for="(card, idx) in selectCard.selects"
            :key="`discard-${idx}-${card.code}`"
            class="card-select-tile"
            :class="{ 'card-select-tile--selected': selectedIndices.includes(idx) }"
            @click="toggleCardSelection(idx, selectCard.min)"
          >
            <div class="tile-art">
              <img
                :src="getCardImageUrl(card.code, 'mini')"
                :alt="card.cardName || 'Card'"
                class="tile-art-img"
                @error="handleArtFallback($event)"
              />
              <div v-if="selectedIndices.includes(idx)" class="tile-check-badge">
                ✓
              </div>
            </div>
            <span class="tile-name">{{ card.cardName || 'Card' }}</span>
          </div>
        </div>

        <div class="prompt-footer">
          <button
            class="action-btn action-btn--discard"
            :disabled="selectedIndices.length !== selectCard.min"
            @click="confirmCardSelection"
          >
            Discard ({{ selectedIndices.length }}/{{ selectCard.min }})
          </button>
        </div>
      </template>

      <!-- 2. General Card Selection Prompt -->
      <template v-else-if="selectCard">
        <div class="prompt-header">
          <span class="header-icon">🎯</span>
          <div class="header-titles">
            <h3 class="header-title">Select Card(s)</h3>
            <p class="header-subtitle">
              Select {{ selectCard.min }}{{ selectCard.max > selectCard.min ? ` to ${selectCard.max}` : '' }} card(s) to proceed.
            </p>
          </div>
        </div>

        <div class="card-selection-grid">
          <div
            v-for="(card, idx) in selectCard.selects"
            :key="`select-${idx}-${card.code}`"
            class="card-select-tile"
            :class="{ 'card-select-tile--selected': selectedIndices.includes(idx) }"
            @click="toggleCardSelection(idx, selectCard.max)"
          >
            <div class="tile-art">
              <img
                :src="getCardImageUrl(card.code, 'mini')"
                :alt="card.cardName || 'Card'"
                class="tile-art-img"
                @error="handleArtFallback($event)"
              />
              <div v-if="selectedIndices.includes(idx)" class="tile-check-badge">
                ✓
              </div>
            </div>
            <span class="tile-name">{{ card.cardName || 'Card' }}</span>
          </div>
        </div>

        <div class="prompt-footer">
          <button
            v-if="selectCard.can_cancel"
            class="action-btn action-btn--secondary"
            @click="cancelCardSelection"
          >
            Cancel
          </button>
          <button
            class="action-btn action-btn--primary"
            :disabled="selectedIndices.length < selectCard.min || selectedIndices.length > selectCard.max"
            @click="confirmCardSelection"
          >
            Confirm ({{ selectedIndices.length }}/{{ selectCard.max }})
          </button>
        </div>
      </template>

      <!-- 3. Battle Position Prompt -->
      <template v-else-if="selectPosition">
        <div class="prompt-header">
          <span class="header-icon">⚔️</span>
          <div class="header-titles">
            <h3 class="header-title">Select Battle Position</h3>
            <p class="header-subtitle">
              Choose the position for {{ selectPosition.cardName || 'your monster' }}.
            </p>
          </div>
        </div>

        <div class="position-choices">
          <button
            v-if="selectPosition.positions.includes(1)"
            class="position-btn position-btn--atk"
            @click="$emit('select-position', 1)"
          >
            <span class="pos-icon">⚔️</span>
            <span class="pos-label">Attack Position</span>
          </button>
          <button
            v-if="selectPosition.positions.includes(4)"
            class="position-btn position-btn--def"
            @click="$emit('select-position', 4)"
          >
            <span class="pos-icon">🛡️</span>
            <span class="pos-label">Face-up Defense</span>
          </button>
          <button
            v-if="selectPosition.positions.includes(8)"
            class="position-btn position-btn--def"
            @click="$emit('select-position', 8)"
          >
            <span class="pos-icon">🛡️</span>
            <span class="pos-label">Set (Face-down Defense)</span>
          </button>
        </div>
      </template>

      <!-- 4. Chain Prompt -->
      <template v-else-if="selectChain">
        <div class="prompt-header">
          <span class="header-icon">⚡</span>
          <div class="header-titles">
            <h3 class="header-title">Chain Effect Opportunity</h3>
            <p class="header-subtitle">
              {{ selectChain.forced ? 'Mandatory trigger effect requires activation.' : 'Activate an effect in response, or pass.' }}
            </p>
          </div>
        </div>

        <div class="chain-options">
          <button
            v-for="(item, idx) in selectChain.selects"
            :key="`chain-${idx}-${item.code}`"
            class="chain-btn"
            @click="$emit('select-chain', idx)"
          >
            <span class="chain-icon">✨</span>
            <div class="chain-info">
              <span class="chain-name">{{ item.cardName || 'Card Effect' }}</span>
              <span v-if="item.description" class="chain-desc">{{ item.description }}</span>
            </div>
          </button>
        </div>

        <div v-if="!selectChain.forced" class="prompt-footer">
          <button class="action-btn action-btn--secondary" @click="$emit('select-chain', null)">
            Pass (Do Not Chain)
          </button>
        </div>
      </template>

      <!-- 5. Effect Yes / No Prompt -->
      <template v-else-if="selectEffectYn">
        <div class="prompt-header">
          <span class="header-icon">❓</span>
          <div class="header-titles">
            <h3 class="header-title">Activate Card Effect?</h3>
            <p class="header-subtitle">
              Do you wish to activate the effect of "{{ selectEffectYn.cardName || 'this card' }}"?
            </p>
          </div>
        </div>

        <div class="prompt-footer prompt-footer--center">
          <button class="action-btn action-btn--secondary" @click="$emit('select-effect-yn', false)">
            No
          </button>
          <button class="action-btn action-btn--primary" @click="$emit('select-effect-yn', true)">
            Yes
          </button>
        </div>
      </template>

      <!-- 6. Options Selection Prompt -->
      <template v-else-if="selectOption">
        <div class="prompt-header">
          <span class="header-icon">📋</span>
          <div class="header-titles">
            <h3 class="header-title">Choose an Option</h3>
            <p class="header-subtitle">Select one of the following choices to continue.</p>
          </div>
        </div>

        <div class="options-list">
          <button
            v-for="(opt, idx) in selectOption.options"
            :key="`opt-${idx}`"
            class="action-btn action-btn--option"
            @click="$emit('select-option', idx)"
          >
            {{ opt }}
          </button>
        </div>
      </template>

      <!-- 7. Tribute Selection Prompt -->
      <template v-else-if="selectTribute">
        <div class="prompt-header">
          <span class="header-icon">🔥</span>
          <div class="header-titles">
            <h3 class="header-title">Select Tributes</h3>
            <p class="header-subtitle">
              Select {{ selectTribute.min }}{{ selectTribute.max > selectTribute.min ? ` to ${selectTribute.max}` : '' }} monster(s) to Tribute.
            </p>
          </div>
        </div>

        <div class="card-selection-grid">
          <div
            v-for="(card, idx) in selectTribute.selects"
            :key="`trib-${idx}-${card.code}`"
            class="card-select-tile"
            :class="{ 'card-select-tile--selected': selectedIndices.includes(idx) }"
            @click="toggleCardSelection(idx, selectTribute.max)"
          >
            <div class="tile-art">
              <img
                :src="getCardImageUrl(card.code, 'mini')"
                :alt="card.cardName || 'Monster'"
                class="tile-art-img"
                @error="handleArtFallback($event)"
              />
              <div v-if="selectedIndices.includes(idx)" class="tile-check-badge">
                ✓
              </div>
            </div>
            <span class="tile-name">{{ card.cardName || 'Monster' }}</span>
          </div>
        </div>

        <div class="prompt-footer">
          <button
            class="action-btn action-btn--primary"
            :disabled="selectedIndices.length < selectTribute.min || selectedIndices.length > selectTribute.max"
            @click="confirmTributeSelection"
          >
            Confirm Tribute ({{ selectedIndices.length }}/{{ selectTribute.max }})
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type {
  SelectCardPayload,
  SelectChainPayload,
  SelectPositionPayload,
  SelectEffectYnPayload,
  SelectOptionPayload,
  SelectTributePayload,
} from '../../../shared/types/duel.js';
import { getCardImageUrl } from '../../utils/media.js';

const props = defineProps<{
  selectCard: SelectCardPayload | null;
  selectChain: SelectChainPayload | null;
  selectPosition: SelectPositionPayload | null;
  selectEffectYn: SelectEffectYnPayload | null;
  selectOption: SelectOptionPayload | null;
  selectTribute: SelectTributePayload | null;
}>();

const emit = defineEmits<{
  (e: 'select-card', indices: number[]): void;
  (e: 'select-position', position: number): void;
  (e: 'select-chain', index: number | null): void;
  (e: 'select-effect-yn', yes: boolean): void;
  (e: 'select-option', index: number): void;
  (e: 'select-tribute', indices: number[]): void;
}>();

const selectedIndices = ref<number[]>([]);

// Clear selection whenever a new prompt appears
watch(
  () => [props.selectCard, props.selectTribute],
  () => {
    selectedIndices.value = [];
  },
  { immediate: true },
);

const isDiscardPrompt = computed(() => {
  return !!props.selectCard?.isDiscardPrompt;
});

const hasActivePrompt = computed(() => {
  return (
    !!props.selectCard ||
    !!props.selectChain ||
    !!props.selectPosition ||
    !!props.selectEffectYn ||
    !!props.selectOption ||
    !!props.selectTribute
  );
});

function toggleCardSelection(idx: number, maxAllowed: number): void {
  const existingPos = selectedIndices.value.indexOf(idx);
  if (existingPos >= 0) {
    selectedIndices.value.splice(existingPos, 1);
  } else {
    if (selectedIndices.value.length < maxAllowed) {
      selectedIndices.value.push(idx);
    } else if (maxAllowed === 1) {
      selectedIndices.value = [idx];
    }
  }
}

function confirmCardSelection(): void {
  emit('select-card', [...selectedIndices.value]);
}

function cancelCardSelection(): void {
  emit('select-card', []);
}

function confirmTributeSelection(): void {
  emit('select-tribute', [...selectedIndices.value]);
}

function handleArtFallback(event: Event): void {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.prompt-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(4, 6, 10, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.prompt-modal {
  width: 100%;
  max-width: 580px;
  background: rgba(18, 22, 30, 0.95);
  border: 1px solid $color-gold-500;
  border-radius: 16px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.9),
    0 0 30px rgba(201, 162, 39, 0.35);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: modalPop 0.25s cubic-bezier(0.22, 1, 0.36, 1);

  &--discard {
    border-color: #eb5757;
    box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.9),
      0 0 30px rgba(235, 87, 87, 0.35);
  }
}

.prompt-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .header-icon {
    font-size: 2rem;
  }

  .header-titles {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header-title {
    margin: 0;
    font-family: 'Cinzel', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: $color-gold-100;
    letter-spacing: 0.05em;
  }

  .header-subtitle {
    margin: 0;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.95rem;
    color: rgba(245, 241, 230, 0.8);
    line-height: 1.4;
  }

  &--warning .header-title {
    color: #ff9999;
  }
}

.card-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
  background: rgba(10, 13, 18, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(201, 162, 39, 0.15);
}

.card-select-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(26, 32, 44, 0.8);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  .tile-art {
    position: relative;
    width: 80px;
    height: 116px;
    border-radius: 4px;
    overflow: hidden;
    background: #0d1117;
    border: 1px solid rgba(201, 162, 39, 0.3);

    .tile-art-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .tile-check-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: $color-gold-500;
      color: #1a1406;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 0.8rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
    }
  }

  .tile-name {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    color: #f5f1e6;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: $color-gold-300;
    background: rgba(201, 162, 39, 0.15);
  }

  &--selected {
    border-color: $color-gold-500;
    background: rgba(201, 162, 39, 0.25);
    box-shadow: 0 0 14px rgba(201, 162, 39, 0.4);
  }
}

.position-choices {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.position-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 28px;
  border-radius: 12px;
  background: rgba(26, 32, 44, 0.8);
  border: 1px solid rgba(201, 162, 39, 0.3);
  color: #f5f1e6;
  font-family: 'Oxanium', monospace, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  .pos-icon {
    font-size: 2rem;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  }

  &--atk:hover {
    background: rgba(235, 87, 87, 0.25);
    border-color: #eb5757;
    color: #ffb8b8;
  }

  &--def:hover {
    background: rgba(47, 128, 237, 0.25);
    border-color: #2f80ed;
    color: #c4e0ff;
  }
}

.chain-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
}

.chain-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(26, 32, 44, 0.8);
  border: 1px solid rgba(201, 162, 39, 0.35);
  color: #f5f1e6;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;

  .chain-icon {
    font-size: 1.3rem;
  }

  .chain-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .chain-name {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: $color-gold-100;
  }

  .chain-desc {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.8rem;
    color: rgba(245, 241, 230, 0.7);
  }

  &:hover {
    background: rgba(201, 162, 39, 0.25);
    border-color: $color-gold-300;
    transform: translateX(4px);
  }
}

.prompt-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  &--center {
    justify-content: center;
  }
}

.action-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-family: 'Oxanium', monospace, sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &--primary {
    background: $color-gold-500;
    border: 1px solid $color-gold-300;
    color: #1a1406;

    &:hover:not(:disabled) {
      background: $color-gold-300;
      box-shadow: 0 4px 16px rgba(201, 162, 39, 0.5);
      transform: translateY(-1px);
    }
  }

  &--discard {
    background: #eb5757;
    border: 1px solid #ff7b7b;
    color: #ffffff;

    &:hover:not(:disabled) {
      background: #ff5252;
      box-shadow: 0 4px 16px rgba(235, 87, 87, 0.6);
      transform: translateY(-1px);
    }
  }

  &--secondary {
    background: rgba(30, 36, 48, 0.7);
    border: 1px solid rgba(201, 162, 39, 0.3);
    color: #f5f1e6;

    &:hover {
      background: rgba(201, 162, 39, 0.2);
      border-color: $color-gold-300;
    }
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
