import { computed } from 'vue';
import { getUiIconUrl } from '../../utils/media.js';
import Tooltip from '../common/Tooltip.vue';
const props = withDefaults(defineProps(), {
    guideText: '',
    guideInfo: null,
    isDuelLogOpen: false,
    canGoToBattlePhase: false,
    canGoToMainPhase2: false,
    canEndTurn: false,
});
const __VLS_emit = defineEmits();
const phases = [
    { id: 'DP', name: 'Draw' },
    { id: 'SP', name: 'Standby' },
    { id: 'M1', name: 'Main 1' },
    { id: 'BP', name: 'Battle' },
    { id: 'M2', name: 'Main 2' },
    { id: 'EP', name: 'End' },
];
const defaultGuideText = computed(() => {
    if (props.isUserTurn) {
        switch (props.currentPhase) {
            case 'DP':
                return 'Draw Phase: Draw 1 card from your Deck.';
            case 'SP':
                return 'Standby Phase: Standby triggers resolve.';
            case 'M1':
                return 'Main Phase 1: You may Normal Summon, Set, or Activate effects.';
            case 'BP':
                return 'Battle Phase: Select an Attack Position monster to declare an attack.';
            case 'M2':
                return 'Main Phase 2: Set Spells/Traps or change monster battle positions.';
            case 'EP':
                return 'End Phase: Turn passes to opponent (Discard if hand > 6).';
            default:
                return 'Ready for next action.';
        }
    }
    return "Opponent's turn: Awaiting AI opponent action...";
});
function handleIconFallback(event, fallbackEmoji) {
    const target = event.target;
    if (target && target.parentElement) {
        target.style.display = 'none';
        const span = document.createElement('span');
        span.textContent = fallbackEmoji;
        span.style.fontSize = '1.1rem';
        target.parentElement.insertBefore(span, target);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    guideText: '',
    guideInfo: null,
    isDuelLogOpen: false,
    canGoToBattlePhase: false,
    canGoToMainPhase2: false,
    canEndTurn: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['phase-name']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "duel-hud" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hud-phases" },
});
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.phases))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (p.id),
        ...{ class: "phase-pill" },
        ...{ class: ({ 'phase-pill--active': __VLS_ctx.currentPhase === p.id }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "phase-id" },
    });
    (p.id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "phase-name" },
    });
    (p.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hud-center-banner glass-panel" },
    ...{ class: ([
            __VLS_ctx.guideInfo?.category && `hud-center-banner--${__VLS_ctx.guideInfo.category}`,
            { 'hud-center-banner--has-guide': !!__VLS_ctx.guideInfo },
        ]) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "turn-callout" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "turn-number" },
});
(__VLS_ctx.turnNumber);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "turn-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "turn-owner" },
    ...{ class: (__VLS_ctx.isUserTurn ? 'turn-owner--user' : 'turn-owner--ai') },
});
(__VLS_ctx.isUserTurn ? 'YOUR TURN' : "OPPONENT'S TURN");
if (__VLS_ctx.guideInfo?.categoryLabel) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "turn-divider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "guide-badge" },
    });
    (__VLS_ctx.guideInfo.categoryLabel);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "guide-prompt" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "guide-icon" },
});
(__VLS_ctx.guideInfo?.categoryIcon || '⚡');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "guide-text" },
});
(__VLS_ctx.guideInfo?.instruction || __VLS_ctx.guideText || __VLS_ctx.defaultGuideText);
if (__VLS_ctx.guideInfo?.selectionProgress) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "guide-progress-chip" },
    });
    (__VLS_ctx.guideInfo.selectionProgress.current);
    (__VLS_ctx.guideInfo.selectionProgress.requiredMax);
}
if (__VLS_ctx.isUserTurn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "phase-actions" },
    });
    if (__VLS_ctx.canGoToBattlePhase) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isUserTurn))
                        return;
                    if (!(__VLS_ctx.canGoToBattlePhase))
                        return;
                    __VLS_ctx.$emit('to-battle-phase');
                } },
            ...{ class: "phase-action-btn phase-action-btn--bp" },
        });
    }
    if (__VLS_ctx.canGoToMainPhase2) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isUserTurn))
                        return;
                    if (!(__VLS_ctx.canGoToMainPhase2))
                        return;
                    __VLS_ctx.$emit('to-main-phase2');
                } },
            ...{ class: "phase-action-btn phase-action-btn--m2" },
        });
    }
    if (__VLS_ctx.canEndTurn) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isUserTurn))
                        return;
                    if (!(__VLS_ctx.canEndTurn))
                        return;
                    __VLS_ctx.$emit('to-end-phase');
                } },
            ...{ class: "phase-action-btn phase-action-btn--ep" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hud-controls" },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Activation Confirmation (Reserved for future release)",
    position: "bottom",
}));
const __VLS_1 = __VLS_0({
    content: "Activation Confirmation (Reserved for future release)",
    position: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "hud-btn hud-btn--inert" },
    'aria-label': "Activation Confirmation",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onError: (...[$event]) => {
            __VLS_ctx.handleIconFallback($event, '💎');
        } },
    src: (__VLS_ctx.getUiIconUrl('hud-activation-confirm')),
    alt: "Activation Confirmation",
    ...{ class: "hud-btn-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hud-btn-label" },
});
var __VLS_2;
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Field Status (Reserved for future release)",
    position: "bottom",
}));
const __VLS_4 = __VLS_3({
    content: "Field Status (Reserved for future release)",
    position: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_5.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ class: "hud-btn hud-btn--inert" },
    'aria-label': "Field Status",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onError: (...[$event]) => {
            __VLS_ctx.handleIconFallback($event, '👁️');
        } },
    src: (__VLS_ctx.getUiIconUrl('hud-field-status')),
    alt: "Field Status",
    ...{ class: "hud-btn-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hud-btn-label" },
});
var __VLS_5;
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Toggle Live Duel Log Drawer",
    position: "bottom",
}));
const __VLS_7 = __VLS_6({
    content: "Toggle Live Duel Log Drawer",
    position: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('toggle-log');
        } },
    ...{ class: "hud-btn" },
    ...{ class: ({ 'hud-btn--active': __VLS_ctx.isDuelLogOpen }) },
    'aria-label': "Toggle Duel Log",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onError: (...[$event]) => {
            __VLS_ctx.handleIconFallback($event, '📜');
        } },
    src: (__VLS_ctx.getUiIconUrl('hud-duel-log')),
    alt: "Duel Log",
    ...{ class: "hud-btn-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hud-btn-label" },
});
var __VLS_8;
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "In-Duel Menu & Settings",
    position: "bottom",
}));
const __VLS_10 = __VLS_9({
    content: "In-Duel Menu & Settings",
    position: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('open-menu');
        } },
    ...{ class: "hud-btn hud-btn--primary" },
    'aria-label': "Open In-Duel Menu",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onError: (...[$event]) => {
            __VLS_ctx.handleIconFallback($event, '☰');
        } },
    src: (__VLS_ctx.getUiIconUrl('hud-menu')),
    alt: "Menu",
    ...{ class: "hud-btn-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hud-btn-label" },
});
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['duel-hud']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-phases']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-id']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-name']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-center-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['turn-callout']} */ ;
/** @type {__VLS_StyleScopedClasses['turn-number']} */ ;
/** @type {__VLS_StyleScopedClasses['turn-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['turn-owner']} */ ;
/** @type {__VLS_StyleScopedClasses['turn-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-prompt']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-text']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-progress-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-action-btn--bp']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-action-btn--m2']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['phase-action-btn--ep']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn--inert']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-label']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn--inert']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-label']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-label']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hud-btn-label']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getUiIconUrl: getUiIconUrl,
            Tooltip: Tooltip,
            phases: phases,
            defaultGuideText: defaultGuideText,
            handleIconFallback: handleIconFallback,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
