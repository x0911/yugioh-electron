import { ref, computed, watch, onUnmounted } from 'vue';
import { getCharacterPortraitUrl } from '../../utils/media.js';
const props = withDefaults(defineProps(), {
    title: '',
    series: 'DM',
    avatar: '',
    characterId: '',
    maxLp: 8000,
    isTurn: false,
});
const avatarFailed = ref(false);
const displayLp = ref(props.currentLp);
const isDamagedFlash = ref(false);
let damageFlashTimeout = null;
let tweenAnimFrame = null;
function handleAvatarError() {
    avatarFailed.value = true;
}
watch(() => props.currentLp, (newVal, oldVal) => {
    if (oldVal !== undefined && newVal < oldVal) {
        // Trigger damage flash on damage taken
        isDamagedFlash.value = true;
        if (damageFlashTimeout)
            clearTimeout(damageFlashTimeout);
        damageFlashTimeout = setTimeout(() => {
            isDamagedFlash.value = false;
        }, 550);
    }
    // Tween LP counter
    if (tweenAnimFrame) {
        cancelAnimationFrame(tweenAnimFrame);
    }
    const startLp = displayLp.value;
    const targetLp = Math.max(0, newVal);
    const duration = 460;
    const startTime = performance.now();
    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        displayLp.value = Math.round(startLp + (targetLp - startLp) * ease);
        if (progress < 1) {
            tweenAnimFrame = requestAnimationFrame(step);
        }
        else {
            displayLp.value = targetLp;
            tweenAnimFrame = null;
        }
    }
    tweenAnimFrame = requestAnimationFrame(step);
}, { immediate: true });
onUnmounted(() => {
    if (damageFlashTimeout)
        clearTimeout(damageFlashTimeout);
    if (tweenAnimFrame)
        cancelAnimationFrame(tweenAnimFrame);
});
const formattedLp = computed(() => {
    return Math.max(0, displayLp.value).toString();
});
const lpPercentage = computed(() => {
    const max = props.maxLp > 0 ? props.maxLp : 8000;
    return Math.min(100, Math.max(0, (displayLp.value / max) * 100));
});
const lpHealthTier = computed(() => {
    if (displayLp.value > 4000)
        return 'healthy';
    if (displayLp.value > 2000)
        return 'warning';
    return 'critical';
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    title: '',
    series: 'DM',
    avatar: '',
    characterId: '',
    maxLp: 8000,
    isTurn: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['lp-meter__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter--active-turn']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-value']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter" },
    ...{ class: ([
            `lp-meter--${__VLS_ctx.player}`,
            {
                'lp-meter--active-turn': __VLS_ctx.isTurn,
                'lp-meter--low-lp': __VLS_ctx.currentLp <= 2000,
                'lp-meter--zero-lp': __VLS_ctx.currentLp <= 0,
                'lp-meter--damage-flash': __VLS_ctx.isDamagedFlash,
            },
        ]) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__avatar-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__avatar" },
});
if (__VLS_ctx.characterId && !__VLS_ctx.avatarFailed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleAvatarError) },
        src: (__VLS_ctx.getCharacterPortraitUrl(__VLS_ctx.characterId)),
        alt: (__VLS_ctx.name),
        ...{ class: "avatar-image" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar-fallback" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 36 36",
        ...{ class: "avatar-glyph" },
        fill: "currentColor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M18 4C10.27 4 4 10.27 4 18s6.27 14 14 14 14-6.27 14-14S25.73 4 18 4zm0 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 21.2c-3.73 0-6.99-1.87-8.91-4.71.04-2.95 5.94-4.57 8.91-4.57 2.96 0 8.87 1.62 8.91 4.57-1.92 2.84-5.18 4.71-8.91 4.71z",
    });
}
if (__VLS_ctx.series) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "series-pill" },
        ...{ class: (`series-pill--${__VLS_ctx.series.toLowerCase()}`) },
    });
    (__VLS_ctx.series);
}
if (__VLS_ctx.isTurn) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "turn-badge" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "player-name" },
    title: (__VLS_ctx.name),
});
(__VLS_ctx.name);
if (__VLS_ctx.title) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "player-title" },
        title: (__VLS_ctx.title),
    });
    (__VLS_ctx.title);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__value-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "lp-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "lp-value" },
});
(__VLS_ctx.formattedLp);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__bar-track" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lp-meter__bar-fill" },
    ...{ class: (`lp-meter__bar-fill--${__VLS_ctx.lpHealthTier}`) },
    ...{ style: ({ width: `${__VLS_ctx.lpPercentage}%` }) },
});
/** @type {__VLS_StyleScopedClasses['lp-meter']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__avatar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-image']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-fallback']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-glyph']} */ ;
/** @type {__VLS_StyleScopedClasses['series-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['turn-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__content']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__header']} */ ;
/** @type {__VLS_StyleScopedClasses['player-name']} */ ;
/** @type {__VLS_StyleScopedClasses['player-title']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__value-row']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-label']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-value']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['lp-meter__bar-fill']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCharacterPortraitUrl: getCharacterPortraitUrl,
            avatarFailed: avatarFailed,
            isDamagedFlash: isDamagedFlash,
            handleAvatarError: handleAvatarError,
            formattedLp: formattedLp,
            lpPercentage: lpPercentage,
            lpHealthTier: lpHealthTier,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
