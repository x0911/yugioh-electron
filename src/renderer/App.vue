<template>
  <div class="app-layout">
    <!-- Dev Navigation Bar (Gated behind dev flag & toggle) -->
    <header v-if="isDev && devToolsStore.showDevNav" class="dev-nav-bar">
      <div class="dev-nav-bar__tag">
        <span>⚡</span>
        <span>YGO DUEL [DEV NAV]</span>
      </div>

      <nav class="dev-nav-bar__links">
        <router-link to="/" class="dev-nav-bar__link"> Loading (P5) </router-link>
        <router-link to="/main-menu" class="dev-nav-bar__link"> Main Menu (P5) </router-link>
        <router-link to="/settings" class="dev-nav-bar__link"> Settings (P6) </router-link>
        <router-link to="/deck-edit" class="dev-nav-bar__link"> Deck Edit (P7) </router-link>
        <router-link to="/coin-toss" class="dev-nav-bar__link"> Coin Toss (P8) </router-link>
        <router-link to="/pre-duel-video" class="dev-nav-bar__link"> Pre-Duel (P8) </router-link>
        <router-link to="/duel" class="dev-nav-bar__link"> Duel (P9) </router-link>
        <router-link to="/dev/kitchen-sink" class="dev-nav-bar__link dev-nav-bar__link--highlight">
          Kitchen Sink (P4)
        </router-link>
        <button
          type="button"
          class="dev-nav-bar__close-btn"
          title="Close Dev Nav (Ctrl+Shift+D)"
          @click="devToolsStore.toggleDevNav"
        >
          ✕
        </button>
      </nav>
    </header>

    <!-- Discrete Floating Dev Toggle Trigger (Dev-only) -->
    <button
      v-if="isDev && !devToolsStore.showDevNav"
      type="button"
      class="dev-nav-floating-toggle"
      title="Toggle Dev Navigation (Ctrl+Shift+D)"
      @click="devToolsStore.toggleDevNav"
    >
      <span>⚡ DEV</span>
    </button>

    <!-- Main View Outlet -->
    <main
      class="view-container"
      :class="{ 'view-container--with-dev-nav': isDev && devToolsStore.showDevNav }"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Error Boundary Recovery Modal -->
    <ErrorBoundary />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, onErrorCaptured } from 'vue';
import { useDevToolsStore } from './stores/devToolsStore.js';
import { useUIStore } from './stores/uiStore.js';
import ErrorBoundary from './components/common/ErrorBoundary.vue';

const isDev = import.meta.env.DEV;
const devToolsStore = useDevToolsStore();
const uiStore = useUIStore();

onErrorCaptured((err: Error, _instance, info: string) => {
  console.error('[App] Vue Component Error Captured:', err, info);
  uiStore.triggerCrashError(err, 'Duel Application Error');
  return false; // Prevent unhandled propagation
});

function handleGlobalError(event: ErrorEvent): void {
  console.error('[App] Uncaught Global Error:', event.error || event.message);
  uiStore.triggerCrashError(event.error || new Error(event.message));
}

function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  console.error('[App] Unhandled Promise Rejection:', event.reason);
  uiStore.triggerCrashError(
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
  );
}

function handleKeyDown(event: KeyboardEvent): void {
  // Shortcut: Ctrl+Shift+D or Cmd+Shift+D to toggle Dev Nav in dev mode
  if (
    isDev &&
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.key.toLowerCase() === 'd'
  ) {
    event.preventDefault();
    devToolsStore.toggleDevNav();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
});
</script>

<style scoped lang="scss">
.app-layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #0a0c10;
  background-image:
    radial-gradient(circle at 50% 20%, rgba(201, 162, 39, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 80% 80%, rgba(47, 128, 237, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(235, 87, 87, 0.05) 0%, transparent 50%);
}

.view-container {
  flex: 1;
  width: 100%;
  height: 100vh;
  margin-top: 0;
  position: relative;
  overflow: hidden;
  transition:
    height 0.2s ease,
    margin-top 0.2s ease;

  &--with-dev-nav {
    height: calc(100vh - 40px);
    margin-top: 40px;
  }
}

.dev-nav-bar__close-btn {
  background: transparent;
  border: 1px solid rgba(201, 162, 39, 0.3);
  color: #b8b2a0;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  margin-left: 6px;

  &:hover {
    background: rgba(235, 87, 87, 0.3);
    border-color: #eb5757;
    color: #fff;
  }
}

.dev-nav-floating-toggle {
  position: fixed;
  top: 10px;
  right: 14px;
  z-index: 9999;
  padding: 4px 10px;
  background: rgba(18, 22, 30, 0.75);
  border: 1px solid rgba(201, 162, 39, 0.4);
  border-radius: 20px;
  color: #e3c567;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: 'Oxanium', monospace, sans-serif;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  opacity: 0.45;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    transform: translateY(1px);
    border-color: #c9a227;
    box-shadow: 0 0 12px rgba(201, 162, 39, 0.5);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.99);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(1.01);
}
</style>
