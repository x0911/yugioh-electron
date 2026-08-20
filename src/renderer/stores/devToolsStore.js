import { defineStore } from 'pinia';
export const useDevToolsStore = defineStore('devTools', {
    state: () => ({
        showDevNav: false,
        showDuelLog: true,
        messageHistory: [],
        simulatedLagMs: 0,
    }),
    actions: {
        toggleDevNav() {
            this.showDevNav = !this.showDevNav;
        },
        toggleDuelLog() {
            this.showDuelLog = !this.showDuelLog;
        },
        addLogEntry(type, payload) {
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
        clearLogs() {
            this.messageHistory = [];
        },
    },
});
