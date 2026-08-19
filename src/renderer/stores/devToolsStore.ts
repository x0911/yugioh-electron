import { defineStore } from 'pinia';

export interface DevLogEntry {
  id: string;
  timestamp: number;
  type: string;
  payload: unknown;
}

export interface DevToolsState {
  showDevNav: boolean;
  showDuelLog: boolean;
  messageHistory: DevLogEntry[];
  simulatedLagMs: number;
}

export const useDevToolsStore = defineStore('devTools', {
  state: (): DevToolsState => ({
    showDevNav: false,
    showDuelLog: true,
    messageHistory: [],
    simulatedLagMs: 0,
  }),
  actions: {
    toggleDevNav(): void {
      this.showDevNav = !this.showDevNav;
    },
    toggleDuelLog(): void {
      this.showDuelLog = !this.showDuelLog;
    },
    addLogEntry(type: string, payload: unknown): void {
      this.messageHistory.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        type,
        payload,
      });
      // Limit history to 1000 items
      if (this.messageHistory.length > 1000) {
        this.messageHistory.shift();
      }
    },
    clearLogs(): void {
      this.messageHistory = [];
    },
  },
});
