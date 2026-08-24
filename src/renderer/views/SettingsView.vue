<template>
  <div class="settings-view">
    <!-- Header -->
    <header class="settings-view__header">
      <div class="settings-view__header-left">
        <h1 class="settings-view__title">Settings & Opponents</h1>
        <p class="settings-view__subtitle">
          Select your active AI duel opponent from 20 legendary duelists and configure sound and
          duel preferences.
        </p>
      </div>

      <div class="settings-view__header-actions">
        <YugiButton variant="ghost" size="md" icon="ℹ️" @click="showAboutModal = true">
          About Arena
        </YugiButton>
        <YugiButton variant="secondary" size="md" icon="←" to="/main-menu">
          Return to Main Menu
        </YugiButton>
      </div>
    </header>

    <!-- Loading State -->
    <div
      v-if="settingsStore.isLoading && !settingsStore.isInitialized"
      class="settings-view__loading"
    >
      <LoadingSpinner variant="gold" size="md" message="Loading Opponents & Settings..." />
    </div>

    <template v-else>
      <!-- SECTION 1: OPPONENT SELECTION -->
      <section class="settings-view__section">
        <div class="settings-view__section-header">
          <h2 class="settings-view__section-title">Select Duel Opponent</h2>
          <span class="settings-view__section-tag">
            {{ settingsStore.characters.length }} Duelists Available
          </span>
        </div>

        <!-- Opponent Carousel -->
        <OpponentCarousel
          :characters="settingsStore.characters"
          :selected-id="settingsStore.selectedOpponentId"
          :series-filter="settingsStore.selectedSeriesFilter"
          @select="handleSelectOpponent"
          @update:series-filter="handleFilterChange"
        />

        <!-- Active Opponent Dossier -->
        <GlassPanel
          v-if="selectedChar"
          elevated
          accent="gold"
          class="settings-view__dossier"
          :style="{ '--char-theme-color': selectedChar.themeColor || '#c9a227' }"
        >
          <!-- Left Column: Avatar & Quick Info -->
          <div class="settings-view__dossier-left">
            <div class="settings-view__dossier-avatar-box">
              <img
                v-if="!avatarFailed && (selectedChar.portrait || selectedChar.avatar)"
                :src="selectedChar.portrait || selectedChar.avatar"
                :alt="selectedChar.name"
                class="settings-view__dossier-img"
                @error="avatarFailed = true"
              />
              <div v-else class="character-card__silhouette" aria-hidden="true">
                <svg
                  class="character-card__silhouette-svg"
                  viewBox="0 0 120 140"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="60"
                    cy="70"
                    r="48"
                    stroke="var(--char-theme-color)"
                    stroke-width="1.5"
                    stroke-dasharray="4 4"
                    opacity="0.4"
                  />
                  <circle
                    cx="60"
                    cy="70"
                    r="34"
                    stroke="var(--char-theme-color)"
                    stroke-width="1"
                    opacity="0.25"
                  />
                  <path
                    d="M60 22C44 22 36 34 36 50C36 58 38 64 42 70L38 88C38 88 46 86 52 84C55 85 57 86 60 86C63 86 65 85 68 84C74 86 82 88 82 88L78 70C82 64 84 58 84 50C84 34 76 22 60 22Z"
                    fill="url(#dossierGrad)"
                    opacity="0.9"
                  />
                  <path
                    d="M60 14L52 28L60 24L68 28L60 14Z"
                    fill="var(--char-theme-color)"
                    opacity="0.75"
                  />
                  <path
                    d="M36 100C24 106 14 118 10 134H110C106 118 96 106 86 100C80 108 70 114 60 114C50 114 40 108 36 100Z"
                    fill="url(#dossierGrad)"
                    opacity="0.85"
                  />
                  <defs>
                    <linearGradient
                      id="dossierGrad"
                      x1="60"
                      y1="20"
                      x2="60"
                      y2="134"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#f4e4b8" stop-opacity="0.9" />
                      <stop offset="0.6" stop-color="var(--char-theme-color)" stop-opacity="0.7" />
                      <stop offset="1" stop-color="#0a0c10" stop-opacity="0.95" />
                    </linearGradient>
                  </defs>
                </svg>
                <span class="character-card__placeholder-tag">PORTRAIT PLACEHOLDER</span>
              </div>
            </div>

            <div class="settings-view__dossier-active-badge">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              ACTIVE DUEL OPPONENT
            </div>

            <h3 class="settings-view__dossier-name">{{ selectedChar.name }}</h3>
            <p class="settings-view__dossier-title">{{ selectedChar.title }}</p>
          </div>

          <!-- Right Column: Bio, Decks & Strategy -->
          <div class="settings-view__dossier-right">
            <div class="settings-view__dossier-bio-block">
              <h4 class="settings-view__dossier-tagline">{{ selectedChar.tagline }}</h4>
              <p class="settings-view__dossier-bio">{{ selectedChar.description }}</p>
            </div>

            <!-- Prebuilt Decks -->
            <div class="settings-view__decks-block">
              <div class="settings-view__decks-header">
                <h4 class="settings-view__decks-title">Character Decks</h4>
                <span class="settings-view__decks-random-note">
                  🎲 One picked randomly when duel starts
                </span>
              </div>

              <div class="settings-view__decks-grid">
                <div
                  v-for="(deck, dIdx) in selectedChar.decks"
                  :key="deck.id"
                  class="settings-view__deck-card"
                >
                  <span class="settings-view__deck-num"
                    >DECK {{ dIdx + 1 }} • {{ deck.archetype }}</span
                  >
                  <h5 class="settings-view__deck-name">{{ deck.name }}</h5>
                  <p class="settings-view__deck-desc">{{ deck.description }}</p>
                </div>
              </div>
            </div>

            <!-- Signature Cards & Video Status -->
            <div class="settings-view__signature-row">
              <span class="settings-view__signature-label">Pre-Duel Video:</span>
              <span class="settings-view__signature-chip">
                🎬 {{ selectedChar.video }} (Placeholder)
              </span>
            </div>
          </div>
        </GlassPanel>
      </section>

      <!-- SECTION 2: BACKGROUND MUSIC THEMES -->
      <section class="settings-view__section">
        <div class="settings-view__section-header">
          <h2 class="settings-view__section-title">Main Background Music Theme</h2>
          <span class="settings-view__section-tag"> {{ BGM_THEMES.length }} Themes Available </span>
        </div>

        <GlassPanel
          class="settings-view__setting-group settings-view__setting-group--full"
          accent="gold"
        >
          <div class="settings-view__themes-grid">
            <div
              v-for="theme in BGM_THEMES"
              :key="theme.id"
              class="settings-view__theme-card"
              :class="{
                'settings-view__theme-card--selected': settingsStore.selectedBgmTheme === theme.id,
              }"
              @click="handleSelectBgmTheme(theme.id)"
            >
              <div class="settings-view__theme-top">
                <span class="settings-view__theme-icon">{{ theme.icon }}</span>
                <span class="settings-view__theme-genre">{{ theme.genre }}</span>
              </div>

              <div class="settings-view__theme-body">
                <h4 class="settings-view__theme-name">{{ theme.name }}</h4>
                <span class="settings-view__theme-subtitle">{{ theme.subtitle }}</span>
                <p class="settings-view__theme-desc">{{ theme.description }}</p>
              </div>

              <div class="settings-view__theme-actions">
                <span
                  v-if="settingsStore.selectedBgmTheme === theme.id"
                  class="settings-view__theme-badge"
                >
                  ✓ ACTIVE THEME
                </span>
                <span v-else class="text-xs text-muted">Click to Select</span>

                <button
                  type="button"
                  class="settings-view__preview-btn"
                  :class="{ 'settings-view__preview-btn--playing': isPlayingPreview(theme.id) }"
                  @click.stop="togglePreview(theme.id)"
                >
                  {{ isPlayingPreview(theme.id) ? '⏹ Stop' : '▶ Preview' }}
                </button>
              </div>
            </div>
          </div>
        </GlassPanel>
      </section>

      <!-- SECTION 3: AUDIO & GAMEPLAY CONFIG -->
      <section class="settings-view__section">
        <div class="settings-view__section-header">
          <h2 class="settings-view__section-title">Sound & Gameplay Settings</h2>
        </div>

        <div class="settings-view__settings-grid">
          <!-- Audio Group -->
          <GlassPanel class="settings-view__setting-group" accent="none">
            <h3 class="settings-view__setting-group-title">Audio Volume & Ducking</h3>

            <!-- Master Volume -->
            <div class="settings-view__slider-row">
              <div class="settings-view__slider-header">
                <div class="settings-view__slider-header-left">
                  <button
                    type="button"
                    class="settings-view__mute-btn"
                    :class="{ 'settings-view__mute-btn--muted': settingsStore.isMasterMuted }"
                    :title="settingsStore.isMasterMuted ? 'Unmute Master' : 'Mute Master'"
                    @click="settingsStore.toggleMasterMute"
                  >
                    {{ settingsStore.isMasterMuted ? '🔇' : '🔊' }}
                  </button>
                  <label for="master-slider" class="settings-view__slider-label"
                    >Master Volume</label
                  >
                </div>
                <span class="settings-view__slider-val">
                  {{ settingsStore.isMasterMuted ? 'MUTED' : `${settingsStore.masterVolume}%` }}
                </span>
              </div>
              <input
                id="master-slider"
                type="range"
                min="0"
                max="100"
                :value="settingsStore.masterVolume"
                :disabled="settingsStore.isMasterMuted"
                class="settings-view__range-input"
                @input="handleMasterInput"
              />
            </div>

            <!-- BGM Slider -->
            <div class="settings-view__slider-row">
              <div class="settings-view__slider-header">
                <div class="settings-view__slider-header-left">
                  <button
                    type="button"
                    class="settings-view__mute-btn"
                    :class="{ 'settings-view__mute-btn--muted': settingsStore.isBgmMuted }"
                    :title="settingsStore.isBgmMuted ? 'Unmute Music' : 'Mute Music'"
                    @click="settingsStore.toggleBgmMute"
                  >
                    {{ settingsStore.isBgmMuted ? '🔇' : '🎵' }}
                  </button>
                  <label for="bgm-slider" class="settings-view__slider-label"
                    >Music Volume (BGM)</label
                  >
                </div>
                <span class="settings-view__slider-val">
                  {{ settingsStore.isBgmMuted ? 'MUTED' : `${settingsStore.bgmVolume}%` }}
                </span>
              </div>
              <input
                id="bgm-slider"
                type="range"
                min="0"
                max="100"
                :value="settingsStore.bgmVolume"
                :disabled="settingsStore.isBgmMuted"
                class="settings-view__range-input"
                @input="handleBgmInput"
              />
            </div>

            <!-- SFX Slider -->
            <div class="settings-view__slider-row">
              <div class="settings-view__slider-header">
                <div class="settings-view__slider-header-left">
                  <button
                    type="button"
                    class="settings-view__mute-btn"
                    :class="{ 'settings-view__mute-btn--muted': settingsStore.isSfxMuted }"
                    :title="settingsStore.isSfxMuted ? 'Unmute SFX' : 'Mute SFX'"
                    @click="settingsStore.toggleSfxMute"
                  >
                    {{ settingsStore.isSfxMuted ? '🔇' : '🔔' }}
                  </button>
                  <label for="sfx-slider" class="settings-view__slider-label"
                    >Sound Effects (SFX)</label
                  >
                </div>
                <span class="settings-view__slider-val">
                  {{ settingsStore.isSfxMuted ? 'MUTED' : `${settingsStore.sfxVolume}%` }}
                </span>
              </div>
              <input
                id="sfx-slider"
                type="range"
                min="0"
                max="100"
                :value="settingsStore.sfxVolume"
                :disabled="settingsStore.isSfxMuted"
                class="settings-view__range-input"
                @input="handleSfxInput"
              />
            </div>

            <!-- Cutscene Ducking Intensity -->
            <div class="settings-view__toggle-row">
              <div class="settings-view__toggle-info">
                <span class="settings-view__toggle-label">Cutscene Music Ducking</span>
                <span class="settings-view__toggle-desc">
                  Automatically attenuate background music during summon/attack videos.
                </span>
              </div>
              <select
                class="settings-view__select-input"
                :value="settingsStore.duckingIntensity"
                @change="handleDuckingChange"
              >
                <option value="normal">Normal (85% reduction)</option>
                <option value="mute">Full Mute during videos</option>
                <option value="off">Off (Keep full volume)</option>
              </select>
            </div>
          </GlassPanel>

          <!-- Gameplay Toggles Group -->
          <GlassPanel class="settings-view__setting-group" accent="none">
            <h3 class="settings-view__setting-group-title">Preferences</h3>

            <!-- Chain Confirmation Timing -->
            <div class="settings-view__toggle-row">
              <div class="settings-view__toggle-info">
                <span class="settings-view__toggle-label">Chain Confirmation Mode</span>
                <span class="settings-view__toggle-desc">
                  Controls how frequently the duel engine prompts you to activate Quick Effects, Spells, and Traps.
                </span>
              </div>
              <select
                class="settings-view__select-input"
                :value="settingsStore.chainConfirmationMode || 'auto'"
                @change="handleChainModeChange"
              >
                <option value="auto">Auto (Smart - Auto-skips repetitive prompts)</option>
                <option value="on">Always On (Strict Tournament Rules)</option>
                <option value="off">Off (Auto-pass optional chains)</option>
              </select>
            </div>

            <!-- Skip Video Toggle -->
            <div class="settings-view__toggle-row">
              <div class="settings-view__toggle-info">
                <span class="settings-view__toggle-label">Skip Pre-Duel Character Videos</span>
                <span class="settings-view__toggle-desc">
                  Instantly enter duels without playing opponent intro cinematic videos.
                </span>
              </div>
              <label class="settings-view__switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.skipPreDuelVideo"
                  @change="settingsStore.toggleSkipPreDuelVideo"
                />
                <span class="settings-view__switch-slider"></span>
              </label>
            </div>

            <!-- Dev Mode Toggle -->
            <div class="settings-view__toggle-row">
              <div class="settings-view__toggle-info">
                <span class="settings-view__toggle-label">Developer Engine Diagnostics</span>
                <span class="settings-view__toggle-desc">
                  Enable live engine message streams, turn event logging, and dev inspect overlays.
                </span>
              </div>
              <label class="settings-view__switch">
                <input
                  type="checkbox"
                  :checked="settingsStore.devMode"
                  @change="settingsStore.toggleDevMode"
                />
                <span class="settings-view__switch-slider"></span>
              </label>
            </div>
          </GlassPanel>
        </div>
      </section>

      <!-- Footer Action Bar -->
      <footer class="settings-view__footer-bar">
        <YugiButton variant="ghost" size="md" @click="handleReset">
          Reset Settings to Default
        </YugiButton>
        <YugiButton variant="primary" size="md" icon="←" to="/main-menu">
          Save & Return to Main Menu
        </YugiButton>
      </footer>
    </template>

    <!-- About & Version Information Modal -->
    <AboutModal :is-open="showAboutModal" @close="showAboutModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from '../stores/settingsStore.js';
import { BGM_THEMES, audioManager, type DuckingIntensity } from '../audio/index.js';
import GlassPanel from '../components/common/GlassPanel.vue';
import YugiButton from '../components/common/YugiButton.vue';
import LoadingSpinner from '../components/common/LoadingSpinner.vue';
import AboutModal from '../components/common/AboutModal.vue';
import OpponentCarousel from '../components/settings/OpponentCarousel.vue';

const settingsStore = useSettingsStore();
const avatarFailed = ref(false);
const showAboutModal = ref(false);
const activePreviewId = ref<string | null>(null);

const selectedChar = computed(() => settingsStore.selectedCharacter);

function handleSelectOpponent(id: string): void {
  avatarFailed.value = false;
  settingsStore.setSelectedOpponent(id);
}

function handleFilterChange(filter: 'ALL' | 'DM' | 'GX'): void {
  settingsStore.setSelectedSeriesFilter(filter);
}

function handleSelectBgmTheme(themeId: string): void {
  audioManager.stopPreview();
  activePreviewId.value = null;
  settingsStore.setSelectedBgmTheme(themeId);
}

function togglePreview(themeId: string): void {
  if (activePreviewId.value === themeId) {
    audioManager.stopPreview();
    activePreviewId.value = null;
    audioManager.playBgm(settingsStore.selectedBgmTheme);
  } else {
    activePreviewId.value = themeId;
    audioManager.previewTheme(themeId, 15);
  }
}

function isPlayingPreview(themeId: string): boolean {
  return activePreviewId.value === themeId;
}

function handleMasterInput(e: Event): void {
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  settingsStore.setMasterVolume(val);
}

function handleBgmInput(e: Event): void {
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  settingsStore.setBgmVolume(val);
}

function handleSfxInput(e: Event): void {
  const val = parseInt((e.target as HTMLInputElement).value, 10);
  settingsStore.setSfxVolume(val);
}

function handleDuckingChange(e: Event): void {
  const val = (e.target as HTMLSelectElement).value as DuckingIntensity;
  settingsStore.setDuckingIntensity(val);
}

function handleChainModeChange(e: Event): void {
  const val = (e.target as HTMLSelectElement).value as 'auto' | 'on' | 'off';
  settingsStore.setChainConfirmationMode(val);
}

async function handleReset(): Promise<void> {
  audioManager.stopPreview();
  activePreviewId.value = null;
  await settingsStore.resetToDefaults();
}

onMounted(async () => {
  await settingsStore.initializeSettings();
});

onUnmounted(() => {
  audioManager.stopPreview();
});
</script>
