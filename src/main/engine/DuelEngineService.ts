import createCore, {
  type OcgCoreSync,
  type OcgDuelHandle,
  OcgDuelMode,
  OcgProcessResult,
  OcgLocation,
  OcgPosition,
  OcgMessageType,
  OcgResponseType,
  OcgQueryFlags,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type OcgMessage,
  type OcgResponse,
} from 'ocgcore-wasm';
import path from 'node:path';
import fs from 'node:fs';
import { CardReaderService } from './cardReader.js';
import { ScriptReaderService } from './scriptReader.js';
import { MessageDecoder, getAutoResponse, type DecodedDuelEvent } from './messageDecoder.js';
import { ViewFilterService } from './viewFilter.js';
import { getResourcePath } from '../decks/deckLoader.js';
import {
  AIController,
  aiController,
  assertAiStateSanitized,
  getPersonalityForCharacter,
  DEFAULT_PERSONALITY,
  type EvaluatorContext,
} from '../ai/index.js';
import { parseTrapMonsterStats } from '../../shared/utils/cardStats.js';
import type { CharacterPersonality, AiProviderType } from '../../shared/types/character.js';
import { getPersistedSettings } from '../persistence/store.js';

import type {
  CardPositionState,
  CardStatusType,
  FieldCard,
  PlayerFieldState,
  DuelBoardState,
} from '../../shared/types/field.js';
import type { CardVideoEntry, CardVideoPayload } from '../../shared/types/duel.js';

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
  player0Graveyard?: number[];
  player1Graveyard?: number[];
  player0Monsters?: Array<{ code: number; sequence: number; position?: number }>;
  player1Monsters?: Array<{ code: number; sequence: number; position?: number }>;
  player0SpellTraps?: Array<{ code: number; sequence: number; position?: number }>;
  player1SpellTraps?: Array<{ code: number; sequence: number; position?: number }>;
  noShuffle?: boolean;
  startingLP?: number;
  startingDrawCount?: number;
  drawCountPerTurn?: number;
  autoPlay?: boolean;
  humanPlayerId?: number; // 0 or 1, default 0
  aiCharacterId?: string;
  aiDeckArchetype?: string;
  aiEngineType?: 'builtin' | 'gemini';
  aiProvider?: AiProviderType;
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
  isVideoPlaying?: boolean;
}

export class DuelEngineService {
  private lib: OcgCoreSync | null = null;
  private currentDuel: OcgDuelHandle | null = null;
  private cardReader: CardReaderService;
  private scriptReader: ScriptReaderService;
  private messageDecoder: MessageDecoder;
  private viewFilter: ViewFilterService;
  private aiController: AIController;
  private lastPromptMessage: OcgMessage | null = null;
  private humanPlayerId = 0;
  private aiCharacterId = 'yugi-muto';
  private aiCharacterName = 'Yugi Muto';
  private aiDeckArchetype = '';
  private aiProvider: AiProviderType = 'builtin';
  private aiPersonality: CharacterPersonality = DEFAULT_PERSONALITY;
  private aiSignatureCards: number[] = [];
  private aiDeckCards: number[] = [];
  private cardVideos: Record<string, CardVideoEntry> = {};
  private aiDiagnostics = {
    totalCalls: 0,
    successfulCalls: 0,
    fallbackCalls: 0,
    lastError: null as string | null,
    lastErrorTimestamp: null as number | null,
  };
  private activeChainCards: number[] = [];
  private isPvPMode = false;

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
    isVideoPlaying: false,
  };

  private autoPlay = false;
  private isVideoPlaying = false;
  private eventListeners: ((event: DecodedDuelEvent) => void)[] = [];
  private videoEventListeners: ((payload: CardVideoPayload) => void)[] = [];
  private aiStepTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.cardReader = new CardReaderService();
    this.scriptReader = new ScriptReaderService();
    this.messageDecoder = new MessageDecoder(this.cardReader);
    this.viewFilter = new ViewFilterService();
    this.aiController = aiController;
    this.loadCardVideos();
  }

  private loadCardVideos(): void {
    try {
      const jsonPath = getResourcePath('data/card-videos.json');
      if (fs.existsSync(jsonPath)) {
        const content = fs.readFileSync(jsonPath, 'utf-8');
        this.cardVideos = JSON.parse(content);
      }
    } catch (err) {
      console.warn('[DuelEngineService] Failed to load card-videos.json:', err);
      this.cardVideos = {};
    }
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

  public onPlayVideo(callback: (payload: CardVideoPayload) => void): () => void {
    this.videoEventListeners.push(callback);
    return () => {
      this.videoEventListeners = this.videoEventListeners.filter((cb) => cb !== callback);
    };
  }

  private emitEvent(event: DecodedDuelEvent): void {
    if (this.lib && this.currentDuel && !event.fieldStats) {
      const stats = this.syncFieldCardStats();
      if (stats.length > 0) {
        event.fieldStats = stats;
      }
    }
    if (this.isPvPMode) {
      for (const listener of this.eventListeners) {
        listener(event);
      }
      return;
    }
    const isOppHandPublic = this.viewFilter.isPlayerHandPublic(
      this.getPlayerField(1 - this.humanPlayerId),
      this.getPlayerField(this.humanPlayerId),
      this.humanPlayerId,
    );
    const filteredEvent = this.viewFilter.filterEventForViewer(event, this.humanPlayerId, isOppHandPublic);
    for (const listener of this.eventListeners) {
      listener(filteredEvent);
    }
  }

  private emitVideoEvent(payload: CardVideoPayload): void {
    for (const listener of this.videoEventListeners) {
      listener(payload);
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
    this.isVideoPlaying = false;
    this.aiCharacterId = options.aiCharacterId ?? 'yugi-muto';
    this.aiDeckArchetype = options.aiDeckArchetype ?? '';
    this.aiProvider = options.aiProvider || (options.aiEngineType as any) || 'builtin';
    this.aiPersonality = getPersonalityForCharacter(this.aiCharacterId);
    this.aiSignatureCards = [];
    const aiDeck = this.humanPlayerId === 0 ? options.player1Deck : options.player0Deck;
    this.aiDeckCards = [...(aiDeck || [])];

    try {
      const jsonPath = getResourcePath('data/characters.json');
      if (fs.existsSync(jsonPath)) {
        const chars = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const found = chars.find((c: any) => c.id === this.aiCharacterId);
        if (found) {
          this.aiCharacterName = found.name || 'Opponent';
          if (Array.isArray(found.signatureCards)) {
            this.aiSignatureCards = found.signatureCards;
          }
        }
      }
    } catch {
      this.aiSignatureCards = [];
    }

    const startingLP = options.startingLP ?? 8000;
    this.isPvPMode = options.isPvPMode ?? false;
    const p0Name = options.player0Name || (this.humanPlayerId === 0 ? 'You' : this.aiCharacterName);
    const p1Name = options.player1Name || (this.humanPlayerId === 1 ? 'You' : this.aiCharacterName);
    this.player0Field = this.createEmptyPlayerState(0, p0Name);
    this.player1Field = this.createEmptyPlayerState(1, p1Name);
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
      isVideoPlaying: false,
    };
    this.activeChainCards = [];
    this.aiDiagnostics = {
      totalCalls: 0,
      successfulCalls: 0,
      fallbackCalls: 0,
      lastError: null,
      lastErrorTimestamp: null,
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

    // Shuffle Player 0 and Player 1 decks randomly using Fisher-Yates (unless noShuffle is requested)
    const p0DeckShuffled = options.noShuffle ? [...options.player0Deck] : this.shuffleArray(options.player0Deck);
    const p1DeckShuffled = options.noShuffle ? [...options.player1Deck] : this.shuffleArray(options.player1Deck);

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

    if (options.player0Graveyard) {
      for (const code of options.player0Graveyard) {
        this.lib.duelNewCard(handle, {
          team: 0,
          duelist: 0,
          code,
          controller: 0,
          location: OcgLocation.GRAVE,
          sequence: 0,
          position: OcgPosition.FACEUP,
        });
        const detail = this.cardReader.getCardDetail(code);
        const card: FieldCard = {
          id: `grave-0-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name: detail?.name ?? this.cardReader.getCardName(code),
          controller: 0,
          location: 'graveyard',
          sequence: this.player0Field.graveyard.length,
          position: 'faceup_spell',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
          statuses: [],
        };
        this.player0Field.graveyard.unshift(card);
      }
    }

    if (options.player1Graveyard) {
      for (const code of options.player1Graveyard) {
        this.lib.duelNewCard(handle, {
          team: 1,
          duelist: 0,
          code,
          controller: 1,
          location: OcgLocation.GRAVE,
          sequence: 0,
          position: OcgPosition.FACEUP,
        });
        const detail = this.cardReader.getCardDetail(code);
        const card: FieldCard = {
          id: `grave-1-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name: detail?.name ?? this.cardReader.getCardName(code),
          controller: 1,
          location: 'graveyard',
          sequence: this.player1Field.graveyard.length,
          position: 'faceup_spell',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
          statuses: [],
        };
        this.player1Field.graveyard.unshift(card);
      }
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
        const card: FieldCard = {
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
          statuses: this.computeCardStatuses({ code, location: 'extra-deck', position: 'facedown_defense' } as FieldCard),
        };
        this.player0Field.extraDeck.push(card);
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
        const card: FieldCard = {
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
          statuses: this.computeCardStatuses({ code, location: 'extra-deck', position: 'facedown_defense' } as FieldCard),
        };
        this.player1Field.extraDeck.push(card);
      }
      this.player1Field.extraDeckCount = this.player1Field.extraDeck.length;
    }

    if (options.player0Monsters) {
      for (const m of options.player0Monsters) {
        const pos = (m.position ?? OcgPosition.FACEUP_ATTACK) as OcgPosition;
        this.lib.duelNewCard(handle, {
          team: 0,
          duelist: 0,
          code: m.code,
          controller: 0,
          location: OcgLocation.MZONE,
          sequence: m.sequence,
          position: pos,
        });
        const detail = this.cardReader.getCardDetail(m.code);
        let pState: CardPositionState = 'faceup_attack';
        if ((pos & OcgPosition.FACEUP_ATTACK) !== 0) pState = 'faceup_attack';
        else if ((pos & OcgPosition.FACEUP_DEFENSE) !== 0) pState = 'faceup_defense';
        else if ((pos & OcgPosition.FACEDOWN_DEFENSE) !== 0) pState = 'facedown_defense';

        const card: FieldCard = {
          id: `mzone-0-${m.sequence}-${Date.now()}`,
          code: m.code,
          name: detail?.name ?? this.cardReader.getCardName(m.code),
          controller: 0,
          location: 'monster',
          sequence: m.sequence,
          position: pState,
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
          statuses: [],
        };
        this.player0Field.monsterZones[m.sequence] = card;
      }
    }

    if (options.player1Monsters) {
      for (const m of options.player1Monsters) {
        const pos = (m.position ?? OcgPosition.FACEUP_ATTACK) as OcgPosition;
        this.lib.duelNewCard(handle, {
          team: 1,
          duelist: 0,
          code: m.code,
          controller: 1,
          location: OcgLocation.MZONE,
          sequence: m.sequence,
          position: pos,
        });
        const detail = this.cardReader.getCardDetail(m.code);
        let pState: CardPositionState = 'faceup_attack';
        if ((pos & OcgPosition.FACEUP_ATTACK) !== 0) pState = 'faceup_attack';
        else if ((pos & OcgPosition.FACEUP_DEFENSE) !== 0) pState = 'faceup_defense';
        else if ((pos & OcgPosition.FACEDOWN_DEFENSE) !== 0) pState = 'facedown_defense';

        const card: FieldCard = {
          id: `mzone-1-${m.sequence}-${Date.now()}`,
          code: m.code,
          name: detail?.name ?? this.cardReader.getCardName(m.code),
          controller: 1,
          location: 'monster',
          sequence: m.sequence,
          position: pState,
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
          statuses: [],
        };
        this.player1Field.monsterZones[m.sequence] = card;
      }
    }

    if (options.player0SpellTraps) {
      for (const st of options.player0SpellTraps) {
        const pos = (st.position ?? OcgPosition.FACEDOWN) as OcgPosition;
        this.lib.duelNewCard(handle, {
          team: 0,
          duelist: 0,
          code: st.code,
          controller: 0,
          location: OcgLocation.SZONE,
          sequence: st.sequence,
          position: pos,
        });
        const detail = this.cardReader.getCardDetail(st.code);
        const isFaceup = (pos & OcgPosition.FACEUP) !== 0;
        const card: FieldCard = {
          id: `szone-0-${st.sequence}-${Date.now()}`,
          code: st.code,
          name: detail?.name ?? this.cardReader.getCardName(st.code),
          controller: 0,
          location: 'spell-trap',
          sequence: st.sequence,
          position: isFaceup ? 'faceup_attack' : 'facedown_spell',
          statuses: [],
        };
        this.player0Field.spellTrapZones[st.sequence] = card;
      }
    }

    if (options.player1SpellTraps) {
      for (const st of options.player1SpellTraps) {
        const pos = (st.position ?? OcgPosition.FACEDOWN) as OcgPosition;
        this.lib.duelNewCard(handle, {
          team: 1,
          duelist: 0,
          code: st.code,
          controller: 1,
          location: OcgLocation.SZONE,
          sequence: st.sequence,
          position: pos,
        });
        const detail = this.cardReader.getCardDetail(st.code);
        const isFaceup = (pos & OcgPosition.FACEUP) !== 0;
        const card: FieldCard = {
          id: `szone-1-${st.sequence}-${Date.now()}`,
          code: st.code,
          name: detail?.name ?? this.cardReader.getCardName(st.code),
          controller: 1,
          location: 'spell-trap',
          sequence: st.sequence,
          position: isFaceup ? 'faceup_attack' : 'facedown_spell',
          statuses: [],
        };
        this.player1Field.spellTrapZones[st.sequence] = card;
      }
    }

    this.lib.startDuel(handle);

    // Run initial processing step
    this.processStep();
    return true;
  }

  /**
   * Computes the active 7 status flags for a card based on rules and engine state.
   */
  public computeCardStatuses(card: FieldCard): CardStatusType[] {
    const statuses: CardStatusType[] = card.statuses ? [...card.statuses] : [];

    // 1. Cannot Attack
    const isDefense = card.position === 'faceup_defense' || card.position === 'facedown_defense';
    const isTurn1 = this.state.currentTurn <= 1;
    if ((card.location === 'monster' || card.location === 'extra-monster') && (isDefense || isTurn1)) {
      if (!statuses.includes('no-attack')) statuses.push('no-attack');
    }

    // 2. Cannot Be Special Summoned (Spirit monsters, Nomi monsters, Rituals/Fusions in hand without proc)
    if (card.code > 0) {
      const detail = this.cardReader.getCardDetail(card.code);
      if (detail && detail.desc && (detail.desc.includes('Cannot be Special Summoned') || detail.desc.includes('This card cannot be Special Summoned') || detail.isSpirit)) {
        if (!statuses.includes('no-special-summon')) statuses.push('no-special-summon');
      }
    }

    return Array.from(new Set(statuses));
  }

  private enrichStatusesForField(pf: PlayerFieldState): void {
    for (const card of pf.monsterZones) {
      if (card) card.statuses = this.computeCardStatuses(card);
    }
    for (const card of pf.spellTrapZones) {
      if (card) card.statuses = this.computeCardStatuses(card);
    }
    if (pf.fieldZone) {
      pf.fieldZone.statuses = this.computeCardStatuses(pf.fieldZone);
    }
  }

  private checkVideoTrigger(msg: OcgMessage): CardVideoPayload | null {
    const rawType = msg.type;

    // 1. Summon / Special Summon Video Trigger
    if ((rawType === OcgMessageType.SUMMONING || rawType === OcgMessageType.SPSUMMONING) && 'code' in msg) {
      const code = msg.code as number;
      const canonicalCode = this.cardReader.getCanonicalCode(code);
      const entry = this.cardVideos[String(code)] || (canonicalCode > 0 ? this.cardVideos[String(canonicalCode)] : undefined);
      if (entry && entry.summon) {
        const hasRealFile = this.isVideoFileExisting(entry.summon);
        return {
          code,
          cardName: entry.cardName || this.cardReader.getCardName(code),
          videoType: 'summon',
          videoPath: entry.summon,
          controller: msg.controller,
          isPlaceholder: hasRealFile ? false : !!entry.isPlaceholder,
        };
      }
    }

    // 2. Attack Video Trigger
    if (rawType === OcgMessageType.ATTACK && 'card' in msg) {
      const cardInfo = msg.card as { controller: number; location: number; sequence: number; code?: number };
      let code = cardInfo.code ?? 0;
      if (!code || code <= 0) {
        const pf = this.getPlayerField(cardInfo.controller);
        code = pf.monsterZones[cardInfo.sequence]?.code ?? 0;
      }
      if (code > 0) {
        const canonicalCode = this.cardReader.getCanonicalCode(code);
        const entry = this.cardVideos[String(code)] || (canonicalCode > 0 ? this.cardVideos[String(canonicalCode)] : undefined);
        if (entry && entry.attack) {
          const hasRealFile = this.isVideoFileExisting(entry.attack);
          return {
            code,
            cardName: entry.cardName || this.cardReader.getCardName(code),
            videoType: 'attack',
            videoPath: entry.attack,
            controller: cardInfo.controller,
            isPlaceholder: hasRealFile ? false : !!entry.isPlaceholder,
          };
        }
      }
    }

    // 3. Victory Cutscene Video Trigger (e.g. Exodia 0x10)
    if (rawType === OcgMessageType.WIN && 'reason' in msg) {
      const reason = msg.reason as number;
      if (reason === 0x10) {
        const victoryPath = 'resources/videos/cards/victory_33396948.mp4';
        const hasRealFile = this.isVideoFileExisting(victoryPath);
        return {
          code: 33396948,
          cardName: 'Exodia the Forbidden One',
          videoType: 'victory',
          videoPath: victoryPath,
          controller: typeof msg.player === 'number' ? msg.player : 0,
          isPlaceholder: hasRealFile ? false : true,
        };
      }
    }

    return null;
  }

  private isVideoFileExisting(relPath?: string): boolean {
    if (!relPath) return false;
    try {
      const fullPath = getResourcePath(relPath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return stats.size > 1000;
      }
    } catch {
      return false;
    }
    return false;
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
        const code = item.code;
        const detail = code > 0 ? this.cardReader.getCardDetail(code) : null;
        const card: FieldCard = {
          id: `hand-${msg.player}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          code,
          name: detail?.name ?? (code > 0 ? this.cardReader.getCardName(code) : 'Card Back'),
          controller: msg.player as 0 | 1,
          location: 'hand',
          sequence: pf.hand.length,
          position: 'faceup_spell',
          atk: detail?.isMonster ? detail.atk : undefined,
          def: detail?.isMonster ? detail.def : undefined,
          level: detail?.isMonster ? detail.level : undefined,
          attribute: detail?.attributeName,
          race: detail?.raceName,
          description: detail?.desc,
          statuses: [],
        };
        card.statuses = this.computeCardStatuses(card);
        pf.hand.push(card);
      }
      this.reindexHand(pf);
    } else if (rawType === OcgMessageType.SHUFFLE_HAND && 'player' in msg && Array.isArray((msg as any).cards)) {
      const pf = this.getPlayerField(msg.player);
      const newCodes = (msg as any).cards as number[];
      if (newCodes && newCodes.length > 0 && msg.player === this.humanPlayerId) {
        const remaining = [...pf.hand];
        const newHand: FieldCard[] = [];
        for (const c of newCodes) {
          const idx = remaining.findIndex((card) => card && card.code === c);
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
        this.reindexHand(pf);
      }
    } else if (rawType === OcgMessageType.MOVE && 'from' in msg && 'to' in msg && 'card' in msg) {
      const reason = typeof m.reason === 'number' ? m.reason : 0;
      this.handleCardMove(msg.card, msg.from, msg.to, reason);
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
        } else if (detail?.desc) {
          const parsed = parseTrapMonsterStats(detail.desc);
          if (parsed.atk !== undefined && card.atk === undefined) card.atk = parsed.atk;
          if (parsed.def !== undefined && card.def === undefined) card.def = parsed.def;
          if (parsed.level !== undefined && card.level === undefined) card.level = parsed.level;
          if (parsed.attribute && !card.attribute) card.attribute = parsed.attribute;
          if (parsed.race && !card.race) card.race = parsed.race;
        }
        card.description = detail?.desc ?? card.description;
        card.statuses = this.computeCardStatuses(card);
      }
    } else if (rawType === OcgMessageType.POS_CHANGE && 'position' in msg) {
      const { controller, location, sequence, position, code } = msg;
      const pf = this.getPlayerField(controller);
      const isMonsterZone = location === OcgLocation.MZONE || location === undefined;
      const targetList = isMonsterZone ? pf.monsterZones : pf.spellTrapZones;
      const seq = sequence ?? 0;
      if (targetList[seq]) {
        const card = targetList[seq]!;
        card.position = this.convertPosition(position, isMonsterZone);
        if (typeof code === 'number' && code > 0) {
          card.code = code;
          const detail = this.cardReader.getCardDetail(code);
          card.name = detail?.name ?? this.cardReader.getCardName(code);
          if (isMonsterZone) {
            if (detail?.isMonster) {
              card.atk = detail.atk;
              card.def = detail.def;
              card.level = detail.level;
              card.attribute = detail.attributeName;
              card.race = detail.raceName;
            } else if (detail?.desc) {
              const parsed = parseTrapMonsterStats(detail.desc);
              if (parsed.atk !== undefined && card.atk === undefined) card.atk = parsed.atk;
              if (parsed.def !== undefined && card.def === undefined) card.def = parsed.def;
              if (parsed.level !== undefined && card.level === undefined) card.level = parsed.level;
              if (parsed.attribute && !card.attribute) card.attribute = parsed.attribute;
              if (parsed.race && !card.race) card.race = parsed.race;
            }
          } else {
            card.atk = undefined;
            card.def = undefined;
            card.level = undefined;
            card.baseAtk = undefined;
            card.baseDef = undefined;
          }
          card.description = detail?.desc ?? card.description;
        }
        card.statuses = this.computeCardStatuses(card);
      }
    } else if (rawType === OcgMessageType.DAMAGE && 'player' in msg && 'amount' in msg) {
      const pf = this.getPlayerField(msg.player);
      pf.currentLp = Math.max(0, pf.currentLp - msg.amount);
      if (msg.player === 0) this.state.p0LP = pf.currentLp;
      else this.state.p1LP = pf.currentLp;
    } else if (rawType === OcgMessageType.PAY_LPCOST && 'player' in msg) {
      const pf = this.getPlayerField(msg.player);
      const cost = (msg as any).cost ?? (msg as any).amount ?? 0;
      pf.currentLp = Math.max(0, pf.currentLp - cost);
      if (msg.player === 0) this.state.p0LP = pf.currentLp;
      else this.state.p1LP = pf.currentLp;
    } else if (rawType === OcgMessageType.RECOVER && 'player' in msg && 'amount' in msg) {
      const pf = this.getPlayerField(msg.player);
      pf.currentLp = pf.currentLp + msg.amount;
      if (msg.player === 0) this.state.p0LP = pf.currentLp;
      else this.state.p1LP = pf.currentLp;
    } else if (rawType === OcgMessageType.LPUPDATE && 'player' in msg && 'lp' in msg) {
      const pf = this.getPlayerField(msg.player);
      pf.currentLp = msg.lp;
      if (msg.player === 0) this.state.p0LP = pf.currentLp;
      else this.state.p1LP = pf.currentLp;
    } else if (rawType === OcgMessageType.ADD_COUNTER && 'location' in msg) {
      const { controller, location, sequence, count } = msg as any;
      const pf = this.getPlayerField(controller);
      const targetList = location === OcgLocation.MZONE ? pf.monsterZones : (location === OcgLocation.SZONE && sequence < 5 ? pf.spellTrapZones : null);
      if (targetList && targetList[sequence]) {
        const card = targetList[sequence]!;
        card.counters = (card.counters || 0) + (count || 1);
      } else if (location === OcgLocation.FZONE || (location === OcgLocation.SZONE && sequence === 5)) {
        if (pf.fieldZone) {
          pf.fieldZone.counters = (pf.fieldZone.counters || 0) + (count || 1);
        }
      }
    } else if (rawType === OcgMessageType.REMOVE_COUNTER && 'location' in msg) {
      const { controller, location, sequence, count } = msg as any;
      const pf = this.getPlayerField(controller);
      const targetList = location === OcgLocation.MZONE ? pf.monsterZones : (location === OcgLocation.SZONE && sequence < 5 ? pf.spellTrapZones : null);
      if (targetList && targetList[sequence]) {
        const card = targetList[sequence]!;
        card.counters = Math.max(0, (card.counters || 0) - (count || 1));
      } else if (location === OcgLocation.FZONE || (location === OcgLocation.SZONE && sequence === 5)) {
        if (pf.fieldZone) {
          pf.fieldZone.counters = Math.max(0, (pf.fieldZone.counters || 0) - (count || 1));
        }
      }
    } else if (rawType === OcgMessageType.CARD_HINT && 'location' in msg) {
      const { controller, location, sequence, card_hint, description } = msg as any;
      const pf = this.getPlayerField(controller);
      const targetList = location === OcgLocation.MZONE ? pf.monsterZones : (location === OcgLocation.SZONE && sequence < 5 ? pf.spellTrapZones : null);
      const val = Number(description);
      if (targetList && targetList[sequence]) {
        const card = targetList[sequence]!;
        if (card_hint === 1) { // OcgCardHintType.TURN
          card.turnCounter = val;
        }
      } else if (location === OcgLocation.FZONE || (location === OcgLocation.SZONE && sequence === 5)) {
        if (pf.fieldZone && card_hint === 1) {
          pf.fieldZone.turnCounter = val;
        }
      }
    }
  }

  private handleCardMove(
    code: number,
    from: { controller: number; location: number; sequence: number; position: number },
    to: { controller: number; location: number; sequence: number; position: number },
    reason = 0,
  ): void {
    if (from.location === to.location && from.controller === to.controller && from.sequence === to.sequence) {
      return;
    }

    let movedCard: FieldCard | null = null;

    // 1. Remove from source
    if (from.location !== 0) {
      const fromPf = this.getPlayerField(from.controller);
      if (from.location === OcgLocation.HAND) {
        let idx = -1;
        if (from.controller === this.humanPlayerId && code > 0) {
          idx = fromPf.hand.findIndex((c) => c.code === code);
        }
        if (idx < 0) {
          idx = from.sequence >= 0 && from.sequence < fromPf.hand.length ? from.sequence : 0;
        }
        if (idx >= 0 && idx < fromPf.hand.length) {
          movedCard = fromPf.hand.splice(idx, 1)[0];
        }
        this.reindexHand(fromPf);
      } else if (from.location === OcgLocation.MZONE) {
        movedCard = fromPf.monsterZones[from.sequence];
        fromPf.monsterZones[from.sequence] = null;
      } else if (from.location === OcgLocation.SZONE) {
        if (from.sequence === 5) {
          movedCard = fromPf.fieldZone;
          fromPf.fieldZone = null;
        } else {
          movedCard = fromPf.spellTrapZones[from.sequence];
          fromPf.spellTrapZones[from.sequence] = null;
        }
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

    const isMovingToMonsterZone = to.location === OcgLocation.MZONE;
    const isMovingToSpellTrapZone = to.location === OcgLocation.SZONE || to.location === OcgLocation.FZONE;

    if (!movedCard) {
      let initAtk = isMovingToMonsterZone ? (detail?.isMonster ? detail.atk : undefined) : undefined;
      let initDef = isMovingToMonsterZone ? (detail?.isMonster ? detail.def : undefined) : undefined;
      let initLevel = isMovingToMonsterZone ? (detail?.isMonster ? detail.level : undefined) : undefined;
      let initAttr = detail?.attributeName;
      let initRace = detail?.raceName;

      if (isMovingToMonsterZone && detail?.desc && (initAtk === undefined || initDef === undefined || initLevel === undefined || !initAttr || !initRace)) {
        const parsed = parseTrapMonsterStats(detail.desc);
        if (initAtk === undefined) initAtk = parsed.atk;
        if (initDef === undefined) initDef = parsed.def;
        if (initLevel === undefined) initLevel = parsed.level;
        if (!initAttr) initAttr = parsed.attribute;
        if (!initRace) initRace = parsed.race;
      }

      movedCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        code: finalCode,
        name: cardName,
        controller: to.controller as 0 | 1,
        location: isMovingToSpellTrapZone ? 'spell-trap' : 'monster',
        sequence: to.sequence,
        position: 'faceup_attack',
        atk: initAtk,
        def: initDef,
        baseAtk: initAtk,
        baseDef: initDef,
        level: initLevel,
        attribute: initAttr,
        race: initRace,
        description: detail?.desc,
        statuses: [],
      };
    } else {
      movedCard.code = finalCode;
      movedCard.name = cardName;
      movedCard.controller = to.controller as 0 | 1;
      if (detail) {
        if (isMovingToMonsterZone) {
          if (detail.isMonster) {
            movedCard.atk = detail.atk;
            movedCard.def = detail.def;
            movedCard.baseAtk = detail.atk;
            movedCard.baseDef = detail.def;
            movedCard.level = detail.level;
            movedCard.attribute = detail.attributeName;
            movedCard.race = detail.raceName;
          } else if (detail.desc) {
            const parsed = parseTrapMonsterStats(detail.desc);
            if (parsed.atk !== undefined && movedCard.atk === undefined) movedCard.atk = parsed.atk;
            if (parsed.def !== undefined && movedCard.def === undefined) movedCard.def = parsed.def;
            if (parsed.atk !== undefined && movedCard.baseAtk === undefined) movedCard.baseAtk = parsed.atk;
            if (parsed.def !== undefined && movedCard.baseDef === undefined) movedCard.baseDef = parsed.def;
            if (parsed.level !== undefined && movedCard.level === undefined) movedCard.level = parsed.level;
            if (parsed.attribute && !movedCard.attribute) movedCard.attribute = parsed.attribute;
            if (parsed.race && !movedCard.race) movedCard.race = parsed.race;
          }
        } else if (isMovingToSpellTrapZone) {
          // If moving into spell/trap zone (e.g. monster equipped or placed in SZONE), clear monster combat stats
          movedCard.atk = undefined;
          movedCard.def = undefined;
          movedCard.level = undefined;
          movedCard.baseAtk = undefined;
          movedCard.baseDef = undefined;
          movedCard.attribute = detail.attributeName;
          movedCard.race = detail.raceName;
        } else if (detail.isMonster) {
          movedCard.atk = detail.atk;
          movedCard.def = detail.def;
          movedCard.baseAtk = detail.atk;
          movedCard.baseDef = detail.def;
          movedCard.level = detail.level;
          movedCard.attribute = detail.attributeName;
          movedCard.race = detail.raceName;
        } else {
          movedCard.atk = undefined;
          movedCard.def = undefined;
          movedCard.level = undefined;
          movedCard.baseAtk = undefined;
          movedCard.baseDef = undefined;
          movedCard.attribute = detail.attributeName;
          movedCard.race = detail.raceName;
        }
        movedCard.description = detail.desc;
      }
    }

    // Process move reason flags for statuses
    const curStatuses = movedCard.statuses ? [...movedCard.statuses] : [];
    // REASON_BATTLE = 0x1
    if ((reason & 0x1) !== 0 && !curStatuses.includes('destroyed-battle')) {
      curStatuses.push('destroyed-battle');
    }
    // REASON_FUSION = 0x40
    if ((reason & 0x40) !== 0 && !curStatuses.includes('fusion-material')) {
      curStatuses.push('fusion-material');
    }
    // REASON_SYNCHRO = 0x200
    if ((reason & 0x200) !== 0 && !curStatuses.includes('synchro-material')) {
      curStatuses.push('synchro-material');
    }
    // REASON_TEMPORARY = 0x8000000
    if ((reason & 0x8000000) !== 0 && !curStatuses.includes('temp-banished')) {
      curStatuses.push('temp-banished');
    }
    movedCard.statuses = curStatuses;

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
        movedCard.statuses = this.computeCardStatuses(movedCard);
        toPf.monsterZones[to.sequence] = movedCard;
      } else if (to.location === OcgLocation.SZONE) {
        if (to.sequence === 5) {
          movedCard.location = 'field';
          movedCard.sequence = 0;
          movedCard.position = 'faceup_attack'; // field zone cards render upright
          movedCard.statuses = this.computeCardStatuses(movedCard);
          toPf.fieldZone = movedCard;
        } else {
          const isFaceup = (to.position & OcgPosition.FACEUP) !== 0;
          movedCard.location = 'spell-trap';
          movedCard.sequence = to.sequence;
          // Use 'faceup_attack' for face-up spell-zone cards (upright orientation).
          // This keeps the engine's internal state consistent with what the renderer's
          // applyCardMoveToBoard sets, so fetchBoardState snapshots match and Vue
          // never sees a class-change that would trigger a spurious transform flash.
          movedCard.position = isFaceup ? 'faceup_attack' : 'facedown_spell';
          movedCard.statuses = this.computeCardStatuses(movedCard);
          toPf.spellTrapZones[to.sequence] = movedCard;
        }
      } else if (to.location === OcgLocation.FZONE) {
        movedCard.location = 'field';
        movedCard.sequence = 0;
        movedCard.position = 'faceup_attack'; // field zone cards render upright
        movedCard.statuses = this.computeCardStatuses(movedCard);
        toPf.fieldZone = movedCard;
      } else if (to.location === OcgLocation.HAND) {
        movedCard.location = 'hand';
        movedCard.sequence = toPf.hand.length;
        movedCard.position = 'faceup_spell';
        movedCard.statuses = this.computeCardStatuses(movedCard);
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
    this.state.isVideoPlaying = false;
    this.isVideoPlaying = false;
    this.lastPromptMessage = null;
  }

  private normalizeResponse(response: OcgResponse): OcgResponse {
    if (!response) return response;
    switch (response.type) {
      case OcgResponseType.ANNOUNCE_RACE:
        if ((response as any).races) {
          return {
            ...response,
            races: (response as any).races.map((r: any) => (typeof r === 'bigint' ? r : BigInt(r))),
          };
        }
        break;
      case OcgResponseType.ANNOUNCE_ATTRIB:
        if ((response as any).attributes) {
          return {
            ...response,
            attributes: (response as any).attributes.map((a: any) => (typeof a === 'number' ? a : Number(a))),
          };
        }
        break;
      case OcgResponseType.ANNOUNCE_CARD:
        return {
          ...response,
          card: typeof (response as any).card === 'number' ? (response as any).card : Number((response as any).card),
        };
      case OcgResponseType.ANNOUNCE_NUMBER: {
        let val =
          (response as any).index !== undefined
            ? Number((response as any).index)
            : typeof (response as any).value === 'number'
              ? (response as any).value
              : Number((response as any).value);

        const prompt = this.lastPromptMessage as any;
        if (
          prompt &&
          prompt.type === OcgMessageType.ANNOUNCE_NUMBER &&
          Array.isArray(prompt.options) &&
          prompt.options.length > 0
        ) {
          // ocgcore expects the 0-based option index.
          // If the caller supplied the actual option value (e.g. 3 or 6 when options are [3, 6]),
          // or an out-of-range index, defensively map it to the corresponding option index.
          if (val < 0 || val >= prompt.options.length) {
            const matchedIdx = prompt.options.findIndex((opt: any) => Number(opt) === val);
            val = matchedIdx >= 0 ? matchedIdx : 0;
          }
        }

        return {
          ...response,
          value: val,
        };
      }
      case OcgResponseType.SELECT_CARD:
      case OcgResponseType.SELECT_TRIBUTE: {
        const resp = response as any;
        const promptMsg = this.lastPromptMessage as any;
        if (resp.indicies === null || resp.indicies === undefined) {
          return {
            ...response,
            indicies: null,
          };
        }
        if (
          Array.isArray(resp.indicies) &&
          resp.indicies.length === 0 &&
          promptMsg &&
          promptMsg.min > 0 &&
          promptMsg.can_cancel
        ) {
          return {
            ...response,
            indicies: null,
          };
        }
        return {
          ...response,
          indicies: resp.indicies.map((i: any) => Number(i)),
        };
      }
      case OcgResponseType.SELECT_SUM:
        if ((response as any).indicies) {
          return {
            ...response,
            indicies: (response as any).indicies.map((i: any) => Number(i)),
          };
        }
        break;
      case OcgResponseType.SELECT_COUNTER:
        if ((response as any).counters) {
          return {
            ...response,
            counters: (response as any).counters.map((c: any) => Number(c)),
          };
        }
        break;
      case OcgResponseType.SORT_CARD:
        if ((response as any).order) {
          return {
            ...response,
            order: (response as any).order.map((o: any) => Number(o)),
          };
        }
        break;
      case OcgResponseType.SELECT_OPTION:
        return {
          ...response,
          index: Number((response as any).index),
        };
      case OcgResponseType.SELECT_POSITION:
        return {
          ...response,
          position: Number((response as any).position),
        };
      case OcgResponseType.SELECT_EFFECTYN:
        if (this.lastPromptMessage?.type === OcgMessageType.SELECT_YESNO) {
          return {
            ...response,
            type: OcgResponseType.SELECT_YESNO,
          };
        }
        break;
      case OcgResponseType.SELECT_YESNO:
        if (this.lastPromptMessage?.type === OcgMessageType.SELECT_EFFECTYN) {
          return {
            ...response,
            type: OcgResponseType.SELECT_EFFECTYN,
          };
        }
        break;
      case OcgResponseType.ROCK_PAPER_SCISSORS:
        return {
          ...response,
          value: (Number((response as any).value) || 1) as 1 | 2 | 3,
        };
    }
    return response;
  }

  private scheduleAiResponse(handle: OcgDuelHandle, response: OcgResponse, delayMs?: number): void {
    if (this.aiStepTimer) {
      clearTimeout(this.aiStepTimer);
    }
    if (this.isVideoPlaying) {
      return;
    }
    const delay = delayMs ?? this.aiController.getThinkDelay(this.aiPersonality);
    this.aiStepTimer = setTimeout(() => {
      if (!this.lib || !this.currentDuel || !this.state.isActive || this.isVideoPlaying) return;
      try {
        this.lib.duelSetResponse(handle, this.normalizeResponse(response));
        this.state.isWaitingResponse = false;
        this.state.waitingPlayer = null;
        this.lastPromptMessage = null;
        this.processStep();
      } catch (err) {
        console.error('[DuelEngineService] AI Step Execution Error:', err);
      }
    }, delay);
  }

  private getAiResponse(msg: OcgMessage, promptPlayer: number): { response: OcgResponse; delayMs: number } {
    const aiPlayerId = promptPlayer;
    const humanPlayerId = 1 - aiPlayerId;

    // Enriched stats & statuses
    this.enrichStatusesForField(this.player0Field);
    this.enrichStatusesForField(this.player1Field);
    this.syncFieldCardStats();
    this.enrichDynamicStatsForField(this.player0Field, this.player1Field);
    this.enrichDynamicStatsForField(this.player1Field, this.player0Field);

    // Build strictly redacted AI-side board state
    const aiBoardState: DuelBoardState = {
      userField: this.viewFilter.filterPlayerFieldForViewer(this.player0Field, aiPlayerId),
      opponentField: this.viewFilter.filterPlayerFieldForViewer(this.player1Field, aiPlayerId),
      extraMonsterZones: [null, null],
      turnNumber: this.state.currentTurn,
      currentPhase: this.state.currentPhase,
      activePrompt: null,
      phaseGuideText: '',
      winner: this.state.winner,
      winReason: this.state.winReason,
    };

    // Assert anti-cheat verification: throws loudly if unrevealed human cards leaked
    assertAiStateSanitized(aiBoardState, aiPlayerId);

    const context: EvaluatorContext = {
      aiPlayerId,
      humanPlayerId,
      boardState: aiBoardState,
      personality: this.aiPersonality,
      cardReader: this.cardReader,
      currentPhase: this.state.currentPhase,
      currentTurn: this.state.currentTurn,
      signatureCardIds: this.aiSignatureCards,
      deckArchetype: this.aiDeckArchetype,
      aiDeckCards: this.aiDeckCards,
      activeChainCards: [...this.activeChainCards],
    };

    const response = this.aiController.decideResponse(msg, context);
    const delayMs = this.aiController.getThinkDelay(this.aiPersonality, OcgMessageType[msg.type]);
    return { response, delayMs };
  }

  private async getAiResponseAsync(
    msg: OcgMessage,
    promptPlayer: number,
  ): Promise<{ response: OcgResponse; delayMs: number; dialogue?: string; reasoning?: string }> {
    const aiPlayerId = promptPlayer;
    const humanPlayerId = 1 - aiPlayerId;

    this.enrichStatusesForField(this.player0Field);
    this.enrichStatusesForField(this.player1Field);
    this.syncFieldCardStats();
    this.enrichDynamicStatsForField(this.player0Field, this.player1Field);
    this.enrichDynamicStatsForField(this.player1Field, this.player0Field);

    const aiBoardState: DuelBoardState = {
      userField: this.viewFilter.filterPlayerFieldForViewer(this.player0Field, aiPlayerId),
      opponentField: this.viewFilter.filterPlayerFieldForViewer(this.player1Field, aiPlayerId),
      extraMonsterZones: [null, null],
      turnNumber: this.state.currentTurn,
      currentPhase: this.state.currentPhase,
      activePrompt: null,
      phaseGuideText: '',
      winner: this.state.winner,
      winReason: this.state.winReason,
    };

    assertAiStateSanitized(aiBoardState, aiPlayerId);

    const context: EvaluatorContext = {
      aiPlayerId,
      humanPlayerId,
      boardState: aiBoardState,
      personality: this.aiPersonality,
      cardReader: this.cardReader,
      currentPhase: this.state.currentPhase,
      currentTurn: this.state.currentTurn,
      signatureCardIds: this.aiSignatureCards,
      deckArchetype: this.aiDeckArchetype,
      aiDeckCards: this.aiDeckCards,
      activeChainCards: [...this.activeChainCards],
    };

    if (this.aiProvider && this.aiProvider !== 'builtin') {
      const settings = getPersistedSettings();
      const apiKey = settings.aiApiKeys?.[this.aiProvider] || '';
      const model = settings.aiModels?.[this.aiProvider];
      const customEndpoint = settings.aiCustomEndpoints?.[this.aiProvider];

      this.aiDiagnostics.totalCalls++;
      const result = await this.aiController.decideResponseAsync(msg, context, {
        provider: this.aiProvider,
        apiKey,
        model,
        customEndpoint,
      });

      if (result.fallbackUsed) {
        this.aiDiagnostics.fallbackCalls++;
        if (result.error) {
          this.aiDiagnostics.lastError = result.error;
          this.aiDiagnostics.lastErrorTimestamp = Date.now();
        }
      } else {
        this.aiDiagnostics.successfulCalls++;
      }

      const delayMs = 200;
      return {
        response: result.response,
        delayMs,
        dialogue: result.dialogue,
        reasoning: result.reasoning,
        error: result.error,
        fallbackUsed: result.fallbackUsed,
      };
    }

    const response = this.aiController.decideResponse(msg, context);
    const delayMs = this.aiController.getThinkDelay(this.aiPersonality, OcgMessageType[msg.type]);
    return { response, delayMs, fallbackUsed: false };
  }

  private convertPosition(position: number, isMonster: boolean): CardPositionState {
    if (isMonster) {
      if ((position & OcgPosition.FACEDOWN_DEFENSE) !== 0) return 'facedown_defense';
      if ((position & OcgPosition.FACEUP_DEFENSE) !== 0) return 'faceup_defense';
      return 'faceup_attack';
    }
    return (position & OcgPosition.FACEUP) !== 0 ? 'faceup_attack' : 'facedown_spell';
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

  public onVideoFinished(): void {
    if (!this.isVideoPlaying) return;
    console.log('[DuelEngineService] Video finished. Resuming engine process loop.');
    this.isVideoPlaying = false;
    this.state.isVideoPlaying = false;
    if (this.lib && this.currentDuel && this.state.isActive) {
      this.processStep();
    }
  }

  public processStep(): DecodedDuelEvent[] {
    if (!this.lib || !this.currentDuel || !this.state.isActive || this.isVideoPlaying) {
      return [];
    }

    const handle = this.currentDuel;
    const allDecodedEvents: DecodedDuelEvent[] = [];

    // If we are currently waiting for a response, check if we need to auto-respond
    if (this.state.isWaitingResponse && this.lastPromptMessage) {
      const promptPlayer = 'player' in this.lastPromptMessage ? (this.lastPromptMessage.player as number) : 0;
      const isOpponent = promptPlayer !== this.humanPlayerId;
      if (isOpponent || this.autoPlay) {
        const { response } = this.getAiResponse(this.lastPromptMessage, promptPlayer);
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
    while (this.state.isActive && !this.isVideoPlaying && maxSubSteps > 0) {
      maxSubSteps--;
      const status = this.lib.duelProcess(handle);
      const rawMessages = this.lib.duelGetMessage(handle);

      let pendingVideoPayload: CardVideoPayload | null = null;

      for (const msg of rawMessages) {
        const decoded = this.messageDecoder.decode(msg);
        allDecodedEvents.push(decoded);

        // Update internal board tracking
        this.updateBoardStateFromMessage(msg);

        // Check for special card video triggers (summon/attack)
        const videoPayload = this.checkVideoTrigger(msg);
        if (videoPayload && !pendingVideoPayload) {
          pendingVideoPayload = videoPayload;
        }

        if (decoded.type === 'NEW_TURN') {
          this.state.currentTurn++;
          decoded.turn = this.state.currentTurn;
          decoded.description = `Turn ${this.state.currentTurn} begins. Active player: Player ${decoded.player}`;
          this.activeChainCards = [];
        }
        if (decoded.type === 'CHAINING' && (decoded as any).code) {
          this.activeChainCards.push((decoded as any).code);
        }
        if (decoded.type === 'CHAIN_SOLVED' || decoded.type === 'CHAIN_END') {
          this.activeChainCards = [];
        }
        if (decoded.phase !== undefined) {
          this.state.currentPhase = (decoded.phase as DuelState['currentPhase']) || 'M1';
          this.activeChainCards = [];
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
        if (pendingVideoPayload) {
          this.isVideoPlaying = true;
          this.state.isVideoPlaying = true;
          this.emitVideoEvent(pendingVideoPayload);
        }
        break;
      }

      if (pendingVideoPayload && status !== OcgProcessResult.WAITING) {
        this.isVideoPlaying = true;
        this.state.isVideoPlaying = true;
        if (this.aiStepTimer) {
          clearTimeout(this.aiStepTimer);
          this.aiStepTimer = null;
        }
        this.emitVideoEvent(pendingVideoPayload);
        break;
      }

      if (status === OcgProcessResult.WAITING) {
        let lastMsg: OcgMessage | null = null;
        for (let i = rawMessages.length - 1; i >= 0; i--) {
          const decoded = this.messageDecoder.decode(rawMessages[i]);
          if (decoded.isPrompt) {
            lastMsg = rawMessages[i];
            break;
          }
        }
        if (!lastMsg && rawMessages.length > 0) {
          const fallback = rawMessages[rawMessages.length - 1];
          if (fallback.type !== OcgMessageType.RETRY) {
            lastMsg = fallback;
          } else {
            console.warn('[DuelEngineService] OCGCORE emitted RETRY message without new prompt');
          }
        }

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

          // If a video trigger was encountered in this step, pause here BEFORE scheduling AI or prompt
          if (pendingVideoPayload) {
            this.isVideoPlaying = true;
            this.state.isVideoPlaying = true;
            if (this.aiStepTimer) {
              clearTimeout(this.aiStepTimer);
              this.aiStepTimer = null;
            }
            this.emitVideoEvent(pendingVideoPayload);
            break;
          }

          const isOpponent = promptPlayer !== this.humanPlayerId;
          // If opponent player (AI) or autoPlay is active: schedule evaluated AI response (skipped in PvP mode)
          if ((isOpponent && !this.isPvPMode) || this.autoPlay) {
            if (this.aiProvider && this.aiProvider !== 'builtin') {
              this.getAiResponseAsync(lastMsg, promptPlayer)
                .then(({ response, delayMs, dialogue, reasoning, error, fallbackUsed }) => {
                  const settings = getPersistedSettings();
                  const modelName = settings.aiModels?.[this.aiProvider] || this.aiProvider;
                  const charName = this.aiCharacterName || (this.humanPlayerId === 0 ? this.player1Field.name : this.player0Field.name) || 'Opponent';

                  if (fallbackUsed && error) {
                    this.emitEvent({
                      type: 'AI_DIAGNOSTIC' as any,
                      characterId: this.aiCharacterId,
                      characterName: charName,
                      provider: this.aiProvider,
                      model: modelName,
                      status: 'fallback',
                      error,
                      description: `[AI WARNING] ${this.aiProvider.toUpperCase()} (${modelName}) API issue: ${error}. FastAI heuristic engine executed this move.`,
                    } as any);
                  }

                  if (dialogue) {
                    this.emitEvent({
                      type: 'AI_DIALOGUE' as any,
                      characterId: this.aiCharacterId,
                      characterName: charName,
                      provider: this.aiProvider,
                      model: modelName,
                      text: dialogue,
                      reasoning,
                      description: `[${this.aiProvider.toUpperCase()}] ${charName}: "${dialogue}"${reasoning ? ` (Tactical Rationale: ${reasoning})` : ''}`,
                    } as any);
                  }
                  this.scheduleAiResponse(handle, response, delayMs);
                })
                .catch((err) => {
                  console.warn('[DuelEngineService] getAiResponseAsync error, using fast fallback:', err);
                  const { response, delayMs } = this.getAiResponse(lastMsg, promptPlayer);
                  this.scheduleAiResponse(handle, response, delayMs);
                });
            } else {
              const { response, delayMs } = this.getAiResponse(lastMsg, promptPlayer);
              console.log(`[AI Debug] Prompt: ${OcgMessageType[lastMsg.type]} for P${promptPlayer}`, JSON.stringify(lastMsg, (k, v) => typeof v === 'bigint' ? v.toString() : v));
              console.log(`[AI Debug] Response: ${OcgResponseType[response.type]}`, JSON.stringify(response, (k, v) => typeof v === 'bigint' ? v.toString() : v));
              this.scheduleAiResponse(handle, response, delayMs);
            }
            break;
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
    if (this.aiStepTimer) {
      clearTimeout(this.aiStepTimer);
      this.aiStepTimer = null;
    }

    if (!this.lib || !this.currentDuel || !this.state.isActive || this.isVideoPlaying) {
      return false;
    }

    try {
      if (
        this.lastPromptMessage?.type === OcgMessageType.SELECT_BATTLECMD &&
        (response as any).type === OcgResponseType.SELECT_BATTLECMD
      ) {
        if (
          (response as any).action === SelectBattleCMDAction.SELECT_BATTLE ||
          (response as any).action === 1
        ) {
          const attackIndex = (response as any).index;
          const attackEntry = (this.lastPromptMessage as any).attacks?.[attackIndex];
          if (attackEntry) {
            this.messageDecoder.setLastAttackCard(attackEntry);
          }
        }
      } else if (
        this.lastPromptMessage?.type === OcgMessageType.SELECT_IDLECMD &&
        (response as any).type === OcgResponseType.SELECT_IDLECMD
      ) {
        if ((response as any).action === SelectIdleCMDAction.SELECT_ACTIVATE) {
          const actIndex = (response as any).index;
          const actEntry = (this.lastPromptMessage as any).activates?.[actIndex];
          if (actEntry) {
            this.messageDecoder.setLastActivatedCard(actEntry);
          }
        }
      }

      this.lib.duelSetResponse(this.currentDuel, this.normalizeResponse(response));
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
    if (autoPlay && this.state.isActive && this.state.isWaitingResponse && this.lastPromptMessage && !this.isVideoPlaying) {
      const promptPlayer = 'player' in this.lastPromptMessage ? (this.lastPromptMessage.player as number) : 0;
      const { response } = this.getAiResponse(this.lastPromptMessage, promptPlayer);
      if (response) {
        this.sendResponse(response);
      }
    }
  }

  public getState(): DuelState {
    return { ...this.state, isVideoPlaying: this.isVideoPlaying };
  }

  public syncFieldCardStats(): Array<{
    controller: 0 | 1;
    sequence: number;
    atk?: number;
    def?: number;
    level?: number;
    baseAtk?: number;
    baseDef?: number;
  }> {
    const stats: Array<{
      controller: 0 | 1;
      sequence: number;
      atk?: number;
      def?: number;
      level?: number;
      baseAtk?: number;
      baseDef?: number;
    }> = [];
    if (!this.lib || !this.currentDuel) return stats;

    const queryFlags =
      OcgQueryFlags.ATTACK |
      OcgQueryFlags.DEFENSE |
      OcgQueryFlags.BASE_ATTACK |
      OcgQueryFlags.BASE_DEFENSE |
      OcgQueryFlags.LEVEL;

    for (const p of [0, 1] as const) {
      const pf = this.getPlayerField(p);
      for (let seq = 0; seq < pf.monsterZones.length; seq++) {
        const card = pf.monsterZones[seq];
        if (!card) continue;

        try {
          const query = this.lib.duelQuery(this.currentDuel, {
            flags: queryFlags,
            controller: p,
            location: OcgLocation.MZONE,
            sequence: seq,
            overlaySequence: 0,
          });

          if (query) {
            if (typeof query.attack === 'number') {
              card.atk = query.attack;
            }
            if (typeof query.defense === 'number') {
              card.def = query.defense;
            }
            if (typeof query.baseAttack === 'number') {
              card.baseAtk = query.baseAttack;
            }
            if (typeof query.baseDefense === 'number') {
              card.baseDef = query.baseDefense;
            }
            if (typeof query.level === 'number') {
              card.level = query.level;
            }

            // If card in MZONE has missing attribute or race (e.g. Trap Monster), parse from description
            if ((!card.attribute || !card.race) && card.description) {
              const parsed = parseTrapMonsterStats(card.description);
              if (!card.attribute && parsed.attribute) card.attribute = parsed.attribute;
              if (!card.race && parsed.race) card.race = parsed.race;
            }
          }
        } catch {
          // Ignore transient ocgcore query errors during zone transitions
        }
      }

      // Ensure Spell/Trap and Field zones never leak monster combat stats
      for (const st of pf.spellTrapZones) {
        if (st) {
          st.atk = undefined;
          st.def = undefined;
          st.level = undefined;
          st.baseAtk = undefined;
          st.baseDef = undefined;
        }
      }
      if (pf.fieldZone) {
        pf.fieldZone.atk = undefined;
        pf.fieldZone.def = undefined;
        pf.fieldZone.level = undefined;
        pf.fieldZone.baseAtk = undefined;
        pf.fieldZone.baseDef = undefined;
      }
    }

    this.enrichDynamicStatsForField(this.player0Field, this.player1Field);
    this.enrichDynamicStatsForField(this.player1Field, this.player0Field);

    for (const p of [0, 1] as const) {
      const pf = this.getPlayerField(p);
      for (let seq = 0; seq < pf.monsterZones.length; seq++) {
        const card = pf.monsterZones[seq];
        if (!card) continue;

        stats.push({
          controller: p,
          sequence: seq,
          atk: card.atk,
          def: card.def,
          level: card.level,
          baseAtk: card.baseAtk,
          baseDef: card.baseDef,
        });
      }
    }

    return stats;
  }

  public enrichDynamicStatsForField(pf: PlayerFieldState, oppPf: PlayerFieldState): void {
    for (const card of pf.monsterZones) {
      if (!card || card.code <= 0) continue;
      // Slifer the Sky Dragon (10000020): gains 1000 ATK/DEF per card in hand
      if (card.code === 10000020) {
        card.atk = pf.hand.length * 1000;
        card.def = pf.hand.length * 1000;
        card.baseAtk = card.atk;
        card.baseDef = card.def;
      }
      // Tragoedia (98777992): gains 600 ATK/DEF per card in hand
      else if (card.code === 98777992) {
        card.atk = pf.hand.length * 600;
        card.def = pf.hand.length * 600;
        card.baseAtk = card.atk;
        card.baseDef = card.def;
      }
      // Gren Maju Da Eiza (36584821): gains 400 ATK/DEF per banished card
      else if (card.code === 36584821) {
        const totalBanished = pf.banished.length + oppPf.banished.length;
        card.atk = totalBanished * 400;
        card.def = totalBanished * 400;
        card.baseAtk = card.atk;
        card.baseDef = card.def;
      }
      // King of the Skull Servants (36021814): 1000 ATK per "Skull Servant" / "King of the Skull Servants" in GY
      else if (card.code === 36021814) {
        const servCodes = [
          32274490, // Skull Servant
          32274491, // Skull Servant (Alt)
          36021814, // King of the Skull Servants
          40991587, // The Lady in Wight
          22339232, // Wightmare
          57473560, // Wightprince
          90243945, // Wightprincess
          6128460,  // Wightbaking
          22970795, // Wightlord
          39848658, // Wight Reanimator
          16638212, // Wight Fan
          78636495,
        ];
        const count = pf.graveyard.filter((c) => servCodes.includes(c.code)).length;
        card.atk = count * 1000;
        card.def = 0;
        card.baseAtk = count * 1000;
        card.baseDef = 0;
      }
      // The Legendary Exodia Incarnate (13893596): gains 1000 ATK for each "Forbidden One" in GY
      else if (card.code === 13893596) {
        const exodiaCodes = [33396948, 7902349, 70903634, 44519536, 8124921];
        const count = pf.graveyard.filter((c) => exodiaCodes.includes(c.code)).length;
        card.atk = count * 1000;
        card.baseAtk = count * 1000;
      }
    }
  }

  public getBoardState(): DuelBoardState {
    const rawUserField: PlayerFieldState = this.humanPlayerId === 0 ? this.player0Field : this.player1Field;
    const rawOpponentField: PlayerFieldState = this.humanPlayerId === 0 ? this.player1Field : this.player0Field;

    this.enrichStatusesForField(rawUserField);
    this.enrichStatusesForField(rawOpponentField);
    this.syncFieldCardStats();
    this.enrichDynamicStatsForField(rawUserField, rawOpponentField);
    this.enrichDynamicStatsForField(rawOpponentField, rawUserField);

    const userField = this.viewFilter.filterPlayerFieldForViewer(rawUserField, this.humanPlayerId, rawOpponentField);
    const opponentField = this.viewFilter.filterPlayerFieldForViewer(rawOpponentField, this.humanPlayerId, rawUserField);

    return {
      userField,
      opponentField,
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
    this.scriptReader.close();
  }
}

export const duelEngineService = new DuelEngineService();
