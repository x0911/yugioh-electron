import { defineStore } from 'pinia';
import type { EngineInitStatus } from '../../shared/types/ipc.js';

export interface CrashErrorInfo {
  title: string;
  message: string;
  stack?: string;
}

export interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  actionGuideText: string;
  activeModal: string | null;
  selectedCardCode: number | null;
  hoveredCardCode: number | null;
  engineStatus: EngineInitStatus | null;
  crashError: CrashErrorInfo | null;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    isLoading: false,
    loadingMessage: 'Loading Ancient Duel Arena...',
    actionGuideText: '',
    activeModal: null,
    selectedCardCode: null,
    hoveredCardCode: null,
    engineStatus: null,
    crashError: null,
  }),
  actions: {
    setEngineStatus(status: EngineInitStatus): void {
      this.engineStatus = status;
    },
    setLoading(loading: boolean, message = 'Loading...'): void {
      this.isLoading = loading;
      this.loadingMessage = message;
    },
    setActionGuide(text: string): void {
      this.actionGuideText = text;
    },
    openModal(modalId: string): void {
      this.activeModal = modalId;
    },
    closeModal(): void {
      this.activeModal = null;
    },
    triggerCrashError(error: Error | string, customTitle = 'Duel Engine Disruption'): void {
      console.error('[UIStore] Crash Error Caught:', error);
      if (error instanceof Error) {
        this.crashError = {
          title: customTitle,
          message: error.message || 'An unexpected error occurred during execution.',
          stack: error.stack,
        };
      } else {
        this.crashError = {
          title: customTitle,
          message: String(error),
        };
      }
    },
    clearCrashError(): void {
      this.crashError = null;
    },
  },
});
