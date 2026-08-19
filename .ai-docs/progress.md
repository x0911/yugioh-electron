# Project Progress & Memory

## Phase 0 — Environment & Engine Spike — 2026-08-19

**Status:** Complete

**What was built:**
- Initialized repository baseline with `.gitignore`, TypeScript configuration (`tsconfig.json`), and `package.json` with `npm run spike` script.
- Investigated, benchmarked, and integrated `ocgcore-wasm` v0.1.2 (built from `edo9300/ygopro-core` / ProjectIgnis EDOPro core, engine version 11.0).
- Created a standalone engine spike tool (`tools/engine-spike/`) with:
  - Sample card database (`cards.ts`) covering Normal Monsters (Celtic Guardian, Summoned Skull, Dark Magician, Blue-Eyes White Dragon), Effect Monsters (Kuriboh, Man-Eater Bug, Sangan), Normal Spells (Pot of Greed, Hinotama, Raigeki, Dark Hole, Ookazi, Sparks), and Normal Traps (Trap Hole, Just Desserts).
  - Base Lua runtime helper scripts (`constant.lua`, `utility.lua`, `proc_*.lua`) and sample official card scripts in `scripts/`.
  - Robust auto-responder (`autoResponder.ts`) supporting all `MSG_SELECT_*` engine prompt types, including relative player perspective bitmask decoding for `SELECT_PLACE` / `SELECT_DISFIELD`.
  - Comprehensive spike runner (`run.ts`) executing an automated, end-to-end 40-card mock duel with real-time message stream decoding (draws, summons, spell/trap activations, chain resolution, battle clashes, damage calculation, LP updates, and victory detection).

**Files added/changed:**
- `.gitignore`: Configured ignored files (node_modules, dist, .ai-docs, resources/cards/, etc.)
- `package.json` & `package-lock.json`: Added `ocgcore-wasm`, `tsx`, `typescript`, `@types/node`, and `spike` script.
- `tsconfig.json`: Strict TypeScript configuration.
- `tools/engine-spike/cards.ts`: Hand-crafted sample card definitions and bitmasks.
- `tools/engine-spike/autoResponder.ts`: Engine prompt auto-responder and field mask decoder.
- `tools/engine-spike/run.ts`: Main duel spike simulation runner and logger.
- `tools/engine-spike/scripts/*`: Base Lua constants and utility scripts plus sample card scripts.

**Decisions made / deviations from the plan:**
- **WASM Engine Choice**: Verified `ocgcore-wasm` (v0.1.2) built from `edo9300/ygopro-core`. Both synchronous (`{ sync: true }`) and asynchronous (JSPI) modes are supported. For our Electron Main process architecture, the synchronous API was chosen as the primary engine mode because it eliminates JSPI/experimental flag requirements (`--experimental-wasm-stack-switching`) and provides deterministic, microsecond-latency turn processing in Node.js.
- **Base Script Initialization**: When initializing duels, `constant.lua` and `utility.lua` must be loaded into the duel handle via `lib.loadScript()` (or via `c0.lua`). Card scripts referencing `GetID()` rely on `utility.lua`'s `self_table, self_code` globals.
- **Field Mask Decoding**: In `ygopro-core`, `SELECT_PLACE` and `SELECT_DISFIELD` bitmasks are indexed relative to the selecting player's perspective (bits 0..4 = selecting player's MZONE, bits 8..12 = selecting player's SZONE, bits 16..20 = opponent's MZONE, bits 24..28 = opponent's SZONE).
- **Target Versions Pinned**:
  - Node.js: >= 20.x LTS / current 22.x+ (tested on Node v25.6.1)
  - Electron: 34.x / 35.x (Chromium 134+, Node 22+)
  - `ygopro-core`: `edo9300/ygopro-core` engine v11.0 via `ocgcore-wasm` v0.1.2
- **Runtime Asset Locating Strategy**:
  - Dev mode: `path.resolve(process.cwd(), 'resources/...')`
  - Packaged Electron: `path.join(process.resourcesPath, 'resources/...')` (configured via `extraResources` in `electron-builder`)

**Known issues / TODO carried to next phase:**
- Phase 1 will scaffold the full Electron + Vue 3 + Pinia + SCSS application shell.
- Phase 2 will implement `DuelEngineService` in `src/main/engine/` and build the full card pool filtering pipeline from `cards.cdb`.

**How to manually verify this phase:**
- Run `npm run spike` in terminal and confirm the 40-card duel simulation executes, logs each turn, phase, summon, spell activation, battle clash, and terminates with `[PASS] Phase 0 Spike successfully validated ygopro-core execution in Node.js!`.

## Phase 1 — Project Scaffolding — 2026-08-19

**Status:** Complete

**What was built:**
- Scaffolded the complete Electron + Vue 3 + TypeScript + SCSS + Pinia application shell matching `architecture.md` §3's folder structure (`src/main/`, `src/preload/`, `src/renderer/`, `src/shared/`).
- Configured Electron Main process (`src/main/index.ts`) with security best practices: `contextIsolation: true`, `nodeIntegration: false`, `webSecurity: true`, `sandbox: true`, minimum window boundaries (1280×800), and blocked unhandled popup navigations.
- Implemented IPC handlers (`src/main/ipc/index.ts`) and typed bridge layer in `src/preload/index.ts` via `contextBridge.exposeInMainWorld` (`window.duelAPI`, `window.deckAPI`, `window.settingsAPI`, `window.appAPI`).
- Created SCSS 7-1 modular design architecture in `src/renderer/assets/styles/` with "Ancient Duel Arena" tokens, colors, glassmorphism mixins, typography, and animation keyframes.
- Installed and configured Vue Router with routes for all 7 screens (`/`, `/main-menu`, `/settings`, `/deck-edit`, `/coin-toss`, `/pre-duel-video`, `/duel`), each displaying a placeholder card indicating its target phase.
- Built a temporary top Dev Navigation bar linking all 7 routes to enable immediate click-through verification across screens.
- Created typed Pinia store skeletons: `duelStore.ts`, `uiStore.ts`, `deckEditStore.ts`, `settingsStore.ts`, and `devToolsStore.ts`.
- Configured ESLint (flat config with `@eslint/js`, `typescript-eslint`, `eslint-plugin-vue`, `eslint-config-prettier`), Prettier, `.editorconfig`, and strict TypeScript settings across the monorepo.
- Configured `package.json` scripts: `dev`, `build`, `spike`, `lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `download:cards` (stub), and `rebuild:native`.

**Files added/changed:**
- `.editorconfig`, `.prettierrc`, `.prettierignore`, `eslint.config.js`, `tsconfig.json`, `vite.config.ts`
- `package.json` & `package-lock.json`
- `scripts/build.ts`, `scripts/dev.ts`, `scripts/stub-download.ts`
- `src/shared/types/ipc.ts`, `src/shared/types/duel.ts`, `src/shared/types/index.ts`, `src/shared/constants/index.ts`
- `src/preload/index.ts`
- `src/main/index.ts`, `src/main/ipc/index.ts`
- `src/renderer/env.d.ts`, `src/renderer/index.html`, `src/renderer/main.ts`, `src/renderer/App.vue`, `src/renderer/router/index.ts`
- `src/renderer/stores/duelStore.ts`, `src/renderer/stores/uiStore.ts`, `src/renderer/stores/deckEditStore.ts`, `src/renderer/stores/settingsStore.ts`, `src/renderer/stores/devToolsStore.ts`, `src/renderer/stores/index.ts`
- `src/renderer/views/LoadingView.vue`, `src/renderer/views/MainMenuView.vue`, `src/renderer/views/SettingsView.vue`, `src/renderer/views/DeckEditView.vue`, `src/renderer/views/CoinTossView.vue`, `src/renderer/views/PreDuelVideoView.vue`, `src/renderer/views/DuelView.vue`
- `src/renderer/assets/styles/abstracts/*`, `base/*`, `components/*`, `layout/*`, `pages/*`, `themes/*`, `vendor/*`, `main.scss`

**Decisions made / deviations from the plan:**
- **Preload Output Format**: Preload script is compiled to CommonJS (`dist/preload/index.cjs`) using `esbuild` for universal compatibility with Electron's `contextBridge` and sandboxed preload loader, while main process runs as ES module (`dist/main/index.js`).
- **Modern Sass API**: Configured `api: 'modern'` in `vite.config.ts` with `sass` / `sass-embedded` to ensure modern Sass `@use`/`@forward` module loading.

**Known issues / TODO carried to next phase:**
- **TODO (Temporary Dev Nav)**: Remove or gate the top dev navigation bar before Phase 14 finalizes packaging.
- Phase 2 will implement `DuelEngineService` in `src/main/engine/` and build the full card pool filtering pipeline from `cards.cdb`.

**How to manually verify this phase:**
- Run `npm run dev` to launch the Electron application.
- Verify the Ancient Duel Arena styled window opens at 1600×900.
- Click each of the 7 links in the top dev navigation bar to confirm clean navigation.

## Phase 2 — Engine Integration & Card Pool — 2026-08-19

**Status:** Complete

**What was built:**
- Built the engine subsystem in `src/main/engine/`:
  - `CardReaderService` (`cardReader.ts`): Queries `resources/cards.cdb` via `better-sqlite3` with prepared statement caching, mapping SQLite records to `ocgcore-wasm` `OcgCardData` bitmasks (types, attributes, races, setcodes, level, attack, defense).
  - `ScriptReaderService` (`scriptReader.ts`): Provides cached loading for `c0.lua`, base runtime Lua scripts (`constant.lua`, `utility.lua`, `proc_*.lua`), and official card scripts (`official/c<id>.lua`).
  - `MessageDecoder` (`messageDecoder.ts`): Decodes binary/raw `OcgMessage` structs into typed JavaScript duel events (`DecodedDuelEvent`) with human-readable descriptions, card name resolution, prompt detection, and "first legal option" auto-responder logic.
  - `ViewFilterService` (`viewFilter.ts`): Implements structural anti-cheat information hiding, redacting private information (opponent unrevealed hand cards, deck ordering, face-down field cards) before IPC transmission.
  - `DuelEngineService` (`DuelEngineService.ts`): Singleton service managing `ocgcore-wasm` sync lifecycle, duel creation, deck population, turn processing loop, response dispatching, auto-play control, and live event forwarding over IPC.
- Curated `data/set-code-whitelist.json`:
  - 63 Duel Monsters (DM) era set codes: Boosters (`LOB` through `FET`), Starter Decks (`SDY`–`SKE`), Structure Decks (`SD1`–`SD8`), Tournament Packs (`TP1`–`TP8`), Dark Beginning/Revelation (`DB1`, `DB2`, `DR1`, `DR2`), tins, and video game promos.
  - 66 Yu-Gi-Oh! GX era set codes: Boosters (`TLM` through `LODT`), Duelist Packs (`DP1`–`DP07`), Starter Decks (`YSD`, `YSDJ`, `YSDS`), Structure Decks (`SD09`–`SDDE`), `DR3`, `DR04`, `GLD1`, `RP01`, `PP01`, `PP02`, champion packs, tins, and manga/game promos.
  - Excluded all post-GX eras and modern mechanics (Synchro, Xyz, Pendulum, Link).
- Built automated card pipeline script `scripts/build-card-pool.ts` (`npm run build:cards`):
  - Fetched ProjectIgnis/BabelCDB master `cards.cdb` (7.54 MB) and YGOPRODeck API metadata (14,516 cards).
  - Filtered 2,826 legal cards belonging to DM & GX eras.
  - Generated filtered SQLite database `resources/cards.cdb` (784 KB) with `datas` and `texts` tables.
  - Synced base Lua runtime scripts and downloaded 2,414 official card scripts into `resources/scripts/official/`.
  - Emitted `data/card-pool-whitelist.json` mapping all 2,826 card IDs to metadata, stats, and era tags (`DM` vs `GX`).
- Wired IPC channels end-to-end (`src/main/ipc/index.ts` and `src/preload/index.ts`):
  - `duel:new`, `duel:command`, `duel:event`, `duel:step`, `duel:set-autoplay`, `duel:get-state`, `duel:get-card-name`.
- Built interactive Debug Duel Arena View in `src/renderer/views/DuelView.vue`:
  - Start Duel buttons for classic DM matchup (Yugi vs Kaiba) and GX matchup (Jaden vs Zane).
  - Live scoreboard showing Player 0 LP vs Player 1 LP with health bars.
  - Turn number, active phase indicator, and waiting prompt notification.
  - "Next Step", "Auto-Play Duel", and "Clear Log" controls.
  - Real-time scrollable live duel event log stream with real card names and battle clash summaries.
  - Victory banner announcing winner and victory reason.
- Validated real duel execution on the 2,826 card pool with `tools/test-engine-duel.ts` running to completion (572 events, 10 turns, victory detected).

**Files added/changed:**
- `data/set-code-whitelist.json`
- `data/card-pool-whitelist.json`
- `scripts/build-card-pool.ts`
- `package.json` & `package-lock.json`
- `resources/cards.cdb`
- `resources/scripts/*` (base scripts + 2,414 official card scripts)
- `src/main/engine/cardReader.ts`
- `src/main/engine/scriptReader.ts`
- `src/main/engine/messageDecoder.ts`
- `src/main/engine/viewFilter.ts`
- `src/main/engine/DuelEngineService.ts`
- `src/main/engine/index.ts`
- `src/main/ipc/index.ts`
- `src/preload/index.ts`
- `src/shared/types/duel.ts`
- `src/shared/types/ipc.ts`
- `src/renderer/views/DuelView.vue`
- `tools/test-engine-duel.ts`

**Decisions made / deviations from the plan:**
- **Vanilla / Normal Monsters**: Normal monsters (412 cards in the filtered pool) do not have separate Lua effect scripts in `ygopro-scripts` because their core mechanics (Normal Summon, Tribute, Battle) are handled natively by the C++ engine core based on `TYPE_NORMAL` from `cards.cdb`. The download pipeline and `ScriptReaderService` handle 404 responses for normal monsters cleanly without error.
- **Iconic Anime Staples (God Cards)**: Slifer the Sky Dragon (`10000020`), Obelisk the Tormentor (`10000000`), and The Winged Dragon of Ra (`10000010`) were explicitly allowlisted so their official tournament-legal scripts are included in the pool even though their initial release in Japan was non-standard.
- **Card Pool Boundaries**: Final DM + GX pool locked at 2,826 unique cards (63 DM set codes, 66 GX set codes).

**Known issues / TODO carried to next phase:**
- Phase 3 will implement `scripts/download-card-images.ts` to fetch and optimize the 3 image variants (`full`, `art`, `mini`) for all 2,826 card IDs in `data/card-pool-whitelist.json`.
- Temporary Dev Nav bar remains available for quick cross-screen testing until Phase 14 packaging.

**How to manually verify this phase:**
1. Run `npm run dev` to start Vite and Electron.
2. In the top Dev Navigation bar, click **"Duel (P9)"** (or navigate to `/duel`).
3. Click **"▶ Start Duel (Yugi vs Kaiba — DM Era)"** or **"▶ Start Duel (Jaden vs Zane — GX Era)"**.
4. Click **"⚡ Auto-Play Duel"** to watch the real-time duel simulation execute at 50ms intervals, or click **"⏩ Next Step"** to step through manually.
5. Verify real card names appear in the live log (e.g. *Dark Magician*, *Summoned Skull*, *Lady Panther*, *Just Desserts*, *Hinotama*, *Restructer Revolution*).
6. Verify the LP bars and numbers update in real-time as damage is dealt, and a green victory banner announces the winner when a player reaches 0 LP.

## Phase 3 — Asset Pipeline — 2026-08-19

**Status:** Complete

**What was built:**
- Created robust, resumable card image downloader (`scripts/download-card-images.ts`) with:
  - Global token-bucket rate limiter enforcing $\le 18\text{ req/s}$ (strictly compliant with YGOPRODeck CDN $\le 20\text{ req/s}$ limit).
  - Resumable skip logic checking existing non-zero files before issuing network calls.
  - Multi-worker concurrency pool (default: 10 workers) with real-time ETA, download speed, and progress reporting.
  - Exponential backoff retries on network/HTTP 429/5xx errors (up to 4 attempts).
  - Automated fallback placeholder insertion if an image variant fails permanently.
  - CLI options for selective batching (`--limit <N>`), force redownload (`--force`), and custom concurrency (`--concurrency <N>`).
- Integrated Sharp image processing pipeline:
  - Re-encodes `mini` card variant from CDN small images to a fixed $96 \times 140\text{ px}$ progressive JPEG with Lanczos-3 resampling for smooth 60fps rendering in Deck Edit virtualized grids.
  - Populates `resources/cards/full` ($813 \times 1185\text{ px}$), `resources/cards/art` ($624 \times 624\text{ px}$), and `resources/cards/mini` ($96 \times 140\text{ px}$).
- Sourced and optimized official card-back & placeholder assets:
  - `resources/cards/card-back.jpg` & `resources/ui/card-back.png`: Official high-resolution Yu-Gi-Oh! card back asset (swirl vortex & logo) sourced directly from official server/CDN.
  - `resources/cards/placeholder.jpg` & `0.jpg` in `full/`, `art/`, and `mini/`: High-resolution "Card Image Unavailable" fallback assets ensuring no broken image icons ever appear in the UI.
- Scaffolded self-hosted web fonts in `resources/fonts/` and `src/renderer/assets/fonts/`:
  - **Cinzel** (Regular 400, SemiBold 600, Bold 700) for Display / Headers.
  - **Inter** (Regular 400, Medium 500, SemiBold 600, Bold 700) for UI, Body, and Tabular Numerals (`font-variant-numeric: tabular-nums`).
  - Added `resources/fonts/OFL.txt` and `resources/fonts/FONTS.md` documenting SIL Open Font License 1.1 terms.
  - Updated `src/renderer/assets/styles/base/_typography.scss` with `@font-face` definitions.
- Configured Git & Documentation:
  - Updated `.gitignore` to exclude large binary card collections while tracking font assets and placeholder fallbacks.
  - Authored comprehensive root `README.md` documenting prerequisites, card database builds, asset pipeline execution, and npm scripts.
  - Wired `package.json`'s `npm run download:cards` to run `scripts/download-card-images.ts`.

**Files added/changed:**
- `package.json` & `package-lock.json`: Added `sharp` & `@types/sharp`, wired `download:cards`.
- `scripts/download-card-images.ts`: Main rate-limited resumable card downloader script.
- `scripts/stub-download.ts`: Removed obsolete stub.
- `resources/fonts/*`: Cinzel and Inter WOFF2 files, `OFL.txt`, `FONTS.md`.
- `src/renderer/assets/fonts/*`: Bundled WOFF2 fonts for Vite.
- `src/renderer/assets/styles/base/_typography.scss`: Added `@font-face` rules.
- `resources/cards/*`: Generated `card-back.jpg`, `placeholder.jpg`, `0.jpg` fallbacks.
- `resources/ui/card-back.png`: Card back asset for UI overlays.
- `.gitignore`: Configured card asset ignores while retaining fallbacks.
- `README.md`: Created project documentation.

**Decisions made / deviations from the plan:**
- **Gitignore Strategy**: 2,826 cards $\times$ 3 variants = 8,478 image files totaling $\sim 500\text{ MB}$. Committing this volume of binary data to Git would bloat repository clone size and history permanently. Therefore, `resources/cards/full/*`, `resources/cards/art/*`, and `resources/cards/mini/*` are gitignored, while `0.jpg`, `placeholder.jpg`, and font assets remain tracked in Git. `npm run download:cards` is established as a required one-time setup step after cloning.
- **Font Licensing**: Cinzel and Inter are released under the SIL Open Font License (OFL 1.1), permitting free personal and commercial embedding and bundling with desktop software.
- **Sharp Re-Encoding**: CDN small images ($268 \times 391\text{ px}$) are oversized for virtualized deck edit grids; resizing to $96 \times 140\text{ px}$ reduces memory footprint by $> 80\%$ per card and eliminates runtime GPU scaling overhead.

**Known issues / TODO carried to next phase:**
- Phase 4 will build shared design system components (`GlassPanel`, `YugiButton`, `YugiModal`, `Tooltip`, `IconIndicator`, `LoadingSpinner`) and a `/dev/kitchen-sink` QA route.
- Temporary Dev Nav bar remains active for navigation testing.

**How to manually verify this phase:**
1. Run `npm run download:cards -- --limit 20` to download a sample batch.
2. Verify files exist in `resources/cards/full/`, `resources/cards/art/`, and `resources/cards/mini/`.
3. Run `npm run download:cards` to fetch and optimize the complete 2,826-card offline collection.

## Phase 4 — Shared Design System Components — 2026-08-19

**Status:** Complete

**What was built:**
- Refactored and implemented the full **SCSS 7-1 Architecture** in `src/renderer/assets/styles/`:
  - `abstracts/`: Complete design tokens (`$color-bg-void`, `$color-bg-panel`, `$color-border-glass`, gold palette `$color-gold-100`..`$900`, player colors `$color-user` / `$color-ai` and glows, semantics, typography scale, 8px spacing units, motion tokens, z-index scale) and mixins (`glass-panel`, `glass-panel-elevated`, `gold-glow`, `user-glow`, `ai-glow`, `foil-sweep-overlay`, `focus-ring`).
  - `base/`: CSS reset, self-hosted font typography rules (Cinzel display, Inter body, tabular numbers), keyframes (`foil-sweep`, `spin`, `spin-reverse`, `pulse-glow`, `pulse-target`, `pulse-target-ai`, `modal-enter`, `fade-in`, `slide-up`, `card-flip`), and `prefers-reduced-motion` accessibility support.
  - `components/`: Modular BEM stylesheets for `_button.scss`, `_panel.scss`, `_modal.scss`, `_tooltip.scss`, `_icon.scss`, and `_spinner.scss`.
  - `layout/`: `_grid.scss`, `_header.scss` (with highlighted dev nav support).
  - `pages/`: `_menu.scss`, `_deck-edit.scss`, `_duel.scss`, `_kitchen-sink.scss`.
  - `themes/`: `_dark.scss` root CSS variables.
  - `vendor/`: Third-party overrides stub.
  - `main.scss`: Clean `@forward` barrel structure for modern Sass.
- Built reusable core Vue 3 components to spec in `src/renderer/components/common/`:
  - `GlassPanel.vue`: Configurable glassmorphic container with 14px border radius, backdrop blur, inset highlight, elevated drop shadow support, and gold/user/ai top-accent bars.
  - `YugiButton.vue`: Full interactive CTA button supporting primary, secondary, danger, ghost, and the **card-style variant** (`variant="card"` with card frame silhouette, header, emblem, footer, and holographic foil sheen). Supports all 5 states (idle, hover with foil light-sweep and 1.02 scale, active with 0.98 scale, disabled with 40% grayscale, and focus-visible with 2px cyan ring).
  - `YugiModal.vue`: Center-screen glass dialog with backdrop blur, focus trap, Escape key handling, smooth entrance/exit transitions, and cancelable vs non-cancelable modes (for mandatory duel guidance prompts).
  - `Tooltip.vue`: Dark glass chip (`rgba(10, 12, 16, 0.94)`) with gold hairline border, arrow caret, 150ms default delay to prevent hover flicker, and 4 orientation positions (`top`, `bottom`, `left`, `right`).
  - `IconIndicator.vue`: Vector glyph badge rendering all 6 duel targeting locations (Hand, Field, Deck, Extra Deck, Graveyard, Banished) in player identity colors (User blue vs AI red) with optional pulsing target rings, plus all 7 card status indicators (Negated, Cannot Special Summon, Temp Banished, Fusion Material, Synchro Material, Destroyed by Battle, Cannot Attack) with integrated tooltip.
  - `LoadingSpinner.vue`: Ancient Duel Arena celestial sun disk spinner with counter-rotating Egyptian rune rings, pulsing core, cyan holographic energy variant, and simple ring variant.
  - `index.ts`: Common component barrel export.
- Created `/dev/kitchen-sink` visual QA route:
  - Added `src/renderer/views/KitchenSinkView.vue` showcasing every component in every documented state and variant.
  - Configured conditional router registration in `src/renderer/router/index.ts` gated by `import.meta.env.DEV` (automatically excluded from production builds).
  - Added one-click navigation link to the top Dev Navigation bar.

**Files added/changed:**
- `src/renderer/assets/styles/abstracts/_variables.scss`
- `src/renderer/assets/styles/abstracts/_mixins.scss`
- `src/renderer/assets/styles/base/_animations.scss`
- `src/renderer/assets/styles/components/_button.scss`
- `src/renderer/assets/styles/components/_panel.scss`
- `src/renderer/assets/styles/components/_modal.scss`
- `src/renderer/assets/styles/components/_tooltip.scss`
- `src/renderer/assets/styles/components/_icon.scss`
- `src/renderer/assets/styles/components/_spinner.scss`
- `src/renderer/assets/styles/components/_index.scss`
- `src/renderer/assets/styles/pages/_kitchen-sink.scss`
- `src/renderer/assets/styles/pages/_index.scss`
- `src/renderer/assets/styles/layout/_header.scss`
- `src/renderer/components/common/GlassPanel.vue`
- `src/renderer/components/common/YugiButton.vue`
- `src/renderer/components/common/YugiModal.vue`
- `src/renderer/components/common/Tooltip.vue`
- `src/renderer/components/common/IconIndicator.vue`
- `src/renderer/components/common/LoadingSpinner.vue`
- `src/renderer/components/common/index.ts`
- `src/renderer/views/KitchenSinkView.vue`
- `src/renderer/router/index.ts`
- `src/renderer/App.vue`

**Decisions made / deviations from the plan:**
- **Dynamic Dev Route Gating**: `import.meta.env.DEV` is used in `router/index.ts` to push `/dev/kitchen-sink` to the route table only during local development. During production builds (`npm run build`), the route and component are completely omitted from the generated client bundle.
- **Crisp Inline SVG Glyphs**: Built bespoke inline SVG glyphs directly into `IconIndicator.vue` and `LoadingSpinner.vue` so badges scale cleanly without raster pixelation or external image network overhead.
- **Typography Upgrade (Master Duel Palette)**: Upgraded from generic Cinzel/Inter placeholders to authentic gaming typography: **Oxanium** (Bold 700/800) for angular holographic duel headers, CTAs, and tabular LP scoreboards, paired with **Barlow Semi Condensed** (400/500/600/700) for crisp card effect readability.


**Known issues / TODO carried to next phase:**
- Phase 5 will implement the real Loading screen (driven by engine readiness) and Main Menu screen (using `YugiButton` card variant).
- Temporary Dev Nav bar remains active for testing until Phase 14 packaging.

**How to manually verify this phase:**
1. Run `npm run dev` to launch the application.
2. In the top Dev Navigation bar, click **"Kitchen Sink (P4)"** (or navigate to `/dev/kitchen-sink`).
3. Inspect and interact with each section:
   - Verify Color Palette swatches and Typography hierarchy.
   - Verify GlassPanel variants and top-accent borders.
   - Test YugiButton hover foil sweep, active press, disabled states, and card-style variant.
   - Test Tooltip delays, positions (top/bottom/left/right), and rich slots.
   - Test IconIndicator for all 12 targeting location states and 7 card status glyphs.
   - Test YugiModal cancelable vs non-cancelable guidance modals.
   - Test LoadingSpinner solar, cyan, and ring animations.

## Phase 5 — Loading & Main Menu Screens — 2026-08-19

**Status:** Complete

**What was built:**
- Built the real **Loading Screen** (`LoadingView.vue`):
  - Driven entirely by **real readiness signals** from `DuelEngineService`, SQLite `CardReaderService` (2,826 legal DM & GX cards), and `ScriptReaderService` (2,414 Lua scripts) over IPC, replacing fake timers.
  - Multi-stage visual progression: engine core boot, card database validation, base Lua script verification, and final readiness signal.
  - Integrated `LoadingSpinner` (celestial Egyptian runes) with glowing progress meter, live database stats (`Engine v11.0 • 2,826 Cards Indexed`), error boundary with retry CTA button, and smooth automatic transition to `/main-menu`.
- Built the real **Main Menu Screen** (`MainMenuView.vue`):
  - Implemented the Ancient Duel Arena visual identity with obsidian void backdrop, gold brand emblems, and live engine status badge.
  - 4 interactive card-styled CTA buttons using `YugiButton` (`variant="card"`) with authentic card frame silhouettes, custom SVG medallions, holographic foil sweep hover animations, active press states, and keyboard focus states:
    1. **Start Duel** (`to="/coin-toss"`): Initiates the duel entry flow.
    2. **Deck Edit** (`to="/deck-edit"`): Navigates to the Deck Construction screen.
    3. **Settings** (`to="/settings"`): Navigates to the Settings & Opponents screen.
    4. **Exit Game**: Triggers the `YugiModal` exit confirmation dialog and quits the Electron app via `window.appAPI.exitApp()`.
  - Integrated `YugiModal` exit confirmation dialog with "Cancel" and "Quit Game" (`variant="danger"`) actions.
- Replaced the primary Dev Nav Bar in `App.vue`:
  - Dev Nav is now hidden by default in production and development to provide a fullscreen 100vh authentic game presentation.
  - Gated behind a discrete floating toggle badge (`⚡ DEV`) and keyboard shortcut (`Ctrl+Shift+D` / `Cmd+Shift+D`) in dev mode (`import.meta.env.DEV`).
  - Added "← Return to Main Menu" navigation buttons across all placeholder screens (`SettingsView`, `DeckEditView`, `CoinTossView`, `PreDuelVideoView`, `DuelView`, `KitchenSinkView`) for clean round-trip navigation.
- Extended IPC plumbing:
  - Added `APP_INIT_ENGINE` and `APP_GET_INIT_STATUS` IPC channels in `src/main/ipc/index.ts` and `src/preload/index.ts`.
  - Added `getCardCount()` to `CardReaderService` and `EngineInitStatus` to `DuelEngineService`.

**Files added/changed:**
- `src/main/engine/cardReader.ts`: Added `getCardCount()` method.
- `src/main/engine/DuelEngineService.ts`: Added `init()` status return and `getStatus()`.
- `src/shared/types/ipc.ts`: Added `APP_INIT_ENGINE`, `APP_GET_INIT_STATUS`, `EngineInitStatus`, and updated `AppAPI`.
- `src/preload/index.ts`: Exposed `initEngine` and `getInitStatus` on `window.appAPI`.
- `src/main/ipc/index.ts`: Added handlers for `APP_INIT_ENGINE` and `APP_GET_INIT_STATUS`.
- `src/renderer/stores/uiStore.ts`: Added `engineStatus` state and action.
- `src/renderer/stores/devToolsStore.ts`: Added `showDevNav` state and `toggleDevNav()` action.
- `src/renderer/views/LoadingView.vue`: Full implementation of readiness-driven Loading screen.
- `src/renderer/views/MainMenuView.vue`: Full implementation of Ancient Duel Arena Main Menu.
- `src/renderer/assets/styles/pages/_menu.scss`: BEM SCSS styling for Main Menu and card CTAs.
- `src/renderer/App.vue`: Gated dev nav, 100vh game viewport, floating toggle.
- `src/renderer/views/SettingsView.vue`, `DeckEditView.vue`, `CoinTossView.vue`, `PreDuelVideoView.vue`, `DuelView.vue`, `KitchenSinkView.vue`: Added return-to-menu navigation buttons.

**Decisions made / deviations from the plan:**
- **Real Readiness Engine Polling & Handshake**: The Loading screen queries `window.appAPI.initEngine()` to verify the exact status of `ocgcore-wasm` version, SQLite card count in `cards.cdb` (2,826 records), and Lua script directory validity. If in an external browser test environment, a dev fallback cleanly resolves so UI testing works everywhere.
- **Exit Modal Safety**: "Exit Game" invokes a non-destructive glass confirmation modal before triggering Electron `app.quit()`, preventing accidental window closes during navigation.

**Known issues / TODO carried to next phase:**
- Phase 6 will implement the Settings screen, load `data/characters.json` with 20 characters (10 DM + 10 GX), build the `OpponentCarousel`, and persist configuration to `electron-store`.
- Character portraits and pre-duel videos will use styled placeholders until user files are provided.

**How to manually verify this phase:**
1. Run `npm run dev` to launch the application.
2. Observe the **Loading Screen**: verify the celestial Egyptian spinner rotates, progress progresses through real stages (Engine Core -> Card Database -> Arena Ready), displays "2,826 Cards Indexed", and automatically navigates to the **Main Menu**.
3. On the **Main Menu**, test the 4 Card CTAs:
   - Hover over each card to verify the foil light-sweep gleam, scale lift, and gold glows.
   - Click **"Start Duel"** -> verifies navigation to `/coin-toss`. Click **"Return to Main Menu"**.
   - Click **"Deck Edit"** -> verifies navigation to `/deck-edit`. Click **"Return to Main Menu"**.
   - Click **"Settings"** -> verifies navigation to `/settings`. Click **"Return to Main Menu"**.
   - Click **"Exit Game"** -> verifies the Exit Confirmation modal opens. Click "Cancel" to dismiss. Click "Exit Game" -> confirms the Electron app closes cleanly.
4. Verify Dev Nav is hidden by default. Click the `⚡ DEV` floating pill in the top-right corner (or press `Ctrl+Shift+D`) to toggle the Dev Nav bar.

## Phase 6 — Settings Screen & Character Data — 2026-08-19

**Status:** Complete

**What was built:**
- Curated and generated 20 iconic Yu-Gi-Oh! duelists in `data/characters.json`:
  - **10 Original Series (Duel Monsters) Characters**:
    1. **Yugi Muto** (King of Games / Magnet & Gadget Arsenal)
    2. **Yami Yugi** (Pharaoh Atem / Dark Magician & Slifer the Sky Dragon)
    3. **Seto Kaiba** (KaibaCorp President / Blue-Eyes Dragon Fury & Obelisk)
    4. **Joey Wheeler** (Godfather of Games / Red-Eyes Ferocity & Gambler's Luck)
    5. **Téa Gardner** (Friendship Guardian / Shining Fairies & Maha Vailo)
    6. **Tristan Taylor** (Cybernetic Striker / Command Infantry & Heavy Siege)
    7. **Mai Valentine** (Queen of the Sky / Harpie Lady Flurry & Amazoness)
    8. **Bakura Ryou** (Shadow Realm Wanderer / Destiny Board & Zombies)
    9. **Marik Ishtar** (Tomb Keeper / The Winged Dragon of Ra & Necrovalley)
    10. **Maximillion Pegasus** (Creator of Duel Monsters / Toon World & Relinquished)
  - **10 Yu-Gi-Oh! GX Characters**:
    11. **Jaden Yuki** (Slifer Red Champion / Elemental HERO Fusion & Neos)
    12. **Zane Truesdale** (The Cyber Duelist / Cyber Dragon & Cyberdark)
    13. **Syrus Truesdale** (Vehicroid Engineer / Super Vehicroid Connection)
    14. **Chazz Princeton** (The Chazz / Armed Dragon LV & Ojama Hurricane)
    15. **Alexis Rhodes** (Obelisk Blue Queen / Cyber Blader & Ocean Control)
    16. **Bastion Misawa** (Analytical Duelist / Water Dragon Chemistry & Earth)
    17. **Chumley Huffington** (Outback Beast Master / Master of Oz Koalas)
    18. **Aster Phoenix** (Destiny HERO Prodigy / Clock Tower Prison & Plasma)
    19. **Jesse Anderson** (Crystal Beast Sovereign / Rainbow Dragon Overdrive)
    20. **Dr. Vellian Crowler** (Obelisk Blue Chair / Ancient Gear Golem Siege)
- Built automated deck generation script `scripts/generate-character-decks.ts`:
  - Generated **60 archetype-appropriate placeholder decks** (3 decks per character) saved in `resources/decks/*.ydk` (40 cards each, plus extra deck fusions where applicable).
  - Validated all 2,432 card references against `resources/cards.cdb` via `better-sqlite3`.
  - Stamped metadata, signature cards, and deck references into `data/characters.json`.
- Implemented persistent settings storage via `electron-store`:
  - Created `src/main/persistence/store.ts` managing `bgmVolume`, `sfxVolume`, `selectedOpponentId`, `selectedSeriesFilter`, `devMode`, and `skipPreDuelVideo`.
  - Created `src/main/decks/deckLoader.ts` to load character metadata, parse `.ydk` decks, and pick random decks.
  - Wired IPC channels: `SETTINGS_GET`, `SETTINGS_SET`, `CHARACTERS_GET`, `CHARACTERS_GET_BY_ID`, `CHARACTERS_GET_RANDOM_DECK`.
- Built Settings & Character UI components:
  - `CharacterCard.vue`: Card-style frame with series badge (`DM` gold vs `GX` cyan), character theme glow, selection badge, hover foil light-sweep gleam, and styled SVG holographic silhouette fallback when custom portrait PNGs are not yet present.
  - `OpponentCarousel.vue`: Interactive horizontal carousel with series filter tabs (`All [20]`, `Original Series [10]`, `Yu-Gi-Oh! GX [10]`), smooth scroll snap, next/prev arrow buttons, mouse-wheel scroll, and keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
  - `SettingsView.vue`: Complete Ancient Duel Arena Settings view featuring the carousel, active opponent preview dossier (portrait, bio, 3 decks, signature cards, video status), BGM / SFX volume range sliders (0 - 100%), video skip toggle, and dev mode toggle.
  - `settingsStore.ts`: Pinia store synchronizing settings and character data with `electron-store` over IPC.
- Implemented randomized deck selection logic:
  - Added "🎲 One picked randomly when duel starts" logic to `settingsStore` and wired an interactive test in `DuelView.vue` (`⚔️ Duel vs [Opponent] (Random Deck)`).

**Files added/changed:**
- `data/characters.json`: 20 characters with 3 decks each, avatar/video paths, theme colors.
- `resources/decks/*.ydk`: 60 generated 40-card `.ydk` deck files.
- `scripts/generate-character-decks.ts`: Card pool querying and `.ydk` generator script.
- `src/shared/types/character.ts`: TypeScript interfaces for `CharacterData`, `CharacterDeckData`, `SettingsConfig`.
- `src/shared/types/ipc.ts`: Added `SettingsAPI` and character IPC channels.
- `src/main/persistence/store.ts`: `electron-store` wrapper.
- `src/main/decks/deckLoader.ts`: Main process character & deck loader.
- `src/main/ipc/index.ts` & `src/preload/index.ts`: Wired settings & character IPC channels.
- `src/renderer/components/settings/CharacterCard.vue`: Character card component with silhouette fallback.
- `src/renderer/components/settings/OpponentCarousel.vue`: Horizontal carousel with series filters and keyboard navigation.
- `src/renderer/components/settings/index.ts`: Barrel export.
- `src/renderer/stores/settingsStore.ts`: Pinia store with electron-store sync.
- `src/renderer/views/SettingsView.vue`: Settings and opponents view.
- `src/renderer/assets/styles/pages/_settings.scss` & `_index.scss`: BEM SCSS styling for Settings.
- `src/renderer/views/DuelView.vue`: Added random opponent deck test launcher.

**Decisions made / deviations from the plan:**
- **Placeholder Decks**: All 60 decks (3 per character) were programmatically generated from the Phase 2 filtered card pool using valid card IDs from `data/card-pool-whitelist.json` and verified in SQLite `cards.cdb`. These serve as archetype-appropriate placeholders pending user curation.
- **Silhouette Fallbacks**: In the absence of user-provided transparent portrait PNGs (`resources/characters/portraits/<id>.png`), `CharacterCard.vue` and `SettingsView.vue` render a responsive SVG anime duelist silhouette with Egyptian/GX energy runes glowing in each character's custom theme color.
- **Keyboard Navigation**: In addition to mouse-wheel scrolling and arrow buttons, `OpponentCarousel` supports full keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`) and accessibility attributes (`role="tablist"`, `aria-selected`, `aria-pressed`).

**Known issues / TODO carried to next phase:**
- User portrait PNGs and pre-duel MP4 videos can be placed into `resources/characters/portraits/` and `resources/videos/characters/` at any time to replace the styled placeholders.
- Phase 7 will build the 3-column Deck Edit screen (`DeckColumn`, `CardGridVirtualized`, `CardFilterBar`, `CardPreviewer`).

**How to manually verify this phase:**
1. Run `npm run dev` to launch the application.
2. From the **Main Menu**, click **"Settings"** (or press the Settings card CTA).
3. In **Settings & Opponents**, browse the carousel of 20 characters:
   - Click the filter pills (**"All Duelists (20)"**, **"Original Series (10)"**, **"Yu-Gi-Oh! GX (10)"**).
   - Use the `<` and `>` arrow buttons or keyboard `Left`/`Right` arrow keys to scroll through duelists.
   - Click on any character (e.g. *Seto Kaiba*, *Zane Truesdale*, *Chazz Princeton*) to select them.
4. Observe the **Active Opponent Dossier**:
   - Verify character title, anime tagline, backstory bio, theme color glow, and 3 prebuilt deck archetypes.
5. In **Sound & Gameplay Settings**:
   - Adjust the **Music Volume (BGM)** and **Sound Effects (SFX)** sliders.
   - Toggle **Skip Pre-Duel Character Videos** or **Developer Engine Diagnostics**.
6. Close the app (or click **"Return to Main Menu"** -> **"Exit Game"**), then re-run `npm run dev`.
7. Reopen **Settings** and confirm that your selected opponent and volume/toggle settings persisted from `electron-store`.



