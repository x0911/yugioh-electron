import createCore, {
  type OcgCoreSync,
  type OcgDuelHandle,
  OcgDuelMode,
  OcgProcessResult,
  OcgLocation,
  OcgPosition,
  OcgMessageType,
  OcgResponseType,
  type OcgMessage,
  type OcgResponse,
} from 'ocgcore-wasm';
import path from 'node:path';
import fs from 'node:fs';
import { CardReaderService } from './cardReader.js';
import { ScriptReaderService } from './scriptReader.js';
import { MessageDecoder, getAutoResponse, type DecodedDuelEvent } from './messageDecoder.js';
import { ViewFilterService } from './viewFilter.js';

import type {
  CardPositionState,
  FieldCard,
  PlayerFieldState,
  DuelBoardState,
} from '../../shared/types/field.js';

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
  player0ExtraDeck?: number[];
  player1ExtraDeck?: number[];
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
  currentPhase: 'DP' | 'SP' | 'M1' | 'BP' | 'M2' | 'EP';
  p0LP: number;
  p1LP: number;
  winner: 0 | 1 | 'draw' | null;
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

  // Tracked Board States for Player 0 and Player 1
  private player0Field: PlayerFieldState = this.createEmptyPlayerState(0, 'Player 0');
  private player1Field: PlayerFieldState = this.createEmptyPlayerState(1, 'Player 1');

  private state: DuelState = {
    isActive: false,
    isWaitingResponse: false,
    waitingPlayer: null,
    currentTurn: 0,
    currentPhase: 'DP',
    p0LP: 8000,
    p1LP: 8000,
    winner: null,
    winReason: null,
    stepCount: 0,
    humanPlayerId: 0,
  };

  private autoPlay = false;
  private eventListeners: ((event: DecodedDuelEvent) => void)[] = [];
  private aiStepTimer: NodeJS.Timeout | null = null;
  private readonly AI_STEP_DELAY_MS = 650;

  constructor() {
    this.cardReader = new CardReaderService();
    this.scriptReader = new ScriptReaderService();
    this.messageDecoder = new MessageDecoder(this.cardReader);
    this.viewFilter = new ViewFilterService();
  }

  private reindexHand(pf: PlayerFieldState): void {
    for (let i = 0; i < pf.hand.length; i++) {
      pf.hand[i].sequence = i;
    }
  }

  private createEmptyPlayerState(playerId: 0 | 1, name: string): PlayerFieldState {
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

  private getPlayerField(controller: number): PlayerFieldState {
    return controller === 0 ? this.player0Field : this.player1Field;
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

    const startingLP = options.startingLP ?? 8000;
    this.player0Field = this.createEmptyPlayerState(0, this.humanPlayerId === 0 ? 'You' : 'Opponent');
    this.player1Field = this.createEmptyPlayerState(1, this.humanPlayerId === 1 ? 'You' : 'Opponent');
    this.player0Field.currentLp = startingLP;
    this.player1Field.currentLp = startingLP;
    this.player0Field.deckCount = options.player0Deck.length;
    this.player1Field.deckCount = options.player1Deck.length;

    this.state = {
      isActive: true,
      isWaitingResponse: false,
      waitingPlayer: null,
      currentTurn: 0,
      currentPhase: 'DP',
      p0LP: startingLP,
      p1LP: startingLP,
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
        startingLP,
        startingDrawCount: options.startingDrawCount ?? 5,
        drawCountPerTurn: options.drawCountPerTurn ?? 1,
      },
      team2: {
        startingLP,
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

    // Shuffle Player 0 and Player 1 decks randomly using Fisher-Yates
    const p0DeckShuffled = this.shuffleArray(options.player0Deck);
    const p1DeckShuffled = this.shuffleArray(options.player1Deck);

    // Place cards into Player 0 and Player 1 decks
    for (const code of p0DeckShuffled) {
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

    for (const code of p1DeckShuffled) {
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

    if (options.player0ExtraDeck) {
      for (const code of options.player0ExtraDeck) {
        this.lib.duelNewCard(handle, {
          team: 0,
          duelist: 0,
          code,
          controller: 0,
          location: OcgLocation.EXTRA,
          sequence: 0,
          position: OcgPosition.FACEDOWN,
        });
        const detail = this.cardReader.getCardDetail(code);
        this.player0Field.extraDeck.push({
          id: `extra-0-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name: detail?.name ?? this.cardReader.getCardName(code),
          controller: 0,
          location: 'extra-deck',
          sequence: this.player0Field.extraDeck.length,
          position: 'facedown_defense',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
        });
      }
      this.player0Field.extraDeckCount = this.player0Field.extraDeck.length;
    }

    if (options.player1ExtraDeck) {
      for (const code of options.player1ExtraDeck) {
        this.lib.duelNewCard(handle, {
          team: 1,
          duelist: 0,
          code,
          controller: 1,
          location: OcgLocation.EXTRA,
          sequence: 0,
          position: OcgPosition.FACEDOWN,
        });
        const detail = this.cardReader.getCardDetail(code);
        this.player1Field.extraDeck.push({
          id: `extra-1-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name: detail?.name ?? this.cardReader.getCardName(code),
          controller: 1,
          location: 'extra-deck',
          sequence: this.player1Field.extraDeck.length,
          position: 'facedown_defense',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
        });
      }
      this.player1Field.extraDeckCount = this.player1Field.extraDeck.length;
    }

    this.lib.startDuel(handle);

    // Run initial processing step
    this.processStep();
    return true;
  }

  private updateBoardStateFromMessage(msg: OcgMessage): void {
    const rawType = msg.type;
    const m = msg as unknown as Record<string, unknown>;

    if (rawType === OcgMessageType.NEW_TURN && 'player' in msg) {
      const activePlayer = msg.player;
      this.player0Field.isTurn = activePlayer === 0;
      this.player1Field.isTurn = activePlayer === 1;
    } else if (rawType === OcgMessageType.DRAW && 'drawn' in msg && Array.isArray(msg.drawn)) {
      const pf = this.getPlayerField(msg.player);
      pf.deckCount = Math.max(0, pf.deckCount - msg.drawn.length);
      for (const item of msg.drawn) {
        const isHuman = msg.player === this.humanPlayerId;
        const code = isHuman ? item.code : 0;
        const detail = code > 0 ? this.cardReader.getCardDetail(code) : null;
        const card: FieldCard = {
          id: `hand-${msg.player}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name: detail?.name ?? (code > 0 ? this.cardReader.getCardName(code) : 'Card Back'),
          controller: msg.player as 0 | 1,
          location: 'hand',
          sequence: pf.hand.length,
          position: isHuman ? 'faceup_spell' : 'facedown_spell',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
        };
        pf.hand.push(card);
      }
      this.reindexHand(pf);
    } else if (rawType === OcgMessageType.MOVE && 'from' in msg && 'to' in msg && 'card' in msg) {
      this.handleCardMove(msg.card, msg.from, msg.to);
    } else if (rawType === OcgMessageType.FLIPSUMMONING && 'code' in msg) {
      const { controller, sequence, code } = msg;
      const pf = this.getPlayerField(controller);
      const seq = sequence ?? 0;
      if (pf.monsterZones[seq]) {
        const card = pf.monsterZones[seq]!;
        card.code = code;
        card.position = 'faceup_attack';
        const detail = code > 0 ? this.cardReader.getCardDetail(code) : null;
        card.name = detail?.name ?? this.cardReader.getCardName(code);
        if (detail?.isMonster) {
          card.atk = detail.atk;
          card.def = detail.def;
          card.level = detail.level;
          card.attribute = detail.attributeName;
          card.race = detail.raceName;
          card.description = detail.desc;
        }
      }
    } else if (rawType === OcgMessageType.POS_CHANGE && 'position' in msg) {
      const { controller, location, sequence, position, code } = msg;
      const pf = this.getPlayerField(controller);
      const isMonsterZone = location === OcgLocation.MZONE || location === undefined;
      if (isMonsterZone && pf.monsterZones[sequence]) {
        const card = pf.monsterZones[sequence]!;
        if (code && code > 0) {
          card.code = code;
          const detail = this.cardReader.getCardDetail(code);
          card.name = detail?.name ?? this.cardReader.getCardName(code);
          if (detail?.isMonster) {
            card.atk = detail.atk;
            card.def = detail.def;
            card.level = detail.level;
            card.attribute = detail.attributeName;
            card.race = detail.raceName;
            card.description = detail.desc;
          }
        }
        if ((position & OcgPosition.FACEUP_ATTACK) !== 0) card.position = 'faceup_attack';
        else if ((position & OcgPosition.FACEUP_DEFENSE) !== 0) card.position = 'faceup_defense';
        else if ((position & OcgPosition.FACEDOWN_DEFENSE) !== 0) card.position = 'facedown_defense';
      }
    } else if (rawType === OcgMessageType.LPUPDATE && 'lp' in msg && 'player' in msg) {
      const pf = this.getPlayerField(msg.player);
      pf.currentLp = msg.lp;
    } else if (rawType === OcgMessageType.DAMAGE && 'amount' in msg && 'player' in msg) {
      const pf = this.getPlayerField(msg.player);
      pf.currentLp = Math.max(0, pf.currentLp - msg.amount);
    } else if (rawType === OcgMessageType.RECOVER && typeof m.amount === 'number' && typeof m.player === 'number') {
      const pf = this.getPlayerField(m.player);
      pf.currentLp += m.amount;
    }
  }

  private handleCardMove(code: number, from: { controller: number; location: number; sequence: number; position: number }, to: { controller: number; location: number; sequence: number; position: number }): void {
    if (from.location === to.location && from.controller === to.controller && from.sequence === to.sequence) {
      return;
    }

    let movedCard: FieldCard | null = null;

    // 1. Remove from source
    if (from.location !== 0) {
      const fromPf = this.getPlayerField(from.controller);
      if (from.location === OcgLocation.HAND) {
        const idx = code > 0 ? fromPf.hand.findIndex((c) => c.code === code) : from.sequence;
        if (idx >= 0 && idx < fromPf.hand.length) {
          movedCard = fromPf.hand.splice(idx, 1)[0];
        }
        this.reindexHand(fromPf);
      } else if (from.location === OcgLocation.MZONE) {
        movedCard = fromPf.monsterZones[from.sequence];
        fromPf.monsterZones[from.sequence] = null;
      } else if (from.location === OcgLocation.SZONE) {
        movedCard = fromPf.spellTrapZones[from.sequence];
        fromPf.spellTrapZones[from.sequence] = null;
      } else if (from.location === OcgLocation.FZONE) {
        movedCard = fromPf.fieldZone;
        fromPf.fieldZone = null;
      } else if (from.location === OcgLocation.GRAVE) {
        const idx = fromPf.graveyard.findIndex((c) => c.code === code);
        if (idx >= 0) movedCard = fromPf.graveyard.splice(idx, 1)[0];
      } else if (from.location === OcgLocation.REMOVED) {
        const idx = fromPf.banished.findIndex((c) => c.code === code);
        if (idx >= 0) movedCard = fromPf.banished.splice(idx, 1)[0];
      } else if (from.location === OcgLocation.EXTRA) {
        const idx = code > 0 ? fromPf.extraDeck.findIndex((c) => c.code === code) : from.sequence;
        if (idx >= 0 && idx < fromPf.extraDeck.length) {
          movedCard = fromPf.extraDeck.splice(idx, 1)[0];
        }
        fromPf.extraDeckCount = fromPf.extraDeck.length;
      }
    }

    // 2. Resolve final code and name
    const finalCode = code > 0 ? code : (movedCard?.code ?? 0);
    const detail = finalCode > 0 ? this.cardReader.getCardDetail(finalCode) : null;
    const cardName = detail?.name ?? (finalCode > 0 ? this.cardReader.getCardName(finalCode) : 'Card');

    if (!movedCard) {
      movedCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        code: finalCode,
        name: cardName,
        controller: to.controller as 0 | 1,
        location: 'monster',
        sequence: to.sequence,
        position: 'faceup_attack',
        atk: detail?.isMonster ? detail.atk : undefined,
        def: detail?.isMonster ? detail.def : undefined,
        level: detail?.isMonster ? detail.level : undefined,
        attribute: detail?.attributeName,
        race: detail?.raceName,
        description: detail?.desc,
      };
    } else {
      movedCard.code = finalCode;
      movedCard.name = cardName;
      movedCard.controller = to.controller as 0 | 1;
      if (detail) {
        if (detail.isMonster) {
          movedCard.atk = detail.atk;
          movedCard.def = detail.def;
          movedCard.level = detail.level;
        }
        movedCard.attribute = detail.attributeName;
        movedCard.race = detail.raceName;
        movedCard.description = detail.desc;
      }
    }

    // 3. Add to destination
    if (to.location !== 0) {
      const toPf = this.getPlayerField(to.controller);
      if (to.location === OcgLocation.MZONE) {
        let pos: CardPositionState = 'faceup_attack';
        if ((to.position & OcgPosition.FACEUP_ATTACK) !== 0) pos = 'faceup_attack';
        else if ((to.position & OcgPosition.FACEUP_DEFENSE) !== 0) pos = 'faceup_defense';
        else if ((to.position & OcgPosition.FACEDOWN_DEFENSE) !== 0) pos = 'facedown_defense';

        movedCard.location = 'monster';
        movedCard.sequence = to.sequence;
        movedCard.position = pos;
        toPf.monsterZones[to.sequence] = movedCard;
      } else if (to.location === OcgLocation.SZONE) {
        const isFaceup = (to.position & OcgPosition.FACEUP) !== 0;
        movedCard.location = 'spell-trap';
        movedCard.sequence = to.sequence;
        movedCard.position = isFaceup ? 'faceup_spell' : 'facedown_spell';
        toPf.spellTrapZones[to.sequence] = movedCard;
      } else if (to.location === OcgLocation.FZONE) {
        movedCard.location = 'field';
        movedCard.sequence = 0;
        movedCard.position = 'faceup_spell';
        toPf.fieldZone = movedCard;
      } else if (to.location === OcgLocation.HAND) {
        movedCard.location = 'hand';
        movedCard.sequence = toPf.hand.length;
        movedCard.position = to.controller === this.humanPlayerId ? 'faceup_spell' : 'facedown_spell';
        if (to.controller !== this.humanPlayerId) movedCard.code = 0;
        toPf.hand.push(movedCard);
        this.reindexHand(toPf);
      } else if (to.location === OcgLocation.GRAVE) {
        movedCard.location = 'graveyard';
        movedCard.sequence = toPf.graveyard.length;
        movedCard.position = 'faceup_spell';
        toPf.graveyard.unshift(movedCard);
      } else if (to.location === OcgLocation.REMOVED) {
        movedCard.location = 'banished';
        movedCard.sequence = toPf.banished.length;
        movedCard.position = 'faceup_spell';
        toPf.banished.unshift(movedCard);
      } else if (to.location === OcgLocation.EXTRA) {
        movedCard.location = 'extra-deck';
        movedCard.sequence = toPf.extraDeck.length;
        movedCard.position = 'facedown_spell';
        toPf.extraDeck.unshift(movedCard);
        toPf.extraDeckCount = toPf.extraDeck.length;
      }
    }
  }

  public destroyCurrentDuel(): void {
    if (this.aiStepTimer) {
      clearTimeout(this.aiStepTimer);
      this.aiStepTimer = null;
    }
    if (this.lib && this.currentDuel) {
      this.lib.destroyDuel(this.currentDuel);
      this.currentDuel = null;
    }
    this.state.isActive = false;
    this.state.isWaitingResponse = false;
    this.lastPromptMessage = null;
  }

  private scheduleAiResponse(handle: OcgDuelHandle, response: OcgResponse): void {
    if (this.aiStepTimer) {
      clearTimeout(this.aiStepTimer);
    }
    this.aiStepTimer = setTimeout(() => {
      if (!this.lib || !this.currentDuel || !this.state.isActive) return;
      try {
        this.lib.duelSetResponse(handle, response);
        this.state.isWaitingResponse = false;
        this.state.waitingPlayer = null;
        this.lastPromptMessage = null;
        this.processStep();
      } catch (err) {
        console.error('[DuelEngineService] AI Step Execution Error:', err);
      }
    }, this.AI_STEP_DELAY_MS);
  }

  private shuffleArray<T>(array: readonly T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
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

        // Update internal board tracking
        this.updateBoardStateFromMessage(msg);

        // Track internal state
        if (decoded.type === 'NEW_TURN') {
          this.state.currentTurn++;
          decoded.turn = this.state.currentTurn;
          decoded.description = `Turn ${this.state.currentTurn} begins. Active player: Player ${decoded.player}`;
        }
        if (decoded.phase !== undefined) {
          this.state.currentPhase = (decoded.phase as DuelState['currentPhase']) || 'M1';
        }
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
        if (
          decoded.type === 'RECOVER' &&
          decoded.player !== undefined &&
          decoded.amount !== undefined
        ) {
          if (decoded.player === 0) this.state.p0LP += decoded.amount;
          if (decoded.player === 1) this.state.p1LP += decoded.amount;
        }
        if (decoded.type === 'WIN') {
          this.state.winner = (decoded.player as 0 | 1) ?? null;
          this.state.winReason = decoded.reason ?? null;
          this.state.isActive = false;
        }

        if (!decoded.isPrompt) {
          this.emitEvent(decoded);
        }
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

          // Auto-resolve SELECT_PLACE and SELECT_DISFIELD for smooth card placement
          if (
            lastMsg.type === OcgMessageType.SELECT_PLACE ||
            lastMsg.type === OcgMessageType.SELECT_DISFIELD
          ) {
            const autoPlace = getAutoResponse(lastMsg);
            if (autoPlace) {
              this.lib.duelSetResponse(handle, autoPlace);
              this.state.isWaitingResponse = false;
              this.state.waitingPlayer = null;
              this.lastPromptMessage = null;
              continue;
            }
          }

          // Auto-pass empty non-forced chain opportunities
          if (
            lastMsg.type === OcgMessageType.SELECT_CHAIN &&
            !lastMsg.forced &&
            (!lastMsg.selects || lastMsg.selects.length === 0)
          ) {
            this.lib.duelSetResponse(handle, {
              type: OcgResponseType.SELECT_CHAIN,
              index: null,
            });
            this.state.isWaitingResponse = false;
            this.state.waitingPlayer = null;
            this.lastPromptMessage = null;
            continue;
          }

          const isOpponent = promptPlayer !== this.humanPlayerId;
          // If opponent player (AI) or autoPlay is active: schedule paced auto-response
          if (isOpponent || this.autoPlay) {
            const response = getAutoResponse(lastMsg);
            if (response) {
              this.scheduleAiResponse(handle, response);
              break;
            }
          }
        }
        // If it's a prompt for human and autoPlay is false: emit the prompt event and wait
        if (this.lastPromptMessage) {
          const decodedPrompt = this.messageDecoder.decode(this.lastPromptMessage);
          this.emitEvent(decodedPrompt);
        }
        break;
      }
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

  public getBoardState(): DuelBoardState {
    const userField = this.humanPlayerId === 0 ? this.player0Field : this.player1Field;
    const opponentField = this.humanPlayerId === 0 ? this.player1Field : this.player0Field;

    return {
      userField: JSON.parse(JSON.stringify(userField)),
      opponentField: JSON.parse(JSON.stringify(opponentField)),
      extraMonsterZones: [null, null],
      turnNumber: this.state.currentTurn,
      currentPhase: this.state.currentPhase,
      activePrompt: null,
      phaseGuideText: '',
      winner: this.state.winner,
      winReason: this.state.winReason,
    };
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

  public close(): void {
    this.destroyCurrentDuel();
    this.cardReader.close();
  }
}

export const duelEngineService = new DuelEngineService();

