import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
const props = withDefaults(defineProps(), {
    disabled: false,
    placeholder: 'Search 80+ decks (e.g. Kaiba, Cyber, Exodia)...',
});
const emit = defineEmits();
const isOpen = ref(false);
const searchQuery = ref('');
const activeCategory = ref('ALL');
const highlightedIndex = ref(0);
const inputRef = ref(null);
const listContainerRef = ref(null);
const rootRef = ref(null);
// Find currently selected deck
const activeDeck = computed(() => {
    return props.decks.find((d) => d.id === props.modelValue) || props.decks[0] || null;
});
// Category counts
const counts = computed(() => {
    let dmCount = 0;
    let gxCount = 0;
    let popCount = 0;
    let customCount = 0;
    for (const d of props.decks) {
        if (d.category === 'character-dm')
            dmCount++;
        else if (d.category === 'character-gx')
            gxCount++;
        else if (d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-'))
            popCount++;
        else
            customCount++;
    }
    return {
        all: props.decks.length,
        dm: dmCount,
        gx: gxCount,
        popular: popCount,
        custom: customCount,
    };
});
// Filtered deck list based on category & search query
const filteredDecks = computed(() => {
    let list = props.decks;
    // 1. Filter by category tab
    if (activeCategory.value === 'character-dm') {
        list = list.filter((d) => d.category === 'character-dm' || (d.series === 'DM' && d.characterName && d.characterName !== 'Community Popular'));
    }
    else if (activeCategory.value === 'character-gx') {
        list = list.filter((d) => d.category === 'character-gx' || (d.series === 'GX' && d.characterName && d.characterName !== 'Community Popular'));
    }
    else if (activeCategory.value === 'popular') {
        list = list.filter((d) => d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-') || d.characterName === 'Community Popular');
    }
    else if (activeCategory.value === 'custom') {
        list = list.filter((d) => !d.category || d.category === 'custom' || (!d.category.startsWith('character-') && !d.category.startsWith('popular-') && !d.id.startsWith('pop-') && !d.id.includes('_deck_')));
    }
    // 2. Filter by search query
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter((d) => {
            const name = (d.name || '').toLowerCase();
            const arch = (d.archetype || '').toLowerCase();
            const charName = (d.characterName || '').toLowerCase();
            const series = (d.series || '').toLowerCase();
            return name.includes(q) || arch.includes(q) || charName.includes(q) || series.includes(q);
        });
    }
    return list;
});
// Reset highlighted index when filter changes
watch(filteredDecks, () => {
    highlightedIndex.value = 0;
});
function toggleDropdown() {
    if (props.disabled)
        return;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        searchQuery.value = '';
        highlightedIndex.value = 0;
        nextTick(() => {
            inputRef.value?.focus();
            scrollHighlightedIntoView();
        });
    }
}
function openDropdown() {
    if (props.disabled || isOpen.value)
        return;
    isOpen.value = true;
    searchQuery.value = '';
    highlightedIndex.value = 0;
    nextTick(() => {
        inputRef.value?.focus();
        scrollHighlightedIntoView();
    });
}
function closeDropdown() {
    isOpen.value = false;
    searchQuery.value = '';
}
function selectDeck(deck) {
    emit('update:modelValue', deck.id);
    emit('select', deck);
    closeDropdown();
}
function onKeyDown(e) {
    if (!isOpen.value) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDropdown();
        }
        return;
    }
    const len = filteredDecks.value.length;
    if (len === 0) {
        if (e.key === 'Escape')
            closeDropdown();
        return;
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex.value = (highlightedIndex.value + 1) % len;
        scrollHighlightedIntoView();
    }
    else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex.value = (highlightedIndex.value - 1 + len) % len;
        scrollHighlightedIntoView();
    }
    else if (e.key === 'Enter') {
        e.preventDefault();
        const target = filteredDecks.value[highlightedIndex.value];
        if (target) {
            selectDeck(target);
        }
    }
    else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
    }
}
function scrollHighlightedIntoView() {
    nextTick(() => {
        if (!listContainerRef.value)
            return;
        const items = listContainerRef.value.querySelectorAll('.deck-autocomplete__item');
        const target = items[highlightedIndex.value];
        if (target) {
            target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    });
}
function getCategoryBadge(deck) {
    if (deck.category === 'character-dm' || (deck.series === 'DM' && deck.characterName && deck.characterName !== 'Community Popular')) {
        return { text: 'DM HERO', classModifier: 'dm' };
    }
    if (deck.category === 'character-gx' || (deck.series === 'GX' && deck.characterName && deck.characterName !== 'Community Popular')) {
        return { text: 'GX HERO', classModifier: 'gx' };
    }
    if (deck.category === 'popular-dm' || (deck.series === 'DM' && (deck.id.startsWith('pop-') || deck.characterName === 'Community Popular'))) {
        return { text: 'DM META', classModifier: 'pop-dm' };
    }
    if (deck.category === 'popular-gx' || (deck.series === 'GX' && (deck.id.startsWith('pop-') || deck.characterName === 'Community Popular'))) {
        return { text: 'GX META', classModifier: 'pop-gx' };
    }
    return { text: 'CUSTOM', classModifier: 'custom' };
}
function highlightMatch(text, query) {
    if (!query || !text)
        return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark class="deck-autocomplete__match">$1</mark>');
}
// Click outside detection
function handleClickOutside(event) {
    if (rootRef.value && !rootRef.value.contains(event.target)) {
        closeDropdown();
    }
}
onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
});
onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    disabled: false,
    placeholder: 'Search 80+ decks (e.g. Kaiba, Cyber, Exodia)...',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onKeydown: (__VLS_ctx.onKeyDown) },
    ref: "rootRef",
    ...{ class: "deck-autocomplete" },
    ...{ class: ({ 'deck-autocomplete--open': __VLS_ctx.isOpen, 'deck-autocomplete--disabled': __VLS_ctx.disabled }) },
});
/** @type {typeof __VLS_ctx.rootRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleDropdown) },
    type: "button",
    ...{ class: "deck-autocomplete__trigger" },
    disabled: (__VLS_ctx.disabled),
    'aria-haspopup': "listbox",
    'aria-expanded': (__VLS_ctx.isOpen),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-autocomplete__trigger-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "deck-autocomplete__icon" },
    'aria-hidden': "true",
});
if (__VLS_ctx.activeDeck) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-autocomplete__current-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__current-name" },
    });
    (__VLS_ctx.activeDeck.name);
    if (__VLS_ctx.activeDeck.archetype) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deck-autocomplete__current-arch" },
        });
        (__VLS_ctx.activeDeck.archetype);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__placeholder" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "deck-autocomplete__trigger-right" },
});
if (__VLS_ctx.activeDeck) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__badge" },
        ...{ class: (`deck-autocomplete__badge--${__VLS_ctx.getCategoryBadge(__VLS_ctx.activeDeck).classModifier}`) },
    });
    (__VLS_ctx.getCategoryBadge(__VLS_ctx.activeDeck).text);
}
if (__VLS_ctx.activeDeck) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__counts-tag" },
    });
    (__VLS_ctx.activeDeck.main.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dim" },
    });
    (__VLS_ctx.activeDeck.extra?.length || 0);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "deck-autocomplete__chevron" },
    ...{ class: ({ 'deck-autocomplete__chevron--open': __VLS_ctx.isOpen }) },
});
const __VLS_0 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "deck-dropdown-fade",
}));
const __VLS_2 = __VLS_1({
    name: "deck-dropdown-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.isOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-autocomplete__panel glass-panel glass-panel--elevated" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-autocomplete__search-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__search-icon" },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ref: "inputRef",
        value: (__VLS_ctx.searchQuery),
        type: "text",
        ...{ class: "deck-autocomplete__input" },
        placeholder: (__VLS_ctx.placeholder),
        autocomplete: "off",
        spellcheck: "false",
    });
    /** @type {typeof __VLS_ctx.inputRef} */ ;
    if (__VLS_ctx.searchQuery) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    if (!(__VLS_ctx.searchQuery))
                        return;
                    __VLS_ctx.searchQuery = '';
                    __VLS_ctx.inputRef?.focus();
                } },
            type: "button",
            ...{ class: "deck-autocomplete__clear-btn" },
            title: "Clear search",
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "deck-autocomplete__tabs" },
        role: "tablist",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.activeCategory = 'ALL';
            } },
        type: "button",
        ...{ class: "deck-autocomplete__tab" },
        ...{ class: ({ 'deck-autocomplete__tab--active': __VLS_ctx.activeCategory === 'ALL' }) },
        role: "tab",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__tab-count" },
    });
    (__VLS_ctx.counts.all);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.activeCategory = 'character-dm';
            } },
        type: "button",
        ...{ class: "deck-autocomplete__tab" },
        ...{ class: ({ 'deck-autocomplete__tab--active': __VLS_ctx.activeCategory === 'character-dm' }) },
        role: "tab",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__tab-count" },
    });
    (__VLS_ctx.counts.dm);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.activeCategory = 'character-gx';
            } },
        type: "button",
        ...{ class: "deck-autocomplete__tab" },
        ...{ class: ({ 'deck-autocomplete__tab--active': __VLS_ctx.activeCategory === 'character-gx' }) },
        role: "tab",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__tab-count" },
    });
    (__VLS_ctx.counts.gx);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.activeCategory = 'popular';
            } },
        type: "button",
        ...{ class: "deck-autocomplete__tab" },
        ...{ class: ({ 'deck-autocomplete__tab--active': __VLS_ctx.activeCategory === 'popular' }) },
        role: "tab",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__tab-count" },
    });
    (__VLS_ctx.counts.popular);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.activeCategory = 'custom';
            } },
        type: "button",
        ...{ class: "deck-autocomplete__tab" },
        ...{ class: ({ 'deck-autocomplete__tab--active': __VLS_ctx.activeCategory === 'custom' }) },
        role: "tab",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "deck-autocomplete__tab-count" },
    });
    (__VLS_ctx.counts.custom);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "listContainerRef",
        ...{ class: "deck-autocomplete__list custom-scrollbar" },
        role: "listbox",
    });
    /** @type {typeof __VLS_ctx.listContainerRef} */ ;
    for (const [deck, idx] of __VLS_getVForSourceType((__VLS_ctx.filteredDecks))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    __VLS_ctx.highlightedIndex = idx;
                } },
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    __VLS_ctx.selectDeck(deck);
                } },
            key: (deck.id),
            ...{ class: "deck-autocomplete__item" },
            ...{ class: ({
                    'deck-autocomplete__item--selected': deck.id === __VLS_ctx.modelValue,
                    'deck-autocomplete__item--highlighted': idx === __VLS_ctx.highlightedIndex,
                }) },
            role: "option",
            'aria-selected': (deck.id === __VLS_ctx.modelValue),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "deck-autocomplete__item-left" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "deck-autocomplete__item-title-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
            ...{ class: "deck-autocomplete__item-name" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.highlightMatch(deck.name, __VLS_ctx.searchQuery)) }, null, null);
        if (deck.id === __VLS_ctx.modelValue) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "deck-autocomplete__item-check" },
                title: "Current Active Deck",
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "deck-autocomplete__item-sub-row" },
        });
        if (deck.archetype) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
                ...{ class: "deck-autocomplete__item-archetype" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.highlightMatch(deck.archetype, __VLS_ctx.searchQuery)) }, null, null);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "deck-autocomplete__item-right" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deck-autocomplete__badge" },
            ...{ class: (`deck-autocomplete__badge--${__VLS_ctx.getCategoryBadge(deck).classModifier}`) },
        });
        (__VLS_ctx.getCategoryBadge(deck).text);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deck-autocomplete__item-count-badge" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deck-count-num" },
        });
        (deck.main.length);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deck-count-sep" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deck-count-extra" },
        });
        (deck.extra?.length || 0);
    }
    if (__VLS_ctx.filteredDecks.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "deck-autocomplete__empty" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "deck-autocomplete__empty-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "deck-autocomplete__empty-text" },
        });
        (__VLS_ctx.searchQuery);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    if (!(__VLS_ctx.filteredDecks.length === 0))
                        return;
                    __VLS_ctx.searchQuery = '';
                    __VLS_ctx.activeCategory = 'ALL';
                } },
            type: "button",
            ...{ class: "deck-autocomplete__reset-search-btn" },
        });
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__trigger-left']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__icon']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__current-info']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__current-name']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__current-arch']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__trigger-right']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__counts-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['dim']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__chevron']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel--elevated']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__search-row']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__input']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__clear-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__tab-count']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__list']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-scrollbar']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-left']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-name']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-check']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-sub-row']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-archetype']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-right']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__item-count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-count-num']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-count-sep']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-count-extra']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__empty']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__empty-text']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-autocomplete__reset-search-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isOpen: isOpen,
            searchQuery: searchQuery,
            activeCategory: activeCategory,
            highlightedIndex: highlightedIndex,
            inputRef: inputRef,
            listContainerRef: listContainerRef,
            rootRef: rootRef,
            activeDeck: activeDeck,
            counts: counts,
            filteredDecks: filteredDecks,
            toggleDropdown: toggleDropdown,
            selectDeck: selectDeck,
            onKeyDown: onKeyDown,
            getCategoryBadge: getCategoryBadge,
            highlightMatch: highlightMatch,
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
