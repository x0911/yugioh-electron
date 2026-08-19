<template>
  <div class="view-placeholder">
    <div class="glass-panel glass-panel--elevated glass-panel--accent-gold placeholder-card">
      <div class="placeholder-icon">🪙</div>
      <h2 class="placeholder-title">Coin Toss Decision</h2>
      <div class="placeholder-badge">Phase 8 will implement this</div>
      <p class="placeholder-description">
        Will feature Heads/Tails selection, a 3D animated coin flip, starting turn determination,
        and seamless transition to the pre-duel video.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// CoinTossView — Placeholder for Phase 8
</script>

<style scoped lang="scss">
.view-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.placeholder-card {
  max-width: 580px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 32px;
}

.placeholder-icon {
  font-size: 3rem;
}

.placeholder-title {
  color: #e3c567;
  font-size: 2rem;
  letter-spacing: 0.05em;
}

.placeholder-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(201, 162, 39, 0.2);
  border: 1px solid #c9a227;
  border-radius: 20px;
  color: #f4e4b8;
  font-size: 0.875rem;
  font-weight: 600;
}

.placeholder-description {
  color: #b8b2a0;
  font-size: 1rem;
  line-height: 1.6;
}
</style>
