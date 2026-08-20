// =============================================================================
// IPC Channel Names and Interface Definitions
// =============================================================================
export const IPC_CHANNELS = {
    // App
    APP_GET_VERSION: 'app:get-version',
    APP_INIT_ENGINE: 'app:init-engine',
    APP_GET_INIT_STATUS: 'app:get-init-status',
    APP_EXIT: 'app:exit',
    // Duel
    DUEL_NEW: 'duel:new',
    DUEL_COMMAND: 'duel:command',
    DUEL_EVENT: 'duel:event',
    DUEL_GET_STATE: 'duel:get-state',
    DUEL_GET_BOARD: 'duel:get-board',
    DUEL_STEP: 'duel:step',
    DUEL_SET_AUTOPLAY: 'duel:set-autoplay',
    DUEL_GET_CARD_NAME: 'duel:get-card-name',
    DUEL_PLAY_VIDEO: 'duel:play-video',
    DUEL_VIDEO_FINISHED: 'duel:video-finished',
    // Deck & Card Pool (Phase 7)
    DECK_GET_ALL_CARDS: 'deck:get-all-cards',
    DECK_GET_CUSTOM_DECKS: 'deck:get-custom-decks',
    DECK_SAVE_CUSTOM_DECK: 'deck:save-custom-deck',
    DECK_DELETE_CUSTOM_DECK: 'deck:delete-custom-deck',
    DECK_GET_ACTIVE_ID: 'deck:get-active-id',
    DECK_SET_ACTIVE_ID: 'deck:set-active-id',
    DECK_LIST: 'deck:list',
    DECK_SAVE: 'deck:save',
    DECK_DELETE: 'deck:delete',
    // Settings & Characters (Phase 6)
    SETTINGS_GET: 'settings:get',
    SETTINGS_SET: 'settings:set',
    CHARACTERS_GET: 'characters:get',
    CHARACTERS_GET_BY_ID: 'characters:get-by-id',
    CHARACTERS_GET_RANDOM_DECK: 'characters:get-random-deck',
};
