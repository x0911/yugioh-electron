import peerPkg, { type DataConnection, type MediaConnection, type Peer } from 'peerjs';
const PeerConstructor: typeof Peer = (peerPkg as any)?.Peer || (peerPkg as any)?.default?.Peer || (peerPkg as any)?.default || peerPkg;
import type { DuelEventPayload, CardVideoPayload } from '../../../shared/types/duel.js';

export type PvpPacketType =
  | 'HANDSHAKE'
  | 'HANDSHAKE_ACK'
  | 'READY_TOGGLE'
  | 'COIN_TOSS_REQUEST'
  | 'COIN_TOSS_RESULT'
  | 'START_DUEL'
  | 'DUEL_EVENT'
  | 'DUEL_PROMPT'
  | 'DUEL_RESPONSE'
  | 'VIDEO_TRIGGER'
  | 'VIDEO_FINISHED'
  | 'REMATCH_REQUEST'
  | 'REMATCH_ACCEPT'
  | 'SURRENDER'
  | 'VOICE_STATUS';

export interface PlayerProfile {
  name: string;
  avatar: string;
  deckName: string;
  deckCards: number[];
  extraDeckCards?: number[];
  series?: 'DM' | 'GX';
}

export interface PvpPacket<T = unknown> {
  type: PvpPacketType;
  payload: T;
  timestamp: number;
}

export interface VoiceState {
  enabled: boolean;
  connected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  isRemoteSpeaking: boolean;
  volume: number; // 0.0 to 1.0
  hasPermission: boolean;
}

export type ConnectionStatus =
  | 'disconnected'
  | 'generating_room'
  | 'waiting_for_guest'
  | 'connecting'
  | 'connected'
  | 'error';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

export class MultiplayerService {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private mediaConnection: MediaConnection | null = null;

  public role: 'host' | 'guest' | 'none' = 'none';
  public roomCode: string = '';
  public status: ConnectionStatus = 'disconnected';
  public errorMessage: string = '';

  // Local & Remote Voice
  private localAudioStream: MediaStream | null = null;
  private remoteAudioStream: MediaStream | null = null;
  private remoteAudioElement: HTMLAudioElement | null = null;
  private localAudioContext: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private remoteAudioContext: AudioContext | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private audioMonitorInterval: number | null = null;

  public voiceState: VoiceState = {
    enabled: false,
    connected: false,
    isMuted: false,
    isDeafened: false,
    isSpeaking: false,
    isRemoteSpeaking: false,
    volume: 1.0,
    hasPermission: false,
  };

  // Event callbacks
  public onStatusChange?: (status: ConnectionStatus, message?: string) => void;
  public onPacketReceived?: (packet: PvpPacket) => void;
  public onVoiceChange?: (state: VoiceState) => void;

  /**
   * Generates a 4-digit room code between 1000 and 9999
   */
  public generateRoomCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private getPeerIdFromRoomCode(code: string): string {
    return `ygo-arena-${code}`;
  }

  /**
   * Host a game room with a 4-digit code
   */
  public async hostRoom(customCode?: string): Promise<string> {
    this.disconnect();
    this.role = 'host';
    this.roomCode = customCode || this.generateRoomCode();
    const peerId = this.getPeerIdFromRoomCode(this.roomCode);

    this.setStatus('generating_room');

    return new Promise<string>((resolve, reject) => {
      try {
        this.peer = new PeerConstructor(peerId, {
          config: { iceServers: ICE_SERVERS },
          debug: 1,
        });

        this.peer.on('open', (id) => {
          console.log(`[MultiplayerService] Host room opened with Peer ID: ${id} (Code: ${this.roomCode})`);
          this.setStatus('waiting_for_guest');
          resolve(this.roomCode);
        });

        this.peer.on('connection', (conn) => {
          console.log(`[MultiplayerService] Remote guest connecting: ${conn.peer}`);
          this.setupDataConnection(conn);
        });

        this.peer.on('call', (call) => {
          console.log(`[MultiplayerService] Incoming voice call from: ${call.peer}`);
          this.handleIncomingCall(call);
        });

        this.peer.on('error', (err) => {
          console.error('[MultiplayerService] Peer error:', err);
          this.errorMessage = err.message || 'Room setup failed';
          this.setStatus('error', this.errorMessage);
          reject(err);
        });
      } catch (err) {
        console.error('[MultiplayerService] Host room creation failed:', err);
        this.setStatus('error', String(err));
        reject(err);
      }
    });
  }

  /**
   * Join an existing room via 4-digit code
   */
  public async joinRoom(code: string): Promise<boolean> {
    this.disconnect();
    this.role = 'guest';
    this.roomCode = code.trim();
    const hostPeerId = this.getPeerIdFromRoomCode(this.roomCode);

    this.setStatus('connecting');

    return new Promise<boolean>((resolve, reject) => {
      try {
        this.peer = new PeerConstructor({
          config: { iceServers: ICE_SERVERS },
          debug: 1,
        });

        this.peer.on('open', (myId) => {
          console.log(`[MultiplayerService] Guest Peer open with ID: ${myId}. Connecting to host: ${hostPeerId}`);
          if (!this.peer) return;

          const conn = this.peer.connect(hostPeerId, {
            reliable: true,
          });

          this.setupDataConnection(conn);

          conn.on('open', () => {
            console.log('[MultiplayerService] Data connection successfully established with host!');
            this.setStatus('connected');
            resolve(true);
          });
        });

        this.peer.on('call', (call) => {
          this.handleIncomingCall(call);
        });

        this.peer.on('error', (err) => {
          console.error('[MultiplayerService] Join room failed:', err);
          this.errorMessage = err.type === 'peer-unavailable'
            ? `Room ${this.roomCode} was not found. Please verify the 4-digit code.`
            : (err.message || 'Connection error');
          this.setStatus('error', this.errorMessage);
          reject(new Error(this.errorMessage));
        });
      } catch (err) {
        console.error('[MultiplayerService] Join room error:', err);
        this.setStatus('error', String(err));
        reject(err);
      }
    });
  }

  private setupDataConnection(conn: DataConnection): void {
    this.connection = conn;

    conn.on('open', () => {
      console.log('[MultiplayerService] DataChannel opened.');
      this.setStatus('connected');

      // If local voice was already active before connecting, initiate voice call
      if (this.voiceState.enabled && this.localAudioStream && this.peer) {
        this.callPeerVoice(conn.peer);
      }
    });

    conn.on('data', (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'type' in data) {
        const packet = data as PvpPacket;
        if (this.onPacketReceived) {
          this.onPacketReceived(packet);
        }
      }
    });

    conn.on('close', () => {
      console.log('[MultiplayerService] Data connection closed by remote peer.');
      this.setStatus('disconnected', 'Opponent disconnected.');
      this.leaveVoiceChat();
    });

    conn.on('error', (err) => {
      console.error('[MultiplayerService] Data connection error:', err);
      this.setStatus('error', err.message || 'DataChannel error');
    });
  }

  /**
   * Send a type-safe packet across the WebRTC DataChannel
   */
  public sendPacket<T = unknown>(type: PvpPacketType, payload: T): boolean {
    if (!this.connection || !this.connection.open) {
      console.warn('[MultiplayerService] Cannot send packet: connection not open.');
      return false;
    }

    try {
      const cleanPayload = payload !== undefined ? JSON.parse(JSON.stringify(payload)) : undefined;
      const packet: PvpPacket<T> = {
        type,
        payload: cleanPayload,
        timestamp: Date.now(),
      };
      this.connection.send(packet);
      return true;
    } catch (err) {
      console.error('[MultiplayerService] Failed to send packet:', err);
      return false;
    }
  }

  // ===========================================================================
  // WebRTC Voice Chat Implementation
  // ===========================================================================

  /**
   * Start microphone capture and join voice chat
   */
  public async joinVoiceChat(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.warn('[MultiplayerService] WebRTC getUserMedia not supported in this environment.');
      return false;
    }

    try {
      this.localAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.voiceState.hasPermission = true;
      this.voiceState.enabled = true;
      this.voiceState.isMuted = false;

      this.setupLocalAudioAnalyser();

      // If already connected to peer, initiate voice call
      if (this.connection && this.connection.open && this.peer) {
        this.callPeerVoice(this.connection.peer);
      }

      this.notifyVoiceChange();
      this.startAudioMonitoring();
      return true;
    } catch (err) {
      console.error('[MultiplayerService] Failed to acquire microphone access:', err);
      this.voiceState.hasPermission = false;
      this.voiceState.enabled = false;
      this.notifyVoiceChange();
      return false;
    }
  }

  private callPeerVoice(remotePeerId: string): void {
    if (!this.peer || !this.localAudioStream) return;
    try {
      console.log(`[MultiplayerService] Calling peer for voice chat: ${remotePeerId}`);
      const call = this.peer.call(remotePeerId, this.localAudioStream);
      this.mediaConnection = call;

      call.on('stream', (remoteStream) => {
        console.log('[MultiplayerService] Received remote audio stream!');
        this.attachRemoteAudio(remoteStream);
      });

      call.on('close', () => {
        this.detachRemoteAudio();
      });

      call.on('error', (err) => {
        console.error('[MultiplayerService] MediaConnection error:', err);
      });
    } catch (err) {
      console.error('[MultiplayerService] Error establishing audio call:', err);
    }
  }

  private handleIncomingCall(call: MediaConnection): void {
    this.mediaConnection = call;
    console.log('[MultiplayerService] Answering incoming voice call.');

    if (this.localAudioStream) {
      call.answer(this.localAudioStream);
    } else {
      // Answer without microphone if user is only listening
      call.answer();
    }

    call.on('stream', (remoteStream) => {
      console.log('[MultiplayerService] Remote audio stream connected from call!');
      this.attachRemoteAudio(remoteStream);
    });

    call.on('close', () => {
      this.detachRemoteAudio();
    });
  }

  private attachRemoteAudio(stream: MediaStream): void {
    this.remoteAudioStream = stream;
    if (!this.remoteAudioElement) {
      this.remoteAudioElement = new Audio();
      this.remoteAudioElement.autoplay = true;
    }
    this.remoteAudioElement.srcObject = stream;
    this.remoteAudioElement.volume = this.voiceState.isDeafened ? 0 : this.voiceState.volume;
    this.remoteAudioElement.play().catch(() => {});

    this.setupRemoteAudioAnalyser(stream);
    this.voiceState.connected = true;
    this.notifyVoiceChange();
  }

  private detachRemoteAudio(): void {
    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = null;
    }
    this.remoteAudioStream = null;
    this.voiceState.connected = false;
    this.voiceState.isRemoteSpeaking = false;
    this.notifyVoiceChange();
  }

  public leaveVoiceChat(): void {
    if (this.audioMonitorInterval) {
      window.clearInterval(this.audioMonitorInterval);
      this.audioMonitorInterval = null;
    }

    if (this.localAudioStream) {
      this.localAudioStream.getTracks().forEach((track) => track.stop());
      this.localAudioStream = null;
    }

    if (this.mediaConnection) {
      this.mediaConnection.close();
      this.mediaConnection = null;
    }

    this.detachRemoteAudio();

    if (this.localAudioContext && this.localAudioContext.state !== 'closed') {
      this.localAudioContext.close().catch(() => {});
      this.localAudioContext = null;
    }
    if (this.remoteAudioContext && this.remoteAudioContext.state !== 'closed') {
      this.remoteAudioContext.close().catch(() => {});
      this.remoteAudioContext = null;
    }

    this.voiceState.enabled = false;
    this.voiceState.connected = false;
    this.voiceState.isSpeaking = false;
    this.voiceState.isRemoteSpeaking = false;
    this.notifyVoiceChange();
  }

  public setMuted(muted: boolean): void {
    this.voiceState.isMuted = muted;
    if (this.localAudioStream) {
      this.localAudioStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
    this.notifyVoiceChange();
  }

  public setDeafened(deafened: boolean): void {
    this.voiceState.isDeafened = deafened;
    if (this.remoteAudioElement) {
      this.remoteAudioElement.volume = deafened ? 0 : this.voiceState.volume;
    }
    this.notifyVoiceChange();
  }

  public setVolume(volume: number): void {
    this.voiceState.volume = Math.max(0, Math.min(1, volume));
    if (this.remoteAudioElement && !this.voiceState.isDeafened) {
      this.remoteAudioElement.volume = this.voiceState.volume;
    }
    this.notifyVoiceChange();
  }

  private setupLocalAudioAnalyser(): void {
    if (!this.localAudioStream) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.localAudioContext = new AudioContextClass();
      const source = this.localAudioContext.createMediaStreamSource(this.localAudioStream);
      this.localAnalyser = this.localAudioContext.createAnalyser();
      this.localAnalyser.fftSize = 256;
      source.connect(this.localAnalyser);
    } catch (e) {
      console.warn('[MultiplayerService] AudioContext analyser init failed:', e);
    }
  }

  private setupRemoteAudioAnalyser(stream: MediaStream): void {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.remoteAudioContext = new AudioContextClass();
      const source = this.remoteAudioContext.createMediaStreamSource(stream);
      this.remoteAnalyser = this.remoteAudioContext.createAnalyser();
      this.remoteAnalyser.fftSize = 256;
      source.connect(this.remoteAnalyser);
    } catch (e) {
      console.warn('[MultiplayerService] Remote analyser init failed:', e);
    }
  }

  private startAudioMonitoring(): void {
    if (this.audioMonitorInterval) return;

    this.audioMonitorInterval = window.setInterval(() => {
      // Local voice level
      if (this.localAnalyser && !this.voiceState.isMuted) {
        const dataArray = new Uint8Array(this.localAnalyser.frequencyBinCount);
        this.localAnalyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, v) => acc + v, 0);
        const avg = sum / dataArray.length;
        const speaking = avg > 18;
        if (this.voiceState.isSpeaking !== speaking) {
          this.voiceState.isSpeaking = speaking;
          this.notifyVoiceChange();
        }
      }

      // Remote voice level
      if (this.remoteAnalyser && !this.voiceState.isDeafened) {
        const dataArray = new Uint8Array(this.remoteAnalyser.frequencyBinCount);
        this.remoteAnalyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, v) => acc + v, 0);
        const avg = sum / dataArray.length;
        const speaking = avg > 18;
        if (this.voiceState.isRemoteSpeaking !== speaking) {
          this.voiceState.isRemoteSpeaking = speaking;
          this.notifyVoiceChange();
        }
      }
    }, 120);
  }

  private notifyVoiceChange(): void {
    if (this.onVoiceChange) {
      this.onVoiceChange({ ...this.voiceState });
    }
  }

  private setStatus(status: ConnectionStatus, message?: string): void {
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status, message);
    }
  }

  public disconnect(): void {
    this.leaveVoiceChat();

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.role = 'none';
    this.roomCode = '';
    this.setStatus('disconnected');
  }
}

export const multiplayerService = new MultiplayerService();
