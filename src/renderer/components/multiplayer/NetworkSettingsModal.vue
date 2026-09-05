<template>
  <div v-if="modelValue" class="net-modal-overlay" @click.self="close">
    <div class="net-modal glass-panel">
      <!-- Header -->
      <div class="net-modal__header">
        <div class="net-modal__title-group">
          <h2 class="net-modal__title">🌐 P2P Network & TURN Relay Settings</h2>
          <span class="net-modal__subtitle">
            Configure WebRTC NAT traversal and TURN relay servers for cross-network dueling
          </span>
        </div>
        <button type="button" class="net-modal__close-btn" @click="close">✕</button>
      </div>

      <div class="net-modal__body">
        <!-- Default Status Card -->
        <div class="net-card">
          <div class="net-card__header">
            <span class="net-card__title">📡 Default STUN Discovery Servers</span>
            <span class="net-badge net-badge--online">Active (9 Public Nodes)</span>
          </div>
          <p class="net-card__desc">
            Direct peer-to-peer UDP connections are automatically established using Google, Cloudflare,
            Twilio, and Open Relay STUN servers. Works out-of-the-box for open NAT routers.
          </p>
          <div class="net-server-list">
            <div v-for="(server, idx) in defaultServerUrls" :key="idx" class="net-server-pill">
              ✓ {{ server }}
            </div>
          </div>
        </div>

        <!-- Custom TURN Relay Card -->
        <div class="net-card net-card--turn">
          <div class="net-card__header">
            <span class="net-card__title">🛡️ Custom TURN Relay Server</span>
            <span v-if="hasCustomTurn" class="net-badge net-badge--custom">Custom Relay Configured</span>
            <span v-else class="net-badge net-badge--optional">Optional (For Strict NAT / Firewalls)</span>
          </div>
          <p class="net-card__desc">
            If you or your opponent are behind a Symmetric NAT, Carrier-Grade NAT (CGNAT), or corporate firewall,
            a TURN relay server forwards traffic when direct UDP hole-punching fails.
          </p>

          <div class="turn-form">
            <div class="form-group">
              <label class="form-label">TURN Server URL</label>
              <input
                v-model="turnUrl"
                type="text"
                class="form-input"
                placeholder="e.g. turn:global.relay.metered.ca:443 or turn:your-server.com:3478"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input
                  v-model="turnUsername"
                  type="text"
                  class="form-input"
                  placeholder="TURN Username"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Password / Credential</label>
                <input
                  v-model="turnCredential"
                  type="password"
                  class="form-input"
                  placeholder="TURN Credential"
                />
              </div>
            </div>

            <div class="turn-actions">
              <button
                type="button"
                class="save-btn"
                :disabled="!isFormValid"
                @click="saveCustomTurn"
              >
                💾 Save Relay Settings
              </button>
              <button
                v-if="hasCustomTurn"
                type="button"
                class="clear-btn"
                @click="clearCustomTurn"
              >
                🗑️ Remove Custom Relay
              </button>
              <span v-if="feedbackMessage" class="feedback-msg">{{ feedbackMessage }}</span>
            </div>
          </div>

          <div class="turn-guide-box">
            💡 <strong>Need a free TURN server?</strong>
            You can create a free account at
            <a
              href="#"
              class="guide-link"
              @click.prevent="openMeteredLink"
            >
              metered.ca/tools/openrelay
            </a>
            (provides 20 GB/month of free TURN bandwidth) or host your own via Coturn.
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="net-modal__footer">
        <button type="button" class="cta-btn cta-btn--primary" @click="close">
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { DEFAULT_ICE_SERVERS } from '../../services/multiplayer/MultiplayerService.js';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const turnUrl = ref('');
const turnUsername = ref('');
const turnCredential = ref('');
const feedbackMessage = ref('');

const defaultServerUrls = computed(() => {
  return DEFAULT_ICE_SERVERS.map((s) => (Array.isArray(s.urls) ? s.urls[0] : s.urls));
});

const hasCustomTurn = ref(false);

const isFormValid = computed(() => {
  return turnUrl.value.trim().length > 5;
});

onMounted(() => {
  loadCustomConfig();
});

function loadCustomConfig() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem('yugioh_custom_ice_servers');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        const item = list[0];
        turnUrl.value = Array.isArray(item.urls) ? item.urls[0] : (item.urls || '');
        turnUsername.value = item.username || '';
        turnCredential.value = item.credential || '';
        hasCustomTurn.value = true;
        return;
      }
    }
    hasCustomTurn.value = false;
  } catch (e) {
    hasCustomTurn.value = false;
  }
}

function saveCustomTurn() {
  if (!turnUrl.value.trim()) return;

  const url = turnUrl.value.trim();
  const customServer: { urls: string; username?: string; credential?: string } = {
    urls: url.startsWith('turn:') || url.startsWith('turns:') || url.startsWith('stun:') ? url : `turn:${url}`,
  };

  if (turnUsername.value.trim()) {
    customServer.username = turnUsername.value.trim();
  }
  if (turnCredential.value.trim()) {
    customServer.credential = turnCredential.value.trim();
  }

  try {
    localStorage.setItem('yugioh_custom_ice_servers', JSON.stringify([customServer]));
    hasCustomTurn.value = true;
    feedbackMessage.value = '✓ Custom TURN relay saved successfully!';
    setTimeout(() => {
      feedbackMessage.value = '';
    }, 3500);
  } catch (e) {
    feedbackMessage.value = 'Failed to save settings.';
  }
}

function clearCustomTurn() {
  try {
    localStorage.removeItem('yugioh_custom_ice_servers');
    turnUrl.value = '';
    turnUsername.value = '';
    turnCredential.value = '';
    hasCustomTurn.value = false;
    feedbackMessage.value = '✓ Custom relay removed. Reverted to default STUN.';
    setTimeout(() => {
      feedbackMessage.value = '';
    }, 3500);
  } catch (e) {
    // Ignore
  }
}

function openMeteredLink() {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.openExternal) {
    (window as any).electronAPI.openExternal('https://www.metered.ca/tools/openrelay/');
  } else {
    window.open('https://www.metered.ca/tools/openrelay/', '_blank');
  }
}

function close() {
  emit('update:modelValue', false);
}
</script>

<style scoped>
.net-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.net-modal {
  width: 100%;
  max-width: 680px;
  background: linear-gradient(135deg, rgba(20, 24, 38, 0.95), rgba(12, 16, 28, 0.98));
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.net-modal__header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.net-modal__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #d4af37;
  margin: 0;
}

.net-modal__subtitle {
  font-size: 0.8rem;
  color: #a0aec0;
  margin-top: 4px;
  display: block;
}

.net-modal__close-btn {
  background: transparent;
  border: none;
  color: #a0aec0;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.net-modal__close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.net-modal__body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.net-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 14px 16px;
}

.net-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.net-card__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f7fafc;
}

.net-badge {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 600;
}

.net-badge--online {
  background: rgba(72, 187, 120, 0.15);
  color: #48bb78;
  border: 1px solid rgba(72, 187, 120, 0.3);
}

.net-badge--custom {
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, 0.4);
}

.net-badge--optional {
  background: rgba(160, 174, 192, 0.15);
  color: #a0aec0;
}

.net-card__desc {
  font-size: 0.8rem;
  color: #cbd5e0;
  line-height: 1.4;
  margin: 0 0 10px 0;
}

.net-server-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.net-server-pill {
  font-size: 0.72rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 3px 8px;
  border-radius: 4px;
  color: #9ae6b4;
  font-family: monospace;
}

.turn-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #a0aec0;
}

.form-input {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 8px 12px;
  color: #fff;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #d4af37;
}

.turn-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.save-btn {
  background: linear-gradient(135deg, #d4af37, #aa8214);
  color: #1a1a2e;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  background: rgba(229, 62, 62, 0.15);
  color: #fc8181;
  border: 1px solid rgba(229, 62, 62, 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(229, 62, 62, 0.25);
}

.feedback-msg {
  font-size: 0.8rem;
  color: #48bb78;
  font-weight: 600;
}

.turn-guide-box {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(66, 153, 225, 0.08);
  border: 1px solid rgba(66, 153, 225, 0.2);
  font-size: 0.78rem;
  color: #bee3f8;
  line-height: 1.4;
}

.guide-link {
  color: #63b3ed;
  text-decoration: underline;
  cursor: pointer;
}

.net-modal__footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}

.cta-btn {
  background: #2d3748;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.cta-btn:hover {
  background: #4a5568;
}
</style>
