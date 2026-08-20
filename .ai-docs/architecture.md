# Architecture — YGO Desktop Duel (working title)

> Companion docs: `development-plan.md` (phased build order), `design-system.md` (visual system), `phases-prompts.md` (per-phase Coding Agent prompts), `images-prompts.md` (art asset briefs), `answered-questions.md` (assumptions made on your behalf).

## 1. What we're building

An offline, single-player (User vs AI) Yu-Gi-Oh! desktop game, packaged with Electron, UI in Vue 3 + SCSS, real duel logic delegated to the actual `ygopro-core` rules engine (not a custom re-implementation). Card pool restricted to the original Yu-Gi-Oh! series and Yu-Gi-Oh! GX series.

## 2. Research findings (why these choices)

### 2.1 `ygopro-core`

- `ygopro-core` (originally Fluorohydride, now most actively maintained as **`edo9300/ygopro-core`**, the engine that powers EDOPro/ProjectIgnis) is a **C++ state machine + embedded Lua script processor**. It is _not_ a full game client — it's a duel simulator. A host application must:
  1. Feed it a **card database** (`cards.cdb`, SQLite) via a `card_reader` callback.
  2. Feed it **card scripts** (Lua files, one per card effect, e.g. `c46986414.lua` for Dark Magician) via a `script_reader` callback.
  3. Drive it with a `new_duel` → `start_duel` → `process` loop, reading **binary messages** (`MSG_*`, e.g. `MSG_SELECT_IDLECMD`, `MSG_ATTACK`, `MSG_DRAW`) that describe what happened / what input is needed, and pushing back **responses** (`set_responsei` / `set_responseb`) chosen by the player or the AI.
  4. It deliberately keeps **hidden zones hidden**: `query_card`/`query_field_card` calls return different data depending on which `playerid` is asking and whether a card is public information at that moment. This is the mechanism we use to guarantee the AI cannot see the human's hand or deck (see §6).
- Native compilation of `ocgcore` requires a C++ toolchain (CMake/MSVC/Clang) and produces a platform-specific `.dll`/`.so`/`.dylib`, which is painful to ship cross-platform inside an Electron app (native module rebuilds per Electron ABI, per OS, per arch).
- **Recommended integration path:** `n1xx1/ocgcore-wasm` — the EDOPro core compiled to **WebAssembly** via Emscripten, with a TypeScript wrapper (`createCore()`, `createDuel()`, `duelProcess()`, `duelGetMessage()`, `duelSetResponse()`, etc.). This:
  - Runs identically on Windows/macOS/Linux with zero native rebuilds.
  - Runs inside **Node.js** (Electron's main process, or a Node worker thread) — perfect for Electron.
  - Ships as an npm-installable package + `.wasm` binary we vendor in `resources/engine/`.
  - Exposes a message-loop API that matches the shape described above 1:1.
- We will **fork/vendor** `ocgcore-wasm`'s output (wasm binary + JS glue) into our repo rather than depending on a moving npm package, and pin the exact `edo9300/ygopro-core` commit it was built from, so behavior never silently changes.

### 2.2 Card database & scripts

- The engine needs, for every legal card: (a) a row in `cards.cdb` (id/code, type, atk/def, level, race, attribute, text) and (b) a Lua script implementing its effect (official scripts live in the community-maintained `ygopro-scripts` set that ships with EDOPro/YGOPro forks).
- We will build our own **filtered `cards.cdb`** containing **only** cards that were released in TCG/OCG sets that map to the _original Yu-Gi-Oh!_ anime/manga era and the _Yu-Gi-Oh! GX_ era (roughly DM-era “Legend of Blue Eyes White Dragon” through “Cyberdark Impact”/GX-era sets, plus the _Starter/Structure Decks_ aligned with those series — exact set-code whitelist to be finalized in Phase 2 and recorded in `progress.md`). We copy only the matching `.lua` scripts referenced by those cards. This keeps the AI's card pool, the deck editor's card pool, and the asset-download pool all consistent with one whitelist file (`data/card-pool-whitelist.json`).
- Source of card metadata + images: **YGOPRODeck public API** (`db.ygoprodeck.com/api/v7/cardinfo.php`), which returns `card_images[].image_url` (full), `image_url_small` (mini), `image_url_cropped` (art-only, framing removed) — exactly the 3 variants requested. Their terms require: cache locally, don't hotlink at runtime, respect a 20 req/sec rate limit. Our downloader script therefore does a **one-time offline bulk download** (Phase 3) into `resources/cards/{full,art,mini}/{cardId}.jpg`, and the shipped game never calls the network again.

### 2.3 Electron ↔ Vue ↔ Engine wiring

```
┌─────────────────────────────── Electron App ───────────────────────────────┐
│                                                                              │
│  Main Process (Node.js)                    Renderer Process (Chromium)     │
│  ┌────────────────────────┐   IPC (contextBridge, invoke/on)  ┌──────────┐ │
│  │ DuelEngineService       │◄────────────────────────────────►│ Vue App  │ │
│  │  - owns ocgcore-wasm    │   duel:command / duel:event       │  Pinia   │ │
│  │  - owns cards.cdb read  │                                   │  stores  │ │
│  │  - owns AI module       │                                   │  Views   │ │
│  │  - message loop         │                                   │  Comps   │ │
│  │  - "view filter" layer  │                                   └──────────┘ │
│  │    (redacts hidden info │                                                │
│  │    before it ever       │        preload.ts (contextIsolation: true,    │
│  │    reaches renderer)    │        nodeIntegration: false)                │
│  └────────────────────────┘                                                │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Why the engine lives in the main process, not the renderer:** it needs Node filesystem access (reading `cards.cdb` and hundreds of `.lua` files) and we want a single trusted place that enforces information hiding before anything crosses into the (less trusted, DevTools-inspectable) renderer. The renderer **never receives** the AI's hand/deck contents in memory — the main process filters every `query_card` result per-viewer before sending it over IPC.
- Renderer is a standard Vue 3 (Composition API, `<script setup>`) SPA with Vite as the dev/build tool, styled with SCSS (7-1 architecture, see `design-system.md`), state in Pinia.
- `preload.ts` exposes a narrow, typed API (`window.duelAPI.sendCommand(...)`, `window.duelAPI.onEvent(cb)`, `window.deckAPI.*`, `window.settingsAPI.*`) via `contextBridge`. No direct `ipcRenderer`/`require` in renderer code. `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` where feasible.

## 3. High-level module map

```
src/
  main/                         # Electron main process (Node/TS)
    index.ts                    # app bootstrap, window creation
    ipc/                        # ipcMain handlers, thin — delegate to services
    engine/
      ocgcore-wasm/              # vendored wasm binary + JS glue (from n1xx1/ocgcore-wasm build)
      DuelEngineService.ts        # owns duel handle, message loop, response queue
      messageDecoder.ts           # binary MSG_* -> typed JS event objects
      viewFilter.ts                # per-player visibility redaction
      cardReader.ts                # cards.cdb lookups (better-sqlite3)
      scriptReader.ts              # reads .lua by name, caches in memory
    ai/
      AIController.ts             # turn-loop entry: decide response for a given MSG_SELECT_*
      strategies/                 # per-archetype/deck heuristics + generic fallback
      evaluators/                 # board/hand scoring helpers
    decks/
      characterDecks/*.ydk        # 3 prebuilt decks per character
      deckLoader.ts
    persistence/
      store.ts                    # electron-store wrapper: settings, custom decks, dev flags
  preload/
    index.ts                      # contextBridge surface
  renderer/                       # Vue 3 app
    main.ts
    App.vue
    router/
    stores/                       # Pinia: duelStore, uiStore, deckEditStore, settingsStore, devToolsStore
    views/
      LoadingView.vue
      MainMenuView.vue
      SettingsView.vue
      DeckEditView.vue
      CoinTossView.vue
      PreDuelVideoView.vue
      DuelView.vue
    components/
      common/                     # GlassPanel, YugiButton, YugiModal, Tooltip, IconIndicator, LoadingSpinner
      duel/                       # FieldZone, MonsterSlot, SpellTrapSlot, HandFan, LifePointsMeter,
                                   # GraveyardStack, BanishedStack, DeckStack, ExtraDeckStack, FieldZoneSlot,
                                   # CardPreviewPopup, TargetingOverlay, ActionGuideDialog, DuelLogPanel,
                                   # StatusIconRow, VideoOverlay
      deckEdit/                   # DeckColumn, CardGridVirtualized, CardFilterBar, CardPreviewer
      settings/                   # OpponentCarousel, CharacterCard
    assets/
      styles/                     # SCSS 7-1 structure, see design-system.md
      icons/
  shared/
    types/                        # shared TS types/enums (mirrors ocgapi.h enums: Location, Position, MsgType…)
    constants/
resources/                        # NOT bundled into JS, copied as extra resources
  cards/{full,art,mini}/*.jpg
  scripts/official/*.lua
  cards.cdb
  videos/{characters,cards}/*.mp4
  fonts/
data/
  card-pool-whitelist.json
  characters.json                 # 20 characters, 3 decks each, portrait + video refs
```

## 4. Duel engine data flow (turn loop)

1. Renderer requests `NEW_DUEL` with the two decks (from `deckLoader`) → main creates the wasm duel handle, seeds LP/draw counts, calls `start_duel`.
2. Main enters the **process loop**: `duelProcess()` returns `CONTINUE` / `END` / a "waiting for response" state after decoding queued messages via `duelGetMessage()`.
3. Each decoded message is:
   - Logged (dev-only Duel Log).
   - Passed through `viewFilter.ts`, which knows the _human's_ `playerid` and strips/blank-fills any field not visible to a human observer (opponent hand contents, opponent deck order, etc.) before it's ever serialized over IPC — this is enforced **structurally**, not just "the UI chooses not to show it."
   - If the message requires a response **from the human**, it's sent to renderer as a `duel:event` (`type: 'select-idle-cmd' | 'select-card' | 'select-place' | ...`) and the loop blocks until `duel:command` arrives.
   - If it requires a response **from the AI**, `AIController` is invoked synchronously with the (already-filtered-to-AI's-view) game state and must call the same `set_response*` shape a human input would produce.
4. When a "video-worthy" trigger fires (e.g., `MSG_SUMMONING` for a card code present in `data/characters.json` → `specialVideos` map, or `MSG_ATTACK` for such a card), main emits a `duel:play-video` event **before** continuing the process loop, and **pauses** feeding further messages/AI turns until renderer sends `duel:video-finished`. This guarantees "video playing ⇒ engine frozen," satisfying the requirement that the AI cannot act mid-video.
5. Renderer applies each event to `duelStore` (a normalized field-state object: 5 monster zones × 2 players, 5 s/t zones × 2, field zone, GY, banished, extra deck count, deck count, hand — human hand full data, AI hand only count+backs) and components re-render reactively.

## 5. Card pool filtering pipeline (build-time, not runtime)

`scripts/build-card-pool.ts` (Node, run during content pipeline, output checked into `data/` & `resources/`):

1. Read `data/set-code-whitelist.json` (curated list of set codes belonging to the DM-era and GX-era, produced in Phase 2 research and reviewed by you before locking).
2. Query YGOPRODeck bulk endpoint, filter cards whose `card_sets[].set_code` intersects the whitelist (archetypes/character staples double-checked by name against a manual allow-list for anime-accurate cards without a matching TCG set, e.g. anime-only cards get **excluded** unless you explicitly want anime-only/non-TCG cards — see `answered-questions.md`).
3. Emit filtered `cards.cdb` (subset of the full delta db), copy only referenced `.lua` scripts, and a manifest `data/card-pool-whitelist.json` (id → name → era tag `DM|GX`).
4. Download the 3 image variants per surviving card id into `resources/cards/{full,art,mini}/{id}.jpg` (rate-limited to ≤20 req/s, resumable, skip-if-exists).

## 6. Hidden information & anti-cheat guarantee

- The AI never receives a JS object containing the human's hand/deck — `viewFilter.ts` (used identically for both viewers) produces **two separate, independently redacted state snapshots** per engine event: one for "human view," one for "AI view." `AIController` is only ever given the AI-view snapshot, structurally incapable of reading the human's private zones.
- The only path for legitimate reveals (e.g., a card effect that shows the opponent's hand) is the engine itself emitting a message that marks those specific cards as `location & POS_FACEUP`/public for that query — the filter respects exactly what `ocgcore` reports as visible, so effect-driven reveals work automatically and nothing else does.

## 7. AI opponent design (Phase 13, not custom rules engine)

- The AI **reuses the exact same engine** as the human (no shortcut simulation) — it just supplies responses to the same `MSG_SELECT_*` prompts a human would face, so it is bound by all the same rules automatically (no "the AI knows a card is a trap it hasn't seen" type bugs, because it structurally can't see it).
- Decision layer: a scored-heuristic AI (not full minimax/MCTS in v1 — noted as a fine-tuning target for later versions): for each decision point, enumerate legal responses (engine can be queried for legal moves), score with a lightweight evaluator (board presence, LP delta, card advantage, hand size, known deck archetype game-plan from `strategies/`), pick highest score with light randomness so it isn't perfectly deterministic/character-appropriate (e.g., Kaiba AI weights big-Dragon beatdown lines higher; Yugi/Jaden AI plays more reactive/toolbox).
- AI "thinking" is throttled with a minimum artificial delay (e.g. 600–1200ms) so it doesn't feel instant/robotic — configurable constant.

## 8. Persistence

- No multiplayer/server — nothing is remote. `electron-store` (JSON on disk, in userData dir) holds: settings, custom decks the user builds in Deck Edit, dev-mode toggle (Duel Log visibility default), last-selected opponent.
- Prebuilt character decks ship as static `.ydk`-style JSON in `resources/decks/` — never edited by the player.

## 9. Performance practices

- Card grid in Deck Edit uses a **virtualized list** (only render visible rows) and the **mini** image variant (smallest of the three) exclusively; full-size images are only loaded on hover, in the previewer, lazily, and cached in-memory (LRU, capped) so repeated hovers don't reflow/refetch.
- Field renders use CSS transforms/`will-change` for zone highlighting and card movement, not layout-triggering properties.
- Engine message loop runs off the renderer thread entirely (main process), so heavy rules computation never blocks UI paint; IPC payloads are kept minimal (deltas, not full state, where practical).
- Images are pre-optimized (mozjpeg/sharp) at build time; mini variant additionally re-encoded to a small fixed size (e.g. 96×140) rather than relying on CSS-scaling full images.
- Videos are compressed (H.264 mp4, capped resolution) and preloaded just-in-time (metadata preload, not full buffer) to avoid stutter without wasting memory on 20 characters' worth of clips.

## 10. Security & offline guarantee

- `webSecurity: true`, no remote content loaded ever, `will-navigate`/`new-window` blocked in main, CSP meta tag restricting to `'self'`.
- All fonts/images/videos/engine assets are bundled; first run does **not** require internet. (The _content pipeline_ — Phase 3 image/script download — is a one-time developer-side build step, not something the shipped app does.)

## 11. Build & packaging

- `electron-builder` targets: NSIS (Windows), dmg (macOS), AppImage (Linux). `extraResources` maps `resources/` into the packaged app unmodified (read at runtime via `process.resourcesPath`).
- `better-sqlite3` (native module) needs Electron-specific rebuild (`electron-rebuild` / `@electron/rebuild`) wired into `postinstall`.

## 12. Open technical decisions to confirm during Phase 0

See `answered-questions.md` — I made explicit assumptions for all of these so Phase 0 isn't blocked, but flag if you want them changed:

- Exact set-code whitelist boundaries for "original series" vs "GX series."
- Whether anime-exclusive (never released to TCG/OCG) cards should be included.
- Target Electron/Node/Vue versions (pinned to latest stable LTS-compatible combo at Phase 0 time).
