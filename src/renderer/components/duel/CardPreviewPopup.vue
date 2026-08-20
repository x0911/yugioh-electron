<template>
  <Transition name="preview-fade">
    <div
      v-if="effectiveCard"
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
            v-if="effectiveCard.code > 0"
            :src="getCardImageUrl(effectiveCard.code, 'full')"
            :alt="effectiveCard.name"
            class="full-card-image"
            @error="handleImageError"
          />
          <img
            v-else
            :src="getCardBackUrl()"
            alt="Face-Down Card"
            class="full-card-image full-card-image--back"
            @error="handleImageError"
          />
          <div class="foil-reflection"></div>
        </div>

        <!-- Structured Details Block -->
        <div class="card-info-block">
          <!-- Card Name & Attribute Row -->
          <div class="card-title-row">
            <h3 class="card-name" :title="effectiveCard.name">{{ effectiveCard.name }}</h3>
            <span
              v-if="effectiveCard.code > 0 && effectiveCard.attribute"
              class="attribute-badge"
              :class="`attribute-badge--${effectiveCard.attribute.toLowerCase()}`"
            >
              {{ effectiveCard.attribute }}
            </span>
            <span
              v-else-if="effectiveCard.code === 0"
              class="attribute-badge attribute-badge--secret"
            >
              SECRET
            </span>
          </div>

          <!-- Level / Rank Stars Row (Dedicated Line - only for revealed monsters) -->
          <div
            v-if="effectiveCard.code > 0 && effectiveCard.level && effectiveCard.level > 0"
            class="card-level-row"
          >
            <div class="level-stars">
              <span v-for="i in effectiveCard.level" :key="i" class="star">★</span>
            </div>
            <span class="level-pill">LV {{ effectiveCard.level }}</span>
          </div>

          <!-- Type & Race Bracket Row (Dedicated Line) -->
          <div class="card-type-row">
            <span v-if="effectiveCard.code > 0" class="type-bracket">
              [{{ typeBracketText }}]
            </span>
            <span v-else class="type-bracket type-bracket--secret">
              [Face-Down Card / Unknown]
            </span>
          </div>

          <!-- ATK / DEF Scores (Only for revealed Monsters) -->
          <div
            v-if="
              effectiveCard.code > 0 &&
              (effectiveCard.atk !== undefined || effectiveCard.def !== undefined)
            "
            class="combat-stats-box"
          >
            <div class="stat-col">
              <span class="stat-lbl">ATK</span>
              <span class="stat-val stat-val--atk">{{ formatCombatStat(effectiveCard.atk) }}</span>
            </div>
            <div class="stat-divider">/</div>
            <div class="stat-col">
              <span class="stat-lbl">DEF</span>
              <span class="stat-val stat-val--def">{{ formatCombatStat(effectiveCard.def) }}</span>
            </div>
          </div>

          <!-- Status Icon Row (Shown when card has active status flags) -->
          <div v-if="activeStatuses.length > 0" class="status-icon-row">
            <span class="status-row-label">STATUS</span>
            <div class="status-badges-list">
              <IconIndicator
                v-for="st in activeStatuses"
                :key="st"
                type="status"
                :status="st"
                size="sm"
                :show-tooltip="true"
              />
            </div>
          </div>

          <!-- Scrollable Card Effect Text / Lore -->
          <div class="card-lore-box">
            <p class="lore-text">
              {{
                effectiveCard.description ||
                (effectiveCard.code === 0
                  ? 'This card is currently face-down on the field. Its identity, stats, and effects remain hidden until activated or flipped face-up.'
                  : 'No description available for this card.')
              }}
            </p>
          </div>

          <!-- Passcode & Location Footer (Neatly Pinned Inside Panel) -->
          <div class="card-footer-row">
            <div class="passcode-group">
              <span class="passcode-lbl">PASSCODE</span>
              <span class="passcode-val">{{
                effectiveCard.code > 0 ? effectiveCard.code : '????????'
              }}</span>
            </div>
            <span class="location-tag">{{ (effectiveCard.location || 'DECK').toUpperCase() }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard, CardStatusType } from '../../../shared/types/field.js';
import { useDuelStore } from '../../stores/duelStore.js';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
import IconIndicator from '../common/IconIndicator.vue';

const props = withDefaults(
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

const duelStore = useDuelStore();

const effectiveCard = computed<FieldCard | null>(() => {
  if (!props.card) return null;
  if (props.card.code <= 0) return props.card;
  const detail = duelStore.getCardDetail(props.card.code);
  if (!detail) return props.card;
  return {
    ...props.card,
    name:
      props.card.name && props.card.name !== 'Card' && !props.card.name.startsWith('[Card #')
        ? props.card.name
        : detail.name,
    atk: props.card.atk !== undefined ? props.card.atk : detail.isMonster ? detail.atk : undefined,
    def: props.card.def !== undefined ? props.card.def : detail.isMonster ? detail.def : undefined,
    level:
      props.card.level !== undefined
        ? props.card.level
        : detail.isMonster
          ? detail.level
          : undefined,
    attribute: props.card.attribute || detail.attributeName,
    race: props.card.race || detail.raceName,
    description: props.card.description || detail.desc,
  };
});

const activeStatuses = computed<CardStatusType[]>(() => {
  if (!effectiveCard.value || effectiveCard.value.code <= 0) return [];
  if (effectiveCard.value.statuses && effectiveCard.value.statuses.length > 0) {
    return effectiveCard.value.statuses;
  }
  const statuses: CardStatusType[] = [];
  const loc = effectiveCard.value.location;
  if (loc === 'monster' || loc === 'extra-monster') {
    const isDefense =
      effectiveCard.value.position === 'faceup_defense' ||
      effectiveCard.value.position === 'facedown_defense';
    const isTurn1 = duelStore.turnNumber <= 1;
    if (isDefense || isTurn1) {
      statuses.push('no-attack');
    }
  }
  const detail = duelStore.getCardDetail(effectiveCard.value.code);
  if (
    detail &&
    detail.desc &&
    (detail.desc.includes('Cannot be Special Summoned') ||
      detail.desc.includes('This card cannot be Special Summoned') ||
      detail.isSpirit)
  ) {
    statuses.push('no-special-summon');
  }
  return statuses;
});

const typeBracketText = computed(() => {
  if (!effectiveCard.value) return '';
  const detail = duelStore.getCardDetail(effectiveCard.value.code);
  if (detail?.typeLabels && detail.typeLabels.length > 0) {
    return detail.typeLabels.join(' / ');
  }
  const race =
    effectiveCard.value.race ||
    (effectiveCard.value.attribute === 'SPELL'
      ? 'Spell'
      : effectiveCard.value.attribute === 'TRAP'
        ? 'Trap'
        : 'Monster');
  const kind =
    effectiveCard.value.level && effectiveCard.value.level > 0
      ? 'Monster'
      : effectiveCard.value.attribute === 'SPELL'
        ? 'Spell Card'
        : effectiveCard.value.attribute === 'TRAP'
          ? 'Trap Card'
          : 'Monster';
  return `${race} / ${kind}`;
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.card-preview-popup {
  position: absolute;
  top: 64px;
  max-height: calc(100vh - 128px);
  width: 290px;
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
    display: flex;
    flex-direction: column;
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;
    gap: 8px;
    background: rgba(14, 18, 26, 0.92);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(201, 162, 39, 0.45);
    border-radius: 12px;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.85),
      0 0 20px rgba(201, 162, 39, 0.25);
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
    height: 240px;
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

      &--back {
        object-fit: cover;
      }
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
    display: flex;
    flex-direction: column;
    gap: 6px;
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
      letter-spacing: 0.02em;
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
      flex-shrink: 0;

      &--secret {
        background: #4f5d75;
        color: #fff;
        letter-spacing: 0.05em;
      }
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

  // Dedicated Level Row
  .card-level-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1px 0;

    .level-stars {
      display: flex;
      align-items: center;
      gap: 1.5px;
      color: #f2c94c;
      font-size: 0.75rem;
      text-shadow: 0 0 4px rgba(242, 201, 76, 0.6);
    }

    .level-pill {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.6rem;
      font-weight: 800;
      color: $color-gold-300;
      background: rgba(201, 162, 39, 0.15);
      border: 1px solid rgba(201, 162, 39, 0.3);
      padding: 1px 5px;
      border-radius: 3px;
    }
  }

  // Dedicated Type Row
  .card-type-row {
    .type-bracket {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      color: #c9c3b2;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &--secret {
        color: #8c9ba5;
        font-style: italic;
      }
    }
  }

  // Combat Stats
  .combat-stats-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 4px 10px;
    border-radius: 5px;
    background: rgba(10, 12, 16, 0.75);
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
        font-size: 1.05rem;
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

  // Status Icon Row
  .status-icon-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 5px;
    background: rgba(10, 12, 16, 0.75);
    border: 1px solid rgba(201, 162, 39, 0.3);

    .status-row-label {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.6rem;
      font-weight: 800;
      color: $color-gold-500;
      letter-spacing: 0.05em;
    }

    .status-badges-list {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  // Effect Lore Text
  .card-lore-box {
    max-height: 210px;
    overflow-y: auto;
    padding: 6px 8px;
    border-radius: 5px;
    background: rgba(10, 12, 16, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.05);

    .lore-text {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.8rem;
      line-height: 1.35;
      color: #f5f1e6;
      margin: 0;
      white-space: pre-wrap;
    }
  }

  .card-footer-row {
    display: none; // TODO: We can enable this later if we want to show passcode and location in the preview, but for now it's hidden
    // display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.6rem;

    .passcode-group {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .passcode-lbl {
      color: rgba(184, 178, 160, 0.6);
      font-weight: 600;
    }

    .passcode-val {
      font-weight: 800;
      color: $color-gold-300;
      letter-spacing: 0.05em;
    }

    .location-tag {
      font-weight: 800;
      color: #56ccf2;
      background: rgba(86, 204, 242, 0.15);
      border: 1px solid rgba(86, 204, 242, 0.3);
      padding: 1px 5px;
      border-radius: 3px;
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
