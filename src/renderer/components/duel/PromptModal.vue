<template>
  <div v-if="hasActivePrompt" class="prompt-modal-backdrop" @click.self="handleBackdropClick">
    <div
      class="prompt-modal"
      :class="[`prompt-modal--${activePromptType}`, { 'prompt-modal--forced': isForcedPrompt }]"
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
            Choose the tactical combat stance for
            <strong class="highlight-text">{{ selectPosition.cardName || 'your monster' }}</strong
            >.
          </p>
        </div>

        <div class="position-showcase">
          <!-- Attack Position Option (POS_FACEUP_ATTACK = 1) -->
          <button
            v-if="hasPosition(1)"
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
              <span class="stance-desc"
                >Face-up upright orientation. Ready to attack or defend in combat.</span
              >
            </div>
            <div class="stance-card__glow-border" />
          </button>

          <!-- Face-Up Defense Position Option (POS_FACEUP_DEFENSE = 4) -->
          <button
            v-if="hasPosition(4)"
            type="button"
            class="stance-card stance-card--def"
            @mouseenter="onCardHoverByCode(selectPosition.code)"
            @mouseleave="onCardHoverByCode(null)"
            @click="$emit('select-position', 4)"
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
              <span class="stance-desc"
                >Face-up horizontal orientation. Defends Life Points against attacks.</span
              >
            </div>
            <div class="stance-card__glow-border" />
          </button>

          <!-- Set (Face-Down DEF) Option (POS_FACEDOWN_DEFENSE = 8) -->
          <button
            v-if="hasPosition(8)"
            type="button"
            class="stance-card stance-card--set"
            @mouseenter="onCardHoverByCode(selectPosition.code)"
            @mouseleave="onCardHoverByCode(null)"
            @click="$emit('select-position', 8)"
          >
            <div class="stance-card__preview">
              <div class="stance-card__art stance-card__art--horizontal">
                <img :src="getCardBackUrl()" alt="Card Back" class="stance-img" />
                <div class="stance-sheen" />
              </div>
              <div class="stance-aura stance-aura--set" />
            </div>
            <div class="stance-card__info">
              <div class="stance-card__type">
                <span class="stance-icon">🃏</span>
                <span class="stance-name">SET (FACE-DOWN DEF)</span>
              </div>
              <span class="stance-desc"
                >Placed face-down in defense. Conceals stats and effects from opponent.</span
              >
            </div>
            <div class="stance-card__glow-border" />
          </button>

          <!-- Set (Face-Down ATK) Option (POS_FACEDOWN_ATTACK = 2) -->
          <button
            v-if="hasPosition(2)"
            type="button"
            class="stance-card stance-card--set"
            @mouseenter="onCardHoverByCode(selectPosition.code)"
            @mouseleave="onCardHoverByCode(null)"
            @click="$emit('select-position', 2)"
          >
            <div class="stance-card__preview">
              <div class="stance-card__art stance-card__art--vertical">
                <img :src="getCardBackUrl()" alt="Card Back" class="stance-img" />
                <div class="stance-sheen" />
              </div>
              <div class="stance-aura stance-aura--set" />
            </div>
            <div class="stance-card__info">
              <div class="stance-card__type">
                <span class="stance-icon">🃏</span>
                <span class="stance-name">SET (FACE-DOWN ATK)</span>
              </div>
              <span class="stance-desc"
                >Placed face-down in attack. Conceals stats and effects from opponent.</span
              >
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
              <span class="badge-label">{{
                selectChain.forced ? 'MANDATORY CHAIN TRIGGER' : 'CHAIN OPPORTUNITY'
              }}</span>
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
              :class="
                selectEffectYn.isMaintenanceCost
                  ? 'prompt-header__badge--maintenance'
                  : selectEffectYn.isDirectAttack || selectEffectYn.isReplay
                    ? 'prompt-header__badge--battle'
                    : 'prompt-header__badge--effect'
              "
            >
              <span class="badge-icon">{{
                selectEffectYn.badgeIcon ||
                (selectEffectYn.isMaintenanceCost
                  ? '🪙'
                  : selectEffectYn.isDirectAttack
                    ? '⚔️'
                    : '✨')
              }}</span>
              <span class="badge-label">{{
                selectEffectYn.badgeLabel ||
                (selectEffectYn.isMaintenanceCost
                  ? 'MAINTENANCE COST'
                  : selectEffectYn.isDirectAttack
                    ? 'DIRECT ATTACK CHOICE'
                    : 'CARD EFFECT TRIGGER')
              }}</span>
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
            {{
              selectEffectYn.promptTitle ||
              (selectEffectYn.isDirectAttack ? 'Declare Direct Attack' : 'Optional Card Effect')
            }}
          </h3>
          <p class="prompt-header__subtitle">
            <template v-if="selectEffectYn.isMaintenanceCost">
              Choose whether to pay the maintenance cost for
              <strong class="highlight-text">{{ effectiveCardName || 'this card' }}</strong> or
              allow it to be destroyed.
            </template>
            <template v-else-if="selectEffectYn.isDirectAttack">
              Do you wish to declare a direct attack on opponent Life Points with
              <strong class="highlight-text">{{ effectiveCardName || 'your monster' }}</strong
              >?
            </template>
            <template v-else-if="selectEffectYn.isReplay">
              A battle replay occurred. Do you want to continue the attack with
              <strong class="highlight-text">{{ effectiveCardName || 'your monster' }}</strong
              >?
            </template>
            <template v-else-if="effectiveCardName">
              Do you wish to activate the effect of
              <strong class="highlight-text">{{ effectiveCardName }}</strong
              >?
            </template>
            <template v-else> Do you wish to proceed with this action? </template>
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
          <div
            v-else
            class="effect-spotlight__icon-card"
            :class="{ 'effect-spotlight__icon-card--battle': selectEffectYn.isDirectAttack }"
          >
            <span class="spotlight-fallback-icon">{{
              selectEffectYn.isDirectAttack ? '⚔️' : '✨'
            }}</span>
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
          <button
            type="button"
            class="action-btn action-btn--secondary"
            @click="$emit('select-effect-yn', false)"
          >
            <span class="btn-icon">✕</span>
            <span>{{
              selectEffectYn.noText ||
              (selectEffectYn.isDirectAttack ? 'Attack Opponent Monster' : 'No, Decline')
            }}</span>
          </button>
          <button
            type="button"
            class="action-btn action-btn--confirm-emerald"
            @click="$emit('select-effect-yn', true)"
          >
            <span class="btn-icon">✓</span>
            <span>{{
              selectEffectYn.yesText ||
              (selectEffectYn.isDirectAttack ? 'Attack Directly' : 'Yes, Activate Effect')
            }}</span>
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
          <p class="prompt-header__subtitle">
            Select one of the following activation modes to resolve this card.
          </p>
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
              :class="{
                'declare-card-item--selected': selectedDeclaredCode === (card.code || card.id),
              }"
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
                  {{
                    card.isMonster
                      ? `Monster ★${card.level} • ${card.attributeName || ''} • ${card.raceName || ''}`
                      : card.isSpell
                        ? 'Spell Card'
                        : 'Trap Card'
                  }}
                </span>
              </div>
              <div
                v-if="selectedDeclaredCode === (card.code || card.id)"
                class="declare-card-item__check"
              >
                ✓
              </div>
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
      <!-- 6. RACE / MONSTER TYPE ANNOUNCEMENT PROMPT (ANNOUNCE_RACE)        -->
      <!-- ================================================================= -->
      <template v-else-if="announceRace">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--announce">
              <span class="badge-icon">🧬</span>
              <span class="badge-label">MONSTER TYPE DECLARATION</span>
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
            {{
              announceRace.count > 1
                ? `Declare ${announceRace.count} Monster Types`
                : 'Declare a Monster Type'
            }}
          </h3>
          <p class="prompt-header__subtitle">
            Choose
            {{
              announceRace.count > 1 ? `${announceRace.count} monster types` : 'a monster type'
            }}
            for this effect.
          </p>
        </div>

        <div v-if="availableRaces.length > 8" class="race-search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="raceSearchQuery"
            type="text"
            class="race-search-input"
            placeholder="Filter monster types (e.g. Dragon, Warrior, Spellcaster)..."
          />
          <button
            v-if="raceSearchQuery"
            type="button"
            class="clear-search-btn"
            @click="raceSearchQuery = ''"
          >
            ✕
          </button>
        </div>

        <div class="race-grid">
          <button
            v-for="race in filteredRaces"
            :key="race.value"
            type="button"
            class="race-btn"
            :class="{
              'race-btn--selected': isRaceSelected(race.value),
            }"
            @click="handleRaceClick(race.value)"
          >
            <span class="race-icon">{{ race.icon }}</span>
            <span class="race-name">{{ race.name }}</span>
            <span v-if="isRaceSelected(race.value)" class="race-check">✓</span>
          </button>
          <div v-if="filteredRaces.length === 0" class="race-empty">
            No matching monster type found.
          </div>
        </div>

        <div v-if="announceRace.count > 1" class="prompt-footer">
          <button
            type="button"
            class="action-btn action-btn--confirm-emerald"
            :disabled="selectedRaces.length !== announceRace.count"
            @click="confirmRaceDeclaration"
          >
            <span class="btn-icon">✓</span>
            <span>Confirm Declaration ({{ selectedRaces.length }}/{{ announceRace.count }})</span>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 7. ATTRIBUTE ANNOUNCEMENT PROMPT (ANNOUNCE_ATTRIB) -->
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
          <p class="prompt-header__subtitle">
            Choose one of the specified numbers for this effect.
          </p>
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

      <!-- ================================================================= -->
      <!-- 9. SELECT COUNTER PROMPT (SELECT_COUNTER)                         -->
      <!-- ================================================================= -->
      <template v-else-if="selectCounter">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--counter">
              <span class="badge-icon">⚡</span>
              <span class="badge-label">REMOVE COUNTERS</span>
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
            Select {{ selectCounter.count }} Counter{{ selectCounter.count > 1 ? 's' : '' }} to Remove
          </h3>
          <p class="prompt-header__subtitle">
            Choose the cards from which to remove the required counters ({{ totalAllocatedCounters }} / {{ selectCounter.count }} selected).
          </p>
        </div>

        <div class="counter-stepper-list">
          <div
            v-for="(card, idx) in selectCounter.cards"
            :key="`cnt-card-${card.code}-${card.sequence}-${idx}`"
            class="counter-card-row"
            :class="{ 'counter-card-row--active': (allocatedCounters[idx] || 0) > 0 }"
            @mouseenter="onCardHoverByCode(card.code)"
            @mouseleave="onCardHoverByCode(null)"
          >
            <div class="counter-card-row__art">
              <img
                :src="getCardImageUrl(card.code, 'mini')"
                :alt="card.cardName || 'Card'"
                class="counter-art-img"
                @error="handleArtFallback"
              />
            </div>
            <div class="counter-card-row__info">
              <span class="counter-card-row__name">{{ card.cardName || `Card #${card.code}` }}</span>
              <span class="counter-card-row__avail">
                Available counters on card: <strong>{{ card.count }}</strong>
              </span>
            </div>
            <div class="counter-stepper">
              <button
                type="button"
                class="counter-stepper__btn"
                :disabled="!canDecrementCounter(idx)"
                @click="decrementCounter(idx)"
              >
                −
              </button>
              <span class="counter-stepper__val">{{ allocatedCounters[idx] || 0 }}</span>
              <button
                type="button"
                class="counter-stepper__btn"
                :disabled="!canIncrementCounter(idx)"
                @click="incrementCounter(idx)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="prompt-footer prompt-footer--center">
          <button
            type="button"
            class="action-btn action-btn--confirm-emerald"
            :disabled="totalAllocatedCounters !== selectCounter.count"
            @click="confirmSelectCounter"
          >
            <span class="btn-icon">✓</span>
            <span>Confirm Removal ({{ totalAllocatedCounters }} / {{ selectCounter.count }})</span>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 10. ROCK-PAPER-SCISSORS PROMPT (ROCK_PAPER_SCISSORS)              -->
      <!-- ================================================================= -->
      <template v-else-if="rockPaperScissors">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--rps">
              <span class="badge-icon">✊</span>
              <span class="badge-label">ROCK-PAPER-SCISSORS</span>
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
          <h3 class="prompt-header__title">Play Rock-Paper-Scissors!</h3>
          <p class="prompt-header__subtitle">
            Choose your hand against the opponent.
          </p>
        </div>

        <div class="rps-grid">
          <button
            type="button"
            class="rps-choice-btn rps-choice-btn--rock"
            @click="$emit('rock-paper-scissors', 2)"
          >
            <div class="rps-choice-btn__icon">🪨</div>
            <div class="rps-choice-btn__label">ROCK</div>
            <div class="rps-choice-btn__hint">Beats Scissors</div>
          </button>

          <button
            type="button"
            class="rps-choice-btn rps-choice-btn--paper"
            @click="$emit('rock-paper-scissors', 3)"
          >
            <div class="rps-choice-btn__icon">📄</div>
            <div class="rps-choice-btn__label">PAPER</div>
            <div class="rps-choice-btn__hint">Beats Rock</div>
          </button>

          <button
            type="button"
            class="rps-choice-btn rps-choice-btn--scissors"
            @click="$emit('rock-paper-scissors', 1)"
          >
            <div class="rps-choice-btn__icon">✂️</div>
            <div class="rps-choice-btn__label">SCISSORS</div>
            <div class="rps-choice-btn__hint">Beats Paper</div>
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 11. SORT CARD PROMPT (SORT_CARD)                                  -->
      <!-- ================================================================= -->
      <template v-else-if="sortCard">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--sort">
              <span class="badge-icon">📑</span>
              <span class="badge-label">CARD SEQUENCING</span>
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
          <h3 class="prompt-header__title">Arrange Card Order</h3>
          <p class="prompt-header__subtitle">
            Reorder the cards below. The card in position #1 will be placed at the top.
          </p>
        </div>

        <div class="sort-card-track">
          <div
            v-for="(origIdx, currentPos) in sortCardIndices"
            :key="origIdx"
            class="sort-card-slot"
            @mouseenter="onCardHoverByCode(sortCard.cards[origIdx]?.code)"
            @mouseleave="onCardHoverByCode(null)"
          >
            <div class="sort-card-slot__pos-badge" :class="{ 'sort-card-slot__pos-badge--top': currentPos === 0 }">
              <span v-if="currentPos === 0">#1 (TOP)</span>
              <span v-else>#{{ currentPos + 1 }}</span>
            </div>

            <div class="sort-card-slot__art">
              <img
                :src="getCardImageUrl(sortCard.cards[origIdx]?.code, 'mini')"
                :alt="sortCard.cards[origIdx]?.cardName || 'Card'"
                class="sort-card-img"
                @error="handleArtFallback"
              />
            </div>

            <div class="sort-card-slot__name" :title="sortCard.cards[origIdx]?.cardName">
              {{ sortCard.cards[origIdx]?.cardName || 'Unknown Card' }}
            </div>

            <div class="sort-card-slot__arrows">
              <button
                type="button"
                class="sort-arrow-btn"
                :disabled="currentPos === 0"
                title="Move Left / Towards Top"
                @click="moveSortCardLeft(currentPos)"
              >
                ◀
              </button>
              <button
                type="button"
                class="sort-arrow-btn"
                :disabled="currentPos === sortCardIndices.length - 1"
                title="Move Right / Towards Bottom"
                @click="moveSortCardRight(currentPos)"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        <div class="sort-card-actions">
          <button
            type="button"
            class="sort-action-btn sort-action-btn--default"
            @click="$emit('sort-card', null)"
          >
            ⚡ Default Order
          </button>
          <button
            type="button"
            class="sort-action-btn sort-action-btn--reset"
            @click="resetSortCardOrder"
          >
            ↺ Reset
          </button>
          <button
            type="button"
            class="sort-action-btn sort-action-btn--confirm"
            @click="confirmSortCardOrder"
          >
            ✓ Confirm Order
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 12. SORT CHAIN PROMPT (SORT_CHAIN)                                -->
      <!-- ================================================================= -->
      <template v-else-if="sortChain">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--chain">
              <span class="badge-icon">🔗</span>
              <span class="badge-label">SIMULTANEOUS EFFECTS (SEGOC)</span>
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
          <h3 class="prompt-header__title">Select Chain Resolution Order</h3>
          <p class="prompt-header__subtitle">
            Multiple effects triggered simultaneously. Chain Link 1 resolves last; the highest Chain Link resolves first.
          </p>
        </div>

        <div class="sort-chain-list">
          <div
            v-for="(origIdx, currentPos) in sortChainIndices"
            :key="origIdx"
            class="sort-chain-item"
            @mouseenter="onCardHoverByCode(sortChain.cards[origIdx]?.code)"
            @mouseleave="onCardHoverByCode(null)"
          >
            <div class="sort-chain-item__link-badge" :class="`sort-chain-item__link-badge--cl${currentPos + 1}`">
              CL {{ currentPos + 1 }}
            </div>

            <div class="sort-chain-item__art">
              <img
                :src="getCardImageUrl(sortChain.cards[origIdx]?.code, 'mini')"
                :alt="sortChain.cards[origIdx]?.cardName || 'Card'"
                class="sort-chain-img"
                @error="handleArtFallback"
              />
            </div>

            <div class="sort-chain-item__details">
              <div class="sort-chain-item__name">
                {{ sortChain.cards[origIdx]?.cardName || 'Card Effect' }}
              </div>
              <div v-if="sortChain.cards[origIdx]?.desc" class="sort-chain-item__desc">
                {{ sortChain.cards[origIdx]?.desc }}
              </div>
            </div>

            <div class="sort-chain-item__controls">
              <button
                type="button"
                class="sort-chain-arrow-btn"
                :disabled="currentPos === 0"
                title="Move Up (Earlier Chain Link)"
                @click="moveSortChainUp(currentPos)"
              >
                ▲
              </button>
              <button
                type="button"
                class="sort-chain-arrow-btn"
                :disabled="currentPos === sortChainIndices.length - 1"
                title="Move Down (Later Chain Link)"
                @click="moveSortChainDown(currentPos)"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        <div class="sort-card-actions">
          <button
            type="button"
            class="sort-action-btn sort-action-btn--default"
            @click="$emit('sort-chain', null)"
          >
            ⚡ Default Sequence
          </button>
          <button
            type="button"
            class="sort-action-btn sort-action-btn--reset"
            @click="resetSortChainOrder"
          >
            ↺ Reset
          </button>
          <button
            type="button"
            class="sort-action-btn sort-action-btn--confirm"
            @click="confirmSortChainOrder"
          >
            ✓ Confirm Chain Links
          </button>
        </div>
      </template>

      <!-- ================================================================= -->
      <!-- 13. SELECT DISFIELD PROMPT (SELECT_DISFIELD)                       -->
      <!-- ================================================================= -->
      <template v-else-if="selectDisfield">
        <div class="prompt-header">
          <div class="prompt-header__top-row">
            <div class="prompt-header__badge prompt-header__badge--disfield">
              <span class="badge-icon">🚫</span>
              <span class="badge-label">ZONE LOCKDOWN</span>
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
          <h3 class="prompt-header__title">Select Zones to Disable</h3>
          <p class="prompt-header__subtitle">
            Choose {{ selectDisfield.count }} zone{{ selectDisfield.count > 1 ? 's' : '' }} on the field to lock down.
          </p>
        </div>

        <div class="disfield-selection-status">
          <span class="disfield-counter">
            Selected: <strong>{{ selectedDisfieldPlaces.length }} / {{ selectDisfield.count }}</strong>
          </span>
        </div>

        <div class="disfield-grid">
          <button
            v-for="(place, pIdx) in selectDisfield.availablePlaces || []"
            :key="pIdx"
            type="button"
            class="disfield-zone-btn"
            :class="[
              `disfield-zone-btn--${getPlaceZoneType(place)}`,
              { 'disfield-zone-btn--selected': isDisfieldPlaceSelected(place) }
            ]"
            @click="toggleDisfieldPlace(place)"
          >
            <div class="disfield-zone-btn__icon">
              <span v-if="isDisfieldPlaceSelected(place)">🚫</span>
              <span v-else-if="getPlaceZoneType(place) === 'emz'">💠</span>
              <span v-else-if="getPlaceZoneType(place) === 'monster'">⚔️</span>
              <span v-else-if="getPlaceZoneType(place) === 'spell'">📜</span>
              <span v-else>🌐</span>
            </div>
            <div class="disfield-zone-btn__label">
              {{ getPlaceZoneName(place) }}
            </div>
            <div class="disfield-zone-btn__status">
              {{ isDisfieldPlaceSelected(place) ? 'LOCKED' : 'AVAILABLE' }}
            </div>
          </button>
        </div>

        <div class="sort-card-actions">
          <button
            type="button"
            class="sort-action-btn sort-action-btn--default"
            @click="autoSelectDisfield"
          >
            ⚡ Auto Select
          </button>
          <button
            type="button"
            class="sort-action-btn sort-action-btn--confirm"
            :disabled="selectedDisfieldPlaces.length !== selectDisfield.count"
            @click="confirmDisfield"
          >
            ✓ Confirm Zones ({{ selectedDisfieldPlaces.length }}/{{ selectDisfield.count }})
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type {
  SelectChainPayload,
  SelectPositionPayload,
  SelectEffectYnPayload,
  SelectOptionPayload,
  AnnounceCardPayload,
  AnnounceRacePayload,
  AnnounceAttribPayload,
  AnnounceNumberPayload,
  SelectCounterPayload,
  RockPaperScissorsPayload,
  SortCardPayload,
  SortChainPayload,
  SelectDisfieldPayload,
  SelectFieldPlace,
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
  selectCounter?: SelectCounterPayload | null;
  rockPaperScissors?: RockPaperScissorsPayload | null;
  sortCard?: SortCardPayload | null;
  sortChain?: SortChainPayload | null;
  selectDisfield?: SelectDisfieldPayload | null;
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
  selectCounter: null,
  rockPaperScissors: null,
  sortCard: null,
  sortChain: null,
  selectDisfield: null,
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
  (e: 'select-counter', counters: number[]): void;
  (e: 'rock-paper-scissors', choice: 1 | 2 | 3): void;
  (e: 'sort-card', order: number[] | null): void;
  (e: 'sort-chain', order: number[] | null): void;
  (e: 'select-disfield', places: SelectFieldPlace[]): void;
  (e: 'observe-field'): void;
  (e: 'hover-card', card: FieldCard | null): void;
  (e: 'mute-phase'): void;
}>();

const duelStore = useDuelStore();

function hasPosition(pos: number): boolean {
  if (!props.selectPosition?.positions) return false;
  const positions = props.selectPosition.positions;
  if (Array.isArray(positions)) {
    return (
      positions.includes(pos) || positions.some((p) => typeof p === 'number' && (p & pos) === pos)
    );
  }
  const numericPos = Number(positions);
  return !isNaN(numericPos) && (numericPos & pos) === pos;
}

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
    !!props.announceNumber ||
    !!props.selectCounter ||
    !!props.rockPaperScissors ||
    !!props.sortCard ||
    !!props.sortChain ||
    !!props.selectDisfield
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
  if (props.announceCard || props.announceRace || props.announceAttrib || props.announceNumber)
    return 'announce';
  if (props.selectCounter) return 'counter';
  if (props.rockPaperScissors) return 'rps';
  if (props.sortCard) return 'sort-card';
  if (props.sortChain) return 'sort-chain';
  if (props.selectDisfield) return 'disfield';
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
    return c.name.toLowerCase().includes(query) || String(code).includes(query);
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

// Races for ANNOUNCE_RACE
const ALL_RACES = [
  { key: 'warrior', name: 'Warrior', value: 0x1, icon: '⚔️' },
  { key: 'spellcaster', name: 'Spellcaster', value: 0x2, icon: '🧙' },
  { key: 'fairy', name: 'Fairy', value: 0x4, icon: '🧚' },
  { key: 'fiend', name: 'Fiend', value: 0x8, icon: '😈' },
  { key: 'zombie', name: 'Zombie', value: 0x10, icon: '🧟' },
  { key: 'machine', name: 'Machine', value: 0x20, icon: '🤖' },
  { key: 'aqua', name: 'Aqua', value: 0x40, icon: '💧' },
  { key: 'pyro', name: 'Pyro', value: 0x80, icon: '🔥' },
  { key: 'rock', name: 'Rock', value: 0x100, icon: '🪨' },
  { key: 'wingedbeast', name: 'Winged Beast', value: 0x200, icon: '🦅' },
  { key: 'plant', name: 'Plant', value: 0x400, icon: '🌿' },
  { key: 'insect', name: 'Insect', value: 0x800, icon: '🦗' },
  { key: 'thunder', name: 'Thunder', value: 0x1000, icon: '⚡' },
  { key: 'dragon', name: 'Dragon', value: 0x2000, icon: '🐉' },
  { key: 'beast', name: 'Beast', value: 0x4000, icon: '🐺' },
  { key: 'beastwarrior', name: 'Beast-Warrior', value: 0x8000, icon: '🐯' },
  { key: 'dinosaur', name: 'Dinosaur', value: 0x10000, icon: '🦖' },
  { key: 'fish', name: 'Fish', value: 0x20000, icon: '🐟' },
  { key: 'seaserpent', name: 'Sea Serpent', value: 0x40000, icon: '🐍' },
  { key: 'reptile', name: 'Reptile', value: 0x80000, icon: '🦎' },
  { key: 'psychic', name: 'Psychic', value: 0x100000, icon: '🧠' },
  { key: 'divine', name: 'Divine-Beast', value: 0x200000, icon: '👑' },
  { key: 'creatorgod', name: 'Creator-God', value: 0x400000, icon: '✨' },
  { key: 'wyrm', name: 'Wyrm', value: 0x800000, icon: '🐲' },
  { key: 'cyberse', name: 'Cyberse', value: 0x1000000, icon: '🌐' },
  { key: 'illusion', name: 'Illusion', value: 0x2000000, icon: '👁️' },
];

const raceSearchQuery = ref('');
const selectedRaces = ref<number[]>([]);

const availableRaces = computed(() => {
  const avail = props.announceRace?.available;
  if (!avail) return ALL_RACES;
  try {
    const availBig = BigInt(avail);
    if (availBig === 0n) return ALL_RACES;
    return ALL_RACES.filter((r) => (availBig & BigInt(r.value)) !== 0n);
  } catch {
    return ALL_RACES;
  }
});

const filteredRaces = computed(() => {
  const q = raceSearchQuery.value.trim().toLowerCase();
  if (!q) return availableRaces.value;
  return availableRaces.value.filter((r) => r.name.toLowerCase().includes(q));
});

function isRaceSelected(val: number): boolean {
  return selectedRaces.value.includes(val);
}

function handleRaceClick(val: number): void {
  const count = props.announceRace?.count || 1;
  if (count <= 1) {
    emit('announce-race', [BigInt(val)]);
    selectedRaces.value = [];
    raceSearchQuery.value = '';
    return;
  }

  // Multi-select mode
  const idx = selectedRaces.value.indexOf(val);
  if (idx >= 0) {
    selectedRaces.value.splice(idx, 1);
  } else if (selectedRaces.value.length < count) {
    selectedRaces.value.push(val);
  }
}

function confirmRaceDeclaration(): void {
  const count = props.announceRace?.count || 1;
  if (selectedRaces.value.length === count) {
    emit(
      'announce-race',
      selectedRaces.value.map((r) => BigInt(r)),
    );
    selectedRaces.value = [];
    raceSearchQuery.value = '';
  }
}

watch(
  () => props.announceRace,
  () => {
    selectedRaces.value = [];
    raceSearchQuery.value = '';
  },
);

// Attributes for ANNOUNCE_ATTRIB
const ALL_ATTRIBUTES = [
  { key: 'dark', name: 'DARK', value: 0x20, icon: '🌑' },
  { key: 'light', name: 'LIGHT', value: 0x10, icon: '☀️' },
  { key: 'earth', name: 'EARTH', value: 0x01, icon: '⛰️' },
  { key: 'water', name: 'WATER', value: 0x02, icon: '💧' },
  { key: 'fire', name: 'FIRE', value: 0x04, icon: '🔥' },
  { key: 'wind', name: 'WIND', value: 0x08, icon: '🌪️' },
  { key: 'divine', name: 'DIVINE', value: 0x40, icon: '✨' },
];

const availableAttributes = computed(() => {
  const avail = props.announceAttrib?.available;
  if (!avail || avail === 0) return ALL_ATTRIBUTES;
  return ALL_ATTRIBUTES.filter((a) => (avail & a.value) !== 0);
});

// -----------------------------------------------------------------------------
// Sort Card State & Helpers
// -----------------------------------------------------------------------------
const sortCardIndices = ref<number[]>([]);

watch(
  () => props.sortCard,
  (val) => {
    if (val?.cards) {
      sortCardIndices.value = val.cards.map((_, i) => i);
    } else {
      sortCardIndices.value = [];
    }
  },
  { immediate: true },
);

function moveSortCardLeft(pos: number): void {
  if (pos <= 0) return;
  const arr = [...sortCardIndices.value];
  const temp = arr[pos - 1];
  arr[pos - 1] = arr[pos];
  arr[pos] = temp;
  sortCardIndices.value = arr;
}

function moveSortCardRight(pos: number): void {
  if (pos >= sortCardIndices.value.length - 1) return;
  const arr = [...sortCardIndices.value];
  const temp = arr[pos + 1];
  arr[pos + 1] = arr[pos];
  arr[pos] = temp;
  sortCardIndices.value = arr;
}

function resetSortCardOrder(): void {
  if (props.sortCard?.cards) {
    sortCardIndices.value = props.sortCard.cards.map((_, i) => i);
  }
}

function confirmSortCardOrder(): void {
  emit('sort-card', sortCardIndices.value);
}

// -----------------------------------------------------------------------------
// Sort Chain State & Helpers
// -----------------------------------------------------------------------------
const sortChainIndices = ref<number[]>([]);

watch(
  () => props.sortChain,
  (val) => {
    if (val?.cards) {
      sortChainIndices.value = val.cards.map((_, i) => i);
    } else {
      sortChainIndices.value = [];
    }
  },
  { immediate: true },
);

function moveSortChainUp(pos: number): void {
  if (pos <= 0) return;
  const arr = [...sortChainIndices.value];
  const temp = arr[pos - 1];
  arr[pos - 1] = arr[pos];
  arr[pos] = temp;
  sortChainIndices.value = arr;
}

function moveSortChainDown(pos: number): void {
  if (pos >= sortChainIndices.value.length - 1) return;
  const arr = [...sortChainIndices.value];
  const temp = arr[pos + 1];
  arr[pos + 1] = arr[pos];
  arr[pos] = temp;
  sortChainIndices.value = arr;
}

function resetSortChainOrder(): void {
  if (props.sortChain?.cards) {
    sortChainIndices.value = props.sortChain.cards.map((_, i) => i);
  }
}

function confirmSortChainOrder(): void {
  emit('sort-chain', sortChainIndices.value);
}

// -----------------------------------------------------------------------------
// Select Disfield State & Helpers
// -----------------------------------------------------------------------------
const selectedDisfieldPlaces = ref<SelectFieldPlace[]>([]);

watch(
  () => props.selectDisfield,
  () => {
    selectedDisfieldPlaces.value = [];
  },
  { immediate: true },
);

function isDisfieldPlaceSelected(p: SelectFieldPlace): boolean {
  return selectedDisfieldPlaces.value.some(
    (sp) => sp.player === p.player && sp.location === p.location && sp.sequence === p.sequence,
  );
}

function toggleDisfieldPlace(p: SelectFieldPlace): void {
  const max = props.selectDisfield?.count ?? 1;
  const idx = selectedDisfieldPlaces.value.findIndex(
    (sp) => sp.player === p.player && sp.location === p.location && sp.sequence === p.sequence,
  );
  if (idx >= 0) {
    selectedDisfieldPlaces.value.splice(idx, 1);
  } else {
    if (selectedDisfieldPlaces.value.length < max) {
      selectedDisfieldPlaces.value.push(p);
    }
  }
}

function autoSelectDisfield(): void {
  const count = props.selectDisfield?.count ?? 1;
  const avail = props.selectDisfield?.availablePlaces ?? [];
  const chosen = avail.slice(0, count);
  selectedDisfieldPlaces.value = chosen;
  emit('select-disfield', chosen);
}

function confirmDisfield(): void {
  emit('select-disfield', selectedDisfieldPlaces.value);
}

function getPlaceZoneName(place: SelectFieldPlace): string {
  const owner = place.player === 0 ? 'Your' : "Opponent's";
  if (place.location === 4) {
    if (place.sequence === 5) return `${owner} Left EMZ`;
    if (place.sequence === 6) return `${owner} Right EMZ`;
    return `${owner} Monster Zone ${place.sequence + 1}`;
  }
  if (place.location === 8) {
    if (place.sequence === 5) return `${owner} Field Zone`;
    return `${owner} Spell/Trap Zone ${place.sequence + 1}`;
  }
  if (place.location === 256) {
    return `${owner} Field Zone`;
  }
  return `${owner} Zone (Seq ${place.sequence})`;
}

function getPlaceZoneType(place: SelectFieldPlace): string {
  if (place.location === 4) {
    if (place.sequence >= 5) return 'emz';
    return 'monster';
  }
  if (place.location === 8) {
    if (place.sequence === 5) return 'field';
    return 'spell';
  }
  return 'field';
}

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

// =========================================================================
// Counter Selection Logic (SELECT_COUNTER)
// =========================================================================
const allocatedCounters = ref<number[]>([]);

const totalAllocatedCounters = computed(() => {
  return allocatedCounters.value.reduce((sum, val) => sum + (val || 0), 0);
});

const remainingNeededCounters = computed(() => {
  return (props.selectCounter?.count || 0) - totalAllocatedCounters.value;
});

function canIncrementCounter(idx: number): boolean {
  if (remainingNeededCounters.value <= 0) return false;
  const cardMax = props.selectCounter?.cards[idx]?.count || 0;
  return (allocatedCounters.value[idx] || 0) < cardMax;
}

function canDecrementCounter(idx: number): boolean {
  return (allocatedCounters.value[idx] || 0) > 0;
}

function incrementCounter(idx: number): void {
  if (canIncrementCounter(idx)) {
    allocatedCounters.value[idx] = (allocatedCounters.value[idx] || 0) + 1;
  }
}

function decrementCounter(idx: number): void {
  if (canDecrementCounter(idx)) {
    allocatedCounters.value[idx] = (allocatedCounters.value[idx] || 0) - 1;
  }
}

function confirmSelectCounter(): void {
  if (totalAllocatedCounters.value === (props.selectCounter?.count || 0)) {
    emit('select-counter', [...allocatedCounters.value]);
  }
}

watch(
  () => props.selectCounter,
  (newVal) => {
    if (newVal && newVal.cards && newVal.cards.length > 0) {
      allocatedCounters.value = newVal.cards.map(() => 0);
      if (newVal.cards.length === 1 && newVal.cards[0].count >= newVal.count) {
        allocatedCounters.value[0] = newVal.count;
      }
    } else {
      allocatedCounters.value = [];
    }
  },
  { immediate: true },
);
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

  &--counter .prompt-modal__ambient-glow {
    background: radial-gradient(ellipse at center, rgba(242, 201, 76, 0.22) 0%, transparent 70%);
  }

  &--rps .prompt-modal__ambient-glow {
    background: radial-gradient(ellipse at center, rgba(187, 107, 217, 0.22) 0%, transparent 70%);
  }

  &--announce {
    max-width: 680px;

    .prompt-modal__ambient-glow {
      background: radial-gradient(ellipse at center, rgba(86, 204, 242, 0.22) 0%, transparent 70%);
    }
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

    &--counter {
      background: rgba(242, 201, 76, 0.2);
      border-color: rgba(242, 201, 76, 0.5);
      color: #ffe89e;
    }

    &--rps {
      background: rgba(187, 107, 217, 0.2);
      border-color: rgba(187, 107, 217, 0.5);
      color: #f2c7ff;
    }

    &--maintenance {
      background: rgba(242, 153, 74, 0.2);
      border-color: rgba(242, 153, 74, 0.5);
      color: #ffe0b2;
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
    text-shadow:
      0 2px 10px rgba(0, 0, 0, 0.8),
      0 0 16px rgba(201, 162, 39, 0.3);
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
      box-shadow:
        0 12px 28px rgba(0, 0, 0, 0.75),
        0 0 20px rgba(235, 87, 87, 0.35);
    }

    &.stance-card--def {
      border-color: #2f80ed;
      background: rgba(47, 128, 237, 0.15);
      box-shadow:
        0 12px 28px rgba(0, 0, 0, 0.75),
        0 0 20px rgba(47, 128, 237, 0.35);
    }

    &.stance-card--set {
      border-color: $color-gold-500;
      background: rgba(201, 162, 39, 0.15);
      box-shadow:
        0 12px 28px rgba(0, 0, 0, 0.75),
        0 0 20px rgba(201, 162, 39, 0.35);
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
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.6),
      0 0 16px rgba(155, 81, 224, 0.3);

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
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.6),
      0 0 14px rgba(201, 162, 39, 0.3);

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

// 6. Race / Monster Type Declaration
.race-search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(10, 13, 18, 0.8);
  border: 1px solid rgba(201, 162, 39, 0.35);

  .search-icon {
    font-size: 0.95rem;
    opacity: 0.7;
  }

  .race-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #f5f1e6;
    font-family: $font-body;
    font-size: 0.9rem;

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

.race-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 340px;
  overflow-y: auto;
  padding: 4px 4px 4px 0;

  // Custom scrollbar
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(10, 13, 18, 0.5);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(201, 162, 39, 0.3);
    border-radius: 3px;
    &:hover {
      background: rgba(201, 162, 39, 0.6);
    }
  }
}

.race-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(22, 28, 40, 0.85);
  border: 1.5px solid rgba(201, 162, 39, 0.3);
  color: $color-gold-100;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;

  .race-icon {
    font-size: 1.25rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .race-name {
    font-family: $font-mono;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  .race-check {
    font-size: 0.8rem;
    font-weight: 900;
    color: #2ecc71;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(201, 162, 39, 0.2);
    border-color: $color-gold-300;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(201, 162, 39, 0.3);
  }

  &--selected {
    background: linear-gradient(135deg, rgba(39, 174, 96, 0.4), rgba(46, 204, 113, 0.25));
    border-color: #2ecc71;
    color: #ffffff;
    box-shadow: 0 0 12px rgba(46, 204, 113, 0.5);
  }
}

.race-empty {
  grid-column: 1 / -1;
  padding: 24px;
  text-align: center;
  color: rgba(245, 241, 230, 0.5);
  font-size: 0.85rem;
}

// 7. Attributes Grid
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

// Counter Stepper Prompt Styling
.counter-stepper-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.counter-card-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(16, 20, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 8px 14px;
  transition: all 180ms ease;

  &--active {
    border-color: rgba(242, 201, 76, 0.6);
    background: rgba(242, 201, 76, 0.08);
    box-shadow: 0 0 12px rgba(242, 201, 76, 0.15);
  }

  &__art {
    width: 38px;
    height: 52px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.2);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  &__name {
    font-size: 0.92rem;
    font-weight: 700;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__avail {
    font-size: 0.78rem;
    color: #94a3b8;

    strong {
      color: #facc15;
    }
  }
}

.counter-stepper {
  display: flex;
  align-items: center;
  gap: 8px;

  &__btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 1.1rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 150ms ease;

    &:hover:not(:disabled) {
      background: rgba(242, 201, 76, 0.3);
      border-color: #facc15;
      color: #fff;
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  &__val {
    min-width: 24px;
    text-align: center;
    font-family: $font-mono;
    font-size: 1.1rem;
    font-weight: 800;
    color: #facc15;
  }
}

// Rock-Paper-Scissors Styling
.rps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 8px 0;
}

.rps-choice-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(20, 26, 38, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  padding: 24px 12px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.2, 0.9, 0.3, 1);

  &__icon {
    font-size: 3rem;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
    transition: transform 200ms ease;
  }

  &__label {
    font-family: $font-display;
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #f8fafc;
  }

  &__hint {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  &:hover {
    transform: translateY(-4px) scale(1.03);

    .rps-choice-btn__icon {
      transform: scale(1.15);
    }
  }

  &--rock:hover {
    border-color: #f59e0b;
    box-shadow: 0 10px 24px rgba(245, 158, 11, 0.3);
  }

  &--paper:hover {
    border-color: #3b82f6;
    box-shadow: 0 10px 24px rgba(59, 130, 246, 0.3);
  }

  &--scissors:hover {
    border-color: #ec4899;
    box-shadow: 0 10px 24px rgba(236, 72, 153, 0.3);
  }
}

// Card Sorting Track & Controls
.sort-card-track {
  display: flex;
  gap: 14px;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  padding: 12px 0 16px;
  max-height: 380px;
  overflow-y: auto;
}

.sort-card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 10px;
  width: 130px;
  transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: rgba(56, 189, 248, 0.6);
    background: rgba(15, 23, 42, 0.95);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }

  &__pos-badge {
    font-family: $font-display;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(100, 116, 139, 0.3);
    color: #cbd5e1;

    &--top {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
    }
  }

  &__art {
    width: 90px;
    height: 130px;
    border-radius: 6px;
    overflow: hidden;
    background: #020617;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sort-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__name {
    font-family: $font-body;
    font-size: 0.76rem;
    font-weight: 600;
    color: #e2e8f0;
    text-align: center;
    max-width: 115px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__arrows {
    display: flex;
    gap: 8px;
    width: 100%;
    justify-content: center;
  }

  .sort-arrow-btn {
    flex: 1;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: #94a3b8;
    padding: 6px 0;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 120ms ease;

    &:hover:not(:disabled) {
      background: rgba(56, 189, 248, 0.25);
      border-color: #38bdf8;
      color: #fff;
      transform: scale(1.06);
    }

    &:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }
  }
}

// Action Bar for Sort & Disfield Modals
.sort-card-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 14px;
}

.sort-action-btn {
  font-family: $font-display;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;

  &--default {
    background: rgba(30, 41, 59, 0.8);
    border: 1.5px solid rgba(148, 163, 184, 0.3);
    color: #cbd5e1;

    &:hover {
      background: rgba(51, 65, 85, 0.9);
      border-color: #94a3b8;
      color: #fff;
    }
  }

  &--reset {
    background: rgba(30, 41, 59, 0.6);
    border: 1.5px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;

    &:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      color: #fff;
    }
  }

  &--confirm {
    background: linear-gradient(135deg, #059669, #10b981);
    border: 1.5px solid #34d399;
    color: #fff;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
  }
}

// Chain Link Sequencing List (SEGOC)
.sort-chain-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  padding: 8px 4px;
}

.sort-chain-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(15, 23, 42, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 10px 14px;
  transition: all 160ms ease;

  &:hover {
    border-color: rgba(168, 85, 247, 0.6);
    background: rgba(15, 23, 42, 0.95);
  }

  &__link-badge {
    font-family: $font-display;
    font-size: 0.82rem;
    font-weight: 800;
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(168, 85, 247, 0.2);
    border: 1px solid rgba(168, 85, 247, 0.4);
    color: #d8b4fe;
    white-space: nowrap;

    &--cl1 {
      background: linear-gradient(135deg, #f59e0b, #b45309);
      border-color: #fbbf24;
      color: #000;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
    }
  }

  &__art {
    width: 44px;
    height: 64px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sort-chain-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__details {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-family: $font-display;
    font-size: 0.92rem;
    font-weight: 700;
    color: #f8fafc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__desc {
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 2px;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-shrink: 0;
  }

  .sort-chain-arrow-btn {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    color: #94a3b8;
    padding: 4px 10px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 120ms ease;

    &:hover:not(:disabled) {
      background: rgba(168, 85, 247, 0.3);
      border-color: #c084fc;
      color: #fff;
    }

    &:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }
  }
}

// Zone Lockdown (SELECT_DISFIELD)
.disfield-selection-status {
  text-align: center;
  margin-bottom: 12px;

  .disfield-counter {
    font-family: $font-display;
    font-size: 0.95rem;
    color: #e2e8f0;

    strong {
      color: #ef4444;
      font-size: 1.1rem;
    }
  }
}

.disfield-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px;
}

.disfield-zone-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 10px;
  background: rgba(15, 23, 42, 0.8);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  cursor: pointer;
  transition: all 160ms cubic-bezier(0.16, 1, 0.3, 1);

  &__icon {
    font-size: 1.5rem;
  }

  &__label {
    font-family: $font-display;
    font-size: 0.82rem;
    font-weight: 700;
    color: #f1f5f9;
    text-align: center;
  }

  &__status {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #64748b;
  }

  &:hover {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(30, 41, 59, 0.9);
    transform: translateY(-2px);
  }

  &--selected {
    border-color: #ef4444 !important;
    background: rgba(239, 68, 68, 0.2) !important;
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.4);

    .disfield-zone-btn__status {
      color: #f87171 !important;
    }
  }
}

.prompt-header__badge {
  &--sort {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.4);
    color: #38bdf8;
  }

  &--disfield {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
  }
}

@keyframes fadeInBackdrop {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
