# Project Brief: YuGiOh Web-Desktop Duel Simulator

## 1. Project Overview

I am building a YuGiOh desktop game using **Electron.js**, based on the **latest version of `ygopro-core`** as the dueling engine. The frontend will be built with **Vue.js** and **SCSS**, following established code standards and performance best practices.

The application will feature a premium, polished UI/UX and will support **single-player gameplay only** (user vs. AI opponent) — there is no multiplayer (user vs. user) mode. The game must run fully **offline** without any connectivity issues.

**Card pool scope:** Only cards from the original _Yu-Gi-Oh!_ series and _Yu-Gi-Oh! GX_ series are in scope. Cards from any other series (e.g., 5D's, Zexal, Arc-V, etc.) must be excluded.

---

## 2. Pre-Development Research Requirements

Before producing the development plan, please conduct thorough research on the following topics:

1. **`ygopro-core` integration** — How the engine works and how it can be integrated with Electron.js.
2. **Card image sourcing** — A guide (for use with Coding Agent) on how to download YuGiOh card images in three variants, limited to the original and GX series only:
   - Full card image
   - Artwork only (without card frame)
   - Mini/thumbnail card image (for performance-optimized lists)
3. **YuGiOh visual conventions**, including but not limited to:
   - How a monster is displayed when set face-down in Defense Position
   - How a monster is displayed when face-up in Defense Position
   - Recommended animation when a monster attacks another monster
   - Recommended animation when a monster attacks Life Points directly
   - What happens when a player ends their turn holding more than 6 cards
   - Any other core visual/rule interactions relevant to gameplay presentation (research should be comprehensive, not limited to the examples above)
4. **New-player-friendly UX flow** — Approach the duel flow from the perspective of a first-time/young player and identify where extra guidance is needed. For example: when a flip-summoned monster's effect requires the user to select a card to destroy, the UI must clearly instruct the player (e.g., "Select a monster to destroy") _before_ their next click — since an unguided player might accidentally target their own monster. This principle should apply to **any** card effect activation that requires a follow-up selection or action: the user should always see a clear prompt describing what their next interaction will do.
5. **Cinematic triggers** — Certain specific monsters will trigger a full-screen video when summoned or when attacking (video assets will be provided by me). This is not applied to all cards — only select, notable ones (e.g., Dark Magician). While any such video is playing, **all game logic must pause** — neither the user nor the AI opponent may take any action (e.g., attacking) until playback completes.

---

## 3. Screens & Functional Requirements

### 3.1 Loading Screen

- Full-screen YuGiOh-themed background with a glassmorphism overlay.
- A loading spinner/indicator.

### 3.2 Main Menu Screen

- A distinct YuGiOh-themed background with glassmorphism overlay.
- Custom, on-brand UI buttons (styled buttons or clickable card-style elements are both acceptable, as long as they reflect the YuGiOh visual identity):
  1. **Start Duel**
  2. **Deck Edit**
  3. **Settings**
  4. **Exit Game**

### 3.3 Settings Screen

- **Opponent selection**, including:
  - The 10 main characters from the original series (e.g., Yugi Muto, Yami Yugi, Joey Wheeler, Seto Kaiba, etc.)
  - The 10 main characters from the GX series (e.g., Jaden Yuki, Zane Truesdale, etc.)
- Each character has **3 pre-built decks**; one is chosen at random each time a duel against that character begins.
- The selector should have a premium, creative UI/UX and display each character's image (transparent PNG images will be supplied by me).

### 3.4 Deck Edit Screen

A three-column layout:

- **Column 1 — My Deck** (two rows):
  - Row 1: **Main Deck** (min. 40 / max. 60 cards) — the deck used during play.
  - Row 2: **Extra Deck** (min. 0 / max. 15 cards) — used for Fusion-Summoned monsters (reference: _Yu-Gi-Oh! GX Tag Force_ series for behavior).
- **Column 2 — Card Library**: Displays all available cards (original + GX series only), using compact thumbnail images for performance. Must support filtering by name, description, type, attribute, ATK, DEF, and other standard YuGiOh card filters.
- **Column 3 — Card Preview**: Displays the full-size image and detailed info of the card currently hovered (or the last hovered card, if the cursor has left the card), in a well-designed layout.

### 3.5 Pre-Duel: Coin Toss

- Determines who goes first.
- The user is prompted to choose "Heads" or "Tails" using **coin imagery** (not just text) for both faces.
- After selection, an animated coin toss plays and reveals the result.

### 3.6 Pre-Duel: Opponent Intro Video

- A full-screen video (provided per character) plays before the duel begins.

### 3.7 Duel Screen

This is the core and most complex screen, based on the reference layout provided.

**Overall HUD elements:**
| # | Element | Description |
|---|---------|-------------|
| 1 | Menu Button | Opens the in-duel menu |
| 2 | Duel Log Button | Toggles the Duel Log (development/debugging use only) |
| 3 | Field Status Button | Out of scope for this version — reserved for future release |
| 4 | Activation Confirmation Button | Out of scope for this version — reserved for future release |
| 5 | User Hand | Cards currently in the user's hand |
| 6 | User Life Points | — |
| 7 | User Mate | Out of scope for this version — reserved for future release |
| 8 | AI Opponent's Hand | — |
| 9 | AI Opponent's Life Points | — |
| 10 | AI Opponent's Mate | Out of scope for this version — reserved for future release |

**Dueling field zones (per player, mirrored for user and AI):**
| # | Zone | Description |
|---|------|--------------|
| 1 | Main Monster Zones | Up to 5 summoned monsters |
| 2 | Extra Monster Zones | Out of scope for this version — reserved for future release |
| 3 | Spell & Trap Zone | Up to 5 Spell/Trap cards (set or activated) |
| 4 | Pendulum Zone | Out of scope for this version — reserved for future release |
| 5 | Field Zone | For Field Spell cards affecting the whole field |
| 6 | Graveyard | Destroyed monsters and used/spent Spell/Trap cards |
| 7 | Extra Deck Zone | Extra Deck, placed face-down |
| 8 | Deck Zone | Main Deck, placed face-down |
| 9 | Banished Zone | Cards removed from play |

The AI opponent's field mirrors the user's field and follows identical rules.

---

## 4. Core Gameplay Rules

- Neither player may view the other's hand, unless revealed by a card effect.
- Neither player may view the other's Main Deck, unless revealed by a card effect.
- **The AI opponent must not have access to the user's hand or deck information** — this would constitute cheating and give the AI an unfair advantage.
- Additional standard YuGiOh rules should be researched and incorporated into the development plan as needed.

### 4.1 Target Selection Indicators

When the user is prompted to select a target for a card effect, eligible cards must be visually indicated based on location, using a dedicated icon per location type. Icons are color-coded:

- **Blue** — cards under the user's control
- **Red** — cards under the AI opponent's control

Required location icons (one per case, in both blue and red variants):

1. In the Hand
2. On the Field
3. In the Deck
4. In the Extra Deck
5. In the Graveyard
6. Banished

Hovering over any icon must show a tooltip explaining its meaning.

### 4.2 Card Status Icons

When a card is in a special state, a status icon must be shown. When the user selects a card from the card list, all applicable status icons should display left-to-right beneath the card's details:

1. Effects negated
2. Cannot be Special Summoned
3. Temporarily banished by a card effect
4. Used as Fusion Summon material
5. Used as Synchro Summon material
6. Destroyed by battle
7. Cannot attack due to a card effect

Hovering over any icon must show a tooltip explaining its meaning.

### 4.3 Card Hover Preview

Hovering over any card the user is permitted to see must display a side popup showing the card's full image and details (reference: attached image #3).

---

## 5. Deliverables

Please produce the following five Markdown files, to be placed in the `.ai-docs` folder (already excluded via `.gitignore`):

1. **`development-plan.md`** — A detailed, phase-by-phase development plan. Each phase corresponds to a separate Coding Agent session. Must define a `progress.md` file that Coding Agent updates at the end of each phase and re-reads at the start of the next.
2. **`architecture.md`** — Technical architecture documentation.
3. **`design-system.md`** — UI/UX design system documentation.
4. **`phases-prompts.md`** — A ready-to-use prompt for each Coding Agent development phase/session. Each phase should end with a commit (or incremental commits per completed piece of work), followed by a step-by-step manual testing guide for visually verifying the changes made in that phase.
5. **`images-prompts.md`** — A detailed AI image-generation prompt for each required image, along with the target file path/location within the game's project structure.

---

## 6. Open Questions

If any questions arise during planning, please answer them yourself using reasonable judgment and document them, along with your answers, in a separate **`answered-questions.md`** file.
