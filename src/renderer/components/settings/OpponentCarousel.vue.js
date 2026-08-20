import { ref, computed, watch, nextTick } from 'vue';
import CharacterCard from './CharacterCard.vue';
const props = withDefaults(defineProps(), {
    seriesFilter: 'ALL',
});
const emit = defineEmits();
const activeSeries = ref(props.seriesFilter);
const trackRef = ref(null);
const cardElements = ref([]);
function setCardRef(el, index) {
    if (el) {
        cardElements.value[index] = el;
    }
}
const allCount = computed(() => props.characters.length);
const dmCount = computed(() => props.characters.filter((c) => c.series === 'DM').length);
const gxCount = computed(() => props.characters.filter((c) => c.series === 'GX').length);
const filteredCharacters = computed(() => {
    if (activeSeries.value === 'ALL')
        return props.characters;
    return props.characters.filter((c) => c.series === activeSeries.value);
});
const selectedIndex = computed(() => {
    const idx = filteredCharacters.value.findIndex((c) => c.id === props.selectedId);
    return idx >= 0 ? idx : 0;
});
function setFilter(filter) {
    activeSeries.value = filter;
    emit('update:seriesFilter', filter);
    nextTick(() => {
        scrollToSelected();
    });
}
function handleSelect(id) {
    emit('select', id);
}
function scrollToSelected() {
    const currentIdx = selectedIndex.value;
    const targetEl = cardElements.value[currentIdx];
    if (targetEl && trackRef.value) {
        targetEl.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        });
    }
}
function prev() {
    if (filteredCharacters.value.length === 0)
        return;
    const newIdx = (selectedIndex.value - 1 + filteredCharacters.value.length) % filteredCharacters.value.length;
    const target = filteredCharacters.value[newIdx];
    if (target) {
        emit('select', target.id);
    }
}
function next() {
    if (filteredCharacters.value.length === 0)
        return;
    const newIdx = (selectedIndex.value + 1) % filteredCharacters.value.length;
    const target = filteredCharacters.value[newIdx];
    if (target) {
        emit('select', target.id);
    }
}
function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
    }
    else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
    }
    else if (e.key === 'Home') {
        e.preventDefault();
        if (filteredCharacters.value.length > 0) {
            emit('select', filteredCharacters.value[0].id);
        }
    }
    else if (e.key === 'End') {
        e.preventDefault();
        if (filteredCharacters.value.length > 0) {
            emit('select', filteredCharacters.value[filteredCharacters.value.length - 1].id);
        }
    }
}
function handleWheel(e) {
    if (trackRef.value && Math.abs(e.deltaY) > 0) {
        trackRef.value.scrollLeft += e.deltaY;
    }
}
watch(() => props.selectedId, () => {
    nextTick(() => {
        scrollToSelected();
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    seriesFilter: 'ALL',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-pill--active']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onKeydown: (__VLS_ctx.handleKeyDown) },
    ...{ class: "opponent-carousel" },
    tabindex: "0",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "opponent-carousel__filter-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "opponent-carousel__filter-pills" },
    role: "tablist",
    'aria-label': "Character Series Filter",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.setFilter('ALL');
        } },
    type: "button",
    ...{ class: "opponent-carousel__filter-pill" },
    ...{ class: ({ 'opponent-carousel__filter-pill--active': __VLS_ctx.activeSeries === 'ALL' }) },
    role: "tab",
    'aria-selected': (__VLS_ctx.activeSeries === 'ALL'),
});
(__VLS_ctx.allCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.setFilter('DM');
        } },
    type: "button",
    ...{ class: "opponent-carousel__filter-pill opponent-carousel__filter-pill--dm" },
    ...{ class: ({ 'opponent-carousel__filter-pill--active': __VLS_ctx.activeSeries === 'DM' }) },
    role: "tab",
    'aria-selected': (__VLS_ctx.activeSeries === 'DM'),
});
(__VLS_ctx.dmCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.setFilter('GX');
        } },
    type: "button",
    ...{ class: "opponent-carousel__filter-pill opponent-carousel__filter-pill--gx" },
    ...{ class: ({ 'opponent-carousel__filter-pill--active': __VLS_ctx.activeSeries === 'GX' }) },
    role: "tab",
    'aria-selected': (__VLS_ctx.activeSeries === 'GX'),
});
(__VLS_ctx.gxCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "opponent-carousel__nav-controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "opponent-carousel__count-tag" },
});
(__VLS_ctx.selectedIndex + 1);
(__VLS_ctx.filteredCharacters.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.prev) },
    type: "button",
    ...{ class: "opponent-carousel__arrow-btn" },
    'aria-label': "Previous character",
    disabled: (__VLS_ctx.filteredCharacters.length <= 1),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2.5",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.polyline, __VLS_intrinsicElements.polyline)({
    points: "15 18 9 12 15 6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.next) },
    type: "button",
    ...{ class: "opponent-carousel__arrow-btn" },
    'aria-label': "Next character",
    disabled: (__VLS_ctx.filteredCharacters.length <= 1),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2.5",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.polyline, __VLS_intrinsicElements.polyline)({
    points: "9 18 15 12 9 6",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onWheel: (__VLS_ctx.handleWheel) },
    ref: "trackRef",
    ...{ class: "opponent-carousel__track" },
    role: "region",
    'aria-label': "Character list",
});
/** @type {typeof __VLS_ctx.trackRef} */ ;
for (const [char, index] of __VLS_getVForSourceType((__VLS_ctx.filteredCharacters))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (char.id),
        ref: ((el) => __VLS_ctx.setCardRef(el, index)),
        ...{ class: "opponent-carousel__item" },
    });
    /** @type {[typeof CharacterCard, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(CharacterCard, new CharacterCard({
        ...{ 'onSelect': {} },
        character: (char),
        isSelected: (char.id === __VLS_ctx.selectedId),
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onSelect': {} },
        character: (char),
        isSelected: (char.id === __VLS_ctx.selectedId),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        onSelect: (...[$event]) => {
            __VLS_ctx.handleSelect(char.id);
        }
    };
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['opponent-carousel']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-row']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-pills']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-pill--dm']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__filter-pill--gx']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__nav-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__count-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__arrow-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__arrow-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__track']} */ ;
/** @type {__VLS_StyleScopedClasses['opponent-carousel__item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CharacterCard: CharacterCard,
            activeSeries: activeSeries,
            trackRef: trackRef,
            setCardRef: setCardRef,
            allCount: allCount,
            dmCount: dmCount,
            gxCount: gxCount,
            filteredCharacters: filteredCharacters,
            selectedIndex: selectedIndex,
            setFilter: setFilter,
            handleSelect: handleSelect,
            prev: prev,
            next: next,
            handleKeyDown: handleKeyDown,
            handleWheel: handleWheel,
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
