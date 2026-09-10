# Yu-Gi-Oh! Simulator: Engine, Build, and Troubleshooting Notes

This document captures critical architectural lessons, bug root causes, and best practices learned from live duel diagnostics, player reports, and build pipelines. Refer to this document in future sessions to prevent regressions.

---

## 1. Engine Protocols & Message Decoding

### 1.1 Extra Monster Zones & `SELECT_PLACE` (MR5)
- **Problem**: Link Summoning or summoning an Extra Deck monster into an empty board caused the duel to freeze / soft-lock on Turn 9.
- **Root Cause**:
  - `ocgcore-wasm` runs under Master Rule 5 (`MODE_MR5`).
  - When placing an Extra Deck monster that must occupy an Extra Monster Zone (EMZ), `ocgcore` sends `OcgMessageType.SELECT_PLACE` (18) with a bitmask `field_mask` where bits 5 & 6 indicate selectable EMZ slots (`~field_mask >>> 0` yields `0x60 = 0x20 | 0x40`).
  - `parseFieldMask()` in `src/main/engine/messageDecoder.ts` was hardcoded to `seq < 5`, ignoring bits 5 and 6. It returned `places: []`.
  - `DuelEngineService` auto-responded with empty places (`{ type: SELECT_PLACE, places: [] }`), which `ocgcore` rejected with `MSG_RETRY`.
  - `DuelEngineService.processStep()` discarded `RETRY` messages, nulling out `lastMsg` and clearing `this.lastPromptMessage`, causing the engine loop to exit with no prompt sent to the client.
- **Resolution**:
  1. `parseFieldMask()` loops `seq < 7` for both player (`bits 0..6`) and opponent (`bits 16..22`), correctly parsing sequences 5 and 6 as `OcgLocation.MZONE`.
  2. `getAutoResponse()` returns `null` if `places.length < count`.
  3. `processStep()` guards auto-placement with `autoPlace.places.length >= (lastMsg.count || 1)`.
  4. If `ocgcore` emits `RETRY`, `processStep()` restores `this.lastPromptMessage` so the player or AI can retry rather than soft-locking.
  5. `DuelField.vue` unhides the Extra Monster Zone slots (`:is-inert="false"`, `@click-card`, `@hover-card`, and dynamic `:player`).

### 1.2 EMZ Physical Index Mapping
There are 2 Extra Monster Zones between the players:
- **Left EMZ (`extraMonsterZones[0]`)**:
  - Player 0: Sequence 5
  - Player 1: Sequence 6
- **Right EMZ (`extraMonsterZones[1]`)**:
  - Player 0: Sequence 6
  - Player 1: Sequence 5
- In `duelStore.ts`:
  ```ts
  const emzIdx = seq === 5
    ? (controller === this.userPlayerId ? 0 : 1)
    : (controller === this.userPlayerId ? 1 : 0);
  ```

---

## 2. Deck Counts & Board Synchronization

### 2.1 False Deck-Out Desync
- **Problem**: Player lost by Deck Out on Turn 29 while the UI showed 21 cards remaining in the deck.
- **Root Cause**:
  - `DuelEngineService` only decremented `deckCount` on `MSG_DRAW`. Cards excavated, milled, or summoned directly from the deck (e.g. *Monster Gate*, *Painful Choice*, *Ryko*, *Terraforming*) did not decrement the deck count.
  - Periodic `fetchBoardState()` snapshots overwrote the frontend deck count with the backend's stale count.
- **Resolution**:
  1. `handleCardMove()` must decrement `fromPf.deckCount` whenever `from.location === OcgLocation.DECK` and increment `toPf.deckCount` whenever `to.location === OcgLocation.DECK`.
  2. Implement `syncDeckCounts()` using `duelQueryCount(handle, player, OcgLocation.DECK)` and call it on each step to ensure 100% authoritative counts from `ocgcore`.

---

## 3. Monster Cutscenes & Updater Overlay

### 3.1 Resolving Patched Assets in Electron (`userData/patch/`)
- **Problem**: Monster summon/attack videos (e.g., Buster Blader) placed in update patches did not play, falling back to static view or failing completely.
- **Root Cause**:
  - In bundled ES modules (`dist/main/index.js`), calling `require('electron')` threw an error because `require` is not defined in ESM without `createRequire(import.meta.url)`.
  - As a result, `getElectronApp()` failed to locate the Electron `app` object, causing `getResourcePath()` to fail to check `userData/patch/`.
- **Resolution**:
  - In `deckLoader.ts`, export `setElectronApp(appInstance)`.
  - In `src/main/index.ts`, call `setElectronApp(app)` immediately on startup.
  - In `DuelEngineService.startDuel()`, always call `this.loadCardVideos()` so any newly downloaded patch assets are available immediately without restarting the app.

### 3.2 Cutscene Video Trigger Scoping
- **Problem**: Video cutscene triggers failed when monsters were summoned by cards like *Call of the Haunted*.
- **Root Cause**:
  - `let pendingVideoPayload` was declared inside the inner `while` loop of `processStep()`.
  - When a chain occurred right after the summon, an empty non-forced `SELECT_CHAIN` auto-passed via `continue;`, resetting `pendingVideoPayload` to `null` before it could be emitted.
- **Resolution**:
  - Declare `pendingVideoPayload` outside the `while` loop in `step()`, ensuring it persists across auto-resolving steps until emitted.

---

## 4. Build, Packaging & Release Guidelines

### 4.1 Update Package Generation (`generate-update-manifest.ts`)
- The updater downloads separate tarballs (`cards.tar.gz`, `media-cutscenes.tar.gz`, etc.).
- When adding new video cutscenes:
  1. Place `.mp4` files under `resources/videos/cards/` (or `data/videos/`).
  2. Update `data/card-videos.json` with canonical card IDs.
  3. Run `npm run pack:assets` and `npm run generate:manifest` to update manifest hashes and byte counts.
  4. Ensure GitHub Release builds include all `.tar.gz` asset packs so the in-game updater downloads the full patch.

### 4.2 Test Suite Execution
- All engine and gameplay tests are located under `tests/`.
- Run all test suites using:
  ```bash
  npm test
  ```
- Before committing or releasing, verify that all test suites pass cleanly with exit code 0.
