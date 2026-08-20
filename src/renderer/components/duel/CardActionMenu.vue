<template>
  <div class="card-action-menu-backdrop" @click.self="$emit('close')">
    <div
      class="card-action-menu glass-panel"
      :style="menuStyle"
      @click.stop
    >
      <div class="menu-header">
        <div class="menu-header__info">
          <span class="card-name">{{ card.name }}</span>
          <span v-if="card.atk !== undefined" class="card-stats">ATK {{ formatCombatStat(card.atk) }} / DEF {{ formatCombatStat(card.def) }}</span>
        </div>
        <button aria-label="Close action menu" class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <p class="menu-hint">👆 Tap an action below to use this card:</p>

      <div class="menu-actions">
        <button
          v-for="act in actions"
          :key="`${act.type}-${act.index}`"
          class="action-item"
          :class="`action-item--${act.type}`"
          @click="$emit('select', act)"
        >
          <span class="action-icon">{{ act.icon || '⚡' }}</span>
          <div class="action-text">
            <span class="action-label">{{ act.label }}</span>
            <span class="action-desc">{{ getActionDescription(act.type) }}</span>
          </div>
          <span class="action-arrow">›</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard } from '../../../shared/types/field.js';
import { formatCombatStat } from '../../utils/format.js';
import type { CardActionOption } from '../../stores/duelStore.js';

const props = defineProps<{
  card: FieldCard;
  actions: CardActionOption[];
  anchorPos?: { x: number; y: number } | null;
}>();

defineEmits<{
  (e: 'select', action: CardActionOption): void;
  (e: 'close'): void;
}>();

const menuStyle = computed(() => {
  if (!props.anchorPos || (props.anchorPos.x === 0 && props.anchorPos.y === 0)) {
    // Default position: centered above player hand
    return {
      bottom: '160px',
      left: '50%',
      transform: 'translateX(-50%)',
    };
  }

  // Ensure menu stays cleanly within screen viewport
  const x = Math.min(Math.max(props.anchorPos.x, 150), window.innerWidth - 170);
  const y = Math.min(Math.max(props.anchorPos.y - 140, 100), window.innerHeight - 200);

  return {
    top: `${y}px`,
    left: `${x}px`,
    transform: 'translate(-50%, -50%)',
  };
});

/**
 * Returns a short, friendly description for each action type.
 * Written to be understood by young players (~10 years old).
 */
function getActionDescription(type: string): string {
  switch (type) {
    case 'summon':      return 'Put this monster on the field in Attack position!';
    case 'monster_set': return 'Place face-down in Defense position (hidden from opponent).';
    case 'spell_set':   return 'Set face-down in your Spell/Trap Zone to use later.';
    case 'set':         return 'Place this card face-down on the field.';
    case 'sp_summon':   return 'Bring this monster out using its special summoning rule!';
    case 'activate':    return 'Activate this card\'s effect right now!';
    case 'attack':      return 'Attack with this monster!';
    case 'pos_change':  return 'Switch between Attack and Defense position.';
    default:            return 'Choose this action to continue.';
  }
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.card-action-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  animation: fadeIn 0.15s ease-out;
}

.card-action-menu {
  position: absolute;
  min-width: 260px;
  max-width: 320px;
  background: rgba(12, 16, 24, 0.97);
  border: 1px solid $color-gold-500;
  border-radius: 14px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.9),
    0 0 24px rgba(201, 162, 39, 0.35);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1001;
  animation: popIn 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.menu-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid rgba(201, 162, 39, 0.3);
  padding-bottom: 10px;
  gap: 8px;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .card-name {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    color: $color-gold-100;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-stats {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.7rem;
    color: rgba(201, 162, 39, 0.7);
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .close-btn {
    flex-shrink: 0;
    background: transparent;
    border: none;
    color: rgba(244, 228, 184, 0.6);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 4px;
    transition: all 0.15s ease;

    &:hover {
      color: #eb5757;
      background: rgba(235, 87, 87, 0.15);
    }
  }
}

.menu-hint {
  font-size: 0.7rem;
  color: rgba(201, 162, 39, 0.6);
  margin: 0;
  font-family: 'Oxanium', monospace, sans-serif;
  letter-spacing: 0.03em;
}

.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(30, 36, 48, 0.7);
  border: 1px solid rgba(201, 162, 39, 0.25);
  color: #f5f1e6;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  text-align: left;

  .action-icon {
    font-size: 1.3rem;
    flex-shrink: 0;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
  }

  .action-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .action-label {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .action-desc {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.68rem;
    font-weight: 400;
    color: rgba(200, 190, 170, 0.7);
    white-space: normal;
    line-height: 1.3;
  }

  .action-arrow {
    font-size: 1.2rem;
    color: rgba(201, 162, 39, 0.5);
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  &:hover {
    background: rgba(201, 162, 39, 0.18);
    border-color: $color-gold-300;
    transform: translateX(4px);
    box-shadow: 0 4px 16px rgba(201, 162, 39, 0.25);

    .action-arrow { transform: translateX(3px); }
    .action-desc { color: rgba(220, 210, 190, 0.9); }
  }

  // Summon / Attack — Red
  &--summon, &--attack {
    border-color: rgba(235, 87, 87, 0.4);
    .action-label { color: #ffb8b8; }
    &:hover {
      background: rgba(235, 87, 87, 0.2);
      border-color: #eb5757;
      box-shadow: 0 4px 14px rgba(235, 87, 87, 0.4);
    }
  }

  // Special Summon — Blue
  &--sp_summon {
    border-color: rgba(47, 128, 237, 0.4);
    .action-label { color: #c4e0ff; }
    &:hover {
      background: rgba(47, 128, 237, 0.2);
      border-color: #2f80ed;
      box-shadow: 0 4px 14px rgba(47, 128, 237, 0.4);
    }
  }

  // Activate Effect — Green
  &--activate {
    border-color: rgba(39, 174, 96, 0.4);
    .action-label { color: #c9f5db; }
    &:hover {
      background: rgba(39, 174, 96, 0.2);
      border-color: #27ae60;
      box-shadow: 0 4px 14px rgba(39, 174, 96, 0.4);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9) translate(-50%, -50%);
  }
  to {
    opacity: 1;
    transform: scale(1) translate(-50%, -50%);
  }
}
</style>
