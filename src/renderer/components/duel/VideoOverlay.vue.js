import { ref, computed, watch, onUnmounted } from 'vue';
import { useSettingsStore } from '../../stores/settingsStore.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
const props = defineProps();
const emit = defineEmits();
const settingsStore = useSettingsStore();
const videoElement = ref(null);
const videoError = ref(false);
const progressPercent = ref(0);
let progressInterval = null;
const FALLBACK_DURATION_MS = 3000;
const videoSrc = computed(() => {
    if (!props.video?.videoPath)
        return '';
    return `app-resource://${props.video.videoPath}`;
});
watch(videoElement, (el) => {
    if (el) {
        el.volume = Math.max(0, Math.min(1, settingsStore.bgmVolume / 100));
    }
});
watch(() => props.visible, (isVis) => {
    if (isVis && props.video) {
        videoError.value = !!props.video.isPlaceholder;
        progressPercent.value = 0;
        if (videoError.value) {
            startProgressTimer();
        }
    }
    else {
        clearProgressTimer();
    }
}, { immediate: true });
function startProgressTimer() {
    clearProgressTimer();
    const startTime = Date.now();
    progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / FALLBACK_DURATION_MS) * 100);
        progressPercent.value = pct;
        if (pct >= 100) {
            clearProgressTimer();
            handleVideoEnded();
        }
    }, 40);
}
function clearProgressTimer() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}
function handleVideoError() {
    videoError.value = true;
    startProgressTimer();
}
function handleVideoEnded() {
    clearProgressTimer();
    emit('finish');
}
function handleSkip() {
    clearProgressTimer();
    emit('finish');
}
function handleKeydown(e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
    }
}
onUnmounted(() => {
    clearProgressTimer();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.Transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.Transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "video-fade",
}));
const __VLS_2 = __VLS_1({
    name: "video-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.visible && __VLS_ctx.video) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.handleSkip) },
        ...{ onKeydown: (__VLS_ctx.handleKeydown) },
        ...{ class: "video-overlay" },
        tabindex: "0",
    });
    if (!__VLS_ctx.videoError && __VLS_ctx.videoSrc) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
            ...{ onEnded: (__VLS_ctx.handleVideoEnded) },
            ...{ onError: (__VLS_ctx.handleVideoError) },
            ref: "videoElement",
            ...{ class: "video-overlay__player" },
            src: (__VLS_ctx.videoSrc),
            autoplay: true,
            playsinline: true,
        });
        /** @type {typeof __VLS_ctx.videoElement} */ ;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__fallback" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__backdrop-glow" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__particles" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
            ...{ class: "video-overlay__header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "video-overlay__type-badge" },
            ...{ class: (`video-overlay__type-badge--${__VLS_ctx.video.videoType}`) },
        });
        (__VLS_ctx.video.videoType === 'summon' ? '⚡ SPECIAL SUMMON ⚡' : __VLS_ctx.video.videoType === 'victory' ? '👑 SPECIAL VICTORY: EXODIA OBLITERATE! 👑' : '⚔️ BATTLE ATTACK ⚔️');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
            ...{ class: "video-overlay__card-name" },
        });
        (__VLS_ctx.video.cardName || 'Iconic Card');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
            ...{ class: "video-overlay__hero" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__art-frame" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (__VLS_ctx.handleImageError) },
            src: (__VLS_ctx.getCardImageUrl(__VLS_ctx.video.code, 'full')),
            alt: (__VLS_ctx.video.cardName),
            ...{ class: "video-overlay__art-img" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__art-shine" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__art-rings" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__watermark" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "watermark-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "watermark-text" },
        });
        (__VLS_ctx.video.isPlaceholder ? 'Placeholder Video Asset' : 'Video Asset Loading');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({
            ...{ class: "watermark-path" },
        });
        (__VLS_ctx.video.videoPath);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__skip-hint" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "skip-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__progress-bar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
            ...{ class: "video-overlay__progress-fill" },
            ...{ style: ({ width: `${__VLS_ctx.progressPercent}%` }) },
        });
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['video-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__player']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__fallback']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__backdrop-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__particles']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__header']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__type-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__card-name']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__hero']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__art-frame']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__art-img']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__art-shine']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__art-rings']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__watermark']} */ ;
/** @type {__VLS_StyleScopedClasses['watermark-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['watermark-text']} */ ;
/** @type {__VLS_StyleScopedClasses['watermark-path']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__skip-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['skip-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__progress-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['video-overlay__progress-fill']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getCardImageUrl: getCardImageUrl,
            handleImageError: handleImageError,
            videoElement: videoElement,
            videoError: videoError,
            progressPercent: progressPercent,
            videoSrc: videoSrc,
            handleVideoError: handleVideoError,
            handleVideoEnded: handleVideoEnded,
            handleSkip: handleSkip,
            handleKeydown: handleKeydown,
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
