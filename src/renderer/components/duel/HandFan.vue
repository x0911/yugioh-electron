<template>
  <div
    class="hand-row"
    :class="[
      `hand-row--${player}`,
      {
        'hand-row--empty': cards.length === 0,
      },
    ]"
  >
    <!-- Hand Info Header (Count Badge) -->
    <div class="hand-meta">
      <span class="hand-meta__count">
        {{ player === 'user' ? 'Your Hand' : "Opponent's Hand" }} ({{ cards.length }})
      </span>
    </div>

    <!-- Horizontal Cards Container with Dynamic Resolution-Independent FLIP Motion -->
    <TransitionGroup
      name="hand-card-anim"
      tag="div"
      class="hand-cards-container"
      :css="false"
      @before-enter="onCardBeforeEnter"
      @enter="onCardEnter"
      @leave="onCardLeave"
    >
      <div
        v-for="(card, idx) in cards"
        :key="card.id || `${player}-${card.code}-${idx}`"
        class="hand-card-slot"
        :style="getSlotStyle(idx, cards.length)"
        @mouseenter="onCardMouseEnter(card)"
        @mouseleave="onCardMouseLeave"
        @click="onCardClick(card)"
      >
        <!-- User Hand Card (Full Art, Name, Level, Stats) -->
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
              <span class="hand-card__name" :title="card.name">{{ card.name }}</span>
              <span v-if="card.level && card.level > 0" class="hand-card__level">
                ★{{ card.level }}
              </span>
            </div>

            <!-- Bottom ATK/DEF Footer for Monsters -->
            <div v-if="card.atk !== undefined && card.def !== undefined" class="hand-card__stats">
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
    </TransitionGroup>
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
 * Calculates adaptive horizontal spacing and negative margin overlap.
 * When hand size exceeds 5 cards, cards smoothly overlap horizontally so they never overflow.
 */
function getSlotStyle(index: number, total: number): CSSProperties {
  let marginHorizontal = 4; // Standard spacing between cards (px)

  if (total > 5) {
    // Dynamic overlap when hand size is large (6, 7, 8, 9, 10+ cards)
    const excess = total - 5;
    const overlapAmount = Math.min(46, excess * (props.player === 'user' ? 8 : 6));
    marginHorizontal = -overlapAmount / 2;
  }

  return {
    marginLeft: `${marginHorizontal}px`,
    marginRight: `${marginHorizontal}px`,
    zIndex: index + 1,
  };
}

/**
 * 100% Resolution-Independent FLIP Motion:
 * Dynamically queries the exact screen bounding box of the Main Deck at runtime,
 * and sets the initial entrance transform exactly at the Deck's coordinates.
 */
function onCardBeforeEnter(el: Element): void {
  const slotEl = el as HTMLElement;
  const deckSelector = props.player === 'user' ? '.deck-stack--user-deck' : '.deck-stack--ai-deck';
  const deckEl = document.querySelector(deckSelector) as HTMLElement | null;

  if (deckEl) {
    const deckRect = deckEl.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();

    // Exact delta in screen viewport coordinates (resolution & letterbox agnostic)
    const deltaX = deckRect.left + deckRect.width / 2 - (slotRect.left + slotRect.width / 2);
    const deltaY = deckRect.top + deckRect.height / 2 - (slotRect.top + slotRect.height / 2);

    slotEl.style.opacity = '0';
    slotEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.65) rotate(${props.player === 'user' ? -12 : 12}deg)`;
  } else {
    slotEl.style.opacity = '0';
    slotEl.style.transform = 'scale(0.6)';
  }
}

function onCardEnter(el: Element, done: () => void): void {
  const slotEl = el as HTMLElement;
  // Force browser layout reflow
  void slotEl.offsetWidth;

  slotEl.style.transition =
    'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
  slotEl.style.opacity = '1';
  slotEl.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';

  let cleaned = false;
  const finish = (): void => {
    if (cleaned) return;
    cleaned = true;
    slotEl.removeEventListener('transitionend', onEnd);
    slotEl.style.transition = '';
    slotEl.style.transform = '';
    slotEl.style.opacity = '';
    done();
  };

  const onEnd = (e: Event): void => {
    if (e.target === slotEl) {
      finish();
    }
  };

  slotEl.addEventListener('transitionend', onEnd);
  setTimeout(finish, 500);
}

function onCardLeave(el: Element, done: () => void): void {
  const slotEl = el as HTMLElement;
  slotEl.style.position = 'absolute';
  slotEl.style.transition =
    'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
  slotEl.style.opacity = '0';
  slotEl.style.transform = `translate3d(0, ${props.player === 'user' ? -50 : 50}px, 0) scale(0.6)`;
  setTimeout(done, 360);
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

.hand-row {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;

  .hand-meta {
    padding: 2px 10px;
    background: rgba(10, 12, 16, 0.88);
    border: 1px solid rgba(201, 162, 39, 0.35);
    border-radius: 12px;
    margin-bottom: 4px;
    z-index: 10;

    &__count {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      color: $color-gold-300;
      letter-spacing: 0.05em;
    }
  }

  .hand-cards-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 4px 12px;
    box-sizing: border-box;
    max-width: 100%;
    min-height: 130px;
  }

  .hand-card-slot {
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    transition:
      transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
      margin 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      z-index 0s;

    &:hover {
      z-index: 100 !important;
    }
  }

  // =========================================================================
  // User Hand (Flat, Horizontal Side-by-Side, Upward Lift on Hover)
  // =========================================================================
  &--user {
    .hand-card-slot {
      width: 86px;
      height: 124px;

      &:hover {
        transform: translateY(-26px) scale(1.12);

        .hand-card {
          border-color: $color-gold-300;
          box-shadow:
            0 14px 32px rgba(0, 0, 0, 0.95),
            0 0 16px rgba(47, 128, 237, 0.7);
        }
      }
    }
  }

  // =========================================================================
  // Opponent Hand (Inverted, Flat Horizontal, Downward Lift on Hover)
  // =========================================================================
  &--ai {
    .hand-card-slot {
      width: 68px;
      height: 98px;

      &:hover {
        transform: translateY(12px) scale(1.08);

        .hand-card {
          border-color: $color-gold-500;
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.9),
            0 0 14px rgba(235, 87, 87, 0.5);
        }
      }
    }
  }

  // Card Content & Visuals
  .hand-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    background: #0a0c10;
    border: 1px solid rgba(201, 162, 39, 0.4);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.75);
    overflow: hidden;
    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease;

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
      background: rgba(10, 12, 16, 0.88);
      border-bottom: 1px solid rgba(201, 162, 39, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__name {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.6rem;
      font-weight: 600;
      color: #f5f1e6;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__level {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.55rem;
      font-weight: 800;
      color: $color-gold-300;
      margin-left: 2px;
    }

    &__stats {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1px 3px;
      background: rgba(10, 12, 16, 0.94);
      border-top: 1px solid rgba(201, 162, 39, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 3px;
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.53rem;
      font-weight: 700;
      letter-spacing: 0.01em;

      .stat-atk {
        color: #f5f1e6;
        font-size: 0.7rem;
      }
      .stat-slash {
        color: $color-gold-500;
        font-size: 0.48rem;
        opacity: 0.75;
      }
      .stat-def {
        color: #b8b2a0;
        font-size: 0.7rem;
      }
    }
  }
}
</style>
