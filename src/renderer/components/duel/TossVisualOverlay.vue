<template>
  <Transition name="toss-fade">
    <div v-if="tossPayload" class="toss-visual-overlay">
      <div class="toss-backdrop"></div>
      
      <div class="toss-modal glass-panel glass-panel--accent-gold">
        <div class="toss-header">
          <span class="toss-icon">{{ tossPayload.type === 'dice' ? '🎲' : '🪙' }}</span>
          <h3 class="toss-title">
            {{ tossPayload.type === 'dice' ? 'ROLLING SIX-SIDED DICE' : 'FLIPPING COIN' }}
          </h3>
          <span class="toss-player-tag" :class="tossPayload.player === 0 ? 'toss-player--p0' : 'toss-player--p1'">
            {{ tossPayload.player === 0 ? 'Player 0 (AI)' : 'Player 1 (You)' }}
          </span>
        </div>

        <!-- Dice Roll Animation Container -->
        <div v-if="tossPayload.type === 'dice'" class="toss-items-container toss-items--dice">
          <div
            v-for="(res, idx) in tossPayload.results"
            :key="`dice-${idx}`"
            class="dice-wrapper"
          >
            <div class="dice-cube" :class="`dice-cube--settled dice-val--${res}`">
              <!-- Dice Face 1 -->
              <div v-if="Number(res) === 1" class="dice-face dice-face--1">
                <span class="pip pip--center pip--red"></span>
              </div>
              <!-- Dice Face 2 -->
              <div v-else-if="Number(res) === 2" class="dice-face dice-face--2">
                <span class="pip pip--top-left"></span>
                <span class="pip pip--bottom-right"></span>
              </div>
              <!-- Dice Face 3 -->
              <div v-else-if="Number(res) === 3" class="dice-face dice-face--3">
                <span class="pip pip--top-left"></span>
                <span class="pip pip--center"></span>
                <span class="pip pip--bottom-right"></span>
              </div>
              <!-- Dice Face 4 -->
              <div v-else-if="Number(res) === 4" class="dice-face dice-face--4">
                <span class="pip pip--top-left"></span>
                <span class="pip pip--top-right"></span>
                <span class="pip pip--bottom-left"></span>
                <span class="pip pip--bottom-right"></span>
              </div>
              <!-- Dice Face 5 -->
              <div v-else-if="Number(res) === 5" class="dice-face dice-face--5">
                <span class="pip pip--top-left"></span>
                <span class="pip pip--top-right"></span>
                <span class="pip pip--center"></span>
                <span class="pip pip--bottom-left"></span>
                <span class="pip pip--bottom-right"></span>
              </div>
              <!-- Dice Face 6 -->
              <div v-else class="dice-face dice-face--6">
                <span class="pip pip--top-left"></span>
                <span class="pip pip--top-right"></span>
                <span class="pip pip--mid-left"></span>
                <span class="pip pip--mid-right"></span>
                <span class="pip pip--bottom-left"></span>
                <span class="pip pip--bottom-right"></span>
              </div>
            </div>
            <div class="toss-val-pill">
              <span>Result: <strong>{{ res }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Coin Flip Animation Container -->
        <div v-else class="toss-items-container toss-items--coin">
          <div
            v-for="(res, idx) in tossPayload.results"
            :key="`coin-${idx}`"
            class="coin-wrapper"
          >
            <div class="coin-disc" :class="Boolean(res) ? 'coin-disc--heads' : 'coin-disc--tails'">
              <div class="coin-face coin-face--front">
                <span class="coin-symbol">👁️</span>
                <span class="coin-label">HEADS</span>
              </div>
              <div class="coin-face coin-face--back">
                <span class="coin-symbol">⚔️</span>
                <span class="coin-label">TAILS</span>
              </div>
            </div>
            <div class="toss-val-pill">
              <span>Outcome: <strong>{{ Boolean(res) ? 'HEADS' : 'TAILS' }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Summary Result Banner -->
        <div class="toss-summary-banner">
          <span class="summary-prefix">EFFECT TRIGGER:</span>
          <span class="summary-value">
            {{ tossPayload.type === 'dice' ? `Dice Total: ${tossPayload.results.reduce((a, b) => Number(a) + Number(b), 0)}` : (tossPayload.results.map(r => r ? 'HEADS' : 'TAILS').join(', ')) }}
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { TossPayload } from '../../../shared/types/duel.js';

defineProps<{
  tossPayload: TossPayload | null;
}>();
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.toss-visual-overlay {
  position: fixed;
  inset: 0;
  z-index: 950;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.toss-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(10, 14, 22, 0.75) 0%, rgba(4, 5, 8, 0.92) 100%);
  backdrop-filter: blur(8px);
}

.toss-modal {
  position: relative;
  z-index: 10;
  width: 440px;
  padding: $space-5 $space-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  border-radius: $radius-xl;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8), 0 0 32px rgba($color-gold-500, 0.35);
  animation: tossModalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes tossModalPop {
  0% {
    transform: scale(0.7) translateY(30px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.toss-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-1;
}

.toss-icon {
  font-size: 2.2rem;
  filter: drop-shadow(0 0 12px rgba($color-gold-500, 0.8));
}

.toss-title {
  font-family: $font-display;
  font-size: $font-size-md;
  letter-spacing: 0.12em;
  color: $color-gold-300;
  text-transform: uppercase;
  margin: 0;
  text-align: center;
}

.toss-player-tag {
  font-size: $font-size-xs;
  font-weight: 700;
  padding: 2px $space-2;
  border-radius: $radius-full;
  letter-spacing: 0.05em;

  &.toss-player--p0 {
    background: rgba($color-ai, 0.2);
    color: #fca5a5;
    border: 1px solid rgba($color-ai, 0.4);
  }

  &.toss-player--p1 {
    background: rgba($color-user, 0.2);
    color: #93c5fd;
    border: 1px solid rgba($color-user, 0.4);
  }
}

.toss-items-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-4;
  margin: $space-2 0;
}

// -----------------------------------------------------------------------------
// Dice 3D Styles & Rolling Animation
// -----------------------------------------------------------------------------
.dice-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.dice-cube {
  width: 76px;
  height: 76px;
  position: relative;
  perspective: 600px;
  animation: diceRollTumble 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes diceRollTumble {
  0% {
    transform: rotateX(720deg) rotateY(1080deg) scale(0.6);
    opacity: 0.4;
  }
  70% {
    transform: rotateX(-30deg) rotateY(20deg) scale(1.1);
  }
  100% {
    transform: rotateX(0deg) rotateY(0deg) scale(1);
    opacity: 1;
  }
}

.dice-face {
  width: 76px;
  height: 76px;
  background: linear-gradient(135deg, #ffffff 0%, #f0ede6 60%, #ded7ca 100%);
  border: 3px solid $color-gold-500;
  border-radius: 14px;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.9),
    inset 0 -3px 6px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.6),
    0 0 16px rgba($color-gold-500, 0.4);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pip {
  position: absolute;
  width: 14px;
  height: 14px;
  background: radial-gradient(circle, #1a1a1a 40%, #000000 100%);
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.4);

  &.pip--red {
    width: 22px;
    height: 22px;
    background: radial-gradient(circle, #ff2a2a 40%, #a00000 100%);
    box-shadow: 0 0 8px rgba(255, 42, 42, 0.6);
  }

  &.pip--center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
  &.pip--top-left { top: 12px; left: 12px; }
  &.pip--top-right { top: 12px; right: 12px; }
  &.pip--bottom-left { bottom: 12px; left: 12px; }
  &.pip--bottom-right { bottom: 12px; right: 12px; }
  &.pip--mid-left { top: 50%; left: 12px; transform: translateY(-50%); }
  &.pip--mid-right { top: 50%; right: 12px; transform: translateY(-50%); }
}

// -----------------------------------------------------------------------------
// Coin 3D Styles & Flip Animation
// -----------------------------------------------------------------------------
.coin-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.coin-disc {
  width: 76px;
  height: 76px;
  position: relative;
  transform-style: preserve-3d;
  animation: coinFlipSpin 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes coinFlipSpin {
  0% {
    transform: rotateY(1800deg) scale(0.6) translateY(-40px);
    opacity: 0.4;
  }
  70% {
    transform: rotateY(180deg) scale(1.1) translateY(0);
  }
  100% {
    transform: rotateY(0deg) scale(1) translateY(0);
    opacity: 1;
  }
}

.coin-face {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, $color-gold-300 0%, $color-gold-700 65%, $color-gold-900 100%);
  border: 3px solid $color-gold-300;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.8),
    inset 0 -3px 6px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.7),
    0 0 16px rgba($color-gold-500, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  backface-visibility: hidden;
}

.coin-face--back {
  transform: rotateY(180deg);
}

.coin-symbol {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}

.coin-label {
  font-family: $font-display;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #1a1200;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.4);
}

.toss-val-pill {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba($color-gold-500, 0.4);
  padding: 3px $space-3;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  color: $color-gold-300;
  letter-spacing: 0.04em;

  strong {
    color: #ffffff;
    font-size: $font-size-md;
  }
}

.toss-summary-banner {
  width: 100%;
  background: rgba($color-gold-500, 0.12);
  border: 1px solid rgba($color-gold-500, 0.35);
  border-radius: $radius-md;
  padding: $space-2 $space-3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  font-size: $font-size-sm;
}

.summary-prefix {
  font-family: $font-display;
  font-weight: 700;
  color: $color-gold-500;
  letter-spacing: 0.06em;
}

.summary-value {
  font-weight: 700;
  color: #ffffff;
}

// Fade transition
.toss-fade-enter-active,
.toss-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toss-fade-enter-from,
.toss-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
