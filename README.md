# Yu-Gi-Oh! Desktop Duel (DM + GX Era)

An offline, single-player (User vs AI) Yu-Gi-Oh! desktop game powered by **Electron**, **Vue 3**, **TypeScript**, **SCSS** (Ancient Duel Arena design system), and the official **`ygopro-core`** rules engine (EDOPro lineage via WebAssembly).

Card pool is strictly restricted to the **original Yu-Gi-Oh! (Duel Monsters)** series and the **Yu-Gi-Oh! GX** series (2,826 legal cards).

---

## Prerequisites

- **Node.js**: `>= 20.x` LTS or current (tested on Node v22+ / v25)
- **npm**: `>= 10.x`
- **Operating System**: macOS, Windows 10/11, or Linux

---

## Quick Start / Setup

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd yugioh-electron
npm install
```

### 2. Build Card Database & Scripts (One-Time Setup)

Generates the filtered `resources/cards.cdb` SQLite database, downloads Lua effect scripts, and builds `data/card-pool-whitelist.json` for the 2,826 legal DM & GX cards:

```bash
npm run build:cards
```

### 3. Download Offline Card Assets (One-Time Setup)

> [!IMPORTANT]
> **Asset Pipeline & Git Hygiene**: Downloaded card images are **gitignored** to prevent repository bloat (2,826 cards × 3 image variants = **8,478 image files** totaling ~500 MB). The repository tracks self-hosted web fonts and fallback placeholder assets, but you **must** run `npm run download:cards` after cloning to download and optimize the full offline card art collection.

```bash
npm run download:cards
```

- **Resumable**: Skips cards that have already been downloaded.
- **Rate-Limited**: Strictly limits requests to $\le 18\text{ req/s}$ to comply with YGOPRODeck CDN policies.
- **Sharp Re-Encoding**: Automatically resizes the virtualized grid variant (`resources/cards/mini/`) to crisp $96 \times 140\text{ px}$ JPEG files.
- **CLI Options**:
  - `npm run download:cards -- --limit 50` (Download first 50 cards for fast testing)
  - `npm run download:cards -- --force` (Force re-download all images)
  - `npm run download:cards -- --concurrency 12` (Adjust worker pool concurrency)

### 4. Launch Development Environment

```bash
npm run dev
```

---

## Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server on port 5173 and launches Electron desktop window |
| `npm run build` | Compiles main process, preload script, and builds production Vite renderer bundle |
| `npm run spike` | Runs headless mock duel simulation directly against `ocgcore-wasm` in Node.js |
| `npm run build:cards` | Filters master BabelCDB/YGOPRODeck database to DM+GX cards and generates `resources/cards.cdb` |
| `npm run download:cards` | Downloads all 3 card image variants (`full`, `art`, `mini`) with Sharp optimization |
| `npm run typecheck` | Runs `vue-tsc` to verify TypeScript types across main, preload, renderer, and shared code |
| `npm run lint` | Runs ESLint across all TypeScript and Vue files |
| `npm run lint:fix` | Automatically fixes ESLint warnings and formatting issues |
| `npm run format` | Runs Prettier to format all codebase files |
| `npm run rebuild:native` | Rebuilds `better-sqlite3` native bindings against current Electron ABI |

---

## Architecture Overview

```
src/
├── main/                       # Electron Main process (Node.js & native services)
│   ├── engine/                 # ocgcore-wasm lifecycle, cardReader, scriptReader, viewFilter
│   ├── ipc/                    # IPC communication handlers
│   └── index.ts                # Main bootstrap & BrowserWindow configuration
├── preload/
│   └── index.ts                # contextBridge typed APIs (duelAPI, deckAPI, settingsAPI)
├── renderer/                   # Vue 3 SPA (Composition API & Pinia)
│   ├── assets/                 # SCSS 7-1 modular stylesheets & bundled fonts
│   ├── router/                 # Vue Router (7 screen routes)
│   ├── stores/                 # Pinia stores (duelStore, uiStore, deckEditStore, settingsStore)
│   └── views/                  # Screen views (MainMenuView, DuelView, DeckEditView, etc.)
└── shared/
    ├── types/                  # Shared TypeScript interfaces & IPC payload definitions
    └── constants/              # Shared game constants & zone bitmasks

resources/                      # Local offline assets (packaged with extraResources)
├── cards/
│   ├── full/                   # 813x1185 high-resolution full card images (gitignored)
│   ├── art/                    # 624x624 cropped artwork images (gitignored)
│   ├── mini/                   # 96x140 Sharp-optimized grid thumbnails (gitignored)
│   ├── card-back.jpg           # Ancient Duel Arena obsidian/gold card back
│   └── placeholder.jpg         # "Card Image Unavailable" fallback asset
├── fonts/                      # Self-hosted Cinzel & Inter WOFF2 fonts (SIL OFL 1.1)
├── cards.cdb                   # Filtered SQLite card database
└── scripts/                    # Lua runtime constants & 2,414 official card effect scripts
```

---

## Typography & Design System

- **Display & Headers**: [Cinzel](https://fonts.google.com/specimen/Cinzel) (SIL Open Font License 1.1)
- **UI & Numeric**: [Inter](https://rsms.me/inter/) (SIL Open Font License 1.1) with tabular numerals (`font-variant-numeric: tabular-nums`)
- **Theme**: "Ancient Duel Arena" — Obsidian glassmorphism panels, aged gold accents, glowing hologram indicators, and 60fps animations.
