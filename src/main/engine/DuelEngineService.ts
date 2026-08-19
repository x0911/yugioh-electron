import createCore, {
  type OcgCoreSync,
  type OcgDuelHandle,
  OcgDuelMode,
  OcgProcessResult,
  OcgLocation,
  OcgPosition,
  type OcgMessage,
  type OcgResponse,
} from 'ocgcore-wasm';
import path from 'node:path';
import fs from 'node:fs';
import { CardReaderService } from './cardReader.js';
import { ScriptReaderService } from './scriptReader.js';
import { MessageDecoder, getAutoResponse, type DecodedDuelEvent } from './messageDecoder.js';
import { ViewFilterService } from './viewFilter.js';

export interface EngineInitStatus {
  initialized: boolean;
  engineVersion: string;
  cardCount: number;
  scriptsCount: number;
  ready: boolean;
  error?: string;
}

export interface DuelOptions {
  player0Deck: number[];
  player1Deck: number[];
  startingLP?: number;
  startingDrawCount?: number;
  drawCountPerTurn?: number;
  autoPlay?: boolean;
  humanPlayerId?: number; // 0 or 1, default 0
}

export interface DuelState {
  isActive: boolean;
  isWaitingResponse: boolean;
  waitingPlayer: number | null;
  currentTurn: number;
  currentPhase: string;
  p0LP: number;
  p1LP: number;
  winner: number | null;
  winReason: number | null;
  stepCount: number;
  humanPlayerId: number;
}

export class DuelEngineService {
  private lib: OcgCoreSync | null = null;
  private currentDuel: OcgDuelHandle | null = null;
  private cardReader: CardReaderService;
  private scriptReader: ScriptReaderService;
  private messageDecoder: MessageDecoder;
  private viewFilter: ViewFilterService;
  private lastPromptMessage: OcgMessage | null = null;
  private humanPlayerId = 0;

  private state: DuelState = {
    isActive: false,
    isWaitingResponse: false,
    waitingPlayer: null,
    currentTurn: 0,
    currentPhase: 'DRAW',
    p0LP: 8000,
    p1LP: 8000,
    winner: null,
    winReason: null,
    stepCount: 0,
    humanPlayerId: 0,
  };

  private autoPlay = false;
  private eventListeners: ((event: DecodedDuelEvent) => void)[] = [];

  constructor() {
    this.cardReader = new CardReaderService();
    this.scriptReader = new ScriptReaderService();
    this.messageDecoder = new MessageDecoder(this.cardReader);
    this.viewFilter = new ViewFilterService();
  }

  public async init(): Promise<EngineInitStatus> {
    if (!this.lib) {
      this.lib = await createCore({ sync: true });
      const [maj, min] = this.lib.getVersion();
      console.log(`[DuelEngineService] ocgcore-wasm initialized (v${maj}.${min})`);
    }
    return this.getStatus();
  }

  public getStatus(): EngineInitStatus {
    const cardCount = this.cardReader.getCardCount();
    let scriptsCount = 0;
    try {
      const officialScriptsDir = path.join(this.scriptReader.getScriptsDirectory(), 'official');
      if (fs.existsSync(officialScriptsDir)) {
        scriptsCount = fs.readdirSync(officialScriptsDir).filter((f) => f.endsWith('.lua')).length;
      }
    } catch {
      scriptsCount = 0;
    }

    if (!this.lib) {
      return {
        initialized: false,
        engineVersion: 'unknown',
        cardCount,
        scriptsCount,
        ready: false,
      };
    }

    const [maj, min] = this.lib.getVersion();
    return {
      initialized: true,
      engineVersion: `v${maj}.${min}`,
      cardCount,
      scriptsCount,
      ready: cardCount > 0,
    };
  }

  public onEvent(callback: (event: DecodedDuelEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
    };
  }

  private emitEvent(event: DecodedDuelEvent): void {
    const filteredEvent = this.viewFilter.filterEventForViewer(event, this.humanPlayerId);
    for (const listener of this.eventListeners) {
      listener(filteredEvent);
    }
  }

  public startNewDuel(options: DuelOptions): boolean {
    if (!this.lib) {
      throw new Error('[DuelEngineService] Engine not initialized. Call init() first.');
    }

    if (this.currentDuel) {
      this.destroyCurrentDuel();
    }

    this.autoPlay = options.autoPlay ?? false;
    this.humanPlayerId = options.humanPlayerId ?? 0;
    this.lastPromptMessage = null;
    this.state = {
      isActive: true,
      isWaitingResponse: false,
      waitingPlayer: null,
      currentTurn: 0,
      currentPhase: 'DRAW',
      p0LP: options.startingLP ?? 8000,
      p1LP: options.startingLP ?? 8000,
      winner: null,
      winReason: null,
      stepCount: 0,
      humanPlayerId: this.humanPlayerId,
    };

    const handle = this.lib.createDuel({
      flags: OcgDuelMode.MODE_MR5,
      seed: [
        BigInt(Math.floor(Math.random() * 1000000)),
        BigInt(Math.floor(Math.random() * 1000000)),
        BigInt(Math.floor(Math.random() * 1000000)),
        BigInt(Math.floor(Math.random() * 1000000)),
      ],
      team1: {
        startingLP: options.startingLP ?? 8000,
        startingDrawCount: options.startingDrawCount ?? 5,
        drawCountPerTurn: options.drawCountPerTurn ?? 1,
      },
      team2: {
        startingLP: options.startingLP ?? 8000,
        startingDrawCount: options.startingDrawCount ?? 5,
        drawCountPerTurn: options.drawCountPerTurn ?? 1,
      },
      cardReader: (code: number) => this.cardReader.readCard(code),
      scriptReader: (name: string) => this.scriptReader.readScript(name),
      errorHandler: (type: number, text: string) => {
        console.warn(`[DuelEngineService Lua Error (${type})]: ${text}`);
      },
    });

    if (!handle) {
      throw new Error('[DuelEngineService] Failed to create ocgcore duel handle.');
    }

    this.currentDuel = handle;

    // Load base engine scripts into duel state
    const constantSrc = this.scriptReader.getBaseScript('constant.lua');
    const utilitySrc = this.scriptReader.getBaseScript('utility.lua');
    if (constantSrc) this.lib.loadScript(handle, 'constant.lua', constantSrc);
    if (utilitySrc) this.lib.loadScript(handle, 'utility.lua', utilitySrc);

    // Place cards into Player 0 and Player 1 decks
    for (const code of options.player0Deck) {
      this.lib.duelNewCard(handle, {
        team: 0,
        duelist: 0,
        code,
        controller: 0,
        location: OcgLocation.DECK,
        sequence: 0,
        position: OcgPosition.FACEDOWN,
      });
    }

    for (const code of options.player1Deck) {
      this.lib.duelNewCard(handle, {
        team: 1,
        duelist: 0,
        code,
        controller: 1,
        location: OcgLocation.DECK,
        sequence: 0,
        position: OcgPosition.FACEDOWN,
      });
    }

    this.lib.startDuel(handle);

    // Run initial processing step
    this.processStep();
    return true;
  }

  public processStep(): DecodedDuelEvent[] {
    if (!this.lib || !this.currentDuel || !this.state.isActive) {
      return [];
    }

    const handle = this.currentDuel;
    const allDecodedEvents: DecodedDuelEvent[] = [];

    // If we are currently waiting for a response, check if we need to auto-respond
    if (this.state.isWaitingResponse && this.lastPromptMessage) {
      const response = getAutoResponse(this.lastPromptMessage);
      if (response) {
        this.lib.duelSetResponse(handle, response);
        this.state.isWaitingResponse = false;
        this.state.waitingPlayer = null;
        this.lastPromptMessage = null;
      } else {
        // Cannot auto-respond, remain in waiting state
        return [];
      }
    }

    // Process engine steps
    let maxSubSteps = 100;
    while (this.state.isActive && maxSubSteps > 0) {
      maxSubSteps--;
      const status = this.lib.duelProcess(handle);
      const rawMessages = this.lib.duelGetMessage(handle);

      for (const msg of rawMessages) {
        const decoded = this.messageDecoder.decode(msg);
        allDecodedEvents.push(decoded);

        // Track internal state
        if (decoded.type === 'NEW_TURN') {
          this.state.currentTurn++;
          decoded.turn = this.state.currentTurn;
          decoded.description = `Turn ${this.state.currentTurn} begins. Active player: Player ${decoded.player}`;
        }
        if (decoded.phase !== undefined) this.state.currentPhase = decoded.phase;
        if (
          decoded.type === 'LPUPDATE' &&
          decoded.player !== undefined &&
          decoded.lp !== undefined
        ) {
          if (decoded.player === 0) this.state.p0LP = decoded.lp;
          if (decoded.player === 1) this.state.p1LP = decoded.lp;
        }
        if (
          decoded.type === 'DAMAGE' &&
          decoded.player !== undefined &&
          decoded.amount !== undefined
        ) {
          if (decoded.player === 0) this.state.p0LP = Math.max(0, this.state.p0LP - decoded.amount);
          if (decoded.player === 1) this.state.p1LP = Math.max(0, this.state.p1LP - decoded.amount);
        }
        if (decoded.type === 'WIN') {
          this.state.winner = decoded.player ?? null;
          this.state.winReason = decoded.reason ?? null;
          this.state.isActive = false;
        }

        this.emitEvent(decoded);
      }

      this.state.stepCount++;

      if (this.state.winner !== null || status === OcgProcessResult.END) {
        this.state.isActive = false;
        this.state.isWaitingResponse = false;
        this.lastPromptMessage = null;
        break;
      }

      if (status === OcgProcessResult.WAITING) {
        const lastMsg = rawMessages[rawMessages.length - 1];
        if (lastMsg) {
          const promptPlayer = 'player' in lastMsg ? (lastMsg.player as number) : 0;
          this.state.isWaitingResponse = true;
          this.state.waitingPlayer = promptPlayer;
          this.lastPromptMessage = lastMsg;

          // If opponent player (AI) or autoPlay is active: auto-respond and continue
          if (promptPlayer === 1 || this.autoPlay) {
            const response = getAutoResponse(lastMsg);
            if (response) {
              this.lib.duelSetResponse(handle, response);
              this.state.isWaitingResponse = false;
              this.state.waitingPlayer = null;
              this.lastPromptMessage = null;
              // Continue the loop to process the response
              continue;
            }
          }
        }
        // If it's a prompt for human (Player 0) and autoPlay is false: stop and wait
        break;
      }

      // If status === CONTINUE, keep processing
    }

    return allDecodedEvents;
  }

  public sendResponse(response: OcgResponse): boolean {
    if (!this.lib || !this.currentDuel || !this.state.isActive) {
      return false;
    }

    try {
      this.lib.duelSetResponse(this.currentDuel, response);
      this.state.isWaitingResponse = false;
      this.state.waitingPlayer = null;
      this.lastPromptMessage = null;

      // Process next messages after response
      this.processStep();
      return true;
    } catch (err) {
      console.error('[DuelEngineService] Failed to set response:', err);
      return false;
    }
  }

  public setAutoPlay(autoPlay: boolean): void {
    this.autoPlay = autoPlay;
    if (autoPlay && this.state.isActive && this.state.isWaitingResponse && this.lastPromptMessage) {
      const response = getAutoResponse(this.lastPromptMessage);
      if (response) {
        this.sendResponse(response);
      }
    }
  }

  public getState(): DuelState {
    return { ...this.state };
  }

  public getCardName(code: number): string {
    return this.cardReader.getCardName(code);
  }

  public getAllCards(): import('../../shared/types/card.js').CardDetail[] {
    return this.cardReader.getAllCards();
  }

  public getCardReader(): CardReaderService {
    return this.cardReader;
  }

  public destroyCurrentDuel(): void {
    if (this.lib && this.currentDuel) {
      this.lib.destroyDuel(this.currentDuel);
      this.currentDuel = null;
    }
    this.state.isActive = false;
    this.state.isWaitingResponse = false;
    this.lastPromptMessage = null;
  }

  public close(): void {
    this.destroyCurrentDuel();
    this.cardReader.close();
  }
}

export const duelEngineService = new DuelEngineService();
