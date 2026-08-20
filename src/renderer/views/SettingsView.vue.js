import { ref, computed, onMounted } from 'vue';
import { useSettingsStore } from '../stores/settingsStore.js';
import GlassPanel from '../components/common/GlassPanel.vue';
import YugiButton from '../components/common/YugiButton.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import OpponentCarousel from '../components/settings/OpponentCarousel.vue';
const settingsStore = useSettingsStore();
const avatarFailed = ref(false);
const selectedChar = computed(() => settingsStore.selectedCharacter);
function handleSelectOpponent(id) {
    avatarFailed.value = false;
    settingsStore.setSelectedOpponent(id);
}
function handleFilterChange(filter) {
    settingsStore.setSelectedSeriesFilter(filter);
}
function handleBgmInput(e) {
    const val = parseInt(e.target.value, 10);
    settingsStore.setBgmVolume(val);
}
function handleSfxInput(e) {
    const val = parseInt(e.target.value, 10);
    settingsStore.setSfxVolume(val);
}
async function handleReset() {
    await settingsStore.resetToDefaults();
}
onMounted(async () => {
    await settingsStore.initializeSettings();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "settings-view__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-view__header-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "settings-view__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "settings-view__subtitle" },
});
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    variant: "secondary",
    size: "md",
    icon: "←",
    to: "/main-menu",
}));
const __VLS_1 = __VLS_0({
    variant: "secondary",
    size: "md",
    icon: "←",
    to: "/main-menu",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
var __VLS_2;
if (__VLS_ctx.settingsStore.isLoading && !__VLS_ctx.settingsStore.isInitialized) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__loading" },
    });
    /** @type {[typeof LoadingSpinner, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(LoadingSpinner, new LoadingSpinner({
        variant: "gold",
        size: "md",
        message: "Loading Opponents & Settings...",
    }));
    const __VLS_4 = __VLS_3({
        variant: "gold",
        size: "md",
        message: "Loading Opponents & Settings...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "settings-view__section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "settings-view__section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__section-tag" },
    });
    (__VLS_ctx.settingsStore.characters.length);
    /** @type {[typeof OpponentCarousel, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(OpponentCarousel, new OpponentCarousel({
        ...{ 'onSelect': {} },
        ...{ 'onUpdate:seriesFilter': {} },
        characters: (__VLS_ctx.settingsStore.characters),
        selectedId: (__VLS_ctx.settingsStore.selectedOpponentId),
        seriesFilter: (__VLS_ctx.settingsStore.selectedSeriesFilter),
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onSelect': {} },
        ...{ 'onUpdate:seriesFilter': {} },
        characters: (__VLS_ctx.settingsStore.characters),
        selectedId: (__VLS_ctx.settingsStore.selectedOpponentId),
        seriesFilter: (__VLS_ctx.settingsStore.selectedSeriesFilter),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_9;
    let __VLS_10;
    let __VLS_11;
    const __VLS_12 = {
        onSelect: (__VLS_ctx.handleSelectOpponent)
    };
    const __VLS_13 = {
        'onUpdate:seriesFilter': (__VLS_ctx.handleFilterChange)
    };
    var __VLS_8;
    if (__VLS_ctx.selectedChar) {
        /** @type {[typeof GlassPanel, typeof GlassPanel, ]} */ ;
        // @ts-ignore
        const __VLS_14 = __VLS_asFunctionalComponent(GlassPanel, new GlassPanel({
            elevated: true,
            accent: "gold",
            ...{ class: "settings-view__dossier" },
            ...{ style: ({ '--char-theme-color': __VLS_ctx.selectedChar.themeColor || '#c9a227' }) },
        }));
        const __VLS_15 = __VLS_14({
            elevated: true,
            accent: "gold",
            ...{ class: "settings-view__dossier" },
            ...{ style: ({ '--char-theme-color': __VLS_ctx.selectedChar.themeColor || '#c9a227' }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_14));
        __VLS_16.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__dossier-left" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__dossier-avatar-box" },
        });
        if (!__VLS_ctx.avatarFailed && __VLS_ctx.selectedChar.avatar) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                ...{ onError: (...[$event]) => {
                        if (!!(__VLS_ctx.settingsStore.isLoading && !__VLS_ctx.settingsStore.isInitialized))
                            return;
                        if (!(__VLS_ctx.selectedChar))
                            return;
                        if (!(!__VLS_ctx.avatarFailed && __VLS_ctx.selectedChar.avatar))
                            return;
                        __VLS_ctx.avatarFailed = true;
                    } },
                src: (__VLS_ctx.selectedChar.avatar),
                alt: (__VLS_ctx.selectedChar.name),
                ...{ class: "settings-view__dossier-img" },
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
                fill: "url(#dossierGrad)",
                opacity: "0.9",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M60 14L52 28L60 24L68 28L60 14Z",
                fill: "var(--char-theme-color)",
                opacity: "0.75",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M36 100C24 106 14 118 10 134H110C106 118 96 106 86 100C80 108 70 114 60 114C50 114 40 108 36 100Z",
                fill: "url(#dossierGrad)",
                opacity: "0.85",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.defs, __VLS_intrinsicElements.defs)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.linearGradient, __VLS_intrinsicElements.linearGradient)({
                id: "dossierGrad",
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
            ...{ class: "settings-view__dossier-active-badge" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            viewBox: "0 0 20 20",
            fill: "currentColor",
            width: "14",
            height: "14",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            'fill-rule': "evenodd",
            d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
            'clip-rule': "evenodd",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ class: "settings-view__dossier-name" },
        });
        (__VLS_ctx.selectedChar.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "settings-view__dossier-title" },
        });
        (__VLS_ctx.selectedChar.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__dossier-right" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__dossier-bio-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
            ...{ class: "settings-view__dossier-tagline" },
        });
        (__VLS_ctx.selectedChar.tagline);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "settings-view__dossier-bio" },
        });
        (__VLS_ctx.selectedChar.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__decks-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__decks-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
            ...{ class: "settings-view__decks-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "settings-view__decks-random-note" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__decks-grid" },
        });
        for (const [deck, dIdx] of __VLS_getVForSourceType((__VLS_ctx.selectedChar.decks))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (deck.id),
                ...{ class: "settings-view__deck-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "settings-view__deck-num" },
            });
            (dIdx + 1);
            (deck.archetype);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
                ...{ class: "settings-view__deck-name" },
            });
            (deck.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "settings-view__deck-desc" },
            });
            (deck.description);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "settings-view__signature-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "settings-view__signature-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "settings-view__signature-chip" },
        });
        (__VLS_ctx.selectedChar.video);
        var __VLS_16;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "settings-view__section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "settings-view__section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__settings-grid" },
    });
    /** @type {[typeof GlassPanel, typeof GlassPanel, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(GlassPanel, new GlassPanel({
        ...{ class: "settings-view__setting-group" },
        accent: "none",
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "settings-view__setting-group" },
        accent: "none",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "settings-view__setting-group-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__slider-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__slider-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "bgm-slider",
        ...{ class: "settings-view__slider-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__slider-val" },
    });
    (__VLS_ctx.settingsStore.bgmVolume);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.handleBgmInput) },
        id: "bgm-slider",
        type: "range",
        min: "0",
        max: "100",
        value: (__VLS_ctx.settingsStore.bgmVolume),
        ...{ class: "settings-view__range-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__slider-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__slider-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "sfx-slider",
        ...{ class: "settings-view__slider-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__slider-val" },
    });
    (__VLS_ctx.settingsStore.sfxVolume);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onInput: (__VLS_ctx.handleSfxInput) },
        id: "sfx-slider",
        type: "range",
        min: "0",
        max: "100",
        value: (__VLS_ctx.settingsStore.sfxVolume),
        ...{ class: "settings-view__range-input" },
    });
    var __VLS_19;
    /** @type {[typeof GlassPanel, typeof GlassPanel, ]} */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(GlassPanel, new GlassPanel({
        ...{ class: "settings-view__setting-group" },
        accent: "none",
    }));
    const __VLS_21 = __VLS_20({
        ...{ class: "settings-view__setting-group" },
        accent: "none",
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    __VLS_22.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "settings-view__setting-group-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__toggle-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__toggle-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__toggle-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__toggle-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "settings-view__switch" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.settingsStore.toggleSkipPreDuelVideo) },
        type: "checkbox",
        checked: (__VLS_ctx.settingsStore.skipPreDuelVideo),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__switch-slider" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__toggle-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "settings-view__toggle-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__toggle-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__toggle-desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: "settings-view__switch" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.settingsStore.toggleDevMode) },
        type: "checkbox",
        checked: (__VLS_ctx.settingsStore.devMode),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "settings-view__switch-slider" },
    });
    var __VLS_22;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
        ...{ class: "settings-view__footer-bar" },
    });
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        ...{ 'onClick': {} },
        variant: "ghost",
        size: "md",
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClick': {} },
        variant: "ghost",
        size: "md",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_26;
    let __VLS_27;
    let __VLS_28;
    const __VLS_29 = {
        onClick: (__VLS_ctx.handleReset)
    };
    __VLS_25.slots.default;
    var __VLS_25;
    /** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
        variant: "primary",
        size: "md",
        icon: "←",
        to: "/main-menu",
    }));
    const __VLS_31 = __VLS_30({
        variant: "primary",
        size: "md",
        icon: "←",
        to: "/main-menu",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    var __VLS_32;
}
/** @type {__VLS_StyleScopedClasses['settings-view']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__loading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__section']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__section-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-left']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-avatar-box']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-img']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__silhouette']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__silhouette-svg']} */ ;
/** @type {__VLS_StyleScopedClasses['character-card__placeholder-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-active-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-name']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-right']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-bio-block']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-tagline']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__dossier-bio']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__decks-block']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__decks-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__decks-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__decks-random-note']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__decks-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__deck-card']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__deck-num']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__deck-name']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__deck-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__signature-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__signature-label']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__signature-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__section']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__settings-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__setting-group']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__setting-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-label']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-val']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__range-input']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-header']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-label']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__slider-val']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__range-input']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__setting-group']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__setting-group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-info']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-label']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__switch']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__switch-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-info']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-label']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__toggle-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__switch']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__switch-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-view__footer-bar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            GlassPanel: GlassPanel,
            YugiButton: YugiButton,
            LoadingSpinner: LoadingSpinner,
            OpponentCarousel: OpponentCarousel,
            settingsStore: settingsStore,
            avatarFailed: avatarFailed,
            selectedChar: selectedChar,
            handleSelectOpponent: handleSelectOpponent,
            handleFilterChange: handleFilterChange,
            handleBgmInput: handleBgmInput,
            handleSfxInput: handleSfxInput,
            handleReset: handleReset,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
