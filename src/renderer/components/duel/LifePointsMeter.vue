<template>
  <div
    class="lp-meter"
    :class="[
      `lp-meter--${player}`,
      {
        'lp-meter--active-turn': isTurn,
        'lp-meter--low-lp': currentLp <= 2000,
        'lp-meter--zero-lp': currentLp <= 0,
        'lp-meter--damage-flash': isDamagedFlash,
      },
    ]"
  >
    <div class="lp-meter__panel">
      <!-- Player Avatar Thumbnail -->
      <div class="lp-meter__avatar-wrapper">
        <div class="lp-meter__avatar">
          <img
            v-if="characterId && !avatarFailed"
            :src="getCharacterAvatarUrl(characterId)"
            :alt="name"
            class="avatar-image"
            @error="handleAvatarError"
          />
          <!-- Holographic Medallion Silhouette Fallback -->
          <div v-else class="avatar-fallback">
            <svg viewBox="0 0 36 36" class="avatar-glyph" fill="currentColor">
              <path
                d="M18 4C10.27 4 4 10.27 4 18s6.27 14 14 14 14-6.27 14-14S25.73 4 18 4zm0 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 21.2c-3.73 0-6.99-1.87-8.91-4.71.04-2.95 5.94-4.57 8.91-4.57 2.96 0 8.87 1.62 8.91 4.57-1.92 2.84-5.18 4.71-8.91 4.71z"
              />
            </svg>
          </div>
        </div>

        <!-- Series Pill -->
        <span v-if="series" class="series-pill" :class="`series-pill--${series.toLowerCase()}`">
          {{ series }}
        </span>

        <!-- Turn Active Badge -->
        <span v-if="isTurn" class="turn-badge"> TURN </span>
      </div>

      <!-- Info & LP Counter -->
      <div class="lp-meter__content">
        <div class="lp-meter__header">
          <span class="player-name" :title="name">{{ name }}</span>
          <span
            v-if="player === 'ai'"
            class="ai-engine-badge"
            :class="aiEngineType === 'gemini' ? 'ai-engine-badge--gemini' : 'ai-engine-badge--builtin'"
            :title="aiEngineType === 'gemini' ? 'Controlled by Gemini Cloud LLM' : 'Controlled by Built-in Heuristic Engine'"
          >
            {{ aiEngineType === 'gemini' ? '✨ Gemini AI' : '⚡ Local AI' }}
          </span>
          <span v-else-if="title" class="player-title" :title="title">{{ title }}</span>
        </div>

        <!-- Huge Oxanium LP Counter (Tweened Countdown) -->
        <div class="lp-meter__value-row">
          <span class="lp-label">LP</span>
          <span class="lp-value">{{ formattedLp }}</span>
        </div>

        <!-- Animated LP Health Bar -->
        <div class="lp-meter__bar-track">
          <div
            class="lp-meter__bar-fill"
            :class="`lp-meter__bar-fill--${lpHealthTier}`"
            :style="{ width: `${lpPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { getCharacterAvatarUrl, getCharacterPortraitUrl } from '../../utils/media.js';
import { audioManager } from '../../audio/index.js';

const props = withDefaults(
  defineProps<{
    player: 'user' | 'ai';
    name: string;
    title?: string;
    series?: 'DM' | 'GX';
    avatar?: string;
    characterId?: string;
    currentLp: number;
    maxLp?: number;
    isTurn?: boolean;
    aiEngineType?: 'builtin' | 'gemini';
  }>(),
  {
    title: '',
    series: 'DM',
    avatar: '',
    characterId: '',
    maxLp: 8000,
    isTurn: false,
    aiEngineType: 'builtin',
  },
);

const avatarFailed = ref(false);
const displayLp = ref(props.currentLp);
const isDamagedFlash = ref(false);

let damageFlashTimeout: ReturnType<typeof setTimeout> | null = null;
let tweenAnimFrame: number | null = null;
let lastTickTime = 0;

function handleAvatarError(): void {
  avatarFailed.value = true;
}

watch(
  () => props.currentLp,
  (newVal, oldVal) => {
    if (oldVal !== undefined && newVal < oldVal) {
      // Trigger damage flash on damage taken
      isDamagedFlash.value = true;
      if (damageFlashTimeout) clearTimeout(damageFlashTimeout);
      damageFlashTimeout = setTimeout(() => {
        isDamagedFlash.value = false;
      }, 550);

      if (oldVal - newVal >= 1000) {
        audioManager.playSfx('lp-damage-heavy');
      }

      if (newVal <= 2000 && newVal > 0) {
        audioManager.playSfx('lp-low-alarm', 0.6);
      }
    } else if (oldVal !== undefined && newVal > oldVal) {
      audioManager.playSfx('lp-heal');
    }

    // Tween LP counter
    if (tweenAnimFrame) {
      cancelAnimationFrame(tweenAnimFrame);
    }
    const startLp = displayLp.value;
    const targetLp = Math.max(0, newVal);
    const duration = 460;
    const startTime = performance.now();
    lastTickTime = startTime;

    function step(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextLp = Math.round(startLp + (targetLp - startLp) * ease);

      // Play tick sound when LP counter changes
      if (nextLp !== displayLp.value && currentTime - lastTickTime >= 40) {
        audioManager.playLpTick();
        lastTickTime = currentTime;
      }

      displayLp.value = nextLp;

      if (progress < 1) {
        tweenAnimFrame = requestAnimationFrame(step);
      } else {
        displayLp.value = targetLp;
        tweenAnimFrame = null;
      }
    }

    tweenAnimFrame = requestAnimationFrame(step);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (damageFlashTimeout) clearTimeout(damageFlashTimeout);
  if (tweenAnimFrame) cancelAnimationFrame(tweenAnimFrame);
});

const formattedLp = computed(() => {
  return Math.max(0, displayLp.value).toString();
});

const lpPercentage = computed(() => {
  const max = props.maxLp > 0 ? props.maxLp : 8000;
  return Math.min(100, Math.max(0, (displayLp.value / max) * 100));
});

const lpHealthTier = computed(() => {
  if (displayLp.value > 4000) return 'healthy';
  if (displayLp.value > 2000) return 'warning';
  return 'critical';
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.lp-meter {
  position: relative;
  min-width: 270px;
  max-width: 330px;
  user-select: none;
  transition: all 0.3s ease;

  &__panel {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    border-radius: 12px;
    background: rgba(14, 18, 26, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(201, 162, 39, 0.35);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.7),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition: all 0.25s ease;
  }

  // Active Turn Glow
  &--active-turn {
    .lp-meter__panel {
      border-color: $color-gold-300;
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.8),
        0 0 18px rgba(201, 162, 39, 0.45);
    }
  }

  // Damage Flash (Red Pulse & Vibration on Damage Taken)
  &--damage-flash {
    animation: lp-damage-shake 0.45s ease-out;

    .lp-meter__panel {
      border-color: #eb5757 !important;
      box-shadow:
        0 0 28px rgba(235, 87, 87, 0.85),
        inset 0 0 16px rgba(235, 87, 87, 0.4) !important;
    }

    .lp-value {
      color: #ff4d4f !important;
      text-shadow: 0 0 14px rgba(255, 77, 79, 0.95) !important;
    }
  }

  // User Color Accents
  &--user {
    .lp-meter__panel {
      border-left: 3px solid #2f80ed;
    }
    &.lp-meter--active-turn .lp-meter__panel {
      border-color: #2f80ed;
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.8),
        0 0 18px rgba(47, 128, 237, 0.4);
    }
  }

  // AI Color Accents
  &--ai {
    .lp-meter__panel {
      border-right: 3px solid #eb5757;
    }
    &.lp-meter--active-turn .lp-meter__panel {
      border-color: #eb5757;
      box-shadow:
        0 8px 30px rgba(0, 0, 0, 0.8),
        0 0 18px rgba(235, 87, 87, 0.4);
    }
  }

  // Avatar Area
  &__avatar-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    background: #0a0c10;
    border: 2px solid $color-gold-500;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle, rgba(201, 162, 39, 0.25) 0%, rgba(10, 12, 16, 0.9) 100%);
      color: $color-gold-300;

      .avatar-glyph {
        width: 32px;
        height: 32px;
        opacity: 0.85;
      }
    }
  }

  .series-pill {
    position: absolute;
    bottom: -4px;
    right: -4px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.55rem;
    font-weight: 800;
    padding: 1px 4px;
    border-radius: 4px;
    line-height: 1;

    &--dm {
      background: $color-gold-500;
      color: #1a1406;
    }
    &--gx {
      background: #56ccf2;
      color: #0a0c10;
    }
  }

  .turn-badge {
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    background: #3ddc97;
    color: #0a0c10;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.5rem;
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 4px;
    letter-spacing: 0.05em;
    box-shadow: 0 0 8px rgba(61, 220, 151, 0.6);
  }

  // Content & Values
  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;

    .player-name {
      font-family: 'Cinzel', serif, sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      color: #f5f1e6;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .player-title {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.65rem;
      color: $color-gold-300;
      opacity: 0.85;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      text-align: right;
    }

    .ai-engine-badge {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.04em;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;

      &--gemini {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4));
        border: 1px solid rgba(168, 85, 247, 0.75);
        color: #f1f5f9;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
      }

      &--builtin {
        background: rgba(201, 162, 39, 0.2);
        border: 1px solid rgba(201, 162, 39, 0.6);
        color: #f7e4a8;
      }
    }
  }

  &__value-row {
    display: flex;
    align-items: baseline;
    gap: 6px;

    .lp-label {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      color: $color-gold-500;
    }

    .lp-value {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 1.6rem;
      font-weight: 800;
      color: $color-gold-100;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      line-height: 1;
      text-shadow: 0 0 10px rgba(244, 228, 184, 0.4);
    }
  }

  // Health Bar
  &__bar-track {
    width: 100%;
    height: 5px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 2px;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    transition:
      width 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      background-color 0.3s ease;

    &--healthy {
      background: linear-gradient(90deg, #3ddc97, #27ae60);
      box-shadow: 0 0 8px rgba(61, 220, 151, 0.5);
    }

    &--warning {
      background: linear-gradient(90deg, #f2c94c, #e2b93b);
      box-shadow: 0 0 8px rgba(242, 201, 76, 0.5);
    }

    &--critical {
      background: linear-gradient(90deg, #eb5757, #c0392b);
      box-shadow: 0 0 8px rgba(235, 87, 87, 0.6);
      animation: pulse-glow 1.2s infinite;
    }
  }
}

@keyframes lp-damage-shake {
  0% {
    transform: scale(1);
  }
  20% {
    transform: scale(1.05) translateY(-3px);
  }
  40% {
    transform: scale(0.96) translateY(2px);
  }
  60% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
