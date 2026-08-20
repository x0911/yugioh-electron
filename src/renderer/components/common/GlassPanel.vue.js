import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    tint: '',
    border: '',
    blur: '',
    padding: '',
    elevated: false,
    accent: 'none',
    as: 'div',
});
const computedStyle = computed(() => {
    const styles = {};
    if (props.tint) {
        styles.background = props.tint;
    }
    if (props.border) {
        styles.borderColor = props.border;
    }
    if (props.blur) {
        const blurVal = typeof props.blur === 'number' ? `${props.blur}px` : props.blur;
        styles.backdropFilter = `blur(${blurVal}) saturate(140%)`;
        styles.webkitBackdropFilter = `blur(${blurVal}) saturate(140%)`;
    }
    if (props.padding) {
        styles.padding = props.padding;
    }
    return styles;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    tint: '',
    border: '',
    blur: '',
    padding: '',
    elevated: false,
    accent: 'none',
    as: 'div',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = ((__VLS_ctx.as));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "glass-panel" },
    ...{ class: ([
            __VLS_ctx.elevated && 'glass-panel--elevated',
            __VLS_ctx.accent !== 'none' && `glass-panel--accent-${__VLS_ctx.accent}`,
        ]) },
    ...{ style: (__VLS_ctx.computedStyle) },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "glass-panel" },
    ...{ class: ([
            __VLS_ctx.elevated && 'glass-panel--elevated',
            __VLS_ctx.accent !== 'none' && `glass-panel--accent-${__VLS_ctx.accent}`,
        ]) },
    ...{ style: (__VLS_ctx.computedStyle) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {};
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
// @ts-ignore
var __VLS_6 = __VLS_5;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            computedStyle: computedStyle,
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
