# Phase Prompts — Copy/Paste into Coding Agent, one phase per session

General instructions that apply to **every** prompt below (don't skip these when pasting):

- Run each prompt in a **fresh Coding Agent session**, in the project's git repo root.

Additional Instructions (don't skip them):

- Before doing anything else, the session must read (in this order): `.ai-docs/progress.md` (if it doesn't exist yet, note that and proceed), `.ai-docs/architecture.md`, `.ai-docs/design-system.md`, `.ai-docs/development-plan.md` (the relevant phase section), and `.ai-docs/answered-questions.md`.
- Commit in small logical chunks throughout the phase, not one giant commit at the end (see `development-plan.md` §0 "Commit discipline").
- End the phase by appending the phase's entry to `.ai-docs/progress.md` using the template in `development-plan.md` §0, and commit that as the final commit of the phase.
- After the final commit, output a **numbered, step-by-step manual test guide** in the chat (not just in progress.md) telling the user exactly what commands to run and what to click/see to visually verify the phase — a template is included per phase below; fill in specifics as actually built.
- If something in `architecture.md`/`design-system.md`/`development-plan.md` turns out to be wrong or infeasible once you're actually building it, don't silently deviate — record the deviation and reasoning in `progress.md` and proceed with the better approach.

---

## Phase 0 Prompt — Environment & Engine Spike

```
Read .ai-docs/architecture.md sections 1-2 and .ai-docs/development-plan.md's "Phase 0" section fully before starting.

Goal: prove that the ygopro-core engine (via the n1xx1/ocgcore-wasm build, or an equivalent WASM build of edo9300/ygopro-core if that specific project is unavailable/unsuitable — investigate and choose, documenting the choice) can run inside a Node.js context that will later live in our Electron main process, and complete a full mock duel end-to-end.

Do this:
1. Initialize the repo if not already initialized (git init, .gitignore including .ai-docs/, node_modules/, dist/, resources/cards/ if large binary assets shouldn't be committed — decide and note).
2. Create tools/engine-spike/ as a standalone Node/TS script, not part of the shipped app.
3. Get the wasm engine loading and running: install/vendor the wasm build, wire minimal card_reader/script_reader callbacks using a tiny hand-crafted set of a few simple, well-documented cards (does not need to be our final filtered card pool — that's Phase 2).
4. Run a full mock duel between two 40-card dummy decks, auto-responding to every engine prompt with "first legal option available," and print the decoded message stream to console.
5. Add an npm script `spike` that runs this.
6. Document in .ai-docs/progress.md (create the file using the template in development-plan.md §0 if it doesn't exist): exact engine source/commit pinned, Node/Electron version targets, any quirks found getting wasm to run in Node (e.g. async/JSPI flags), and how the wasm binary + Lua scripts should be located at runtime in a packaged Electron app vs dev mode.

Commit incrementally. Final commit: "docs(progress): complete phase 0 — engine spike".

Then give me a step-by-step guide to run `npm run spike` myself and confirm I see a completed duel in the console output.
```

---

## Phase 1 Prompt — Project Scaffolding

```
Read .ai-docs/progress.md, architecture.md, design-system.md, and development-plan.md's "Phase 1" section before starting.

Build the Electron + Vue 3 + TypeScript + SCSS + Pinia project shell exactly per architecture.md section 3's folder structure: main/preload/renderer/shared split, Vite for the renderer, contextIsolation true / nodeIntegration false, strict TypeScript everywhere.

Include:
- Vue Router with a route per screen (Loading, MainMenu, Settings, DeckEdit, CoinToss, PreDuelVideo, Duel), each currently rendering a simple "Phase N will implement this" placeholder plus a temporary dev nav bar linking all of them (remove/gate this dev nav before Phase 14 finalizes, note that in progress.md as a TODO).
- Pinia installed with empty typed store files (duelStore, uiStore, deckEditStore, settingsStore, devToolsStore) — just interfaces/skeletons for now.
- ESLint + Prettier + editorconfig, all configured for strict TS.
- package.json scripts: dev, build, spike (carried from phase 0), lint, format, download:cards (stub that logs "not implemented until phase 3"), rebuild:native (electron-rebuild wrapper, needed once better-sqlite3 is added in phase 2).

Continue .ai-docs/progress.md with this phase's entry.

Commit incrementally, final commit "docs(progress): complete phase 1 — scaffolding".

Then give me step-by-step instructions to run `npm run dev`, confirm the Electron window opens, and click through all 7 dev-nav links to see each placeholder screen with no console errors.
```

---

## Phase 2 Prompt — Engine Integration & Card Pool

```
Read .ai-docs/progress.md, architecture.md sections 4-6, and development-plan.md's "Phase 2" section before starting.

1. Build DuelEngineService, messageDecoder, viewFilter, cardReader, scriptReader in src/main/engine/ per architecture.md, reusing the wasm integration approach validated in Phase 0's spike.
2. Create data/set-code-whitelist.json: research and populate the TCG/OCG set codes that correspond to the original Yu-Gi-Oh! (Duel Monsters) anime era and the Yu-Gi-Oh! GX anime era (roughly Legend of Blue Eyes White Dragon through the sets contemporaneous with GX's run, plus matching Starter/Structure decks). Use the assumption recorded in .ai-docs/answered-questions.md as your starting point, but if you find clearly better/more accurate set boundaries during research, use them and document the reasoning in progress.md.
3. Write scripts/build-card-pool.ts: given the whitelist, produce a filtered cards.cdb (subset SQLite db) and copy only the referenced .lua card scripts, plus emit data/card-pool-whitelist.json (id -> name -> era tag).
4. Wire IPC channels duel:new / duel:command / duel:event end-to-end, with a temporary bare-bones debug view (plain JSON/text dump is fine, not final UI) so a duel can be started and driven from the renderer.
5. Run a full duel using the "first legal option" auto-play from both sides (like phase 0, but now on the real filtered pool) to confirm the pipeline holds up at real scale (hundreds of cards, not a handful).

Continue .ai-docs/progress.md, noting the final whitelist size (roughly how many cards made the cut) and any cards/scripts that had missing dependencies and how you handled them.

Commit incrementally, final commit "docs(progress): complete phase 2 — engine integration & card pool".

Then give me step-by-step instructions to run the debug duel view and see a real duel (real card names in the log) run to completion.
```

---

## Phase 3 Prompt — Asset Pipeline

```
Read .ai-docs/progress.md, architecture.md section 5.2 and 9, and development-plan.md's "Phase 3" section before starting.

Build scripts/download-card-images.ts: for every card id in data/card-pool-whitelist.json, download from the YGOPRODeck image CDN (https://images.ygoprodeck.com/images/cards/{id}.jpg full, https://images.ygoprodeck.com/images/cards_cropped/{id}.jpg art-only, https://images.ygoprodeck.com/images/cards_small/{id}.jpg small) into resources/cards/full, resources/cards/art, resources/cards/mini respectively. Respect: max ~20 requests/second, resumable (skip files that already exist), retry with backoff on failure, and re-encode the "mini" variant with sharp to a small fixed size appropriate for a virtualized grid (target roughly 96x140px) rather than just relying on the CDN's small variant if that one is still too large.

Decide (and document your reasoning in progress.md) whether resources/cards/ should be committed to git or gitignored with the download script as a required one-time local setup step — lean toward gitignoring if the total size would be large, and update the root .gitignore accordingly plus add a clear note in the main README about running `npm run download:cards` after cloning.

Also scaffold resources/fonts/ with the typefaces specified in design-system.md section 3 (self-hosted, licensed for embedding — verify license type for whichever fonts you choose and note it in progress.md), and add a placeholder "image unavailable" card-back-style asset used as a fallback if a download ever fails.

Wire package.json's download:cards script to actually run this now.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 3 — asset pipeline".

Then give me step-by-step instructions to run `npm run download:cards` and verify (a rough count is fine) that resources/cards/full, /art, and /mini are populated.
```

---

## Phase 4 Prompt — Shared Design System Components

```
Read .ai-docs/progress.md and design-system.md fully (all sections) before starting.

Implement the SCSS 7-1 architecture from design-system.md section 10, and build these Vue components to spec: GlassPanel, YugiButton (including the card-style variant), YugiModal, Tooltip, IconIndicator, LoadingSpinner — matching the color palette, typography, glassmorphism recipe, and motion specs in design-system.md exactly.

Add a dev-only route /dev/kitchen-sink (excluded from production builds via an environment flag) that showcases every component in every documented state (idle/hover/active/disabled/focus-visible) for visual QA.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 4 — design system components".

Then give me step-by-step instructions to navigate to the kitchen-sink route and visually check each component/state against design-system.md.
```

---

## Phase 5 Prompt — Loading & Main Menu Screens

```
Read .ai-docs/progress.md, design-system.md, and development-plan.md's "Phase 5" section before starting.

Build the real Loading screen (screen 1) and Main Menu screen (screen 2) per the original brief and design-system.md, using the Phase 4 shared components. The Loading screen's progress must be driven by real readiness signals (engine initialized, card pool loaded) rather than a fake timer — coordinate with DuelEngineService's actual init sequence from Phase 2. Main Menu's 4 buttons (Start Duel, Deck Edit, Settings, Exit Game) should navigate to the real routes (Deck Edit/Settings can still land on their Phase-pending placeholder if those phases haven't run yet) and Exit Game should actually quit the Electron app (with a confirmation dialog).

Replace/remove the Phase 1 dev nav bar's role as the primary way to reach these two screens now that real navigation exists (you can leave the dev nav available behind a flag for internal testing, per the TODO logged in phase 1).

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 5 — loading & main menu".

Then give me step-by-step instructions to launch the app fresh and confirm Loading transitions to Main Menu automatically, and each button does the right thing.
```

---

## Phase 6 Prompt — Settings Screen & Character Data

```
Read .ai-docs/progress.md, architecture.md, design-system.md, and development-plan.md's "Phase 6" section before starting.

Create data/characters.json covering 10 original-series characters (e.g. Yugi Muto, Yami Yugi, Joey Wheeler, Seto Kaiba, Téa Gardner, Tristan Taylor, Mai Valentine, Bakura Ryou, Marik Ishtar, Pegasus — adjust the exact roster if a better-fitting set of 10 recognizable original-series characters makes more sense, note your final roster choice in progress.md) and 10 GX-series characters (e.g. Jaden Yuki, Zane Truesdale, Syrus Truesdale, Chazz Princeton, Alexis Rhodes, Bastion Misawa, Chumley Huffington, Aster Phoenix, Jesse Anderson, Dr. Crowler — same note applies), each with a portrait image path placeholder (actual PNGs to be supplied by the user per images-prompts.md / their own uploads — use a styled placeholder silhouette in the interim if not yet supplied), 3 deck references, and a pre-duel video path placeholder.

For decks: since curated decks may not exist yet, programmatically generate 3 archetype-appropriate decks per character from the Phase 2 filtered card pool as a reasonable placeholder (e.g. Kaiba -> Dragon-heavy beatdown, Yugi -> spellcaster/toolbox, Jaden -> Elemental Hero-adjacent if such cards exist in the filtered GX pool), clearly log in progress.md that these are placeholder decks pending user curation.

Build the OpponentCarousel/CharacterCard components per design-system.md, wire selection to persist via electron-store, and implement the "one of the 3 decks is picked randomly when a duel starts" logic (can be tested via the debug duel view from phase 2 for now; full flow wiring happens in later phases).

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 6 — settings & characters".

Then give me step-by-step instructions to open Settings, browse the 20 characters, select one, restart the app, and confirm the selection persisted.
```

---

## Phase 7 Prompt — Deck Edit Screen

```
Read .ai-docs/progress.md, architecture.md, design-system.md, and development-plan.md's "Phase 7" section before starting.

Build the 3-column Deck Edit screen: Col-1 (Main Deck 40-60 / Extra Deck 0-15, with live count and validity state), Col-2 (virtualized all-cards grid using the mini image variant from Phase 3, with a filter bar covering name, text, type, attribute, race, level, ATK, DEF, scoped only to the filtered card pool), Col-3 (hover-driven card previewer showing the full image variant and full card info, sticking to the last-hovered card when the mouse leaves).

Persist custom decks via electron-store (name, main list, extra list). Ensure adding/removing cards is smooth even with the full filtered pool loaded (virtualization is mandatory here per architecture.md performance section — do not render every card's DOM node at once).

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 7 — deck edit".

Then give me step-by-step instructions to build a legal 40-card deck from scratch, save it, reload the app, and confirm it's still there; also try to save an illegal deck (e.g. 20 cards) and confirm the UI correctly flags it.
```

---

## Phase 8 Prompt — Coin Toss & Pre-Duel Video

```
Read .ai-docs/progress.md, design-system.md, and development-plan.md's "Phase 8" section before starting.

Build the Coin Toss screen (heads/tails image selection -> animated flip -> result) wired to actually determine the real starting player fed into DuelEngineService's duel start (not purely cosmetic), and the Pre-Duel Video screen (fullscreen player for the selected character's video, skip-on-click). Wire the flow: Main Menu "Start Duel" -> character already chosen in Settings (or a just-in-time character pick if none was set) -> Coin Toss -> Pre-Duel Video -> Duel screen (landing on whatever placeholder/real state Duel screen is in per its own phase's progress).

If actual character videos haven't been supplied by the user yet, use a placeholder looping animation/still with a "video pending" watermark, and log that clearly in progress.md as a TODO along with the exact resources/videos/characters/ path each real video file should be dropped into later.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 8 — coin toss & pre-duel video".

Then give me step-by-step instructions to click through Start Duel -> Coin Toss (try picking both heads and tails a few times to see both outcomes) -> Pre-Duel Video (confirm skip-on-click works) -> arriving at the Duel screen.
```

---

## Phase 9 Prompt — Duel Field: Static Layer

```
Read .ai-docs/progress.md, architecture.md, design-system.md, and development-plan.md's "Phase 9" section before starting. Also carefully re-examine the two reference field-layout images described in the original project brief (numbered zone callouts) to match proportions/positioning.

Build the full duel field static layout: 5 main monster zones, 5 spell/trap zones, field zone, graveyard, extra deck zone, deck zone, banished zone, extra monster zones (present but visually inert per "ignore for this version"), pendulum zones (present but visually inert), user hand (fanned card layout), opponent hand (card backs only, correct count), LP meters for both players, Menu button (wired to open a menu, can be minimal), Duel Log toggle button (dev-only visibility, wired to show/hide a real duel log panel once Phase 10 produces real events — for now can toggle an empty panel), Field Status and Activation Confirmation buttons present with a "coming soon" tooltip per the brief, "Mate" slot present but inert for both players.

Use mock/static field state (not live engine data yet — that's Phase 10) to verify the layout looks correct at 1920x1080 and remains sane at other supported resolutions per design-system.md's letterboxing approach.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 9 — duel field static layer".

Then give me step-by-step instructions to open the Duel screen with its mock state and visually compare each numbered zone against the reference images to confirm placement/proportions look right.
```

---

## Phase 10 Prompt — Duel Field: Engine Wiring & Turn Flow

```
Read .ai-docs/progress.md, architecture.md sections 4 and 6, and development-plan.md's "Phase 10" and section 3.4-3.5 (hand-size rule, phase structure) before starting.

Replace the Phase 9 mock field state with a real duelStore driven by DuelEngineService events over the IPC pipeline built in Phase 2. Implement: phase indicator (Draw/Standby/Main1/Battle steps/Main2/End), an idle-phase action menu that only shows options the engine currently reports as legal (Normal Summon, Set, Activate Effect, Attack, Change Position, End Phase, etc.), and the End Phase hand-size-cleanup rule (if a player holds more than 6 cards, they must discard down to 6 before the turn passes — present this via at least a functional selection list even if it isn't the fully polished guidance-system version yet, since that's Phase 11's job).

A full duel should now be playable end-to-end with the human making real choices through the UI; the opponent side can continue using the Phase 2 "first legal option" auto-play placeholder until Phase 13 builds the real AI.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 10 — engine wiring & turn flow".

Then give me step-by-step instructions to play a full duel against the placeholder auto-playing opponent from Normal Summon through to a win/loss, including intentionally holding more than 6 cards at end phase to confirm the discard prompt appears.
```

---

## Phase 11 Prompt — Targeting UX & Guidance System

```
Read .ai-docs/progress.md, design-system.md section 7, and development-plan.md's "Phase 11" and section 3.6 (chain windows, cost vs effect, tribute summon) before starting.

Implement the IconIndicator overlays (blue for user-owned, red for AI-owned) across all 6 locations (hand, field, deck, extra deck, graveyard, banished) wherever the engine currently has an active selection prompt, each with a hover tooltip explaining what the icon represents. Build the Action Guide Banner that translates the engine's current prompt into a clear plain-language instruction (destroy vs target vs send-to-GY vs tribute vs discard, chain-window pass-or-respond, cost-vs-effect distinction, tribute-count-and-eligible-monsters-only for Tribute Summons) per development-plan.md section 3.6. Build the confirmation micro-dialogs for genuinely cancelable decision points, and make sure non-cancelable prompts never show a misleading Cancel affordance.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 11 — targeting & guidance".

Then give me step-by-step instructions to play through a duel scenario that exercises: a plain target-selection effect, a tribute summon, a chain-window opportunity, and a cost-based effect, confirming the guidance banner correctly explains each one.
```

---

## Phase 12 Prompt — Status Icons, Live Previewer, Animations, Special Videos

```
Read .ai-docs/progress.md, design-system.md sections 6 and 8, and development-plan.md's "Phase 12" and sections 3.1-3.3 (position states, spell/trap states, battle animations) before starting.

Wire the 7 status icons (effect negated, cannot be special summoned, temporarily banished, used as Fusion material, used as Synchro material, destroyed by battle, cannot attack) to real per-card engine state flags, surfaced through viewFilter, and shown in the CardPreviewPopup's status icon row when a field card is selected. Wire CardPreviewPopup fully to live duel data (respecting the same visibility rules as the rest of the UI — a card the human isn't allowed to see must not be previewable with real info). Implement the position-change flip animation (face-down defense <-> face-up attack/defense, flip summon) exactly per section 3.1's orientation rules, and the battle animations (monster-vs-monster clash, direct LP attack with tweened LP countdown) per section 3.3.

Build data/card-videos.json mapping specific card codes to summon-video and attack-video asset paths (placeholder entries are fine if the user hasn't supplied the actual video files yet — log clearly in progress.md which ones are placeholder), and implement the video-pause-engine mechanism from architecture.md section 4 step 4: when a mapped trigger fires, the engine's message loop must fully pause (including any pending AI turn processing) until the renderer signals the video finished.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 12 — status icons, animations, videos".

Then give me step-by-step instructions to play a duel that triggers: a position change, a monster attack (both monster-vs-monster and direct), and at least one mapped special-summon video, confirming the engine visibly pauses during the video (try clicking duel controls during video playback and confirm nothing happens until it ends).
```

---

## Phase 13 Prompt — AI Opponent

```
Read .ai-docs/progress.md, architecture.md section 7, and development-plan.md's "Phase 13" section before starting.

Replace the "first legal option" placeholder opponent with a real AIController: for each engine decision prompt directed at the AI player, enumerate legal responses, score them with lightweight evaluators (board presence, LP delta, card advantage, hand size, and the AI's own deck's archetype game-plan), and select a response with a touch of weighted randomness so it isn't perfectly deterministic. Source per-character personality weighting from data/characters.json (e.g. more aggressive/beatdown-favoring for Kaiba-type characters, more reactive/toolbox for Yugi/Jaden-type characters — use your judgment on a sensible initial weighting scheme, document it in progress.md). Add an artificial minimum think-delay so AI turns don't feel instantaneous.

Critically: the AI must go through the exact same message-loop/response mechanism a human does, using only the AI-side redacted view produced by viewFilter (never a raw/unredacted state). Add a dev-mode debug assertion that throws loudly if AIController is ever handed a snapshot containing unrevealed human hand/deck contents, and confirm it never fires across a full test playtest.

Continue .ai-docs/progress.md.

Commit incrementally, final commit "docs(progress): complete phase 13 — AI opponent".

Then give me step-by-step instructions to play several full duels against a few different characters and judge whether the AI's play feels coherent and character-appropriate, plus how to check that the anti-cheat debug assertion never fired (e.g. where to look in the dev console/log).
```

---

## Phase 14 Prompt — Polish, Performance, Packaging

```
Read .ai-docs/progress.md in full (all prior phase entries) and development-plan.md's "Phase 14" section before starting.

Do a full performance pass against architecture.md section 9: confirm the Deck Edit grid is truly virtualized under profiling, confirm image caching behaves (no redundant refetches on repeated hover), profile animation performance in DevTools and fix any jank, confirm the engine message loop never blocks renderer paint. Do a full manual QA click-through of all 7 screens plus the edge cases: deck too small/too large at Deck Edit, hand size > 6 at End Phase, a card-effect reveal of hidden info (confirm it appears correctly and only for the revealed cards), a Fusion/Synchro material video trigger, a direct attack at 0 opposing monsters, exiting mid-duel back to Main Menu. Add a graceful error boundary so an unexpected engine state shows a friendly recovery screen back to Main Menu instead of a hard crash. Finalize electron-builder config for Windows/macOS/Linux targets, add an app icon and a simple About/version panel accessible from the Main Menu or Settings.

Write a final summary entry in .ai-docs/progress.md covering the whole project's state, any outstanding placeholder assets (videos/portraits/curated decks) still pending from the user, and recommended next steps for a v2 (Extra Monster Zones, Pendulum Zones, Field Status panel, Activation Confirmation settings, Mate feature).

Commit incrementally, final commit "docs(progress): complete phase 14 — polish, performance, packaging".

Then give me step-by-step instructions to build a packaged installer/app (not just npm run dev) for my OS, install/run it with no internet connection, and play a full duel start to finish to confirm the offline packaged build works end to end.
```
