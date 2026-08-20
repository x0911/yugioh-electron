import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    size: 'md',
    variant: 'gold',
    label: '',
    sublabel: '',
});
const pixelSize = computed(() => {
    if (typeof props.size === 'number') {
        return props.size;
    }
    switch (props.size) {
        case 'sm':
            return 24;
        case 'lg':
            return 72;
        case 'md':
        default:
            return 48;
    }
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
    size: 'md',
    variant: 'gold',
    label: '',
    sublabel: '',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-spinner-wrapper" },
    role: "status",
    'aria-live': "polite",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-spinner" },
    ...{ class: ([
            typeof __VLS_ctx.size === 'string' && `loading-spinner--${__VLS_ctx.size}`,
            `loading-spinner--${__VLS_ctx.variant}`,
        ]) },
    ...{ style: (__VLS_ctx.customSizeStyle) },
});
if (__VLS_ctx.variant === 'ring') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "loading-spinner__simple-circle" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 100 100",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        ...{ class: "loading-spinner__svg" },
        width: (__VLS_ctx.pixelSize),
        height: (__VLS_ctx.pixelSize),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.g, __VLS_intrinsicElements.g)({
        ...{ class: "loading-spinner__outer-ring" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "50",
        cy: "50",
        r: "44",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-opacity': "0.35",
        'stroke-dasharray': "4 6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "50,2 47,8 53,8",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "50,98 47,92 53,92",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "2,50 8,47 8,53",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "98,50 92,47 92,53",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "16,16 22,20 19,25",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "84,84 78,80 81,75",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "16,84 20,78 25,81",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "84,16 80,22 75,19",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.g, __VLS_intrinsicElements.g)({
        ...{ class: "loading-spinner__inner-ring" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "50",
        cy: "50",
        r: "30",
        stroke: "currentColor",
        'stroke-width': "2.5",
        'stroke-opacity': "0.75",
        'stroke-dasharray': "14 10 6 10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "50",
        cy: "20",
        r: "2",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "50",
        cy: "80",
        r: "2",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "20",
        cy: "50",
        r: "2",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "80",
        cy: "50",
        r: "2",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.g, __VLS_intrinsicElements.g)({
        ...{ class: "loading-spinner__core" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "50",
        cy: "50",
        r: "12",
        fill: "currentColor",
        'fill-opacity': "0.15",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "50",
        cy: "50",
        r: "6",
        fill: "currentColor",
        'fill-opacity': "0.8",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "50,38 54,50 50,62 46,50",
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "38,50 50,54 62,50 50,46",
        fill: "currentColor",
    });
}
if (__VLS_ctx.label || __VLS_ctx.sublabel) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-spinner__text-group" },
    });
    if (__VLS_ctx.label) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "loading-spinner__label" },
        });
        (__VLS_ctx.label);
    }
    if (__VLS_ctx.sublabel) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "loading-spinner__sublabel" },
        });
        (__VLS_ctx.sublabel);
    }
}
/** @type {__VLS_StyleScopedClasses['loading-spinner-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__simple-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__svg']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__outer-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__inner-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__core']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__text-group']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__label']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner__sublabel']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            pixelSize: pixelSize,
            customSizeStyle: customSizeStyle,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
