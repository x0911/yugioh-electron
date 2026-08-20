import { computed } from 'vue';
import { useDuelStore } from '../../stores/duelStore.js';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
import IconIndicator from '../common/IconIndicator.vue';
const props = withDefaults(defineProps(), {
    card: null,
    isPinned: false,
    position: 'left',
});
const __VLS_emit = defineEmits();
const duelStore = useDuelStore();
const effectiveCard = computed(() => {
    if (!props.card)
        return null;
    if (props.card.code <= 0)
        return props.card;
    const detail = duelStore.getCardDetail(props.card.code);
    if (!detail)
        return props.card;
    return {
        ...props.card,
        name: props.card.name && props.card.name !== 'Card' && !props.card.name.startsWith('[Card #')
            ? props.card.name
            : detail.name,
        atk: props.card.atk !== undefined ? props.card.atk : detail.isMonster ? detail.atk : undefined,
        def: props.card.def !== undefined ? props.card.def : detail.isMonster ? detail.def : undefined,
        level: props.card.level !== undefined
            ? props.card.level
            : detail.isMonster
                ? detail.level
                : undefined,
        attribute: props.card.attribute || detail.attributeName,
        race: props.card.race || detail.raceName,
        description: props.card.description || detail.desc,
    };
});
const activeStatuses = computed(() => {
    if (!effectiveCard.value || effectiveCard.value.code <= 0)
        return [];
    if (effectiveCard.value.statuses && effectiveCard.value.statuses.length > 0) {
        return effectiveCard.value.statuses;
    }
    const statuses = [];
    const loc = effectiveCard.value.location;
    if (loc === 'monster' || loc === 'extra-monster') {
        const isDefense = effectiveCard.value.position === 'faceup_defense' ||
            effectiveCard.value.position === 'facedown_defense';
        const isTurn1 = duelStore.turnNumber <= 1;
        if (isDefense || isTurn1) {
            statuses.push('no-attack');
        }
    }
    const detail = duelStore.getCardDetail(effectiveCard.value.code);
    if (detail &&
        detail.desc &&
        (detail.desc.includes('Cannot be Special Summoned') ||
            detail.desc.includes('This card cannot be Special Summoned') ||
            detail.isSpirit)) {
        statuses.push('no-special-summon');
    }
    return statuses;
});
const typeBracketText = computed(() => {
    if (!effectiveCard.value)
        return '';
    const detail = duelStore.getCardDetail(effectiveCard.value.code);
    if (detail?.typeLabels && detail.typeLabels.length > 0) {
        return detail.typeLabels.join(' / ');
    }
    const race = effectiveCard.value.race ||
        (effectiveCard.value.attribute === 'SPELL'
            ? 'Spell'
            : effectiveCard.value.attribute === 'TRAP'
                ? 'Trap'
                : 'Monster');
    const kind = effectiveCard.value.level && effectiveCard.value.level > 0
        ? 'Monster'
        : effectiveCard.value.attribute === 'SPELL'
            ? 'Spell Card'
            : effectiveCard.value.attribute === 'TRAP'
                ? 'Trap Card'
                : 'Monster';
    return `${race} / ${kind}`;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    card: null,
    isPinned: false,
    position: 'left',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "preview-fade",
}));
const __VLS_2 = __VLS_1({
    name: "preview-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.effectiveCard) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-preview-popup" },
        ...{ class: ([`card-preview-popup--${__VLS_ctx.position}`]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-panel glass-panel glass-panel--accent-gold" },
    });
    if (__VLS_ctx.isPinned) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.effectiveCard))
                        return;
                    if (!(__VLS_ctx.isPinned))
                        return;
                    __VLS_ctx.$emit('close');
                } },
            ...{ class: "preview-close-btn" },
            title: "Close Preview",
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-art-box" },
    });
    if (__VLS_ctx.effectiveCard.code > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.effectiveCard.code, 'full')),
            alt: (__VLS_ctx.effectiveCard.name),
            ...{ class: "full-card-image" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardBackUrl()),
            alt: "Face-Down Card",
            ...{ class: "full-card-image full-card-image--back" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "foil-reflection" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-info-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-title-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "card-name" },
        title: (__VLS_ctx.effectiveCard.name),
    });
    (__VLS_ctx.effectiveCard.name);
    if (__VLS_ctx.effectiveCard.code > 0 && __VLS_ctx.effectiveCard.attribute) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "attribute-badge" },
            ...{ class: (`attribute-badge--${__VLS_ctx.effectiveCard.attribute.toLowerCase()}`) },
        });
        (__VLS_ctx.effectiveCard.attribute);
    }
    else if (__VLS_ctx.effectiveCard.code === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "attribute-badge attribute-badge--secret" },
        });
    }
    if (__VLS_ctx.effectiveCard.code > 0 && __VLS_ctx.effectiveCard.level && __VLS_ctx.effectiveCard.level > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-level-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "level-stars" },
        });
        for (const [i] of __VLS_getVForSourceType((__VLS_ctx.effectiveCard.level))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (i),
                ...{ class: "star" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "level-pill" },
        });
        (__VLS_ctx.effectiveCard.level);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-type-row" },
    });
    if (__VLS_ctx.effectiveCard.code > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "type-bracket" },
        });
        (__VLS_ctx.typeBracketText);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "type-bracket type-bracket--secret" },
        });
    }
    if (__VLS_ctx.effectiveCard.code > 0 &&
        (__VLS_ctx.effectiveCard.atk !== undefined || __VLS_ctx.effectiveCard.def !== undefined)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "combat-stats-box" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stat-col" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-lbl" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-val stat-val--atk" },
        });
        (__VLS_ctx.formatCombatStat(__VLS_ctx.effectiveCard.atk));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stat-divider" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "stat-col" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-lbl" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "stat-val stat-val--def" },
        });
        (__VLS_ctx.formatCombatStat(__VLS_ctx.effectiveCard.def));
    }
    if (__VLS_ctx.activeStatuses.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "status-icon-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "status-row-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "status-badges-list" },
        });
        for (const [st] of __VLS_getVForSourceType((__VLS_ctx.activeStatuses))) {
            /** @type {[typeof IconIndicator, ]} */ ;
            // @ts-ignore
            const __VLS_4 = __VLS_asFunctionalComponent(IconIndicator, new IconIndicator({
                key: (st),
                type: "status",
                status: (st),
                size: "sm",
                showTooltip: (true),
            }));
            const __VLS_5 = __VLS_4({
                key: (st),
                type: "status",
                status: (st),
                size: "sm",
                showTooltip: (true),
            }, ...__VLS_functionalComponentArgsRest(__VLS_4));
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-lore-box" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "lore-text" },
    });
    (__VLS_ctx.effectiveCard.description ||
        (__VLS_ctx.effectiveCard.code === 0
            ? 'This card is currently face-down on the field. Its identity, stats, and effects remain hidden until activated or flipped face-up.'
            : 'No description available for this card.'));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-footer-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "passcode-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "passcode-lbl" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "passcode-val" },
    });
    (__VLS_ctx.effectiveCard.code > 0 ? __VLS_ctx.effectiveCard.code : '????????');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "location-tag" },
    });
    ((__VLS_ctx.effectiveCard.location || 'DECK').toUpperCase());
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['card-preview-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel--accent-gold']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-close-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['card-art-box']} */ ;
/** @type {__VLS_StyleScopedClasses['full-card-image']} */ ;
/** @type {__VLS_StyleScopedClasses['full-card-image']} */ ;
/** @type {__VLS_StyleScopedClasses['full-card-image--back']} */ ;
/** @type {__VLS_StyleScopedClasses['foil-reflection']} */ ;
/** @type {__VLS_StyleScopedClasses['card-info-block']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-name']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['attribute-badge--secret']} */ ;
/** @type {__VLS_StyleScopedClasses['card-level-row']} */ ;
/** @type {__VLS_StyleScopedClasses['level-stars']} */ ;
/** @type {__VLS_StyleScopedClasses['star']} */ ;
/** @type {__VLS_StyleScopedClasses['level-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['card-type-row']} */ ;
/** @type {__VLS_StyleScopedClasses['type-bracket']} */ ;
/** @type {__VLS_StyleScopedClasses['type-bracket']} */ ;
/** @type {__VLS_StyleScopedClasses['type-bracket--secret']} */ ;
/** @type {__VLS_StyleScopedClasses['combat-stats-box']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-col']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-lbl']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-val']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-val--atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-col']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-lbl']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-val']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-val--def']} */ ;
/** @type {__VLS_StyleScopedClasses['status-icon-row']} */ ;
/** @type {__VLS_StyleScopedClasses['status-row-label']} */ ;
/** @type {__VLS_StyleScopedClasses['status-badges-list']} */ ;
/** @type {__VLS_StyleScopedClasses['card-lore-box']} */ ;
/** @type {__VLS_StyleScopedClasses['lore-text']} */ ;
/** @type {__VLS_StyleScopedClasses['card-footer-row']} */ ;
/** @type {__VLS_StyleScopedClasses['passcode-group']} */ ;
/** @type {__VLS_StyleScopedClasses['passcode-lbl']} */ ;
/** @type {__VLS_StyleScopedClasses['passcode-val']} */ ;
/** @type {__VLS_StyleScopedClasses['location-tag']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            getCardBackUrl: getCardBackUrl,
            handleImageError: handleImageError,
            formatCombatStat: formatCombatStat,
            IconIndicator: IconIndicator,
            effectiveCard: effectiveCard,
            activeStatuses: activeStatuses,
            typeBracketText: typeBracketText,
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
