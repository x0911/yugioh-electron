# Image Prompts — AI-Generated Art Assets

This file is only for **UI/decorative assets you'll generate via an AI image tool** (Midjourney, DALL·E, Stable Diffusion, etc.). It does **not** cover card images (those come from the automated YGOPRODeck download pipeline in Phase 3 — see `architecture.md` §2.2/5.2) or character portraits/pre-duel videos (you said you'll supply those yourself — just drop them into the paths noted in `development-plan.md` Phase 6/8).

For every prompt: generate at the noted dimensions (or larger, then downscale — never upscale), export as PNG with transparency where noted, optimize with an image compressor before committing, and place at the exact destination path so later Coding Agent phases find them without guesswork.

> Style anchor to paste at the start of every prompt below for consistency: _"YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks,."_

## 1. Fullscreen backgrounds

### 1.1 Loading Screen background

**Prompt:** "[style anchor] A vast ruined stone duel arena at dusk, ancient hieroglyph-carved pillars, faint glowing magic circle etched into the floor, mist, empty and atmospheric, wide cinematic shot, 16:9."
**Dimensions:** 2560×1440 minimum.
**Destination:** `resources/backgrounds/loading-bg.jpg`

### 1.2 Main Menu background

**Prompt:** "[style anchor] The same ruined stone duel arena now with two glowing dueling platforms facing each other, swirling energy portals in the sky above, epic scale, wide cinematic shot, 16:9, slightly darker corners to support UI overlay legibility."
**Dimensions:** 2560×1440 minimum.
**Destination:** `resources/backgrounds/main-menu-bg.jpg`

### 1.3 Settings Screen background

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] A grand stone hall lined with silhouetted dueling champions on either side, torches, gold banners, a throne-like central vantage point, wide cinematic shot, 16:9."
**Dimensions:** 2560×1440 minimum.
**Destination:** `resources/backgrounds/settings-bg.jpg`

### 1.4 Deck Edit background (subtle, since most of the screen is UI)

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] A dim archive room full of towering stone card-shelves and floating glowing card silhouettes, very low detail in the center so UI panels remain legible, wide 16:9, moody and quiet."
**Dimensions:** 2560×1440 minimum.
**Destination:** `resources/backgrounds/deck-edit-bg.jpg`

## 2. Coin Toss assets

### 2.1 Coin — Heads face

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] An ornate ancient gold coin face, embossed with a solar/eye motif (an original design, not a specific franchise's Millennium symbol), engraved rim, studio lit, transparent background, centered, front-on view."
**Dimensions:** 1024×1024, PNG with alpha.
**Destination:** `resources/ui/coin-heads.png`

### 2.2 Coin — Tails face

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] An ornate ancient gold coin face, embossed with a crescent/star motif (an original design), engraved rim, studio lit, transparent background, centered, front-on view — visually distinct from the heads design at a glance."
**Dimensions:** 1024×1024, PNG with alpha.
**Destination:** `resources/ui/coin-tails.png`

_(Note: the coin will also be procedurally 3D-flip-animated in CSS/JS between these two flat images plus a thin "edge" sliver frame — see below.)_

### 2.3 Coin — Edge sliver (for the flip animation's mid-rotation frame)

**Prompt:** "A thin gold coin edge cross-section, engraved ridged rim texture, transparent background, simple, minimal."
**Dimensions:** 1024×128, PNG with alpha.
**Destination:** `resources/ui/coin-edge.png`

## 3. Field-location icons (targeting system) — 6 locations × 2 colors = 12 files

Each icon should be a simple, high-contrast, instantly-readable glyph (these get shown small, ~24px, so avoid fine detail). Generate each as a clean line-icon style, then we'll recolor programmatically in-app if a single neutral generation is easier — **either** generate blue and red versions directly, **or** generate one neutral white/gold version per icon and apply a CSS color filter/tint at runtime (recommended: generate neutral, tint in-app, for consistency and half the asset count). Prompt below assumes the **neutral, tinted-in-app** approach; destinations list both the neutral master and the two runtime-tinted output names for clarity if you choose to hand-generate colored versions instead.

**Shared prompt prefix:** "Simple flat icon, minimal line art, single glyph, white on transparent background, centered, small-scale legible design, no gradients, no text —"

1. **Hand** — "...a stylized open hand holding a card." → `resources/ui/icons/location-hand.png`
2. **Field** — "...a stylized dueling-zone tile/octagon symbol." → `resources/ui/icons/location-field.png`
3. **Deck** — "...a stylized stacked card deck symbol." → `resources/ui/icons/location-deck.png`
4. **Extra Deck** — "...a stylized stacked card deck symbol with a small star/spark accent to distinguish it from the main deck icon." → `resources/ui/icons/location-extra-deck.png`
5. **Graveyard** — "...a stylized tombstone or skull-and-crossbones-free grave marker symbol (no skull, keep it kid-friendly — a simple headstone silhouette)." → `resources/ui/icons/location-graveyard.png`
6. **Banished** — "...a stylized swirling void/portal symbol suggesting removal from play." → `resources/ui/icons/location-banished.png`

**Dimensions:** 128×128, PNG with alpha, each.
**Runtime tint:** apply `$color-user` (blue) or `$color-ai` (red) from `design-system.md` via CSS `filter` or an SVG-based recolor at render time, per whether the eligible target belongs to the user or the AI.

## 4. Card status icons — 7 icons

Same "neutral, tint-free" style (these are informational, not ownership-colored, so generate once each, no red/blue variant needed — use `$color-warning`/`$color-danger`-style single accent as appropriate per icon, decided in-app).

**Shared prompt prefix:** "Simple flat icon, minimal line art, single glyph, white on transparent background, centered, small-scale legible design, no gradients, no text —"

1. **Effect Negated** — "...a shield icon with a diagonal slash through it." → `resources/ui/icons/status-negated.png`
2. **Cannot Be Special Summoned** — "...a rising-star icon with a diagonal slash through it." → `resources/ui/icons/status-no-special-summon.png`
3. **Temporarily Banished** — "...a swirling void/portal icon with a small clock/hourglass accent to indicate temporary." → `resources/ui/icons/status-temp-banished.png`
4. **Used as Fusion Material** — "...two overlapping card silhouettes merging into a swirl, suggesting fusion." → `resources/ui/icons/status-fusion-material.png`
5. **Used as Synchro Material** — "...a card silhouette dissolving into rising sparkles/rings, suggesting synchro." → `resources/ui/icons/status-synchro-material.png`
6. **Destroyed by Battle** — "...a crossed-swords icon with a small crack/shatter accent." → `resources/ui/icons/status-destroyed-battle.png`
7. **Cannot Attack** — "...a sword icon with a diagonal slash through it." → `resources/ui/icons/status-no-attack.png`

**Dimensions:** 128×128, PNG with alpha, each.

## 5. Main Menu button emblems (small icon per button, left of the label)

**Shared prompt prefix:** "Simple flat emblem icon, gold linework on transparent background, ornate but small-scale legible, centered —"

1. Start Duel — "...crossed dueling blades emblem." → `resources/ui/icons/menu-start-duel.png`
2. Deck Edit — "...a stylized card-stack-with-pencil emblem." → `resources/ui/icons/menu-deck-edit.png`
3. Settings — "...an ornate gear/cog emblem with subtle Egyptian filigree." → `resources/ui/icons/menu-settings.png`
4. Exit Game — "...a stylized closing-door or portal-closing emblem." → `resources/ui/icons/menu-exit.png`

**Dimensions:** 256×256, PNG with alpha, each.

## 6. Duel HUD icons

1. **Menu button (in-duel)** — "...an ornate hamburger-menu-replacement glyph, three horizontal lines styled as ornamental gold bars." → `resources/ui/icons/hud-menu.png`
2. **Duel Log toggle** — "...a stylized open scroll icon." → `resources/ui/icons/hud-duel-log.png`
3. **Field Status button** — "...a stylized eye-over-field/map icon." → `resources/ui/icons/hud-field-status.png`
4. **Activation Confirmation toggle** — "...a stylized checkmark-in-diamond icon." → `resources/ui/icons/hud-activation-confirm.png`

**Dimensions:** 128×128, PNG with alpha, each.

## 7. App icon / window icon

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] A bold, simple emblem combining a dueling-arena motif and a card silhouette, suitable as a small app/taskbar icon, high contrast, readable at 32px, centered, no background (transparent), original design not imitating any existing game's logo."
**Dimensions:** 1024×1024, PNG with alpha (then generate the full icon set — .ico for Windows, .icns for macOS — via `electron-builder`'s icon pipeline from this master).
**Destination:** `build/icon-master.png` (source for `electron-builder`'s platform icon generation, per its documented icon config).

## 8. Card-back texture (used for Set monsters, face-down Spell/Trap, Deck/Extra Deck stacks, opponent's hand)

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] An ornate symmetrical card-back pattern, dark obsidian base with a central glowing gold emblem (an original geometric/eye-adjacent design, not imitating any specific existing card game's back), fine filigree border, flat front-on view, no perspective, seamless-feeling symmetrical design."
**Dimensions:** 512×716 (standard card aspect ratio at higher-than-needed res for crisp downscaling), PNG.
**Destination:** `resources/ui/card-back.png`

## 9. Fallback "image unavailable" card art

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] A simple cracked-stone-tablet icon centered on a plain dark card-shaped background, suggesting a missing/unavailable image, understated, not alarming."
**Dimensions:** 512×716, PNG.
**Destination:** `resources/ui/card-image-missing.png`

## 10. Character portrait frame (decorative frame around user-supplied character portraits in Settings/OpponentCarousel)

[style anchor] = "YuGiOh - Dark fantasy Egyptian trading-card-game aesthetic, obsidian stone and aged gold, dramatic rim lighting, glowing cyan-gold energy accents, painterly digital illustration, high detail, cinematic, no text, no logos, no watermarks".
**Prompt:** "[style anchor] An ornate gold picture-frame border only (transparent center where a portrait photo will be placed), Egyptian-motif filigree corners, suitable to overlay on top of a character cutout image."
**Dimensions:** 800×1000, PNG with a transparent center cutout matching that aspect ratio.
**Destination:** `resources/ui/character-frame.png`

---

### A note on card images specifically

Per `architecture.md` §2.2 and §5.2, actual **Yu-Gi-Oh! card images (full/art/mini)** are **not** AI-generated — they're sourced automatically from the YGOPRODeck API by the Phase 3 build script, since these need to be the real, recognizable official card artwork for the game to function as a Yu-Gi-Oh! game. Nothing in this file should be used to attempt to regenerate card artwork.
