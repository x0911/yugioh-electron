import { defineStore } from 'pinia';

export interface DeckEditState {
  currentDeckName: string;
  mainDeckCardIds: number[];
  extraDeckCardIds: number[];
  searchFilter: string;
  selectedEra: 'ALL' | 'DM' | 'GX';
  isDirty: boolean;
}

export const useDeckEditStore = defineStore('deckEdit', {
  state: (): DeckEditState => ({
    currentDeckName: 'My Custom Deck',
    mainDeckCardIds: [],
    extraDeckCardIds: [],
    searchFilter: '',
    selectedEra: 'ALL',
    isDirty: false,
  }),
  getters: {
    mainDeckCount: (state): number => state.mainDeckCardIds.length,
    extraDeckCount: (state): number => state.extraDeckCardIds.length,
    isDeckLegal: (state): boolean =>
      state.mainDeckCardIds.length >= 40 &&
      state.mainDeckCardIds.length <= 60 &&
      state.extraDeckCardIds.length <= 15,
  },
  actions: {
    setDeckName(name: string): void {
      this.currentDeckName = name;
      this.isDirty = true;
    },
    addCardToMain(cardId: number): void {
      if (this.mainDeckCardIds.length < 60) {
        this.mainDeckCardIds.push(cardId);
        this.isDirty = true;
      }
    },
    removeCardFromMain(index: number): void {
      this.mainDeckCardIds.splice(index, 1);
      this.isDirty = true;
    },
  },
});
