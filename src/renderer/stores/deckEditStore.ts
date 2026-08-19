import { defineStore } from 'pinia';
import type { CardDetail, CardFilterState } from '../../shared/types/card.js';
import { DEFAULT_CARD_FILTER_STATE } from '../../shared/types/card.js';
import type { CustomDeck, DeckValidity, GroupedDeckCard } from '../../shared/types/deck.js';
import { validateDeck, DECK_LIMITS } from '../../shared/types/deck.js';

export interface DeckEditStoreState {
  cardPool: CardDetail[];
  isLoaded: boolean;
  isLoading: boolean;
  customDecks: CustomDeck[];
  activeDeckId: string;
  activeDeck: CustomDeck;
  filters: CardFilterState;
  hoveredCard: CardDetail | null;
  isDirty: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'warning' | 'danger' | 'info';
  draggingCard: CardDetail | null;
  dragSource: 'pool' | 'main-deck' | 'extra-deck' | 'previewer' | null;
  isDragging: boolean;
}

function createEmptyDeck(id: string, name = 'New Custom Deck'): CustomDeck {
  return {
    id,
    name,
    main: [],
    extra: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export const useDeckEditStore = defineStore('deckEdit', {
  state: (): DeckEditStoreState => ({
    cardPool: [],
    isLoaded: false,
    isLoading: false,
    customDecks: [],
    activeDeckId: '',
    activeDeck: createEmptyDeck('temp-init'),
    filters: { ...DEFAULT_CARD_FILTER_STATE },
    hoveredCard: null,
    isDirty: false,
    toastMessage: null,
    toastType: 'success',
    draggingCard: null,
    dragSource: null,
    isDragging: false,
  }),

  getters: {
    cardMap: (state): Map<number, CardDetail> => {
      const map = new Map<number, CardDetail>();
      for (const card of state.cardPool) {
        map.set(card.id, card);
      }
      return map;
    },

    filteredCards: (state): CardDetail[] => {
      let list = state.cardPool;
      const {
        query,
        kind,
        subType,
        attribute,
        race,
        level,
        minAtk,
        maxAtk,
        minDef,
        maxDef,
        era,
        sortBy,
        sortOrder,
      } = state.filters;

      // 1. Text Query (Search across name and description)
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        list = list.filter(
          (c) => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
        );
      }

      // 2. Era Filter
      if (era !== 'ALL') {
        list = list.filter((c) => c.era === era);
      }

      // 3. Card Kind Filter
      if (kind === 'MONSTER') {
        list = list.filter((c) => c.isMonster && !c.isExtraDeck);
      } else if (kind === 'SPELL') {
        list = list.filter((c) => c.isSpell);
      } else if (kind === 'TRAP') {
        list = list.filter((c) => c.isTrap);
      } else if (kind === 'EXTRA') {
        list = list.filter((c) => c.isExtraDeck);
      }

      // 4. SubType Filter
      if (subType && subType !== 'ALL') {
        if (subType === 'NORMAL') {
          list = list.filter((c) => c.isNormal);
        } else if (subType === 'EFFECT') {
          list = list.filter((c) => c.isEffect);
        } else if (subType === 'RITUAL') {
          list = list.filter((c) => c.isRitual);
        } else if (subType === 'FUSION') {
          list = list.filter((c) => c.isFusion);
        } else if (subType === 'CONTINUOUS') {
          list = list.filter((c) => c.isContinuous);
        } else if (subType === 'EQUIP') {
          list = list.filter((c) => c.isEquip);
        } else if (subType === 'QUICKPLAY') {
          list = list.filter((c) => c.isQuickPlay);
        } else if (subType === 'FIELD') {
          list = list.filter((c) => c.isField);
        } else if (subType === 'COUNTER') {
          list = list.filter((c) => c.isCounter);
        } else if (subType === 'FLIP') {
          list = list.filter((c) => c.isFlip);
        } else if (subType === 'TOON') {
          list = list.filter((c) => c.isToon);
        } else if (subType === 'UNION') {
          list = list.filter((c) => c.isUnion);
        } else if (subType === 'SPIRIT') {
          list = list.filter((c) => c.isSpirit);
        } else if (subType === 'GEMINI') {
          list = list.filter((c) => c.isGemini);
        }
      }

      // 5. Attribute Filter
      if (attribute && attribute > 0) {
        list = list.filter((c) => (c.attribute & attribute) !== 0);
      }

      // 6. Race Filter
      if (race && race > 0) {
        list = list.filter((c) => (c.race & race) !== 0);
      }

      // 7. Level Filter
      if (level && level > 0) {
        list = list.filter((c) => c.level === level);
      }

      // 8. ATK Range Filter
      if (minAtk !== null && !isNaN(minAtk)) {
        list = list.filter((c) => c.isMonster && c.atk >= minAtk);
      }
      if (maxAtk !== null && !isNaN(maxAtk)) {
        list = list.filter((c) => c.isMonster && c.atk <= maxAtk);
      }

      // 9. DEF Range Filter
      if (minDef !== null && !isNaN(minDef)) {
        list = list.filter((c) => c.isMonster && c.def >= minDef);
      }
      if (maxDef !== null && !isNaN(maxDef)) {
        list = list.filter((c) => c.isMonster && c.def <= maxDef);
      }

      // 10. Sorting
      const sorted = [...list].sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') {
          diff = a.name.localeCompare(b.name);
        } else if (sortBy === 'atk') {
          diff = (b.atk || 0) - (a.atk || 0);
        } else if (sortBy === 'def') {
          diff = (b.def || 0) - (a.def || 0);
        } else if (sortBy === 'level') {
          diff = (b.level || 0) - (a.level || 0);
        } else if (sortBy === 'id') {
          diff = a.id - b.id;
        } else if (sortBy === 'type') {
          diff = a.type - b.type;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });

      return sorted;
    },

    deckCardCounts: (state): Map<number, number> => {
      const counts = new Map<number, number>();
      for (const id of state.activeDeck.main) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      for (const id of state.activeDeck.extra) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      return counts;
    },

    mainDeckGrouped: (state): GroupedDeckCard[] => {
      const countMap = new Map<number, number>();
      for (const id of state.activeDeck.main) {
        countMap.set(id, (countMap.get(id) ?? 0) + 1);
      }
      const grouped: GroupedDeckCard[] = [];
      for (const [id, count] of countMap.entries()) {
        grouped.push({ id, count, isExtra: false });
      }
      return grouped;
    },

    extraDeckGrouped: (state): GroupedDeckCard[] => {
      const countMap = new Map<number, number>();
      for (const id of state.activeDeck.extra) {
        countMap.set(id, (countMap.get(id) ?? 0) + 1);
      }
      const grouped: GroupedDeckCard[] = [];
      for (const [id, count] of countMap.entries()) {
        grouped.push({ id, count, isExtra: true });
      }
      return grouped;
    },

    mainDeckCount: (state): number => state.activeDeck.main.length,
    extraDeckCount: (state): number => state.activeDeck.extra.length,

    deckStats(state): {
      monsters: number;
      spells: number;
      traps: number;
      fusions: number;
    } {
      let monsters = 0;
      let spells = 0;
      let traps = 0;
      let fusions = 0;

      const cardMap = this.cardMap;
      for (const id of state.activeDeck.main) {
        const c = cardMap.get(id);
        if (c) {
          if (c.isMonster) monsters++;
          else if (c.isSpell) spells++;
          else if (c.isTrap) traps++;
        }
      }
      for (const id of state.activeDeck.extra) {
        const c = cardMap.get(id);
        if (c && c.isFusion) fusions++;
      }

      return { monsters, spells, traps, fusions };
    },

    deckValidity(state): DeckValidity {
      const cardMap = this.cardMap;
      const getCardName = (id: number) => cardMap.get(id)?.name || `Card #${id}`;
      const validity = validateDeck(state.activeDeck.main, state.activeDeck.extra, getCardName);
      const stats = this.deckStats;
      validity.monsterCount = stats.monsters;
      validity.spellCount = stats.spells;
      validity.trapCount = stats.traps;
      validity.fusionCount = stats.fusions;
      return validity;
    },

    isDeckLegal(): boolean {
      return this.deckValidity.isValid;
    },
  },

  actions: {
    async initStore(): Promise<void> {
      if (this.isLoaded) return;
      this.isLoading = true;

      try {
        // 1. Fetch all cards from main process SQLite cdb
        if (window.deckAPI?.getAllCards) {
          this.cardPool = await window.deckAPI.getAllCards();
        }

        // 2. Fetch custom decks from electron-store
        if (window.deckAPI?.getCustomDecks) {
          this.customDecks = await window.deckAPI.getCustomDecks();
        }

        // 3. Fetch active deck id
        let activeId = 'starter-yugi-dm';
        if (window.deckAPI?.getActiveDeckId) {
          activeId = await window.deckAPI.getActiveDeckId();
        }

        if (this.customDecks.length > 0) {
          const found = this.customDecks.find((d) => d.id === activeId);
          if (found) {
            this.activeDeck = JSON.parse(JSON.stringify(found));
            this.activeDeckId = found.id;
          } else {
            this.activeDeck = JSON.parse(JSON.stringify(this.customDecks[0]));
            this.activeDeckId = this.customDecks[0].id;
          }
        } else {
          const fresh = createEmptyDeck('custom-deck-1', 'My Custom Deck');
          this.customDecks = [fresh];
          this.activeDeck = JSON.parse(JSON.stringify(fresh));
          this.activeDeckId = fresh.id;
        }

        // 4. Default preview card (e.g. Dark Magician or first card)
        if (this.cardPool.length > 0) {
          const defaultCard =
            this.cardPool.find((c) => c.name === 'Dark Magician') || this.cardPool[0];
          this.hoveredCard = defaultCard;
        }

        this.isLoaded = true;
      } catch (err) {
        console.error('[DeckEditStore] Failed to initialize store:', err);
      } finally {
        this.isLoading = false;
      }
    },

    selectDeck(deckId: string): void {
      const found = this.customDecks.find((d) => d.id === deckId);
      if (found) {
        this.activeDeck = JSON.parse(JSON.stringify(found));
        this.activeDeckId = found.id;
        this.isDirty = false;
        if (window.deckAPI?.setActiveDeckId) {
          window.deckAPI.setActiveDeckId(found.id);
        }
      }
    },

    setDeckName(name: string): void {
      this.activeDeck.name = name;
      this.isDirty = true;
    },

    newDeck(deckName = 'New Custom Deck'): void {
      const id = `deck-${Date.now()}`;
      const fresh = createEmptyDeck(id, deckName);
      this.customDecks.push(fresh);
      this.activeDeck = JSON.parse(JSON.stringify(fresh));
      this.activeDeckId = id;
      this.isDirty = true;
      this.showToast(`Created new deck: "${deckName}"`, 'info');
    },

    duplicateCurrentDeck(): void {
      const id = `deck-${Date.now()}`;
      const clone: CustomDeck = {
        ...JSON.parse(JSON.stringify(this.activeDeck)),
        id,
        name: `${this.activeDeck.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.customDecks.push(clone);
      this.activeDeck = JSON.parse(JSON.stringify(clone));
      this.activeDeckId = id;
      this.isDirty = true;
      this.showToast(`Duplicated deck as "${clone.name}"`, 'info');
    },

    async saveCurrentDeck(): Promise<boolean> {
      const validity = this.deckValidity;
      if (!validity.isValid || this.activeDeck.main.length < 40) {
        const errorMsg =
          this.activeDeck.main.length < 40
            ? `Main Deck contains only ${this.activeDeck.main.length}/40 cards. A tournament-legal deck requires at least 40 cards.`
            : (validity.errors[0] || 'Deck contains illegal card configurations.');
        this.showToast(`Cannot save: ${errorMsg}`, 'danger');
        return false;
      }

      try {
        const deckToSave: CustomDeck = {
          ...this.activeDeck,
          updatedAt: Date.now(),
        };

        // Update local customDecks list
        const index = this.customDecks.findIndex((d) => d.id === deckToSave.id);
        if (index >= 0) {
          this.customDecks[index] = JSON.parse(JSON.stringify(deckToSave));
        } else {
          this.customDecks.push(JSON.parse(JSON.stringify(deckToSave)));
        }

        // Persist over IPC
        if (window.deckAPI?.saveCustomDeck) {
          await window.deckAPI.saveCustomDeck(deckToSave);
        }
        if (window.deckAPI?.setActiveDeckId) {
          await window.deckAPI.setActiveDeckId(deckToSave.id);
        }

        this.isDirty = false;
        this.showToast(`Saved "${deckToSave.name}" (Legal 40-60 Deck)`, 'success');
        return true;
      } catch (err) {
        console.error('[DeckEditStore] Error saving deck:', err);
        this.showToast('Failed to save deck.', 'danger');
        return false;
      }
    },

    async deleteCurrentDeck(): Promise<boolean> {
      const deckId = this.activeDeck.id;
      if (this.customDecks.length <= 1) {
        this.showToast('Cannot delete the only remaining deck. Create another first.', 'warning');
        return false;
      }

      try {
        if (window.deckAPI?.deleteCustomDeck) {
          await window.deckAPI.deleteCustomDeck(deckId);
        }

        this.customDecks = this.customDecks.filter((d) => d.id !== deckId);
        const nextDeck = this.customDecks[0];
        this.activeDeck = JSON.parse(JSON.stringify(nextDeck));
        this.activeDeckId = nextDeck.id;
        this.isDirty = false;
        this.showToast('Deck deleted successfully.', 'info');
        return true;
      } catch (err) {
        console.error('[DeckEditStore] Error deleting deck:', err);
        this.showToast('Failed to delete deck.', 'danger');
        return false;
      }
    },

    clearCurrentDeck(): void {
      this.activeDeck.main = [];
      this.activeDeck.extra = [];
      this.isDirty = true;
      this.showToast('Deck cleared.', 'info');
    },

    addCardToDeck(cardId: number): boolean {
      const card = this.cardMap.get(cardId);
      if (!card) return false;

      const currentCount = this.deckCardCounts.get(cardId) ?? 0;
      if (currentCount >= DECK_LIMITS.MAX_COPIES_PER_CARD) {
        this.showToast(
          `Cannot add more than ${DECK_LIMITS.MAX_COPIES_PER_CARD} copies of "${card.name}".`,
          'warning',
        );
        return false;
      }

      if (card.isExtraDeck) {
        if (this.activeDeck.extra.length >= DECK_LIMITS.MAX_EXTRA) {
          this.showToast(
            `Extra Deck is full (maximum ${DECK_LIMITS.MAX_EXTRA} cards).`,
            'warning',
          );
          return false;
        }
        this.activeDeck.extra.push(cardId);
      } else {
        if (this.activeDeck.main.length >= DECK_LIMITS.MAX_MAIN) {
          this.showToast(`Main Deck is full (maximum ${DECK_LIMITS.MAX_MAIN} cards).`, 'warning');
          return false;
        }
        this.activeDeck.main.push(cardId);
      }

      this.isDirty = true;
      return true;
    },

    removeCardFromDeck(cardId: number, isExtra = false): boolean {
      if (isExtra) {
        const index = this.activeDeck.extra.indexOf(cardId);
        if (index >= 0) {
          this.activeDeck.extra.splice(index, 1);
          this.isDirty = true;
          return true;
        }
      } else {
        const index = this.activeDeck.main.indexOf(cardId);
        if (index >= 0) {
          this.activeDeck.main.splice(index, 1);
          this.isDirty = true;
          return true;
        }
      }
      return false;
    },

    startDrag(card: CardDetail, source: 'pool' | 'main-deck' | 'extra-deck' | 'previewer' = 'pool'): void {
      this.draggingCard = card;
      this.dragSource = source;
      this.isDragging = true;
      this.setHoveredCard(card);
    },

    endDrag(): void {
      this.draggingCard = null;
      this.dragSource = null;
      this.isDragging = false;
    },

    dropOnMainDeck(cardId?: number): boolean {
      const id = cardId ?? this.draggingCard?.id;
      if (!id) return false;
      const card = this.cardMap.get(id);
      if (!card) return false;

      // Auto-route Fusions to extra deck or notify
      if (card.isExtraDeck) {
        this.showToast(`"${card.name}" is a Fusion Monster — placed into Extra Deck!`, 'info');
        return this.addCardToDeck(id);
      }

      return this.addCardToDeck(id);
    },

    dropOnExtraDeck(cardId?: number): boolean {
      const id = cardId ?? this.draggingCard?.id;
      if (!id) return false;
      const card = this.cardMap.get(id);
      if (!card) return false;

      if (!card.isExtraDeck) {
        this.showToast(`"${card.name}" belongs in the Main Deck (not Extra Deck).`, 'warning');
        return false;
      }

      return this.addCardToDeck(id);
    },

    dropOnRemove(cardId?: number, isExtra?: boolean): boolean {
      const id = cardId ?? this.draggingCard?.id;
      if (!id) return false;
      const card = this.cardMap.get(id);
      const extra = isExtra ?? (this.dragSource === 'extra-deck' || (card?.isExtraDeck ?? false));
      const removed = this.removeCardFromDeck(id, extra);
      if (removed && card) {
        this.showToast(`Removed 1 copy of "${card.name}" from deck.`, 'info');
      }
      return removed;
    },

    setHoveredCard(cardOrId: CardDetail | number | null): void {
      if (!cardOrId) return;
      if (typeof cardOrId === 'number') {
        const c = this.cardMap.get(cardOrId);
        if (c) this.hoveredCard = c;
      } else {
        this.hoveredCard = cardOrId;
      }
    },

    setFilter<K extends keyof CardFilterState>(key: K, value: CardFilterState[K]): void {
      this.filters[key] = value;
    },

    resetFilters(): void {
      this.filters = { ...DEFAULT_CARD_FILTER_STATE };
    },

    showToast(message: string, type: 'success' | 'warning' | 'danger' | 'info' = 'success'): void {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => {
        if (this.toastMessage === message) {
          this.toastMessage = null;
        }
      }, 3500);
    },
  },
});
