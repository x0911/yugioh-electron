<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { CustomDeck } from '../../../shared/types/deck.js';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import { getCardImageUrl, handleImageError } from '../../utils/media.js';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    decks: CustomDeck[];
    disabled?: boolean;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    placeholder: 'Search 400+ decks or cards inside (e.g. Kaiba, Exodia, Jinzo)...',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', deck: CustomDeck): void;
}>();

const store = useDeckEditStore();

const isOpen = ref(false);
const searchQuery = ref('');
const activeCategory = ref<'ALL' | 'character-dm' | 'character-gx' | 'popular' | 'custom'>('ALL');
const highlightedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const listContainerRef = ref<HTMLDivElement | null>(null);
const rootRef = ref<HTMLDivElement | null>(null);

// Canonical DM and GX character ordering for grouped sorting
const DM_CHARACTER_ORDER = [
  'yugi-muto', 'yami-yugi', 'seto-kaiba', 'joey-wheeler', 'tea-gardner',
  'tristan-taylor', 'mai-valentine', 'yami-bakura', 'marik-ishtar', 'maximillion-pegasus',
  'bandit-keith', 'weevil-underwood', 'rex-raptor', 'mako-tsunami', 'ishizu-ishtar',
  'odion', 'espa-roba', 'arkana', 'rafael', 'dartz'
];

const GX_CHARACTER_ORDER = [
  'jaden-yuki', 'zane-truesdale', 'syrus-truesdale', 'chazz-princeton', 'alexis-rhodes',
  'bastion-misawa', 'chumley-huffington', 'aster-phoenix', 'jesse-anderson', 'dr-vellian-crowler',
  'atticus-rhodes', 'tyranno-hassleberry', 'jim-crocodile-cook', 'axel-brodie', 'adrian-gecko',
  'sartorius-kumar', 'yubel', 'nightshroud', 'yusuke-fujiwara', 'supreme-king-jaden'
];

function getDeckSortWeight(d: CustomDeck): number {
  if (d.characterId) {
    const dmIdx = DM_CHARACTER_ORDER.indexOf(d.characterId);
    if (dmIdx !== -1) return 1000 + dmIdx * 20;
    const gxIdx = GX_CHARACTER_ORDER.indexOf(d.characterId);
    if (gxIdx !== -1) return 2000 + gxIdx * 20;
  }
  if (d.category === 'character-dm' || d.series === 'DM') return 1500;
  if (d.category === 'character-gx' || d.series === 'GX') return 2500;
  if (d.category?.startsWith('popular') || d.id.startsWith('pop-') || d.characterName === 'Community Popular') return 3000;
  return 4000;
}

// Find currently selected deck
const activeDeck = computed(() => {
  return props.decks.find((d) => d.id === props.modelValue) || props.decks[0] || null;
});

// Candidate decks based on active deckFilterCard
const candidateDecks = computed(() => {
  if (!store.deckFilterCard) return props.decks;
  const targetId = store.deckFilterCard.id;
  return props.decks.filter(
    (d) => d.main.includes(targetId) || (d.extra && d.extra.includes(targetId)),
  );
});

// Category counts (dynamically reflects candidateDecks)
const counts = computed(() => {
  let dmCount = 0;
  let gxCount = 0;
  let popCount = 0;
  let customCount = 0;

  for (const d of candidateDecks.value) {
    if (d.category === 'character-dm' || (d.series === 'DM' && d.characterName && d.characterName !== 'Community Popular')) dmCount++;
    else if (d.category === 'character-gx' || (d.series === 'GX' && d.characterName && d.characterName !== 'Community Popular')) gxCount++;
    else if (d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-') || d.characterName === 'Community Popular') popCount++;
    else customCount++;
  }

  return {
    all: candidateDecks.value.length,
    dm: dmCount,
    gx: gxCount,
    popular: popCount,
    custom: customCount,
  };
});

function getInDeckCardMatch(deck: CustomDeck, query: string): { name: string; count: number } | null {
  if (!query.trim()) return null;
  const q = query.toLowerCase().trim();
  for (const cid of [...deck.main, ...(deck.extra || [])]) {
    const detail = store.cardMap.get(cid);
    if (detail && detail.name.toLowerCase().includes(q)) {
      const count = [...deck.main, ...(deck.extra || [])].filter((x) => x === cid).length;
      return { name: detail.name, count };
    }
  }
  return null;
}

// Filtered & grouped deck list based on category & search query
const filteredDecks = computed(() => {
  let list = candidateDecks.value;

  // 1. Filter by category tab
  if (activeCategory.value === 'character-dm') {
    list = list.filter((d) => d.category === 'character-dm' || (d.series === 'DM' && d.characterName && d.characterName !== 'Community Popular'));
  } else if (activeCategory.value === 'character-gx') {
    list = list.filter((d) => d.category === 'character-gx' || (d.series === 'GX' && d.characterName && d.characterName !== 'Community Popular'));
  } else if (activeCategory.value === 'popular') {
    list = list.filter((d) => d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-') || d.characterName === 'Community Popular');
  } else if (activeCategory.value === 'custom') {
    list = list.filter((d) => !d.category || d.category === 'custom' || (!d.category.startsWith('character-') && !d.category.startsWith('popular-') && !d.id.startsWith('pop-') && !d.id.includes('_deck_')));
  }

  // 2. Filter by search query (across deck name, archetype, duelist, AND cards inside deck)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((d) => {
      const name = (d.name || '').toLowerCase();
      const arch = (d.archetype || '').toLowerCase();
      const charName = (d.characterName || '').toLowerCase();
      const series = (d.series || '').toLowerCase();
      const directMatch = name.includes(q) || arch.includes(q) || charName.includes(q) || series.includes(q);
      if (directMatch) return true;
      // In-deck card match
      return getInDeckCardMatch(d, q) !== null;
    });
  }

  // 3. Sort decks contiguously by duelist
  const sorted = [...list].sort((a, b) => {
    const wA = getDeckSortWeight(a);
    const wB = getDeckSortWeight(b);
    if (wA !== wB) return wA - wB;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  return sorted;
});

// Reset highlighted index when filter changes
watch(filteredDecks, () => {
  highlightedIndex.value = 0;
});

function initDropdownFocus(): void {
  const currentIdx = filteredDecks.value.findIndex((d) => d.id === props.modelValue);
  highlightedIndex.value = currentIdx >= 0 ? currentIdx : 0;
  nextTick(() => {
    inputRef.value?.focus();
    scrollHighlightedIntoView(true);
  });
}

function toggleDropdown(): void {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    initDropdownFocus();
  }
}

function openDropdown(): void {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
  searchQuery.value = '';
  initDropdownFocus();
}

function closeDropdown(): void {
  isOpen.value = false;
  searchQuery.value = '';
}

function selectDeck(deck: CustomDeck): void {
  emit('update:modelValue', deck.id);
  emit('select', deck);
  closeDropdown();
}

function onKeyDown(e: KeyboardEvent): void {
  if (!isOpen.value) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
    }
    return;
  }

  const len = filteredDecks.value.length;
  if (len === 0) {
    if (e.key === 'Escape') closeDropdown();
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value + 1) % len;
    scrollHighlightedIntoView(false);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value - 1 + len) % len;
    scrollHighlightedIntoView(false);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const target = filteredDecks.value[highlightedIndex.value];
    if (target) {
      selectDeck(target);
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeDropdown();
  }
}

function scrollHighlightedIntoView(instant = false): void {
  nextTick(() => {
    if (!listContainerRef.value) return;
    const items = listContainerRef.value.querySelectorAll('.deck-autocomplete__item');
    const target = items[highlightedIndex.value] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ block: instant ? 'center' : 'nearest', behavior: instant ? 'auto' : 'smooth' });
    }
  });
}

function getCategoryBadge(deck: CustomDeck): { text: string; classModifier: string } {
  if (deck.category === 'character-dm' || (deck.series === 'DM' && deck.characterName && deck.characterName !== 'Community Popular')) {
    return { text: 'DM HERO', classModifier: 'dm' };
  }
  if (deck.category === 'character-gx' || (deck.series === 'GX' && deck.characterName && deck.characterName !== 'Community Popular')) {
    return { text: 'GX HERO', classModifier: 'gx' };
  }
  if (deck.category === 'popular-dm' || (deck.series === 'DM' && (deck.id.startsWith('pop-') || deck.characterName === 'Community Popular'))) {
    return { text: 'DM META', classModifier: 'pop-dm' };
  }
  if (deck.category === 'popular-gx' || (deck.series === 'GX' && (deck.id.startsWith('pop-') || deck.characterName === 'Community Popular'))) {
    return { text: 'GX META', classModifier: 'pop-gx' };
  }
  return { text: 'CUSTOM', classModifier: 'custom' };
}

function highlightMatch(text: string, query: string): string {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="deck-autocomplete__match">$1</mark>');
}

// Click outside detection
function handleClickOutside(event: MouseEvent): void {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
  <div
    ref="rootRef"
    class="deck-autocomplete"
    :class="{ 'deck-autocomplete--open': isOpen, 'deck-autocomplete--disabled': disabled }"
    @keydown="onKeyDown"
  >
    <!-- Trigger Button / Active Summary Bar -->
    <button
      type="button"
      class="deck-autocomplete__trigger"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <div class="deck-autocomplete__trigger-left">
        <div class="deck-autocomplete__avatar-frame">
          <img
            v-if="activeDeck?.avatar"
            :src="activeDeck.avatar"
            :alt="activeDeck.characterName || activeDeck.name"
            class="deck-autocomplete__avatar-img"
            @error="(e) => ((e.target as HTMLImageElement).src = 'app-resource://characters/avatars/generic.png')"
          />
          <span v-else class="deck-autocomplete__icon" aria-hidden="true">🗂️</span>
        </div>

        <div v-if="activeDeck" class="deck-autocomplete__current-info">
          <span class="deck-autocomplete__current-name">{{ activeDeck.name }}</span>
          <div class="deck-autocomplete__current-sub">
            <span
              v-if="activeDeck.characterName && activeDeck.characterName !== 'Community Popular'"
              class="deck-autocomplete__current-duelist"
            >
              {{ activeDeck.characterName }}
            </span>
            <span
              v-if="activeDeck.archetype"
              class="deck-autocomplete__current-arch"
            >
              {{ activeDeck.archetype }}
            </span>
          </div>
        </div>
        <span v-else class="deck-autocomplete__placeholder">Select a deck...</span>
      </div>

      <div class="deck-autocomplete__trigger-right">
        <span
          v-if="store.deckFilterCard"
          class="deck-autocomplete__active-filter-chip"
          :title="`Filtered by card: ${store.deckFilterCard.name}`"
        >
          🎴 {{ store.deckFilterCard.name }}
        </span>
        <span
          v-if="activeDeck"
          class="deck-autocomplete__badge"
          :class="`deck-autocomplete__badge--${getCategoryBadge(activeDeck).classModifier}`"
        >
          {{ getCategoryBadge(activeDeck).text }}
        </span>
        <span v-if="activeDeck" class="deck-autocomplete__counts-tag">
          {{ activeDeck.main.length }}<span class="dim">/</span>{{ activeDeck.extra?.length || 0 }}
        </span>
        <span class="deck-autocomplete__chevron" :class="{ 'deck-autocomplete__chevron--open': isOpen }">
          ▼
        </span>
      </div>
    </button>

    <!-- Dropdown Panel -->
    <Transition name="deck-dropdown-fade">
      <div v-if="isOpen" class="deck-autocomplete__panel glass-panel glass-panel--elevated">
        <!-- Search Input Bar -->
        <div class="deck-autocomplete__search-row">
          <span class="deck-autocomplete__search-icon" aria-hidden="true">🔍</span>
          <input
            ref="inputRef"
            v-model="searchQuery"
            type="text"
            class="deck-autocomplete__input"
            :placeholder="placeholder"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="deck-autocomplete__clear-btn"
            title="Clear search"
            @click="searchQuery = ''; inputRef?.focus()"
          >
            ✕
          </button>
        </div>

        <!-- Active Card Filter Header Bar -->
        <div v-if="store.deckFilterCard" class="deck-autocomplete__card-filter-bar">
          <div class="card-filter-badge">
            <img
              :src="getCardImageUrl(store.deckFilterCard.id, 'mini')"
              :alt="store.deckFilterCard.name"
              class="filter-card-thumb"
              @error="handleImageError"
            />
            <div class="filter-card-meta">
              <span class="filter-card-label">FILTERED BY CARD:</span>
              <span class="filter-card-name">{{ store.deckFilterCard.name }}</span>
            </div>
          </div>
          <div class="filter-card-right">
            <span class="filter-matches-pill">{{ filteredDecks.length }} Decks</span>
            <button
              type="button"
              class="filter-card-clear-btn"
              title="Clear card filter"
              @click.stop="store.clearDeckFilterCard()"
            >
              ✕ Clear
            </button>
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="deck-autocomplete__tabs" role="tablist">
          <button
            type="button"
            class="deck-autocomplete__tab"
            :class="{ 'deck-autocomplete__tab--active': activeCategory === 'ALL' }"
            role="tab"
            @click="activeCategory = 'ALL'"
          >
            All <span class="deck-autocomplete__tab-count">({{ counts.all }})</span>
          </button>
          <button
            type="button"
            class="deck-autocomplete__tab"
            :class="{ 'deck-autocomplete__tab--active': activeCategory === 'character-dm' }"
            role="tab"
            @click="activeCategory = 'character-dm'"
          >
            DM Duelists <span class="deck-autocomplete__tab-count">({{ counts.dm }})</span>
          </button>
          <button
            type="button"
            class="deck-autocomplete__tab"
            :class="{ 'deck-autocomplete__tab--active': activeCategory === 'character-gx' }"
            role="tab"
            @click="activeCategory = 'character-gx'"
          >
            GX Duelists <span class="deck-autocomplete__tab-count">({{ counts.gx }})</span>
          </button>
          <button
            type="button"
            class="deck-autocomplete__tab"
            :class="{ 'deck-autocomplete__tab--active': activeCategory === 'popular' }"
            role="tab"
            @click="activeCategory = 'popular'"
          >
            Popular <span class="deck-autocomplete__tab-count">({{ counts.popular }})</span>
          </button>
          <button
            type="button"
            class="deck-autocomplete__tab"
            :class="{ 'deck-autocomplete__tab--active': activeCategory === 'custom' }"
            role="tab"
            @click="activeCategory = 'custom'"
          >
            My Custom <span class="deck-autocomplete__tab-count">({{ counts.custom }})</span>
          </button>
        </div>

        <!-- Scrollable Deck List -->
        <div
          ref="listContainerRef"
          class="deck-autocomplete__list custom-scrollbar"
          role="listbox"
        >
          <div
            v-for="(deck, idx) in filteredDecks"
            :key="deck.id"
            class="deck-autocomplete__item"
            :class="{
              'deck-autocomplete__item--selected': deck.id === modelValue,
              'deck-autocomplete__item--highlighted': idx === highlightedIndex,
            }"
            role="option"
            :aria-selected="deck.id === modelValue"
            @mouseenter="highlightedIndex = idx"
            @click="selectDeck(deck)"
          >
            <!-- Left Info with Duelist Face Avatar -->
            <div class="deck-autocomplete__item-left">
              <div class="deck-autocomplete__avatar-frame">
                <img
                  v-if="deck.avatar"
                  :src="deck.avatar"
                  :alt="deck.characterName || deck.name"
                  class="deck-autocomplete__avatar-img"
                  loading="lazy"
                  @error="(e) => ((e.target as HTMLImageElement).src = 'app-resource://characters/avatars/generic.png')"
                />
                <span v-else class="deck-autocomplete__avatar-fallback">🎴</span>
              </div>

              <div class="deck-autocomplete__item-text">
                <div class="deck-autocomplete__item-title-row">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span
                    class="deck-autocomplete__item-name"
                    v-html="highlightMatch(deck.name, searchQuery)"
                  />
                  <span
                    v-if="deck.id === modelValue"
                    class="deck-autocomplete__item-check"
                    title="Current Active Deck"
                  >
                    ✓
                  </span>
                </div>
                <div class="deck-autocomplete__item-sub-row">
                  <span
                    v-if="deck.characterName && deck.characterName !== 'Community Popular'"
                    class="deck-autocomplete__item-duelist-tag"
                  >
                    {{ deck.characterName }}
                  </span>
                  <span
                    v-if="deck.archetype"
                    class="deck-autocomplete__item-archetype"
                    v-html="highlightMatch(deck.archetype, searchQuery)"
                  />
                  <!-- Card Copy Count if Filter Card Active -->
                  <span
                    v-if="store.deckFilterCard"
                    class="deck-autocomplete__card-copies-tag"
                  >
                    ✨ x{{ store.getCardCopyCountInDeck(deck, store.deckFilterCard.id).total }} in Deck
                  </span>
                  <!-- In-deck Search Card Match -->
                  <span
                    v-else-if="getInDeckCardMatch(deck, searchQuery)"
                    class="deck-autocomplete__card-match-sub"
                  >
                    Includes: {{ getInDeckCardMatch(deck, searchQuery)?.name }} (x{{ getInDeckCardMatch(deck, searchQuery)?.count }})
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Badges -->
            <div class="deck-autocomplete__item-right">
              <span
                class="deck-autocomplete__badge"
                :class="`deck-autocomplete__badge--${getCategoryBadge(deck).classModifier}`"
              >
                {{ getCategoryBadge(deck).text }}
              </span>
              <span class="deck-autocomplete__item-count-badge">
                <span class="deck-count-num">{{ deck.main.length }}</span>
                <span class="deck-count-sep">/</span>
                <span class="deck-count-extra">{{ deck.extra?.length || 0 }}</span>
              </span>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredDecks.length === 0" class="deck-autocomplete__empty">
            <span class="deck-autocomplete__empty-icon">🔍</span>
            <p class="deck-autocomplete__empty-text">
              {{ store.deckFilterCard ? `No decks containing "${store.deckFilterCard.name}" match your filters` : `No decks matching "${searchQuery}"` }}
            </p>
            <button
              type="button"
              class="deck-autocomplete__reset-search-btn"
              @click="searchQuery = ''; activeCategory = 'ALL'; store.clearDeckFilterCard()"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
