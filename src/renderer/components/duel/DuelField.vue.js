import FieldZoneSlot from './FieldZoneSlot.vue';
import DeckStack from './DeckStack.vue';
import Tooltip from '../common/Tooltip.vue';
const props = withDefaults(defineProps(), {
    extraMonsterZones: () => [null, null],
    userPlayerId: 0,
    opponentPlayerId: 1,
    getTargetInfo: null,
    isPromptActive: false,
});
const emit = defineEmits();
function getSlotTarget(controller, location, sequence) {
    if (props.getTargetInfo) {
        return props.getTargetInfo(controller, location, sequence);
    }
    return null;
}
function onStackClick(stackType, controller) {
    let location = 1;
    if (stackType === 'extra')
        location = 64;
    else if (stackType === 'graveyard')
        location = 16;
    else if (stackType === 'banished')
        location = 32;
    const target = getSlotTarget(controller, location, 0);
    if (target && target.isSelectable) {
        emit('click-target', target);
        return;
    }
    emit('inspect-stack', stackType, controller);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    extraMonsterZones: () => [null, null],
    userPlayerId: 0,
    opponentPlayerId: 1,
    getTargetInfo: null,
    isPromptActive: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "duel-field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "arena-floor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "arena-center-circle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "center-rune-ring" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "center-divider-line" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-half field-half--opponent" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mate-slot mate-slot--opponent" },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Opponent Mate Slot (Reserved for future release)",
    position: "bottom",
}));
const __VLS_1 = __VLS_0({
    content: "Opponent Mate Slot (Reserved for future release)",
    position: "bottom",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mate-pedestal" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "mate-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "mate-label" },
});
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-row field-row--back" },
});
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "banished",
    player: "ai",
    count: (__VLS_ctx.opponentState.banished.length),
    topCard: (__VLS_ctx.opponentState.banished[0] || null),
    label: "BANISHED",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 32, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_4 = __VLS_3({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "banished",
    player: "ai",
    count: (__VLS_ctx.opponentState.banished.length),
    topCard: (__VLS_ctx.opponentState.banished[0] || null),
    label: "BANISHED",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 32, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_3));
let __VLS_6;
let __VLS_7;
let __VLS_8;
const __VLS_9 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_10 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('banished', __VLS_ctx.opponentPlayerId);
    }
};
var __VLS_5;
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "deck",
    player: "ai",
    count: (__VLS_ctx.opponentState.deckCount),
    label: "DECK",
    ...{ class: "deck-stack--ai-deck" },
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 1, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_12 = __VLS_11({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "deck",
    player: "ai",
    count: (__VLS_ctx.opponentState.deckCount),
    label: "DECK",
    ...{ class: "deck-stack--ai-deck" },
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 1, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
let __VLS_14;
let __VLS_15;
let __VLS_16;
const __VLS_17 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_18 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('deck', __VLS_ctx.opponentPlayerId);
    }
};
var __VLS_13;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "zone-group zone-group--stz" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pendulum-jewel pendulum-jewel--left" },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Opponent Left Pendulum Scale (Reserved for future release)",
    position: "top",
}));
const __VLS_20 = __VLS_19({
    content: "Opponent Left Pendulum Scale (Reserved for future release)",
    position: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scale-orb scale-orb--blue" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "scale-num" },
});
var __VLS_21;
for (const [slot, idx] of __VLS_getVForSourceType((__VLS_ctx.opponentState.spellTrapZones))) {
    /** @type {[typeof FieldZoneSlot, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`ai-st-${idx}`),
        zoneType: "spell-trap",
        zoneIndex: (idx),
        zoneLabel: (`S${idx + 1}`),
        zoneSubLabel: "SPELL/TRAP",
        player: "ai",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 8, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }));
    const __VLS_23 = __VLS_22({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`ai-st-${idx}`),
        zoneType: "spell-trap",
        zoneIndex: (idx),
        zoneLabel: (`S${idx + 1}`),
        zoneSubLabel: "SPELL/TRAP",
        player: "ai",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 8, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_25;
    let __VLS_26;
    let __VLS_27;
    const __VLS_28 = {
        onHoverCard: (...[$event]) => {
            __VLS_ctx.$emit('hover-card', $event);
        }
    };
    const __VLS_29 = {
        onClickCard: ((card, ev, targetInfo) => __VLS_ctx.$emit('click-card', card, ev, targetInfo))
    };
    const __VLS_30 = {
        onClickTarget: (...[$event]) => {
            __VLS_ctx.$emit('click-target', $event);
        }
    };
    var __VLS_24;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pendulum-jewel pendulum-jewel--right" },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Opponent Right Pendulum Scale (Reserved for future release)",
    position: "top",
}));
const __VLS_32 = __VLS_31({
    content: "Opponent Right Pendulum Scale (Reserved for future release)",
    position: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scale-orb scale-orb--red" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "scale-num" },
});
var __VLS_33;
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "extra",
    player: "ai",
    count: (__VLS_ctx.opponentState.extraDeckCount),
    label: "EX DECK",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 64, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_35 = __VLS_34({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "extra",
    player: "ai",
    count: (__VLS_ctx.opponentState.extraDeckCount),
    label: "EX DECK",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 64, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
let __VLS_37;
let __VLS_38;
let __VLS_39;
const __VLS_40 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_41 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('extra', __VLS_ctx.opponentPlayerId);
    }
};
var __VLS_36;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-row field-row--front" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "zone-spacer" },
});
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "graveyard",
    player: "ai",
    count: (__VLS_ctx.opponentState.graveyard.length),
    topCard: (__VLS_ctx.opponentState.graveyard[0] || null),
    label: "GRAVEYARD",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 16, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_43 = __VLS_42({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "graveyard",
    player: "ai",
    count: (__VLS_ctx.opponentState.graveyard.length),
    topCard: (__VLS_ctx.opponentState.graveyard[0] || null),
    label: "GRAVEYARD",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 16, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_45;
let __VLS_46;
let __VLS_47;
const __VLS_48 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_49 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('graveyard', __VLS_ctx.opponentPlayerId);
    }
};
var __VLS_44;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "zone-group zone-group--mmz" },
});
for (const [slot, idx] of __VLS_getVForSourceType((__VLS_ctx.opponentState.monsterZones))) {
    /** @type {[typeof FieldZoneSlot, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`ai-mz-${idx}`),
        zoneType: "monster",
        zoneIndex: (idx),
        zoneLabel: (`M${idx + 1}`),
        zoneSubLabel: "MONSTER",
        player: "ai",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 4, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }));
    const __VLS_51 = __VLS_50({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`ai-mz-${idx}`),
        zoneType: "monster",
        zoneIndex: (idx),
        zoneLabel: (`M${idx + 1}`),
        zoneSubLabel: "MONSTER",
        player: "ai",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 4, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    let __VLS_53;
    let __VLS_54;
    let __VLS_55;
    const __VLS_56 = {
        onHoverCard: (...[$event]) => {
            __VLS_ctx.$emit('hover-card', $event);
        }
    };
    const __VLS_57 = {
        onClickCard: ((card, ev, targetInfo) => __VLS_ctx.$emit('click-card', card, ev, targetInfo))
    };
    const __VLS_58 = {
        onClickTarget: (...[$event]) => {
            __VLS_ctx.$emit('click-target', $event);
        }
    };
    var __VLS_52;
}
/** @type {[typeof FieldZoneSlot, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    ...{ 'onClickTarget': {} },
    zoneType: "field",
    zoneLabel: "FIELD",
    zoneSubLabel: "SPELL",
    player: "ai",
    card: (__VLS_ctx.opponentState.fieldZone),
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 256, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_60 = __VLS_59({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    ...{ 'onClickTarget': {} },
    zoneType: "field",
    zoneLabel: "FIELD",
    zoneSubLabel: "SPELL",
    player: "ai",
    card: (__VLS_ctx.opponentState.fieldZone),
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.opponentPlayerId, 256, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
let __VLS_62;
let __VLS_63;
let __VLS_64;
const __VLS_65 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_66 = {
    onClickCard: ((card, ev, targetInfo) => __VLS_ctx.$emit('click-card', card, ev, targetInfo))
};
const __VLS_67 = {
    onClickTarget: (...[$event]) => {
        __VLS_ctx.$emit('click-target', $event);
    }
};
var __VLS_61;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-center-divider" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "emz-container" },
});
if (false) {
    /** @type {[typeof FieldZoneSlot, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
        ...{ 'onHoverCard': {} },
        zoneType: "extra-monster",
        zoneIndex: (0),
        zoneLabel: "EMZ 1",
        zoneSubLabel: "EXTRA",
        player: "user",
        card: (__VLS_ctx.extraMonsterZones[0] || null),
        isInert: (true),
        inertTooltip: "Extra Monster Zone 1 (Reserved for future release)",
    }));
    const __VLS_69 = __VLS_68({
        ...{ 'onHoverCard': {} },
        zoneType: "extra-monster",
        zoneIndex: (0),
        zoneLabel: "EMZ 1",
        zoneSubLabel: "EXTRA",
        player: "user",
        card: (__VLS_ctx.extraMonsterZones[0] || null),
        isInert: (true),
        inertTooltip: "Extra Monster Zone 1 (Reserved for future release)",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_71;
    let __VLS_72;
    let __VLS_73;
    const __VLS_74 = {
        onHoverCard: (...[$event]) => {
            if (!(false))
                return;
            __VLS_ctx.$emit('hover-card', $event);
        }
    };
    var __VLS_70;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "center-hologram-emblem" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "emblem-core" },
});
if (false) {
    /** @type {[typeof FieldZoneSlot, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
        ...{ 'onHoverCard': {} },
        zoneType: "extra-monster",
        zoneIndex: (1),
        zoneLabel: "EMZ 2",
        zoneSubLabel: "EXTRA",
        player: "user",
        card: (__VLS_ctx.extraMonsterZones[1] || null),
        isInert: (true),
        inertTooltip: "Extra Monster Zone 2 (Reserved for future release)",
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onHoverCard': {} },
        zoneType: "extra-monster",
        zoneIndex: (1),
        zoneLabel: "EMZ 2",
        zoneSubLabel: "EXTRA",
        player: "user",
        card: (__VLS_ctx.extraMonsterZones[1] || null),
        isInert: (true),
        inertTooltip: "Extra Monster Zone 2 (Reserved for future release)",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_78;
    let __VLS_79;
    let __VLS_80;
    const __VLS_81 = {
        onHoverCard: (...[$event]) => {
            if (!(false))
                return;
            __VLS_ctx.$emit('hover-card', $event);
        }
    };
    var __VLS_77;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-half field-half--user" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-row field-row--front" },
});
/** @type {[typeof FieldZoneSlot, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    ...{ 'onClickTarget': {} },
    zoneType: "field",
    zoneLabel: "FIELD",
    zoneSubLabel: "SPELL",
    player: "user",
    card: (__VLS_ctx.userState.fieldZone),
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 256, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_83 = __VLS_82({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickCard': {} },
    ...{ 'onClickTarget': {} },
    zoneType: "field",
    zoneLabel: "FIELD",
    zoneSubLabel: "SPELL",
    player: "user",
    card: (__VLS_ctx.userState.fieldZone),
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 256, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_85;
let __VLS_86;
let __VLS_87;
const __VLS_88 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_89 = {
    onClickCard: ((card, ev, targetInfo) => __VLS_ctx.$emit('click-card', card, ev, targetInfo))
};
const __VLS_90 = {
    onClickTarget: (...[$event]) => {
        __VLS_ctx.$emit('click-target', $event);
    }
};
var __VLS_84;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "zone-group zone-group--mmz" },
});
for (const [slot, idx] of __VLS_getVForSourceType((__VLS_ctx.userState.monsterZones))) {
    /** @type {[typeof FieldZoneSlot, ]} */ ;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`u-mz-${idx}`),
        zoneType: "monster",
        zoneIndex: (idx),
        zoneLabel: (`M${idx + 1}`),
        zoneSubLabel: "MONSTER",
        player: "user",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 4, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }));
    const __VLS_92 = __VLS_91({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`u-mz-${idx}`),
        zoneType: "monster",
        zoneIndex: (idx),
        zoneLabel: (`M${idx + 1}`),
        zoneSubLabel: "MONSTER",
        player: "user",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 4, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    let __VLS_94;
    let __VLS_95;
    let __VLS_96;
    const __VLS_97 = {
        onHoverCard: (...[$event]) => {
            __VLS_ctx.$emit('hover-card', $event);
        }
    };
    const __VLS_98 = {
        onClickCard: ((card, ev, targetInfo) => __VLS_ctx.$emit('click-card', card, ev, targetInfo))
    };
    const __VLS_99 = {
        onClickTarget: (...[$event]) => {
            __VLS_ctx.$emit('click-target', $event);
        }
    };
    var __VLS_93;
}
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "graveyard",
    player: "user",
    count: (__VLS_ctx.userState.graveyard.length),
    topCard: (__VLS_ctx.userState.graveyard[0] || null),
    label: "GRAVEYARD",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 16, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_101 = __VLS_100({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "graveyard",
    player: "user",
    count: (__VLS_ctx.userState.graveyard.length),
    topCard: (__VLS_ctx.userState.graveyard[0] || null),
    label: "GRAVEYARD",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 16, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
let __VLS_103;
let __VLS_104;
let __VLS_105;
const __VLS_106 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_107 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('graveyard', __VLS_ctx.userPlayerId);
    }
};
var __VLS_102;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "zone-spacer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field-row field-row--back" },
});
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "extra",
    player: "user",
    count: (__VLS_ctx.userState.extraDeckCount),
    label: "EX DECK",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 64, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_109 = __VLS_108({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "extra",
    player: "user",
    count: (__VLS_ctx.userState.extraDeckCount),
    label: "EX DECK",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 64, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
let __VLS_111;
let __VLS_112;
let __VLS_113;
const __VLS_114 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_115 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('extra', __VLS_ctx.userPlayerId);
    }
};
var __VLS_110;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "zone-group zone-group--stz" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pendulum-jewel pendulum-jewel--left" },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Your Left Pendulum Scale (Reserved for future release)",
    position: "top",
}));
const __VLS_117 = __VLS_116({
    content: "Your Left Pendulum Scale (Reserved for future release)",
    position: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
__VLS_118.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scale-orb scale-orb--blue" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "scale-num" },
});
var __VLS_118;
for (const [slot, idx] of __VLS_getVForSourceType((__VLS_ctx.userState.spellTrapZones))) {
    /** @type {[typeof FieldZoneSlot, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(FieldZoneSlot, new FieldZoneSlot({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`u-st-${idx}`),
        zoneType: "spell-trap",
        zoneIndex: (idx),
        zoneLabel: (`S${idx + 1}`),
        zoneSubLabel: "SPELL/TRAP",
        player: "user",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 8, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }));
    const __VLS_120 = __VLS_119({
        ...{ 'onHoverCard': {} },
        ...{ 'onClickCard': {} },
        ...{ 'onClickTarget': {} },
        key: (`u-st-${idx}`),
        zoneType: "spell-trap",
        zoneIndex: (idx),
        zoneLabel: (`S${idx + 1}`),
        zoneSubLabel: "SPELL/TRAP",
        player: "user",
        card: (slot),
        targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 8, idx)),
        isPromptActive: (__VLS_ctx.isPromptActive),
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
    let __VLS_122;
    let __VLS_123;
    let __VLS_124;
    const __VLS_125 = {
        onHoverCard: (...[$event]) => {
            __VLS_ctx.$emit('hover-card', $event);
        }
    };
    const __VLS_126 = {
        onClickCard: ((card, ev, targetInfo) => __VLS_ctx.$emit('click-card', card, ev, targetInfo))
    };
    const __VLS_127 = {
        onClickTarget: (...[$event]) => {
            __VLS_ctx.$emit('click-target', $event);
        }
    };
    var __VLS_121;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pendulum-jewel pendulum-jewel--right" },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Your Right Pendulum Scale (Reserved for future release)",
    position: "top",
}));
const __VLS_129 = __VLS_128({
    content: "Your Right Pendulum Scale (Reserved for future release)",
    position: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
__VLS_130.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "scale-orb scale-orb--red" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "scale-num" },
});
var __VLS_130;
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "deck",
    player: "user",
    count: (__VLS_ctx.userState.deckCount),
    label: "DECK",
    ...{ class: "deck-stack--user-deck" },
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 1, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_132 = __VLS_131({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "deck",
    player: "user",
    count: (__VLS_ctx.userState.deckCount),
    label: "DECK",
    ...{ class: "deck-stack--user-deck" },
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 1, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
let __VLS_134;
let __VLS_135;
let __VLS_136;
const __VLS_137 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_138 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('deck', __VLS_ctx.userPlayerId);
    }
};
var __VLS_133;
/** @type {[typeof DeckStack, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(DeckStack, new DeckStack({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "banished",
    player: "user",
    count: (__VLS_ctx.userState.banished.length),
    topCard: (__VLS_ctx.userState.banished[0] || null),
    label: "BANISHED",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 32, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}));
const __VLS_140 = __VLS_139({
    ...{ 'onHoverCard': {} },
    ...{ 'onClickStack': {} },
    type: "banished",
    player: "user",
    count: (__VLS_ctx.userState.banished.length),
    topCard: (__VLS_ctx.userState.banished[0] || null),
    label: "BANISHED",
    targetInfo: (__VLS_ctx.getSlotTarget(__VLS_ctx.userPlayerId, 32, 0)),
    isPromptActive: (__VLS_ctx.isPromptActive),
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
let __VLS_142;
let __VLS_143;
let __VLS_144;
const __VLS_145 = {
    onHoverCard: (...[$event]) => {
        __VLS_ctx.$emit('hover-card', $event);
    }
};
const __VLS_146 = {
    onClickStack: (...[$event]) => {
        __VLS_ctx.onStackClick('banished', __VLS_ctx.userPlayerId);
    }
};
var __VLS_141;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mate-slot mate-slot--user" },
});
/** @type {[typeof Tooltip, typeof Tooltip, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(Tooltip, new Tooltip({
    content: "Your Mate Slot (Reserved for future release)",
    position: "top",
}));
const __VLS_148 = __VLS_147({
    content: "Your Mate Slot (Reserved for future release)",
    position: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "mate-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "mate-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "mate-label" },
});
var __VLS_149;
/** @type {__VLS_StyleScopedClasses['duel-field']} */ ;
/** @type {__VLS_StyleScopedClasses['arena-floor']} */ ;
/** @type {__VLS_StyleScopedClasses['arena-center-circle']} */ ;
/** @type {__VLS_StyleScopedClasses['center-rune-ring']} */ ;
/** @type {__VLS_StyleScopedClasses['center-divider-line']} */ ;
/** @type {__VLS_StyleScopedClasses['field-half']} */ ;
/** @type {__VLS_StyleScopedClasses['field-half--opponent']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-slot']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-slot--opponent']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-pedestal']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-label']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row--back']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-stack--ai-deck']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group--stz']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel--left']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb--blue']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-num']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel--right']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb--red']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-num']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row--front']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-spacer']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group--mmz']} */ ;
/** @type {__VLS_StyleScopedClasses['field-center-divider']} */ ;
/** @type {__VLS_StyleScopedClasses['emz-container']} */ ;
/** @type {__VLS_StyleScopedClasses['center-hologram-emblem']} */ ;
/** @type {__VLS_StyleScopedClasses['emblem-core']} */ ;
/** @type {__VLS_StyleScopedClasses['field-half']} */ ;
/** @type {__VLS_StyleScopedClasses['field-half--user']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row--front']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group--mmz']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-spacer']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row']} */ ;
/** @type {__VLS_StyleScopedClasses['field-row--back']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-group--stz']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel--left']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb--blue']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-num']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel']} */ ;
/** @type {__VLS_StyleScopedClasses['pendulum-jewel--right']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-orb--red']} */ ;
/** @type {__VLS_StyleScopedClasses['scale-num']} */ ;
/** @type {__VLS_StyleScopedClasses['deck-stack--user-deck']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-slot']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-slot--user']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-container']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mate-label']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            FieldZoneSlot: FieldZoneSlot,
            DeckStack: DeckStack,
            Tooltip: Tooltip,
            getSlotTarget: getSlotTarget,
            onStackClick: onStackClick,
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
