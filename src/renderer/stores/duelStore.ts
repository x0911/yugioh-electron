import { defineStore } from 'pinia';
import type { CharacterData, CharacterDeckData } from '../../shared/types/character.js';
import type { CustomDeck } from '../../shared/types/deck.js';
import type { CardDetail } from '../../shared/types/card.js';
import type {
  CoinChoice,
  CoinWinner,
  StartingPlayer,
  DuelEventPayload,
  SelectIdleCmdPayload,
  SelectBattleCmdPayload,
  SelectCardPayload,
  SelectChainPayload,
  SelectPositionPayload,
  SelectEffectYnPayload,
  SelectOptionPayload,
  SelectPlacePayload,
  SelectTributePayload,
  SelectSumPayload,
  SelectUnselectCardPayload,
  AnnounceCardPayload,
  AnnounceRacePayload,
  AnnounceAttribPayload,
  AnnounceNumberPayload,
} from '../../shared/types/duel.js';
import type {
  DuelBoardState,
  FieldCard,
  PlayerFieldState,
  CardPositionState,
} from '../../shared/types/field.js';
import { useSettingsStore } from './settingsStore.js';
import { useDeckEditStore } from './deckEditStore.js';

// Default tournament-legal 40-card Starter Deck if no user custom deck is selected
const DEFAULT_USER_MAIN_DECK = [
  46986414, 46986414, // Dark Magician x2
  70781052, 70781052, 70781052, // Summoned Skull x3
  91152256, 91152256, 91152256, // Celtic Guardian x3
  6368038, 6368038, 6368038, // Mystical Elf x3
  25280974, 25280974, 25280974, // Giant Soldier of Stone x3
  72892473, 72892473, 72892473, // Kuriboh x3
  54652250, 54652250, 54652250, // Man-Eater Bug x3
  40640057, 40640057, // Sangan x2
  33782437, 33782437, // Gemini Elf x2
  79571449, 79571449, // Graceful Charity x2
  53129443, // Dark Hole x1
  12580477, // Raigeki x1
  83764718, // Monster Reborn x1
  5318639, // Mystical Space Typhoon x1
  44095762, // Mirror Force x1
  78193831, // Trap Hole x1
];

// Default Extra Deck (Fusion Monsters)
const DEFAULT_USER_EXTRA_DECK = [
  45231177, // Flame Swordsman
  41462083, // Thousand Dragon
  66889139, // Gaia the Dragon Champion
  98502113, // Dark Paladin
  11901678, // B. Skull Dragon
];

export interface CardActionOption {
  type: 'summon' | 'sp_summon' | 'monster_set' | 'spell_set' | 'activate' | 'pos_change' | 'attack';
  index: number;
  label: string;
  icon?: string;
}

export interface DuelStoreState {
  // Match & Coin Toss Setup
  selectedOpponent: CharacterData | null;
  selectedOpponentDeck: CharacterDeckData | null;
  selectedOpponentDeckIndex: number;
  selectedUserDeck: CustomDeck | null;
  userChoice: CoinChoice | null;
  coinResult: CoinChoice | null;
  coinWinner: CoinWinner | null;
  startingPlayer: StartingPlayer;
  userPlayerId: 0 | 1;
  opponentPlayerId: 0 | 1;
  isMatchPrepared: boolean;

  // In-Duel Board State
  boardState: DuelBoardState;
  isDuelActive: boolean;

  // Active Prompts for Human Player
  activeIdleCmd: SelectIdleCmdPayload | null;
  activeBattleCmd: SelectBattleCmdPayload | null;
  activeSelectCard: SelectCardPayload | null;
  activeSelectChain: SelectChainPayload | null;
  activeSelectPosition: SelectPositionPayload | null;
  activeSelectEffectYn: SelectEffectYnPayload | null;
  activeSelectOption: SelectOptionPayload | null;
  activeSelectPlace: SelectPlacePayload | null;
  activeSelectTribute: SelectTributePayload | null;
  activeSelectSum: SelectSumPayload | null;
  activeSelectUnselectCard: SelectUnselectCardPayload | null;
  activeAnnounceCard: AnnounceCardPayload | null;
  activeAnnounceRace: AnnounceRacePayload | null;
  activeAnnounceAttrib: AnnounceAttribPayload | null;
  activeAnnounceNumber: AnnounceNumberPayload | null;

  // Card Database Cache
  cardMap: Map<number, CardDetail>;
  isCardsLoaded: boolean;

  // Active Target Selections
  selectedTargetIndices: number[];

  isPromptWaiting: boolean;

  // In-Duel Video Playback
  isVideoPlaying: boolean;
  activeVideoPayload: import('../../shared/types/duel.js').CardVideoPayload | null;

  // Card Selection Modal State
  isCardSelectionModalOpen: boolean;

  // Chain Loop Deduplication
  lastChainedCode: number | null;
}

export interface TargetInfo {
  isSelectable: boolean;
  selectIndex: number;
  isSelected: boolean;
  owner: 'user' | 'ai';
  locationType: 'hand' | 'field' | 'deck' | 'extra-deck' | 'graveyard' | 'banished';
  tooltipText: string;
  isCost: boolean;
  isTribute: boolean;
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function createEmptyPlayerField(playerId: 0 | 1, name: string): PlayerFieldState {
  return {
    playerId,
    name,
    currentLp: 8000,
    maxLp: 8000,
    isTurn: playerId === 0,
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
    deckCount: 40,
    extraDeckCount: 0,
    hand: [],
  };
}

export const useDuelStore = defineStore('duel', {
  state: (): DuelStoreState => ({
    selectedOpponent: null,
    selectedOpponentDeck: null,
    selectedOpponentDeckIndex: 0,
    selectedUserDeck: null,
    userChoice: null,
    coinResult: null,
    coinWinner: null,
    startingPlayer: 'user',
    userPlayerId: 0,
    opponentPlayerId: 1,
    isMatchPrepared: false,

    boardState: {
      userField: createEmptyPlayerField(0, 'You'),
      opponentField: createEmptyPlayerField(1, 'Opponent'),
      extraMonsterZones: [null, null],
      turnNumber: 1,
      currentPhase: 'DP',
      activePrompt: null,
      phaseGuideText: '',
      winner: null,
      winReason: null,
    },
    isDuelActive: false,

    activeIdleCmd: null,
    activeBattleCmd: null,
    activeSelectCard: null,
    activeSelectChain: null,
    activeSelectPosition: null,
    activeSelectEffectYn: null,
    activeSelectOption: null,
    activeSelectPlace: null,
    activeSelectTribute: null,
    activeSelectSum: null,
    activeSelectUnselectCard: null,
    activeAnnounceCard: null,
    activeAnnounceRace: null,
    activeAnnounceAttrib: null,
    activeAnnounceNumber: null,
    cardMap: new Map(),
    isCardsLoaded: false,
    selectedTargetIndices: [],

    isPromptWaiting: false,

    isVideoPlaying: false,
    activeVideoPayload: null,

    isCardSelectionModalOpen: false,
    lastChainedCode: null,
  }),

  getters: {
    isGameOver: (state): boolean => state.boardState.winner !== null,
    isUserTurn: (state): boolean => state.boardState.userField.isTurn,
    currentPhase: (state): 'DP' | 'SP' | 'M1' | 'BP' | 'M2' | 'EP' => state.boardState.currentPhase,
    userLp: (state): number => state.boardState.userField.currentLp,
    aiLp: (state): number => state.boardState.opponentField.currentLp,
    turnNumber: (state): number => state.boardState.turnNumber,
    opponentName: (state): string => state.selectedOpponent?.name || 'Opponent',
    opponentTitle: (state): string => state.selectedOpponent?.title || 'Challenger',
    opponentSeries: (state): 'DM' | 'GX' => state.selectedOpponent?.series || 'DM',
    opponentAvatar: (state): string => state.selectedOpponent?.avatar || '',
    opponentVideo: (state): string => state.selectedOpponent?.video || '',
    userWonCoinToss: (state): boolean => state.coinWinner === 'user',
    firstTurnPlayerName(): string {
      if (this.startingPlayer === 'user') return 'You';
      return this.opponentName;
    },

    canGoToBattlePhase(state): boolean {
      if (!state.boardState.userField.isTurn) return false;
      return !!state.activeIdleCmd?.to_bp;
    },

    canGoToMainPhase2(state): boolean {
      if (!state.boardState.userField.isTurn) return false;
      return !!state.activeBattleCmd?.to_m2;
    },

    canEndTurn(state): boolean {
      if (!state.boardState.userField.isTurn) return false;
      if (state.boardState.currentPhase === 'BP') return !!state.activeBattleCmd?.to_ep;
      return !!state.activeIdleCmd?.to_ep;
    },

    activeSelectionPayload: (state): SelectCardPayload | SelectTributePayload | SelectSumPayload | SelectUnselectCardPayload | null => {
      return state.activeSelectUnselectCard || state.activeSelectSum || state.activeSelectCard || state.activeSelectTribute;
    },

    hasActiveSelectionPrompt(state): boolean {
      return !!state.activeSelectUnselectCard || !!state.activeSelectSum || !!state.activeSelectCard || !!state.activeSelectTribute;
    },

    activeSelectionMin(state): number {
      return state.activeSelectSum?.min || state.activeSelectUnselectCard?.min || state.activeSelectTribute?.min || state.activeSelectCard?.min || 1;
    },

    activeSelectionMax(state): number {
      return state.activeSelectSum?.max || state.activeSelectUnselectCard?.max || state.activeSelectTribute?.max || state.activeSelectCard?.max || 1;
    },

    canConfirmActiveSelection(state): boolean {
      if (state.activeSelectUnselectCard) {
        if (state.activeSelectUnselectCard.can_finish && state.selectedTargetIndices.length === 0) return true;
        return state.selectedTargetIndices.length > 0;
      }
      if (state.activeSelectSum) {
        return state.selectedTargetIndices.length > 0;
      }
      const min = state.activeSelectTribute?.min ?? state.activeSelectCard?.min ?? 1;
      const max = state.activeSelectTribute?.max ?? state.activeSelectCard?.max ?? 1;
      return state.selectedTargetIndices.length >= min && state.selectedTargetIndices.length <= max;
    },
  },

  actions: {
    async initCardDatabase(): Promise<void> {
      if (this.isCardsLoaded && this.cardMap.size > 0) return;
      try {
        if (window.deckAPI?.getAllCards) {
          const cards = await window.deckAPI.getAllCards();
          const map = new Map<number, CardDetail>();
          for (const card of cards) {
            map.set(card.id, card);
          }
          this.cardMap = map;
          this.isCardsLoaded = true;
        }
      } catch (err) {
        console.warn('[DuelStore] Failed to load card database:', err);
      }
    },

    getCardDetail(code: number): CardDetail | null {
      if (!code || code <= 0) return null;
      return this.cardMap.get(code) ?? null;
    },

    hydrateFieldCard(card: FieldCard | null): FieldCard | null {
      if (!card) return null;
      const cardId = card.id || `card-${card.code}-${card.controller}-${card.sequence}-${Math.random().toString(36).slice(2, 7)}`;
      if (card.code <= 0) {
        return {
          ...card,
          id: cardId,
        };
      }
      const detail = this.getCardDetail(card.code);
      if (!detail) {
        return {
          ...card,
          id: cardId,
        };
      }
      return {
        ...card,
        id: cardId,
        name: card.name && card.name !== 'Card' && !card.name.startsWith('[Card #') ? card.name : detail.name,
        atk: card.atk !== undefined ? card.atk : (detail.isMonster ? detail.atk : undefined),
        def: card.def !== undefined ? card.def : (detail.isMonster ? detail.def : undefined),
        level: card.level !== undefined ? card.level : (detail.isMonster ? detail.level : undefined),
        attribute: card.attribute || detail.attributeName,
        race: card.race || detail.raceName,
        description: card.description || detail.desc,
      };
    },

    hydratePlayerField(pf: PlayerFieldState): PlayerFieldState {
      return {
        ...pf,
        hand: pf.hand.map((c) => this.hydrateFieldCard(c)!),
        monsterZones: pf.monsterZones.map((c) => this.hydrateFieldCard(c)),
        spellTrapZones: pf.spellTrapZones.map((c) => this.hydrateFieldCard(c)),
        fieldZone: this.hydrateFieldCard(pf.fieldZone),
        graveyard: pf.graveyard.map((c) => this.hydrateFieldCard(c)!),
        banished: pf.banished.map((c) => this.hydrateFieldCard(c)!),
        extraDeck: pf.extraDeck.map((c) => this.hydrateFieldCard(c)!),
      };
    },

    /**
     * Initializes match configuration from Settings and DeckEdit.
     */
    async setupMatch(
      customOpponent?: CharacterData,
      customOpponentDeck?: CharacterDeckData,
      customUserDeck?: CustomDeck,
    ): Promise<void> {
      await this.initCardDatabase();
      const settingsStore = useSettingsStore();
      const deckEditStore = useDeckEditStore();

      if (!settingsStore.isInitialized) {
        await settingsStore.initializeSettings();
      }

      // 1. Resolve Opponent Character
      let opponent = customOpponent || settingsStore.selectedCharacter;
      if (!opponent && settingsStore.characters.length > 0) {
        opponent = settingsStore.characters[0];
      }
      this.selectedOpponent = opponent || null;

      // 2. Resolve Opponent Deck
      if (customOpponentDeck) {
        this.selectedOpponentDeck = customOpponentDeck;
        this.selectedOpponentDeckIndex = 0;
      } else if (opponent && opponent.decks.length > 0) {
        const idx = Math.floor(Math.random() * opponent.decks.length);
        this.selectedOpponentDeck = opponent.decks[idx];
        this.selectedOpponentDeckIndex = idx;
      } else {
        this.selectedOpponentDeck = null;
        this.selectedOpponentDeckIndex = 0;
      }

      // 3. Resolve User Deck
      if (customUserDeck) {
        this.selectedUserDeck = customUserDeck;
      } else {
        if (!deckEditStore.isLoaded) {
          await deckEditStore.initStore();
        }
        if (deckEditStore.activeDeck && deckEditStore.activeDeck.main.length >= 40) {
          this.selectedUserDeck = deckEditStore.activeDeck;
        } else if (deckEditStore.customDecks.length > 0 && deckEditStore.customDecks[0].main.length >= 40) {
          this.selectedUserDeck = deckEditStore.customDecks[0];
        } else {
          this.selectedUserDeck = {
            id: 'starter-yugi',
            name: 'Yugi — Dark Magician Beatdown',
            main: [...DEFAULT_USER_MAIN_DECK],
            extra: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
      }

      this.userChoice = null;
      this.coinResult = null;
      this.coinWinner = null;
      this.startingPlayer = 'user';
      this.userPlayerId = 0;
      this.opponentPlayerId = 1;
      this.isMatchPrepared = true;
    },

    /**
     * Resolves coin toss outcome and assigns starting player / player IDs.
     */
    resolveCoinToss(choice: CoinChoice, outcome: CoinChoice): void {
      this.userChoice = choice;
      this.coinResult = outcome;

      if (choice === outcome) {
        this.coinWinner = 'user';
        this.startingPlayer = 'user';
        this.userPlayerId = 0;
        this.opponentPlayerId = 1;
      } else {
        this.coinWinner = 'opponent';
        this.startingPlayer = 'opponent';
        this.userPlayerId = 1;
        this.opponentPlayerId = 0;
      }
    },

    /**
     * Starts the prepared duel via IPC with starting-player-ordered decks.
     */
    async startPreparedDuel(): Promise<boolean> {
      if (!this.selectedOpponent || !this.selectedOpponentDeck) {
        await this.setupMatch();
      } else if (this.selectedOpponent && this.selectedOpponent.decks.length > 0) {
        // AI-Opponent starts with a random deck of the 3 decks that character has
        const idx = Math.floor(Math.random() * this.selectedOpponent.decks.length);
        this.selectedOpponentDeck = this.selectedOpponent.decks[idx];
        this.selectedOpponentDeckIndex = idx;
      }

      // Drawing must be totally random for both players from turn 1
      const userMainCards = shuffleArray(
        this.selectedUserDeck && this.selectedUserDeck.main.length >= 40
          ? this.selectedUserDeck.main
          : DEFAULT_USER_MAIN_DECK,
      );

      const userExtraCards =
        this.selectedUserDeck && this.selectedUserDeck.extra && this.selectedUserDeck.extra.length > 0
          ? this.selectedUserDeck.extra
          : DEFAULT_USER_EXTRA_DECK;

      const opponentMainCards = shuffleArray(
        this.selectedOpponentDeck && this.selectedOpponentDeck.mainCards.length >= 40
          ? this.selectedOpponentDeck.mainCards
          : DEFAULT_USER_MAIN_DECK,
      );

      const opponentExtraCards =
        this.selectedOpponentDeck && this.selectedOpponentDeck.extraCards
          ? this.selectedOpponentDeck.extraCards
          : [];

      let p0Deck: number[];
      let p1Deck: number[];
      let p0ExtraDeck: number[];
      let p1ExtraDeck: number[];
      let humanPlayerId: number;

      if (this.startingPlayer === 'user') {
        p0Deck = userMainCards;
        p1Deck = opponentMainCards;
        p0ExtraDeck = userExtraCards;
        p1ExtraDeck = opponentExtraCards;
        humanPlayerId = 0;
      } else {
        p0Deck = opponentMainCards;
        p1Deck = userMainCards;
        p0ExtraDeck = opponentExtraCards;
        p1ExtraDeck = userExtraCards;
        humanPlayerId = 1;
      }

      this.clearPrompts();
      this.boardState = {
        userField: createEmptyPlayerField(this.userPlayerId, 'You'),
        opponentField: createEmptyPlayerField(this.opponentPlayerId, this.opponentName),
        extraMonsterZones: [null, null],
        turnNumber: 1,
        currentPhase: 'DP',
        activePrompt: null,
        phaseGuideText: '',
        winner: null,
        winReason: null,
      };

      if (this.selectedOpponent) {
        this.boardState.opponentField.name = this.selectedOpponent.name;
        this.boardState.opponentField.title = this.selectedOpponent.title;
        this.boardState.opponentField.series = this.selectedOpponent.series;
        this.boardState.opponentField.characterId = this.selectedOpponent.id;
      }

      if (window.duelAPI) {
        try {
          const p0Plain = Array.from(p0Deck).map((c) => Number(c));
          const p1Plain = Array.from(p1Deck).map((c) => Number(c));
          const p0ExtraPlain = Array.from(p0ExtraDeck).map((c) => Number(c));
          const p1ExtraPlain = Array.from(p1ExtraDeck).map((c) => Number(c));

          const success = await window.duelAPI.newDuel({
            player0Deck: p0Plain,
            player1Deck: p1Plain,
            player0ExtraDeck: p0ExtraPlain,
            player1ExtraDeck: p1ExtraPlain,
            startingLP: 8000,
            startingDrawCount: 5,
            drawCountPerTurn: 1,
            autoPlay: false,
            humanPlayerId: Number(humanPlayerId),
            aiCharacterId: this.selectedOpponent?.id,
            aiDeckArchetype: this.selectedOpponentDeck?.archetype,
          });
          this.isDuelActive = success;
          return success;
        } catch (err) {
          console.error('[DuelStore] Failed starting prepared duel:', err);
          useUIStore().triggerCrashError(
            err instanceof Error ? err : new Error(String(err)),
            'Duel Initialization Error',
          );
          return false;
        }
      }

      this.isDuelActive = true;
      return true;
    },

    /**
     * Fetches fresh board state snapshot from main process.
     * Preserves existing card IDs where possible so Vue's TransitionGroup
     * does not treat unchanged cards as brand-new DOM elements (which would
     * trigger simultaneous enter animations for every card on screen).
     */
    async fetchBoardState(): Promise<void> {
      if (window.duelAPI) {
        await this.initCardDatabase();
        try {
          const snapshot = await window.duelAPI.getBoardState();
          if (snapshot) {
            const newUserField = this.hydratePlayerField(snapshot.userField);
            const newOpponentField = this.hydratePlayerField(snapshot.opponentField);

            // Transfer stable card IDs from current state → new state for matching cards
            // so Vue's v-for :key doesn't see them as new elements (prevents unwanted
            // enter-animations on re-sync).
            this.mergePreservingCardIds(this.boardState.userField, newUserField);
            this.mergePreservingCardIds(this.boardState.opponentField, newOpponentField);

            this.boardState.userField = newUserField;
            this.boardState.opponentField = newOpponentField;
            this.boardState.turnNumber = snapshot.turnNumber;
            this.boardState.currentPhase = snapshot.currentPhase;
            this.boardState.winner = snapshot.winner;
            this.boardState.winReason = snapshot.winReason;

            if (this.selectedOpponent) {
              this.boardState.opponentField.name = this.selectedOpponent.name;
              this.boardState.opponentField.title = this.selectedOpponent.title;
              this.boardState.opponentField.series = this.selectedOpponent.series;
              this.boardState.opponentField.characterId = this.selectedOpponent.id;
            }

            this.enrichDynamicStatsOnBoard();
          }
        } catch (err) {
          console.error('[DuelStore] Failed fetching board state:', err);
          useUIStore().triggerCrashError(
            err instanceof Error ? err : new Error(String(err)),
            'Board State Synchronization Error',
          );
        }
      }
    },

    /**
     * Transfers card IDs from an existing player field onto a freshly-hydrated one.
     *
     * Matching rules (by zone):
     *   - monsterZones / spellTrapZones / fieldZone → matched by sequence index
     *   - hand  → user hand matched by card code; AI hand matched by index (all code=0)
     *   - graveyard / banished / extraDeck → matched by code
     */
    mergePreservingCardIds(existing: PlayerFieldState, incoming: PlayerFieldState): void {
      // Zone arrays: stable 1-to-1 by index
      for (let i = 0; i < 5; i++) {
        const ex = existing.monsterZones[i];
        const inc = incoming.monsterZones[i];
        if (ex && inc) inc.id = ex.id;
      }
      for (let i = 0; i < 5; i++) {
        const ex = existing.spellTrapZones[i];
        const inc = incoming.spellTrapZones[i];
        if (ex && inc) inc.id = ex.id;
      }
      if (existing.fieldZone && incoming.fieldZone) {
        incoming.fieldZone.id = existing.fieldZone.id;
      }

      // Hand: match by code where revealed; fall back to index position
      const exHand = [...existing.hand];
      for (const inc of incoming.hand) {
        let idx = -1;
        if (inc.code > 0) {
          idx = exHand.findIndex((c) => c && c.code === inc.code);
        }
        if (idx < 0) {
          // code=0 (AI hand) or no code match → match by position
          idx = exHand.findIndex((c) => c != null);
        }
        if (idx >= 0) {
          inc.id = exHand[idx].id;
          exHand[idx] = null as any; // consumed
        }
      }

      // GY / banished / extra: match by code
      const matchByCode = (exArr: FieldCard[], incArr: FieldCard[]) => {
        const pool = [...exArr];
        for (const inc of incArr) {
          const idx = inc.code > 0 ? pool.findIndex((c) => c && c.code === inc.code) : -1;
          if (idx >= 0) {
            inc.id = pool[idx].id;
            pool[idx] = null as any;
          }
        }
      };
      matchByCode(existing.graveyard, incoming.graveyard);
      matchByCode(existing.banished, incoming.banished);
      matchByCode(existing.extraDeck, incoming.extraDeck);
    },

    /**
     * Adds exactly one card from a DRAW event to the player's hand.
     * Used by DuelView to animate multi-card draws one at a time, with each
     * card landing in hand before the next one starts flying.
     * Mirrors the handleEngineEvent DRAW branch, but for a single card index.
     */
    addSingleDrawnCard(event: DuelEventPayload, cardIndex: number): void {
      const p = (event as any).player as 0 | 1;
      const pf = p === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
      const drawnCards: any[] = (event as any).drawnCards || (event as any).drawn || [];

      // Decrement deck count by 1 for this single card
      pf.deckCount = Math.max(0, pf.deckCount - 1);

      if (drawnCards.length > 0 && cardIndex < drawnCards.length) {
        const d = drawnCards[cardIndex];
        const code = p === this.userPlayerId ? (d?.code || 0) : 0;
        const detail = code > 0 ? this.cardMap.get(code) : null;
        const card: FieldCard = {
          id: `hand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name: detail?.name || d?.cardName || d?.name || 'Card',
          controller: p,
          location: 'hand',
          sequence: pf.hand.length,
          position: p === this.userPlayerId ? 'faceup_spell' : 'facedown_spell',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
          statuses: [],
        };
        pf.hand.push(card);
      }
      // If drawnCards is empty (AI draw without card details), only deckCount
      // was decremented above — matches original handleEngineEvent behavior.
    },

    enrichDynamicStatsOnBoard(): void {
      const uPf = this.boardState.userField;
      const oPf = this.boardState.opponentField;
      for (const card of uPf.monsterZones) {
        if (!card || card.code <= 0) continue;
        if (card.code === 10000020) {
          card.atk = uPf.hand.length * 1000;
          card.def = uPf.hand.length * 1000;
        } else if (card.code === 98777992) {
          card.atk = uPf.hand.length * 600;
          card.def = uPf.hand.length * 600;
        } else if (card.code === 36584821) {
          const totalBanished = uPf.banished.length + oPf.banished.length;
          card.atk = totalBanished * 400;
          card.def = totalBanished * 400;
        } else if (card.code === 36021814) {
          const servCodes = [32274490, 36021814, 16638212, 78636495];
          const count = uPf.graveyard.filter((c) => servCodes.includes(c.code)).length;
          card.atk = count * 1000;
          card.def = 0;
        }
      }
      for (const card of oPf.monsterZones) {
        if (!card || card.code <= 0) continue;
        if (card.code === 10000020) {
          card.atk = oPf.hand.length * 1000;
          card.def = oPf.hand.length * 1000;
        } else if (card.code === 98777992) {
          card.atk = oPf.hand.length * 600;
          card.def = oPf.hand.length * 600;
        } else if (card.code === 36584821) {
          const totalBanished = uPf.banished.length + oPf.banished.length;
          card.atk = totalBanished * 400;
          card.def = totalBanished * 400;
        } else if (card.code === 36021814) {
          const servCodes = [32274490, 36021814, 16638212, 78636495];
          const count = oPf.graveyard.filter((c) => servCodes.includes(c.code)).length;
          card.atk = count * 1000;
          card.def = 0;
        }
      }
    },

    clearPrompts(): void {
      this.activeIdleCmd = null;
      this.activeBattleCmd = null;
      this.activeSelectCard = null;
      this.activeSelectChain = null;
      this.activeSelectPosition = null;
      this.activeSelectEffectYn = null;
      this.activeSelectOption = null;
      this.activeSelectPlace = null;
      this.activeSelectTribute = null;
      this.activeSelectSum = null;
      this.activeSelectUnselectCard = null;
      this.activeAnnounceCard = null;
      this.activeAnnounceRace = null;
      this.activeAnnounceAttrib = null;
      this.activeAnnounceNumber = null;
      this.selectedTargetIndices = [];
      this.isPromptWaiting = false;
      this.isCardSelectionModalOpen = false;
    },

    applyCardMoveToBoard(moveEvt: {
      code?: number;
      cardName?: string;
      controller?: number;
      fromLocation?: number;
      fromSequence?: number;
      toLocation?: number;
      toSequence?: number;
      position?: number;
      reason?: number;
    }): void {
      const code = moveEvt.code ?? 0;
      const fromLoc = moveEvt.fromLocation ?? 0;
      const fromSeq = moveEvt.fromSequence ?? 0;
      const toLoc = moveEvt.toLocation ?? 0;
      const toSeq = moveEvt.toSequence ?? 0;
      const pos = moveEvt.position ?? 1;
      const controller = (moveEvt.controller ?? 0) as 0 | 1;

      if (fromLoc === toLoc && fromSeq === toSeq) return;

      const getPf = (c: 0 | 1) => (c === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField);
      // Issue 3: For cross-controller moves (e.g. Monster Reborn takes from opponent's GY),
      // the source and destination can belong to different players.
      // The MOVE event's `controller` is always the TO-controller (who gets the card).
      // The FROM-controller is available in event.raw.from.controller (raw OCG message).
      const fromController = ((moveEvt as any).raw?.from?.controller ?? controller) as 0 | 1;
      const fromPf = getPf(fromController);
      const toPf = getPf(controller);

      let card: FieldCard | null = null;

      // 1. Remove from source
      if (fromLoc === 2) {
        // Hand
        let idx = -1;
        if (controller === this.userPlayerId && code > 0) {
          idx = fromPf.hand.findIndex((c) => c && c.code === code);
        }
        if (idx < 0) {
          idx = fromSeq >= 0 && fromSeq < fromPf.hand.length ? fromSeq : (fromPf.hand.length - 1);
        }
        if (idx >= 0 && idx < fromPf.hand.length) {
          card = fromPf.hand.splice(idx, 1)[0];
        }
        for (let i = 0; i < fromPf.hand.length; i++) {
          if (fromPf.hand[i]) fromPf.hand[i].sequence = i;
        }
      } else if (fromLoc === 4) {
        // Monster Zone
        card = fromPf.monsterZones[fromSeq] ?? null;
        fromPf.monsterZones[fromSeq] = null;
      } else if (fromLoc === 8) {
        // Spell/Trap Zone or Field Zone
        if (fromSeq === 5) {
          card = fromPf.fieldZone;
          fromPf.fieldZone = null;
        } else {
          card = fromPf.spellTrapZones[fromSeq] ?? null;
          fromPf.spellTrapZones[fromSeq] = null;
        }
      } else if (fromLoc === 16) {
        // Graveyard
        const idx = code > 0 ? fromPf.graveyard.findIndex((c) => c && c.code === code) : 0;
        if (idx >= 0 && idx < fromPf.graveyard.length) {
          card = fromPf.graveyard.splice(idx, 1)[0];
        }
      } else if (fromLoc === 32) {
        // Banished
        const idx = code > 0 ? fromPf.banished.findIndex((c) => c && c.code === code) : 0;
        if (idx >= 0 && idx < fromPf.banished.length) {
          card = fromPf.banished.splice(idx, 1)[0];
        }
      } else if (fromLoc === 64) {
        // Extra Deck
        const idx = code > 0 ? fromPf.extraDeck.findIndex((c) => c && c.code === code) : 0;
        if (idx >= 0 && idx < fromPf.extraDeck.length) {
          card = fromPf.extraDeck.splice(idx, 1)[0];
        }
        fromPf.extraDeckCount = fromPf.extraDeck.length;
      } else if (fromLoc === 1) {
        // Deck
        fromPf.deckCount = Math.max(0, fromPf.deckCount - 1);
      }

      // 2. Resolve card detail
      const finalCode = code > 0 ? code : (card?.code ?? 0);
      const detail = finalCode > 0 ? this.cardMap.get(finalCode) : null;
      const cardName = moveEvt.cardName || detail?.name || card?.name || 'Card';

      if (!card) {
        card = {
          id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code: finalCode,
          name: cardName,
          controller,
          location: 'monster',
          sequence: toSeq,
          position: 'faceup_attack',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
          statuses: [],
        };
      } else {
        card.code = finalCode;
        card.name = cardName;
        card.controller = controller;
        if (detail) {
          if (detail.isMonster) {
            card.atk = detail.atk;
            card.def = detail.def;
            card.level = detail.level;
          }
          card.attribute = detail.attributeName;
          card.race = detail.raceName;
          card.description = detail.desc;
        }
      }

      // 3. Add to destination
      if (toLoc === 4) {
        // Monster Zone
        let pState: CardPositionState = 'faceup_attack';
        if ((pos & 0x1) !== 0) pState = 'faceup_attack';
        else if ((pos & 0x4) !== 0) pState = 'faceup_defense';
        else if ((pos & 0x8) !== 0) pState = 'facedown_defense';
        card.location = 'monster';
        card.sequence = toSeq;
        card.position = pState;
        toPf.monsterZones[toSeq] = card;
      } else if (toLoc === 8) {
        // Spell Zone
        if (toSeq === 5) {
          card.location = 'field';
          card.sequence = 0;
          card.position = 'faceup_attack'; // field zone renders upright
          toPf.fieldZone = card;
        } else {
          const isFaceup = (pos & 0x5) !== 0;
          card.location = 'spell-trap';
          card.sequence = toSeq;
          // Use 'faceup_attack' (upright) for face-up cards — this matches what
          // hydratePlayerField returns from the engine snapshot, preventing the
          // brief 90° rotation flash that occurred when incremental state used
          // 'faceup_spell' (sideways) but fetchBoardState later applied 'faceup_attack'.
          card.position = isFaceup ? 'faceup_attack' : 'facedown_spell';
          toPf.spellTrapZones[toSeq] = card;
        }
      } else if (toLoc === 16) {
        // Graveyard
        card.location = 'graveyard';
        card.position = 'faceup_spell';
        card.sequence = toPf.graveyard.length;
        toPf.graveyard.unshift(card);
      } else if (toLoc === 32) {
        // Banished
        card.location = 'banished';
        card.position = 'faceup_spell';
        card.sequence = toPf.banished.length;
        toPf.banished.unshift(card);
      } else if (toLoc === 2) {
        // Hand
        card.location = 'hand';
        card.sequence = toPf.hand.length;
        card.position = controller === this.userPlayerId ? 'faceup_spell' : 'facedown_spell';
        if (controller !== this.userPlayerId) card.code = 0;
        toPf.hand.push(card);
        for (let i = 0; i < toPf.hand.length; i++) {
          if (toPf.hand[i]) toPf.hand[i].sequence = i;
        }
      } else if (toLoc === 1) {
        // Deck
        toPf.deckCount++;
      } else if (toLoc === 64) {
        // Extra Deck
        card.location = 'extra-deck';
        card.position = 'facedown_spell';
        toPf.extraDeck.unshift(card);
        toPf.extraDeckCount = toPf.extraDeck.length;
      }
    },

    /**
     * Handles live duel event emitted from engine.
     */
    async handleEngineEvent(event: DuelEventPayload): Promise<void> {
      if (event.turn !== undefined) {
        this.boardState.turnNumber = event.turn;
      }
      if (event.phase !== undefined) {
        this.boardState.currentPhase = (event.phase as DuelBoardState['currentPhase']) || 'M1';
      }
      if (event.type === 'NEW_TURN' && event.player !== undefined) {
        const turnPlayer = event.player as 0 | 1;
        this.boardState.userField.isTurn = turnPlayer === this.userPlayerId;
        this.boardState.opponentField.isTurn = turnPlayer !== this.userPlayerId;
      }
      if (event.type === 'WIN') {
        this.boardState.winner = (event.player as 0 | 1) ?? null;
        this.boardState.winReason = event.reason ?? null;
        this.clearPrompts();
        await this.fetchBoardState();
        return;
      }

      // Synchronize live combat stats and levels directly from engine
      if (event.fieldStats && Array.isArray(event.fieldStats)) {
        for (const s of event.fieldStats) {
          const pf = s.controller === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
          const card = pf.monsterZones[s.sequence];
          if (card) {
            if (typeof s.atk === 'number') card.atk = s.atk;
            if (typeof s.def === 'number') card.def = s.def;
            if (typeof s.level === 'number') card.level = s.level;
            if (typeof s.baseAtk === 'number') card.baseAtk = s.baseAtk;
            if (typeof s.baseDef === 'number') card.baseDef = s.baseDef;
          }
        }
      }

      // Incremental board state updates for non-prompt events
      if (event.type === 'MOVE') {
        this.applyCardMoveToBoard(event as any);
      } else if (event.type === 'SHUFFLE_HAND' && event.player !== undefined) {
        const p = event.player as 0 | 1;
        const pf = p === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
        const newCodes = (event as any).cards as number[];
        if (newCodes && newCodes.length > 0 && p === this.userPlayerId) {
          const remaining = [...pf.hand];
          const newHand: FieldCard[] = [];
          for (const code of newCodes) {
            const idx = remaining.findIndex((c) => c && c.code === code);
            if (idx >= 0) {
              newHand.push(remaining.splice(idx, 1)[0]);
            } else if (remaining.length > 0) {
              newHand.push(remaining.shift()!);
            }
          }
          while (remaining.length > 0) {
            newHand.push(remaining.shift()!);
          }
          for (let i = 0; i < newHand.length; i++) {
            newHand[i].sequence = i;
          }
          pf.hand = newHand;
        } else {
          for (let i = 0; i < pf.hand.length; i++) {
            if (pf.hand[i]) pf.hand[i].sequence = i;
          }
        }
      } else if (event.type === 'DRAW' && event.player !== undefined) {
        const p = event.player as 0 | 1;
        const pf = p === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
        const drawnCards = (event as any).drawnCards || (event as any).drawn || [];
        const count = drawnCards.length || 1;
        pf.deckCount = Math.max(0, pf.deckCount - count);
        if (drawnCards.length > 0) {
          for (const d of drawnCards) {
            const code = p === this.userPlayerId ? (d.code || 0) : 0;
            const detail = code > 0 ? this.cardMap.get(code) : null;
            const card: FieldCard = {
              id: `hand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              code,
              name: detail?.name || d.cardName || 'Card',
              controller: p,
              location: 'hand',
              sequence: pf.hand.length,
              position: p === this.userPlayerId ? 'faceup_spell' : 'facedown_spell',
              atk: detail?.isMonster ? detail.atk : undefined,
              def: detail?.isMonster ? detail.def : undefined,
              level: detail?.isMonster ? detail.level : undefined,
              attribute: detail?.attributeName,
              race: detail?.raceName,
              description: detail?.desc,
              statuses: [],
            };
            pf.hand.push(card);
          }
        }
      } else if (event.type === 'POS_CHANGE' || event.type === 'FLIPSUMMONING') {
        const p = (event.controller ?? this.userPlayerId) as 0 | 1;
        const pf = p === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
        const seq = event.sequence ?? 0;
        const card = pf.monsterZones[seq];
        if (card) {
          if (event.code && event.code > 0) {
            card.code = event.code;
            const detail = this.cardMap.get(event.code);
            card.name = detail?.name || event.cardName || card.name;
            if (detail?.isMonster) {
              card.atk = detail.atk;
              card.def = detail.def;
              card.level = detail.level;
              card.attribute = detail.attributeName;
              card.race = detail.raceName;
              card.description = detail.desc;
            }
          }
          if (event.type === 'FLIPSUMMONING' || (event.position && (event.position & 0x1) !== 0)) {
            card.position = 'faceup_attack';
          } else if (event.position && (event.position & 0x4) !== 0) {
            card.position = 'faceup_defense';
          } else if (event.position && (event.position & 0x8) !== 0) {
            card.position = 'facedown_defense';
          }
        }
      } else if ((event.type === 'DAMAGE' || event.type === 'PAY_LPCOST') && event.player !== undefined) {
        const p = event.player as 0 | 1;
        const pf = p === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
        const amount = ((event as any).amount ?? (event as any).cost ?? 0) as number;
        pf.currentLp = Math.max(0, pf.currentLp - amount);
      } else if (event.type === 'RECOVER' && event.player !== undefined && (event as any).amount !== undefined) {
        const p = event.player as 0 | 1;
        const pf = p === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
        pf.currentLp += (event as any).amount as number;
      } else if (event.type === 'LPUPDATE' && event.player !== undefined && (event as any).lp !== undefined) {
        const p = event.player as 0 | 1;
        const pf = p === this.userPlayerId ? this.boardState.userField : this.boardState.opponentField;
        pf.currentLp = (event as any).lp as number;
      } else if (event.type === 'CHAIN_END' || event.type === 'NEW_TURN' || event.type === 'NEW_PHASE') {
        this.lastChainedCode = null;
      }

      // If this event is a prompt for the human player:
      if (event.isPrompt && event.promptPlayer === this.userPlayerId) {
        this.clearPrompts();
        this.isPromptWaiting = true;

        if (event.promptType === 'SELECT_IDLECMD') {
          this.activeIdleCmd = event.promptData as SelectIdleCmdPayload;
        } else if (event.promptType === 'SELECT_BATTLECMD') {
          this.activeBattleCmd = event.promptData as SelectBattleCmdPayload;
        } else if (event.promptType === 'SELECT_CARD') {
          const cardPayload = event.promptData as SelectCardPayload;
          this.activeSelectCard = cardPayload;
          // Open center modal ONLY if at least one selectable card is in a hidden zone (Deck, Graveyard, Banished, Extra Deck)
          const isHiddenLoc = (loc?: number) => {
            if (!loc) return false;
            return (
              loc === 1 ||
              loc === 16 ||
              loc === 32 ||
              loc === 64 ||
              (loc & 1) !== 0 ||
              (loc & 16) !== 0 ||
              (loc & 32) !== 0 ||
              (loc & 64) !== 0
            );
          };
          const hasHiddenLocations = cardPayload.selects?.some((s) => isHiddenLoc(s.location));
          this.isCardSelectionModalOpen = Boolean(hasHiddenLocations);
        } else if (event.promptType === 'SELECT_UNSELECT_CARD') {
          const unselectPayload = event.promptData as SelectUnselectCardPayload;
          this.activeSelectUnselectCard = unselectPayload;
          const isHiddenLoc = (loc?: number) => {
            if (!loc) return false;
            return (
              loc === 1 ||
              loc === 16 ||
              loc === 32 ||
              loc === 64 ||
              (loc & 1) !== 0 ||
              (loc & 16) !== 0 ||
              (loc & 32) !== 0 ||
              (loc & 64) !== 0
            );
          };
          const hasHiddenLocations =
            unselectPayload.selects?.some((s) => isHiddenLoc(s.location)) ||
            unselectPayload.unselects?.some((s) => isHiddenLoc(s.location));
          this.isCardSelectionModalOpen = Boolean(hasHiddenLocations);
        } else if (event.promptType === 'SELECT_CHAIN') {
          const chainPayload = event.promptData as SelectChainPayload;
          let availableSelects = chainPayload.selects || [];

          // Deduplicate continuous trap self-chain loops (e.g. Ultimate Offering chaining into itself)
          if (!chainPayload.forced && this.lastChainedCode && availableSelects.length > 0) {
            const filtered = availableSelects.filter((s) => s.code !== this.lastChainedCode);
            if (filtered.length === 0) {
              // Only option is redundant self-chain on the same chain link — auto-pass to let chain resolve
              this.isPromptWaiting = false;
              await this.executeSelectChain(null);
              return;
            }
            availableSelects = filtered;
          }

          if (availableSelects.length > 0) {
            this.activeSelectChain = {
              ...chainPayload,
              selects: availableSelects,
            };
          } else if (!chainPayload.forced) {
            // Nothing to chain — auto-pass immediately without showing dialog
            this.isPromptWaiting = false;
            await this.executeSelectChain(null);
            return;
          } else {
            this.activeSelectChain = chainPayload;
          }
        } else if (event.promptType === 'SELECT_POSITION') {
          this.activeSelectPosition = event.promptData as SelectPositionPayload;
        } else if (event.promptType === 'SELECT_EFFECTYN' || event.promptType === 'SELECT_YESNO') {
          this.activeSelectEffectYn = event.promptData as SelectEffectYnPayload;
        } else if (event.promptType === 'SELECT_OPTION') {
          this.activeSelectOption = event.promptData as SelectOptionPayload;
        } else if (event.promptType === 'SELECT_PLACE') {
          this.activeSelectPlace = event.promptData as SelectPlacePayload;
        } else if (event.promptType === 'SELECT_TRIBUTE') {
          const tributePayload = event.promptData as SelectTributePayload;
          this.activeSelectTribute = tributePayload;
          // Tributes on the field or in hand don't need center modal by default
          const isHiddenLoc = (loc?: number) => {
            if (!loc) return false;
            return (
              loc === 1 ||
              loc === 16 ||
              loc === 32 ||
              loc === 64 ||
              (loc & 1) !== 0 ||
              (loc & 16) !== 0 ||
              (loc & 32) !== 0 ||
              (loc & 64) !== 0
            );
          };
          const hasHiddenLocations = tributePayload.selects?.some((s) => isHiddenLoc(s.location));
          this.isCardSelectionModalOpen = Boolean(hasHiddenLocations);
        } else if (event.promptType === 'SELECT_SUM') {
          const sumPayload = event.promptData as SelectSumPayload;
          this.activeSelectSum = sumPayload;
          const isHiddenLoc = (loc?: number) => {
            if (!loc) return false;
            return (
              loc === 1 ||
              loc === 16 ||
              loc === 32 ||
              loc === 64 ||
              (loc & 1) !== 0 ||
              (loc & 16) !== 0 ||
              (loc & 32) !== 0 ||
              (loc & 64) !== 0
            );
          };
          const hasHiddenLocations = sumPayload.selects?.some((s) => isHiddenLoc(s.location));
          this.isCardSelectionModalOpen = Boolean(hasHiddenLocations);
        } else if (event.promptType === 'ANNOUNCE_CARD') {
          this.activeAnnounceCard = event.promptData as AnnounceCardPayload;
        } else if (event.promptType === 'ANNOUNCE_RACE') {
          this.activeAnnounceRace = event.promptData as AnnounceRacePayload;
        } else if (event.promptType === 'ANNOUNCE_ATTRIB') {
          this.activeAnnounceAttrib = event.promptData as AnnounceAttribPayload;
        } else if (event.promptType === 'ANNOUNCE_NUMBER') {
          this.activeAnnounceNumber = event.promptData as AnnounceNumberPayload;
        }

        // Snapshot synchronization is intentionally NOT called here.
        // DuelView's animation queue calls fetchBoardState() explicitly after this
        // task resolves, ensuring it only runs AFTER all preceding animations finish.
      } else if (!event.isPrompt) {
        if (
          event.type === 'NEW_TURN' ||
          event.type === 'NEW_PHASE' ||
          event.type === 'SUMMONED' ||
          event.type === 'SPSUMMONED' ||
          event.type === 'FLIPSUMMONED' ||
          event.type === 'POS_CHANGE' ||
          event.type === 'ATTACK'
        ) {
          this.clearPrompts();
        }
      }
    },

    /**
     * Resolves legal actions available for a card in hand during Idle Phase.
     */
    getLegalActionsForHandCard(card: FieldCard): CardActionOption[] {
      const actions: CardActionOption[] = [];
      if (!this.activeIdleCmd || !this.boardState.userField.isTurn) return actions;

      // 1. Normal Summon (location 2 = Hand)
      const summonIdx = this.activeIdleCmd.summons.findIndex(
        (s) =>
          s.code === card.code &&
          (s.location === undefined || s.location === 2) &&
          (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (summonIdx >= 0) {
        actions.push({ type: 'summon', index: summonIdx, label: 'Normal Summon', icon: '⚔️' });
      }

      // 2. Special Summon
      const spIdx = this.activeIdleCmd.special_summons.findIndex(
        (s) =>
          s.code === card.code &&
          (s.location === undefined || s.location === 2) &&
          (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (spIdx >= 0) {
        actions.push({ type: 'sp_summon', index: spIdx, label: 'Special Summon', icon: '✨' });
      }

      // 3. Set Monster
      const mSetIdx = this.activeIdleCmd.monster_sets.findIndex(
        (s) =>
          s.code === card.code &&
          (s.location === undefined || s.location === 2) &&
          (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (mSetIdx >= 0) {
        actions.push({ type: 'monster_set', index: mSetIdx, label: 'Set Monster', icon: '🛡️' });
      }

      // 4. Set Spell / Trap
      const sSetIdx = this.activeIdleCmd.spell_sets.findIndex(
        (s) =>
          s.code === card.code &&
          (s.location === undefined || s.location === 2) &&
          (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (sSetIdx >= 0) {
        actions.push({ type: 'spell_set', index: sSetIdx, label: 'Set Card', icon: '📜' });
      }

      // 5. Activate Spell from Hand
      const actIdx = this.activeIdleCmd.activates.findIndex(
        (a) =>
          a.code === card.code &&
          (a.location === undefined || a.location === 2) &&
          (a.sequence === card.sequence || a.sequence === undefined),
      );
      if (actIdx >= 0) {
        actions.push({ type: 'activate', index: actIdx, label: 'Activate', icon: '⚡' });
      }

      // Fallback matching: strictly require location 2 (hand)
      if (actions.length === 0) {
        const anySummonIdx = this.activeIdleCmd.summons.findIndex(
          (s) => s.code === card.code && (s.location === undefined || s.location === 2),
        );
        if (anySummonIdx >= 0) {
          actions.push({ type: 'summon', index: anySummonIdx, label: 'Normal Summon', icon: '⚔️' });
        }
        const anySpIdx = this.activeIdleCmd.special_summons.findIndex(
          (s) => s.code === card.code && (s.location === undefined || s.location === 2),
        );
        if (anySpIdx >= 0) {
          actions.push({ type: 'sp_summon', index: anySpIdx, label: 'Special Summon', icon: '✨' });
        }
        const anyMSetIdx = this.activeIdleCmd.monster_sets.findIndex(
          (s) => s.code === card.code && (s.location === undefined || s.location === 2),
        );
        if (anyMSetIdx >= 0) {
          actions.push({ type: 'monster_set', index: anyMSetIdx, label: 'Set Monster', icon: '🛡️' });
        }
        const anySSetIdx = this.activeIdleCmd.spell_sets.findIndex(
          (s) => s.code === card.code && (s.location === undefined || s.location === 2),
        );
        if (anySSetIdx >= 0) {
          actions.push({ type: 'spell_set', index: anySSetIdx, label: 'Set Card', icon: '📜' });
        }
        const anyActIdx = this.activeIdleCmd.activates.findIndex(
          (a) => a.code === card.code && (a.location === undefined || a.location === 2),
        );
        if (anyActIdx >= 0) {
          actions.push({ type: 'activate', index: anyActIdx, label: 'Activate', icon: '⚡' });
        }
      }

      return actions;
    },

    /**
     * Resolves legal actions available for a card on field during Idle or Battle Phase.
     */
    getLegalActionsForFieldCard(card: FieldCard): CardActionOption[] {
      const actions: CardActionOption[] = [];
      if (!this.boardState.userField.isTurn) return actions;

      const isMonsterZone = card.location === 'monster' || card.location === 'extra-monster';
      const isSpellTrapZone = card.location === 'spell-trap';
      const isFieldZone = card.location === 'field';

      // In Main Phase (Idle Command)
      if (this.activeIdleCmd) {
        // 1. Change Position: Strictly for Monsters only (location 4)
        if (isMonsterZone) {
          const posIdx = this.activeIdleCmd.pos_changes.findIndex(
            (p) =>
              (p.location === 4 || p.location === undefined) &&
              (p.sequence === card.sequence || p.sequence === undefined),
          );
          if (posIdx >= 0) {
            actions.push({ type: 'pos_change', index: posIdx, label: 'Change Position', icon: '🔄' });
          }
        }

        // 2. Activate Field Effect: Must match card's exact zone type
        const actIdx = this.activeIdleCmd.activates.findIndex((a) => {
          if (isMonsterZone && a.location !== 4) return false;
          if (isSpellTrapZone && a.location !== 8 && a.location !== undefined) return false;
          if (isFieldZone && a.location !== 256 && a.location !== 8) return false;
          return a.sequence === card.sequence || a.sequence === undefined;
        });
        if (actIdx >= 0) {
          actions.push({ type: 'activate', index: actIdx, label: 'Activate Effect', icon: '⚡' });
        }
      }

      // In Battle Phase (Battle Command)
      if (this.activeBattleCmd) {
        // 1. Declare Attack: Strictly for Monsters only (location 4)
        if (isMonsterZone) {
          const atkIdx = this.activeBattleCmd.attacks.findIndex(
            (a) =>
              (a.location === 4 || a.location === undefined) &&
              (a.sequence === card.sequence || a.sequence === undefined),
          );
          if (atkIdx >= 0) {
            actions.push({ type: 'attack', index: atkIdx, label: 'Declare Attack', icon: '⚔️' });
          }
        }

        // 2. Chain / Quick Effect in Battle: Must match card's exact zone type
        const chainIdx = this.activeBattleCmd.chains.findIndex((c) => {
          if (isMonsterZone && c.location !== 4) return false;
          if (isSpellTrapZone && c.location !== 8 && c.location !== undefined) return false;
          if (isFieldZone && c.location !== 256 && c.location !== 8) return false;
          return c.sequence === card.sequence || c.sequence === undefined;
        });
        if (chainIdx >= 0) {
          actions.push({ type: 'activate', index: chainIdx, label: 'Activate Effect', icon: '⚡' });
        }
      }

      return actions;
    },

    /**
     * Resolves target metadata for a card or stack in any of the 6 locations.
     */
    getTargetInfo(controller: number, location: number, sequence: number): TargetInfo | null {
      const getSafeCardName = (
        item: any,
        owner: 'user' | 'ai',
        loc: number,
        seq: number,
      ): string => {
        if (owner === 'user') return item.cardName || 'Card';

        // If owner is AI (opponent): check if card is face-down / hidden
        const isFacedownMonster =
          loc === 4 &&
          (item.position === 8 ||
            (item.position !== undefined && (item.position & 0x8) !== 0) ||
            this.boardState.opponentField.monsterZones[seq]?.position === 'facedown_defense' ||
            item.code === 0);

        const isFacedownSpell =
          loc === 8 &&
          (item.position === 8 ||
            (item.position !== undefined && (item.position & 0x8) !== 0) ||
            this.boardState.opponentField.spellTrapZones[seq]?.position === 'facedown_spell' ||
            this.boardState.opponentField.spellTrapZones[seq]?.position === 'facedown_defense' ||
            item.code === 0);

        if (isFacedownMonster) return 'Face-down Monster';
        if (isFacedownSpell) return 'Face-down Card';
        if (loc === 2) return 'Card in Hand';
        if (loc === 1) return "Opponent's Deck";
        if (loc === 64) return "Opponent's Extra Deck";
        if (item.code === 0) return 'Face-down Card';

        return item.cardName || 'Card';
      };

      // 1. Check active Tribute prompt
      if (this.activeSelectTribute && this.activeSelectTribute.selects) {
        const selectIndex = this.activeSelectTribute.selects.findIndex(
          (s) => s.controller === controller && (s.location === location || (s.location & location) !== 0) && s.sequence === sequence,
        );
        if (selectIndex >= 0) {
          const item = this.activeSelectTribute.selects[selectIndex];
          const isSelected = this.selectedTargetIndices.includes(selectIndex);
          const owner = controller === this.userPlayerId ? 'user' : 'ai';
          const cardName = getSafeCardName(item, owner, location, sequence);
          return {
            isSelectable: true,
            selectIndex,
            isSelected,
            owner,
            locationType: 'field',
            tooltipText: owner === 'user' ? `Selectable Tribute: Player's Monster (${cardName})` : `Selectable Tribute: Opponent's (${cardName})`,
            isCost: true,
            isTribute: true,
          };
        }
      }

      // 2. Check active Card Selection prompt
      if (this.activeSelectCard && this.activeSelectCard.selects) {
        const selectIndex = this.activeSelectCard.selects.findIndex(
          (s) => s.controller === controller && (s.location === location || (s.location & location) !== 0) && s.sequence === sequence,
        );
        if (selectIndex >= 0) {
          const item = this.activeSelectCard.selects[selectIndex];
          const isSelected = this.selectedTargetIndices.includes(selectIndex);
          const owner = controller === this.userPlayerId ? 'user' : 'ai';
          const cardName = getSafeCardName(item, owner, location, sequence);

          let locType: TargetInfo['locationType'] = 'field';
          if (location === 2) locType = 'hand';
          else if (location === 1) locType = 'deck';
          else if (location === 64) locType = 'extra-deck';
          else if (location === 16) locType = 'graveyard';
          else if (location === 32) locType = 'banished';

          const isCost =
            this.activeSelectCard.selects.every((s) => s.location === 2) &&
            !this.activeSelectCard.isDiscardPrompt &&
            this.activeSelectCard.min > 0;

          let tooltipText = '';
          if (this.activeSelectCard.isDiscardPrompt) {
            tooltipText = `Selectable Discard: Player's Hand Card (${cardName})`;
          } else if (isCost) {
            tooltipText = `Selectable Cost: Player's Hand Card (${cardName})`;
          } else if (locType === 'field') {
            tooltipText = owner === 'user' ? `Selectable Target: Player's Card (${cardName})` : `Selectable Target: Opponent's (${cardName})`;
          } else if (locType === 'graveyard') {
            tooltipText = owner === 'user' ? `Selectable Target: Player's Graveyard (${cardName})` : `Selectable Target: Opponent's Graveyard (${cardName})`;
          } else if (locType === 'banished') {
            tooltipText = owner === 'user' ? `Selectable Target: Player's Banished Card (${cardName})` : `Selectable Target: Opponent's Banished Card (${cardName})`;
          } else if (locType === 'deck') {
            tooltipText = `Selectable Target: Player's Deck (${cardName})`;
          } else if (locType === 'extra-deck') {
            tooltipText = `Selectable Target: Player's Extra Deck (${cardName})`;
          } else {
            tooltipText = `Selectable Target: ${cardName}`;
          }

          return {
            isSelectable: true,
            selectIndex,
            isSelected,
            owner,
            locationType: locType,
            tooltipText,
            isCost,
            isTribute: false,
          };
        }
      }

      // 3. Check active Select/Unselect Card prompt
      if (this.activeSelectUnselectCard && this.activeSelectUnselectCard.selects) {
        const selectIndex = this.activeSelectUnselectCard.selects.findIndex(
          (s) => s.controller === controller && (s.location === location || (s.location & location) !== 0) && s.sequence === sequence,
        );
        if (selectIndex >= 0) {
          const item = this.activeSelectUnselectCard.selects[selectIndex];
          const isSelected = this.selectedTargetIndices.includes(selectIndex);
          const owner = controller === this.userPlayerId ? 'user' : 'ai';
          const cardName = getSafeCardName(item, owner, location, sequence);

          let locType: TargetInfo['locationType'] = 'field';
          if (location === 2) locType = 'hand';
          else if (location === 1) locType = 'deck';
          else if (location === 64) locType = 'extra-deck';
          else if (location === 16) locType = 'graveyard';
          else if (location === 32) locType = 'banished';

          return {
            isSelectable: true,
            selectIndex,
            isSelected,
            owner,
            locationType: locType,
            tooltipText: `Selectable Target: ${cardName}`,
            isCost: false,
            isTribute: false,
          };
        }
      }

      // 4. Check active Select Sum prompt (e.g. Ritual Tributes / Synchro Materials)
      if (this.activeSelectSum && this.activeSelectSum.selects) {
        const selectIndex = this.activeSelectSum.selects.findIndex(
          (s) => s.controller === controller && (s.location === location || (s.location & location) !== 0) && s.sequence === sequence,
        );
        if (selectIndex >= 0) {
          const item = this.activeSelectSum.selects[selectIndex];
          const isSelected = this.selectedTargetIndices.includes(selectIndex);
          const owner = controller === this.userPlayerId ? 'user' : 'ai';
          const cardName = item.cardName || 'Monster';

          let locType: TargetInfo['locationType'] = 'field';
          if (location === 2) locType = 'hand';
          else if (location === 1) locType = 'deck';
          else if (location === 64) locType = 'extra-deck';
          else if (location === 16) locType = 'graveyard';
          else if (location === 32) locType = 'banished';

          return {
            isSelectable: true,
            selectIndex,
            isSelected,
            owner,
            locationType: locType,
            tooltipText: `Selectable Ritual/Level Tribute: ${cardName}`,
            isCost: true,
            isTribute: true,
          };
        }
      }

      return null;
    },

    toggleTargetByIndex(selectIndex: number): void {
      if (this.activeSelectUnselectCard) {
        this.executeSelectUnselectCard(selectIndex);
        return;
      }
      const maxAllowed = this.activeSelectSum?.max || this.activeSelectTribute?.max || this.activeSelectCard?.max || 99;
      const existingPos = this.selectedTargetIndices.indexOf(selectIndex);
      if (existingPos >= 0) {
        this.selectedTargetIndices.splice(existingPos, 1);
      } else {
        if (this.selectedTargetIndices.length < maxAllowed) {
          this.selectedTargetIndices.push(selectIndex);
        } else if (maxAllowed === 1) {
          this.selectedTargetIndices = [selectIndex];
        }
      }
    },

    setTargetIndices(indices: number[]): void {
      this.selectedTargetIndices = [...indices];
    },

    async confirmActiveSelection(): Promise<boolean> {
      if (this.activeSelectUnselectCard) {
        return this.executeSelectUnselectCard(null);
      }
      if (this.activeSelectSum) {
        const indices = [...this.selectedTargetIndices];
        return this.executeSelectSum(indices);
      }
      if (this.activeSelectTribute) {
        const indices = [...this.selectedTargetIndices];
        return this.executeSelectTribute(indices);
      }
      if (this.activeSelectCard) {
        const indices = [...this.selectedTargetIndices];
        return this.executeSelectCard(indices);
      }
      return false;
    },

    async cancelActiveSelection(): Promise<boolean> {
      if (this.activeSelectUnselectCard && this.activeSelectUnselectCard.can_cancel) {
        return this.executeSelectUnselectCard(null);
      }
      if (this.activeSelectCard && this.activeSelectCard.can_cancel) {
        return this.executeSelectCard([]);
      }
      return false;
    },

    // =========================================================================
    // Command Execution Dispatchers (Send response to ocgcore-wasm over IPC)
    // =========================================================================

    async executeNormalSummon(summonIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 0, // SELECT_SUMMON
        index: summonIndex,
      });
    },

    async executeSpecialSummon(spSummonIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 1, // SELECT_SPECIAL_SUMMON
        index: spSummonIndex,
      });
    },

    async executePosChange(posChangeIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 2, // SELECT_POS_CHANGE
        index: posChangeIndex,
      });
    },

    async executeMonsterSet(monsterSetIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 3, // SELECT_MONSTER_SET
        index: monsterSetIndex,
      });
    },

    async executeSpellSet(spellSetIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 4, // SELECT_SPELL_SET
        index: spellSetIndex,
      });
    },

    async executeActivate(activateIndex: number): Promise<boolean> {
      if (this.activeBattleCmd) {
        return this.sendCommand({
          type: 0, // SELECT_BATTLECMD
          action: 0, // SELECT_CHAIN
          index: activateIndex,
        });
      }
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 5, // SELECT_ACTIVATE
        index: activateIndex,
      });
    },

    async executeToBattlePhase(): Promise<boolean> {
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 6, // TO_BP
        index: null,
      });
    },

    async executeToMainPhase2(): Promise<boolean> {
      return this.sendCommand({
        type: 0, // SELECT_BATTLECMD
        action: 2, // TO_M2
        index: null,
      });
    },

    async executeToEndPhase(): Promise<boolean> {
      if (this.activeBattleCmd) {
        return this.sendCommand({
          type: 0, // SELECT_BATTLECMD
          action: 3, // TO_EP
          index: null,
        });
      }
      return this.sendCommand({
        type: 1, // SELECT_IDLECMD
        action: 7, // TO_EP
        index: null,
      });
    },

    openCardSelectionModal(): void {
      this.isCardSelectionModalOpen = true;
    },

    closeCardSelectionModal(): void {
      this.isCardSelectionModalOpen = false;
    },

    toggleCardSelectionModal(): void {
      this.isCardSelectionModalOpen = !this.isCardSelectionModalOpen;
    },

    async executeDeclareAttack(attackIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 0, // SELECT_BATTLECMD
        action: 1, // SELECT_BATTLE
        index: attackIndex,
      });
    },

    async executeSelectCard(selectedIndices: number[]): Promise<boolean> {
      this.isCardSelectionModalOpen = false;
      return this.sendCommand({
        type: 5, // SELECT_CARD
        indicies: selectedIndices,
        cards: selectedIndices,
      });
    },

    async executeSelectUnselectCard(index: number | null): Promise<boolean> {
      if (index === null) {
        this.isCardSelectionModalOpen = false;
      }
      this.selectedTargetIndices = [];
      return this.sendCommand({
        type: 7, // SELECT_UNSELECT_CARD
        index,
      });
    },

    async executeSelectTribute(selectedIndices: number[]): Promise<boolean> {
      this.isCardSelectionModalOpen = false;
      return this.sendCommand({
        type: 12, // SELECT_TRIBUTE
        cards: selectedIndices,
        indicies: selectedIndices,
      });
    },

    async executeSelectSum(selectedIndices: number[]): Promise<boolean> {
      this.isCardSelectionModalOpen = false;
      return this.sendCommand({
        type: 14, // SELECT_SUM
        indicies: selectedIndices,
        cards: selectedIndices,
      });
    },

    async executeSelectPosition(position: number): Promise<boolean> {
      return this.sendCommand({
        type: 11, // SELECT_POSITION
        position,
      });
    },

    async executeSelectChain(chainIndex: number | null): Promise<boolean> {
      if (chainIndex !== null && this.activeSelectChain?.selects?.[chainIndex]) {
        this.lastChainedCode = this.activeSelectChain.selects[chainIndex].code;
      }
      return this.sendCommand({
        type: 8, // SELECT_CHAIN
        index: chainIndex,
      });
    },

    async executeSelectEffectYn(yes: boolean): Promise<boolean> {
      return this.sendCommand({
        type: 2, // SELECT_EFFECTYN
        yes,
      });
    },

    async executeSelectYesNo(yes: boolean): Promise<boolean> {
      return this.sendCommand({
        type: 3, // SELECT_YESNO
        yes,
      });
    },

    async executeSelectOption(optionIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 4, // SELECT_OPTION
        index: optionIndex,
      });
    },

    async executeAnnounceCard(code: number): Promise<boolean> {
      return this.sendCommand({
        type: 18, // ANNOUNCE_CARD
        card: code,
      });
    },

    async executeAnnounceRace(races: bigint[] | number[]): Promise<boolean> {
      return this.sendCommand({
        type: 16, // ANNOUNCE_RACE
        races,
      });
    },

    async executeAnnounceAttrib(attributes: number[]): Promise<boolean> {
      return this.sendCommand({
        type: 17, // ANNOUNCE_ATTRIB
        attributes,
      });
    },

    async executeAnnounceNumber(value: number): Promise<boolean> {
      return this.sendCommand({
        type: 19, // ANNOUNCE_NUMBER
        value,
      });
    },

    async sendCommand(command: unknown): Promise<boolean> {
      this.clearPrompts();
      if (window.duelAPI) {
        try {
          const plainCommand = JSON.parse(JSON.stringify(command));
          const res = await window.duelAPI.sendCommand(plainCommand);
          // NOTE: Do NOT call fetchBoardState() here. The engine will emit incremental
          // events (MOVE, DRAW, etc.) that update the board state through the animation
          // queue. A full board sync happens after the prompt task in DuelView's queue,
          // ensuring it only runs AFTER all preceding animations have completed.
          return res;
        } catch (err) {
          console.error('[DuelStore] Failed sending command:', err);
          return false;
        }
      }
      return false;
    },

    handlePlayVideo(payload: import('../../shared/types/duel.js').CardVideoPayload): void {
      this.isVideoPlaying = true;
      this.activeVideoPayload = payload;
    },

    async finishVideo(): Promise<void> {
      this.isVideoPlaying = false;
      this.activeVideoPayload = null;
      if (window.duelAPI?.notifyVideoFinished) {
        try {
          await window.duelAPI.notifyVideoFinished();
        } catch (err) {
          console.warn('[DuelStore] Error calling notifyVideoFinished:', err);
        }
      }
    },

    resetDuel(): void {
      this.clearPrompts();
      this.boardState = {
        userField: createEmptyPlayerField(this.userPlayerId, 'You'),
        opponentField: createEmptyPlayerField(this.opponentPlayerId, this.opponentName),
        extraMonsterZones: [null, null],
        turnNumber: 1,
        currentPhase: 'DP',
        activePrompt: null,
        phaseGuideText: '',
        winner: null,
        winReason: null,
      };
      this.isDuelActive = false;
    },
  },
});


