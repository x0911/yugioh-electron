<template>
  <div class="card-animation-overlay">
    <div
      v-for="anim in activeAnimations"
      :key="anim.id"
      class="flying-card-wrapper"
      :style="getWrapperStyle(anim)"
    >
      <div
        class="flying-card"
        :class="[
          `flying-card--${anim.type}`,
          {
            'flying-card--defense': anim.isDefense,
            'flying-card--facedown': anim.isFacedown,
          },
        ]"
      >
        <!-- Card 3D Flip Shell -->
        <div class="flying-card__flipper">
          <!-- Front Face -->
          <div class="flying-card__face flying-card__face--front">
            <img
              :src="getCardImage(anim.code)"
              :alt="anim.cardName"
              class="flying-card__img"
              @error="handleImageError"
            />
            <div class="flying-card__sheen"></div>
          </div>

          <!-- Back Face -->
          <div class="flying-card__face flying-card__face--back">
            <img
              :src="getCardBackUrl()"
              alt="Card Back"
              class="flying-card__img flying-card__img--back"
            />
            <div class="flying-card__sheen"></div>
          </div>
        </div>

        <!-- Summon Energy Landing Shockwave -->
        <div v-if="anim.type === 'summon' || anim.type === 'activate'" class="summon-shockwave"></div>

        <!-- Attack Impact Flash -->
        <div v-if="anim.type === 'attack'" class="attack-impact-flare"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { activeAnimations, type FlyingCard } from '../../utils/animationService.js';
import { getCardBackUrl, getCardImageUrl, getCardPlaceholderUrl } from '../../utils/media.js';

function getCardImage(code: number): string {
  if (!code || code <= 0) return getCardBackUrl();
  return getCardImageUrl(code, 'mini');
}

function handleImageError(event: Event): void {
  const target = event.target as HTMLImageElement;
  if (target && !target.src.includes('placeholder')) {
    target.src = getCardPlaceholderUrl();
  }
}

function getWrapperStyle(anim: FlyingCard): CSSProperties {
  const dx = anim.toRect.left - anim.fromRect.left;
  const dy = anim.toRect.top - anim.fromRect.top;
  const dw = anim.toRect.width / Math.max(1, anim.fromRect.width);
  const dh = anim.toRect.height / Math.max(1, anim.fromRect.height);

  return {
    '--start-x': `${anim.fromRect.left}px`,
    '--start-y': `${anim.fromRect.top}px`,
    '--start-w': `${anim.fromRect.width}px`,
    '--start-h': `${anim.fromRect.height}px`,
    '--delta-x': `${dx}px`,
    '--delta-y': `${dy}px`,
    '--scale-w': `${dw}`,
    '--scale-h': `${dh}`,
    '--duration': `${anim.durationMs}ms`,
  } as CSSProperties;
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.card-animation-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.flying-card-wrapper {
  position: absolute;
  left: var(--start-x);
  top: var(--start-y);
  width: var(--start-w);
  height: var(--start-h);
  will-change: transform, opacity;
  animation: card-fly-path var(--duration) cubic-bezier(0.2, 0.85, 0.25, 1) forwards;
}

@keyframes card-fly-path {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.9;
    z-index: 10;
  }
  20% {
    transform: translate3d(calc(var(--delta-x) * 0.15), calc(var(--delta-y) * 0.15 - 30px), 0) scale(1.1);
    opacity: 1;
  }
  70% {
    transform: translate3d(calc(var(--delta-x) * 0.8), calc(var(--delta-y) * 0.8 - 10px), 0) scale(calc(var(--scale-w) * 1.05));
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--delta-x), var(--delta-y), 0) scale(var(--scale-w), var(--scale-h));
    opacity: 1;
    z-index: 1;
  }
}

.flying-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  perspective: 1200px;
  transform-style: preserve-3d;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);

  &__flipper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform var(--duration) ease-out;
  }

  &__face {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(201, 162, 39, 0.4);

    &--front {
      transform: rotateY(0deg);
    }

    &--back {
      transform: rotateY(180deg);
      background: #110d06;
    }
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
    pointer-events: none;
  }

  // Face-down Set Transitions (3D flip from front to back during flight)
  &--set-monster .flying-card__flipper,
  &--set-spell .flying-card__flipper {
    animation: card-3d-flip-down var(--duration) cubic-bezier(0.2, 0.85, 0.25, 1) forwards;
  }

  // Defense Rotation (90deg horizontal)
  &--defense {
    animation: rotate-defense var(--duration) cubic-bezier(0.2, 0.85, 0.25, 1) forwards;
  }

  // Destruction / Graveyard Dissolve
  &--destroy-gy {
    animation: gy-dissolve var(--duration) ease-in forwards;
  }

  // Attack Lunge Surge
  &--attack {
    animation: attack-surge 0.35s ease-in-out forwards;
  }
}

@keyframes rotate-defense {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(90deg);
  }
}

@keyframes attack-surge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2) translateY(-10px);
    filter: drop-shadow(0 0 15px #ff4d4f);
  }
  100% {
    transform: scale(1);
  }
}

.summon-shockwave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  margin-top: -60px;
  margin-left: -60px;
  border-radius: 50%;
  border: 2px solid $color-gold-300;
  pointer-events: none;
  animation: summon-landing-burst 0.45s ease-out forwards;
  animation-delay: calc(var(--duration) * 0.8);
}

.attack-impact-flare {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(235, 87, 87, 0.6) 50%, transparent 70%);
  pointer-events: none;
  animation: attack-impact-flash 0.35s ease-out forwards;
}
</style>
