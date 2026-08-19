<template>
  <div class="kitchen-sink-view">
    <!-- Header -->
    <header class="kitchen-sink-view__header">
      <div style="display: flex; justify-content: space-between; align-items: flex-start">
        <div>
          <h1 class="kitchen-sink-view__title">Design System Kitchen Sink</h1>
          <p class="kitchen-sink-view__subtitle">
            Visual QA and state verification suite for Ancient Duel Arena components, tokens,
            typography, and motion.
          </p>
        </div>
        <router-link
          to="/main-menu"
          class="yugi-btn yugi-btn--secondary yugi-btn--sm"
          style="text-decoration: none; white-space: nowrap"
        >
          ← Return to Main Menu
        </router-link>
      </div>
    </header>

    <div class="kitchen-sink-view__grid">
      <!-- 1. Color Palette & Typography -->
      <section class="kitchen-sink-view__section">
        <h2 class="kitchen-sink-view__section-title">1. Color Palette & Design Tokens</h2>

        <div class="kitchen-sink-view__color-swatches">
          <div
            class="kitchen-sink-view__swatch"
            style="background-color: #0a0c10; border-color: rgba(201, 162, 39, 0.35)"
          >
            <span class="kitchen-sink-view__swatch-name">$color-bg-void</span>
            <span class="kitchen-sink-view__swatch-hex">#0a0c10</span>
          </div>
          <div
            class="kitchen-sink-view__swatch"
            style="background-color: #12161e; border-color: rgba(201, 162, 39, 0.35)"
          >
            <span class="kitchen-sink-view__swatch-name">$color-bg-panel-solid</span>
            <span class="kitchen-sink-view__swatch-hex">#12161e</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #c9a227; color: #1a1406">
            <span class="kitchen-sink-view__swatch-name">$color-gold-500 (Primary)</span>
            <span class="kitchen-sink-view__swatch-hex">#c9a227</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #e3c567; color: #1a1406">
            <span class="kitchen-sink-view__swatch-name">$color-gold-300 (Accent)</span>
            <span class="kitchen-sink-view__swatch-hex">#e3c567</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #f4e4b8; color: #1a1406">
            <span class="kitchen-sink-view__swatch-name">$color-gold-100 (Text)</span>
            <span class="kitchen-sink-view__swatch-hex">#f4e4b8</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #2f80ed; color: #ffffff">
            <span class="kitchen-sink-view__swatch-name">$color-user (Player Blue)</span>
            <span class="kitchen-sink-view__swatch-hex">#2f80ed</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #eb5757; color: #ffffff">
            <span class="kitchen-sink-view__swatch-name">$color-ai (Opponent Red)</span>
            <span class="kitchen-sink-view__swatch-hex">#eb5757</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #3ddc97; color: #1a1406">
            <span class="kitchen-sink-view__swatch-name">$color-success</span>
            <span class="kitchen-sink-view__swatch-hex">#3ddc97</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #f2c94c; color: #1a1406">
            <span class="kitchen-sink-view__swatch-name">$color-warning</span>
            <span class="kitchen-sink-view__swatch-hex">#f2c94c</span>
          </div>
          <div class="kitchen-sink-view__swatch" style="background-color: #56ccf2; color: #1a1406">
            <span class="kitchen-sink-view__swatch-name">$color-info (Cyan Energy)</span>
            <span class="kitchen-sink-view__swatch-hex">#56ccf2</span>
          </div>
        </div>

        <GlassPanel padding="16px" accent="gold" style="margin-top: 12px">
          <h3 style="margin-bottom: 8px">Master Duel Typography Hierarchy</h3>
          <p
            style="
              font-family: 'Oxanium', sans-serif;
              font-weight: 700;
              font-size: 1.75rem;
              color: #e3c567;
            "
          >
            Oxanium Display — Holographic Duel King (28px Bold)
          </p>
          <p
            style="
              font-family: 'Barlow Semi Condensed', sans-serif;
              font-size: 1.05rem;
              color: #f5f1e6;
            "
          >
            Barlow Semi Condensed Body — "When this card is Normal Summoned: You can target 1 Spell
            Card in your GY; add it to your hand." (16px)
          </p>
          <p
            style="
              font-family: 'Barlow Semi Condensed', sans-serif;
              font-size: 0.9rem;
              color: #b8b2a0;
            "
          >
            Barlow Secondary / Muted — Spellcaster / Normal / Level 7 / Dark (14px)
          </p>
          <p
            style="
              font-family: 'Oxanium', sans-serif;
              font-weight: 600;
              font-variant-numeric: tabular-nums;
              font-size: 1.25rem;
              color: #e3c567;
            "
          >
            Oxanium Tabular Numerals: LP 8000 → 4000 | ATK 2500 / DEF 2100 | Turn 07
          </p>
        </GlassPanel>
      </section>

      <!-- 2. GlassPanel Components -->
      <section class="kitchen-sink-view__section">
        <h2 class="kitchen-sink-view__section-title">
          2. GlassPanel (`design-system.md` §4, §5.2)
        </h2>

        <div class="kitchen-sink-view__card-row">
          <GlassPanel style="flex: 1; min-width: 240px">
            <h4>Standard GlassPanel</h4>
            <p class="text-muted">
              14px radius, blur(18px), 1px gold hairline border, inset highlight.
            </p>
          </GlassPanel>

          <GlassPanel elevated style="flex: 1; min-width: 240px">
            <h4>Elevated GlassPanel</h4>
            <p class="text-muted">Deep drop shadow for floating dialogs and modal cards.</p>
          </GlassPanel>

          <GlassPanel accent="gold" style="flex: 1; min-width: 240px">
            <h4>Gold Accent Panel</h4>
            <p class="text-muted">Gold top border for primary game HUD and menu contexts.</p>
          </GlassPanel>

          <GlassPanel accent="user" style="flex: 1; min-width: 240px">
            <h4 class="text-user">User Accent (Blue)</h4>
            <p class="text-muted">Player 0 identity highlight for player zones and hand.</p>
          </GlassPanel>

          <GlassPanel accent="ai" style="flex: 1; min-width: 240px">
            <h4 class="text-ai">AI Accent (Red)</h4>
            <p class="text-muted">Opponent identity highlight for AI zones and graveyard.</p>
          </GlassPanel>
        </div>
      </section>

      <!-- 3. YugiButton Components & States -->
      <section class="kitchen-sink-view__section">
        <h2 class="kitchen-sink-view__section-title">3. YugiButton (`design-system.md` §5.1)</h2>

        <h3>Variants</h3>
        <div class="kitchen-sink-view__row">
          <YugiButton variant="primary"> Primary Button </YugiButton>

          <YugiButton variant="secondary"> Secondary Button </YugiButton>

          <YugiButton variant="danger"> Surrender / Danger </YugiButton>

          <YugiButton variant="ghost"> Ghost Action </YugiButton>
        </div>

        <h3>Sizes & Icons</h3>
        <div class="kitchen-sink-view__row">
          <YugiButton size="sm" icon="⚔️"> Small Action </YugiButton>

          <YugiButton size="md" icon="📜" sublabel="View event stream"> Medium Action </YugiButton>

          <YugiButton size="lg" icon="⚡" sublabel="Duel Monsters"> Large CTA Button </YugiButton>
        </div>

        <h3>Interactive States (Idle / Hover / Active / Disabled / Focus)</h3>
        <div class="kitchen-sink-view__row">
          <Tooltip text="Hover over me to see the foil light-sweep effect!" position="top">
            <YugiButton variant="primary"> Normal (Interactive) </YugiButton>
          </Tooltip>

          <YugiButton variant="primary" disabled> Disabled State (40% + Grayscale) </YugiButton>

          <YugiButton variant="secondary" disabled> Disabled Secondary </YugiButton>

          <YugiButton variant="danger" disabled> Disabled Danger </YugiButton>
        </div>

        <h3>Card-Style Variant (`variant="card"`)</h3>
        <div class="kitchen-sink-view__row">
          <YugiButton variant="card" sublabel="User vs AI Duel">
            <template #header>START DUEL</template>
            <template #art>
              <span style="font-size: 32px">⚔️</span>
            </template>
          </YugiButton>

          <YugiButton variant="card" sublabel="Build Custom Decks">
            <template #header>DECK EDIT</template>
            <template #art>
              <span style="font-size: 32px">🃏</span>
            </template>
          </YugiButton>

          <YugiButton variant="card" sublabel="Opponents & Audio">
            <template #header>SETTINGS</template>
            <template #art>
              <span style="font-size: 32px">⚙️</span>
            </template>
          </YugiButton>

          <YugiButton variant="card" sublabel="Quit Application" disabled>
            <template #header>EXIT GAME</template>
            <template #art>
              <span style="font-size: 32px">🚪</span>
            </template>
          </YugiButton>
        </div>
      </section>

      <!-- 4. Tooltip Component -->
      <section class="kitchen-sink-view__section">
        <h2 class="kitchen-sink-view__section-title">4. Tooltip (`design-system.md` §5.3)</h2>

        <div class="kitchen-sink-view__row">
          <Tooltip text="Dark glass chip with gold border (Top)" position="top">
            <YugiButton variant="secondary" size="sm"> Hover for Top Tooltip </YugiButton>
          </Tooltip>

          <Tooltip text="Tooltip positioned at bottom" position="bottom">
            <YugiButton variant="secondary" size="sm"> Hover for Bottom Tooltip </YugiButton>
          </Tooltip>

          <Tooltip text="Tooltip positioned at left" position="left">
            <YugiButton variant="secondary" size="sm"> Hover for Left Tooltip </YugiButton>
          </Tooltip>

          <Tooltip text="Tooltip positioned at right" position="right">
            <YugiButton variant="secondary" size="sm"> Hover for Right Tooltip </YugiButton>
          </Tooltip>

          <Tooltip position="top" :delay="0">
            <template #content>
              <span style="color: #f2c94c; font-weight: bold">Instant Tooltip:</span> No delay (0ms)
            </template>
            <YugiButton variant="ghost" size="sm"> Rich Slot Tooltip </YugiButton>
          </Tooltip>
        </div>
      </section>

      <!-- 5. IconIndicator Component -->
      <section class="kitchen-sink-view__section">
        <h2 class="kitchen-sink-view__section-title">
          5. IconIndicator — Targeting & Status Glyphs (`design-system.md` §5.5, §7.1, §7.3)
        </h2>

        <h3>Targeting Location Glyphs (6 Locations × 2 Players = 12 Combinations)</h3>
        <div class="kitchen-sink-view__row">
          <!-- User Locations (Blue) -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="hand" owner="user" />
            <span style="font-size: 11px; color: #2f80ed">User Hand</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="field" owner="user" pulsing />
            <span style="font-size: 11px; color: #2f80ed">User Field (Pulse)</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="deck" owner="user" />
            <span style="font-size: 11px; color: #2f80ed">User Deck</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="extra-deck" owner="user" />
            <span style="font-size: 11px; color: #2f80ed">User Extra</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="graveyard" owner="user" />
            <span style="font-size: 11px; color: #2f80ed">User GY</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="banished" owner="user" />
            <span style="font-size: 11px; color: #2f80ed">User Banished</span>
          </div>

          <div
            style="width: 2px; height: 40px; background: rgba(201, 162, 39, 0.3); margin: 0 12px"
          />

          <!-- AI Locations (Red) -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="hand" owner="ai" />
            <span style="font-size: 11px; color: #eb5757">AI Hand</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="field" owner="ai" pulsing />
            <span style="font-size: 11px; color: #eb5757">AI Field (Pulse)</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="deck" owner="ai" />
            <span style="font-size: 11px; color: #eb5757">AI Deck</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="extra-deck" owner="ai" />
            <span style="font-size: 11px; color: #eb5757">AI Extra</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="graveyard" owner="ai" />
            <span style="font-size: 11px; color: #eb5757">AI GY</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="location" location="banished" owner="ai" />
            <span style="font-size: 11px; color: #eb5757">AI Banished</span>
          </div>
        </div>

        <h3>Card Status Glyphs (7 Icons for Previewer & Field Cards)</h3>
        <div class="kitchen-sink-view__row">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="status" status="negated" />
            <span style="font-size: 11px; color: #eb5757">Negated</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="status" status="no-special-summon" />
            <span style="font-size: 11px; color: #f2c94c">No Sp. Summon</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="status" status="temp-banished" />
            <span style="font-size: 11px; color: #bb6bd9">Temp Banished</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="status" status="fusion-material" />
            <span style="font-size: 11px; color: #bb6bd9">Fusion Mat.</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="status" status="synchro-material" />
            <span style="font-size: 11px; color: #ffffff">Synchro Mat.</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="status" status="destroyed-battle" />
            <span style="font-size: 11px; color: #eb5757">Battle Destroyed</span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px">
            <IconIndicator type="status" status="no-attack" />
            <span style="font-size: 11px; color: #f2994a">Cannot Attack</span>
          </div>
        </div>

        <h3>Sizes</h3>
        <div class="kitchen-sink-view__row">
          <IconIndicator type="location" location="field" owner="user" size="sm" />
          <IconIndicator type="location" location="field" owner="user" size="md" />
          <IconIndicator type="location" location="field" owner="user" size="lg" />
        </div>
      </section>

      <!-- 6. YugiModal Component -->
      <section class="kitchen-sink-view__section">
        <h2 class="kitchen-sink-view__section-title">
          6. YugiModal (`design-system.md` §5.4, §7.2)
        </h2>

        <div class="kitchen-sink-view__row">
          <YugiButton variant="primary" @click="showStandardModal = true">
            Open Standard Modal (Cancelable)
          </YugiButton>

          <YugiButton variant="secondary" @click="showGuidanceModal = true">
            Open Guidance Modal (Non-Cancelable)
          </YugiButton>

          <YugiButton variant="danger" @click="showDangerModal = true">
            Open Surrender Confirmation Modal
          </YugiButton>
        </div>

        <!-- Standard Modal -->
        <YugiModal v-model="showStandardModal" title="Activate Card Effect?" accent="gold">
          <p>
            Do you wish to activate the effect of <strong>Dark Magician</strong>? This will trigger
            a chain window where your opponent may respond.
          </p>
          <template #footer="{ close }">
            <YugiButton variant="ghost" size="sm" @click="close"> Cancel </YugiButton>
            <YugiButton variant="primary" size="sm" @click="close"> Activate Effect </YugiButton>
          </template>
        </YugiModal>

        <!-- Guidance / Non-Cancelable Modal -->
        <YugiModal
          v-model="showGuidanceModal"
          title="Mandatory Action Required"
          :cancelable="false"
          accent="user"
        >
          <p>
            <strong>End Phase Hand Cleanup:</strong> You hold 8 cards in your hand. Under official
            Yu-Gi-Oh! rules, you must select 2 cards to discard to the Graveyard before ending your
            turn.
          </p>
          <template #footer="{ close }">
            <YugiButton variant="primary" size="sm" @click="close">
              Understood (Proceed to Discard)
            </YugiButton>
          </template>
        </YugiModal>

        <!-- Danger Modal -->
        <YugiModal v-model="showDangerModal" title="Surrender Duel?" accent="ai">
          <p>
            Are you sure you want to surrender this duel? Your opponent will be declared the winner
            immediately and LP will be set to 0.
          </p>
          <template #footer="{ close }">
            <YugiButton variant="ghost" size="sm" @click="close"> Continue Dueling </YugiButton>
            <YugiButton variant="danger" size="sm" @click="close"> Surrender Duel </YugiButton>
          </template>
        </YugiModal>
      </section>

      <!-- 7. LoadingSpinner Component -->
      <section class="kitchen-sink-view__section">
        <h2 class="kitchen-sink-view__section-title">7. LoadingSpinner (`design-system.md` §5)</h2>

        <div class="kitchen-sink-view__row" style="gap: 32px">
          <LoadingSpinner size="sm" variant="gold" label="Small Gold" />

          <LoadingSpinner
            size="md"
            variant="gold"
            label="Ancient Solar Spinner"
            sublabel="Rotating Pharaoh Sun Disk"
          />

          <LoadingSpinner
            size="lg"
            variant="cyan"
            label="Cyan Holographic Spinner"
            sublabel="Duel Energy Matrix"
          />

          <LoadingSpinner
            size="md"
            variant="ring"
            label="Ring Spinner"
            sublabel="Lightweight Arc"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  GlassPanel,
  YugiButton,
  YugiModal,
  Tooltip,
  IconIndicator,
  LoadingSpinner,
} from '../components/common';

const showStandardModal = ref(false);
const showGuidanceModal = ref(false);
const showDangerModal = ref(false);
</script>
