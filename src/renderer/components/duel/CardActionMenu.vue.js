import { computed } from 'vue';
import { formatCombatStat } from '../../utils/format.js';
const props = defineProps();
const __VLS_emit = defineEmits();
const menuStyle = computed(() => {
    if (!props.anchorPos || (props.anchorPos.x === 0 && props.anchorPos.y === 0)) {
        // Default position: centered above player hand
        return {
            bottom: '160px',
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }
    // Ensure menu stays cleanly within screen viewport
    const x = Math.min(Math.max(props.anchorPos.x, 150), window.innerWidth - 170);
    const y = Math.min(Math.max(props.anchorPos.y - 140, 100), window.innerHeight - 200);
    return {
        top: `${y}px`,
        left: `${x}px`,
        transform: 'translate(-50%, -50%)',
    };
});
/**
 * Returns a short, friendly description for each action type.
 * Written to be understood by young players (~10 years old).
 */
function getActionDescription(type) {
    switch (type) {
        case 'summon': return 'Put this monster on the field in Attack position!';
        case 'monster_set': return 'Place face-down in Defense position (hidden from opponent).';
        case 'spell_set': return 'Set face-down in your Spell/Trap Zone to use later.';
        case 'set': return 'Place this card face-down on the field.';
        case 'sp_summon': return 'Bring this monster out using its special summoning rule!';
        case 'activate': return 'Activate this card\'s effect right now!';
        case 'attack': return 'Attack with this monster!';
        case 'pos_change': return 'Switch between Attack and Defense position.';
        default: return 'Choose this action to continue.';
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['action-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['action-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('close');
        } },
    ...{ class: "card-action-menu-backdrop" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: () => { } },
    ...{ class: "card-action-menu glass-panel" },
    ...{ style: (__VLS_ctx.menuStyle) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-header__info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "card-name" },
});
(__VLS_ctx.card.name);
if (__VLS_ctx.card.atk !== undefined) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-stats" },
    });
    (__VLS_ctx.formatCombatStat(__VLS_ctx.card.atk));
    (__VLS_ctx.formatCombatStat(__VLS_ctx.card.def));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('close');
        } },
    'aria-label': "Close action menu",
    ...{ class: "close-btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "menu-hint" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-actions" },
});
for (const [act] of __VLS_getVForSourceType((__VLS_ctx.actions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.$emit('select', act);
            } },
        key: (`${act.type}-${act.index}`),
        ...{ class: "action-item" },
        ...{ class: (`action-item--${act.type}`) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "action-icon" },
    });
    (act.icon || '⚡');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "action-label" },
    });
    (act.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "action-desc" },
    });
    (__VLS_ctx.getActionDescription(act.type));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "action-arrow" },
    });
}
/** @type {__VLS_StyleScopedClasses['card-action-menu-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['card-action-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-header']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-header__info']} */ ;
/** @type {__VLS_StyleScopedClasses['card-name']} */ ;
/** @type {__VLS_StyleScopedClasses['card-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-text']} */ ;
/** @type {__VLS_StyleScopedClasses['action-label']} */ ;
/** @type {__VLS_StyleScopedClasses['action-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['action-arrow']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatCombatStat: formatCombatStat,
            menuStyle: menuStyle,
            getActionDescription: getActionDescription,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
