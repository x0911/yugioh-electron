<template>
  <div class="card-action-menu-backdrop" @click.self="$emit('close')">
    <div
      class="card-action-menu glass-panel"
      :style="menuStyle"
      @click.stop
    >
      <div class="menu-header">
        <span class="card-name">{{ card.name }}</span>
        <button aria-label="Close action menu" class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="menu-actions">
        <button
          v-for="act in actions"
          :key="`${act.type}-${act.index}`"
          class="action-btn"
          :class="`action-btn--${act.type}`"
          @click="$emit('select', act)"
        >
          <span class="action-icon">{{ act.icon || '⚡' }}</span>
          <span class="action-label">{{ act.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard } from '../../../shared/types/field.js';
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
  if (!props.anchorPos) {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  // Ensure menu stays within viewport
  const x = Math.min(Math.max(props.anchorPos.x, 100), window.innerWidth - 200);
  const y = Math.min(Math.max(props.anchorPos.y - 120, 80), window.innerHeight - 200);

  return {
    top: `${y}px`,
    left: `${x}px`,
    transform: 'translate(-50%, -50%)',
  };
});
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
  min-width: 200px;
  background: rgba(18, 22, 30, 0.95);
  border: 1px solid $color-gold-500;
  border-radius: 12px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(201, 162, 39, 0.3);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1001;
  animation: popIn 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(201, 162, 39, 0.25);
  padding-bottom: 8px;

  .card-name {
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    color: $color-gold-100;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 170px;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: rgba(244, 228, 184, 0.6);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.15s ease;

    &:hover {
      color: #eb5757;
      background: rgba(235, 87, 87, 0.15);
    }
  }
}

.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(30, 36, 48, 0.7);
  border: 1px solid rgba(201, 162, 39, 0.3);
  color: #f5f1e6;
  font-family: 'Oxanium', monospace, sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
  text-align: left;

  .action-icon {
    font-size: 1rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
  }

  .action-label {
    flex: 1;
    letter-spacing: 0.03em;
  }

  &:hover {
    background: rgba(201, 162, 39, 0.25);
    border-color: $color-gold-300;
    color: $color-gold-100;
    transform: translateX(3px);
    box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
  }

  &--summon,
  &--attack {
    border-color: rgba(235, 87, 87, 0.5);
    &:hover {
      background: rgba(235, 87, 87, 0.25);
      border-color: #eb5757;
      color: #ffb8b8;
      box-shadow: 0 4px 12px rgba(235, 87, 87, 0.4);
    }
  }

  &--sp_summon {
    border-color: rgba(47, 128, 237, 0.5);
    &:hover {
      background: rgba(47, 128, 237, 0.25);
      border-color: #2f80ed;
      color: #c4e0ff;
      box-shadow: 0 4px 12px rgba(47, 128, 237, 0.4);
    }
  }

  &--activate {
    border-color: rgba(39, 174, 96, 0.5);
    &:hover {
      background: rgba(39, 174, 96, 0.25);
      border-color: #27ae60;
      color: #c9f5db;
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
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
    transform: scale(0.92) translate(-50%, -50%);
  }
  to {
    opacity: 1;
    transform: scale(1) translate(-50%, -50%);
  }
}
</style>
