import fs from 'node:fs';
import path from 'node:path';
import Store from 'electron-store';
export const defaultSettings = {
    bgmVolume: 80,
    sfxVolume: 100,
    selectedOpponentId: 'yugi-muto',
    selectedSeriesFilter: 'ALL',
    devMode: true,
    skipPreDuelVideo: false,
};
function loadAllPrebuiltDecks() {
    try {
        const jsonPath = path.resolve(process.cwd(), 'data/prebuilt-decks.json');
        if (fs.existsSync(jsonPath)) {
            const list = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            const map = {};
            for (const deck of list) {
                map[deck.id] = deck;
            }
            return map;
        }
    }
    catch (err) {
        console.warn('[store] Failed to load prebuilt-decks.json:', err);
    }
    return {};
}
export const defaultStarterDecks = loadAllPrebuiltDecks();
export const appStore = new Store({
    name: 'yugioh-desktop-settings',
    defaults: {
        settings: defaultSettings,
        customDecks: defaultStarterDecks,
        activeDeckId: 'yugi_deck_1',
    },
});
export function getPersistedSettings() {
    const current = appStore.get('settings');
    return { ...defaultSettings, ...(current || {}) };
}
export function savePersistedSettings(settings) {
    const current = getPersistedSettings();
    const updated = { ...current, ...settings };
    appStore.set('settings', updated);
    return updated;
}
export function getPersistedCustomDecks() {
    const decksMap = appStore.get('customDecks') || {};
    const prebuilt = defaultStarterDecks;
    let hasMissingPrebuilt = false;
    // Merge any missing prebuilt decks into store so user gets all 80 decks
    for (const [id, deck] of Object.entries(prebuilt)) {
        if (!decksMap[id]) {
            decksMap[id] = deck;
            hasMissingPrebuilt = true;
        }
    }
    if (hasMissingPrebuilt || Object.keys(decksMap).length === 0) {
        appStore.set('customDecks', decksMap);
    }
    return Object.values(decksMap);
}
export function savePersistedCustomDeck(deck) {
    const decksMap = appStore.get('customDecks') || {};
    const updatedDeck = {
        ...deck,
        updatedAt: Date.now(),
        createdAt: deck.createdAt || Date.now(),
    };
    decksMap[deck.id] = updatedDeck;
    appStore.set('customDecks', decksMap);
    return updatedDeck;
}
export function deletePersistedCustomDeck(deckId) {
    const decksMap = appStore.get('customDecks') || {};
    if (decksMap[deckId]) {
        delete decksMap[deckId];
        appStore.set('customDecks', decksMap);
        return true;
    }
    return false;
}
export function getPersistedActiveDeckId() {
    return appStore.get('activeDeckId') || 'yugi_deck_1';
}
export function savePersistedActiveDeckId(deckId) {
    appStore.set('activeDeckId', deckId);
    return deckId;
}
