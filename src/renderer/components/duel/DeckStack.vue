<template>
  <div
    class="deck-stack"
    :class="[
      `deck-stack--${type}`,
      `deck-stack--${player}`,
      {
        'deck-stack--empty': count === 0,
        'deck-stack--has-cards': count > 0,
      },
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <Tooltip :content="tooltipContent" position="top">
      <div class="stack-container">
        <!-- 3D Stack Layer Offsets (Creates physical card deck depth) -->
        <div v-if="count >= 15" class="stack-layer stack-layer--3"></div>
        <div v-if="count >= 5" class="stack-layer stack-layer--2"></div>
        <div v-if="count >= 1" class="stack-layer stack-layer--1"></div>

        <!-- Top Surface Card -->
        <div class="stack-top-card">
          <!-- Empty State -->
          <div v-if="count === 0" class="stack-empty">
            <div class="stack-type-icon">
              <span v-if="type === 'graveyard'">🪦</span>
              <span v-else-if="type === 'banished'">🌀</span>
              <span v-else-if="type === 'extra'">⚡</span>
              <span v-else>🎴</span>
            </div>
            <span class="stack-label">{{ label || type.toUpperCase() }}</span>
            <span class="stack-count-zero">0</span>
          </div>

          <!-- Graveyard with top card -->
          <div v-else-if="type === 'graveyard' && topCard" class="card-art-surface">
            <img
              :src="getCardImageUrl(topCard.code, 'mini')"
              :alt="topCard.name"
              class="top-card-img"
              @error="handleImageError"
            />
            <div class="stack-overlay-info">
              <span class="stack-name-tag">{{ topCard.name }}</span>
            </div>
          </div>

          <!-- Banished with top card -->
          <div v-else-if="type === 'banished' && topCard" class="card-art-surface">
            <img
              :src="getCardImageUrl(topCard.code, 'mini')"
              :alt="topCard.name"
              class="top-card-img"
              @error="handleImageError"
            />
          </div>

          <!-- Main Deck or Extra Deck (Face-down Card Back) -->
          <div v-else class="card-back-surface">
            <img
              :src="getCardBackUrl()"
              alt="Deck Back"
              class="top-card-img"
              @error="handleImageError"
            />
          </div>

          <div class="card-foil-sheen"></div>
        </div>

        <!-- Stack Count Badge -->
        <div class="count-badge" :class="{ 'count-badge--zero': count === 0 }">
          <span class="count-num">{{ count }}</span>
        </div>

        <!-- Stack Title Bar -->
        <div class="stack-title-pill">
          {{ displayTitle }}
        </div>
      </div>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard } from '../../../shared/types/field.js';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import Tooltip from '../common/Tooltip.vue';

const props = withDefaults(
  defineProps<{
    type: 'deck' | 'extra' | 'graveyard' | 'banished';
    player: 'user' | 'ai';
    count: number;
    topCard?: FieldCard | null;
    label?: string;
  }>(),
  {
    topCard: null,
    label: '',
  },
);

const emit = defineEmits<{
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'click-stack', type: string): void;
}>();

const displayTitle = computed(() => {
  if (props.label) return props.label;
  switch (props.type) {
    case 'deck':
      return 'DECK';
    case 'extra':
      return 'EX DECK';
    case 'graveyard':
      return 'GRAVEYARD';
    case 'banished':
      return 'BANISHED';
  }
  return 'STACK';
});

const tooltipContent = computed(() => {
  const owner = props.player === 'user' ? 'Your' : "Opponent's";
  switch (props.type) {
    case 'deck':
      return `${owner} Main Deck (${props.count} cards remaining)`;
    case 'extra':
      return `${owner} Extra Deck (${props.count} Fusion cards)`;
    case 'graveyard':
      return props.topCard
        ? `${owner} Graveyard (${props.count} cards • Top: ${props.topCard.name})`
        : `${owner} Graveyard (Empty)`;
    case 'banished':
      return props.topCard
        ? `${owner} Banished Zone (${props.count} cards • Top: ${props.topCard.name})`
        : `${owner} Banished Zone (Empty)`;
  }
  return `${owner} Card Stack`;
});

function onMouseEnter(): void {
  if (props.topCard) {
    emit('hover-card', props.topCard);
  }
}

function onMouseLeave(): void {
  emit('hover-card', null);
}

function onClick(): void {
  emit('click-stack', props.type);
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.deck-stack {
  position: relative;
  width: 90px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
  perspective: 600px;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    transform: translateY(-3px) scale(1.03);
    z-index: 10;
  }

  .stack-container {
    position: relative;
    width: 82px;
    height: 120px;
  }

  // 3D Physical Stack Layers
  .stack-layer {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background: #0a0c10;
    border: 1px solid rgba(201, 162, 39, 0.3);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
    pointer-events: none;

    &--1 {
      top: -2px;
      left: -2px;
      border-color: rgba(201, 162, 39, 0.2);
    }

    &--2 {
      top: -4px;
      left: -4px;
      border-color: rgba(201, 162, 39, 0.15);
    }

    &--3 {
      top: -6px;
      left: -6px;
      border-color: rgba(201, 162, 39, 0.1);
    }
  }

  .stack-top-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    overflow: hidden;
    background: #0a0c10;
    border: 1px solid rgba(201, 162, 39, 0.4);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);
    z-index: 2;
  }

  .top-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .stack-empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: rgba(14, 18, 26, 0.6);
    border: 1px dashed rgba(201, 162, 39, 0.25);

    .stack-type-icon {
      font-size: 1.25rem;
      opacity: 0.6;
    }

    .stack-label {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      color: rgba(244, 228, 184, 0.5);
      letter-spacing: 0.05em;
    }

    .stack-count-zero {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.75rem;
      color: #756f60;
      font-weight: 800;
    }
  }

  .card-foil-sheen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12) 0%,
      transparent 50%,
      rgba(201, 162, 39, 0.1) 100%
    );
    pointer-events: none;
  }

  .stack-overlay-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2px 4px;
    background: rgba(10, 12, 16, 0.85);
    border-top: 1px solid rgba(201, 162, 39, 0.3);

    .stack-name-tag {
      display: block;
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.6rem;
      color: #f5f1e6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
  }

  // Count Badge (Top-Right of Stack)
  .count-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 22px;
    height: 22px;
    padding: 0 4px;
    border-radius: 11px;
    background: #0a0c10;
    border: 1px solid $color-gold-500;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    z-index: 5;

    .count-num {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.75rem;
      font-weight: 800;
      color: $color-gold-300;
      font-variant-numeric: tabular-nums;
    }

    &--zero {
      border-color: #756f60;
      .count-num {
        color: #756f60;
      }
    }
  }

  // Stack Title Pill (Bottom)
  .stack-title-pill {
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    color: rgba(184, 178, 160, 0.6);
    letter-spacing: 0.05em;
    white-space: nowrap;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  }

  // Player Accent Glows
  &--user {
    .stack-top-card {
      border-color: rgba(47, 128, 237, 0.4);
    }
    &:hover .stack-top-card {
      border-color: rgba(47, 128, 237, 0.9);
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.8),
        0 0 14px rgba(47, 128, 237, 0.4);
    }
  }

  &--ai {
    .stack-top-card {
      border-color: rgba(235, 87, 87, 0.4);
    }
    &:hover .stack-top-card {
      border-color: rgba(235, 87, 87, 0.9);
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.8),
        0 0 14px rgba(235, 87, 87, 0.4);
    }
  }
}
</style>
