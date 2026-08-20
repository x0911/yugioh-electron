import { ref, computed } from 'vue';
import { useUIStore } from '../stores/uiStore.js';
import { getMenuCardImageUrl } from '../utils/media.js';
import YugiButton from '../components/common/YugiButton.vue';
import YugiModal from '../components/common/YugiModal.vue';
const uiStore = useUIStore();
const showExitModal = ref(false);
const engineBadgeText = computed(() => {
    if (uiStore.engineStatus?.ready) {
        return `Engine Ready • ${uiStore.engineStatus.cardCount.toLocaleString()} Cards`;
    }
    return 'Duel Engine Ready';
});
function handleExitClick() {
    showExitModal.value = true;
}
function confirmExit() {
    if (window.appAPI && typeof window.appAPI.exitApp === 'function') {
        window.appAPI.exitApp();
    }
    else {
        console.log('[MainMenuView] Exit requested (window.appAPI.exitApp)');
        showExitModal.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__bg" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "main-menu-view__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__brand" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__brand-emblem" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 36 36",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
    points: "18,3 33,30 3,30",
    stroke: "#c9a227",
    'stroke-width': "2",
    fill: "rgba(18, 22, 30, 0.8)",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "18",
    cy: "20",
    r: "4",
    fill: "#e3c567",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M11 20 C13 16, 23 16, 25 20",
    stroke: "#f4e4b8",
    'stroke-width': "1.5",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__brand-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "main-menu-view__brand-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "main-menu-view__brand-sub" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__header-status" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__status-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
    ...{ class: "main-menu-view__status-dot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.engineBadgeText);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__hero" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "main-menu-view__hero-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "main-menu-view__hero-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "main-menu-view__cards-container" },
    'aria-label': "Main Menu Navigation",
});
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    variant: "card",
    to: "/coin-toss",
    ...{ class: "main-menu-view__card-btn" },
    'aria-label': "Start Duel — Face AI Opponents",
}));
const __VLS_1 = __VLS_0({
    variant: "card",
    to: "/coin-toss",
    ...{ class: "main-menu-view__card-btn" },
    'aria-label': "Start Duel — Face AI Opponents",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-header" },
    });
}
{
    const { art: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-art-frame" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.getMenuCardImageUrl('duel')),
        alt: "Start Duel",
        ...{ class: "main-menu-view__card-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-shine" },
    });
}
{
    const { footer: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-label-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-desc" },
    });
}
var __VLS_2;
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    variant: "card",
    to: "/deck-edit",
    ...{ class: "main-menu-view__card-btn" },
    'aria-label': "Deck Edit — Construct & Customize Decks",
}));
const __VLS_4 = __VLS_3({
    variant: "card",
    to: "/deck-edit",
    ...{ class: "main-menu-view__card-btn" },
    'aria-label': "Deck Edit — Construct & Customize Decks",
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_5.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_5.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-header" },
    });
}
{
    const { art: __VLS_thisSlot } = __VLS_5.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-art-frame" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.getMenuCardImageUrl('deck')),
        alt: "Deck Edit",
        ...{ class: "main-menu-view__card-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-shine" },
    });
}
{
    const { footer: __VLS_thisSlot } = __VLS_5.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-label-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-desc" },
    });
}
var __VLS_5;
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    variant: "card",
    to: "/settings",
    ...{ class: "main-menu-view__card-btn" },
    'aria-label': "Settings — Configure Rivals & Audio",
}));
const __VLS_7 = __VLS_6({
    variant: "card",
    to: "/settings",
    ...{ class: "main-menu-view__card-btn" },
    'aria-label': "Settings — Configure Rivals & Audio",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_8.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-header" },
    });
}
{
    const { art: __VLS_thisSlot } = __VLS_8.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-art-frame" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.getMenuCardImageUrl('settings')),
        alt: "Settings",
        ...{ class: "main-menu-view__card-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-shine" },
    });
}
{
    const { footer: __VLS_thisSlot } = __VLS_8.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-label-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-desc" },
    });
}
var __VLS_8;
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    ...{ 'onClick': {} },
    variant: "card",
    ...{ class: "main-menu-view__card-btn main-menu-view__card-btn--danger" },
    'aria-label': "Exit Game — Quit Application",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    variant: "card",
    ...{ class: "main-menu-view__card-btn main-menu-view__card-btn--danger" },
    'aria-label': "Exit Game — Quit Application",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.handleExitClick)
};
__VLS_11.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_11.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-header" },
    });
}
{
    const { art: __VLS_thisSlot } = __VLS_11.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-art-frame main-menu-view__card-art-frame--danger" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.getMenuCardImageUrl('exit')),
        alt: "Exit Game",
        ...{ class: "main-menu-view__card-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-shine" },
    });
}
{
    const { footer: __VLS_thisSlot } = __VLS_11.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__card-label-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "main-menu-view__card-desc" },
    });
}
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
    ...{ class: "main-menu-view__footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__footer-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__footer-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
/** @type {[typeof YugiModal, typeof YugiModal, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(YugiModal, new YugiModal({
    modelValue: (__VLS_ctx.showExitModal),
    title: "Exit Duel Arena",
    accent: "ai",
    width: "480px",
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.showExitModal),
    title: "Exit Duel Arena",
    accent: "ai",
    width: "480px",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_18.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-menu-view__modal-body" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-muted" },
});
{
    const { footer: __VLS_thisSlot } = __VLS_18.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-menu-view__modal-actions" },
    });
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "secondary",
        size: "md",
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
        variant: "secondary",
        size: "md",
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_22;
    let __VLS_23;
    let __VLS_24;
    const __VLS_25 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showExitModal = false;
        }
    };
    __VLS_21.slots.default;
    var __VLS_21;
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "danger",
        size: "md",
        icon: "🚪",
    }));
    const __VLS_27 = __VLS_26({
        ...{ 'onClick': {} },
        variant: "danger",
        size: "md",
        icon: "🚪",
    }, ...__VLS_functionalComponentArgsRest(__VLS_26));
    let __VLS_29;
    let __VLS_30;
    let __VLS_31;
    const __VLS_32 = {
        onClick: (__VLS_ctx.confirmExit)
    };
    __VLS_28.slots.default;
    var __VLS_28;
}
var __VLS_18;
/** @type {__VLS_StyleScopedClasses['main-menu-view']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__bg']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__header']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__brand']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__brand-emblem']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__brand-text']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__brand-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__header-status']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__status-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__hero']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__cards-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-art-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-img']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-shine']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-label-block']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-art-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-img']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-shine']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-label-block']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-art-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-img']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-shine']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-label-block']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-btn--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-art-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-art-frame--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-img']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-shine']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-label-block']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__card-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__footer-left']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__footer-right']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['main-menu-view__modal-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getMenuCardImageUrl: getMenuCardImageUrl,
            YugiButton: YugiButton,
            YugiModal: YugiModal,
            showExitModal: showExitModal,
            engineBadgeText: engineBadgeText,
            handleExitClick: handleExitClick,
            confirmExit: confirmExit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
