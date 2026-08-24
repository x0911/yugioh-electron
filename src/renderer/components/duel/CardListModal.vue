<template>
  <YugiModal
    :model-value="modelValue"
    :width="'860px'"
    :accent="owner === 'user' ? 'user' : 'ai'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Custom Modal Header -->
    <template #header>
      <div class="card-list-header">
        <div class="header-left">
          <span class="header-icon">{{ stackIcon }}</span>
          <div class="header-titles">
            <h3 class="header-title">{{ title }}</h3>
            <span class="header-count-badge"
              >{{ cards.length }} {{ cards.length === 1 ? 'Card' : 'Cards' }}</span
            >
          </div>
        </div>
        <div class="header-right">
          <span class="owner-pill" :class="`owner-pill--${owner}`">
            {{ owner === 'user' ? 'PLAYER' : 'OPPONENT' }}
          </span>
        </div>
      </div>
    </template>

    <!-- Modal Content: Scrollable Grid of Cards -->
    <div class="card-list-modal-body">
      <!-- Empty State -->
      <div v-if="cards.length === 0" class="card-list-empty">
        <span class="empty-icon">📭</span>
        <p class="empty-text">No cards currently in this location.</p>
      </div>

      <!-- Card Grid -->
      <div v-else class="card-list-grid">
        <div
          v-for="(card, idx) in enrichedCards"
          :key="card.id || `${card.code}-${idx}`"
          class="card-list-tile"
          :class="[
            `card-list-tile--${owner}`,
            {
              'card-list-tile--facedown':
                card.position === 'facedown_defense' || card.position === 'facedown_spell',
              'card-list-tile--activatable': getCardActions(card).length > 0,
            },
          ]"
          @mouseenter="onMouseEnter(card)"
          @mouseleave="onMouseLeave"
          @click="onCardClick(card)"
        >
          <!-- Activatable Pulsing Aura Badge -->
          <div
            v-if="getCardActions(card).length > 0"
            class="tile-activatable-badge"
          >
            ⚡ READY
          </div>

          <!-- Order Badge (Top of Graveyard is Index 0 or 1) -->
          <div
            v-if="type === 'graveyard'"
            class="tile-order-badge"
            :class="{ 'tile-order-badge--top': idx === 0 }"
          >
            {{ idx === 0 ? 'TOP' : `#${idx + 1}` }}
          </div>
          <div v-else class="tile-order-badge">#{{ idx + 1 }}</div>

          <!-- Card Miniature Artwork -->
          <div class="tile-art-wrapper">
            <img
              :src="getCardImage(card)"
              :alt="card.name"
              class="tile-art-img"
              @error="handleImageError"
            />
            <div class="tile-art-sheen"></div>
          </div>

          <!-- Card Information Metadata -->
          <div class="tile-info">
            <div class="tile-name" :title="card.name">
              {{ card.name }}
            </div>

            <!-- Monster Stats & Level -->
            <div v-if="isMonsterCard(card)" class="tile-stats">
              <div class="tile-meta-header">
                <span v-if="card.level" class="tile-level">⭐ {{ card.level }}</span>
                <span
                  v-if="card.attribute"
                  class="tile-attr"
                  :class="`tile-attr--${card.attribute.toLowerCase()}`"
                >
                  {{ card.attribute }}
                </span>
              </div>
              <div class="tile-combat-stats">
                <span class="stat-atk">{{ formatCombatStat(card.atk) }}</span>
                <span class="stat-def">{{ formatCombatStat(card.def) }}</span>
              </div>
            </div>

            <!-- Spell / Trap Meta -->
            <div v-else class="tile-spell-meta">
              <span
                class="tile-card-type-tag"
                :class="card.attribute === 'TRAP' ? 'tag--trap' : 'tag--spell'"
              >
                {{ card.attribute === 'TRAP' ? 'TRAP' : 'SPELL' }}
              </span>
            </div>

            <!-- Action Button Triggers (e.g. Activate from GY / Banished) -->
            <div v-if="getCardActions(card).length > 0" class="tile-action-row">
              <button
                v-for="act in getCardActions(card)"
                :key="act.type + act.index"
                type="button"
                class="btn-tile-activate"
                :class="`btn-tile-activate--${act.type}`"
                @click.stop="onActionClick(act)"
              >
                <span class="act-icon">{{ act.icon || '⚡' }}</span>
                <span class="act-label">{{ act.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer="{ close }">
      <div class="card-list-footer">
        <button type="button" class="btn-close-viewer" @click="close">
          <span>Close</span>
        </button>
      </div>
    </template>
  </YugiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FieldCard } from '../../../shared/types/field.js';
import { useDuelStore, type CardActionOption } from '../../stores/duelStore.js';
import YugiModal from '../common/YugiModal.vue';
import { getCardImageUrl, getCardBackUrl, handleImageError } from '../../utils/media.js';
import { formatCombatStat } from '../../utils/format.js';
import { parseTrapMonsterStats, isTreatedAsMonster } from '../../../shared/utils/cardStats.js';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    cards: FieldCard[];
    owner?: 'user' | 'ai';
    type?: 'graveyard' | 'extra' | 'banished' | 'deck';
  }>(),
  {
    owner: 'user',
    type: 'graveyard',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'select-card', card: FieldCard): void;
  (e: 'action', action: CardActionOption): void;
}>();

const duelStore = useDuelStore();

function getCardActions(card: FieldCard): CardActionOption[] {
  if (props.owner !== 'user' || !card.code || card.code <= 0) return [];
  return duelStore.getLegalActionsForStackCard(card, props.type);
}

function onActionClick(action: CardActionOption): void {
  emit('action', action);
  emit('update:modelValue', false);
}

const enrichedCards = computed<FieldCard[]>(() => {
  return props.cards.map((card) => {
    if (!card.code || card.code <= 0) return card;
    const detail = duelStore.getCardDetail(card.code);
    if (!detail) return card;

    const isMonsterZone = card.location === 'monster' || card.location === 'extra-monster';
    const isMon = isTreatedAsMonster(card.location, detail.isMonster);

    let atk: number | undefined = undefined;
    let def: number | undefined = undefined;
    let baseAtk: number | undefined = undefined;
    let baseDef: number | undefined = undefined;
    let level: number | undefined = undefined;

    if (isMon) {
      atk = card.atk !== undefined ? card.atk : (detail.isMonster ? detail.atk : undefined);
      def = card.def !== undefined ? card.def : (detail.isMonster ? detail.def : undefined);
      baseAtk = card.baseAtk !== undefined ? card.baseAtk : (detail.isMonster ? detail.atk : undefined);
      baseDef = card.baseDef !== undefined ? card.baseDef : (detail.isMonster ? detail.def : undefined);
      level = card.level !== undefined ? card.level : (detail.isMonster ? detail.level : undefined);

      if (isMonsterZone && (atk === undefined || def === undefined || level === undefined)) {
        const parsed = parseTrapMonsterStats(detail.desc || card.description || '');
        if (atk === undefined) atk = parsed.atk;
        if (def === undefined) def = parsed.def;
        if (baseAtk === undefined) baseAtk = parsed.atk;
        if (baseDef === undefined) baseDef = parsed.def;
        if (level === undefined) level = parsed.level;
      }
    }

    let attribute = isMon ? (card.attribute || (detail.isMonster ? detail.attributeName : undefined)) : detail.attributeName;
    let race = isMon ? (card.race || (detail.isMonster ? detail.raceName : undefined)) : detail.raceName;

    if (isMonsterZone && (!attribute || !race)) {
      const parsed = parseTrapMonsterStats(detail.desc || card.description || '');
      if (!attribute) attribute = parsed.attribute;
      if (!race) race = parsed.race;
    }

    return {
      ...card,
      name:
        card.name && card.name !== 'Card' && !card.name.startsWith('[Card #')
          ? card.name
          : detail.name,
      atk,
      def,
      baseAtk,
      baseDef,
      level,
      attribute,
      race,
      description: card.description || detail.desc,
    };
  });
});

function isMonsterCard(card: FieldCard): boolean {
  if (card.location === 'monster' || card.location === 'extra-monster') return true;
  if (card.location === 'spell-trap' || card.location === 'field') return false;
  if (card.atk !== undefined || card.def !== undefined || (card.level && card.level > 0))
    return true;
  const detail = duelStore.getCardDetail(card.code);
  return detail?.isMonster ?? false;
}

const stackIcon = computed(() => {
  switch (props.type) {
    case 'graveyard':
      return '🪦';
    case 'extra':
      return '⚡';
    case 'banished':
      return '🌀';
    case 'deck':
      return '🎴';
    default:
      return '📜';
  }
});

function getCardImage(card: FieldCard): string {
  if (!card.code || card.code <= 0) {
    return getCardBackUrl();
  }
  return getCardImageUrl(card.code, 'full');
}

function onMouseEnter(card: FieldCard): void {
  emit('hover-card', card);
}

function onMouseLeave(): void {
  emit('hover-card', null);
}

function onCardClick(card: FieldCard): void {
  emit('select-card', card);
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.card-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.header-titles {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.header-title {
  font-family: $font-display;
  font-size: 1.25rem;
  font-weight: 700;
  color: $color-gold-300;
  letter-spacing: 0.05em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  margin: 0;
}

.header-count-badge {
  font-family: $font-mono;
  font-size: 0.85rem;
  font-weight: 600;
  color: $color-gold-500;
  background: rgba(201, 162, 39, 0.15);
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: 4px;
  padding: 0.1rem 0.45rem;
}

.owner-pill {
  font-family: $font-mono;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;

  &--user {
    color: #90cdf4;
    background: rgba(49, 130, 206, 0.25);
    border: 1px solid rgba(49, 130, 206, 0.5);
  }

  &--ai {
    color: #feb2b2;
    background: rgba(229, 62, 62, 0.25);
    border: 1px solid rgba(229, 62, 62, 0.5);
  }
}

.card-list-modal-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 162, 39, 0.3) rgba(0, 0, 0, 0.4);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.3);
    border-radius: 3px;
  }
}

.card-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: $color-text-muted;

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .empty-text {
    font-family: $font-body;
    font-size: 1rem;
    color: $color-text-muted;
  }
}

.card-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 125px));
  justify-content: center;
  gap: 0.75rem;
}

.card-list-tile {
  position: relative;
  background: rgba(18, 22, 28, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.4rem;
  max-width: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    background: rgba(28, 34, 44, 0.95);
    border-color: $color-gold-300;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.7),
      0 0 16px rgba(201, 162, 39, 0.3);

    .tile-art-sheen {
      opacity: 1;
    }
  }

  &--activatable {
    border-color: #f6e05e;
    background: linear-gradient(180deg, rgba(28, 38, 52, 0.95), rgba(35, 45, 20, 0.95));
    box-shadow:
      0 0 15px rgba(236, 201, 75, 0.4),
      0 4px 12px rgba(0, 0, 0, 0.6);
    animation: tile-activate-pulse 2s infinite ease-in-out;

    &:hover {
      border-color: #ecc94b;
      box-shadow:
        0 0 25px rgba(236, 201, 75, 0.7),
        0 8px 24px rgba(0, 0, 0, 0.8);
    }
  }

  &--user:hover {
    border-color: #63b3ed;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.7),
      0 0 16px rgba(66, 153, 225, 0.4);
  }

  &--ai:hover {
    border-color: #fc8181;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.7),
      0 0 16px rgba(245, 101, 101, 0.4);
  }
}

@keyframes tile-activate-pulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(236, 201, 75, 0.35), 0 4px 12px rgba(0, 0, 0, 0.6);
    border-color: rgba(246, 224, 94, 0.8);
  }
  50% {
    box-shadow: 0 0 22px rgba(236, 201, 75, 0.65), 0 6px 16px rgba(0, 0, 0, 0.8);
    border-color: #ecc94b;
  }
}

.tile-activatable-badge {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
  font-family: $font-display;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #111;
  background: linear-gradient(135deg, #f6e05e, #ecc94b);
  border-radius: 3px;
  padding: 0.1rem 0.4rem;
  z-index: 3;
  box-shadow: 0 0 8px rgba(236, 201, 75, 0.8);
  animation: badge-bounce 1.5s infinite ease-in-out;
}

@keyframes badge-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.tile-action-row {
  margin-top: 0.35rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-tile-activate {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.25rem 0.4rem;
  background: linear-gradient(135deg, #d69e2e, #b7791f);
  border: 1px solid #ecc94b;
  border-radius: 4px;
  color: #fff;
  font-family: $font-display;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  transition: all 0.15s ease;

  &:hover {
    transform: scale(1.04);
    background: linear-gradient(135deg, #ecc94b, #d69e2e);
    box-shadow: 0 0 12px rgba(236, 201, 75, 0.7);
  }

  &--sp_summon {
    background: linear-gradient(135deg, #3182ce, #2b6cb0);
    border-color: #63b3ed;

    &:hover {
      background: linear-gradient(135deg, #4299e1, #3182ce);
      box-shadow: 0 0 12px rgba(66, 153, 225, 0.7);
    }
  }

  &--chain {
    background: linear-gradient(135deg, #805ad5, #6b46c1);
    border-color: #b794f4;

    &:hover {
      background: linear-gradient(135deg, #9f7aea, #805ad5);
      box-shadow: 0 0 12px rgba(159, 122, 234, 0.7);
    }
  }

  .act-icon {
    font-size: 0.75rem;
  }

  .act-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.tile-order-badge {
  position: absolute;
  top: 0.35rem;
  left: 0.35rem;
  font-family: $font-mono;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  padding: 0.05rem 0.35rem;
  z-index: 2;

  &--top {
    color: #111;
    background: $color-gold-300;
    border-color: $color-gold-300;
    font-weight: 800;
  }
}

.tile-art-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1.45;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.35rem;
  background: #000;
  border: 1px solid rgba(201, 162, 39, 0.2);
}

.tile-art-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile-art-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.tile-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tile-name {
  font-family: $font-body;
  font-size: 0.75rem;
  font-weight: 600;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.tile-stats {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  font-family: $font-mono;
  font-size: 0.68rem;
}

.tile-meta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tile-level {
  color: #ecc94b;
  font-weight: 600;
}

.tile-attr {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.65rem;

  &--dark {
    color: #b794f4;
  }
  &--light {
    color: #f6e05e;
  }
  &--earth {
    color: #ed8936;
  }
  &--water {
    color: #63b3ed;
  }
  &--fire {
    color: #f56565;
  }
  &--wind {
    color: #48bb78;
  }
  &--divine {
    color: #ecc94b;
  }
}

.tile-combat-stats {
  display: flex;
  justify-content: space-between;
  color: $color-text-secondary;
  font-size: 0.7rem;
  font-weight: 600;

  .stat-atk,
  .stat-def {
    border-radius: 4px;
    padding: 0 4px;
    font-size: 0.9rem;
    line-height: 2;
  }

  .stat-atk {
    color: #feb2b2;
    background-color: rgb(254 178 178 / 10%);
  }
  .stat-def {
    color: #90cdf4;
    background-color: rgb(144 205 244 / 10%);
  }
}

.tile-spell-meta {
  display: flex;
  justify-content: center;
}

.tile-card-type-tag {
  font-family: $font-mono;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  text-transform: uppercase;

  &.tag--spell {
    color: #68d391;
    background: rgba(56, 161, 105, 0.2);
    border: 1px solid rgba(56, 161, 105, 0.4);
  }

  &.tag--trap {
    color: #f687b3;
    background: rgba(213, 63, 140, 0.2);
    border: 1px solid rgba(213, 63, 140, 0.4);
  }
}

.card-list-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.btn-close-viewer {
  font-family: $font-display;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: $color-gold-100;
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  border: 1px solid $color-gold-500;
  border-radius: 4px;
  padding: 0.45rem 1.5rem;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
    border-color: $color-gold-300;
    box-shadow: 0 0 10px rgba(201, 162, 39, 0.4);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
