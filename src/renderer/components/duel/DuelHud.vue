<template>
  <header class="duel-hud">
    <!-- Left: Phase Indicator Tracker -->
    <div class="hud-phases">
      <div
        v-for="p in phases"
        :key="p.id"
        class="phase-pill"
        :class="{ 'phase-pill--active': currentPhase === p.id }"
      >
        <span class="phase-id">{{ p.id }}</span>
        <span class="phase-name">{{ p.name }}</span>
      </div>
    </div>

    <!-- Center: Action Guide & Turn Banner -->
    <div class="hud-center-banner glass-panel">
      <div class="turn-callout">
        <span class="turn-number">TURN {{ turnNumber }}</span>
        <span class="turn-divider">•</span>
        <span
          class="turn-owner"
          :class="isUserTurn ? 'turn-owner--user' : 'turn-owner--ai'"
        >
          {{ isUserTurn ? 'YOUR TURN' : "OPPONENT'S TURN" }}
        </span>
      </div>
      <div class="guide-prompt">
        <span class="guide-icon">⚡</span>
        <span class="guide-text">{{ guideText || defaultGuideText }}</span>
      </div>

      <!-- Turn Phase Progression Actions -->
      <div v-if="isUserTurn" class="phase-actions">
        <button
          v-if="canGoToBattlePhase"
          class="phase-action-btn phase-action-btn--bp"
          @click="$emit('to-battle-phase')"
        >
          ⚔️ Battle Phase
        </button>
        <button
          v-if="canGoToMainPhase2"
          class="phase-action-btn phase-action-btn--m2"
          @click="$emit('to-main-phase2')"
        >
          🛡️ Main Phase 2
        </button>
        <button
          v-if="canEndTurn"
          class="phase-action-btn phase-action-btn--ep"
          @click="$emit('to-end-phase')"
        >
          ⌛ End Turn
        </button>
      </div>
    </div>

    <!-- Right: HUD Controls -->
    <div class="hud-controls">
      <!-- 1. Activation Confirmation (Coming Soon) -->
      <Tooltip content="Activation Confirmation (Reserved for future release)" position="bottom">
        <button class="hud-btn hud-btn--inert" aria-label="Activation Confirmation">
          <img
            :src="getUiIconUrl('hud-activation-confirm')"
            alt="Activation Confirmation"
            class="hud-btn-icon"
            @error="handleIconFallback($event, '💎')"
          />
          <span class="hud-btn-label">Auto</span>
        </button>
      </Tooltip>

      <!-- 2. Field Status (Coming Soon) -->
      <Tooltip content="Field Status (Reserved for future release)" position="bottom">
        <button class="hud-btn hud-btn--inert" aria-label="Field Status">
          <img
            :src="getUiIconUrl('hud-field-status')"
            alt="Field Status"
            class="hud-btn-icon"
            @error="handleIconFallback($event, '👁️')"
          />
          <span class="hud-btn-label">Field</span>
        </button>
      </Tooltip>

      <!-- 3. Duel Log Toggle -->
      <Tooltip content="Toggle Live Duel Log Drawer" position="bottom">
        <button
          class="hud-btn"
          :class="{ 'hud-btn--active': isDuelLogOpen }"
          aria-label="Toggle Duel Log"
          @click="$emit('toggle-log')"
        >
          <img
            :src="getUiIconUrl('hud-duel-log')"
            alt="Duel Log"
            class="hud-btn-icon"
            @error="handleIconFallback($event, '📜')"
          />
          <span class="hud-btn-label">Log</span>
        </button>
      </Tooltip>

      <!-- 4. Menu Button -->
      <Tooltip content="In-Duel Menu & Settings" position="bottom">
        <button
          class="hud-btn hud-btn--primary"
          aria-label="Open In-Duel Menu"
          @click="$emit('open-menu')"
        >
          <img
            :src="getUiIconUrl('hud-menu')"
            alt="Menu"
            class="hud-btn-icon"
            @error="handleIconFallback($event, '☰')"
          />
          <span class="hud-btn-label">Menu</span>
        </button>
      </Tooltip>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getUiIconUrl } from '../../utils/media.js';
import Tooltip from '../common/Tooltip.vue';

const props = withDefaults(
  defineProps<{
    turnNumber: number;
    currentPhase: string;
    isUserTurn: boolean;
    guideText?: string;
    isDuelLogOpen?: boolean;
    canGoToBattlePhase?: boolean;
    canGoToMainPhase2?: boolean;
    canEndTurn?: boolean;
  }>(),
  {
    guideText: '',
    isDuelLogOpen: false,
    canGoToBattlePhase: false,
    canGoToMainPhase2: false,
    canEndTurn: false,
  },
);

defineEmits<{
  (e: 'open-menu'): void;
  (e: 'toggle-log'): void;
  (e: 'to-battle-phase'): void;
  (e: 'to-main-phase2'): void;
  (e: 'to-end-phase'): void;
}>();

const phases = [
  { id: 'DP', name: 'Draw' },
  { id: 'SP', name: 'Standby' },
  { id: 'M1', name: 'Main 1' },
  { id: 'BP', name: 'Battle' },
  { id: 'M2', name: 'Main 2' },
  { id: 'EP', name: 'End' },
];

const defaultGuideText = computed(() => {
  if (props.isUserTurn) {
    switch (props.currentPhase) {
      case 'DP':
        return 'Draw Phase: Draw 1 card from your Deck.';
      case 'SP':
        return 'Standby Phase: Standby triggers resolve.';
      case 'M1':
        return 'Main Phase 1: You may Normal Summon, Set, or Activate effects.';
      case 'BP':
        return 'Battle Phase: Select an Attack Position monster to declare an attack.';
      case 'M2':
        return 'Main Phase 2: Set Spells/Traps or change monster battle positions.';
      case 'EP':
        return 'End Phase: Turn passes to opponent (Discard if hand > 6).';
      default:
        return 'Ready for next action.';
    }
  }
  return "Opponent's turn: Awaiting AI opponent action...";
});

function handleIconFallback(event: Event, fallbackEmoji: string): void {
  const target = event.target as HTMLImageElement;
  if (target && target.parentElement) {
    target.style.display = 'none';
    const span = document.createElement('span');
    span.textContent = fallbackEmoji;
    span.style.fontSize = '1.1rem';
    target.parentElement.insertBefore(span, target);
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.duel-hud {
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 100;
  user-select: none;
  background: linear-gradient(
    180deg,
    rgba(10, 12, 16, 0.92) 0%,
    rgba(10, 12, 16, 0.6) 70%,
    transparent 100%
  );

  // Left: Phase Indicator
  .hud-phases {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(14, 18, 26, 0.7);
    padding: 3px 6px;
    border-radius: 8px;
    border: 1px solid rgba(201, 162, 39, 0.25);
  }

  .phase-pill {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 5px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    color: #756f60;
    background: transparent;
    transition: all 0.2s ease;

    .phase-name {
      display: none;
      font-size: 0.6rem;
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-weight: 600;
      color: rgba(244, 228, 184, 0.8);
    }

    &--active {
      background: rgba(201, 162, 39, 0.2);
      border: 1px solid $color-gold-500;
      color: $color-gold-100;
      box-shadow: 0 0 10px rgba(201, 162, 39, 0.4);

      .phase-name {
        display: inline-block;
      }
    }
  }

  // Center Action Guide Banner
  .hud-center-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 16px;
    border-radius: 20px;
    background: rgba(18, 22, 30, 0.85);
    border: 1px solid rgba(201, 162, 39, 0.35);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  }

  .turn-callout {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.05em;

    .turn-number {
      color: $color-gold-300;
    }

    .turn-divider {
      color: rgba(201, 162, 39, 0.4);
    }

    .turn-owner {
      &--user {
        color: #2f80ed;
      }
      &--ai {
        color: #eb5757;
      }
    }
  }

  .guide-prompt {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    color: #f5f1e6;

    .guide-icon {
      color: $color-gold-300;
      font-size: 0.85rem;
    }
  }

  .phase-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
  }

  .phase-action-btn {
    padding: 4px 10px;
    border-radius: 6px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
    white-space: nowrap;

    &--bp {
      background: rgba(235, 87, 87, 0.25);
      border: 1px solid #eb5757;
      color: #ffb8b8;

      &:hover {
        background: #eb5757;
        color: #ffffff;
        box-shadow: 0 0 12px rgba(235, 87, 87, 0.6);
        transform: translateY(-1px);
      }
    }

    &--m2 {
      background: rgba(47, 128, 237, 0.25);
      border: 1px solid #2f80ed;
      color: #c4e0ff;

      &:hover {
        background: #2f80ed;
        color: #ffffff;
        box-shadow: 0 0 12px rgba(47, 128, 237, 0.6);
        transform: translateY(-1px);
      }
    }

    &--ep {
      background: rgba(201, 162, 39, 0.25);
      border: 1px solid $color-gold-500;
      color: $color-gold-100;

      &:hover {
        background: $color-gold-500;
        color: #1a1406;
        box-shadow: 0 0 12px rgba(201, 162, 39, 0.6);
        transform: translateY(-1px);
      }
    }
  }

  // Right: HUD Buttons
  .hud-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hud-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(18, 22, 30, 0.8);
    border: 1px solid rgba(201, 162, 39, 0.3);
    color: #f5f1e6;
    cursor: pointer;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

    .hud-btn-icon {
      width: 18px;
      height: 18px;
      object-fit: contain;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
    }

    &:hover {
      background: rgba(201, 162, 39, 0.2);
      border-color: $color-gold-300;
      color: $color-gold-100;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
    }

    &--active {
      background: rgba(47, 128, 237, 0.25);
      border-color: #2f80ed;
      color: #56ccf2;
      box-shadow: 0 0 10px rgba(47, 128, 237, 0.4);
    }

    &--primary {
      background: rgba(201, 162, 39, 0.25);
      border-color: $color-gold-500;
      color: $color-gold-100;

      &:hover {
        background: $color-gold-500;
        color: #1a1406;
      }
    }

    &--inert {
      opacity: 0.6;
      cursor: not-allowed;

      &:hover {
        background: rgba(18, 22, 30, 0.8);
        border-color: rgba(201, 162, 39, 0.3);
        color: #f5f1e6;
        transform: none;
        box-shadow: none;
      }
    }
  }
}
</style>
