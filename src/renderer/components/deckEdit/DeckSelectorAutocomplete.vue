<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { CustomDeck } from '../../../shared/types/deck.js';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    decks: CustomDeck[];
    disabled?: boolean;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    placeholder: 'Search 80+ decks (e.g. Kaiba, Cyber, Exodia)...',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', deck: CustomDeck): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const activeCategory = ref<'ALL' | 'character-dm' | 'character-gx' | 'popular' | 'custom'>('ALL');
const highlightedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const listContainerRef = ref<HTMLDivElement | null>(null);
const rootRef = ref<HTMLDivElement | null>(null);

// Find currently selected deck
const activeDeck = computed(() => {
  return props.decks.find((d) => d.id === props.modelValue) || props.decks[0] || null;
});

// Category counts
const counts = computed(() => {
  let dmCount = 0;
  let gxCount = 0;
  let popCount = 0;
  let customCount = 0;

  for (const d of props.decks) {
    if (d.category === 'character-dm') dmCount++;
    else if (d.category === 'character-gx') gxCount++;
    else if (d.category === 'popular-dm' || d.category === 'popular-gx' || d.id.startsWith('pop-')) popCount++;
    else customCount++;
  }

  return {
    all: props.decks.length,
    dm: dmCount,
    gx: gxCount,
    popular: popCount,
    custom: customCount,
  };
});

// Filtered deck list based on category & search query
const filteredDecks = computed(() => {
  let list = props.decks;

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

  // 2. Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((d) => {
      const name = (d.name || '').toLowerCase();
      const arch = (d.archetype || '').toLowerCase();
      const charName = (d.characterName || '').toLowerCase();
      const series = (d.series || '').toLowerCase();
      return name.includes(q) || arch.includes(q) || charName.includes(q) || series.includes(q);
    });
  }

  return list;
});

// Reset highlighted index when filter changes
watch(filteredDecks, () => {
  highlightedIndex.value = 0;
});

function toggleDropdown(): void {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = '';
    highlightedIndex.value = 0;
    nextTick(() => {
      inputRef.value?.focus();
      scrollHighlightedIntoView();
    });
  }
}

function openDropdown(): void {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
  searchQuery.value = '';
  highlightedIndex.value = 0;
  nextTick(() => {
    inputRef.value?.focus();
    scrollHighlightedIntoView();
  });
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
    scrollHighlightedIntoView();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIndex.value = (highlightedIndex.value - 1 + len) % len;
    scrollHighlightedIntoView();
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

function scrollHighlightedIntoView(): void {
  nextTick(() => {
    if (!listContainerRef.value) return;
    const items = listContainerRef.value.querySelectorAll('.deck-autocomplete__item');
    const target = items[highlightedIndex.value] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
        <span class="deck-autocomplete__icon" aria-hidden="true">🗂️</span>
        <div v-if="activeDeck" class="deck-autocomplete__current-info">
          <span class="deck-autocomplete__current-name">{{ activeDeck.name }}</span>
          <span
            v-if="activeDeck.archetype"
            class="deck-autocomplete__current-arch"
          >
            {{ activeDeck.archetype }}
          </span>
        </div>
        <span v-else class="deck-autocomplete__placeholder">Select a deck...</span>
      </div>

      <div class="deck-autocomplete__trigger-right">
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
            <!-- Left Info -->
            <div class="deck-autocomplete__item-left">
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
                  v-if="deck.archetype"
                  class="deck-autocomplete__item-archetype"
                  v-html="highlightMatch(deck.archetype, searchQuery)"
                />
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
            <p class="deck-autocomplete__empty-text">No decks matching "{{ searchQuery }}"</p>
            <button
              type="button"
              class="deck-autocomplete__reset-search-btn"
              @click="searchQuery = ''; activeCategory = 'ALL'"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
