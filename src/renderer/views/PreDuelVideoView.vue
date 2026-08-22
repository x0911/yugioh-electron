<template>
  <div
    class="pre-duel-video-view"
    tabindex="0"
    @click="handleSkip"
    @keydown="handleKeydown"
  >
    <!-- Real Video Player (if available) -->
    <video
      v-if="!videoError && videoUrl"
      ref="videoElement"
      class="pre-duel-video-view__video-player"
      :src="videoUrl"
      autoplay
      playsinline
      @ended="handleVideoEnded"
      @error="handleVideoError"
    />

    <!-- Cinematic Cutscene Fallback (when video file is pending) -->
    <div v-else class="pre-duel-video-view__fallback-stage">
      <div class="pre-duel-video-view__backdrop-particles" />

      <!-- Top Header -->
      <header class="pre-duel-video-view__header">
        <span
          class="pre-duel-video-view__series-pill"
          :class="`pre-duel-video-view__series-pill--${opponentSeries.toLowerCase()}`"
        >
          {{ opponentSeries === 'DM' ? 'ORIGINAL SERIES' : 'YU-GI-OH! GX' }}
        </span>
        <h2 class="pre-duel-video-view__intro-heading">DUELIST CHALLENGE</h2>
      </header>

      <!-- Center Hero Dossier Card -->
      <main class="pre-duel-video-view__hero-card">
        <!-- Portrait Column -->
        <div class="pre-duel-video-view__portrait-col">
          <img
            v-if="opponentAvatarUrl && !portraitError"
            :src="opponentAvatarUrl"
            :alt="opponentName"
            class="pre-duel-video-view__portrait-img"
            @error="portraitError = true"
          />
          <div v-else class="pre-duel-video-view__portrait-silhouette">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        <!-- Info Column -->
        <div class="pre-duel-video-view__info-col">
          <h1 class="pre-duel-video-view__char-name">{{ opponentName }}</h1>
          <h3 class="pre-duel-video-view__char-title">{{ opponentTitle }}</h3>

          <p v-if="opponentTagline" class="pre-duel-video-view__char-quote">
            "{{ opponentTagline }}"
          </p>

          <div class="pre-duel-video-view__deck-info">
            <span class="pre-duel-video-view__deck-label">RIVAL ARSENAL</span>
            <span class="pre-duel-video-view__deck-name">
              {{ duelStore.selectedOpponentDeck?.name || 'Selected Archetype Deck' }}
              ({{ duelStore.selectedOpponentDeck?.archetype || 'Custom' }})
            </span>
          </div>

          <div class="pre-duel-video-view__watermark-badge">
            <span class="watermark-icon">🎬</span>
            <span class="watermark-title">Video Pending:</span>
            <code class="watermark-path">{{ expectedVideoPath }}</code>
          </div>
        </div>
      </main>

      <!-- Bottom Skip Overlay -->
      <div class="pre-duel-video-view__skip-overlay">
        <span>Click anywhere or press [Space] to skip</span>
        <span class="skip-icon">⏩</span>
      </div>

      <!-- Auto-advance countdown bar -->
      <div class="pre-duel-video-view__progress-bar-container">
        <div
          class="pre-duel-video-view__progress-bar-fill"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import { getCharacterVideoUrl, getCharacterPortraitUrl } from '../utils/media.js';
import { audioManager } from '../audio/index.js';

const router = useRouter();
const duelStore = useDuelStore();
const settingsStore = useSettingsStore();

const videoElement = ref<HTMLVideoElement | null>(null);
const videoError = ref(false);
const portraitError = ref(false);
const progressPercent = ref(0);

let progressInterval: ReturnType<typeof setInterval> | null = null;
const FALLBACK_DURATION_MS = 4500;

const opponentId = computed(() => duelStore.selectedOpponent?.id || 'yugi-muto');
const opponentName = computed(() => duelStore.opponentName);
const opponentTitle = computed(() => duelStore.opponentTitle);
const opponentSeries = computed(() => duelStore.opponentSeries);
const opponentTagline = computed(() => duelStore.selectedOpponent?.tagline || '');
const videoUrl = computed(() => getCharacterVideoUrl(opponentId.value));
const opponentAvatarUrl = computed(() => getCharacterPortraitUrl(opponentId.value));
const expectedVideoPath = computed(() => `resources/videos/characters/${opponentId.value}.mp4`);

watch(videoElement, (el) => {
  if (el) {
    el.volume = Math.max(0, Math.min(1, settingsStore.bgmVolume / 100));
    el.play().catch((err) => {
      console.warn('[PreDuelVideoView] Video autoplay failed:', err);
    });
  }
});

onMounted(async () => {
  // If user configured skip in Settings, bypass video immediately
  if (settingsStore.skipPreDuelVideo) {
    router.replace('/duel');
    return;
  }

  // Duck BGM during pre-duel cutscene
  audioManager.duckBgm('pre-duel-video', 250);

  // Ensure match data is configured
  if (!duelStore.isMatchPrepared) {
    await duelStore.setupMatch();
  }

  // Configure video volume if player exists
  if (videoElement.value) {
    videoElement.value.volume = Math.max(0, Math.min(1, settingsStore.bgmVolume / 100));
    videoElement.value.play().catch(() => {});
  } else if (!videoUrl.value) {
    // If no video URL at all, initiate fallback countdown
    videoError.value = true;
    startProgressTimer();
  }
});

onUnmounted(() => {
  clearProgressTimer();
  audioManager.restoreBgm('pre-duel-video', 350);
});

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
  }, 50);
}

function clearProgressTimer(): void {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function handleVideoError(): void {
  console.log(`[PreDuelVideo] Video file not found or unplayable at ${expectedVideoPath.value}. Rendering cinematic fallback.`);
  videoError.value = true;
  startProgressTimer();
}

function handleVideoEnded(): void {
  clearProgressTimer();
  router.push('/duel');
}

function handleSkip(): void {
  clearProgressTimer();
  router.push('/duel');
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
    e.preventDefault();
    handleSkip();
  }
}
</script>

