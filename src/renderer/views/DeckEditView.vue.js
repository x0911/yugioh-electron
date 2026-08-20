import { onMounted } from 'vue';
import { useDeckEditStore } from '../stores/deckEditStore.js';
import YugiButton from '../components/common/YugiButton.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import DeckColumn from '../components/deckEdit/DeckColumn.vue';
import CardFilterBar from '../components/deckEdit/CardFilterBar.vue';
import CardGridVirtualized from '../components/deckEdit/CardGridVirtualized.vue';
import CardPreviewer from '../components/deckEdit/CardPreviewer.vue';
const store = useDeckEditStore();
onMounted(async () => {
    await store.initStore();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-edit-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "deck-edit-header glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    variant: "ghost",
    size: "sm",
    icon: "←",
    to: "/main-menu",
}));
const __VLS_1 = __VLS_0({
    variant: "ghost",
    size: "sm",
    icon: "←",
    to: "/main-menu",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-title-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "header-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "header-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-status-pill" },
    ...{ class: ({
            'deck-status-pill--legal': __VLS_ctx.store.deckValidity.isValid,
            'deck-status-pill--illegal': !__VLS_ctx.store.deckValidity.isValid,
        }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "status-dot" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "status-name" },
});
(__VLS_ctx.store.activeDeck.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "status-validity" },
});
(__VLS_ctx.store.deckValidity.isValid ? 'Legal' : 'Illegal');
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    ...{ 'onClick': {} },
    variant: "primary",
    size: "sm",
    icon: "💾",
    disabled: (!__VLS_ctx.store.isDirty || !__VLS_ctx.store.deckValidity.isValid || __VLS_ctx.store.mainDeckCount < 40),
    title: (__VLS_ctx.store.mainDeckCount < 40
        ? `Cannot save: Main deck has ${__VLS_ctx.store.mainDeckCount}/40 cards minimum`
        : !__VLS_ctx.store.deckValidity.isValid
            ? 'Cannot save: Deck contains illegal cards'
            : !__VLS_ctx.store.isDirty
                ? 'Deck already saved'
                : 'Save deck changes'),
}));
const __VLS_4 = __VLS_3({
    ...{ 'onClick': {} },
    variant: "primary",
    size: "sm",
    icon: "💾",
    disabled: (!__VLS_ctx.store.isDirty || !__VLS_ctx.store.deckValidity.isValid || __VLS_ctx.store.mainDeckCount < 40),
    title: (__VLS_ctx.store.mainDeckCount < 40
        ? `Cannot save: Main deck has ${__VLS_ctx.store.mainDeckCount}/40 cards minimum`
        : !__VLS_ctx.store.deckValidity.isValid
            ? 'Cannot save: Deck contains illegal cards'
            : !__VLS_ctx.store.isDirty
                ? 'Deck already saved'
                : 'Save deck changes'),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
let __VLS_6;
let __VLS_7;
let __VLS_8;
const __VLS_9 = {
    onClick: (__VLS_ctx.store.saveCurrentDeck)
};
__VLS_5.slots.default;
var __VLS_5;
if (__VLS_ctx.store.isLoaded) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
        ...{ class: "deck-workspace" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "col-deck-management" },
        'aria-label': "Deck Construction",
    });
    /** @type {[typeof DeckColumn, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(DeckColumn, new DeckColumn({}));
    const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "col-card-pool" },
        'aria-label': "Card Database",
    });
    /** @type {[typeof CardFilterBar, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(CardFilterBar, new CardFilterBar({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-wrapper" },
    });
    /** @type {[typeof CardGridVirtualized, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(CardGridVirtualized, new CardGridVirtualized({}));
    const __VLS_17 = __VLS_16({}, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
        ...{ class: "col-card-preview" },
        'aria-label': "Card Preview",
    });
    /** @type {[typeof CardPreviewer, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(CardPreviewer, new CardPreviewer({}));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-loading-state" },
    });
    /** @type {[typeof LoadingSpinner, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({
        variant: "cyan",
        size: "lg",
        message: "Loading Card Database & Decks...",
    }));
    const __VLS_23 = __VLS_22({
        variant: "cyan",
        size: "lg",
        message: "Loading Card Database & Decks...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
}
const __VLS_25 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    name: "toast",
}));
const __VLS_27 = __VLS_26({
    name: "toast",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
if (__VLS_ctx.store.toastMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-toast-alert" },
        ...{ class: (`deck-toast-alert--${__VLS_ctx.store.toastType}`) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "toast-icon" },
    });
    (__VLS_ctx.store.toastType === 'success'
        ? '✓'
        : __VLS_ctx.store.toastType === 'warning'
            ? '⚠️'
            : __VLS_ctx.store.toastType === 'danger'
                ? '✕'
                : 'ℹ');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "toast-msg" },
    });
    (__VLS_ctx.store.toastMessage);
}
var __VLS_28;
/** @type {__VLS_StyleScopedClasses['deck-edit-view']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-edit-header']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-status-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['status-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['status-name']} */ ;
/** @type {__VLS_StyleScopedClasses['status-validity']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-workspace']} */ ;
/** @type {__VLS_StyleScopedClasses['col-deck-management']} */ ;
/** @type {__VLS_StyleScopedClasses['col-card-pool']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['col-card-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-loading-state']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-toast-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toast-msg']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            YugiButton: YugiButton,
            LoadingSpinner: LoadingSpinner,
            DeckColumn: DeckColumn,
            CardFilterBar: CardFilterBar,
            CardGridVirtualized: CardGridVirtualized,
            CardPreviewer: CardPreviewer,
            store: store,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
