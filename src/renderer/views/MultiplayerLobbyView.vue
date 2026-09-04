<template>
  <div class="multiplayer-view">
    <div class="multiplayer-view__bg" />

    <!-- Top Navigation Header -->
    <header class="multiplayer-view__header">
      <div class="multiplayer-view__brand">
        <router-link to="/main-menu" class="back-btn" title="Back to Main Menu">
          ← Menu
        </router-link>
        <div class="brand-text">
          <h1 class="brand-title">PVP ARENA</h1>
          <span class="brand-sub">Real-Time P2P WebRTC Dueling</span>
        </div>
      </div>

      <!-- Integrated Voice Chat & Dev Tools -->
      <div class="multiplayer-view__header-actions">
        <button
          v-if="canLaunchGuest"
          type="button"
          class="launch-guest-btn"
          :disabled="isLaunchingGuest"
          title="Launch a 2nd game window to act as Player 2 / Guest side-by-side on this Mac"
          @click="onLaunchGuestWindow"
        >
          {{ launchFeedback || '🪟 Launch 2nd Window (Test Guest)' }}
        </button>
        <VoiceChatWidget />
      </div>
    </header>

    <main class="multiplayer-view__main">
      <!-- STATE 1: LOBBY BROWSER (NOT CONNECTED) -->
      <div v-if="!multiplayerStore.isConnected" class="lobby-setup glass-panel">
        <!-- Mode Tabs -->
        <div class="lobby-tabs">
          <button
            type="button"
            class="lobby-tab"
            :class="{ 'lobby-tab--active': activeTab === 'host' }"
            @click="activeTab = 'host'"
          >
            👑 Host Room
          </button>
          <button
            type="button"
            class="lobby-tab"
            :class="{ 'lobby-tab--active': activeTab === 'join' }"
            @click="activeTab = 'join'"
          >
            ⚡ Join Room
          </button>
        </div>

        <!-- Player Profile & Deck Selection Area -->
        <div class="lobby-deck-config">
          <div class="config-field">
            <label class="config-label">Duelist Name</label>
            <input
              v-model="playerName"
              type="text"
              class="config-input"
              maxlength="20"
              placeholder="Enter your name"
              @change="updateProfile"
            />
          </div>

          <div class="config-field config-field--deck">
            <label class="config-label">Selected Deck (All Cards Legal)</label>
            <div
              class="deck-selector-bar"
              role="button"
              tabindex="0"
              title="Click to open deck browser and inspect contents"
              @click="isDeckModalOpen = true"
              @keydown.enter="isDeckModalOpen = true"
              @keydown.space.prevent="isDeckModalOpen = true"
            >
              <div class="deck-selector-bar__left">
                <div class="deck-avatar-box">
                  <img
                    v-if="currentDeckObject?.avatar"
                    :src="currentDeckObject.avatar"
                    :alt="currentDeckObject.name"
                    class="deck-avatar-img"
                    @error="
                      (e) =>
                        ((e.target as HTMLImageElement).src =
                          'app-resource://characters/avatars/generic.png')
                    "
                  />
                  <span v-else class="deck-avatar-icon">🎴</span>
                </div>
                <div class="deck-text-box">
                  <span class="deck-title">{{
                    currentDeckObject?.name || 'Select a Deck'
                  }}</span>
                  <div class="deck-sub-meta">
                    <span
                      v-if="currentDeckObject?.series"
                      class="series-badge"
                      :class="`series-badge--${currentDeckObject.series.toLowerCase()}`"
                    >
                      {{ currentDeckObject.series }}
                    </span>
                    <span
                      v-if="
                        currentDeckObject?.characterName &&
                        currentDeckObject.characterName !== 'Community Popular'
                      "
                      class="char-name"
                    >
                      {{ currentDeckObject.characterName }}
                    </span>
                    <span v-else-if="currentDeckObject?.archetype" class="arch-name">
                      {{ currentDeckObject.archetype }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="deck-selector-bar__right">
                <span class="deck-count-pill">
                  📦 {{ currentDeckObject?.main?.length || 40 }} Main
                  <template v-if="currentDeckObject?.extra && currentDeckObject.extra.length > 0">
                    • 🔮 {{ currentDeckObject.extra.length }}
                  </template>
                </span>
                <span class="open-modal-indicator"> Browse Decks 🔍 </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CONTENT: HOST -->
        <div v-if="activeTab === 'host'" class="tab-pane tab-pane--host">
          <div v-if="multiplayerStore.status !== 'waiting_for_guest'" class="host-init-box">
            <p class="host-desc">
              Host an encrypted peer-to-peer duel. Your opponent will connect directly using a
              4-digit room code.
            </p>
            <button
              type="button"
              class="cta-btn cta-btn--primary"
              :disabled="multiplayerStore.status === 'generating_room'"
              @click="handleCreateRoom"
            >
              {{
                multiplayerStore.status === 'generating_room'
                  ? 'Generating Room...'
                  : 'Generate 4-Digit Room'
              }}
            </button>
          </div>

          <div v-else class="host-waiting-box">
            <span class="waiting-eyebrow">ROOM CODE</span>
            <div class="code-display" title="Click to copy room code" @click="copyRoomCode">
              <span v-for="(digit, idx) in splitCode" :key="idx" class="code-digit">
                {{ digit }}
              </span>
            </div>
            <button type="button" class="copy-btn" @click="copyRoomCode">
              📋 {{ copyFeedback || 'Copy 4-Digit Code' }}
            </button>

            <div class="waiting-indicator">
              <div class="pulse-loader" />
              <span>Waiting for opponent to connect...</span>
            </div>

            <button type="button" class="cancel-btn" @click="handleCancelRoom">Cancel Room</button>
          </div>
        </div>

        <!-- TAB CONTENT: JOIN -->
        <div v-else class="tab-pane tab-pane--join">
          <p class="join-desc">Enter the 4-digit room code provided by the Host:</p>

          <!-- 4-Box PIN Input -->
          <div class="pin-inputs-container" @paste="handlePinPaste">
            <input
              v-for="i in 4"
              :key="i"
              :ref="(el) => setPinInputRef(el, i - 1)"
              v-model="pinDigits[i - 1]"
              type="text"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]*"
              class="pin-box"
              @input="onPinInput(i - 1)"
              @keydown="onPinKeydown($event, i - 1)"
            />
          </div>

          <button
            type="button"
            class="cta-btn cta-btn--primary"
            :disabled="!isPinComplete || multiplayerStore.status === 'connecting'"
            @click="handleJoinRoom"
          >
            {{
              multiplayerStore.status === 'connecting' ? 'Connecting to Host...' : 'Connect to Duel'
            }}
          </button>
        </div>

        <!-- Error Banner -->
        <div v-if="multiplayerStore.errorMessage" class="error-banner">
          ⚠️ {{ multiplayerStore.errorMessage }}
        </div>
      </div>

      <!-- STATE 2: CONNECTED STAGE (VS READY ROOM) -->
      <div v-else class="stage-room glass-panel">
        <div class="stage-header">
          <div class="stage-code-badge">
            ROOM: <strong>{{ multiplayerStore.roomCode }}</strong>
          </div>
          <button type="button" class="leave-btn" @click="handleLeaveRoom">Leave Room</button>
        </div>

        <!-- VS Stage Showcase -->
        <div class="vs-showcase">
          <!-- Player 1 (You) -->
          <div class="duelist-card duelist-card--you">
            <div class="duelist-avatar-frame">
              <span class="avatar-glyph">⚔️</span>
            </div>
            <h2 class="duelist-name">{{ multiplayerStore.localPlayer.name }} (You)</h2>
            <div class="duelist-deck-tag">🎴 {{ multiplayerStore.localPlayer.deckName }}</div>
            <div
              class="ready-status-pill"
              :class="
                multiplayerStore.isLocalReady
                  ? 'ready-status-pill--ready'
                  : 'ready-status-pill--waiting'
              "
            >
              {{ multiplayerStore.isLocalReady ? 'READY' : 'NOT READY' }}
            </div>
          </div>

          <div class="vs-divider">
            <span class="vs-text">VS</span>
            <div class="vs-bolt" />
          </div>

          <!-- Player 2 (Opponent) -->
          <div class="duelist-card duelist-card--opponent">
            <div class="duelist-avatar-frame">
              <span class="avatar-glyph">🛡️</span>
            </div>
            <h2 class="duelist-name">{{ opponentName }}</h2>
            <div class="duelist-deck-tag">🎴 {{ opponentDeckName }}</div>
            <div
              class="ready-status-pill"
              :class="
                multiplayerStore.isRemoteReady
                  ? 'ready-status-pill--ready'
                  : 'ready-status-pill--waiting'
              "
            >
              {{ multiplayerStore.isRemoteReady ? 'READY' : 'WAITING...' }}
            </div>
          </div>
        </div>

        <!-- Match Actions Bar -->
        <div class="stage-actions">
          <button
            type="button"
            class="ready-btn"
            :class="{ 'ready-btn--active': multiplayerStore.isLocalReady }"
            @click="handleToggleReady"
          >
            {{ multiplayerStore.isLocalReady ? '✓ Ready (Click to Cancel)' : 'Ready Up!' }}
          </button>

          <!-- Host Start Button -->
          <button
            v-if="multiplayerStore.isHost"
            type="button"
            class="start-match-btn"
            :disabled="!multiplayerStore.bothReady"
            @click="handleStartMatch"
          >
            ⚔️
            {{
              multiplayerStore.bothReady ? 'START DUEL!' : 'Waiting for both players to Ready...'
            }}
          </button>

          <p v-else class="guest-notice">
            {{
              multiplayerStore.bothReady
                ? 'Both ready! Waiting for Host to start...'
                : 'Please ready up to begin.'
            }}
          </p>
        </div>
      </div>

      <!-- Custom Enhanced Premium Deck Select Dialog -->
      <PlayerDeckSelectModal
        v-model="isDeckModalOpen"
        :selected-deck-id="selectedDeckId"
        :decks="allAvailableDecks"
        @select="handleSelectDeckFromModal"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import type { CustomDeck } from '../../../shared/types/deck.js';
import { useMultiplayerStore } from '../stores/multiplayerStore.js';
import { useDeckEditStore } from '../stores/deckEditStore.js';
import { useDuelStore } from '../stores/duelStore.js';
import VoiceChatWidget from '../components/multiplayer/VoiceChatWidget.vue';
import PlayerDeckSelectModal from '../components/multiplayer/PlayerDeckSelectModal.vue';

const router = useRouter();
const multiplayerStore = useMultiplayerStore();
const deckEditStore = useDeckEditStore();
const duelStore = useDuelStore();

const activeTab = ref<'host' | 'join'>('host');
const savedPlayerName =
  (typeof localStorage !== 'undefined' && localStorage.getItem('yugioh_duelist_name')) ||
  multiplayerStore.localPlayer.name ||
  'Duelist';
const playerName = ref(savedPlayerName);
const copyFeedback = ref('');
const isLaunchingGuest = ref(false);
const launchFeedback = ref('');
const isDeckModalOpen = ref(false);

const allAvailableDecks = computed<CustomDeck[]>(() => {
  return deckEditStore.customDecks;
});

const selectedDeckId = computed({
  get: () => deckEditStore.activeDeckId || deckEditStore.customDecks[0]?.id || '',
  set: (deckId: string) => {
    if (deckId) {
      deckEditStore.selectDeck(deckId);
    }
  },
});

const currentDeckObject = computed<CustomDeck>(() => {
  return (
    deckEditStore.customDecks.find((d) => d.id === selectedDeckId.value) ||
    deckEditStore.customDecks[0] ||
    deckEditStore.activeDeck
  );
});

function handleSelectDeckFromModal(deck: CustomDeck) {
  selectedDeckId.value = deck.id;
  updateProfile();
}

const canLaunchGuest = computed(() => {
  return typeof window !== 'undefined' && Boolean(window.appAPI?.launchGuestWindow);
});

async function onLaunchGuestWindow() {
  if (!window.appAPI?.launchGuestWindow) return;
  isLaunchingGuest.value = true;
  launchFeedback.value = 'Launching Player 2...';
  try {
    const success = await window.appAPI.launchGuestWindow();
    if (success) {
      launchFeedback.value = 'Window opened!';
    } else {
      launchFeedback.value = 'Launch failed';
    }
  } catch (err) {
    launchFeedback.value = 'Launch error';
  } finally {
    setTimeout(() => {
      isLaunchingGuest.value = false;
      launchFeedback.value = '';
    }, 3500);
  }
}

// PIN boxes
const pinDigits = ref(['', '', '', '']);
const pinInputRefs = ref<HTMLInputElement[]>([]);

const customDecks = computed(() => deckEditStore.customDecks);
const splitCode = computed(() => multiplayerStore.roomCode.split(''));
const isPinComplete = computed(() => pinDigits.value.every((d) => d.length === 1));

const opponentName = computed(() => multiplayerStore.remotePlayer?.name || 'Remote Opponent');
const opponentDeckName = computed(() => multiplayerStore.remotePlayer?.deckName || 'Custom Deck');

onMounted(async () => {
  multiplayerStore.init();
  multiplayerStore.onStartDuel = () => {
    duelStore.isPvPMatch = true;
    duelStore.pvpRole = 'guest';
    duelStore.userPlayerId = 1;
    duelStore.opponentPlayerId = 0;
    router.push('/duel');
  };
  if (!deckEditStore.isLoaded || deckEditStore.customDecks.length === 0) {
    await deckEditStore.initStore();
  }
  updateProfile();
});

watch(
  () => deckEditStore.activeDeckId,
  () => {
    updateProfile();
  },
);

watch(playerName, (newName) => {
  const trimmed = newName.trim();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('yugioh_duelist_name', trimmed || 'Duelist');
  }
  updateProfile();
});

onUnmounted(() => {
  // If user navigated away and is not in an active duel, leave room
  if (!duelStore.isDuelActive) {
    // multiplayerStore.leaveRoom();
  }
});

function setPinInputRef(el: any, index: number) {
  if (el) pinInputRefs.value[index] = el;
}

function updateProfile() {
  const currentDeck = getSelectedDeck();
  multiplayerStore.setLocalProfile({
    name: playerName.value.trim() || 'Duelist',
    deckName: currentDeck.name,
    deckCards: currentDeck.cards,
    extraDeckCards: currentDeck.extraCards,
  });
}

function onDeckSelect() {
  updateProfile();
}

function getSelectedDeck(): {
  name: string;
  cards: number[];
  extraCards: number[];
  series?: 'DM' | 'GX';
} {
  const d = currentDeckObject.value;
  if (d) {
    const mainCards: number[] = d.main.map((c: any) =>
      typeof c === 'object' && c ? Number(c.code || c.id) : Number(c),
    );
    const extraCards: number[] = (d.extra || []).map((c: any) =>
      typeof c === 'object' && c ? Number(c.code || c.id) : Number(c),
    );
    return {
      name: d.name,
      cards: mainCards,
      extraCards,
      series: d.series === 'GX' ? 'GX' : 'DM',
    };
  }
  return { name: 'Starter Deck', cards: [], extraCards: [] };
}

async function handleCreateRoom() {
  updateProfile();
  await multiplayerStore.hostGame();
}

function handleCancelRoom() {
  multiplayerStore.leaveRoom();
}

async function handleJoinRoom() {
  updateProfile();
  const code = pinDigits.value.join('');
  await multiplayerStore.joinGame(code);
}

function handleLeaveRoom() {
  multiplayerStore.leaveRoom();
}

function handleToggleReady() {
  multiplayerStore.toggleReady();
}

function copyRoomCode() {
  if (!multiplayerStore.roomCode) return;
  navigator.clipboard.writeText(multiplayerStore.roomCode);
  copyFeedback.value = 'Copied to Clipboard!';
  setTimeout(() => {
    copyFeedback.value = '';
  }, 2000);
}

// PIN Box Handling
function onPinInput(index: number) {
  const char = pinDigits.value[index];
  if (char && index < 3) {
    pinInputRefs.value[index + 1]?.focus();
  }
}

function onPinKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace' && !pinDigits.value[index] && index > 0) {
    pinDigits.value[index - 1] = '';
    pinInputRefs.value[index - 1]?.focus();
  }
}

function handlePinPaste(event: ClipboardEvent) {
  event.preventDefault();
  const pasted = event.clipboardData?.getData('text') || '';
  const digits = pasted.replace(/\D/g, '').slice(0, 4);
  for (let i = 0; i < 4; i++) {
    pinDigits.value[i] = digits[i] || '';
  }
  if (digits.length === 4) {
    pinInputRefs.value[3]?.focus();
  }
}

async function handleStartMatch() {
  if (!multiplayerStore.isHost || !multiplayerStore.bothReady) return;

  const hostDeck = getSelectedDeck();
  const guestDeck = multiplayerStore.remotePlayer?.deckCards || [];
  const guestExtra = multiplayerStore.remotePlayer?.extraDeckCards || [];

  // Host prepares the duel match
  duelStore.isPvPMatch = true;
  duelStore.pvpRole = 'host';
  duelStore.userPlayerId = 0;
  duelStore.opponentPlayerId = 1;

  // Initialize authoritative engine on Host
  if (window.duelAPI) {
    await window.duelAPI.newDuel({
      player0Deck: hostDeck.cards,
      player1Deck: guestDeck,
      player0ExtraDeck: hostDeck.extraCards,
      player1ExtraDeck: guestExtra,
      isPvPMode: true,
      player0Name: multiplayerStore.localPlayer.name,
      player1Name: multiplayerStore.remotePlayer?.name || 'Player 2',
    });
  }

  // Tell Guest to start duel
  multiplayerStore.sendPacket('START_DUEL', {
    startingPlayer: 0,
    hostDeckName: hostDeck.name,
    guestDeckName: multiplayerStore.remotePlayer?.deckName || 'Deck',
  });

  router.push('/duel');
}
</script>

<style scoped lang="scss">
.multiplayer-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: hidden;
  background: #0a0d14;

  &__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 50% 30%,
      rgba(26, 35, 60, 0.6) 0%,
      rgba(5, 7, 12, 0.95) 100%
    );
    pointer-events: none;
  }

  &__header {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .launch-guest-btn {
    background: rgba(37, 99, 235, 0.2);
    border: 1px solid rgba(96, 165, 250, 0.5);
    color: #93c5fd;
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: rgba(37, 99, 235, 0.4);
      border-color: #93c5fd;
      color: #ffffff;
      transform: translateY(-1px);
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__main {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
}

.back-btn {
  color: #d4af37;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  transition: all 0.2s;

  &:hover {
    background: rgba(212, 175, 55, 0.25);
    transform: translateX(-2px);
  }
}

.brand-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #fff 0%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-sub {
  font-size: 0.75rem;
  color: #8892b0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

// Lobby Setup Modal
.lobby-setup {
  width: 520px;
  max-width: 92vw;
  padding: 28px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
}

.lobby-tabs {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px;
  border-radius: 12px;
}

.lobby-tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #8892b0;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &--active {
    background: rgba(212, 175, 55, 0.2);
    color: #ffd700;
    border: 1px solid rgba(212, 175, 55, 0.4);
  }
}

.lobby-deck-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #a0aec0;
  text-transform: uppercase;
}

.config-input,
.config-select {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: #d4af37;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  }
}

.deck-selector-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(16, 22, 34, 0.85);
  border: 1px solid rgba(217, 119, 6, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(26, 35, 54, 0.95);
    border-color: #f59e0b;
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
    transform: translateY(-1px);
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    .deck-avatar-box {
      width: 42px;
      height: 42px;
      border-radius: 6px;
      overflow: hidden;
      background: #000;
      border: 1px solid rgba(255, 255, 255, 0.15);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .deck-avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .deck-avatar-icon {
        font-size: 1.3rem;
      }
    }

    .deck-text-box {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;

      .deck-title {
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-size: 0.95rem;
        font-weight: 700;
        color: #f8fafc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .deck-sub-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;

        .series-badge {
          font-size: 0.65rem;
          padding: 1px 5px;
          border-radius: 3px;
          font-weight: 700;

          &--dm {
            background: rgba(234, 179, 8, 0.2);
            color: #fde047;
          }
          &--gx {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
          }
        }

        .char-name,
        .arch-name {
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;

    .deck-count-pill {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.06);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .open-modal-indicator {
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.5);
      color: #fbbf24;
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 6px;
      transition: all 0.2s ease;
      display: none; // Keep hidden for now.
    }
  }

  &:hover &__right .open-modal-indicator {
    background: #f59e0b;
    color: #000;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
  }
}

.tab-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.host-init-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.host-desc,
.join-desc {
  font-size: 0.85rem;
  color: #cbd5e0;
  line-height: 1.4;
  margin: 0;
}

// 4-Digit Code Display
.waiting-eyebrow {
  font-size: 0.8rem;
  color: #d4af37;
  letter-spacing: 2px;
  font-weight: 800;
}

.code-display {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.code-digit {
  width: 54px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 900;
  font-family: monospace;
  background: rgba(212, 175, 55, 0.15);
  border: 2px solid #ffd700;
  border-radius: 12px;
  color: #ffd700;
  box-shadow: 0 0 16px rgba(212, 175, 55, 0.4);
}

.copy-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

.waiting-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.pulse-loader {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2ecc71;
  animation: pulse-dot 1.4s infinite ease-in-out;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

.cancel-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}

// PIN Box Inputs
.pin-inputs-container {
  display: flex;
  gap: 12px;
}

.pin-box {
  width: 54px;
  height: 64px;
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #ffd700;
  outline: none;

  &:focus {
    border-color: #ffd700;
    box-shadow: 0 0 16px rgba(255, 215, 0, 0.4);
  }
}

.cta-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 1px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &--primary {
    background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%);
    color: #000;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #ffd700 0%, #d4af37 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.error-banner {
  padding: 10px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  font-size: 0.85rem;
  text-align: center;
}

// Stage Room (VS Connected)
.stage-room {
  width: 780px;
  max-width: 94vw;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-code-badge {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.4);
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #ffd700;
}

.leave-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #fff;
  }
}

.vs-showcase {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 20px;
}

.duelist-card {
  flex: 1;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.duelist-avatar-frame {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.15);
  border: 2px solid rgba(212, 175, 55, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.duelist-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.duelist-deck-tag {
  font-size: 0.85rem;
  color: #94a3b8;
}

.ready-status-pill {
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;

  &--ready {
    background: rgba(46, 204, 113, 0.2);
    border: 1px solid #2ecc71;
    color: #2ecc71;
  }

  &--waiting {
    background: rgba(241, 196, 15, 0.15);
    border: 1px solid #f1c40f;
    color: #f1c40f;
  }
}

.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.vs-text {
  font-size: 2.2rem;
  font-weight: 900;
  font-style: italic;
  color: #ef4444;
  text-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
}

.stage-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ready-btn {
  padding: 12px 36px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  transition: all 0.2s;

  &--active {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    border-color: #2ecc71;
    color: #000;
  }
}

.start-match-btn {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: 1.5px;
  background: linear-gradient(135deg, #ffd700 0%, #d4af37 100%);
  color: #000;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(212, 175, 55, 0.4);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(212, 175, 55, 0.6);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.1);
    color: #64748b;
    box-shadow: none;
  }
}

.guest-notice {
  font-size: 0.9rem;
  color: #94a3b8;
}
</style>
