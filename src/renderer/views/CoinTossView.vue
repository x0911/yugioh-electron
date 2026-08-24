<template>
  <div class="coin-toss-view" tabindex="0" @keydown="handleGlobalKeydown">
    <div class="coin-toss-view__ambient-glow" />

    <!-- Top Header & Matchup Banner -->
    <header class="coin-toss-view__header">
      <div class="coin-toss-view__matchup-title-block">
        <h1 class="coin-toss-view__title">COIN TOSS</h1>
        <p class="coin-toss-view__subtitle">Determine who strikes first in the Ancient Arena</p>
      </div>

      <div class="coin-toss-view__matchup-rivals">
        <div class="coin-toss-view__rival coin-toss-view__rival--user">
          <span class="coin-toss-view__rival-tag">YOU</span>
          <span class="coin-toss-view__rival-name">Player 1</span>
        </div>

        <div class="coin-toss-view__vs-badge">VS</div>

        <div class="coin-toss-view__rival coin-toss-view__rival--opponent">
          <span class="coin-toss-view__rival-name">{{ opponentName }}</span>
          <span class="coin-toss-view__rival-tag">{{ opponentSeries }}</span>
        </div>
      </div>

      <YugiButton variant="ghost" size="sm" icon="←" to="/main-menu">
        Menu
      </YugiButton>
    </header>

    <!-- Center Stage: 3D Coin & Interactive Decision -->
    <main class="coin-toss-view__stage">
      <!-- 3D Flipping Coin Area -->
      <div class="coin-toss-view__coin-wrapper">
        <div class="coin-toss-view__coin-pedestal" />
        <div class="coin-toss-view__coin-aura" />

        <div
          class="coin-toss-view__coin"
          :class="{
            'coin-toss-view__coin--flipping-heads': isFlipping && pendingOutcome === 'heads',
            'coin-toss-view__coin--flipping-tails': isFlipping && pendingOutcome === 'tails',
            'coin-toss-view__coin--landed-heads': hasLanded && duelStore.coinResult === 'heads',
            'coin-toss-view__coin--landed-tails': hasLanded && duelStore.coinResult === 'tails',
          }"
        >
          <!-- Heads Face (Front) -->
          <div class="coin-toss-view__coin-face coin-toss-view__coin-face--heads">
            <img
              :src="coinHeadsUrl"
              alt="Coin Heads Face — Solar Eye"
              @error="handleImageFallback"
            />
          </div>

          <!-- Tails Face (Back) -->
          <div class="coin-toss-view__coin-face coin-toss-view__coin-face--tails">
            <img
              :src="coinTailsUrl"
              alt="Coin Tails Face — Crescent Star"
              @error="handleImageFallback"
            />
          </div>
        </div>
      </div>

      <!-- State 1: Choose Heads or Tails -->
      <div v-if="!isFlipping && !hasLanded" class="coin-toss-view__choice-container">
        <!-- Opponent AI Engine Toggle Pill -->
        <div class="coin-toss-view__engine-selector">
          <span class="coin-toss-view__engine-label">Opponent Engine:</span>
          <div class="coin-toss-view__engine-pills">
            <button
              type="button"
              class="coin-toss-view__engine-pill"
              :class="{ 'coin-toss-view__engine-pill--active': settingsStore.aiEngineType === 'builtin' }"
              @click="settingsStore.setAiEngineType('builtin')"
            >
              ⚡ Local Fast AI
            </button>
            <button
              type="button"
              class="coin-toss-view__engine-pill coin-toss-view__engine-pill--gemini"
              :class="{ 'coin-toss-view__engine-pill--active': settingsStore.aiEngineType === 'gemini' }"
              @click="settingsStore.setAiEngineType('gemini')"
            >
              ✨ Gemini AI (Cloud LLM)
            </button>
          </div>
        </div>

        <p class="coin-toss-view__prompt-text">
          Call the coin toss to decide who takes the first turn:
        </p>

        <div class="coin-toss-view__choices-grid">
          <!-- Heads Choice Button -->
          <button
            class="coin-toss-view__choice-card"
            :class="{ 'coin-toss-view__choice-card--selected': selectedChoice === 'heads' }"
            :disabled="isFlipping"
            @click="handlePickChoice('heads')"
          >
            <span class="coin-toss-view__choice-hotkey">1 / H</span>
            <img
              :src="coinHeadsUrl"
              alt="Heads"
              class="coin-toss-view__choice-coin-img"
              @error="handleImageFallback"
            />
            <span class="coin-toss-view__choice-label">HEADS</span>
            <span class="coin-toss-view__choice-sub">Solar Eye Emblem</span>
          </button>

          <!-- Tails Choice Button -->
          <button
            class="coin-toss-view__choice-card"
            :class="{ 'coin-toss-view__choice-card--selected': selectedChoice === 'tails' }"
            :disabled="isFlipping"
            @click="handlePickChoice('tails')"
          >
            <span class="coin-toss-view__choice-hotkey">2 / T</span>
            <img
              :src="coinTailsUrl"
              alt="Tails"
              class="coin-toss-view__choice-coin-img"
              @error="handleImageFallback"
            />
            <span class="coin-toss-view__choice-label">TAILS</span>
            <span class="coin-toss-view__choice-sub">Crescent Star Emblem</span>
          </button>
        </div>
      </div>

      <!-- State 2: Coin in Mid-Air Flipping -->
      <div v-else-if="isFlipping" class="coin-toss-view__flipping-indicator">
        <LoadingSpinner size="md" variant="gold" />
        <span>Flipping the Sacred Coin...</span>
      </div>

      <!-- State 3: Landed Result & Winner Announcement -->
      <div
        v-else-if="hasLanded"
        class="coin-toss-view__result-banner"
        :class="{
          'coin-toss-view__result-banner--user-won': duelStore.userWonCoinToss,
          'coin-toss-view__result-banner--opponent-won': !duelStore.userWonCoinToss,
        }"
      >
        <div class="coin-toss-view__outcome-badge">
          Result: {{ duelStore.coinResult?.toUpperCase() }} (You called {{ duelStore.userChoice?.toUpperCase() }})
        </div>

        <h2 class="coin-toss-view__winner-title">
          {{ duelStore.userWonCoinToss ? 'YOU WON THE TOSS!' : `${opponentName.toUpperCase()} WON THE TOSS!` }}
        </h2>

        <p class="coin-toss-view__turn-announcement">
          <template v-if="duelStore.userWonCoinToss">
            You will take the <strong>FIRST TURN</strong> (Player 0). Prepare your opening hand.
          </template>
          <template v-else>
            <strong>{{ opponentName }}</strong> will take the <strong>FIRST TURN</strong> (Player 0). You go second.
          </template>
        </p>

        <div class="coin-toss-view__result-actions">
          <YugiButton
            variant="ghost"
            size="md"
            icon="🔄"
            @click="handleResetCoinToss"
          >
            Flip Again
          </YugiButton>

          <YugiButton
            variant="primary"
            size="lg"
            icon="🎬"
            @click="proceedToPreDuelVideo"
          >
            Proceed to Intro (Space)
          </YugiButton>
        </div>
      </div>
    </main>

    <!-- Bottom Footer Navigation -->
    <footer class="coin-toss-view__footer">
      <div class="coin-toss-view__footer-actions">
        <YugiButton variant="ghost" size="sm" to="/settings">
          ⚙️ Change Opponent ({{ opponentName }})
        </YugiButton>

        <YugiButton
          variant="secondary"
          size="sm"
          icon="🎴"
          @click="showDeckSelectModal = true"
        >
          Select Opponent Deck ({{ opponentDeckLabel }})
        </YugiButton>
      </div>

      <div class="coin-toss-view__deck-preview">
        <span class="text-secondary text-sm">
          Deck: <strong>{{ duelStore.selectedUserDeck?.name || 'Starter Deck' }}</strong>
          vs
          <strong>{{ duelStore.selectedOpponentDeck?.name || 'Random Deck' }}</strong>
        </span>
      </div>
    </footer>

    <!-- Opponent Deck Select Modal -->
    <OpponentDeckSelectModal
      v-model="showDeckSelectModal"
      :opponent="duelStore.selectedOpponent"
      :selected-deck="duelStore.selectedOpponentDeck"
      :is-manual="duelStore.isOpponentDeckManual"
      @select="handleSelectOpponentDeck"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelStore } from '../stores/duelStore.js';
import { useSettingsStore } from '../stores/settingsStore.js';
import type { CharacterDeckData } from '../../shared/types/character.js';
import type { CoinChoice } from '../../shared/types/duel.js';
import { getCoinHeadsUrl, getCoinTailsUrl } from '../utils/media.js';
import { audioManager } from '../audio/index.js';
import YugiButton from '../components/common/YugiButton.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import OpponentDeckSelectModal from '../components/common/OpponentDeckSelectModal.vue';

const router = useRouter();
const duelStore = useDuelStore();
const settingsStore = useSettingsStore();

const coinHeadsUrl = getCoinHeadsUrl();
const coinTailsUrl = getCoinTailsUrl();

const selectedChoice = ref<CoinChoice | null>(null);
const pendingOutcome = ref<CoinChoice | null>(null);
const isFlipping = ref(false);
const hasLanded = ref(false);
const showDeckSelectModal = ref(false);
let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

const opponentName = computed(() => duelStore.opponentName);
const opponentSeries = computed(() => duelStore.opponentSeries);
const opponentDeckLabel = computed(() => {
  if (duelStore.isOpponentDeckManual && duelStore.selectedOpponentDeck) {
    return duelStore.selectedOpponentDeck.name;
  }
  return `Random: ${duelStore.selectedOpponentDeck?.name || 'Default'}`;
});

function handleSelectOpponentDeck(deck: CharacterDeckData | null): void {
  duelStore.setOpponentDeck(deck);
}

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

function handleImageFallback(event: Event): void {
  const target = event.target as HTMLImageElement | null;
  if (target) {
    target.style.display = 'none';
  }
}

/**
 * Executes the 3D coin flip and starting player calculation.
 */
function handlePickChoice(choice: CoinChoice): void {
  if (isFlipping.value) return;

  selectedChoice.value = choice;
  isFlipping.value = true;
  hasLanded.value = false;

  audioManager.playSfx('coin-choice');

  // Play coin spinning sound
  setTimeout(() => {
    if (isFlipping.value) {
      audioManager.playSfx('coin-flip');
    }
  }, 120);

  // Random 50/50 outcome
  const outcome: CoinChoice = Math.random() < 0.5 ? 'heads' : 'tails';
  pendingOutcome.value = outcome;

  // Record outcome into duel store immediately
  duelStore.resolveCoinToss(choice, outcome);

  // Allow 2.2s for the 3D coin flip animation to complete
  setTimeout(() => {
    isFlipping.value = false;
    hasLanded.value = true;

    audioManager.playSfx('coin-land');

    // Play fanfare based on outcome
    setTimeout(() => {
      if (duelStore.userWonCoinToss) {
        audioManager.playSfx('toss-won');
      } else {
        audioManager.playSfx('toss-lost');
      }
    }, 180);

    // If auto-advance is preferred, set a generous timer
    autoAdvanceTimer = setTimeout(() => {
      // Optional: do not force auto-advance if user wants to inspect result, but allow quick spacebar
    }, 6000);
  }, 2200);
}

function handleResetCoinToss(): void {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  audioManager.playSfx('ui-click');
  selectedChoice.value = null;
  pendingOutcome.value = null;
  isFlipping.value = false;
  hasLanded.value = false;
}

function proceedToPreDuelVideo(): void {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  // If user enabled skip in settings, jump straight to duel
  if (settingsStore.skipPreDuelVideo) {
    router.push('/duel');
  } else {
    router.push('/pre-duel-video');
  }
}

function handleGlobalKeydown(e: KeyboardEvent): void {
  if (isFlipping.value) return;

  if (!hasLanded.value) {
    if (e.key === '1' || e.key === 'h' || e.key === 'H') {
      handlePickChoice('heads');
    } else if (e.key === '2' || e.key === 't' || e.key === 'T') {
      handlePickChoice('tails');
    }
  } else {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      proceedToPreDuelVideo();
    } else if (e.key === 'r' || e.key === 'R') {
      handleResetCoinToss();
    }
  }
}
</script>

