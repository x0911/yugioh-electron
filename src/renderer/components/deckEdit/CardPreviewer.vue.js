import { computed } from 'vue';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
const store = useDeckEditStore();
const card = computed(() => store.hoveredCard);
const fullImageUrl = computed(() => {
    if (!card.value)
        return '';
    return getCardImageUrl(card.value.id, 'full');
});
const currentCopies = computed(() => {
    if (!card.value)
        return 0;
    return store.deckCardCounts.get(card.value.id) ?? 0;
});
function onPreviewDragStart(e) {
    if (e.dataTransfer && card.value) {
        e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.value.id, isExtra: card.value.isExtraDeck, source: 'previewer' }));
        e.dataTransfer.effectAllowed = 'copy';
    }
    if (card.value) {
        store.startDrag(card.value, 'previewer');
    }
}
function onPreviewDragEnd() {
    store.endDrag();
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['preview-drag-hint']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-previewer glass-panel glass-panel--elevated" },
});
if (__VLS_ctx.card) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "previewer-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "card-name" },
        title: (__VLS_ctx.card.name),
    });
    (__VLS_ctx.card.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "era-badge" },
        ...{ class: (`era-badge--${__VLS_ctx.card.era.toLowerCase()}`) },
    });
    (__VLS_ctx.card.era);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "attribute-tag" },
        ...{ class: (`attribute-tag--${__VLS_ctx.card.attributeName.toLowerCase()}`) },
    });
    (__VLS_ctx.card.attributeName);
}
if (__VLS_ctx.card) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "previewer-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-image-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onDragstart: (__VLS_ctx.onPreviewDragStart) },
        ...{ onDragend: (__VLS_ctx.onPreviewDragEnd) },
        ...{ class: "card-frame-container" },
        draggable: "true",
        title: "Drag into Deck",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleImageError) },
        src: (__VLS_ctx.fullImageUrl),
        alt: (__VLS_ctx.card.name),
        ...{ class: "card-full-image" },
        loading: "lazy",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "foil-sweep-layer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-drag-hint" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    if (__VLS_ctx.card.isMonster && __VLS_ctx.card.level > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "level-stars-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "level-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stars-list" },
        });
        for (const [i] of __VLS_getVForSourceType((__VLS_ctx.card.level))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (i),
                ...{ class: "star-icon" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "level-number" },
        });
        (__VLS_ctx.card.level);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "type-labels-row" },
    });
    for (const [label, idx] of __VLS_getVForSourceType((__VLS_ctx.card.typeLabels))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (idx),
            ...{ class: "type-pill" },
            ...{ class: (`type-pill--${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`) },
        });
        (label);
    }
    if (__VLS_ctx.card.isMonster) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stat-boxes-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stat-box stat-box--atk" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-val" },
        });
        (__VLS_ctx.card.atk < 0 ? '?' : __VLS_ctx.card.atk);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stat-box stat-box--def" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-val" },
        });
        (__VLS_ctx.card.def < 0 ? '?' : __VLS_ctx.card.def);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-desc-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "desc-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "desc-title" },
    });
    (__VLS_ctx.card.isNormal ? 'Card Lore' : 'Effect & Description');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "passcode" },
    });
    (__VLS_ctx.card.id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "desc-scrollable" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "desc-text" },
        ...{ class: ({ 'desc-text--lore': __VLS_ctx.card.isNormal }) },
    });
    (__VLS_ctx.card.desc);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "previewer-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-quantity-status" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "quantity-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "quantity-count" },
        ...{ class: ({
                'quantity-count--max': __VLS_ctx.currentCopies >= 3,
                'quantity-count--active': __VLS_ctx.currentCopies > 0,
            }) },
    });
    (__VLS_ctx.currentCopies);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drag-hint-pill" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drag-hint-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drag-hint-text" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "previewer-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "empty-text" },
    });
}
/** @type {__VLS_StyleScopedClasses['card-previewer']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel--elevated']} */ ;
/** @type {__VLS_StyleScopedClasses['previewer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-main']} */ ;
/** @type {__VLS_StyleScopedClasses['card-name']} */ ;
/** @type {__VLS_StyleScopedClasses['era-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['previewer-body']} */ ;
/** @type {__VLS_StyleScopedClasses['card-image-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['card-frame-container']} */ ;
/** @type {__VLS_StyleScopedClasses['card-full-image']} */ ;
/** @type {__VLS_StyleScopedClasses['foil-sweep-layer']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-drag-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['level-stars-row']} */ ;
/** @type {__VLS_StyleScopedClasses['level-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stars-list']} */ ;
/** @type {__VLS_StyleScopedClasses['star-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['level-number']} */ ;
/** @type {__VLS_StyleScopedClasses['type-labels-row']} */ ;
/** @type {__VLS_StyleScopedClasses['type-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-boxes-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box--atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-val']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-box--def']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-val']} */ ;
/** @type {__VLS_StyleScopedClasses['card-desc-container']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-header']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-title']} */ ;
/** @type {__VLS_StyleScopedClasses['passcode']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-scrollable']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-text']} */ ;
/** @type {__VLS_StyleScopedClasses['previewer-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-quantity-status']} */ ;
/** @type {__VLS_StyleScopedClasses['quantity-label']} */ ;
/** @type {__VLS_StyleScopedClasses['quantity-count']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-hint-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-hint-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-hint-text']} */ ;
/** @type {__VLS_StyleScopedClasses['previewer-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            handleImageError: handleImageError,
            card: card,
            fullImageUrl: fullImageUrl,
            currentCopies: currentCopies,
            onPreviewDragStart: onPreviewDragStart,
            onPreviewDragEnd: onPreviewDragEnd,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
