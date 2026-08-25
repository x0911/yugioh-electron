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
            <button
              class="action-btn action-btn--copy"
              :class="{ 'action-btn--copied': isCopied }"
              :title="isCopied ? 'Copied to Clipboard!' : 'Copy Formatted Logs for AI / Bug Report'"
              @click="copyLogsToClipboard"
            >
              {{ isCopied ? '✓' : '📋' }}
            </button>
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

        <!-- Drawer Footer Quick Actions -->
        <div class="drawer-footer">
          <button
            type="button"
            class="copy-all-btn"
            :class="{ 'copy-all-btn--copied': isCopied }"
            :disabled="logs.length === 0"
            @click="copyLogsToClipboard"
          >
            <span class="btn-icon">{{ isCopied ? '✓' : '📋' }}</span>
            <span>{{ isCopied ? 'Copied to Clipboard!' : 'Copy Formatted Duel Logs' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { useSettingsStore } from '../../stores/settingsStore.js';
import type { DuelBoardState } from '../../../shared/types/field.js';
import type { ActionGuideInfo } from '../../utils/guidanceHelper.js';

export interface DuelLogItem {
  time: string;
  type: string;
  description: string;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    logs: DuelLogItem[];
    boardState?: DuelBoardState | null;
    guideInfo?: ActionGuideInfo | null;
  }>(),
  {
    isOpen: false,
    logs: () => [],
    boardState: null,
    guideInfo: null,
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

const isCopied = ref(false);
let copyTimeout: any = null;

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[DuelLogPanel] Failed copying to clipboard:', err);
    return false;
  }
}

async function copyLogsToClipboard(): Promise<void> {
  if (props.logs.length === 0) return;

  const lines: string[] = [];
  lines.push('```yugioh-duel-log');
  lines.push('=== YU-GI-OH! DUEL LOG & DIAGNOSTIC REPORT ===');

  if (props.boardState) {
    const uPf = props.boardState.userField;
    const oPf = props.boardState.opponentField;
    lines.push(`• Turn: ${props.boardState.turnNumber} | Phase: ${props.boardState.currentPhase} | Turn Player: ${uPf.isTurn ? 'Player (You)' : 'Opponent'}`);
    lines.push(`• Player LP: ${uPf.currentLp}/${uPf.maxLp} | Opponent LP: ${oPf.currentLp}/${oPf.maxLp} (${oPf.name || 'Opponent'})`);

    const settingsStore = useSettingsStore();
    const activeProv = settingsStore.aiProvider || (settingsStore.aiEngineType as any) || 'builtin';
    const activeModel = settingsStore.aiModels?.[activeProv];
    const provNames: Record<string, string> = {
      builtin: 'Built-in Fast Engine (Local Heuristics)',
      gemini: `Google Gemini (${activeModel || 'gemini-2.5-flash'})`,
      openai: `OpenAI ChatGPT (${activeModel || 'gpt-4o-mini'})`,
      deepseek: `DeepSeek AI (${activeModel || 'deepseek-chat'})`,
      anthropic: `Anthropic Claude (${activeModel || 'claude-3-5-haiku-20241022'})`,
      groq: `Groq Cloud (${activeModel || 'llama-3.1-8b-instant'})`,
      ollama: `Ollama Local LLM (${activeModel || 'llama3.2'})`,
      custom: `Custom Endpoint (${activeModel || 'default-model'})`,
    };
    const engineLabel = provNames[activeProv] || 'Built-in Fast Engine';
    lines.push(`• Opponent AI Engine: ${engineLabel}`);

    // Scan logs for AI Diagnostics and Dialogues
    const diagnosticLogs = props.logs.filter((l) => l.type === 'AI_DIAGNOSTIC' || l.description.includes('[AI WARNING]'));
    const dialogueLogs = props.logs.filter((l) => l.type === 'AI_DIALOGUE');

    if (activeProv !== 'builtin') {
      if (diagnosticLogs.length > 0) {
        const lastDiag = diagnosticLogs[diagnosticLogs.length - 1].description;
        lines.push(`• AI Engine Diagnostic: ⚠️ Fallback Triggered (${dialogueLogs.length} LLM moves succeeded, ${diagnosticLogs.length} fell back)`);
        lines.push(`• Diagnostic Details: ${lastDiag}`);
        lines.push(`• AI Troubleshooting: Open Settings > AI Duelist. Verify your API key and ensure the selected model exists (e.g. "gemini-2.5-flash" or "llama-3.1-8b-instant").`);
      } else if (dialogueLogs.length > 0) {
        lines.push(`• AI Engine Diagnostic: ✅ Operational (${dialogueLogs.length} live LLM decisions & dialogue lines resolved cleanly)`);
      } else {
        lines.push(`• AI Engine Diagnostic: ⚡ Local FastAI Engine active`);
      }
    }

    const userMonsters = uPf.monsterZones
      .map((m, i) => (m && m.code > 0 ? `[M${i + 1}: ${m.name} (${m.atk ?? '?'}/${m.def ?? '?'}, ${m.position})]` : null))
      .filter(Boolean);
    const oppMonsters = oPf.monsterZones
      .map((m, i) => (m && m.code > 0 ? `[M${i + 1}: ${m.name || 'Monster'} (${m.atk ?? '?'}/${m.def ?? '?'}, ${m.position})]` : null))
      .filter(Boolean);

    lines.push(`• Player Monsters (${userMonsters.length}): ${userMonsters.length > 0 ? userMonsters.join(', ') : 'None'}`);
    lines.push(`• Opponent Monsters (${oppMonsters.length}): ${oppMonsters.length > 0 ? oppMonsters.join(', ') : 'None'}`);
    lines.push(`• Player Hand (${uPf.hand.length}): ${uPf.hand.map((c) => c.name).join(', ')}`);
    lines.push(`• Opponent Hand: ${oPf.hand.length} cards`);
  }

  if (props.guideInfo) {
    lines.push(`• Active Guidance: ${props.guideInfo.instruction || 'None'}`);
    if (props.guideInfo.subText) {
      lines.push(`• Context Details: ${props.guideInfo.subText}`);
    }
  }

  lines.push(`\n--- EVENT STREAM (${props.logs.length} Events) ---`);
  for (const item of props.logs) {
    lines.push(`[${item.time}] [${item.type}] ${item.description}`);
  }
  lines.push('==============================================');
  lines.push('```');

  const fullText = lines.join('\n');
  const success = await copyToClipboard(fullText);

  if (success) {
    isCopied.value = true;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      isCopied.value = false;
    }, 2200);
  }
}

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

    &--copy {
      color: $color-gold-300;
    }

    &--copied {
      background: rgba(72, 187, 120, 0.3) !important;
      border-color: #48bb78 !important;
      color: #68d391 !important;
      font-weight: 700;
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

    &--ai_diagnostic {
      background: rgba(230, 126, 34, 0.15) !important;
      border-color: rgba(230, 126, 34, 0.4) !important;

      .log-badge {
        background: rgba(230, 126, 34, 0.3) !important;
        color: #f39c12 !important;
      }
      .log-msg {
        color: #fce7c8 !important;
      }
    }

    &--ai_dialogue {
      background: rgba(155, 89, 182, 0.15) !important;
      border-color: rgba(155, 89, 182, 0.35) !important;

      .log-badge {
        background: rgba(155, 89, 182, 0.3) !important;
        color: #9b59b6 !important;
      }
      .log-msg {
        color: #f5eef8 !important;
        font-style: italic;
      }
    }
  }

  // Drawer Footer
  .drawer-footer {
    padding-top: 10px;
    margin-top: 6px;
    border-top: 1px solid rgba(201, 162, 39, 0.25);
    display: flex;
  }

  .copy-all-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    background: rgba(201, 162, 39, 0.15);
    border: 1px solid rgba(201, 162, 39, 0.4);
    color: $color-gold-300;
    font-family: $font-display;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);

    &:hover:not(:disabled) {
      background: rgba(201, 162, 39, 0.3);
      border-color: $color-gold-300;
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(201, 162, 39, 0.25);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: rgba(255, 255, 255, 0.1);
    }

    &--copied {
      background: rgba(72, 187, 120, 0.25) !important;
      border-color: rgba(72, 187, 120, 0.6) !important;
      color: #68d391 !important;
      box-shadow: 0 0 12px rgba(72, 187, 120, 0.3) !important;
    }

    .btn-icon {
      font-size: 0.95rem;
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
