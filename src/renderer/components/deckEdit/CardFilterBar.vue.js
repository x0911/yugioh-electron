import { ref, computed } from 'vue';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import { RACE_NAME_MAP } from '../../../shared/types/card.js';
const store = useDeckEditStore();
const searchQuery = ref(store.filters.query);
const showAdvanced = ref(false);
const raceOptions = RACE_NAME_MAP;
const kindTabs = computed(() => {
    return [
        { label: 'All Cards', value: 'ALL' },
        { label: 'Monsters', value: 'MONSTER' },
        { label: 'Spells', value: 'SPELL' },
        { label: 'Traps', value: 'TRAP' },
        { label: 'Extra (Fusion)', value: 'EXTRA' },
    ];
});
const activeFilterCount = computed(() => {
    let count = 0;
    if (store.filters.subType !== 'ALL')
        count++;
    if (store.filters.attribute > 0)
        count++;
    if (store.filters.race > 0)
        count++;
    if (store.filters.level > 0)
        count++;
    if (store.filters.minAtk !== null)
        count++;
    if (store.filters.maxAtk !== null)
        count++;
    if (store.filters.minDef !== null)
        count++;
    if (store.filters.maxDef !== null)
        count++;
    return count;
});
function onSearchInput() {
    store.setFilter('query', searchQuery.value);
}
function clearSearch() {
    searchQuery.value = '';
    store.setFilter('query', '');
}
function onSubTypeChange(e) {
    const val = e.target.value;
    store.setFilter('subType', val);
}
function onAttributeChange(e) {
    const val = Number(e.target.value);
    store.setFilter('attribute', val);
}
function onRaceChange(e) {
    const val = Number(e.target.value);
    store.setFilter('race', val);
}
function onLevelChange(e) {
    const val = Number(e.target.value);
    store.setFilter('level', val);
}
function onMinAtkInput(e) {
    const val = e.target.value;
    store.setFilter('minAtk', val === '' ? null : Number(val));
}
function onMaxAtkInput(e) {
    const val = e.target.value;
    store.setFilter('maxAtk', val === '' ? null : Number(val));
}
function onMinDefInput(e) {
    const val = e.target.value;
    store.setFilter('minDef', val === '' ? null : Number(val));
}
function onMaxDefInput(e) {
    const val = e.target.value;
    store.setFilter('maxDef', val === '' ? null : Number(val));
}
function onSortByChange(e) {
    const val = e.target.value;
    store.setFilter('sortBy', val);
}
function toggleSortOrder() {
    store.setFilter('sortOrder', store.filters.sortOrder === 'asc' ? 'desc' : 'asc');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['era-btn--active']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-filter-bar glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-top-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-box" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "search-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onSearchInput) },
    value: (__VLS_ctx.searchQuery),
    type: "text",
    ...{ class: "search-input" },
    placeholder: "Search by card name or effect text...",
});
if (__VLS_ctx.searchQuery) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.clearSearch) },
        type: "button",
        ...{ class: "clear-search-btn" },
        title: "Clear search",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "era-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.store.setFilter('era', 'ALL');
        } },
    type: "button",
    ...{ class: "era-btn" },
    ...{ class: ({ 'era-btn--active': __VLS_ctx.store.filters.era === 'ALL' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.store.setFilter('era', 'DM');
        } },
    type: "button",
    ...{ class: "era-btn era-btn--dm" },
    ...{ class: ({ 'era-btn--active': __VLS_ctx.store.filters.era === 'DM' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.store.setFilter('era', 'GX');
        } },
    type: "button",
    ...{ class: "era-btn era-btn--gx" },
    ...{ class: ({ 'era-btn--active': __VLS_ctx.store.filters.era === 'GX' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.showAdvanced = !__VLS_ctx.showAdvanced;
        } },
    type: "button",
    ...{ class: "advanced-toggle-btn" },
    ...{ class: ({ 'advanced-toggle-btn--active': __VLS_ctx.showAdvanced }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "toggle-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "toggle-text" },
});
(__VLS_ctx.showAdvanced ? 'Hide Filters' : 'More Filters');
if (__VLS_ctx.activeFilterCount > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "active-badge" },
    });
    (__VLS_ctx.activeFilterCount);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-kinds-row" },
});
for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.kindTabs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.store.setFilter('kind', tab.value);
            } },
        key: (tab.value),
        type: "button",
        ...{ class: "kind-tab" },
        ...{ class: ({ 'kind-tab--active': __VLS_ctx.store.filters.kind === tab.value }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "kind-label" },
    });
    (tab.label);
    if (tab.count !== undefined) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "kind-count" },
        });
        (tab.count);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "results-count-pill" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "count-highlight" },
});
(__VLS_ctx.store.filteredCards.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "count-total" },
});
(__VLS_ctx.store.cardPool.length);
const __VLS_0 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "expand",
}));
const __VLS_2 = __VLS_1({
    name: "expand",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.showAdvanced) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advanced-filters-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advanced-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (__VLS_ctx.onSubTypeChange) },
        value: (__VLS_ctx.store.filters.subType),
        ...{ class: "field-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "ALL",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "NORMAL",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "EFFECT",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "FUSION",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "RITUAL",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "QUICKPLAY",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "CONTINUOUS",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "EQUIP",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "FIELD",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "COUNTER",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "FLIP",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "TOON",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "SPIRIT",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "UNION",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "GEMINI",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (__VLS_ctx.onAttributeChange) },
        value: (__VLS_ctx.store.filters.attribute),
        ...{ class: "field-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0x20),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0x10),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0x1),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0x2),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0x4),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0x8),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0x40),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (__VLS_ctx.onRaceChange) },
        value: (__VLS_ctx.store.filters.race),
        ...{ class: "field-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0),
    });
    for (const [name, bit] of __VLS_getVForSourceType((__VLS_ctx.raceOptions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (bit),
            value: (Number(bit)),
        });
        (name);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (__VLS_ctx.onLevelChange) },
        value: (__VLS_ctx.store.filters.level),
        ...{ class: "field-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: (0),
    });
    for (const [lvl] of __VLS_getVForSourceType((12))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (lvl),
            value: (lvl),
        });
        (lvl);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field filter-field--range" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "range-inputs" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.onMinAtkInput) },
        type: "number",
        placeholder: "Min",
        value: (__VLS_ctx.store.filters.minAtk ?? ''),
        ...{ class: "range-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "range-separator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.onMaxAtkInput) },
        type: "number",
        placeholder: "Max",
        value: (__VLS_ctx.store.filters.maxAtk ?? ''),
        ...{ class: "range-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field filter-field--range" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "range-inputs" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.onMinDefInput) },
        type: "number",
        placeholder: "Min",
        value: (__VLS_ctx.store.filters.minDef ?? ''),
        ...{ class: "range-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "range-separator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.onMaxDefInput) },
        type: "number",
        placeholder: "Max",
        value: (__VLS_ctx.store.filters.maxDef ?? ''),
        ...{ class: "range-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sort-controls" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (__VLS_ctx.onSortByChange) },
        value: (__VLS_ctx.store.filters.sortBy),
        ...{ class: "field-select sort-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "name",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "atk",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "def",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "level",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "type",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "id",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleSortOrder) },
        type: "button",
        ...{ class: "sort-dir-btn" },
        title: (__VLS_ctx.store.filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'),
    });
    (__VLS_ctx.store.filters.sortOrder === 'asc' ? '▲ ASC' : '▼ DESC');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-field filter-field--actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "field-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.store.resetFilters) },
        type: "button",
        ...{ class: "reset-filters-btn" },
        title: "Reset all filters to defaults",
    });
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['card-filter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-top-row']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-search-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['era-group']} */ ;
/** @type {__VLS_StyleScopedClasses['era-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['era-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['era-btn--dm']} */ ;
/** @type {__VLS_StyleScopedClasses['era-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['era-btn--gx']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-toggle-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
/** @type {__VLS_StyleScopedClasses['active-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-kinds-row']} */ ;
/** @type {__VLS_StyleScopedClasses['kind-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['kind-label']} */ ;
/** @type {__VLS_StyleScopedClasses['kind-count']} */ ;
/** @type {__VLS_StyleScopedClasses['results-count-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['count-highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['count-total']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-filters-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['advanced-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['field-select']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['field-select']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['field-select']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['field-select']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field--range']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['range-inputs']} */ ;
/** @type {__VLS_StyleScopedClasses['range-input']} */ ;
/** @type {__VLS_StyleScopedClasses['range-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['range-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field--range']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['range-inputs']} */ ;
/** @type {__VLS_StyleScopedClasses['range-input']} */ ;
/** @type {__VLS_StyleScopedClasses['range-separator']} */ ;
/** @type {__VLS_StyleScopedClasses['range-input']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['field-select']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-select']} */ ;
/** @type {__VLS_StyleScopedClasses['sort-dir-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-field--actions']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-filters-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            store: store,
            searchQuery: searchQuery,
            showAdvanced: showAdvanced,
            raceOptions: raceOptions,
            kindTabs: kindTabs,
            activeFilterCount: activeFilterCount,
            onSearchInput: onSearchInput,
            clearSearch: clearSearch,
            onSubTypeChange: onSubTypeChange,
            onAttributeChange: onAttributeChange,
            onRaceChange: onRaceChange,
            onLevelChange: onLevelChange,
            onMinAtkInput: onMinAtkInput,
            onMaxAtkInput: onMaxAtkInput,
            onMinDefInput: onMinDefInput,
            onMaxDefInput: onMaxDefInput,
            onSortByChange: onSortByChange,
            toggleSortOrder: toggleSortOrder,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
