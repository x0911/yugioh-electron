import { ref, computed } from 'vue';
import { useDuelStore } from '../../stores/duelStore.js';
import YugiModal from '../common/YugiModal.vue';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
const props = withDefaults(defineProps(), {
    min: 1,
    max: 1,
    canCancel: false,
    instruction: 'Select card(s) to proceed.',
});
const emit = defineEmits();
const duelStore = useDuelStore();
const searchQuery = ref('');
function getLocationName(location) {
    if (location === 1)
        return 'Deck';
    if (location === 2)
        return 'Hand';
    if (location === 4)
        return 'Monster Zone';
    if (location === 8)
        return 'Spell/Trap Zone';
    if (location === 16)
        return 'Graveyard';
    if (location === 32)
        return 'Banished';
    if (location === 64)
        return 'Extra Deck';
    return 'Field';
}
function getLocationIcon(location) {
    if (location === 1)
        return '📦';
    if (location === 2)
        return '✋';
    if (location === 4)
        return '⚔️';
    if (location === 8)
        return '🔮';
    if (location === 16)
        return '🪦';
    if (location === 32)
        return '🌌';
    if (location === 64)
        return '✨';
    return '🎯';
}
const enrichedCards = computed(() => {
    if (!props.selectPayload)
        return [];
    const result = [];
    const unselectCards = props.selectPayload.unselect_cards || [];
    const selectCards = props.selectPayload.selects || [];
    // First, already selected cards in multi-step SELECT_UNSELECT_CARD prompts
    unselectCards.forEach((item, unselectIdx) => {
        const detail = duelStore.getCardDetail(item.code);
        const loc = item.location || 16;
        const locName = getLocationName(loc);
        const owner = item.controller === duelStore.userPlayerId ? 'user' : 'ai';
        const isMonster = detail?.isMonster ?? (detail?.atk !== undefined || (detail?.level ?? 0) > 0);
        result.push({
            selectIndex: selectCards.length + unselectIdx,
            code: item.code,
            name: item.cardName && item.cardName !== 'Card' ? item.cardName : detail?.name || `Card #${item.code}`,
            location: loc,
            locationName: locName,
            sequence: item.sequence,
            position: 'position' in item ? item.position : 1,
            controller: item.controller,
            owner,
            isMonster,
            atk: detail?.atk,
            def: detail?.def,
            level: detail?.level,
            attribute: detail?.attributeName,
            race: detail?.raceName,
            type: detail?.type,
            desc: detail?.desc,
            isSelected: true,
            selectionOrder: unselectIdx + 1,
        });
    });
    // Second, candidate selectable cards
    selectCards.forEach((item, originalIndex) => {
        const detail = duelStore.getCardDetail(item.code);
        const loc = item.location || 1;
        const locName = getLocationName(loc);
        const owner = item.controller === duelStore.userPlayerId ? 'user' : 'ai';
        const isMonster = detail?.isMonster ?? (detail?.atk !== undefined || (detail?.level ?? 0) > 0);
        const isSelected = props.selectedIndices.includes(originalIndex);
        const orderIdx = props.selectedIndices.indexOf(originalIndex);
        result.push({
            selectIndex: originalIndex,
            code: item.code,
            name: item.cardName && item.cardName !== 'Card' ? item.cardName : detail?.name || `Card #${item.code}`,
            location: loc,
            locationName: locName,
            sequence: item.sequence,
            position: 'position' in item ? item.position : 1,
            controller: item.controller,
            owner,
            isMonster,
            atk: detail?.atk,
            def: detail?.def,
            level: detail?.level,
            attribute: detail?.attributeName,
            race: detail?.raceName,
            type: detail?.type,
            desc: detail?.desc,
            isSelected,
            selectionOrder: orderIdx >= 0 ? unselectCards.length + orderIdx + 1 : 0,
        });
    });
    return result;
});
const selectedCount = computed(() => {
    const unselectCards = props.selectPayload?.unselect_cards || [];
    return unselectCards.length + props.selectedIndices.length;
});
const filteredCards = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query)
        return enrichedCards.value;
    return enrichedCards.value.filter((c) => {
        if (c.name.toLowerCase().includes(query))
            return true;
        if (c.attribute && c.attribute.toLowerCase().includes(query))
            return true;
        if (c.race && c.race.toLowerCase().includes(query))
            return true;
        if (c.level && String(c.level) === query)
            return true;
        if (c.atk !== undefined && String(c.atk).includes(query))
            return true;
        if (c.def !== undefined && String(c.def).includes(query))
            return true;
        return false;
    });
});
const primaryLocation = computed(() => {
    if (enrichedCards.value.length === 0)
        return 1;
    return enrichedCards.value[0].location;
});
const primaryLocationName = computed(() => {
    return getLocationName(primaryLocation.value);
});
const primaryLocationIcon = computed(() => {
    return getLocationIcon(primaryLocation.value);
});
const headerTitle = computed(() => {
    const loc = primaryLocation.value;
    if (loc === 1)
        return 'Select Card from Deck';
    if (loc === 16)
        return 'Select Target from Graveyard';
    if (loc === 2)
        return 'Select Card from Hand';
    if (loc === 64)
        return 'Select from Extra Deck';
    if (loc === 32)
        return 'Select Banished Card';
    if (loc === 4)
        return 'Select Monster Target';
    return 'Select Card Target';
});
const isSelectionValid = computed(() => {
    if (duelStore.activeSelectUnselectCard) {
        if (duelStore.activeSelectUnselectCard.can_finish)
            return true;
        return selectedCount.value >= props.min && selectedCount.value <= props.max;
    }
    const count = props.selectedIndices.length;
    return count >= props.min && count <= props.max;
});
const isSelectionComplete = computed(() => {
    return selectedCount.value >= props.max;
});
function onMouseEnter(card) {
    const fieldCard = {
        id: `sel-${card.selectIndex}-${card.code}`,
        code: card.code,
        name: card.name,
        location: card.location === 4 ? 'monster' : card.location === 8 ? 'spell-trap' : 'graveyard',
        sequence: card.sequence,
        controller: card.owner === 'user' ? 0 : 1,
        position: 'faceup_attack',
        atk: card.atk,
        def: card.def,
        level: card.level,
        attribute: card.attribute,
        race: card.race,
        description: card.desc,
    };
    emit('hover-card', fieldCard);
}
function onMouseLeave() {
    emit('hover-card', null);
}
function onCardClick(card) {
    emit('toggle-target', card.selectIndex);
}
function onCardDblClick(card) {
    // If single selection, double click selects and confirms immediately
    if (props.max === 1) {
        if (!card.isSelected) {
            emit('toggle-target', card.selectIndex);
        }
        setTimeout(() => {
            emit('confirm');
        }, 50);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    min: 1,
    max: 1,
    canCancel: false,
    instruction: 'Select card(s) to proceed.',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof YugiModal, typeof YugiModal, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(YugiModal, new YugiModal({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    width: ('920px'),
    accent: ('user'),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    width: ('920px'),
    accent: ('user'),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.$emit('update:modelValue', $event);
    }
};
var __VLS_7 = {};
__VLS_2.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "header-icon" },
    });
    (__VLS_ctx.primaryLocationIcon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-titles" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "header-title" },
    });
    (__VLS_ctx.headerTitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "header-subtitle" },
    });
    (__VLS_ctx.instruction);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "location-pill" },
        ...{ class: (`location-pill--${__VLS_ctx.primaryLocationName.toLowerCase()}`) },
    });
    (__VLS_ctx.primaryLocationName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selection-counter-badge" },
        ...{ class: ({
                'selection-counter-badge--complete': __VLS_ctx.isSelectionComplete,
                'selection-counter-badge--pending': !__VLS_ctx.isSelectionComplete,
            }) },
    });
    (__VLS_ctx.selectedCount);
    (__VLS_ctx.max);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "selection-modal-body" },
});
if (__VLS_ctx.enrichedCards.length > 6) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-filter-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-input-wrapper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "search-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        value: (__VLS_ctx.searchQuery),
        type: "text",
        placeholder: "Filter cards by name, ATK, DEF, level, or type...",
        ...{ class: "search-input" },
    });
    if (__VLS_ctx.searchQuery) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.enrichedCards.length > 6))
                        return;
                    if (!(__VLS_ctx.searchQuery))
                        return;
                    __VLS_ctx.searchQuery = '';
                } },
            ...{ class: "search-clear-btn" },
            title: "Clear search",
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-count" },
    });
    (__VLS_ctx.filteredCards.length);
    (__VLS_ctx.enrichedCards.length);
}
if (__VLS_ctx.filteredCards.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "empty-title" },
    });
    (__VLS_ctx.searchQuery ? 'No cards match your filter' : 'No selectable cards available');
    if (__VLS_ctx.searchQuery) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "empty-subtitle" },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-grid" },
    });
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.filteredCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredCards.length === 0))
                        return;
                    __VLS_ctx.onMouseEnter(card);
                } },
            ...{ onMouseleave: (__VLS_ctx.onMouseLeave) },
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredCards.length === 0))
                        return;
                    __VLS_ctx.onCardClick(card);
                } },
            ...{ onDblclick: (...[$event]) => {
                    if (!!(__VLS_ctx.filteredCards.length === 0))
                        return;
                    __VLS_ctx.onCardDblClick(card);
                } },
            key: (`sel-${card.selectIndex}-${card.code}`),
            ...{ class: "selection-tile" },
            ...{ class: ({
                    'selection-tile--selected': card.isSelected,
                    'selection-tile--selectable': true,
                }) },
        });
        if (card.isSelected) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-selected-badge" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "check-icon" },
            });
            if (__VLS_ctx.max > 1) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "order-number" },
                });
                (card.selectionOrder);
            }
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-art-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(card.code, 'full')),
            alt: (card.name),
            ...{ class: "tile-art-img" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-art-glow" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-name" },
            title: (card.name),
        });
        (card.name);
        if (card.isMonster) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-stats" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-meta-row" },
            });
            if (card.level) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "tile-level" },
                });
                (card.level);
            }
            if (card.attribute) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "tile-attribute" },
                    ...{ class: (`tile-attribute--${card.attribute.toLowerCase()}`) },
                });
                (card.attribute);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-combat-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-atk" },
            });
            (__VLS_ctx.formatCombatStat(card.atk));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-separator" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-def" },
            });
            (__VLS_ctx.formatCombatStat(card.def));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-spell-meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "tile-type-tag" },
                ...{ class: (card.attribute === 'TRAP' ? 'tag--trap' : 'tag--spell') },
            });
            (card.attribute === 'TRAP' ? 'TRAP' : 'SPELL');
        }
    }
}
{
    const { footer: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selection-modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "footer-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('minimize');
            } },
        type: "button",
        ...{ class: "action-btn action-btn--minimize" },
        title: "Temporarily minimize dialog to inspect field",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "btn-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "footer-right" },
    });
    if (__VLS_ctx.canCancel || __VLS_ctx.min === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.canCancel || __VLS_ctx.min === 0))
                        return;
                    __VLS_ctx.$emit('cancel');
                } },
            type: "button",
            ...{ class: "action-btn action-btn--cancel" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('confirm');
            } },
        type: "button",
        ...{ class: "action-btn action-btn--confirm" },
        disabled: (!__VLS_ctx.isSelectionValid),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "btn-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.selectedCount);
    (__VLS_ctx.max);
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['selection-modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['header-titles']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['location-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-counter-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['search-clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-count']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-selected-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['check-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['order-number']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-art-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-art-img']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-art-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-name']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-meta-row']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-level']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-attribute']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-combat-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-def']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-spell-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-type-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['selection-modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-left']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--minimize']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-right']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--cancel']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            YugiModal: YugiModal,
            getCardImageUrl: getCardImageUrl,
            handleImageError: handleImageError,
            formatCombatStat: formatCombatStat,
            searchQuery: searchQuery,
            enrichedCards: enrichedCards,
            selectedCount: selectedCount,
            filteredCards: filteredCards,
            primaryLocationName: primaryLocationName,
            primaryLocationIcon: primaryLocationIcon,
            headerTitle: headerTitle,
            isSelectionValid: isSelectionValid,
            isSelectionComplete: isSelectionComplete,
            onMouseEnter: onMouseEnter,
            onMouseLeave: onMouseLeave,
            onCardClick: onCardClick,
            onCardDblClick: onCardDblClick,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
