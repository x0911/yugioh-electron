import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../../stores/settingsStore.js';
import YugiModal from '../common/YugiModal.vue';
import YugiButton from '../common/YugiButton.vue';
const __VLS_props = defineProps();
const emit = defineEmits();
const router = useRouter();
const settingsStore = useSettingsStore();
const showSurrenderConfirm = ref(false);
function onModelValueUpdate(val) {
    if (!val) {
        emit('close');
    }
}
function onBgmInput(e) {
    const target = e.target;
    settingsStore.setBgmVolume(parseInt(target.value, 10));
}
function onSfxInput(e) {
    const target = e.target;
    settingsStore.setSfxVolume(parseInt(target.value, 10));
}
function onRestartClick() {
    emit('restart');
    emit('close');
}
async function confirmSurrender() {
    showSurrenderConfirm.value = false;
    emit('surrender');
    emit('close');
    await router.push('/main-menu');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
/** @type {[typeof YugiModal, typeof YugiModal, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(YugiModal, new YugiModal({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.isOpen),
    title: "⚔️ Ancient Duel Arena — Menu",
    cancelable: (true),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.isOpen),
    title: "⚔️ Ancient Duel Arena — Menu",
    cancelable: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    'onUpdate:modelValue': (__VLS_ctx.onModelValueUpdate)
};
const __VLS_7 = {
    onClose: (...[$event]) => {
        __VLS_ctx.$emit('close');
    }
};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "duel-menu-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-actions" },
});
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    ...{ 'onClick': {} },
    variant: "primary",
    ...{ class: "menu-btn" },
}));
const __VLS_9 = __VLS_8({
    ...{ 'onClick': {} },
    variant: "primary",
    ...{ class: "menu-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_11;
let __VLS_12;
let __VLS_13;
const __VLS_14 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$emit('close');
    }
};
__VLS_10.slots.default;
var __VLS_10;
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    ...{ 'onClick': {} },
    variant: "secondary",
    ...{ class: "menu-btn" },
}));
const __VLS_16 = __VLS_15({
    ...{ 'onClick': {} },
    variant: "secondary",
    ...{ class: "menu-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
let __VLS_18;
let __VLS_19;
let __VLS_20;
const __VLS_21 = {
    onClick: (__VLS_ctx.onRestartClick)
};
__VLS_17.slots.default;
var __VLS_17;
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    ...{ 'onClick': {} },
    variant: "danger",
    ...{ class: "menu-btn" },
}));
const __VLS_23 = __VLS_22({
    ...{ 'onClick': {} },
    variant: "danger",
    ...{ class: "menu-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
let __VLS_25;
let __VLS_26;
let __VLS_27;
const __VLS_28 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showSurrenderConfirm = true;
    }
};
__VLS_24.slots.default;
var __VLS_24;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-audio-section glass-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "setting-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slider-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onBgmInput) },
    type: "range",
    min: "0",
    max: "100",
    value: (__VLS_ctx.settingsStore.bgmVolume),
    ...{ class: "volume-slider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "volume-val" },
});
(__VLS_ctx.settingsStore.bgmVolume);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "setting-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "slider-control" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onInput: (__VLS_ctx.onSfxInput) },
    type: "range",
    min: "0",
    max: "100",
    value: (__VLS_ctx.settingsStore.sfxVolume),
    ...{ class: "volume-slider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "volume-val" },
});
(__VLS_ctx.settingsStore.sfxVolume);
var __VLS_2;
/** @type {[typeof YugiModal, typeof YugiModal, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(YugiModal, new YugiModal({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showSurrenderConfirm),
    title: "🏳️ Concede Match?",
    cancelable: (true),
}));
const __VLS_30 = __VLS_29({
    ...{ 'onUpdate:modelValue': {} },
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showSurrenderConfirm),
    title: "🏳️ Concede Match?",
    cancelable: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    'onUpdate:modelValue': (...[$event]) => {
        __VLS_ctx.showSurrenderConfirm = $event;
    }
};
const __VLS_36 = {
    onClose: (...[$event]) => {
        __VLS_ctx.showSurrenderConfirm = false;
    }
};
__VLS_31.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "surrender-dialog" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "surrender-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "surrender-actions" },
});
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    ...{ 'onClick': {} },
    variant: "ghost",
}));
const __VLS_38 = __VLS_37({
    ...{ 'onClick': {} },
    variant: "ghost",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showSurrenderConfirm = false;
    }
};
__VLS_39.slots.default;
var __VLS_39;
/** @type {[typeof YugiButton, typeof YugiButton, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(YugiButton, new YugiButton({
    ...{ 'onClick': {} },
    variant: "danger",
}));
const __VLS_45 = __VLS_44({
    ...{ 'onClick': {} },
    variant: "danger",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
let __VLS_47;
let __VLS_48;
let __VLS_49;
const __VLS_50 = {
    onClick: (__VLS_ctx.confirmSurrender)
};
__VLS_46.slots.default;
var __VLS_46;
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['duel-menu-content']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-audio-section']} */ ;
/** @type {__VLS_StyleScopedClasses['glass-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-row']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-control']} */ ;
/** @type {__VLS_StyleScopedClasses['volume-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['volume-val']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-row']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-label']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-control']} */ ;
/** @type {__VLS_StyleScopedClasses['volume-slider']} */ ;
/** @type {__VLS_StyleScopedClasses['volume-val']} */ ;
/** @type {__VLS_StyleScopedClasses['surrender-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['surrender-text']} */ ;
/** @type {__VLS_StyleScopedClasses['surrender-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            YugiModal: YugiModal,
            YugiButton: YugiButton,
            settingsStore: settingsStore,
            showSurrenderConfirm: showSurrenderConfirm,
            onModelValueUpdate: onModelValueUpdate,
            onBgmInput: onBgmInput,
            onSfxInput: onSfxInput,
            onRestartClick: onRestartClick,
            confirmSurrender: confirmSurrender,
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
