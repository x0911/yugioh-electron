<template>
  <button
    type="button"
    class="character-card"
    :class="{
      'character-card--selected': isSelected,
      'character-card--dm': character.series === 'DM',
      'character-card--gx': character.series === 'GX',
    }"
    :style="{ '--char-theme-color': character.themeColor || '#c9a227' }"
    :aria-pressed="isSelected"
    :aria-label="`${character.name} (${character.series}) - ${character.title}`"
    @click="$emit('select', character.id)"
  >
    <!-- Card Frame Silhouette -->
    <div class="character-card__frame">
      <!-- Top Series Badge -->
      <div class="character-card__header">
        <span
          class="character-card__series-badge"
          :class="`character-card__series-badge--${character.series.toLowerCase()}`"
        >
          {{ character.series === 'DM' ? 'DM • Duel Monsters' : 'GX • Academy' }}
        </span>
        <span v-if="isSelected" class="character-card__selected-indicator">
          <svg
            class="character-card__check-icon"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          ACTIVE
        </span>
      </div>

      <!-- Avatar Portrait / Silhouette Container -->
      <div class="character-card__avatar-container">
        <!-- Hologram Background Rune Disc -->
        <div class="character-card__hologram-disc"></div>

        <!-- Real Image if available -->
        <img
          v-if="!imageFailed && character.avatar"
          :src="character.avatar"
          :alt="character.name"
          class="character-card__image"
          @error="handleImageError"
        />

        <!-- Styled Silhouette Placeholder -->
        <div v-else class="character-card__silhouette" aria-hidden="true">
          <svg
            class="character-card__silhouette-svg"
            viewBox="0 0 120 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Background Egyptian/Energy Glyphs -->
            <circle
              cx="60"
              cy="70"
              r="48"
              stroke="var(--char-theme-color)"
              stroke-width="1.5"
              stroke-dasharray="4 4"
              opacity="0.4"
            />
            <circle
              cx="60"
              cy="70"
              r="34"
              stroke="var(--char-theme-color)"
              stroke-width="1"
              opacity="0.25"
            />
            <!-- Head & Spiky Anime Hair Silhouette -->
            <path
              d="M60 22C44 22 36 34 36 50C36 58 38 64 42 70L38 88C38 88 46 86 52 84C55 85 57 86 60 86C63 86 65 85 68 84C74 86 82 88 82 88L78 70C82 64 84 58 84 50C84 34 76 22 60 22Z"
              fill="url(#charGrad)"
              opacity="0.9"
            />
            <!-- Anime Hair Flare Spikes -->
            <path
              d="M60 14L52 28L60 24L68 28L60 14Z"
              fill="var(--char-theme-color)"
              opacity="0.75"
            />
            <path
              d="M36 38L22 48L36 54L32 44L36 38Z"
              fill="var(--char-theme-color)"
              opacity="0.6"
            />
            <path
              d="M84 38L98 48L84 54L88 44L84 38Z"
              fill="var(--char-theme-color)"
              opacity="0.6"
            />
            <!-- Torso & Duelist Collar -->
            <path
              d="M34 100C24 106 14 118 10 134H110C106 118 96 106 86 100C80 108 70 114 60 114C50 114 40 108 34 100Z"
              fill="url(#charGrad)"
              opacity="0.85"
            />
            <defs>
              <linearGradient
                id="charGrad"
                x1="60"
                y1="20"
                x2="60"
                y2="134"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#f4e4b8" stop-opacity="0.9" />
                <stop offset="0.6" stop-color="var(--char-theme-color)" stop-opacity="0.7" />
                <stop offset="1" stop-color="#0a0c10" stop-opacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
          <span class="character-card__placeholder-tag">PORTRAIT PLACEHOLDER</span>
        </div>
      </div>

      <!-- Character Info Block -->
      <div class="character-card__info">
        <h3 class="character-card__name">{{ character.name }}</h3>
        <p class="character-card__title">{{ character.title }}</p>
        <div class="character-card__archetype-pill">
          {{ character.decks[0]?.archetype || 'Custom Archetype' }}
        </div>
      </div>

      <!-- Foil Light-Sweep Layer -->
      <div class="character-card__foil-sweep" aria-hidden="true"></div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CharacterData } from '../../../shared/types/character.js';

interface Props {
  character: CharacterData;
  isSelected?: boolean;
}

defineProps<Props>();
defineEmits<{
  (e: 'select', id: string): void;
}>();

const imageFailed = ref(false);

function handleImageError(): void {
  imageFailed.value = true;
}
</script>

<style scoped lang="scss">
.character-card {
  position: relative;
  width: 220px;
  min-width: 220px;
  height: 340px;
  background: rgba(18, 22, 30, 0.65);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1.5px solid rgba(201, 162, 39, 0.3);
  border-radius: 14px;
  padding: 0;
  cursor: pointer;
  outline: none;
  text-align: left;
  overflow: hidden;
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  scroll-snap-align: start;

  &__frame {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 12px;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    min-height: 22px;
  }

  &__series-badge {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 8px;
    border-radius: 6px;

    &--dm {
      background: rgba(201, 162, 39, 0.2);
      border: 1px solid rgba(201, 162, 39, 0.5);
      color: #f4e4b8;
    }

    &--gx {
      background: rgba(86, 204, 242, 0.18);
      border: 1px solid rgba(86, 204, 242, 0.5);
      color: #56ccf2;
    }
  }

  &__selected-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Oxanium', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #3ddc97;
    background: rgba(61, 220, 151, 0.15);
    border: 1px solid rgba(61, 220, 151, 0.5);
    padding: 2px 6px;
    border-radius: 6px;
  }

  &__check-icon {
    width: 12px;
    height: 12px;
  }

  &__avatar-container {
    position: relative;
    flex: 1;
    width: 100%;
    border-radius: 10px;
    background: radial-gradient(
      circle at 50% 40%,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(10, 12, 16, 0.85) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-bottom: 10px;
  }

  &__hologram-disc {
    position: absolute;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 1px dashed var(--char-theme-color);
    opacity: 0.3;
    animation: rotateDisc 24s linear infinite;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 2;
  }

  &__silhouette {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

  &__silhouette-svg {
    width: 90px;
    height: 105px;
  }

  &__placeholder-tag {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: rgba(244, 228, 184, 0.6);
    margin-top: 4px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-family: 'Oxanium', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #f5f1e6;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.02em;
    transition: color 0.2s ease;
  }

  &__title {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.78rem;
    color: #b8b2a0;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__archetype-pill {
    margin-top: 6px;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.72rem;
    color: #f4e4b8;
    background: rgba(201, 162, 39, 0.12);
    border: 1px solid rgba(201, 162, 39, 0.25);
    border-radius: 4px;
    padding: 3px 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__foil-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 20%,
      rgba(255, 255, 255, 0.15) 45%,
      rgba(244, 228, 184, 0.3) 50%,
      transparent 55%
    );
    opacity: 0;
    pointer-events: none;
    transform: translateX(-100%);
    transition:
      transform 0.5s ease,
      opacity 0.3s ease;
    z-index: 3;
  }

  // Hover state
  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(201, 162, 39, 0.8);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.6),
      0 0 20px rgba(201, 162, 39, 0.3);

    .character-card__name {
      color: #e3c567;
    }

    .character-card__foil-sweep {
      opacity: 1;
      transform: translateX(100%);
    }
  }

  // Active / pressed
  &:active {
    transform: translateY(-1px) scale(0.99);
  }

  // Focus visible
  &:focus-visible {
    border-color: #56ccf2;
    box-shadow:
      0 0 0 2px #56ccf2,
      0 12px 32px rgba(0, 0, 0, 0.6);
  }

  // Selected state
  &--selected {
    background: rgba(28, 34, 46, 0.85);
    border-color: #c9a227;
    box-shadow:
      0 12px 36px rgba(0, 0, 0, 0.65),
      0 0 24px rgba(201, 162, 39, 0.45),
      inset 0 0 16px rgba(201, 162, 39, 0.15);

    .character-card__name {
      color: #f4e4b8;
      text-shadow: 0 0 10px rgba(201, 162, 39, 0.5);
    }
  }
}

@keyframes rotateDisc {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
