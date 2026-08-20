import { ref } from 'vue';
const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
const imageFailed = ref(false);
function handleImageError() {
    imageFailed.value = true;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['character-card__name']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$emit('select', __VLS_ctx.character.id);
        } },
    type: "button",
    ...{ class: "character-card" },
    ...{ class: ({
            'character-card--selected': __VLS_ctx.isSelected,
            'character-card--dm': __VLS_ctx.character.series === 'DM',
            'character-card--gx': __VLS_ctx.character.series === 'GX',
        }) },
    ...{ style: ({ '--char-theme-color': __VLS_ctx.character.themeColor || '#c9a227' }) },
    'aria-pressed': (__VLS_ctx.isSelected),
    'aria-label': (`${__VLS_ctx.character.name} (${__VLS_ctx.character.series}) - ${__VLS_ctx.character.title}`),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "character-card__frame" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "character-card__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "character-card__series-badge" },
    ...{ class: (`character-card__series-badge--${__VLS_ctx.character.series.toLowerCase()}`) },
});
(__VLS_ctx.character.series === 'DM' ? 'DM • Duel Monsters' : 'GX • Academy');
if (__VLS_ctx.isSelected) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "character-card__selected-indicator" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "character-card__check-icon" },
        viewBox: "0 0 20 20",
        fill: "currentColor",
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        'fill-rule': "evenodd",
        d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
        'clip-rule': "evenodd",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "character-card__avatar-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "character-card__hologram-disc" },
});
if (!__VLS_ctx.imageFailed && __VLS_ctx.character.avatar) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleImageError) },
        src: (__VLS_ctx.character.avatar),
        alt: (__VLS_ctx.character.name),
        ...{ class: "character-card__image" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "character-card__silhouette" },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "character-card__silhouette-svg" },
        viewBox: "0 0 120 140",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "60",
        cy: "70",
        r: "48",
        stroke: "var(--char-theme-color)",
        'stroke-width': "1.5",
        'stroke-dasharray': "4 4",
        opacity: "0.4",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "60",
        cy: "70",
        r: "34",
        stroke: "var(--char-theme-color)",
        'stroke-width': "1",
        opacity: "0.25",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M60 22C44 22 36 34 36 50C36 58 38 64 42 70L38 88C38 88 46 86 52 84C55 85 57 86 60 86C63 86 65 85 68 84C74 86 82 88 82 88L78 70C82 64 84 58 84 50C84 34 76 22 60 22Z",
        fill: "url(#charGrad)",
        opacity: "0.9",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M60 14L52 28L60 24L68 28L60 14Z",
        fill: "var(--char-theme-color)",
        opacity: "0.75",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M36 38L22 48L36 54L32 44L36 38Z",
        fill: "var(--char-theme-color)",
        opacity: "0.6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M84 38L98 48L84 54L88 44L84 38Z",
        fill: "var(--char-theme-color)",
        opacity: "0.6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M34 100C24 106 14 118 10 134H110C106 118 96 106 86 100C80 108 70 114 60 114C50 114 40 108 34 100Z",
        fill: "url(#charGrad)",
        opacity: "0.85",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.defs, __VLS_intrinsicElements.defs)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.linearGradient, __VLS_intrinsicElements.linearGradient)({
        id: "charGrad",
        x1: "60",
        y1: "20",
        x2: "60",
        y2: "134",
        gradientUnits: "userSpaceOnUse",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.stop)({
        'stop-color': "#f4e4b8",
        'stop-opacity': "0.9",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.stop)({
        offset: "0.6",
        'stop-color': "var(--char-theme-color)",
        'stop-opacity': "0.7",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.stop)({
        offset: "1",
        'stop-color': "#0a0c10",
        'stop-opacity': "0.95",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "character-card__placeholder-tag" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "character-card__info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "character-card__name" },
});
(__VLS_ctx.character.name);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "character-card__title" },
});
(__VLS_ctx.character.title);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "character-card__archetype-pill" },
});
(__VLS_ctx.character.decks[0]?.archetype || 'Custom Archetype');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "character-card__foil-sweep" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['character-card']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__frame']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__header']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__series-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__selected-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__check-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__avatar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__hologram-disc']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__image']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__silhouette']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__silhouette-svg']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__placeholder-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__info']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__name']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__title']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__archetype-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__foil-sweep']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            imageFailed: imageFailed,
            handleImageError: handleImageError,
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
