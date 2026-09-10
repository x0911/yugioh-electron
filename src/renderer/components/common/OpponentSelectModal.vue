<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="opponent-modal-backdrop" @click="handleBackdropClick">
        <div
          class="opponent-modal glass-panel glass-panel--elevated"
          role="dialog"
          aria-modal="true"
          aria-label="Choose Your Opponent"
          @click.stop
        >
          <!-- Header Bar -->
          <div class="opponent-modal__header">
            <div class="header-left">
              <span class="header-icon">👑</span>
              <div>
                <h2 class="header-title">CHOOSE YOUR OPPONENT</h2>
                <span class="header-sub">
                  Select an iconic duelist from the Yu-Gi-Oh! universe to challenge in single-player battle
                </span>
              </div>
            </div>
            <button
              type="button"
              class="header-close-btn"
              title="Close (Esc)"
              aria-label="Close"
              @click="handleClose"
            >
              ✕
            </button>
          </div>

          <!-- Controls Toolbar: Search & Series Tabs -->
          <div class="opponent-modal__toolbar">
            <!-- Search Bar -->
            <div class="opponent-search-box">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                class="opponent-search-input"
                :placeholder="`Search ${allCount} duelists by name, title, or archetype...`"
                spellcheck="false"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="clear-search-btn"
                title="Clear search"
                @click="searchQuery = ''"
              >
                ✕
              </button>
            </div>

            <!-- Series Filter Pills -->
            <div class="series-tabs" role="tablist">
              <button
                type="button"
                class="series-tab"
                :class="{ 'series-tab--active': activeSeries === 'ALL' }"
                @click="setSeries('ALL')"
              >
                All Duelists ({{ allCount }})
              </button>
              <button
                type="button"
                class="series-tab series-tab--dm"
                :class="{ 'series-tab--active': activeSeries === 'DM' }"
                @click="setSeries('DM')"
              >
                Original Series ({{ dmCount }})
              </button>
              <button
                type="button"
                class="series-tab series-tab--gx"
                :class="{ 'series-tab--active': activeSeries === 'GX' }"
                @click="setSeries('GX')"
              >
                Yu-Gi-Oh! GX ({{ gxCount }})
              </button>
              <button
                type="button"
                class="series-tab series-tab--5ds"
                :class="{ 'series-tab--active': activeSeries === '5Ds' }"
                @click="setSeries('5Ds')"
              >
                Yu-Gi-Oh! 5D's ({{ fiveDsCount }})
              </button>
            </div>

            <!-- Total Match Badge -->
            <div class="toolbar-stats">
              <span class="count-badge">
                {{ filteredCharacters.length }} Available
              </span>
            </div>
          </div>

          <!-- Opponent Grid (3-4 Columns with Multiple Rows) -->
          <div ref="gridScrollRef" class="opponent-modal__body-scroll">
            <div v-if="filteredCharacters.length > 0" class="opponent-grid">
              <div
                v-for="char in filteredCharacters"
                :key="char.id"
                class="opponent-card"
                :class="{
                  'opponent-card--selected': char.id === selectedId,
                  'opponent-card--dm': char.series === 'DM',
                  'opponent-card--gx': char.series === 'GX',
                  'opponent-card--5ds': char.series === '5Ds',
                }"
                :style="{ '--char-theme-color': char.themeColor || '#c9a227' }"
                tabindex="0"
                role="button"
                :aria-pressed="char.id === selectedId"
                @click="handleSelect(char)"
                @keydown.enter="handleSelect(char)"
                @keydown.space.prevent="handleSelect(char)"
                @mouseenter="handleCardHover"
              >
                <!-- Top Row: Series & Selection Badges -->
                <div class="opponent-card__top">
                  <span
                    class="series-pill"
                    :class="`series-pill--${char.series.toLowerCase()}`"
                  >
                    {{ char.series }}
                  </span>

                  <span v-if="char.id === selectedId" class="equipped-badge">
                    ✓ CURRENT OPPONENT
                  </span>
                </div>

                <!-- Avatar / Portrait Container -->
                <div class="opponent-card__avatar-box">
                  <!-- Hologram Rune Disc Aura -->
                  <div class="hologram-aura" />

                  <!-- Character Image -->
                  <img
                    v-if="!failedImages.has(char.id) && (char.portrait || char.avatar)"
                    :src="char.portrait || char.avatar"
                    :alt="char.name"
                    class="avatar-img"
                    loading="lazy"
                    @error="handleImageError(char.id)"
                  />

                  <!-- Styled Fallback Silhouette -->
                  <div v-else class="avatar-silhouette" aria-hidden="true">
                    <svg viewBox="0 0 120 140" fill="none" class="silhouette-svg">
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
                        fill="var(--char-theme-color)"
                        opacity="0.75"
                      />
                      <path
                        d="M60 14L52 28L60 24L68 28L60 14Z"
                        fill="var(--char-theme-color)"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Info Box -->
                <div class="opponent-card__info">
                  <h3 class="char-name" :title="char.name">{{ char.name }}</h3>
                  <span class="char-title" :title="char.title">{{ char.title }}</span>
                  <p v-if="char.tagline" class="char-tagline" :title="char.tagline">
                    {{ char.tagline }}
                  </p>
                </div>

                <!-- Footer Meta -->
                <div class="opponent-card__footer">
                  <span class="decks-count">
                    🎴 {{ char.decks?.length || 10 }} Decks
                  </span>
                  <span class="select-hint">
                    {{ char.id === selectedId ? 'Active' : 'Choose ›' }}
                  </span>
                </div>

                <!-- Sheen Reflection Overlay -->
                <div class="card-sheen" />
              </div>
            </div>

            <!-- Empty Search State -->
            <div v-else class="empty-state">
              <span class="empty-icon">🔍</span>
              <h3>No Duelists Found</h3>
              <p>No duelists match your query "{{ searchQuery }}"</p>
              <button type="button" class="reset-btn" @click="resetFilters">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { CharacterData, CharacterSeries } from '../../../shared/types/character.js';
import { audioManager } from '../../audio/index.js';

interface Props {
  modelValue: boolean;
  characters: CharacterData[];
  selectedId?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'select', character: CharacterData): void;
  (e: 'close'): void;
}>();

const searchQuery = ref('');
const activeSeries = ref<'ALL' | CharacterSeries>('ALL');
const failedImages = ref<Set<string>>(new Set());
const gridScrollRef = ref<HTMLElement | null>(null);

const allCount = computed(() => props.characters.length);
const dmCount = computed(() => props.characters.filter((c) => c.series === 'DM').length);
const gxCount = computed(() => props.characters.filter((c) => c.series === 'GX').length);
const fiveDsCount = computed(() => props.characters.filter((c) => c.series === '5Ds').length);

const filteredCharacters = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return props.characters.filter((char) => {
    if (activeSeries.value !== 'ALL' && char.series !== activeSeries.value) {
      return false;
    }
    if (!query) return true;
    return (
      char.name?.toLowerCase().includes(query) ||
      char.title?.toLowerCase().includes(query) ||
      char.tagline?.toLowerCase().includes(query) ||
      char.series?.toLowerCase().includes(query)
    );
  });
});

function setSeries(series: 'ALL' | CharacterSeries) {
  audioManager.playSfx('ui-click');
  activeSeries.value = series;
}

function handleImageError(id: string) {
  failedImages.value.add(id);
}

function handleCardHover() {
  audioManager.playSfx('ui-hover');
}

function handleSelect(char: CharacterData) {
  audioManager.playSfx('ui-click');
  emit('select', char);
  emit('update:modelValue', false);
}

function handleClose() {
  emit('update:modelValue', false);
  emit('close');
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}

function resetFilters() {
  searchQuery.value = '';
  activeSeries.value = 'ALL';
}

function handleKeyDown(event: KeyboardEvent) {
  if (props.modelValue && event.key === 'Escape') {
    handleClose();
  }
}

function scrollToSelected() {
  nextTick(() => {
    if (!gridScrollRef.value) return;
    const selectedEl = gridScrollRef.value.querySelector('.opponent-card--selected') as HTMLElement | null;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      scrollToSelected();
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.modelValue) {
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.opponent-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 6, 12, 0.85);
  backdrop-filter: blur(16px);
  padding: 24px;
}

.opponent-modal {
  position: relative;
  width: 100%;
  max-width: 1220px;
  height: 88vh;
  max-height: 940px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(175deg, rgba(16, 22, 34, 0.97) 0%, rgba(8, 12, 20, 0.99) 100%);
  border: 1.5px solid rgba(201, 162, 39, 0.55);
  border-radius: 18px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.92),
    0 0 40px rgba(201, 162, 39, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: rgba(0, 0, 0, 0.35);
    border-bottom: 1px solid rgba(201, 162, 39, 0.25);
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;

      .header-icon {
        font-size: 1.8rem;
        filter: drop-shadow(0 0 10px rgba(201, 162, 39, 0.6));
      }

      .header-title {
        margin: 0;
        font-family: $font-display;
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: $color-gold-100;
        text-shadow: 0 0 12px rgba(201, 162, 39, 0.4);
      }

      .header-sub {
        display: block;
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: 2px;
      }
    }

    .header-close-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #cbd5e1;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.18s ease;

      &:hover {
        background: rgba(235, 87, 87, 0.3);
        border-color: rgba(235, 87, 87, 0.7);
        color: #fff;
        transform: rotate(90deg);
      }
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 24px;
    background: rgba(0, 0, 0, 0.22);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    flex-wrap: wrap;

    .opponent-search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 420px;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.95rem;
        pointer-events: none;
        opacity: 0.7;
      }

      .opponent-search-input {
        width: 100%;
        height: 38px;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(201, 162, 39, 0.35);
        border-radius: 8px;
        padding: 0 34px 0 36px;
        color: #f8fafc;
        font-family: inherit;
        font-size: 0.85rem;
        outline: none;
        transition: all 0.2s ease;

        &:focus {
          border-color: $color-gold-500;
          box-shadow: 0 0 12px rgba(201, 162, 39, 0.35);
          background: rgba(0, 0, 0, 0.6);
        }

        &::placeholder {
          color: #64748b;
        }
      }

      .clear-search-btn {
        position: absolute;
        right: 8px;
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        font-size: 0.85rem;
        padding: 4px;

        &:hover {
          color: #f8fafc;
        }
      }
    }

    .series-tabs {
      display: flex;
      gap: 8px;

      .series-tab {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #cbd5e1;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(201, 162, 39, 0.15);
          border-color: rgba(201, 162, 39, 0.4);
          color: #f8fafc;
        }

        &--active {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(201, 162, 39, 0.15) 100%);
          border-color: $color-gold-500;
          color: $color-gold-100;
          box-shadow: 0 0 12px rgba(201, 162, 39, 0.3);
        }

        &--dm.series-tab--active {
          background: linear-gradient(135deg, rgba(234, 179, 8, 0.35) 0%, rgba(234, 179, 8, 0.15) 100%);
          border-color: #facc15;
          color: #fef08a;
        }

        &--gx.series-tab--active {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(239, 68, 68, 0.15) 100%);
          border-color: #f87171;
          color: #fecaca;
        }

        &--5ds.series-tab--active {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.35) 0%, rgba(249, 115, 22, 0.15) 100%);
          border-color: #fb923c;
          color: #ffedd5;
        }
      }
    }

    .toolbar-stats {
      .count-badge {
        font-family: $font-mono;
        font-size: 0.76rem;
        font-weight: 700;
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.05);
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  }

  &__body-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px;

    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(201, 162, 39, 0.35);
      border-radius: 4px;

      &:hover {
        background: rgba(201, 162, 39, 0.6);
      }
    }
  }
}

// 4-Column Responsive Grid
.opponent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;

  @media (max-width: 1120px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Opponent Card
.opponent-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(24, 32, 48, 0.85) 0%, rgba(12, 18, 28, 0.95) 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  outline: none;

  &:hover,
  &:focus-visible {
    transform: translateY(-5px);
    border-color: var(--char-theme-color, #c9a227);
    box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.75),
      0 0 20px rgba(var(--char-theme-color, 201, 162, 39), 0.35);

    .card-sheen {
      opacity: 0.12;
      transform: translateY(-100%);
    }

    .select-hint {
      color: $color-gold-100;
      transform: translateX(2px);
    }
  }

  &--selected {
    border-color: $color-gold-500 !important;
    background: linear-gradient(180deg, rgba(38, 48, 70, 0.95) 0%, rgba(20, 26, 40, 0.98) 100%);
    box-shadow:
      0 0 24px rgba(201, 162, 39, 0.45),
      0 12px 32px rgba(0, 0, 0, 0.85),
      inset 0 0 16px rgba(201, 162, 39, 0.15);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 1.5px solid rgba(255, 215, 0, 0.6);
      border-radius: 14px;
      pointer-events: none;
    }
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    min-height: 22px;

    .series-pill {
      font-family: $font-mono;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.15);

      &--dm {
        background: rgba(234, 179, 8, 0.2);
        border-color: rgba(234, 179, 8, 0.5);
        color: #fef08a;
      }

      &--gx {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
        color: #fca5a5;
      }

      &--5ds {
        background: rgba(249, 115, 22, 0.2);
        border-color: rgba(249, 115, 22, 0.5);
        color: #fdba74;
      }
    }

    .equipped-badge {
      font-family: $font-mono;
      font-size: 0.66rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 2px 8px;
      border-radius: 6px;
      background: linear-gradient(135deg, rgba(201, 162, 39, 0.4) 0%, rgba(201, 162, 39, 0.2) 100%);
      border: 1px solid rgba(201, 162, 39, 0.7);
      color: $color-gold-100;
      text-shadow: 0 0 6px rgba(201, 162, 39, 0.6);
      box-shadow: 0 0 10px rgba(201, 162, 39, 0.3);
    }
  }

  &__avatar-box {
    position: relative;
    width: 100%;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: radial-gradient(circle at center, rgba(30, 42, 64, 0.6) 0%, rgba(10, 14, 24, 0.8) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;
    margin-bottom: 12px;

    .hologram-aura {
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--char-theme-color, rgba(201, 162, 39, 0.3)) 0%, transparent 70%);
      opacity: 0.4;
      pointer-events: none;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      z-index: 1;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
      transition: transform 0.25s ease;
    }

    &:hover .avatar-img {
      transform: scale(1.06);
    }

    .avatar-silhouette {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .silhouette-svg {
        width: 90px;
        height: 105px;
      }
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 12px;
    flex: 1;

    .char-name {
      margin: 0;
      font-family: $font-display;
      font-size: 1.05rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .char-title {
      font-size: 0.74rem;
      font-weight: 600;
      color: $color-gold-300;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .char-tagline {
      margin: 0;
      font-size: 0.72rem;
      color: #94a3b8;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.72rem;

    .decks-count {
      color: #cbd5e1;
      font-weight: 600;
    }

    .select-hint {
      color: $color-gold-500;
      font-weight: 700;
      transition: all 0.16s ease;
    }
  }

  .card-sheen {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.25) 50%, transparent 60%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.5s ease;
  }
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 12px;
    opacity: 0.6;
  }

  h3 {
    margin: 0 0 6px 0;
    font-family: $font-display;
    font-size: 1.3rem;
    color: #f8fafc;
  }

  p {
    margin: 0 0 16px 0;
    color: #94a3b8;
    font-size: 0.88rem;
  }

  .reset-btn {
    background: rgba(201, 162, 39, 0.2);
    border: 1px solid $color-gold-500;
    color: $color-gold-100;
    padding: 8px 18px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s ease;

    &:hover {
      background: rgba(201, 162, 39, 0.35);
      transform: translateY(-1px);
    }
  }
}

// Modal Animation Transitions
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.24s ease;

  .opponent-modal {
    transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .opponent-modal {
    transform: scale(0.95) translateY(12px);
  }
}
</style>
