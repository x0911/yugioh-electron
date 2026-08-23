# Project Progress & Implementation Changelog

Comprehensive log of all completed phases, features, bug fixes, AI systems, and engine integrations in the **Yu-Gi-Oh! Desktop Duel (DM + GX Era)** project.

---

## 1. System Overview & Milestones

| Milestone / Component | Status | Description |
| :--- | :---: | :--- |
| **Card Pool & Database** | ✅ Complete | 3,205 legal DM & GX cards filtered into `resources/cards.cdb` SQLite database with 100% Lua scripts |
| **Asset & Image Pipeline** | ✅ Complete | Resumable 3-tier image downloader (`full`, `art`, `mini`) with Sharp optimization for all 3,205 cards |
| **Duel Engine (ocgcore-wasm)** | ✅ Complete | WebAssembly port of official `ygopro-core` engine with synchronous message decoding |
| **Ancient Duel Arena UI** | ✅ Complete | Vue 3 + Pinia + SCSS 3D perspective field with obsidian glassmorphism & holographic glow |
| **Deck Builder & 421 Pre-Built Decks**| ✅ Complete | Full deck editor with virtualized grid, search/filter, and 421 anime canonical & meta pre-built decks |
| **Audio, BGM & Sound Effects** | ✅ Complete | 6 selectable BGM themes, 44 retro SFX triggers, procedural Web Audio synth, and dynamic cutscene ducking |
| **Legendary AI & Deck Executors** | ✅ Complete | WindBot-inspired dual-layer AI with Universal Competitive Core and modular archetype executors |
| **Duel Logs & Diagnostics** | ✅ Complete | Developer Logs page with max-10 duel retention and copyable Markdown diagnostic reports |
| **Test Suite Coverage** | ✅ Complete | **25 automated test suites** passing with 100% success rate (`npm test`) |

---

## 2. Detailed Phase History

### Phase 1–10: Foundation & Core Systems
- **Engine Core**: Integrated `ocgcore-wasm` with official Lua script runtime (`resources/scripts/`).
- **Card Pool Curation**: Filtered master BabelCDB database to strictly legal cards from the original *Duel Monsters* and *GX* anime eras.
- **Deck Editor**: Drag-and-drop / click-to-add deck building with 40–60 main deck, 0–15 extra deck constraints, and `.ydk` import/export.
- **80 Pre-Built Decks**: Added 30 DM character decks, 30 GX character decks, and 20+ popular community decks with autocomplete search.

### Phase 11: Guidance, Targeting & Combat
- **Interactive Battle Targeting**: Direct attacks and monster attacks with highlight trajectories and targeting confirmation.
- **Dynamic Field Guidance**: Action guide banners accurately distinguishing attack targets, effect targets, and summon phases.
- **Target Selection Integrity**: Single-click toggle support without accidental double-trigger deselects.

### Phase 12: Visual Polish, Status Icons & Cutscenes
- **Status Icons Engine**: Real-time computation of the 7 status flags (Negated, Cannot Attack, Battle Immune, ATK Modified, DEF Modified, Cannot Change Position, Equipped).
- **Perspective Reversal**: Seamless perspective flip when the human plays as Player 1 (Second).
- **Video Synchronization**: Full-screen summoning cutscenes with duel engine freeze and resume.

### Phase 13: AI Personalities & Strict Anti-Cheat
- **Anime Personalities**: Differentiated parameters (Aggression, Defensiveness, Risk Tolerance, Combo Focus, Signature Favoritism) for Kaiba, Yugi, Joey, Zane, Jaden, Pegasus, and Marik.
- **Engine Anti-Cheat Assertion**: `assertAiStateSanitized()` runs on every AI decision prompt, throwing an error if unrevealed opponent cards leak.

### Phase 14: Polish, QA & Packaging
- **Packaging Support**: Configured `electron-builder` for macOS (DMG/ZIP), Windows (NSIS), and Linux (AppImage).
- **LRU Preloader Cache**: Optimized card artwork memory management.

### Phase 15: Background Music (BGM), Sound Effects & Dynamic Cutscene Ducking
- **Web Audio Dual-Bus Graph**: Built `AudioManager` singleton with independent Master, BGM, and SFX gain buses.
- **6 Selectable BGM Themes**: *Passionate Duelist* (Symphonic Rock), *Master Duel Arena* (Electronic Orchestral), *GX Generation* (Anime J-Rock), *Millennium Mystery* (Ancient World), *KaibaCorp Cyber Matrix* (Cyber Synthwave), and *Casual Duel Lounge* (Lo-Fi Beats).
- **Settings UI & Live Previews**: Interactive BGM Theme Selector cards with genre tags, descriptions, active badges, and 15s preview buttons; Master, BGM, and SFX volume sliders with mute toggles.
- **Dynamic Audio Ducking**: Ref-counted `activeDuckSources: Set<string>` that automatically attenuates background music to 15% (or 0% if configured) during summon/attack videos and character cutscenes, smoothly returning to 100% when finished or skipped.
- **Procedural Sound Synthesizer (`SoundSynthesizer.ts`)**: Built-in zero-dependency Web Audio waveform generator for authentic retro sound effects.
- **Audio Asset Generation & Soundpack Downloader (`scripts/download-soundpack.ts`)**: Automatically downloads and installs authentic Yu-Gi-Oh! community duel simulator uncompressed `.wav` and `.mp3` audio files (from Project Ignis EDOPro / YGOPro sound repositories) for all 45 SFX triggers and BGM tracks (`npm run download:soundpack` / `npm run generate:audio`).
- **35+ SFX Triggers**: Complete coverage for card draw, normal/special/flip/tribute summon, sets, spell/trap activations, field spells, chain links, attacks, clashes, direct hits, destructions, banishes, discards, LP count tween ticking, heavy damage, heals, low-LP alarms, coin toss choices/spins/lands, deck drag/drop/save/trash, and win/loss fanfares.

---

## 3. Recent Card Mechanics & Bug Fixes

1. **Slifer the Sky Dragon (10000020)**:
   - Enforced 3-tribute requirement for Divine-Beast gods (prevented improper 2-tribute substitution).
   - Dynamic hand-ATK calculation (1000 ATK/DEF per card in hand).
   - Verified Second Mouth automatic 2000 ATK debuff and destruction.
2. **Graceful Charity (79571449)**:
   - Resolved draw 3 $\to$ discard 2 mandatory prompt sequencing.
3. **Harpie's Feather Duster (18144506)**:
   - Verified opponent backrow board clear without premature graveyard routing.
4. **Monster Reborn (83764719) & Premature Burial (70828912)**:
   - Fixed target selection dialog and position prompt for graveyard revivals.
   - Prevented AI from reviving low-ATK monsters into an active *Slifer the Sky Dragon*.
5. **Morphing Jar (33508719)**:
   - Verified flip summon discard entire hand and draw 5 cards.
6. **Ultimate Offering (80604091)**:
   - Fixed 500 LP cost deduction and extra Normal Summon resolution.
   - Eliminated infinite prompt chain loop by adding `didAttemptActivation` flags.
7. **Swords of Revealing Light (72302403)**:
   - Verified 3-turn countdown destruction counter and attack lock.
8. **Anti-Cheat Redaction in UI**:
   - Sanitized opponent face-down card passcodes (`0`) and names (`"Face-down Card"`) in `viewFilter.ts`, `CardSelectionModal.vue`, and `duelStore.ts`.
9. **Observe Field & Prompt Preview**:
   - Added card hover preview and **"👁️ Observe Field"** button in `PromptModal.vue` allowing players to inspect the board before making prompt choices.
10. **Duel Logs & Diagnostic Page**:
    - Built Dev Nav `/logs` page tracking last 10 completed duels with full copyable Markdown reports.
11. **`PAY_LPCOST` Log Formatting**:
    - Fixed `undefined LP` decoding bug in `messageDecoder.ts`.
12. **`CardSelectionModal` Variable Scoping**:
    - Fixed `ReferenceError: isMonster is not defined` when resolving `SELECT_CARD` (e.g. Sangan deck search) by properly declaring `isMonster`, `isSelected`, and `orderIdx` in candidate card mapping.
13. **Transition Animation & Hand Card Stability**:
    - Eliminated false "Fly from Deck" animation on neighbor hand cards by enforcing immutable unique instance IDs on all hand cards.
    - Replaced conflicting JS hooks in `HandFan.vue` with smooth CSS FLIP layout transitions.
    - Suppressed source card ghost duplicates during `playCardFlight` spatial flights.
    - Added landing settle animation in `FieldZoneSlot.vue` for zero-flicker slot handoffs.
14. **AI Combat Decision Polish & Quick-Play Timing Fixes**:
    - Restricted *Limiter Removal* and *Shrink* from firing prematurely in Main Phase 1 or on phase transitions, holding them strictly for Battle Phase damage calculation or lethal OTK math.
    - Prevented suicidal Battle Phase transitions when all AI attackers are weaker than opponent's face-up monsters.
    - Fixed `Option #221` text fallback in `SELECT_EFFECTYN` to display human-readable effect descriptions (*Card of Safe Return*).
    - Added explicit descriptive decoding for `CONFIRM_CARDS`, `SHUFFLE_DECK`, `EQUIP`, `BECOME_TARGET`, `CARD_TARGET`, `DAMAGE_STEP_START`, and `DAMAGE_STEP_END`.
15. **Continuous Hand-Reveal Mechanics (*Ceremonial Bell*, *Respect Play*, *Mind on Air*, *Eye of Truth*)**:
    - Preserved real card codes on server master state for all drawn and bounced hand cards.
    - Implemented `isPlayerHandPublic()` in `viewFilter.ts` to unredact opponent hand cards and `DRAW` log events when *Ceremonial Bell* (`20228463`), *Respect Play* (`08953736`), *Mind on Air* (`66399653`), or *Eye of Truth* (`47910970`) is active.
    - Updated `HandFan.vue` to render real card art, names, levels, ATK/DEF stats, cyan reveal aura, and hover inspection for revealed opponent hand cards.
16. **AI Tactical Improvements & Autonomous Post-Match Reviewer**:
    - **Smart Card Destruction Advantage Checks**: Heavily penalizes casting *Card Destruction* (`72892420`) when AI hand $\le 2$ and opponent hand $\ge 3$ (`-4500` penalty), ensuring the AI never gives opponents free hand refreshes.
    - **Weak Monster Defense Positioning**: Sets utility searchers and monsters with $\le 1600$ ATK (*Red Gadget*, *Beta*, *Gamma*, *Goggle Golem*) in Defense Position when facing $\ge 1900$ ATK opponent boss monsters instead of suicidal Attack Position summons (`-3500` penalty).
    - **Face-down Defense Target Proactivity**: Eliminates unprovoked Battle Phase skips by scoring $\ge 1400$ ATK beatstick attacks positively against face-down defense monsters when holding board advantage.
    - **Autonomous Post-Match Reviewer (`DuelReviewerService.ts`)**: Retrospectively analyzes match event streams, detects blunders (suicides, hand leaks, passivity), calculates tactical grades (`A+` to `F`), and synthesizes anime coach commentary (with Gemini Flash LLM integration via `@google/genai`).
    - **Persistent Tactical Memory Store (`tacticalMemory.ts`)**: Records learned blunder entries and adapts AI rules across duels in `userData/ai-tactical-memory.json`.
    - **Post-Match Review UI (`DuelReviewModal.vue`)**: Built modal accessible from the game-over screen and `/logs` archive page displaying grades, mistake breakdowns with self-corrections, active AI memory rules, and coach retrospectives.
17. **Original Series (DM) & GX Card Pool Expansion to 3,205 Cards**:
    - Expanded legal offline card database from 2,826 to **3,205 cards** (+379 new iconic anime, manga, and promo cards) across 2,029 DM cards and 1,176 GX cards with **0 modern mechanic leaks** (0 Synchro, 0 Xyz, 0 Pendulum, 0 Link).
    - Integrated key legendary bosses: *The 3 Wicked Gods* (*The Wicked Avatar*, *The Wicked Dreadroot*, *The Wicked Eraser*), *The 3 Legendary Dragons* (*The Eye of Timaeus*, *The Fang of Critias*, *The Claw of Hermos*), *The Seal of Orichalcos*, *Armityle the Chaos Phantasm*, *Arcana Force EX - The Light Ruler / Dark Ruler*, *Red-Eyes Darkness Metal Dragon*, *Clear Vice Dragon*, *Clear World*, *Darkness Neosphere*, *Elemental HERO Absolute Zero*, *Masked HERO Dark Law / Acid*, *Vision HERO Faris / Increase / Vyon*, *Blue-Eyes Chaos MAX Dragon*, *Holactie the Creator of Light*, *Ra - Sphere Mode / Immortal Phoenix*, etc.
    - Achieved **100% Lua script coverage** (2,817 official effect scripts compiled in `resources/scripts/official/`).
    - Completed offline image downloader pipeline (`npm run download:cards`) providing high-res full cards, cropped art, and Sharp lanczos3 mini thumbnails for all 3,205 cards.
18. **Toon Direct Attack & Rich Prompt Presentation (`SELECT_YESNO`)**:
    - Resolved missing monster card artwork `?` placeholder and ambiguous `"Do you wish to activate the effect of this card?"` prompt when declaring attacks with Toon monsters (e.g. *Blue-Eyes Toon Dragon* with *Toon World* active).
    - Enhanced `MessageDecoder` to track active attacker/chain context and decode system string `31` (*"Attack Directly?"*) into a dedicated **"Declare Direct Attack"** prompt modal.
    - Enriched `PromptModal.vue` with combat stats badge (`⚔️ 3000 / 🛡️ 2500`), left-panel hover inspection, tactical explanation, and dynamic buttons (`"✓ Attack Directly"` vs `"⚔️ Attack Opponent Monster"`).
    - Fixed 32-bit `aux.Stringid` bitshift resolution in `cardReader.ts` and added `extractCardCodeFromStringId` to resolve custom card text strings.
    - Added auto-dispatch in `duelStore.ts` and bidirectional response normalization in `DuelEngineService.ts` for seamless `SELECT_YESNO` and `SELECT_EFFECTYN` compatibility.
19. **Indestructible Stall Wall Preservation**:
    - Updated `UniversalAI` and `DefaultExecutor` tribute evaluation to protect battle-immune stall monsters (*Marshmallon*, *Spirit Reaper*, *Gellenduo*) from sacrificial tributes when the AI is under board pressure.
20. **40-Duelist Roster & 400 Canonical Character Decks Expansion + Deck Edit Pre-Scroll**:
    - **40 Duelists Roster**: Expanded from 20 to 40 anime duelists:
      - **20 Original Series (DM)**: *Yugi Muto, Yami Yugi, Seto Kaiba, Joey Wheeler, Téa Gardner, Tristan Taylor, Mai Valentine, Yami Bakura, Marik Ishtar, Maximillion Pegasus, Bandit Keith, Weevil Underwood, Rex Raptor, Mako Tsunami, Ishizu Ishtar, Odion, Espa Roba, Arkana, Rafael, Dartz*.
      - **20 GX Series**: *Jaden Yuki, Zane Truesdale, Syrus Truesdale, Chazz Princeton, Alexis Rhodes, Bastion Misawa, Chumley Huffington, Aster Phoenix, Jesse Anderson, Dr. Vellian Crowler, Atticus Rhodes, Tyranno Hassleberry, Jim Crocodile Cook, Axel Brodie, Adrian Gecko, Sartorius Kumar, Yubel, Nightshroud, Yusuke Fujiwara, Supreme King Jaden*.
    - **400 Canonical Decks**: Created 10 canon-accurate, anime-themed decks for each of the 40 characters (400 character decks total + 21 popular decks = 421 total prebuilt decks in `data/prebuilt-decks.json`).
    - **$\ge 40$ Card Completeness & Database Verification**: All 400 character decks and 21 popular decks guaranteed $\ge 40$ main cards with 100% legal card codes verified against `data/card-pool-whitelist.json` and `resources/cards.cdb`.
    - **AI Personality Profiles**: Added 20 new distinct AI personality configurations in `personalityProfiles.ts` tuning aggression, risk tolerance, and combo weights.
    - **Deck Edit Autocomplete Active Deck Pre-Scroll**: Updated `DeckSelectorAutocomplete.vue` on open to dynamically locate the index of `props.modelValue` and center-scroll the active deck into visible viewport focus (`block: 'center'`).
21. **High-DEF Wall Recoil Suicide Prevention, Stolen Monster Tribute Priority & AI Tactical Review Diagnostics Fix**:
    - **Face-Up High-DEF Wall Avoidance**: Updated `decideSelectCard` in `AIController.ts` to inspect opponent defense monsters and heavily penalize targeting face-up defense monsters whose DEF exceeds attacker ATK (e.g. *Giant Soldier of Stone* 2000 DEF, *Labyrinth Wall* 3000 DEF). The AI now attacks unknown face-down cards or passes instead of suicidal self-recoil attacks.
    - **Stolen Monster Tribute Priority**: Updated `DefaultExecutor.onSelectTribute` and `decideSelectTribute` in `AIController.ts` to prioritize sacrificing stolen opponent monsters (e.g. under *Snatch Steal*, *Change of Heart*, or *Brain Control*), stopping the +1000 LP/turn heal to the opponent and disposing of temporary control monsters before End Phase.
    - **"AI Tactical Review" Empty Dialog Fix**: Fixed argument order in `DuelView.vue` (`buildMarkdownReport(currentBoardState.value, duelLogs.value)`) and made `buildMarkdownReport` in `duelLogsStore.ts` argument-order resilient. Added empty/error state handling in `DuelReviewModal.vue`.
    - **Player Perspective Auto-Detection in Reviewer**: Updated `DuelReviewerService.ts` to auto-detect whether AI is Player 0 or Player 1 from event logs, detecting recoil attacks into high-DEF walls as critical `SUICIDAL_ATTACK` blunders.

---

## 4. Legendary AI Engine (WindBot-Ignite Architecture)

### Universal Competitive Core (`DefaultExecutor.ts`)
- **Card Advantage Sequencing**: Always plays *Pot of Greed*, *Graceful Charity*, *Upstart*, *Allure*, *Trade-In* first.
- **Board Clear Strategy**: Plays *Feather Duster* / *Heavy Storm* before summons; clears superior fields with *Raigeki* / *Dark Hole*.
- **Smart Tribute Selection**: Sacrifices tokens, low-ATK monsters, and spent searchers (*Sangan*); protects floodgates, indestructible stall walls, and boss monsters.
- **Battle Phase Lethal Push**: Sequences attacks from lowest ATK to highest ATK to bait battle traps, triggering lethal pushes when total damage $\ge$ LP.
- **Anti-Wall Combat Intelligence**: Avoids futile attacks into battle-immune walls (*Spirit Reaper*, *Marshmallon*, *Gellenduo*); prioritizes defense destroyers (*Sasuke*, *Drillroid*, *Ehren*).
- **Interruption & Negation Matrix**: Reserves counter traps (*Solemn Judgment*, *Solemn Strike*, *Dark Bribe*) for search engines, wipes, and boss summons.

### Dedicated Archetype Executors (`src/main/ai/executors/archetypes/`)
- **`BlueEyesExecutor`** (Kaiba / Dragons): *Sage with Eyes of Blue* $\to$ *White Stone* $\to$ *Cards of Consonance* $\to$ *Twin Burst / Ultimate Dragon* $\to$ *Return of the Dragon Lords*.
- **`CyberDragonExecutor`** (Zane / Machines): *Core* $\to$ *Cyber Emergency* $\to$ *Power Bond* $\to$ *Cyber Twin Dragon* (5600 ATK $\times$ 2) / *Limiter Removal* OTK.
- **`DarkMagicianExecutor`** (Yugi / Spellcasters): *Magician's Rod* $\to$ *Dark Magical Circle* $\to$ *Eternal Soul* / *Navigation* quick-effect summons.
- **`HeroFusionExecutor`** (Jaden / HERO): *Stratos* search $\to$ *Shadow Mist* $\to$ *Miracle Fusion* $\to$ *Flame Wingman / Sunrise / Absolute Zero*.
- **`AntiMetaStunExecutor`**: Floodgate lockdown (*Fossil Dyna*, *Thunder King Rai-Oh*, *Banisher*) + *Solemn* traps and *Macro Cosmos*.
- **`BurnOTKExecutor`**: Reverse-chain burn multiplier calculation and *Wave-Motion Cannon* accumulation.

### Auto-Detection Registry & Developer Guide
- **Registry**: [src/main/ai/executors/registry.ts](file:///Users/dash/personal/games/yugioh-electron/src/main/ai/executors/registry.ts) dynamically matches any deck by card codes and archetype tags.
- **Developer Guide**: [docs/ai-deck-development-guide.md](file:///Users/dash/personal/games/yugioh-electron/docs/ai-deck-development-guide.md) explains zero-code support for new decks and custom combo executor subclassing.

---

## 5. Automated Test Suite Status

All **25 test suites** run and pass with **100% success rate** (`npm test`):

1. `tests/guidance-targeting.test.ts` ✅
2. `tests/hand-and-pacing.test.ts` ✅
3. `tests/stack-inspection.test.ts` ✅
4. `tests/random-draw-and-deck.test.ts` ✅
5. `tests/status-animation-video.test.ts` ✅
6. `tests/prebuilt-decks-and-selector.test.ts` ✅
7. `tests/monster-reborn-activation.test.ts` ✅
8. `tests/card-selection-modal.test.ts` ✅
9. `tests/option-strings-resolution.test.ts` ✅
10. `tests/special-summon-monsters.test.ts` ✅
11. `tests/animation-order-and-deduplication.test.ts` ✅
12. `tests/battle-selection-and-variable-stats.test.ts` ✅
13. `tests/ritual-summon-ai.test.ts` ✅
14. `tests/announcements-and-field-mechanics.test.ts` ✅
15. `tests/ai-opponent-personality.test.ts` ✅
16. `tests/phase14-qa-and-packaging.test.ts` ✅
17. `tests/card-mechanics-and-engine-fixes.test.ts` ✅
18. `tests/duel-logs-store.test.ts` ✅
19. `tests/legendary-ai-executors.test.ts` ✅
20. `tests/transition-animations-and-hand-integrity.test.ts` ✅
21. `tests/hand-reveal-mechanics.test.ts` ✅
22. `tests/audio-manager-and-ducking.test.ts` ✅
23. `tests/sound-effects-matrix.test.ts` ✅
24. `tests/ai-post-match-reviewer-and-tactics.test.ts` ✅
25. `tests/prebuilt-decks-and-roster-expansion.test.ts` ✅
