import { computed } from 'vue';
import Tooltip from './Tooltip.vue';
const props = withDefaults(defineProps(), {
    type: 'location',
    location: 'field',
    owner: 'user',
    status: 'negated',
    size: 'md',
    pulsing: false,
    showTooltip: true,
    tooltipText: '',
});
const defaultLocationLabels = {
    hand: { user: "Player's Hand", ai: "Opponent's Hand" },
    field: { user: "Player's Field Zone", ai: "Opponent's Field Zone" },
    deck: { user: "Player's Main Deck", ai: "Opponent's Main Deck" },
    'extra-deck': { user: "Player's Extra Deck", ai: "Opponent's Extra Deck" },
    graveyard: { user: "Player's Graveyard", ai: "Opponent's Graveyard" },
    banished: { user: "Player's Banished Zone", ai: "Opponent's Banished Zone" },
};
const defaultStatusLabels = {
    negated: 'Effect Negated',
    'no-special-summon': 'Cannot Be Special Summoned',
    'temp-banished': 'Temporarily Banished',
    'fusion-material': 'Used as Fusion Material',
    'synchro-material': 'Used as Synchro Material',
    'destroyed-battle': 'Destroyed by Battle',
    'no-attack': 'Cannot Attack',
};
const computedTooltipText = computed(() => {
    if (props.tooltipText)
        return props.tooltipText;
    if (props.type === 'location') {
        return defaultLocationLabels[props.location][props.owner];
    }
    return defaultStatusLabels[props.status];
});
const customSizeStyle = computed(() => {
    if (typeof props.size === 'number') {
        return {
            width: `${props.size}px`,
            height: `${props.size}px`,
        };
    }
    return {};
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    type: 'location',
    location: 'field',
    owner: 'user',
    status: 'negated',
    size: 'md',
    pulsing: false,
    showTooltip: true,
    tooltipText: '',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
if (__VLS_ctx.showTooltip) {
    /** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
        text: (__VLS_ctx.computedTooltipText),
        position: "top",
    }));
    const __VLS_1 = __VLS_0({
        text: (__VLS_ctx.computedTooltipText),
        position: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    __VLS_2.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "icon-indicator" },
        ...{ class: ([
                `icon-indicator--${__VLS_ctx.type}`,
                __VLS_ctx.type === 'location' && `icon-indicator--${__VLS_ctx.owner}`,
                __VLS_ctx.type === 'status' && `icon-indicator--status-${__VLS_ctx.status}`,
                typeof __VLS_ctx.size === 'string' && `icon-indicator--${__VLS_ctx.size}`,
                __VLS_ctx.pulsing && 'icon-indicator--pulsing',
            ]) },
        ...{ style: (__VLS_ctx.customSizeStyle) },
        'aria-label': (__VLS_ctx.computedTooltipText),
        role: "img",
    });
    var __VLS_4 = {};
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    if (__VLS_ctx.type === 'location') {
        if (__VLS_ctx.location === 'hand') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "7",
                y: "2",
                width: "10",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M4 17a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4v-2H4v2z",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M10 13v-3",
                'stroke-width': "1.5",
            });
        }
        else if (__VLS_ctx.location === 'field') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
                points: "12,2 21,7 21,17 12,22 3,17 3,7",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "3",
                fill: "currentColor",
            });
        }
        else if (__VLS_ctx.location === 'deck') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "4",
                y: "8",
                width: "12",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M7 5h11a2 2 0 0 1 2 2v11",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M10 2h10a2 2 0 0 1 2 2v11",
                'stroke-dasharray': "2 2",
            });
        }
        else if (__VLS_ctx.location === 'extra-deck') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "3",
                y: "8",
                width: "11",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M6 5h10a2 2 0 0 1 2 2v10",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
                points: "18,3 19,6 22,7 19,8 18,11 17,8 14,7 17,6",
                fill: "currentColor",
                stroke: "none",
            });
        }
        else if (__VLS_ctx.location === 'graveyard') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M6 21V10a6 6 0 0 1 12 0v11",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "3",
                y1: "21",
                x2: "21",
                y2: "21",
                'stroke-width': "2.5",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "12",
                y1: "7",
                x2: "12",
                y2: "15",
                'stroke-width': "1.5",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "9",
                y1: "10",
                x2: "15",
                y2: "10",
                'stroke-width': "1.5",
            });
        }
        else if (__VLS_ctx.location === 'banished') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "9",
                stroke: "currentColor",
                'stroke-dasharray': "8 4",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M12 7a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a3 3 0 0 1 3-3c1.66 0 3 1.34 3 3a1 1 0 0 1-1 1",
            });
        }
    }
    else if (__VLS_ctx.type === 'status') {
        if (__VLS_ctx.status === 'negated') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "4",
                y1: "4",
                x2: "20",
                y2: "20",
                'stroke-width': "2.5",
                stroke: "currentColor",
            });
        }
        else if (__VLS_ctx.status === 'no-special-summon') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
                points: "12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "3",
                y1: "3",
                x2: "21",
                y2: "21",
                'stroke-width': "2.5",
                stroke: "currentColor",
            });
        }
        else if (__VLS_ctx.status === 'temp-banished') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "9",
                stroke: "currentColor",
                'stroke-dasharray': "6 3",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M9 7h6l-3 4-3-4zM9 17h6l-3-4-3 4z",
                fill: "currentColor",
            });
        }
        else if (__VLS_ctx.status === 'fusion-material') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "4",
                y: "5",
                width: "8",
                height: "11",
                rx: "1.5",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "11",
                y: "8",
                width: "8",
                height: "11",
                rx: "1.5",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M9 10a3 3 0 0 1 4 2",
                'stroke-width': "1.8",
            });
        }
        else if (__VLS_ctx.status === 'synchro-material') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "6",
                y: "7",
                width: "12",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "9",
                cy: "4",
                r: "1.5",
                fill: "currentColor",
                stroke: "none",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "15",
                cy: "3",
                r: "1.5",
                fill: "currentColor",
                stroke: "none",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "3",
                'stroke-dasharray': "2 2",
            });
        }
        else if (__VLS_ctx.status === 'destroyed-battle') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "5",
                y1: "5",
                x2: "19",
                y2: "19",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "19",
                y1: "5",
                x2: "5",
                y2: "19",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polyline)({
                points: "10,6 12,12 14,10 13,16",
                'stroke-width': "1.5",
                'stroke-dasharray': "1 1",
            });
        }
        else if (__VLS_ctx.status === 'no-attack') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "7",
                y1: "17",
                x2: "17",
                y2: "7",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polyline)({
                points: "14,4 20,4 20,10",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "4",
                y1: "4",
                x2: "20",
                y2: "20",
                'stroke-width': "2.5",
                stroke: "currentColor",
            });
        }
    }
    var __VLS_2;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "icon-indicator" },
        ...{ class: ([
                `icon-indicator--${__VLS_ctx.type}`,
                __VLS_ctx.type === 'location' && `icon-indicator--${__VLS_ctx.owner}`,
                __VLS_ctx.type === 'status' && `icon-indicator--status-${__VLS_ctx.status}`,
                typeof __VLS_ctx.size === 'string' && `icon-indicator--${__VLS_ctx.size}`,
                __VLS_ctx.pulsing && 'icon-indicator--pulsing',
            ]) },
        ...{ style: (__VLS_ctx.customSizeStyle) },
        role: "img",
    });
    var __VLS_6 = {};
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    if (__VLS_ctx.type === 'location') {
        if (__VLS_ctx.location === 'hand') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "7",
                y: "2",
                width: "10",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M4 17a4 4 0 0 0 4 4h7a4 4 0 0 0 4-4v-2H4v2z",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M10 13v-3",
                'stroke-width': "1.5",
            });
        }
        else if (__VLS_ctx.location === 'field') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
                points: "12,2 21,7 21,17 12,22 3,17 3,7",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "3",
                fill: "currentColor",
            });
        }
        else if (__VLS_ctx.location === 'deck') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "4",
                y: "8",
                width: "12",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M7 5h11a2 2 0 0 1 2 2v11",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M10 2h10a2 2 0 0 1 2 2v11",
                'stroke-dasharray': "2 2",
            });
        }
        else if (__VLS_ctx.location === 'extra-deck') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "3",
                y: "8",
                width: "11",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M6 5h10a2 2 0 0 1 2 2v10",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
                points: "18,3 19,6 22,7 19,8 18,11 17,8 14,7 17,6",
                fill: "currentColor",
                stroke: "none",
            });
        }
        else if (__VLS_ctx.location === 'graveyard') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M6 21V10a6 6 0 0 1 12 0v11",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "3",
                y1: "21",
                x2: "21",
                y2: "21",
                'stroke-width': "2.5",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "12",
                y1: "7",
                x2: "12",
                y2: "15",
                'stroke-width': "1.5",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "9",
                y1: "10",
                x2: "15",
                y2: "10",
                'stroke-width': "1.5",
            });
        }
        else if (__VLS_ctx.location === 'banished') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "9",
                stroke: "currentColor",
                'stroke-dasharray': "8 4",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M12 7a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a3 3 0 0 1 3-3c1.66 0 3 1.34 3 3a1 1 0 0 1-1 1",
            });
        }
    }
    else if (__VLS_ctx.type === 'status') {
        if (__VLS_ctx.status === 'negated') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "4",
                y1: "4",
                x2: "20",
                y2: "20",
                'stroke-width': "2.5",
                stroke: "currentColor",
            });
        }
        else if (__VLS_ctx.status === 'no-special-summon') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
                points: "12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.15",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "3",
                y1: "3",
                x2: "21",
                y2: "21",
                'stroke-width': "2.5",
                stroke: "currentColor",
            });
        }
        else if (__VLS_ctx.status === 'temp-banished') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "9",
                stroke: "currentColor",
                'stroke-dasharray': "6 3",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M9 7h6l-3 4-3-4zM9 17h6l-3-4-3 4z",
                fill: "currentColor",
            });
        }
        else if (__VLS_ctx.status === 'fusion-material') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "4",
                y: "5",
                width: "8",
                height: "11",
                rx: "1.5",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "11",
                y: "8",
                width: "8",
                height: "11",
                rx: "1.5",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M9 10a3 3 0 0 1 4 2",
                'stroke-width': "1.8",
            });
        }
        else if (__VLS_ctx.status === 'synchro-material') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
                x: "6",
                y: "7",
                width: "12",
                height: "14",
                rx: "2",
                stroke: "currentColor",
                fill: "currentColor",
                'fill-opacity': "0.2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "9",
                cy: "4",
                r: "1.5",
                fill: "currentColor",
                stroke: "none",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "15",
                cy: "3",
                r: "1.5",
                fill: "currentColor",
                stroke: "none",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
                cx: "12",
                cy: "12",
                r: "3",
                'stroke-dasharray': "2 2",
            });
        }
        else if (__VLS_ctx.status === 'destroyed-battle') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "5",
                y1: "5",
                x2: "19",
                y2: "19",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "19",
                y1: "5",
                x2: "5",
                y2: "19",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polyline)({
                points: "10,6 12,12 14,10 13,16",
                'stroke-width': "1.5",
                'stroke-dasharray': "1 1",
            });
        }
        else if (__VLS_ctx.status === 'no-attack') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "7",
                y1: "17",
                x2: "17",
                y2: "7",
                'stroke-width': "2",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.polyline)({
                points: "14,4 20,4 20,10",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
                x1: "4",
                y1: "4",
                x2: "20",
                y2: "20",
                'stroke-width': "2.5",
                stroke: "currentColor",
            });
        }
    }
}
/** @type {__VLS_StyleScopedClasses['icon-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-indicator']} */ ;
// @ts-ignore
var __VLS_5 = __VLS_4, __VLS_7 = __VLS_6;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Tooltip: Tooltip,
            computedTooltipText: computedTooltipText,
            customSizeStyle: customSizeStyle,
        };
    },
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
