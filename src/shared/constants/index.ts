export const APP_CONFIG = {
  TITLE: 'Yu-Gi-Oh! Desktop Duel',
  MIN_WIDTH: 1280,
  MIN_HEIGHT: 800,
  DEFAULT_WIDTH: 1600,
  DEFAULT_HEIGHT: 900,
} as const;

export const ROUTES = {
  LOADING: '/',
  MAIN_MENU: '/main-menu',
  SETTINGS: '/settings',
  DECK_EDIT: '/deck-edit',
  COIN_TOSS: '/coin-toss',
  PRE_DUEL_VIDEO: '/pre-duel-video',
  DUEL: '/duel',
} as const;
