import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getBackgroundUrl } from '../utils/media.js';
import { useDuelStore } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import { getActionGuideInfo } from '../utils/guidanceHelper.js';
import { DuelHud, DuelField, LifePointsMeter, HandFan, CardPreviewPopup, DuelMenuModal, DuelLogPanel, CardActionMenu, PromptModal, CardAnimationOverlay, CardListModal, CardSelectionModal, VideoOverlay, } from '../components/duel/index.js';
import { duelAnimationQueue, playCardFlight, getZoneRect, getHandCardRect, getHandFanRect, getStackRect, getAvatarRect, setAnimationUserPlayerId, } from '../utils/animationService.js';
const router = useRouter();
const duelStore = useDuelStore();
const settingsStore = useSettingsStore();
// Modals and Drawers
const isMenuOpen = ref(false);
const isDuelLogOpen = ref(false);
const isInspectModalOpen = ref(false);
const activeInspectStack = ref(null);
function onInspectStack(stackType, controller) {
    const isUser = controller === duelStore.userPlayerId;
    const pf = isUser ? currentBoardState.value.userField : currentBoardState.value.opponentField;
    const ownerName = isUser ? 'Your' : `${pf.name || 'Opponent'}'s`;
    const owner = isUser ? 'user' : 'ai';
    let cards = [];
    let title = '';
    if (stackType === 'graveyard') {
        cards = pf.graveyard || [];
        title = `${ownerName} Graveyard`;
    }
    else if (stackType === 'extra') {
        cards = pf.extraDeck || [];
        title = `${ownerName} Extra Deck`;
    }
    else if (stackType === 'banished') {
        cards = pf.banished || [];
        title = `${ownerName} Banished Zone`;
    }
    // Those dialogs open only if [graveyard | extra-deck] has cards inside
    if (!cards || cards.length === 0) {
        return;
    }
    activeInspectStack.value = {
        title,
        cards,
        owner,
        type: stackType,
    };
    isInspectModalOpen.value = true;
}
// Hover-previewed card state (persists last hovered card even when mouse leaves)
const lastHoveredCard = ref(null);
function onCardHover(card) {
    if (!card)
        return;
    const isOpponentFacedown = card.controller !== duelStore.userPlayerId &&
        (card.position === 'facedown_defense' || card.position === 'facedown_spell' || card.code === 0);
    if (isOpponentFacedown) {
        return;
    }
    if (card.code > 0) {
        lastHoveredCard.value = card;
    }
}
// Card Action Menu State
const activeMenuCard = ref(null);
const activeCardActions = ref([]);
const menuAnchorPos = ref(null);
// Reactive board state selector
const currentBoardState = computed(() => duelStore.boardState);
const isUserWinner = computed(() => {
    return duelStore.boardState.winner === duelStore.userPlayerId;
});
const gameOverSubtitle = computed(() => {
    const isWinner = isUserWinner.value;
    const reason = duelStore.boardState.winReason;
    if (reason === 0x10) {
        return isWinner
            ? 'You have achieved victory by assembling all 5 pieces of Exodia the Forbidden One!'
            : 'Your opponent achieved victory by assembling all 5 pieces of Exodia the Forbidden One!';
    }
    if (reason === 0x11) {
        return isWinner
            ? 'Victory achieved by the effect of Final Countdown!'
            : 'Your opponent won by the effect of Final Countdown!';
    }
    if (reason === 0x15) {
        return isWinner
            ? 'Victory achieved by the effect of Destiny Board (FINAL)!'
            : 'Your opponent won by the effect of Destiny Board (FINAL)!';
    }
    if (reason === 0x1) {
        return isWinner
            ? 'Your opponent was unable to draw a card (Deck Out)!'
            : 'You were unable to draw a card (Deck Out)!';
    }
    if (reason === 0x2) {
        return isWinner
            ? 'Your opponent surrendered the duel.'
            : 'You surrendered the duel.';
    }
    return isWinner
        ? "You have reduced your opponent's Life Points to 0!"
        : 'Your Life Points reached 0.';
});
const allCardsList = computed(() => {
    return Array.from(duelStore.cardMap.values());
});
// Dynamic Plain-Language Action Guide Calculation
const actionGuideInfo = computed(() => {
    return getActionGuideInfo(duelStore.boardState, duelStore.boardState.userField.isTurn, {
        selectCard: duelStore.activeSelectCard,
        selectTribute: duelStore.activeSelectTribute,
        selectChain: duelStore.activeSelectChain,
        selectPosition: duelStore.activeSelectPosition,
        selectEffectYn: duelStore.activeSelectEffectYn,
        selectOption: duelStore.activeSelectOption,
    }, duelStore.selectedTargetIndices.length);
});
// Live Logs
const duelLogs = ref([]);
const activePreviewCard = computed(() => {
    if (lastHoveredCard.value && lastHoveredCard.value.code > 0) {
        return lastHoveredCard.value;
    }
    // Default fallback when duel starts: first revealed card in hand or on field
    return (currentBoardState.value.userField.hand.find((c) => c && c.code > 0) ||
        currentBoardState.value.userField.monsterZones.find((m) => m !== null && m.code > 0) ||
        currentBoardState.value.userField.spellTrapZones.find((s) => s !== null && s.code > 0) ||
        null);
});
function formatTime() {
    const d = new Date();
    return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(Math.floor(d.getMilliseconds() / 100))}`;
}
function appendLog(type, description) {
    duelLogs.value.push({
        time: formatTime(),
        type,
        description,
    });
}
function onHandCardClick(card, event) {
    if (duelStore.isVideoPlaying)
        return;
    onCardHover(card);
    // If there is an active selection prompt (e.g. Cost discard or hand cleanup)
    if (duelStore.hasActiveSelectionPrompt) {
        const target = duelStore.getTargetInfo(card.controller, 2, card.sequence ?? 0);
        if (target && target.isSelectable) {
            duelStore.toggleTargetByIndex(target.selectIndex);
            return;
        }
    }
    const actions = duelStore.getLegalActionsForHandCard(card);
    if (actions.length > 0) {
        activeMenuCard.value = card;
        activeCardActions.value = actions;
        menuAnchorPos.value = { x: event.clientX, y: event.clientY };
    }
    else {
        closeCardActionMenu();
    }
}
function onFieldCardClick(card, event, targetInfo) {
    if (duelStore.isVideoPlaying)
        return;
    // 1. If this slot/card is an active selectable target (Attack target, MST target, Tribute, etc.)
    if (targetInfo && targetInfo.isSelectable) {
        closeCardActionMenu();
        duelStore.toggleTargetByIndex(targetInfo.selectIndex);
        return;
    }
    // 2. If there is an active selection prompt, check target info by card location as fallback
    if (duelStore.hasActiveSelectionPrompt && card) {
        const loc = card.location === 'field' || card.position === 'faceup_spell' || card.position === 'facedown_spell' ? 8 : 4;
        const target = duelStore.getTargetInfo(card.controller, loc, card.sequence ?? 0);
        if (target && target.isSelectable) {
            closeCardActionMenu();
            duelStore.toggleTargetByIndex(target.selectIndex);
            return;
        }
        closeCardActionMenu();
        return;
    }
    // 3. Normal inspection & action menu
    if (!card || card.code === 0) {
        closeCardActionMenu();
        return;
    }
    const isOpponentFacedown = card.controller !== duelStore.userPlayerId &&
        (card.position === 'facedown_defense' || card.position === 'facedown_spell' || card.code === 0);
    if (isOpponentFacedown) {
        closeCardActionMenu();
        return;
    }
    onCardHover(card);
    // Only allow actions on player's own cards
    if (card.controller === duelStore.userPlayerId) {
        const actions = duelStore.getLegalActionsForFieldCard(card);
        if (actions.length > 0) {
            activeMenuCard.value = card;
            activeCardActions.value = actions;
            if (event) {
                menuAnchorPos.value = { x: event.clientX, y: event.clientY };
            }
        }
        else {
            closeCardActionMenu();
        }
    }
}
function onTargetClick(targetInfo) {
    if (duelStore.isVideoPlaying)
        return;
    if (targetInfo.isSelectable) {
        duelStore.toggleTargetByIndex(targetInfo.selectIndex);
    }
}
async function onSelectCardAction(action) {
    if (duelStore.isVideoPlaying)
        return;
    closeCardActionMenu();
    switch (action.type) {
        case 'summon':
            await duelStore.executeNormalSummon(action.index);
            break;
        case 'sp_summon':
            await duelStore.executeSpecialSummon(action.index);
            break;
        case 'monster_set':
            await duelStore.executeMonsterSet(action.index);
            break;
        case 'spell_set':
            await duelStore.executeSpellSet(action.index);
            break;
        case 'activate':
            await duelStore.executeActivate(action.index);
            break;
        case 'pos_change':
            await duelStore.executePosChange(action.index);
            break;
        case 'attack':
            await duelStore.executeDeclareAttack(action.index);
            break;
    }
}
function closeCardActionMenu() {
    activeMenuCard.value = null;
    activeCardActions.value = [];
    menuAnchorPos.value = null;
}
async function onRestartMatch() {
    isMenuOpen.value = false;
    closeCardActionMenu();
    appendLog('RESTART', 'Restarting live duel...');
    await duelStore.startPreparedDuel();
}
function onSurrender() {
    isMenuOpen.value = false;
    closeCardActionMenu();
    appendLog('SURRENDER', 'Player surrendered the match.');
    router.push('/main-menu');
}
function returnToCharacters() {
    router.push('/main-menu');
}
let unsubscribeEvents = null;
let unsubscribeVideo = null;
async function setupEngineEventListener() {
    if (!window.duelAPI)
        return;
    setAnimationUserPlayerId(duelStore.userPlayerId);
    const toDomOwner = (p) => p === duelStore.userPlayerId ? 'user' : 'ai';
    unsubscribeEvents = window.duelAPI.onEvent(async (event) => {
        appendLog(event.type, event.description);
        await duelAnimationQueue.enqueue(async () => {
            setAnimationUserPlayerId(duelStore.userPlayerId);
            // 1. Draw from Deck -> Hand (via DRAW message)
            if (event.type === 'DRAW' && event.player !== undefined) {
                const isHuman = event.player === duelStore.userPlayerId;
                const domOwner = toDomOwner(event.player);
                const fromRect = getStackRect(domOwner, 'deck');
                const toRect = getHandFanRect(domOwner);
                const drawnCode = event.drawn?.[0]?.code || event.drawnCards?.[0]?.code || event.code || 0;
                await playCardFlight({
                    code: isHuman ? drawnCode : 0,
                    cardName: event.cardName || 'Card Drawn',
                    fromRect,
                    toRect,
                    type: 'draw',
                    isFacedown: !isHuman,
                    durationMs: 420,
                });
            }
            // 2. Canonical Card Movement (Normal Summon, Special Summon, Set, Spell Activate, Destroy to GY, Discard, Banish)
            else if (event.type === 'MOVE') {
                const moveEvt = event;
                const p = (moveEvt.controller ?? duelStore.userPlayerId);
                const domOwner = toDomOwner(p);
                const fromLoc = moveEvt.fromLocation ?? 0;
                const fromSeq = moveEvt.fromSequence ?? 0;
                const toLoc = moveEvt.toLocation ?? 0;
                const toSeq = moveEvt.toSequence ?? 0;
                const isFaceup = (moveEvt.position & 1) !== 0;
                const isFacedown = !isFaceup;
                const isDefense = (moveEvt.position & 0xc) !== 0;
                if (toLoc === 16) {
                    // Sent / Destroyed to Graveyard
                    const fromRect = fromLoc === 2
                        ? getHandCardRect(domOwner, fromSeq) || getHandFanRect(domOwner)
                        : fromLoc === 1
                            ? getStackRect(domOwner, 'deck')
                            : getZoneRect(domOwner, fromLoc === 8 ? 'spell-trap' : 'monster', fromSeq);
                    const toRect = getStackRect(domOwner, 'graveyard');
                    await playCardFlight({
                        code: moveEvt.code || 0,
                        cardName: moveEvt.cardName,
                        fromRect,
                        toRect,
                        type: fromLoc === 2 ? 'discard' : 'destroy-gy',
                        durationMs: 440,
                    });
                }
                else if (toLoc === 8 && fromLoc === 2) {
                    // Hand -> Spell/Trap Zone (Faceup Activation or Facedown Set)
                    const fromRect = getHandCardRect(domOwner, fromSeq) || getHandFanRect(domOwner);
                    const toRect = getZoneRect(domOwner, fromSeq === 5 ? 'field' : 'spell-trap', toSeq);
                    await playCardFlight({
                        code: isFaceup || p === duelStore.userPlayerId ? (moveEvt.code || 0) : 0,
                        cardName: moveEvt.cardName || 'Spell Card',
                        fromRect,
                        toRect,
                        type: isFaceup ? 'spell-activate' : 'set-spell',
                        isFacedown,
                        isDefense: false,
                        durationMs: 480,
                    });
                }
                else if (toLoc === 4 && fromLoc === 2) {
                    // Hand -> Monster Zone (Faceup Normal/Special Summon or Facedown Set)
                    const fromRect = getHandCardRect(domOwner, fromSeq) || getHandFanRect(domOwner);
                    const toRect = getZoneRect(domOwner, 'monster', toSeq);
                    await playCardFlight({
                        code: isFaceup || p === duelStore.userPlayerId ? (moveEvt.code || 0) : 0,
                        cardName: moveEvt.cardName || 'Monster',
                        fromRect,
                        toRect,
                        type: isFaceup ? 'summon' : 'set-monster',
                        isFacedown,
                        isDefense,
                        durationMs: 480,
                    });
                }
                else if (toLoc === 4 && (fromLoc === 16 || fromLoc === 32 || fromLoc === 64)) {
                    // Graveyard / Banished / Extra Deck -> Monster Zone (Monster Reborn, Fusion, Synchro, Special Summon)
                    const fromRect = getStackRect(domOwner, fromLoc === 16 ? 'graveyard' : fromLoc === 32 ? 'banished' : 'extra');
                    const toRect = getZoneRect(domOwner, 'monster', toSeq);
                    await playCardFlight({
                        code: isFaceup || p === duelStore.userPlayerId ? (moveEvt.code || 0) : 0,
                        cardName: moveEvt.cardName || 'Monster',
                        fromRect,
                        toRect,
                        type: 'summon',
                        isFacedown,
                        isDefense,
                        durationMs: 480,
                    });
                }
                else if (toLoc === 32) {
                    // Banished
                    const fromRect = fromLoc === 2
                        ? getHandCardRect(domOwner, fromSeq) || getHandFanRect(domOwner)
                        : fromLoc === 16
                            ? getStackRect(domOwner, 'graveyard')
                            : getZoneRect(domOwner, fromLoc === 8 ? 'spell-trap' : 'monster', fromSeq);
                    const toRect = getStackRect(domOwner, 'banished');
                    await playCardFlight({
                        code: moveEvt.code || 0,
                        cardName: moveEvt.cardName,
                        fromRect,
                        toRect,
                        type: 'banish',
                        durationMs: 440,
                    });
                }
            }
            // 3. Chaining / Spell Activation Visual Glow Pause
            else if (event.type === 'CHAINING') {
                await new Promise((resolve) => setTimeout(resolve, 400));
            }
            // 4. Attack Declaration & Surge
            else if (event.type === 'ATTACK') {
                const atkEvt = event;
                const p = (atkEvt.controller ?? (duelStore.boardState.userField.isTurn ? duelStore.userPlayerId : duelStore.opponentPlayerId));
                const opp = (p === duelStore.userPlayerId ? duelStore.opponentPlayerId : duelStore.userPlayerId);
                const pDomOwner = toDomOwner(p);
                const oppDomOwner = toDomOwner(opp);
                const seq = atkEvt.sequence ?? (atkEvt.card?.sequence ?? 0);
                const fromRect = getZoneRect(pDomOwner, 'monster', seq);
                const toRect = atkEvt.target
                    ? getZoneRect(toDomOwner(atkEvt.target.controller), 'monster', atkEvt.target.sequence)
                    : (getHandFanRect(oppDomOwner) || getAvatarRect(oppDomOwner));
                await playCardFlight({
                    code: 0,
                    cardName: 'Battle Attack',
                    fromRect,
                    toRect,
                    type: 'attack',
                    durationMs: 440,
                });
            }
            // 5. Monster Position Change / Flip Summon
            else if (event.type === 'POS_CHANGE' || event.type === 'FLIPSUMMONING') {
                const p = (event.controller ?? duelStore.userPlayerId);
                const domOwner = toDomOwner(p);
                const seq = event.sequence ?? 0;
                const fromRect = getZoneRect(domOwner, 'monster', seq);
                await playCardFlight({
                    code: event.code || 0,
                    cardName: event.cardName || 'Position Change',
                    fromRect,
                    toRect: fromRect,
                    type: event.type === 'FLIPSUMMONING' ? 'flip' : 'pos-change',
                    isFacedown: event.position === 8,
                    isDefense: event.position === 4 || event.position === 8,
                    durationMs: 360,
                });
            }
            // Update store state incrementally as animation finishes
            await duelStore.handleEngineEvent(event);
        });
    });
}
onMounted(async () => {
    await settingsStore.initializeSettings();
    if (window.duelAPI) {
        await setupEngineEventListener();
        if (window.duelAPI.playVideo) {
            unsubscribeVideo = window.duelAPI.playVideo((video) => {
                duelStore.handlePlayVideo(video);
            });
        }
    }
    // Start fresh prepared live duel
    await duelStore.startPreparedDuel();
});
onUnmounted(() => {
    if (unsubscribeEvents) {
        unsubscribeEvents();
    }
    if (unsubscribeVideo) {
        unsubscribeVideo();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['game-over-title']} */ ;
/** @type {__VLS_StyleScopedClasses['game-over-title']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-duel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "duel-backdrop" },
    ...{ style: ({ backgroundImage: `url(${__VLS_ctx.getBackgroundUrl('loading-bg')})` }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "duel-vignette" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "duel-canvas-16-9" },
});
const __VLS_0 = {}.CardAnimationOverlay;
/** @type {[typeof __VLS_components.CardAnimationOverlay, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.DuelHud;
/** @type {[typeof __VLS_components.DuelHud, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onOpenMenu': {} },
    ...{ 'onToggleLog': {} },
    ...{ 'onToBattlePhase': {} },
    ...{ 'onToMainPhase2': {} },
    ...{ 'onToEndPhase': {} },
    turnNumber: (__VLS_ctx.currentBoardState.turnNumber),
    currentPhase: (__VLS_ctx.currentBoardState.currentPhase),
    isUserTurn: (__VLS_ctx.currentBoardState.userField.isTurn),
    guideText: (__VLS_ctx.currentBoardState.phaseGuideText),
    guideInfo: (__VLS_ctx.actionGuideInfo),
    isDuelLogOpen: (__VLS_ctx.isDuelLogOpen),
    canGoToBattlePhase: (__VLS_ctx.duelStore.canGoToBattlePhase),
    canGoToMainPhase2: (__VLS_ctx.duelStore.canGoToMainPhase2),
    canEndTurn: (__VLS_ctx.duelStore.canEndTurn),
}));
const __VLS_6 = __VLS_5({
    ...{ 'onOpenMenu': {} },
    ...{ 'onToggleLog': {} },
    ...{ 'onToBattlePhase': {} },
    ...{ 'onToMainPhase2': {} },
    ...{ 'onToEndPhase': {} },
    turnNumber: (__VLS_ctx.currentBoardState.turnNumber),
    currentPhase: (__VLS_ctx.currentBoardState.currentPhase),
    isUserTurn: (__VLS_ctx.currentBoardState.userField.isTurn),
    guideText: (__VLS_ctx.currentBoardState.phaseGuideText),
    guideInfo: (__VLS_ctx.actionGuideInfo),
    isDuelLogOpen: (__VLS_ctx.isDuelLogOpen),
    canGoToBattlePhase: (__VLS_ctx.duelStore.canGoToBattlePhase),
    canGoToMainPhase2: (__VLS_ctx.duelStore.canGoToMainPhase2),
    canEndTurn: (__VLS_ctx.duelStore.canEndTurn),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onOpenMenu: (...[$event]) => {
        __VLS_ctx.isMenuOpen = true;
    }
};
const __VLS_12 = {
    onToggleLog: (...[$event]) => {
        __VLS_ctx.isDuelLogOpen = !__VLS_ctx.isDuelLogOpen;
    }
};
const __VLS_13 = {
    onToBattlePhase: (__VLS_ctx.duelStore.executeToBattlePhase)
};
const __VLS_14 = {
    onToMainPhase2: (__VLS_ctx.duelStore.executeToMainPhase2)
};
const __VLS_15 = {
    onToEndPhase: (__VLS_ctx.duelStore.executeToEndPhase)
};
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "duel-top-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "opponent-hand-wrapper" },
});
const __VLS_16 = {}.HandFan;
/** @type {[typeof __VLS_components.HandFan, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onHoverCard': {} },
    player: "ai",
    cards: (__VLS_ctx.currentBoardState.opponentField.hand),
    getTargetInfo: ((card, idx) => __VLS_ctx.duelStore.getTargetInfo(__VLS_ctx.duelStore.opponentPlayerId, 2, card.sequence ?? idx)),
    isPromptActive: (__VLS_ctx.duelStore.hasActiveSelectionPrompt),
}));
const __VLS_18 = __VLS_17({
    ...{ 'onHoverCard': {} },
    player: "ai",
    cards: (__VLS_ctx.currentBoardState.opponentField.hand),
    getTargetInfo: ((card, idx) => __VLS_ctx.duelStore.getTargetInfo(__VLS_ctx.duelStore.opponentPlayerId, 2, card.sequence ?? idx)),
    isPromptActive: (__VLS_ctx.duelStore.hasActiveSelectionPrompt),
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onHoverCard: (__VLS_ctx.onCardHover)
};
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "opponent-lp-wrapper" },
});
const __VLS_24 = {}.LifePointsMeter;
/** @type {[typeof __VLS_components.LifePointsMeter, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    player: "ai",
    name: (__VLS_ctx.currentBoardState.opponentField.name),
    title: (__VLS_ctx.currentBoardState.opponentField.title),
    series: (__VLS_ctx.currentBoardState.opponentField.series),
    characterId: (__VLS_ctx.currentBoardState.opponentField.characterId),
    currentLp: (__VLS_ctx.currentBoardState.opponentField.currentLp),
    maxLp: (__VLS_ctx.currentBoardState.opponentField.maxLp),
    isTurn: (__VLS_ctx.currentBoardState.opponentField.isTurn),
}));
const __VLS_26 = __VLS_25({
    player: "ai",
    name: (__VLS_ctx.currentBoardState.opponentField.name),
    title: (__VLS_ctx.currentBoardState.opponentField.title),
    series: (__VLS_ctx.currentBoardState.opponentField.series),
    characterId: (__VLS_ctx.currentBoardState.opponentField.characterId),
    currentLp: (__VLS_ctx.currentBoardState.opponentField.currentLp),
    maxLp: (__VLS_ctx.currentBoardState.opponentField.maxLp),
    isTurn: (__VLS_ctx.currentBoardState.opponentField.isTurn),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "duel-center-area" },
});
const __VLS_28 = {}.DuelField;
/** @type {[typeof __VLS_components.DuelField, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    ...{ 'onClickTarget': {} },
    ...{ 'onInspectStack': {} },
    userState: (__VLS_ctx.currentBoardState.userField),
    opponentState: (__VLS_ctx.currentBoardState.opponentField),
    extraMonsterZones: (__VLS_ctx.currentBoardState.extraMonsterZones),
    userPlayerId: (__VLS_ctx.duelStore.userPlayerId),
    opponentPlayerId: (__VLS_ctx.duelStore.opponentPlayerId),
    getTargetInfo: (__VLS_ctx.duelStore.getTargetInfo),
    isPromptActive: (__VLS_ctx.duelStore.hasActiveSelectionPrompt),
}));
const __VLS_30 = __VLS_29({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    ...{ 'onClickTarget': {} },
    ...{ 'onInspectStack': {} },
    userState: (__VLS_ctx.currentBoardState.userField),
    opponentState: (__VLS_ctx.currentBoardState.opponentField),
    extraMonsterZones: (__VLS_ctx.currentBoardState.extraMonsterZones),
    userPlayerId: (__VLS_ctx.duelStore.userPlayerId),
    opponentPlayerId: (__VLS_ctx.duelStore.opponentPlayerId),
    getTargetInfo: (__VLS_ctx.duelStore.getTargetInfo),
    isPromptActive: (__VLS_ctx.duelStore.hasActiveSelectionPrompt),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onHoverCard: (__VLS_ctx.onCardHover)
};
const __VLS_36 = {
    onClickCard: (__VLS_ctx.onFieldCardClick)
};
const __VLS_37 = {
    onClickTarget: (__VLS_ctx.onTargetClick)
};
const __VLS_38 = {
    onInspectStack: (__VLS_ctx.onInspectStack)
};
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "duel-bottom-area" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-lp-wrapper" },
});
const __VLS_39 = {}.LifePointsMeter;
/** @type {[typeof __VLS_components.LifePointsMeter, ]} */ ;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
    player: "user",
    name: (__VLS_ctx.currentBoardState.userField.name),
    title: (__VLS_ctx.currentBoardState.userField.title),
    series: (__VLS_ctx.currentBoardState.userField.series),
    characterId: (__VLS_ctx.currentBoardState.userField.characterId),
    currentLp: (__VLS_ctx.currentBoardState.userField.currentLp),
    maxLp: (__VLS_ctx.currentBoardState.userField.maxLp),
    isTurn: (__VLS_ctx.currentBoardState.userField.isTurn),
}));
const __VLS_41 = __VLS_40({
    player: "user",
    name: (__VLS_ctx.currentBoardState.userField.name),
    title: (__VLS_ctx.currentBoardState.userField.title),
    series: (__VLS_ctx.currentBoardState.userField.series),
    characterId: (__VLS_ctx.currentBoardState.userField.characterId),
    currentLp: (__VLS_ctx.currentBoardState.userField.currentLp),
    maxLp: (__VLS_ctx.currentBoardState.userField.maxLp),
    isTurn: (__VLS_ctx.currentBoardState.userField.isTurn),
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-hand-wrapper" },
});
const __VLS_43 = {}.HandFan;
/** @type {[typeof __VLS_components.HandFan, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    player: "user",
    cards: (__VLS_ctx.currentBoardState.userField.hand),
    getTargetInfo: ((card, idx) => __VLS_ctx.duelStore.getTargetInfo(__VLS_ctx.duelStore.userPlayerId, 2, card.sequence ?? idx)),
    isPromptActive: (__VLS_ctx.duelStore.hasActiveSelectionPrompt),
}));
const __VLS_45 = __VLS_44({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    player: "user",
    cards: (__VLS_ctx.currentBoardState.userField.hand),
    getTargetInfo: ((card, idx) => __VLS_ctx.duelStore.getTargetInfo(__VLS_ctx.duelStore.userPlayerId, 2, card.sequence ?? idx)),
    isPromptActive: (__VLS_ctx.duelStore.hasActiveSelectionPrompt),
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
let __VLS_47;
let __VLS_48;
let __VLS_49;
const __VLS_50 = {
    onHoverCard: (__VLS_ctx.onCardHover)
};
const __VLS_51 = {
    onClickCard: (__VLS_ctx.onHandCardClick)
};
var __VLS_46;
if (__VLS_ctx.activeMenuCard && __VLS_ctx.activeCardActions.length > 0) {
    const __VLS_52 = {}.CardActionMenu;
    /** @type {[typeof __VLS_components.CardActionMenu, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onSelect': {} },
        ...{ 'onClose': {} },
        card: (__VLS_ctx.activeMenuCard),
        actions: (__VLS_ctx.activeCardActions),
        anchorPos: (__VLS_ctx.menuAnchorPos),
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onSelect': {} },
        ...{ 'onClose': {} },
        card: (__VLS_ctx.activeMenuCard),
        actions: (__VLS_ctx.activeCardActions),
        anchorPos: (__VLS_ctx.menuAnchorPos),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onSelect: (__VLS_ctx.onSelectCardAction)
    };
    const __VLS_60 = {
        onClose: (__VLS_ctx.closeCardActionMenu)
    };
    var __VLS_55;
}
const __VLS_61 = {}.PromptModal;
/** @type {[typeof __VLS_components.PromptModal, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    ...{ 'onSelectPosition': {} },
    ...{ 'onSelectChain': {} },
    ...{ 'onSelectEffectYn': {} },
    ...{ 'onSelectOption': {} },
    ...{ 'onAnnounceCard': {} },
    ...{ 'onAnnounceRace': {} },
    ...{ 'onAnnounceAttrib': {} },
    ...{ 'onAnnounceNumber': {} },
    selectChain: (__VLS_ctx.duelStore.activeSelectChain),
    selectPosition: (__VLS_ctx.duelStore.activeSelectPosition),
    selectEffectYn: (__VLS_ctx.duelStore.activeSelectEffectYn),
    selectOption: (__VLS_ctx.duelStore.activeSelectOption),
    announceCard: (__VLS_ctx.duelStore.activeAnnounceCard),
    announceRace: (__VLS_ctx.duelStore.activeAnnounceRace),
    announceAttrib: (__VLS_ctx.duelStore.activeAnnounceAttrib),
    announceNumber: (__VLS_ctx.duelStore.activeAnnounceNumber),
    allCards: (__VLS_ctx.allCardsList),
}));
const __VLS_63 = __VLS_62({
    ...{ 'onSelectPosition': {} },
    ...{ 'onSelectChain': {} },
    ...{ 'onSelectEffectYn': {} },
    ...{ 'onSelectOption': {} },
    ...{ 'onAnnounceCard': {} },
    ...{ 'onAnnounceRace': {} },
    ...{ 'onAnnounceAttrib': {} },
    ...{ 'onAnnounceNumber': {} },
    selectChain: (__VLS_ctx.duelStore.activeSelectChain),
    selectPosition: (__VLS_ctx.duelStore.activeSelectPosition),
    selectEffectYn: (__VLS_ctx.duelStore.activeSelectEffectYn),
    selectOption: (__VLS_ctx.duelStore.activeSelectOption),
    announceCard: (__VLS_ctx.duelStore.activeAnnounceCard),
    announceRace: (__VLS_ctx.duelStore.activeAnnounceRace),
    announceAttrib: (__VLS_ctx.duelStore.activeAnnounceAttrib),
    announceNumber: (__VLS_ctx.duelStore.activeAnnounceNumber),
    allCards: (__VLS_ctx.allCardsList),
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
let __VLS_65;
let __VLS_66;
let __VLS_67;
const __VLS_68 = {
    onSelectPosition: (__VLS_ctx.duelStore.executeSelectPosition)
};
const __VLS_69 = {
    onSelectChain: (__VLS_ctx.duelStore.executeSelectChain)
};
const __VLS_70 = {
    onSelectEffectYn: (__VLS_ctx.duelStore.executeSelectEffectYn)
};
const __VLS_71 = {
    onSelectOption: (__VLS_ctx.duelStore.executeSelectOption)
};
const __VLS_72 = {
    onAnnounceCard: (__VLS_ctx.duelStore.executeAnnounceCard)
};
const __VLS_73 = {
    onAnnounceRace: (__VLS_ctx.duelStore.executeAnnounceRace)
};
const __VLS_74 = {
    onAnnounceAttrib: (__VLS_ctx.duelStore.executeAnnounceAttrib)
};
const __VLS_75 = {
    onAnnounceNumber: (__VLS_ctx.duelStore.executeAnnounceNumber)
};
var __VLS_64;
if (__VLS_ctx.duelStore.hasActiveSelectionPrompt) {
    const __VLS_76 = {}.CardSelectionModal;
    /** @type {[typeof __VLS_components.CardSelectionModal, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onUpdate:modelValue': {} },
        ...{ 'onToggleIndex': {} },
        ...{ 'onCancel': {} },
        ...{ 'onConfirm': {} },
        modelValue: (__VLS_ctx.duelStore.isCardSelectionModalOpen),
        selectPayload: (__VLS_ctx.duelStore.activeSelectionPayload),
        selectedIndices: (__VLS_ctx.duelStore.selectedTargetIndices),
        canCancel: (Boolean(__VLS_ctx.duelStore.activeSelectCard?.can_cancel || __VLS_ctx.duelStore.activeSelectUnselectCard?.can_cancel)),
        min: (__VLS_ctx.duelStore.activeSelectionMin),
        max: (__VLS_ctx.duelStore.activeSelectionMax),
        instruction: (__VLS_ctx.actionGuideInfo?.instruction || 'Select card(s) to proceed with the active effect.'),
        subText: (__VLS_ctx.actionGuideInfo?.subText),
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onUpdate:modelValue': {} },
        ...{ 'onToggleIndex': {} },
        ...{ 'onCancel': {} },
        ...{ 'onConfirm': {} },
        modelValue: (__VLS_ctx.duelStore.isCardSelectionModalOpen),
        selectPayload: (__VLS_ctx.duelStore.activeSelectionPayload),
        selectedIndices: (__VLS_ctx.duelStore.selectedTargetIndices),
        canCancel: (Boolean(__VLS_ctx.duelStore.activeSelectCard?.can_cancel || __VLS_ctx.duelStore.activeSelectUnselectCard?.can_cancel)),
        min: (__VLS_ctx.duelStore.activeSelectionMin),
        max: (__VLS_ctx.duelStore.activeSelectionMax),
        instruction: (__VLS_ctx.actionGuideInfo?.instruction || 'Select card(s) to proceed with the active effect.'),
        subText: (__VLS_ctx.actionGuideInfo?.subText),
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        'onUpdate:modelValue': (...[$event]) => {
            if (!(__VLS_ctx.duelStore.hasActiveSelectionPrompt))
                return;
            __VLS_ctx.duelStore.isCardSelectionModalOpen = $event;
        }
    };
    const __VLS_84 = {
        onToggleIndex: (__VLS_ctx.duelStore.toggleTargetByIndex)
    };
    const __VLS_85 = {
        onCancel: (__VLS_ctx.duelStore.cancelActiveSelection)
    };
    const __VLS_86 = {
        onConfirm: (__VLS_ctx.duelStore.confirmActiveSelection)
    };
    var __VLS_79;
}
if (__VLS_ctx.duelStore.hasActiveSelectionPrompt && !__VLS_ctx.duelStore.isCardSelectionModalOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "target-confirmation-bar glass-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "target-bar-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "target-bar-icon" },
    });
    (__VLS_ctx.actionGuideInfo?.categoryIcon || '🎯');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "target-bar-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "target-bar-title" },
    });
    (__VLS_ctx.actionGuideInfo?.instruction);
    if (__VLS_ctx.actionGuideInfo?.subText) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "target-bar-detail" },
        });
        (__VLS_ctx.actionGuideInfo.subText);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "target-bar-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.duelStore.openCardSelectionModal) },
        ...{ class: "micro-btn micro-btn--browse" },
        title: "Open modal to browse and filter available cards",
    });
    (__VLS_ctx.duelStore.selectedTargetIndices.length);
    (__VLS_ctx.duelStore.activeSelectionMax);
    if (__VLS_ctx.duelStore.activeSelectCard?.can_cancel || __VLS_ctx.duelStore.activeSelectUnselectCard?.can_cancel) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.duelStore.cancelActiveSelection) },
            ...{ class: "micro-btn micro-btn--cancel" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.duelStore.confirmActiveSelection) },
        ...{ class: "micro-btn micro-btn--confirm" },
        disabled: (!__VLS_ctx.duelStore.canConfirmActiveSelection),
    });
    (__VLS_ctx.duelStore.selectedTargetIndices.length);
    (__VLS_ctx.duelStore.activeSelectionMax);
}
if (__VLS_ctx.duelStore.isGameOver) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "game-over-modal-backdrop" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "game-over-modal glass-panel" },
        ...{ class: (__VLS_ctx.isUserWinner ? 'game-over-modal--victory' : 'game-over-modal--defeat') },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "game-over-banner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "game-over-title" },
    });
    (__VLS_ctx.isUserWinner ? '👑 VICTORY!' : '💀 DEFEAT');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "game-over-subtitle" },
    });
    (__VLS_ctx.gameOverSubtitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "game-over-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onRestartMatch) },
        ...{ class: "action-btn action-btn--primary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.returnToCharacters) },
        ...{ class: "action-btn action-btn--secondary" },
    });
}
const __VLS_87 = {}.CardPreviewPopup;
/** @type {[typeof __VLS_components.CardPreviewPopup, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    card: (__VLS_ctx.activePreviewCard),
    position: "left",
}));
const __VLS_89 = __VLS_88({
    card: (__VLS_ctx.activePreviewCard),
    position: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
const __VLS_91 = {}.DuelMenuModal;
/** @type {[typeof __VLS_components.DuelMenuModal, ]} */ ;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    ...{ 'onClose': {} },
    ...{ 'onRestart': {} },
    ...{ 'onSurrender': {} },
    isOpen: (__VLS_ctx.isMenuOpen),
}));
const __VLS_93 = __VLS_92({
    ...{ 'onClose': {} },
    ...{ 'onRestart': {} },
    ...{ 'onSurrender': {} },
    isOpen: (__VLS_ctx.isMenuOpen),
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
let __VLS_95;
let __VLS_96;
let __VLS_97;
const __VLS_98 = {
    onClose: (...[$event]) => {
        __VLS_ctx.isMenuOpen = false;
    }
};
const __VLS_99 = {
    onRestart: (__VLS_ctx.onRestartMatch)
};
const __VLS_100 = {
    onSurrender: (__VLS_ctx.onSurrender)
};
var __VLS_94;
if (__VLS_ctx.activeInspectStack) {
    const __VLS_101 = {}.CardListModal;
    /** @type {[typeof __VLS_components.CardListModal, ]} */ ;
    // @ts-ignore
    const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
        ...{ 'onHoverCard': {} },
        modelValue: (__VLS_ctx.isInspectModalOpen),
        title: (__VLS_ctx.activeInspectStack.title),
        cards: (__VLS_ctx.activeInspectStack.cards),
        owner: (__VLS_ctx.activeInspectStack.owner),
        type: (__VLS_ctx.activeInspectStack.type),
    }));
    const __VLS_103 = __VLS_102({
        ...{ 'onHoverCard': {} },
        modelValue: (__VLS_ctx.isInspectModalOpen),
        title: (__VLS_ctx.activeInspectStack.title),
        cards: (__VLS_ctx.activeInspectStack.cards),
        owner: (__VLS_ctx.activeInspectStack.owner),
        type: (__VLS_ctx.activeInspectStack.type),
    }, ...__VLS_functionalComponentArgsRest(__VLS_102));
    let __VLS_105;
    let __VLS_106;
    let __VLS_107;
    const __VLS_108 = {
        onHoverCard: (__VLS_ctx.onCardHover)
    };
    var __VLS_104;
}
const __VLS_109 = {}.DuelLogPanel;
/** @type {[typeof __VLS_components.DuelLogPanel, ]} */ ;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
    ...{ 'onClose': {} },
    ...{ 'onClear': {} },
    isOpen: (__VLS_ctx.isDuelLogOpen),
    logs: (__VLS_ctx.duelLogs),
}));
const __VLS_111 = __VLS_110({
    ...{ 'onClose': {} },
    ...{ 'onClear': {} },
    isOpen: (__VLS_ctx.isDuelLogOpen),
    logs: (__VLS_ctx.duelLogs),
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
let __VLS_113;
let __VLS_114;
let __VLS_115;
const __VLS_116 = {
    onClose: (...[$event]) => {
        __VLS_ctx.isDuelLogOpen = false;
    }
};
const __VLS_117 = {
    onClear: (...[$event]) => {
        __VLS_ctx.duelLogs = [];
    }
};
var __VLS_112;
const __VLS_118 = {}.VideoOverlay;
/** @type {[typeof __VLS_components.VideoOverlay, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    ...{ 'onFinish': {} },
    video: (__VLS_ctx.duelStore.activeVideoPayload),
    visible: (__VLS_ctx.duelStore.isVideoPlaying),
}));
const __VLS_120 = __VLS_119({
    ...{ 'onFinish': {} },
    video: (__VLS_ctx.duelStore.activeVideoPayload),
    visible: (__VLS_ctx.duelStore.isVideoPlaying),
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
let __VLS_122;
let __VLS_123;
let __VLS_124;
const __VLS_125 = {
    onFinish: (__VLS_ctx.duelStore.finishVideo)
};
var __VLS_121;
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "dev-floating-controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isDuelLogOpen = !__VLS_ctx.isDuelLogOpen;
        } },
    ...{ class: "dev-pill-btn" },
    title: "Toggle Duel Log Drawer",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
/** @type {__VLS_StyleScopedClasses['page-duel']} */ ;
/** @type {__VLS_StyleScopedClasses['duel-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['duel-vignette']} */ ;
/** @type {__VLS_StyleScopedClasses['duel-canvas-16-9']} */ ;
/** @type {__VLS_StyleScopedClasses['duel-top-area']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-hand-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-lp-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['duel-center-area']} */ ;
/** @type {__VLS_StyleScopedClasses['duel-bottom-area']} */ ;
/** @type {__VLS_StyleScopedClasses['user-lp-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['user-hand-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['target-confirmation-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['target-bar-info']} */ ;
/** @type {__VLS_StyleScopedClasses['target-bar-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['target-bar-text']} */ ;
/** @type {__VLS_StyleScopedClasses['target-bar-title']} */ ;
/** @type {__VLS_StyleScopedClasses['target-bar-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['target-bar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['micro-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['micro-btn--browse']} */ ;
/** @type {__VLS_StyleScopedClasses['micro-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['micro-btn--cancel']} */ ;
/** @type {__VLS_StyleScopedClasses['micro-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['micro-btn--confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['game-over-modal-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['game-over-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['game-over-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['game-over-title']} */ ;
/** @type {__VLS_StyleScopedClasses['game-over-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['game-over-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-floating-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-pill-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getBackgroundUrl: getBackgroundUrl,
            DuelHud: DuelHud,
            DuelField: DuelField,
            LifePointsMeter: LifePointsMeter,
            HandFan: HandFan,
            CardPreviewPopup: CardPreviewPopup,
            DuelMenuModal: DuelMenuModal,
            DuelLogPanel: DuelLogPanel,
            CardActionMenu: CardActionMenu,
            PromptModal: PromptModal,
            CardAnimationOverlay: CardAnimationOverlay,
            CardListModal: CardListModal,
            CardSelectionModal: CardSelectionModal,
            VideoOverlay: VideoOverlay,
            duelStore: duelStore,
            isMenuOpen: isMenuOpen,
            isDuelLogOpen: isDuelLogOpen,
            isInspectModalOpen: isInspectModalOpen,
            activeInspectStack: activeInspectStack,
            onInspectStack: onInspectStack,
            onCardHover: onCardHover,
            activeMenuCard: activeMenuCard,
            activeCardActions: activeCardActions,
            menuAnchorPos: menuAnchorPos,
            currentBoardState: currentBoardState,
            isUserWinner: isUserWinner,
            gameOverSubtitle: gameOverSubtitle,
            allCardsList: allCardsList,
            actionGuideInfo: actionGuideInfo,
            duelLogs: duelLogs,
            activePreviewCard: activePreviewCard,
            onHandCardClick: onHandCardClick,
            onFieldCardClick: onFieldCardClick,
            onTargetClick: onTargetClick,
            onSelectCardAction: onSelectCardAction,
            closeCardActionMenu: closeCardActionMenu,
            onRestartMatch: onRestartMatch,
            onSurrender: onSurrender,
            returnToCharacters: returnToCharacters,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
