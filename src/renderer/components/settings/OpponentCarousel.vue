<template>
  <div class="opponent-carousel" tabindex="0" @keydown="handleKeyDown">
    <!-- Series Filter Header -->
    <div class="opponent-carousel__filter-row">
      <div
        class="opponent-carousel__filter-pills"
        role="tablist"
        aria-label="Character Series Filter"
      >
        <button
          type="button"
          class="opponent-carousel__filter-pill"
          :class="{ 'opponent-carousel__filter-pill--active': activeSeries === 'ALL' }"
          role="tab"
          :aria-selected="activeSeries === 'ALL'"
          @click="setFilter('ALL')"
        >
          All Duelists ({{ allCount }})
        </button>
        <button
          type="button"
          class="opponent-carousel__filter-pill opponent-carousel__filter-pill--dm"
          :class="{ 'opponent-carousel__filter-pill--active': activeSeries === 'DM' }"
          role="tab"
          :aria-selected="activeSeries === 'DM'"
          @click="setFilter('DM')"
        >
          Original Series ({{ dmCount }})
        </button>
        <button
          type="button"
          class="opponent-carousel__filter-pill opponent-carousel__filter-pill--gx"
          :class="{ 'opponent-carousel__filter-pill--active': activeSeries === 'GX' }"
          role="tab"
          :aria-selected="activeSeries === 'GX'"
          @click="setFilter('GX')"
        >
          Yu-Gi-Oh! GX ({{ gxCount }})
        </button>
      </div>

      <!-- Arrow Controls -->
      <div class="opponent-carousel__nav-controls">
        <span class="opponent-carousel__count-tag">
          {{ selectedIndex + 1 }} / {{ filteredCharacters.length }}
        </span>
        <button
          type="button"
          class="opponent-carousel__arrow-btn"
          aria-label="Previous character"
          :disabled="filteredCharacters.length <= 1"
          @click="prev"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          type="button"
          class="opponent-carousel__arrow-btn"
          aria-label="Next character"
          :disabled="filteredCharacters.length <= 1"
          @click="next"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Carousel Scroll Track -->
    <div
      ref="trackRef"
      class="opponent-carousel__track"
      role="region"
      aria-label="Character list"
      @wheel.passive="handleWheel"
    >
      <div
        v-for="(char, index) in filteredCharacters"
        :key="char.id"
        :ref="(el) => setCardRef(el, index)"
        class="opponent-carousel__item"
      >
        <CharacterCard
          :character="char"
          :is-selected="char.id === selectedId"
          @select="handleSelect(char.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { CharacterData } from '../../../shared/types/character.js';
import CharacterCard from './CharacterCard.vue';

interface Props {
  characters: CharacterData[];
  selectedId: string;
  seriesFilter?: 'ALL' | 'DM' | 'GX';
}

const props = withDefaults(defineProps<Props>(), {
  seriesFilter: 'ALL',
});

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'update:seriesFilter', filter: 'ALL' | 'DM' | 'GX'): void;
}>();

const activeSeries = ref<'ALL' | 'DM' | 'GX'>(props.seriesFilter);
const trackRef = ref<HTMLElement | null>(null);
const cardElements = ref<HTMLElement[]>([]);

function setCardRef(el: unknown, index: number): void {
  if (el) {
    cardElements.value[index] = el as HTMLElement;
  }
}

const allCount = computed(() => props.characters.length);
const dmCount = computed(() => props.characters.filter((c) => c.series === 'DM').length);
const gxCount = computed(() => props.characters.filter((c) => c.series === 'GX').length);

const filteredCharacters = computed(() => {
  if (activeSeries.value === 'ALL') return props.characters;
  return props.characters.filter((c) => c.series === activeSeries.value);
});

const selectedIndex = computed(() => {
  const idx = filteredCharacters.value.findIndex((c) => c.id === props.selectedId);
  return idx >= 0 ? idx : 0;
});

function setFilter(filter: 'ALL' | 'DM' | 'GX'): void {
  activeSeries.value = filter;
  emit('update:seriesFilter', filter);
  nextTick(() => {
    scrollToSelected();
  });
}

function handleSelect(id: string): void {
  emit('select', id);
}

function scrollToSelected(): void {
  const currentIdx = selectedIndex.value;
  const targetEl = cardElements.value[currentIdx];
  if (targetEl && trackRef.value) {
    targetEl.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }
}

function prev(): void {
  if (filteredCharacters.value.length === 0) return;
  const newIdx =
    (selectedIndex.value - 1 + filteredCharacters.value.length) % filteredCharacters.value.length;
  const target = filteredCharacters.value[newIdx];
  if (target) {
    emit('select', target.id);
  }
}

function next(): void {
  if (filteredCharacters.value.length === 0) return;
  const newIdx = (selectedIndex.value + 1) % filteredCharacters.value.length;
  const target = filteredCharacters.value[newIdx];
  if (target) {
    emit('select', target.id);
  }
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    next();
  } else if (e.key === 'Home') {
    e.preventDefault();
    if (filteredCharacters.value.length > 0) {
      emit('select', filteredCharacters.value[0].id);
    }
  } else if (e.key === 'End') {
    e.preventDefault();
    if (filteredCharacters.value.length > 0) {
      emit('select', filteredCharacters.value[filteredCharacters.value.length - 1].id);
    }
  }
}

function handleWheel(e: WheelEvent): void {
  if (trackRef.value && Math.abs(e.deltaY) > 0) {
    trackRef.value.scrollLeft += e.deltaY;
  }
}

watch(
  () => props.selectedId,
  () => {
    nextTick(() => {
      scrollToSelected();
    });
  },
);
</script>

<style scoped lang="scss">
.opponent-carousel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  outline: none;

  &__filter-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    flex-wrap: wrap;
    gap: 12px;
  }

  &__filter-pills {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__filter-pill {
    font-family: 'Barlow Semi Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #b8b2a0;
    background: rgba(18, 22, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 6px 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: #f5f1e6;
      border-color: rgba(201, 162, 39, 0.4);
      background: rgba(28, 34, 46, 0.7);
    }

    &--active {
      color: #1a1406;
      background: #c9a227;
      border-color: #f4e4b8;
      font-weight: 700;
      box-shadow: 0 0 12px rgba(201, 162, 39, 0.4);
    }

    &--dm.opponent-carousel__filter-pill--active {
      background: #c9a227;
      color: #1a1406;
    }

    &--gx.opponent-carousel__filter-pill--active {
      background: #56ccf2;
      border-color: #b8e2f2;
      color: #0a141e;
      box-shadow: 0 0 12px rgba(86, 204, 242, 0.4);
    }
  }

  &__nav-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__count-tag {
    font-family: 'Oxanium', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #e3c567;
    font-variant-numeric: tabular-nums;
    margin-right: 4px;
  }

  &__arrow-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(18, 22, 30, 0.7);
    border: 1px solid rgba(201, 162, 39, 0.35);
    color: #f4e4b8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover:not(:disabled) {
      background: rgba(201, 162, 39, 0.25);
      border-color: #c9a227;
      transform: scale(1.08);
      box-shadow: 0 0 10px rgba(201, 162, 39, 0.3);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  &__track {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 8px 4px 16px 4px;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: rgba(201, 162, 39, 0.3) rgba(10, 12, 16, 0.5);

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(10, 12, 16, 0.5);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(201, 162, 39, 0.35);
      border-radius: 3px;

      &:hover {
        background: rgba(201, 162, 39, 0.6);
      }
    }
  }

  &__item {
    flex: 0 0 auto;
    scroll-snap-align: center;
  }
}
</style>
