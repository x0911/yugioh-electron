<div align="center">

# ⚔️ Yu-Gi-Oh! Desktop Duel Arena
### *Authentic Offline & Real-Time Multiplayer Yu-Gi-Oh! Experience — DM & GX Era*

[![Release](https://img.shields.io/github/v/release/x0911/yugioh-electron?color=gold&style=for-the-badge&logo=github)](https://github.com/x0911/yugioh-electron/releases/latest)
[![Electron](https://img.shields.io/badge/Electron-30.0+-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Vue 3](https://img.shields.io/badge/Vue%203-Composition%20API-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-ocgcore-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)](https://webassembly.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-PeerJS-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<p align="center">
  <b>A full-featured desktop game simulating authentic Yu-Gi-Oh! duels from the golden eras of Duel Monsters and Yu-Gi-Oh! GX.</b><br/>
  Featuring both single-player vs 40 anime duelists with custom AI and <b>real-time peer-to-peer multiplayer (PvP) with integrated WebRTC voice chat</b>.<br/>
  Powered by official C++ <code>ygopro-core</code> rules compiled to WebAssembly, 526 pre-built decks, cinematic summon animations, and an in-game Smart Delta Patcher.
</p>

[🎮 Features](#-key-features) • [💻 For Developers](#-for-developers) • [⚔️ Multiplayer PvP](#2-real-time-multiplayer-pvp-arena--voice-chat) • [⚡ Quick Start](#-quick-start) • [🧠 Dual-AI Engine](#-dual-engine-ai-system) • [👥 40-Duelist Roster](#-40-character-roster--526-decks) • [🛠️ Architecture](#-system-architecture) • [🧪 Testing](#-testing--quality-assurance)

---

</div>

## 🌟 Why This Project Stands Out

<table>
<tr>
<td width="50%" valign="top">

### 🎮 For Gamers
- **Strictly DM & GX Eras**: Pure nostalgic card pool (3,200+ cards) without Link, Pendulum, or Xyz clutter.
- **Real-Time Multiplayer (PvP)**: Serverless peer-to-peer dueling with 4-digit room codes, synchronized summon cutscenes, and low-latency voice chat.
- **526 Pre-Built Decks**: 10 authentic decks for each of the 40 characters + 21 competitive meta archetypes + full custom deck builder.
- **Cinematic Cutscenes**: Full-screen summon and attack animations with dynamic audio ducking.
- **100% Offline & Online Ready**: Play anywhere offline vs advanced AI, or connect online for instant PvP matches.
- **In-Game Smart Patcher**: Update card definitions, decks, and engine rules in seconds without redownloading the full 1.2GB installer.

</td>
<td width="50%" valign="top">

### 💼 For Recruiters & HR
- **Full-Stack Desktop Engineering**: Production-ready architecture built with Electron, Vue 3, Pinia, TypeScript, and SCSS.
- **Native C++ WebAssembly Integration**: Interfacing high-performance WASM binaries in the Node.js runtime.
- **Decoupled P2P Networking**: WebRTC DataChannels and MediaStreams for zero-cost, serverless multiplayer dueling.
- **Production-Grade Reliability**: Structured clone IPC boundaries, atomic state machines, and virtualized rendering.
- **Multi-Provider LLM Orchestration**: Context-grounded tactical reasoning with automated fault-tolerant fallback.
- **Delta Patching Pipeline**: Cryptographic content-addressable update service with SHA-256 verification and rollback capabilities.

</td>
</tr>
</table>

---

## 💻 For Developers

- **Official Rules Precision**: Runs the battle-tested `ocgcore` engine (EDOPro lineage) compiled to WebAssembly for bit-accurate card logic, continuous effects, and complex chain resolutions.
- **Serverless Peer-to-Peer Protocol**: Custom RPC state synchronization protocol over WebRTC DataChannels using PeerJS, STUN NAT traversal, and cryptographic structured clone unwrapping for zero-cost hosting.
- **Low-Latency Voice Chat Engine**: Web Audio API integration with `AnalyserNode` frequency inspection for real-time speaking wave detection and bidirectional audio ducking.
- **Smart Delta Patcher**: Cryptographic SHA-256 content-addressable update service that dynamically overlays file changes in `userData/patch` without requiring full installer downloads.
- **Custom Card & Script Pipeline**: Complete Lua scripting environment capable of executing original cards (e.g., *Elemental HERO Egyxos*) with custom effect archetypes and triggers.
- **RFC 7233 Partial Content Streaming**: Native custom protocol handler streaming high-definition MP4 summon cutscenes smoothly via HTTP 206 byte-ranges.
- **Decoupled Type-Safe IPC**: ContextBridge boundaries with unproxied object unwrapping preventing `DOMException: An object could not be cloned` serialization errors.
- **Comprehensive Automated Test Harness**: 39 test suites covering game mechanics, AI tactics, multiplayer protocols, and delta patcher reliability with a 100% pass rate.

---

## 🎮 Key Features

### 1. 100% Rule-Accurate Duel Simulation (`ocgcore-wasm`)
- Runs the battle-tested **`ygopro-core`** (EDOPro lineage) engine compiled to WebAssembly.
- Handles complex game mechanics natively: chains, damage calculation steps, simultaneous effects (SEGOC), tribute & fusion summons, spell speeds, and continuous field effects.

### 2. Real-Time Multiplayer PvP Arena & Voice Chat
- **4-Digit Room Codes**: Simple peer-to-peer room creation (e.g., room code `4829`) connecting via public STUN servers without dedicated server infrastructure.
- **Integrated WebRTC Voice Chat**: Optional, low-latency in-game voice chat with microphone mute, deafen controls, volume slider, and visual speaking wave indicators.
- **Synchronized Summon & Attack Videos**: Both players simultaneously watch monster cutscenes when iconic cards enter the field.
- **Live Card DB Hydration**: Guest clients automatically hydrate monster ATK/DEF and card lore directly from the local card database.
- **Forfeit & Disconnect Detection**: Instant surrender and disconnect handling, awarding victory celebration and fanfare to the remaining player.
- **Equipped Deck Auto-Scroll**: Opening the deck selection modal automatically scrolls to the currently equipped deck across 500+ choices.

### 3. Dual-Engine AI Duelist System
- **Fast Local Heuristics Engine**: Zero-latency decision tree engine evaluating field control, ATK differentials, trap traps, and combat threats.
- **Cloud LLM AI Duelist (Groq, Gemini, OpenAI, Ollama, Anthropic)**:
  - Generates in-character anime dialogue, taunts, and tactical rationale right in the duel interface!
  - **Self-Healing Fallback**: If an API rate limit or network issue occurs (e.g. HTTP 429), the game seamlessly falls back to the local FastAI engine with live HUD diagnostics.

### 4. 40 Anime Characters & 526 Complete Decks
- **20 Duel Monsters Duelists**: Yami Yugi, Seto Kaiba, Joey Wheeler, Mai Valentine, Maximillion Pegasus, Marik Ishtar, Bakura, Bandit Keith, Ishizu, Dartz, Rafael, and more.
- **20 GX Era Duelists**: Jaden Yuki, Zane Truesdale, Chazz Princeton, Aster Phoenix, Alexis Rhodes, Jesse Anderson, Supreme King Jaden, Yubel, Professor Crowler, Adrian Gecko, and more.
- **526 Pre-built Decks Ready to Play**: 400 character-canonical decks + 21 popular meta/nostalgia archetypes (Cyber Dragon OTK, Chaos Control BLS/CED, Monarchs, Gladiator Beasts, Lightsworn, Dark World, Gravekeeper's, Slifer Divine Overflow) + full custom deck support.

### 5. Cinematic Cutscenes & Dynamic Sound Matrix
- **Authentic Cutscenes**: Full-motion summon and attack video cutscenes for iconic monsters (*Dark Magician*, *Blue-Eyes White Dragon*, *Slifer the Sky Dragon*, and custom Egyptian God *Elemental HERO Egyxos*).
- **Audio Ducking**: Duel BGM automatically softens during dramatic summon cutscenes and recovers smoothly.
- **44-Sound Reactive Matrix**: Every action (card draw, flip, tribute, LP tick, heavy attack clash) triggers authentic, responsive SFX.

### 6. High-Performance Virtualized Deck Editor
- Search through **3,200+ cards** with sub-millisecond filtering across Card Type, Monster Attribute, Monster Race/Type, Level/Rank, ATK/DEF, and Archetype text.
- Virtualized card grid optimized with `Sharp` image rendering for silky-smooth 60 FPS scrolling.
- Full drag-and-drop and one-click deck construction with real-time Main (40-60), Extra (0-15), and Side (0-15) deck legality checks.

### 7. Smart Delta Patcher & In-Game Game Updater
- **Instant Synchronization**: Synchronize game rules, Lua scripts, card database, and 526 prebuilt decks directly from GitHub within seconds.
- **SHA-256 Integrity Verification**: Every downloaded file is verified with cryptographic checksums before application.
- **Patch Overlay Architecture**: Applies updates non-destructively to `userData/patch`, preserving base installation integrity with one-click rollback.

---

## 🧠 Dual-Engine AI System

The duel engine supports two interchangeable AI decision backends that can be switched on the fly in **Settings**:

```
                              ┌─────────────────────────────┐
                              │    Duel Engine (ocgcore)    │
                              └──────────────┬──────────────┘
                                             │
                                     Engine Waiting Prompt
                                             │
                        ┌────────────────────┴────────────────────┐
                        ▼                                         ▼
            ┌───────────────────────┐                 ┌───────────────────────┐
            │   Fast Local AI       │                 │   Cloud LLM Duelist   │
            │   (Built-in Engine)   │                 │   (Groq/Gemini/OpenAI)│
            ├───────────────────────┤                 ├───────────────────────┤
            │ • 40 Distinct Profiles│                 │ • Anime Persona Talk  │
            │ • Zero Latency (<5ms) │                 │ • Tactical Reasoning  │
            │ • Heuristic Scoring   │                 │ • Context-Grounded    │
            └───────────┬───────────┘                 └───────────┬───────────┘
                        │                                         │
                        │           ┌─────────────────┐           │
                        └──────────►│ Fallback Shield │◄──────────┘
                                    │ (On HTTP 429/401│
                                    └────────┬────────┘
                                             ▼
                                ┌─────────────────────────┐
                                │ Executed Engine Move    │
                                └─────────────────────────┘
```

Each of the 40 characters features custom tactical weights:
- **Seto Kaiba**: High aggression (0.95), low defense (0.15), aggressive face-down probing, prioritizes high-ATK beatsticks.
- **Yugi Muto**: Balanced strategic patience, high defense (0.80), trap baiting, combo preservation.
- **Zane Truesdale**: OTK burst focus (0.92), rapid Machine Fusion chaining.

---

## 👥 40-Character Roster & 526 Decks

<details>
<summary><b>Click to expand the full 40-Character Roster & Archetypes</b></summary>

<br/>

| Series | Character | Primary Archetypes & Signature Cards | Decks Available |
| :---: | :--- | :--- | :---: |
| **DM** | **Yami Yugi** | Dark Magician, Egyptian Gods, Spellcaster Beatdown | 10 Decks |
| **DM** | **Seto Kaiba** | Blue-Eyes White Dragon, Dragon Beatdown, XYZ-Dragon Cannon | 10 Decks |
| **DM** | **Joey Wheeler** | Red-Eyes Black Dragon, Warriors, Gamble Luck | 10 Decks |
| **DM** | **Mai Valentine** | Harpie Lady Swarm, Amazoness Warriors | 10 Decks |
| **DM** | **Maximillion Pegasus** | Toon World, Relinquished, Thousand-Eyes Restrict | 10 Decks |
| **DM** | **Marik Ishtar** | Winged Dragon of Ra, Gravekeeper's, Fiend Torture | 10 Decks |
| **DM** | **Yami Bakura** | Destiny Board, Dark Necrofear, Occult Fiends | 10 Decks |
| **DM** | **Bandit Keith** | Barrel Dragon, Machine Control, Coin Toss | 10 Decks |
| **DM** | **Ishizu Ishtar** | Fairy Beatdown, Gravekeeper's, Exchange of the Spirit | 10 Decks |
| **DM** | **Dartz** | Seal of Orichalcos, Orichalcos Kyutora, Leviathan | 10 Decks |
| **DM** | **Rafael** | Guardians, Eatos, Dreadscythe, Arsenal Summoning | 10 Decks |
| **DM** | **Mako Tsunami** | Umi Ocean, Legendary Fisherman, Water Beatdown | 10 Decks |
| **DM** | **Rex Raptor** | Dinosaurs, Two-Headed King Rex, Jurassic Beatdown | 10 Decks |
| **DM** | **Weevil Underwood** | Insects, Perfectly Ultimate Great Moth, Insect Swarm | 10 Decks |
| **DM** | **Espa Roba** | Jinzo, Trap Lockdown, Machine Beatdown | 10 Decks |
| **DM** | **Odion** | Mystical Beast Serket, Continuous Trap Monsters | 10 Decks |
| **DM** | **Arkana** | Dark Magician (Arkana Variant), Ectoplasmer Burn | 10 Decks |
| **DM** | **Bakura Ryou** | Occult Mill, Morphing Jar, Zombie Stall | 10 Decks |
| **DM** | **Tea Gardner** | Fairies, Life Point Gain, Sanctuary in the Sky | 10 Decks |
| **DM** | **Tristan Taylor** | Cyber Commander, Warriors & Machines Beatdown | 10 Decks |
| **GX** | **Jaden Yuki** | Elemental HEROes, Neo-Spacians, Flame Wingman | 10 Decks |
| **GX** | **Zane Truesdale** | Cyber Dragons, Cyber End Dragon, Power Bond OTK | 10 Decks |
| **GX** | **Chazz Princeton** | Armed Dragons, Ojamas, VWXYZ-Dragon Catapult | 10 Decks |
| **GX** | **Aster Phoenix** | Destiny HEROes, Plasma, Dreadmaster, Clock Tower | 10 Decks |
| **GX** | **Alexis Rhodes** | Cyber Angels, Ritual Fairies, Cyber Blader | 10 Decks |
| **GX** | **Jesse Anderson** | Crystal Beasts, Rainbow Dragon, Crystal Abundance | 10 Decks |
| **GX** | **Supreme King Jaden** | Evil HEROes, Dark Gaia, Super Polymerization | 10 Decks |
| **GX** | **Yubel** | Yubel Terror Incarnate, Ultimate Nightmare, Fiend Stall | 10 Decks |
| **GX** | **Dr. Vellian Crowler** | Ancient Gears, Ancient Gear Golem, Machine Beatdown | 10 Decks |
| **GX** | **Syrus Truesdale** | Roid Machines, Super Vehicroid, Power Tool | 10 Decks |
| **GX** | **Tyranno Hassleberry** | Dinosaurs, Ultimate Tyranno, Jurassic Evolution | 10 Decks |
| **GX** | **Bastion Misawa** | Hydrogeddon/Oxygeddon, Water/Fire/Earth Chem | 10 Decks |
| **GX** | **Axel Brodie** | Volcanics, Blaze Cannon, Volcanic Doomfire | 10 Decks |
| **GX** | **Jim Crocodile Cook** | Fossil Fusion, Paleozoic Rock Beatdown | 10 Decks |
| **GX** | **Adrian Gecko** | Cloudians, Fog Counters, Exodius the Ultimate | 10 Decks |
| **GX** | **Sartorius Kumar** | Arcana Force, Tarot Destiny, Light of Destruction | 10 Decks |
| **GX** | **Atticus Rhodes** | Red-Eyes Darkness Dragon, Dragon Swarm | 10 Decks |
| **GX** | **Nightshroud** | Darkness, Red-Eyes Black Dragon, Dragon Beatdown | 10 Decks |
| **GX** | **Yusuke Fujiwara** | Clear Monsters, Clear Vice Dragon, Attribute Nullify | 10 Decks |
| **GX** | **Chumley Huffington**| Des Koala, Australian Beasts, Master of Oz | 10 Decks |

</details>

---

## 🛠️ System Architecture

```
yugioh-electron/
├── src/
│   ├── main/                    # Electron Main Process (Node.js runtime)
│   │   ├── ai/                  # AI Controller, Combos & LLM services (Groq, Gemini, Local FastAI)
│   │   ├── engine/              # WebAssembly ocgcore bridge & message decoders
│   │   │   ├── DuelEngineService.ts  # Authoritative duel engine, state machine, PvP routing
│   │   │   ├── cardReader.ts         # SQLite cards.cdb reader with alias resolution
│   │   │   ├── scriptReader.ts       # Lua card script loader & macro preprocessor
│   │   │   └── viewFilter.ts         # Anti-cheat private state masking
│   │   ├── ipc/                 # Type-safe IPC channels (duel, deck, settings, update)
│   │   ├── services/            # Main background services (UpdateService delta patcher)
│   │   ├── persistence/         # Electron-store configuration & pre-built deck hydration
│   │   └── index.ts             # App bootstrap, window manager, HTTP 206 range protocol
│   ├── preload/                 # Secure ContextBridge APIs (duelAPI, deckAPI, settingsAPI, updateAPI)
│   ├── renderer/                # Vue 3 Single Page Application
│   │   ├── components/
│   │   │   ├── duel/            # Duel field, animated card fan, holographic zones, video overlay
│   │   │   ├── deckEdit/        # Virtualized card grid, filters, deck previewer
│   │   │   └── multiplayer/     # VoiceChatWidget, PlayerDeckSelectModal, PIN input
│   │   ├── services/multiplayer/# MultiplayerService (PeerJS WebRTC, RPC protocol, voice engine)
│   │   ├── stores/              # Pinia state stores (duelStore, deckEditStore, settingsStore, multiplayerStore)
│   │   └── views/               # MainMenuView, DuelView, DeckEditView, SettingsView, MultiplayerLobbyView, UpdateView
│   └── shared/                  # Universal TypeScript types, enums, RPC packets, and zone bitmasks
│
├── resources/                   # Local Offline Assets (Packaged with application)
│   ├── cards.cdb                # SQLite master card database (DM & GX pool)
│   ├── scripts/                 # Official Lua card scripts + custom cards (c99900001.lua)
│   ├── backgrounds/             # HD Duel arena & UI backgrounds
│   ├── characters/              # 40 Character avatars & high-res portraits
│   └── ui/                      # Ancient Duel Arena design system icons & menu graphics
│
└── data/                        # Curated Game Metadata
    ├── prebuilt-decks.json      # 526 complete canonical & competitive decks
    ├── update-manifest.json     # Content-addressable SHA-256 update manifest (3,555 files)
    ├── card-videos.json         # Video cutscene registry & triggers
    └── card-pool-whitelist.json # Whitelisted card codes for DM & GX eras
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: `>= 20.x` LTS (tested on Node v20, v22, and v25)
- **npm**: `>= 10.x`
- **Platform**: Windows 10/11, macOS (Apple Silicon / Intel), or Linux

### 1. Clone & Install
```bash
git clone https://github.com/x0911/yugioh-electron.git
cd yugioh-electron
npm install
```

### 2. Download Offline Card Art (One-Time Setup)
```bash
npm run download:cards
```
> *Downloads high-res card artwork, crops, and Sharp-compressed thumbnails for all 3,200+ cards into `resources/cards/` with rate-limiting and auto-resume.*

### 3. Launch the Game
```bash
npm run dev
```

### 4. Test Multiplayer Locally (Optional)
To test peer-to-peer multiplayer on a single machine:
```bash
# Terminal 1: Host window
npm run dev

# Terminal 2: Isolated Guest window
npm run dev:guest
```

---

## 📜 NPM Commands

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Launch Vite development server with Electron live reload (Host) |
| `npm run dev:guest` | Launch an isolated secondary Electron window for local PvP testing |
| `npm run build` | Bundle main process, preload script, and production renderer |
| `npm test` | Run complete test suite across all 39 test suites (mechanics, AI, multiplayer, decks) |
| `npm run download:cards` | Download card artwork assets with Sharp optimization |
| `npm run download:soundpack`| Download community soundpack assets |
| `npm run generate:manifest` | Generate cryptographic SHA-256 update manifest for game updates |
| `npm run typecheck` | Strict TypeScript verification across all modules |
| `npm run lint` | ESLint static code analysis |
| `npm run format` | Prettier code formatting |

---

## 🧪 Testing & Quality Assurance

This repository maintains a comprehensive automated testing suite ensuring zero regressions:

```bash
npm test
```

- **Rules & Mechanics**: Verifies chains, battle position shifts, damage step calculations, and trigger effects across 100+ cards.
- **Multiplayer & PvP Protocols**: Verifies WebRTC packet serialization, unproxied structured clone safety, symmetric card masking, video synchronization, and surrender/disconnect resolution.
- **Custom Card Execution**: Automated test suite for *Elemental HERO Egyxos* testing Contact Special Summoning, dynamic WIND ATK doubling, retribution board wipe, and Polymerization prevention.
- **Roster & Decks**: Validates that all 40 duelists and all 526 decks meet strict legality criteria ($\ge 40$ cards, 0 corrupted IDs).
- **Video & Audio Sync**: Verifies RFC 7233 partial byte-range streaming, video overlay state transitions, and engine event decoding.
- **AI Duelist Decision Engine**: Headless duels evaluating tactical decision quality, anti-cheat validation, and fallback mechanisms.
- **Smart Delta Patcher**: Cryptographic SHA-256 integrity verification, delta identification, and patch overlay precedence.

---

## 📜 License & Disclaimers

- **Codebase License**: MIT License. See [LICENSE](LICENSE) for details.
- **Yu-Gi-Oh! Intellectual Property**: Yu-Gi-Oh! is a registered trademark of Studio Dice, Shueisha, TV Tokyo, and Konami. This open-source non-commercial fan project is developed strictly for educational and portfolio demonstration purposes.
- **Rules Engine**: Powered by the open-source `ygopro-core` engine under LGPL-3.0.
