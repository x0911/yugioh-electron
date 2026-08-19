import { defineStore } from 'pinia';
import type { CharacterData, CharacterDeckData } from '../../shared/types/character.js';
import type { CustomDeck } from '../../shared/types/deck.js';
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
  46986414, 46986414, 46986414, // Dark Magician x3
  70781052, 70781052, 70781052, // Summoned Skull x3
  91152256, 91152256, 91152256, // Celtic Guardian x3
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

  isPromptWaiting: boolean;
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
      }

      const userMainCards =
        this.selectedUserDeck && this.selectedUserDeck.main.length >= 40
          ? this.selectedUserDeck.main
          : DEFAULT_USER_MAIN_DECK;

      const opponentMainCards =
        this.selectedOpponentDeck && this.selectedOpponentDeck.mainCards.length >= 40
          ? this.selectedOpponentDeck.mainCards
          : DEFAULT_USER_MAIN_DECK;

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
          if (success) {
            await this.fetchBoardState();
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
     * Fetches fresh board state snapshot from main process.
     */
    async fetchBoardState(): Promise<void> {
      if (window.duelAPI) {
        try {
          const snapshot = await window.duelAPI.getBoardState();
          if (snapshot) {
            this.boardState.userField = snapshot.userField;
            this.boardState.opponentField = snapshot.opponentField;
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
          this.activeSelectChain = event.promptData as SelectChainPayload;
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

      // 1. Normal Summon
      const summonIdx = this.activeIdleCmd.summons.findIndex(
        (s) => s.code === card.code && (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (summonIdx >= 0) {
        actions.push({ type: 'summon', index: summonIdx, label: 'Normal Summon', icon: '⚔️' });
      }

      // 2. Special Summon
      const spIdx = this.activeIdleCmd.special_summons.findIndex(
        (s) => s.code === card.code && (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (spIdx >= 0) {
        actions.push({ type: 'sp_summon', index: spIdx, label: 'Special Summon', icon: '✨' });
      }

      // 3. Set Monster
      const mSetIdx = this.activeIdleCmd.monster_sets.findIndex(
        (s) => s.code === card.code && (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (mSetIdx >= 0) {
        actions.push({ type: 'monster_set', index: mSetIdx, label: 'Set Monster', icon: '🛡️' });
      }

      // 4. Set Spell / Trap
      const sSetIdx = this.activeIdleCmd.spell_sets.findIndex(
        (s) => s.code === card.code && (s.sequence === card.sequence || s.sequence === undefined),
      );
      if (sSetIdx >= 0) {
        actions.push({ type: 'spell_set', index: sSetIdx, label: 'Set Card', icon: '📜' });
      }

      // 5. Activate Spell from Hand
      const actIdx = this.activeIdleCmd.activates.findIndex(
        (a) => a.code === card.code && a.location === 2 && (a.sequence === card.sequence || a.sequence === undefined),
      );
      if (actIdx >= 0) {
        actions.push({ type: 'activate', index: actIdx, label: 'Activate', icon: '⚡' });
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
          const res = await window.duelAPI.sendCommand(command);
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


