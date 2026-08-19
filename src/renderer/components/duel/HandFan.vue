<template>
  <div
    class="hand-fan"
    :class="[
      `hand-fan--${player}`,
      {
        'hand-fan--empty': cards.length === 0,
      },
    ]"
  >
    <!-- Hand Info Header (Count Badge) -->
    <div class="hand-meta">
      <span class="hand-meta__count">
        {{ player === 'user' ? 'Your Hand' : "Opponent's Hand" }} ({{ cards.length }})
      </span>
    </div>

    <!-- Hand Cards Arc Container -->
    <div class="hand-cards-container">
      <div
        v-for="(card, idx) in cards"
        :key="card.id || idx"
        class="hand-card-wrapper"
        :style="getCardStyle(idx, cards.length)"
        @mouseenter="onCardMouseEnter(card)"
        @mouseleave="onCardMouseLeave"
        @click="onCardClick(card)"
      >
        <!-- User Hand Card (Full Art & Info) -->
        <div v-if="player === 'user'" class="hand-card hand-card--user">
          <div class="hand-card__frame">
            <img
              :src="getCardImageUrl(card.code, 'mini')"
              :alt="card.name"
              class="hand-card__image"
              @error="handleImageError"
            />
            <div class="hand-card__foil"></div>

            <!-- Mini Header with Name & Level -->
            <div class="hand-card__header">
              <span class="hand-card__name">{{ card.name }}</span>
              <span v-if="card.level && card.level > 0" class="hand-card__level">
                ★{{ card.level }}
              </span>
            </div>

            <!-- Bottom ATK/DEF Footer for Monsters -->
            <div
              v-if="card.atk !== undefined && card.def !== undefined"
              class="hand-card__stats"
            >
              <span class="stat-atk">{{ card.atk }}</span>
              <span class="stat-slash">/</span>
              <span class="stat-def">{{ card.def }}</span>
            </div>
          </div>
        </div>

        <!-- Opponent Hand Card (Card Backs) -->
        <div v-else class="hand-card hand-card--ai">
          <div class="hand-card__frame hand-card__frame--back">
            <img
              :src="getCardBackUrl()"
              alt="Card Back"
              class="hand-card__image"
              @error="handleImageError"
            />
            <div class="hand-card__foil"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { FieldCard } from '../../../shared/types/field.js';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';

const props = withDefaults(
  defineProps<{
    player: 'user' | 'ai';
    cards: FieldCard[];
    isInteractive?: boolean;
  }>(),
  {
    isInteractive: true,
  },
);

const emit = defineEmits<{
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'click-card', card: FieldCard): void;
}>();

/**
 * Calculates authentic TCG fanned hand arc geometry.
 */
function getCardStyle(index: number, total: number): CSSProperties {
  if (total <= 1) {
    return {
      transform: 'none',
      zIndex: 1,
    };
  }

  const centerIndex = (total - 1) / 2;
  const offset = index - centerIndex;

  // Max total spread angle clamped to ±16deg for user, ±12deg for AI
  const angleStep = Math.min(6, 28 / Math.max(1, total));
  const angle = offset * angleStep;

  // Parabolic vertical offset for natural arc
  const arcY = Math.pow(offset, 2) * (props.player === 'user' ? 3.5 : -2.5);

  // Horizontal overlap offset
  const overlapX = offset * (props.player === 'user' ? 32 : 24);

  const rotate = props.player === 'user' ? `${angle}deg` : `${-angle}deg`;
  const translateY = props.player === 'user' ? `${arcY}px` : `${arcY}px`;
  const translateX = `${overlapX}px`;

  return {
    transform: `translate(${translateX}, ${translateY}) rotate(${rotate})`,
    zIndex: index + 1,
  };
}

function onCardMouseEnter(card: FieldCard): void {
  if (props.player === 'user') {
    emit('hover-card', card);
  }
}

function onCardMouseLeave(): void {
  if (props.player === 'user') {
    emit('hover-card', null);
  }
}

function onCardClick(card: FieldCard): void {
  if (props.isInteractive && props.player === 'user') {
    emit('click-card', card);
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.hand-fan {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  pointer-events: none;

  .hand-meta {
    padding: 2px 10px;
    background: rgba(10, 12, 16, 0.85);
    border: 1px solid rgba(201, 162, 39, 0.3);
    border-radius: 12px;
    margin-bottom: 4px;
    z-index: 10;
    pointer-events: auto;

    &__count {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      color: $color-gold-300;
      letter-spacing: 0.05em;
    }
  }

  .hand-cards-container {
    position: relative;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
  }

  .hand-card-wrapper {
    position: absolute;
    width: 80px;
    height: 116px;
    transform-origin: center bottom;
    transition:
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      z-index 0s;
    cursor: pointer;

    &:hover {
      z-index: 100 !important;
    }
  }

  // User Hand Styling
  &--user {
    .hand-card-wrapper:hover {
      transform: translateY(-28px) scale(1.18) !important;
      .hand-card {
        box-shadow:
          0 12px 28px rgba(0, 0, 0, 0.9),
          0 0 16px rgba(47, 128, 237, 0.6);
        border-color: $color-gold-300;
      }
    }
  }

  // Opponent Hand Styling (Mirrored / Inverted)
  &--ai {
    .hand-cards-container {
      height: 90px;
    }

    .hand-card-wrapper {
      width: 65px;
      height: 94px;
      transform-origin: center top;
    }

    .hand-card-wrapper:hover {
      transform: translateY(12px) scale(1.08) !important;
    }
  }

  .hand-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    background: #0a0c10;
    border: 1px solid rgba(201, 162, 39, 0.4);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.7);
    overflow: hidden;
    transition:
      box-shadow 0.25s ease,
      border-color 0.25s ease;

    &__frame {
      position: relative;
      width: 100%;
      height: 100%;
    }

    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    &__foil {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.15) 0%,
        transparent 50%,
        rgba(201, 162, 39, 0.15) 100%
      );
      pointer-events: none;
    }

    &__header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 2px 4px;
      background: rgba(10, 12, 16, 0.85);
      border-bottom: 1px solid rgba(201, 162, 39, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__name {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.55rem;
      font-weight: 600;
      color: #f5f1e6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__level {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.5rem;
      font-weight: 800;
      color: $color-gold-300;
      margin-left: 2px;
    }

    &__stats {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1px 4px;
      background: rgba(10, 12, 16, 0.9);
      border-top: 1px solid rgba(201, 162, 39, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 3px;
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.55rem;
      font-weight: 700;

      .stat-atk {
        color: #f5f1e6;
      }
      .stat-slash {
        color: $color-gold-500;
        font-size: 0.5rem;
      }
      .stat-def {
        color: #b8b2a0;
      }
    }
  }
}
</style>
