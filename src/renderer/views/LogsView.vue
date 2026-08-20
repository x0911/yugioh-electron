<template>
  <div class="page-logs">
    <!-- Atmospheric Background & Vignette -->
    <div class="logs-backdrop" :style="{ backgroundImage: `url(${getBackgroundUrl('loading-bg')})` }"></div>
    <div class="logs-vignette"></div>

    <!-- Main Container -->
    <div class="logs-container">
      <!-- Header Banner -->
      <header class="logs-header">
        <div class="logs-header__title-group">
          <div class="logs-header__badge">
            <span class="badge-icon">📜</span>
            <span class="badge-text">DIAGNOSTIC ARCHIVE</span>
          </div>
          <h1 class="logs-header__title">Duel Logs & Diagnostic History</h1>
          <p class="logs-header__subtitle">
            Chronological records for the last 10 duels. One-click copy formatted reports ready for AI investigation.
          </p>
        </div>

        <div class="logs-header__actions">
          <button
            v-if="duelLogsStore.savedDuels.length > 0"
            type="button"
            class="action-btn action-btn--danger"
            @click="onClearAll"
          >
            🗑️ Clear History
          </button>
          <button
            type="button"
            class="action-btn action-btn--secondary"
            @click="router.push('/main-menu')"
          >
            🏠 Main Menu
          </button>
        </div>
      </header>

      <!-- Metrics / Summary Ribbon -->
      <section v-if="duelLogsStore.savedDuels.length > 0" class="logs-stats-ribbon">
        <div class="stat-card">
          <span class="stat-card__label">ARCHIVED DUELS</span>
          <span class="stat-card__val">{{ duelLogsStore.totalArchived }} / 10 max</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">WIN / LOSS RECORD</span>
          <span class="stat-card__val stat-card__val--accent">
            {{ duelLogsStore.victoryCount }}W - {{ duelLogsStore.defeatCount }}L
          </span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">WIN RATE</span>
          <span class="stat-card__val" :class="duelLogsStore.winRatePercent >= 50 ? 'stat-card__val--win' : 'stat-card__val--loss'">
            {{ duelLogsStore.winRatePercent }}%
          </span>
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="duelLogsStore.savedDuels.length === 0" class="logs-empty">
        <div class="logs-empty__icon">🎴</div>
        <h2 class="logs-empty__title">No Saved Duel Logs</h2>
        <p class="logs-empty__desc">
          When you complete or surrender a duel, full event streams and board state diagnostics will automatically be recorded here.
        </p>
        <button type="button" class="action-btn action-btn--primary" @click="router.push('/duel')">
          ⚔️ Start a Duel
        </button>
      </div>

      <!-- Duel Logs List (Last 10) -->
      <div v-else class="logs-list">
        <article
          v-for="(duel, index) in duelLogsStore.savedDuels"
          :key="duel.id"
          class="duel-card"
          :class="`duel-card--${duel.outcome}`"
        >
          <!-- Card Header Bar -->
          <div class="duel-card__top">
            <div class="duel-card__index-tag">
              <span class="index-num">#{{ index + 1 }}</span>
              <span v-if="index === 0" class="latest-chip">LATEST</span>
              <span class="duel-date">{{ duel.dateFormatted }}</span>
            </div>

            <div class="duel-card__outcome-badge" :class="`duel-card__outcome-badge--${duel.outcome}`">
              <span class="outcome-icon">
                {{ duel.outcome === 'victory' ? '👑' : duel.outcome === 'surrender' ? '🏳️' : '💀' }}
              </span>
              <span class="outcome-text">{{ duel.outcomeLabel || duel.outcome.toUpperCase() }}</span>
            </div>
          </div>

          <!-- Duelists Matchup Section -->
          <div class="duel-card__matchup">
            <!-- Player Side -->
            <div class="duelist-block duelist-block--player">
              <div class="duelist-block__avatar">
                <span class="duelist-icon">🧙</span>
              </div>
              <div class="duelist-block__info">
                <span class="duelist-block__name">{{ duel.playerName }}</span>
                <span class="duelist-block__deck">{{ duel.playerDeckName || 'Custom Deck' }}</span>
                <div class="duelist-block__lp-bar">
                  <span class="lp-label">LP:</span>
                  <span class="lp-val" :class="{ 'lp-val--zero': duel.playerFinalLp <= 0 }">
                    {{ duel.playerFinalLp }}
                  </span>
                </div>
              </div>
            </div>

            <!-- VS Emblem -->
            <div class="matchup-vs">
              <span class="vs-text">VS</span>
              <span class="turns-badge">Turn {{ duel.turns }}</span>
            </div>

            <!-- Opponent Side -->
            <div class="duelist-block duelist-block--opponent">
              <div class="duelist-block__avatar" :class="`duelist-block__avatar--${duel.opponentSeries?.toLowerCase() || 'dm'}`">
                <img
                  v-if="duel.opponentAvatar"
                  :src="getOpponentAvatarUrl(duel.opponentAvatar)"
                  :alt="duel.opponentName"
                  class="duelist-img"
                  @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
                />
                <span v-else class="duelist-icon">🤖</span>
              </div>
              <div class="duelist-block__info">
                <div class="opponent-name-row">
                  <span class="duelist-block__name">{{ duel.opponentName }}</span>
                  <span v-if="duel.opponentSeries" class="series-pill">{{ duel.opponentSeries }}</span>
                </div>
                <span class="duelist-block__deck">{{ duel.opponentDeckName || duel.opponentTitle || 'Challenger Deck' }}</span>
                <div class="duelist-block__lp-bar">
                  <span class="lp-label">LP:</span>
                  <span class="lp-val" :class="{ 'lp-val--zero': duel.opponentFinalLp <= 0 }">
                    {{ duel.opponentFinalLp }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reason & Diagnostic Sub-Details -->
          <div v-if="duel.winReason" class="duel-card__reason-box">
            <span class="reason-icon">💡</span>
            <span class="reason-text">{{ duel.winReason }}</span>
          </div>

          <!-- Actions Bar -->
          <div class="duel-card__actions">
            <!-- Copy Full Log Button (Primary) -->
            <button
              type="button"
              class="action-btn action-btn--copy"
              :class="{ 'action-btn--copied': copiedId === duel.id }"
              @click="onCopyDuelLog(duel)"
            >
              <span class="btn-icon">{{ copiedId === duel.id ? '✓' : '📋' }}</span>
              <span>{{ copiedId === duel.id ? 'Copied Log (Ready to Paste!)' : 'Copy Full Log for AI' }}</span>
            </button>

            <!-- Toggle Detailed Event Stream -->
            <button
              type="button"
              class="action-btn action-btn--toggle"
              @click="toggleExpand(duel.id)"
            >
              <span>{{ expandedId === duel.id ? 'Hide Event Stream' : `View Events (${duel.totalEvents})` }}</span>
              <span class="toggle-arrow">{{ expandedId === duel.id ? '▲' : '▼' }}</span>
            </button>

            <!-- Delete Single Log -->
            <button
              type="button"
              class="action-btn action-btn--icon-danger"
              title="Delete this record"
              @click="duelLogsStore.deleteDuel(duel.id)"
            >
              🗑️
            </button>
          </div>

          <!-- Expandable Chronological Log Stream -->
          <div v-if="expandedId === duel.id" class="duel-card__events-drawer">
            <div class="events-drawer-header">
              <span class="events-drawer-title">Chronological Engine Events ({{ duel.logs.length }})</span>
              <span class="events-drawer-hint">Verbatim recorded message sequence</span>
            </div>

            <div class="events-list-scroll">
              <div
                v-for="(item, itemIdx) in duel.logs"
                :key="`log-${duel.id}-${itemIdx}`"
                class="event-row"
                :class="getEventRowClass(item.type)"
              >
                <span class="event-time">{{ item.time }}</span>
                <span class="event-type-badge">{{ item.type }}</span>
                <span class="event-desc">{{ item.description }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDuelLogsStore, type SavedDuelLog } from '../stores/duelLogsStore.js';
import { getBackgroundUrl } from '../utils/media.js';

const router = useRouter();
const duelLogsStore = useDuelLogsStore();

const expandedId = ref<string | null>(null);
const copiedId = ref<string | null>(null);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id;
}

function getOpponentAvatarUrl(avatarPath: string): string {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('app-resource://') || avatarPath.startsWith('http')) {
    return avatarPath;
  }
  const clean = avatarPath.replace(/^resources[\/\\]/, '');
  return `app-resource://${clean}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[LogsView] Clipboard copy error:', err);
    return false;
  }
}

async function onCopyDuelLog(duel: SavedDuelLog): Promise<void> {
  const success = await copyToClipboard(duel.markdownLog);
  if (success) {
    copiedId.value = duel.id;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copiedId.value = null;
    }, 2400);
  }
}

function onClearAll(): void {
  if (confirm('Are you sure you want to clear all archived duel logs?')) {
    duelLogsStore.clearAllDuels();
  }
}

function getEventRowClass(type: string): string {
  if (type === 'WIN') return 'event-row--win';
  if (type === 'DAMAGE') return 'event-row--damage';
  if (type === 'SUMMONING' || type === 'SPSUMMONING') return 'event-row--summon';
  if (type === 'CHAINING' || type === 'CHAINED') return 'event-row--chain';
  if (type === 'ATTACK' || type === 'BATTLE') return 'event-row--battle';
  if (type.startsWith('SELECT_')) return 'event-row--prompt';
  return '';
}
</script>

<style scoped lang="scss">
@use '../assets/styles/abstracts' as *;

.page-logs {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #070913;
  color: #e6ebf5;
  font-family: 'Rajdhani', -apple-system, sans-serif;
  user-select: none;
}

.logs-backdrop {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(14px) brightness(0.22);
  z-index: 0;
}

.logs-vignette {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.85) 100%);
  pointer-events: none;
  z-index: 1;
}

.logs-container {
  position: relative;
  z-index: 2;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(201, 162, 39, 0.25);

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(201, 162, 39, 0.15);
    border: 1px solid rgba(201, 162, 39, 0.4);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #e5c158;
    margin-bottom: 8px;
  }

  &__title {
    margin: 0 0 6px;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, #ffffff 40%, #c9a227 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  &__subtitle {
    margin: 0;
    color: #9ab;
    font-size: 0.95rem;
  }

  &__actions {
    display: flex;
    gap: 12px;
  }
}

/* Stats Ribbon */
.logs-stats-ribbon {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: rgba(14, 20, 36, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

  &__label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #789;
  }

  &__val {
    font-size: 1.4rem;
    font-weight: 800;
    color: #fff;

    &--accent {
      color: #e5c158;
    }
    &--win {
      color: #4ade80;
    }
    &--loss {
      color: #f87171;
    }
  }
}

/* Empty State */
.logs-empty {
  text-align: center;
  padding: 80px 20px;
  background: rgba(14, 20, 36, 0.6);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  &__icon {
    font-size: 3.5rem;
    opacity: 0.7;
  }

  &__title {
    margin: 0;
    font-size: 1.5rem;
    color: #fff;
  }

  &__desc {
    margin: 0;
    max-width: 480px;
    color: #89a;
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

/* Duel Logs Cards List */
.logs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.duel-card {
  background: rgba(13, 18, 32, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  transition: transform 160ms ease, border-color 160ms ease;

  &:hover {
    border-color: rgba(201, 162, 39, 0.4);
    transform: translateY(-2px);
  }

  &--victory {
    border-left: 4px solid #4ade80;
  }
  &--defeat {
    border-left: 4px solid #f87171;
  }
  &--surrender {
    border-left: 4px solid #fbbf24;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__index-tag {
    display: flex;
    align-items: center;
    gap: 10px;

    .index-num {
      font-size: 1.1rem;
      font-weight: 800;
      color: #e5c158;
    }

    .latest-chip {
      background: linear-gradient(135deg, #c9a227, #e5c158);
      color: #000;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 3px;
      letter-spacing: 0.05em;
    }

    .duel-date {
      color: #789;
      font-size: 0.85rem;
    }
  }

  &__outcome-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.06em;

    &--victory {
      background: rgba(74, 222, 128, 0.15);
      border: 1px solid rgba(74, 222, 128, 0.5);
      color: #4ade80;
    }
    &--defeat {
      background: rgba(248, 113, 113, 0.15);
      border: 1px solid rgba(248, 113, 113, 0.5);
      color: #f87171;
    }
    &--surrender {
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.5);
      color: #fbbf24;
    }
  }

  &__matchup {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(8, 12, 22, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 14px 20px;
    gap: 16px;
  }
}

/* Duelist info blocks */
.duelist-block {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;

    .duelist-icon {
      font-size: 1.6rem;
    }
    .duelist-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 1.1rem;
    font-weight: 800;
    color: #fff;
  }

  &__deck {
    font-size: 0.8rem;
    color: #89a;
  }

  &__lp-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 700;

    .lp-label {
      color: #789;
    }
    .lp-val {
      color: #4ade80;

      &--zero {
        color: #f87171;
      }
    }
  }

  &--opponent {
    flex-direction: row-reverse;
    text-align: right;

    .opponent-name-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }

    .series-pill {
      font-size: 0.65rem;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(201, 162, 39, 0.2);
      border: 1px solid rgba(201, 162, 39, 0.4);
      color: #e5c158;
      font-weight: 700;
    }
  }
}

.matchup-vs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 12px;

  .vs-text {
    font-size: 1.2rem;
    font-weight: 900;
    color: #e5c158;
    letter-spacing: 0.05em;
  }
  .turns-badge {
    font-size: 0.75rem;
    color: #789;
    background: rgba(255, 255, 255, 0.05);
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.duel-card__reason-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(201, 162, 39, 0.08);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 0.85rem;
  color: #dfcaa0;
}

/* Actions */
.duel-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  transition: all 160ms ease;
  font-family: inherit;

  &--primary {
    background: linear-gradient(135deg, #c9a227, #e5c158);
    color: #050811;
    border-color: rgba(255, 255, 255, 0.3);

    &:hover {
      filter: brightness(1.15);
      transform: translateY(-1px);
    }
  }

  &--secondary {
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
    border-color: rgba(255, 255, 255, 0.15);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
  }

  &--danger {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.3);

    &:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #fff;
    }
  }

  &--copy {
    flex: 1;
    background: linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(229, 193, 88, 0.1));
    border: 1px solid rgba(201, 162, 39, 0.5);
    color: #e5c158;
    justify-content: center;

    &:hover {
      background: linear-gradient(135deg, rgba(201, 162, 39, 0.35), rgba(229, 193, 88, 0.2));
      border-color: #e5c158;
      box-shadow: 0 0 12px rgba(201, 162, 39, 0.3);
    }

    &.action-btn--copied {
      background: rgba(74, 222, 128, 0.2);
      border-color: #4ade80;
      color: #4ade80;
    }
  }

  &--toggle {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #9ab;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
  }

  &--icon-danger {
    padding: 8px 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #f87171;

    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  }
}

/* Event Drawer */
.duel-card__events-drawer {
  background: #04070e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.events-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .events-drawer-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #e5c158;
  }
  .events-drawer-hint {
    font-size: 0.75rem;
    color: #678;
  }
}

.events-list-scroll {
  max-height: 280px;
  overflow-y: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.event-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 4px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #9ab;
  border-left: 2px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .event-time {
    color: #567;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .event-type-badge {
    color: #cbd5e1;
    font-weight: 700;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .event-desc {
    color: #cbd5e1;
    word-break: break-word;
  }

  &--win {
    border-left-color: #4ade80;
    background: rgba(74, 222, 128, 0.05);
    .event-type-badge {
      color: #4ade80;
    }
  }

  &--damage {
    border-left-color: #f87171;
    .event-type-badge {
      color: #f87171;
    }
  }

  &--summon {
    border-left-color: #38bdf8;
    .event-type-badge {
      color: #38bdf8;
    }
  }

  &--chain {
    border-left-color: #a855f7;
    .event-type-badge {
      color: #a855f7;
    }
  }

  &--battle {
    border-left-color: #fb923c;
    .event-type-badge {
      color: #fb923c;
    }
  }

  &--prompt {
    border-left-color: #facc15;
    .event-type-badge {
      color: #facc15;
    }
  }
}
</style>
