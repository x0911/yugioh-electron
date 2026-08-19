<template>
  <div class="card-filter-bar glass-panel">
    <!-- Top Search and Primary Kind / Era Tabs -->
    <div class="filter-top-row">
      <!-- Search Input -->
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by card name or effect text..."
          @input="onSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search-btn"
          title="Clear search"
          @click="clearSearch"
        >
          ✕
        </button>
      </div>

      <!-- Era Tabs -->
      <div class="era-group">
        <button
          type="button"
          class="era-btn"
          :class="{ 'era-btn--active': store.filters.era === 'ALL' }"
          @click="store.setFilter('era', 'ALL')"
        >
          All Eras
        </button>
        <button
          type="button"
          class="era-btn era-btn--dm"
          :class="{ 'era-btn--active': store.filters.era === 'DM' }"
          @click="store.setFilter('era', 'DM')"
        >
          DM
        </button>
        <button
          type="button"
          class="era-btn era-btn--gx"
          :class="{ 'era-btn--active': store.filters.era === 'GX' }"
          @click="store.setFilter('era', 'GX')"
        >
          GX
        </button>
      </div>

      <!-- Advanced Toggle -->
      <button
        type="button"
        class="advanced-toggle-btn"
        :class="{ 'advanced-toggle-btn--active': showAdvanced }"
        @click="showAdvanced = !showAdvanced"
      >
        <span class="toggle-icon">⚙️</span>
        <span class="toggle-text">{{ showAdvanced ? 'Hide Filters' : 'More Filters' }}</span>
        <span v-if="activeFilterCount > 0" class="active-badge">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- Kind Categories Tabs -->
    <div class="filter-kinds-row">
      <button
        v-for="tab in kindTabs"
        :key="tab.value"
        type="button"
        class="kind-tab"
        :class="{ 'kind-tab--active': store.filters.kind === tab.value }"
        @click="store.setFilter('kind', tab.value)"
      >
        <span class="kind-label">{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="kind-count">{{ tab.count }}</span>
      </button>

      <!-- Match Results Count Pill -->
      <div class="results-count-pill">
        <span class="count-highlight">{{ store.filteredCards.length }}</span>
        <span class="count-total">/ {{ store.cardPool.length }} Cards</span>
      </div>
    </div>

    <!-- Advanced Filter Controls (Collapsible) -->
    <transition name="expand">
      <div v-if="showAdvanced" class="advanced-filters-panel">
        <div class="advanced-grid">
          <!-- Card Subtype -->
          <div class="filter-field">
            <label class="field-label">Sub-Type</label>
            <select
              :value="store.filters.subType"
              class="field-select"
              @change="onSubTypeChange"
            >
              <option value="ALL">All Sub-Types</option>
              <option value="NORMAL">Normal</option>
              <option value="EFFECT">Effect</option>
              <option value="FUSION">Fusion</option>
              <option value="RITUAL">Ritual</option>
              <option value="QUICKPLAY">Quick-Play (Spell)</option>
              <option value="CONTINUOUS">Continuous</option>
              <option value="EQUIP">Equip (Spell)</option>
              <option value="FIELD">Field (Spell)</option>
              <option value="COUNTER">Counter (Trap)</option>
              <option value="FLIP">Flip Effect</option>
              <option value="TOON">Toon</option>
              <option value="SPIRIT">Spirit</option>
              <option value="UNION">Union</option>
              <option value="GEMINI">Gemini</option>
            </select>
          </div>

          <!-- Attribute -->
          <div class="filter-field">
            <label class="field-label">Attribute</label>
            <select
              :value="store.filters.attribute"
              class="field-select"
              @change="onAttributeChange"
            >
              <option :value="0">All Attributes</option>
              <option :value="0x20">DARK</option>
              <option :value="0x10">LIGHT</option>
              <option :value="0x1">EARTH</option>
              <option :value="0x2">WATER</option>
              <option :value="0x4">FIRE</option>
              <option :value="0x8">WIND</option>
              <option :value="0x40">DIVINE</option>
            </select>
          </div>

          <!-- Monster Race -->
          <div class="filter-field">
            <label class="field-label">Monster Race</label>
            <select
              :value="store.filters.race"
              class="field-select"
              @change="onRaceChange"
            >
              <option :value="0">All Monster Types</option>
              <option v-for="(name, bit) in raceOptions" :key="bit" :value="Number(bit)">
                {{ name }}
              </option>
            </select>
          </div>

          <!-- Level / Rank -->
          <div class="filter-field">
            <label class="field-label">Level / Rank</label>
            <select
              :value="store.filters.level"
              class="field-select"
              @change="onLevelChange"
            >
              <option :value="0">All Levels</option>
              <option v-for="lvl in 12" :key="lvl" :value="lvl">★ {{ lvl }}</option>
            </select>
          </div>

          <!-- ATK Range -->
          <div class="filter-field filter-field--range">
            <label class="field-label">ATK Range</label>
            <div class="range-inputs">
              <input
                type="number"
                placeholder="Min"
                :value="store.filters.minAtk ?? ''"
                class="range-input"
                @input="onMinAtkInput"
              />
              <span class="range-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                :value="store.filters.maxAtk ?? ''"
                class="range-input"
                @input="onMaxAtkInput"
              />
            </div>
          </div>

          <!-- DEF Range -->
          <div class="filter-field filter-field--range">
            <label class="field-label">DEF Range</label>
            <div class="range-inputs">
              <input
                type="number"
                placeholder="Min"
                :value="store.filters.minDef ?? ''"
                class="range-input"
                @input="onMinDefInput"
              />
              <span class="range-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                :value="store.filters.maxDef ?? ''"
                class="range-input"
                @input="onMaxDefInput"
              />
            </div>
          </div>

          <!-- Sort By -->
          <div class="filter-field">
            <label class="field-label">Sort By</label>
            <div class="sort-controls">
              <select
                :value="store.filters.sortBy"
                class="field-select sort-select"
                @change="onSortByChange"
              >
                <option value="name">Name</option>
                <option value="atk">ATK</option>
                <option value="def">DEF</option>
                <option value="level">Level</option>
                <option value="type">Type</option>
                <option value="id">Card ID</option>
              </select>
              <button
                type="button"
                class="sort-dir-btn"
                :title="store.filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'"
                @click="toggleSortOrder"
              >
                {{ store.filters.sortOrder === 'asc' ? '▲ ASC' : '▼ DESC' }}
              </button>
            </div>
          </div>

          <!-- Reset CTA -->
          <div class="filter-field filter-field--actions">
            <label class="field-label">&nbsp;</label>
            <button
              type="button"
              class="reset-filters-btn"
              title="Reset all filters to defaults"
              @click="store.resetFilters"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDeckEditStore } from '../../stores/deckEditStore.js';
import type { CardKindFilter, CardSortBy } from '../../../shared/types/card.js';
import { RACE_NAME_MAP } from '../../../shared/types/card.js';

const store = useDeckEditStore();

const searchQuery = ref(store.filters.query);
const showAdvanced = ref(false);

const raceOptions = RACE_NAME_MAP;

const kindTabs = computed<{ label: string; value: CardKindFilter; count?: number }[]>(() => {
  return [
    { label: 'All Cards', value: 'ALL' },
    { label: 'Monsters', value: 'MONSTER' },
    { label: 'Spells', value: 'SPELL' },
    { label: 'Traps', value: 'TRAP' },
    { label: 'Extra (Fusion)', value: 'EXTRA' },
  ];
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (store.filters.subType !== 'ALL') count++;
  if (store.filters.attribute > 0) count++;
  if (store.filters.race > 0) count++;
  if (store.filters.level > 0) count++;
  if (store.filters.minAtk !== null) count++;
  if (store.filters.maxAtk !== null) count++;
  if (store.filters.minDef !== null) count++;
  if (store.filters.maxDef !== null) count++;
  return count;
});

function onSearchInput(): void {
  store.setFilter('query', searchQuery.value);
}

function clearSearch(): void {
  searchQuery.value = '';
  store.setFilter('query', '');
}

function onSubTypeChange(e: Event): void {
  const val = (e.target as HTMLSelectElement).value;
  store.setFilter('subType', val);
}

function onAttributeChange(e: Event): void {
  const val = Number((e.target as HTMLSelectElement).value);
  store.setFilter('attribute', val);
}

function onRaceChange(e: Event): void {
  const val = Number((e.target as HTMLSelectElement).value);
  store.setFilter('race', val);
}

function onLevelChange(e: Event): void {
  const val = Number((e.target as HTMLSelectElement).value);
  store.setFilter('level', val);
}

function onMinAtkInput(e: Event): void {
  const val = (e.target as HTMLInputElement).value;
  store.setFilter('minAtk', val === '' ? null : Number(val));
}

function onMaxAtkInput(e: Event): void {
  const val = (e.target as HTMLInputElement).value;
  store.setFilter('maxAtk', val === '' ? null : Number(val));
}

function onMinDefInput(e: Event): void {
  const val = (e.target as HTMLInputElement).value;
  store.setFilter('minDef', val === '' ? null : Number(val));
}

function onMaxDefInput(e: Event): void {
  const val = (e.target as HTMLInputElement).value;
  store.setFilter('maxDef', val === '' ? null : Number(val));
}

function onSortByChange(e: Event): void {
  const val = (e.target as HTMLSelectElement).value as CardSortBy;
  store.setFilter('sortBy', val);
}

function toggleSortOrder(): void {
  store.setFilter('sortOrder', store.filters.sortOrder === 'asc' ? 'desc' : 'asc');
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.card-filter-bar {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding: $space-3;
  background: rgba(14, 18, 26, 0.75);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 12px;
  box-sizing: border-box;
}

.filter-top-row {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 0.9rem;
  color: $color-text-muted;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 38px;
  padding: 0 34px 0 36px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 6px;
  font-family: $font-family-body;
  font-size: 0.92rem;
  color: $color-text-primary;
  outline: none;
  transition: all 180ms ease;

  &:focus {
    border-color: $color-gold-500;
    box-shadow: 0 0 8px rgba(201, 162, 39, 0.35);
    background: rgba(0, 0, 0, 0.65);
  }

  &::placeholder {
    color: $color-text-muted;
    font-size: 0.85rem;
  }
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: $color-text-secondary;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
  }
}

.era-group {
  display: flex;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 6px;
  padding: 2px;
}

.era-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  font-family: $font-family-display;
  font-size: 0.78rem;
  font-weight: 700;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all 150ms ease;

  &:hover {
    color: $color-text-primary;
  }

  &--active {
    background: rgba(201, 162, 39, 0.3);
    color: $color-gold-100;
    box-shadow: 0 0 6px rgba(201, 162, 39, 0.3);
  }

  &--dm.era-btn--active {
    background: rgba(201, 162, 39, 0.35);
    color: $color-gold-100;
  }

  &--gx.era-btn--active {
    background: rgba(86, 204, 242, 0.3);
    color: #a4e5fb;
  }
}

.advanced-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 6px;
  font-family: $font-family-display;
  font-size: 0.8rem;
  font-weight: 700;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all 180ms ease;

  &:hover,
  &--active {
    background: rgba(201, 162, 39, 0.2);
    border-color: $color-gold-500;
    color: $color-gold-100;
  }
}

.active-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: $color-gold-500;
  color: #12161e;
  font-size: 0.7rem;
  font-weight: 800;
}

.filter-kinds-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-2;
  overflow-x: auto;
  padding-bottom: 2px;
}

.kind-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-family: $font-family-display;
  font-size: 0.82rem;
  font-weight: 700;
  color: $color-text-secondary;
  cursor: pointer;
  transition: all 180ms ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: $color-text-primary;
  }

  &--active {
    background: linear-gradient(180deg, rgba(201, 162, 39, 0.35) 0%, rgba(140, 110, 22, 0.4) 100%);
    border-color: $color-gold-500;
    color: $color-gold-100;
    box-shadow: 0 0 8px rgba(201, 162, 39, 0.3);
  }
}

.results-count-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(201, 162, 39, 0.2);
  border-radius: 14px;
  font-size: 0.78rem;
  margin-left: auto;
  white-space: nowrap;
}

.count-highlight {
  font-family: $font-family-numeric;
  font-weight: 700;
  color: $color-gold-300;
}

.count-total {
  color: $color-text-muted;
}

.advanced-filters-panel {
  padding-top: $space-2;
  border-top: 1px solid rgba(201, 162, 39, 0.18);
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: $space-2;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &--range {
    min-width: 140px;
  }

  &--actions {
    justify-content: flex-end;
  }
}

.field-label {
  font-family: $font-family-display;
  font-size: 0.72rem;
  font-weight: 600;
  color: $color-text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-select {
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 4px;
  font-family: $font-family-body;
  font-size: 0.82rem;
  color: $color-text-primary;
  padding: 0 8px;
  outline: none;

  &:focus {
    border-color: $color-gold-500;
  }

  option {
    background: #12161e;
    color: $color-text-primary;
  }
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.range-input {
  width: 100%;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 4px;
  font-family: $font-family-numeric;
  font-size: 0.82rem;
  color: $color-text-primary;
  padding: 0 6px;
  outline: none;

  &:focus {
    border-color: $color-gold-500;
  }

  &::placeholder {
    color: $color-text-muted;
  }
}

.range-separator {
  color: $color-text-muted;
  font-size: 0.8rem;
}

.sort-controls {
  display: flex;
  gap: 4px;
}

.sort-select {
  flex: 1;
}

.sort-dir-btn {
  height: 32px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(201, 162, 39, 0.25);
  border-radius: 4px;
  font-family: $font-family-display;
  font-size: 0.72rem;
  font-weight: 700;
  color: $color-gold-300;
  cursor: pointer;

  &:hover {
    background: rgba(201, 162, 39, 0.2);
  }
}

.reset-filters-btn {
  height: 32px;
  padding: 0 10px;
  background: rgba(235, 87, 87, 0.12);
  border: 1px solid rgba(235, 87, 87, 0.35);
  border-radius: 4px;
  font-family: $font-family-display;
  font-size: 0.75rem;
  font-weight: 700;
  color: #f7a8a8;
  cursor: pointer;
  transition: all 180ms ease;

  &:hover {
    background: rgba(235, 87, 87, 0.25);
    border-color: $color-danger;
    color: #fff;
  }
}

// Expand animation
.expand-enter-active,
.expand-leave-active {
  transition: all 220ms ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}
</style>
