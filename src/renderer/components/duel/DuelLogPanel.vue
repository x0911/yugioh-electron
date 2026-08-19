<template>
  <Transition name="drawer-slide">
    <div v-if="isOpen" class="duel-log-drawer">
      <div class="drawer-panel glass-panel glass-panel--accent-gold">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <div class="title-group">
            <span class="icon">📜</span>
            <h3>Duel Log Stream</h3>
            <span class="log-count">({{ filteredLogs.length }})</span>
          </div>

          <div class="header-actions">
            <button class="action-btn" title="Clear Event Log" @click="$emit('clear')">
              🗑
            </button>
            <button class="action-btn action-btn--close" title="Close Drawer" @click="$emit('close')">
              ✕
            </button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ 'tab-btn--active': activeFilter === tab.id }"
            @click="activeFilter = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Log Event List -->
        <div ref="logContainer" class="log-scroll-area">
          <div v-if="filteredLogs.length === 0" class="empty-log">
            <p>No events recorded in this category yet.</p>
          </div>

          <div
            v-for="(item, idx) in filteredLogs"
            :key="idx"
            class="log-entry"
            :class="[`log-entry--${item.type.toLowerCase()}`]"
          >
            <span class="log-time">[{{ item.time }}]</span>
            <span class="log-badge">{{ item.type }}</span>
            <span class="log-msg">{{ item.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';

export interface DuelLogItem {
  time: string;
  type: string;
  description: string;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    logs: DuelLogItem[];
  }>(),
  {
    isOpen: false,
    logs: () => [],
  },
);

defineEmits<{
  (e: 'close'): void;
  (e: 'clear'): void;
}>();

const activeFilter = ref<'all' | 'summons' | 'spells' | 'combat' | 'prompts'>('all');
const logContainer = ref<HTMLElement | null>(null);

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'summons', label: 'Summons' },
  { id: 'spells', label: 'Spells/Traps' },
  { id: 'combat', label: 'Combat' },
  { id: 'prompts', label: 'Prompts' },
] as const;

const filteredLogs = computed(() => {
  if (activeFilter.value === 'all') return props.logs;
  return props.logs.filter((item) => {
    const t = item.type.toUpperCase();
    if (activeFilter.value === 'summons') {
      return t.includes('SUMMON') || t.includes('SET') || t.includes('TRIBUTE');
    }
    if (activeFilter.value === 'spells') {
      return t.includes('SPELL') || t.includes('TRAP') || t.includes('CHAIN') || t.includes('ACTIVATE');
    }
    if (activeFilter.value === 'combat') {
      return t.includes('ATTACK') || t.includes('DAMAGE') || t.includes('BATTLE') || t.includes('LP');
    }
    if (activeFilter.value === 'prompts') {
      return t.includes('SELECT') || t.includes('PROMPT') || t.includes('CONFIRM');
    }
    return true;
  });
});

watch(
  () => props.logs.length,
  () => {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  },
);
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.duel-log-drawer {
  position: absolute;
  top: 52px;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 150;
  display: flex;
  pointer-events: auto;

  .drawer-panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 14px;
    box-sizing: border-box;
    border-radius: 12px 0 0 0;
    background: rgba(14, 18, 26, 0.94);
    backdrop-filter: blur(20px);
    border-left: 1px solid rgba(201, 162, 39, 0.4);
    border-top: 1px solid rgba(201, 162, 39, 0.4);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.7);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(201, 162, 39, 0.25);
  }

  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .icon {
      font-size: 1.1rem;
    }

    h3 {
      font-family: 'Cinzel', serif, sans-serif;
      font-size: 0.95rem;
      color: $color-gold-100;
      margin: 0;
    }

    .log-count {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.75rem;
      color: $color-gold-500;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .action-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: rgba(10, 12, 16, 0.7);
    border: 1px solid rgba(201, 162, 39, 0.3);
    color: #f5f1e6;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(201, 162, 39, 0.2);
      border-color: $color-gold-300;
    }

    &--close:hover {
      background: #eb5757;
      border-color: #eb5757;
    }
  }

  // Filter Tabs
  .filter-tabs {
    display: flex;
    gap: 4px;
    padding: 8px 0;
    overflow-x: auto;
  }

  .tab-btn {
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(10, 12, 16, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #b8b2a0;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.7rem;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;

    &--active {
      background: rgba(201, 162, 39, 0.2);
      border-color: $color-gold-500;
      color: $color-gold-100;
      font-weight: 700;
    }
  }

  // Scroll Area
  .log-scroll-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 0;
  }

  .empty-log {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #756f60;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.85rem;
  }

  .log-entry {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(10, 12, 16, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.75rem;
    line-height: 1.35;

    .log-time {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.65rem;
      color: #756f60;
      flex-shrink: 0;
    }

    .log-badge {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(201, 162, 39, 0.15);
      color: $color-gold-300;
      flex-shrink: 0;
    }

    .log-msg {
      font-family: 'Barlow Semi Condensed', sans-serif;
      color: #f5f1e6;
      word-break: break-word;
    }

    &--attack .log-badge {
      background: rgba(235, 87, 87, 0.2);
      color: #eb5757;
    }

    &--damage .log-badge {
      background: rgba(235, 87, 87, 0.3);
      color: #ff7675;
    }

    &--summon .log-badge {
      background: rgba(61, 220, 151, 0.2);
      color: #3ddc97;
    }

    &--spell .log-badge {
      background: rgba(86, 204, 242, 0.2);
      color: #56ccf2;
    }
  }
}

// Drawer Transition
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
