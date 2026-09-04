<template>
  <div class="post-duel-overlay" :class="isWinner ? 'post-duel-overlay--winner' : 'post-duel-overlay--loser'">
    <!-- Atmospheric Background Effects -->
    <div v-if="isWinner" class="celebration-rays" />
    <div v-if="isWinner" class="confetti-container">
      <span v-for="n in 36" :key="n" class="confetti-piece" :style="getConfettiStyle(n)" />
    </div>

    <div v-else class="defeat-embers">
      <span v-for="n in 24" :key="n" class="ember-particle" :style="getEmberStyle(n)" />
    </div>

    <!-- Main Card Modal -->
    <div class="post-duel-card glass-panel" :class="isWinner ? 'post-duel-card--winner' : 'post-duel-card--loser'">
      <!-- Emblem Banner -->
      <div class="post-duel-card__emblem-wrap">
        <div class="post-duel-card__emblem">
          <span v-if="isWinner" class="emblem-glyph">👑</span>
          <span v-else class="emblem-glyph emblem-glyph--dark">💀</span>
        </div>
        <div class="post-duel-card__crest-glow" />
      </div>

      <!-- Titles -->
      <h1 class="post-duel-card__title">
        {{ isWinner ? 'CONGRATULATIONS, DUELIST!' : 'HARD LUCK, DUELIST...' }}
      </h1>
      <p class="post-duel-card__subtitle">
        {{ isWinner
          ? 'A magnificent display of tactical mastery! You have triumphed in the Sacred Arena!'
          : 'Even legendary champions face hardship. Reflect upon your moves, refine your deck, and rise again!'
        }}
      </p>

      <div class="post-duel-card__reason-badge">
        <span class="reason-icon">{{ isWinner ? '✨' : '⚔️' }}</span>
        <span>{{ reasonText }}</span>
      </div>

      <!-- Duel Stats Grid -->
      <div class="post-duel-card__stats-grid">
        <div class="stat-box">
          <span class="stat-box__label">Your Life Points</span>
          <span class="stat-box__value" :class="{ 'stat-box__value--gold': isWinner }">
            {{ userLp }} LP
          </span>
        </div>
        <div class="stat-box">
          <span class="stat-box__label">Opponent Life Points</span>
          <span class="stat-box__value">
            {{ opponentLp }} LP
          </span>
        </div>
        <div class="stat-box">
          <span class="stat-box__label">Duel Duration</span>
          <span class="stat-box__value">
            {{ turnCount }} Turns
          </span>
        </div>
      </div>

      <!-- Interactive Actions -->
      <div class="post-duel-card__actions">
        <button
          type="button"
          class="duel-action-btn duel-action-btn--primary"
          @click="$emit('rematch')"
        >
          <span class="btn-icon">🔄</span>
          <span>{{ isWinner ? 'Rematch Duel' : 'Request Rematch' }}</span>
        </button>

        <button
          type="button"
          class="duel-action-btn duel-action-btn--review"
          @click="$emit('review')"
        >
          <span class="btn-icon">🧠</span>
          <span>Tactical Review</span>
        </button>

        <button
          type="button"
          class="duel-action-btn duel-action-btn--secondary"
          @click="$emit('exit')"
        >
          <span class="btn-icon">🏠</span>
          <span>Main Menu</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isWinner: boolean;
  userLp: number;
  opponentLp: number;
  turnCount: number;
  winReason?: string | null;
}>();

defineEmits<{
  (e: 'rematch'): void;
  (e: 'review'): void;
  (e: 'exit'): void;
}>();

const reasonText = computed(() => {
  if (props.winReason) return props.winReason;
  return props.isWinner ? 'Victory by Zero Opponent Life Points' : 'Defeat by Zero Life Points';
});

function getConfettiStyle(index: number) {
  const left = (index * 2.8) % 100;
  const delay = (index * 0.12).toFixed(2);
  const duration = (2.5 + (index % 4) * 0.5).toFixed(2);
  const colors = ['#ffd700', '#ffb700', '#ffffff', '#00f0ff', '#ff0077', '#00ff88'];
  const color = colors[index % colors.length];
  const size = 6 + (index % 6) * 2;

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    backgroundColor: color,
    width: `${size}px`,
    height: `${size * 1.5}px`,
  };
}

function getEmberStyle(index: number) {
  const left = (index * 4.2) % 100;
  const delay = (index * 0.15).toFixed(2);
  const duration = (3.0 + (index % 3) * 0.8).toFixed(2);
  const size = 4 + (index % 4) * 2;

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
  };
}
</script>

<style scoped lang="scss">
.post-duel-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 7, 12, 0.88);
  backdrop-filter: blur(14px);
  overflow: hidden;
  animation: overlay-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Celebration God Rays for Winner
.celebration-rays {
  position: absolute;
  width: 140vmax;
  height: 140vmax;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, rgba(212, 175, 55, 0.05) 45%, transparent 70%);
  animation: rays-spin 30s linear infinite;
  pointer-events: none;
}

@keyframes rays-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Confetti shower
.confetti-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  border-radius: 2px;
  opacity: 0.9;
  animation: confetti-fall linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
}

// Defeat embers
.defeat-embers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.ember-particle {
  position: absolute;
  bottom: -20px;
  background: radial-gradient(circle, #ff4422 0%, #aa1100 80%, transparent 100%);
  border-radius: 50%;
  box-shadow: 0 0 10px #ff3300;
  opacity: 0.8;
  animation: ember-rise linear infinite;
}

@keyframes ember-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-110vh) scale(0.3);
    opacity: 0;
  }
}

// Card Container
.post-duel-card {
  position: relative;
  width: 580px;
  max-width: 90vw;
  padding: 36px 40px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: card-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

  &--winner {
    background: linear-gradient(170deg, rgba(30, 25, 15, 0.95), rgba(15, 12, 8, 0.98));
    border: 2px solid rgba(255, 215, 0, 0.6);
    box-shadow: 0 0 40px rgba(212, 175, 55, 0.35), 0 20px 50px rgba(0, 0, 0, 0.8);
  }

  &--loser {
    background: linear-gradient(170deg, rgba(25, 10, 10, 0.95), rgba(12, 6, 6, 0.98));
    border: 2px solid rgba(231, 76, 60, 0.5);
    box-shadow: 0 0 35px rgba(192, 57, 43, 0.3), 0 20px 50px rgba(0, 0, 0, 0.8);
  }
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.post-duel-card__emblem-wrap {
  position: relative;
  margin-bottom: 8px;
}

.post-duel-card__emblem {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 24px rgba(255, 215, 0, 0.4);
}

.emblem-glyph {
  font-size: 2.8rem;

  &--dark {
    filter: drop-shadow(0 0 12px #e74c3c);
  }
}

.post-duel-card__title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #fff 0%, #ffd700 70%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(212, 175, 55, 0.4));

  .post-duel-card--loser & {
    background: linear-gradient(135deg, #fff 0%, #ff6b6b 60%, #c0392b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 8px rgba(192, 57, 43, 0.4));
  }
}

.post-duel-card__subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #c9d1d9;
  line-height: 1.5;
  max-width: 480px;
}

.post-duel-card__reason-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
  color: #e6edf3;
}

.post-duel-card__stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.stat-box {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    font-size: 0.75rem;
    color: #8b949e;
    text-transform: uppercase;
  }

  &__value {
    font-size: 1.15rem;
    font-weight: 700;
    color: #f0f6fc;

    &--gold {
      color: #ffd700;
    }
  }
}

.post-duel-card__actions {
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}

.duel-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &--primary {
    background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
    color: #000;

    &:hover {
      background: linear-gradient(135deg, #ffd700 0%, #d4af37 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
    }
  }

  &--review {
    background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);
    color: #fff;

    &:hover {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(142, 68, 173, 0.4);
    }
  }

  &--secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #e6edf3;
    border: 1px solid rgba(255, 255, 255, 0.15);

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
    }
  }
}
</style>
