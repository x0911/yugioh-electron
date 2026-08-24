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

          <!-- AI Opponent & LLM Provider Configuration Card -->
          <GlassPanel class="settings-view__setting-group settings-view__ai-card" accent="gold">
            <div class="settings-view__ai-card-header">
              <div>
                <h3 class="settings-view__setting-group-title">AI Opponent & LLM Provider</h3>
                <p class="settings-view__ai-card-subtitle">
                  Choose your AI opponent's brain engine and configure your own API keys. Keys are saved locally on your device.
                </p>
              </div>
              <span
                class="settings-view__ai-status-pill"
                :class="settingsStore.hasKeyForProvider(activeConfigProvider) ? 'settings-view__ai-status-pill--ready' : 'settings-view__ai-status-pill--pending'"
              >
                {{ settingsStore.hasKeyForProvider(activeConfigProvider) ? '✓ Key Saved & Ready' : '⚪ Key Required' }}
              </span>
            </div>

            <!-- Provider Selection Tabs / Grid -->
            <div class="settings-view__ai-providers-grid">
              <button
                v-for="provider in aiProviderList"
                :key="provider.id"
                type="button"
                class="settings-view__ai-provider-btn"
                :class="{
                  'settings-view__ai-provider-btn--active': activeConfigProvider === provider.id,
                  'settings-view__ai-provider-btn--configured': settingsStore.hasKeyForProvider(provider.id)
                }"
                @click="handleSelectProviderTab(provider.id)"
              >
                <span class="settings-view__ai-provider-icon">{{ provider.icon }}</span>
                <div class="settings-view__ai-provider-text">
                  <span class="settings-view__ai-provider-name">{{ provider.name }}</span>
                  <span class="settings-view__ai-provider-model">{{ provider.modelTag }}</span>
                </div>
                <span
                  v-if="settingsStore.hasKeyForProvider(provider.id)"
                  class="settings-view__ai-provider-saved-dot"
                  title="API Key Saved"
                >✓</span>
              </button>
            </div>

            <!-- Active Provider Details & Credentials Form -->
            <div class="settings-view__ai-config-body">
              <!-- Built-in Heuristics Engine Message -->
              <div v-if="activeConfigProvider === 'builtin'" class="settings-view__ai-builtin-notice">
                <span class="settings-view__ai-notice-icon">⚡</span>
                <div class="settings-view__ai-notice-content">
                  <strong>Built-in Offline Heuristic AI Engine</strong>
                  <p>
                    Runs 100% locally on your computer with instant sub-millisecond decisions, simulated human think delays, and legendary DM/GX character tactics. No internet connection or API keys required!
                  </p>
                </div>
              </div>

              <!-- Cloud LLM / Ollama Credentials Form -->
              <div v-else class="settings-view__ai-credentials-form">
                <!-- Info & API Console Link -->
                <div class="settings-view__ai-info-row">
                  <span class="settings-view__ai-desc">{{ currentProviderMeta.description }}</span>
                  <a
                    v-if="currentProviderMeta.portalUrl"
                    :href="currentProviderMeta.portalUrl"
                    target="_blank"
                    class="settings-view__ai-key-link"
                  >
                    🔑 Get {{ currentProviderMeta.name }} API Key ↗
                  </a>
                </div>

                <!-- API Key Input Field (Except Ollama) -->
                <div v-if="activeConfigProvider !== 'ollama'" class="settings-view__ai-input-group">
                  <label class="settings-view__ai-input-label">
                    {{ currentProviderMeta.name }} API Key
                  </label>
                  <div class="settings-view__ai-key-input-wrapper">
                    <input
                      :type="showApiKey ? 'text' : 'password'"
                      class="settings-view__ai-text-input"
                      :placeholder="`Enter your ${currentProviderMeta.name} API Key...`"
                      :value="currentApiKey"
                      @input="handleApiKeyInput"
                    />
                    <button
                      type="button"
                      class="settings-view__ai-show-key-btn"
                      :title="showApiKey ? 'Hide Key' : 'Show Key'"
                      @click="showApiKey = !showApiKey"
                    >
                      {{ showApiKey ? '👁️' : '🔒' }}
                    </button>
                  </div>
                </div>

                <!-- Custom Endpoint (Ollama or Custom) -->
                <div v-if="activeConfigProvider === 'ollama' || activeConfigProvider === 'custom'" class="settings-view__ai-input-group">
                  <label class="settings-view__ai-input-label">
                    Base URL / API Endpoint
                  </label>
                  <input
                    type="text"
                    class="settings-view__ai-text-input"
                    :placeholder="currentProviderMeta.defaultEndpoint || 'http://localhost:11434/v1/chat/completions'"
                    :value="currentEndpoint"
                    @input="handleEndpointInput"
                  />
                </div>

                <!-- Model Selection (Presets + Live Fetched + Custom) -->
                <div class="settings-view__ai-input-group">
                  <div class="settings-view__ai-model-header-row">
                    <label class="settings-view__ai-input-label">
                      Model Selection
                    </label>
                    <button
                      type="button"
                      class="settings-view__ai-fetch-models-btn"
                      :disabled="isFetchingModels"
                      title="Fetch latest available models directly from your provider account"
                      @click="() => fetchModelsForProvider(activeConfigProvider)"
                    >
                      <span v-if="isFetchingModels">⏳ Loading Models...</span>
                      <span v-else>🔄 Fetch Models</span>
                    </button>
                  </div>

                  <div class="settings-view__ai-model-selector-row">
                    <select
                      class="settings-view__select-input"
                      :value="selectedModelPresetValue"
                      @change="handleModelPresetChange"
                    >
                      <option
                        v-for="m in effectiveAvailableModels"
                        :key="m"
                        :value="m"
                      >
                        {{ m }} {{ m === currentProviderMeta.defaultModel ? '(Default)' : '' }}
                      </option>
                      <option value="__custom__">⚙️ Custom Model Name...</option>
                    </select>
                    <input
                      v-if="isCustomModelSelected"
                      type="text"
                      class="settings-view__ai-text-input"
                      placeholder="Enter custom model identifier (e.g. llama-3.1-8b-instant)..."
                      :value="currentModel"
                      @input="handleModelInput"
                    />
                  </div>
                  <div v-if="fetchModelsStatus" class="settings-view__ai-model-fetch-note">
                    {{ fetchModelsStatus }}
                  </div>
                </div>

                <!-- Test Connection & Active Status Row -->
                <div class="settings-view__ai-test-row">
                  <button
                    type="button"
                    class="settings-view__ai-test-btn"
                    :disabled="isTestingConnection"
                    @click="handleTestAiConnection"
                  >
                    <span v-if="isTestingConnection">⏳ Testing Connection...</span>
                    <span v-else>🧪 Test Connection & Verify Key</span>
                  </button>

                  <div v-if="testResult" class="settings-view__ai-test-result" :class="testResult.success ? 'settings-view__ai-test-result--success' : 'settings-view__ai-test-result--error'">
                    <span class="settings-view__ai-result-icon">{{ testResult.success ? '🟢' : '🔴' }}</span>
                    <span class="settings-view__ai-result-text">{{ testResult.message || testResult.error }}</span>
                  </div>
                </div>
              </div>

              <!-- Set as Active AI Button -->
              <div class="settings-view__ai-activate-bar">
                <span class="settings-view__ai-active-indicator">
                  Active in Duels:
                  <strong>{{ activeDuelProviderName }}</strong>
                </span>
                <YugiButton
                  v-if="settingsStore.aiProvider !== activeConfigProvider"
                  variant="gold"
                  size="sm"
                  @click="handleActivateCurrentProvider"
                >
                  Set as Active AI Opponent
                </YugiButton>
                <span v-else class="settings-view__ai-currently-active-badge">
                  ✓ Currently Selected AI
                </span>
              </div>
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

import type { AiProviderType } from '../../shared/types/character.js';

const settingsStore = useSettingsStore();
const avatarFailed = ref(false);
const showAboutModal = ref(false);
const activePreviewId = ref<string | null>(null);

const activeConfigProvider = ref<AiProviderType>(
  settingsStore.aiProvider || (settingsStore.aiEngineType as any) || 'builtin',
);
const showApiKey = ref(false);
const isTestingConnection = ref(false);
const testResult = ref<{ success: boolean; message?: string; error?: string } | null>(null);

interface ProviderMeta {
  id: AiProviderType;
  name: string;
  icon: string;
  modelTag: string;
  defaultModel: string;
  availableModels: string[];
  defaultEndpoint?: string;
  description: string;
  portalUrl?: string;
}

const aiProviderList: ProviderMeta[] = [
  {
    id: 'builtin',
    name: 'Built-in Fast AI',
    icon: '⚡',
    modelTag: 'Local Heuristic Engine',
    defaultModel: 'Local Heuristics',
    availableModels: ['Local Heuristics'],
    description: 'Instant local decision making and tactical evaluation with no external network calls.',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✨',
    modelTag: 'gemini-2.5-flash',
    defaultModel: 'gemini-2.5-flash',
    availableModels: [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-3.6-flash',
    ],
    description: 'Google’s next-gen multimodal reasoning model for strategic dueling and dramatic voice dialogue.',
    portalUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    icon: '🤖',
    modelTag: 'gpt-4o-mini',
    defaultModel: 'gpt-4o-mini',
    availableModels: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
    ],
    description: 'OpenAI GPT models with JSON schema reasoning and high-level card game strategy.',
    portalUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek AI',
    icon: '🌌',
    modelTag: 'deepseek-chat',
    defaultModel: 'deepseek-chat',
    availableModels: [
      'deepseek-chat',
      'deepseek-reasoner',
    ],
    description: 'DeepSeek advanced reasoning model with low API cost and high strategic performance.',
    portalUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: '🧠',
    modelTag: 'claude-3-5-haiku',
    defaultModel: 'claude-3-5-haiku-20241022',
    availableModels: [
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'claude-3-haiku-20240307',
    ],
    description: 'Anthropic Claude 3.5 Haiku/Sonnet for character-faithful dialogue and tactical planning.',
    portalUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    icon: '⚡',
    modelTag: 'llama-3.1-8b',
    defaultModel: 'llama-3.1-8b-instant',
    availableModels: [
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    description: 'Ultra-low-latency Llama 3 models running on Groq LPU hardware.',
    portalUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local LLM)',
    icon: '🦙',
    modelTag: 'llama3.2',
    defaultModel: 'llama3.2',
    availableModels: [
      'llama3.2',
      'llama3.1',
      'mistral',
      'qwen2.5',
      'deepseek-r1',
    ],
    defaultEndpoint: 'http://localhost:11434/v1/chat/completions',
    description: 'Run open-source models completely locally on your own machine via Ollama.',
    portalUrl: 'https://ollama.com',
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    icon: '⚙️',
    modelTag: 'OpenAI-Compatible',
    defaultModel: 'default-model',
    availableModels: ['default-model'],
    defaultEndpoint: 'https://api.your-endpoint.com/v1/chat/completions',
    description: 'Connect any OpenAI-compatible LLM proxy or local inference server.',
  },
];

const selectedChar = computed(() => settingsStore.selectedCharacter);

const currentProviderMeta = computed<ProviderMeta>(() => {
  return (
    aiProviderList.find((p) => p.id === activeConfigProvider.value) || aiProviderList[0]
  );
});

const currentApiKey = computed(() => {
  return settingsStore.aiApiKeys?.[activeConfigProvider.value] || '';
});

const currentEndpoint = computed(() => {
  return settingsStore.aiCustomEndpoints?.[activeConfigProvider.value] || '';
});

const currentModel = computed(() => {
  return settingsStore.aiModels?.[activeConfigProvider.value] || '';
});

const isCustomModelSelected = ref(false);
const isFetchingModels = ref(false);
const fetchModelsStatus = ref<string | null>(null);
const liveModelsByProvider = ref<Record<string, string[]>>({});

const effectiveAvailableModels = computed<string[]>(() => {
  const live = liveModelsByProvider.value[activeConfigProvider.value];
  if (live && live.length > 0) {
    return live;
  }
  return currentProviderMeta.value.availableModels;
});

const selectedModelPresetValue = computed(() => {
  if (isCustomModelSelected.value) return '__custom__';
  const val = currentModel.value || currentProviderMeta.value.defaultModel;
  if (effectiveAvailableModels.value.includes(val)) {
    return val;
  }
  return '__custom__';
});

const activeDuelProviderName = computed(() => {
  const activeId = settingsStore.aiProvider || (settingsStore.aiEngineType as any) || 'builtin';
  const found = aiProviderList.find((p) => p.id === activeId);
  return found ? `${found.icon} ${found.name}` : '⚡ Built-in Fast Engine';
});

async function fetchModelsForProvider(provider: AiProviderType, silent = false): Promise<void> {
  if (provider === 'builtin') return;
  const key = settingsStore.aiApiKeys?.[provider];
  if (!key && provider !== 'ollama') {
    if (!silent) {
      fetchModelsStatus.value = `⚠️ Please enter an API key first to fetch models.`;
    }
    return;
  }

  isFetchingModels.value = true;
  if (!silent) {
    fetchModelsStatus.value = `⏳ Fetching available models for ${provider.toUpperCase()}...`;
  }

  try {
    const res = await settingsStore.fetchAiModels(provider);
    if (res.success && res.models && res.models.length > 0) {
      liveModelsByProvider.value[provider] = res.models;
      fetchModelsStatus.value = `✓ Loaded ${res.models.length} models from ${provider.toUpperCase()}`;

      // If user hasn't selected a model yet or current model is not in available models, auto-select the first one
      const current = settingsStore.aiModels?.[provider];
      if (!current || !res.models.includes(current)) {
        await settingsStore.setAiModel(provider, res.models[0]);
      }
    } else if (res.error) {
      if (!silent) {
        fetchModelsStatus.value = `⚠️ Failed to fetch models: ${res.error}`;
      }
    }
  } catch (err: any) {
    if (!silent) {
      fetchModelsStatus.value = `⚠️ Error fetching models: ${err?.message || String(err)}`;
    }
  } finally {
    isFetchingModels.value = false;
  }
}

function handleSelectProviderTab(id: AiProviderType): void {
  activeConfigProvider.value = id;
  testResult.value = null;
  fetchModelsStatus.value = null;
  const savedModel = settingsStore.aiModels?.[id];
  const meta = aiProviderList.find((p) => p.id === id);
  const models = liveModelsByProvider.value[id] || meta?.availableModels || [];
  if (savedModel && !models.includes(savedModel)) {
    isCustomModelSelected.value = true;
  } else {
    isCustomModelSelected.value = false;
  }

  // Auto-fetch models if key exists
  if (settingsStore.aiApiKeys?.[id] || id === 'ollama') {
    fetchModelsForProvider(id, true);
  }
}

let apiKeyDebounceTimer: ReturnType<typeof setTimeout> | null = null;

async function handleApiKeyInput(e: Event): Promise<void> {
  const val = (e.target as HTMLInputElement).value;
  testResult.value = null;
  fetchModelsStatus.value = null;
  await settingsStore.setAiApiKey(activeConfigProvider.value, val);

  if (apiKeyDebounceTimer) clearTimeout(apiKeyDebounceTimer);
  if (val.trim().length >= 8) {
    apiKeyDebounceTimer = setTimeout(() => {
      fetchModelsForProvider(activeConfigProvider.value, true);
    }, 600);
  }
}

async function handleEndpointInput(e: Event): Promise<void> {
  const val = (e.target as HTMLInputElement).value;
  testResult.value = null;
  await settingsStore.setAiCustomEndpoint(activeConfigProvider.value, val);
}

async function handleModelPresetChange(e: Event): Promise<void> {
  const val = (e.target as HTMLSelectElement).value;
  testResult.value = null;
  if (val === '__custom__') {
    isCustomModelSelected.value = true;
  } else {
    isCustomModelSelected.value = false;
    await settingsStore.setAiModel(activeConfigProvider.value, val);
  }
}

async function handleModelInput(e: Event): Promise<void> {
  const val = (e.target as HTMLInputElement).value;
  testResult.value = null;
  await settingsStore.setAiModel(activeConfigProvider.value, val);
}

async function handleActivateCurrentProvider(): Promise<void> {
  await settingsStore.setAiProvider(activeConfigProvider.value);
}

async function handleTestAiConnection(): Promise<void> {
  isTestingConnection.value = true;
  testResult.value = null;
  try {
    const res = await settingsStore.testAiConnection(activeConfigProvider.value);
    testResult.value = res;
    if (res.success) {
      // Also refresh models on successful test
      fetchModelsForProvider(activeConfigProvider.value, true);
    }
  } catch (err: any) {
    testResult.value = { success: false, error: err?.message || String(err) };
  } finally {
    isTestingConnection.value = false;
  }
}

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
  activeConfigProvider.value = 'builtin';
  testResult.value = null;
}

onMounted(async () => {
  await settingsStore.initializeSettings();
  if (settingsStore.aiProvider) {
    activeConfigProvider.value = settingsStore.aiProvider;
  }
});

onUnmounted(() => {
  audioManager.stopPreview();
});
</script>
