import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, } from '../shared/types/ipc.js';
const duelAPI = {
    newDuel: (options) => {
        const plainOptions = JSON.parse(JSON.stringify(options));
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_NEW, plainOptions);
    },
    sendCommand: (response) => {
        const plainResponse = JSON.parse(JSON.stringify(response));
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_COMMAND, plainResponse);
    },
    step: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_STEP);
    },
    setAutoPlay: (autoPlay) => {
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_SET_AUTOPLAY, autoPlay);
    },
    getState: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_STATE);
    },
    getBoardState: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_BOARD);
    },
    getCardName: (code) => {
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_GET_CARD_NAME, code);
    },
    onEvent: (callback) => {
        const handler = (_e, event) => callback(event);
        ipcRenderer.on(IPC_CHANNELS.DUEL_EVENT, handler);
        return () => {
            ipcRenderer.removeListener(IPC_CHANNELS.DUEL_EVENT, handler);
        };
    },
    playVideo: (callback) => {
        const handler = (_e, video) => callback(video);
        ipcRenderer.on(IPC_CHANNELS.DUEL_PLAY_VIDEO, handler);
        return () => {
            ipcRenderer.removeListener(IPC_CHANNELS.DUEL_PLAY_VIDEO, handler);
        };
    },
    notifyVideoFinished: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DUEL_VIDEO_FINISHED);
    },
};
const deckAPI = {
    getAllCards: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_GET_ALL_CARDS);
    },
    getCustomDecks: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_GET_CUSTOM_DECKS);
    },
    saveCustomDeck: (deck) => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_SAVE_CUSTOM_DECK, deck);
    },
    deleteCustomDeck: (deckId) => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_DELETE_CUSTOM_DECK, deckId);
    },
    getActiveDeckId: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_GET_ACTIVE_ID);
    },
    setActiveDeckId: (deckId) => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_SET_ACTIVE_ID, deckId);
    },
    listDecks: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_LIST);
    },
    saveDeck: (deckName, deckData) => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_SAVE, deckName, deckData);
    },
    deleteDeck: (deckName) => {
        return ipcRenderer.invoke(IPC_CHANNELS.DECK_DELETE, deckName);
    },
};
const settingsAPI = {
    getSettings: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET);
    },
    saveSettings: (settings) => {
        return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings);
    },
    getCharacters: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.CHARACTERS_GET);
    },
    getRandomOpponentDeck: (characterId) => {
        return ipcRenderer.invoke(IPC_CHANNELS.CHARACTERS_GET_RANDOM_DECK, characterId);
    },
};
const appAPI = {
    getVersion: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
    },
    initEngine: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.APP_INIT_ENGINE);
    },
    getInitStatus: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_INIT_STATUS);
    },
    exitApp: () => {
        return ipcRenderer.invoke(IPC_CHANNELS.APP_EXIT);
    },
    platform: process.platform,
};
contextBridge.exposeInMainWorld('duelAPI', duelAPI);
contextBridge.exposeInMainWorld('deckAPI', deckAPI);
contextBridge.exposeInMainWorld('settingsAPI', settingsAPI);
contextBridge.exposeInMainWorld('appAPI', appAPI);
