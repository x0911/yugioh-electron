<template>
  <div>
    <YugiModal
      :model-value="isOpen"
      title="⚔️ Ancient Duel Arena — Menu"
      :cancelable="true"
      @update:model-value="onModelValueUpdate"
      @close="$emit('close')"
    >
      <div class="duel-menu-content">
        <!-- Primary Actions Column -->
        <div class="menu-actions">
          <YugiButton
            variant="primary"
            class="menu-btn"
            @click="$emit('close')"
          >
            ▶ Resume Duel
          </YugiButton>

          <YugiButton
            variant="secondary"
            class="menu-btn"
            @click="onRestartClick"
          >
            🔄 Restart Match
          </YugiButton>

          <YugiButton
            variant="danger"
            class="menu-btn"
            @click="showSurrenderConfirm = true"
          >
            🏳️ Surrender & Exit to Main Menu
          </YugiButton>
        </div>

        <!-- In-Duel Quick Settings -->
        <div class="menu-audio-section glass-panel">
          <h4 class="section-title">🔊 Audio Settings</h4>

          <div class="setting-row">
            <span class="setting-label">Music (BGM)</span>
            <div class="slider-control">
              <input
                type="range"
                min="0"
                max="100"
                :value="settingsStore.bgmVolume"
                class="volume-slider"
                @input="onBgmInput"
              />
              <span class="volume-val">{{ settingsStore.bgmVolume }}%</span>
            </div>
          </div>

          <div class="setting-row">
            <span class="setting-label">Sound FX</span>
            <div class="slider-control">
              <input
                type="range"
                min="0"
                max="100"
                :value="settingsStore.sfxVolume"
                class="volume-slider"
                @input="onSfxInput"
              />
              <span class="volume-val">{{ settingsStore.sfxVolume }}%</span>
            </div>
          </div>
        </div>
      </div>
    </YugiModal>

    <!-- Surrender Confirmation Inner Modal -->
    <YugiModal
      :model-value="showSurrenderConfirm"
      title="🏳️ Concede Match?"
      :cancelable="true"
      @update:model-value="showSurrenderConfirm = $event"
      @close="showSurrenderConfirm = false"
    >
      <div class="surrender-dialog">
        <p class="surrender-text">
          Are you sure you want to surrender this duel? You will forfeit the match and return to the Main Menu.
        </p>
        <div class="surrender-actions">
          <YugiButton
            variant="ghost"
            @click="showSurrenderConfirm = false"
          >
            Cancel
          </YugiButton>
          <YugiButton
            variant="danger"
            @click="confirmSurrender"
          >
            Confirm Surrender
          </YugiButton>
        </div>
      </div>
    </YugiModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../../stores/settingsStore.js';
import YugiModal from '../common/YugiModal.vue';
import YugiButton from '../common/YugiButton.vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'surrender'): void;
  (e: 'restart'): void;
}>();

const router = useRouter();
const settingsStore = useSettingsStore();
const showSurrenderConfirm = ref(false);

function onModelValueUpdate(val: boolean): void {
  if (!val) {
    emit('close');
  }
}

function onBgmInput(e: Event): void {
  const target = e.target as HTMLInputElement;
  settingsStore.setBgmVolume(parseInt(target.value, 10));
}

function onSfxInput(e: Event): void {
  const target = e.target as HTMLInputElement;
  settingsStore.setSfxVolume(parseInt(target.value, 10));
}

function onRestartClick(): void {
  emit('restart');
  emit('close');
}

async function confirmSurrender(): Promise<void> {
  showSurrenderConfirm.value = false;
  emit('surrender');
  emit('close');
  await router.push('/main-menu');
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.duel-menu-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 320px;
}

.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .menu-btn {
    width: 100%;
    justify-content: center;
  }
}

.menu-audio-section {
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(10, 12, 16, 0.7);
  border: 1px solid rgba(201, 162, 39, 0.25);
  display: flex;
  flex-direction: column;
  gap: 10px;

  .section-title {
    font-family: 'Cinzel', serif, sans-serif;
    font-size: 0.85rem;
    color: $color-gold-300;
    margin: 0;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .setting-label {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.8rem;
    color: #f5f1e6;
  }

  .slider-control {
    display: flex;
    align-items: center;
    gap: 8px;

    .volume-slider {
      width: 110px;
      accent-color: $color-gold-500;
      cursor: pointer;
    }

    .volume-val {
      font-family: 'Oxanium', monospace, sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      color: $color-gold-300;
      min-width: 36px;
      text-align: right;
    }
  }
}

.surrender-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;

  .surrender-text {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.9rem;
    line-height: 1.4;
    color: #f5f1e6;
    margin: 0;
  }

  .surrender-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
