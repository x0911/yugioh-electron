<template>
  <div class="voice-chat-widget glass-panel">
    <!-- Voice Disconnected / Inactive State: Join Button -->
    <div v-if="!voiceState.enabled" class="voice-chat-widget__inactive">
      <button
        type="button"
        class="voice-btn voice-btn--join"
        title="Join Real-Time WebRTC Voice Chat with Opponent"
        @click="handleJoinVoice"
      >
        <span class="voice-btn__icon">🎙️</span>
        <span class="voice-btn__label">Join Voice Chat</span>
      </button>
    </div>

    <!-- Voice Connected / Active State: Controls & Status -->
    <div v-else class="voice-chat-widget__active">
      <!-- Local Mic Indicator & Mute Button -->
      <div class="voice-control-group">
        <button
          type="button"
          class="voice-btn voice-btn--icon"
          :class="{
            'voice-btn--muted': voiceState.isMuted,
            'voice-btn--speaking': voiceState.isSpeaking && !voiceState.isMuted,
          }"
          :title="voiceState.isMuted ? 'Unmute Microphone (M)' : 'Mute Microphone (M)'"
          @click="toggleMute"
        >
          <span class="voice-btn__icon">{{ voiceState.isMuted ? '🔇' : '🎙️' }}</span>
          <span v-if="voiceState.isSpeaking && !voiceState.isMuted" class="voice-pulse-ring" />
        </button>
        <span class="voice-label">{{ voiceState.isMuted ? 'Muted' : (voiceState.isSpeaking ? 'Speaking...' : 'Mic On') }}</span>
      </div>

      <!-- Remote Opponent Voice Status & Deafen Button -->
      <div class="voice-control-group">
        <button
          type="button"
          class="voice-btn voice-btn--icon"
          :class="{
            'voice-btn--deafened': voiceState.isDeafened,
            'voice-btn--speaking': voiceState.isRemoteSpeaking && !voiceState.isDeafened,
          }"
          :title="voiceState.isDeafened ? 'Undeafen Audio' : 'Mute Opponent Audio'"
          @click="toggleDeafen"
        >
          <span class="voice-btn__icon">{{ voiceState.isDeafened ? '🔈❌' : '🔊' }}</span>
          <span v-if="voiceState.isRemoteSpeaking && !voiceState.isDeafened" class="voice-pulse-ring voice-pulse-ring--remote" />
        </button>
        <span class="voice-label">
          {{ voiceState.isDeafened ? 'Deafened' : (voiceState.isRemoteSpeaking ? 'Opponent Talking' : 'Voice Active') }}
        </span>
      </div>

      <!-- Volume Slider Popover -->
      <div class="voice-volume-wrapper">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="voiceState.volume"
          class="voice-volume-slider"
          title="Voice Chat Output Volume"
          @input="onVolumeChange"
        />
      </div>

      <!-- Leave Voice Button -->
      <button
        type="button"
        class="voice-btn voice-btn--leave"
        title="Leave Voice Chat"
        @click="handleLeaveVoice"
      >
        <span class="voice-btn__icon">✖</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMultiplayerStore } from '../../stores/multiplayerStore.js';

const multiplayerStore = useMultiplayerStore();
const voiceState = computed(() => multiplayerStore.voiceState);

async function handleJoinVoice() {
  await multiplayerStore.toggleVoiceChat();
}

function handleLeaveVoice() {
  multiplayerStore.toggleVoiceChat();
}

function toggleMute() {
  multiplayerStore.setMuted(!voiceState.value.isMuted);
}

function toggleDeafen() {
  multiplayerStore.setDeafened(!voiceState.value.isDeafened);
}

function onVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  multiplayerStore.setVolume(parseFloat(target.value));
}
</script>

<style scoped lang="scss">
.voice-chat-widget {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(15, 20, 30, 0.85);
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 100;
  user-select: none;

  &__active {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.voice-control-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.voice-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 14px;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.25);
    transform: translateY(-1px);
  }

  &--join {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(184, 134, 11, 0.4));
    border: 1px solid rgba(212, 175, 55, 0.5);
    color: #ffd700;

    &:hover {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.5), rgba(184, 134, 11, 0.6));
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
    }
  }

  &--icon {
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 50%;
  }

  &--muted,
  &--deafened {
    background: rgba(231, 76, 60, 0.25);
    border: 1px solid rgba(231, 76, 60, 0.5);
    color: #ff6b6b;
  }

  &--speaking {
    background: rgba(46, 204, 113, 0.3);
    border: 1px solid rgba(46, 204, 113, 0.8);
  }

  &--leave {
    width: 26px;
    height: 26px;
    padding: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    color: #888;
    font-size: 0.75rem;

    &:hover {
      background: rgba(231, 76, 60, 0.4);
      color: #fff;
    }
  }
}

.voice-pulse-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  border: 2px solid #2ecc71;
  animation: pulse-ring 1.2s infinite ease-out;

  &--remote {
    border-color: #3498db;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.9);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.voice-label {
  font-size: 0.75rem;
  color: #ccc;
  font-family: sans-serif;
}

.voice-volume-slider {
  width: 50px;
  accent-color: #d4af37;
  cursor: pointer;
}
</style>
