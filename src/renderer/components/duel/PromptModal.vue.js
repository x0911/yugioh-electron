import { ref, computed } from 'vue';
import { getCardImageUrl, getCardBackUrl } from '../../utils/media.js';
const props = withDefaults(defineProps(), {
    selectChain: null,
    selectPosition: null,
    selectEffectYn: null,
    selectOption: null,
    announceCard: null,
    announceRace: null,
    announceAttrib: null,
    announceNumber: null,
    allCards: () => [],
});
const emit = defineEmits();
const hasActivePrompt = computed(() => {
    return (!!props.selectChain ||
        !!props.selectPosition ||
        !!props.selectEffectYn ||
        !!props.selectOption ||
        !!props.announceCard ||
        !!props.announceRace ||
        !!props.announceAttrib ||
        !!props.announceNumber);
});
const isForcedPrompt = computed(() => {
    return !!props.selectChain?.forced;
});
const activePromptType = computed(() => {
    if (props.selectChain)
        return 'chain';
    if (props.selectPosition)
        return 'position';
    if (props.selectEffectYn)
        return 'effect';
    if (props.selectOption)
        return 'option';
    if (props.announceCard || props.announceRace || props.announceAttrib || props.announceNumber)
        return 'announce';
    return 'default';
});
// Card Declaration State
const cardSearchQuery = ref('');
const selectedDeclaredCode = ref(null);
const stapleCards = [
    { code: 5318639, name: 'Mystical Space Typhoon' },
    { code: 12580477, name: 'Raigeki' },
    { code: 53129443, name: 'Dark Hole' },
    { code: 44095762, name: 'Mirror Force' },
    { code: 83764718, name: 'Monster Reborn' },
    { code: 46986414, name: 'Dark Magician' },
    { code: 89631139, name: 'Blue-Eyes White Dragon' },
    { code: 70781052, name: 'Summoned Skull' },
    { code: 79571449, name: 'Graceful Charity' },
];
const filteredDeclaredCards = computed(() => {
    const query = cardSearchQuery.value.trim().toLowerCase();
    if (!query) {
        return props.allCards.slice(0, 40);
    }
    return props.allCards.filter((c) => {
        const code = c.code || c.id;
        return (c.name.toLowerCase().includes(query) ||
            String(code).includes(query));
    });
});
function selectDeclaredCard(code) {
    selectedDeclaredCode.value = code;
}
function getDeclaredCardName() {
    if (!selectedDeclaredCode.value)
        return 'Card';
    const found = props.allCards.find((c) => (c.code || c.id) === selectedDeclaredCode.value);
    return found ? `"${found.name}"` : 'Selected Card';
}
function confirmCardDeclaration() {
    if (selectedDeclaredCode.value) {
        emit('announce-card', selectedDeclaredCode.value);
        selectedDeclaredCode.value = null;
        cardSearchQuery.value = '';
    }
}
// Attributes for ANNOUNCE_ATTRIB
const availableAttributes = [
    { key: 'dark', name: 'DARK', value: 0x20, icon: '🌑' },
    { key: 'light', name: 'LIGHT', value: 0x10, icon: '☀️' },
    { key: 'earth', name: 'EARTH', value: 0x01, icon: '⛰️' },
    { key: 'water', name: 'WATER', value: 0x02, icon: '💧' },
    { key: 'fire', name: 'FIRE', value: 0x04, icon: '🔥' },
    { key: 'wind', name: 'WIND', value: 0x08, icon: '🌪️' },
    { key: 'divine', name: 'DIVINE', value: 0x40, icon: '✨' },
];
function handleBackdropClick() {
    // Chain opportunity allows clicking outside to pass priority if not forced
    if (props.selectChain && !props.selectChain.forced) {
        emit('select-chain', null);
    }
}
function handleArtFallback(event) {
    const target = event.target;
    if (target) {
        target.style.display = 'none';
    }
}
function toRomanNumeral(num) {
    const map = {
        1: 'I',
        2: 'II',
        3: 'III',
        4: 'IV',
        5: 'V',
        6: 'VI',
        7: 'VII',
        8: 'VIII',
    };
    return map[num] || String(num);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    selectChain: null,
    selectPosition: null,
    selectEffectYn: null,
    selectOption: null,
    announceCard: null,
    announceRace: null,
    announceAttrib: null,
    announceNumber: null,
    allCards: () => [],
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['prompt-modal__ambient-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-modal__ambient-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-modal__ambient-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-activate-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-quote-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.hasActivePrompt) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.handleBackdropClick) },
        ...{ class: "prompt-modal-backdrop" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "prompt-modal" },
        ...{ class: ([
                `prompt-modal--${__VLS_ctx.activePromptType}`,
                { 'prompt-modal--forced': __VLS_ctx.isForcedPrompt }
            ]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "prompt-modal__ambient-glow" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-corner modal-corner--tl" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-corner modal-corner--tr" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-corner modal-corner--bl" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-corner modal-corner--br" },
    });
    if (__VLS_ctx.selectPosition) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header__badge prompt-header__badge--battle" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "prompt-header__title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "prompt-header__subtitle" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "highlight-text" },
        });
        (__VLS_ctx.selectPosition.cardName || 'your monster');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "position-showcase" },
        });
        if (__VLS_ctx.selectPosition.positions.includes(1)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!(__VLS_ctx.selectPosition))
                            return;
                        if (!(__VLS_ctx.selectPosition.positions.includes(1)))
                            return;
                        __VLS_ctx.$emit('select-position', 1);
                    } },
                type: "button",
                ...{ class: "stance-card stance-card--atk" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__preview" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__art stance-card__art--vertical" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onError: (__VLS_ctx.handleArtFallback) },
                src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.selectPosition.code, 'mini')),
                alt: (__VLS_ctx.selectPosition.cardName || 'Monster'),
                ...{ class: "stance-img" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-sheen" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-aura stance-aura--atk" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__type" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-name" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-desc" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-card__glow-border" },
            });
        }
        if (__VLS_ctx.selectPosition.positions.includes(2)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!(__VLS_ctx.selectPosition))
                            return;
                        if (!(__VLS_ctx.selectPosition.positions.includes(2)))
                            return;
                        __VLS_ctx.$emit('select-position', 2);
                    } },
                type: "button",
                ...{ class: "stance-card stance-card--def" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__preview" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__art stance-card__art--horizontal" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onError: (__VLS_ctx.handleArtFallback) },
                src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.selectPosition.code, 'mini')),
                alt: (__VLS_ctx.selectPosition.cardName || 'Monster'),
                ...{ class: "stance-img" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-sheen" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-aura stance-aura--def" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__type" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-name" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-desc" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-card__glow-border" },
            });
        }
        if (__VLS_ctx.selectPosition.positions.includes(4)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!(__VLS_ctx.selectPosition))
                            return;
                        if (!(__VLS_ctx.selectPosition.positions.includes(4)))
                            return;
                        __VLS_ctx.$emit('select-position', 4);
                    } },
                type: "button",
                ...{ class: "stance-card stance-card--set" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__preview" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__art stance-card__art--horizontal" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.getCardBackUrl()),
                alt: "Card Back",
                ...{ class: "stance-img" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-sheen" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-aura stance-aura--set" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "stance-card__type" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-name" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "stance-desc" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "stance-card__glow-border" },
            });
        }
    }
    else if (__VLS_ctx.selectChain) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header" },
            ...{ class: ({ 'prompt-header--forced': __VLS_ctx.selectChain.forced }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header__badge prompt-header__badge--chain" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-label" },
        });
        (__VLS_ctx.selectChain.forced ? 'MANDATORY CHAIN TRIGGER' : 'CHAIN OPPORTUNITY');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "prompt-header__title" },
        });
        (__VLS_ctx.selectChain.forced ? 'Mandatory Effect Activation' : 'Chain Window Opportunity');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "prompt-header__subtitle" },
        });
        if (__VLS_ctx.selectChain.forced) {
        }
        else {
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chain-cards-container" },
        });
        for (const [chain, idx] of __VLS_getVForSourceType((__VLS_ctx.selectChain.selects))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!(__VLS_ctx.selectChain))
                            return;
                        __VLS_ctx.$emit('select-chain', idx);
                    } },
                key: (`chain-${idx}-${chain.code}`),
                ...{ class: "chain-card-entry" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chain-card-entry__art-wrapper" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onError: (__VLS_ctx.handleArtFallback) },
                src: (__VLS_ctx.getCardImageUrl(chain.code, 'mini')),
                alt: (chain.cardName || 'Card'),
                ...{ class: "chain-card-entry__art-img" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
                ...{ class: "chain-card-entry__art-sheen" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chain-card-entry__meta" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chain-card-entry__title-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "chain-card-entry__name" },
            });
            (chain.cardName || 'Active Card');
            if (chain.description) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chain-card-entry__desc-box" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "desc-quote-icon" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "desc-content" },
                });
                (chain.description);
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                type: "button",
                ...{ class: "chain-activate-btn" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
                ...{ class: "btn-pulse" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "btn-text" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-footer" },
        });
        if (!__VLS_ctx.selectChain.forced) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!(__VLS_ctx.selectChain))
                            return;
                        if (!(!__VLS_ctx.selectChain.forced))
                            return;
                        __VLS_ctx.$emit('select-chain', null);
                    } },
                type: "button",
                ...{ class: "action-btn action-btn--pass" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "btn-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "btn-key-hint" },
            });
        }
    }
    else if (__VLS_ctx.selectEffectYn) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header__badge prompt-header__badge--effect" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "prompt-header__title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "prompt-header__subtitle" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "highlight-text" },
        });
        (__VLS_ctx.selectEffectYn.cardName || 'this card');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "effect-spotlight" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "effect-spotlight__card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleArtFallback) },
            src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.selectEffectYn.code, 'mini')),
            alt: (__VLS_ctx.selectEffectYn.cardName || 'Card'),
            ...{ class: "spotlight-img" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
            ...{ class: "spotlight-sheen" },
        });
        if (__VLS_ctx.selectEffectYn.description) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "effect-spotlight__desc" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "desc-quote-icon" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "desc-text" },
            });
            (__VLS_ctx.selectEffectYn.description);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-footer prompt-footer--center" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.hasActivePrompt))
                        return;
                    if (!!(__VLS_ctx.selectPosition))
                        return;
                    if (!!(__VLS_ctx.selectChain))
                        return;
                    if (!(__VLS_ctx.selectEffectYn))
                        return;
                    __VLS_ctx.$emit('select-effect-yn', false);
                } },
            type: "button",
            ...{ class: "action-btn action-btn--secondary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "btn-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.hasActivePrompt))
                        return;
                    if (!!(__VLS_ctx.selectPosition))
                        return;
                    if (!!(__VLS_ctx.selectChain))
                        return;
                    if (!(__VLS_ctx.selectEffectYn))
                        return;
                    __VLS_ctx.$emit('select-effect-yn', true);
                } },
            type: "button",
            ...{ class: "action-btn action-btn--confirm-emerald" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "btn-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else if (__VLS_ctx.selectOption) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header__badge prompt-header__badge--option" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "prompt-header__title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "prompt-header__subtitle" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-choices-list" },
        });
        for (const [opt, idx] of __VLS_getVForSourceType((__VLS_ctx.selectOption.options))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!!(__VLS_ctx.selectChain))
                            return;
                        if (!!(__VLS_ctx.selectEffectYn))
                            return;
                        if (!(__VLS_ctx.selectOption))
                            return;
                        __VLS_ctx.$emit('select-option', idx);
                    } },
                key: (`opt-${idx}`),
                type: "button",
                ...{ class: "option-choice-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "option-choice-item__num" },
            });
            (__VLS_ctx.toRomanNumeral(idx + 1));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "option-choice-item__text" },
            });
            (opt);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "option-choice-item__arrow" },
            });
        }
    }
    else if (__VLS_ctx.announceCard) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header__badge prompt-header__badge--announce" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "prompt-header__title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "prompt-header__subtitle" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-declare-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-search-box" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "search-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            value: (__VLS_ctx.cardSearchQuery),
            type: "text",
            ...{ class: "card-search-input" },
            placeholder: "Type card name (e.g. Dark Magician, MST, Raigeki)...",
            autofocus: true,
        });
        if (__VLS_ctx.cardSearchQuery) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!!(__VLS_ctx.selectChain))
                            return;
                        if (!!(__VLS_ctx.selectEffectYn))
                            return;
                        if (!!(__VLS_ctx.selectOption))
                            return;
                        if (!(__VLS_ctx.announceCard))
                            return;
                        if (!(__VLS_ctx.cardSearchQuery))
                            return;
                        __VLS_ctx.cardSearchQuery = '';
                    } },
                type: "button",
                ...{ class: "clear-search-btn" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "quick-staples-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "staples-label" },
        });
        for (const [staple] of __VLS_getVForSourceType((__VLS_ctx.stapleCards))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!!(__VLS_ctx.selectChain))
                            return;
                        if (!!(__VLS_ctx.selectEffectYn))
                            return;
                        if (!!(__VLS_ctx.selectOption))
                            return;
                        if (!(__VLS_ctx.announceCard))
                            return;
                        __VLS_ctx.selectDeclaredCard(staple.code);
                    } },
                key: (staple.code),
                type: "button",
                ...{ class: "staple-chip" },
                ...{ class: ({ 'staple-chip--selected': __VLS_ctx.selectedDeclaredCode === staple.code }) },
            });
            (staple.name);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "declare-results-list" },
        });
        for (const [card] of __VLS_getVForSourceType((__VLS_ctx.filteredDeclaredCards.slice(0, 50)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!!(__VLS_ctx.selectChain))
                            return;
                        if (!!(__VLS_ctx.selectEffectYn))
                            return;
                        if (!!(__VLS_ctx.selectOption))
                            return;
                        if (!(__VLS_ctx.announceCard))
                            return;
                        __VLS_ctx.selectDeclaredCard(card.code || card.id);
                    } },
                key: (`dec-${card.id}`),
                ...{ class: "declare-card-item" },
                ...{ class: ({ 'declare-card-item--selected': __VLS_ctx.selectedDeclaredCode === (card.code || card.id) }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "declare-card-item__art" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onError: (__VLS_ctx.handleArtFallback) },
                src: (__VLS_ctx.getCardImageUrl(card.code || card.id, 'mini')),
                alt: (card.name),
                ...{ class: "declare-art-img" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "declare-card-item__info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "declare-card-item__name" },
            });
            (card.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "declare-card-item__type" },
            });
            (card.isMonster ? `Monster ★${card.level} • ${card.attributeName || ''} • ${card.raceName || ''}` : card.isSpell ? 'Spell Card' : 'Trap Card');
            if (__VLS_ctx.selectedDeclaredCode === (card.code || card.id)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "declare-card-item__check" },
                });
            }
        }
        if (__VLS_ctx.filteredDeclaredCards.length === 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "declare-empty" },
            });
            (__VLS_ctx.cardSearchQuery);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-footer prompt-footer--center" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.confirmCardDeclaration) },
            type: "button",
            ...{ class: "action-btn action-btn--confirm-emerald" },
            disabled: (!__VLS_ctx.selectedDeclaredCode),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "btn-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.getDeclaredCardName());
    }
    else if (__VLS_ctx.announceAttrib) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header__badge prompt-header__badge--announce" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "prompt-header__title" },
        });
        (__VLS_ctx.announceAttrib.count);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "prompt-header__subtitle" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "attrib-grid" },
        });
        for (const [attr] of __VLS_getVForSourceType((__VLS_ctx.availableAttributes))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!!(__VLS_ctx.selectChain))
                            return;
                        if (!!(__VLS_ctx.selectEffectYn))
                            return;
                        if (!!(__VLS_ctx.selectOption))
                            return;
                        if (!!(__VLS_ctx.announceCard))
                            return;
                        if (!(__VLS_ctx.announceAttrib))
                            return;
                        __VLS_ctx.$emit('announce-attrib', [attr.value]);
                    } },
                key: (attr.value),
                type: "button",
                ...{ class: "attrib-btn" },
                ...{ class: (`attrib-btn--${attr.key}`) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "attrib-icon" },
            });
            (attr.icon);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "attrib-name" },
            });
            (attr.name);
        }
    }
    else if (__VLS_ctx.announceNumber) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prompt-header__badge prompt-header__badge--announce" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "badge-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "prompt-header__title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "prompt-header__subtitle" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "number-grid" },
        });
        for (const [num, idx] of __VLS_getVForSourceType((__VLS_ctx.announceNumber.options))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.hasActivePrompt))
                            return;
                        if (!!(__VLS_ctx.selectPosition))
                            return;
                        if (!!(__VLS_ctx.selectChain))
                            return;
                        if (!!(__VLS_ctx.selectEffectYn))
                            return;
                        if (!!(__VLS_ctx.selectOption))
                            return;
                        if (!!(__VLS_ctx.announceCard))
                            return;
                        if (!!(__VLS_ctx.announceAttrib))
                            return;
                        if (!(__VLS_ctx.announceNumber))
                            return;
                        __VLS_ctx.$emit('announce-number', Number(num));
                    } },
                key: (`num-${idx}`),
                type: "button",
                ...{ class: "number-btn" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "number-val" },
            });
            (num);
        }
    }
}
/** @type {__VLS_StyleScopedClasses['prompt-modal-backdrop']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-modal__ambient-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner--tl']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner--tr']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner--bl']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-corner--br']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge--battle']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ ;
/** @type {__VLS_StyleScopedClasses['position-showcase']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card--atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__art']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__art--vertical']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-img']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-aura']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-aura--atk']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__info']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__type']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-name']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__glow-border']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card--def']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__art']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__art--horizontal']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-img']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-aura']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-aura--def']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__info']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__type']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-name']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__glow-border']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card--set']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__art']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__art--horizontal']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-img']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-aura']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-aura--set']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__info']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__type']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-name']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['stance-card__glow-border']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge--chain']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-cards-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry__art-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry__art-img']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry__art-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry__meta']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry__title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry__name']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-card-entry__desc-box']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-quote-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chain-activate-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-pulse']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-text']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--pass']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-key-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge--effect']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-text']} */ ;
/** @type {__VLS_StyleScopedClasses['effect-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['effect-spotlight__card']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-img']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['effect-spotlight__desc']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-quote-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-text']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-footer--center']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--confirm-emerald']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge--option']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['option-choices-list']} */ ;
/** @type {__VLS_StyleScopedClasses['option-choice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-choice-item__num']} */ ;
/** @type {__VLS_StyleScopedClasses['option-choice-item__text']} */ ;
/** @type {__VLS_StyleScopedClasses['option-choice-item__arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge--announce']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['card-declare-container']} */ ;
/** @type {__VLS_StyleScopedClasses['card-search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['card-search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-search-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-staples-row']} */ ;
/** @type {__VLS_StyleScopedClasses['staples-label']} */ ;
/** @type {__VLS_StyleScopedClasses['staple-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-results-list']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-card-item']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-card-item__art']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-art-img']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-card-item__info']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-card-item__name']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-card-item__type']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-card-item__check']} */ ;
/** @type {__VLS_StyleScopedClasses['declare-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-footer--center']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-btn--confirm-emerald']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge--announce']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['attrib-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['attrib-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['attrib-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['attrib-name']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__badge--announce']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__title']} */ ;
/** @type {__VLS_StyleScopedClasses['prompt-header__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['number-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['number-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['number-val']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            getCardBackUrl: getCardBackUrl,
            hasActivePrompt: hasActivePrompt,
            isForcedPrompt: isForcedPrompt,
            activePromptType: activePromptType,
            cardSearchQuery: cardSearchQuery,
            selectedDeclaredCode: selectedDeclaredCode,
            stapleCards: stapleCards,
            filteredDeclaredCards: filteredDeclaredCards,
            selectDeclaredCard: selectDeclaredCard,
            getDeclaredCardName: getDeclaredCardName,
            confirmCardDeclaration: confirmCardDeclaration,
            availableAttributes: availableAttributes,
            handleBackdropClick: handleBackdropClick,
            handleArtFallback: handleArtFallback,
            toRomanNumeral: toRomanNumeral,
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
