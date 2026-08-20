import { computed } from 'vue';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import Tooltip from '../common/Tooltip.vue';
import IconIndicator from '../common/IconIndicator.vue';
const props = withDefaults(defineProps(), {
    topCard: null,
    label: '',
    targetInfo: null,
    isPromptActive: false,
});
const emit = defineEmits();
const displayTitle = computed(() => {
    if (props.label)
        return props.label;
    switch (props.type) {
        case 'deck':
            return 'DECK';
        case 'extra':
            return 'EX DECK';
        case 'graveyard':
            return 'GRAVEYARD';
        case 'banished':
            return 'BANISHED';
    }
    return 'STACK';
});
const tooltipContent = computed(() => {
    const owner = props.player === 'user' ? 'Your' : "Opponent's";
    switch (props.type) {
        case 'deck':
            return `${owner} Main Deck (${props.count} cards remaining)`;
        case 'extra':
            return `${owner} Extra Deck (${props.count} Fusion cards)`;
        case 'graveyard':
            return props.topCard
                ? `${owner} Graveyard (${props.count} cards • Top: ${props.topCard.name})`
                : `${owner} Graveyard (Empty)`;
        case 'banished':
            return props.topCard
                ? `${owner} Banished Zone (${props.count} cards • Top: ${props.topCard.name})`
                : `${owner} Banished Zone (Empty)`;
    }
    return `${owner} Card Stack`;
});
function onMouseEnter() {
    if (props.topCard) {
        emit('hover-card', props.topCard);
    }
}
function onMouseLeave() {
    emit('hover-card', null);
}
function onClick() {
    emit('click-stack', props.type);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    topCard: null,
    label: '',
    targetInfo: null,
    isPromptActive: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['count-num']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-top-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-top-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-top-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-top-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-top-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-top-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onMouseenter: (__VLS_ctx.onMouseEnter) },
    ...{ onMouseleave: (__VLS_ctx.onMouseLeave) },
    ...{ onClick: (__VLS_ctx.onClick) },
    ...{ class: "deck-stack" },
    'data-stack-id': (`stack-${__VLS_ctx.player}-${__VLS_ctx.type}`),
    ...{ class: ([
            `deck-stack--${__VLS_ctx.type}`,
            `deck-stack--${__VLS_ctx.player}`,
            {
                'deck-stack--empty': __VLS_ctx.count === 0,
                'deck-stack--has-cards': __VLS_ctx.count > 0,
                'deck-stack--selectable': __VLS_ctx.targetInfo?.isSelectable,
                'deck-stack--selected': __VLS_ctx.targetInfo?.isSelected,
                'deck-stack--ineligible': __VLS_ctx.isPromptActive && (!__VLS_ctx.targetInfo || !__VLS_ctx.targetInfo.isSelectable) && __VLS_ctx.count > 0,
            },
        ]) },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: (__VLS_ctx.tooltipContent),
    position: "top",
}));
const __VLS_1 = __VLS_0({
    content: (__VLS_ctx.tooltipContent),
    position: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stack-container" },
});
if (__VLS_ctx.count >= 15) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stack-layer stack-layer--3" },
    });
}
if (__VLS_ctx.count >= 5) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stack-layer stack-layer--2" },
    });
}
if (__VLS_ctx.count >= 1) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stack-layer stack-layer--1" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stack-top-card" },
});
if (__VLS_ctx.count === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stack-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stack-type-icon" },
    });
    if (__VLS_ctx.type === 'graveyard') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else if (__VLS_ctx.type === 'banished') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else if (__VLS_ctx.type === 'extra') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stack-label" },
    });
    (__VLS_ctx.label || __VLS_ctx.type.toUpperCase());
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stack-count-zero" },
    });
}
else if (__VLS_ctx.type === 'graveyard' && __VLS_ctx.topCard) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-art-surface" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleImageError) },
        src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.topCard.code, 'mini')),
        alt: (__VLS_ctx.topCard.name),
        ...{ class: "top-card-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stack-overlay-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stack-name-tag" },
    });
    (__VLS_ctx.topCard.name);
}
else if (__VLS_ctx.type === 'banished' && __VLS_ctx.topCard) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-art-surface" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleImageError) },
        src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.topCard.code, 'mini')),
        alt: (__VLS_ctx.topCard.name),
        ...{ class: "top-card-img" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-back-surface" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleImageError) },
        src: (__VLS_ctx.getCardBackUrl()),
        alt: "Deck Back",
        ...{ class: "top-card-img" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-foil-sheen" },
});
if (__VLS_ctx.targetInfo && __VLS_ctx.targetInfo.isSelectable) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stack-target-overlay" },
    });
    /** @type {[typeof IconIndicator, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(IconIndicator, new IconIndicator({
        type: "location",
        location: (__VLS_ctx.targetInfo.locationType),
        owner: (__VLS_ctx.targetInfo.owner),
        pulsing: (true),
        showTooltip: (true),
        tooltipText: (__VLS_ctx.targetInfo.tooltipText),
        size: "md",
    }));
    const __VLS_4 = __VLS_3({
        type: "location",
        location: (__VLS_ctx.targetInfo.locationType),
        owner: (__VLS_ctx.targetInfo.owner),
        pulsing: (true),
        showTooltip: (true),
        tooltipText: (__VLS_ctx.targetInfo.tooltipText),
        size: "md",
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    if (__VLS_ctx.targetInfo.isSelected) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stack-target-check" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "count-badge" },
    ...{ class: ({ 'count-badge--zero': __VLS_ctx.count === 0 }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "count-num" },
});
(__VLS_ctx.count);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stack-title-pill" },
});
(__VLS_ctx.displayTitle);
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['deck-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-container']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-layer']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-layer--3']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-layer']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-layer--2']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-layer']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-layer--1']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-top-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-type-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-count-zero']} */ ;
/** @type {__VLS_StyleScopedClasses['card-art-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['top-card-img']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-overlay-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-name-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['card-art-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['top-card-img']} */ ;
/** @type {__VLS_StyleScopedClasses['card-back-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['top-card-img']} */ ;
/** @type {__VLS_StyleScopedClasses['card-foil-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-target-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-target-check']} */ ;
/** @type {__VLS_StyleScopedClasses['count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['count-num']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-title-pill']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            getCardBackUrl: getCardBackUrl,
            handleImageError: handleImageError,
            Tooltip: Tooltip,
            IconIndicator: IconIndicator,
            displayTitle: displayTitle,
            tooltipContent: tooltipContent,
            onMouseEnter: onMouseEnter,
            onMouseLeave: onMouseLeave,
            onClick: onClick,
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
