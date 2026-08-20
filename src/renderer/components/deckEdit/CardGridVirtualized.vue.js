import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
const store = useDeckEditStore();
const containerRef = ref(null);
const scrollTop = ref(0);
const containerHeight = ref(600);
const containerWidth = ref(800);
const isPoolDragOver = ref(false);
// Geometry constants (in pixels)
const ITEM_WIDTH = 110;
const ITEM_HEIGHT = 188;
const GAP = 12;
const OVERSCAN_ROWS = 3;
// Live deck card copy counts
const deckCounts = computed(() => store.deckCardCounts);
// Filtered cards list from Pinia
const cards = computed(() => store.filteredCards);
const totalCards = computed(() => cards.value.length);
// Calculate columns per row based on container width
const columnsCount = computed(() => {
    const availableWidth = containerWidth.value - 24; // padding
    const cols = Math.floor((availableWidth + GAP) / (ITEM_WIDTH + GAP));
    return Math.max(1, cols);
});
// Calculate total rows and total virtual height
const totalRows = computed(() => {
    if (totalCards.value === 0 || columnsCount.value === 0)
        return 0;
    return Math.ceil(totalCards.value / columnsCount.value);
});
const rowHeight = ITEM_HEIGHT + GAP;
const totalGridHeight = computed(() => {
    return totalRows.value * rowHeight;
});
// Visible row calculation
const startRow = computed(() => {
    const row = Math.floor(scrollTop.value / rowHeight) - OVERSCAN_ROWS;
    return Math.max(0, row);
});
const endRow = computed(() => {
    const row = Math.ceil((scrollTop.value + containerHeight.value) / rowHeight) + OVERSCAN_ROWS;
    return Math.min(totalRows.value, row);
});
const offsetY = computed(() => {
    return startRow.value * rowHeight;
});
// Sliced visible cards (only ~20-36 cards in DOM at any time)
const visibleCards = computed(() => {
    const startIdx = startRow.value * columnsCount.value;
    const endIdx = Math.min(totalCards.value, endRow.value * columnsCount.value);
    return cards.value.slice(startIdx, endIdx);
});
function onScroll(e) {
    const target = e.target;
    scrollTop.value = target.scrollTop;
}
function updateDimensions() {
    if (containerRef.value) {
        containerHeight.value = containerRef.value.clientHeight || 600;
        containerWidth.value = containerRef.value.clientWidth || 800;
    }
}
let resizeObserver = null;
onMounted(() => {
    updateDimensions();
    if (containerRef.value && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
            updateDimensions();
        });
        resizeObserver.observe(containerRef.value);
    }
    window.addEventListener('resize', updateDimensions);
});
onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    window.removeEventListener('resize', updateDimensions);
});
// Scroll to top when search query or filter changes significantly
watch(() => store.filters.query, () => {
    if (containerRef.value) {
        containerRef.value.scrollTop = 0;
        scrollTop.value = 0;
    }
});
function onCardHover(card) {
    store.setHoveredCard(card);
}
function onCardClick(card) {
    store.setHoveredCard(card);
}
function onCardRightClick(card) {
    store.setHoveredCard(card);
}
// HTML5 Drag & Drop handlers
function onDragStart(e, card) {
    if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id, isExtra: card.isExtraDeck, source: 'pool' }));
        e.dataTransfer.effectAllowed = 'copyMove';
    }
    store.startDrag(card, 'pool');
}
function onDragEnd() {
    store.endDrag();
}
function onPoolDragOver(e) {
    if (store.isDragging && (store.dragSource === 'main-deck' || store.dragSource === 'extra-deck')) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
        isPoolDragOver.value = true;
    }
}
function onPoolDragLeave(e) {
    const related = e.relatedTarget;
    if (!containerRef.value?.contains(related)) {
        isPoolDragOver.value = false;
    }
}
function onPoolDrop(e) {
    isPoolDragOver.value = false;
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
/** @type {__VLS_StyleScopedClasses['card-drag-indicator']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onScroll: (__VLS_ctx.onScroll) },
    ...{ onDragover: (__VLS_ctx.onPoolDragOver) },
    ...{ onDragleave: (__VLS_ctx.onPoolDragLeave) },
    ...{ onDrop: (__VLS_ctx.onPoolDrop) },
    ref: "containerRef",
    ...{ class: "virtual-card-grid-container" },
    ...{ class: ({
            'virtual-card-grid-container--drop-active': __VLS_ctx.store.isDragging && (__VLS_ctx.store.dragSource === 'main-deck' || __VLS_ctx.store.dragSource === 'extra-deck'),
            'virtual-card-grid-container--drag-over': __VLS_ctx.isPoolDragOver,
        }) },
});
/** @type {typeof __VLS_ctx.containerRef} */ ;
if (__VLS_ctx.totalCards > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "virtual-scroll-spacer" },
        ...{ style: ({ height: `${__VLS_ctx.totalGridHeight}px` }) },
    });
}
if (__VLS_ctx.totalCards > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "virtual-items-viewport" },
        ...{ style: ({ transform: `translateY(${__VLS_ctx.offsetY}px)` }) },
    });
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.visibleCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!(__VLS_ctx.totalCards > 0))
                        return;
                    __VLS_ctx.onCardHover(card);
                } },
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.totalCards > 0))
                        return;
                    __VLS_ctx.onCardClick(card);
                } },
            ...{ onContextmenu: (...[$event]) => {
                    if (!(__VLS_ctx.totalCards > 0))
                        return;
                    __VLS_ctx.onCardRightClick(card);
                } },
            ...{ onDragstart: (...[$event]) => {
                    if (!(__VLS_ctx.totalCards > 0))
                        return;
                    __VLS_ctx.onDragStart($event, card);
                } },
            ...{ onDragend: (__VLS_ctx.onDragEnd) },
            key: (card.id),
            ...{ class: "card-grid-item" },
            ...{ class: ({
                    'card-grid-item--in-deck': (__VLS_ctx.deckCounts.get(card.id) ?? 0) > 0,
                    'card-grid-item--max': (__VLS_ctx.deckCounts.get(card.id) ?? 0) >= 3,
                    'card-grid-item--dragging': __VLS_ctx.store.isDragging && __VLS_ctx.store.draggingCard?.id === card.id,
                }) },
            draggable: "true",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-thumb-wrapper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(card.id, 'mini')),
            alt: (card.name),
            ...{ class: "card-thumb-img" },
            loading: "lazy",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-count-badge" },
            ...{ class: ({
                    'card-count-badge--active': (__VLS_ctx.deckCounts.get(card.id) ?? 0) > 0,
                    'card-count-badge--max': (__VLS_ctx.deckCounts.get(card.id) ?? 0) >= 3,
                }) },
        });
        (__VLS_ctx.deckCounts.get(card.id) ?? 0);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-drag-indicator" },
            title: "Drag to Deck",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            width: "14",
            height: "14",
            fill: "currentColor",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z",
        });
        if (card.isExtraDeck) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "extra-badge" },
                title: "Extra Deck (Fusion)",
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-era-tag" },
            ...{ class: (`card-era-tag--${card.era.toLowerCase()}`) },
        });
        (card.era);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-info-strip" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "card-title-text" },
            title: (card.name),
        });
        (card.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-quick-stats" },
        });
        if (card.isMonster) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "quick-atk" },
            });
            (card.atk < 0 ? '?' : card.atk);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "quick-type" },
            });
            (card.isSpell ? 'SPELL' : 'TRAP');
        }
        if (card.isMonster && card.level > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "quick-lvl" },
            });
            (card.level);
        }
    }
}
const __VLS_0 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "fade",
}));
const __VLS_2 = __VLS_1({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.store.isDragging && (__VLS_ctx.store.dragSource === 'main-deck' || __VLS_ctx.store.dragSource === 'extra-deck')) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pool-drop-remove-zone" },
        ...{ class: ({ 'pool-drop-remove-zone--hover': __VLS_ctx.isPoolDragOver }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drop-remove-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drop-remove-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "drop-remove-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "drop-remove-subtitle" },
    });
    (__VLS_ctx.store.draggingCard?.name || 'Card');
}
var __VLS_3;
if (__VLS_ctx.totalCards === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "empty-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "empty-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.store.resetFilters) },
        type: "button",
        ...{ class: "clear-filters-cta" },
    });
}
/** @type {__VLS_StyleScopedClasses['virtual-card-grid-container']} */ ;
/** @type {__VLS_StyleScopedClasses['virtual-scroll-spacer']} */ ;
/** @type {__VLS_StyleScopedClasses['virtual-items-viewport']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid-item']} */ ;
/** @type {__VLS_StyleScopedClasses['card-thumb-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['card-thumb-img']} */ ;
/** @type {__VLS_StyleScopedClasses['card-count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-drag-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['extra-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-era-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-quick-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-atk']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-type']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-lvl']} */ ;
/** @type {__VLS_StyleScopedClasses['pool-drop-remove-zone']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-remove-content']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-remove-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-remove-title']} */ ;
/** @type {__VLS_StyleScopedClasses['drop-remove-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-filters-cta']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            handleImageError: handleImageError,
            store: store,
            containerRef: containerRef,
            isPoolDragOver: isPoolDragOver,
            deckCounts: deckCounts,
            totalCards: totalCards,
            totalGridHeight: totalGridHeight,
            offsetY: offsetY,
            visibleCards: visibleCards,
            onScroll: onScroll,
            onCardHover: onCardHover,
            onCardClick: onCardClick,
            onCardRightClick: onCardRightClick,
            onDragStart: onDragStart,
            onDragEnd: onDragEnd,
            onPoolDragOver: onPoolDragOver,
            onPoolDragLeave: onPoolDragLeave,
            onPoolDrop: onPoolDrop,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
