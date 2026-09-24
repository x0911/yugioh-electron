# AI Agent Onboarding & Developer Manual: Yu-Gi-Oh! Desktop Arena

> **Audience**: AI Agents, LLM Pair Programmers, and Core Contributors.  
> **Mission**: This guide provides everything an AI agent needs to understand the repository, locate relevant code, diagnose bugs, implement new features, and verify changes **without scanning the entire codebase**. Read this document before starting any task!

---

## 1. Quick Orientation & Repository Identity

**Yu-Gi-Oh! Desktop Duel Arena** is an offline, authentic desktop duel simulator built with:
- **Electron 35 / Node 22**: Desktop shell, IPC bridge, custom asset protocol (`app-resource://`).
- **Vue 3.5 / Pinia 3.0 / Vite 6**: Reactive 3D arena, deck editor, card browser, cutscenes, modal dialogs.
- **ocgcore-wasm (ygopro-core v11.0) & Lua 5.1**: Authoritative WebAssembly game rule engine.
- **SQLite (`better-sqlite3`)**: Card stats, lore, text, and alias mappings (`resources/cards.cdb`).
- **Local AI Engine + Multi-Provider LLM**: WindBot-style archetype heuristics + optional LLM duelists.
- **Strict Era Focus**: Duel Monsters (DM), GX, and curated 5D's cards (with EMZ/MR5 mechanics supported).

### Essential Commands
```bash
# Run all 53 automated test suites (Takes ~40s)
npm test

# Run a single targeted test suite (FAST - recommended during iterative development!)
npx tsx tests/cyber-jar-shuffle-set-card.test.ts
npx tsx tests/synchro-and-5ds-roster.test.ts
npx tsx tests/card-mechanics-and-engine-fixes.test.ts

# Start development server (Auto-restarts Electron on main/preload rebuilds)
npm run dev

# Full production build (Main, Preload, and Renderer Vite bundle)
npm run build
```

---

## 2. Fast Navigation Matrix: Where Does Everything Live?

| Task / Subsystem | Primary Files to Inspect |
| :--- | :--- |
| **Engine Step Loop & Prompts** | [`src/main/engine/DuelEngineService.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/engine/DuelEngineService.ts) |
| **Lua Script Loading & Preprocessing** | [`src/main/engine/scriptReader.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/engine/scriptReader.ts) |
| **Card Database & Canonical Aliases** | [`src/main/engine/cardReader.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/engine/cardReader.ts) |
| **ocgcore Message Packet Decoding** | [`src/main/engine/messageDecoder.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/engine/messageDecoder.ts) |
| **Anti-Cheat Redaction** | [`src/main/engine/viewFilter.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/engine/viewFilter.ts) & [`src/main/ai/antiCheatAssert.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/ai/antiCheatAssert.ts) |
| **AI Controller & Decision Loop** | [`src/main/ai/AIController.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/ai/AIController.ts) |
| **AI Combat & Spell/Trap Evaluators** | [`src/main/ai/evaluators/combatEvaluator.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/ai/evaluators/combatEvaluator.ts), [`spellTrapEvaluator.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/ai/evaluators/spellTrapEvaluator.ts) |
| **AI Archetype Executors** | [`src/main/ai/executors/archetypes/`](file:///Users/dash/personal/games/yugioh-electron/src/main/ai/executors/archetypes/) & [`registry.ts`](file:///Users/dash/personal/games/yugioh-electron/src/main/ai/executors/registry.ts) |
| **Frontend Duel Store & State** | [`src/renderer/stores/duelStore.ts`](file:///Users/dash/personal/games/yugioh-electron/src/renderer/stores/duelStore.ts) |
| **3D Duel Field UI Component** | [`src/renderer/components/duel/DuelField.vue`](file:///Users/dash/personal/games/yugioh-electron/src/renderer/components/duel/DuelField.vue) |
| **Audio Manager & Cutscene Ducking** | [`src/renderer/audio/AudioManager.ts`](file:///Users/dash/personal/games/yugioh-electron/src/renderer/audio/AudioManager.ts) |
| **Card Database (`cards.cdb`)** | `resources/cards.cdb` (SQLite tables: `datas`, `texts`) |
| **Lua Scripts** | `resources/scripts/constant.lua`, `utility.lua`, `official/c<passcode>.lua` |
| **ocgcore Wasm Patches** | [`scripts/patch-ocgcore.ts`](file:///Users/dash/personal/games/yugioh-electron/scripts/patch-ocgcore.ts) |

---

## 3. Core Engine Architecture (`ocgcore-wasm` & Lua)

### 3.1 The Engine Coordinator (`DuelEngineService.ts`)
The simulator runs `ocgcore-wasm` in **synchronous mode** (`createCore({ sync: true })`).

```
[DuelEngineService]
       │
       ├─ startNewDuel() ─────────► duelNew() -> loads c0.lua bootstrap -> duelNewCard() -> startDuel()
       │
       ├─ step() / processStep() ─► duelProcess(handle)
       │                                │
       │                                ├─ Returns OcgProcessResult.CONTINUE:
       │                                │    Decodes message stream, updates board state, loops again
       │                                │
       │                                ├─ Returns OcgProcessResult.WAITING:
       │                                │    Finds prompt message (isPrompt === true)
       │                                │    If AI player: schedules AI response
       │                                │    If Human player: emits prompt over IPC to Vue renderer
       │                                │
       │                                └─ Returns OcgProcessResult.END:
       │                                     Emits duel end, records logs, triggers post-match reviewer
       │
       └─ submitResponse() ───────► duelSetResponse(handle, buffer) -> resumes processStep()
```

### 3.2 Finding the Prompt Message in `WAITING`
> [!IMPORTANT]
> When `duelProcess` returns `WAITING`, `rawMessages` contains all messages from that step. **Trailing informational messages (e.g. `MSG_SHUFFLE_HAND`, `MSG_CARD_HINT`) frequently appear AFTER the prompt!**  
> **Rule**: Never grab `rawMessages[rawMessages.length - 1]`. Search backwards for `decoded.isPrompt === true` (`SELECT_IDLECMD`, `SELECT_BATTLECMD`, `SELECT_CARD`, `SELECT_CHAIN`, `SELECT_PLACE`, etc.).

### 3.3 Lua Script Loading & The `isBaseRuntime` Rule (`scriptReader.ts`)
`ScriptReaderService.readScript(name)` serves scripts to ocgcore:
1. **`c0.lua` (Synthetic Bootstrap)**:
   - Evaluated on engine boot.
   - Defines compatibility polyfills (`Auxiliary`, `Auxiliary.GetCount`, `Auxiliary.GetValueType`, `Card.IsSpellTrap`, `Card.IsMonster`, `Effect.GetChainData`).
   - Loads `constant.lua` and `utility.lua`.
   - Has fallback `pcall` guards: if `aux.AddNormalSummonProcedure` or `Synchro` are missing after `utility.lua` runs, it force-loads `proc_normal.lua` and `proc_synchro.lua` and provides safety stubs.
2. **`preprocessScript(content, isBaseRuntime)`**:
   - Replaces bitwise `|` with `+` for flags.
   - Replaces `#var` with `Auxiliary.GetCount(var)`.
   - **CRITICAL GOTCHA**: `isBaseRuntime` **MUST BE TRUE** for core runtime scripts (`utility.lua`, `constant.lua`, `proc_*.lua`). `utility.lua` uses `#g` internally on native Lua tables inside `Auxiliary.GetCount`. If replaced with `Auxiliary.GetCount(g)`, it creates **infinite recursion** and crashes with `attempt to index a number value`!
3. **Card Scripts (`resources/scripts/official/c<id>.lua`)**:
   - If a card script is missing for an alternate art card, `resolveAliasScriptPath(cardId)` looks up the canonical ID in `cards.cdb` and loads `c<alias>.lua`.

### 3.4 ocgcore C++ `no_action` Lockout Rule
In ocgcore C++, `check_action_permission()` blocks card actions if `pduel->lua->no_action > 0`. This counter increments during card initialization or function execution. If an unhandled Lua error occurs during card loading or script execution, the engine can enter an invalid state (`Action is not allowed here`). **Always keep card scripts defensively coded and test them thoroughly.**

### 3.5 Upstream `ocgcore-wasm` Patches (`scripts/patch-ocgcore.ts`)
The project automatically patches `node_modules/ocgcore-wasm/dist/index.js` on every build and test run:
1. **`MSG_SHUFFLE_SET_CARD` (case 36)**: Fixes `count` reading as `e.u8()` and sequential `from`/`to` array decoding.
2. **`MSG_SELECT_SUM` (case 23)**: Fixes `selects_must` reading before `selects` and 18-byte card structure with position.
3. **`duelGetMessage` Guard**: Protects against unexpected parser crashes with a try/catch loop.
4. **`SORT_CARD` Response Serialization (case 15)**: Strips the erroneous leading `t.i8(e.order.length)` byte from `ce()`. In `ygopro-core` C++, `field::sort_card` expects raw card indices starting directly at `returns.bvalue[0]` without a length header.

---

## 4. Card Database, Canonical IDs & Aliases

### 4.1 Passcode (`id`) vs Canonical Alias (`alias`)
- In `resources/cards.cdb`:
  - `id`: The artwork passcode (e.g. `46986414`, `46986415`, `46986416` are all Dark Magician).
  - `alias`: `0` for primary/canonical cards, or the canonical `id` for alternate artworks.
- In `cardReader.ts`:
  ```typescript
  const canonicalId = cardReader.getCanonicalCode(cardId);
  ```

### 4.2 Rules for Working with Aliases
1. **Deck Building 3-Copy Limit**:
   - Enforce copy limits on `getCanonicalCode(id)`, not raw `id`. A deck cannot contain 2 original Dark Magicians and 2 alternate art Dark Magicians (total $\le 3$).
2. **Cutscene Video Triggers**:
   - `data/card-videos.json` keys videos by **canonical passcode**. Check `msg.code` and `cardReader.getCanonicalCode(msg.code)` when triggering cutscenes.
3. **Card Scripts**:
   - Script reader resolves `c<id>.lua` $\to$ `c<canonicalCode>.lua`.

---

## 5. The AI Intelligence Subsystem

The AI system is located under `src/main/ai/` and operates without cheating:

```
                      [AI Decision Prompt]
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       [Archetype Executor]         [DefaultExecutor]
    (e.g. HeroFusion, Monarch)      (Universal Baseline)
                │                             │
                └──────────────┬──────────────┘
                               ▼
                    [Tactical Evaluators]
             • combatEvaluator (ATK vs DEF math)
             • advantageEvaluator (Card draw/search)
             • spellTrapEvaluator (Removal/Protection)
                               │
                               ▼
                [assertAiStateSanitized()]  ◄── Strict Anti-Cheat
                               │
                               ▼
                     [scheduleAiResponse()]
```

### 5.1 Strict Anti-Cheat Verification (`antiCheatAssert.ts`)
The AI must **never** inspect unrevealed opponent cards. On every prompt:
- `assertAiStateSanitized(prompt, aiPlayerId)` runs.
- Opponent face-down cards on field and hidden hand cards MUST have `code: 0`.
- If an unredacted card leaks to the AI (unless revealed by effects like *The Eye of Truth* or *Ceremonial Bell*), an assertion error throws immediately.

### 5.2 Authoring an Archetype Executor
1. Create `src/main/ai/executors/archetypes/<Name>Executor.ts` extending `BaseExecutor`.
2. Implement priority hooks:
   - `handleIdleCmd(prompt)`: Summons, card draw activations, field spells, sets.
   - `handleBattleCmd(prompt)`: Attacks, Battle Phase activations.
   - `handleSelectCard(prompt)`: Targeting priorities.
   - `handleSelectChain(prompt)`: Response priorities.
3. Register the archetype in `src/main/ai/executors/registry.ts`.
4. See `docs/ai-deck-development-guide.md` for full implementation patterns.

---

## 6. Frontend & Electron Architecture

### 6.1 Packaged Runtime Paths (`getResourcePath`)
> [!CAUTION]
> In packaged builds, `process.cwd()` is the app install directory, **not** the assets directory!  
> **Rule**: NEVER use `path.resolve(process.cwd(), 'data/...')` or `resources/...` in the main process.  
> Always import and use `getResourcePath()`:
> ```typescript
> import { getResourcePath } from '../decks/deckLoader.js';
> const dbPath = getResourcePath('resources/cards.cdb');
> ```

### 6.2 Custom Protocol: `app-resource://`
The renderer SPA requests images, cutscenes, and audio using `app-resource://`:
- `app-resource://cards/mini/46986414.jpg` $\to$ Mini card thumbnail.
- `app-resource://cards/full/46986414.jpg` $\to$ High-res card inspect image.
- `app-resource://videos/cards/summon_46986414.mp4` $\to$ Cutscene MP4 video.
- `app-resource://audio/passionate.mp3` $\to$ Duel BGM track.

### 6.3 Extra Monster Zones (EMZ) & Master Rule 5
`ocgcore` operates under `MODE_MR5`:
- Main Monster Zones: Sequences 0 to 4.
- Extra Monster Zones: Sequences 5 and 6.
- Physical EMZ mapping across controllers:
  - **Left EMZ**: Player 0 sequence 5 / Player 1 sequence 6.
  - **Right EMZ**: Player 0 sequence 6 / Player 1 sequence 5.
- In `messageDecoder.ts`, `parseFieldMask()` loops `seq < 7` to ensure bits 5 and 6 are parsed.

### 6.4 Audio Manager & Dynamic Ducking (`AudioManager.ts`)
- Dual-bus mixing: `bgmGainNode`, `sfxGainNode` $\to$ `masterGainNode`.
- When monster video cutscenes play, `duckBgm('video-overlay', 200)` attenuates BGM to 15% (or 0%), then smoothly restores volume over 350ms when the video ends.

---

## 7. Developer Recipes & Common Tasks

### Recipe 1: Fixing a Card Effect or Lua Script Bug
1. Identify card ID (e.g. Cyber Jar is `34124316`).
2. Check `resources/scripts/official/c34124316.lua`.
3. Create a scratch test or targeted test in `tests/` using `createCore({ sync: true })` and `DuelEngineService`.
4. Run:
   ```bash
   npx tsx tests/cyber-jar-shuffle-set-card.test.ts
   ```
5. If modifying `scriptReader.ts`, ensure `isBaseRuntime` rules are preserved.

### Recipe 2: Adding or Modifying Prebuilt Decks
1. Decks are stored in `data/prebuilt-decks.json` or character YDK files in `resources/decks/`.
2. Ensure all card IDs belong to `data/card-pool-whitelist.json`.
3. Test loading and validation:
   ```bash
   npx tsx tests/prebuilt-decks-and-selector.test.ts
   ```

### Recipe 3: Diagnosing Duel Freezes or Soft-Locks
1. **Check for Unhandled Prompts**: Does `duelStore.ts` show `isWaitingResponse === true` without a visible UI modal?
   - Check `DuelEngineService.ts` step loop to see which prompt was emitted.
2. **Check for `MSG_RETRY`**:
   - If ocgcore sends `MSG_RETRY`, it rejected the player/AI's last response. Ensure `DuelEngineService` restores `lastPromptMessage`.
3. **Check for `SELECT_PLACE` with EMZ**:
   - Ensure `parseFieldMask` includes `seq < 7`.
4. **Check Lua Errors**:
   - Inspect console for `[LUA ERROR]` hints.

### Recipe 4: Running Verification Tests
```bash
# Run the complete test suite
npm test

# Expected result:
# 🎉 ALL 53 TEST SUITES PASSED CLEANLY!
```

---

## 8. Golden Rules for AI Agents (DO NOT VIOLATE)

1. **Never pass `isBaseRuntime = false` for base scripts**:  
   `utility.lua`, `constant.lua`, and `proc_*.lua` must skip `#var` $\to$ `Auxiliary.GetCount(var)` transformation.
2. **Never use `process.cwd()` for assets in main process**:  
   Always use `getResourcePath('resources/...')` or `getResourcePath('data/...')`.
3. **Never inspect raw unredacted opponent cards in AI logic**:  
   Always obey `assertAiStateSanitized()`.
4. **Never assume the last message in `rawMessages` is the prompt**:  
   Search backwards for `decoded.isPrompt === true`.
5. **Always test with `createCore({ sync: true })`**:  
   Never instantiate the async `ocgcore()` wrapper without proper teardown.
6. **Always verify `npm test` passes before concluding work**:  
   All 53 test suites must pass cleanly without regressions.
