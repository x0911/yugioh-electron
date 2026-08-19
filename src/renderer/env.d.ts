/// <reference types="vite/client" />
import type { DuelAPI, DeckAPI, SettingsAPI, AppAPI } from '../shared/types/ipc';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare global {
  interface Window {
    duelAPI: DuelAPI;
    deckAPI: DeckAPI;
    settingsAPI: SettingsAPI;
    appAPI: AppAPI;
  }
}
