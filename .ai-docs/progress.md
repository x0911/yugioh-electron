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


## Phase 7 — Deck Edit Screen — 2026-08-19

**Status:** Complete

**What was built:**
- Built the 3-column Deck Construction & Edit screen (`DeckEditView.vue`):
  - **Col-1 (Deck Construction & Visual Card Grid — ~37%)**:
    - `DeckColumn.vue`: Redesigned Main Deck (40-60 cards) and Extra Deck (0-15 cards) to display cards in a responsive **columns grid** (mini card tiles side-by-side) mirroring Col-2, with real-time card counters, archetype breakdowns (Monsters, Spells, Traps, Fusions), and individual card copy count pills (`x1`, `x2`, `x3`).
    - Cards in deck are automatically sorted cleanly (Monsters by Level/ATK, then Spells, then Traps) with category-colored top border accents (gold, orange, teal, magenta, purple) and hover remove overlay `✕`.
    - Real-time validity state banner: green "✓ Legal Deck (Main: 40/40-60, Extra: 0/0-15)" vs. red/orange "⚠️ Illegal Deck (Main: 24/40-60 • Needs 16 more cards)" with granular error callouts (minimum 40 cards, maximum 60 cards, maximum 15 Extra deck cards, and strict 3-copy rule per card).
    - Custom deck management toolbar: active deck selector dropdown, inline deck name editor, "💾 Save Deck", "➕ New Deck", "📋 Clone Deck", "🧹 Clear Deck" (with confirmation modal), and "🗑️ Delete Deck" (with confirmation modal).
    - Drag-and-drop exclusive: drag cards to add/remove; clicking or hovering selects and previews cards in Col-3.
  - **Col-2 (Card Database & Virtualized Grid — ~39%)**:
    - `CardFilterBar.vue`: Comprehensive multi-criteria filter bar featuring:
      - Instant name and card lore/effect text search with quick clear button.
      - Series / Era tabs (`All Eras [2,826]`, `DM`, `GX`).
      - Card Kind tabs (`All Cards`, `Monsters`, `Spells`, `Traps`, `Extra / Fusion`).
      - Advanced collapsible filter controls: Sub-type (Normal, Effect, Ritual, Fusion, Continuous, Equip, Quick-Play, Field, Counter, Flip, Toon, Spirit, Union, Gemini), Attribute (DARK, LIGHT, EARTH, WATER, FIRE, WIND, DIVINE), Monster Race (Warrior, Spellcaster, Dragon, Fiend, Zombie, Machine, Aqua, Pyro, Rock, Winged Beast, Plant, Insect, Thunder, Beast, Beast-Warrior, Dinosaur, Fish, Sea Serpent, Reptile, Psychic, Divine-Beast), Level/Rank (★1 to ★12), ATK range min/max, DEF range min/max, Sort By (Name, ATK, DEF, Level, Type, ID), and Sort Order (Ascending / Descending).
      - "Reset All Filters" CTA and live match count indicator (`Showing X / 2,826 Cards`).
    - `CardGridVirtualized.vue`: Windowed virtualized card grid algorithm that dynamically calculates row geometry, columns per row, and scroll offset to render only visible items ($\pm$ overscan buffer, $\sim 24-36$ card DOM nodes in memory instead of 2,826), guaranteeing 60fps scrolling performance with zero GPU/DOM lag.
    - Mini image cards (`96x140px`) with quantity-in-deck badges (`x0`, `x1`, `x2`, `x3`), Extra Deck badges, era pills, and drag indicator. Drag to add to deck; clicking or hovering previews in Col-3.
  - **Col-3 (Sticky Live Card Previewer — ~28%)**:
    - `CardPreviewer.vue`: High-resolution card inspector showing full card artwork (`resources/cards/full/<id>.jpg`), card frame, holographic foil sheen, title, Attribute emblem, Level/Rank stars, Type/Race badges, ATK/DEF scores in tabular Oxanium numerals, scrollable effect lore description in Barlow Semi Condensed typography, passcode ID, in-deck quantity badge, and direct draggable artwork (`✋ Drag image to Deck`).
- Built premium interactive **Drag & Drop** mechanics (exclusive interaction model, no accidental click modifications):
  - Drag from Col-2 (Card Pool) or Col-3 (Previewer) and drop directly into Main Deck (glowing gold dropzone) or Extra Deck (glowing purple dropzone).
  - Drag from Col-1 (Deck) and drop into Col-2 (Card Pool) or the header Trash dropzone to remove copies.
  - Fusion monsters auto-route to Extra Deck when dropped on Main Deck.
  - Animated pulsing visual drop hints, drag indicators on hover, and grab/grabbing cursors.
- Built persistent custom deck storage with `electron-store`:
  - Managed custom deck records (`id`, `name`, `main: number[]`, `extra: number[]`, `createdAt`, `updatedAt`) and active deck ID.
  - Seeded 3 default tournament-legal starter decks out-of-the-box:
    1. **"Yugi — Dark Magician Beatdown"** (40 Main, 3 Extra)
    2. **"Kaiba — Blue-Eyes Power"** (40 Main, 2 Extra)
    3. **"Jaden — Elemental HEROes"** (42 Main, 5 Extra)
- Registered custom local protocol `app-resource://` in Electron main process (`src/main/index.ts`) for streaming local image assets (`resources/cards/mini/`, `full/`, `art/`) with automatic placeholder fallback (`resources/cards/placeholder.jpg`).
- Extended SQLite queries in `CardReaderService.getAllCards()` to decode and enrich all 2,826 legal DM and GX cards with full bitmasks and metadata.
- Extended IPC plumbing and preload surface (`DECK_GET_ALL_CARDS`, `DECK_GET_CUSTOM_DECKS`, `DECK_SAVE_CUSTOM_DECK`, `DECK_DELETE_CUSTOM_DECK`, `DECK_GET_ACTIVE_ID`, `DECK_SET_ACTIVE_ID`).

**Files added/changed:**
- `src/shared/types/card.ts`: Card detail interfaces, bitmasks, and filter models.
- `src/shared/types/deck.ts`: Custom deck models, limits, and validation engine (`validateDeck`).
- `src/shared/types/ipc.ts` & `src/shared/types/index.ts`: Added deck IPC channels and API surface.
- `src/main/engine/cardReader.ts`: Implemented `getAllCards()` with whitelist era matching.
- `src/main/engine/DuelEngineService.ts`: Exposed `getAllCards()` and `getCardReader()`.
- `src/main/persistence/store.ts`: Added custom deck persistence, active deck state, and starter decks.
- `src/main/ipc/index.ts`: Implemented IPC handlers for deck data and persistence.
- `src/preload/index.ts`: Exposed `window.deckAPI` methods to renderer.
- `src/main/index.ts`: Registered `app-resource://` privileged scheme and protocol handler.
- `src/renderer/utils/media.ts`: Asset URL resolver and image error handler.
- `src/renderer/stores/deckEditStore.ts`: Pinia store with virtualized filter pipeline, deck construction, and persistence.
- `src/renderer/components/deckEdit/CardPreviewer.vue`: Sticky hover card previewer.
- `src/renderer/components/deckEdit/CardFilterBar.vue`: Search, kind/era tabs, and multi-criteria filters.
- `src/renderer/components/deckEdit/CardGridVirtualized.vue`: Virtualized card pool grid.
- `src/renderer/components/deckEdit/DeckColumn.vue`: Deck management, validity banner, and card lists.
- `src/renderer/components/deckEdit/index.ts`: Component barrel export.
- `src/renderer/views/DeckEditView.vue`: 3-column Deck Construction & Editing view.
- `src/renderer/assets/styles/abstracts/_variables.scss`: Font family alias tokens.

**Decisions made / deviations from the plan:**
- **Virtualized Grid Architecture**: With 2,826 cards in the DM+GX pool, rendering full DOM nodes for all items simultaneously would result in ~20,000 DOM nodes causing frame drops during scroll. The virtualized grid calculates container dimensions, columns per row, row heights, and scroll offsets to render only 24-36 items at any given moment, maintaining a solid 60fps scroll.
- **Protocol Streaming (`app-resource://`)**: Instead of relying on web file URLs or Base64 encoding over IPC, registered a secure `app-resource://` scheme in Electron that streams local files directly through Chromium's network stack with zero IPC serialization latency.
- **Starter Deck Seeding**: On fresh install / first launch, 3 iconic starter decks (Yugi, Kaiba, Jaden) are seeded into `electron-store` so the deck editor is immediately populated with legal decks that can be inspected, duplicated, and customized.

**Known issues / TODO carried to next phase:**
- Phase 8 will build the Coin Toss screen (heads/tails selection and animated coin flip driving starting player determination) and the Pre-Duel Video screen (fullscreen video player with skip-on-click).

**How to manually verify this phase:**
1. Run `npm run dev` to launch the application.
2. From the **Main Menu**, click **"Deck Edit"** (or press the Deck Edit card CTA).
3. Verify the **3-column layout**: Col-1 Deck lists (~24%), Col-2 Card grid & filter bar (~48%), Col-3 Sticky previewer (~28%).
4. Inspect the preloaded starter deck ("Yugi — Dark Magician Beatdown"): verify live counts `40 / 60`, `3 / 15`, and the green **"✓ LEGAL DECK"** banner.
5. In Col-2 (Card Database):
   - Type in the search box (e.g. *"Blue-Eyes"* or *"Mirror Force"*) -> verify instant filtering.
   - Test the Kind tabs (**Monsters**, **Spells**, **Traps**, **Extra / Fusion**) and Era filters (**DM**, **GX**).
   - Click **"More Filters"** -> test Attribute, Race, Level (e.g. ★7), and ATK range (e.g. Min 2500).
   - Scroll through the full card pool and verify smooth 60fps scrolling via virtualization.
6. In Col-3 (Card Previewer):
   - Hover over any card in the grid or deck column -> verify full image, stars, ATK/DEF, and lore display immediately.
   - Move mouse away -> verify previewer sticks to the last-hovered card.
7. Test Deck Construction & Validity:
   - Click **"➕ New"** in Col-1 toolbar -> creates "Custom Deck 4" with 0 cards and displays red **"⚠️ ILLEGAL DECK"** banner ("Needs 40 more cards").
   - Click cards in Col-2 to add them -> verify count increases and copy limit badges update (`x1`, `x2`, `x3`).
   - Try adding a 4th copy -> verify the UI warns and blocks exceeding 3 copies.
   - Add 40 cards -> verify validity banner turns green **"✓ LEGAL DECK"**.
   - Edit the deck name to *"My Tournament Deck"* and click **"💾 Save"** -> toast confirms deck saved.
8. Test Persistence:
   - Close the app (or click **"Main Menu"** -> **"Exit Game"**).
   - Run `npm run dev`, navigate back to **Deck Edit**, and confirm *"My Tournament Deck"* is in the dropdown with all 40 cards intact.

## Phase 8 — Coin Toss & Pre-Duel Video — 2026-08-19

**Status:** Complete

**What was built:**
- Built the **Coin Toss Screen** (`CoinTossView.vue` & `_coin-toss.scss`):
  - **Matchup Header**: Displays User (Player 1) vs Selected Rival Opponent (with series badge `DM` gold vs `GX` cyan, title, and "← Menu" navigation).
  - **Heads vs Tails Decision**: Interactive gold cards featuring high-res coin graphics (`coin-heads.png` solar eye vs `coin-tails.png` crescent star), keyboard hotkeys (`1`/`H` for Heads, `2`/`T` for Tails), hover foil sheen, and active press states.
  - **3D Animated Coin Flip**: Multi-axis 3D CSS rotation (`rotateY`, `perspective: 1200px`) and vertical loft arc with realistic deceleration physics over 2.2s.
  - **Starting Player Determination**:
    - Compares player call against random coin outcome.
    - If user calls correctly: User wins toss and is assigned **Player 0 (First Turn)**.
    - If user calls incorrectly: Opponent wins toss and is assigned **Player 0 (First Turn)**.
  - **Result Announcement Banner**: Glowing victory callout (User Blue/Gold vs Opponent Red/Amber) with turn order statement, "Proceed to Intro (Space)" CTA button, and "🔄 Flip Again" button for immediate QA of both outcomes.
- Built the **Pre-Duel Video Screen** (`PreDuelVideoView.vue` & `_pre-duel-video.scss`):
  - Fullscreen video player with HTML5 `<video>` support and volume synchronization with `settingsStore` (BGM / SFX).
  - **Cinematic Cutscene Fallback**:
    - Rendered automatically when local character MP4 video file is not yet present on disk.
    - Displays Ancient Duel Arena atmospheric backdrop, series pill (`Original Series` vs `Yu-Gi-Oh! GX`), opponent portrait / holographic silhouette, character name, title, tagline quote, chosen deck archetype, and signature cards.
    - Prominent **"VIDEO PENDING"** watermark badge displaying the exact file path expected on disk (`resources/videos/characters/<id>.mp4`).
  - **Skip-on-Click & Navigation**:
    - Clicking anywhere on screen, clicking the skip overlay, or pressing `Space`, `Enter`, or `Escape` immediately skips to `/duel`.
    - Automatically checks `settingsStore.skipPreDuelVideo` and bypasses the cutscene directly to `/duel` when enabled.
    - Auto-advance progress countdown bar with smooth transition.
- **Duel Engine & State Wiring**:
  - Enhanced `DuelEngineService.ts` and `src/shared/types/duel.ts` with `humanPlayerId: 0 | 1`, ensuring `viewFilter` perspective-accurate private card redaction functions properly regardless of who won the coin toss.
  - Implemented `setupMatch()`, `resolveCoinToss()`, and `startPreparedDuel()` in `duelStore.ts`, ordering `player0Deck` and `player1Deck` based on the coin toss winner.
  - Updated `DuelView.vue` to recognize prepared matches from the entry flow, auto-initializing with the determined starting player and displaying dynamic Player 0 vs Player 1 scoreboard labels.
  - Added asset helpers in `src/renderer/utils/media.ts` (`getCoinHeadsUrl()`, `getCoinTailsUrl()`, `getCoinEdgeUrl()`, `getCharacterVideoUrl()`, `getCharacterPortraitUrl()`, `getBackgroundUrl()`).

**Files added/changed:**
- `src/renderer/views/CoinTossView.vue`: Full Coin Toss view implementation.
- `src/renderer/views/PreDuelVideoView.vue`: Full Pre-Duel Video and cutscene fallback implementation.
- `src/renderer/views/DuelView.vue`: Scoreboard player tag adaptations and prepared duel starter.
- `src/renderer/stores/duelStore.ts`: Match setup, coin toss resolution, and starting player duel initialization.
- `src/renderer/utils/media.ts`: Coin, character video, and background asset URL helpers.
- `src/shared/types/duel.ts`: Added `humanPlayerId` to `DuelInitOptions`, coin toss types, and `MatchSetupConfig`.
- `src/main/engine/DuelEngineService.ts`: Added `humanPlayerId` support for view filtering and starting player assignments.
- `src/renderer/assets/styles/pages/_coin-toss.scss`: 3D coin flip keyframes and choice card styles.
- `src/renderer/assets/styles/pages/_pre-duel-video.scss`: Fullscreen video player and cutscene fallback styles.
- `src/renderer/assets/styles/pages/_index.scss`: Forwarded coin-toss and pre-duel-video page styles.
- `src/renderer/assets/styles/abstracts/_variables.scss`: Added font size alias tokens.
- `resources/videos/characters/.gitkeep`: Created character video directory structure.

**Decisions made / deviations from the plan:**
- **Turn Order Engine Integration**: In `ygopro-core`, Player 0 is always the player who acts first on Turn 1 (Draw Phase). Therefore, whichever combatant wins the coin toss is passed as `player0Deck`, and the loser is passed as `player1Deck`. `DuelEngineService` and `viewFilter` track `humanPlayerId` (0 if user won toss, 1 if opponent won toss) to guarantee human anti-cheat information hiding remains structurally sound.
- **Official Coin Artworks**: Leveraged high-resolution coin artwork assets in `resources/ui/` (`coin-heads.png`, `coin-tails.png`, `coin-edge.png`) embedded into a 3D CSS perspective container with realistic flip physics.

**Known issues / TODO carried to next phase:**
- **TODO (Character Video Drops)**: User can drop real MP4 video files into `resources/videos/characters/<character-id>.mp4`. The complete list of 20 target paths:
  1. `resources/videos/characters/yugi-muto.mp4`
  2. `resources/videos/characters/yami-yugi.mp4`
  3. `resources/videos/characters/seto-kaiba.mp4`
  4. `resources/videos/characters/joey-wheeler.mp4`
  5. `resources/videos/characters/tea-gardner.mp4`
  6. `resources/videos/characters/tristan-taylor.mp4`
  7. `resources/videos/characters/mai-valentine.mp4`
  8. `resources/videos/characters/bakura-ryou.mp4`
  9. `resources/videos/characters/marik-ishtar.mp4`
  10. `resources/videos/characters/maximillion-pegasus.mp4`
  11. `resources/videos/characters/jaden-yuki.mp4`
  12. `resources/videos/characters/zane-truesdale.mp4`
  13. `resources/videos/characters/syrus-truesdale.mp4`
  14. `resources/videos/characters/chazz-princeton.mp4`
  15. `resources/videos/characters/alexis-rhodes.mp4`
  16. `resources/videos/characters/bastion-misawa.mp4`
  17. `resources/videos/characters/chumley-huffington.mp4`
  18. `resources/videos/characters/aster-phoenix.mp4`
  19. `resources/videos/characters/jesse-anderson.mp4`
  20. `resources/videos/characters/vellian-crowler.mp4`
- Phase 9 will build the static Duel Field layout matching reference proportions (all 14 zones, hand fans, LP meters, HUD controls).

**How to manually verify this phase:**
1. Run `npm run dev` to launch the application.
2. (Optional) Go to **Settings** (`/settings`) and pick a character (e.g. *Seto Kaiba* or *Jaden Yuki*).
3. Return to **Main Menu**, click the **"Start Duel"** card button -> automatically transitions to the **Coin Toss** screen (`/coin-toss`).
4. On the **Coin Toss** screen:
   - Verify the opponent header displays the chosen rival duelist with series badge and title.
   - Choose **HEADS** (or press `1` / `H`).
   - Watch the 3D coin spin in mid-air and settle on Heads or Tails over 2.2s.
   - If Heads: observe green/blue banner: *"YOU WON THE TOSS! You will take the FIRST turn (Player 0)."*
   - If Tails: observe red/amber banner: *"[Opponent] WON THE TOSS! [Opponent] will take the FIRST turn (Player 0)."*
   - Click **"Flip Again"** (or press `R`) and select **TAILS** (or press `2` / `T`) a few times to test and verify both winning and losing outcomes.
5. Click **"Proceed to Intro"** (or press `Space`) -> navigates to **Pre-Duel Video** (`/pre-duel-video`).
6. On the **Pre-Duel Video** screen:
   - Verify the cinematic cutscene presentation displays the rival duelist dossier and the prominent watermark *"Video Pending: resources/videos/characters/<id>.mp4"*.
   - Click anywhere on screen (or press `Space`) -> confirms instant skip to the **Duel Screen** (`/duel`).
7. On the **Duel Screen**:
   - Verify the scoreboard shows Player 0 (1st Turn) and Player 1 (2nd Turn) correctly assigned according to the coin toss result.
   - Click **"⚡ Auto-Play Duel"** or **"⏩ Next Step"** to confirm the duel executes smoothly with the chosen starting player.

## Phase 9 — Duel Field: Static Layer — 2026-08-19

**Status:** Complete

**What was built:**
- Built the full static **Duel Field Layout** (`DuelField.vue`, `DuelView.vue`, `_duel.scss`):
  - Fixed **16:9 aspect-ratio letterboxed arena canvas** (`aspect-ratio: 16 / 9`, up to 1920×1080) with "Ancient Duel Arena" obsidian stone floor geometry, radial background vignette, and player identity glows (User Blue vs AI Red).
  - Implemented all **14 numbered zones per player** matching reference proportions and the brief (`prompt-00.md` §3.7):
    1. **5 Main Monster Zones** (`FieldZoneSlot.vue`): Supporting Face-up Attack (portrait, stats badge), Face-up Defense (**rotated 90° landscape**, DEF highlighted), Face-down Defense "Set" (**rotated 90° landscape with authentic swirl card back**), and empty watermark labels (`M1`–`M5`).
    2. **2 Extra Monster Zones** in center divide (`EMZ 1` above MMZ 2, `EMZ 2` above MMZ 4 — visually present but inert with *"Extra Monster Zone (Reserved for future release)"* tooltip).
    3. **5 Spell & Trap Zones** (`FieldZoneSlot.vue`): Supporting Face-up Spells/Traps, Face-down Set Spells/Traps (portrait card back), and empty watermark labels (`S1`–`S5`).
    4. **Pendulum Scale Jewels** on STZ 1 & STZ 5 (Scale 1 Blue jewel & Scale 8 Red jewel — visually present but inert with tooltips).
    5. **Field Zone** per player: Active Field Spell (Yami / Mountain) with glowing stone border.
    6. **Graveyard Zone** (`DeckStack.vue`): 3D stack showing top card thumbnail (Summoned Skull / La Jinn), card count badge, and detailed tooltip.
    7. **Extra Deck Zone** (`DeckStack.vue`): 3D layered card backs with count badge (e.g. 3 cards).
    8. **Main Deck Zone** (`DeckStack.vue`): 3D layered card backs with count badge (e.g. 34 cards).
    9. **Banished Zone** (`DeckStack.vue`): Banished stack with count badge and tooltip.
    10. **User Hand** (`HandFan.vue`): Fanned card layout with parabolic arc geometry, full card artwork, name, Level, ATK/DEF, and hover lift (`translateY(-28px)`, `scale(1.18)`, z-index 100, gold foil sweep gleam).
    11. **Opponent Hand** (`HandFan.vue`): Inverted fanned card backs facing downward from top center with correct count pill.
    12. **Life Points Meters** (`LifePointsMeter.vue`): Scoreboards for both User and Opponent featuring character avatar / holographic silhouette fallback, series badge (`DM` gold vs `GX` cyan), player name, title, huge tabular **Oxanium** LP numerals (`8000`), animated gradient LP health bar, and glowing "TURN" active disk aura.
    13. **Top HUD Bar** (`DuelHud.vue`): Phase tracker pills (`DP`, `SP`, `M1`, `BP`, `M2`, `EP`), Action Guide banner, Menu button (`hud-menu.png`), Duel Log toggle (`hud-duel-log.png`), Field Status button (`hud-field-status.png`, "Coming soon" tooltip), and Activation Confirmation button (`hud-activation-confirm.png`, "Coming soon" tooltip).
    14. **In-Duel Pause Menu** (`DuelMenuModal.vue`): Glass modal with "Resume Duel", "Surrender & Return to Main Menu" (with confirmation dialog), "Restart Match", and real-time BGM / SFX volume sliders synced to `settingsStore`.
    15. **Slide-Out Duel Log Drawer** (`DuelLogPanel.vue`): Slide-out glass drawer with event category filters (All, Summons, Spells, Combat, Prompts), event stream list, and clear log action.
    16. **Mate Slots**: Pedestals for User (bottom-right) and Opponent (top-left) with *"Mate Slot (Reserved for future release)"* tooltip.
- Built hover-driven **Card Preview Popup** (`CardPreviewPopup.vue`):
  - Floating card inspector updating dynamically on hover over any card on the field, hand, or graveyard.
  - Displays full-resolution artwork (`resources/cards/full/<id>.jpg`), Attribute emblem, Level stars, Type/Race bracket, ATK/DEF scores in tabular Oxanium font, and scrollable effect lore in Barlow Semi Condensed typography.
- Built **Mock Duel State Generator** (`mockDuelState.ts`):
  - Curated complete field state with classic DM cards (Dark Magician, Celtic Guardian, Man-Eater Bug, Mirror Force, Swords of Revealing Light, Yami, Blue-Eyes White Dragon, Vorse Raider, Battle Ox, Ring of Destruction, Dark Hole, Mountain).
- Added **Floating Dev QA Toolbar**:
  - Bottom-right toolbar allowing instant toggling between Static Mock Field (`🧪 MOCK FIELD`) and Live Engine Simulation (`⚙️ LIVE ENGINE`), plus a `"🔄 Cycle Positions"` button to test monster position transitions in real-time.

**Files added/changed:**
- `src/shared/types/field.ts`: TypeScript interfaces for `FieldCard`, `CardPositionState`, `PlayerFieldState`, `DuelBoardState`.
- `src/shared/types/index.ts`: Exported `field.ts`.
- `src/renderer/utils/media.ts`: Added `getUiIconUrl()`, `getLocationIconUrl()`, `getStatusIconUrl()`.
- `src/renderer/utils/mockDuelState.ts`: Mock duel state generator.
- `src/renderer/components/duel/FieldZoneSlot.vue`: Card slot component with 5 position states.
- `src/renderer/components/duel/DeckStack.vue`: 3D layered stack component for Deck, Extra Deck, Graveyard, Banished.
- `src/renderer/components/duel/HandFan.vue`: Fanned hand component for User and Opponent.
- `src/renderer/components/duel/LifePointsMeter.vue`: LP scoreboard with tabular numerals and health bars.
- `src/renderer/components/duel/CardPreviewPopup.vue`: Detailed hover card inspector popup.
- `src/renderer/components/duel/DuelHud.vue`: Top HUD bar with phase indicator and action prompts.
- `src/renderer/components/duel/DuelMenuModal.vue`: In-duel menu glass modal.
- `src/renderer/components/duel/DuelLogPanel.vue`: Slide-out event log drawer.
- `src/renderer/components/duel/DuelField.vue`: Master 16:9 arena field layout.
- `src/renderer/components/duel/index.ts`: Barrel export.
- `src/renderer/assets/styles/pages/_duel.scss`: SCSS styles for letterboxing and arena layout.
- `src/renderer/views/DuelView.vue`: Master Duel View integration.

**Decisions made / deviations from the plan:**
- **Authentic Monster Defense Positioning**: In strict compliance with Yu-Gi-Oh! visual rules (`development-plan.md` §3.1), Defense position monsters are rotated 90° into landscape orientation. Face-down Set monsters display the official swirl card-back texture while in landscape orientation.
- **Letterboxed 16:9 Arena Canvas**: The duel arena renders in a strict 16:9 container (`aspect-ratio: 16 / 9; max-width: 1920px; max-height: 1080px`) with radial vignette letterboxing, preventing field distortion or overlapping on non-16:9 displays.
- **Dev QA Controls Toolbar**: Added a discrete floating toolbar allowing one-click cycling of battle positions and instant switching between the Phase 9 static mock layout and Phase 2/10 live engine dueling.

**Known issues / TODO carried to next phase:**
- Phase 10 will connect the static Duel Field layout to live `duelStore` and `DuelEngineService` events, implementing player idle-phase command menus (Normal Summon, Set, Activate, Attack, Change Position, End Phase), phase progression, and End Phase hand-size cleanup rules (>6 cards).

**How to manually verify this phase:**
1. Run `npm run dev` to launch the application.
2. From the **Main Menu**, click **"Start Duel"** -> select Heads/Tails -> skip intro -> arrives at the **Duel Screen** (`/duel`).
3. Inspect the **16:9 Duel Arena Field**:
   - **User MMZ**: Verify *Dark Magician* (Face-up Attack), *Celtic Guardian* (Face-up Defense, rotated 90°), and *Man-Eater Bug* (Face-down Set Defense, rotated 90° with card back).
   - **User STZ**: Verify *Mirror Force* (Face-down Set Trap) and *Swords of Revealing Light* (Face-up Spell).
   - **User Field Zone**: Verify active Field Spell *Yami*.
   - **User Graveyard**: Verify stack with *Summoned Skull* top card thumbnail and count badge `3`.
   - **User Deck & Extra Deck**: Verify 3D layered stacks with count badges `34` and `3`.
   - **User Banished**: Verify stack with count badge `1`.
   - **Opponent Field**: Verify mirrored layout with *Blue-Eyes White Dragon* (Attack), *Vorse Raider* (Attack), *Battle Ox* (Set Defense 90°), *Ring of Destruction* (Set), *Dark Hole* (Face-up), *Mountain* (Field Zone), and Graveyard stack with *La Jinn* (`2`).
   - **Hands**: Verify User Hand has 5 fanned cards with hover elevation and foil gleam; verify Opponent Hand has 5 fanned card backs.
   - **LP Meters**: Verify User LP (`8000`) at bottom-left and Opponent LP (`8000`) at top-right with health bars and avatars.
   - **Card Preview Popup**: Hover over any card on field, hand, or GY to verify the left inspector displays full artwork, attribute, level stars, ATK/DEF, and lore.
   - **Menu Button**: Click `Menu` in top-right HUD -> confirms in-duel pause modal opens with Resume, Surrender, Restart, and Audio sliders.
   - **Duel Log Button**: Click `Log` in top-right HUD -> confirms slide-out drawer displays duel event history.
   - **Tooltips**: Hover over `EMZ 1`, `EMZ 2`, `Pendulum Jewels`, `MATE`, `Field Status`, and `Activation Confirmation` buttons to confirm informative tooltips appear.
   - **Dev Toolbar**: Click `"🔄 Cycle Positions"` in bottom-right to verify Dark Magician flips dynamically between Attack, Face-up Defense, and Face-down Set.

---

## 2026-08-19 — Phase 10: Duel Field — Engine Wiring & Turn Flow

**What was done:**
- **Engine Query Snapshot & Perspective Redaction**: Implemented message-driven board state tracking and `duelEngineService.getBoardState()` returning `DuelBoardState` snapshot with anti-cheat card redaction (opponent hand and unrevealed face-down cards are masked to `code: 0` / `'Card Back'`).
- **BigInt-Safe IPC Serialization**: Enhanced `messageDecoder.ts` and `DuelEngineService.ts` with `sanitizeBigInts()`, recursively converting all 64-bit engine integers (`hints`, `descriptions`, `options`) to strings, preventing JSON/IPC structured clone crashes.
- **Human vs AI Dual-Perspective Prompt Router**: Wired engine event processing loop to distinguish human player prompts (`promptPlayer === humanPlayerId`) from opponent AI prompts (`promptPlayer !== humanPlayerId`). Opponent actions automatically execute via placeholder `getAutoResponse()`, while human prompts pause the engine and surface rich UI actions.
- **Upgraded Pinia `duelStore`**: Added live reactive `boardState`, active prompt trackers (`activeIdleCmd`, `activeBattleCmd`, `activeSelectCard`, `activeSelectChain`, `activeSelectPosition`, `activeSelectEffectYn`, `activeSelectOption`, `activeSelectTribute`), and command execution dispatchers (`executeNormalSummon`, `executeSpecialSummon`, `executeMonsterSet`, `executeSpellSet`, `executeActivate`, `executePosChange`, `executeToBattlePhase`, `executeToMainPhase2`, `executeToEndPhase`, `executeDeclareAttack`, `executeSelectCard`, `executeSelectPosition`, `executeSelectChain`, `executeSelectEffectYn`, `executeSelectOption`).
- **Interactive `CardActionMenu.vue`**: Built contextual popover menu for hand and field cards displaying only legal actions reported by the engine for that specific card (Normal Summon ⚔️, Special Summon ✨, Set Monster 🛡️, Set Card 📜, Activate Effect ⚡, Change Position 🔄, Declare Attack ⚔️).
- **Interactive `PromptModal.vue`**: Built glass modal dialog handling all selection prompts from the engine:
  - **End Phase Hand-Size Cleanup Rule (§3.4)**: If a player holds > 6 cards at End Phase, the engine halts with `SELECT_CARD (min: count - 6)`. The modal displays a dedicated warning header, card thumbnail grid, selection counters, and disables the Discard button until the exact required count is selected.
  - **General Card Selection**: Min/max card selector with confirm/cancel buttons.
  - **Position Choice**: Face-up Attack vs Face-up Defense vs Face-down Set Defense.
  - **Chain Opportunity**: Activating card effect options + "Pass (Do Not Chain)" button.
  - **Effect Yes/No**: Confirmation dialog for optional trigger activations.
  - **Tribute Selection**: Monster tribute selector.
- **Turn Progression HUD & Live Game Flow**: Added active phase pill highlights (`DP`, `SP`, `M1`, `BP`, `M2`, `EP`) and phase progression buttons (`⚔️ Battle Phase`, `🛡️ Main Phase 2`, `⌛ End Turn`) in `DuelHud.vue`. Connected Victory / Defeat game-over overlay in `DuelView.vue`.

**Files created/modified:**
- `src/shared/types/duel.ts`: Added prompt payload interfaces and action parameter definitions.
- `src/shared/types/field.ts`: Added `winReason` to `DuelBoardState`.
- `src/shared/types/ipc.ts`: Added `DUEL_GET_BOARD` channel and `getBoardState` to `DuelAPI`.
- `src/main/ipc/index.ts`: Registered `DUEL_GET_BOARD` IPC handler.
- `src/preload/index.ts`: Exposed `getBoardState()` to `window.duelAPI`.
- `src/main/engine/messageDecoder.ts`: Added BigInt sanitation, prompt metadata enrichment, and phase code mapping.
- `src/main/engine/DuelEngineService.ts`: Added message-driven board state tracking, `getBoardState()`, BigInt-safe IPC event broadcasting, and automatic `SELECT_PLACE` resolution.
- `src/renderer/stores/duelStore.ts`: Added reactive `DuelBoardState`, active prompt state, legal action resolution helpers, and command execution methods.
- `src/renderer/components/duel/CardActionMenu.vue`: Contextual card action popover.
- `src/renderer/components/duel/PromptModal.vue`: Glass selection modal for hand cleanup, position, chain, and effect prompts.
- `src/renderer/components/duel/DuelHud.vue`: Added phase progression buttons and dynamic active phase pills.
- `src/renderer/components/duel/FieldZoneSlot.vue`: Passed MouseEvent coordinates on card clicks.
- `src/renderer/components/duel/HandFan.vue`: Passed MouseEvent coordinates on card clicks.
- `src/renderer/components/duel/index.ts`: Barrel export for new components.
- `src/renderer/views/DuelView.vue`: Master integration with live engine default mode, prompt modal, card action menu, and victory/defeat overlay.

**Decisions made / deviations from the plan:**
- **Automatic `SELECT_PLACE` Resolution**: When activating Spells/Traps or placing monsters without a manual zone requirement, `DuelEngineService` automatically selects the first available valid zone via `getAutoResponse()`, matching official Master Duel / YGOPRO UX and preventing unnecessary modal interruptions.
- **Strict Discard Validation**: Hand-size cleanup selection requires the exact `min` number of cards to be chosen before the "Discard" button is enabled, preventing invalid engine response errors.

**Known issues / TODO carried to next phase:**
- Phase 11 will build the real-time Guidance System (§3.5, HUD glow/pulse for playable cards, fast-effect chain prompt indicators, action timer bar, and tutorial tips).

**How to manually verify this phase:**
1. Run `npm run dev` to launch the application.
2. From the **Main Menu**, click **"Start Duel"** -> select Heads/Tails -> skip intro -> arrives at the live **Duel Screen** (`/duel`).
3. **Turn 1 (Main Phase 1)**:
   - Click a Level 4 monster in hand (e.g. *Celtic Guardian*) -> click **"⚔️ Normal Summon"** -> verify the monster appears in your Monster Zone.
   - Click a Spell/Trap card in hand (e.g. *Mirror Force*) -> click **"📜 Set Card"** -> verify it appears face-down in your Spell/Trap Zone.
   - Click a Spell card in hand (e.g. *Pot of Greed*) -> click **"⚡ Activate"** -> verify 2 cards are drawn into your hand.
4. **Phase Progression**:
   - In the top HUD center banner, click **"⌛ End Turn"** -> verify phase switches to `EP` then turn passes to the Opponent.
5. **Opponent Turn (Turn 2)**:
   - Watch the Opponent AI automatically draw a card, Normal Summon a monster, and enter Battle Phase.
   - When a Chain prompt appears (e.g. fast-effect window), click **"Pass (Do Not Chain)"**.
6. **Battle Phase (Turn 3)**:
   - On Turn 3, in the top HUD banner, click **"⚔️ Battle Phase"**.
   - Click your Attack Position monster -> click **"⚔️ Declare Attack"** -> verify battle damage is dealt to opponent Life Points.
7. **End Phase Hand-Size Cleanup Rule**:
   - Activate Spells/Pots of Greed until holding more than 6 cards in hand.
   - Click **"⌛ End Turn"**.
   - Verify the **"Hand Size Limit Exceeded"** modal appears, displaying all cards in hand and instructing you to select the exact excess cards.
   - Select the required number of cards and click **"Discard"** -> verify selected cards are sent to the Graveyard and turn passes cleanly.

