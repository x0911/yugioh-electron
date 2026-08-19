import { defineStore } from 'pinia';
import type { CharacterData, CharacterDeckData } from '../../shared/types/character.js';
import type { CustomDeck } from '../../shared/types/deck.js';
import type { CoinChoice, CoinWinner, StartingPlayer } from '../../shared/types/duel.js';
import { useSettingsStore } from './settingsStore.js';
import { useDeckEditStore } from './deckEditStore.js';

// Default tournament-legal 40-card Starter Deck if no user custom deck is selected
const DEFAULT_USER_MAIN_DECK = [
  46986414, 46986414, 46986414, // Dark Magician x3
  70781052, 70781052, 70781052, // Summoned Skull x3
  38033121, 38033121, 38033121, // Celtic Guardian x3
  6368038, 6368038, 6368038, // Mystical Elf x3
  25280974, 25280974, 25280974, // Giant Soldier of Stone x3
  72892473, 72892473, 72892473, // Kuriboh x3
  54652250, 54652250, 54652250, // Man-Eater Bug x3
  40640057, 40640057, 40640057, // Kuriboh / Sangan x3
  33782437, 33782437, // Gemini Elf x2
  55144522, 55144522, // Pot of Greed x2
  53129443, 53129443, // Dark Hole x2
  12580477, // Raigeki x1
  25833572, 25833572, 25833572, // Ookazi x3
  4206964, 4206964, 4206964, // Trap Hole x3
  44095762, 44095762, // Mirror Force x2
  24068492, // Just Desserts x1
];

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

  // In-Duel State
  userLp: number;
  aiLp: number;
  turnNumber: number;
  currentPhase: 'DP' | 'SP' | 'M1' | 'BP' | 'M2' | 'EP';
  isUserTurn: boolean;
  activePrompt: string | null;
  isDuelActive: boolean;
  winner: 0 | 1 | 'draw' | null;
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

    userLp: 8000,
    aiLp: 8000,
    turnNumber: 1,
    currentPhase: 'DP',
    isUserTurn: true,
    activePrompt: null,
    isDuelActive: false,
    winner: null,
  }),

  getters: {
    isGameOver: (state): boolean => state.winner !== null,
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
  },

  actions: {
    /**
     * Initializes match configuration from Settings and DeckEdit.
     */
    async setupMatch(
      customOpponent?: CharacterData,
      customOpponentDeck?: CharacterDeckData,
      customUserDeck?: CustomDeck,
    ): Promise<void> {
      const settingsStore = useSettingsStore();
      const deckEditStore = useDeckEditStore();

      // Ensure settings & characters are loaded
      if (!settingsStore.isInitialized) {
        await settingsStore.initializeSettings();
      }

      // 1. Resolve Opponent Character
      let opponent = customOpponent || settingsStore.selectedCharacter;
      if (!opponent && settingsStore.characters.length > 0) {
        opponent = settingsStore.characters[0];
      }
      this.selectedOpponent = opponent || null;

      // 2. Resolve Opponent Deck (Random one of character's 3 decks)
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

      // 3. Resolve User Deck (from DeckEditStore or starter fallback)
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

      // Reset Coin Toss state for fresh match
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

      // If user predicted correctly, user goes first; otherwise opponent goes first
      if (choice === outcome) {
        this.coinWinner = 'user';
        this.startingPlayer = 'user';
        this.userPlayerId = 0; // Player 0 takes turn 1
        this.opponentPlayerId = 1;
      } else {
        this.coinWinner = 'opponent';
        this.startingPlayer = 'opponent';
        this.userPlayerId = 1; // Opponent is Player 0, User is Player 1
        this.opponentPlayerId = 0;
      }
    },

    /**
     * Starts the prepared duel via IPC with starting-player-ordered decks.
     */
    async startPreparedDuel(): Promise<boolean> {
      if (!this.selectedOpponent || !this.selectedOpponentDeck) {
        await this.setupMatch();
      }

      const userMainCards =
        this.selectedUserDeck && this.selectedUserDeck.main.length >= 40
          ? this.selectedUserDeck.main
          : DEFAULT_USER_MAIN_DECK;

      const opponentMainCards =
        this.selectedOpponentDeck && this.selectedOpponentDeck.mainCards.length >= 40
          ? this.selectedOpponentDeck.mainCards
          : DEFAULT_USER_MAIN_DECK;

      // Assign Player 0 (first turn) and Player 1 (second turn)
      let p0Deck: number[];
      let p1Deck: number[];
      let humanPlayerId: number;

      if (this.startingPlayer === 'user') {
        p0Deck = userMainCards;
        p1Deck = opponentMainCards;
        humanPlayerId = 0;
      } else {
        p0Deck = opponentMainCards;
        p1Deck = userMainCards;
        humanPlayerId = 1;
      }

      this.userLp = 8000;
      this.aiLp = 8000;
      this.turnNumber = 1;
      this.currentPhase = 'DP';
      this.isUserTurn = this.startingPlayer === 'user';
      this.activePrompt = null;
      this.winner = null;

      if (window.duelAPI) {
        try {
          const success = await window.duelAPI.newDuel({
            player0Deck: p0Deck,
            player1Deck: p1Deck,
            startingLP: 8000,
            startingDrawCount: 5,
            drawCountPerTurn: 1,
            autoPlay: false,
            humanPlayerId,
          });
          this.isDuelActive = success;
          return success;
        } catch (err) {
          console.error('[DuelStore] Failed starting prepared duel:', err);
          return false;
        }
      }

      this.isDuelActive = true;
      return true;
    },

    resetDuel(): void {
      this.userLp = 8000;
      this.aiLp = 8000;
      this.turnNumber = 1;
      this.currentPhase = 'DP';
      this.isUserTurn = this.startingPlayer === 'user';
      this.activePrompt = null;
      this.isDuelActive = false;
      this.winner = null;
    },
  },
});

