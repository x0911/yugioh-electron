import { ref, onBeforeUnmount } from 'vue';
const props = withDefaults(defineProps(), {
    text: '',
    position: 'top',
    delay: 150,
    disabled: false,
});
const isVisible = ref(false);
const tooltipId = `tooltip-${Math.random().toString(36).substring(2, 9)}`;
let timer = null;
function clearTimer() {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}
function show() {
    if (props.disabled)
        return;
    clearTimer();
    if (props.delay > 0) {
        timer = setTimeout(() => {
            isVisible.value = true;
        }, props.delay);
    }
    else {
        isVisible.value = true;
    }
}
function hide() {
    clearTimer();
    isVisible.value = false;
}
function handleMouseEnter() {
    show();
}
function handleMouseLeave() {
    hide();
}
function handleFocusIn() {
    show();
}
function handleFocusOut() {
    hide();
}
onBeforeUnmount(() => {
    clearTimer();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    text: '',
    position: 'top',
    delay: 150,
    disabled: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onMouseenter: (__VLS_ctx.handleMouseEnter) },
    ...{ onMouseleave: (__VLS_ctx.handleMouseLeave) },
    ...{ onFocusin: (__VLS_ctx.handleFocusIn) },
    ...{ onFocusout: (__VLS_ctx.handleFocusOut) },
    ...{ class: "yugi-tooltip-wrapper" },
});
var __VLS_0 = {};
const __VLS_2 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(__VLS_2, new __VLS_2({
    name: "tooltip-fade",
}));
const __VLS_4 = __VLS_3({
    name: "tooltip-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_5.slots.default;
if (__VLS_ctx.isVisible && !__VLS_ctx.disabled && (__VLS_ctx.text || __VLS_ctx.$slots.content)) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        id: (__VLS_ctx.tooltipId),
        role: "tooltip",
        ...{ class: "yugi-tooltip-bubble" },
        ...{ class: (`yugi-tooltip-bubble--${__VLS_ctx.position}`) },
    });
    var __VLS_6 = {};
    (__VLS_ctx.text);
}
var __VLS_5;
/** @type {__VLS_StyleScopedClasses['yugi-tooltip-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-tooltip-bubble']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0, __VLS_7 = __VLS_6;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isVisible: isVisible,
            tooltipId: tooltipId,
            handleMouseEnter: handleMouseEnter,
            handleMouseLeave: handleMouseLeave,
            handleFocusIn: handleFocusIn,
            handleFocusOut: handleFocusOut,
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
