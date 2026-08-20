<template>
  <div
    class="field-zone-slot"
    :data-zone-id="`slot-${player}-${zoneType}-${zoneIndex}`"
    :class="[
      `field-zone-slot--${player}`,
      `field-zone-slot--${zoneType}`,
      {
        'field-zone-slot--occupied': !!card,
        'field-zone-slot--empty': !card,
        'field-zone-slot--inert': isInert,
        'field-zone-slot--targeted': isTargeted,
        'field-zone-slot--selectable': targetInfo?.isSelectable || isSelectable,
        'field-zone-slot--selected': targetInfo?.isSelected,
        'field-zone-slot--ineligible': isPromptActive && (!targetInfo || !targetInfo.isSelectable) && !!card,
      },
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick($event)"
  >
    <Tooltip
      :text="tooltipText"
      :disabled="!tooltipText"
      position="top"
      class="slot-tooltip-wrapper"
    >
      <div class="slot-frame">
        <!-- Empty Slot Watermark Label -->
        <div v-if="!card" class="slot-empty-content">
          <div class="slot-label">{{ zoneLabel }}</div>
          <div v-if="zoneSubLabel" class="slot-sublabel">{{ zoneSubLabel }}</div>
          <div class="slot-octagon-border"></div>
        </div>

        <!-- Card Display when Occupied (Artwork / Card Back) -->
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
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- Target Selection IconIndicator Overlay (Blue for User, Red for AI) -->
        <!-- =============================================================== -->
        <div v-if="targetInfo && targetInfo.isSelectable" class="slot-target-overlay">
          <IconIndicator
            type="location"
            :location="targetInfo.locationType"
            :owner="targetInfo.owner"
            :pulsing="true"
            :show-tooltip="true"
            :tooltip-text="targetInfo.tooltipText"
            size="md"
          />
          <div v-if="targetInfo.isSelected" class="slot-target-check">✓</div>
        </div>

        <!-- =============================================================== -->
        <!-- UNROTATED Slot Overlays (Always 0° Straight at Center-Bottom)   -->
        <!-- =============================================================== -->

        <!-- 1. Combat Stat Badge (ATK only if Attack; DEF only if Defense) -->
        <div
          v-if="card && showCombatStatBadge"
          class="slot-stat-badge"
          :class="[
            `slot-stat-badge--${activeStatMode}`,
            {
              'slot-stat-badge--boosted': isStatBoosted,
              'slot-stat-badge--reduced': isStatReduced,
            },
          ]"
        >
          <span class="stat-prefix">{{ activeStatMode === 'atk' ? 'ATK' : 'DEF' }}</span>
          <span class="stat-value" :class="statDeltaClass">{{ activeStatValue }}</span>
        </div>

        <!-- 2. Level / Rank Stars Badge (Always 0° Straight at Top-Right) -->
        <div
          v-if="card && isFaceUpMonster && card.level && card.level > 0 && (!targetInfo || !targetInfo.isSelectable)"
          class="slot-level-badge"
        >
          ★{{ card.level }}
        </div>
      </div>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard, FieldZoneType } from '../../../shared/types/field.js';
import type { TargetInfo } from '../../stores/duelStore.js';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
import Tooltip from '../common/Tooltip.vue';
import IconIndicator from '../common/IconIndicator.vue';

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
    targetInfo?: TargetInfo | null;
    isPromptActive?: boolean;
  }>(),
  {
    zoneIndex: 0,
    zoneSubLabel: '',
    card: null,
    isInert: false,
    inertTooltip: '',
    isTargeted: false,
    isSelectable: false,
    targetInfo: null,
    isPromptActive: false,
  },
);

const emit = defineEmits<{
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'click-card', card: FieldCard | null, event: MouseEvent, targetInfo?: TargetInfo | null): void;
  (e: 'click-target', targetInfo: TargetInfo): void;
}>();

const isDefensePosition = computed(() => {
  return props.card?.position === 'faceup_defense' || props.card?.position === 'facedown_defense';
});

const isFaceDown = computed(() => {
  return props.card?.position === 'facedown_defense' || props.card?.position === 'facedown_spell';
});

const isFaceUpMonster = computed(() => {
  return props.card?.position === 'faceup_attack' || props.card?.position === 'faceup_defense';
});

/**
 * Display combat stat only if monster is face-up:
 * - Attack Position => ATK only
 * - Face-up Defense Position => DEF only
 */
const showCombatStatBadge = computed(() => {
  if (!props.card) return false;
  if (props.card.position === 'faceup_attack') {
    return props.card.atk !== undefined;
  }
  if (props.card.position === 'faceup_defense') {
    return props.card.def !== undefined;
  }
  return false;
});

const activeStatMode = computed<'atk' | 'def'>(() => {
  return props.card?.position === 'faceup_defense' ? 'def' : 'atk';
});

const activeStatValue = computed<string>(() => {
  if (!props.card) return '';
  const raw = props.card.position === 'faceup_defense' ? props.card.def : props.card.atk;
  return formatCombatStat(raw);
});

const isStatBoosted = computed(() => {
  if (!props.card) return false;
  if (activeStatMode.value === 'atk') {
    const base = props.card.baseAtk;
    return typeof props.card.atk === 'number' && typeof base === 'number' && props.card.atk > base;
  } else {
    const base = props.card.baseDef;
    return typeof props.card.def === 'number' && typeof base === 'number' && props.card.def > base;
  }
});

const isStatReduced = computed(() => {
  if (!props.card) return false;
  if (activeStatMode.value === 'atk') {
    const base = props.card.baseAtk;
    return typeof props.card.atk === 'number' && typeof base === 'number' && props.card.atk < base;
  } else {
    const base = props.card.baseDef;
    return typeof props.card.def === 'number' && typeof base === 'number' && props.card.def < base;
  }
});

const statDeltaClass = computed(() => {
  if (isStatBoosted.value) return 'stat-value--boosted';
  if (isStatReduced.value) return 'stat-value--reduced';
  return '';
});

const tooltipText = computed(() => {
  if (props.targetInfo && props.targetInfo.isSelectable) {
    return props.targetInfo.tooltipText;
  }
  if (props.card && isFaceDown.value) {
    return props.card.position === 'facedown_defense'
      ? 'Face-down Defense Monster (Set)'
      : 'Face-down Spell/Trap (Set)';
  }
  if (props.isInert && props.inertTooltip) {
    return props.inertTooltip;
  }
  if (props.isPromptActive && props.card && (!props.targetInfo || !props.targetInfo.isSelectable)) {
    return 'This card cannot be selected as a target';
  }
  return '';
});

function onMouseEnter(): void {
  if (!props.card) {
    emit('hover-card', null);
    return;
  }
  // Opponent's face-down / hidden cards are completely ignored from preview
  if (props.player === 'ai' && (isFaceDown.value || props.card.code === 0)) {
    return;
  }
  emit('hover-card', props.card);
}

function onMouseLeave(): void {
  if (props.player === 'ai' && (isFaceDown.value || props.card?.code === 0)) {
    return;
  }
  emit('hover-card', null);
}

function onClick(event: MouseEvent): void {
  if (props.isInert) return;
  if (props.targetInfo && props.targetInfo.isSelectable) {
    emit('click-target', props.targetInfo);
    return;
  }
  emit('click-card', props.card, event, props.targetInfo);
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.field-zone-slot {
  position: relative;
  width: 96px;
  height: 138px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  user-select: none;
  cursor: default;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  .slot-tooltip-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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
  &--targeted .slot-frame,
  &--selectable .slot-frame {
    border-color: $color-gold-300;
    box-shadow: 0 0 16px rgba(201, 162, 39, 0.7);
    animation: pulse-glow 1.4s infinite;
  }

  &--selected .slot-frame {
    border-color: $color-gold-500 !important;
    box-shadow:
      0 0 20px rgba(201, 162, 39, 0.9),
      inset 0 0 14px rgba(201, 162, 39, 0.3) !important;
    background: rgba(201, 162, 39, 0.15) !important;
  }

  // Ineligible during active selection prompt
  &--ineligible {
    opacity: 0.45;
    filter: grayscale(0.25) brightness(0.75);
    transition: opacity 0.25s ease, filter 0.25s ease;
  }

  .slot-target-overlay {
    position: absolute;
    top: -6px;
    right: -6px;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slot-target-check {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $color-gold-500;
    color: #1a1406;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Oxanium', monospace, sans-serif;
    font-weight: 900;
    font-size: 0.75rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
    z-index: 45;
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

  // Card Presentation (Rotates cleanly without rotating child text)
  .field-card {
    position: relative;
    width: 88px;
    height: 128px;
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

  // =========================================================================
  // Unrotated Overlays: Sits at Bottom-Center of the Slot Frame (Always 0°)
  // =========================================================================
  .slot-stat-badge {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 1px 6px;
    border-radius: 7px;
    background: rgba(10, 12, 16, 0.94);
    backdrop-filter: blur(4px);
    font-family: 'Oxanium', monospace, sans-serif;
    pointer-events: none;
    z-index: 25;
    white-space: nowrap;
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.85),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);

    .stat-prefix {
      font-size: 0.5rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .stat-value {
      font-size: 0.7rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }

    &--atk {
      border: 1px solid rgba(201, 162, 39, 0.6);
      .stat-prefix {
        color: $color-gold-500;
      }
      .stat-value {
        color: #ffffff;
      }
    }

    &--def {
      border: 1px solid rgba(86, 204, 242, 0.6);
      .stat-prefix {
        color: #56ccf2;
      }
      .stat-value {
        color: #ffffff;
      }
    }

    &--boosted {
      border-color: rgba(0, 255, 136, 0.8) !important;
      box-shadow:
        0 0 10px rgba(0, 255, 136, 0.4),
        0 3px 8px rgba(0, 0, 0, 0.85);
      .stat-value--boosted {
        color: #00ff88 !important;
        text-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
      }
    }

    &--reduced {
      border-color: rgba(255, 77, 79, 0.8) !important;
      box-shadow:
        0 0 10px rgba(255, 77, 79, 0.4),
        0 3px 8px rgba(0, 0, 0, 0.85);
      .stat-value--reduced {
        color: #ff4d4f !important;
        text-shadow: 0 0 6px rgba(255, 77, 79, 0.6);
      }
    }
  }

  .slot-level-badge {
    position: absolute;
    top: 3px;
    right: 3px;
    padding: 1px 4px;
    border-radius: 3px;
    background: rgba(10, 12, 16, 0.88);
    border: 1px solid rgba(242, 201, 76, 0.5);
    color: #f2c94c;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.55rem;
    font-weight: 800;
    pointer-events: none;
    z-index: 25;
    text-shadow: 0 0 4px rgba(242, 201, 76, 0.6);
  }
}
</style>
