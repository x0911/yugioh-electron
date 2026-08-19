import { defineStore } from 'pinia';

export interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  actionGuideText: string;
  activeModal: string | null;
  selectedCardCode: number | null;
  hoveredCardCode: number | null;
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    isLoading: false,
    loadingMessage: 'Loading Ancient Duel Arena...',
    actionGuideText: '',
    activeModal: null,
    selectedCardCode: null,
    hoveredCardCode: null,
  }),
  actions: {
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
  },
});
