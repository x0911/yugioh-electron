import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
let cachedCharacters = null;
export function getResourcePath(relativePath) {
    const isPackaged = app ? app.isPackaged : false;
    if (isPackaged) {
        // In packaged app, extraResources maps resources/ to process.resourcesPath
        const candidateResource = path.join(process.resourcesPath, relativePath);
        if (fs.existsSync(candidateResource)) {
            return candidateResource;
        }
        // Check app path for data/
        const candidateApp = path.join(app.getAppPath(), relativePath);
        if (fs.existsSync(candidateApp)) {
            return candidateApp;
        }
    }
    return path.resolve(process.cwd(), relativePath);
}
export function loadCharacters() {
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
        cachedCharacters = JSON.parse(raw);
        return cachedCharacters;
    }
    catch (err) {
        console.error('[DeckLoader] Failed to parse characters.json:', err);
        return [];
    }
}
export function getCharacterById(id) {
    const characters = loadCharacters();
    return characters.find((c) => c.id === id);
}
export function parseYdkContent(content) {
    const lines = content.split(/\r?\n/);
    const main = [];
    const extra = [];
    const side = [];
    let currentSection = null;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#created'))
            continue;
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
            }
            else if (currentSection === 'extra') {
                extra.push(cardId);
            }
            else if (currentSection === 'side') {
                side.push(cardId);
            }
        }
    }
    return { main, extra, side };
}
export function loadYdkFile(ydkRelativePath) {
    const fullPath = getResourcePath(ydkRelativePath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`YDK deck file not found: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return parseYdkContent(content);
}
export function getRandomDeckForCharacter(characterId) {
    const character = getCharacterById(characterId);
    if (!character || character.decks.length === 0) {
        return undefined;
    }
    const deckIndex = Math.floor(Math.random() * character.decks.length);
    const deck = character.decks[deckIndex];
    return { character, deck, deckIndex };
}
