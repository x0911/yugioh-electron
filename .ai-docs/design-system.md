# Design System — YGO Desktop Duel

Companion to `architecture.md`. This defines the **premium UI/UX visual language** used across every screen, so all phases (built in separate Coding Agent sessions) stay visually consistent.

## 1. Visual identity

Theme: **"Ancient Duel Arena"** — obsidian/onyx dark backgrounds, aged-gold and papyrus accents, glowing cyan/amber energy effects reminiscent of Duel Monsters holograms, glassmorphism panels that feel like translucent stone tablets lit from within. Reference the attached field screenshots (image 1 & 2) for the arena floor styling already established by the game reference — our UI chrome (menus, panels, buttons) should feel like it belongs in that world without imitating any copyrighted logo/character art directly.

## 2. Color palette (SCSS tokens in `_variables.scss`)

```scss
// Base
$color-bg-void: #0a0c10; // fullscreen background base, behind imagery
$color-bg-panel: rgba(18, 22, 30, 0.55); // glass panel fill
$color-bg-panel-solid: #12161e; // fallback for non-glass contexts (e.g. dev tools)
$color-border-glass: rgba(201, 162, 39, 0.35); // gold hairline on glass edges

// Gold / brand accent (buttons, headers, card frames)
$color-gold-100: #f4e4b8;
$color-gold-300: #e3c567;
$color-gold-500: #c9a227; // primary brand gold
$color-gold-700: #8c6e16;
$color-gold-900: #4a3a0c;

// Player identity colors (used everywhere: LP bars, targeting icons, zone highlights)
$color-user: #2f80ed; // blue — matches "blue icon" requirement for user-owned targets
$color-user-glow: rgba(47, 128, 237, 0.55);
$color-ai: #eb5757; // red — matches "red icon" requirement for AI-owned targets
$color-ai-glow: rgba(235, 87, 87, 0.55);

// Semantic
$color-success: #3ddc97;
$color-warning: #f2c94c;
$color-danger: #eb5757;
$color-info: #56ccf2;

// Text
$color-text-primary: #f5f1e6;
$color-text-secondary: #b8b2a0;
$color-text-muted: #756f60;
$color-text-on-gold: #1a1406;
```

## 3. Typography (Master Duel / Holographic Gaming Palette)

- **Display / headers / buttons** (menu titles, "Duel King" banners, screen titles, CTAs): **"Oxanium"** (Bold 700 / ExtraBold 800) — an angular, chamfered techno-futuristic gaming display font matching Master Duel's energetic holographic duel UI. Always set in `$color-gold-300` with subtle text-shadow glow on dark backgrounds.
- **UI / body / card rules** (buttons, card text, dialogs, filters): **"Barlow Semi Condensed"** (Regular 400, Medium 500, SemiBold 600, Bold 700) — a crisp, condensed gaming typeface providing high readability for lengthy card effects. Card _rules text_ is crisp and dense without overflowing card text boxes.
- **Numeric** (LP counters, ATK/DEF, counters): **"Oxanium"** with tabular numerals (`font-variant-numeric: tabular-nums`) so digits don't jiggle when LP changes, mimicking physical/digital duel disk scoreboards.
- Scale (rem, base 16px): `--fs-xs: 0.75rem; --fs-sm: 0.875rem; --fs-base: 1rem; --fs-md: 1.125rem; --fs-lg: 1.375rem; --fs-xl: 1.75rem; --fs-2xl: 2.25rem; --fs-display: 3rem;`


## 4. Glassmorphism recipe (use everywhere a "panel" floats over a background)

```scss
@mixin glass-panel(
  $tint: $color-bg-panel,
  $border: $color-border-glass,
  $blur: 18px
) {
  background: $tint;
  backdrop-filter: blur($blur) saturate(140%);
  -webkit-backdrop-filter: blur($blur) saturate(140%);
  border: 1px solid $border;
  border-radius: 14px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

- Always pair glass panels with a **fullscreen background image** (blurred/darkened via an `::before` overlay gradient, `rgba(10,12,16,0.55)` → `0.75` bottom) so text stays legible regardless of the underlying art's brightness.
- Never stack more than 2 layers of glass on top of each other (perf + legibility).

## 5. Core components

### 5.1 YugiButton (primary interactive element, used for Main Menu + most CTAs)

- Shape: a **card-inspired panel** — rounded-rect (10–14px radius), gold 1.5px border, subtle inner glass, an icon or small emblem on the left, label in display font.
- States:
  - **Idle**: gold border at 35% opacity, text `$color-gold-100`.
  - **Hover**: border brightens to `$color-gold-500` full opacity, gentle scale (1.02), inner glow, an animated light-sweep across the surface (like a foil card catching light) — 400ms ease.
  - **Active/pressed**: scale 0.98, glow intensifies briefly.
  - **Disabled**: desaturated, 40% opacity, no hover response.
  - **Focus-visible** (keyboard): 2px `$color-info` outline offset 2px, for accessibility.
- Optional "clickable card" variant for Main Menu: full card-frame silhouette (like a spell/trap card back) with the button label where the card name would sit — used if you want the extra flourish described in the brief.

### 5.2 GlassPanel

- Wraps `@include glass-panel()`. Props: `tint`, `padding`, `elevated` (adds stronger shadow), `accent` (`gold|user|ai|none` — tints the top border to signal context, e.g. `ai` accent on the AI hand panel).

### 5.3 Tooltip

- Dark glass chip, gold hairline, small arrow/caret, appears on `mouseenter` after a short delay (150ms) to avoid flicker, fades in/out 120ms. Used for: field-location icons, status icons, disabled-button explanations, filter labels in Deck Edit.

### 5.4 YugiModal

- Center-screen glass panel, dimmed/blurred backdrop (`backdrop-filter` on the underlying app, or a semi-opaque scrim if perf-constrained), gold-bordered header bar with title + close (only when the action is user-cancelable — many duel guidance dialogs are **not** cancelable, see §7).

### 5.5 IconIndicator (field-location & status icons)

- 24–28px glyphs on a small circular/hex glass badge. Color-coded per `$color-user`/`$color-ai` for location icons (see `images-prompts.md` for the actual 12 + 7 icon briefs). Hover → Tooltip.

### 5.6 CardPreviewPopup (side popup on hover, matches attached reference image 3)

- Docked to the side of the screen the hovered card is _not_ near (auto-flip left/right to avoid covering the field), glass panel, full card art at top (rounded corners, subtle drop shadow), then a structured info block below: name, type/attribute/level icons row, ATK/DEF, race, card text, then (only if the card is currently on the field and selected) the **status icon row** described in §7.3.
- Must render within ~1 frame of hover to feel responsive; image already resident from mini/preload cache.

## 6. Field & zone visuals

- Zones map 1:1 to the reference screenshots' stone-octagon tile motif; empty zones show a faint glowing outline in the **owner's identity color at 15% opacity** (blue for user zones, red for AI zones) so the board's ownership is legible even before cards are present — reinforces the same blue/red language used for targeting icons.
- **Card back**: matches the community-recognizable dark swirl card-back style already visible in the reference art (image 1, deck zones) — used for face-down Spell/Trap, Set monsters, and any card in Deck/Extra Deck/opponent's hand.
- **Monster position rendering** (see rules in `development-plan.md` §Yu-Gi-Oh Visual & Procedural Rules for full detail, summarized here for visual spec):
  - Face-up Attack: full card, vertical (portrait) orientation, art visible.
  - Face-up Defense: full card, **rotated 90°** (landscape), art visible.
  - Face-down Defense ("set"): **rotated 90°** (landscape) **and** showing the card back, not the art — this is the single most commonly gotten-wrong visual in fan projects; landscape + back.
  - Face-down "set" Spell/Trap: portrait orientation, card back.
  - Transition between any of these states animates as a **quick 3D flip/rotate** (200–260ms) rather than an instant swap, so the player visually tracks what changed.

## 7. Duel guidance system ("kid-proofing" the UX)

This is a **cross-cutting design requirement**, not a single component — every phase touching duel interaction must implement it.

### 7.1 Action Guide Banner

- A persistent, non-intrusive glass strip pinned near the top-center of the duel field (above the field, below opponent's info) that always states, in plain language, whose turn/phase it is and — critically — **what the next click will do** whenever the game is mid-effect, e.g.:
  - _"Select a monster to destroy — click any monster on the field."_
  - _"Choose 1 card in your hand to send to the Graveyard."_
  - _"Select where to Special Summon this monster."_
- While such a prompt is active, **eligible targets get the blue/red IconIndicator + a pulsing highlight ring**; ineligible zones are dimmed slightly (not hidden — player should understand _why_ something isn't selectable, via tooltip: "This card cannot be selected as a target").

### 7.2 Confirmation micro-dialogs

- Before an _irreversible, player-chosen_ action commits (activating an effect, declaring an attack, choosing a summon method when multiple are legal), a small glass confirmation chip appears near the cursor/card: **"Activate [Card Name]'s effect?"** with Confirm/Cancel — but only when the engine allows cancellation at that decision point (many engine prompts are not cancelable once entered; in that case we skip the confirm chip and go straight to the Action Guide Banner instructing the next click, to avoid implying a cancel path that doesn't exist).

### 7.3 Status icon row

- Shown under the CardPreviewPopup's info block when a field card is selected, left-to-right, only the icons that currently apply (see `images-prompts.md` for the 7 glyphs): Effect Negated, Cannot Be Special Summoned, Temporarily Banished, Used as Fusion Material, Used as Synchro Material, Destroyed by Battle (historical, shown briefly in GY context), Cannot Attack.

## 8. Motion & animation principles

- Standard easing: `cubic-bezier(0.22, 1, 0.36, 1)` (snappy-out) for UI entrances; `ease-in-out` for looping ambient effects (glow pulses).
- Standard durations: micro (icon/hover) 120–180ms, component (panel open, card flip) 200–320ms, screen transition 400–600ms (cross-fade + slight scale, never a jarring hard cut between full screens).
- Card movement between zones (draw, summon, send to GY): animate along a curved path (not a straight teleport) at ~350–450ms so the eye can follow it — important for a "kid playing" audience to track board state changes.
- Attack/direct-attack and full-screen special-summon videos are the _only_ full-screen-takeover motion; everything else stays within its component bounds so the rest of the board remains legible.

## 9. Layout & spacing

- 8px base spacing unit (`--space-1: 4px` … `--space-8: 64px`).
- Duel screen is a fixed-aspect (16:9) game canvas that letterboxes on other aspect ratios rather than reflowing the field (field geometry must stay consistent/predictable) — chrome (menu button, life totals, hand) can be responsive around it.
- Deck Edit's 3-column layout: Col-1 (deck lists) ~22%, Col-2 (all cards grid) ~48%, Col-3 (previewer) ~30%, all independently scrollable, min-width guards with horizontal scroll fallback below a defined breakpoint (desktop-first app; a hard minimum window size, e.g. 1280×800, is enforced at the Electron `BrowserWindow` level rather than fully reflowing to mobile sizes).

## 10. SCSS architecture (7-1 pattern)

```
assets/styles/
  abstracts/      _variables.scss _mixins.scss _functions.scss _placeholders.scss
  base/           _reset.scss _typography.scss _animations.scss
  components/     _button.scss _panel.scss _modal.scss _tooltip.scss _icon.scss ...
  layout/         _grid.scss _header.scss ...
  pages/          _menu.scss _deck-edit.scss _duel.scss ...
  themes/         _dark.scss (only theme for v1, structured for future light/alt themes)
  vendor/         (third-party overrides only, minimal)
  main.scss       // forwards everything via @use/@forward, no @import
```

- Use Sass modules (`@use`/`@forward`), not the deprecated global `@import`.
- BEM-ish class naming for component internals (`.yugi-button__icon--active`) to keep specificity flat and predictable; avoid deep nesting (>3 levels) per performance/maintainability best practice.
- No inline styles except for computed/dynamic values (e.g. an icon's live rotation angle) that genuinely can't be a class.

## 11. Accessibility & polish baseline

- All interactive elements keyboard-reachable with visible focus states (even though primary input is mouse, for review/testing convenience and general good practice).
- Color is never the _only_ signal (blue/red target icons are also differently _shaped/labeled_ via tooltip, for colorblind users).
- Respect `prefers-reduced-motion` by shortening/removing non-essential decorative animation (keep functional ones like flip-to-reveal, since they convey state).
