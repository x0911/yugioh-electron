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
} from '../../shared/types/duel.js';
import type {
  DuelBoardState,
  FieldCard,
  PlayerFieldState,
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
  79759861, 79759861, 79759861, // Tribute to The Doomed x3 (Cost discard + target destroy on field)
  77414702, 77414702, // Magic Jammer x2 (Cost discard + trap chain)
  55144522, 55144522, 55144522, // Pot of Greed x3
  53129443, 53129443, // Dark Hole x2
  12580477, // Raigeki x1
  4206964, 4206964, 4206964, // Trap Hole x3
  44095762, 44095762, // Mirror Force x2
  24068492, 24068492, // Just Desserts x2
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

  // Card Database Cache
  cardMap: Map<number, CardDetail>;
  isCardsLoaded: boolean;

  // Active Target Selections
  selectedTargetIndices: number[];

  isPromptWaiting: boolean;
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
    cardMap: new Map(),
    isCardsLoaded: false,
    selectedTargetIndices: [],

    isPromptWaiting: false,
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

    hasActiveSelectionPrompt(state): boolean {
      return !!state.activeSelectCard || !!state.activeSelectTribute;
    },

    activeSelectionMin(state): number {
      return state.activeSelectTribute?.min ?? state.activeSelectCard?.min ?? 1;
    },

    activeSelectionMax(state): number {
      return state.activeSelectTribute?.max ?? state.activeSelectCard?.max ?? 1;
    },

    canConfirmActiveSelection(state): boolean {
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
      if (card.code <= 0) return card;
      const detail = this.getCardDetail(card.code);
      if (!detail) return card;
      return {
        ...card,
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
          });
          this.isDuelActive = success;
          if (success) {
            // Deal opening hand cards one-by-one with staggered animation
            await this.dealOpeningHand();
          }
          return success;
        } catch (err) {
          console.error('[DuelStore] Failed starting prepared duel:', err);
          return false;
        }
      }

      this.isDuelActive = true;
      return true;
    },

    /**
     * Deals the opening hand one card at a time with a staggered animation delay.
     * Fetches the full snapshot but reveals user hand cards incrementally so players
     * can see each card being "dealt" from the deck, like in real card games.
     */
    async dealOpeningHand(): Promise<void> {
      if (!window.duelAPI) return;
      await this.initCardDatabase();
      try {
        const rawSnapshot = await window.duelAPI.getBoardState();
        if (!rawSnapshot) return;

        const snapshot = {
          ...rawSnapshot,
          userField: this.hydratePlayerField(rawSnapshot.userField),
          opponentField: this.hydratePlayerField(rawSnapshot.opponentField),
        };

        // Apply non-hand fields immediately (LP, phase, field zones, opponent)
        this.boardState.turnNumber = snapshot.turnNumber;
        this.boardState.currentPhase = snapshot.currentPhase;
        this.boardState.winner = snapshot.winner;
        this.boardState.winReason = snapshot.winReason;

        // Apply opponent data (with character info)
        this.boardState.opponentField = { ...snapshot.opponentField };
        if (this.selectedOpponent) {
          this.boardState.opponentField.name = this.selectedOpponent.name;
          this.boardState.opponentField.title = this.selectedOpponent.title;
          this.boardState.opponentField.series = this.selectedOpponent.series;
          this.boardState.opponentField.characterId = this.selectedOpponent.id;
        }

        // Apply user field cleanly without racy async array concatenation
        this.boardState.userField = snapshot.userField;
      } catch (err) {
        console.error('[DuelStore] Failed dealing opening hand:', err);
        // Fallback: fetch everything at once
        await this.fetchBoardState();
      }
    },

    /**
     * Fetches fresh board state snapshot from main process.
     */
    async fetchBoardState(): Promise<void> {
      if (window.duelAPI) {
        await this.initCardDatabase();
        try {
          const snapshot = await window.duelAPI.getBoardState();
          if (snapshot) {
            this.boardState.userField = this.hydratePlayerField(snapshot.userField);
            this.boardState.opponentField = this.hydratePlayerField(snapshot.opponentField);
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
          }
        } catch (err) {
          console.error('[DuelStore] Failed fetching board state:', err);
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
      this.selectedTargetIndices = [];
      this.isPromptWaiting = false;
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
      if (event.type === 'WIN') {
        this.boardState.winner = (event.player as 0 | 1) ?? null;
        this.boardState.winReason = event.reason ?? null;
        this.clearPrompts();
        await this.fetchBoardState();
        return;
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
          this.activeSelectCard = event.promptData as SelectCardPayload;
        } else if (event.promptType === 'SELECT_CHAIN') {
          const chainPayload = event.promptData as SelectChainPayload;
          // Only show chain dialog if there are actual cards the player can chain with
          // Empty chain windows (no selects, not forced) are auto-resolved by the engine
          if (chainPayload.selects && chainPayload.selects.length > 0) {
            this.activeSelectChain = chainPayload;
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
          this.activeSelectTribute = event.promptData as SelectTributePayload;
        }
      } else if (!event.isPrompt) {
        // Clear prompts when game state moves forward
        if (event.type === 'NEW_TURN' || event.type === 'NEW_PHASE' || event.type === 'SUMMONED' || event.type === 'SPSUMMONED' || event.type === 'ATTACK') {
          this.clearPrompts();
        }
      }

      // Sync board state snapshot
      await this.fetchBoardState();
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

      // Fallback matching: if strict sequence matching yielded no actions but an action exists for this card code in hand
      if (actions.length === 0) {
        const anySummonIdx = this.activeIdleCmd.summons.findIndex((s) => s.code === card.code);
        if (anySummonIdx >= 0) {
          actions.push({ type: 'summon', index: anySummonIdx, label: 'Normal Summon', icon: '⚔️' });
        }
        const anySpIdx = this.activeIdleCmd.special_summons.findIndex((s) => s.code === card.code);
        if (anySpIdx >= 0) {
          actions.push({ type: 'sp_summon', index: anySpIdx, label: 'Special Summon', icon: '✨' });
        }
        const anyMSetIdx = this.activeIdleCmd.monster_sets.findIndex((s) => s.code === card.code);
        if (anyMSetIdx >= 0) {
          actions.push({ type: 'monster_set', index: anyMSetIdx, label: 'Set Monster', icon: '🛡️' });
        }
        const anySSetIdx = this.activeIdleCmd.spell_sets.findIndex((s) => s.code === card.code);
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

      // In Main Phase (Idle Command)
      if (this.activeIdleCmd) {
        // Change Position
        const posIdx = this.activeIdleCmd.pos_changes.findIndex(
          (p) => p.location === 4 && p.sequence === card.sequence,
        );
        if (posIdx >= 0) {
          actions.push({ type: 'pos_change', index: posIdx, label: 'Change Position', icon: '🔄' });
        }

        // Activate field effect
        const actIdx = this.activeIdleCmd.activates.findIndex(
          (a) => (a.location === 4 || a.location === 8 || a.location === 256) && a.sequence === card.sequence,
        );
        if (actIdx >= 0) {
          actions.push({ type: 'activate', index: actIdx, label: 'Activate Effect', icon: '⚡' });
        }
      }

      // In Battle Phase (Battle Command)
      if (this.activeBattleCmd) {
        // Attack
        const atkIdx = this.activeBattleCmd.attacks.findIndex(
          (a) => a.location === 4 && a.sequence === card.sequence,
        );
        if (atkIdx >= 0) {
          actions.push({ type: 'attack', index: atkIdx, label: 'Declare Attack', icon: '⚔️' });
        }

        // Chain in Battle
        const chainIdx = this.activeBattleCmd.chains.findIndex(
          (c) => (c.location === 4 || c.location === 8) && c.sequence === card.sequence,
        );
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
      // 1. Check active Tribute prompt
      if (this.activeSelectTribute && this.activeSelectTribute.selects) {
        const selectIndex = this.activeSelectTribute.selects.findIndex(
          (s) => s.controller === controller && (s.location === location || (s.location & location) !== 0) && s.sequence === sequence,
        );
        if (selectIndex >= 0) {
          const item = this.activeSelectTribute.selects[selectIndex];
          const isSelected = this.selectedTargetIndices.includes(selectIndex);
          const owner = controller === this.userPlayerId ? 'user' : 'ai';
          const cardName = item.cardName || 'Monster';
          return {
            isSelectable: true,
            selectIndex,
            isSelected,
            owner,
            locationType: 'field',
            tooltipText: owner === 'user' ? `Selectable Tribute: Player's Monster (${cardName})` : `Selectable Tribute: Opponent's Monster (${cardName})`,
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
          const cardName = item.cardName || 'Card';

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
            tooltipText = owner === 'user' ? `Selectable Target: Player's Card (${cardName})` : `Selectable Target: Opponent's Card (${cardName})`;
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

      return null;
    },

    toggleTargetByIndex(selectIndex: number): void {
      const maxAllowed = this.activeSelectTribute?.max ?? this.activeSelectCard?.max ?? 1;
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

    async executeDeclareAttack(attackIndex: number): Promise<boolean> {
      return this.sendCommand({
        type: 0, // SELECT_BATTLECMD
        action: 1, // SELECT_BATTLE
        index: attackIndex,
      });
    },

    async executeSelectCard(selectedIndices: number[]): Promise<boolean> {
      return this.sendCommand({
        type: 5, // SELECT_CARD
        indicies: selectedIndices,
      });
    },

    async executeSelectPosition(position: number): Promise<boolean> {
      return this.sendCommand({
        type: 11, // SELECT_POSITION
        position,
      });
    },

    async executeSelectChain(chainIndex: number | null): Promise<boolean> {
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

    async executeSelectTribute(tributeIndices: number[]): Promise<boolean> {
      return this.sendCommand({
        type: 12, // SELECT_TRIBUTE
        indicies: tributeIndices,
      });
    },

    async sendCommand(command: unknown): Promise<boolean> {
      this.clearPrompts();
      if (window.duelAPI) {
        try {
          const plainCommand = JSON.parse(JSON.stringify(command));
          const res = await window.duelAPI.sendCommand(plainCommand);
          await this.fetchBoardState();
          return res;
        } catch (err) {
          console.error('[DuelStore] Failed sending command:', err);
          return false;
        }
      }
      return false;
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


