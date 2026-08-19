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
- Generated stylized "Ancient Duel Arena" fallback assets:
  - `resources/cards/card-back.jpg` & `resources/ui/card-back.png`: Egyptian obsidian/gold swirl card back with Millennium Eye motif.
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

