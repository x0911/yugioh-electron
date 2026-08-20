import { ref, computed, watch } from 'vue';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
import YugiModal from '../common/YugiModal.vue';
import YugiButton from '../common/YugiButton.vue';
import DeckSelectorAutocomplete from './DeckSelectorAutocomplete.vue';
const store = useDeckEditStore();
const deckNameInput = ref(store.activeDeck.name);
const showClearModal = ref(false);
const showDeleteModal = ref(false);
const isMainDragOver = ref(false);
const isExtraDragOver = ref(false);
const isTrashDragOver = ref(false);
const mainScrollRef = ref(null);
const extraScrollRef = ref(null);
watch(() => store.activeDeck.name, (newName) => {
    deckNameInput.value = newName;
});
const validity = computed(() => store.deckValidity);
const isDraggingFromDeck = computed(() => store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck'));
const isPoolDraggingToMain = computed(() => store.isDragging &&
    (store.dragSource === 'pool' || store.dragSource === 'previewer') &&
    (!store.draggingCard || !store.draggingCard.isExtraDeck));
const isPoolDraggingToExtra = computed(() => store.isDragging &&
    (store.dragSource === 'pool' || store.dragSource === 'previewer') &&
    Boolean(store.draggingCard?.isExtraDeck));
const isGroupedView = ref(true);
function sortEnrichedCards(a, b) {
    const cardA = a.card;
    const cardB = b.card;
    if (!cardA || !cardB)
        return 0;
    const getCat = (c) => (c.isMonster ? 1 : c.isSpell ? 2 : 3);
    const catA = getCat(cardA);
    const catB = getCat(cardB);
    if (catA !== catB)
        return catA - catB;
    if (cardA.isMonster && cardB.isMonster) {
        if (cardA.level !== cardB.level)
            return cardB.level - cardA.level;
        if (cardA.atk !== cardB.atk)
            return cardB.atk - cardA.atk;
    }
    return cardA.name.localeCompare(cardB.name);
}
// Cleanly sort deck: Monsters first (Level desc, ATK desc, Name asc), then Spells, then Traps
const mainDeckCards = computed(() => {
    if (isGroupedView.value) {
        const list = store.mainDeckGrouped.map((item) => ({
            ...item,
            uniqueKey: `grouped-${item.id}`,
            card: store.cardMap.get(item.id) ?? null,
        }));
        return list.sort(sortEnrichedCards);
    }
    else {
        const list = store.activeDeck.main.map((id, index) => ({
            id,
            count: 1,
            isExtra: false,
            uniqueKey: `single-${id}-${index}`,
            card: store.cardMap.get(id) ?? null,
        }));
        return list.sort(sortEnrichedCards);
    }
});
const extraDeckCards = computed(() => {
    const list = store.extraDeckGrouped.map((item) => ({
        ...item,
        card: store.cardMap.get(item.id) ?? null,
    }));
    return list.sort((a, b) => {
        const cardA = a.card;
        const cardB = b.card;
        if (!cardA || !cardB)
            return 0;
        if (cardA.level !== cardB.level)
            return cardB.level - cardA.level;
        if (cardA.atk !== cardB.atk)
            return cardB.atk - cardA.atk;
        return cardA.name.localeCompare(cardB.name);
    });
});
function onDeckAutocompleteSelect(deckId) {
    store.selectDeck(deckId);
}
function onNameInput() {
    store.setDeckName(deckNameInput.value);
}
function onNewDeckClick() {
    const nextNum = store.customDecks.length + 1;
    store.newDeck(`Custom Deck ${nextNum}`);
}
function onCardHover(card) {
    if (card) {
        store.setHoveredCard(card);
    }
}
function onConfirmClear() {
    store.clearCurrentDeck();
    showClearModal.value = false;
}
function onConfirmDelete() {
    store.deleteCurrentDeck();
    showDeleteModal.value = false;
}
function getCardKindClass(card) {
    if (!card)
        return 'unknown';
    if (card.isFusion)
        return 'fusion';
    if (card.isSpell)
        return 'spell';
    if (card.isTrap)
        return 'trap';
    if (card.isEffect)
        return 'effect';
    return 'normal';
}
// Drag from Deck to Remove / Reorder
function onDeckCardDragStart(e, item, isExtra) {
    if (e.dataTransfer && item.card) {
        e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: item.id, isExtra, source: isExtra ? 'extra-deck' : 'main-deck' }));
        e.dataTransfer.effectAllowed = 'copyMove';
    }
    if (item.card) {
        store.startDrag(item.card, isExtra ? 'extra-deck' : 'main-deck');
    }
}
function onDeckCardDragEnd() {
    store.endDrag();
    isMainDragOver.value = false;
    isExtraDragOver.value = false;
    isTrashDragOver.value = false;
}
// Main Deck Dropzone Handlers
function onMainDragOver(e) {
    if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
        isMainDragOver.value = true;
    }
}
function onMainDragLeave(e) {
    const related = e.relatedTarget;
    if (!mainScrollRef.value?.contains(related)) {
        isMainDragOver.value = false;
    }
}
function onMainDrop(e) {
    isMainDragOver.value = false;
    if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
        e.preventDefault();
        store.dropOnMainDeck();
        store.endDrag();
    }
}
// Extra Deck Dropzone Handlers
function onExtraDragOver(e) {
    if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
        isExtraDragOver.value = true;
    }
}
function onExtraDragLeave(e) {
    const related = e.relatedTarget;
    if (!extraScrollRef.value?.contains(related)) {
        isExtraDragOver.value = false;
    }
}
function onExtraDrop(e) {
    isExtraDragOver.value = false;
    if (store.isDragging && (store.dragSource === 'pool' || store.dragSource === 'previewer')) {
        e.preventDefault();
        store.dropOnExtraDeck();
        store.endDrag();
    }
}
// Trash Zone Drop Handlers
function onTrashDragOver(e) {
    if (store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        isTrashDragOver.value = true;
    }
}
function onTrashDrop(e) {
    isTrashDragOver.value = false;
    if (store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')) {
        e.preventDefault();
        store.dropOnRemove();
        store.endDrag();
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['deck-cards-scrollable']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-cards-scrollable']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-drag-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-remove-overlay']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-column glass-panel glass-panel--elevated" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-select-row" },
});
/** @type {[typeof DeckSelectorAutocomplete, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(DeckSelectorAutocomplete, new DeckSelectorAutocomplete({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.store.activeDeckId),
    decks: (__VLS_ctx.store.customDecks),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.store.activeDeckId),
    decks: (__VLS_ctx.store.customDecks),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    'onUpdate:modelValue': (__VLS_ctx.onDeckAutocompleteSelect)
};
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-name-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onNameInput) },
    value: (__VLS_ctx.deckNameInput),
    type: "text",
    ...{ class: "deck-name-input" },
    placeholder: "Deck Name...",
    maxlength: "40",
});
if (__VLS_ctx.store.isDirty) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dirty-indicator" },
        title: "Unsaved changes",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-toolbar-container" },
});
if (!__VLS_ctx.isDraggingFromDeck) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-toolbar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.store.saveCurrentDeck) },
        type: "button",
        ...{ class: "tool-btn tool-btn--save" },
        disabled: (!__VLS_ctx.store.isDirty || !__VLS_ctx.validity.isValid || __VLS_ctx.store.mainDeckCount < 40),
        title: (__VLS_ctx.store.mainDeckCount < 40
            ? `Cannot save: Main deck has ${__VLS_ctx.store.mainDeckCount}/40 cards minimum`
            : !__VLS_ctx.validity.isValid
                ? 'Cannot save: Deck contains illegal cards'
                : !__VLS_ctx.store.isDirty
                    ? 'Deck already saved'
                    : 'Save deck changes'),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tool-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.onNewDeckClick) },
        type: "button",
        ...{ class: "tool-btn" },
        title: "Create a new deck",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tool-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.store.duplicateCurrentDeck) },
        type: "button",
        ...{ class: "tool-btn" },
        title: "Clone current deck",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tool-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isDraggingFromDeck))
                    return;
                __VLS_ctx.showClearModal = true;
            } },
        type: "button",
        ...{ class: "tool-btn tool-btn--danger" },
        title: "Clear all cards from this deck",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tool-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isDraggingFromDeck))
                    return;
                __VLS_ctx.showDeleteModal = true;
            } },
        type: "button",
        ...{ class: "tool-btn tool-btn--danger" },
        disabled: (__VLS_ctx.store.customDecks.length <= 1),
        title: "Delete this custom deck",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tool-icon" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onDragover: (__VLS_ctx.onTrashDragOver) },
        ...{ onDragleave: (...[$event]) => {
                if (!!(!__VLS_ctx.isDraggingFromDeck))
                    return;
                __VLS_ctx.isTrashDragOver = false;
            } },
        ...{ onDrop: (__VLS_ctx.onTrashDrop) },
        ...{ class: "deck-trash-zone" },
        ...{ class: ({ 'deck-trash-zone--hover': __VLS_ctx.isTrashDragOver }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "trash-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "trash-text" },
    });
    (__VLS_ctx.store.draggingCard?.name || 'Card');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "validity-banner" },
    ...{ class: ({
            'validity-banner--legal': __VLS_ctx.validity.isValid,
            'validity-banner--illegal': !__VLS_ctx.validity.isValid,
        }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "validity-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "validity-badge" },
});
(__VLS_ctx.validity.isValid ? '✓ LEGAL DECK' : '⚠️ ILLEGAL DECK');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "validity-summary" },
});
(__VLS_ctx.store.mainDeckCount);
(__VLS_ctx.store.extraDeckCount);
if (!__VLS_ctx.validity.isValid && __VLS_ctx.validity.errors.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "validity-errors" },
    });
    for (const [err, idx] of __VLS_getVForSourceType((__VLS_ctx.validity.errors))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (idx),
            ...{ class: "error-item" },
        });
        (err);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onDragover: (__VLS_ctx.onMainDragOver) },
    ...{ onDragleave: (__VLS_ctx.onMainDragLeave) },
    ...{ onDrop: (__VLS_ctx.onMainDrop) },
    ...{ class: "deck-section deck-section--main" },
    ...{ class: ({
            'deck-section--drop-active': __VLS_ctx.isPoolDraggingToMain,
            'deck-section--drag-over': __VLS_ctx.isMainDragOver,
        }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "count-badge" },
    ...{ class: ({
            'count-badge--legal': __VLS_ctx.store.mainDeckCount >= 40 && __VLS_ctx.store.mainDeckCount <= 60,
            'count-badge--illegal': __VLS_ctx.store.mainDeckCount < 40 || __VLS_ctx.store.mainDeckCount > 60,
        }) },
});
(__VLS_ctx.store.mainDeckCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.isGroupedView = !__VLS_ctx.isGroupedView;
        } },
    type: "button",
    ...{ class: "view-toggle-pill" },
    title: (__VLS_ctx.isGroupedView ? 'Currently showing grouped stacks. Click to view all 40+ individual cards.' : 'Currently showing individual cards. Click to group duplicate cards into stacks.'),
});
(__VLS_ctx.isGroupedView ? `🗂️ Stacks (${__VLS_ctx.store.mainDeckGrouped.length})` : `🃏 All (${__VLS_ctx.store.mainDeckCount})`);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stats-pills" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-pill stat-pill--monsters" },
    title: "Monsters",
});
(__VLS_ctx.store.deckStats.monsters);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-pill stat-pill--spells" },
    title: "Spells",
});
(__VLS_ctx.store.deckStats.spells);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-pill stat-pill--traps" },
    title: "Traps",
});
(__VLS_ctx.store.deckStats.traps);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "mainScrollRef",
    ...{ class: "deck-cards-scrollable" },
});
/** @type {typeof __VLS_ctx.mainScrollRef} */ ;
if (__VLS_ctx.mainDeckCards.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-cards-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.mainDeckCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!(__VLS_ctx.mainDeckCards.length > 0))
                        return;
                    __VLS_ctx.onCardHover(item.card);
                } },
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.mainDeckCards.length > 0))
                        return;
                    __VLS_ctx.onCardHover(item.card);
                } },
            ...{ onContextmenu: (...[$event]) => {
                    if (!(__VLS_ctx.mainDeckCards.length > 0))
                        return;
                    __VLS_ctx.onCardHover(item.card);
                } },
            ...{ onDragstart: (...[$event]) => {
                    if (!(__VLS_ctx.mainDeckCards.length > 0))
                        return;
                    __VLS_ctx.onDeckCardDragStart($event, item, false);
                } },
            ...{ onDragend: (__VLS_ctx.onDeckCardDragEnd) },
            key: (item.uniqueKey || item.id),
            ...{ class: "deck-card-tile" },
            ...{ class: ({
                    [`deck-card-tile--${__VLS_ctx.getCardKindClass(item.card)}`]: true,
                    'deck-card-tile--dragging': __VLS_ctx.store.isDragging && __VLS_ctx.store.draggingCard?.id === item.id,
                }) },
            draggable: "true",
            title: "Drag to remove from deck",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-thumb-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(item.id, 'mini')),
            alt: (item.card?.name || 'Card'),
            ...{ class: "tile-thumb-img" },
            loading: "lazy",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-count-badge" },
            ...{ class: (`tile-count-badge--${item.count}`) },
        });
        (item.count);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-drag-badge" },
            title: "Drag to remove",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            width: "12",
            height: "12",
            fill: "currentColor",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-info-strip" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tile-name" },
            title: (item.card?.name),
        });
        (item.card?.name || `Card #${item.id}`);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-stats" },
        });
        if (item.card?.isMonster) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tile-atk" },
            });
            ((item.card?.atk ?? 0) < 0 ? '?' : (item.card?.atk ?? 0));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tile-type" },
            });
            (item.card?.isSpell ? 'SPELL' : 'TRAP');
        }
        if (item.card?.isMonster && (item.card?.level ?? 0) > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tile-lvl" },
            });
            (item.card?.level);
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "empty-hint" },
    });
}
const __VLS_7 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    name: "fade",
}));
const __VLS_9 = __VLS_8({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_10.slots.default;
if (__VLS_ctx.isMainDragOver) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-drop-overlay deck-drop-overlay--main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drop-action-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drop-action-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drop-action-sub" },
    });
    (__VLS_ctx.store.draggingCard?.name);
}
var __VLS_10;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onDragover: (__VLS_ctx.onExtraDragOver) },
    ...{ onDragleave: (__VLS_ctx.onExtraDragLeave) },
    ...{ onDrop: (__VLS_ctx.onExtraDrop) },
    ...{ class: "deck-section deck-section--extra" },
    ...{ class: ({
            'deck-section--drop-active': __VLS_ctx.isPoolDraggingToExtra,
            'deck-section--drag-over': __VLS_ctx.isExtraDragOver,
        }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-title-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "count-badge" },
    ...{ class: ({
            'count-badge--legal': __VLS_ctx.store.extraDeckCount <= 15,
            'count-badge--illegal': __VLS_ctx.store.extraDeckCount > 15,
        }) },
});
(__VLS_ctx.store.extraDeckCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-pill stat-pill--fusions" },
});
(__VLS_ctx.store.deckStats.fusions);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "extraScrollRef",
    ...{ class: "deck-cards-scrollable deck-cards-scrollable--extra" },
});
/** @type {typeof __VLS_ctx.extraScrollRef} */ ;
if (__VLS_ctx.extraDeckCards.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-cards-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.extraDeckCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!(__VLS_ctx.extraDeckCards.length > 0))
                        return;
                    __VLS_ctx.onCardHover(item.card);
                } },
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.extraDeckCards.length > 0))
                        return;
                    __VLS_ctx.onCardHover(item.card);
                } },
            ...{ onContextmenu: (...[$event]) => {
                    if (!(__VLS_ctx.extraDeckCards.length > 0))
                        return;
                    __VLS_ctx.onCardHover(item.card);
                } },
            ...{ onDragstart: (...[$event]) => {
                    if (!(__VLS_ctx.extraDeckCards.length > 0))
                        return;
                    __VLS_ctx.onDeckCardDragStart($event, item, true);
                } },
            ...{ onDragend: (__VLS_ctx.onDeckCardDragEnd) },
            key: (item.id),
            ...{ class: "deck-card-tile deck-card-tile--fusion" },
            ...{ class: ({
                    'deck-card-tile--dragging': __VLS_ctx.store.isDragging && __VLS_ctx.store.draggingCard?.id === item.id,
                }) },
            draggable: "true",
            title: "Drag to remove from deck",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-thumb-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(item.id, 'mini')),
            alt: (item.card?.name || 'Card'),
            ...{ class: "tile-thumb-img" },
            loading: "lazy",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-count-badge" },
            ...{ class: (`tile-count-badge--${item.count}`) },
        });
        (item.count);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-drag-badge" },
            title: "Drag to remove",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            width: "12",
            height: "12",
            fill: "currentColor",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-info-strip" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tile-name" },
            title: (item.card?.name),
        });
        (item.card?.name || `Card #${item.id}`);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-stats" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "tile-atk" },
        });
        ((item.card?.atk ?? 0) < 0 ? '?' : (item.card?.atk ?? 0));
        if ((item.card?.level ?? 0) > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tile-lvl" },
            });
            (item.card?.level);
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "empty-hint" },
    });
}
const __VLS_11 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
    name: "fade",
}));
const __VLS_13 = __VLS_12({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
__VLS_14.slots.default;
if (__VLS_ctx.isExtraDragOver) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-drop-overlay deck-drop-overlay--extra" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drop-action-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drop-action-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drop-action-sub" },
    });
    (__VLS_ctx.store.draggingCard?.name);
}
var __VLS_14;
/** @type {[typeof YugiModal, typeof YugiModal, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(YugiModal, new YugiModal({
    modelValue: (__VLS_ctx.showClearModal),
    title: "Clear Deck Cards?",
    accent: "ai",
    width: "440px",
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.showClearModal),
    title: "Clear Deck Cards?",
    accent: "ai",
    width: "440px",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_17.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "modal-body-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.store.activeDeck.name);
{
    const { footer: __VLS_thisSlot } = __VLS_17.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-footer-actions" },
    });
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "secondary",
        size: "sm",
    }));
    const __VLS_19 = __VLS_18({
        ...{ 'onClick': {} },
        variant: "secondary",
        size: "sm",
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    let __VLS_21;
    let __VLS_22;
    let __VLS_23;
    const __VLS_24 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showClearModal = false;
        }
    };
    __VLS_20.slots.default;
    var __VLS_20;
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "danger",
        size: "sm",
        icon: "🧹",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        variant: "danger",
        size: "sm",
        icon: "🧹",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.onConfirmClear)
    };
    __VLS_27.slots.default;
    var __VLS_27;
}
var __VLS_17;
/** @type {[typeof YugiModal, typeof YugiModal, ]} */ ;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent(YugiModal, new YugiModal({
    modelValue: (__VLS_ctx.showDeleteModal),
    title: "Delete Custom Deck?",
    accent: "ai",
    width: "440px",
}));
const __VLS_33 = __VLS_32({
    modelValue: (__VLS_ctx.showDeleteModal),
    title: "Delete Custom Deck?",
    accent: "ai",
    width: "440px",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
__VLS_34.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "modal-body-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.store.activeDeck.name);
{
    const { footer: __VLS_thisSlot } = __VLS_34.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-footer-actions" },
    });
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "secondary",
        size: "sm",
    }));
    const __VLS_36 = __VLS_35({
        ...{ 'onClick': {} },
        variant: "secondary",
        size: "sm",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    let __VLS_38;
    let __VLS_39;
    let __VLS_40;
    const __VLS_41 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showDeleteModal = false;
        }
    };
    __VLS_37.slots.default;
    var __VLS_37;
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "danger",
        size: "sm",
        icon: "🗑️",
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onClick': {} },
        variant: "danger",
        size: "sm",
        icon: "🗑️",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_45;
    let __VLS_46;
    let __VLS_47;
    const __VLS_48 = {
        onClick: (__VLS_ctx.onConfirmDelete)
    };
    __VLS_44.slots.default;
    var __VLS_44;
}
var __VLS_34;
/** @type {__VLS_StyleScopedClasses['deck-column']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel--elevated']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-header']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-select-row']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-name-row']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-name-input']} */ ;
/** @type {__VLS_StyleScopedClasses['dirty-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-toolbar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn--save']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-trash-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['trash-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['trash-text']} */ ;
/** @type {__VLS_StyleScopedClasses['validity-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['validity-header']} */ ;
/** @type {__VLS_StyleScopedClasses['validity-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['validity-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['validity-errors']} */ ;
/** @type {__VLS_StyleScopedClasses['error-item']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-section']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-section--main']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['title-left']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['view-toggle-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-pills']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill--monsters']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill--spells']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill--traps']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-cards-scrollable']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-cards-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-card-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-thumb-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-thumb-img']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-drag-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-info-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-name']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-atk']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-type']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-lvl']} */ ;
/** @type {__VLS_StyleScopedClasses['section-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-drop-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-drop-overlay--main']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-action-text']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-action-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-section']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-section--extra']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['title-left']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-pill--fusions']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-cards-scrollable']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-cards-scrollable--extra']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-cards-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-card-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-card-tile--fusion']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-thumb-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-thumb-img']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-drag-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-info-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-name']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-atk']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-lvl']} */ ;
/** @type {__VLS_StyleScopedClasses['section-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-drop-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-drop-overlay--extra']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-action-text']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-action-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body-text']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body-text']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            handleImageError: handleImageError,
            YugiModal: YugiModal,
            YugiButton: YugiButton,
            DeckSelectorAutocomplete: DeckSelectorAutocomplete,
            store: store,
            deckNameInput: deckNameInput,
            showClearModal: showClearModal,
            showDeleteModal: showDeleteModal,
            isMainDragOver: isMainDragOver,
            isExtraDragOver: isExtraDragOver,
            isTrashDragOver: isTrashDragOver,
            mainScrollRef: mainScrollRef,
            extraScrollRef: extraScrollRef,
            validity: validity,
            isDraggingFromDeck: isDraggingFromDeck,
            isPoolDraggingToMain: isPoolDraggingToMain,
            isPoolDraggingToExtra: isPoolDraggingToExtra,
            isGroupedView: isGroupedView,
            mainDeckCards: mainDeckCards,
            extraDeckCards: extraDeckCards,
            onDeckAutocompleteSelect: onDeckAutocompleteSelect,
            onNameInput: onNameInput,
            onNewDeckClick: onNewDeckClick,
            onCardHover: onCardHover,
            onConfirmClear: onConfirmClear,
            onConfirmDelete: onConfirmDelete,
            getCardKindClass: getCardKindClass,
            onDeckCardDragStart: onDeckCardDragStart,
            onDeckCardDragEnd: onDeckCardDragEnd,
            onMainDragOver: onMainDragOver,
            onMainDragLeave: onMainDragLeave,
            onMainDrop: onMainDrop,
            onExtraDragOver: onExtraDragOver,
            onExtraDragLeave: onExtraDragLeave,
            onExtraDrop: onExtraDrop,
            onTrashDragOver: onTrashDragOver,
            onTrashDrop: onTrashDrop,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
