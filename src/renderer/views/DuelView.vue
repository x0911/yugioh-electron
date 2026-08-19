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
      <!-- 1. Top HUD Bar -->
      <DuelHud
        :turn-number="boardState.turnNumber"
        :current-phase="boardState.currentPhase"
        :is-user-turn="boardState.userField.isTurn"
        :guide-text="boardState.phaseGuideText"
        :is-duel-log-open="isDuelLogOpen"
        @open-menu="isMenuOpen = true"
        @toggle-log="isDuelLogOpen = !isDuelLogOpen"
      />

      <!-- 2. Top Area: Opponent Hand & Opponent LP Meter -->
      <section class="duel-top-area">
        <!-- Opponent Hand Fan (Card Backs) -->
        <div class="opponent-hand-wrapper">
          <HandFan
            player="ai"
            :cards="boardState.opponentField.hand"
            @hover-card="hoveredCard = $event"
          />
        </div>

        <!-- Opponent LP Meter -->
        <div class="opponent-lp-wrapper">
          <LifePointsMeter
            player="ai"
            :name="boardState.opponentField.name"
            :title="boardState.opponentField.title"
            :series="boardState.opponentField.series"
            :character-id="boardState.opponentField.characterId"
            :current-lp="boardState.opponentField.currentLp"
            :max-lp="boardState.opponentField.maxLp"
            :is-turn="boardState.opponentField.isTurn"
          />
        </div>
      </section>

      <!-- 3. Center Area: Duel Field with all 14+ Zones -->
      <section class="duel-center-area">
        <DuelField
          :user-state="boardState.userField"
          :opponent-state="boardState.opponentField"
          :extra-monster-zones="boardState.extraMonsterZones"
          @hover-card="hoveredCard = $event"
          @click-card="onFieldCardClick"
        />
      </section>

      <!-- 4. Bottom Area: User LP Meter & User Hand -->
      <section class="duel-bottom-area">
        <!-- User LP Meter -->
        <div class="user-lp-wrapper">
          <LifePointsMeter
            player="user"
            :name="boardState.userField.name"
            :title="boardState.userField.title"
            :series="boardState.userField.series"
            :character-id="boardState.userField.characterId"
            :current-lp="boardState.userField.currentLp"
            :max-lp="boardState.userField.maxLp"
            :is-turn="boardState.userField.isTurn"
          />
        </div>

        <!-- User Hand Fan (Full Cards) -->
        <div class="user-hand-wrapper">
          <HandFan
            player="user"
            :cards="boardState.userField.hand"
            @hover-card="hoveredCard = $event"
            @click-card="onHandCardClick"
          />
        </div>
      </section>
    </main>

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

    <!-- Floating Dev QA Toolbar (Toggle between Mock Field & Live Engine) -->
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
        v-if="isMockMode && boardState.userField.hand.length !== 5"
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
import type { FieldCard, DuelBoardState } from '../../shared/types/field.js';
import type { DuelEventPayload } from '../../shared/types/duel.js';
import { createMockDuelState } from '../utils/mockDuelState.js';
import { getBackgroundUrl } from '../utils/media.js';
import { useDuelStore } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import {
  DuelHud,
  DuelField,
  LifePointsMeter,
  HandFan,
  CardPreviewPopup,
  DuelMenuModal,
  DuelLogPanel,
} from '../components/duel/index.js';

interface LogItem {
  time: string;
  type: string;
  description: string;
}

const duelStore = useDuelStore();
const settingsStore = useSettingsStore();

// Modals and Drawers
const isMenuOpen = ref(false);
const isDuelLogOpen = ref(false);
const isMockMode = ref(true); // Default to mock static field for Phase 9 verification

// Hover-previewed card state
const hoveredCard = ref<FieldCard | null>(null);

// Board State (initialized with rich mock state)
const boardState = reactive<DuelBoardState>(createMockDuelState());

// Live Logs
const duelLogs = ref<LogItem[]>([
  {
    time: '00:01.0',
    type: 'DUEL_START',
    description: 'Duel initiated: Yugi Muto vs Seto Kaiba in the Ancient Duel Arena.',
  },
  {
    time: '00:01.2',
    type: 'DRAW',
    description: 'Player 0 (Yugi) drew 5 starting cards.',
  },
  {
    time: '00:01.3',
    type: 'DRAW',
    description: 'Player 1 (Kaiba) drew 5 starting cards.',
  },
  {
    time: '00:02.1',
    type: 'SUMMON',
    description: 'Yugi Normal Summoned "Dark Magician" (2500/2100) in Attack Position.',
  },
  {
    time: '00:02.5',
    type: 'SET',
    description: 'Yugi Set "Celtic Guardian" in Defense Position.',
  },
  {
    time: '00:02.8',
    type: 'SPELL_ACTIVATE',
    description: 'Yugi activated Field Spell "Yami". Fiend and Spellcaster monsters gain 200 ATK/DEF.',
  },
  {
    time: '00:03.4',
    type: 'SUMMON',
    description: 'Kaiba Normal Summoned "Blue-Eyes White Dragon" (3000/2500) in Attack Position.',
  },
]);

// Sample Cards Pool for Extra Hand Draw QA
const sampleCardsPool: Omit<FieldCard, 'id' | 'sequence'>[] = [
  {
    code: 55144522,
    name: 'Pot of Greed',
    controller: 0,
    location: 'hand',
    position: 'faceup_spell',
    level: 0,
    attribute: 'SPELL',
    race: 'Normal',
    description: 'Draw 2 cards from your Deck.',
  },
  {
    code: 53129443,
    name: 'Dark Hole',
    controller: 0,
    location: 'hand',
    position: 'faceup_spell',
    level: 0,
    attribute: 'SPELL',
    race: 'Normal',
    description: 'Destroy all monsters on the field.',
  },
  {
    code: 70781052,
    name: 'Summoned Skull',
    controller: 0,
    location: 'hand',
    position: 'faceup_attack',
    atk: 2500,
    def: 1200,
    baseAtk: 2500,
    baseDef: 1200,
    level: 6,
    attribute: 'DARK',
    race: 'Fiend',
    description: 'A fiend with dark powers for confusing the enemy. Boasts considerable strength.',
  },
  {
    code: 26202165,
    name: 'Sangan',
    controller: 0,
    location: 'hand',
    position: 'faceup_attack',
    atk: 1000,
    def: 600,
    baseAtk: 1000,
    baseDef: 600,
    level: 3,
    attribute: 'DARK',
    race: 'Fiend',
    description: 'If this card is sent from the field to the GY: Add 1 monster with 1500 or less ATK from your Deck to your hand.',
  },
  {
    code: 78193831,
    name: 'Buster Blader',
    controller: 0,
    location: 'hand',
    position: 'faceup_attack',
    atk: 2600,
    def: 2300,
    baseAtk: 2600,
    baseDef: 2300,
    level: 7,
    attribute: 'EARTH',
    race: 'Warrior',
    description: 'Gains 500 ATK for each Dragon monster your opponent controls or is in their GY.',
  },
];

/**
 * Sticky previewer: shows hovered card, or falls back to user's first monster.
 */
const activePreviewCard = computed<FieldCard | null>(() => {
  if (hoveredCard.value) return hoveredCard.value;
  // Fallback to active monster on field for immediate inspection
  return boardState.userField.monsterZones[0] || null;
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
    Object.assign(boardState, createMockDuelState());
    appendLog('MODE', 'Switched to Static Mock Field State (Phase 9 QA).');
  } else {
    appendLog('MODE', 'Switched to Live Engine Duel State.');
  }
}

function drawMockCard(): void {
  const sample = sampleCardsPool[boardState.userField.hand.length % sampleCardsPool.length];
  const newCard: FieldCard = {
    ...sample,
    id: `hand-extra-${Date.now()}-${boardState.userField.hand.length}`,
    sequence: boardState.userField.hand.length,
  };
  boardState.userField.hand.push(newCard);

  // Also draw for opponent to test both sides
  boardState.opponentField.hand.push({
    id: `hand-ai-extra-${Date.now()}`,
    code: 0,
    name: 'Hidden Card',
    controller: 1,
    location: 'hand',
    sequence: boardState.opponentField.hand.length,
    position: 'facedown_spell',
  });

  appendLog('DRAW', `Drew "${newCard.name}". Hand size now: ${boardState.userField.hand.length} cards.`);
}

function resetMockHand(): void {
  const fresh = createMockDuelState();
  boardState.userField.hand = fresh.userField.hand;
  boardState.opponentField.hand = fresh.opponentField.hand;
  appendLog('HAND', 'Reset hand size to default 5 cards.');
}

/**
 * Cycle through battle positions on User MMZ 0 & 1 for interactive QA.
 */
function cycleMockPositions(): void {
  const dm = boardState.userField.monsterZones[0];
  if (dm) {
    if (dm.position === 'faceup_attack') {
      dm.position = 'faceup_defense';
      appendLog('POSITION', 'Dark Magician shifted to Face-up Defense Position (Rotated 90°).');
    } else if (dm.position === 'faceup_defense') {
      dm.position = 'facedown_defense';
      appendLog('POSITION', 'Dark Magician shifted to Face-down Defense "Set" Position (Card Back).');
    } else {
      dm.position = 'faceup_attack';
      dm.name = 'Dark Magician';
      appendLog('POSITION', 'Dark Magician shifted to Face-up Attack Position.');
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

function onFieldCardClick(card: FieldCard | null): void {
  if (!card) return;
  hoveredCard.value = card;
  appendLog('SELECT', `Selected field card: ${card.name} (${card.position})`);
}

function onHandCardClick(card: FieldCard): void {
  hoveredCard.value = card;
  appendLog('SELECT', `Selected hand card: ${card.name}`);
}

function onRestartMatch(): void {
  Object.assign(boardState, createMockDuelState());
  appendLog('RESTART', 'Match restarted with fresh initial field state.');
}

function onSurrender(): void {
  appendLog('SURRENDER', 'Player surrendered the match.');
}

let unsubscribeEvents: (() => void) | null = null;

function handleLiveDuelEvent(event: DuelEventPayload): void {
  if (isMockMode.value) return;
  appendLog(event.type, event.description);
  if (event.turn !== undefined) boardState.turnNumber = event.turn;
  if (event.phase !== undefined) {
    boardState.currentPhase = (event.phase as DuelBoardState['currentPhase']) || 'M1';
  }
}

onMounted(async () => {
  await settingsStore.initializeSettings();
  if (duelStore.selectedOpponent) {
    boardState.opponentField.name = duelStore.selectedOpponent.name;
    boardState.opponentField.title = duelStore.selectedOpponent.title;
    boardState.opponentField.series = duelStore.selectedOpponent.series;
    boardState.opponentField.characterId = duelStore.selectedOpponent.id;
  }

  if (window.duelAPI) {
    unsubscribeEvents = window.duelAPI.onEvent(handleLiveDuelEvent);
  }
});

onUnmounted(() => {
  if (unsubscribeEvents) {
    unsubscribeEvents();
  }
});
</script>
