<template>
  <div class="duel-debug-container">
    <!-- Top Control Bar -->
    <div class="debug-panel glass-panel glass-panel--accent-gold">
      <div class="panel-header">
        <div class="title-group">
          <span class="icon">⚔️</span>
          <h2>Ancient Duel Arena — Phase 2 Engine Debug View</h2>
        </div>
        <div class="status-badge" :class="{ 'status-badge--active': duelState.isActive }">
          {{ duelState.isActive ? 'DUEL IN PROGRESS' : 'ENGINE IDLE' }}
        </div>
      </div>

      <div class="controls-row">
        <button class="btn btn-primary" :disabled="duelState.isActive" @click="startYugiVsKaiba">
          ▶ Start Duel (Yugi vs Kaiba — DM Era)
        </button>
        <button class="btn btn-primary" :disabled="duelState.isActive" @click="startJadenVsZane">
          ▶ Start Duel (Jaden vs Zane — GX Era)
        </button>
        <button class="btn btn-secondary" :disabled="!duelState.isActive" @click="stepDuel">
          ⏩ Next Step
        </button>
        <button
          class="btn"
          :class="isAutoPlaying ? 'btn-danger' : 'btn-accent'"
          :disabled="!duelState.isActive"
          @click="toggleAutoPlay"
        >
          {{ isAutoPlaying ? '⏹ Pause Auto-Play' : '⚡ Auto-Play Duel' }}
        </button>
        <button class="btn btn-outline" @click="clearLog">🗑 Clear Log</button>
      </div>
    </div>

    <!-- Live Duel HUD Scoreboard -->
    <div class="scoreboard-row">
      <!-- Player 0 (Human / P1) -->
      <div class="player-card glass-panel" :class="{ 'player-card--active': isPlayer0Active }">
        <div class="player-header">
          <span class="player-name">Player 0 (User / P1)</span>
          <span class="player-tag">YOU</span>
        </div>
        <div class="lp-display">
          <span class="lp-label">LP</span>
          <span class="lp-value" :class="{ 'lp-value--low': duelState.p0LP <= 2000 }">
            {{ duelState.p0LP }}
          </span>
        </div>
        <div class="lp-bar">
          <div
            class="lp-fill lp-fill--p0"
            :style="{ width: `${Math.min(100, (duelState.p0LP / 8000) * 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Turn & Phase Center Indicator -->
      <div class="center-info glass-panel">
        <div class="turn-box">
          <span class="label">TURN</span>
          <span class="value">{{ duelState.currentTurn || '—' }}</span>
        </div>
        <div class="phase-box">
          <span class="label">PHASE</span>
          <span class="value phase-text">{{ duelState.currentPhase }}</span>
        </div>
        <div v-if="duelState.isWaitingResponse" class="waiting-indicator">
          Waiting for Player {{ duelState.waitingPlayer }}...
        </div>
      </div>

      <!-- Player 1 (Opponent / AI) -->
      <div class="player-card glass-panel" :class="{ 'player-card--active': isPlayer1Active }">
        <div class="player-header">
          <span class="player-name">Player 1 (Opponent / P2)</span>
          <span class="player-tag player-tag--ai">AI</span>
        </div>
        <div class="lp-display">
          <span class="lp-label">LP</span>
          <span class="lp-value" :class="{ 'lp-value--low': duelState.p1LP <= 2000 }">
            {{ duelState.p1LP }}
          </span>
        </div>
        <div class="lp-bar">
          <div
            class="lp-fill lp-fill--p1"
            :style="{ width: `${Math.min(100, (duelState.p1LP / 8000) * 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Victory Banner if duel finished -->
    <div v-if="duelState.winner !== null" class="victory-banner glass-panel">
      🎉 DUEL FINISHED! WINNER: PLAYER {{ duelState.winner }} ({{
        duelState.winner === 0 ? 'Player 0 / User' : 'Player 1 / Opponent'
      }}) — Reason: {{ getWinReasonText(duelState.winReason) }}
    </div>

    <!-- Live Event Log -->
    <div class="log-panel glass-panel">
      <div class="log-header">
        <h3>📜 Live Duel Event Stream (Real Cards from Filtered Pool)</h3>
        <span class="log-count">{{ logs.length }} events</span>
      </div>
      <div ref="logContainer" class="log-content">
        <div v-if="logs.length === 0" class="log-empty">
          Click "Start Duel" above to launch a real-time duel simulation powered by ygopro-core.
        </div>
        <div
          v-for="(item, idx) in logs"
          :key="idx"
          class="log-item"
          :class="[`log-item--${item.type.toLowerCase()}`]"
        >
          <span class="log-time">[{{ item.time }}]</span>
          <span class="log-type-tag">{{ item.type }}</span>
          <span class="log-text">{{ item.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue';
import type { DuelEventPayload, DuelStateSummary } from '../../shared/types/duel.js';

interface LogEntry {
  time: string;
  type: string;
  description: string;
}

const logs = ref<LogEntry[]>([]);
const logContainer = ref<HTMLElement | null>(null);
const isAutoPlaying = ref(false);
let autoPlayTimer: ReturnType<typeof setInterval> | null = null;
let unsubscribeEvents: (() => void) | null = null;

const duelState = reactive<DuelStateSummary>({
  isActive: false,
  isWaitingResponse: false,
  waitingPlayer: null,
  currentTurn: 0,
  currentPhase: 'DRAW',
  p0LP: 8000,
  p1LP: 8000,
  winner: null,
  winReason: null,
  stepCount: 0,
});

const isPlayer0Active = computed(() => {
  return duelState.isActive && duelState.waitingPlayer === 0;
});

const isPlayer1Active = computed(() => {
  return duelState.isActive && duelState.waitingPlayer === 1;
});

function formatTime(): string {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(Math.floor(d.getMilliseconds() / 100))}`;
}

function appendLog(type: string, description: string): void {
  logs.value.push({
    time: formatTime(),
    type,
    description,
  });

  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
}

function clearLog(): void {
  logs.value = [];
}

function getWinReasonText(reason: number | null): string {
  if (reason === 1) return 'Opponent LP Reduced to 0';
  if (reason === 2) return 'Opponent Deck Out (Cannot Draw)';
  if (reason === 3) return 'Surrender / Forfeit';
  return `Code ${reason}`;
}

// 40-Card Yugi Deck (Real cards from DM filtered card pool)
const YUGI_DECK = [
  46986414,
  46986414,
  46986414, // Dark Magician x3
  70781052,
  70781052, // Summoned Skull x2
  91152256,
  91152256,
  91152256, // Celtic Guardian x3
  40640057,
  40640057,
  40640057, // Kuriboh x3
  26202165,
  26202165,
  26202165, // Sangan x3
  78193831,
  78193831, // Buster Blader x2
  13039848,
  13039848,
  13039848, // Giant Soldier of Stone x3
  15025844,
  15025844, // Mystical Elf x2
  41392891,
  41392891, // Feral Imp x2
  90357090,
  90357090, // Silver Fang x2
  55144522,
  55144522, // Pot of Greed x2
  12580477,
  12580477, // Raigeki x2
  53129443, // Dark Hole x1
  46130346,
  46130346, // Hinotama x2
  4206964,
  4206964,
  4206964, // Trap Hole x3
  44095762,
  44095762, // Mirror Force x2
  24068492,
  24068492, // Just Desserts x2
];

// 40-Card Kaiba Deck (Real cards from DM filtered card pool)
const KAIBA_DECK = [
  89631139,
  89631139,
  89631139, // Blue-Eyes White Dragon x3
  14898066,
  14898066,
  14898066, // Vorse Raider x3
  5053103,
  5053103,
  5053103, // Battle Ox x3
  97590747,
  97590747,
  97590747, // La Jinn the Mystical Genie of the Lamp x3
  54652250,
  54652250,
  54652250, // Man-Eater Bug x3
  17985575,
  17985575, // Lord of D. x2
  43973174,
  43973174, // The Flute of Summoning Dragon x2
  55144522,
  55144522, // Pot of Greed x2
  53129443,
  53129443, // Dark Hole x2
  12580477, // Raigeki x1
  25833572,
  25833572,
  25833572, // Ookazi x3
  38480590,
  38480590,
  38480590, // Sparks x3
  4206964,
  4206964,
  4206964, // Trap Hole x3
  83555666,
  83555666, // Ring of Destruction x2
  99518961,
  99518961, // Dust Tornado x2
];

// 40-Card Jaden Deck (Real cards from GX filtered card pool)
const JADEN_DECK = [
  89943723,
  89943723, // Elemental HERO Neos x2
  20721928,
  20721928,
  20721928, // Elemental HERO Sparkman x3
  84327329,
  84327329,
  84327329, // Elemental HERO Clayman x3
  58932615,
  58932615,
  58932615, // Elemental HERO Burstinatrix x3
  21844576,
  21844576,
  21844576, // Elemental HERO Avian x3
  79979666,
  79979666, // Elemental HERO Bubbleman x2
  86188410,
  86188410,
  86188410, // Elemental HERO Wildheart x3
  57116033,
  57116033,
  57116033, // Winged Kuriboh x3
  63035430,
  63035430, // Skyscraper x2
  75414984,
  75414984, // "E - Emergency Call" x2
  55144522,
  55144522, // Pot of Greed x2
  12580477, // Raigeki x1
  53129443, // Dark Hole x1
  46130346,
  46130346, // Hinotama x2
  4206964,
  4206964,
  4206964, // Trap Hole x3
  25451383,
  25451383, // A Hero Emerges x2
  22020907,
  22020907, // Hero Signal x2
];

// 40-Card Zane Deck (Real cards from GX filtered card pool)
const ZANE_DECK = [
  70095154,
  70095154,
  70095154, // Cyber Dragon x3
  3657444,
  3657444,
  3657444, // Cyber Valley x3
  3267937,
  3267937,
  3267937, // Cyber Phoenix x3
  26439287,
  26439287,
  26439287, // Proto-Cyber Dragon x3
  23265313,
  23265313,
  23265313, // Heavy Mech Support Platform x3
  23171610,
  23171610, // Limiter Removal x2
  55144522,
  55144522, // Pot of Greed x2
  53129443,
  53129443, // Dark Hole x2
  12580477, // Raigeki x1
  25833572,
  25833572,
  25833572, // Ookazi x3
  38480590,
  38480590,
  38480590, // Sparks x3
  4206964,
  4206964,
  4206964, // Trap Hole x3
  38814750,
  38814750,
  38814750, // Sakuretsu Armor x3
  99518961,
  99518961, // Dust Tornado x2
];

async function updateStateFromMain(): Promise<void> {
  try {
    const s = await window.duelAPI.getState();
    Object.assign(duelState, s);
  } catch (err) {
    console.error('Failed getting duel state:', err);
  }
}

async function startDuel(p0Deck: number[], p1Deck: number[], title: string): Promise<void> {
  clearLog();
  appendLog('SYSTEM', `Initializing ${title}...`);

  try {
    const success = await window.duelAPI.newDuel({
      player0Deck: p0Deck,
      player1Deck: p1Deck,
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1,
      autoPlay: isAutoPlaying.value,
    });

    if (success) {
      appendLog('SYSTEM', 'Duel created & started successfully.');
      await updateStateFromMain();
    }
  } catch (err) {
    appendLog('ERROR', `Failed to start duel: ${err}`);
  }
}

function startYugiVsKaiba(): void {
  startDuel(YUGI_DECK, KAIBA_DECK, 'Yugi vs Kaiba Matchup (DM Era)');
}

function startJadenVsZane(): void {
  startDuel(JADEN_DECK, ZANE_DECK, 'Jaden vs Zane Matchup (GX Era)');
}

async function stepDuel(): Promise<void> {
  if (!duelState.isActive) return;
  try {
    await window.duelAPI.step();
    await updateStateFromMain();
  } catch (err) {
    appendLog('ERROR', `Step failed: ${err}`);
  }
}

async function toggleAutoPlay(): Promise<void> {
  isAutoPlaying.value = !isAutoPlaying.value;
  await window.duelAPI.setAutoPlay(isAutoPlaying.value);

  if (isAutoPlaying.value) {
    appendLog('SYSTEM', 'Auto-Play ENABLED (50ms execution loop).');
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(async () => {
      if (!duelState.isActive) {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        isAutoPlaying.value = false;
        return;
      }
      await stepDuel();
    }, 50);
  } else {
    appendLog('SYSTEM', 'Auto-Play PAUSED.');
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }
}

function handleDuelEvent(event: DuelEventPayload): void {
  appendLog(event.type, event.description);

  if (event.turn !== undefined) duelState.currentTurn = event.turn;
  if (event.phase !== undefined) duelState.currentPhase = event.phase;
  if (event.type === 'LPUPDATE' && event.player !== undefined && event.lp !== undefined) {
    if (event.player === 0) duelState.p0LP = event.lp;
    if (event.player === 1) duelState.p1LP = event.lp;
  }
  if (event.type === 'DAMAGE' && event.player !== undefined && event.amount !== undefined) {
    if (event.player === 0) duelState.p0LP = Math.max(0, duelState.p0LP - event.amount);
    if (event.player === 1) duelState.p1LP = Math.max(0, duelState.p1LP - event.amount);
  }
  if (event.type === 'WIN') {
    duelState.winner = event.player ?? null;
    duelState.winReason = event.reason ?? null;
    duelState.isActive = false;
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
    isAutoPlaying.value = false;
  }
}

onMounted(() => {
  if (window.duelAPI) {
    unsubscribeEvents = window.duelAPI.onEvent(handleDuelEvent);
    updateStateFromMain();
  }
});

onUnmounted(() => {
  if (unsubscribeEvents) {
    unsubscribeEvents();
  }
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
  }
});
</script>

<style scoped lang="scss">
.duel-debug-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 24px;
  overflow-y: auto;
  box-sizing: border-box;
}

.debug-panel {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 12px;
  background: rgba(18, 22, 30, 0.7);
  border: 1px solid rgba(201, 162, 39, 0.4);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 10px;

  .icon {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
    color: #f4e4b8;
    margin: 0;
    font-family: 'Cinzel', serif, sans-serif;
    letter-spacing: 0.05em;
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(117, 111, 96, 0.3);
  border: 1px solid #756f60;
  color: #b8b2a0;

  &--active {
    background: rgba(61, 220, 151, 0.2);
    border-color: #3ddc97;
    color: #3ddc97;
    box-shadow: 0 0 10px rgba(61, 220, 151, 0.3);
  }
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &-primary {
    background: #c9a227;
    color: #1a1406;
    border-color: #e3c567;
    &:hover:not(:disabled) {
      background: #e3c567;
      box-shadow: 0 0 12px rgba(201, 162, 39, 0.5);
    }
  }

  &-secondary {
    background: rgba(47, 128, 237, 0.2);
    border-color: #2f80ed;
    color: #f5f1e6;
    &:hover:not(:disabled) {
      background: #2f80ed;
    }
  }

  &-accent {
    background: rgba(61, 220, 151, 0.2);
    border-color: #3ddc97;
    color: #3ddc97;
    &:hover:not(:disabled) {
      background: #3ddc97;
      color: #0a0c10;
    }
  }

  &-danger {
    background: rgba(235, 87, 87, 0.2);
    border-color: #eb5757;
    color: #eb5757;
    &:hover:not(:disabled) {
      background: #eb5757;
      color: #fff;
    }
  }

  &-outline {
    background: transparent;
    border-color: #756f60;
    color: #b8b2a0;
    &:hover:not(:disabled) {
      border-color: #b8b2a0;
      color: #f5f1e6;
    }
  }
}

.scoreboard-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: stretch;
}

.player-card {
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(18, 22, 30, 0.6);
  border: 1px solid rgba(201, 162, 39, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &--active {
    border-color: #2f80ed;
    box-shadow: 0 0 16px rgba(47, 128, 237, 0.3);
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .player-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: #f5f1e6;
    }

    .player-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      background: rgba(47, 128, 237, 0.2);
      color: #2f80ed;
      border: 1px solid #2f80ed;

      &--ai {
        background: rgba(235, 87, 87, 0.2);
        color: #eb5757;
        border-color: #eb5757;
      }
    }
  }

  .lp-display {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .lp-label {
      font-size: 0.8rem;
      color: #c9a227;
      font-weight: 700;
    }

    .lp-value {
      font-size: 2rem;
      font-weight: 800;
      color: #f4e4b8;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.05em;

      &--low {
        color: #eb5757;
        text-shadow: 0 0 8px rgba(235, 87, 87, 0.6);
      }
    }
  }

  .lp-bar {
    width: 100%;
    height: 8px;
    background: rgba(10, 12, 16, 0.8);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .lp-fill {
      height: 100%;
      transition: width 0.3s ease;

      &--p0 {
        background: linear-gradient(90deg, #2f80ed, #56ccf2);
      }

      &--p1 {
        background: linear-gradient(90deg, #eb5757, #f2c94c);
      }
    }
  }
}

.center-info {
  padding: 16px 24px;
  border-radius: 12px;
  background: rgba(18, 22, 30, 0.7);
  border: 1px solid rgba(201, 162, 39, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  min-width: 180px;

  .turn-box,
  .phase-box {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 0.75rem;
      color: #c9a227;
      font-weight: 700;
    }

    .value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f5f1e6;
    }

    .phase-text {
      color: #e3c567;
      text-transform: uppercase;
    }
  }

  .waiting-indicator {
    font-size: 0.75rem;
    color: #f2c94c;
    animation: pulse 1.5s infinite;
  }
}

.victory-banner {
  padding: 14px 20px;
  border-radius: 10px;
  background: rgba(61, 220, 151, 0.15);
  border: 1px solid #3ddc97;
  color: #3ddc97;
  font-weight: 700;
  text-align: center;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  box-shadow: 0 0 20px rgba(61, 220, 151, 0.3);
}

.log-panel {
  flex: 1;
  min-height: 360px;
  padding: 16px 20px;
  border-radius: 12px;
  background: rgba(18, 22, 30, 0.75);
  border: 1px solid rgba(201, 162, 39, 0.3);
  display: flex;
  flex-direction: column;
  gap: 10px;

  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: 1rem;
      color: #f4e4b8;
      margin: 0;
    }

    .log-count {
      font-size: 0.75rem;
      color: #756f60;
    }
  }

  .log-content {
    flex: 1;
    max-height: 420px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 8px;
    font-family: 'Inter', monospace, sans-serif;
    font-size: 0.825rem;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(201, 162, 39, 0.4);
      border-radius: 3px;
    }
  }

  .log-empty {
    padding: 30px;
    text-align: center;
    color: #756f60;
    font-style: italic;
  }

  .log-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.4;
    padding: 2px 0;

    .log-time {
      color: #756f60;
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
    }

    .log-type-tag {
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 0.65rem;
      font-weight: 700;
      background: rgba(201, 162, 39, 0.15);
      color: #e3c567;
      border: 1px solid rgba(201, 162, 39, 0.3);
    }

    .log-text {
      color: #f5f1e6;
      word-break: break-word;
    }

    &--summoning,
    &--spsummoning {
      .log-type-tag {
        background: rgba(47, 128, 237, 0.2);
        color: #56ccf2;
        border-color: #2f80ed;
      }
      .log-text {
        color: #56ccf2;
        font-weight: 600;
      }
    }

    &--chaining {
      .log-type-tag {
        background: rgba(242, 201, 76, 0.2);
        color: #f2c94c;
        border-color: #f2c94c;
      }
      .log-text {
        color: #f4e4b8;
      }
    }

    &--damage,
    &--attack {
      .log-type-tag {
        background: rgba(235, 87, 87, 0.2);
        color: #eb5757;
        border-color: #eb5757;
      }
      .log-text {
        color: #f5a5a5;
      }
    }

    &--win {
      .log-type-tag {
        background: rgba(61, 220, 151, 0.2);
        color: #3ddc97;
        border-color: #3ddc97;
      }
      .log-text {
        color: #3ddc97;
        font-weight: 700;
      }
    }

    &--new_turn {
      border-top: 1px solid rgba(201, 162, 39, 0.2);
      padding-top: 8px;
      margin-top: 4px;
      .log-type-tag {
        background: #c9a227;
        color: #1a1406;
      }
      .log-text {
        font-weight: 700;
        color: #f4e4b8;
      }
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
