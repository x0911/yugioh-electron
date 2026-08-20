import { onMounted, onBeforeUnmount } from 'vue';
import { useDevToolsStore } from './stores/devToolsStore.js';
const isDev = import.meta.env.DEV;
const devToolsStore = useDevToolsStore();
function handleKeyDown(event) {
    // Shortcut: Ctrl+Shift+D or Cmd+Shift+D to toggle Dev Nav in dev mode
    if (isDev &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 'd') {
        event.preventDefault();
        devToolsStore.toggleDevNav();
    }
}
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-layout" },
});
if (__VLS_ctx.isDev && __VLS_ctx.devToolsStore.showDevNav) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "dev-nav-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dev-nav-bar__tag" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
        ...{ class: "dev-nav-bar__links" },
    });
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "/",
        ...{ class: "dev-nav-bar__link" },
    }));
    const __VLS_2 = __VLS_1({
        to: "/",
        ...{ class: "dev-nav-bar__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    var __VLS_3;
    const __VLS_4 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        to: "/main-menu",
        ...{ class: "dev-nav-bar__link" },
    }));
    const __VLS_6 = __VLS_5({
        to: "/main-menu",
        ...{ class: "dev-nav-bar__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    var __VLS_7;
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        to: "/settings",
        ...{ class: "dev-nav-bar__link" },
    }));
    const __VLS_10 = __VLS_9({
        to: "/settings",
        ...{ class: "dev-nav-bar__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    var __VLS_11;
    const __VLS_12 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        to: "/deck-edit",
        ...{ class: "dev-nav-bar__link" },
    }));
    const __VLS_14 = __VLS_13({
        to: "/deck-edit",
        ...{ class: "dev-nav-bar__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    var __VLS_15;
    const __VLS_16 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        to: "/coin-toss",
        ...{ class: "dev-nav-bar__link" },
    }));
    const __VLS_18 = __VLS_17({
        to: "/coin-toss",
        ...{ class: "dev-nav-bar__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_20 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        to: "/pre-duel-video",
        ...{ class: "dev-nav-bar__link" },
    }));
    const __VLS_22 = __VLS_21({
        to: "/pre-duel-video",
        ...{ class: "dev-nav-bar__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    var __VLS_23;
    const __VLS_24 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        to: "/duel",
        ...{ class: "dev-nav-bar__link" },
    }));
    const __VLS_26 = __VLS_25({
        to: "/duel",
        ...{ class: "dev-nav-bar__link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_28 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        to: "/dev/kitchen-sink",
        ...{ class: "dev-nav-bar__link dev-nav-bar__link--highlight" },
    }));
    const __VLS_30 = __VLS_29({
        to: "/dev/kitchen-sink",
        ...{ class: "dev-nav-bar__link dev-nav-bar__link--highlight" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    var __VLS_31;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.devToolsStore.toggleDevNav) },
        type: "button",
        ...{ class: "dev-nav-bar__close-btn" },
        title: "Close Dev Nav (Ctrl+Shift+D)",
    });
}
if (__VLS_ctx.isDev && !__VLS_ctx.devToolsStore.showDevNav) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.devToolsStore.toggleDevNav) },
        type: "button",
        ...{ class: "dev-nav-floating-toggle" },
        title: "Toggle Dev Navigation (Ctrl+Shift+D)",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "view-container" },
    ...{ class: ({ 'view-container--with-dev-nav': __VLS_ctx.isDev && __VLS_ctx.devToolsStore.showDevNav }) },
});
const __VLS_32 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [{ Component }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_36 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        name: "fade",
        mode: "out-in",
    }));
    const __VLS_38 = __VLS_37({
        name: "fade",
        mode: "out-in",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = ((Component));
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    var __VLS_39;
    __VLS_35.slots['' /* empty slot name completion */];
}
var __VLS_35;
/** @type {__VLS_StyleScopedClasses['app-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__tag']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__links']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__link--highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-bar__close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-nav-floating-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['view-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isDev: isDev,
            devToolsStore: devToolsStore,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
