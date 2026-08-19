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
        :can-go-to-battle-phase="!isMockMode && duelStore.canGoToBattlePhase"
        :can-go-to-main-phase2="!isMockMode && duelStore.canGoToMainPhase2"
        :can-end-turn="!isMockMode && duelStore.canEndTurn"
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
            @hover-card="hoveredCard = $event"
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
          @hover-card="hoveredCard = $event"
          @click-card="onFieldCardClick"
          @click-target="onTargetClick"
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

        <!-- User Hand Fan (Full Cards) -->
        <div class="user-hand-wrapper">
          <HandFan
            player="user"
            :cards="currentBoardState.userField.hand"
            :get-target-info="(card, idx) => duelStore.getTargetInfo(duelStore.userPlayerId, 2, card.sequence ?? idx)"
            :is-prompt-active="duelStore.hasActiveSelectionPrompt"
            @hover-card="hoveredCard = $event"
            @click-card="onHandCardClick"
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

    <!-- Interactive Prompt Modal (End Phase Hand-Size Cleanup, Position, Chain, Effect Yes/No) -->
    <PromptModal
      :select-card="duelStore.activeSelectCard"
      :select-chain="duelStore.activeSelectChain"
      :select-position="duelStore.activeSelectPosition"
      :select-effect-yn="duelStore.activeSelectEffectYn"
      :select-option="duelStore.activeSelectOption"
      :select-tribute="duelStore.activeSelectTribute"
      :synced-selected-indices="duelStore.selectedTargetIndices"
      @select-card="duelStore.executeSelectCard"
      @select-position="duelStore.executeSelectPosition"
      @select-chain="duelStore.executeSelectChain"
      @select-effect-yn="duelStore.executeSelectEffectYn"
      @select-option="duelStore.executeSelectOption"
      @select-tribute="duelStore.executeSelectTribute"
      @toggle-target="duelStore.toggleTargetByIndex"
    />

    <!-- Floating Target Selection Confirmation Bar (On-Field micro-dialog) -->
    <div v-if="duelStore.hasActiveSelectionPrompt" class="target-confirmation-bar glass-panel">
      <div class="target-bar-info">
        <span class="target-bar-icon">{{ actionGuideInfo?.categoryIcon || '🎯' }}</span>
        <div class="target-bar-text">
          <span class="target-bar-title">{{ actionGuideInfo?.instruction }}</span>
          <span v-if="actionGuideInfo?.subText" class="target-bar-detail">{{ actionGuideInfo.subText }}</span>
        </div>
      </div>
      <div class="target-bar-actions">
        <button
          v-if="duelStore.activeSelectCard?.can_cancel"
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
            {{ isUserWinner ? 'You have defeated your opponent in battle!' : 'Your Life Points reached 0.' }}
          </p>
        </div>

        <div class="game-over-actions">
          <button class="action-btn action-btn--primary" @click="onRestartMatch">
            🔄 Rematch
          </button>
          <button class="action-btn action-btn--secondary" @click="returnToCharacters">
            🏠 Exit to Menu
          </button>
        </div>
      </div>
    </div>

    <!-- Side Card Previewer Popup (Hover-driven) -->
    <CardPreviewPopup
      :card="activePreviewCard"
      position="left"
      @close="hoveredCard = null"
    />

    <!-- In-Duel Pause Menu Modal -->
    <DuelMenuModal
      :is-open="isMenuOpen"
      @close="isMenuOpen = false"
      @restart="onRestartMatch"
      @surrender="onSurrender"
    />

    <!-- Slide-Out Duel Log Drawer -->
    <DuelLogPanel
      :is-open="isDuelLogOpen"
      :logs="duelLogs"
      @close="isDuelLogOpen = false"
      @clear="duelLogs = []"
    />

    <!-- Floating Dev QA Toolbar -->
    <aside class="dev-floating-controls">
      <button
        class="dev-pill-btn"
        :class="{ 'dev-pill-btn--active': isMockMode }"
        title="Toggle Static Mock State vs Live Engine"
        @click="toggleMode"
      >
        <span>{{ isMockMode ? '🧪 MOCK FIELD' : '⚙️ LIVE ENGINE' }}</span>
      </button>

      <button
        v-if="isMockMode"
        class="dev-pill-btn"
        title="Draw 1 extra card into hand (test up to 10+ cards)"
        @click="drawMockCard"
      >
        <span>🃏 +Draw Card</span>
      </button>

      <button
        v-if="isMockMode && mockBoardState.userField.hand.length !== 5"
        class="dev-pill-btn"
        title="Reset Hand to 5 cards"
        @click="resetMockHand"
      >
        <span>↩ Reset Hand</span>
      </button>

      <button
        v-if="isMockMode"
        class="dev-pill-btn"
        title="Cycle Monster Battle Positions for QA"
        @click="cycleMockPositions"
      >
        <span>🔄 Cycle Positions</span>
      </button>

      <button
        v-if="!isMockMode"
        class="dev-pill-btn"
        title="Step Live Engine Turn"
        @click="stepLiveDuel"
      >
        <span>⏩ Step</span>
      </button>

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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import type { FieldCard, DuelBoardState } from '../../shared/types/field.js';
import type { DuelEventPayload } from '../../shared/types/duel.js';
import { createMockDuelState } from '../utils/mockDuelState.js';
import { getBackgroundUrl } from '../utils/media.js';
import { useDuelStore, type CardActionOption, type TargetInfo } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
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
} from '../components/duel/index.js';
import {
  duelAnimationQueue,
  playCardFlight,
  getZoneRect,
  getHandCardRect,
  getHandFanRect,
  getStackRect,
  getAvatarRect,
} from '../utils/animationService.js';

interface LogItem {
  time: string;
  type: string;
  description: string;
}

const router = useRouter();
const duelStore = useDuelStore();
const settingsStore = useSettingsStore();

// Modals and Drawers
const isMenuOpen = ref(false);
const isDuelLogOpen = ref(false);
const isMockMode = ref(false); // Default to live engine mode for Phase 10!

// Hover-previewed card state
const hoveredCard = ref<FieldCard | null>(null);

// Card Action Menu State
const activeMenuCard = ref<FieldCard | null>(null);
const activeCardActions = ref<CardActionOption[]>([]);
const menuAnchorPos = ref<{ x: number; y: number } | null>(null);

// Mock Board State for testing fallback
const mockBoardState = reactive<DuelBoardState>(createMockDuelState());

// Reactive board state selector
const currentBoardState = computed<DuelBoardState>(() => {
  return isMockMode.value ? mockBoardState : duelStore.boardState;
});

const isUserWinner = computed(() => {
  return duelStore.boardState.winner === duelStore.userPlayerId;
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

// Live Logs
const duelLogs = ref<LogItem[]>([]);

const activePreviewCard = computed<FieldCard | null>(() => {
  if (hoveredCard.value && hoveredCard.value.code > 0) {
    return hoveredCard.value;
  }
  return currentBoardState.value.userField.monsterZones[0] || null;
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

function toggleMode(): void {
  isMockMode.value = !isMockMode.value;
  if (isMockMode.value) {
    Object.assign(mockBoardState, createMockDuelState());
    appendLog('MODE', 'Switched to Static Mock Field State.');
  } else {
    appendLog('MODE', 'Switched to Live Engine Duel State.');
  }
}

function onHandCardClick(card: FieldCard, event: MouseEvent): void {
  hoveredCard.value = card;
  if (isMockMode.value) {
    appendLog('SELECT', `Selected hand card: ${card.name}`);
    return;
  }

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

function onFieldCardClick(card: FieldCard | null, event?: MouseEvent): void {
  if (!card || card.code === 0) {
    closeCardActionMenu();
    return;
  }
  hoveredCard.value = card;

  if (isMockMode.value) {
    appendLog('SELECT', `Selected field card: ${card.name} (${card.position})`);
    return;
  }

  // If there is an active selection prompt (e.g. Target selection or Tribute)
  if (duelStore.hasActiveSelectionPrompt) {
    const loc = card.position === 'faceup_spell' || card.position === 'facedown_spell' ? 8 : 4;
    const target = duelStore.getTargetInfo(card.controller, loc, card.sequence ?? 0);
    if (target && target.isSelectable) {
      duelStore.toggleTargetByIndex(target.selectIndex);
      return;
    }
  }

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
  if (targetInfo.isSelectable) {
    duelStore.toggleTargetByIndex(targetInfo.selectIndex);
  }
}

async function onSelectCardAction(action: CardActionOption): Promise<void> {
  closeCardActionMenu();
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

function drawMockCard(): void {
  const sample = {
    code: 55144522,
    name: 'Pot of Greed',
    controller: 0 as const,
    location: 'hand' as const,
    position: 'faceup_spell' as const,
  };
  const newCard: FieldCard = {
    ...sample,
    id: `hand-extra-${Date.now()}-${mockBoardState.userField.hand.length}`,
    sequence: mockBoardState.userField.hand.length,
  };
  mockBoardState.userField.hand.push(newCard);
  mockBoardState.opponentField.hand.push({
    id: `hand-ai-extra-${Date.now()}`,
    code: 0,
    name: 'Hidden Card',
    controller: 1,
    location: 'hand',
    sequence: mockBoardState.opponentField.hand.length,
    position: 'facedown_spell',
  });
  appendLog('DRAW', `Drew "${newCard.name}". Hand size: ${mockBoardState.userField.hand.length} cards.`);
}

function resetMockHand(): void {
  const fresh = createMockDuelState();
  mockBoardState.userField.hand = fresh.userField.hand;
  mockBoardState.opponentField.hand = fresh.opponentField.hand;
  appendLog('HAND', 'Reset hand size to default 5 cards.');
}

function cycleMockPositions(): void {
  const dm = mockBoardState.userField.monsterZones[0];
  if (dm) {
    if (dm.position === 'faceup_attack') {
      dm.position = 'faceup_defense';
      appendLog('POSITION', 'Shifted to Face-up Defense Position.');
    } else if (dm.position === 'faceup_defense') {
      dm.position = 'facedown_defense';
      appendLog('POSITION', 'Shifted to Face-down Defense (Set) Position.');
    } else {
      dm.position = 'faceup_attack';
      appendLog('POSITION', 'Shifted to Face-up Attack Position.');
    }
  }
}

async function stepLiveDuel(): Promise<void> {
  if (window.duelAPI) {
    try {
      await window.duelAPI.step();
    } catch (err) {
      appendLog('ERROR', `Step failed: ${err}`);
    }
  }
}

async function onRestartMatch(): Promise<void> {
  isMenuOpen.value = false;
  closeCardActionMenu();
  if (isMockMode.value) {
    Object.assign(mockBoardState, createMockDuelState());
    appendLog('RESTART', 'Match restarted with fresh mock field.');
  } else {
    appendLog('RESTART', 'Restarting live duel...');
    await duelStore.startPreparedDuel();
  }
}

function onSurrender(): void {
  isMenuOpen.value = false;
  closeCardActionMenu();
  appendLog('SURRENDER', 'Player surrendered the match.');
  router.push('/characters');
}

function returnToCharacters(): void {
  router.push('/characters');
}

let unsubscribeEvents: (() => void) | null = null;

async function handleLiveDuelEvent(event: DuelEventPayload): Promise<void> {
  appendLog(event.type, event.description);
  if (isMockMode.value) return;

  await duelAnimationQueue.enqueue(async () => {
    // 1. Draw from Deck -> Hand
    if (event.type === 'DRAW' && event.player !== undefined) {
      const isHuman = event.player === duelStore.userPlayerId;
      const fromRect = getStackRect(event.player as 0 | 1, 'deck');
      const toRect = getHandFanRect(event.player as 0 | 1);
      const drawnCode = (event as any).drawn?.[0]?.code || event.code || 0;
      await playCardFlight({
        code: isHuman ? drawnCode : 0,
        cardName: event.cardName || 'Card Drawn',
        fromRect,
        toRect,
        type: 'draw',
        isFacedown: !isHuman,
        durationMs: 420,
      });
    }
    // 2. Normal or Special Summon
    else if ((event.type === 'SUMMONING' || event.type === 'SPSUMMONING') && event.controller !== undefined) {
      const p = event.controller as 0 | 1;
      const seq = event.sequence ?? 0;
      const fromRect = getHandCardRect(p, seq) || getHandFanRect(p);
      const toRect = getZoneRect(p, 'monster', seq);
      await playCardFlight({
        code: event.code || 0,
        cardName: event.cardName,
        fromRect,
        toRect,
        type: 'summon',
        isFacedown: false,
        isDefense: false,
        durationMs: 480,
      });
    }
    // 3. Set Card (Facedown)
    else if (event.type === 'SET' && event.controller !== undefined) {
      const p = event.controller as 0 | 1;
      const seq = event.sequence ?? 0;
      const isSpell = event.location === 8;
      const fromRect = getHandCardRect(p, seq) || getHandFanRect(p);
      const toRect = getZoneRect(p, isSpell ? 'spell-trap' : 'monster', seq);
      await playCardFlight({
        code: event.code || 0,
        cardName: event.cardName,
        fromRect,
        toRect,
        type: isSpell ? 'set-spell' : 'set-monster',
        isFacedown: true,
        isDefense: !isSpell,
        durationMs: 480,
      });
    }
    // 4. Card Move (Destroy to GY, Discard, Banish)
    else if (event.type === 'MOVE') {
      const moveEvt = event as any;
      const p = moveEvt.controller as 0 | 1;
      const fromLoc = moveEvt.fromLocation;
      const fromSeq = moveEvt.fromSequence ?? 0;
      const toLoc = moveEvt.toLocation;

      if (toLoc === 16) {
        // Graveyard
        const fromRect =
          fromLoc === 2
            ? getHandCardRect(p, fromSeq) || getHandFanRect(p)
            : getZoneRect(p, fromLoc === 8 ? 'spell-trap' : 'monster', fromSeq);
        const toRect = getStackRect(p, 'graveyard');
        await playCardFlight({
          code: moveEvt.code || 0,
          cardName: moveEvt.cardName,
          fromRect,
          toRect,
          type: fromLoc === 2 ? 'discard' : 'destroy-gy',
          durationMs: 440,
        });
      } else if (toLoc === 32) {
        // Banished
        const fromRect =
          fromLoc === 2
            ? getHandCardRect(p, fromSeq) || getHandFanRect(p)
            : getZoneRect(p, fromLoc === 8 ? 'spell-trap' : 'monster', fromSeq);
        const toRect = getStackRect(p, 'banished');
        await playCardFlight({
          code: moveEvt.code || 0,
          cardName: moveEvt.cardName,
          fromRect,
          toRect,
          type: 'banish',
          durationMs: 440,
        });
      }
    }
    // 5. Attack Declaration & Surge
    else if (event.type === 'ATTACK') {
      const atkEvt = event as any;
      const p = (atkEvt.controller ?? (duelStore.boardState.userField.isTurn ? duelStore.userPlayerId : duelStore.opponentPlayerId)) as 0 | 1;
      const opp = (p === duelStore.userPlayerId ? duelStore.opponentPlayerId : duelStore.userPlayerId) as 0 | 1;
      const seq = atkEvt.sequence ?? 0;
      const fromRect = getZoneRect(p, 'monster', seq);
      const toRect = atkEvt.target
        ? getZoneRect(atkEvt.target.controller, 'monster', atkEvt.target.sequence)
        : getAvatarRect(opp);
      await playCardFlight({
        code: atkEvt.code || 0,
        cardName: 'Attack Surge',
        fromRect,
        toRect,
        type: 'attack',
        durationMs: 380,
      });
    }

    // Update store
    await duelStore.handleEngineEvent(event);
  });
}

onMounted(async () => {
  await settingsStore.initializeSettings();

  if (window.duelAPI) {
    unsubscribeEvents = window.duelAPI.onEvent(handleLiveDuelEvent);
  }

  // Start fresh prepared live duel
  await duelStore.startPreparedDuel();
});

onUnmounted(() => {
  if (unsubscribeEvents) {
    unsubscribeEvents();
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
