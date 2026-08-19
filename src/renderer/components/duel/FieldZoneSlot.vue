<template>
  <div
    class="field-zone-slot"
    :class="[
      `field-zone-slot--${player}`,
      `field-zone-slot--${zoneType}`,
      {
        'field-zone-slot--occupied': !!card,
        'field-zone-slot--empty': !card,
        'field-zone-slot--inert': isInert,
        'field-zone-slot--targeted': isTargeted,
        'field-zone-slot--selectable': isSelectable,
      },
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <!-- Tooltip for inert zones (EMZ, Pendulum, etc.) or slot info -->
    <Tooltip
      v-if="tooltipText"
      :content="tooltipText"
      position="top"
    >
      <div class="slot-frame">
        <slot-content />
      </div>
    </Tooltip>

    <div v-else class="slot-frame">
      <!-- Empty Slot Watermark Label -->
      <div v-if="!card" class="slot-empty-content">
        <div class="slot-label">{{ zoneLabel }}</div>
        <div v-if="zoneSubLabel" class="slot-sublabel">{{ zoneSubLabel }}</div>
        <div class="slot-octagon-border"></div>
      </div>

      <!-- Card Display when Occupied -->
      <div
        v-else
        class="field-card"
        :class="[
          `field-card--${card.position}`,
          {
            'field-card--is-defense': isDefensePosition,
            'field-card--is-facedown': isFaceDown,
          },
        ]"
      >
        <!-- Face-down Card (Set Monster in DEF or Set Spell/Trap) -->
        <div v-if="isFaceDown" class="card-face card-face--back">
          <img
            :src="getCardBackUrl()"
            alt="Card Back"
            class="card-image card-image--back"
            @error="handleImageError"
          />
          <div class="card-foil-sheen"></div>
          <div v-if="card.position === 'facedown_defense'" class="set-defense-pill">
            DEF SET
          </div>
        </div>

        <!-- Face-up Card (Attack Monster, Face-up Defense Monster, or Face-up Spell/Trap) -->
        <div v-else class="card-face card-face--front">
          <img
            :src="getCardImageUrl(card.code, 'mini')"
            :alt="card.name"
            class="card-image"
            @error="handleImageError"
          />
          <div class="card-foil-sheen"></div>

          <!-- Monster Combat Stats Overlay -->
          <div v-if="card.atk !== undefined || card.def !== undefined" class="stats-badge">
            <span
              v-if="card.atk !== undefined"
              class="stat-item stat-item--atk"
              :class="{ 'stat-item--active': card.position === 'faceup_attack' }"
            >
              <span class="stat-prefix">ATK</span> {{ card.atk }}
            </span>
            <span
              v-if="card.def !== undefined"
              class="stat-item stat-item--def"
              :class="{ 'stat-item--active': card.position === 'faceup_defense' }"
            >
              <span class="stat-prefix">DEF</span> {{ card.def }}
            </span>
          </div>

          <!-- Level Stars Overlay (Monsters) -->
          <div v-if="card.level && card.level > 0" class="level-badge">
            ★{{ card.level }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard, FieldZoneType } from '../../../shared/types/field.js';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import Tooltip from '../common/Tooltip.vue';

const props = withDefaults(
  defineProps<{
    zoneType: FieldZoneType;
    zoneIndex?: number;
    zoneLabel: string;
    zoneSubLabel?: string;
    player: 'user' | 'ai';
    card?: FieldCard | null;
    isInert?: boolean;
    inertTooltip?: string;
    isTargeted?: boolean;
    isSelectable?: boolean;
  }>(),
  {
    zoneIndex: 0,
    zoneSubLabel: '',
    card: null,
    isInert: false,
    inertTooltip: '',
    isTargeted: false,
    isSelectable: false,
  },
);

const emit = defineEmits<{
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'click-card', card: FieldCard | null): void;
}>();

const isDefensePosition = computed(() => {
  return (
    props.card?.position === 'faceup_defense' ||
    props.card?.position === 'facedown_defense'
  );
});

const isFaceDown = computed(() => {
  return (
    props.card?.position === 'facedown_defense' ||
    props.card?.position === 'facedown_spell'
  );
});

const tooltipText = computed(() => {
  if (props.isInert && props.inertTooltip) {
    return props.inertTooltip;
  }
  if (props.card && isFaceDown.value) {
    return props.card.position === 'facedown_defense'
      ? 'Face-down Defense Monster (Set)'
      : 'Face-down Spell/Trap (Set)';
  }
  return '';
});

function onMouseEnter(): void {
  emit('hover-card', props.card);
}

function onMouseLeave(): void {
  emit('hover-card', null);
}

function onClick(): void {
  if (!props.isInert) {
    emit('click-card', props.card);
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.field-zone-slot {
  position: relative;
  width: 90px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  user-select: none;
  cursor: default;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  .slot-frame {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 18, 26, 0.45);
    border: 1px dashed rgba(201, 162, 39, 0.25);
    box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6);
    transition: all 0.25s ease;
    overflow: visible;
  }

  // User Zone Glow (Blue)
  &--user .slot-frame {
    border-color: rgba(47, 128, 237, 0.35);
    box-shadow: inset 0 0 14px rgba(47, 128, 237, 0.08);

    &:hover {
      border-color: rgba(47, 128, 237, 0.8);
      box-shadow:
        inset 0 0 18px rgba(47, 128, 237, 0.2),
        0 0 12px rgba(47, 128, 237, 0.35);
    }
  }

  // AI Zone Glow (Red)
  &--ai .slot-frame {
    border-color: rgba(235, 87, 87, 0.35);
    box-shadow: inset 0 0 14px rgba(235, 87, 87, 0.08);

    &:hover {
      border-color: rgba(235, 87, 87, 0.8);
      box-shadow:
        inset 0 0 18px rgba(235, 87, 87, 0.2),
        0 0 12px rgba(235, 87, 87, 0.35);
    }
  }

  // Inert Zone (EMZ, Pendulum)
  &--inert {
    opacity: 0.65;
    cursor: not-allowed;

    .slot-frame {
      border-style: dotted;
      border-color: rgba(184, 178, 160, 0.3);
      background: rgba(10, 12, 16, 0.3);
    }
  }

  // Targeted & Selectable
  &--targeted .slot-frame {
    border-color: $color-gold-300;
    box-shadow: 0 0 16px rgba(201, 162, 39, 0.6);
    animation: pulse-glow 1.5s infinite;
  }

  // Empty Watermark
  .slot-empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    pointer-events: none;
  }

  .slot-label {
    font-family: 'Oxanium', monospace, sans-serif;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: rgba(244, 228, 184, 0.4);
    text-transform: uppercase;
  }

  .slot-sublabel {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.65rem;
    color: rgba(184, 178, 160, 0.3);
    text-transform: uppercase;
  }

  // Card Presentation
  .field-card {
    position: relative;
    width: 82px;
    height: 120px;
    border-radius: 5px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);
    cursor: pointer;
    transition:
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.25s ease;
    transform-origin: center center;

    &:hover {
      transform: scale(1.06) translateY(-4px);
      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.9),
        0 0 14px rgba(201, 162, 39, 0.4);
      z-index: 10;
    }

    // Defense Position (Rotated 90° Landscape)
    &--faceup_defense,
    &--facedown_defense {
      transform: rotate(90deg) scale(0.92);

      &:hover {
        transform: rotate(90deg) scale(0.98) translateY(-4px);
        box-shadow:
          0 10px 24px rgba(0, 0, 0, 0.9),
          0 0 14px rgba(201, 162, 39, 0.4);
        z-index: 10;
      }
    }
  }

  .card-face {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 5px;
    overflow: hidden;
    background: #0a0c10;
    border: 1px solid rgba(201, 162, 39, 0.4);

    &--back {
      border-color: rgba(184, 178, 160, 0.4);
    }
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;

    &--back {
      object-fit: cover;
    }
  }

  .card-foil-sheen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 50%,
      rgba(201, 162, 39, 0.15) 100%
    );
    pointer-events: none;
  }

  .set-defense-pill {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 12, 16, 0.85);
    border: 1px solid rgba(201, 162, 39, 0.5);
    color: $color-gold-300;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.55rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 4px;
    white-space: nowrap;
    letter-spacing: 0.05em;
  }

  // ATK / DEF Stats Badge
  .stats-badge {
    position: absolute;
    bottom: 2px;
    left: 2px;
    right: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(10, 12, 16, 0.88);
    backdrop-filter: blur(4px);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.55rem;
    font-weight: 700;
    border: 1px solid rgba(201, 162, 39, 0.3);

    .stat-item {
      display: flex;
      align-items: center;
      gap: 2px;
      color: #b8b2a0;

      .stat-prefix {
        font-size: 0.5rem;
        color: $color-gold-500;
      }

      &--atk.stat-item--active {
        color: #fff;
        font-weight: 800;
        text-shadow: 0 0 4px rgba(235, 87, 87, 0.8);
      }

      &--def.stat-item--active {
        color: #fff;
        font-weight: 800;
        text-shadow: 0 0 4px rgba(47, 128, 237, 0.8);
      }
    }
  }

  .level-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(10, 12, 16, 0.85);
    border: 1px solid rgba(201, 162, 39, 0.5);
    color: $color-gold-300;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.55rem;
    font-weight: 800;
    padding: 1px 4px;
    border-radius: 3px;
  }
}
</style>
