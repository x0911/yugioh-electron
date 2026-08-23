<template>
  <div class="duel-field">
    <!-- Obsidian Arena Floor Texture & Center Magic Circle -->
    <div
      class="arena-floor"
      :class="{ 'arena-floor--has-field-spell': Boolean(activeFieldSpellArtUrl) }"
    >
      <!-- Dynamic Field Spell Artwork Realm Cover -->
      <Transition name="field-spell-fade">
        <div
          v-if="activeFieldSpellArtUrl"
          :key="activeFieldSpellArtUrl"
          class="arena-floor__field-spell-layer"
          :style="{ backgroundImage: `url('${activeFieldSpellArtUrl}')` }"
        >
          <!-- Darken Overlay Above Artwork -->
          <div class="arena-floor__field-spell-darken-overlay"></div>
        </div>
      </Transition>

      <div class="arena-center-circle">
        <div class="center-rune-ring"></div>
        <div class="center-divider-line"></div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- OPPONENT FIELD (Top Mirrored Half) -->
    <!-- ================================================================= -->
    <div class="field-half field-half--opponent">
      <!-- Opponent Mate Slot (Inert Placeholder) -->
      <div class="mate-slot mate-slot--opponent">
        <Tooltip content="Opponent Mate Slot (Reserved for future release)" position="bottom">
          <div class="mate-pedestal">
            <span class="mate-icon">🔮</span>
            <span class="mate-label">MATE</span>
          </div>
        </Tooltip>
      </div>

      <!-- Opponent Back Row (Banished, Deck, 5 S/T Zones, Extra Deck) -->
      <div class="field-row field-row--back">
        <!-- Opponent Banished Zone -->
        <DeckStack
          type="banished"
          player="ai"
          :count="opponentState.banished.length"
          :top-card="opponentState.banished[0] || null"
          label="BANISHED"
          :target-info="getSlotTarget(opponentPlayerId, 32, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('banished', opponentPlayerId)"
        />

        <!-- Opponent Main Deck Zone -->
        <DeckStack
          type="deck"
          player="ai"
          :count="opponentState.deckCount"
          label="DECK"
          class="deck-stack--ai-deck"
          :target-info="getSlotTarget(opponentPlayerId, 1, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('deck', opponentPlayerId)"
        />

        <!-- Opponent 5 Spell & Trap Zones (Mirrored, with Pendulum Scales on 1 & 5) -->
        <div class="zone-group zone-group--stz">
          <div class="pendulum-jewel pendulum-jewel--left">
            <Tooltip
              content="Opponent Left Pendulum Scale (Reserved for future release)"
              position="top"
            >
              <div class="scale-orb scale-orb--blue">
                <span class="scale-num">1</span>
              </div>
            </Tooltip>
          </div>

          <FieldZoneSlot
            v-for="(slot, idx) in opponentState.spellTrapZones"
            :key="`ai-st-${idx}`"
            zone-type="spell-trap"
            :zone-index="idx"
            :zone-label="`S${idx + 1}`"
            zone-sub-label="SPELL/TRAP"
            player="ai"
            :card="slot"
            :target-info="getSlotTarget(opponentPlayerId, 8, idx)"
            :is-prompt-active="isPromptActive"
            @hover-card="$emit('hover-card', $event)"
            @click-card="(card, ev, targetInfo) => $emit('click-card', card, ev, targetInfo)"
            @click-target="$emit('click-target', $event)"
          />

          <div class="pendulum-jewel pendulum-jewel--right">
            <Tooltip
              content="Opponent Right Pendulum Scale (Reserved for future release)"
              position="top"
            >
              <div class="scale-orb scale-orb--red">
                <span class="scale-num">8</span>
              </div>
            </Tooltip>
          </div>
        </div>

        <!-- Opponent Extra Deck Zone -->
        <DeckStack
          type="extra"
          player="ai"
          :count="opponentState.extraDeckCount"
          label="EX DECK"
          :target-info="getSlotTarget(opponentPlayerId, 64, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('extra', opponentPlayerId)"
        />
      </div>

      <!-- Opponent Front Row (Spacer, Graveyard, 5 Monster Zones, Field Zone) -->
      <div class="field-row field-row--front">
        <!-- Opponent Alignment Spacer (Col 0 to balance 8-column layout) -->
        <div class="zone-spacer" />

        <!-- Opponent Graveyard Zone -->
        <DeckStack
          type="graveyard"
          player="ai"
          :count="opponentState.graveyard.length"
          :top-card="opponentState.graveyard[0] || null"
          label="GRAVEYARD"
          :target-info="getSlotTarget(opponentPlayerId, 16, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('graveyard', opponentPlayerId)"
        />

        <!-- Opponent 5 Main Monster Zones -->
        <div class="zone-group zone-group--mmz">
          <FieldZoneSlot
            v-for="(slot, idx) in opponentState.monsterZones"
            :key="`ai-mz-${idx}`"
            zone-type="monster"
            :zone-index="idx"
            :zone-label="`M${idx + 1}`"
            zone-sub-label="MONSTER"
            player="ai"
            :card="slot"
            :target-info="getSlotTarget(opponentPlayerId, 4, idx)"
            :is-prompt-active="isPromptActive"
            @hover-card="$emit('hover-card', $event)"
            @click-card="(card, ev, targetInfo) => $emit('click-card', card, ev, targetInfo)"
            @click-target="$emit('click-target', $event)"
          />
        </div>

        <!-- Opponent Field Zone -->
        <FieldZoneSlot
          zone-type="field"
          zone-label="FIELD"
          zone-sub-label="SPELL"
          player="ai"
          :card="opponentState.fieldZone"
          :target-info="getSlotTarget(opponentPlayerId, 256, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-card="(card, ev, targetInfo) => $emit('click-card', card, ev, targetInfo)"
          @click-target="$emit('click-target', $event)"
        />
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- CENTER DIVIDE (2 Extra Monster Zones — Visually Inert in v1) -->
    <!-- ================================================================= -->
    <div class="field-center-divider">
      <div class="emz-container">
        <!-- EMZ 1 (Above MMZ 2 / Col 2) -->
        <!-- Hidden by default: reserved for future release -->
        <FieldZoneSlot
          v-if="false"
          zone-type="extra-monster"
          :zone-index="0"
          zone-label="EMZ 1"
          zone-sub-label="EXTRA"
          player="user"
          :card="extraMonsterZones[0] || null"
          :is-inert="true"
          inert-tooltip="Extra Monster Zone 1 (Reserved for future release)"
          @hover-card="$emit('hover-card', $event)"
        />

        <!-- Arena Center Hologram Emblem -->
        <div class="center-hologram-emblem">
          <div class="emblem-core"></div>
        </div>

        <!-- EMZ 2 (Above MMZ 4 / Col 4) -->
        <!-- Hidden by default: reserved for future release -->
        <FieldZoneSlot
          v-if="false"
          zone-type="extra-monster"
          :zone-index="1"
          zone-label="EMZ 2"
          zone-sub-label="EXTRA"
          player="user"
          :card="extraMonsterZones[1] || null"
          :is-inert="true"
          inert-tooltip="Extra Monster Zone 2 (Reserved for future release)"
          @hover-card="$emit('hover-card', $event)"
        />
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- USER FIELD (Bottom Half) -->
    <!-- ================================================================= -->
    <div class="field-half field-half--user">
      <!-- User Front Row (Field Zone, 5 Monster Zones, Graveyard, Spacer) -->
      <div class="field-row field-row--front">
        <!-- User Field Zone -->
        <FieldZoneSlot
          zone-type="field"
          zone-label="FIELD"
          zone-sub-label="SPELL"
          player="user"
          :card="userState.fieldZone"
          :target-info="getSlotTarget(userPlayerId, 256, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-card="(card, ev, targetInfo) => $emit('click-card', card, ev, targetInfo)"
          @click-target="$emit('click-target', $event)"
        />

        <!-- User 5 Main Monster Zones -->
        <div class="zone-group zone-group--mmz">
          <FieldZoneSlot
            v-for="(slot, idx) in userState.monsterZones"
            :key="`u-mz-${idx}`"
            zone-type="monster"
            :zone-index="idx"
            :zone-label="`M${idx + 1}`"
            zone-sub-label="MONSTER"
            player="user"
            :card="slot"
            :target-info="getSlotTarget(userPlayerId, 4, idx)"
            :is-prompt-active="isPromptActive"
            @hover-card="$emit('hover-card', $event)"
            @click-card="(card, ev, targetInfo) => $emit('click-card', card, ev, targetInfo)"
            @click-target="$emit('click-target', $event)"
          />
        </div>

        <!-- User Graveyard Zone -->
        <DeckStack
          type="graveyard"
          player="user"
          :count="userState.graveyard.length"
          :top-card="userState.graveyard[0] || null"
          label="GRAVEYARD"
          :target-info="getSlotTarget(userPlayerId, 16, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('graveyard', userPlayerId)"
        />

        <!-- User Alignment Spacer (Col 7 to balance 8-column layout) -->
        <div class="zone-spacer" />
      </div>

      <!-- User Back Row (Extra Deck, 5 S/T Zones, Main Deck, Banished) -->
      <div class="field-row field-row--back">
        <!-- User Extra Deck Zone -->
        <DeckStack
          type="extra"
          player="user"
          :count="userState.extraDeckCount"
          label="EX DECK"
          :target-info="getSlotTarget(userPlayerId, 64, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('extra', userPlayerId)"
        />

        <!-- User 5 Spell & Trap Zones (with Pendulum Scales on 1 & 5) -->
        <div class="zone-group zone-group--stz">
          <div class="pendulum-jewel pendulum-jewel--left">
            <Tooltip
              content="Your Left Pendulum Scale (Reserved for future release)"
              position="top"
            >
              <div class="scale-orb scale-orb--blue">
                <span class="scale-num">1</span>
              </div>
            </Tooltip>
          </div>

          <FieldZoneSlot
            v-for="(slot, idx) in userState.spellTrapZones"
            :key="`u-st-${idx}`"
            zone-type="spell-trap"
            :zone-index="idx"
            :zone-label="`S${idx + 1}`"
            zone-sub-label="SPELL/TRAP"
            player="user"
            :card="slot"
            :target-info="getSlotTarget(userPlayerId, 8, idx)"
            :is-prompt-active="isPromptActive"
            @hover-card="$emit('hover-card', $event)"
            @click-card="(card, ev, targetInfo) => $emit('click-card', card, ev, targetInfo)"
            @click-target="$emit('click-target', $event)"
          />

          <div class="pendulum-jewel pendulum-jewel--right">
            <Tooltip
              content="Your Right Pendulum Scale (Reserved for future release)"
              position="top"
            >
              <div class="scale-orb scale-orb--red">
                <span class="scale-num">8</span>
              </div>
            </Tooltip>
          </div>
        </div>

        <!-- User Main Deck Zone -->
        <DeckStack
          type="deck"
          player="user"
          :count="userState.deckCount"
          label="DECK"
          class="deck-stack--user-deck"
          :target-info="getSlotTarget(userPlayerId, 1, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('deck', userPlayerId)"
        />

        <!-- User Banished Zone -->
        <DeckStack
          type="banished"
          player="user"
          :count="userState.banished.length"
          :top-card="userState.banished[0] || null"
          label="BANISHED"
          :target-info="getSlotTarget(userPlayerId, 32, 0)"
          :is-prompt-active="isPromptActive"
          @hover-card="$emit('hover-card', $event)"
          @click-stack="onStackClick('banished', userPlayerId)"
        />
      </div>

      <!-- User Mate Slot (Inert Placeholder) -->
      <div class="mate-slot mate-slot--user">
        <Tooltip content="Your Mate Slot (Reserved for future release)" position="top">
          <div class="mate-container">
            <span class="mate-icon">👑</span>
            <span class="mate-label">MATE</span>
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard, PlayerFieldState } from '../../../shared/types/field.js';
import type { TargetInfo } from '../../stores/duelStore.js';
import { getCardImageUrl } from '../../utils/media.js';
import FieldZoneSlot from './FieldZoneSlot.vue';
import DeckStack from './DeckStack.vue';
import Tooltip from '../common/Tooltip.vue';

const props = withDefaults(
  defineProps<{
    userState: PlayerFieldState;
    opponentState: PlayerFieldState;
    extraMonsterZones?: (FieldCard | null)[];
    userPlayerId?: number;
    opponentPlayerId?: number;
    getTargetInfo?:
      ((controller: number, location: number, sequence: number) => TargetInfo | null) | null;
    isPromptActive?: boolean;
  }>(),
  {
    extraMonsterZones: () => [null, null],
    userPlayerId: 0,
    opponentPlayerId: 1,
    getTargetInfo: null,
    isPromptActive: false,
  },
);

const emit = defineEmits<{
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'click-card', card: FieldCard | null, event?: MouseEvent, targetInfo?: TargetInfo | null): void;
  (e: 'click-target', targetInfo: TargetInfo): void;
  (e: 'inspect-stack', stackType: string, controller: number): void;
}>();

function getSlotTarget(controller: number, location: number, sequence: number): TargetInfo | null {
  if (props.getTargetInfo) {
    return props.getTargetInfo(controller, location, sequence);
  }
  return null;
}

function onStackClick(stackType: string, controller: number): void {
  let location = 1;
  if (stackType === 'extra') location = 64;
  else if (stackType === 'graveyard') location = 16;
  else if (stackType === 'banished') location = 32;

  const target = getSlotTarget(controller, location, 0);
  if (target && target.isSelectable) {
    emit('click-target', target);
    return;
  }

  emit('inspect-stack', stackType, controller);
}

function isFaceUpFieldCard(card: FieldCard | null | undefined): boolean {
  if (!card || !card.code || card.code <= 0) return false;
  return (
    card.position === 'faceup_spell' ||
    (card.position as any) === 'faceup_attack' ||
    (typeof card.position === 'number' && (card.position & 0x1) !== 0) ||
    card.isFaceUp === true
  );
}

/**
 * Resolves the currently active, face-up Field Spell on the arena (user or opponent field zone).
 */
const activeFieldSpellCard = computed<FieldCard | null>(() => {
  if (isFaceUpFieldCard(props.userState?.fieldZone)) {
    return props.userState.fieldZone;
  }
  if (isFaceUpFieldCard(props.opponentState?.fieldZone)) {
    return props.opponentState.fieldZone;
  }
  return null;
});

/**
 * Dynamic artwork image URL for the active Field Spell.
 */
const activeFieldSpellArtUrl = computed<string | null>(() => {
  if (!activeFieldSpellCard.value || !activeFieldSpellCard.value.code) return null;
  return getCardImageUrl(activeFieldSpellCard.value.code, 'art');
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.duel-field {
  position: relative;
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  user-select: none;
  padding: 8px 24px 16px 24px; // Do not revert this change, we need this extra bottom padding.
  box-sizing: border-box;

  // Obsidian Arena Floor
  .arena-floor {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    border-radius: 20px;
    background: radial-gradient(
      ellipse at center,
      rgba(24, 32, 46, 0.4) 0%,
      rgba(10, 12, 16, 0.8) 70%,
      rgba(6, 8, 10, 0.95) 100%
    );
    border: 1px solid rgba(201, 162, 39, 0.15);
    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.8);
    transition: border-color 0.5s ease, box-shadow 0.5s ease;

    &--has-field-spell {
      border-color: rgba(201, 162, 39, 0.35);
      box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.85), 0 0 25px rgba(201, 162, 39, 0.15);
    }
  }

  .arena-floor__field-spell-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    z-index: 0;
  }

  .arena-floor__field-spell-darken-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      rgba(10, 14, 22, 0.62) 0%,
      rgba(6, 8, 12, 0.82) 75%,
      rgba(4, 5, 8, 0.94) 100%
    );
    backdrop-filter: blur(0.5px);
  }

  // Transitions for field spell entry, replacement, and destruction
  .field-spell-fade-enter-active,
  .field-spell-fade-leave-active {
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s ease-out;
  }

  .field-spell-fade-enter-from,
  .field-spell-fade-leave-to {
    opacity: 0;
    transform: scale(1.04);
  }

  .arena-center-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 520px;
    height: 520px;
    border-radius: 50%;
    border: 1px solid rgba(201, 162, 39, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;

    .center-rune-ring {
      width: 420px;
      height: 420px;
      border-radius: 50%;
      border: 1px dashed rgba(201, 162, 39, 0.06);
    }

    .center-divider-line {
      position: absolute;
      width: 1180px;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(201, 162, 39, 0.25) 50%,
        transparent 100%
      );
      transform: translateY(-2px);
    }
  }

  // Field Halves (Opponent & User)
  .field-half {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 1;

    &--opponent {
      // Mirrored visual perspective
    }
  }

  .field-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 26px;
    width: 100%;
  }

  .zone-spacer {
    width: 96px;
    height: 138px;
    visibility: hidden;
    pointer-events: none;
    flex-shrink: 0;
  }

  .zone-group {
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
  }

  // Pendulum Scale Jewels
  .pendulum-jewel {
    display: none; // Hidden by default, reserved for future release
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 20;

    &--left {
      left: -28px;
    }
    &--right {
      right: -28px;
    }

    .scale-orb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.65rem;
      font-weight: 800;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
      cursor: not-allowed;

      &--blue {
        background: linear-gradient(135deg, #2f80ed, #1b539c);
        border: 1px solid #56ccf2;
        color: #fff;
        box-shadow: 0 0 8px rgba(47, 128, 237, 0.6);
      }

      &--red {
        background: linear-gradient(135deg, #eb5757, #992323);
        border: 1px solid #ff7675;
        color: #fff;
        box-shadow: 0 0 8px rgba(235, 87, 87, 0.6);
      }
    }
  }

  // Center Divide & Extra Monster Zones
  .field-center-divider {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 0;
    z-index: 2;
    margin-top: 4px;

    .emz-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 136px;
    }

    .center-hologram-emblem {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid rgba(201, 162, 39, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle, rgba(201, 162, 39, 0.2) 0%, transparent 70%);

      .emblem-core {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: $color-gold-500;
        box-shadow: 0 0 8px rgba(201, 162, 39, 0.8);
      }
    }
  }

  // Mate Slots (Inert Flank Placeholders)
  .mate-slot {
    position: absolute;
    z-index: 10;

    &--opponent {
      top: 10px;
      left: 10px;
    }

    &--user {
      bottom: 10px;
      right: 10px;
    }

    .mate-pedestal {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(14, 18, 26, 0.6);
      border: 1px dashed rgba(201, 162, 39, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      cursor: not-allowed;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      transition: all 0.2s ease;

      .mate-icon {
        font-size: 1.1rem;
        opacity: 0.7;
      }

      .mate-label {
        font-family: 'Oxanium', monospace, sans-serif;
        font-size: 0.5rem;
        font-weight: 700;
        color: rgba(244, 228, 184, 0.5);
        letter-spacing: 0.05em;
      }
    }
  }
}
</style>
