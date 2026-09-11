# Yu-Gi-Oh! Duel Arena — Comprehensive Build, Release, and Deployment Guide

This document is the authoritative engineering guide for building, testing, packaging, and deploying releases of **Yu-Gi-Oh! Duel Arena** to GitHub. It details the hybrid repository asset architecture, provides a post-mortem on missing asset bugs, and defines step-by-step procedures for every type of change made during game development.

---

## 1. Architectural Overview & Asset Distribution

The simulator distributes roughly ~2.0 GB of binary data to players while maintaining a lightweight, performant Git repository. To achieve this, assets are partitioned across three tiers:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                REPOSITORY & ASSET TIERS                                  │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────┤
│ Tier 1: Git Tracked      │ Tier 2: Binary Release Mirror│ Tier 3: In-Game Runtime Patches  │
│ (GitHub Repository)      │ (GitHub Release 'assets-v1')│ (userData/patch/ & app-patch)   │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────┤
│ • Vue 3 & TypeScript src │ • game-media.tar.gz (~114MB)│ • app-patch.tar.gz (~78MB)      │
│ • Lua Scripts (5,081+)   │   - resources/videos/       │   - dist/ (compiled app)        │
│ • SQLite cards.cdb (~2MB)│   - resources/audio/        │   - data/ (metadata & configs)  │
│ • data/*.json manifests  │ • card-images.tar.gz (~1GB) │   - resources/cards.cdb         │
│ • Custom cards (999xxxxx)│   - resources/cards/        │   - resources/scripts/          │
│ • UI icons and logos     │                             │   - resources/videos/cards/     │
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────┘
```

### 1.1 Git-Tracked Files (`Tier 1`)
- **Application Code**: `src/main/`, `src/preload/`, `src/renderer/`, `scripts/`, `tests/`.
- **Authoritative Databases & Scripts**:
  - `resources/cards.cdb` (SQLite database with card statistics and texts).
  - `resources/scripts/official/` and `resources/scripts/custom/` (card Lua logic).
  - `data/card-pool-whitelist.json`, `data/characters.json`, `data/card-videos.json`, `data/update-manifest.json`.
- **Custom Assets**: Custom cards (`99900001`, `99937011`), UI icons, and menu background art.

### 1.2 Binary Release Mirrors (`Tier 2` — GitHub Tag `assets-v1`)
Because GitHub repositories have repository size quotas and slow clone speeds for gigabyte-scale binary files, heavy media files are excluded from Git via `.gitignore`:
- `resources/videos/` (Summon, Attack, and Character intro cutscenes — `.mp4`).
- `resources/audio/` (BGM music soundtracks and sound effects — `.mp3`, `.wav`).
- `resources/cards/` (Over 12,000 card card illustrations: `full/`, `art/`, `mini/` — `.jpg`).

During GitHub Actions CI builds (`.github/workflows/build-release.yml`), the runner downloads these pre-packaged archives from the static release container **`assets-v1`** on GitHub:
- `game-media.tar.gz`: Contains all monster cutscene videos and audio files.
- `card-images.tar.gz`: Contains all pre-scraped card illustrations.

### 1.3 In-Game Runtime Patches (`Tier 3` — `app-patch.tar.gz`)
When a new minor or patch version is published, players do not need to re-download the full 1.8 GB installer. The game's internal `UpdateService` downloads `app-patch.tar.gz` (~78 MB), extracts it to the player's OS `userData/patch/` directory, and overlays runtime files dynamically on boot.

---

## 2. Post-Mortem: Why Stardust & Archfiend Cutscenes Were Missing in v0.1.14

### 2.1 The Incident
In version `v0.1.14`, players downloading the full Windows installer (`yugioh-electron-setup-0.1.14.exe`) reported that monster cutscenes for **Stardust Dragon** (`44508094`) and **Red Dragon Archfiend** (`70902743`) did not play during duels. Upon inspecting the installed game files in `resources/videos/cards/`, all other monsters (Dark Magician, Blue-Eyes, Slifer, Egyxos, Buster Blader) were present, but Stardust and Red Dragon Archfiend were absent.

### 2.2 Root Cause Analysis
1. **Local Asset Creation**: On September 10, 2026, four new video files were added on the local development machine:
   - `resources/videos/cards/summon_44508094.mp4` (~6.9 MB)
   - `resources/videos/cards/attack_44508094.mp4` (~7.9 MB)
   - `resources/videos/cards/summon_70902743.mp4` (~6.7 MB)
   - `resources/videos/cards/attack_70902743.mp4` (~7.3 MB)
   - `data/card-videos.json` was updated to mark both monsters with `"isPlaceholder": false`.
2. **Git Exclusion**: Because `.gitignore` contains `resources/videos/`, running `git add .` and `git commit` did not commit these video files to GitHub.
3. **Stale Cloud Mirror**: The GitHub Actions workflow (`build-release.yml`) was configured to download `game-media.tar.gz` from the `assets-v1` release on GitHub. However, `assets-v1/game-media.tar.gz` was uploaded on **September 8, 2026** — two days *before* Stardust and Red Dragon Archfiend videos were created.
4. **Silent Package Generation**: On the GitHub Actions Windows runner, `game-media.tar.gz` extracted only the 5 older monster videos. `electron-builder` packaged whatever was present in `resources/`, resulting in an installer lacking the new cutscenes.
5. **Missing CI Validation Guard**: The CI workflow had no step validating that every monster marked as `"isPlaceholder": false` in `data/card-videos.json` actually existed in the build folder before packaging.

### 2.3 Permanent Protections Implemented
To guarantee this failure mode can never reoccur:
1. **Automated Asset Verification Script (`scripts/verify-release-assets.ts`)**:
   - Cross-references `data/card-videos.json` and verifies that every non-placeholder cutscene exists on disk with a valid file size (>10 KB).
   - Validates audio tracks, card database (`cards.cdb`), Lua scripts pool, and update manifest.
   - Run locally via `npm run verify:assets` or in strict mode via `npm run verify:assets -- --strict`.
2. **CI Pipeline Hardening**:
   - `.github/workflows/build-release.yml` now runs `npm run verify:assets -- --strict` immediately after downloading media assets. If the mirror archive is missing any active cutscene, **the CI build will immediately fail** before compiling or releasing broken executables.
3. **Automated Media Packaging & Sync Tool (`scripts/pack-media-assets.sh`)**:
   - Bundles `resources/videos` and `resources/audio` into `game-media.tar.gz`.
   - Supports `--upload` flag to automatically push the updated archive to the GitHub `assets-v1` release mirror using GitHub CLI.
4. **Unit Test Suite Integration (`tests/release-asset-integrity.test.ts`)**:
   - Added as test suite #45 in `npm test`.

---

## 3. Handling Changes During Development (All Scenarios)

Before building or tagging a release, identify which types of changes were made and follow the corresponding workflow:

### Scenario A: Code & UI Changes (TypeScript, Vue, Pinia, SCSS)
*Files affected*: `src/main/`, `src/preload/`, `src/renderer/`, `vite.config.ts`.
1. **Port Conflicts**: Vite defaults to port `5174` with `strictPort: false`. If port 5174 is occupied by another process, Vite automatically increments to the next available port (5175, 5176, etc.) and Electron connects dynamically.
2. **Build Verification**:
   ```bash
   npm run build
   ```
3. **Execute Unit Tests**:
   ```bash
   npm test
   ```

### Scenario B: Card Mechanics & Lua Script Updates
*Files affected*: `resources/scripts/official/*.lua`, `resources/scripts/custom/*.lua`.
1. **Tracked in Git**: Lua scripts are tracked in Git. No external mirror upload is required.
2. **Deterministic Duel Options**: In tests using `noShuffle: true`, always ensure `OcgDuelMode.PSEUDO_SHUFFLE` (`16n`) is included in duel creation flags so `ocgcore` does not randomize decks.
3. **Regenerate Update Manifest**:
   ```bash
   npm run generate:manifest
   ```

### Scenario C: Monster Cutscene Videos & Animations
*Files affected*: `resources/videos/cards/`, `data/card-videos.json`.
1. Place `.mp4` video cutscenes in `resources/videos/cards/` using canonical naming:
   - `summon_<cardId>.mp4`
   - `attack_<cardId>.mp4`
2. Update `data/card-videos.json`:
   ```json
   "44508094": {
     "cardName": "Stardust Dragon",
     "series": "5Ds",
     "summon": "resources/videos/cards/summon_44508094.mp4",
     "attack": "resources/videos/cards/attack_44508094.mp4",
     "isPlaceholder": false
   }
   ```
3. **MANDATORY**: Package and upload the updated media bundle to the GitHub release mirror:
   ```bash
   npm run pack:media -- --upload
   ```
4. Verify assets locally:
   ```bash
   npm run verify:assets
   ```

### Scenario D: Audio Tracks & BGM Music
*Files affected*: `resources/audio/bgm/`, `resources/audio/sfx/`, `data/soundpack.json`.
1. Place audio files in `resources/audio/`.
2. Package and upload to the release mirror:
   ```bash
   npm run pack:media -- --upload
   ```

### Scenario E: Card Database & Pool Whitelist Changes
*Files affected*: `resources/cards.cdb`, `data/card-pool-whitelist.json`.
1. Verify SQLite database integrity:
   ```bash
   sqlite3 resources/cards.cdb "PRAGMA integrity_check;"
   ```
2. If new cards were added, scrape/verify images:
   ```bash
   npm run download:cards
   ```
3. If new card images were scraped, update the card image bundle on `assets-v1`:
   ```bash
   bash scripts/pack-cards-bundle.sh
   gh release upload assets-v1 card-images.tar.gz --clobber
   ```

### Scenario F: Character Portfolios & Intro Cutscenes
*Files affected*: `data/characters.json`, `resources/characters/`, `resources/videos/characters/`.
1. Character portraits in `resources/characters/` are tracked in Git.
2. Character video intros in `resources/videos/characters/` are in `game-media.tar.gz`. Run `npm run pack:media -- --upload` if videos are added.

---

## 4. Pre-Flight Verification Checklist

Run this quick checklist before creating any release tag:

```bash
# 1. Clean build test
npm run build

# 2. Asset completeness check
npm run verify:assets -- --strict

# 3. Full test suite (All 45 suites must pass)
npm test

# 4. Working tree inspection
git status
```

---

## 5. Step-by-Step Release & Deployment Procedure

Follow these exact steps to publish a new release to GitHub:

### Step 1: Bump Version
Update the `"version"` field in `package.json` following Semantic Versioning (`MAJOR.MINOR.PATCH`):
```json
{
  "name": "yugioh-electron",
  "version": "0.1.15"
}
```

### Step 2: Regenerate Update Manifest
Update `data/update-manifest.json` with file hashes, byte counts, and new version number:
```bash
npm run generate:manifest
```

### Step 3: Sync Media Assets to Cloud Mirror (If Videos/Audio Changed)
If any video cutscene or audio file was added or updated:
```bash
npm run pack:media -- --upload
```
*(Requires `gh auth login` with repository write permissions).*

### Step 4: Commit & Push Changes
```bash
git add package.json data/update-manifest.json data/card-videos.json
git commit -m "chore(release): prepare v0.1.15"
git push origin main
```

### Step 5: Tag & Trigger GitHub Actions CI
```bash
git tag v0.1.15
git push origin v0.1.15
```

### Step 6: Monitor GitHub Actions Workflow
Monitor the release workflow in real time:
```bash
gh run watch
```
Or check via browser:
`https://github.com/x0911/yugioh-electron/actions`

### Step 7: Verify Published Release Artifacts
Once the workflow finishes, verify that the following assets are attached to the release on GitHub:
1. `yugioh-electron-setup-X.Y.Z.exe` (~1.8 GB, Windows NSIS full installer)
2. `yugioh-electron-X.Y.Z.exe` (~1.7 GB, Windows Portable executable)
3. `app-patch.tar.gz` (~78 MB, In-game fast delta update bundle)
4. `latest.yml` (Electron-updater metadata)

Verify with GitHub CLI:
```bash
gh release view v0.1.15
```

---

## 6. Hot-Patching Existing Releases Without Rebuilding Installers

If an existing release needs an urgent fix (e.g. updating Lua scripts, fixing a UI bug, or supplying missing cutscene videos):

1. Compile the latest code:
   ```bash
   npm run build
   ```
2. Package the fast patch bundle directly:
   ```bash
   tar -czf app-patch.tar.gz dist/ data/ resources/cards.cdb resources/scripts/ resources/videos/cards package.json
   ```
3. Upload and replace `app-patch.tar.gz` on the target release tag:
   ```bash
   gh release upload v0.1.14 app-patch.tar.gz --clobber
   ```
4. When players launch the game or click **Check for Updates**, the application will download the updated patch archive into `userData/patch/` and apply it immediately without reinstalling the application.

---

## 7. Troubleshooting & Recovery Matrix

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| `Port 5173 is already in use` | Old dev server or external tool holding port. | Configured default port `5174` and `strictPort: false` in `vite.config.ts`. Vite will auto-select the next open port. |
| Cutscenes missing in packaged game | `game-media.tar.gz` on `assets-v1` was not updated before building. | Run `npm run pack:media -- --upload` to update the mirror, then trigger a new release build. |
| CI fails on `Verify Release Assets Completeness` | A non-placeholder cutscene or audio file is missing on the CI runner. | Check the error output to see which file is missing. Update `assets-v1/game-media.tar.gz` or mark as placeholder. |
| CI fails with `422 "already_exists"` on release creation | Race condition between NSIS and Portable builder targets trying to create the release simultaneously. | Workflow includes `Ensure GitHub Release Exists` step to pre-create the release container. |
| CI fails on Harpie's Feather Duster or engine shuffle | Deck order non-deterministic when `noShuffle: true` is set. | Ensure `OcgDuelMode.PSEUDO_SHUFFLE` (`16n`) is included in duel creation flags in `DuelEngineService.ts`. |
| In-game patch doesn't load videos | `app-patch.tar.gz` built on CI runner without videos. | Build patch locally where full videos exist and upload via `gh release upload vX.Y.Z app-patch.tar.gz --clobber`. |
