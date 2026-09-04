<template>
  <div v-if="hasActivePrompt" class="prompt-modal-backdrop" @click.self="handleBackdropClick">
    <div
      class="prompt-modal"
      :class="[
        `prompt-modal--${activePromptType}`,
        { 'prompt-modal--forced': isForcedPrompt }
      ]"
    >
      <!-- Ambient Glow Orb -->
      <div class="prompt-modal__ambient-glow" />

      <!-- Corner Rune Accents -->
      <div class="modal-corner modal-corner--tl"></div>
      <div class="modal-corner modal-corner--tr"></div>
      <div class="modal-corner modal-corner--bl"></div>
      <div class="modal-corner modal-corner--br"></div>

      <!-- ================================================================= -->
      <!-- 1. BATTLE POSITION PROMPT -->
      <!-- ================================================================= -->
      <template v-if="selectPosition">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--battle">
              <span class="badge-icon">⚔️</span>
              <span class="badge-label">BATTLE STANCE</span>
            </div>
            <button
              type="button"
              class="prompt-header__observe-btn"
              title="Temporarily minimize prompt to observe field and cards"
              @click="$emit('observe-field')"
            >
              <span class="btn-icon">👁️</span>
              <span>Observe Field</span>
            </button>
          </div>
          <h3 class="prompt-header__title">Select Battle Position</h3>
          <p class="prompt-header__subtitle">
            Choose the tactical combat stance for <strong class="highlight-text">{{ selectPosition.cardName || 'your monster' }}</strong>.
          </p>
        </div>

        <div class="position-showcase">
          <!-- Attack Position Option -->
          <button
            v-if="selectPosition.positions.includes(1)"
            type="button"
            class="stance-card stance-card--atk"
            @mouseenter="onCardHoverByCode(selectPosition.code)"
            @mouseleave="onCardHoverByCode(null)"
            @click="$emit('select-position', 1)"
          >
            <div class="stance-card__preview">
              <div class="stance-card__art stance-card__art--vertical">
                <img
                  :src="getCardImageUrl(selectPosition.code, 'mini')"
                  :alt="selectPosition.cardName || 'Monster'"
                  class="stance-img"
                  @error="handleArtFallback"
                />
                <div class="stance-sheen" />
              </div>
              <div class="stance-aura stance-aura--atk" />
            </div>
            <div class="stance-card__info">
              <div class="stance-card__type">
                <span class="stance-icon">⚔️</span>
                <span class="stance-name">ATTACK POSITION</span>
              </div>
              <span class="stance-desc">Face-up upright orientation. Ready to attack or defend in combat.</span>
            </div>
            <div class="stance-card__glow-border" />
          </button>

          <!-- Defense Position Option -->
          <button
            v-if="selectPosition.positions.includes(2)"
            type="button"
            class="stance-card stance-card--def"
            @mouseenter="onCardHoverByCode(selectPosition.code)"
            @mouseleave="onCardHoverByCode(null)"
            @click="$emit('select-position', 2)"
          >
            <div class="stance-card__preview">
              <div class="stance-card__art stance-card__art--horizontal">
                <img
                  :src="getCardImageUrl(selectPosition.code, 'mini')"
                  :alt="selectPosition.cardName || 'Monster'"
                  class="stance-img"
                  @error="handleArtFallback"
                />
                <div class="stance-sheen" />
              </div>
              <div class="stance-aura stance-aura--def" />
            </div>
            <div class="stance-card__info">
              <div class="stance-card__type">
                <span class="stance-icon">🛡️</span>
                <span class="stance-name">DEFENSE POSITION</span>
              </div>
              <span class="stance-desc">Face-up horizontal orientation. Defends Life Points against attacks.</span>
            </div>
            <div class="stance-card__glow-border" />
          </button>

          <!-- Set (Face-Down DEF) Option -->
          <button
            v-if="selectPosition.positions.includes(4)"
            type="button"
            class="stance-card stance-card--set"
            @click="$emit('select-position', 4)"
          >
            <div class="stance-card__preview">
              <div class="stance-card__art stance-card__art--horizontal">
                <img
                  :src="getCardBackUrl()"
                  alt="Card Back"
                  class="stance-img"
                />
                <div class="stance-sheen" />
              </div>
              <div class="stance-aura stance-aura--set" />
            </div>
            <div class="stance-card__info">
              <div class="stance-card__type">
                <span class="stance-icon">🃏</span>
                <span class="stance-name">SET (FACE-DOWN DEF)</span>
              </div>
              <span class="stance-desc">Placed face-down in defense. Conceals stats and effects from opponent.</span>
            </div>
            <div class="stance-card__glow-border" />
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 2. CHAIN WINDOW OPPORTUNITY PROMPT -->
      <!-- ================================================================= -->
      <template v-else-if="selectChain">
        <div class="prompt-header" :class="{ 'prompt-header--forced': selectChain.forced }">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--chain">
              <span class="badge-icon">⛓️</span>
              <span class="badge-label">{{ selectChain.forced ? 'MANDATORY CHAIN TRIGGER' : 'CHAIN OPPORTUNITY' }}</span>
            </div>
            <button
              type="button"
              class="prompt-header__observe-btn"
              title="Temporarily minimize prompt to observe field and cards"
              @click="$emit('observe-field')"
            >
              <span class="btn-icon">👁️</span>
              <span>Observe Field</span>
            </button>
          </div>
          <h3 class="prompt-header__title">
            {{ selectChain.forced ? 'Mandatory Effect Activation' : 'Chain Window Opportunity' }}
          </h3>
          <p class="prompt-header__subtitle">
            <template v-if="selectChain.forced">
              A mandatory card effect has met its activation condition and must be resolved.
            </template>
            <template v-else>
              Do you wish to activate a Spell, Trap, or Monster quick effect in response?
            </template>
          </p>
        </div>

        <!-- Available Chain Trigger Cards -->
        <div class="chain-cards-container">
          <div
            v-for="(chain, idx) in selectChain.selects"
            :key="`chain-${idx}-${chain.code}`"
            class="chain-card-entry"
            @mouseenter="onCardHoverByCode(chain.code)"
            @mouseleave="onCardHoverByCode(null)"
            @click="$emit('select-chain', idx)"
          >
            <!-- Card Thumbnail with Rarity Frame -->
            <div class="chain-card-entry__art-wrapper">
              <img
                :src="getCardImageUrl(chain.code, 'mini')"
                :alt="chain.cardName || 'Card'"
                class="chain-card-entry__art-img"
                @error="handleArtFallback"
              />
              <div class="chain-card-entry__art-sheen" />
            </div>

            <!-- Card Metadata & Effect Details -->
            <div class="chain-card-entry__meta">
              <div class="chain-card-entry__title-row">
                <span class="chain-card-entry__name">{{ chain.cardName || 'Active Card' }}</span>
              </div>
              <div v-if="chain.description" class="chain-card-entry__desc-box">
                <span class="desc-quote-icon">💬</span>
                <span class="desc-content">{{ chain.description }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <button type="button" class="chain-activate-btn">
              <span class="btn-pulse" />
              <span class="btn-text">⚡ ACTIVATE</span>
            </button>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="prompt-footer">
          <button
            v-if="!selectChain.forced"
            type="button"
            class="action-btn action-btn--mute-phase"
            title="Pass priority and mute all non-forced chain prompts for the remainder of this phase"
            @click="$emit('mute-phase')"
          >
            <span class="btn-icon">🔇</span>
            <span>Mute for this Phase</span>
          </button>
          <button
            v-if="!selectChain.forced"
            type="button"
            class="action-btn action-btn--pass"
            @click="$emit('select-chain', null)"
          >
            <span class="btn-icon">✕</span>
            <span>Pass Priority (Don't Chain)</span>
            <span class="btn-key-hint">ESC</span>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 3. OPTIONAL EFFECT / DIRECT ATTACK / YES-NO PROMPT -->
      <!-- ================================================================= -->
      <template v-else-if="selectEffectYn">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div
              class="prompt-header__badge"
              :class="selectEffectYn.isDirectAttack || selectEffectYn.isReplay ? 'prompt-header__badge--battle' : 'prompt-header__badge--effect'"
            >
              <span class="badge-icon">{{ selectEffectYn.badgeIcon || (selectEffectYn.isDirectAttack ? '⚔️' : '✨') }}</span>
              <span class="badge-label">{{ selectEffectYn.badgeLabel || (selectEffectYn.isDirectAttack ? 'DIRECT ATTACK CHOICE' : 'CARD EFFECT TRIGGER') }}</span>
            </div>
            <button
              type="button"
              class="prompt-header__observe-btn"
              title="Temporarily minimize prompt to observe field and cards"
              @click="$emit('observe-field')"
            >
              <span class="btn-icon">👁️</span>
              <span>Observe Field</span>
            </button>
          </div>
          <h3 class="prompt-header__title">
            {{ selectEffectYn.promptTitle || (selectEffectYn.isDirectAttack ? 'Declare Direct Attack' : 'Optional Card Effect') }}
          </h3>
          <p class="prompt-header__subtitle">
            <template v-if="selectEffectYn.isDirectAttack">
              Do you wish to declare a direct attack on opponent Life Points with <strong class="highlight-text">{{ effectiveCardName || 'your monster' }}</strong>?
            </template>
            <template v-else-if="selectEffectYn.isReplay">
              A battle replay occurred. Do you want to continue the attack with <strong class="highlight-text">{{ effectiveCardName || 'your monster' }}</strong>?
            </template>
            <template v-else-if="effectiveCardName">
              Do you wish to activate the effect of <strong class="highlight-text">{{ effectiveCardName }}</strong>?
            </template>
            <template v-else>
              Do you wish to proceed with this action?
            </template>
          </p>
        </div>

        <!-- Spotlight Card Presentation -->
        <div
          class="effect-spotlight"
          @mouseenter="onCardHoverByCode(effectiveCardCode)"
          @mouseleave="onCardHoverByCode(null)"
        >
          <div v-if="effectiveCardCode && effectiveCardCode > 0" class="effect-spotlight__card">
            <img
              :src="getCardImageUrl(effectiveCardCode, 'mini')"
              :alt="effectiveCardName || 'Card'"
              class="spotlight-img"
              @error="handleArtFallback"
            />
            <div class="spotlight-sheen" />
          </div>
          <div v-else class="effect-spotlight__icon-card" :class="{ 'effect-spotlight__icon-card--battle': selectEffectYn.isDirectAttack }">
            <span class="spotlight-fallback-icon">{{ selectEffectYn.isDirectAttack ? '⚔️' : '✨' }}</span>
          </div>

          <div class="effect-spotlight__content">
            <div v-if="effectiveCardName" class="effect-spotlight__meta-row">
              <span class="spotlight-card-name">{{ effectiveCardName }}</span>
              <span v-if="effectiveCardDetail?.isMonster" class="spotlight-stats-badge">
                ⚔️ {{ effectiveCardDetail.atk }} / 🛡️ {{ effectiveCardDetail.def }}
              </span>
              <span v-else-if="effectiveCardDetail" class="spotlight-stats-badge">
                {{ effectiveCardDetail.typeLabels.join(' • ') }}
              </span>
            </div>
            <div v-if="resolvedEffectDescription" class="effect-spotlight__desc">
              <span class="desc-quote-icon">💬</span>
              <p class="desc-text">{{ resolvedEffectDescription }}</p>
            </div>
          </div>
        </div>

        <div class="prompt-footer prompt-footer--center">
          <button type="button" class="action-btn action-btn--secondary" @click="$emit('select-effect-yn', false)">
            <span class="btn-icon">✕</span>
            <span>{{ selectEffectYn.noText || (selectEffectYn.isDirectAttack ? 'Attack Opponent Monster' : 'No, Decline') }}</span>
          </button>
          <button type="button" class="action-btn action-btn--confirm-emerald" @click="$emit('select-effect-yn', true)">
            <span class="btn-icon">✓</span>
            <span>{{ selectEffectYn.yesText || (selectEffectYn.isDirectAttack ? 'Attack Directly' : 'Yes, Activate Effect') }}</span>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 4. MULTI-OPTION SELECTION PROMPT -->
      <!-- ================================================================= -->
      <template v-else-if="selectOption">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--option">
              <span class="badge-icon">📋</span>
              <span class="badge-label">TACTICAL CHOICE</span>
            </div>
            <button
              type="button"
              class="prompt-header__observe-btn"
              title="Temporarily minimize prompt to observe field and cards"
              @click="$emit('observe-field')"
            >
              <span class="btn-icon">👁️</span>
              <span>Observe Field</span>
            </button>
          </div>
          <h3 class="prompt-header__title">Choose an Effect Option</h3>
          <p class="prompt-header__subtitle">Select one of the following activation modes to resolve this card.</p>
        </div>

        <div class="option-choices-list">
          <button
            v-for="(opt, idx) in selectOption.options"
            :key="`opt-${idx}`"
            type="button"
            class="option-choice-item"
            @click="$emit('select-option', idx)"
          >
            <div class="option-choice-item__num">{{ toRomanNumeral(idx + 1) }}</div>
            <div class="option-choice-item__text">{{ opt }}</div>
            <div class="option-choice-item__arrow">➔</div>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 5. CARD DECLARATION PROMPT (ANNOUNCE_CARD e.g. Great Phantom Thief) -->
      <!-- ================================================================= -->
      <template v-else-if="announceCard">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--announce">
              <span class="badge-icon">👁️</span>
              <span class="badge-label">CARD DECLARATION</span>
            </div>
            <button
              type="button"
              class="prompt-header__observe-btn"
              title="Temporarily minimize prompt to observe field and cards"
              @click="$emit('observe-field')"
            >
              <span class="btn-icon">👁️</span>
              <span>Observe Field</span>
            </button>
          </div>
          <h3 class="prompt-header__title">Declare a Card Name</h3>
          <p class="prompt-header__subtitle">
            Search or select any legal card to declare for this effect's resolution.
          </p>
        </div>

        <div class="card-declare-container">
          <!-- Search Input -->
          <div class="card-search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="cardSearchQuery"
              type="text"
              class="card-search-input"
              placeholder="Type card name (e.g. Dark Magician, MST, Raigeki)..."
              autofocus
            />
            <button
              v-if="cardSearchQuery"
              type="button"
              class="clear-search-btn"
              @click="cardSearchQuery = ''"
            >
              ✕
            </button>
          </div>

          <!-- Quick Staples Chips -->
          <div class="quick-staples-row">
            <span class="staples-label">Popular:</span>
            <button
              v-for="staple in stapleCards"
              :key="staple.code"
              type="button"
              class="staple-chip"
              :class="{ 'staple-chip--selected': selectedDeclaredCode === staple.code }"
              @mouseenter="onCardHoverByCode(staple.code)"
              @mouseleave="onCardHoverByCode(null)"
              @click="selectDeclaredCard(staple.code)"
            >
              {{ staple.name }}
            </button>
          </div>

          <!-- Filtered Candidates List -->
          <div class="declare-results-list">
            <div
              v-for="card in filteredDeclaredCards.slice(0, 50)"
              :key="`dec-${card.id}`"
              class="declare-card-item"
              :class="{ 'declare-card-item--selected': selectedDeclaredCode === (card.code || card.id) }"
              @mouseenter="onCardHoverByCode(card.code || card.id)"
              @mouseleave="onCardHoverByCode(null)"
              @click="selectDeclaredCard(card.code || card.id)"
            >
              <div class="declare-card-item__art">
                <img
                  :src="getCardImageUrl(card.code || card.id, 'mini')"
                  :alt="card.name"
                  class="declare-art-img"
                  @error="handleArtFallback"
                />
              </div>
              <div class="declare-card-item__info">
                <span class="declare-card-item__name">{{ card.name }}</span>
                <span class="declare-card-item__type">
                  {{ card.isMonster ? `Monster ★${card.level} • ${card.attributeName || ''} • ${card.raceName || ''}` : card.isSpell ? 'Spell Card' : 'Trap Card' }}
                </span>
              </div>
              <div v-if="selectedDeclaredCode === (card.code || card.id)" class="declare-card-item__check">✓</div>
            </div>

            <div v-if="filteredDeclaredCards.length === 0" class="declare-empty">
              No matching cards found for "{{ cardSearchQuery }}".
            </div>
          </div>
        </div>

        <div class="prompt-footer prompt-footer--center">
          <button
            type="button"
            class="action-btn action-btn--confirm-emerald"
            :disabled="!selectedDeclaredCode"
            @click="confirmCardDeclaration"
          >
            <span class="btn-icon">📢</span>
            <span>Declare {{ getDeclaredCardName() }}</span>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 6. ATTRIBUTE ANNOUNCEMENT PROMPT (ANNOUNCE_ATTRIB) -->
      <!-- ================================================================= -->
      <template v-else-if="announceAttrib">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--announce">
              <span class="badge-icon">🔮</span>
              <span class="badge-label">ATTRIBUTE DECLARATION</span>
            </div>
            <button
              type="button"
              class="prompt-header__observe-btn"
              title="Temporarily minimize prompt to observe field and cards"
              @click="$emit('observe-field')"
            >
              <span class="btn-icon">👁️</span>
              <span>Observe Field</span>
            </button>
          </div>
          <h3 class="prompt-header__title">Declare {{ announceAttrib.count }} Attribute(s)</h3>
          <p class="prompt-header__subtitle">Choose from the available elemental attributes.</p>
        </div>

        <div class="attrib-grid">
          <button
            v-for="attr in availableAttributes"
            :key="attr.value"
            type="button"
            class="attrib-btn"
            :class="`attrib-btn--${attr.key}`"
            @click="$emit('announce-attrib', [attr.value])"
          >
            <span class="attrib-icon">{{ attr.icon }}</span>
            <span class="attrib-name">{{ attr.name }}</span>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 7. NUMBER ANNOUNCEMENT PROMPT (ANNOUNCE_NUMBER) -->
      <!-- ================================================================= -->
      <template v-else-if="announceNumber">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--announce">
              <span class="badge-icon">🔢</span>
              <span class="badge-label">NUMBER DECLARATION</span>
            </div>
            <button
              type="button"
              class="prompt-header__observe-btn"
              title="Temporarily minimize prompt to observe field and cards"
              @click="$emit('observe-field')"
            >
              <span class="btn-icon">👁️</span>
              <span>Observe Field</span>
            </button>
          </div>
          <h3 class="prompt-header__title">Declare a Number</h3>
          <p class="prompt-header__subtitle">Choose one of the specified numbers for this effect.</p>
        </div>

        <div class="number-grid">
          <button
            v-for="(num, idx) in announceNumber.options"
            :key="`num-${idx}`"
            type="button"
            class="number-btn"
            @click="$emit('announce-number', idx)"
          >
            <span class="number-val">{{ num }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type {
  SelectChainPayload,
  SelectPositionPayload,
  SelectEffectYnPayload,
  SelectOptionPayload,
  AnnounceCardPayload,
  AnnounceRacePayload,
  AnnounceAttribPayload,
  AnnounceNumberPayload,
} from '../../../shared/types/duel.js';
import type { CardDetail } from '../../../shared/types/card.js';
import type { FieldCard } from '../../../shared/types/field.js';
import { useDuelStore } from '../../stores/duelStore.js';
import { getCardImageUrl, getCardBackUrl } from '../../utils/media.js';

interface Props {
  selectChain?: SelectChainPayload | null;
  selectPosition?: SelectPositionPayload | null;
  selectEffectYn?: SelectEffectYnPayload | null;
  selectOption?: SelectOptionPayload | null;
  announceCard?: AnnounceCardPayload | null;
  announceRace?: AnnounceRacePayload | null;
  announceAttrib?: AnnounceAttribPayload | null;
  announceNumber?: AnnounceNumberPayload | null;
  allCards?: CardDetail[];
}

const props = withDefaults(defineProps<Props>(), {
  selectChain: null,
  selectPosition: null,
  selectEffectYn: null,
  selectOption: null,
  announceCard: null,
  announceRace: null,
  announceAttrib: null,
  announceNumber: null,
  allCards: () => [],
});

const emit = defineEmits<{
  (e: 'select-position', position: number): void;
  (e: 'select-chain', index: number | null): void;
  (e: 'select-effect-yn', yes: boolean): void;
  (e: 'select-option', index: number): void;
  (e: 'announce-card', code: number): void;
  (e: 'announce-race', races: bigint[]): void;
  (e: 'announce-attrib', attributes: number[]): void;
  (e: 'announce-number', value: number): void;
  (e: 'observe-field'): void;
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'mute-phase'): void;
}>();

const duelStore = useDuelStore();

const effectiveCardCode = computed(() => {
  if (!props.selectEffectYn) return null;
  if (props.selectEffectYn.code && props.selectEffectYn.code > 0) {
    return props.selectEffectYn.code;
  }
  return null;
});

const effectiveCardDetail = computed(() => {
  if (!effectiveCardCode.value) return null;
  return duelStore.getCardDetail(effectiveCardCode.value);
});

const effectiveCardName = computed(() => {
  if (!props.selectEffectYn) return '';
  if (props.selectEffectYn.cardName) return props.selectEffectYn.cardName;
  if (effectiveCardDetail.value?.name) return effectiveCardDetail.value.name;
  return '';
});

const resolvedEffectDescription = computed(() => {
  if (!props.selectEffectYn) return '';
  const d = props.selectEffectYn.description;
  if (
    d &&
    d !== '0' &&
    isNaN(Number(d)) &&
    !d.startsWith('Option #') &&
    d !== 'Activate the effect of this card.' &&
    d !== 'Do you wish to proceed?'
  ) {
    return d;
  }
  if (props.selectEffectYn.isDirectAttack) {
    const name = effectiveCardName.value || 'This monster';
    return `${name} can attack your opponent directly while you control "Toon World". If you decline, you must select an opponent monster to attack.`;
  }
  if (props.selectEffectYn.isReplay) {
    const name = effectiveCardName.value || 'This monster';
    return `The previous attack target is no longer valid. Choose whether to re-declare an attack with ${name} or stop.`;
  }
  if (effectiveCardDetail.value?.desc) {
    return effectiveCardDetail.value.desc;
  }
  return d || 'Do you wish to activate the effect of this card?';
});

function onCardHoverByCode(code?: number | null): void {
  if (!code || code <= 0) {
    emit('hover-card', null);
    return;
  }
  const detail = duelStore.getCardDetail(code);
  if (detail) {
    emit('hover-card', {
      id: `prompt-preview-${code}`,
      code,
      name: detail.name,
      controller: duelStore.userPlayerId,
      location: 'hand',
      sequence: 0,
      position: 'faceup_attack',
      atk: detail.atk,
      def: detail.def,
      level: detail.level,
      attribute: detail.attributeName,
      race: detail.raceName,
      description: detail.desc,
    });
  } else {
    emit('hover-card', null);
  }
}

const hasActivePrompt = computed(() => {
  return (
    !!props.selectChain ||
    !!props.selectPosition ||
    !!props.selectEffectYn ||
    !!props.selectOption ||
    !!props.announceCard ||
    !!props.announceRace ||
    !!props.announceAttrib ||
    !!props.announceNumber
  );
});

const isForcedPrompt = computed(() => {
  return !!props.selectChain?.forced;
});

const activePromptType = computed(() => {
  if (props.selectChain) return 'chain';
  if (props.selectPosition) return 'position';
  if (props.selectEffectYn) return 'effect';
  if (props.selectOption) return 'option';
  if (props.announceCard || props.announceRace || props.announceAttrib || props.announceNumber) return 'announce';
  return 'default';
});

// Card Declaration State
const cardSearchQuery = ref('');
const selectedDeclaredCode = ref<number | null>(null);

const stapleCards = [
  { code: 5318639, name: 'Mystical Space Typhoon' },
  { code: 12580477, name: 'Raigeki' },
  { code: 53129443, name: 'Dark Hole' },
  { code: 44095762, name: 'Mirror Force' },
  { code: 83764718, name: 'Monster Reborn' },
  { code: 46986414, name: 'Dark Magician' },
  { code: 89631139, name: 'Blue-Eyes White Dragon' },
  { code: 70781052, name: 'Summoned Skull' },
  { code: 79571449, name: 'Graceful Charity' },
];

const filteredDeclaredCards = computed(() => {
  const query = cardSearchQuery.value.trim().toLowerCase();
  if (!query) {
    return props.allCards.slice(0, 40);
  }
  return props.allCards.filter((c) => {
    const code = c.code || c.id;
    return (
      c.name.toLowerCase().includes(query) ||
      String(code).includes(query)
    );
  });
});

function selectDeclaredCard(code: number): void {
  selectedDeclaredCode.value = code;
}

function getDeclaredCardName(): string {
  if (!selectedDeclaredCode.value) return 'Card';
  const found = props.allCards.find((c) => (c.code || c.id) === selectedDeclaredCode.value);
  return found ? `"${found.name}"` : 'Selected Card';
}

function confirmCardDeclaration(): void {
  if (selectedDeclaredCode.value) {
    emit('announce-card', selectedDeclaredCode.value);
    selectedDeclaredCode.value = null;
    cardSearchQuery.value = '';
  }
}

// Attributes for ANNOUNCE_ATTRIB
const availableAttributes = [
  { key: 'dark', name: 'DARK', value: 0x20, icon: '🌑' },
  { key: 'light', name: 'LIGHT', value: 0x10, icon: '☀️' },
  { key: 'earth', name: 'EARTH', value: 0x01, icon: '⛰️' },
  { key: 'water', name: 'WATER', value: 0x02, icon: '💧' },
  { key: 'fire', name: 'FIRE', value: 0x04, icon: '🔥' },
  { key: 'wind', name: 'WIND', value: 0x08, icon: '🌪️' },
  { key: 'divine', name: 'DIVINE', value: 0x40, icon: '✨' },
];

function handleBackdropClick(): void {
  // Chain opportunity allows clicking outside to pass priority if not forced
  if (props.selectChain && !props.selectChain.forced) {
    emit('select-chain', null);
  }
}

function handleArtFallback(event: Event): void {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
}

function toRomanNumeral(num: number): string {
  const map: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
  };
  return map[num] || String(num);
}
</script>

<style scoped lang="scss">
@use '../../assets/styles/abstracts' as *;

.prompt-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(4, 6, 10, 0.82);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: fadeInBackdrop 0.22s ease-out;
}

.prompt-modal {
  position: relative;
  width: 100%;
  max-width: 620px;
  background: linear-gradient(175deg, rgba(18, 24, 36, 0.96) 0%, rgba(10, 13, 20, 0.98) 100%);
  border: 1.5px solid rgba(201, 162, 39, 0.6);
  border-radius: 16px;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.9),
    0 0 36px rgba(201, 162, 39, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow: hidden;
  animation: modalScalePop 0.25s cubic-bezier(0.22, 1, 0.36, 1);

  &__ambient-glow {
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 380px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(201, 162, 39, 0.2) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  &--chain .prompt-modal__ambient-glow {
    background: radial-gradient(ellipse at center, rgba(155, 81, 224, 0.25) 0%, transparent 70%);
  }

  &--position .prompt-modal__ambient-glow {
    background: radial-gradient(ellipse at center, rgba(235, 87, 87, 0.22) 0%, transparent 70%);
  }

  &--effect .prompt-modal__ambient-glow {
    background: radial-gradient(ellipse at center, rgba(39, 174, 96, 0.22) 0%, transparent 70%);
  }

  &--announce .prompt-modal__ambient-glow {
    background: radial-gradient(ellipse at center, rgba(86, 204, 242, 0.22) 0%, transparent 70%);
  }
}

// Corner Runic Accents
.modal-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid $color-gold-300;
  pointer-events: none;
  z-index: 2;

  &--tl {
    top: 6px;
    left: 6px;
    border-right: none;
    border-bottom: none;
  }
  &--tr {
    top: 6px;
    right: 6px;
    border-left: none;
    border-bottom: none;
  }
  &--bl {
    bottom: 6px;
    left: 6px;
    border-right: none;
    border-top: none;
  }
  &--br {
    bottom: 6px;
    right: 6px;
    border-left: none;
    border-top: none;
  }
}

// Prompt Header
.prompt-header {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 12px;
  }

  &__observe-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #cbd5e1;
    font-family: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 160ms ease;

    &:hover {
      background: rgba(201, 162, 39, 0.25);
      border-color: #e5c158;
      color: #fff;
      transform: translateY(-1px);
    }
  }

  &__badge {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 12px;
    font-family: $font-mono;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &--battle {
      background: rgba(235, 87, 87, 0.2);
      border-color: rgba(235, 87, 87, 0.5);
      color: #ffb4b4;
    }

    &--chain {
      background: rgba(155, 81, 224, 0.2);
      border-color: rgba(155, 81, 224, 0.5);
      color: #dfbaff;
    }

    &--effect {
      background: rgba(39, 174, 96, 0.2);
      border-color: rgba(39, 174, 96, 0.5);
      color: #b7f4cc;
    }

    &--option,
    &--announce {
      background: rgba(86, 204, 242, 0.2);
      border-color: rgba(86, 204, 242, 0.5);
      color: #c4f0ff;
    }
  }

  &__title {
    margin: 0;
    font-family: $font-display;
    font-size: 1.45rem;
    font-weight: 700;
    color: $color-gold-100;
    letter-spacing: 0.04em;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8), 0 0 16px rgba(201, 162, 39, 0.3);
  }

  &__subtitle {
    margin: 0;
    font-family: $font-body;
    font-size: 0.95rem;
    color: rgba(245, 241, 230, 0.82);
    line-height: 1.45;
  }

  &--forced .prompt-header__title {
    color: #ff9e9e;
  }
}

.highlight-text {
  color: $color-gold-300;
  font-weight: 700;
}

// 1. Battle Position Showcase
.position-showcase {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.stance-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(22, 28, 40, 0.85);
  border: 1.5px solid rgba(201, 162, 39, 0.3);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;

  &__preview {
    position: relative;
    width: 100px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__art {
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    background: #0d1117;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.7);
    transition: transform 0.22s ease;

    &--vertical {
      width: 64px;
      height: 94px;
    }

    &--horizontal {
      width: 94px;
      height: 64px;
      transform: rotate(90deg);
    }

    .stance-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .stance-sheen {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
      pointer-events: none;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }

  &__type {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: $font-mono;
    font-size: 0.85rem;
    font-weight: 800;
    color: $color-gold-300;
  }

  &__desc {
    font-family: $font-body;
    font-size: 0.75rem;
    color: rgba(245, 241, 230, 0.65);
    line-height: 1.3;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.75);

    &.stance-card--atk {
      border-color: #eb5757;
      background: rgba(235, 87, 87, 0.15);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.75), 0 0 20px rgba(235, 87, 87, 0.35);
    }

    &.stance-card--def {
      border-color: #2f80ed;
      background: rgba(47, 128, 237, 0.15);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.75), 0 0 20px rgba(47, 128, 237, 0.35);
    }

    &.stance-card--set {
      border-color: $color-gold-500;
      background: rgba(201, 162, 39, 0.15);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.75), 0 0 20px rgba(201, 162, 39, 0.35);
    }
  }
}

// 2. Chain Window Opportunity
.chain-cards-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.chain-card-entry {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(22, 28, 40, 0.88);
  border: 1.5px solid rgba(201, 162, 39, 0.3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);

  &__art-wrapper {
    position: relative;
    width: 60px;
    height: 86px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(201, 162, 39, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);

    .chain-card-entry__art-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .chain-card-entry__art-sheen {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
    }
  }

  &__meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    font-family: $font-display;
    font-size: 1.05rem;
    font-weight: 700;
    color: $color-gold-100;
    letter-spacing: 0.03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__desc-box {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    background: rgba(10, 13, 18, 0.6);
    border: 1px solid rgba(201, 162, 39, 0.15);

    .desc-quote-icon {
      font-size: 0.75rem;
      opacity: 0.8;
    }

    .desc-content {
      font-family: $font-body;
      font-size: 0.82rem;
      color: rgba(245, 241, 230, 0.85);
      line-height: 1.35;
    }
  }

  .chain-activate-btn {
    position: relative;
    padding: 10px 18px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(201, 162, 39, 0.85), rgba(155, 81, 224, 0.85));
    border: 1px solid $color-gold-300;
    color: #ffffff;
    font-family: $font-mono;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease;
  }

  &:hover {
    background: rgba(34, 42, 58, 0.95);
    border-color: $color-gold-300;
    transform: translateX(4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(155, 81, 224, 0.3);

    .chain-activate-btn {
      background: linear-gradient(135deg, $color-gold-500, #9b51e0);
      box-shadow: 0 4px 18px rgba(201, 162, 39, 0.6);
      transform: scale(1.05);
    }
  }
}

// 3. Optional Effect Spotlight
.effect-spotlight {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(22, 28, 40, 0.85);
  border: 1.5px solid rgba(201, 162, 39, 0.3);

  &__card {
    position: relative;
    width: 72px;
    height: 104px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(201, 162, 39, 0.5);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.7);

    .spotlight-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .spotlight-sheen {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
    }
  }

  &__icon-card {
    width: 72px;
    height: 104px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(30, 40, 60, 0.8);
    border: 1.5px dashed rgba(201, 162, 39, 0.4);
    flex-shrink: 0;

    .spotlight-fallback-icon {
      font-size: 2rem;
    }

    &--battle {
      border-color: rgba(235, 87, 87, 0.6);
      background: rgba(235, 87, 87, 0.15);
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px solid rgba(201, 162, 39, 0.25);
    padding-bottom: 6px;

    .spotlight-card-name {
      font-family: $font-display;
      font-size: 1.05rem;
      font-weight: 700;
      color: $color-gold-100;
      letter-spacing: 0.03em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .spotlight-stats-badge {
      font-family: $font-mono;
      font-size: 0.76rem;
      font-weight: 800;
      color: #dfbaff;
      background: rgba(155, 81, 224, 0.25);
      border: 1px solid rgba(155, 81, 224, 0.5);
      padding: 2px 8px;
      border-radius: 6px;
      flex-shrink: 0;
    }
  }

  &__desc {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    .desc-quote-icon {
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .desc-text {
      margin: 0;
      font-family: $font-body;
      font-size: 0.92rem;
      color: rgba(245, 241, 230, 0.92);
      line-height: 1.45;
    }
  }
}

// 4. Multi-Option Choice
.option-choices-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.option-choice-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 10px;
  background: rgba(22, 28, 40, 0.88);
  border: 1.5px solid rgba(201, 162, 39, 0.3);
  color: #f5f1e6;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  text-align: left;

  &__num {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(201, 162, 39, 0.18);
    border: 1px solid rgba(201, 162, 39, 0.5);
    color: $color-gold-300;
    font-family: $font-mono;
    font-size: 0.85rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    font-family: $font-body;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.4;
  }

  &__arrow {
    color: $color-gold-500;
    opacity: 0.6;
    font-size: 1rem;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(34, 42, 58, 0.95);
    border-color: $color-gold-300;
    transform: translateX(4px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6), 0 0 14px rgba(201, 162, 39, 0.3);

    .option-choice-item__num {
      background: $color-gold-500;
      color: #0b0e14;
    }

    .option-choice-item__arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }
}

// 5. Card Declaration (ANNOUNCE_CARD)
.card-declare-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(10, 13, 18, 0.8);
  border: 1px solid rgba(201, 162, 39, 0.4);

  .search-icon {
    font-size: 1rem;
    opacity: 0.7;
  }

  .card-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #f5f1e6;
    font-family: $font-body;
    font-size: 0.95rem;

    &::placeholder {
      color: rgba(245, 241, 230, 0.4);
    }
  }

  .clear-search-btn {
    background: transparent;
    border: none;
    color: rgba(245, 241, 230, 0.6);
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
      color: #fff;
    }
  }
}

.quick-staples-row {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;

  .staples-label {
    font-family: $font-mono;
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(245, 241, 230, 0.5);
    flex-shrink: 0;
  }

  .staple-chip {
    padding: 3px 10px;
    border-radius: 14px;
    background: rgba(26, 32, 44, 0.8);
    border: 1px solid rgba(201, 162, 39, 0.25);
    color: rgba(245, 241, 230, 0.85);
    font-family: $font-body;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(201, 162, 39, 0.2);
      border-color: $color-gold-500;
      color: #fff;
    }

    &--selected {
      background: $color-gold-500;
      color: #0b0e14;
      font-weight: 800;
      border-color: $color-gold-300;
    }
  }
}

.declare-results-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
  background: rgba(10, 13, 18, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(201, 162, 39, 0.15);
}

.declare-card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(22, 28, 40, 0.7);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;

  &__art {
    width: 32px;
    height: 46px;
    border-radius: 3px;
    overflow: hidden;
    flex-shrink: 0;

    .declare-art-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__name {
    font-family: $font-display;
    font-size: 0.9rem;
    font-weight: 700;
    color: $color-gold-100;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__type {
    font-family: $font-body;
    font-size: 0.72rem;
    color: rgba(245, 241, 230, 0.6);
  }

  &__check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $color-gold-500;
    color: #0b0e14;
    font-weight: 900;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background: rgba(34, 42, 58, 0.9);
    border-color: rgba(201, 162, 39, 0.4);
  }

  &--selected {
    background: rgba(201, 162, 39, 0.25);
    border-color: $color-gold-500;
  }
}

.declare-empty {
  padding: 16px;
  text-align: center;
  color: rgba(245, 241, 230, 0.5);
  font-size: 0.85rem;
}

// 6. Attributes Grid
.attrib-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
}

.attrib-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px;
  border-radius: 10px;
  background: rgba(22, 28, 40, 0.85);
  border: 1.5px solid rgba(201, 162, 39, 0.3);
  color: #f5f1e6;
  cursor: pointer;
  transition: all 0.2s ease;

  .attrib-icon {
    font-size: 1.8rem;
  }

  .attrib-name {
    font-family: $font-mono;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: $color-gold-300;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
  }

  &--dark:hover {
    background: rgba(155, 81, 224, 0.25);
    border-color: #9b51e0;
  }
  &--light:hover {
    background: rgba(242, 201, 76, 0.25);
    border-color: #f2c94c;
  }
  &--fire:hover {
    background: rgba(235, 87, 87, 0.25);
    border-color: #eb5757;
  }
  &--water:hover {
    background: rgba(47, 128, 237, 0.25);
    border-color: #2f80ed;
  }
  &--wind:hover {
    background: rgba(39, 174, 96, 0.25);
    border-color: #27ae60;
  }
  &--earth:hover {
    background: rgba(217, 119, 6, 0.25);
    border-color: #d97706;
  }
}

// 7. Number Grid
.number-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 12px;
}

.number-btn {
  padding: 16px 12px;
  border-radius: 8px;
  background: rgba(22, 28, 40, 0.85);
  border: 1.5px solid rgba(201, 162, 39, 0.35);
  color: $color-gold-100;
  font-family: $font-mono;
  font-size: 1.3rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $color-gold-500;
    color: #0b0e14;
    border-color: $color-gold-300;
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba(201, 162, 39, 0.6);
  }
}

// Prompt Footer
.prompt-footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  gap: 14px;

  &--center {
    justify-content: center;
  }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: $font-mono;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &--pass {
    background: rgba(26, 32, 44, 0.8);
    border: 1.5px solid rgba(201, 162, 39, 0.3);
    color: rgba(245, 241, 230, 0.85);

    .btn-key-hint {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    &:hover {
      background: rgba(40, 48, 64, 0.95);
      border-color: $color-gold-300;
      color: #fff;
    }
  }

  &--mute-phase {
    background: rgba(20, 24, 34, 0.85);
    border: 1.5px solid rgba(113, 128, 150, 0.35);
    color: #a0aec0;
    font-size: 0.82rem;
    padding: 10px 18px;

    &:hover {
      background: rgba(45, 55, 72, 0.95);
      border-color: #cbd5e0;
      color: #edf2f7;
    }
  }

  &--secondary {
    background: rgba(26, 32, 44, 0.85);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    color: rgba(245, 241, 230, 0.85);

    &:hover {
      background: rgba(40, 48, 64, 0.95);
      border-color: rgba(255, 255, 255, 0.4);
      color: #fff;
    }
  }

  &--confirm-emerald {
    background: linear-gradient(135deg, #27ae60, #219653);
    border: 1.5px solid #6fcf97;
    color: #ffffff;
    box-shadow: 0 4px 16px rgba(39, 174, 96, 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      box-shadow: 0 6px 20px rgba(39, 174, 96, 0.6);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }
}

@keyframes fadeInBackdrop {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalScalePop {
  from {
    opacity: 0;
    transform: scale(0.93) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
