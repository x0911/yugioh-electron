<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="opponent-deck-modal-backdrop" @click="handleClose">
        <div
          class="opponent-deck-modal glass-panel glass-panel--elevated"
          role="dialog"
          aria-modal="true"
          aria-label="Select Opponent Deck"
          @click.stop
        >
          <!-- Header Bar -->
          <div class="opponent-deck-modal__header">
            <div class="header-left">
              <span class="header-icon">🎴</span>
              <div>
                <h2 class="header-title">SELECT OPPONENT DECK</h2>
                <span class="header-sub">
                  Configure the deck <strong>{{ opponent?.name || 'Opponent' }}</strong> will wield
                  • Choose Random for a surprise matchup or pick a signature deck
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

          <!-- Two-Column Body -->
          <div class="opponent-deck-modal__body">
            <!-- Left Column: Deck Browser -->
            <aside class="deck-browser">
              <!-- Search Bar -->
              <div class="deck-search-box">
                <span class="search-icon">🔍</span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="deck-search-input"
                  :placeholder="`Search ${opponent?.decks.length || 10} decks, archetypes...`"
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

              <!-- Deck Items List -->
              <div ref="deckListScrollRef" class="deck-list-scroll">
                <!-- 1. Random Deck Option (Default) -->
                <div
                  class="deck-card-item deck-card-item--random"
                  :class="{
                    'deck-card-item--previewing': previewMode === 'random',
                    'deck-card-item--equipped': !isManual,
                  }"
                  tabindex="0"
                  role="button"
                  @click="handleSelectRandomPreview"
                  @dblclick="handleSelectRandom"
                  @keydown.enter="handleSelectRandom"
                  @keydown.space.prevent="handleSelectRandomPreview"
                  @mouseenter="handleItemHover"
                >
                  <div class="deck-item-avatar deck-item-avatar--random">
                    <span class="avatar-dice-icon">🎲</span>
                  </div>

                  <div class="deck-item-info">
                    <div class="deck-item-top">
                      <span class="deck-item-name">Random Deck (Default)</span>
                      <span v-if="!isManual" class="equipped-badge"> ACTIVE </span>
                    </div>

                    <div class="deck-item-meta">
                      <span class="series-pill series-pill--gold"> DYNAMIC </span>
                      <span class="archetype-label"> Surprise Matchup </span>
                    </div>

                    <div class="deck-item-counts">
                      <span>🎲 Rotates every match from authentic pool</span>
                    </div>
                  </div>

                  <div class="deck-item-indicator">
                    <span v-if="previewMode === 'random'" class="indicator-viewing">VIEWING</span>
                    <span v-else class="indicator-arrow">›</span>
                  </div>
                </div>

                <div class="deck-list-divider">
                  <span>OR CHOOSE SPECIFIC SIGNATURE DECK</span>
                </div>

                <!-- 2. Specific Decks List -->
                <div
                  v-for="(deck, idx) in filteredDecks"
                  :key="deck.id"
                  class="deck-card-item"
                  :class="{
                    'deck-card-item--previewing':
                      previewMode === 'deck' && previewDeck?.id === deck.id,
                    'deck-card-item--equipped': isManual && selectedDeck?.id === deck.id,
                  }"
                  tabindex="0"
                  role="button"
                  @click="handleSelectDeckPreview(deck)"
                  @dblclick="handleSelectDeck(deck)"
                  @keydown.enter="handleSelectDeck(deck)"
                  @keydown.space.prevent="handleSelectDeckPreview(deck)"
                  @mouseenter="handleItemHover"
                >
                  <div class="deck-item-avatar">
                    <span class="deck-order-num">#{{ idx + 1 }}</span>
                  </div>

                  <div class="deck-item-info">
                    <div class="deck-item-top">
                      <span class="deck-item-name" :title="deck.name">{{ deck.name }}</span>
                      <span v-if="isManual && selectedDeck?.id === deck.id" class="equipped-badge">
                        SELECTED
                      </span>
                    </div>

                    <div class="deck-item-meta">
                      <span
                        v-if="opponent?.series"
                        class="series-pill"
                        :class="`series-pill--${opponent.series.toLowerCase()}`"
                      >
                        {{ opponent.series }}
                      </span>
                      <span class="archetype-label" :title="deck.archetype">
                        {{ deck.archetype }}
                      </span>
                    </div>

                    <div class="deck-item-counts">
                      <span>📦 {{ deck.mainCards.length }} Main</span>
                      <span v-if="deck.extraCards && deck.extraCards.length > 0">
                        • 🔮 {{ deck.extraCards.length }} Extra
                      </span>
                    </div>
                  </div>

                  <div class="deck-item-indicator">
                    <span
                      v-if="previewMode === 'deck' && previewDeck?.id === deck.id"
                      class="indicator-viewing"
                    >
                      VIEWING
                    </span>
                    <span v-else class="indicator-arrow">›</span>
                  </div>
                </div>

                <div v-if="filteredDecks.length === 0" class="no-decks-found">
                  <span class="no-decks-icon">🔍</span>
                  <p>No decks match "{{ searchQuery }}"</p>
                </div>
              </div>
            </aside>

            <!-- Right Column: Deck Contents Inspector -->
            <section class="deck-inspector">
              <!-- Random Mode Preview -->
              <div v-if="previewMode === 'random'" class="inspector-random">
                <div class="random-showcase">
                  <div class="random-dice-wrap">
                    <div class="dice-icon-huge">🎲</div>
                    <div class="dice-aura" />
                  </div>

                  <div class="random-badge-row">
                    <span class="badge-series">DEFAULT RECOMMENDED</span>
                    <span v-if="!isManual" class="badge-active-equipped"> ✓ CURRENTLY ACTIVE </span>
                  </div>

                  <h3 class="random-title">RANDOM OPPONENT DECK MODE</h3>
                  <p class="random-desc">
                    Each duel, {{ opponent?.name || 'your opponent' }} dynamically selects one of
                    their
                    <strong>{{ opponent?.decks.length || 10 }} authentic signature decks</strong> at
                    match initialization. This provides maximum strategic replayability and keeps
                    every match unpredictable!
                  </p>

                  <div class="random-pool-box">
                    <h4 class="pool-title">
                      Available Deck Pool ({{ opponent?.decks.length || 0 }} Decks):
                    </h4>
                    <div class="pool-list">
                      <div
                        v-for="d in opponent?.decks || []"
                        :key="d.id"
                        class="pool-chip"
                        @click="handleSelectDeckPreview(d)"
                      >
                        <span class="chip-name">{{ d.name }}</span>
                        <span class="chip-arch">({{ d.archetype }})</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="equip-action-btn equip-action-btn--random"
                    :class="{ 'equip-action-btn--equipped': !isManual }"
                    :disabled="!isManual"
                    @click="handleSelectRandom"
                  >
                    <span class="equip-icon">{{ !isManual ? '✓' : '🎲' }}</span>
                    <span class="equip-text">
                      {{ !isManual ? 'Currently Active (Default)' : 'Activate Random Deck Mode' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Specific Deck Inspector -->
              <div v-else-if="previewDeck" class="inspector-content">
                <!-- Inspector Header -->
                <div class="inspector-header">
                  <div class="inspector-top-bar">
                    <div class="inspector-deck-meta-info">
                      <div class="inspector-badge-row">
                        <span v-if="opponent?.series" class="badge-series">
                          {{ opponent.series }} SERIES
                        </span>
                        <span v-if="previewDeck.archetype" class="badge-arch">
                          {{ previewDeck.archetype }}
                        </span>
                        <span
                          v-if="isManual && selectedDeck?.id === previewDeck.id"
                          class="badge-active-equipped"
                        >
                          ✓ SELECTED FOR DUEL
                        </span>
                      </div>
                      <h3 class="inspector-deck-title">{{ previewDeck.name }}</h3>
                      <p class="inspector-duelist-desc">
                        {{
                          previewDeck.description ||
                          `Authentic signature deck wielded by ${opponent?.name || 'this character'}.`
                        }}
                      </p>
                    </div>

                    <!-- Equip CTA Button -->
                    <button
                      type="button"
                      class="equip-action-btn"
                      :class="{
                        'equip-action-btn--equipped':
                          isManual && selectedDeck?.id === previewDeck.id,
                      }"
                      :disabled="isManual && selectedDeck?.id === previewDeck.id"
                      @click="handleSelectDeck(previewDeck)"
                    >
                      <span class="equip-icon">{{
                        isManual && selectedDeck?.id === previewDeck.id ? '✓' : '⚔️'
                      }}</span>
                      <span class="equip-text">
                        {{
                          isManual && selectedDeck?.id === previewDeck.id
                            ? 'Currently Selected'
                            : 'Select This Deck'
                        }}
                      </span>
                    </button>
                  </div>

                  <!-- Deck Stats Pill Bar -->
                  <div class="deck-stat-bar">
                    <div class="stat-pill">
                      <span class="stat-label">MAIN:</span>
                      <strong class="stat-val">{{ previewDeck.mainCards.length }}</strong>
                    </div>
                    <div class="stat-pill stat-pill--monster">
                      <span class="stat-label">⚔️ MONSTERS:</span>
                      <strong class="stat-val">{{
                        monsterCards.reduce((s, c) => s + c.count, 0)
                      }}</strong>
                    </div>
                    <div class="stat-pill stat-pill--spell">
                      <span class="stat-label">📜 SPELLS:</span>
                      <strong class="stat-val">{{
                        spellCards.reduce((s, c) => s + c.count, 0)
                      }}</strong>
                    </div>
                    <div class="stat-pill stat-pill--trap">
                      <span class="stat-label">🛡️ TRAPS:</span>
                      <strong class="stat-val">{{
                        trapCards.reduce((s, c) => s + c.count, 0)
                      }}</strong>
                    </div>
                    <div class="stat-pill stat-pill--extra">
                      <span class="stat-label">🔮 EXTRA:</span>
                      <strong class="stat-val">{{
                        extraDeckCards.reduce((s, c) => s + c.count, 0)
                      }}</strong>
                    </div>
                  </div>
                </div>

                <!-- Deck Card Filter Sub-tabs -->
                <div class="inspector-card-tabs" role="tablist">
                  <button
                    type="button"
                    class="card-filter-tab"
                    :class="{ 'card-filter-tab--active': cardTab === 'all' }"
                    @click="cardTab = 'all'"
                  >
                    All Cards ({{
                      previewDeck.mainCards.length + (previewDeck.extraCards?.length || 0)
                    }})
                  </button>
                  <button
                    type="button"
                    class="card-filter-tab"
                    :class="{ 'card-filter-tab--active': cardTab === 'monsters' }"
                    @click="cardTab = 'monsters'"
                  >
                    Monsters ({{ monsterCards.reduce((s, c) => s + c.count, 0) }})
                  </button>
                  <button
                    type="button"
                    class="card-filter-tab"
                    :class="{ 'card-filter-tab--active': cardTab === 'spells' }"
                    @click="cardTab = 'spells'"
                  >
                    Spells ({{ spellCards.reduce((s, c) => s + c.count, 0) }})
                  </button>
                  <button
                    type="button"
                    class="card-filter-tab"
                    :class="{ 'card-filter-tab--active': cardTab === 'traps' }"
                    @click="cardTab = 'traps'"
                  >
                    Traps ({{ trapCards.reduce((s, c) => s + c.count, 0) }})
                  </button>
                  <button
                    v-if="extraDeckCards.length > 0"
                    type="button"
                    class="card-filter-tab"
                    :class="{ 'card-filter-tab--active': cardTab === 'extra' }"
                    @click="cardTab = 'extra'"
                  >
                    Extra Deck ({{ extraDeckCards.reduce((s, c) => s + c.count, 0) }})
                  </button>
                </div>

                <!-- Cards Grid & Card Previewer -->
                <div class="inspector-body-row">
                  <div class="cards-grid-scroll">
                    <div class="cards-grid">
                      <div
                        v-for="item in displayedCards"
                        :key="item.code"
                        class="card-tile"
                        :class="`card-tile--${item.category}`"
                        @mouseenter="hoveredCard = item"
                        @click="hoveredCard = item"
                      >
                        <div class="card-art-frame">
                          <img
                            :src="getCardImageUrl(item.code, 'mini')"
                            :alt="item.card?.name || 'Card'"
                            class="card-img"
                            loading="lazy"
                            @error="handleImageError"
                          />
                          <span v-if="item.count > 1" class="card-badge"> ×{{ item.count }} </span>
                        </div>
                        <div class="card-info-box">
                          <span class="card-name" :title="item.card?.name || 'Card'">
                            {{ item.card?.name || `Card #${item.code}` }}
                          </span>
                          <span class="card-category-label">
                            {{ formatCardCategoryShort(item.card) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Live Card Previewer -->
                  <aside class="modal-card-previewer-wrap">
                    <CardPreviewer
                      :card="activeInspectedCard"
                      :copies-in-deck="activeCardCount"
                      :show-actions="false"
                    />
                  </aside>
                </div>
              </div>

              <div v-else class="inspector-none">
                <span class="none-icon">👈</span>
                <p>Click any deck on the left side to inspect its cards and contents</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { CharacterData, CharacterDeckData } from '../../../shared/types/character.js';
import type { CardDetail } from '../../../shared/types/card.js';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
import { audioManager } from '../../audio/index.js';
import CardPreviewer from '../deckEdit/CardPreviewer.vue';

interface Props {
  modelValue: boolean;
  opponent: CharacterData | null;
  selectedDeck: CharacterDeckData | null;
  isManual: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', deck: CharacterDeckData | null): void;
  (e: 'close'): void;
}>();

const deckEditStore = useDeckEditStore();

const deckListScrollRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const previewMode = ref<'deck' | 'random'>('random');
const previewDeck = ref<CharacterDeckData | null>(null);
const cardTab = ref<'all' | 'monsters' | 'spells' | 'traps' | 'extra'>('all');

interface GroupedCard {
  code: number;
  count: number;
  card?: CardDetail;
  category: 'monster' | 'spell' | 'trap' | 'extra';
}

const hoveredCard = ref<GroupedCard | null>(null);

const filteredDecks = computed(() => {
  const list = props.opponent?.decks || [];
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return list;
  return list.filter((d) => {
    return (
      d.name?.toLowerCase().includes(query) ||
      d.archetype?.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query)
    );
  });
});

function getCardCategory(card?: CardDetail): 'monster' | 'spell' | 'trap' | 'extra' {
  if (!card) return 'monster';
  if (card.type & 0x40 || card.type & 0x2000) return 'extra';
  if (card.type & 0x4) return 'trap';
  if (card.type & 0x2) return 'spell';
  return 'monster';
}

function formatCardCategoryShort(card?: CardDetail): string {
  if (!card) return 'Card';
  if (card.type & 0x40 || card.type & 0x2000) return 'Fusion';
  if (card.type & 0x4) return 'Trap';
  if (card.type & 0x2) return 'Spell';
  return `${card.attribute || 'Monster'}`;
}

const groupedCards = computed<GroupedCard[]>(() => {
  if (!previewDeck.value?.mainCards) return [];
  const counts = new Map<number, number>();

  for (const id of previewDeck.value.mainCards) {
    counts.set(id, (counts.get(id) || 0) + 1);
  }

  const result: GroupedCard[] = [];
  for (const [code, count] of counts.entries()) {
    const card = deckEditStore.cardMap.get(code);
    result.push({
      code,
      count,
      card,
      category: getCardCategory(card),
    });
  }

  result.sort((a, b) => {
    const order = { monster: 1, spell: 2, trap: 3, extra: 4 };
    const diff = (order[a.category] || 5) - (order[b.category] || 5);
    if (diff !== 0) return diff;
    return (b.card?.atk || 0) - (a.card?.atk || 0);
  });

  return result;
});

const monsterCards = computed(() => groupedCards.value.filter((c) => c.category === 'monster'));
const spellCards = computed(() => groupedCards.value.filter((c) => c.category === 'spell'));
const trapCards = computed(() => groupedCards.value.filter((c) => c.category === 'trap'));

const extraDeckCards = computed<GroupedCard[]>(() => {
  if (!previewDeck.value?.extraCards) return [];
  const counts = new Map<number, number>();
  for (const id of previewDeck.value.extraCards) {
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  const result: GroupedCard[] = [];
  for (const [code, count] of counts.entries()) {
    const card = deckEditStore.cardMap.get(code);
    result.push({
      code,
      count,
      card,
      category: 'extra',
    });
  }
  return result;
});

const displayedCards = computed(() => {
  switch (cardTab.value) {
    case 'monsters':
      return monsterCards.value;
    case 'spells':
      return spellCards.value;
    case 'traps':
      return trapCards.value;
    case 'extra':
      return extraDeckCards.value;
    case 'all':
    default:
      return [...groupedCards.value, ...extraDeckCards.value];
  }
});

const activeInspectedCard = computed<CardDetail | null>(() => {
  if (hoveredCard.value) {
    const stillInList = displayedCards.value.some((c) => c.code === hoveredCard.value?.code);
    if (stillInList) {
      return hoveredCard.value.card || null;
    }
  }
  return displayedCards.value[0]?.card || null;
});

const activeCardCount = computed<number>(() => {
  if (!activeInspectedCard.value) return 0;
  const match = displayedCards.value.find((c) => c.code === activeInspectedCard.value?.code);
  return match?.count || 1;
});

function handleItemHover() {
  audioManager.playSfx('ui-hover');
}

function handleSelectRandomPreview() {
  audioManager.playSfx('ui-click');
  previewMode.value = 'random';
}

function handleSelectDeckPreview(deck: CharacterDeckData) {
  audioManager.playSfx('ui-click');
  previewMode.value = 'deck';
  previewDeck.value = deck;
  hoveredCard.value = null;
  cardTab.value = 'all';
}

function handleSelectRandom() {
  audioManager.playSfx('ui-click');
  emit('select', null);
  handleClose();
}

function handleSelectDeck(deck: CharacterDeckData) {
  audioManager.playSfx('ui-click');
  emit('select', deck);
  handleClose();
}

function handleClose() {
  emit('update:modelValue', false);
  emit('close');
}

function handleKeyDown(event: KeyboardEvent) {
  if (props.modelValue && event.key === 'Escape') {
    handleClose();
  }
}

function syncInitialPreview() {
  if (props.isManual && props.selectedDeck) {
    previewMode.value = 'deck';
    previewDeck.value = props.selectedDeck;
  } else {
    previewMode.value = 'random';
    previewDeck.value = props.opponent?.decks?.[0] || null;
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      syncInitialPreview();
      nextTick(() => {
        if (!deckListScrollRef.value) return;
        const equippedEl = deckListScrollRef.value.querySelector(
          '.deck-card-item--equipped',
        ) as HTMLElement | null;
        if (equippedEl) {
          equippedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  if (props.modelValue) {
    window.addEventListener('keydown', handleKeyDown);
  }
  if (!deckEditStore.isLoaded) {
    await deckEditStore.initStore();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.opponent-deck-modal-backdrop {
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

.opponent-deck-modal {
  position: relative;
  width: 100%;
  max-width: 1440px;
  height: 90vh;
  max-height: 1000px;
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

  &__body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
}

// -----------------------------------------------------------------------------
// Left Column: Deck Browser
// -----------------------------------------------------------------------------
.deck-browser {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.28);
  border-right: 1px solid rgba(255, 255, 255, 0.08);

  .deck-search-box {
    position: relative;
    padding: 16px;
    display: flex;
    align-items: center;

    .search-icon {
      position: absolute;
      left: 28px;
      font-size: 0.95rem;
      pointer-events: none;
      opacity: 0.7;
    }

    .deck-search-input {
      width: 100%;
      height: 38px;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(201, 162, 39, 0.35);
      border-radius: 8px;
      padding: 0 32px 0 36px;
      color: #f8fafc;
      font-family: inherit;
      font-size: 0.84rem;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        border-color: $color-gold-500;
        box-shadow: 0 0 12px rgba(201, 162, 39, 0.35);
      }

      &::placeholder {
        color: #64748b;
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 24px;
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

  .deck-list-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0 14px 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(201, 162, 39, 0.3);
      border-radius: 3px;
    }
  }

  .deck-list-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0 4px 0;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #94a3b8;

    span {
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
}

// Deck Item Card
.deck-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.18s ease;
  outline: none;

  &:hover {
    background: rgba(201, 162, 39, 0.1);
    border-color: rgba(201, 162, 39, 0.35);
    transform: translateX(3px);
  }

  &--previewing {
    background: rgba(201, 162, 39, 0.18) !important;
    border-color: $color-gold-500 !important;
    box-shadow: 0 0 14px rgba(201, 162, 39, 0.25);
  }

  &--equipped {
    border-left: 3.5px solid #22c55e !important;
  }

  &--random {
    background: linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(201, 162, 39, 0.04) 100%);
    border: 1px dashed rgba(201, 162, 39, 0.5);

    &:hover {
      background: rgba(201, 162, 39, 0.2);
    }
  }

  .deck-item-avatar {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .deck-order-num {
      font-family: $font-mono;
      font-size: 0.8rem;
      font-weight: 800;
      color: $color-gold-300;
    }

    &--random {
      background: rgba(201, 162, 39, 0.2);
      border-color: rgba(201, 162, 39, 0.4);
      .avatar-dice-icon {
        font-size: 1.3rem;
      }
    }
  }

  .deck-item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;

    .deck-item-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;

      .deck-item-name {
        font-size: 0.86rem;
        font-weight: 700;
        color: #f8fafc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .equipped-badge {
        font-family: $font-mono;
        font-size: 0.62rem;
        font-weight: 800;
        padding: 1px 6px;
        border-radius: 4px;
        background: #22c55e;
        color: #052e16;
      }
    }

    .deck-item-meta {
      display: flex;
      align-items: center;
      gap: 6px;

      .series-pill {
        font-family: $font-mono;
        font-size: 0.62rem;
        font-weight: 800;
        padding: 1px 5px;
        border-radius: 4px;

        &--dm {
          background: rgba(234, 179, 8, 0.2);
          color: #fef08a;
        }
        &--gx {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        &--gold {
          background: rgba(201, 162, 39, 0.25);
          color: $color-gold-100;
        }
      }

      .archetype-label {
        font-size: 0.72rem;
        color: #94a3b8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .deck-item-counts {
      font-size: 0.7rem;
      color: #64748b;
    }
  }

  .deck-item-indicator {
    font-size: 0.72rem;
    font-weight: 700;
    color: $color-gold-500;

    .indicator-arrow {
      font-size: 1.1rem;
      color: #64748b;
    }
  }
}

.no-decks-found {
  text-align: center;
  padding: 40px 10px;
  color: #64748b;

  .no-decks-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 8px;
  }
}

// -----------------------------------------------------------------------------
// Right Column: Deck Inspector
// -----------------------------------------------------------------------------
.deck-inspector {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.15);
}

// Random Mode Showcase
.inspector-random {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  .random-showcase {
    max-width: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;

    .random-dice-wrap {
      position: relative;
      width: 90px;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;

      .dice-icon-huge {
        font-size: 4rem;
        z-index: 1;
        filter: drop-shadow(0 0 16px rgba(201, 162, 39, 0.6));
      }

      .dice-aura {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(201, 162, 39, 0.3) 0%, transparent 70%);
        animation: pulseAura 2.5s infinite ease-in-out;
      }
    }

    .random-badge-row {
      display: flex;
      gap: 8px;

      .badge-series {
        font-family: $font-mono;
        font-size: 0.72rem;
        font-weight: 800;
        background: rgba(201, 162, 39, 0.2);
        color: $color-gold-300;
        padding: 3px 10px;
        border-radius: 12px;
        border: 1px solid rgba(201, 162, 39, 0.4);
      }

      .badge-active-equipped {
        font-family: $font-mono;
        font-size: 0.72rem;
        font-weight: 800;
        background: #22c55e;
        color: #052e16;
        padding: 3px 10px;
        border-radius: 12px;
      }
    }

    .random-title {
      margin: 0;
      font-family: $font-display;
      font-size: 1.6rem;
      font-weight: 800;
      color: $color-gold-100;
      letter-spacing: 0.04em;
    }

    .random-desc {
      margin: 0;
      font-size: 0.88rem;
      color: #94a3b8;
      line-height: 1.5;
    }

    .random-pool-box {
      width: 100%;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      text-align: left;

      .pool-title {
        margin: 0 0 10px 0;
        font-size: 0.78rem;
        font-weight: 700;
        color: #cbd5e1;
        letter-spacing: 0.04em;
      }

      .pool-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        max-height: 150px;
        overflow-y: auto;

        .pool-chip {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.74rem;
          cursor: pointer;
          transition: all 0.16s ease;

          &:hover {
            background: rgba(201, 162, 39, 0.2);
            border-color: $color-gold-500;
            color: $color-gold-100;
          }

          .chip-name {
            font-weight: 700;
            color: #f8fafc;
            margin-right: 4px;
          }

          .chip-arch {
            color: #94a3b8;
          }
        }
      }
    }
  }
}

// Specific Deck Inspector Content
.inspector-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.inspector-header {
  padding: 16px 24px 12px 24px;
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;

  .inspector-top-bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;

    .inspector-deck-meta-info {
      flex: 1;

      .inspector-badge-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .badge-series {
          font-family: $font-mono;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(201, 162, 39, 0.2);
          color: $color-gold-300;
          border: 1px solid rgba(201, 162, 39, 0.4);
        }

        .badge-arch {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
        }

        .badge-active-equipped {
          font-family: $font-mono;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          background: #22c55e;
          color: #052e16;
        }
      }

      .inspector-deck-title {
        margin: 0;
        font-family: $font-display;
        font-size: 1.35rem;
        font-weight: 800;
        color: #f8fafc;
        letter-spacing: 0.03em;
      }

      .inspector-duelist-desc {
        margin: 4px 0 0 0;
        font-size: 0.76rem;
        color: #94a3b8;
      }
    }
  }

  .deck-stat-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      font-size: 0.72rem;
      font-family: $font-mono;
      color: #94a3b8;

      strong {
        color: #f8fafc;
        font-weight: 800;
      }

      &--monster strong {
        color: #f59e0b;
      }
      &--spell strong {
        color: #10b981;
      }
      &--trap strong {
        color: #ec4899;
      }
      &--extra strong {
        color: #a855f7;
      }
    }
  }
}

// Equip CTA Action Button
.equip-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 8px;
  background: linear-gradient(135deg, $color-gold-500 0%, $color-gold-500 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #0b0f19;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 4px 16px rgba(201, 162, 39, 0.35);
  flex-shrink: 0;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(201, 162, 39, 0.55);
    background: linear-gradient(135deg, $color-gold-300 0%, $color-gold-500 100%);
  }

  &--equipped {
    background: rgba(34, 197, 94, 0.2) !important;
    border-color: #22c55e !important;
    color: #4ade80 !important;
    box-shadow: none !important;
    cursor: default;
  }

  &--random {
    padding: 10px 24px;
    font-size: 0.95rem;
  }
}

// Card Filter Sub-tabs
.inspector-card-tabs {
  display: flex;
  gap: 6px;
  padding: 10px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  .card-filter-tab {
    background: transparent;
    border: none;
    color: #94a3b8;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.74rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }

    &--active {
      color: $color-gold-100;
      background: rgba(201, 162, 39, 0.2);
    }
  }
}

// Inspector Body Row
.inspector-body-row {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.cards-grid-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.3);
    border-radius: 3px;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.card-tile {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: $color-gold-500;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
  }

  &--monster {
    border-color: rgba(245, 158, 11, 0.35);
  }
  &--spell {
    border-color: rgba(16, 185, 129, 0.35);
  }
  &--trap {
    border-color: rgba(236, 72, 153, 0.35);
  }
  &--extra {
    border-color: rgba(168, 85, 247, 0.35);
  }

  .card-art-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 0.72;
    background: #000;
    overflow: hidden;

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-badge {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.8);
      color: $color-gold-300;
      border: 1px solid $color-gold-500;
      font-family: $font-mono;
      font-size: 0.64rem;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 4px;
    }
  }

  .card-info-box {
    padding: 6px 8px;
    display: flex;
    display: none; // keep it hidden for now.
    flex-direction: column;
    gap: 2px;

    .card-name {
      font-size: 0.72rem;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-category-label {
      font-size: 0.64rem;
      color: #94a3b8;
    }
  }
}

// Live Card Previewer Aside
.modal-card-previewer-wrap {
  width: 290px;
  flex-shrink: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  padding: 14px;
}

.inspector-none {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
  gap: 12px;

  .none-icon {
    font-size: 2.5rem;
  }
}

// Animations
@keyframes pulseAura {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.55;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.24s ease;
  .opponent-deck-modal {
    transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  .opponent-deck-modal {
    transform: scale(0.95) translateY(12px);
  }
}
</style>
