# Yu-Gi-Oh! Desktop Duel Arena (DM + GX Era) — Master Project Context & Architectural Guide

> **Important Note for AI Assistants & Developers**:  
> This document is the single source of truth for the entire **Yu-Gi-Oh! Desktop Duel Arena** codebase. It contains the complete architectural blueprint, engine internals, data flow, card identity conventions, AI decision pipelines, packaged runtime path rules, and testing/packaging workflows. Read this file first to gain full context on the codebase without needing to re-scan every individual file.

---

## 1. Project Overview & Tech Stack

**Yu-Gi-Oh! Duel Arena** is a full-featured, offline desktop duel simulator built with Electron, Vue 3, TypeScript, and WebAssembly. It is strictly curated for the classic **Duel Monsters (DM)** and **GX** anime eras (3,205 legal cards with zero modern Synchro/Xyz/Link leaks).

### Tech Stack Breakdown
| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Desktop Shell** | Electron 35, Node 22 | Native desktop lifecycle, IPC bus, custom protocol handler (`app-resource://`), file persistence |
| **UI Framework** | Vue 3.5 (Composition API), Pinia 3.0, Vite 6, SCSS | 3D perspective battle arena, virtualized card grid, glassmorphism modal system, reactive stores |
| **Duel Engine** | `ocgcore-wasm` (v11.0), Lua 5.1 | WebAssembly compilation of official `ygopro-core` engine executing authentic game rules and Lua scripts |
| **Card Database** | `better-sqlite3`, SQLite (`cards.cdb`) | 3,205 card definitions (ATK, DEF, Level, Race, Attribute, Category, Aliases, Lore, Effect Text) |
| **Audio Engine** | Web Audio API (`AudioManager`), procedural synth | Dual-bus mixing (Master, BGM, SFX), dynamic cutscene ducking, 6 BGM themes, 44 SFX triggers |
| **AI Subsystem** | Local WindBot-Ignite Heuristic Engine + LLM Multi-Provider | High-speed tactical evaluator + optional LLM duelists (Google Gemini, Groq, OpenAI, Claude, DeepSeek, Ollama) |
| **Build & Tooling** | `esbuild`, `vite`, `tsx`, `electron-builder`, `sharp` | Sub-second TS bundling, automated test runners, asset optimizers, NSIS/DMG packaging |

---

## 2. Directory Structure Map

```
/Users/dash/personal/games/yugioh-electron/
├── data/                                 # Static metadata manifests
│   ├── card-pool-whitelist.json          # Whitelist of all 3,205 verified legal DM & GX cards
│   ├── card-videos.json                  # Monster summon & attack MP4 video trigger mappings
│   ├── characters.json                   # 40 DM & GX duelist profiles, signature cards, dialogue
│   ├── prebuilt-decks.json               # 420+ canonical character decks & popular meta decks
│   └── set-code-whitelist.json           # Archetype setcode bitmask whitelist
│
├── docs/                                 # Developer guides & master architecture docs
│   ├── PROJECT_CONTEXT_AND_ARCHITECTURE.md  # THIS MASTER DOCUMENT
│   └── ai-deck-development-guide.md      # Guide for authoring AI archetype executors
│
├── resources/                            # Game assets & core engine database
│   ├── cards.cdb                         # SQLite card database (tables: datas, texts)
│   ├── scripts/                          # Lua script runtime
│   │   ├── constant.lua, utility.lua     # Global constants and auxiliary helper functions
│   │   └── official/                     # 2,800+ card effect scripts (c<passcode>.lua)
│   ├── cards/                            # 3-tier card images (full/, art/, mini/)
│   ├── backgrounds/                      # Anime battle arena mats & UI backgrounds
│   ├── characters/                       # Character avatars, full-body poses & cutscenes
│   ├── sounds/                           # Authentic .wav & .mp3 retro sound effects
│   └── videos/                           # MP4 summon/attack cutscenes (videos/cards/)
│
├── src/
│   ├── main/                             # Electron Main Process
│   │   ├── index.ts                      # Main entry, window lifecycle, app-resource:// protocol
│   │   ├── engine/                       # Duel Engine & ocgcore integration
│   │   │   ├── DuelEngineService.ts      # Engine coordinator (step loop, prompt dispatch, state)
│   │   │   ├── cardReader.ts             # SQLite cards.cdb reader & alias resolver
│   │   │   ├── scriptReader.ts           # Lua script loader & compatibility preprocessor
│   │   │   ├── messageDecoder.ts         # ocgcore raw message packet decoder
│   │   │   ├── viewFilter.ts             # Anti-cheat redaction of hidden opponent cards
│   │   │   └── stringResolver.ts         # System string & card option string resolver
│   │   ├── ai/                           # Duelist AI Intelligence Subsystem
│   │   │   ├── index.ts                  # AI entry point & anti-cheat validator
│   │   │   ├── AIController.ts           # AI decision coordinator & prompt evaluator
│   │   │   ├── UniversalAI.ts            # Core card scoring & tactical math
│   │   │   ├── personalityProfiles.ts    # 40 duelist personality weight matrices
│   │   │   ├── executors/                # WindBot-inspired archetype executors
│   │   │   │   ├── DefaultExecutor.ts    # Universal competitive baseline executor
│   │   │   │   └── archetypes/           # Custom executors (Dark Magician, Blue-Eyes, HERO, etc.)
│   │   │   ├── llm/                      # Multi-provider LLM duelist service (Gemini, Groq, etc.)
│   │   │   └── reviewer/                 # Post-Match Reviewer (tactical blunder analysis)
│   │   ├── decks/                        # Deck loading, YDK parsing, and getResourcePath resolver
│   │   ├── persistence/                  # electron-store configuration (settings, custom decks)
│   │   └── ipc/                          # Main IPC handlers for duel, deck, audio, settings
│   │
│   ├── renderer/                         # Vue 3 Single Page Application
│   │   ├── views/                        # Top-level views (DuelView, DeckEditView, MainMenu, Settings, Logs)
│   │   ├── components/duel/              # Duel field, hands, slots, video overlay, prompt modals
│   │   ├── components/deckEdit/          # Deck builder virtualized grid, column, previewer, selector
│   │   ├── stores/                       # Pinia stores (duelStore, deckEditStore, settingsStore, duelLogsStore)
│   │   ├── audio/                        # AudioManager (Web Audio graph, BGM/SFX, dynamic ducking)
│   │   └── assets/                       # UI fonts, icons, branding
│   │
│   ├── preload/                          # Electron context isolation bridge (preload.cjs)
│   └── shared/                           # Universal types & utility functions shared by main & renderer
│       └── types/                        # card.ts, character.ts, deck.ts, duel.ts, field.ts, prompt.ts
│
├── tests/                                # 33+ Automated integration & regression test suites (npm test)
├── scripts/                              # Build tools (build.ts, dev.ts, asset generators, downloaders)
├── release/                              # Packaged binary installers (NSIS Setup .exe, DMG, AppImage)
├── package.json                          # Dependencies, scripts, and electron-builder metadata
└── electron-builder.json                 # electron-builder packaging configuration
```

---

## 3. Core Engine Internals & Data Flow

### 3.1 The `ocgcore-wasm` Lifecycle
The simulator embeds `ocgcore-wasm`, which wraps the C++ `ygopro-core` engine compiled to WebAssembly.

```
[Main Process: DuelEngineService]
  │
  ├─ 1. init() ──────────────► createCore() initializes WASM memory & Lua 5.1 runtime
  │
  ├─ 2. startNewDuel() ──────► duelNew() creates new match handle
  │                            Loads scripts (constant.lua, utility.lua, card scripts)
  │                            Injects player decks (duelNewCard) and calls startDuel()
  │
  ├─ 3. processStep() ───────► duelProcess(handle) advances engine state
  │                            duelGetMessage(handle) extracts emitted raw byte packets
  │
  ├─ 4. Message Pipeline ────► messageDecoder.decode(msg) parses into DecodedDuelEvent
  │                            updateBoardStateFromMessage(msg) syncs internal field state
  │                            checkVideoTrigger(msg) fires cutscene videos
  │
  └─ 5. Prompt Resolution ───► status === OcgProcessResult.WAITING:
                                 - Finds prompt packet where decoded.isPrompt === true
                                 - If AI's turn: AIController evaluates & calls scheduleAiResponse()
                                 - If Human's turn: Emits prompt over IPC to renderer (duelStore)
```

### 3.2 Finding the Prompt Message in `WAITING` State
When `duelProcess` returns `OcgProcessResult.WAITING`, `rawMessages` contains all events from the step. Trailing informational messages (such as `SHUFFLE_HAND` or `CARD_HINT`) may appear at the end of the array.
* **Rule**: Always search backwards through `rawMessages` for `decoded.isPrompt === true` to identify the prompt packet (`SELECT_BATTLECMD`, `SELECT_IDLECMD`, `SELECT_CARD`, `SELECT_POSITION`, etc.). Never assume the prompt is simply `rawMessages[rawMessages.length - 1]`.

### 3.3 Prompt Response Types
The engine interacts with players through 21 specific prompt response structures:
* `SELECT_IDLECMD` (1): Main Phase actions (Summon, Set, Activate, BP, EP).
* `SELECT_BATTLECMD` (0): Battle Phase actions (Declare Attack, Activate, M2, EP).
* `SELECT_CARD` (5): Target selection (monsters on field, graveyard revivals, hand discards).
* `SELECT_CHAIN` (2): Chain response window (Pass with `index: -1` or activate card index).
* `SELECT_POSITION` (4): Battle position selection (Attack vs Defense).
* `SELECT_TRIBUTE` (3): Sacrificial tribute selection.
* `SELECT_YESNO` / `SELECT_EFFECTYN` (6, 7): Yes/No optional trigger queries.
* `SELECT_OPTION` (8): Modal effect choice (e.g. Choose 1 of 3 bulleted effects).
* `SELECT_PLACE` / `SELECT_DISFIELD`: Zone selection (auto-resolved by `getAutoResponse`).
* `SELECT_SUM` / `SELECT_UNSELECT_CARD`: Ritual Level/ATK matching and flexible selectors.
* `ANNOUNCE_RACE`, `ANNOUNCE_ATTRIB`, `ANNOUNCE_CARD`, `ANNOUNCE_NUMBER`: Declaration prompts.

---

## 4. Card Identity, Aliases & Alternate Artworks

In the Yu-Gi-Oh! OCG/TCG and `cards.cdb`:
* **`id`**: The unique numeric passcode for that specific card art (e.g. `46986414` for original Dark Magician, `46986415`, `46986416`, `36996508` for alternate artworks).
* **`alias`**: The canonical primary passcode. If a card is an alternate artwork, its `alias` column points to the primary card (`46986414`). For primary cards, `alias` is `0` or equal to `id`.

### Core Rules for Aliases in the Codebase:
1. **Deck Building 3-Copy Limit**:
   - The maximum 3-copy rule applies to the **canonical card identity**, not individual artwork IDs.
   - Enforced in `validateDeck` (`src/shared/types/deck.ts`), `deckEditStore.ts`, and `CardGridVirtualized.vue` using `getCanonicalCode(id)`:
   $$\sum \text{copies across all artwork IDs with the same canonical alias} \le 3$$
2. **Video Cutscene Triggers**:
   - In `data/card-videos.json`, videos are keyed by canonical passcode.
   - `DuelEngineService.checkVideoTrigger(msg)` checks both `msg.code` and `cardReader.getCanonicalCode(msg.code)` so that summoning or attacking with **any** alternate artwork of Dark Magician, Blue-Eyes, Neos, Slifer, etc. triggers the monster cutscene.
3. **Card Script Resolution (`c<id>.lua`)**:
   - If an official script `c<id>.lua` does not exist for an alternate artwork, `scriptReader.ts` automatically falls back to `c<alias>.lua`.

---

## 5. Packaged Runtime Path Resolution (CRITICAL)

When Electron is packaged (installed `.exe` on Windows, `.app` on macOS, or AppImage on Linux):
* `process.cwd()` points to the install root (e.g. `C:\Program Files\Yu-Gi-Oh! Duel Arena\`), **NOT** the asset folder!
* `electron-builder.json` places `resources/` and `data/` inside `process.resourcesPath`.

### Safe Path Resolution Helper
Never call `path.resolve(process.cwd(), 'data/...')` or `'resources/...'` directly in the main process! Always use `getResourcePath()` from `src/main/decks/deckLoader.ts`:

```typescript
import { getResourcePath } from '../decks/deckLoader.js';

// Resolves properly in both development (cwd) and packaged production (process.resourcesPath / app.getAppPath)
const decksJson = getResourcePath('data/prebuilt-decks.json');
const cardsDb   = getResourcePath('resources/cards.cdb');
const scriptsDir = getResourcePath('resources/scripts');
```

### Renderer Protocol Handler (`app-resource://`)
In `src/main/index.ts`, the custom protocol `app-resource://` serves images, videos, backgrounds, and audio to the renderer SPA:
* `app-resource://cards/mini/46986414.jpg` $\to$ `process.resourcesPath/resources/cards/mini/46986414.jpg`
* `app-resource://videos/cards/summon_46986414.mp4` $\to$ `process.resourcesPath/resources/videos/cards/summon_46986414.mp4`
* `app-resource://audio/passionate.mp3` $\to$ `process.resourcesPath/resources/audio/passionate.mp3`

### User Persistent Data
Persistent user data (such as `ai-tactical-memory.json` or custom settings) must always use `app.getPath('userData')` to ensure write permissions across all platforms.

---

## 6. AI Intelligence & Duelist Subsystem

The AI system features a dual-layer architecture combining instant local heuristic evaluation with optional high-level LLM strategists:

```
                      [AI Decision Prompt]
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
     [Local Heuristic Engine]       [LLM Multi-Provider]
       (AIController / WindBot)       (Gemini, Groq, Claude, etc.)
                │                             │
    • Tactical Scoring Matrix         • Board State Narrative
    • Card Advantage Optimization     • Strategic Rationale
    • Battle Phase Attack Order       • Anime Duelist Dialogue
    • Anti-Suicide DEF Filters                │
                │                             ▼
                │                  [JSON Decision Schema]
                │                             │
                └──────────────┬──────────────┘
                               ▼
               [assertAiStateSanitized() Check]  ◄── Strict Anti-Cheat
                               ▼
               [scheduleAiResponse() Dispatch]
```

### 6.1 Tactical Rules in `DefaultExecutor.ts` & `UniversalAI.ts`
* **Card Advantage First**: Activates *Pot of Greed*, *Graceful Charity*, *Upstart Goblin*, and searchers before executing summons.
* **Smart Card Destruction Checks**: Penalizes casting *Card Destruction* when AI hand $\le 2$ and opponent hand $\ge 3$ (`-4500` score penalty) to prevent gifting opponents free resources.
* **Smart Tribute Selection**: Prioritizes sacrificing tokens, low-ATK utility monsters (*Sangan*), and stolen opponent monsters (*Snatch Steal*, *Brain Control*). Protects indestructible stall walls (*Marshmallon*, *Spirit Reaper*, *Gellenduo*).
* **Battle Phase Sequencing**: Attacks from lowest ATK to highest ATK to bait battle traps (*Mirror Force*). Avoids attacking into known face-up monsters whose DEF exceeds attacker ATK.
* **Proactive Beatsticks**: High-ATK monsters ($\ge 1400$ ATK) actively attack face-down defense monsters when holding advantage rather than stalling.

### 6.2 Strict Anti-Cheat Assertion
On every AI prompt evaluation, `assertAiStateSanitized(prompt, aiPlayerId)` runs. If any opponent face-down card passcode or private hand card is unredacted (and not revealed by a card like *Ceremonial Bell* or *The Eye of Truth*), the engine throws an immediate assertion failure to ensure zero data leaks.

### 6.3 1-Click Attack Target Execution
In Battle Phase, when declaring an attack while opponent has monsters:
* The prompt is detected via `isAttackTargetPrompt` in `duelStore.ts` (`min: 1`, `max: 1`, BP phase).
* Clicking any highlighted enemy monster immediately executes `executeSelectCard([targetIndex])` in 1 click.
* The floating action bar shows a **"✕ Cancel Attack"** button allowing the player to back out cleanly before selecting a target.

---

## 7. Audio Subsystem & Cutscene Ducking

Managed by `AudioManager` singleton (`src/renderer/audio/AudioManager.ts`):
* **3-Node Audio Graph**: Audio Sources $\to$ `sfxGainNode` / `bgmGainNode` $\to$ `masterGainNode` $\to$ `AudioContext.destination`.
* **6 Selectable BGM Themes**: *Passionate Duelist*, *Master Duel Arena*, *GX Generation*, *Millennium Mystery*, *KaibaCorp Cyber Matrix*, *Casual Duel Lounge*.
* **Dynamic Audio Ducking**: When summon/attack video cutscenes or character dialogues start, `duckBgm('video-overlay', 200)` attenuates BGM volume down to 15% (or 0%), restoring smoothly over 350ms upon completion.
* **Procedural Sound Generator**: `SoundSynthesizer.ts` provides fallback Web Audio synthesized waveforms for all 44 SFX triggers if audio files are offline.

---

## 8. Common Developer Workflows & Commands

### Running the Project Locally
```bash
# 1. Install dependencies
npm install

# 2. Run the application in development mode (with Vite HMR + Electron)
npm run dev

# 3. Rebuild native modules (if better-sqlite3 needs recompilation for local Node/Electron)
npm run rebuild:native
```

### Running Tests
The project maintains **33 comprehensive integration and unit test suites** executing directly against the live engine and database:

```bash
# Run all 33 test suites
npm test

# Run a specific test suite
npx tsx tests/card-mechanics-and-engine-fixes.test.ts
npx tsx tests/guidance-targeting.test.ts
npx tsx tests/legendary-ai-executors.test.ts
```

### Packaging Installers
```bash
# Compile and build renderer SPA + main/preload bundles
npm run build

# Package 64-bit Windows Installable Setup (.exe NSIS)
npx electron-builder --win nsis --x64

# Package macOS (.dmg & .zip for x64 + arm64)
npm run dist:mac

# Package Linux (AppImage / tar.gz)
npm run dist:linux
```

---

## 9. Key Architectural Rules for Future Modifications

1. **Maintain Era Purity**: Never add Synchro, Xyz, Pendulum, or Link monsters to `data/card-pool-whitelist.json` or `resources/cards.cdb`. The simulator is strictly DM + GX.
2. **Always Use `getResourcePath()`**: In main process code, never use `process.cwd()` for files inside `resources/` or `data/`.
3. **Preserve Anti-Cheat**: Always verify that opponent face-down cards and hand cards are masked to `code: 0` unless explicitly made public by continuous card effects (*Ceremonial Bell*, *Respect Play*, *Eye of Truth*, *Mind on Air*).
4. **Group Copy Limits by Canonical ID**: In any deck-building or validation logic, always aggregate card copies using `getCanonicalCode(id)` to prevent adding $>3$ copies across alternate artworks.
5. **Run `npm test` Before Committing**: Always run `npm test` to verify that all 33 engine, card mechanics, AI behavior, and audio test suites pass 100%.

---
*Created for seamless continuity across AI engineering sessions and future project expansion.*
