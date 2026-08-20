import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
import IconIndicator from '../common/IconIndicator.vue';
const props = withDefaults(defineProps(), {
    isInteractive: true,
    getTargetInfo: null,
    isPromptActive: false,
});
function getCardTarget(card, idx) {
    if (props.getTargetInfo) {
        return props.getTargetInfo(card, idx);
    }
    return null;
}
const emit = defineEmits();
/**
 * Calculates adaptive horizontal spacing and negative margin overlap.
 * When hand size exceeds 5 cards, cards smoothly overlap horizontally so they never overflow.
 */
function getSlotStyle(index, total) {
    let marginHorizontal = 4; // Standard spacing between cards (px)
    if (total > 5) {
        // Dynamic overlap when hand size is large (6, 7, 8, 9, 10+ cards)
        const excess = total - 5;
        const overlapAmount = Math.min(46, excess * (props.player === 'user' ? 8 : 6));
        marginHorizontal = -overlapAmount / 2;
    }
    return {
        marginLeft: `${marginHorizontal}px`,
        marginRight: `${marginHorizontal}px`,
        zIndex: index + 1,
    };
}
/**
 * 100% Resolution-Independent FLIP Motion:
 * Dynamically queries the exact screen bounding box of the Main Deck at runtime,
 * and sets the initial entrance transform exactly at the Deck's coordinates.
 */
function onCardBeforeEnter(el) {
    const slotEl = el;
    const deckSelector = props.player === 'user' ? '.deck-stack--user-deck' : '.deck-stack--ai-deck';
    const deckEl = document.querySelector(deckSelector);
    if (deckEl) {
        const deckRect = deckEl.getBoundingClientRect();
        const slotRect = slotEl.getBoundingClientRect();
        // Exact delta in screen viewport coordinates (resolution & letterbox agnostic)
        const deltaX = deckRect.left + deckRect.width / 2 - (slotRect.left + slotRect.width / 2);
        const deltaY = deckRect.top + deckRect.height / 2 - (slotRect.top + slotRect.height / 2);
        slotEl.style.opacity = '0';
        slotEl.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.65) rotate(${props.player === 'user' ? -12 : 12}deg)`;
    }
    else {
        slotEl.style.opacity = '0';
        slotEl.style.transform = 'scale(0.6)';
    }
}
function onCardEnter(el, done) {
    const slotEl = el;
    // Force browser layout reflow
    void slotEl.offsetWidth;
    slotEl.style.transition =
        'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
    slotEl.style.opacity = '1';
    slotEl.style.transform = 'translate3d(0, 0, 0) scale(1) rotate(0deg)';
    let cleaned = false;
    const finish = () => {
        if (cleaned)
            return;
        cleaned = true;
        slotEl.removeEventListener('transitionend', onEnd);
        slotEl.style.transition = '';
        slotEl.style.transform = '';
        slotEl.style.opacity = '';
        done();
    };
    const onEnd = (e) => {
        if (e.target === slotEl) {
            finish();
        }
    };
    slotEl.addEventListener('transitionend', onEnd);
    setTimeout(finish, 500);
}
function onCardLeave(el, done) {
    const slotEl = el;
    slotEl.style.position = 'absolute';
    slotEl.style.transition =
        'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    slotEl.style.opacity = '0';
    slotEl.style.transform = `translate3d(0, ${props.player === 'user' ? -50 : 50}px, 0) scale(0.6)`;
    setTimeout(done, 360);
}
function onCardMouseEnter(card) {
    if (props.player === 'user') {
        emit('hover-card', card);
    }
}
function onCardMouseLeave() {
    if (props.player === 'user') {
        emit('hover-card', null);
    }
}
function onCardClick(card, event) {
    if (props.isInteractive && props.player === 'user') {
        emit('click-card', card, event);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    isInteractive: true,
    getTargetInfo: null,
    isPromptActive: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hand-card-slot']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card-slot']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hand-row" },
    'data-hand-fan-id': (`hand-${__VLS_ctx.player}-fan`),
    ...{ class: ([
            `hand-row--${__VLS_ctx.player}`,
            {
                'hand-row--empty': __VLS_ctx.cards.length === 0,
            },
        ]) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hand-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "hand-meta__count" },
});
(__VLS_ctx.player === 'user' ? 'Your Hand' : "Opponent's Hand");
(__VLS_ctx.cards.length);
const __VLS_0 = {}.TransitionGroup;
/** @type {[typeof __VLS_components.TransitionGroup, typeof __VLS_components.TransitionGroup, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBeforeEnter': {} },
    ...{ 'onEnter': {} },
    ...{ 'onLeave': {} },
    name: "hand-card-anim",
    tag: "div",
    ...{ class: "hand-cards-container" },
    css: (false),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBeforeEnter': {} },
    ...{ 'onEnter': {} },
    ...{ 'onLeave': {} },
    name: "hand-card-anim",
    tag: "div",
    ...{ class: "hand-cards-container" },
    css: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBeforeEnter: (__VLS_ctx.onCardBeforeEnter)
};
const __VLS_8 = {
    onEnter: (__VLS_ctx.onCardEnter)
};
const __VLS_9 = {
    onLeave: (__VLS_ctx.onCardLeave)
};
__VLS_3.slots.default;
for (const [card, idx] of __VLS_getVForSourceType((__VLS_ctx.cards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMouseenter: (...[$event]) => {
                __VLS_ctx.onCardMouseEnter(card);
            } },
        ...{ onMouseleave: (__VLS_ctx.onCardMouseLeave) },
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.onCardClick(card, $event);
            } },
        key: (card.id || `${__VLS_ctx.player}-${card.code}-${idx}`),
        ...{ class: "hand-card-slot" },
        'data-hand-card-id': (`hand-${__VLS_ctx.player}-${card.sequence ?? idx}`),
        ...{ class: ({
                'hand-card-slot--selectable': __VLS_ctx.getCardTarget(card, idx)?.isSelectable,
                'hand-card-slot--selected': __VLS_ctx.getCardTarget(card, idx)?.isSelected,
                'hand-card-slot--ineligible': __VLS_ctx.isPromptActive && !__VLS_ctx.getCardTarget(card, idx)?.isSelectable,
            }) },
        ...{ style: (__VLS_ctx.getSlotStyle(idx, __VLS_ctx.cards.length)) },
    });
    if (__VLS_ctx.player === 'user') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hand-card hand-card--user" },
            ...{ class: ({
                    'hand-card--selectable': __VLS_ctx.getCardTarget(card, idx)?.isSelectable,
                    'hand-card--selected': __VLS_ctx.getCardTarget(card, idx)?.isSelected,
                    'hand-card--ineligible': __VLS_ctx.isPromptActive && !__VLS_ctx.getCardTarget(card, idx)?.isSelectable,
                }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hand-card__frame" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(card.code, 'mini')),
            alt: (card.name),
            ...{ class: "hand-card__image" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hand-card__foil" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hand-card__header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hand-card__name" },
            title: (card.name),
        });
        (card.name);
        if (card.level && card.level > 0 && !__VLS_ctx.getCardTarget(card, idx)?.isSelectable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "hand-card__level" },
            });
            (card.level);
        }
        if (card.atk !== undefined && card.def !== undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "hand-card__stats" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-atk" },
            });
            (__VLS_ctx.formatCombatStat(card.atk));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-slash" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-def" },
            });
            (__VLS_ctx.formatCombatStat(card.def));
        }
        if (__VLS_ctx.getCardTarget(card, idx)?.isSelectable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "hand-card__target-overlay" },
            });
            /** @type {[typeof IconIndicator, ]} */ ;
            // @ts-ignore
            const __VLS_10 = __VLS_asFunctionalComponent(IconIndicator, new IconIndicator({
                type: "location",
                location: "hand",
                owner: (__VLS_ctx.getCardTarget(card, idx).owner),
                pulsing: (true),
                showTooltip: (true),
                tooltipText: (__VLS_ctx.getCardTarget(card, idx).tooltipText),
                size: "md",
            }));
            const __VLS_11 = __VLS_10({
                type: "location",
                location: "hand",
                owner: (__VLS_ctx.getCardTarget(card, idx).owner),
                pulsing: (true),
                showTooltip: (true),
                tooltipText: (__VLS_ctx.getCardTarget(card, idx).tooltipText),
                size: "md",
            }, ...__VLS_functionalComponentArgsRest(__VLS_10));
            if (__VLS_ctx.getCardTarget(card, idx).isSelected) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "hand-card__target-check" },
                });
            }
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hand-card hand-card--ai" },
            ...{ class: ({
                    'hand-card--selectable': __VLS_ctx.getCardTarget(card, idx)?.isSelectable,
                    'hand-card--selected': __VLS_ctx.getCardTarget(card, idx)?.isSelected,
                    'hand-card--ineligible': __VLS_ctx.isPromptActive && !__VLS_ctx.getCardTarget(card, idx)?.isSelectable,
                }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hand-card__frame hand-card__frame--back" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardBackUrl()),
            alt: "Card Back",
            ...{ class: "hand-card__image" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hand-card__foil" },
        });
        if (__VLS_ctx.getCardTarget(card, idx)?.isSelectable) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "hand-card__target-overlay" },
            });
            /** @type {[typeof IconIndicator, ]} */ ;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(IconIndicator, new IconIndicator({
                type: "location",
                location: "hand",
                owner: (__VLS_ctx.getCardTarget(card, idx).owner),
                pulsing: (true),
                showTooltip: (true),
                tooltipText: (__VLS_ctx.getCardTarget(card, idx).tooltipText),
                size: "md",
            }));
            const __VLS_14 = __VLS_13({
                type: "location",
                location: "hand",
                owner: (__VLS_ctx.getCardTarget(card, idx).owner),
                pulsing: (true),
                showTooltip: (true),
                tooltipText: (__VLS_ctx.getCardTarget(card, idx).tooltipText),
                size: "md",
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            if (__VLS_ctx.getCardTarget(card, idx).isSelected) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "hand-card__target-check" },
                });
            }
        }
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['hand-row']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-meta__count']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-cards-container']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card-slot']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card--user']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__frame']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__image']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__foil']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__header']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__name']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__level']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-slash']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-def']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__target-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__target-check']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card--ai']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__frame']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__frame--back']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__image']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__foil']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__target-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['hand-card__target-check']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            getCardBackUrl: getCardBackUrl,
            handleImageError: handleImageError,
            formatCombatStat: formatCombatStat,
            IconIndicator: IconIndicator,
            getCardTarget: getCardTarget,
            getSlotStyle: getSlotStyle,
            onCardBeforeEnter: onCardBeforeEnter,
            onCardEnter: onCardEnter,
            onCardLeave: onCardLeave,
            onCardMouseEnter: onCardMouseEnter,
            onCardMouseLeave: onCardMouseLeave,
            onCardClick: onCardClick,
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
