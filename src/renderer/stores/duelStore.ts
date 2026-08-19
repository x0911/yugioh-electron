import { defineStore } from 'pinia';

export interface DuelState {
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
  state: (): DuelState => ({
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
  },
  actions: {
    resetDuel(): void {
      this.userLp = 8000;
      this.aiLp = 8000;
      this.turnNumber = 1;
      this.currentPhase = 'DP';
      this.isUserTurn = true;
      this.activePrompt = null;
      this.isDuelActive = false;
      this.winner = null;
    },
  },
});
