<template>
  <Transition name="video-fade">
    <div
      v-if="visible && video"
      class="video-overlay"
      tabindex="0"
      @click="handleSkip"
      @keydown="handleKeydown"
    >
      <!-- Real MP4 Video Player (if asset exists & loads) -->
      <video
        v-if="!videoError && videoSrc"
        ref="videoElement"
        class="video-overlay__player"
        :src="videoSrc"
        autoplay
        playsinline
        @ended="handleVideoEnded"
        @error="handleVideoError"
      />

      <!-- Cinematic Cutscene Fallback Stage (when video file is pending or placeholder) -->
      <div v-else class="video-overlay__fallback">
        <div class="video-overlay__backdrop-glow" />
        <div class="video-overlay__particles" />

        <!-- Header -->
        <header class="video-overlay__header">
          <span
            class="video-overlay__type-badge"
            :class="`video-overlay__type-badge--${video.videoType}`"
          >
            {{ video.videoType === 'summon' ? '⚡ SPECIAL SUMMON ⚡' : video.videoType === 'victory' ? '👑 SPECIAL VICTORY: EXODIA OBLITERATE! 👑' : '⚔️ BATTLE ATTACK ⚔️' }}
          </span>
          <h1 class="video-overlay__card-name">{{ video.cardName || 'Iconic Card' }}</h1>
        </header>

        <!-- Hero Artwork Presentation -->
        <main class="video-overlay__hero">
          <div class="video-overlay__art-frame">
            <img
              :src="getCardImageUrl(video.code, 'full')"
              :alt="video.cardName"
              class="video-overlay__art-img"
              @error="handleImageError"
            />
            <div class="video-overlay__art-shine" />
            <div class="video-overlay__art-rings" />
          </div>

          <div class="video-overlay__watermark">
            <span class="watermark-icon">🎬</span>
            <span class="watermark-text">
              {{ video.isPlaceholder ? 'Placeholder Video Asset' : 'Video Asset Loading' }}
            </span>
            <code class="watermark-path">{{ video.videoPath }}</code>
          </div>
        </main>

        <!-- Skip Hint -->
        <div class="video-overlay__skip-hint">
          <span>Click anywhere or press [Space] to skip</span>
          <span class="skip-icon">⏩</span>
        </div>

        <!-- Auto-advance progress bar -->
        <div class="video-overlay__progress-bar">
          <div
            class="video-overlay__progress-fill"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import type { CardVideoPayload } from '../../../shared/types/duel.js';
import { useSettingsStore } from '../../stores/settingsStore.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
import { audioManager } from '../../audio/index.js';

const props = defineProps<{
  video: CardVideoPayload | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'finish'): void;
}>();

const settingsStore = useSettingsStore();

const videoElement = ref<HTMLVideoElement | null>(null);
const videoError = ref(false);
const progressPercent = ref(0);

let progressInterval: ReturnType<typeof setInterval> | null = null;
const FALLBACK_DURATION_MS = 3000;

const videoSrc = computed(() => {
  if (!props.video?.videoPath) return '';
  const cleanPath = props.video.videoPath.replace(/^resources[\/\\]/, '');
  return `app-resource://${cleanPath}`;
});

watch(videoElement, (el) => {
  if (el) {
    el.volume = Math.max(0, Math.min(1, settingsStore.bgmVolume / 100));
  }
});

watch(
  () => props.visible,
  (isVis) => {
    if (isVis && props.video) {
      // Duck BGM immediately when cutscene starts
      audioManager.duckBgm('duel-video-overlay', 200);

      videoError.value = !!props.video.isPlaceholder;
      progressPercent.value = 0;
      if (videoError.value) {
        startProgressTimer();
      }
    } else {
      clearProgressTimer();
      audioManager.restoreBgm('duel-video-overlay', 350);
    }
  },
  { immediate: true },
);

function startProgressTimer(): void {
  clearProgressTimer();
  const startTime = Date.now();
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const pct = Math.min(100, (elapsed / FALLBACK_DURATION_MS) * 100);
    progressPercent.value = pct;
    if (pct >= 100) {
      clearProgressTimer();
      handleVideoEnded();
    }
  }, 40);
}

function clearProgressTimer(): void {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function handleVideoError(): void {
  videoError.value = true;
  startProgressTimer();
}

function handleVideoEnded(): void {
  clearProgressTimer();
  audioManager.restoreBgm('duel-video-overlay', 350);
  emit('finish');
}

function handleSkip(): void {
  clearProgressTimer();
  audioManager.restoreBgm('duel-video-overlay', 350);
  emit('finish');
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
    e.preventDefault();
    handleSkip();
  }
}

onUnmounted(() => {
  clearProgressTimer();
  audioManager.restoreBgm('duel-video-overlay', 350);
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 6, 10, 0.94);
  backdrop-filter: blur(12px);
  user-select: none;
  cursor: pointer;
  outline: none;

  &__player {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000000;
  }

  &__fallback {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 36px 40px;
    box-sizing: border-box;
    overflow: hidden;
  }

  &__backdrop-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at center,
      rgba(201, 162, 39, 0.18) 0%,
      rgba(47, 128, 237, 0.08) 45%,
      transparent 75%
    );
    pointer-events: none;
  }

  &__header {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    animation: slide-up 0.4s ease-out;
  }

  &__type-badge {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    padding: 4px 14px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

    &--summon {
      background: rgba(201, 162, 39, 0.25);
      border: 1px solid $color-gold-300;
      color: $color-gold-100;
      text-shadow: 0 0 10px rgba(201, 162, 39, 0.8);
    }

    &--attack {
      background: rgba(235, 87, 87, 0.25);
      border: 1px solid #eb5757;
      color: #ffcccc;
      text-shadow: 0 0 10px rgba(235, 87, 87, 0.8);
    }

    &--victory {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 140, 0, 0.4));
      border: 1px solid #ffd700;
      color: #fff4cc;
      text-shadow: 0 0 14px rgba(255, 215, 0, 0.9);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
    }
  }

  &__card-name {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 2.2rem;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: 0.04em;
    margin: 0;
    text-shadow:
      0 0 20px rgba(201, 162, 39, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.9);
  }

  &__hero {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__art-frame {
    position: relative;
    width: 220px;
    height: 320px;
    border-radius: 10px;
    overflow: hidden;
    background: #0a0c10;
    border: 2px solid $color-gold-300;
    box-shadow:
      0 0 40px rgba(201, 162, 39, 0.5),
      0 12px 36px rgba(0, 0, 0, 0.9);
    animation: hero-card-float 3s ease-in-out infinite alternate;
  }

  &__art-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__art-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 40%,
      rgba(201, 162, 39, 0.25) 100%
    );
    pointer-events: none;
  }

  &__watermark {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 6px;
    background: rgba(14, 18, 26, 0.8);
    border: 1px solid rgba(201, 162, 39, 0.3);
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.75rem;

    .watermark-text {
      color: rgba(244, 228, 184, 0.8);
      font-weight: 600;
    }

    .watermark-path {
      color: $color-gold-300;
      font-family: monospace;
      font-weight: 700;
    }
  }

  &__skip-hint {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(244, 228, 184, 0.6);
    letter-spacing: 0.05em;
    padding: 6px 16px;
    border-radius: 20px;
    background: rgba(10, 12, 16, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;

    &:hover {
      color: $color-gold-100;
      border-color: $color-gold-300;
    }
  }

  &__progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
  }

  &__progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2f80ed, $color-gold-500);
    box-shadow: 0 0 10px rgba(201, 162, 39, 0.8);
    transition: width 0.04s linear;
  }
}

@keyframes hero-card-float {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(-8px) scale(1.03);
  }
}

.video-fade-enter-active,
.video-fade-leave-active {
  transition: opacity 0.3s ease;
}

.video-fade-enter-from,
.video-fade-leave-to {
  opacity: 0;
}
</style>
