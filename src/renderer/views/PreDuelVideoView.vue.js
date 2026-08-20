import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import { getCharacterVideoUrl, getCharacterPortraitUrl } from '../utils/media.js';
const router = useRouter();
const duelStore = useDuelStore();
const settingsStore = useSettingsStore();
const videoElement = ref(null);
const videoError = ref(false);
const portraitError = ref(false);
const progressPercent = ref(0);
let progressInterval = null;
const FALLBACK_DURATION_MS = 4500;
const opponentId = computed(() => duelStore.selectedOpponent?.id || 'yugi-muto');
const opponentName = computed(() => duelStore.opponentName);
const opponentTitle = computed(() => duelStore.opponentTitle);
const opponentSeries = computed(() => duelStore.opponentSeries);
const opponentTagline = computed(() => duelStore.selectedOpponent?.tagline || '');
const videoUrl = computed(() => getCharacterVideoUrl(opponentId.value));
const opponentAvatarUrl = computed(() => getCharacterPortraitUrl(opponentId.value));
const expectedVideoPath = computed(() => `resources/videos/characters/${opponentId.value}.mp4`);
onMounted(async () => {
    // If user configured skip in Settings, bypass video immediately
    if (settingsStore.skipPreDuelVideo) {
        router.replace('/duel');
        return;
    }
    // Ensure match data is configured
    if (!duelStore.isMatchPrepared) {
        await duelStore.setupMatch();
    }
    // Configure video volume if player starts
    if (videoElement.value) {
        videoElement.value.volume = Math.max(0, Math.min(1, settingsStore.bgmVolume / 100));
    }
    // Start progress countdown for fallback
    startProgressTimer();
});
onUnmounted(() => {
    clearProgressTimer();
});
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
    }, 50);
}
function clearProgressTimer() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}
function handleVideoError() {
    console.log(`[PreDuelVideo] Video file not found or unplayable at ${expectedVideoPath.value}. Rendering cinematic fallback.`);
    videoError.value = true;
    startProgressTimer();
}
function handleVideoEnded() {
    clearProgressTimer();
    router.push('/duel');
}
function handleSkip() {
    clearProgressTimer();
    router.push('/duel');
}
function handleKeydown(e) {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.handleSkip) },
    ...{ onKeydown: (__VLS_ctx.handleKeydown) },
    ...{ class: "pre-duel-video-view" },
    tabindex: "0",
});
if (!__VLS_ctx.videoError && __VLS_ctx.videoUrl) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.video)({
        ...{ onEnded: (__VLS_ctx.handleVideoEnded) },
        ...{ onError: (__VLS_ctx.handleVideoError) },
        ref: "videoElement",
        ...{ class: "pre-duel-video-view__video-player" },
        src: (__VLS_ctx.videoUrl),
        autoplay: true,
        playsinline: true,
    });
    /** @type {typeof __VLS_ctx.videoElement} */ ;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__fallback-stage" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__backdrop-particles" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "pre-duel-video-view__header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "pre-duel-video-view__series-pill" },
        ...{ class: (`pre-duel-video-view__series-pill--${__VLS_ctx.opponentSeries.toLowerCase()}`) },
    });
    (__VLS_ctx.opponentSeries === 'DM' ? 'ORIGINAL SERIES' : 'YU-GI-OH! GX');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "pre-duel-video-view__intro-heading" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
        ...{ class: "pre-duel-video-view__hero-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__portrait-col" },
    });
    if (__VLS_ctx.opponentAvatarUrl && !__VLS_ctx.portraitError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            ...{ onError: (...[$event]) => {
                    if (!!(!__VLS_ctx.videoError && __VLS_ctx.videoUrl))
                        return;
                    if (!(__VLS_ctx.opponentAvatarUrl && !__VLS_ctx.portraitError))
                        return;
                    __VLS_ctx.portraitError = true;
                } },
            src: (__VLS_ctx.opponentAvatarUrl),
            alt: (__VLS_ctx.opponentName),
            ...{ class: "pre-duel-video-view__portrait-img" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "pre-duel-video-view__portrait-silhouette" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            'stroke-width': "1.5",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
            cx: "12",
            cy: "7",
            r: "4",
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__info-col" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "pre-duel-video-view__char-name" },
    });
    (__VLS_ctx.opponentName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "pre-duel-video-view__char-title" },
    });
    (__VLS_ctx.opponentTitle);
    if (__VLS_ctx.opponentTagline) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "pre-duel-video-view__char-quote" },
        });
        (__VLS_ctx.opponentTagline);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__deck-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "pre-duel-video-view__deck-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "pre-duel-video-view__deck-name" },
    });
    (__VLS_ctx.duelStore.selectedOpponentDeck?.name || 'Selected Archetype Deck');
    (__VLS_ctx.duelStore.selectedOpponentDeck?.archetype || 'Custom');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__watermark-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "watermark-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "watermark-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({
        ...{ class: "watermark-path" },
    });
    (__VLS_ctx.expectedVideoPath);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__skip-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "skip-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__progress-bar-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "pre-duel-video-view__progress-bar-fill" },
        ...{ style: ({ width: `${__VLS_ctx.progressPercent}%` }) },
    });
}
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__video-player']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__fallback-stage']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__backdrop-particles']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__header']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__series-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__intro-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__hero-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__portrait-col']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__portrait-img']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__portrait-silhouette']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__info-col']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__char-name']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__char-title']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__char-quote']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__deck-info']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__deck-label']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__deck-name']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__watermark-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['watermark-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['watermark-title']} */ ;
/** @type {__VLS_StyleScopedClasses['watermark-path']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__skip-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['skip-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__progress-bar-container']} */ ;
/** @type {__VLS_StyleScopedClasses['pre-duel-video-view__progress-bar-fill']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            duelStore: duelStore,
            videoElement: videoElement,
            videoError: videoError,
            portraitError: portraitError,
            progressPercent: progressPercent,
            opponentName: opponentName,
            opponentTitle: opponentTitle,
            opponentSeries: opponentSeries,
            opponentTagline: opponentTagline,
            videoUrl: videoUrl,
            opponentAvatarUrl: opponentAvatarUrl,
            expectedVideoPath: expectedVideoPath,
            handleVideoError: handleVideoError,
            handleVideoEnded: handleVideoEnded,
            handleSkip: handleSkip,
            handleKeydown: handleKeydown,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
