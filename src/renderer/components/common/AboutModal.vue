<template>
  <YugiModal
    v-if="isOpen"
    title="About Duel Arena"
    :cancelable="true"
    accent="gold"
    @close="$emit('close')"
  >
    <div class="about-content">
      <!-- Top Emblem & App Name Banner -->
      <div class="about-hero">
        <div class="about-logo-badge">
          <img src="../../assets/logo.png" alt="Yu-Gi-Oh! Logo" class="about-logo-img" />
        </div>
        <div class="about-hero-text">
          <h2 class="about-app-title">Yu-Gi-Oh! Duel Arena</h2>
          <span class="about-app-subtitle">Single-Player Offline Duel Simulator (DM + GX Era)</span>
        </div>
      </div>

      <!-- Specification Grid -->
      <div class="specs-grid">
        <div class="spec-card">
          <span class="spec-label">APP VERSION</span>
          <span class="spec-value">{{ appVersion }}</span>
        </div>

        <div class="spec-card">
          <span class="spec-label">RULES ENGINE</span>
          <span class="spec-value">ygopro-core v11.0 (WASM)</span>
        </div>

        <div class="spec-card">
          <span class="spec-label">CARD POOL</span>
          <span class="spec-value">2,826 Cards (DM + GX)</span>
        </div>

        <div class="spec-card">
          <span class="spec-label">NETWORK STATE</span>
          <span class="spec-value spec-value--offline">Offline (Zero Network Calls)</span>
        </div>
      </div>

      <!-- Tech Stack & Typography Info -->
      <div class="about-info-section">
        <h4 class="section-heading">ARCHITECTURE & DESIGN SYSTEM</h4>
        <p class="section-text">
          Engineered with Electron 35, Vue 3.5, TypeScript, Pinia, and an authentic "Ancient Duel Arena" SCSS 7-1 modular design architecture.
          Rules logic is strictly executed by the native <code>ygopro-core</code> state machine with structural anti-cheat hidden zone redaction.
        </p>
      </div>

      <!-- Typography Licensing -->
      <div class="about-info-section">
        <h4 class="section-heading">TYPOGRAPHY & FONTS</h4>
        <p class="section-text">
          Gaming & Display Typography: <strong>Oxanium</strong> & <strong>Barlow Semi Condensed</strong>.<br />
          Display & Body Typography: <strong>Cinzel</strong> & <strong>Inter</strong>.<br />
          Licensed under the SIL Open Font License 1.1 (OFL-1.1).
        </p>
      </div>

      <!-- Legal Disclaimer -->
      <div class="about-disclaimer-box">
        <span class="disclaimer-title">LEGAL NOTICE & DISCLAIMER</span>
        <p class="disclaimer-text">
          This project is an offline, non-commercial fan-made desktop application for personal entertainment and research.
          Yu-Gi-Oh! and all related card names, attributes, and likenesses are trademarks of Studio Dice / Shueisha, TV Tokyo, and Konami.
          This software is not affiliated with, endorsed by, or sponsored by Konami Digital Entertainment.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="about-modal-footer">
        <YugiButton
          variant="secondary"
          icon="⚡"
          @click="openUpdater"
        >
          Check for Updates
        </YugiButton>
        <YugiButton variant="primary" @click="$emit('close')">
          Close
        </YugiButton>
      </div>
    </template>
  </YugiModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import YugiModal from './YugiModal.vue';
import YugiButton from './YugiButton.vue';

const router = useRouter();

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function openUpdater(): void {
  emit('close');
  router.push('/update');
}

const appVersion = ref('0.1.0');

onMounted(async () => {
  if (window.appAPI && typeof window.appAPI.getVersion === 'function') {
    try {
      const v = await window.appAPI.getVersion();
      if (v) appVersion.value = v;
    } catch {
      // default fallback
    }
  }
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.about-content {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-1 0;
  max-height: 60vh;
  overflow-y: auto;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.35);
    border-radius: 3px;
  }
}

.about-hero {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding-bottom: $space-2;
  border-bottom: 1px solid rgba(201, 162, 39, 0.25);
}

.about-logo-badge {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  background: rgba(201, 162, 39, 0.15);
  border: 1px solid $color-gold-500;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
  box-shadow: 0 0 16px rgba(201, 162, 39, 0.3);
}

.about-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 6px rgba(227, 197, 103, 0.6));
}

.about-hero-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.about-app-title {
  margin: 0;
  font-family: $font-family-display;
  font-size: 1.35rem;
  font-weight: 700;
  color: $color-gold-300;
  letter-spacing: 0.04em;
  text-shadow: 0 0 10px rgba(227, 197, 103, 0.35);
}

.about-app-subtitle {
  font-family: $font-family-display;
  font-size: 0.76rem;
  color: $color-text-secondary;
  letter-spacing: 0.04em;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-2;
}

.spec-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: rgba(10, 14, 20, 0.7);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
}

.spec-label {
  font-family: $font-family-display;
  font-size: 0.65rem;
  font-weight: 800;
  color: $color-gold-500;
  letter-spacing: 0.08em;
}

.spec-value {
  font-family: 'Barlow Semi Condensed', monospace, sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: $color-text-primary;

  &--offline {
    color: #2ecc71;
  }
}

.about-info-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-heading {
  margin: 0;
  font-family: $font-family-display;
  font-size: 0.74rem;
  font-weight: 700;
  color: $color-gold-300;
  letter-spacing: 0.06em;
}

.section-text {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.45;
  color: $color-text-secondary;

  code {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 4px;
    border-radius: 3px;
    color: $color-gold-100;
  }
}

.about-disclaimer-box {
  background: rgba(5, 7, 10, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.disclaimer-title {
  font-family: $font-family-display;
  font-size: 0.65rem;
  font-weight: 800;
  color: $color-text-muted;
  letter-spacing: 0.08em;
}

.disclaimer-text {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: $color-text-muted;
}

.about-modal-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
