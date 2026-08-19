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
- Click each of the 7 links in the top dev navigation bar:
  1. `Loading (P5)` -> shows Loading Screen placeholder
  2. `Main Menu (P5)` -> shows Main Menu placeholder
  3. `Settings (P6)` -> shows Settings & Opponents placeholder
  4. `Deck Edit (P7)` -> shows Deck Construction placeholder
  5. `Coin Toss (P8)` -> shows Coin Toss Decision placeholder
  6. `Pre-Duel (P8)` -> shows Pre-Duel Video placeholder
  7. `Duel (P9)` -> shows Ancient Duel Arena placeholder
- Open DevTools (`Cmd+Opt+I` or detached) and verify 0 console errors.
- Run `npm run build`, `npm run typecheck`, `npm run lint`, and `npm run format:check` to confirm automated QA passes.
