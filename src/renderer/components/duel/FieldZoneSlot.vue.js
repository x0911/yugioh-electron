import { computed } from 'vue';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
import Tooltip from '../common/Tooltip.vue';
import IconIndicator from '../common/IconIndicator.vue';
const props = withDefaults(defineProps(), {
    zoneIndex: 0,
    zoneSubLabel: '',
    card: null,
    isInert: false,
    inertTooltip: '',
    isTargeted: false,
    isSelectable: false,
    targetInfo: null,
    isPromptActive: false,
});
const emit = defineEmits();
const isDefensePosition = computed(() => {
    return props.card?.position === 'faceup_defense' || props.card?.position === 'facedown_defense';
});
const isFaceDown = computed(() => {
    return props.card?.position === 'facedown_defense' || props.card?.position === 'facedown_spell';
});
const isFaceUpMonster = computed(() => {
    return props.card?.position === 'faceup_attack' || props.card?.position === 'faceup_defense';
});
/**
 * Display combat stat only if monster is face-up:
 * - Attack Position => ATK only
 * - Face-up Defense Position => DEF only
 */
const showCombatStatBadge = computed(() => {
    if (!props.card)
        return false;
    if (props.card.position === 'faceup_attack') {
        return props.card.atk !== undefined;
    }
    if (props.card.position === 'faceup_defense') {
        return props.card.def !== undefined;
    }
    return false;
});
const activeStatMode = computed(() => {
    return props.card?.position === 'faceup_defense' ? 'def' : 'atk';
});
const activeStatValue = computed(() => {
    if (!props.card)
        return '';
    const raw = props.card.position === 'faceup_defense' ? props.card.def : props.card.atk;
    return formatCombatStat(raw);
});
const tooltipText = computed(() => {
    if (props.targetInfo && props.targetInfo.isSelectable) {
        return props.targetInfo.tooltipText;
    }
    if (props.card && isFaceDown.value) {
        return props.card.position === 'facedown_defense'
            ? 'Face-down Defense Monster (Set)'
            : 'Face-down Spell/Trap (Set)';
    }
    if (props.isInert && props.inertTooltip) {
        return props.inertTooltip;
    }
    if (props.isPromptActive && props.card && (!props.targetInfo || !props.targetInfo.isSelectable)) {
        return 'This card cannot be selected as a target';
    }
    return '';
});
function onMouseEnter() {
    if (!props.card) {
        emit('hover-card', null);
        return;
    }
    // Opponent's face-down / hidden cards are completely ignored from preview
    if (props.player === 'ai' && (isFaceDown.value || props.card.code === 0)) {
        return;
    }
    emit('hover-card', props.card);
}
function onMouseLeave() {
    if (props.player === 'ai' && (isFaceDown.value || props.card?.code === 0)) {
        return;
    }
    emit('hover-card', null);
}
function onClick(event) {
    if (!props.isInert) {
        if (props.targetInfo && props.targetInfo.isSelectable) {
            emit('click-target', props.targetInfo);
        }
        emit('click-card', props.card, event, props.targetInfo);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    zoneIndex: 0,
    zoneSubLabel: '',
    card: null,
    isInert: false,
    inertTooltip: '',
    isTargeted: false,
    isSelectable: false,
    targetInfo: null,
    isPromptActive: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['slot-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-prefix']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-prefix']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onMouseenter: (__VLS_ctx.onMouseEnter) },
    ...{ onMouseleave: (__VLS_ctx.onMouseLeave) },
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.onClick($event);
        } },
    ...{ class: "field-zone-slot" },
    'data-zone-id': (`slot-${__VLS_ctx.player}-${__VLS_ctx.zoneType}-${__VLS_ctx.zoneIndex}`),
    ...{ class: ([
            `field-zone-slot--${__VLS_ctx.player}`,
            `field-zone-slot--${__VLS_ctx.zoneType}`,
            {
                'field-zone-slot--occupied': !!__VLS_ctx.card,
                'field-zone-slot--empty': !__VLS_ctx.card,
                'field-zone-slot--inert': __VLS_ctx.isInert,
                'field-zone-slot--targeted': __VLS_ctx.isTargeted,
                'field-zone-slot--selectable': __VLS_ctx.targetInfo?.isSelectable || __VLS_ctx.isSelectable,
                'field-zone-slot--selected': __VLS_ctx.targetInfo?.isSelected,
                'field-zone-slot--ineligible': __VLS_ctx.isPromptActive && (!__VLS_ctx.targetInfo || !__VLS_ctx.targetInfo.isSelectable) && !!__VLS_ctx.card,
            },
        ]) },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    text: (__VLS_ctx.tooltipText),
    disabled: (!__VLS_ctx.tooltipText),
    position: "top",
    ...{ class: "slot-tooltip-wrapper" },
}));
const __VLS_1 = __VLS_0({
    text: (__VLS_ctx.tooltipText),
    disabled: (!__VLS_ctx.tooltipText),
    position: "top",
    ...{ class: "slot-tooltip-wrapper" },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slot-frame" },
});
if (!__VLS_ctx.card) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slot-empty-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slot-label" },
    });
    (__VLS_ctx.zoneLabel);
    if (__VLS_ctx.zoneSubLabel) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "slot-sublabel" },
        });
        (__VLS_ctx.zoneSubLabel);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slot-octagon-border" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "field-card" },
        ...{ class: ([
                `field-card--${__VLS_ctx.card.position}`,
                {
                    'field-card--is-defense': __VLS_ctx.isDefensePosition,
                    'field-card--is-facedown': __VLS_ctx.isFaceDown,
                },
            ]) },
    });
    if (__VLS_ctx.isFaceDown) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-face card-face--back" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardBackUrl()),
            alt: "Card Back",
            ...{ class: "card-image card-image--back" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-foil-sheen" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-face card-face--front" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.card.code, 'mini')),
            alt: (__VLS_ctx.card.name),
            ...{ class: "card-image" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-foil-sheen" },
        });
    }
}
if (__VLS_ctx.targetInfo && __VLS_ctx.targetInfo.isSelectable) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slot-target-overlay" },
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
            ...{ class: "slot-target-check" },
        });
    }
}
if (__VLS_ctx.card && __VLS_ctx.showCombatStatBadge) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slot-stat-badge" },
        ...{ class: (`slot-stat-badge--${__VLS_ctx.activeStatMode}`) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-prefix" },
    });
    (__VLS_ctx.activeStatMode === 'atk' ? 'ATK' : 'DEF');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "stat-value" },
    });
    (__VLS_ctx.activeStatValue);
}
if (__VLS_ctx.card && __VLS_ctx.isFaceUpMonster && __VLS_ctx.card.level && __VLS_ctx.card.level > 0 && (!__VLS_ctx.targetInfo || !__VLS_ctx.targetInfo.isSelectable)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "slot-level-badge" },
    });
    (__VLS_ctx.card.level);
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['field-zone-slot']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-tooltip-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-empty-content']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-label']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-sublabel']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-octagon-border']} */ ;
/** @type {__VLS_StyleScopedClasses['field-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-face']} */ ;
/** @type {__VLS_StyleScopedClasses['card-face--back']} */ ;
/** @type {__VLS_StyleScopedClasses['card-image']} */ ;
/** @type {__VLS_StyleScopedClasses['card-image--back']} */ ;
/** @type {__VLS_StyleScopedClasses['card-foil-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['card-face']} */ ;
/** @type {__VLS_StyleScopedClasses['card-face--front']} */ ;
/** @type {__VLS_StyleScopedClasses['card-image']} */ ;
/** @type {__VLS_StyleScopedClasses['card-foil-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-target-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-target-check']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-stat-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-prefix']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['slot-level-badge']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            getCardBackUrl: getCardBackUrl,
            handleImageError: handleImageError,
            Tooltip: Tooltip,
            IconIndicator: IconIndicator,
            isDefensePosition: isDefensePosition,
            isFaceDown: isFaceDown,
            isFaceUpMonster: isFaceUpMonster,
            showCombatStatBadge: showCombatStatBadge,
            activeStatMode: activeStatMode,
            activeStatValue: activeStatValue,
            tooltipText: tooltipText,
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
