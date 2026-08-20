import { computed } from 'vue';
import { useDuelStore } from '../../stores/duelStore.js';
import YugiModal from '../common/YugiModal.vue';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
const props = withDefaults(defineProps(), {
    owner: 'user',
    type: 'graveyard',
});
const emit = defineEmits();
const duelStore = useDuelStore();
const enrichedCards = computed(() => {
    return props.cards.map((card) => {
        if (!card.code || card.code <= 0)
            return card;
        const detail = duelStore.getCardDetail(card.code);
        if (!detail)
            return card;
        return {
            ...card,
            name: card.name && card.name !== 'Card' && !card.name.startsWith('[Card #')
                ? card.name
                : detail.name,
            atk: card.atk !== undefined ? card.atk : detail.isMonster ? detail.atk : undefined,
            def: card.def !== undefined ? card.def : detail.isMonster ? detail.def : undefined,
            level: card.level !== undefined ? card.level : detail.isMonster ? detail.level : undefined,
            attribute: card.attribute || detail.attributeName,
            race: card.race || detail.raceName,
            description: card.description || detail.desc,
        };
    });
});
function isMonsterCard(card) {
    if (card.atk !== undefined || card.def !== undefined || (card.level && card.level > 0))
        return true;
    const detail = duelStore.getCardDetail(card.code);
    return detail?.isMonster ?? false;
}
const stackIcon = computed(() => {
    switch (props.type) {
        case 'graveyard':
            return '🪦';
        case 'extra':
            return '⚡';
        case 'banished':
            return '🌀';
        case 'deck':
            return '🎴';
        default:
            return '📜';
    }
});
function getCardImage(card) {
    if (!card.code || card.code <= 0) {
        return getCardBackUrl();
    }
    return getCardImageUrl(card.code, 'full');
}
function onMouseEnter(card) {
    emit('hover-card', card);
}
function onMouseLeave() {
    emit('hover-card', null);
}
function onCardClick(card) {
    emit('select-card', card);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    owner: 'user',
    type: 'graveyard',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tile-art-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-def']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof YugiModal, typeof YugiModal, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(YugiModal, new YugiModal({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    width: ('860px'),
    accent: (__VLS_ctx.owner === 'user' ? 'user' : 'ai'),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.modelValue),
    width: ('860px'),
    accent: (__VLS_ctx.owner === 'user' ? 'user' : 'ai'),
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
        ...{ class: "card-list-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-left" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "header-icon" },
    });
    (__VLS_ctx.stackIcon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-titles" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "header-title" },
    });
    (__VLS_ctx.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "header-count-badge" },
    });
    (__VLS_ctx.cards.length);
    (__VLS_ctx.cards.length === 1 ? 'Card' : 'Cards');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-right" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "owner-pill" },
        ...{ class: (`owner-pill--${__VLS_ctx.owner}`) },
    });
    (__VLS_ctx.owner === 'user' ? 'PLAYER' : 'OPPONENT');
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-list-modal-body" },
});
if (__VLS_ctx.cards.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "empty-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "empty-text" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list-grid" },
    });
    for (const [card, idx] of __VLS_getVForSourceType((__VLS_ctx.enrichedCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseenter: (...[$event]) => {
                    if (!!(__VLS_ctx.cards.length === 0))
                        return;
                    __VLS_ctx.onMouseEnter(card);
                } },
            ...{ onMouseleave: (__VLS_ctx.onMouseLeave) },
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.cards.length === 0))
                        return;
                    __VLS_ctx.onCardClick(card);
                } },
            key: (card.id || `${card.code}-${idx}`),
            ...{ class: "card-list-tile" },
            ...{ class: ([
                    `card-list-tile--${__VLS_ctx.owner}`,
                    {
                        'card-list-tile--facedown': card.position === 'facedown_defense' || card.position === 'facedown_spell',
                    },
                ]) },
        });
        if (__VLS_ctx.type === 'graveyard') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-order-badge" },
                ...{ class: ({ 'tile-order-badge--top': idx === 0 }) },
            });
            (idx === 0 ? 'TOP' : `#${idx + 1}`);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-order-badge" },
            });
            (idx + 1);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-art-wrapper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImage(card)),
            alt: (card.name),
            ...{ class: "tile-art-img" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-art-sheen" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tile-name" },
            title: (card.name),
        });
        (card.name);
        if (__VLS_ctx.isMonsterCard(card)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-stats" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-meta-header" },
            });
            if (card.level) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "tile-level" },
                });
                (card.level);
            }
            if (card.attribute) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "tile-attr" },
                    ...{ class: (`tile-attr--${card.attribute.toLowerCase()}`) },
                });
                (card.attribute);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "tile-combat-stats" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stat-atk" },
            });
            (__VLS_ctx.formatCombatStat(card.atk));
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
                ...{ class: "tile-card-type-tag" },
                ...{ class: (card.attribute === 'TRAP' ? 'tag--trap' : 'tag--spell') },
            });
            (card.attribute === 'TRAP' ? 'TRAP' : 'SPELL');
        }
    }
}
{
    const { footer: __VLS_thisSlot } = __VLS_2.slots;
    const [{ close }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-list-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (close) },
        type: "button",
        ...{ class: "btn-close-viewer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['card-list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['header-titles']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-count-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['owner-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list-modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list-tile']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-order-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-order-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-art-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-art-img']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-art-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-info']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-name']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-meta-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-level']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-attr']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-combat-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-def']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-spell-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['tile-card-type-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['card-list-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close-viewer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            YugiModal: YugiModal,
            handleImageError: handleImageError,
            formatCombatStat: formatCombatStat,
            enrichedCards: enrichedCards,
            isMonsterCard: isMonsterCard,
            stackIcon: stackIcon,
            getCardImage: getCardImage,
            onMouseEnter: onMouseEnter,
            onMouseLeave: onMouseLeave,
            onCardClick: onCardClick,
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
