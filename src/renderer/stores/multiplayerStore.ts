import { defineStore } from 'pinia';
import {
  multiplayerService,
  type ConnectionStatus,
  type PlayerProfile,
  type PvpPacket,
  type PvpPacketType,
  type VoiceState,
} from '../services/multiplayer/MultiplayerService.js';
import type { DuelEventPayload, CardVideoPayload } from '../../shared/types/duel.js';

export interface MultiplayerState {
  roomCode: string;
  role: 'host' | 'guest' | 'none';
  status: ConnectionStatus;
  errorMessage: string;

  localPlayer: PlayerProfile;
  remotePlayer: PlayerProfile | null;

  isLocalReady: boolean;
  isRemoteReady: boolean;

  coinChoice: 'heads' | 'tails' | null;
  coinResult: 'heads' | 'tails' | null;
  startingPlayer: 'host' | 'guest' | null;

  voiceState: VoiceState;
  rematchRequested: boolean;
  remoteRematchRequested: boolean;
}

export const useMultiplayerStore = defineStore('multiplayer', {
  state: (): MultiplayerState => ({
    roomCode: '',
    role: 'none',
    status: 'disconnected',
    errorMessage: '',

    localPlayer: {
      name:
        (typeof localStorage !== 'undefined' && localStorage.getItem('yugioh_duelist_name')) ||
        'Duelist',
      avatar: 'yugi',
      deckName: 'Custom Deck',
      deckCards: [],
      extraDeckCards: [],
      series: 'DM',
    },
    remotePlayer: null,

    isLocalReady: false,
    isRemoteReady: false,

    coinChoice: null,
    coinResult: null,
    startingPlayer: null,

    voiceState: { ...multiplayerService.voiceState },
    rematchRequested: false,
    remoteRematchRequested: false,
    onStartDuel: null as ((payload: any) => void) | null,
    onOpponentLeft: null as ((reason: 'surrender' | 'disconnect' | 'left') => void) | null,
  }),

  getters: {
    isConnected: (state) => state.status === 'connected',
    isHost: (state) => state.role === 'host',
    isGuest: (state) => state.role === 'guest',
    bothReady: (state) => state.isLocalReady && state.isRemoteReady,
  },

  actions: {
    init(): void {
      multiplayerService.onStatusChange = (status, msg) => {
        this.status = status;
        if (msg) this.errorMessage = msg;
      };

      multiplayerService.onVoiceChange = (voiceState) => {
        this.voiceState = { ...voiceState };
      };

      multiplayerService.onPacketReceived = (packet) => {
        this.handleIncomingPacket(packet);
      };

      multiplayerService.onOpponentLeft = (reason) => {
        if (this.onOpponentLeft) {
          this.onOpponentLeft(reason);
        }
      };
    },

    setLocalProfile(profile: Partial<PlayerProfile>): void {
      this.localPlayer = { ...this.localPlayer, ...profile };
      if (profile.name && typeof localStorage !== 'undefined') {
        localStorage.setItem('yugioh_duelist_name', profile.name);
      }
      if (this.isConnected) {
        this.broadcastProfile();
      }
    },

    async hostGame(customCode?: string): Promise<string> {
      this.init();
      this.errorMessage = '';
      this.remotePlayer = null;
      this.isLocalReady = false;
      this.isRemoteReady = false;
      this.rematchRequested = false;
      this.remoteRematchRequested = false;

      try {
        const code = await multiplayerService.hostRoom(customCode);
        this.roomCode = code;
        this.role = 'host';
        return code;
      } catch (err: unknown) {
        this.errorMessage = err instanceof Error ? err.message : String(err);
        throw err;
      }
    },

    async joinGame(code: string): Promise<boolean> {
      this.init();
      this.errorMessage = '';
      this.remotePlayer = null;
      this.isLocalReady = false;
      this.isRemoteReady = false;
      this.rematchRequested = false;
      this.remoteRematchRequested = false;

      try {
        const success = await multiplayerService.joinRoom(code);
        this.roomCode = code;
        this.role = 'guest';

        // Send handshake profile to host
        this.broadcastProfile();
        return success;
      } catch (err: unknown) {
        this.errorMessage = err instanceof Error ? err.message : String(err);
        throw err;
      }
    },

    broadcastProfile(): void {
      multiplayerService.sendPacket('HANDSHAKE', {
        profile: this.localPlayer,
        isReady: this.isLocalReady,
      });
    },

    toggleReady(): void {
      this.isLocalReady = !this.isLocalReady;
      multiplayerService.sendPacket('READY_TOGGLE', {
        isReady: this.isLocalReady,
      });
    },

    sendCoinToss(choice: 'heads' | 'tails'): void {
      this.coinChoice = choice;
      const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
      this.coinResult = result;
      const userWon = choice === result;
      this.startingPlayer = userWon ? (this.isHost ? 'host' : 'guest') : (this.isHost ? 'guest' : 'host');

      multiplayerService.sendPacket('COIN_TOSS_RESULT', {
        choice,
        result,
        startingPlayer: this.startingPlayer,
      });
    },

    sendPacket<T = unknown>(type: PvpPacketType, payload: T): boolean {
      return multiplayerService.sendPacket(type, payload);
    },

    sendStartDuel(payload: { startingPlayer: number; hostDeckName: string; guestDeckName: string }): void {
      multiplayerService.sendPacket('START_DUEL', payload);
    },

    sendDuelEvent(event: DuelEventPayload): void {
      multiplayerService.sendPacket('DUEL_EVENT', event);
    },

    sendDuelPrompt(prompt: unknown): void {
      multiplayerService.sendPacket('DUEL_PROMPT', prompt);
    },

    sendDuelResponse(response: unknown): void {
      multiplayerService.sendPacket('DUEL_RESPONSE', response);
    },

    sendVideoTrigger(payload: CardVideoPayload): void {
      multiplayerService.sendPacket('VIDEO_TRIGGER', payload);
    },

    sendVideoFinished(): void {
      multiplayerService.sendPacket('VIDEO_FINISHED', {});
    },

    requestRematch(): void {
      this.rematchRequested = true;
      multiplayerService.sendPacket('REMATCH_REQUEST', {});
    },

    acceptRematch(): void {
      this.rematchRequested = true;
      multiplayerService.sendPacket('REMATCH_ACCEPT', {});
    },

    sendSurrender(reason: 'surrender' | 'left' | 'disconnect' = 'surrender'): void {
      multiplayerService.sendPacket('SURRENDER', {
        player: this.localPlayer?.name,
        reason,
      });
    },

    async toggleVoiceChat(): Promise<boolean> {
      if (this.voiceState.enabled) {
        multiplayerService.leaveVoiceChat();
        return false;
      } else {
        return multiplayerService.joinVoiceChat();
      }
    },

    setMuted(muted: boolean): void {
      multiplayerService.setMuted(muted);
    },

    setDeafened(deafened: boolean): void {
      multiplayerService.setDeafened(deafened);
    },

    setVolume(volume: number): void {
      multiplayerService.setVolume(volume);
    },

    disconnect(): void {
      this.leaveRoom();
    },

    leaveRoom(): void {
      multiplayerService.disconnect();
      this.role = 'none';
      this.roomCode = '';
      this.status = 'disconnected';
      this.remotePlayer = null;
      this.isLocalReady = false;
      this.isRemoteReady = false;
      this.rematchRequested = false;
      this.remoteRematchRequested = false;
    },

    handleIncomingPacket(packet: PvpPacket): void {
      switch (packet.type) {
        case 'HANDSHAKE': {
          const data = packet.payload as { profile: PlayerProfile; isReady: boolean };
          this.remotePlayer = data.profile;
          this.isRemoteReady = data.isReady;

          // If we are host and received guest handshake, send back our profile ACK
          if (this.isHost) {
            multiplayerService.sendPacket('HANDSHAKE_ACK', {
              profile: this.localPlayer,
              isReady: this.isLocalReady,
            });
          }
          break;
        }

        case 'HANDSHAKE_ACK': {
          const data = packet.payload as { profile: PlayerProfile; isReady: boolean };
          this.remotePlayer = data.profile;
          this.isRemoteReady = data.isReady;
          break;
        }

        case 'READY_TOGGLE': {
          const data = packet.payload as { isReady: boolean };
          this.isRemoteReady = data.isReady;
          break;
        }

        case 'COIN_TOSS_RESULT': {
          const data = packet.payload as {
            choice: 'heads' | 'tails';
            result: 'heads' | 'tails';
            startingPlayer: 'host' | 'guest';
          };
          this.coinResult = data.result;
          this.startingPlayer = data.startingPlayer;
          break;
        }

        case 'REMATCH_REQUEST': {
          this.remoteRematchRequested = true;
          break;
        }

        case 'REMATCH_ACCEPT': {
          this.remoteRematchRequested = true;
          this.rematchRequested = true;
          break;
        }

        case 'START_DUEL': {
          const data = packet.payload as {
            startingPlayer: number;
            hostDeckName: string;
            guestDeckName: string;
          };
          if (this.onStartDuel) {
            this.onStartDuel(data);
          }
          break;
        }

        case 'SURRENDER': {
          const reason = (packet.payload as any)?.reason || 'surrender';
          if (this.onOpponentLeft) {
            this.onOpponentLeft(reason === 'disconnect' ? 'disconnect' : 'surrender');
          }
          break;
        }

        default:
          // Game-specific duel packets will be handled by DuelStore listeners
          break;
      }
    },
  },
});
