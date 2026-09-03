import fs from 'node:fs';
import path from 'node:path';
import type { CharacterData, CharacterDeckData } from '../../shared/types/character.js';

let cachedCharacters: CharacterData[] | null = null;

function getElectronApp(): any {
  try {
    // @ts-ignore
    const electron = globalThis.electron || (typeof process !== 'undefined' && (process as any).type ? require('electron') : null);
    return electron?.app || electron?.default?.app || null;
  } catch {
    return null;
  }
}

export function getResourcePath(relativePath: string): string {
  // 1. Check user patch overlay first (userData/patch)
  const electronApp = getElectronApp();
  if (electronApp && typeof electronApp.getPath === 'function') {
    try {
      const patchDir = path.join(electronApp.getPath('userData'), 'patch');
      const patchCandidate = path.join(patchDir, relativePath);
      if (fs.existsSync(patchCandidate)) {
        return patchCandidate;
      }
      const cleanSub = relativePath.replace(/^(?:resources|data)[\/\\]/, '');
      const patchSubCandidate = path.join(patchDir, cleanSub);
      if (fs.existsSync(patchSubCandidate)) {
        return patchSubCandidate;
      }
    } catch {
      // ignore
    }
  }

  // 2. Check process.resourcesPath (packaged Electron)
  if (typeof process.resourcesPath === 'string' && process.resourcesPath) {
    const candidateResource = path.join(process.resourcesPath, relativePath);
    if (fs.existsSync(candidateResource)) {
      return candidateResource;
    }
    const cleanSub = relativePath.replace(/^(?:resources|data)[\/\\]/, '');
    const candidateSub = path.join(process.resourcesPath, cleanSub);
    if (fs.existsSync(candidateSub)) {
      return candidateSub;
    }
  }

  // Check app.getAppPath()
  if (electronApp && typeof electronApp.getAppPath === 'function') {
    try {
      const candidateApp = path.join(electronApp.getAppPath(), relativePath);
      if (fs.existsSync(candidateApp)) {
        return candidateApp;
      }
    } catch {
      // ignore
    }
  }

  // Check current working directory
  const cwdPath = path.resolve(process.cwd(), relativePath);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  // Fallback relative to __dirname
  try {
    const dirnameFallback = path.resolve(__dirname, '../../../../', relativePath);
    if (fs.existsSync(dirnameFallback)) {
      return dirnameFallback;
    }
  } catch {
    // ignore
  }

  return cwdPath;
}

export function loadCharacters(): CharacterData[] {
  if (cachedCharacters) {
    return cachedCharacters;
  }

  const jsonPath = getResourcePath('data/characters.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`[DeckLoader] Characters JSON not found at: ${jsonPath}`);
    return [];
  }

  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    cachedCharacters = JSON.parse(raw) as CharacterData[];
    return cachedCharacters;
  } catch (err) {
    console.error('[DeckLoader] Failed to parse characters.json:', err);
    return [];
  }
}

export function getCharacterById(id: string): CharacterData | undefined {
  const characters = loadCharacters();
  return characters.find((c) => c.id === id);
}

export interface ParsedYdkDeck {
  main: number[];
  extra: number[];
  side: number[];
}

export function parseYdkContent(content: string): ParsedYdkDeck {
  const lines = content.split(/\r?\n/);
  const main: number[] = [];
  const extra: number[] = [];
  const side: number[] = [];

  let currentSection: 'main' | 'extra' | 'side' | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#created')) continue;

    if (trimmed === '#main') {
      currentSection = 'main';
      continue;
    }
    if (trimmed === '#extra') {
      currentSection = 'extra';
      continue;
    }
    if (trimmed === '!side') {
      currentSection = 'side';
      continue;
    }

    const cardId = parseInt(trimmed, 10);
    if (!Number.isNaN(cardId) && cardId > 0) {
      if (currentSection === 'main') {
        main.push(cardId);
      } else if (currentSection === 'extra') {
        extra.push(cardId);
      } else if (currentSection === 'side') {
        side.push(cardId);
      }
    }
  }

  return { main, extra, side };
}

export function loadYdkFile(ydkRelativePath: string): ParsedYdkDeck {
  const fullPath = getResourcePath(ydkRelativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`YDK deck file not found: ${fullPath}`);
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  return parseYdkContent(content);
}

export interface RandomCharacterDeckResult {
  character: CharacterData;
  deck: CharacterDeckData;
  deckIndex: number; // 0, 1, 2
}

export function getRandomDeckForCharacter(
  characterId: string,
): RandomCharacterDeckResult | undefined {
  const character = getCharacterById(characterId);
  if (!character || character.decks.length === 0) {
    return undefined;
  }

  const deckIndex = Math.floor(Math.random() * character.decks.length);
  const deck = character.decks[deckIndex];
  return { character, deck, deckIndex };
}
