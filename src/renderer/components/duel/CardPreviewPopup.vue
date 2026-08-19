<template>
  <Transition name="preview-fade">
    <div
      v-if="card"
      class="card-preview-popup"
      :class="[`card-preview-popup--${position}`]"
    >
      <div class="preview-panel glass-panel glass-panel--accent-gold">
        <!-- Close / Dismiss button if pinned -->
        <button
          v-if="isPinned"
          class="preview-close-btn"
          title="Close Preview"
          @click="$emit('close')"
        >
          ✕
        </button>

        <!-- Full Artwork Image Container -->
        <div class="card-art-box">
          <img
            :src="getCardImageUrl(card.code, 'full')"
            :alt="card.name"
            class="full-card-image"
            @error="handleImageError"
          />
          <div class="foil-reflection"></div>
        </div>

        <!-- Structured Details Block -->
        <div class="card-info-block">
          <!-- Card Name -->
          <div class="card-title-row">
            <h3 class="card-name">{{ card.name }}</h3>
            <span
              v-if="card.attribute"
              class="attribute-badge"
              :class="`attribute-badge--${card.attribute.toLowerCase()}`"
            >
              {{ card.attribute }}
            </span>
          </div>

          <!-- Level / Rank Stars & Type Row -->
          <div class="card-meta-row">
            <div v-if="card.level && card.level > 0" class="level-stars">
              <span v-for="i in card.level" :key="i" class="star">★</span>
              <span class="level-count">LV {{ card.level }}</span>
            </div>

            <div v-if="card.race" class="type-bracket">
              [{{ card.race }} / {{ card.level && card.level > 0 ? 'Monster' : 'Card' }}]
            </div>
          </div>

          <!-- ATK / DEF Scores (Monsters) -->
          <div
            v-if="card.atk !== undefined || card.def !== undefined"
            class="combat-stats-box"
          >
            <div class="stat-col">
              <span class="stat-lbl">ATK</span>
              <span class="stat-val stat-val--atk">{{ card.atk }}</span>
            </div>
            <div class="stat-divider">/</div>
            <div class="stat-col">
              <span class="stat-lbl">DEF</span>
              <span class="stat-val stat-val--def">{{ card.def }}</span>
            </div>
          </div>

          <!-- Scrollable Card Effect Text / Lore -->
          <div class="card-lore-box">
            <p class="lore-text">
              {{ card.description || 'No description available for this card.' }}
            </p>
          </div>

          <!-- Passcode Footer -->
          <div class="card-footer-row">
            <span class="passcode-lbl">PASSCODE</span>
            <span class="passcode-val">{{ card.code }}</span>
            <span class="location-tag">{{ card.location.toUpperCase() }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { FieldCard } from '../../../shared/types/field.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';

withDefaults(
  defineProps<{
    card?: FieldCard | null;
    isPinned?: boolean;
    position?: 'left' | 'right';
  }>(),
  {
    card: null,
    isPinned: false,
    position: 'left',
  },
);

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.card-preview-popup {
  position: absolute;
  top: 60px;
  bottom: 60px;
  width: 280px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  &--left {
    left: 20px;
  }

  &--right {
    right: 20px;
  }

  .preview-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 14px;
    box-sizing: border-box;
    overflow: hidden;
    gap: 12px;
    background: rgba(14, 18, 26, 0.88);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(201, 162, 39, 0.4);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.8),
      0 0 20px rgba(201, 162, 39, 0.2);
  }

  .preview-close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(10, 12, 16, 0.8);
    border: 1px solid rgba(201, 162, 39, 0.4);
    color: #f5f1e6;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s ease;

    &:hover {
      background: #eb5757;
      border-color: #eb5757;
    }
  }

  // Artwork
  .card-art-box {
    position: relative;
    width: 100%;
    max-height: 260px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0c10;
    border: 1px solid rgba(201, 162, 39, 0.35);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .full-card-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .foil-reflection {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.12) 0%,
        transparent 50%,
        rgba(201, 162, 39, 0.1) 100%
      );
      pointer-events: none;
    }
  }

  // Info Block
  .card-info-block {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
  }

  .card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    .card-name {
      font-family: 'Cinzel', serif, sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: $color-gold-100;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.03em;
    }

    .attribute-badge {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      line-height: 1;
      text-transform: uppercase;
      background: $color-gold-500;
      color: #1a1406;

      &--spell {
        background: #3ddc97;
        color: #0a0c10;
      }
      &--trap {
        background: #eb5757;
        color: #fff;
      }
      &--dark {
        background: #9b51e0;
        color: #fff;
      }
      &--light {
        background: #f2c94c;
        color: #1a1406;
      }
      &--earth {
        background: #b5804c;
        color: #fff;
      }
      &--water {
        background: #2f80ed;
        color: #fff;
      }
      &--fire {
        background: #eb5757;
        color: #fff;
      }
      &--wind {
        background: #27ae60;
        color: #fff;
      }
    }
  }

  .card-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .level-stars {
      display: flex;
      align-items: center;
      gap: 1px;
      color: #f2c94c;
      font-size: 0.75rem;

      .level-count {
        font-family: 'Oxanium', monospace, sans-serif;
        font-size: 0.65rem;
        font-weight: 700;
        color: $color-gold-300;
        margin-left: 4px;
      }
    }

    .type-bracket {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      color: #b8b2a0;
    }
  }

  // Combat Stats
  .combat-stats-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 6px 12px;
    border-radius: 6px;
    background: rgba(10, 12, 16, 0.7);
    border: 1px solid rgba(201, 162, 39, 0.25);

    .stat-col {
      display: flex;
      align-items: baseline;
      gap: 6px;

      .stat-lbl {
        font-family: 'Oxanium', monospace, sans-serif;
        font-size: 0.65rem;
        font-weight: 700;
        color: $color-gold-500;
      }

      .stat-val {
        font-family: 'Oxanium', monospace, sans-serif;
        font-size: 1.1rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;

        &--atk {
          color: #f5f1e6;
        }
        &--def {
          color: #b8b2a0;
        }
      }
    }

    .stat-divider {
      color: rgba(201, 162, 39, 0.4);
      font-size: 0.9rem;
    }
  }

  // Effect Lore Text
  .card-lore-box {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px 10px;
    border-radius: 6px;
    background: rgba(10, 12, 16, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);

    .lore-text {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.8rem;
      line-height: 1.4;
      color: #f5f1e6;
      margin: 0;
      white-space: pre-wrap;
    }
  }

  .card-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.6rem;
    color: rgba(184, 178, 160, 0.5);

    .passcode-val {
      font-weight: 700;
      color: $color-gold-300;
    }

    .location-tag {
      font-weight: 800;
      color: #56ccf2;
    }
  }
}

// Transitions
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
