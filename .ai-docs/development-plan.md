# Development Plan — YGO Desktop Duel

Companion docs: `architecture.md`, `design-system.md`, `phases-prompts.md`, `images-prompts.md`, `answered-questions.md`.

## 0. How this plan works with Coding Agent across sessions

Because each phase runs in a **separate Coding Agent session** (fresh context), continuity is carried by a single file:

### `.ai-docs/progress.md` protocol

- Does not exist yet — **Phase 1 creates it**. From then on, every phase:
  1. **Starts** by reading `progress.md` (plus `architecture.md` and `design-system.md`) in full before writing any code.
  2. **Ends** by appending a new dated entry (never deleting prior entries — this file is the project's memory) using this template:

```md
## Phase N — <name> — <date>

**Status:** Complete | Partial | Blocked
**What was built:**

- ...
  **Files added/changed:** (high-signal list, not every file)
- ...
  **Decisions made / deviations from the plan:**
- ...
  **Known issues / TODO carried to next phase:**
- ...
  **How to manually verify this phase:** (short pointer; full steps live in phases-prompts.md)
- ...
```

3. If a phase is **Blocked**, it must record exactly what's blocking it and what the next session needs to unblock it (e.g., "waiting on user to supply character portrait PNGs before Phase 5 can render the opponent carousel with real art — placeholder gradients used for now").

- `progress.md` lives in `.ai-docs/` (git-ignored per your setup) — it is the durable memory; commit messages are the durable _history_, but `progress.md` is what a fresh Coding Agent session reads first.

### Commit discipline (every phase)

- Small, logically-scoped commits _during_ the phase (not one giant commit at the end) — e.g., "scaffold Electron+Vite+Vue", "add Pinia stores skeleton", "implement GlassPanel component".
- Conventional commit style: `feat(deck-edit): add virtualized card grid`, `fix(engine): correct viewFilter redaction for banished zone`, `docs(progress): log phase 6`.
- The final commit of a phase always includes the `progress.md` update, message: `docs(progress): complete phase N — <name>`.
- After the final commit, the session must give the user a **step-by-step manual test guide** for what changed (see `phases-prompts.md` — this is templated per phase, session should fill in specifics).

## 1. Guiding principles for every phase

- **Prefer the real engine over shortcuts.** Never hand-roll a rules exception "just for now" that the real `ygopro-core` would already handle correctly — integrate the engine early (Phase 2) precisely so later phases don't accumulate rules debt.
- **Vertical slices where possible.** Each phase should leave the app in a runnable, visually inspectable state (`npm run dev` opens Electron and shows something real), even if incomplete — never leave a phase in a "compiles but blank screen" state.
- **No placeholder cheating that becomes permanent.** If a phase must stub something (e.g., a missing character video), it must be logged in `progress.md` as a TODO so it isn't silently forgotten.
- **Card pool discipline.** Only original-series + GX-series cards are ever wired into decks, filters, or AI logic — verify against `data/card-pool-whitelist.json` (built Phase 2) whenever adding card-specific code.

## 2. Phase list

| #   | Phase                                                           | Primary output                                                                                                                                                                                         |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0   | Environment & engine spike                                      | Proof that `ocgcore-wasm` runs inside an Electron main process and completes a scripted mock duel end-to-end in Node, headless                                                                         |
| 1   | Project scaffolding                                             | Electron + Vite + Vue3 + TS + SCSS + Pinia skeleton, IPC plumbing, lint/format, `progress.md` created                                                                                                  |
| 2   | Engine integration & card pool                                  | `DuelEngineService`, `cards.cdb` build pipeline, set-code whitelist locked, filtered scripts vendored                                                                                                  |
| 3   | Asset pipeline                                                  | Card image downloader (3 variants), icon/font asset scaffolding, optimized output committed to `resources/` (or documented as a local-only run step if too large for git — see note in Phase 3 detail) |
| 4   | Shared design system components                                 | GlassPanel, YugiButton, YugiModal, Tooltip, IconIndicator, LoadingSpinner, base SCSS 7-1 structure                                                                                                     |
| 5   | Loading + Main Menu screens                                     | Screens 1 & 2 fully functional and navigable                                                                                                                                                           |
| 6   | Settings screen & character data                                | Screen 3, `characters.json` (20 characters × 3 decks), OpponentCarousel                                                                                                                                |
| 7   | Deck Edit screen                                                | Screen 4, 3-column layout, filtering, virtualized grid, previewer                                                                                                                                      |
| 8   | Coin Toss + Pre-Duel Video screens                              | Screens 5 & 6                                                                                                                                                                                          |
| 9   | Duel field — static layer                                       | Screen 7 field geometry/zones per reference images, hand fan, LP meters, menu/log/status buttons wired to no-ops                                                                                       |
| 10  | Duel field — engine wiring & turn flow                          | Idle commands (Summon/Set/Activate/Attack/End), draw/standby/main/battle/end phases, hand-size cleanup rule                                                                                            |
| 11  | Targeting UX & guidance system                                  | Blue/red location icons, Action Guide Banner, confirmation micro-dialogs, tooltips                                                                                                                     |
| 12  | Status icons, card previewer wiring, animations, special videos | Status icon row, hover previewer live on real duel data, position-change flip animation, video-pause-engine mechanism                                                                                  |
| 13  | AI opponent                                                     | `AIController`, per-character strategy weighting, artificial think-delay                                                                                                                               |
| 14  | Polish, performance, packaging                                  | Perf pass (virtualization, image caching), full playtest pass, `electron-builder` config, final QA                                                                                                     |

Each phase is detailed below with **goal, prerequisites, deliverables, acceptance criteria, and explicit file scope** so a fresh session knows its boundaries.

---

### Phase 0 — Environment & Engine Spike

**Goal:** De-risk the riskiest unknown (engine integration) before any UI work.
**Prerequisites:** none.
**Deliverables:**

- Standalone Node script (`tools/engine-spike/run.ts`, not part of the shipped app) that: loads `ocgcore-wasm`, loads a tiny hand-picked `cards.cdb` subset + scripts (e.g. just enough for a trivial duel), starts a duel between two dummy 40-card decks, auto-responds to every prompt with "first legal option," and runs to completion, printing the message log.
- Write-up in `progress.md` (created here, ahead of Phase 1's "official" creation — Phase 1 can just continue the file) of exact versions pinned: Node, Electron, the `ygopro-core` commit `ocgcore-wasm` was built from, wasm loading quirks found (e.g., async stack-switching flag requirements noted in the library's README), and how the `.wasm` binary + scripts will be located inside a packaged Electron app (`process.resourcesPath` vs dev-mode path).
  **Acceptance criteria:** the spike script runs via `npm run spike` and exits 0 after simulating a full mock duel, with no manual card data typed in real cards' rules beyond the minimal stub set.

### Phase 1 — Project Scaffolding

**Goal:** A clean, linted, typed monorepo-style Electron+Vue app shell.
**Prerequisites:** Phase 0.
**Deliverables:**

- Electron main/preload/renderer split exactly as in `architecture.md` §3.
- Vite config for renderer, `tsc`/electron-builder config for main.
- ESLint + Prettier + `.editorconfig`, strict TS (`strict: true`) across main/preload/renderer/shared.
- Pinia installed, empty typed store files with just interfaces.
- Vue Router with route stubs for all 7 screens rendering a placeholder "Phase N will build this" panel (so navigation is testable immediately).
- `.ai-docs/progress.md` created (or continued from Phase 0) with the template from §0.
- `package.json` scripts: `dev`, `build`, `spike`, `lint`, `format`, `download:cards` (stub until Phase 3), `rebuild:native` (for `better-sqlite3`).
  **Acceptance criteria:** `npm run dev` opens an Electron window, all 7 route stubs are reachable via temporary dev nav links, no console errors, lint passes clean.

### Phase 2 — Engine Integration & Card Pool

**Goal:** Real duels can be started and driven end-to-end through IPC, restricted to the correct card pool.
**Prerequisites:** Phase 1.
**Deliverables:**

- `DuelEngineService`, `messageDecoder`, `viewFilter`, `cardReader`, `scriptReader` per `architecture.md` §3–6.
- `data/set-code-whitelist.json` populated and **explicitly reviewed against the assumption logged in `answered-questions.md`** (original series ≈ LOB through Cyberdark Impact-adjacent sets / DM anime-era Structure Decks; GX ≈ GX-era boosters/structure decks) — flagged to you for correction if it's wrong.
- `scripts/build-card-pool.ts` producing filtered `cards.cdb` + copied `.lua` scripts + `data/card-pool-whitelist.json`.
- IPC channels: `duel:new`, `duel:command`, `duel:event` (see `architecture.md` §4) implemented end-to-end with a temporary bare-bones debug view (plain JSON dump, not final UI) so the pipe can be verified visually.
  **Acceptance criteria:** from the debug view, a full duel (both sides AI-scripted with "first legal option" like the Phase 0 spike, but now using real filtered card data) can be started and run to a win/loss, and the Duel Log (dev-only) shows the message stream.

### Phase 3 — Asset Pipeline

**Goal:** All card images (3 variants) and base UI assets available locally, offline.
**Prerequisites:** Phase 2 (needs the final card id list).
**Deliverables:**

- `scripts/download-card-images.ts`: reads `data/card-pool-whitelist.json`, hits YGOPRODeck per §5.2 rules (≤20 req/s, resumable/skip-existing, retries with backoff), writes `resources/cards/full/*.jpg`, `resources/cards/art/*.jpg` (the "cropped"/artwork-only variant), `resources/cards/mini/*.jpg` (re-encoded small, e.g. 96×140, via `sharp`).
- Decision + note in `progress.md` on whether `resources/cards/` is committed to git or `.gitignore`'d with the download script documented as a required one-time local setup step (likely the latter, since thousands of images can bloat a repo — confirm with user, default assumption recorded in `answered-questions.md`).
- Font files self-hosted in `resources/fonts/` (see `design-system.md` §3) with license notes.
- Placeholder/error-state image (a stylized generic card-back "image missing" asset) used if a download fails, so the UI never shows a broken-image icon.
  **Acceptance criteria:** running `npm run download:cards` populates all three folders for the full filtered pool; a quick script verifies every id in the whitelist has all 3 variants present.

### Phase 4 — Shared Design System Components

**Goal:** Build once, reuse everywhere — implement `design-system.md` as real Vue components + SCSS.
**Prerequisites:** Phase 1 (Phase 3 not required, can use placeholder imagery).
**Deliverables:** SCSS 7-1 structure; `GlassPanel`, `YugiButton`, `YugiModal`, `Tooltip`, `IconIndicator`, `LoadingSpinner`, base typography/animation utilities. A `/dev/kitchen-sink` route (dev-only, stripped from production build or gated behind a flag) showcasing every component/state for visual QA.
**Acceptance criteria:** kitchen-sink route renders every component in every state (idle/hover/active/disabled/focus) matching `design-system.md` specs; components are used (not duplicated ad hoc) starting next phase.

### Phase 5 — Loading & Main Menu Screens

**Deliverables:** Screen 1 (loading spinner + fullscreen bg + glass overlay, drives off real app-ready signal — engine + card pool loaded — not a fake timer), Screen 2 (Start Duel / Deck Edit / Settings / Exit, using `YugiButton`/card-style variant). Router wiring so these are the real entry flow (replacing Phase 1's dev nav).
**Acceptance criteria:** launching the packaged/dev app shows Loading → Main Menu → each button navigates correctly (Deck Edit/Settings can still be stub panels if their phase hasn't run yet — but Main Menu itself is final).

### Phase 6 — Settings Screen & Character Data

**Deliverables:** `data/characters.json` (10 original-series + 10 GX-series characters, each with portrait path, 3 `.ydk`-equivalent decks in `resources/decks/`, pre-duel video path placeholder), `OpponentCarousel`/`CharacterCard` components, selection persists to `electron-store`. Deck files at this stage can be programmatically generated "reasonable" decks from the filtered pool (archetype-appropriate) if you haven't hand-curated them yet — flagged as a TODO in `progress.md` either way.
**Acceptance criteria:** selecting a character persists across app restarts; a random one of the 3 decks is chosen when "Start Duel" is later invoked (wired in Phase 8/10).

### Phase 7 — Deck Edit Screen

**Deliverables:** 3-column layout per `architecture.md`/`design-system.md`, `CardGridVirtualized` (mini images), `CardFilterBar` (name/text/type/attribute/race/level/ATK/DEF range filters, all scoped to the filtered card pool only), `CardPreviewer` (hover-driven, sticky-last-hovered), `DeckColumn` (Main 40–60 / Extra 0–15) with add/remove, live count + validity indicators, save/load named custom decks via `electron-store`.
**Acceptance criteria:** can build a legal deck from scratch, save it, reload the screen, and see it persisted; invalid deck states (under/over count) are clearly flagged and block "Start Duel" only when actually attempting to play that deck.

### Phase 8 — Coin Toss & Pre-Duel Video

**Deliverables:** Screen 5 (heads/tails image selection → animated coin flip → result, feeding the engine's actual starting-player determination rather than a purely cosmetic random), Screen 6 (fullscreen video player for the selected character's pre-duel clip, with skip-on-click since kids replaying duels shouldn't be forced to rewatch — confirm in `answered-questions.md`).
**Acceptance criteria:** flow Start Duel → character (from Settings selection) → coin toss → pre-duel video → duel screen (stub target ok if Phase 9 hasn't run) is fully click-through-able.

### Phase 9 — Duel Field: Static Layer

**Deliverables:** Full field geometry matching the two reference images and the numbered legend in the brief (main monster zones ×5, spell/trap ×5, field zone, GY, extra deck, deck, banished, extra monster zones present-but-inert placeholders, pendulum zones present-but-inert placeholders per "ignore for this version"), hand fan for user (real cards once data flows) and opponent (card backs, correct count), LP meters, Menu/Duel-Log/Field-Status/Activation-Confirmation buttons (only Menu + Duel Log wired; other two show a "coming soon" tooltip per brief), "Mate" slot present but visually inert.
**Acceptance criteria:** static field visually matches reference imagery's zone layout/proportions at 1920×1080 and scales sanely at other supported resolutions; no engine wiring yet (can use mock field state).

### Phase 10 — Duel Field: Engine Wiring & Turn Flow

**Deliverables:** Real `duelStore` driven by `DuelEngineService` events; idle-phase command menu (Normal Summon, Set, Activate Effect, Attack, End Phase, etc., only showing options the engine currently allows); phase indicator; **hand-size cleanup rule enforced at End Phase** (if a player has more than 6 cards, they must discard down to 6 before the turn can pass — engine emits this prompt natively, UI must present it clearly per the guidance system even before Phase 11 formally builds the polished version, at least a functional list to discard from).
**Acceptance criteria:** a full duel (human making real choices via UI, AI still "first legal option" placeholder from Phase 2/pending Phase 13) can be played start to finish with correct phase progression and correct hand-size enforcement.

### Phase 11 — Targeting UX & Guidance System

**Deliverables:** Blue/red `IconIndicator` overlays on every legal target across every zone (hand/field/deck/extra deck/GY/banished — 6 locations × 2 colors = 12 icon states) with tooltips; `ActionGuideDialog`/banner implementation per `design-system.md` §7, wired to real engine prompts (e.g., `MSG_SELECT_CARD` context inspected to phrase the correct instruction — destroy vs. target vs. send-to-GY vs. tribute, etc., via a lookup table keyed on the message's sub-reason where the engine provides one, else a sensible generic phrasing); confirmation micro-dialogs for cancelable decision points.
**Acceptance criteria:** a first-time player (imagine an actual kid) is never left clicking blindly — every selection prompt in a full playtest has a plain-language instruction and correctly colored/tooltipped eligible targets.

### Phase 12 — Status Icons, Live Previewer, Animations, Special Videos

**Deliverables:** 7 status icons wired to real card state flags (effect negated, cannot be special summoned, temporarily banished, used as Fusion material, used as Synchro material, destroyed by battle, cannot attack) surfaced via `query_card` flags in `viewFilter`; `CardPreviewPopup` wired to live duel data (any card the human is allowed to see, per engine visibility — reusing the same redaction as §6 of architecture, so it can't be used to cheat-peek); position-change flip animation (face-down defense ↔ face-up attack, etc., per `design-system.md` §6); attack animations (monster-vs-monster clash + monster-vs-LP direct hit, per rules reference below); the **video-pause-engine mechanism** from `architecture.md` §4 step 4, wired to real character/card video triggers from `data/characters.json`/a new `data/card-videos.json`.
**Acceptance criteria:** triggering a mapped card's summon/attack pauses all engine processing (including AI's own turn if it's the AI's card) until the video reports finished; status icons appear/disappear correctly through a scripted test duel exercising each one at least once.

### Phase 13 — AI Opponent

**Deliverables:** `AIController` + `strategies/` + `evaluators/` per `architecture.md` §7, replacing the "first legal option" placeholder; per-character personality weighting sourced from `characters.json`; artificial think-delay; AI must go through the **exact same guidance-eligible message loop** as the human (no special engine calls), and must be **provably blind** to hidden zones (a debug assertion in dev mode that fails loudly if `AIController` is ever handed a snapshot containing the human's un-revealed hand/deck contents).
**Acceptance criteria:** can play multiple full duels against each of the 20 characters' decks and get a coherent, difficulty-appropriate opponent; the anti-cheat debug assertion passes across a full playtest session.

### Phase 14 — Polish, Performance, Packaging

**Deliverables:** perf pass against `architecture.md` §9 (virtualization audit, image cache audit, animation profiling in DevTools), full click-through QA of all 7 screens + edge cases (deck too small, hand > 6 at end phase, banished zone reveal, Fusion summon material video, direct attack at 0 monsters, etc.), `electron-builder` config finalized for Win/macOS/Linux, app icon, about/version screen, crash/error boundary (graceful "the duel engine hit an unexpected state" recovery back to Main Menu rather than a hard crash), final `progress.md` wrap-up summarizing the whole build for future maintenance sessions.
**Acceptance criteria:** a packaged build (not just `npm run dev`) launches on a clean machine with no internet connection and is fully playable start to finish.

---

## 3. Yu-Gi-Oh! visual & procedural rules reference

Compiled for implementation accuracy across the phases above (primarily Phases 9–12). These are the stable, well-established real-game rules the engine already enforces logically — this section is about how the **UI must depict/handle** what the engine reports, plus the couple of "what happens if…" procedural questions raised in the brief.

### 3.1 Monster position states (4 total)

| State                                                | Orientation                 | Face                       | When it happens                                                                                                     |
| ---------------------------------------------------- | --------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Face-up Attack Position                              | Portrait (vertical)         | Art visible                | Normal Summon (no tribute/with tribute), Special Summon in Attack, manually switched via Main Phase position-change |
| Face-up Defense Position                             | **Landscape (rotated 90°)** | Art visible                | Special Summon in Defense, position-change from Attack, flip-summoned-then-remains-face-up cases                    |
| **Face-down Defense Position ("Set")**               | **Landscape (rotated 90°)** | **Card back** (art hidden) | Normal Set of a monster (replaces Normal Summon for the turn)                                                       |
| Face-down monster that is Special Summoned face-down | Landscape, back             | Card back                  | Rare (specific card effects only)                                                                                   |

- There is **no such thing as "face-down Attack Position"** for monsters under normal rules — a set monster is always Defense. UI should never allow rendering that combination.
- **Flip Summon**: a face-down Defense monster is turned face-up Attack (portrait) as a discrete action, which is when "FLIP" effects trigger — this transition should get its own quick flip animation (rotate 90° back to vertical while flipping face-up), distinct from a simple position-change.

### 3.2 Spell/Trap visual states

- **Set** (face-down, not yet activated): portrait, card back, placed in one of the 5 S/T zones (or the Field Zone if it's a Field Spell — always face-up immediately when placed there per modern rules, never set face-down in the classic sense for Field Spells since 2004 rules revision the engine already encodes correctly).
- **Activated/Face-up**: portrait, art visible. Continuous Spells/Traps remain face-up on the field after resolving; Normal/Quick-Play Spells and non-Continuous Traps resolve then move to GY.
- **Equip Spells**: rendered attached/adjacent to the monster they're equipped to (a small linked indicator, not just sitting anonymously in the S/T zone) so the player can see the relationship at a glance.

### 3.3 Battle animations

- **Monster vs Monster attack**: a brief lunge/clash animation — attacking monster's card (or a stylized effigy/particle burst if you're not licensed to animate full character art) slides toward the defender, a clash/impact flash at the point of contact, then either the loser's card flips/shatters into GY-bound particles (destroyed) or both remain (equal stats / effect prevents destruction) — LP change (if any, e.g. piercing damage or the attacker being destroyed by an effect-based backlash) ticks on the relevant meter immediately after impact, not before.
- **Direct attack (Life Points)**: the attacking monster's effigy/particle streaks toward the opponent's LP meter/portrait corner, impacts with a flash, and the LP counter animates a rapid **count-down tween** (not an instant jump) from old value to new value, with a red damage flash on the meter.
- Both animation types should be skippable/fast-forwardable via a settings toggle for experienced players in a later version, but v1 always plays them (kid-friendly clarity over speed).
- Destroyed monsters animate a short "shatter"/fade-and-shrink into the Graveyard zone (a ghost copy flies to the GY stack) so the player's eye is led to where the card went, then the GY stack's top-card thumbnail updates.

### 3.4 Hand-size limit ("what happens if a player ends their turn with more than 6 cards?")

- The rule: at the **End Phase**, if a player holds **more than 6 cards** in hand, they must **discard** down to exactly 6 before the turn actually passes. This is a mandatory game action, not optional. `ygopro-core` emits the appropriate select-discard prompt automatically at End Phase — the UI must present this via the same guidance system as any other forced selection ("You have more than 6 cards. Choose cards to discard down to 6."), and must not allow the "End Turn" button to have silently done nothing if the engine is actually waiting on this prompt (i.e., don't let the UI look "stuck" — the Action Guide Banner must immediately explain what's being asked).

### 3.5 Turn/phase structure (for the phase indicator UI)

Draw Phase → Standby Phase → Main Phase 1 → Battle Phase (Start Step → Battle Step → Damage Step → End Step) → Main Phase 2 → End Phase. UI shows the current phase prominently and only surfaces actions legal in that phase (engine-driven, UI must not invent phase-inappropriate buttons).

### 3.6 Other procedural clarifications worth encoding in the guidance system

- **Chain windows**: when either player can respond to something on the chain, both a "pass priority" affordance and an "activate a card" affordance must be visible with a short explanatory prompt ("You may activate a Spell/Trap or Effect in response, or pass.") — this is one of the more confusing moments for new players and deserves its own Action Guide Banner phrasing distinct from a plain selection prompt.
- **Cost vs. Effect selections**: when a prompt is for paying a cost (e.g., "banish 1 card from your hand as a cost") the guidance text should say so explicitly ("This is a cost — it happens even if the effect is later negated"), differentiated from an effect's own target selection, since this is a genuinely confusing rules nuance even for intermediate players.
- **Tribute Summon**: when a Normal Summon requires tributes, the guidance system must clearly state how many tributes are required before the player starts clicking monsters, and highlight only the player's own monsters as eligible (never the opponent's, and never zones that would violate the required count).

### 3.7 Attention to "ignored for this version" zones

Extra Monster Zones, Pendulum Zones, Field Status button, Activation Confirmation button, and "Mate" are explicitly out of scope for gameplay logic in v1 per the brief — they should be **visually present** (so the field doesn't look broken relative to the reference images) but **inert**: no click handlers beyond an optional "coming soon" tooltip, and the AI/engine wiring must never attempt to use Extra Monster Zones or Pendulum mechanics in v1 (which in practice means the filtered card pool for v1 should avoid seeding decks with Pendulum monsters, since their zone can't be used correctly yet — flagged in `answered-questions.md`).
