<template>
  <div class="page-duel">
    <!-- Atmospheric Blurred Duel Arena Backdrop -->
    <div
      class="duel-backdrop"
      :style="{ backgroundImage: `url(${getBackgroundUrl('loading-bg')})` }"
    ></div>
    <div class="duel-vignette"></div>

    <!-- 16:9 Letterboxed Arena Canvas -->
    <main class="duel-canvas-16-9">
      <!-- 0. Top-Level Spatial 3D Card Animation Overlay -->
      <CardAnimationOverlay />

      <!-- 1. Top HUD Bar with Live Phases and Action Triggers -->
      <DuelHud
        :turn-number="currentBoardState.turnNumber"
        :current-phase="currentBoardState.currentPhase"
        :is-user-turn="currentBoardState.userField.isTurn"
        :guide-text="currentBoardState.phaseGuideText"
        :guide-info="actionGuideInfo"
        :is-duel-log-open="isDuelLogOpen"
        :can-go-to-battle-phase="duelStore.canGoToBattlePhase"
        :can-go-to-main-phase2="duelStore.canGoToMainPhase2"
        :can-end-turn="duelStore.canEndTurn"
        @open-menu="isMenuOpen = true"
        @toggle-log="isDuelLogOpen = !isDuelLogOpen"
        @to-battle-phase="duelStore.executeToBattlePhase"
        @to-main-phase2="duelStore.executeToMainPhase2"
        @to-end-phase="duelStore.executeToEndPhase"
      />

      <!-- 2. Top Area: Opponent Hand & Opponent LP Meter -->
      <section class="duel-top-area">
        <!-- Opponent Hand Fan (Card Backs) -->
        <div class="opponent-hand-wrapper">
          <HandFan
            player="ai"
            :cards="currentBoardState.opponentField.hand"
            :get-target-info="(card, idx) => duelStore.getTargetInfo(duelStore.opponentPlayerId, 2, card.sequence ?? idx)"
            :is-prompt-active="duelStore.hasActiveSelectionPrompt"
            @hover-card="onCardHover"
            @click-target="onTargetClick"
          />
        </div>

        <!-- Opponent LP Meter -->
        <div class="opponent-lp-wrapper">
          <LifePointsMeter
            player="ai"
            :name="currentBoardState.opponentField.name"
            :title="currentBoardState.opponentField.title"
            :series="currentBoardState.opponentField.series"
            :character-id="currentBoardState.opponentField.characterId"
            :current-lp="currentBoardState.opponentField.currentLp"
            :max-lp="currentBoardState.opponentField.maxLp"
            :is-turn="currentBoardState.opponentField.isTurn"
          />
        </div>
      </section>

      <!-- 3. Center Area: Duel Field with all 14+ Zones -->
      <section class="duel-center-area">
        <DuelField
          :user-state="currentBoardState.userField"
          :opponent-state="currentBoardState.opponentField"
          :extra-monster-zones="currentBoardState.extraMonsterZones"
          :user-player-id="duelStore.userPlayerId"
          :opponent-player-id="duelStore.opponentPlayerId"
          :get-target-info="duelStore.getTargetInfo"
          :is-prompt-active="duelStore.hasActiveSelectionPrompt"
          @hover-card="onCardHover"
          @click-card="onFieldCardClick"
          @click-target="onTargetClick"
          @inspect-stack="onInspectStack"
        />
      </section>

      <!-- 4. Bottom Area: User LP Meter & User Hand -->
      <section class="duel-bottom-area">
        <!-- User LP Meter -->
        <div class="user-lp-wrapper">
          <LifePointsMeter
            player="user"
            :name="currentBoardState.userField.name"
            :title="currentBoardState.userField.title"
            :series="currentBoardState.userField.series"
            :character-id="currentBoardState.userField.characterId"
            :current-lp="currentBoardState.userField.currentLp"
            :max-lp="currentBoardState.userField.maxLp"
            :is-turn="currentBoardState.userField.isTurn"
          />
        </div>

        <!-- Floating Quick Zone Activations HUD Bar (Graveyard / Banished / Extra Deck) -->
        <div
          v-if="quickZoneActions.length > 0 && !duelStore.isVideoPlaying && !isObservingPrompt"
          class="quick-zone-actions-bar glass-panel"
        >
          <div class="quick-actions-badge">
            <span class="pulse-icon">⚡</span>
            <span class="badge-title">ACTIVATION AVAILABLE</span>
          </div>
          <div class="quick-actions-list">
            <button
              v-for="item in quickZoneActions"
              :key="`${item.zone}-${item.card.code}-${item.action.type}-${item.action.index}`"
              type="button"
              class="quick-action-pill"
              :class="`quick-action-pill--${item.zone}`"
              @click="onSelectCardAction(item.action)"
              @mouseenter="onCardHover(item.card)"
            >
              <span class="zone-badge">{{ item.zoneLabel }}</span>
              <img
                :src="getCardImageUrl(item.card.code, 'mini')"
                :alt="item.card.name"
                class="quick-card-art"
                @error="handleImageError"
              />
              <span class="card-name">{{ item.card.name }}</span>
              <span class="action-btn-tag" :class="`action-btn-tag--${item.action.type}`">
                <span class="tag-icon">{{ item.action.icon || '⚡' }}</span>
                <span class="tag-label">{{ item.action.label }}</span>
              </span>
            </button>
          </div>
        </div>

        <!-- User Hand Fan (Full Cards) -->
        <div class="user-hand-wrapper">
          <HandFan
            player="user"
            :cards="currentBoardState.userField.hand"
            :get-target-info="(card, idx) => duelStore.getTargetInfo(duelStore.userPlayerId, 2, card.sequence ?? idx)"
            :is-prompt-active="duelStore.hasActiveSelectionPrompt"
            @hover-card="onCardHover"
            @click-card="onHandCardClick"
            @click-target="onTargetClick"
          />
        </div>
      </section>
    </main>

    <!-- Contextual Card Action Menu (Normal Summon, Set, Activate, Attack, etc.) -->
    <CardActionMenu
      v-if="activeMenuCard && activeCardActions.length > 0"
      :card="activeMenuCard"
      :actions="activeCardActions"
      :anchor-pos="menuAnchorPos"
      @select="onSelectCardAction"
      @close="closeCardActionMenu"
    />

    <!-- Interactive Prompt Modal (Position, Chain, Effect Yes/No, Options, Announcements) -->
    <PromptModal
      v-if="!isObservingPrompt"
      :select-chain="duelStore.activeSelectChain"
      :select-position="duelStore.activeSelectPosition"
      :select-effect-yn="duelStore.activeSelectEffectYn"
      :select-option="duelStore.activeSelectOption"
      :announce-card="duelStore.activeAnnounceCard"
      :announce-race="duelStore.activeAnnounceRace"
      :announce-attrib="duelStore.activeAnnounceAttrib"
      :announce-number="duelStore.activeAnnounceNumber"
      :all-cards="allCardsList"
      @select-position="(p) => { isObservingPrompt = false; duelStore.executeSelectPosition(p); }"
      @select-chain="(idx) => { isObservingPrompt = false; duelStore.executeSelectChain(idx); }"
      @select-effect-yn="(yn) => { isObservingPrompt = false; duelStore.executeSelectEffectYn(yn); }"
      @select-option="(idx) => { isObservingPrompt = false; duelStore.executeSelectOption(idx); }"
      @announce-card="(c) => { isObservingPrompt = false; duelStore.executeAnnounceCard(c); }"
      @announce-race="(r) => { isObservingPrompt = false; duelStore.executeAnnounceRace(r); }"
      @announce-attrib="(a) => { isObservingPrompt = false; duelStore.executeAnnounceAttrib(a); }"
      @announce-number="(n) => { isObservingPrompt = false; duelStore.executeAnnounceNumber(n); }"
      @observe-field="isObservingPrompt = true"
      @hover-card="onCardHover"
    />

    <!-- Floating Prompt Observation Mode Banner -->
    <div
      v-if="isObservingPrompt && hasAnyActivePrompt"
      class="prompt-observation-bar target-confirmation-bar glass-panel"
    >
      <div class="target-bar-info">
        <span class="target-bar-icon">👁️</span>
        <div class="target-bar-text">
          <span class="target-bar-title">FIELD OBSERVATION MODE</span>
          <span class="target-bar-detail">
            Decision is paused. You can inspect card details, Graveyard, and Extra Deck.
          </span>
        </div>
      </div>
      <div class="target-bar-actions">
        <button
          type="button"
          class="micro-btn micro-btn--confirm observe-return-btn"
          @click="isObservingPrompt = false"
        >
          <span class="btn-icon">🔙</span>
          <span>Return to Decision</span>
        </button>
      </div>
    </div>

    <!-- Dedicated Card Selection Modal (Deck, Graveyard, Extra Deck, Banished, Hand Search/Targeting) -->
    <CardSelectionModal
      v-if="duelStore.hasActiveSelectionPrompt"
      :model-value="duelStore.isCardSelectionModalOpen"
      :select-payload="duelStore.activeSelectionPayload"
      :selected-indices="duelStore.selectedTargetIndices"
      :can-cancel="Boolean(duelStore.activeSelectCard?.can_cancel || duelStore.activeSelectUnselectCard?.can_cancel)"
      :min="duelStore.activeSelectionMin"
      :max="duelStore.activeSelectionMax"
      :instruction="actionGuideInfo?.instruction || 'Select card(s) to proceed with the active effect.'"
      :sub-text="actionGuideInfo?.subText"
      @update:model-value="duelStore.isCardSelectionModalOpen = $event"
      @toggle-target="duelStore.toggleTargetByIndex"
      @minimize="duelStore.closeCardSelectionModal"
      @hover-card="onCardHover"
      @cancel="duelStore.cancelActiveSelection"
      @confirm="duelStore.confirmActiveSelection"
    />

    <!-- Floating Target Selection Confirmation Bar (On-Field/Hand selections OR when center modal is minimized) -->
    <div
      v-if="duelStore.hasActiveSelectionPrompt && !duelStore.isCardSelectionModalOpen"
      class="target-confirmation-bar glass-panel"
    >
      <div class="target-bar-info">
        <span class="target-bar-icon">{{ actionGuideInfo?.categoryIcon || '🎯' }}</span>
        <div class="target-bar-text">
          <span class="target-bar-title">{{ actionGuideInfo?.instruction }}</span>
          <span v-if="actionGuideInfo?.subText" class="target-bar-detail">{{ actionGuideInfo.subText }}</span>
        </div>
      </div>
      <div class="target-bar-actions">
        <button
          class="micro-btn micro-btn--browse"
          title="Open modal to browse and filter available cards"
          @click="duelStore.openCardSelectionModal"
        >
          📋 Browse Cards ({{ duelStore.selectedTargetIndices.length }}/{{ duelStore.activeSelectionMax }})
        </button>
        <button
          v-if="duelStore.activeSelectCard?.can_cancel || duelStore.activeSelectUnselectCard?.can_cancel"
          class="micro-btn micro-btn--cancel"
          @click="duelStore.cancelActiveSelection"
        >
          Cancel
        </button>
        <button
          class="micro-btn micro-btn--confirm"
          :disabled="!duelStore.canConfirmActiveSelection"
          @click="duelStore.confirmActiveSelection"
        >
          Confirm ({{ duelStore.selectedTargetIndices.length }}/{{ duelStore.activeSelectionMax }})
        </button>
      </div>
    </div>

    <!-- Game Over Victory / Defeat Overlay -->
    <div v-if="duelStore.isGameOver" class="game-over-modal-backdrop">
      <div
        class="game-over-modal glass-panel"
        :class="isUserWinner ? 'game-over-modal--victory' : 'game-over-modal--defeat'"
      >
        <div class="game-over-banner">
          <h2 class="game-over-title">
            {{ isUserWinner ? '👑 VICTORY!' : '💀 DEFEAT' }}
          </h2>
          <p class="game-over-subtitle">
            {{ gameOverSubtitle }}
          </p>
        </div>

        <div class="game-over-actions">
          <button class="action-btn action-btn--primary" @click="onRestartMatch">
            🔄 Rematch
          </button>
          <button class="action-btn action-btn--review" @click="onOpenPostMatchReview">
            🧠 AI Tactical Review
          </button>
          <button class="action-btn action-btn--secondary" @click="returnToCharacters">
            🏠 Exit to Menu
          </button>
        </div>
      </div>
    </div>

    <!-- Side Card Previewer Popup (Persistent Hover-driven) -->
    <CardPreviewPopup
      :card="activePreviewCard"
      position="left"
    />

    <!-- In-Duel Pause Menu Modal -->
    <DuelMenuModal
      :is-open="isMenuOpen"
      @close="isMenuOpen = false"
      @restart="onRestartMatch"
      @surrender="onSurrender"
    />

    <!-- Card List Inspection Modal (Graveyard, Extra Deck, Banished) -->
    <CardListModal
      v-if="activeInspectStack"
      v-model="isInspectModalOpen"
      :title="activeInspectStack.title"
      :cards="activeInspectStack.cards"
      :owner="activeInspectStack.owner"
      :type="activeInspectStack.type"
      @hover-card="onCardHover"
      @action="onSelectCardAction"
    />
    <!-- Slide-Out Duel Log Drawer -->
    <DuelLogPanel
      :is-open="isDuelLogOpen"
      :logs="duelLogs"
      :board-state="currentBoardState"
      :guide-info="actionGuideInfo"
      @close="isDuelLogOpen = false"
      @clear="duelLogs = []"
    />

    <!-- In-Duel Video Overlay (Special Summon / Attack Cutscenes) -->
    <VideoOverlay
      :video="duelStore.activeVideoPayload"
      :visible="duelStore.isVideoPlaying"
      @finish="duelStore.finishVideo"
    />

    <!-- Dice Roll & Coin Toss Visual Overlay -->
    <TossVisualOverlay :toss-payload="activeTossPayload" />

    <!-- AI Tactical Post-Match Review Modal -->
    <DuelReviewModal
      :is-open="isReviewModalOpen"
      :loading="isReviewLoading"
      :review="postMatchReview"
      @close="isReviewModalOpen = false"
    />

    <!-- Floating Duel Tools -->
    <aside class="dev-floating-controls">
      <button
        class="dev-pill-btn"
        title="Toggle Duel Log Drawer"
        @click="isDuelLogOpen = !isDuelLogOpen"
      >
        <span>📜 Log</span>
      </button>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import type { FieldCard, DuelBoardState } from '../../shared/types/field.js';
import { type DuelEventPayload, type TossPayload, getGameOverSubtitle } from '../../shared/types/duel.js';
import { getBackgroundUrl, getCardImageUrl, handleImageError } from '../utils/media.js';
import { useDuelStore, type CardActionOption, type TargetInfo } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import { useDuelLogsStore } from '../stores/duelLogsStore.js';
import { getActionGuideInfo } from '../utils/guidanceHelper.js';
import {
  DuelHud,
  DuelField,
  LifePointsMeter,
  HandFan,
  CardPreviewPopup,
  DuelMenuModal,
  DuelLogPanel,
  CardActionMenu,
  PromptModal,
  CardAnimationOverlay,
  CardListModal,
  CardSelectionModal,
  VideoOverlay,
  TossVisualOverlay,
} from '../components/duel/index.js';
import DuelReviewModal from '../components/duel/DuelReviewModal.vue';
import {
  duelAnimationQueue,
  playCardFlight,
  getZoneRect,
  getHandCardRect,
  getHandFanRect,
  getStackRect,
  getAvatarRect,
  setAnimationUserPlayerId,
} from '../utils/animationService.js';
import { audioManager } from '../audio/index.js';


interface LogItem {
  time: string;
  type: string;
  description: string;
}

interface InspectStackState {
  title: string;
  cards: FieldCard[];
  owner: 'user' | 'ai';
  type: 'graveyard' | 'extra' | 'banished' | 'deck';
}

const router = useRouter();
const duelStore = useDuelStore();
const settingsStore = useSettingsStore();
const duelLogsStore = useDuelLogsStore();

let hasSavedCurrentDuel = false;

// Modals and Drawers
const isMenuOpen = ref(false);
const isDuelLogOpen = ref(false);
const isInspectModalOpen = ref(false);
const activeInspectStack = ref<InspectStackState | null>(null);
const isObservingPrompt = ref(false);

const isReviewModalOpen = ref(false);
const isReviewLoading = ref(false);
const postMatchReview = ref<any>(null);

async function onOpenPostMatchReview(): Promise<void> {
  isReviewModalOpen.value = true;
  isReviewLoading.value = true;
  postMatchReview.value = null;
  try {
    const latestDuel = duelLogsStore.savedDuels[0];
    const markdownLog = latestDuel?.markdownLog || duelLogsStore.buildMarkdownReport(currentBoardState.value, duelLogs.value, {
      outcome: isUserWinner.value ? 'victory' : 'defeat',
      winReason: gameOverSubtitle.value,
    });
    if ((window as any).electronAPI?.duel?.getReview) {
      const rep = await (window as any).electronAPI.duel.getReview(markdownLog, opponentName.value);
      postMatchReview.value = rep;
    }
  } catch (err) {
    console.error('[DuelView] Error fetching post-match review:', err);
  } finally {
    isReviewLoading.value = false;
  }
}

const hasAnyActivePrompt = computed(() => {
  return (
    !!duelStore.activeSelectChain ||
    !!duelStore.activeSelectPosition ||
    !!duelStore.activeSelectEffectYn ||
    !!duelStore.activeSelectOption ||
    !!duelStore.activeAnnounceCard ||
    !!duelStore.activeAnnounceRace ||
    !!duelStore.activeAnnounceAttrib ||
    !!duelStore.activeAnnounceNumber
  );
});

function onInspectStack(stackType: string, controller: number): void {
  const isUser = controller === duelStore.userPlayerId;
  const pf = isUser ? currentBoardState.value.userField : currentBoardState.value.opponentField;
  const ownerName = isUser ? 'Your' : `${pf.name || 'Opponent'}'s`;
  const owner: 'user' | 'ai' = isUser ? 'user' : 'ai';

  let cards: FieldCard[] = [];
  let title = '';

  if (stackType === 'graveyard') {
    cards = pf.graveyard || [];
    title = `${ownerName} Graveyard`;
  } else if (stackType === 'extra') {
    cards = pf.extraDeck || [];
    title = `${ownerName} Extra Deck`;
  } else if (stackType === 'banished') {
    cards = pf.banished || [];
    title = `${ownerName} Banished Zone`;
  }

  // Those dialogs open only if [graveyard | extra-deck] has cards inside
  if (!cards || cards.length === 0) {
    return;
  }

  activeInspectStack.value = {
    title,
    cards,
    owner,
    type: stackType as 'graveyard' | 'extra' | 'banished',
  };
  isInspectModalOpen.value = true;
}

// Hover-previewed card state (persists last hovered card even when mouse leaves)
const lastHoveredCard = ref<FieldCard | null>(null);

function onCardHover(card: FieldCard | null): void {
  if (!card) return;
  const isOpponentFacedown =
    card.controller !== duelStore.userPlayerId &&
    (card.position === 'facedown_defense' || card.position === 'facedown_spell' || card.code === 0);
  if (isOpponentFacedown) {
    return;
  }
  if (card.code > 0) {
    lastHoveredCard.value = card;
  }
}

// Card Action Menu State
const activeMenuCard = ref<FieldCard | null>(null);
const activeCardActions = ref<CardActionOption[]>([]);
const menuAnchorPos = ref<{ x: number; y: number } | null>(null);

// Reactive board state selector
const currentBoardState = computed<DuelBoardState>(() => duelStore.boardState);

const isUserWinner = computed(() => {
  return duelStore.boardState.winner === duelStore.userPlayerId;
});

const gameOverSubtitle = computed(() => {
  return getGameOverSubtitle(isUserWinner.value, duelStore.boardState.winReason ?? null);
});

const allCardsList = computed(() => {
  return Array.from(duelStore.cardMap.values());
});

// Dynamic Plain-Language Action Guide Calculation
const actionGuideInfo = computed(() => {
  return getActionGuideInfo(
    duelStore.boardState,
    duelStore.boardState.userField.isTurn,
    {
      selectCard: duelStore.activeSelectCard,
      selectTribute: duelStore.activeSelectTribute,
      selectChain: duelStore.activeSelectChain,
      selectPosition: duelStore.activeSelectPosition,
      selectEffectYn: duelStore.activeSelectEffectYn,
      selectOption: duelStore.activeSelectOption,
    },
    duelStore.selectedTargetIndices.length,
  );
});

// Quick Zone Activations (Instant 1-click access to Graveyard, Banished, and Extra Deck effects)
const quickZoneActions = computed(() => {
  if (isObservingPrompt.value || duelStore.isGameOver) return [];
  const results: Array<{
    zone: 'graveyard' | 'banished' | 'extra';
    zoneLabel: string;
    card: FieldCard;
    action: CardActionOption;
  }> = [];

  for (const item of duelStore.activatableGraveyardCards) {
    for (const action of item.actions) {
      results.push({
        zone: 'graveyard',
        zoneLabel: '🪦 GY',
        card: item.card,
        action,
      });
    }
  }

  for (const item of duelStore.activatableBanishedCards) {
    for (const action of item.actions) {
      results.push({
        zone: 'banished',
        zoneLabel: '🌀 BANISHED',
        card: item.card,
        action,
      });
    }
  }

  for (const item of duelStore.activatableExtraDeckCards) {
    for (const action of item.actions) {
      results.push({
        zone: 'extra',
        zoneLabel: '⚡ EXTRA',
        card: item.card,
        action,
      });
    }
  }

  return results;
});

// Live Logs
const duelLogs = ref<LogItem[]>([]);

// Active Dice Roll / Coin Toss Visual Overlay State
const activeTossPayload = ref<TossPayload | null>(null);

const activePreviewCard = computed<FieldCard | null>(() => {
  if (lastHoveredCard.value && lastHoveredCard.value.code > 0) {
    return lastHoveredCard.value;
  }
  // Default fallback when duel starts: first revealed card in hand or on field
  return (
    currentBoardState.value.userField.hand.find((c) => c && c.code > 0) ||
    currentBoardState.value.userField.monsterZones.find((m) => m !== null && m.code > 0) ||
    currentBoardState.value.userField.spellTrapZones.find((s) => s !== null && s.code > 0) ||
    null
  );
});

function formatTime(): string {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(Math.floor(d.getMilliseconds() / 100))}`;
}

function appendLog(type: string, description: string): void {
  duelLogs.value.push({
    time: formatTime(),
    type,
    description,
  });
}

function onHandCardClick(card: FieldCard, event: MouseEvent): void {
  if (duelStore.isVideoPlaying) return;
  onCardHover(card);

  // If observing prompt, only inspect without opening turn action menu
  if (isObservingPrompt.value) return;

  // If there is an active selection prompt (e.g. Cost discard or hand cleanup)
  if (duelStore.hasActiveSelectionPrompt) {
    const target = duelStore.getTargetInfo(card.controller, 2, card.sequence ?? 0);
    if (target && target.isSelectable) {
      duelStore.toggleTargetByIndex(target.selectIndex);
      return;
    }
  }

  const actions = duelStore.getLegalActionsForHandCard(card);
  if (actions.length > 0) {
    activeMenuCard.value = card;
    activeCardActions.value = actions;
    menuAnchorPos.value = { x: event.clientX, y: event.clientY };
  } else {
    closeCardActionMenu();
  }
}

function onFieldCardClick(card: FieldCard | null, event?: MouseEvent, targetInfo?: TargetInfo | null): void {
  if (duelStore.isVideoPlaying) return;

  // 1. If this slot/card is an active selectable target (Attack target, MST target, Tribute, etc.)
  if (targetInfo && targetInfo.isSelectable) {
    closeCardActionMenu();
    duelStore.toggleTargetByIndex(targetInfo.selectIndex);
    return;
  }

  // 2. If there is an active selection prompt, check target info by card location as fallback
  if (duelStore.hasActiveSelectionPrompt && card) {
    const loc = card.location === 'field' || card.position === 'faceup_spell' || card.position === 'facedown_spell' ? 8 : 4;
    const target = duelStore.getTargetInfo(card.controller, loc, card.sequence ?? 0);
    if (target && target.isSelectable) {
      closeCardActionMenu();
      duelStore.toggleTargetByIndex(target.selectIndex);
      return;
    }
    closeCardActionMenu();
    return;
  }

  // 3. Normal inspection & action menu
  if (!card || card.code === 0) {
    closeCardActionMenu();
    return;
  }

  const isOpponentFacedown =
    card.controller !== duelStore.userPlayerId &&
    (card.position === 'facedown_defense' || card.position === 'facedown_spell' || card.code === 0);
  if (isOpponentFacedown) {
    closeCardActionMenu();
    return;
  }

  onCardHover(card);

  // If observing prompt, do not open turn action menu
  if (isObservingPrompt.value) return;

  // Only allow actions on player's own cards
  if (card.controller === duelStore.userPlayerId) {
    const actions = duelStore.getLegalActionsForFieldCard(card);
    if (actions.length > 0) {
      activeMenuCard.value = card;
      activeCardActions.value = actions;
      if (event) {
        menuAnchorPos.value = { x: event.clientX, y: event.clientY };
      }
    } else {
      closeCardActionMenu();
    }
  }
}

function onTargetClick(targetInfo: TargetInfo): void {
  if (duelStore.isVideoPlaying) return;
  if (targetInfo.isSelectable) {
    audioManager.playSfx('target-locked');
    duelStore.toggleTargetByIndex(targetInfo.selectIndex);
  }
}

async function onSelectCardAction(action: CardActionOption): Promise<void> {
  if (duelStore.isVideoPlaying) return;
  closeCardActionMenu();
  isInspectModalOpen.value = false;
  switch (action.type) {
    case 'summon':
      await duelStore.executeNormalSummon(action.index);
      break;
    case 'sp_summon':
      await duelStore.executeSpecialSummon(action.index);
      break;
    case 'monster_set':
      await duelStore.executeMonsterSet(action.index);
      break;
    case 'spell_set':
      await duelStore.executeSpellSet(action.index);
      break;
    case 'activate':
      await duelStore.executeActivate(action.index);
      break;
    case 'chain':
      await duelStore.executeSelectChain(action.index);
      break;
    case 'pos_change':
      await duelStore.executePosChange(action.index);
      break;
    case 'attack':
      await duelStore.executeDeclareAttack(action.index);
      break;
  }
}

function closeCardActionMenu(): void {
  activeMenuCard.value = null;
  activeCardActions.value = [];
  menuAnchorPos.value = null;
}

function saveCurrentDuelLog(overrideOutcome?: 'victory' | 'defeat' | 'draw' | 'surrender'): void {
  if (hasSavedCurrentDuel) return;
  if (duelLogs.value.length === 0) return;

  const uPf = currentBoardState.value.userField;
  const oPf = currentBoardState.value.opponentField;
  const winnerId = duelStore.boardState.winner;

  let outcome: 'victory' | 'defeat' | 'draw' | 'surrender' = overrideOutcome || 'draw';
  if (!overrideOutcome) {
    if (winnerId === duelStore.userPlayerId) {
      outcome = 'victory';
    } else if (winnerId !== null) {
      outcome = 'defeat';
    }
  }

  let outcomeLabel = 'MATCH COMPLETE';
  if (outcome === 'victory') outcomeLabel = 'VICTORY';
  else if (outcome === 'defeat') outcomeLabel = 'DEFEAT';
  else if (outcome === 'surrender') outcomeLabel = 'SURRENDER';
  else if (outcome === 'draw') outcomeLabel = 'DRAW';

  const markdownLog = duelLogsStore.buildMarkdownReport(currentBoardState.value, duelLogs.value, {
    outcome,
    winReason: gameOverSubtitle.value,
    guideInstruction: actionGuideInfo.value.instruction,
    guideSubText: actionGuideInfo.value.subText,
  });

  duelLogsStore.recordDuel({
    playerName: uPf.name || 'Player (You)',
    playerDeckName: duelStore.selectedUserDeck?.name || 'Custom Deck',
    playerStartingLp: uPf.maxLp,
    playerFinalLp: uPf.currentLp,
    opponentId: duelStore.selectedOpponent?.id || 'opponent',
    opponentName: oPf.name || duelStore.opponentName,
    opponentTitle: oPf.title || duelStore.opponentTitle,
    opponentSeries: oPf.series || duelStore.opponentSeries,
    opponentDeckName:
      duelStore.selectedOpponentDeck?.name || duelStore.selectedOpponent?.title || 'Challenger Deck',
    opponentAvatar: duelStore.selectedOpponent?.avatar || '',
    opponentStartingLp: oPf.maxLp,
    opponentFinalLp: oPf.currentLp,
    turns: currentBoardState.value.turnNumber,
    outcome,
    outcomeLabel,
    winReason: gameOverSubtitle.value,
    totalEvents: duelLogs.value.length,
    markdownLog,
    logs: [...duelLogs.value],
  });

  hasSavedCurrentDuel = true;
}

async function onRestartMatch(): Promise<void> {
  isMenuOpen.value = false;
  closeCardActionMenu();
  hasSavedCurrentDuel = false;
  duelLogs.value = [];
  // Cancel any in-flight animation tasks from the old duel — without this,
  // stale queue tasks can call addSingleDrawnCard / handleEngineEvent on the
  // newly-reset board state and corrupt card counts for the fresh duel.
  duelAnimationQueue.clear();
  audioManager.playSfx('duel-start');
  appendLog('RESTART', 'Restarting live duel...');
  await duelStore.startPreparedDuel();
}

function onSurrender(): void {
  isMenuOpen.value = false;
  closeCardActionMenu();
  audioManager.playSfx('match-defeat');
  appendLog('SURRENDER', 'Player surrendered the match.');
  saveCurrentDuelLog('surrender');
  router.push('/main-menu');
}

function returnToCharacters(): void {
  saveCurrentDuelLog();
  router.push('/main-menu');
}

let unsubscribeEvents: (() => void) | null = null;
let unsubscribeVideo: (() => void) | null = null;

async function setupEngineEventListener(): Promise<void> {
  if (!window.duelAPI) return;
  setAnimationUserPlayerId(duelStore.userPlayerId);

  const toDomOwner = (p: 0 | 1 | number): 'user' | 'ai' =>
    p === duelStore.userPlayerId ? 'user' : 'ai';

  unsubscribeEvents = window.duelAPI.onEvent(async (event: DuelEventPayload) => {
    appendLog(event.type, event.description);

    await duelAnimationQueue.enqueue(async () => {
      setAnimationUserPlayerId(duelStore.userPlayerId);

      // When true, we've already called handleEngineEvent inside a branch and
      // the bottom catch-all call should be skipped to avoid double-application.
      let eventHandled = false;


      // -----------------------------------------------------------------------
      // 1. Draw from Deck → Hand
      //    Uses the FLIP technique so each card flies to its EXACT slot position:
      //      a) addSingleDrawnCard first (updates state)
      //      b) nextTick — Vue renders the card in hand at its actual slot
      //      c) Capture the card element's precise rect as toRect
      //      d) Hide the element (avoid double-image with the flying clone)
      //      e) playCardFlight to that precise rect
      //      f) Reveal the element after landing
      //
      //    Multi-card draws (e.g. Pot of Greed draws 2) iterate one card at a time.
      //
      //    AI draws are handled separately below (after this function) using
      //    Promise.all for simultaneous flight animations, then delegating state
      //    updates to handleEngineEvent in one atomic batch.
      // -----------------------------------------------------------------------
      const runDrawAnimation = async () => {
        if (event.type !== 'DRAW' || event.player === undefined) return;

        const isHuman = event.player === duelStore.userPlayerId;
        const domOwner = toDomOwner(event.player);
        const drawnCards: any[] = (event as any).drawnCards || (event as any).drawn || [];
        const count = drawnCards.length || 1;

        for (let i = 0; i < count; i++) {
          const d = drawnCards[i];
          const cardCode = (d?.code ?? (i === 0 ? ((event as any).code ?? 0) : 0)) || 0;
          const cardName =
            d?.cardName || d?.name || (i === 0 ? event.cardName : null) || 'Card Drawn';

          // FLIP step 1: add card to hand state so Vue can render it at the real slot
          duelStore.addSingleDrawnCard(event, i);

          // FLIP step 2: flush Vue's DOM update so the card element exists in the DOM
          await nextTick();

          // FLIP step 3: find the newly added card element (it's the last one in the hand)
          const newSeq = isHuman
            ? duelStore.boardState.userField.hand.length - 1
            : duelStore.boardState.opponentField.hand.length - 1;
          const cardEl = document.querySelector(
            `[data-hand-card-id="hand-${domOwner}-${newSeq}"]`,
          ) as HTMLElement | null;

          // Capture exact slot rect BEFORE hiding (getBoundingClientRect needs visibility)
          const preciseToRect = cardEl?.getBoundingClientRect() ?? null;

          // FLIP step 4: hide the real card so only the flying clone is visible
          if (cardEl) { cardEl.style.opacity = '0'; cardEl.style.visibility = 'hidden'; }

          audioManager.playSfx('card-draw');

          // FLIP step 5: fly from deck to the card's exact slot position
          await playCardFlight({
            code: isHuman ? cardCode : 0,
            cardName: isHuman ? cardName : 'Card Drawn',
            fromRect: getStackRect(domOwner, 'deck'),
            toRect: preciseToRect || getHandFanRect(domOwner),
            type: 'draw',
            isFacedown: !isHuman,
            durationMs: 360,
          });

          // FLIP step 6: reveal the real card — it's now at the exact landing position
          if (cardEl) { cardEl.style.opacity = ''; cardEl.style.visibility = ''; }
        }
      };

      if (event.type === 'DRAW' && event.player !== undefined) {
        const isHuman = event.player === duelStore.userPlayerId;
        if (isHuman) {
          // Human draw: FLIP technique — add card first, capture exact slot rect,
          // hide real card, fly clone to exact position, then reveal real card.
          await runDrawAnimation();
        } else {
          // AI draw: animate all N cards simultaneously (face-down, no exact-slot
          // FLIP needed). State is NOT updated here — we let handleEngineEvent
          // (called below via eventHandled=false path) add all AI cards at once
          // after the animation, keeping it synchronised with fetchBoardState.
          const domOwner = toDomOwner(event.player as 0 | 1);
          const drawnCards: any[] = (event as any).drawnCards || (event as any).drawn || [];
          const count = drawnCards.length || 1;
          const flights: Promise<void>[] = [];
          for (let i = 0; i < count; i++) {
            audioManager.playSfx('card-draw');
            flights.push(
              playCardFlight({
                code: 0, // AI cards are always face-down to the player
                cardName: 'Card',
                fromRect: getStackRect(domOwner, 'deck'),
                toRect: getHandFanRect(domOwner),
                type: 'draw',
                isFacedown: true,
                durationMs: 360,
              }),
            );
            // Small stagger so the cards don't all start in exactly the same frame
            await new Promise<void>((r) => setTimeout(r, 60));
          }
          await Promise.all(flights);
          // Let handleEngineEvent add all AI cards to hand state at once:
          await duelStore.handleEngineEvent(event);
          eventHandled = true; // prevent the bottom catch-all from calling it again
        }
        if (isHuman) eventHandled = true;
      }

      // -----------------------------------------------------------------------
      // 2. Canonical Card Movement (MOVE events)
      //
      //    FROM HAND (FLIP technique):
      //      Capture rects → call handleEngineEvent IMMEDIATELY (removes card
      //      from hand so the gap starts closing via TransitionGroup MOVE right
      //      away) → nextTick (Vue flushes, destination card renders) → hide
      //      destination card → animate flight → reveal destination card.
      //      Result: gap closes smoothly while the card is in the air, and there
      //      is no ghost-card flash at the end.
      //
      //    FROM FIELD / GY / DECK (traditional):
      //      Hide source element → animate → handleEngineEvent at bottom removes
      //      the source card from its zone after the flight.
      // -----------------------------------------------------------------------
      else if (event.type === 'MOVE') {
        const moveEvt = event as any;
        const p = (moveEvt.controller ?? duelStore.userPlayerId) as 0 | 1;
        const domOwner = toDomOwner(p);
        // fromDomOwner: cross-controller moves (Monster Reborn, Premature Burial, etc.)
        // have a different source player. The raw OCG message has from.controller.
        const fromController = (moveEvt.raw?.from?.controller ?? p) as 0 | 1;
        const fromDomOwner = toDomOwner(fromController);
        const fromLoc = moveEvt.fromLocation ?? 0;
        const fromSeq = moveEvt.fromSequence ?? 0;
        const toLoc = moveEvt.toLocation ?? 0;
        const toSeq = moveEvt.toSequence ?? 0;
        const isFaceup = (moveEvt.position & 1) !== 0;
        const isFacedown = !isFaceup;
        const isDefense = (moveEvt.position & 0xc) !== 0;

        if (fromLoc === 2) {
          // ── FLIP: Card leaving the hand ─────────────────────────────────
          // Find the card's ACTUAL array index by code (not engine's fromSeq).
          // Engine sequence numbers can drift from the array index after prior
          // hand mutations (draws, shuffles), so a code-based lookup is needed.
          const handPf = p === duelStore.userPlayerId
            ? duelStore.boardState.userField
            : duelStore.boardState.opponentField;
          let handArrayIdx = fromSeq; // fallback
          if (moveEvt.code > 0) {
            const codeIdx = handPf.hand.findIndex((c) => c && c.code === moveEvt.code);
            if (codeIdx >= 0) handArrayIdx = codeIdx;
          }

          // Capture both rects BEFORE any state change using the correct array index.
          // Issue F: field zone FieldZoneSlot has zoneIndex=0 (default), so its
          // data-zone-id is slot-${player}-field-0, NOT slot-${player}-field-5.
          const isFieldZone = toLoc === 8 && toSeq === 5;
          const fromRect = getHandCardRect(domOwner, handArrayIdx) || getHandFanRect(domOwner);
          const toRect =
            toLoc === 16 ? getStackRect(domOwner, 'graveyard') :
            toLoc === 8  ? getZoneRect(domOwner, isFieldZone ? 'field' : 'spell-trap', isFieldZone ? 0 : toSeq) :
            toLoc === 4  ? getZoneRect(domOwner, 'monster', toSeq) :
            toLoc === 32 ? getStackRect(domOwner, 'banished') :
            null;

          if (toLoc === 16) {
            audioManager.playSfx('card-to-gy');
          } else if (toLoc === 8) {
            audioManager.playSfx(isFaceup ? (isFieldZone ? 'field-activate' : 'spell-activate') : 'card-set-spell');
          } else if (toLoc === 4) {
            audioManager.playSfx(isFaceup ? 'summon-normal' : 'card-set-monster');
          } else if (toLoc === 32) {
            audioManager.playSfx('card-banish');
          }

          // Apply state change NOW: removes card from hand array.
          await duelStore.handleEngineEvent(event);
          eventHandled = true;

          // Flush DOM so Vue renders the new hand layout AND renders the card
          // that just appeared in its destination zone.
          await nextTick();

          // Hide the destination zone card that handleEngineEvent just placed
          // there, so the flying overlay is the only visible copy during flight.
          // Issue F: field zone query must use index 0 (FieldZoneSlot zoneIndex default).
          let destEl: HTMLElement | null = null;
          if (toLoc === 8) {
            const destZoneIdx = isFieldZone ? 0 : toSeq;
            const destZoneType = isFieldZone ? 'field' : 'spell-trap';
            destEl = document.querySelector(
              `[data-zone-id="slot-${domOwner}-${destZoneType}-${destZoneIdx}"] .field-card`,
            ) as HTMLElement | null;
          } else if (toLoc === 4) {
            destEl = document.querySelector(
              `[data-zone-id="slot-${domOwner}-monster-${toSeq}"] .field-card`,
            ) as HTMLElement | null;
          }
          if (destEl) { destEl.style.opacity = '0'; destEl.style.visibility = 'hidden'; }

          // Fly the overlay clone from captured hand position to destination.
          if (fromRect && toRect) {
            const animType =
              toLoc === 16 ? 'discard' :
              toLoc === 8  ? (isFaceup ? 'spell-activate' : 'set-spell') :
              toLoc === 4  ? (isFaceup ? 'summon' : 'set-monster') :
              'banish';

            await playCardFlight({
              code: isFaceup || p === duelStore.userPlayerId ? (moveEvt.code || 0) : 0,
              cardName: moveEvt.cardName || 'Card',
              fromRect,
              toRect,
              type: animType,
              isFacedown,
              isDefense,
              durationMs: toLoc === 16 || toLoc === 32 ? 440 : 480,
            });
          }

          // Flying overlay has landed — reveal the real card in the zone.
          if (destEl) { destEl.style.opacity = ''; destEl.style.visibility = ''; }
          // Issue C safety: if the expected spell→GY MOVE never arrives (e.g. the
          // activation is negated), the destEl would remain invisible forever.
          // Set a 2.5 s fallback so the card always re-appears even without a
          // follow-up MOVE event.  We only need this for hand→spell zone placements.
          if (destEl && (toLoc === 8)) {
            const safetyEl = destEl; // capture ref before closure
            setTimeout(() => {
              safetyEl.style.opacity = '';
              safetyEl.style.visibility = '';
            }, 2500);
          }

        } else {
          // ── Traditional: card leaving a field zone, GY, deck, or pile ───

          // Issue E: Skip no-op internal MOVE events (e.g. tribute pre-notify
          // events where fromLoc === toLoc and fromSeq === toSeq).
          if (fromLoc === toLoc && fromSeq === toSeq) {
            // no-op — do nothing, just let handleEngineEvent apply the event
          }

          else if (toLoc === 16) {
            // → Graveyard (from monster zone, spell zone, field zone, or deck)
            if (fromLoc === 4) {
              audioManager.playSfx('card-destroy-monster');
            } else if (fromLoc === 8) {
              audioManager.playSfx('card-destroy-spell');
            } else {
              audioManager.playSfx('card-to-gy');
            }

            // Issue F: field zone FieldZoneSlot has zoneIndex=0 by default.
            const isFromField = fromLoc === 8 && fromSeq === 5;
            const fromZoneType = fromLoc === 8 ? (isFromField ? 'field' : 'spell-trap') : 'monster';
            const fromZoneIdx  = isFromField ? 0 : fromSeq;

            // Issue 3: use fromDomOwner so the animation starts at the correct player's zone
            const fromRect =
              fromLoc === 1
                ? getStackRect(fromDomOwner, 'deck')
                : getZoneRect(fromDomOwner, fromZoneType, fromZoneIdx);
            const toRect = getStackRect(domOwner, 'graveyard');

            let hiddenEl: HTMLElement | null = null;
            if (fromLoc === 4 || fromLoc === 8) {
              hiddenEl = document.querySelector(
                `[data-zone-id="slot-${fromDomOwner}-${fromZoneType}-${fromZoneIdx}"] .field-card`,
              ) as HTMLElement | null;
            }
            if (hiddenEl) { hiddenEl.style.opacity = '0'; hiddenEl.style.visibility = 'hidden'; }

            await playCardFlight({
              code: moveEvt.code || 0,
              cardName: moveEvt.cardName,
              fromRect,
              toRect,
              type: 'destroy-gy',
              durationMs: 440,
            });

          } else if (toLoc === 4 && (fromLoc === 16 || fromLoc === 32 || fromLoc === 64)) {
            // GY / Banished / Extra Deck → Monster Zone (special summon from pile)
            // Issue 3: source may be the opponent's GY — use fromDomOwner
            audioManager.playSfx('summon-special');

            const fromRect = getStackRect(
              fromDomOwner,
              fromLoc === 16 ? 'graveyard' : fromLoc === 32 ? 'banished' : 'extra',
            ) || getHandFanRect(fromDomOwner);
            const toRect = getZoneRect(domOwner, 'monster', toSeq);
            await playCardFlight({
              code: isFaceup || p === duelStore.userPlayerId ? (moveEvt.code || 0) : 0,
              cardName: moveEvt.cardName || 'Monster',
              fromRect,
              toRect,
              type: 'summon',
              isFacedown,
              isDefense,
              durationMs: 480,
            });

          } else if (toLoc === 32) {
            // → Banished (from monster zone, spell zone, field zone, or GY)
            audioManager.playSfx('card-banish');

            // Issue F: field zone uses index 0
            const isFromField = fromLoc === 8 && fromSeq === 5;
            const fromZoneType = fromLoc === 8 ? (isFromField ? 'field' : 'spell-trap') : 'monster';
            const fromZoneIdx  = isFromField ? 0 : fromSeq;

            const fromRect =
              fromLoc === 16
                ? getStackRect(fromDomOwner, 'graveyard')
                : getZoneRect(fromDomOwner, fromZoneType, fromZoneIdx);
            const toRect = getStackRect(domOwner, 'banished');

            let hiddenEl: HTMLElement | null = null;
            if (fromLoc === 4 || fromLoc === 8) {
              hiddenEl = document.querySelector(
                `[data-zone-id="slot-${fromDomOwner}-${fromZoneType}-${fromZoneIdx}"] .field-card`,
              ) as HTMLElement | null;
            }
            if (hiddenEl) { hiddenEl.style.opacity = '0'; hiddenEl.style.visibility = 'hidden'; }

            await playCardFlight({
              code: moveEvt.code || 0,
              cardName: moveEvt.cardName,
              fromRect,
              toRect,
              type: 'banish',
              durationMs: 440,
            });

          } else if (toLoc === 2 && fromLoc !== 2) {
            // Issue J: Card returning to hand ("bounce" — Compulsory Evacuation Device,
            // Book of Moon, etc.). Animate from the field zone to the hand fan.
            audioManager.playSfx('card-to-gy'); // closest SFX we have for "whoosh back"

            // Issue F: field zone uses index 0
            const isFromField = fromLoc === 8 && fromSeq === 5;
            const fromZoneType = fromLoc === 8 ? (isFromField ? 'field' : 'spell-trap') : 'monster';
            const fromZoneIdx  = isFromField ? 0 : fromSeq;

            const fromRect =
              fromLoc === 4 || fromLoc === 8
                ? getZoneRect(domOwner, fromZoneType, fromZoneIdx)
                : fromLoc === 16 ? getStackRect(domOwner, 'graveyard')
                : fromLoc === 32 ? getStackRect(domOwner, 'banished')
                : null;
            const toRect = getHandFanRect(domOwner);

            // Hide the source zone card during the bounce flight
            let hiddenEl: HTMLElement | null = null;
            if (fromLoc === 4 || fromLoc === 8) {
              hiddenEl = document.querySelector(
                `[data-zone-id="slot-${domOwner}-${fromZoneType}-${fromZoneIdx}"] .field-card`,
              ) as HTMLElement | null;
            }
            if (hiddenEl) { hiddenEl.style.opacity = '0'; hiddenEl.style.visibility = 'hidden'; }

            if (fromRect) {
              await playCardFlight({
                code: isFaceup || p === duelStore.userPlayerId ? (moveEvt.code || 0) : 0,
                cardName: moveEvt.cardName || 'Card',
                fromRect,
                toRect,
                type: 'draw',
                durationMs: 380,
              });
            }
            // hiddenEl will be destroyed by Vue when handleEngineEvent removes
            // the card from the zone, so no need to restore its visibility.
          }
        } // end else-traditional
      } // end else-if MOVE

      // -----------------------------------------------------------------------
      // 3. Chaining / Spell Activation Visual Pause
      // -----------------------------------------------------------------------
      else if (event.type === 'CHAINING') {
        audioManager.playSfx('chain-link');
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      // -----------------------------------------------------------------------
      // 4. Attack Declaration
      // -----------------------------------------------------------------------
      else if (event.type === 'ATTACK') {
        const atkEvt = event as any;
        const p = (atkEvt.controller ??
          (duelStore.boardState.userField.isTurn
            ? duelStore.userPlayerId
            : duelStore.opponentPlayerId)) as 0 | 1;
        const opp = (p === duelStore.userPlayerId
          ? duelStore.opponentPlayerId
          : duelStore.userPlayerId) as 0 | 1;
        const oppDomOwner = toDomOwner(opp);
        const seq = atkEvt.sequence ?? (atkEvt.card?.sequence ?? 0);
        const fromRect = getZoneRect(toDomOwner(p), 'monster', seq);
        const toRect = atkEvt.target
          ? getZoneRect(toDomOwner(atkEvt.target.controller), 'monster', atkEvt.target.sequence)
          : getHandFanRect(oppDomOwner) || getAvatarRect(oppDomOwner);

        audioManager.playSfx('attack-declare');
        setTimeout(() => {
          if (atkEvt.target) {
            audioManager.playSfx('attack-clash');
          } else {
            audioManager.playSfx('attack-direct');
          }
        }, 180);

        await playCardFlight({
          code: 0,
          cardName: 'Battle Attack',
          fromRect,
          toRect,
          type: 'attack',
          durationMs: 440,
        });
      }

      // -----------------------------------------------------------------------
      // 5. Monster Position Change / Flip Summon
      // -----------------------------------------------------------------------
      else if (event.type === 'POS_CHANGE' || event.type === 'FLIPSUMMONING') {
        const p = (event.controller ?? duelStore.userPlayerId) as 0 | 1;
        const domOwner = toDomOwner(p);
        const seq = event.sequence ?? 0;
        const fromRect = getZoneRect(domOwner, 'monster', seq);

        if (event.type === 'FLIPSUMMONING') {
          audioManager.playSfx('summon-flip');
        } else {
          audioManager.playSfx('position-change');
        }

        await playCardFlight({
          code: event.code || 0,
          cardName: event.cardName || 'Position Change',
          fromRect,
          toRect: fromRect,
          type: event.type === 'FLIPSUMMONING' ? 'flip' : 'pos-change',
          isFacedown: event.position === 8,
          isDefense: event.position === 4 || event.position === 8,
          durationMs: 360,
        });
      }

      else if (event.type === 'NEW_PHASE') {
        audioManager.playSfx('phase-change');
      }

      else if (event.type === 'NEW_TURN') {
        audioManager.playSfx('turn-start');
      }

      else if (event.type === 'TOSS_DICE') {
        const diceResults = ((event as any).results && (event as any).results.length > 0
          ? (event as any).results
          : [1]) as number[];
        audioManager.playSfx('ui-click');
        activeTossPayload.value = {
          type: 'dice',
          player: event.player ?? 0,
          results: diceResults,
        };
        await new Promise<void>((r) => setTimeout(r, 1400));
        activeTossPayload.value = null;
      }

      else if (event.type === 'TOSS_COIN') {
        const coinResults = ((event as any).results && (event as any).results.length > 0
          ? (event as any).results
          : [true]) as boolean[];
        audioManager.playSfx('coin-flip');
        activeTossPayload.value = {
          type: 'coin',
          player: event.player ?? 0,
          results: coinResults,
        };
        await new Promise<void>((r) => setTimeout(r, 1400));
        activeTossPayload.value = null;
      }

      else if (event.type === 'SHUFFLE_DECK' || event.type === 'SHUFFLE_HAND') {
        audioManager.playSfx('deck-shuffle');
      }

      // -----------------------------------------------------------------------
      // Apply store state change AFTER animation (for events not handled early).
      // -----------------------------------------------------------------------
      if (!eventHandled) {
        await duelStore.handleEngineEvent(event);
      }

      // Prompt events: deferred full board sync, safe because all prior queue
      // tasks (and thus all animations) have already completed.
      if (
        event.isPrompt &&
        event.promptPlayer === duelStore.userPlayerId &&
        event.type !== 'WIN'
      ) {
        audioManager.playSfx('prompt-alert');
        await duelStore.fetchBoardState();
      }

      if (event.type === 'WIN') {
        const isWin = duelStore.boardState.winner === duelStore.userPlayerId ||
          event.player === duelStore.userPlayerId ||
          (event as any).winner === duelStore.userPlayerId;
        if (isWin) {
          audioManager.playSfx('match-victory');
        } else {
          audioManager.playSfx('match-defeat');
        }
        saveCurrentDuelLog();
      }
    });
  });
}

onMounted(async () => {
  await settingsStore.initializeSettings();

  if (window.duelAPI) {
    await setupEngineEventListener();
    if (window.duelAPI.playVideo) {
      unsubscribeVideo = window.duelAPI.playVideo((video) => {
        duelStore.handlePlayVideo(video);
      });
    }
  }

  // Start fresh prepared live duel
  await duelStore.startPreparedDuel();
});

onUnmounted(() => {
  if (unsubscribeEvents) {
    unsubscribeEvents();
  }
  if (unsubscribeVideo) {
    unsubscribeVideo();
  }
});
</script>

<style scoped lang="scss">
@use '../assets/styles/abstracts' as *;

.page-duel {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #06080a;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.duel-backdrop {
  position: absolute;
  inset: -20px;
  background-size: cover;
  background-position: center;
  filter: blur(28px) brightness(0.25) saturate(1.2);
  transform: scale(1.05);
  z-index: 0;
}

.duel-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    transparent 40%,
    rgba(6, 8, 10, 0.75) 80%,
    rgba(4, 5, 7, 0.96) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.duel-canvas-16-9 {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 177.78vh;
  max-height: 56.25vw;
  aspect-ratio: 16 / 9;
  display: grid;
  grid-template-rows: 52px 130px 1fr 130px;
  grid-template-columns: 100%;
  box-sizing: border-box;
  z-index: 10;
  box-shadow: 0 0 80px rgba(0, 0, 0, 0.9);
}

.duel-top-area {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 20;

  .opponent-hand-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .opponent-lp-wrapper {
    width: 280px;
    flex-shrink: 0;
  }
}

.duel-center-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 15;
}

.duel-bottom-area {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 20;

  .user-lp-wrapper {
    width: 280px;
    flex-shrink: 0;
  }

  .user-hand-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
  }
}

// Quick Zone Activations Floating Bar
.quick-zone-actions-bar {
  position: absolute;
  top: -46px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  border-radius: 24px;
  background: rgba(14, 18, 26, 0.92);
  border: 1px solid rgba(246, 224, 94, 0.5);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.85),
    0 0 20px rgba(236, 201, 75, 0.35);
  z-index: 50;
  animation: quick-bar-slide-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);

  .quick-actions-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Oxanium', monospace, sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #f6e05e;
    text-shadow: 0 0 8px rgba(246, 224, 94, 0.6);
    white-space: nowrap;

    .pulse-icon {
      font-size: 0.85rem;
      animation: pulse-quick-icon 1.2s infinite ease-in-out;
    }
  }

  .quick-actions-list {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quick-action-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px 4px 6px;
    background: rgba(26, 32, 44, 0.95);
    border: 1px solid rgba(246, 224, 94, 0.4);
    border-radius: 18px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);

    &:hover {
      transform: translateY(-2px) scale(1.04);
      background: rgba(45, 55, 72, 0.98);
      border-color: #ecc94b;
      box-shadow:
        0 4px 14px rgba(0, 0, 0, 0.8),
        0 0 16px rgba(236, 201, 75, 0.6);
    }

    .zone-badge {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      background: rgba(236, 201, 75, 0.2);
      color: #ecc94b;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .quick-card-art {
      width: 20px;
      height: 28px;
      border-radius: 2px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .card-name {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      color: #f7fafc;
      white-space: nowrap;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .action-btn-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: linear-gradient(135deg, #d69e2e, #b7791f);
      border: 1px solid #ecc94b;
      border-radius: 12px;
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.68rem;
      font-weight: 700;
      color: #111;
      letter-spacing: 0.04em;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);

      &--sp_summon {
        background: linear-gradient(135deg, #4299e1, #3182ce);
        border-color: #63b3ed;
        color: #fff;
      }

      &--chain {
        background: linear-gradient(135deg, #9f7aea, #805ad5);
        border-color: #b794f4;
        color: #fff;
      }
    }
  }
}

@keyframes quick-bar-slide-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes pulse-quick-icon {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.25);
    opacity: 1;
  }
}

// Game Over Modal
.game-over-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(4, 6, 10, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.game-over-modal {
  width: 100%;
  max-width: 480px;
  padding: 36px 32px;
  border-radius: 20px;
  background: rgba(18, 22, 30, 0.96);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  text-align: center;
  animation: modalPop 0.35s cubic-bezier(0.22, 1, 0.36, 1);

  &--victory {
    border: 2px solid $color-gold-500;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.9),
      0 0 40px rgba(201, 162, 39, 0.4);

    .game-over-title {
      color: $color-gold-100;
      text-shadow: 0 0 20px rgba(201, 162, 39, 0.8);
    }
  }

  &--defeat {
    border: 2px solid #eb5757;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.9),
      0 0 40px rgba(235, 87, 87, 0.4);

    .game-over-title {
      color: #ff9999;
      text-shadow: 0 0 20px rgba(235, 87, 87, 0.8);
    }
  }
}

// Floating Target Selection Confirmation Bar (On-Field micro-dialog)
.target-confirmation-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 24px;
  border-radius: 30px;
  background: rgba(14, 18, 26, 0.92);
  border: 1px solid $color-gold-500;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.85),
    0 0 24px rgba(201, 162, 39, 0.4);
  backdrop-filter: blur(12px);
  z-index: 400;
  animation: modalPop 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.target-bar-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .target-bar-icon {
    font-size: 1.4rem;
  }

  .target-bar-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .target-bar-title {
    font-family: 'Cinzel', serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: $color-gold-100;
    letter-spacing: 0.04em;
  }

  .target-bar-detail {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.8rem;
    color: rgba(245, 241, 230, 0.8);
  }
}

.target-bar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.micro-btn {
  padding: 8px 18px;
  border-radius: 20px;
  font-family: 'Oxanium', monospace, sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &--confirm {
    background: $color-gold-500;
    border: 1px solid $color-gold-300;
    color: #1a1406;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);

    &:hover:not(:disabled) {
      background: $color-gold-300;
      box-shadow: 0 4px 14px rgba(201, 162, 39, 0.6);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &--cancel {
    background: rgba(30, 36, 48, 0.7);
    border: 1px solid rgba(201, 162, 39, 0.35);
    color: #f5f1e6;

    &:hover {
      background: rgba(201, 162, 39, 0.2);
      border-color: $color-gold-300;
      transform: translateY(-2px);
    }
  }

  &--browse {
    background: rgba(66, 153, 225, 0.25);
    border: 1px solid #63b3ed;
    color: #bee3f8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);

    &:hover {
      background: rgba(66, 153, 225, 0.45);
      border-color: #90cdf4;
      box-shadow: 0 4px 14px rgba(66, 153, 225, 0.5);
      transform: translateY(-2px);
    }
  }
}

.game-over-banner {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.game-over-title {
  margin: 0;
  font-family: 'Cinzel', serif;
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.game-over-subtitle {
  margin: 0;
  font-family: 'Barlow Semi Condensed', sans-serif;
  font-size: 1.1rem;
  color: rgba(245, 241, 230, 0.85);
}

.game-over-actions {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
}

.dev-floating-controls {
  position: fixed;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 500;
  background: rgba(14, 18, 26, 0.88);
  padding: 4px 8px;
  border-radius: 20px;
  border: 1px solid rgba(201, 162, 39, 0.3);
  backdrop-filter: blur(6px);
}

.dev-pill-btn {
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid rgba(201, 162, 39, 0.2);
  background: rgba(26, 32, 44, 0.8);
  color: #f5f1e6;
  font-family: 'Oxanium', monospace, sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    background: rgba(201, 162, 39, 0.25);
    border-color: $color-gold-300;
    color: $color-gold-100;
  }

  &--active {
    background: rgba(201, 162, 39, 0.35);
    border-color: $color-gold-500;
    color: $color-gold-100;
  }
}

.action-btn {
  padding: 12px 28px;
  border-radius: 10px;
  font-family: 'Oxanium', monospace, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &--primary {
    background: $color-gold-500;
    border: 1px solid $color-gold-300;
    color: #1a1406;

    &:hover {
      background: $color-gold-300;
      box-shadow: 0 4px 16px rgba(201, 162, 39, 0.5);
      transform: translateY(-2px);
    }
  }

  &--secondary {
    background: rgba(30, 36, 48, 0.7);
    border: 1px solid rgba(201, 162, 39, 0.3);
    color: #f5f1e6;

    &:hover {
      background: rgba(201, 162, 39, 0.2);
      border-color: $color-gold-300;
      transform: translateY(-2px);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalPop {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
