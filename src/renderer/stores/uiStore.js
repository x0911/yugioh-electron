import { defineStore } from 'pinia';
export const useUIStore = defineStore('ui', {
    state: () => ({
        isLoading: false,
        loadingMessage: 'Loading Ancient Duel Arena...',
        actionGuideText: '',
        activeModal: null,
        selectedCardCode: null,
        hoveredCardCode: null,
        engineStatus: null,
    }),
    actions: {
        setEngineStatus(status) {
            this.engineStatus = status;
        },
        setLoading(loading, message = 'Loading...') {
            this.isLoading = loading;
            this.loadingMessage = message;
        },
        setActionGuide(text) {
            this.actionGuideText = text;
        },
        openModal(modalId) {
            this.activeModal = modalId;
        },
        closeModal() {
            this.activeModal = null;
        },
    },
});
