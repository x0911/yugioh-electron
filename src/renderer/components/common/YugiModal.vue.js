import { ref, watch, onBeforeUnmount } from 'vue';
const props = withDefaults(defineProps(), {
    title: '',
    cancelable: true,
    accent: 'gold',
    width: '540px',
});
const emit = defineEmits();
const modalRef = ref(null);
function handleClose() {
    emit('update:modelValue', false);
    emit('close');
    emit('cancel');
}
function handleBackdropClick() {
    if (props.cancelable) {
        handleClose();
    }
}
function handleKeyDown(event) {
    if (props.modelValue && props.cancelable && event.key === 'Escape') {
        event.preventDefault();
        handleClose();
    }
}
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        window.addEventListener('keydown', handleKeyDown);
        // Auto-focus modal container for accessibility
        setTimeout(() => {
            modalRef.value?.focus();
        }, 50);
    }
    else {
        window.removeEventListener('keydown', handleKeyDown);
    }
}, { immediate: true });
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    title: '',
    cancelable: true,
    accent: 'gold',
    width: '540px',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.Teleport;
/** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    name: "modal-fade",
}));
const __VLS_6 = __VLS_5({
    name: "modal-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
if (__VLS_ctx.modelValue) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.handleBackdropClick) },
        ...{ class: "yugi-modal-backdrop" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ref: "modalRef",
        ...{ class: "yugi-modal" },
        ...{ class: (__VLS_ctx.accent !== 'none' && `yugi-modal--accent-${__VLS_ctx.accent}`) },
        ...{ style: ({ maxWidth: __VLS_ctx.width }) },
        role: "dialog",
        'aria-modal': "true",
        'aria-label': (__VLS_ctx.title),
        tabindex: "-1",
    });
    /** @type {typeof __VLS_ctx.modalRef} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yugi-modal__header" },
    });
    var __VLS_8 = {};
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "yugi-modal__title" },
    });
    (__VLS_ctx.title);
    if (__VLS_ctx.cancelable) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.handleClose) },
            type: "button",
            ...{ class: "yugi-modal__close-btn" },
            'aria-label': "Close dialog",
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yugi-modal__body" },
    });
    var __VLS_10 = {};
    if (__VLS_ctx.$slots.footer) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "yugi-modal__footer" },
        });
        var __VLS_12 = {
            close: (__VLS_ctx.handleClose),
        };
    }
}
var __VLS_7;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['yugi-modal-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-modal__header']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-modal__title']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-modal__close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-modal__body']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-modal__footer']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8, __VLS_11 = __VLS_10, __VLS_13 = __VLS_12;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            modalRef: modalRef,
            handleClose: handleClose,
            handleBackdropClick: handleBackdropClick,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
