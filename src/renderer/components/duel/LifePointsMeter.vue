<template>
  <div
    class="lp-meter"
    :class="[
      `lp-meter--${player}`,
      {
        'lp-meter--active-turn': isTurn,
        'lp-meter--low-lp': currentLp <= 2000,
        'lp-meter--zero-lp': currentLp <= 0,
      },
    ]"
  >
    <div class="lp-meter__panel">
      <!-- Player Avatar Thumbnail -->
      <div class="lp-meter__avatar-wrapper">
        <div class="lp-meter__avatar">
          <img
            v-if="characterId"
            :src="getCharacterPortraitUrl(characterId)"
            :alt="name"
            class="avatar-image"
            @error="handleAvatarError"
          />
          <!-- Holographic Silhouette Fallback -->
          <div v-if="avatarFailed || !characterId" class="avatar-fallback">
            <svg viewBox="0 0 24 24" class="avatar-glyph" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
              />
            </svg>
          </div>
        </div>

        <!-- Series Pill -->
        <span v-if="series" class="series-pill" :class="`series-pill--${series.toLowerCase()}`">
          {{ series }}
        </span>

        <!-- Turn Active Badge -->
        <span v-if="isTurn" class="turn-badge">
          TURN
        </span>
      </div>

      <!-- Info & LP Counter -->
      <div class="lp-meter__content">
        <div class="lp-meter__header">
          <span class="player-name">{{ name }}</span>
          <span v-if="title" class="player-title">{{ title }}</span>
        </div>

        <!-- Huge Oxanium LP Counter -->
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
import { ref, computed } from 'vue';
import { getCharacterPortraitUrl } from '../../utils/media.js';

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
  }>(),
  {
    title: '',
    series: 'DM',
    avatar: '',
    characterId: '',
    maxLp: 8000,
    isTurn: false,
  },
);

const avatarFailed = ref(false);

function handleAvatarError(): void {
  avatarFailed.value = true;
}

const formattedLp = computed(() => {
  return Math.max(0, props.currentLp).toString();
});

const lpPercentage = computed(() => {
  const max = props.maxLp > 0 ? props.maxLp : 8000;
  return Math.min(100, Math.max(0, (props.currentLp / max) * 100));
});

const lpHealthTier = computed(() => {
  if (props.currentLp > 4000) return 'healthy';
  if (props.currentLp > 2000) return 'warning';
  return 'critical';
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.lp-meter {
  position: relative;
  min-width: 220px;
  max-width: 260px;
  user-select: none;
  transition: all 0.3s ease;

  &__panel {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(14, 18, 26, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(201, 162, 39, 0.3);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.6),
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
      background: linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(10, 12, 16, 0.8));
      color: $color-gold-300;

      .avatar-glyph {
        width: 32px;
        height: 32px;
        opacity: 0.8;
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
    gap: 6px;
    white-space: nowrap;
    overflow: hidden;

    .player-name {
      font-family: 'Cinzel', serif, sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
      color: #f5f1e6;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .player-title {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.65rem;
      color: $color-gold-300;
      opacity: 0.8;
      text-overflow: ellipsis;
      overflow: hidden;
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
</style>
