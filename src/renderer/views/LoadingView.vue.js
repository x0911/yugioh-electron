import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUIStore } from '../stores/uiStore.js';
import GlassPanel from '../components/common/GlassPanel.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import YugiButton from '../components/common/YugiButton.vue';
const router = useRouter();
const uiStore = useUIStore();
const progressPercent = ref(15);
const statusMessage = ref('Summoning Ancient Duel Engine (WASM)...');
const statsText = ref('');
const isReady = ref(false);
const hasError = ref(false);
async function startEngineInitialization() {
    hasError.value = false;
    isReady.value = false;
    progressPercent.value = 20;
    statusMessage.value = 'Awakening Duel Engine Core (WASM)...';
    statsText.value = '';
    try {
        // Check if Electron appAPI is available
        if (window.appAPI && typeof window.appAPI.initEngine === 'function') {
            // Step 1: Trigger engine init
            progressPercent.value = 45;
            statusMessage.value = 'Loading Ancient Card Database & Base Lua Scripts...';
            const status = await window.appAPI.initEngine();
            if (!status.ready || status.error) {
                throw new Error(status.error || 'Card pool database or engine core not ready.');
            }
            // Step 2: Engine & DB verified
            progressPercent.value = 85;
            statusMessage.value = `Validating Legal DM & GX Card Pool (${status.cardCount.toLocaleString()} Cards)...`;
            statsText.value = `Engine ${status.engineVersion} • ${status.cardCount.toLocaleString()} Legal Cards • ${status.scriptsCount.toLocaleString()} Scripts`;
            uiStore.setEngineStatus(status);
            // Final Step: Complete
            await new Promise((resolve) => setTimeout(resolve, 300));
            progressPercent.value = 100;
            statusMessage.value = 'Ancient Duel Arena Ready!';
            isReady.value = true;
            // Smooth transition to Main Menu
            await new Promise((resolve) => setTimeout(resolve, 500));
            router.replace('/main-menu');
        }
        else {
            // Fallback for non-Electron or standalone browser environment
            console.warn('[LoadingView] window.appAPI not detected — running mock initialization');
            await new Promise((resolve) => setTimeout(resolve, 300));
            progressPercent.value = 60;
            statusMessage.value = 'Loading Mock Card Database...';
            await new Promise((resolve) => setTimeout(resolve, 300));
            progressPercent.value = 100;
            statusMessage.value = 'Arena Ready (Dev Fallback)';
            isReady.value = true;
            await new Promise((resolve) => setTimeout(resolve, 400));
            router.replace('/main-menu');
        }
    }
    catch (err) {
        console.error('[LoadingView] Engine initialization failed:', err);
        hasError.value = true;
        progressPercent.value = 100;
        const msg = err instanceof Error ? err.message : String(err);
        statusMessage.value = `Initialization Error: ${msg}`;
    }
}
onMounted(() => {
    startEngineInitialization();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "loading-view__bg" },
});
/** @type {[typeof GlassPanel, typeof GlassPanel, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(GlassPanel, new GlassPanel({
    elevated: true,
    accent: "gold",
    padding: "40px 48px",
    ...{ class: "loading-view__card" },
}));
const __VLS_1 = __VLS_0({
    elevated: true,
    accent: "gold",
    padding: "40px 48px",
    ...{ class: "loading-view__card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-view__emblem" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    ...{ class: "loading-view__emblem-svg" },
    viewBox: "0 0 64 64",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
    points: "32,6 58,54 6,54",
    stroke: "#c9a227",
    'stroke-width': "2.5",
    fill: "rgba(18, 22, 30, 0.7)",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.polygon)({
    points: "32,14 52,50 12,50",
    stroke: "rgba(244, 228, 184, 0.4)",
    'stroke-width': "1.5",
    fill: "none",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "32",
    cy: "36",
    r: "6",
    fill: "#e3c567",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
    cx: "32",
    cy: "36",
    r: "3",
    fill: "#0a0c10",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M20 36 C24 28, 40 28, 44 36 C40 44, 24 44, 20 36 Z",
    stroke: "#f4e4b8",
    'stroke-width': "2",
    fill: "none",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M32 42 L32 49 M38 42 C40 45, 41 48, 38 49",
    stroke: "#c9a227",
    'stroke-width': "1.5",
    'stroke-linecap': "round",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-view__title-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "loading-view__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "loading-view__subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-view__status-container" },
});
if (!__VLS_ctx.hasError) {
    if (!__VLS_ctx.isReady) {
        /** @type {[typeof LoadingSpinner, ]} */ ;
        // @ts-ignore
        const __VLS_3 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({
            size: (72),
            variant: "gold",
            ...{ class: "loading-view__spinner" },
        }));
        const __VLS_4 = __VLS_3({
            size: (72),
            variant: "gold",
            ...{ class: "loading-view__spinner" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "loading-view__ready-icon" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 24 24",
            width: "56",
            height: "56",
            fill: "none",
            stroke: "#3ddc97",
            'stroke-width': "2.5",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "#3ddc97",
            'stroke-opacity': "0.3",
            fill: "rgba(61, 220, 151, 0.15)",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.polyline)({
            points: "7 12 10.5 15.5 17 9",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-view__error-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        width: "56",
        height: "56",
        fill: "none",
        stroke: "#eb5757",
        'stroke-width': "2.5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "#eb5757",
        'stroke-opacity': "0.3",
        fill: "rgba(235, 87, 87, 0.15)",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.line)({
        x1: "12",
        y1: "8",
        x2: "12",
        y2: "13",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle)({
        cx: "12",
        cy: "16.5",
        r: "1",
        fill: "#eb5757",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-view__meter-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-view__meter-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "loading-view__meter-fill" },
    ...{ class: ({
            'loading-view__meter-fill--error': __VLS_ctx.hasError,
            'loading-view__meter-fill--ready': __VLS_ctx.isReady,
        }) },
    ...{ style: ({ width: `${__VLS_ctx.progressPercent}%` }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "loading-view__meter-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "loading-view__status-text" },
    ...{ class: ({ 'loading-view__status-text--error': __VLS_ctx.hasError }) },
});
(__VLS_ctx.statusMessage);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "loading-view__percent-text" },
});
(__VLS_ctx.progressPercent);
if (__VLS_ctx.statsText) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-view__stats-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ class: "loading-view__stats-dot" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "loading-view__stats-label" },
    });
    (__VLS_ctx.statsText);
}
if (__VLS_ctx.hasError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-view__error-actions" },
    });
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "primary",
        size: "md",
        icon: "🔄",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        variant: "primary",
        size: "md",
        icon: "🔄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    let __VLS_11;
    const __VLS_12 = {
        onClick: (__VLS_ctx.startEngineInitialization)
    };
    __VLS_8.slots.default;
    var __VLS_8;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
    ...{ class: "loading-view__footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['loading-view']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__bg']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__card']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__emblem']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__emblem-svg']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__title-group']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__title']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__status-container']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__ready-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__error-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__meter-group']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__meter-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__meter-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__meter-info']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__status-text']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__percent-text']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__stats-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__stats-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__stats-label']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__error-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-view__footer']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            GlassPanel: GlassPanel,
            LoadingSpinner: LoadingSpinner,
            YugiButton: YugiButton,
            progressPercent: progressPercent,
            statusMessage: statusMessage,
            statsText: statsText,
            isReady: isReady,
            hasError: hasError,
            startEngineInitialization: startEngineInitialization,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
