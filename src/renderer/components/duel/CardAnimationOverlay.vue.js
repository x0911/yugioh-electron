import { activeAnimations } from '../../utils/animationService.js';
import { getCardBackUrl, getCardImageUrl, getCardPlaceholderUrl } from '../../utils/media.js';
function getCardImage(code) {
    if (!code || code <= 0)
        return getCardBackUrl();
    return getCardImageUrl(code, 'mini');
}
function handleImageError(event) {
    const target = event.target;
    if (target && !target.src.includes('placeholder')) {
        target.src = getCardPlaceholderUrl();
    }
}
function getWrapperStyle(anim) {
    const dx = anim.toRect.left - anim.fromRect.left;
    const dy = anim.toRect.top - anim.fromRect.top;
    const dw = anim.toRect.width / Math.max(1, anim.fromRect.width);
    const dh = anim.toRect.height / Math.max(1, anim.fromRect.height);
    return {
        '--start-x': `${anim.fromRect.left}px`,
        '--start-y': `${anim.fromRect.top}px`,
        '--start-w': `${anim.fromRect.width}px`,
        '--start-h': `${anim.fromRect.height}px`,
        '--delta-x': `${dx}px`,
        '--delta-y': `${dy}px`,
        '--scale-w': `${dw}`,
        '--scale-h': `${dh}`,
        '--duration': `${anim.durationMs}ms`,
    };
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['flying-card__flipper']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__flipper']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card--defense']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-animation-overlay" },
});
for (const [anim] of __VLS_getVForSourceType((__VLS_ctx.activeAnimations))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (anim.id),
        ...{ class: "flying-card-wrapper" },
        ...{ style: (__VLS_ctx.getWrapperStyle(anim)) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flying-card" },
        ...{ class: ([
                `flying-card--${anim.type}`,
                {
                    'flying-card--defense': anim.isDefense,
                    'flying-card--facedown': anim.isFacedown,
                },
            ]) },
    });
    if (anim.type === 'attack') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "attack-blade-surge" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "attack-sword-wrapper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "attack-sword-emoji" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "attack-slash-beam" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "attack-impact-flare" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flying-card__flipper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flying-card__face flying-card__face--front" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImage(anim.code)),
            alt: (anim.cardName),
            ...{ class: "flying-card__img" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flying-card__sheen" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flying-card__face flying-card__face--back" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.getCardBackUrl()),
            alt: "Card Back",
            ...{ class: "flying-card__img flying-card__img--back" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "flying-card__sheen" },
        });
    }
    if (anim.type === 'summon' || anim.type === 'activate') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summon-shockwave" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['card-animation-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card']} */ ;
/** @type {__VLS_StyleScopedClasses['attack-blade-surge']} */ ;
/** @type {__VLS_StyleScopedClasses['attack-sword-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['attack-sword-emoji']} */ ;
/** @type {__VLS_StyleScopedClasses['attack-slash-beam']} */ ;
/** @type {__VLS_StyleScopedClasses['attack-impact-flare']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__flipper']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__face']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__face--front']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__img']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__face']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__face--back']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__img']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__img--back']} */ ;
/** @type {__VLS_StyleScopedClasses['flying-card__sheen']} */ ;
/** @type {__VLS_StyleScopedClasses['summon-shockwave']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            activeAnimations: activeAnimations,
            getCardBackUrl: getCardBackUrl,
            getCardImage: getCardImage,
            handleImageError: handleImageError,
            getWrapperStyle: getWrapperStyle,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
