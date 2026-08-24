import { defineStore } from 'pinia';
import type { DuelBoardState } from '../../shared/types/field.js';
import { useSettingsStore } from './settingsStore.js';

export interface LogItem {
  time: string;
  type: string;
  description: string;
}

export interface SavedDuelLog {
  id: string;
  timestamp: number;
  dateFormatted: string;
  playerName: string;
  playerDeckName?: string;
  playerStartingLp: number;
  playerFinalLp: number;
  opponentId: string;
  opponentName: string;
  opponentTitle?: string;
  opponentSeries?: 'DM' | 'GX';
  opponentDeckName?: string;
  opponentAvatar?: string;
  opponentStartingLp: number;
  opponentFinalLp: number;
  turns: number;
  outcome: 'victory' | 'defeat' | 'draw' | 'surrender';
  outcomeLabel: string;
  winReason?: string | null;
  totalEvents: number;
  markdownLog: string;
  logs: LogItem[];
}

const STORAGE_KEY = 'ygo_duel_logs_history';
const MAX_SAVED_DUELS = 10;

function loadFromStorage(): SavedDuelLog[] {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_SAVED_DUELS);
        }
      }
    }
  } catch (err) {
    console.warn('[DuelLogsStore] Failed to load saved duel logs from localStorage:', err);
  }
  return [];
}

function saveToStorage(duels: SavedDuelLog[]): void {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(duels.slice(0, MAX_SAVED_DUELS)));
    }
  } catch (err) {
    console.warn('[DuelLogsStore] Failed to write saved duel logs to localStorage:', err);
  }
}

export const useDuelLogsStore = defineStore('duelLogs', {
  state: () => ({
    savedDuels: loadFromStorage() as SavedDuelLog[],
  }),

  getters: {
    totalArchived: (state) => state.savedDuels.length,
    victoryCount: (state) => state.savedDuels.filter((d) => d.outcome === 'victory').length,
    defeatCount: (state) => state.savedDuels.filter((d) => d.outcome === 'defeat' || d.outcome === 'surrender').length,
    winRatePercent(state): number {
      if (state.savedDuels.length === 0) return 0;
      const wins = state.savedDuels.filter((d) => d.outcome === 'victory').length;
      return Math.round((wins / state.savedDuels.length) * 100);
    },
  },

  actions: {
    /**
     * Records a completed or surrendered duel into history.
     * Keeps exactly the last 10 duels.
     */
    recordDuel(duel: Omit<SavedDuelLog, 'id' | 'timestamp' | 'dateFormatted'> & { id?: string }): SavedDuelLog {
      const now = Date.now();
      const d = new Date(now);
      const dateFormatted = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const entry: SavedDuelLog = {
        ...duel,
        id: duel.id || `duel-${now}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now,
        dateFormatted,
      };

      // Add to front and keep only the latest 10
      this.savedDuels = [entry, ...this.savedDuels.filter((existing) => existing.id !== entry.id)].slice(0, MAX_SAVED_DUELS);
      saveToStorage(this.savedDuels);
      return entry;
    },

    deleteDuel(id: string): void {
      this.savedDuels = this.savedDuels.filter((d) => d.id !== id);
      saveToStorage(this.savedDuels);
    },

    clearAllDuels(): void {
      this.savedDuels = [];
      saveToStorage([]);
    },

    /**
     * Builds standard markdown duel log string ready for 1-click LLM pasting.
     * Resilient to either (boardState, logs) or (logs, boardState) parameter ordering.
     */
    buildMarkdownReport(
      arg1: DuelBoardState | LogItem[] | null,
      arg2?: LogItem[] | DuelBoardState | null,
      options?: {
        outcome?: 'victory' | 'defeat' | 'draw' | 'surrender';
        winReason?: string | null;
        guideInstruction?: string;
        guideSubText?: string;
      },
    ): string {
      let boardState: DuelBoardState | null = null;
      let logs: LogItem[] = [];

      if (Array.isArray(arg1)) {
        logs = arg1;
        boardState = (arg2 && !Array.isArray(arg2)) ? (arg2 as DuelBoardState) : null;
      } else {
        boardState = arg1 as DuelBoardState | null;
        logs = Array.isArray(arg2) ? arg2 : [];
      }

      const lines: string[] = [];
      lines.push('```yugioh-duel-log');
      lines.push('=== YU-GI-OH! DUEL LOG & DIAGNOSTIC REPORT ===');

      if (boardState && boardState.userField && boardState.opponentField) {
        const uPf = boardState.userField;
        const oPf = boardState.opponentField;
        lines.push(
          `• Turn: ${boardState.turnNumber} | Phase: ${boardState.currentPhase} | Turn Player: ${uPf.isTurn ? 'Player (You)' : 'Opponent'}`,
        );
        lines.push(
          `• Player LP: ${uPf.currentLp}/${uPf.maxLp} | Opponent LP: ${oPf.currentLp}/${oPf.maxLp} (${oPf.name || 'Opponent'})`,
        );

        let engineLabel = 'Built-in Fast Engine (Local Heuristics)';
        try {
          const settingsStore = useSettingsStore();
          if (settingsStore) {
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
            engineLabel = provNames[activeProv] || 'Built-in Fast Engine';
          }
        } catch {
          // Unit test or offline mock fallback
        }
        lines.push(`• Opponent AI Engine: ${engineLabel}`);

        if (options?.outcome) {
          lines.push(`• Final Duel Outcome: ${options.outcome.toUpperCase()}${options.winReason ? ` (${options.winReason})` : ''}`);
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

      if (options?.guideInstruction) {
        lines.push(`• Active Guidance: ${options.guideInstruction}`);
        if (options.guideSubText) {
          lines.push(`• Context Details: ${options.guideSubText}`);
        }
      }

      lines.push(`\n--- EVENT STREAM (${logs.length} Events) ---`);
      for (const item of logs) {
        lines.push(`[${item.time}] [${item.type}] ${item.description}`);
      }
      lines.push('==============================================');
      lines.push('```');

      return lines.join('\n');
    },
  },
});
