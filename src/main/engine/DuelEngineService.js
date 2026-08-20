import createCore, { OcgDuelMode, OcgProcessResult, OcgLocation, OcgPosition, OcgMessageType, OcgResponseType, } from 'ocgcore-wasm';
import path from 'node:path';
import fs from 'node:fs';
import { CardReaderService } from './cardReader.js';
import { ScriptReaderService } from './scriptReader.js';
import { MessageDecoder, getAutoResponse } from './messageDecoder.js';
import { ViewFilterService } from './viewFilter.js';
export class DuelEngineService {
    lib = null;
    currentDuel = null;
    cardReader;
    scriptReader;
    messageDecoder;
    viewFilter;
    lastPromptMessage = null;
    humanPlayerId = 0;
    cardVideos = {};
    // Tracked Board States for Player 0 and Player 1
    player0Field = this.createEmptyPlayerState(0, 'Player 0');
    player1Field = this.createEmptyPlayerState(1, 'Player 1');
    state = {
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
    autoPlay = false;
    isVideoPlaying = false;
    eventListeners = [];
    videoEventListeners = [];
    aiStepTimer = null;
    AI_STEP_DELAY_MS = 650;
    constructor() {
        this.cardReader = new CardReaderService();
        this.scriptReader = new ScriptReaderService();
        this.messageDecoder = new MessageDecoder(this.cardReader);
        this.viewFilter = new ViewFilterService();
        this.loadCardVideos();
    }
    loadCardVideos() {
        try {
            const jsonPath = path.resolve(process.cwd(), 'data/card-videos.json');
            if (fs.existsSync(jsonPath)) {
                const content = fs.readFileSync(jsonPath, 'utf-8');
                this.cardVideos = JSON.parse(content);
            }
        }
        catch (err) {
            console.warn('[DuelEngineService] Failed to load card-videos.json:', err);
            this.cardVideos = {};
        }
    }
    reindexHand(pf) {
        for (let i = 0; i < pf.hand.length; i++) {
            pf.hand[i].sequence = i;
        }
    }
    createEmptyPlayerState(playerId, name) {
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
    getPlayerField(controller) {
        return controller === 0 ? this.player0Field : this.player1Field;
    }
    async init() {
        if (!this.lib) {
            this.lib = await createCore({ sync: true });
            const [maj, min] = this.lib.getVersion();
            console.log(`[DuelEngineService] ocgcore-wasm initialized (v${maj}.${min})`);
        }
        return this.getStatus();
    }
    getStatus() {
        const cardCount = this.cardReader.getCardCount();
        let scriptsCount = 0;
        try {
            const officialScriptsDir = path.join(this.scriptReader.getScriptsDirectory(), 'official');
            if (fs.existsSync(officialScriptsDir)) {
                scriptsCount = fs.readdirSync(officialScriptsDir).filter((f) => f.endsWith('.lua')).length;
            }
        }
        catch {
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
    onEvent(callback) {
        this.eventListeners.push(callback);
        return () => {
            this.eventListeners = this.eventListeners.filter((cb) => cb !== callback);
        };
    }
    onPlayVideo(callback) {
        this.videoEventListeners.push(callback);
        return () => {
            this.videoEventListeners = this.videoEventListeners.filter((cb) => cb !== callback);
        };
    }
    emitEvent(event) {
        const filteredEvent = this.viewFilter.filterEventForViewer(event, this.humanPlayerId);
        for (const listener of this.eventListeners) {
            listener(filteredEvent);
        }
    }
    emitVideoEvent(payload) {
        for (const listener of this.videoEventListeners) {
            listener(payload);
        }
    }
    startNewDuel(options) {
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
            isVideoPlaying: false,
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
            cardReader: (code) => this.cardReader.readCard(code),
            scriptReader: (name) => this.scriptReader.readScript(name),
            errorHandler: (type, text) => {
                console.warn(`[DuelEngineService Lua Error (${type})]: ${text}`);
            },
        });
        if (!handle) {
            throw new Error('[DuelEngineService] Failed to create ocgcore duel handle.');
        }
        this.currentDuel = handle;
        // Load all base engine scripts and procedures into duel state
        const coreScripts = [
            'constant.lua',
            'utility.lua',
            'cards_specific_functions.lua',
            'proc_fusion.lua',
            'proc_fusion_spell.lua',
            'proc_ritual.lua',
            'proc_synchro.lua',
            'proc_xyz.lua',
            'proc_union.lua',
            'proc_link.lua',
            'proc_pendulum.lua',
            'proc_equip.lua',
            'proc_gemini.lua',
            'proc_spirit.lua',
            'proc_normal.lua',
            'proc_persistent.lua',
            'proc_workaround.lua',
            'deprecated_functions.lua',
        ];
        for (const scriptName of coreScripts) {
            const src = this.scriptReader.getBaseScript(scriptName);
            if (src) {
                try {
                    this.lib.loadScript(handle, scriptName, src);
                }
                catch (err) {
                    console.warn(`[DuelEngineService] Failed preloading ${scriptName}:`, err);
                }
            }
        }
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
                const card = {
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
                const card = {
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
                const card = {
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
                    statuses: this.computeCardStatuses({ code, location: 'extra-deck', position: 'facedown_defense' }),
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
                const card = {
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
                    statuses: this.computeCardStatuses({ code, location: 'extra-deck', position: 'facedown_defense' }),
                };
                this.player1Field.extraDeck.push(card);
            }
            this.player1Field.extraDeckCount = this.player1Field.extraDeck.length;
        }
        if (options.player0Monsters) {
            for (const m of options.player0Monsters) {
                const pos = (m.position ?? OcgPosition.FACEUP_ATTACK);
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
                let pState = 'faceup_attack';
                if ((pos & OcgPosition.FACEUP_ATTACK) !== 0)
                    pState = 'faceup_attack';
                else if ((pos & OcgPosition.FACEUP_DEFENSE) !== 0)
                    pState = 'faceup_defense';
                else if ((pos & OcgPosition.FACEDOWN_DEFENSE) !== 0)
                    pState = 'facedown_defense';
                const card = {
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
                const pos = (m.position ?? OcgPosition.FACEUP_ATTACK);
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
                let pState = 'faceup_attack';
                if ((pos & OcgPosition.FACEUP_ATTACK) !== 0)
                    pState = 'faceup_attack';
                else if ((pos & OcgPosition.FACEUP_DEFENSE) !== 0)
                    pState = 'faceup_defense';
                else if ((pos & OcgPosition.FACEDOWN_DEFENSE) !== 0)
                    pState = 'facedown_defense';
                const card = {
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
        this.lib.startDuel(handle);
        // Run initial processing step
        this.processStep();
        return true;
    }
    /**
     * Computes the active 7 status flags for a card based on rules and engine state.
     */
    computeCardStatuses(card) {
        const statuses = card.statuses ? [...card.statuses] : [];
        // 1. Cannot Attack
        const isDefense = card.position === 'faceup_defense' || card.position === 'facedown_defense';
        const isTurn1 = this.state.currentTurn <= 1;
        if ((card.location === 'monster' || card.location === 'extra-monster') && (isDefense || isTurn1)) {
            if (!statuses.includes('no-attack'))
                statuses.push('no-attack');
        }
        // 2. Cannot Be Special Summoned (Spirit monsters, Nomi monsters, Rituals/Fusions in hand without proc)
        if (card.code > 0) {
            const detail = this.cardReader.getCardDetail(card.code);
            if (detail && detail.desc && (detail.desc.includes('Cannot be Special Summoned') || detail.desc.includes('This card cannot be Special Summoned') || detail.isSpirit)) {
                if (!statuses.includes('no-special-summon'))
                    statuses.push('no-special-summon');
            }
        }
        return Array.from(new Set(statuses));
    }
    enrichStatusesForField(pf) {
        for (const card of pf.monsterZones) {
            if (card)
                card.statuses = this.computeCardStatuses(card);
        }
        for (const card of pf.spellTrapZones) {
            if (card)
                card.statuses = this.computeCardStatuses(card);
        }
        if (pf.fieldZone) {
            pf.fieldZone.statuses = this.computeCardStatuses(pf.fieldZone);
        }
    }
    checkVideoTrigger(msg) {
        const rawType = msg.type;
        // 1. Summon / Special Summon Video Trigger
        if ((rawType === OcgMessageType.SUMMONING || rawType === OcgMessageType.SPSUMMONING) && 'code' in msg) {
            const code = msg.code;
            const entry = this.cardVideos[String(code)];
            if (entry && entry.summon) {
                return {
                    code,
                    cardName: entry.cardName || this.cardReader.getCardName(code),
                    videoType: 'summon',
                    videoPath: entry.summon,
                    controller: msg.controller,
                    isPlaceholder: !!entry.isPlaceholder,
                };
            }
        }
        // 2. Attack Video Trigger
        if (rawType === OcgMessageType.ATTACK && 'card' in msg) {
            const cardInfo = msg.card;
            let code = cardInfo.code ?? 0;
            if (!code || code <= 0) {
                const pf = this.getPlayerField(cardInfo.controller);
                code = pf.monsterZones[cardInfo.sequence]?.code ?? 0;
            }
            if (code > 0) {
                const entry = this.cardVideos[String(code)];
                if (entry && entry.attack) {
                    return {
                        code,
                        cardName: entry.cardName || this.cardReader.getCardName(code),
                        videoType: 'attack',
                        videoPath: entry.attack,
                        controller: cardInfo.controller,
                        isPlaceholder: !!entry.isPlaceholder,
                    };
                }
            }
        }
        // 3. Victory Cutscene Video Trigger (e.g. Exodia 0x10)
        if (rawType === OcgMessageType.WIN && 'reason' in msg) {
            const reason = msg.reason;
            if (reason === 0x10) {
                return {
                    code: 33396948,
                    cardName: 'Exodia the Forbidden One',
                    videoType: 'victory',
                    videoPath: 'resources/videos/cards/victory_33396948.mp4',
                    controller: typeof msg.player === 'number' ? msg.player : 0,
                    isPlaceholder: true,
                };
            }
        }
        return null;
    }
    updateBoardStateFromMessage(msg) {
        const rawType = msg.type;
        const m = msg;
        if (rawType === OcgMessageType.NEW_TURN && 'player' in msg) {
            const activePlayer = msg.player;
            this.player0Field.isTurn = activePlayer === 0;
            this.player1Field.isTurn = activePlayer === 1;
        }
        else if (rawType === OcgMessageType.DRAW && 'drawn' in msg && Array.isArray(msg.drawn)) {
            const pf = this.getPlayerField(msg.player);
            pf.deckCount = Math.max(0, pf.deckCount - msg.drawn.length);
            for (const item of msg.drawn) {
                const isHuman = msg.player === this.humanPlayerId;
                const code = isHuman ? item.code : 0;
                const detail = code > 0 ? this.cardReader.getCardDetail(code) : null;
                const card = {
                    id: `hand-${msg.player}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    code,
                    name: detail?.name ?? (code > 0 ? this.cardReader.getCardName(code) : 'Card Back'),
                    controller: msg.player,
                    location: 'hand',
                    sequence: pf.hand.length,
                    position: isHuman ? 'faceup_spell' : 'facedown_spell',
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
        }
        else if (rawType === OcgMessageType.SHUFFLE_HAND && 'player' in msg && Array.isArray(msg.cards)) {
            const pf = this.getPlayerField(msg.player);
            const newCodes = msg.cards;
            if (newCodes && newCodes.length > 0 && msg.player === this.humanPlayerId) {
                const remaining = [...pf.hand];
                const newHand = [];
                for (const c of newCodes) {
                    const idx = remaining.findIndex((card) => card && card.code === c);
                    if (idx >= 0) {
                        newHand.push(remaining.splice(idx, 1)[0]);
                    }
                    else if (remaining.length > 0) {
                        newHand.push(remaining.shift());
                    }
                }
                while (remaining.length > 0) {
                    newHand.push(remaining.shift());
                }
                for (let i = 0; i < newHand.length; i++) {
                    newHand[i].sequence = i;
                }
                pf.hand = newHand;
            }
            else {
                this.reindexHand(pf);
            }
        }
        else if (rawType === OcgMessageType.MOVE && 'from' in msg && 'to' in msg && 'card' in msg) {
            const reason = typeof m.reason === 'number' ? m.reason : 0;
            this.handleCardMove(msg.card, msg.from, msg.to, reason);
        }
        else if (rawType === OcgMessageType.FLIPSUMMONING && 'code' in msg) {
            const { controller, sequence, code } = msg;
            const pf = this.getPlayerField(controller);
            const seq = sequence ?? 0;
            if (pf.monsterZones[seq]) {
                const card = pf.monsterZones[seq];
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
                card.statuses = this.computeCardStatuses(card);
            }
        }
        else if (rawType === OcgMessageType.POS_CHANGE && 'position' in msg) {
            const { controller, location, sequence, position, code } = msg;
            const pf = this.getPlayerField(controller);
            const isMonsterZone = location === OcgLocation.MZONE || location === undefined;
            const targetList = isMonsterZone ? pf.monsterZones : pf.spellTrapZones;
            const seq = sequence ?? 0;
            if (targetList[seq]) {
                const card = targetList[seq];
                card.position = this.convertPosition(position, isMonsterZone);
                if (typeof code === 'number' && code > 0) {
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
                card.statuses = this.computeCardStatuses(card);
            }
        }
        else if (rawType === OcgMessageType.DAMAGE && 'player' in msg && 'amount' in msg) {
            const pf = this.getPlayerField(msg.player);
            pf.currentLp = Math.max(0, pf.currentLp - msg.amount);
            if (msg.player === 0)
                this.state.p0LP = pf.currentLp;
            else
                this.state.p1LP = pf.currentLp;
        }
        else if (rawType === OcgMessageType.RECOVER && 'player' in msg && 'amount' in msg) {
            const pf = this.getPlayerField(msg.player);
            pf.currentLp = pf.currentLp + msg.amount;
            if (msg.player === 0)
                this.state.p0LP = pf.currentLp;
            else
                this.state.p1LP = pf.currentLp;
        }
        else if (rawType === OcgMessageType.LPUPDATE && 'player' in msg && 'lp' in msg) {
            const pf = this.getPlayerField(msg.player);
            pf.currentLp = msg.lp;
            if (msg.player === 0)
                this.state.p0LP = pf.currentLp;
            else
                this.state.p1LP = pf.currentLp;
        }
    }
    handleCardMove(code, from, to, reason = 0) {
        if (from.location === to.location && from.controller === to.controller && from.sequence === to.sequence) {
            return;
        }
        let movedCard = null;
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
            }
            else if (from.location === OcgLocation.MZONE) {
                movedCard = fromPf.monsterZones[from.sequence];
                fromPf.monsterZones[from.sequence] = null;
            }
            else if (from.location === OcgLocation.SZONE) {
                movedCard = fromPf.spellTrapZones[from.sequence];
                fromPf.spellTrapZones[from.sequence] = null;
            }
            else if (from.location === OcgLocation.FZONE) {
                movedCard = fromPf.fieldZone;
                fromPf.fieldZone = null;
            }
            else if (from.location === OcgLocation.GRAVE) {
                const idx = fromPf.graveyard.findIndex((c) => c.code === code);
                if (idx >= 0)
                    movedCard = fromPf.graveyard.splice(idx, 1)[0];
            }
            else if (from.location === OcgLocation.REMOVED) {
                const idx = fromPf.banished.findIndex((c) => c.code === code);
                if (idx >= 0)
                    movedCard = fromPf.banished.splice(idx, 1)[0];
            }
            else if (from.location === OcgLocation.EXTRA) {
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
                controller: to.controller,
                location: 'monster',
                sequence: to.sequence,
                position: 'faceup_attack',
                atk: detail?.isMonster ? detail.atk : undefined,
                def: detail?.isMonster ? detail.def : undefined,
                level: detail?.isMonster ? detail.level : undefined,
                attribute: detail?.attributeName,
                race: detail?.raceName,
                description: detail?.desc,
                statuses: [],
            };
        }
        else {
            movedCard.code = finalCode;
            movedCard.name = cardName;
            movedCard.controller = to.controller;
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
                let pos = 'faceup_attack';
                if ((to.position & OcgPosition.FACEUP_ATTACK) !== 0)
                    pos = 'faceup_attack';
                else if ((to.position & OcgPosition.FACEUP_DEFENSE) !== 0)
                    pos = 'faceup_defense';
                else if ((to.position & OcgPosition.FACEDOWN_DEFENSE) !== 0)
                    pos = 'facedown_defense';
                movedCard.location = 'monster';
                movedCard.sequence = to.sequence;
                movedCard.position = pos;
                movedCard.statuses = this.computeCardStatuses(movedCard);
                toPf.monsterZones[to.sequence] = movedCard;
            }
            else if (to.location === OcgLocation.SZONE) {
                const isFaceup = (to.position & OcgPosition.FACEUP) !== 0;
                movedCard.location = 'spell-trap';
                movedCard.sequence = to.sequence;
                movedCard.position = isFaceup ? 'faceup_spell' : 'facedown_spell';
                movedCard.statuses = this.computeCardStatuses(movedCard);
                toPf.spellTrapZones[to.sequence] = movedCard;
            }
            else if (to.location === OcgLocation.FZONE) {
                movedCard.location = 'field';
                movedCard.sequence = 0;
                movedCard.position = 'faceup_spell';
                movedCard.statuses = this.computeCardStatuses(movedCard);
                toPf.fieldZone = movedCard;
            }
            else if (to.location === OcgLocation.HAND) {
                movedCard.location = 'hand';
                movedCard.sequence = toPf.hand.length;
                movedCard.position = to.controller === this.humanPlayerId ? 'faceup_spell' : 'facedown_spell';
                if (to.controller !== this.humanPlayerId)
                    movedCard.code = 0;
                movedCard.statuses = this.computeCardStatuses(movedCard);
                toPf.hand.push(movedCard);
                this.reindexHand(toPf);
            }
            else if (to.location === OcgLocation.GRAVE) {
                movedCard.location = 'graveyard';
                movedCard.sequence = toPf.graveyard.length;
                movedCard.position = 'faceup_spell';
                toPf.graveyard.unshift(movedCard);
            }
            else if (to.location === OcgLocation.REMOVED) {
                movedCard.location = 'banished';
                movedCard.sequence = toPf.banished.length;
                movedCard.position = 'faceup_spell';
                toPf.banished.unshift(movedCard);
            }
            else if (to.location === OcgLocation.EXTRA) {
                movedCard.location = 'extra-deck';
                movedCard.sequence = toPf.extraDeck.length;
                movedCard.position = 'facedown_spell';
                toPf.extraDeck.unshift(movedCard);
                toPf.extraDeckCount = toPf.extraDeck.length;
            }
        }
    }
    destroyCurrentDuel() {
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
    scheduleAiResponse(handle, response) {
        if (this.aiStepTimer) {
            clearTimeout(this.aiStepTimer);
        }
        if (this.isVideoPlaying) {
            return;
        }
        this.aiStepTimer = setTimeout(() => {
            if (!this.lib || !this.currentDuel || !this.state.isActive || this.isVideoPlaying)
                return;
            try {
                this.lib.duelSetResponse(handle, response);
                this.state.isWaitingResponse = false;
                this.state.waitingPlayer = null;
                this.lastPromptMessage = null;
                this.processStep();
            }
            catch (err) {
                console.error('[DuelEngineService] AI Step Execution Error:', err);
            }
        }, this.AI_STEP_DELAY_MS);
    }
    convertPosition(position, isMonster) {
        if (isMonster) {
            if ((position & OcgPosition.FACEDOWN_DEFENSE) !== 0)
                return 'facedown_defense';
            if ((position & OcgPosition.FACEUP_DEFENSE) !== 0)
                return 'faceup_defense';
            return 'faceup_attack';
        }
        return (position & OcgPosition.FACEUP) !== 0 ? 'faceup_spell' : 'facedown_spell';
    }
    shuffleArray(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        return result;
    }
    onVideoFinished() {
        if (!this.isVideoPlaying)
            return;
        console.log('[DuelEngineService] Video finished. Resuming engine process loop.');
        this.isVideoPlaying = false;
        this.state.isVideoPlaying = false;
        if (this.lib && this.currentDuel && this.state.isActive) {
            this.processStep();
        }
    }
    processStep() {
        if (!this.lib || !this.currentDuel || !this.state.isActive || this.isVideoPlaying) {
            return [];
        }
        const handle = this.currentDuel;
        const allDecodedEvents = [];
        // If we are currently waiting for a response, check if we need to auto-respond
        if (this.state.isWaitingResponse && this.lastPromptMessage) {
            const response = getAutoResponse(this.lastPromptMessage);
            if (response) {
                this.lib.duelSetResponse(handle, response);
                this.state.isWaitingResponse = false;
                this.state.waitingPlayer = null;
                this.lastPromptMessage = null;
            }
            else {
                return [];
            }
        }
        // Process engine steps
        let maxSubSteps = 100;
        while (this.state.isActive && !this.isVideoPlaying && maxSubSteps > 0) {
            maxSubSteps--;
            const status = this.lib.duelProcess(handle);
            const rawMessages = this.lib.duelGetMessage(handle);
            for (const msg of rawMessages) {
                const decoded = this.messageDecoder.decode(msg);
                allDecodedEvents.push(decoded);
                // Update internal board tracking
                this.updateBoardStateFromMessage(msg);
                // Check for special card video triggers (summon/attack)
                const videoPayload = this.checkVideoTrigger(msg);
                // Track internal state
                if (decoded.type === 'NEW_TURN') {
                    this.state.currentTurn++;
                    decoded.turn = this.state.currentTurn;
                    decoded.description = `Turn ${this.state.currentTurn} begins. Active player: Player ${decoded.player}`;
                }
                if (decoded.phase !== undefined) {
                    this.state.currentPhase = decoded.phase || 'M1';
                }
                if (decoded.type === 'LPUPDATE' &&
                    decoded.player !== undefined &&
                    decoded.lp !== undefined) {
                    if (decoded.player === 0)
                        this.state.p0LP = decoded.lp;
                    if (decoded.player === 1)
                        this.state.p1LP = decoded.lp;
                }
                if (decoded.type === 'DAMAGE' &&
                    decoded.player !== undefined &&
                    decoded.amount !== undefined) {
                    if (decoded.player === 0)
                        this.state.p0LP = Math.max(0, this.state.p0LP - decoded.amount);
                    if (decoded.player === 1)
                        this.state.p1LP = Math.max(0, this.state.p1LP - decoded.amount);
                }
                if (decoded.type === 'RECOVER' &&
                    decoded.player !== undefined &&
                    decoded.amount !== undefined) {
                    if (decoded.player === 0)
                        this.state.p0LP += decoded.amount;
                    if (decoded.player === 1)
                        this.state.p1LP += decoded.amount;
                }
                if (decoded.type === 'WIN') {
                    this.state.winner = decoded.player ?? null;
                    this.state.winReason = decoded.reason ?? null;
                    this.state.isActive = false;
                }
                if (!decoded.isPrompt) {
                    this.emitEvent(decoded);
                }
                // If a video trigger fired: freeze engine, clear AI timers, emit video event and pause process loop
                if (videoPayload) {
                    this.isVideoPlaying = true;
                    this.state.isVideoPlaying = true;
                    if (this.aiStepTimer) {
                        clearTimeout(this.aiStepTimer);
                        this.aiStepTimer = null;
                    }
                    this.emitVideoEvent(videoPayload);
                    break;
                }
            }
            this.state.stepCount++;
            if (this.isVideoPlaying) {
                break;
            }
            if (this.state.winner !== null || status === OcgProcessResult.END) {
                this.state.isActive = false;
                this.state.isWaitingResponse = false;
                this.lastPromptMessage = null;
                break;
            }
            if (status === OcgProcessResult.WAITING) {
                const lastMsg = rawMessages[rawMessages.length - 1];
                if (lastMsg) {
                    const promptPlayer = 'player' in lastMsg ? lastMsg.player : 0;
                    this.state.isWaitingResponse = true;
                    this.state.waitingPlayer = promptPlayer;
                    this.lastPromptMessage = lastMsg;
                    // Auto-resolve SELECT_PLACE and SELECT_DISFIELD for smooth card placement
                    if (lastMsg.type === OcgMessageType.SELECT_PLACE ||
                        lastMsg.type === OcgMessageType.SELECT_DISFIELD) {
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
                    if (lastMsg.type === OcgMessageType.SELECT_CHAIN &&
                        !lastMsg.forced &&
                        (!lastMsg.selects || lastMsg.selects.length === 0)) {
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
    sendResponse(response) {
        if (!this.lib || !this.currentDuel || !this.state.isActive || this.isVideoPlaying) {
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
        }
        catch (err) {
            console.error('[DuelEngineService] Failed to set response:', err);
            return false;
        }
    }
    setAutoPlay(autoPlay) {
        this.autoPlay = autoPlay;
        if (autoPlay && this.state.isActive && this.state.isWaitingResponse && this.lastPromptMessage && !this.isVideoPlaying) {
            const response = getAutoResponse(this.lastPromptMessage);
            if (response) {
                this.sendResponse(response);
            }
        }
    }
    getState() {
        return { ...this.state, isVideoPlaying: this.isVideoPlaying };
    }
    enrichDynamicStatsForField(pf, oppPf) {
        for (const card of pf.monsterZones) {
            if (!card || card.code <= 0)
                continue;
            // Slifer the Sky Dragon (10000020): gains 1000 ATK/DEF per card in hand
            if (card.code === 10000020) {
                card.atk = pf.hand.length * 1000;
                card.def = pf.hand.length * 1000;
            }
            // Tragoedia (98777992): gains 600 ATK/DEF per card in hand
            else if (card.code === 98777992) {
                card.atk = pf.hand.length * 600;
                card.def = pf.hand.length * 600;
            }
            // Gren Maju Da Eiza (36584821): gains 400 ATK/DEF per banished card
            else if (card.code === 36584821) {
                const totalBanished = pf.banished.length + oppPf.banished.length;
                card.atk = totalBanished * 400;
                card.def = totalBanished * 400;
            }
            // King of the Skull Servants (36021814): 1000 ATK per Skull Servant / King in GY
            else if (card.code === 36021814) {
                const servCodes = [32274490, 36021814, 16638212, 78636495];
                const count = pf.graveyard.filter((c) => servCodes.includes(c.code)).length;
                card.atk = count * 1000;
                card.def = 0;
            }
        }
    }
    getBoardState() {
        const rawUserField = this.humanPlayerId === 0 ? this.player0Field : this.player1Field;
        const rawOpponentField = this.humanPlayerId === 0 ? this.player1Field : this.player0Field;
        this.enrichStatusesForField(rawUserField);
        this.enrichStatusesForField(rawOpponentField);
        this.enrichDynamicStatsForField(rawUserField, rawOpponentField);
        this.enrichDynamicStatsForField(rawOpponentField, rawUserField);
        const userField = this.viewFilter.filterPlayerFieldForViewer(rawUserField, this.humanPlayerId);
        const opponentField = this.viewFilter.filterPlayerFieldForViewer(rawOpponentField, this.humanPlayerId);
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
    getCardName(code) {
        return this.cardReader.getCardName(code);
    }
    getAllCards() {
        return this.cardReader.getAllCards();
    }
    getCardReader() {
        return this.cardReader;
    }
    close() {
        this.destroyCurrentDuel();
        this.cardReader.close();
        this.scriptReader.close();
    }
}
export const duelEngineService = new DuelEngineService();
