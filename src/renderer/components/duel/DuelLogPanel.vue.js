import { ref, computed, nextTick, watch } from 'vue';
const props = withDefaults(defineProps(), {
    isOpen: false,
    logs: () => [],
});
const __VLS_emit = defineEmits();
const activeFilter = ref('all');
const logContainer = ref(null);
const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'summons', label: 'Summons' },
    { id: 'spells', label: 'Spells/Traps' },
    { id: 'combat', label: 'Combat' },
    { id: 'prompts', label: 'Prompts' },
];
const filteredLogs = computed(() => {
    if (activeFilter.value === 'all')
        return props.logs;
    return props.logs.filter((item) => {
        const t = item.type.toUpperCase();
        if (activeFilter.value === 'summons') {
            return t.includes('SUMMON') || t.includes('SET') || t.includes('TRIBUTE');
        }
        if (activeFilter.value === 'spells') {
            return t.includes('SPELL') || t.includes('TRAP') || t.includes('CHAIN') || t.includes('ACTIVATE');
        }
        if (activeFilter.value === 'combat') {
            return t.includes('ATTACK') || t.includes('DAMAGE') || t.includes('BATTLE') || t.includes('LP');
        }
        if (activeFilter.value === 'prompts') {
            return t.includes('SELECT') || t.includes('PROMPT') || t.includes('CONFIRM');
        }
        return true;
    });
});
watch(() => props.logs.length, () => {
    nextTick(() => {
        if (logContainer.value) {
            logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    isOpen: false,
    logs: () => [],
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['log-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['log-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['log-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['log-badge']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "drawer-slide",
}));
const __VLS_2 = __VLS_1({
    name: "drawer-slide",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.isOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "duel-log-drawer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-panel glass-panel glass-panel--accent-gold" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "log-count" },
    });
    (__VLS_ctx.filteredLogs.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.$emit('clear');
            } },
        ...{ class: "action-btn" },
        title: "Clear Event Log",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOpen))
                    return;
                __VLS_ctx.$emit('close');
            } },
        ...{ class: "action-btn action-btn--close" },
        title: "Close Drawer",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "filter-tabs" },
    });
    for (const [tab] of __VLS_getVForSourceType((__VLS_ctx.filterTabs))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    __VLS_ctx.activeFilter = tab.id;
                } },
            key: (tab.id),
            ...{ class: "tab-btn" },
            ...{ class: ({ 'tab-btn--active': __VLS_ctx.activeFilter === tab.id }) },
        });
        (tab.label);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "logContainer",
        ...{ class: "log-scroll-area" },
    });
    /** @type {typeof __VLS_ctx.logContainer} */ ;
    if (__VLS_ctx.filteredLogs.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-log" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    for (const [item, idx] of __VLS_getVForSourceType((__VLS_ctx.filteredLogs))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (idx),
            ...{ class: "log-entry" },
            ...{ class: ([`log-entry--${item.type.toLowerCase()}`]) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "log-time" },
        });
        (item.time);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "log-badge" },
        });
        (item.type);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "log-msg" },
        });
        (item.description);
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['duel-log-drawer']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel--accent-gold']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title-group']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['log-count']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--close']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['log-scroll-area']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-log']} */ ;
/** @type {__VLS_StyleScopedClasses['log-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['log-time']} */ ;
/** @type {__VLS_StyleScopedClasses['log-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['log-msg']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeFilter: activeFilter,
            logContainer: logContainer,
            filterTabs: filterTabs,
            filteredLogs: filteredLogs,
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
