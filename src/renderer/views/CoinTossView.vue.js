import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import { getCoinHeadsUrl, getCoinTailsUrl } from '../utils/media.js';
import YugiButton from '../components/common/YugiButton.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
const router = useRouter();
const duelStore = useDuelStore();
const settingsStore = useSettingsStore();
const coinHeadsUrl = getCoinHeadsUrl();
const coinTailsUrl = getCoinTailsUrl();
const selectedChoice = ref(null);
const pendingOutcome = ref(null);
const isFlipping = ref(false);
const hasLanded = ref(false);
let autoAdvanceTimer = null;
const opponentName = computed(() => duelStore.opponentName);
const opponentSeries = computed(() => duelStore.opponentSeries);
onMounted(async () => {
    // Ensure match data (opponent, decks) is pre-configured
    await duelStore.setupMatch();
});
onUnmounted(() => {
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
});
function handleImageFallback(event) {
    const target = event.target;
    if (target) {
        target.style.display = 'none';
    }
}
/**
 * Executes the 3D coin flip and starting player calculation.
 */
function handlePickChoice(choice) {
    if (isFlipping.value)
        return;
    selectedChoice.value = choice;
    isFlipping.value = true;
    hasLanded.value = false;
    // Random 50/50 outcome
    const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
    pendingOutcome.value = outcome;
    // Record outcome into duel store immediately
    duelStore.resolveCoinToss(choice, outcome);
    // Allow 2.2s for the 3D coin flip animation to complete
    setTimeout(() => {
        isFlipping.value = false;
        hasLanded.value = true;
        // If auto-advance is preferred, set a generous timer
        autoAdvanceTimer = setTimeout(() => {
            // Optional: do not force auto-advance if user wants to inspect result, but allow quick spacebar
        }, 6000);
    }, 2200);
}
function handleResetCoinToss() {
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
    selectedChoice.value = null;
    pendingOutcome.value = null;
    isFlipping.value = false;
    hasLanded.value = false;
}
function proceedToPreDuelVideo() {
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
    // If user enabled skip in settings, jump straight to duel
    if (settingsStore.skipPreDuelVideo) {
        router.push('/duel');
    }
    else {
        router.push('/pre-duel-video');
    }
}
function handleGlobalKeydown(e) {
    if (isFlipping.value)
        return;
    if (!hasLanded.value) {
        if (e.key === '1' || e.key === 'h' || e.key === 'H') {
            handlePickChoice('heads');
        }
        else if (e.key === '2' || e.key === 't' || e.key === 'T') {
            handlePickChoice('tails');
        }
    }
    else {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            proceedToPreDuelVideo();
        }
        else if (e.key === 'r' || e.key === 'R') {
            handleResetCoinToss();
        }
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onKeydown: (__VLS_ctx.handleGlobalKeydown) },
    ...{ class: "coin-toss-view" },
    tabindex: "0",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__ambient-glow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "coin-toss-view__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__matchup-title-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "coin-toss-view__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "coin-toss-view__subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__matchup-rivals" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__rival coin-toss-view__rival--user" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "coin-toss-view__rival-tag" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "coin-toss-view__rival-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__vs-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__rival coin-toss-view__rival--opponent" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "coin-toss-view__rival-name" },
});
(__VLS_ctx.opponentName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "coin-toss-view__rival-tag" },
});
(__VLS_ctx.opponentSeries);
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    variant: "ghost",
    size: "sm",
    icon: "←",
    to: "/main-menu",
}));
const __VLS_1 = __VLS_0({
    variant: "ghost",
    size: "sm",
    icon: "←",
    to: "/main-menu",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "coin-toss-view__stage" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__coin-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__coin-pedestal" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__coin-aura" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__coin" },
    ...{ class: ({
            'coin-toss-view__coin--flipping-heads': __VLS_ctx.isFlipping && __VLS_ctx.pendingOutcome === 'heads',
            'coin-toss-view__coin--flipping-tails': __VLS_ctx.isFlipping && __VLS_ctx.pendingOutcome === 'tails',
            'coin-toss-view__coin--landed-heads': __VLS_ctx.hasLanded && __VLS_ctx.duelStore.coinResult === 'heads',
            'coin-toss-view__coin--landed-tails': __VLS_ctx.hasLanded && __VLS_ctx.duelStore.coinResult === 'tails',
        }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__coin-face coin-toss-view__coin-face--heads" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onError: (__VLS_ctx.handleImageFallback) },
    src: (__VLS_ctx.coinHeadsUrl),
    alt: "Coin Heads Face — Solar Eye",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__coin-face coin-toss-view__coin-face--tails" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onError: (__VLS_ctx.handleImageFallback) },
    src: (__VLS_ctx.coinTailsUrl),
    alt: "Coin Tails Face — Crescent Star",
});
if (!__VLS_ctx.isFlipping && !__VLS_ctx.hasLanded) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "coin-toss-view__choice-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "coin-toss-view__prompt-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "coin-toss-view__choices-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isFlipping && !__VLS_ctx.hasLanded))
                    return;
                __VLS_ctx.handlePickChoice('heads');
            } },
        ...{ class: "coin-toss-view__choice-card" },
        ...{ class: ({ 'coin-toss-view__choice-card--selected': __VLS_ctx.selectedChoice === 'heads' }) },
        disabled: (__VLS_ctx.isFlipping),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "coin-toss-view__choice-hotkey" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleImageFallback) },
        src: (__VLS_ctx.coinHeadsUrl),
        alt: "Heads",
        ...{ class: "coin-toss-view__choice-coin-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "coin-toss-view__choice-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "coin-toss-view__choice-sub" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(!__VLS_ctx.isFlipping && !__VLS_ctx.hasLanded))
                    return;
                __VLS_ctx.handlePickChoice('tails');
            } },
        ...{ class: "coin-toss-view__choice-card" },
        ...{ class: ({ 'coin-toss-view__choice-card--selected': __VLS_ctx.selectedChoice === 'tails' }) },
        disabled: (__VLS_ctx.isFlipping),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "coin-toss-view__choice-hotkey" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        ...{ onError: (__VLS_ctx.handleImageFallback) },
        src: (__VLS_ctx.coinTailsUrl),
        alt: "Tails",
        ...{ class: "coin-toss-view__choice-coin-img" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "coin-toss-view__choice-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "coin-toss-view__choice-sub" },
    });
}
else if (__VLS_ctx.isFlipping) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "coin-toss-view__flipping-indicator" },
    });
    /** @type {[typeof LoadingSpinner, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({
        size: "md",
        variant: "gold",
    }));
    const __VLS_4 = __VLS_3({
        size: "md",
        variant: "gold",
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
else if (__VLS_ctx.hasLanded) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "coin-toss-view__result-banner" },
        ...{ class: ({
                'coin-toss-view__result-banner--user-won': __VLS_ctx.duelStore.userWonCoinToss,
                'coin-toss-view__result-banner--opponent-won': !__VLS_ctx.duelStore.userWonCoinToss,
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "coin-toss-view__outcome-badge" },
    });
    (__VLS_ctx.duelStore.coinResult?.toUpperCase());
    (__VLS_ctx.duelStore.userChoice?.toUpperCase());
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "coin-toss-view__winner-title" },
    });
    (__VLS_ctx.duelStore.userWonCoinToss ? 'YOU WON THE TOSS!' : `${__VLS_ctx.opponentName.toUpperCase()} WON THE TOSS!`);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "coin-toss-view__turn-announcement" },
    });
    if (__VLS_ctx.duelStore.userWonCoinToss) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (__VLS_ctx.opponentName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "coin-toss-view__result-actions" },
    });
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "ghost",
        size: "md",
        icon: "🔄",
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onClick': {} },
        variant: "ghost",
        size: "md",
        icon: "🔄",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    let __VLS_11;
    const __VLS_12 = {
        onClick: (__VLS_ctx.handleResetCoinToss)
    };
    __VLS_8.slots.default;
    var __VLS_8;
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "primary",
        size: "lg",
        icon: "🎬",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        variant: "primary",
        size: "lg",
        icon: "🎬",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.proceedToPreDuelVideo)
    };
    __VLS_15.slots.default;
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
    ...{ class: "coin-toss-view__footer" },
});
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    variant: "ghost",
    size: "sm",
    to: "/settings",
}));
const __VLS_21 = __VLS_20({
    variant: "ghost",
    size: "sm",
    to: "/settings",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
__VLS_22.slots.default;
(__VLS_ctx.opponentName);
var __VLS_22;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "coin-toss-view__deck-preview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-secondary text-sm" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.duelStore.selectedUserDeck?.name || 'Starter Deck');
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.duelStore.selectedOpponentDeck?.name || 'Random Deck');
/** @type {__VLS_StyleScopedClasses['coin-toss-view']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__ambient-glow']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__header']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__matchup-title-block']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__title']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__matchup-rivals']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival--user']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival-name']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__vs-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival--opponent']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival-name']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__rival-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__stage']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin-pedestal']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin-aura']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin-face']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin-face--heads']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin-face']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__coin-face--tails']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-container']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__prompt-text']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choices-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-card']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-hotkey']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-coin-img']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-label']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-card']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-hotkey']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-coin-img']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-label']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__choice-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__flipping-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__result-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__outcome-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__winner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__turn-announcement']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__result-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__footer']} */ ;
/** @type {__VLS_StyleScopedClasses['coin-toss-view__deck-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['text-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            YugiButton: YugiButton,
            LoadingSpinner: LoadingSpinner,
            duelStore: duelStore,
            coinHeadsUrl: coinHeadsUrl,
            coinTailsUrl: coinTailsUrl,
            selectedChoice: selectedChoice,
            pendingOutcome: pendingOutcome,
            isFlipping: isFlipping,
            hasLanded: hasLanded,
            opponentName: opponentName,
            opponentSeries: opponentSeries,
            handleImageFallback: handleImageFallback,
            handlePickChoice: handlePickChoice,
            handleResetCoinToss: handleResetCoinToss,
            proceedToPreDuelVideo: proceedToPreDuelVideo,
            handleGlobalKeydown: handleGlobalKeydown,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
