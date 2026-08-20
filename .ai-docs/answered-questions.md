# Answered Questions — Assumptions Made On Your Behalf

You asked me to self-answer open questions rather than block on them. Here's every judgment call I made, with reasoning, so you can correct any of them before or during Phase 0/2/6 (the phases where they matter most). Nothing here is locked in — treat this as "defaults unless you tell Coding Agent otherwise."

## Engine & technical

**Q: Native `ocgcore.dll`/`.so` build vs. WASM build — which do we use?**
A: WASM (`ocgcore-wasm`, built from `edo9300/ygopro-core`). Reasoning: native builds require per-OS/per-arch/per-Electron-ABI recompilation and a full C++ toolchain in the dev environment, which is fragile for a solo/small-team Electron ship. WASM runs identically everywhere Node runs, ships as data (no rebuild step for platform), and Node/Electron main-process execution is exactly where we want the engine to live anyway (§ architecture.md 2.1). If Phase 0's spike finds a dealbreaker with the WASM approach (e.g. an unmaintained wrapper, missing async support in your target Electron/Node version), the fallback is a native addon via `node-gyp`/`node-addon-api`, rebuilt per platform with `electron-rebuild` — noted in `architecture.md` as the contingency.

**Q: Which `ygopro-core` fork specifically?**
A: `edo9300/ygopro-core` (the actively-maintained EDOPro/ProjectIgnis core), since it's the most current and best-documented lineage, and `n1xx1/ocgcore-wasm` explicitly builds from it. `Fluorohydride/ygopro-core` is the original but less actively maintained upstream.

**Q: Where does the AI opponent's "brain" run — main process or renderer?**
A: Main process, alongside the engine. Reasoning: keeps the anti-cheat guarantee structural (§ architecture.md 6) — the AI literally cannot receive an unredacted state object because it never crosses into the renderer at all.

## Card pool scope

**Q: Exact boundary of "original series" and "GX series" card pool?**
A: Working definition — _original series_: TCG/OCG sets and Structure/Starter Decks released during the Duel Monsters anime's TV run, roughly _Starter Deck: Yugi/Kaiba_ through sets contemporaneous with the anime's end (pre-GX), i.e., archetypes and staples recognizable from that era (Dark Magician, Blue-Eyes, Exodia, Red-Eyes, Harpie's, Jinzo, etc.). _GX series_: sets/Structure Decks contemporaneous with the GX anime's run (Elemental Heroes, Neos, Cyber Dragon/Cyber-line, Ojama, Gladiator Beasts as they entered around that era, etc.). This is intentionally a **soft, curated whitelist** built by set-code in Phase 2, not a hard cutoff by release year alone, because some evergreen staples (Pot of Greed, Mystical Space Typhoon, etc.) are correctly included even though their specific print run spans many years — the whitelist should include a card if it's thematically/anime-recognizable to those two eras, confirmed by which sets it originally appeared in.
**Action for you:** Phase 2's prompt explicitly asks Coding Agent to research and lock this list, and to log it in `progress.md` for your review — treat the first Phase 2 run as a draft you sign off on, not a final answer.

**Q: Do we include anime-only cards that never got a real TCG/OCG release (no official `.lua` script or `cards.cdb` entry may exist for these)?**
A: **No, excluded by default.** The engine can only run cards that have real rules scripts; anime-exclusive/unreleased cards would need bespoke script-writing, which is a large, error-prone undertaking outside this plan's scope. If you specifically want a handful of iconic anime-only cards (e.g. certain unreleased Toon or Egyptian God variants) added later, that's a scoped follow-up task, not part of v1.

**Q: Do we include the Egyptian God cards (Obelisk, Slifer, Ra) and other "unlimited/restricted-in-real-life" cards?**
A: **Yes, included** (they did receive real TCG/OCG releases and have real scripts) but flagged for AI deck-building to use sparingly/thematically appropriate to Yugi/Kaiba-type decks rather than handing every AI character a broken bomb — a balance note for Phase 6/13, not a rules restriction.

**Q: Pendulum Summon mechanics — the brief says ignore Pendulum Zones for v1, but Pendulum cards exist within the GX-era-adjacent pool?**
A: **Excluded from v1 decks entirely**, even though the _card pool filter itself_ is date/set-based and wouldn't otherwise exclude them — Pendulum Monsters didn't actually exist during the GX anime's run chronologically (they're a later mechanic), so this mostly resolves itself naturally, but Phase 2's build script should double check and explicitly exclude any stray Pendulum-typed cards if any slip through via a later reprint's set code, to avoid seeding decks with cards that need a zone we're not building.

## Gameplay/UX defaults

**Q: Should attack/summon-trigger videos be skippable?**
A: Pre-duel character videos: **yes, skip-on-click**, since a player will see their chosen opponent's intro repeatedly across many duels and forcing a full rewatch every time is poor UX for a kid (or anyone) wanting to just play. In-duel special-card videos (Dark Magician summon, etc.): **not skippable in v1** — they're rarer, shorter, and part of the "premium feel" payoff; add a settings toggle to disable them entirely for players who'd rather skip straight to gameplay speed, as a v2/config nicety, not required for v1.

**Q: Is Field Status / Activation Confirmation truly zero-scope for v1, or just visually present?**
A: Visually present (so the HUD matches the reference screenshot's button layout) but functionally inert beyond a "coming soon" tooltip, exactly as the brief specified. No backend work.

**Q: Should there be a "surrender/concede" option mid-duel?**
A: Not explicitly requested, but I'm including a minimal **"Exit to Main Menu" option in the in-duel Menu button** (Phase 9) with a confirmation dialog, since without _some_ way out of a duel a player who makes a mistake or wants to stop has no exit — this seems like baseline usability rather than scope creep. If you'd rather the Menu button do less in v1, tell Coding Agent to strip it back during Phase 9.

**Q: Save/resume an in-progress duel across app restarts?**
A: **Not included in v1.** The brief didn't ask for it, and mid-duel engine state serialization/restoration is a meaningfully large addition (the wasm engine's internal state would need to be snapshotted, which isn't natively supported by the message-loop API used here). Treated as an explicit v2 idea, noted in Phase 14's wrap-up.

**Q: Single language (English) only?**
A: **Yes, assumed English-only for v1** (card text, UI copy). YGOPRODeck's API supports other languages, and the architecture doesn't preclude adding i18n later, but nothing in the brief requested multi-language support, so it's out of scope to avoid unnecessary complexity now.

**Q: Controller/gamepad support?**
A: **Not included.** Brief describes mouse-driven interactions (hover previews, click-to-select) throughout; keyboard focus-states are included for accessibility/testing convenience (per `design-system.md` §11) but full gamepad navigation is out of scope.

## Assets & content

**Q: Should `resources/cards/` (thousands of downloaded card images) be committed to git?**
A: **Recommended: gitignored, with the Phase 3 download script as a required one-time local setup step**, documented clearly in the README. Reasoning: a filtered pool across two eras could still be several hundred to low-thousands of cards × 3 image variants — likely tens to low-hundreds of MB, which is poor git hygiene (bloats clone size/history forever) for assets that are trivially re-derivable from a script. Phase 3's Coding Agent prompt is instructed to make this call explicitly and document it, but this is my default recommendation if not overridden.

**Q: Character portraits and pre-duel videos — who supplies these?**
A: **You**, as stated in the brief ("I'll provide these videos" / "I can provide a transparent PNG image for each character"). Development-plan.md's Phase 6 and Phase 8 build with clearly-labeled placeholders until you drop real files into the documented `resources/` paths, and each phase logs this as an outstanding TODO in `progress.md` rather than silently shipping placeholders forever.

**Q: Exact 20-character roster (10 original-series + 10 GX-series)?**
A: Draft roster proposed in Phase 6's prompt (Yugi, Yami Yugi, Joey, Kaiba, Téa, Tristan, Mai, Bakura, Marik, Pegasus / Jaden, Zane, Syrus, Chazz, Alexis, Bastion, Chumley, Aster, Jesse, Crowler) — chosen for broad recognizability and deck-archetype variety. This is easy to swap; tell Coding Agent your preferred final 20 before or during Phase 6 if different.

**Q: Fonts — do we need to purchase/license anything?**
A: Assumed **free-for-commercial-use, self-hostable webfonts** (e.g. Google Fonts–licensed families like Cinzel/Marcellus/Inter/Rubik suggested in `design-system.md`) so there's no licensing cost or restriction blocking distribution. If you already own a licensed display font you'd prefer (e.g. something closer to the franchise's actual logotype), that can be swapped in Phase 4 — just ensure its license permits embedding/redistribution in a shipped desktop app.

## Legal/IP note (not a question, but worth stating plainly)

This plan uses the real Yu-Gi-Oh! rules engine and real official card data/images for personal/hobbyist, non-commercial, offline use, and deliberately avoids generating any new artwork that imitates the franchise's actual logo or copyrighted character likenesses (see the `images-prompts.md` style-anchor constraints). Yu-Gi-Oh! is a trademark of Shueisha/Konami; this project is not affiliated with or endorsed by them. If you ever intend to distribute this beyond personal/private use, that's a distinct legal question outside what I can advise on here — flag it and I can point you toward general considerations, but I'm not a lawyer and this isn't legal advice.
