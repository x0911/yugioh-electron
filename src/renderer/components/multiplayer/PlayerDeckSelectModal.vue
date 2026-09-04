<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="player-deck-modal-backdrop" @click="handleClose">
        <div
          class="player-deck-modal glass-panel glass-panel--elevated"
          role="dialog"
          aria-modal="true"
          aria-label="Choose Your Duel Deck"
          @click.stop
        >
          <!-- Header Bar -->
          <div class="player-deck-modal__header">
            <div class="header-left">
              <span class="header-icon">🗂️</span>
              <div>
                <h2 class="header-title">CHOOSE YOUR DUEL DECK</h2>
                <span class="header-sub">
                  Select any authentic character deck or custom creation • All decks legal in PvP
                  Arena
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
          <div class="player-deck-modal__body">
            <!-- Left Column: Deck Browser -->
            <aside class="deck-browser">
              <!-- Search Bar -->
              <div class="deck-search-box">
                <span class="search-icon">🔍</span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="deck-search-input"
                  placeholder="Search 500+ decks, characters..."
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

              <!-- Category Filter Tabs -->
              <div class="category-tabs" role="tablist">
                <button
                  v-for="cat in categoryList"
                  :key="cat.id"
                  type="button"
                  class="category-tab"
                  :class="{ 'category-tab--active': activeCategory === cat.id }"
                  @click="activeCategory = cat.id"
                >
                  {{ cat.label }} ({{ cat.count }})
                </button>
              </div>

              <!-- Deck Items List -->
              <div ref="deckListScrollRef" class="deck-list-scroll">
                <div
                  v-for="deck in filteredDecks"
                  :key="deck.id"
                  class="deck-card-item"
                  :class="{
                    'deck-card-item--previewing': previewDeck?.id === deck.id,
                    'deck-card-item--equipped': selectedDeckId === deck.id,
                  }"
                  tabindex="0"
                  role="button"
                  @click="handleDeckClick(deck)"
                  @keydown.enter="handleDeckClick(deck)"
                  @keydown.space.prevent="handleDeckClick(deck)"
                >
                  <div class="deck-item-avatar">
                    <img
                      v-if="deck.avatar"
                      :src="deck.avatar"
                      :alt="deck.name"
                      class="avatar-img"
                      @error="
                        (e) =>
                          ((e.target as HTMLImageElement).src =
                            'app-resource://characters/avatars/generic.png')
                      "
                    />
                    <span v-else class="avatar-placeholder">🎴</span>
                  </div>

                  <div class="deck-item-info">
                    <div class="deck-item-top">
                      <span class="deck-item-name" :title="deck.name">{{ deck.name }}</span>
                      <span v-if="selectedDeckId === deck.id" class="equipped-badge">
                        EQUIPPED
                      </span>
                    </div>

                    <div class="deck-item-meta">
                      <span
                        v-if="deck.series"
                        class="series-pill"
                        :class="`series-pill--${deck.series.toLowerCase()}`"
                      >
                        {{ deck.series }}
                      </span>
                      <span
                        v-if="deck.characterName && deck.characterName !== 'Community Popular'"
                        class="character-label"
                      >
                        {{ deck.characterName }}
                      </span>
                      <span v-else-if="deck.archetype" class="archetype-label">
                        {{ deck.archetype }}
                      </span>
                    </div>

                    <div class="deck-item-counts">
                      <span>📦 {{ deck.main.length }} Main</span>
                      <span v-if="deck.extra && deck.extra.length > 0">
                        • 🔮 {{ deck.extra.length }} Extra
                      </span>
                    </div>
                  </div>

                  <div class="deck-item-indicator">
                    <span v-if="previewDeck?.id === deck.id" class="indicator-viewing"
                      >VIEWING</span
                    >
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
              <div v-if="previewDeck" class="inspector-content">
                <!-- Inspector Header -->
                <div class="inspector-header">
                  <div class="inspector-top-bar">
                    <div class="inspector-deck-meta-info">
                      <div class="inspector-badge-row">
                        <span v-if="previewDeck.series" class="badge-series">
                          {{ previewDeck.series }} SERIES
                        </span>
                        <span v-if="previewDeck.archetype" class="badge-arch">
                          {{ previewDeck.archetype }}
                        </span>
                        <span
                          v-if="selectedDeckId === previewDeck.id"
                          class="badge-active-equipped"
                        >
                          ✓ EQUIPPED FOR DUEL
                        </span>
                      </div>
                      <h3 class="inspector-deck-title">{{ previewDeck.name }}</h3>
                      <p
                        v-if="
                          previewDeck.characterName &&
                          previewDeck.characterName !== 'Community Popular'
                        "
                        class="inspector-duelist-desc"
                      >
                        Authentic signature deck wielded by
                        <strong>{{ previewDeck.characterName }}</strong>
                      </p>
                    </div>

                    <!-- Equip CTA Button -->
                    <button
                      type="button"
                      class="equip-action-btn"
                      :class="{ 'equip-action-btn--equipped': selectedDeckId === previewDeck.id }"
                      :disabled="selectedDeckId === previewDeck.id"
                      @click="handleEquipCurrentPreview"
                    >
                      <span class="equip-icon">{{
                        selectedDeckId === previewDeck.id ? '✓' : '⚔️'
                      }}</span>
                      <span class="equip-text">
                        {{
                          selectedDeckId === previewDeck.id
                            ? 'Currently Equipped'
                            : 'Equip This Deck'
                        }}
                      </span>
                    </button>
                  </div>

                  <!-- Deck Stats Pill Bar -->
                  <div class="deck-stat-bar">
                    <div class="stat-pill">
                      <span class="stat-label">MAIN:</span>
                      <strong class="stat-val">{{ previewDeck.main.length }}</strong>
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
                    All Cards ({{ previewDeck.main.length + (previewDeck.extra?.length || 0) }})
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

                <!-- Cards Grid & Mini Inspector -->
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

                  <!-- Live Card Previewer (Deck Edit UI/UX) -->
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { CustomDeck } from '../../../shared/types/deck.js';
import type { CardDetail } from '../../../shared/types/card.js';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';
import { audioManager } from '../../audio/index.js';
import CardPreviewer from '../deckEdit/CardPreviewer.vue';

interface Props {
  modelValue: boolean;
  selectedDeckId: string;
  decks: CustomDeck[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'select', deck: CustomDeck): void;
  (e: 'close'): void;
}>();

const deckEditStore = useDeckEditStore();

const deckListScrollRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const activeCategory = ref<'all' | 'dm' | 'gx' | 'popular' | 'custom'>('all');
const previewDeck = ref<CustomDeck | null>(null);
const cardTab = ref<'all' | 'monsters' | 'spells' | 'traps' | 'extra'>('all');

interface GroupedCard {
  code: number;
  count: number;
  card?: CardDetail;
  category: 'monster' | 'spell' | 'trap' | 'extra';
}

const hoveredCard = ref<GroupedCard | null>(null);

// Canonical DM / GX sorting
const DM_IDS = [
  'yugi-muto',
  'yami-yugi',
  'seto-kaiba',
  'joey-wheeler',
  'tea-gardner',
  'tristan-taylor',
  'mai-valentine',
  'yami-bakura',
  'marik-ishtar',
  'maximillion-pegasus',
  'bandit-keith',
  'weevil-underwood',
  'rex-raptor',
  'mako-tsunami',
  'ishizu-ishtar',
  'odion',
  'espa-roba',
  'arkana',
  'rafael',
  'dartz',
];

const GX_IDS = [
  'jaden-yuki',
  'zane-truesdale',
  'syrus-truesdale',
  'chazz-princeton',
  'alexis-rhodes',
  'bastion-misawa',
  'chumley-huffington',
  'aster-phoenix',
  'jesse-anderson',
  'dr-vellian-crowler',
  'atticus-rhodes',
  'tyranno-hassleberry',
  'jim-crocodile-cook',
  'axel-brodie',
  'adrian-gecko',
  'sartorius-kumar',
  'yubel',
  'nightshroud',
  'yusuke-fujiwara',
  'supreme-king-jaden',
];

function getCategoryOfDeck(d: CustomDeck): 'dm' | 'gx' | 'popular' | 'custom' {
  if (
    d.category === 'character-dm' ||
    (d.series === 'DM' && d.characterName && d.characterName !== 'Community Popular')
  ) {
    return 'dm';
  }
  if (
    d.category === 'character-gx' ||
    (d.series === 'GX' && d.characterName && d.characterName !== 'Community Popular')
  ) {
    return 'gx';
  }
  if (
    d.category?.startsWith('popular') ||
    d.id.startsWith('pop-') ||
    d.characterName === 'Community Popular'
  ) {
    return 'popular';
  }
  return 'custom';
}

// Category counts
const categoryList = computed(() => {
  let dmCount = 0;
  let gxCount = 0;
  let popCount = 0;
  let customCount = 0;

  for (const d of props.decks) {
    const c = getCategoryOfDeck(d);
    if (c === 'dm') dmCount++;
    else if (c === 'gx') gxCount++;
    else if (c === 'popular') popCount++;
    else customCount++;
  }

  return [
    { id: 'all' as const, label: 'All', count: props.decks.length },
    { id: 'dm' as const, label: 'DM Series', count: dmCount },
    { id: 'gx' as const, label: 'GX Series', count: gxCount },
    { id: 'popular' as const, label: 'Popular Meta', count: popCount },
    { id: 'custom' as const, label: 'My Custom', count: customCount },
  ];
});

// Filtered deck list
const filteredDecks = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return props.decks.filter((deck) => {
    // Category check
    if (activeCategory.value !== 'all') {
      const cat = getCategoryOfDeck(deck);
      if (cat !== activeCategory.value) return false;
    }

    // Search query check
    if (!query) return true;
    const nameMatch = deck.name?.toLowerCase().includes(query);
    const charMatch = deck.characterName?.toLowerCase().includes(query);
    const archMatch = deck.archetype?.toLowerCase().includes(query);
    const seriesMatch = deck.series?.toLowerCase().includes(query);
    return Boolean(nameMatch || charMatch || archMatch || seriesMatch);
  });
});

function scrollToEquippedDeck() {
  const doScroll = () => {
    if (!deckListScrollRef.value) return;
    const equippedEl = deckListScrollRef.value.querySelector(
      '.deck-card-item--equipped',
    ) as HTMLElement | null;
    if (equippedEl) {
      equippedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };

  nextTick(() => {
    doScroll();
    setTimeout(doScroll, 120);
  });
}

// Sync preview deck and auto-scroll when modal opens or selectedDeckId changes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      activeCategory.value = 'all';
      searchQuery.value = '';
      const found =
        props.decks.find((d) => d.id === props.selectedDeckId) || props.decks[0] || null;
      previewDeck.value = found;
      cardTab.value = 'all';
      hoveredCard.value = null;
      scrollToEquippedDeck();
    }
  },
  { immediate: true },
);

function handleDeckClick(deck: CustomDeck) {
  previewDeck.value = deck;
  cardTab.value = 'all';
  hoveredCard.value = null;
  audioManager.playSfx('menu_select');
}

function handleEquipCurrentPreview() {
  if (!previewDeck.value) return;
  audioManager.playSfx('ui-click');
  emit('select', previewDeck.value);
  emit('update:modelValue', false);
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

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  if (!deckEditStore.isLoaded) {
    await deckEditStore.initStore();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Card classification helper
function getCardCategory(card?: CardDetail): 'monster' | 'spell' | 'trap' | 'extra' {
  if (!card) return 'monster';
  if (card.type & 0x40 || card.type & 0x2000) return 'extra';
  if (card.type & 0x4) return 'trap';
  if (card.type & 0x2) return 'spell';
  return 'monster';
}

function formatCardType(card?: CardDetail): string {
  if (!card) return 'Card';
  if (card.type & 0x40) return 'Fusion Monster';
  if (card.type & 0x80) return 'Ritual Monster';
  if (card.type & 0x4) {
    if (card.type & 0x100000) return 'Counter Trap';
    if (card.type & 0x20000) return 'Continuous Trap';
    return 'Trap Card';
  }
  if (card.type & 0x2) {
    if (card.type & 0x10000) return 'Quick-Play Spell';
    if (card.type & 0x20000) return 'Continuous Spell';
    if (card.type & 0x40000) return 'Equip Spell';
    if (card.type & 0x80000) return 'Field Spell';
    return 'Spell Card';
  }
  return `Monster / ${card.race || 'Warrior'}`;
}

function formatCardCategoryShort(card?: CardDetail): string {
  if (!card) return 'Card';
  if (card.type & 0x40 || card.type & 0x2000) return 'Fusion';
  if (card.type & 0x4) return 'Trap';
  if (card.type & 0x2) return 'Spell';
  return `${card.attribute || 'Monster'}`;
}

// Group cards for previewDeck
const groupedCards = computed<GroupedCard[]>(() => {
  if (!previewDeck.value) return [];
  const counts = new Map<number, number>();

  for (const id of previewDeck.value.main) {
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

  // Sort: Monsters first (by level/atk), then spells, then traps
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
  if (!previewDeck.value?.extra) return [];
  const counts = new Map<number, number>();
  for (const id of previewDeck.value.extra) {
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
      return (
        hoveredCard.value.card || deckEditStore.cardMap.get(hoveredCard.value.code) || null
      );
    }
  }
  if (displayedCards.value.length > 0) {
    const first = displayedCards.value[0];
    return first.card || deckEditStore.cardMap.get(first.code) || null;
  }
  return null;
});

const activeCardCount = computed<number>(() => {
  if (hoveredCard.value) {
    const stillInList = displayedCards.value.some((c) => c.code === hoveredCard.value?.code);
    if (stillInList) {
      return hoveredCard.value.count;
    }
  }
  if (displayedCards.value.length > 0) return displayedCards.value[0].count;
  return 0;
});
</script>

<style scoped lang="scss">
.player-deck-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 7, 13, 0.82);
  backdrop-filter: blur(12px);
  padding: 24px;
}

.player-deck-modal {
  width: 100%;
  max-width: 1440px;
  height: 90vh;
  max-height: 1000px;
  display: flex;
  flex-direction: column;
  background: rgba(14, 18, 28, 0.95);
  border: 1px solid rgba(217, 119, 6, 0.4);
  border-top: 2px solid #f59e0b;
  border-radius: 12px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.85),
    0 0 32px rgba(245, 158, 11, 0.2);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(10, 13, 20, 0.7);

    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .header-icon {
      font-size: 1.8rem;
    }

    .header-title {
      margin: 0;
      font-family: 'Cinzel', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #fbbf24;
      letter-spacing: 0.05em;
    }

    .header-sub {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .header-close-btn {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.7);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
        color: #fff;
      }
    }
  }

  &__body {
    flex: 1;
    display: grid;
    grid-template-columns: 380px 1fr;
    min-height: 0;
    overflow: hidden;
  }
}

// -----------------------------------------------------------------------------
// LEFT COLUMN: DECK BROWSER
// -----------------------------------------------------------------------------
.deck-browser {
  display: flex;
  flex-direction: column;
  background: rgba(9, 12, 18, 0.85);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 0;

  .deck-search-box {
    position: relative;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .search-icon {
      position: absolute;
      left: 26px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
      opacity: 0.6;
    }

    .deck-search-input {
      width: 100%;
      padding: 8px 32px 8px 34px;
      background: rgba(22, 28, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      color: #fff;
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.88rem;

      &:focus {
        outline: none;
        border-color: #f59e0b;
        background: rgba(30, 38, 56, 0.9);
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      font-size: 0.85rem;

      &:hover {
        color: #fff;
      }
    }
  }

  .category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px 16px;
    overflow-x: auto;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .category-tab {
      white-space: nowrap;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      &--active {
        background: rgba(245, 158, 11, 0.2);
        border-color: #f59e0b;
        color: #fbbf24;
        font-weight: 600;
      }
    }
  }

  .deck-list-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
    }
  }
}

.deck-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(2px);
  }

  &--previewing {
    background: rgba(245, 158, 11, 0.12) !important;
    border-color: rgba(245, 158, 11, 0.6) !important;
    box-shadow: inset 3px 0 0 #f59e0b;
  }

  &--equipped {
    border-color: rgba(59, 130, 246, 0.5);
  }

  .deck-item-avatar {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      font-size: 1.3rem;
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
    }

    .deck-item-name {
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-weight: 700;
      font-size: 0.95rem;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .equipped-badge {
      font-size: 0.65rem;
      padding: 2px 6px;
      background: rgba(59, 130, 246, 0.3);
      border: 1px solid #3b82f6;
      border-radius: 3px;
      color: #93c5fd;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .deck-item-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      color: rgba(255, 255, 255, 0.6);

      .series-pill {
        font-size: 0.65rem;
        padding: 1px 5px;
        border-radius: 3px;
        font-weight: 700;

        &--dm {
          background: rgba(234, 179, 8, 0.2);
          color: #fde047;
        }
        &--gx {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
      }

      .character-label,
      .archetype-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .deck-item-counts {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .deck-item-indicator {
    display: flex;
    align-items: center;
    font-size: 0.75rem;

    .indicator-viewing {
      font-size: 0.65rem;
      font-weight: 700;
      color: #f59e0b;
      letter-spacing: 0.05em;
    }

    .indicator-arrow {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.no-decks-found {
  padding: 40px 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);

  .no-decks-icon {
    font-size: 2rem;
    margin-bottom: 8px;
    display: block;
  }
}

// -----------------------------------------------------------------------------
// RIGHT COLUMN: DECK CONTENTS INSPECTOR
// -----------------------------------------------------------------------------
.deck-inspector {
  display: flex;
  flex-direction: column;
  background: rgba(14, 18, 28, 0.9);
  min-height: 0;

  .inspector-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .inspector-header {
    padding: 16px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(18, 24, 38, 0.7);

    .inspector-top-bar {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
    }

    .inspector-badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      .badge-series {
        font-size: 0.7rem;
        padding: 2px 8px;
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.5);
        color: #fbbf24;
        font-weight: 700;
        border-radius: 3px;
      }

      .badge-arch {
        font-size: 0.7rem;
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #cbd5e1;
        border-radius: 3px;
      }

      .badge-active-equipped {
        font-size: 0.7rem;
        padding: 2px 8px;
        background: rgba(59, 130, 246, 0.25);
        border: 1px solid #3b82f6;
        color: #93c5fd;
        font-weight: 700;
        border-radius: 3px;
      }
    }

    .inspector-deck-title {
      margin: 0 0 4px;
      font-family: 'Cinzel', serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
    }

    .inspector-duelist-desc {
      margin: 0;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      strong {
        color: #fbbf24;
      }
    }

    .equip-action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border: 1px solid #fbbf24;
      color: #000;
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.03em;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 0 28px rgba(245, 158, 11, 0.6);
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      }

      &--equipped {
        background: rgba(30, 41, 59, 0.8) !important;
        border-color: rgba(59, 130, 246, 0.6) !important;
        color: #93c5fd !important;
        box-shadow: none !important;
        cursor: default !important;
      }
    }

    .deck-stat-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .stat-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-size: 0.8rem;

        .stat-label {
          color: rgba(255, 255, 255, 0.6);
        }

        .stat-val {
          color: #fff;
          font-weight: 700;
        }

        &--monster {
          border-color: rgba(245, 158, 11, 0.3);
          .stat-val {
            color: #f59e0b;
          }
        }
        &--spell {
          border-color: rgba(16, 185, 129, 0.3);
          .stat-val {
            color: #10b981;
          }
        }
        &--trap {
          border-color: rgba(236, 72, 153, 0.3);
          .stat-val {
            color: #ec4899;
          }
        }
        &--extra {
          border-color: rgba(168, 85, 247, 0.3);
          .stat-val {
            color: #a855f7;
          }
        }
      }
    }
  }

  .inspector-card-tabs {
    display: flex;
    gap: 8px;
    padding: 10px 24px;
    background: rgba(10, 13, 20, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .card-filter-tab {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 6px 12px;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Barlow Semi Condensed', sans-serif;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        color: #fff;
      }

      &--active {
        color: #fbbf24;
        border-bottom-color: #fbbf24;
        font-weight: 700;
      }
    }
  }

  .inspector-body-row {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }

  .cards-grid-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .card-tile {
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
      border-color: rgba(255, 255, 255, 0.3);
    }

    &--monster {
      border-bottom: 2px solid #d97706;
      &:hover {
        border-color: #f59e0b;
      }
    }
    &--spell {
      border-bottom: 2px solid #059669;
      &:hover {
        border-color: #10b981;
      }
    }
    &--trap {
      border-bottom: 2px solid #db2777;
      &:hover {
        border-color: #ec4899;
      }
    }
    &--extra {
      border-bottom: 2px solid #7c3aed;
      &:hover {
        border-color: #a855f7;
      }
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
        background: rgba(0, 0, 0, 0.85);
        border: 1px solid #fbbf24;
        color: #fbbf24;
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-weight: 800;
        font-size: 0.75rem;
        padding: 1px 5px;
        border-radius: 3px;
      }
    }

    .card-info-box {
      padding: 6px 8px;
      display: flex;
      display: none; // keep it hidden for now.
      flex-direction: column;
      gap: 2px;
      background: rgba(10, 13, 20, 0.8);

      .card-name {
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-size: 0.76rem;
        font-weight: 600;
        color: #e2e8f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-category-label {
        font-size: 0.68rem;
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }

  // Live Card Previewer (Right Pane)
  .modal-card-previewer-wrap {
    width: 330px;
    flex-shrink: 0;
    min-height: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 8px;
    background: rgba(8, 11, 18, 0.85);
    border-left: 1px solid rgba(255, 255, 255, 0.08);

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(201, 162, 39, 0.25);
      border-radius: 3px;
    }
  }

  .inspector-none {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.4);

    .none-icon {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }
  }
}

// Fade animation for modal
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
