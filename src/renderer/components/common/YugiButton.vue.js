import { computed } from 'vue';
const props = withDefaults(defineProps(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    icon: '',
    sublabel: '',
    to: undefined,
    href: '',
    type: 'button',
    ariaLabel: undefined,
});
const emit = defineEmits();
const tagComponent = computed(() => {
    if (props.to)
        return 'router-link';
    if (props.href)
        return 'a';
    return 'button';
});
const isButton = computed(() => tagComponent.value === 'button');
function handleClick(event) {
    if (props.disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
    }
    emit('click', event);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    variant: 'primary',
    size: 'md',
    disabled: false,
    icon: '',
    sublabel: '',
    to: undefined,
    href: '',
    type: 'button',
    ariaLabel: undefined,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = ((__VLS_ctx.tagComponent));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    to: (__VLS_ctx.to),
    href: (__VLS_ctx.href),
    type: (__VLS_ctx.isButton ? __VLS_ctx.type : undefined),
    disabled: (__VLS_ctx.isButton ? __VLS_ctx.disabled : undefined),
    'aria-disabled': (__VLS_ctx.disabled ? 'true' : undefined),
    'aria-label': (__VLS_ctx.ariaLabel),
    tabindex: (__VLS_ctx.disabled ? -1 : 0),
    ...{ class: "yugi-btn" },
    ...{ class: ([`yugi-btn--${__VLS_ctx.variant}`, `yugi-btn--${__VLS_ctx.size}`, __VLS_ctx.disabled && 'yugi-btn--disabled']) },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    to: (__VLS_ctx.to),
    href: (__VLS_ctx.href),
    type: (__VLS_ctx.isButton ? __VLS_ctx.type : undefined),
    disabled: (__VLS_ctx.isButton ? __VLS_ctx.disabled : undefined),
    'aria-disabled': (__VLS_ctx.disabled ? 'true' : undefined),
    'aria-label': (__VLS_ctx.ariaLabel),
    tabindex: (__VLS_ctx.disabled ? -1 : 0),
    ...{ class: "yugi-btn" },
    ...{ class: ([`yugi-btn--${__VLS_ctx.variant}`, `yugi-btn--${__VLS_ctx.size}`, __VLS_ctx.disabled && 'yugi-btn--disabled']) },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.handleClick)
};
var __VLS_8 = {};
__VLS_3.slots.default;
if (__VLS_ctx.variant === 'card') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yugi-btn__card-frame" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yugi-btn__card-header" },
    });
    var __VLS_9 = {};
    var __VLS_11 = {};
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yugi-btn__card-art" },
    });
    var __VLS_13 = {};
    if (__VLS_ctx.icon) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "yugi-btn__card-icon" },
        });
        (__VLS_ctx.icon);
    }
    var __VLS_15 = {};
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        width: "36",
        height: "36",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.7",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "12",
        cy: "12",
        r: "9",
        'stroke-opacity': "0.6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M12 7v10M7 12h10",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
        points: "12,9 14,12 12,15 10,12",
        fill: "currentColor",
        'fill-opacity': "0.4",
    });
    if (__VLS_ctx.sublabel || __VLS_ctx.$slots.footer) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "yugi-btn__card-footer" },
        });
        var __VLS_17 = {};
        (__VLS_ctx.sublabel);
    }
}
else {
    if (__VLS_ctx.icon || __VLS_ctx.$slots.icon) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "yugi-btn__icon" },
        });
        var __VLS_19 = {};
        (__VLS_ctx.icon);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "yugi-btn__label" },
    });
    var __VLS_21 = {};
    if (__VLS_ctx.sublabel) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "yugi-btn__sublabel" },
        });
        (__VLS_ctx.sublabel);
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['yugi-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__card-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__card-art']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__card-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__icon']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__label']} */ ;
/** @type {__VLS_StyleScopedClasses['yugi-btn__sublabel']} */ ;
// @ts-ignore
var __VLS_10 = __VLS_9, __VLS_12 = __VLS_11, __VLS_14 = __VLS_13, __VLS_16 = __VLS_15, __VLS_18 = __VLS_17, __VLS_20 = __VLS_19, __VLS_22 = __VLS_21;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            tagComponent: tagComponent,
            isButton: isButton,
            handleClick: handleClick,
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
