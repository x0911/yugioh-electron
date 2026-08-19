<template>
  <div class="app-layout">
    <!-- Temporary Dev Navigation Bar (to be removed/gated in Phase 14) -->
    <header class="dev-nav-bar">
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
        <router-link v-if="isDev" to="/dev/kitchen-sink" class="dev-nav-bar__link dev-nav-bar__link--highlight"> Kitchen Sink (P4) </router-link>
      </nav>
    </header>

    <!-- Main View Outlet -->
    <main class="view-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
const isDev = import.meta.env.DEV;
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
  height: calc(100vh - 40px);
  margin-top: 40px;
  position: relative;
  overflow: hidden;
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
