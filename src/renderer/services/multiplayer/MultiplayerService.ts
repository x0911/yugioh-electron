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
  | 'DISCONNECT'
  | 'VOICE_STATUS'
  | 'VOICE_SIGNAL';

export interface VoiceSignalPayload {
  action: 'joined' | 'left' | 'mute';
  isMuted?: boolean;
}

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

export const DEFAULT_ICE_SERVERS: { urls: string | string[]; username?: string; credential?: string }[] = [
  // Google Global STUN Cluster
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  // Cloudflare STUN
  { urls: 'stun:stun.cloudflare.com:3478' },
  // Twilio Global STUN
  { urls: 'stun:global.stun.twilio.com:3478' },
  // Open Relay Project / Metered Free STUN
  { urls: 'stun:openrelay.metered.ca:80' },
  { urls: 'stun:global.relay.metered.ca:80' },
];

export function getEffectiveIceServers(): { urls: string | string[]; username?: string; credential?: string }[] {
  const servers = [...DEFAULT_ICE_SERVERS];
  if (typeof localStorage !== 'undefined') {
    try {
      const customJson = localStorage.getItem('yugioh_custom_ice_servers');
      if (customJson) {
        const parsed = JSON.parse(customJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Prepend user-configured custom TURN/STUN servers to prioritize them
          servers.unshift(...parsed);
        }
      }
    } catch (e) {
      console.warn('[MultiplayerService] Failed to parse custom ICE servers from storage:', e);
    }
  }
  return servers;
}

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
  private remoteGainNode: GainNode | null = null;
  private audioMonitorInterval: number | null = null;
  public remoteVoiceActive: boolean = false;

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
  public onVoiceSignal?: (payload: VoiceSignalPayload) => void;
  public onOpponentLeft?: (reason: 'surrender' | 'disconnect' | 'left') => void;

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

    this.setStatus('generating_room', 'Registering duel room with signaling broker...');

    return new Promise<string>((resolve, reject) => {
      try {
        const iceServers = getEffectiveIceServers();
        this.peer = new PeerConstructor(peerId, {
          config: { iceServers },
          debug: 1,
        });

        this.peer.on('open', (id) => {
          console.log(`[MultiplayerService] Host room opened with Peer ID: ${id} (Code: ${this.roomCode})`);
          this.setStatus('waiting_for_guest');
          resolve(this.roomCode);
        });

        this.peer.on('connection', (conn) => {
          console.log(`[MultiplayerService] Remote guest connecting: ${conn.peer}`);
          this.setStatus('connecting', 'Challenger detected! Negotiating direct duel channel...');

          // 22-second watchdog on host for incoming guest connection
          let hostGuestTimeout: NodeJS.Timeout | null = setTimeout(() => {
            if (this.status === 'connecting') {
              console.warn(`[MultiplayerService] Guest connection attempt (${conn.peer}) timed out.`);
              conn.close();
              this.setStatus(
                'waiting_for_guest',
                'Connection attempt from guest timed out before opening. Still waiting for opponent...',
              );
            }
          }, 22000);

          this.setupDataConnection(conn, () => {
            if (hostGuestTimeout) {
              clearTimeout(hostGuestTimeout);
              hostGuestTimeout = null;
            }
          });
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

    this.setStatus('connecting', 'Locating duel room on signaling network...');

    return new Promise<boolean>((resolve, reject) => {
      let isResolved = false;
      let connectionTimeout: NodeJS.Timeout | null = null;

      const cleanupTimeout = () => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
      };

      // 25-second connection watchdog
      connectionTimeout = setTimeout(() => {
        if (!isResolved && this.status !== 'connected') {
          isResolved = true;
          const msg = `Connection to room ${this.roomCode} timed out after 25s. Direct P2P link could not be established between networks (firewall/NAT).`;
          console.warn(`[MultiplayerService] ${msg}`);
          this.errorMessage = msg;
          this.setStatus('error', msg);
          this.disconnect();
          reject(new Error(msg));
        }
      }, 25000);

      try {
        const iceServers = getEffectiveIceServers();
        this.peer = new PeerConstructor({
          config: { iceServers },
          debug: 1,
        });

        this.peer.on('open', (myId) => {
          console.log(`[MultiplayerService] Guest Peer open with ID: ${myId}. Connecting to host: ${hostPeerId}`);
          if (!this.peer) return;

          this.setStatus('connecting', 'Room found! Exchanging secure WebRTC handshake with Host...');

          const conn = this.peer.connect(hostPeerId, {
            reliable: true,
            serialization: 'json',
          });

          this.setupDataConnection(conn, () => {
            if (!isResolved) {
              isResolved = true;
              cleanupTimeout();
              console.log('[MultiplayerService] Data connection successfully established with host!');
              this.setStatus('connected');
              resolve(true);
            }
          });
        });

        this.peer.on('call', (call) => {
          this.handleIncomingCall(call);
        });

        this.peer.on('error', (err) => {
          console.error('[MultiplayerService] Join room failed:', err);
          cleanupTimeout();
          if (!isResolved) {
            isResolved = true;
            this.errorMessage = err.type === 'peer-unavailable'
              ? `Room ${this.roomCode} was not found. Please verify the 4-digit code.`
              : (err.message || 'Connection error');
            this.setStatus('error', this.errorMessage);
            reject(new Error(this.errorMessage));
          }
        });
      } catch (err) {
        console.error('[MultiplayerService] Join room error:', err);
        cleanupTimeout();
        if (!isResolved) {
          isResolved = true;
          this.setStatus('error', String(err));
          reject(err);
        }
      }
    });
  }

  private setupDataConnection(conn: DataConnection, onConnectedCallback?: () => void): void {
    this.connection = conn;

    const handleOpen = () => {
      console.log('[MultiplayerService] DataChannel opened.');
      this.setStatus('connected');
      if (onConnectedCallback) {
        onConnectedCallback();
      }

      // If local voice was already active before connecting, inform peer
      if (this.voiceState.enabled && this.localAudioStream) {
        this.sendPacket('VOICE_SIGNAL', { action: 'joined', isMuted: this.voiceState.isMuted });
        if (this.role === 'host' && this.remoteVoiceActive && this.peer) {
          this.callPeerVoice(conn.peer);
        }
      }
    };

    if (conn.open) {
      handleOpen();
    } else {
      conn.once('open', handleOpen);
    }

    conn.on('data', (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'type' in data) {
        const packet = data as PvpPacket;
        if (packet.type === 'VOICE_SIGNAL' || packet.type === 'VOICE_STATUS') {
          this.handleVoiceSignalPacket(packet.payload as VoiceSignalPayload);
        }
        if (this.onPacketReceived) {
          this.onPacketReceived(packet);
        }
      }
    });

    conn.on('close', () => {
      console.log('[MultiplayerService] Data connection closed by remote peer.');
      this.setStatus('disconnected', 'Opponent disconnected.');
      this.leaveVoiceChat();
      this.onOpponentLeft?.('disconnect');
    });

    conn.on('error', (err) => {
      console.error('[MultiplayerService] Data connection error:', err);
      this.setStatus('error', err.message || 'DataChannel error');
    });

    // Monitor WebRTC ICE state changes
    conn.on('iceStateChanged', (state: string) => {
      console.log(`[MultiplayerService] ICE state changed to: ${state}`);
      if (state === 'failed') {
        const msg = 'WebRTC direct connection failed between networks (ICE failed due to firewall/NAT).';
        console.error(`[MultiplayerService] ${msg}`);
        this.setStatus('error', msg);
      }
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

  private handleVoiceSignalPacket(payload: VoiceSignalPayload): void {
    if (!payload || !payload.action) return;
    console.log(`[MultiplayerService] Voice signal received: action=${payload.action}, muted=${payload.isMuted}`);

    if (payload.action === 'joined') {
      this.remoteVoiceActive = true;
      // If we are Host and local voice is active, initiate WebRTC call
      if (this.role === 'host' && this.voiceState.enabled && this.localAudioStream && this.peer && this.connection) {
        this.callPeerVoice(this.connection.peer);
      }
    } else if (payload.action === 'left') {
      this.remoteVoiceActive = false;
      this.detachRemoteAudio();
      if (this.mediaConnection) {
        try {
          this.mediaConnection.close();
        } catch {}
        this.mediaConnection = null;
      }
    }

    if (this.onVoiceSignal) {
      this.onVoiceSignal(payload);
    }
  }

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
          channelCount: 1,
        },
        video: false,
      });

      this.voiceState.hasPermission = true;
      this.voiceState.enabled = true;
      this.voiceState.isMuted = false;

      this.setupLocalAudioAnalyser();

      // Notify peer over DataChannel that local voice is joined and active
      this.sendPacket('VOICE_SIGNAL', { action: 'joined', isMuted: false });

      // Deterministic Caller:
      // Only the Host initiates calls. If we are Host and connected, call Guest.
      if (this.role === 'host' && this.connection && this.connection.open && this.peer) {
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
    if (this.role !== 'host') {
      console.log('[MultiplayerService] Guest skips initiating call (host-driven calling avoids glare).');
      return;
    }

    // If an active call is already open with this peer, avoid duplicate calls
    if (this.mediaConnection && this.mediaConnection.open) {
      console.log('[MultiplayerService] Active media connection already open, skipping duplicate call.');
      return;
    }

    try {
      console.log(`[MultiplayerService] Host initiating voice call to: ${remotePeerId}`);
      if (this.mediaConnection) {
        try {
          this.mediaConnection.close();
        } catch {}
        this.mediaConnection = null;
      }

      const call = this.peer.call(remotePeerId, this.localAudioStream);
      this.mediaConnection = call;

      call.on('stream', (remoteStream) => {
        console.log('[MultiplayerService] Received remote audio stream from call answer!');
        this.attachRemoteAudio(remoteStream);
      });

      call.on('close', () => {
        console.log('[MultiplayerService] MediaConnection closed.');
        if (this.mediaConnection === call) {
          this.mediaConnection = null;
          this.detachRemoteAudio();
        }
      });

      call.on('error', (err) => {
        console.error('[MultiplayerService] MediaConnection error:', err);
      });
    } catch (err) {
      console.error('[MultiplayerService] Error establishing audio call:', err);
    }
  }

  private handleIncomingCall(call: MediaConnection): void {
    console.log(`[MultiplayerService] Handling incoming voice call from: ${call.peer}`);

    // If an existing media connection exists, close it cleanly first
    if (this.mediaConnection && this.mediaConnection !== call) {
      try {
        this.mediaConnection.close();
      } catch {}
    }
    this.mediaConnection = call;

    if (this.localAudioStream) {
      console.log('[MultiplayerService] Answering incoming call with local audio stream.');
      call.answer(this.localAudioStream);
    } else {
      console.log('[MultiplayerService] Answering incoming call in listen-only mode.');
      call.answer();
    }

    call.on('stream', (remoteStream) => {
      console.log('[MultiplayerService] Remote audio stream connected from call!');
      this.attachRemoteAudio(remoteStream);
    });

    call.on('close', () => {
      console.log('[MultiplayerService] Incoming call closed.');
      if (this.mediaConnection === call) {
        this.mediaConnection = null;
        this.detachRemoteAudio();
      }
    });

    call.on('error', (err) => {
      console.error('[MultiplayerService] Incoming call error:', err);
    });
  }

  private attachRemoteAudio(stream: MediaStream): void {
    console.log('[MultiplayerService] Attaching remote audio stream to Web Audio graph...');
    this.remoteAudioStream = stream;

    // Ensure audio tracks are enabled
    stream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });

    // 1. Mount hidden <audio> element in DOM to keep Chromium's WebRTC demuxer actively pumping audio
    if (typeof document !== 'undefined') {
      let audioEl = document.getElementById('yugioh-remote-voice') as HTMLAudioElement | null;
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.id = 'yugioh-remote-voice';
        audioEl.autoplay = true;
        (audioEl as any).playsInline = true;
        audioEl.style.position = 'fixed';
        audioEl.style.pointerEvents = 'none';
        audioEl.style.opacity = '0';
        audioEl.style.zIndex = '-1';
        document.body.appendChild(audioEl);
      }
      audioEl.muted = true; // Muted to avoid double audio; Web Audio API handles audible output
      audioEl.srcObject = stream;
      audioEl.play().catch((err) => {
        console.warn('[MultiplayerService] Remote audio element keep-alive play warning:', err);
      });
      this.remoteAudioElement = audioEl;
    }

    // 2. Route stream through Web Audio API to AudioContext.destination
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!this.remoteAudioContext || this.remoteAudioContext.state === 'closed') {
        this.remoteAudioContext = new AudioContextClass();
      }

      if (this.remoteAudioContext.state === 'suspended') {
        this.remoteAudioContext.resume().catch((err) => {
          console.warn('[MultiplayerService] Remote AudioContext resume failed:', err);
        });
      }

      // Cleanup existing gain node before re-connecting
      if (this.remoteGainNode) {
        try {
          this.remoteGainNode.disconnect();
        } catch {}
      }

      const source = this.remoteAudioContext.createMediaStreamSource(stream);

      this.remoteGainNode = this.remoteAudioContext.createGain();
      const currentVol = this.voiceState.isDeafened ? 0 : this.voiceState.volume;
      this.remoteGainNode.gain.setValueAtTime(currentVol, this.remoteAudioContext.currentTime);

      this.remoteAnalyser = this.remoteAudioContext.createAnalyser();
      this.remoteAnalyser.fftSize = 256;

      // Connect: source -> gain -> destination (Audible to headphones/speakers)
      source.connect(this.remoteGainNode);
      this.remoteGainNode.connect(this.remoteAudioContext.destination);

      // Connect: source -> analyser (Speaking detection)
      source.connect(this.remoteAnalyser);

      console.log('[MultiplayerService] Remote audio successfully routed to AudioContext.destination!');
    } catch (e) {
      console.warn('[MultiplayerService] Web Audio remote routing failed, falling back to direct audio element:', e);
      if (this.remoteAudioElement) {
        this.remoteAudioElement.muted = this.voiceState.isDeafened;
        this.remoteAudioElement.volume = this.voiceState.isDeafened ? 0 : this.voiceState.volume;
        this.remoteAudioElement.play().catch(() => {});
      }
    }

    this.voiceState.connected = true;
    this.notifyVoiceChange();
  }

  private detachRemoteAudio(): void {
    console.log('[MultiplayerService] Detaching remote audio...');
    if (this.remoteGainNode) {
      try {
        this.remoteGainNode.disconnect();
      } catch {}
      this.remoteGainNode = null;
    }
    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = null;
    }
    this.remoteAudioStream = null;
    this.voiceState.connected = false;
    this.voiceState.isRemoteSpeaking = false;
    this.notifyVoiceChange();
  }

  public leaveVoiceChat(): void {
    console.log('[MultiplayerService] Leaving voice chat...');
    if (this.audioMonitorInterval) {
      window.clearInterval(this.audioMonitorInterval);
      this.audioMonitorInterval = null;
    }

    this.sendPacket('VOICE_SIGNAL', { action: 'left' });

    // CRITICAL: Stop all microphone tracks so macOS/Windows releases the mic
    // and Bluetooth headsets revert from HFP/HSP to high-fidelity A2DP stereo!
    if (this.localAudioStream) {
      this.localAudioStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.localAudioStream = null;
    }

    if (this.mediaConnection) {
      try {
        this.mediaConnection.close();
      } catch {}
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
    this.sendPacket('VOICE_SIGNAL', { action: 'mute', isMuted: muted });
    this.notifyVoiceChange();
  }

  public setDeafened(deafened: boolean): void {
    this.voiceState.isDeafened = deafened;
    const vol = deafened ? 0 : this.voiceState.volume;
    if (this.remoteGainNode && this.remoteAudioContext) {
      try {
        this.remoteGainNode.gain.setValueAtTime(vol, this.remoteAudioContext.currentTime);
      } catch {}
    }
    if (this.remoteAudioElement && !this.remoteGainNode) {
      this.remoteAudioElement.volume = vol;
    }
    this.notifyVoiceChange();
  }

  public setVolume(volume: number): void {
    this.voiceState.volume = Math.max(0, Math.min(1, volume));
    if (!this.voiceState.isDeafened) {
      if (this.remoteGainNode && this.remoteAudioContext) {
        try {
          this.remoteGainNode.gain.setValueAtTime(this.voiceState.volume, this.remoteAudioContext.currentTime);
        } catch {}
      }
      if (this.remoteAudioElement && !this.remoteGainNode) {
        this.remoteAudioElement.volume = this.voiceState.volume;
      }
    }
    this.notifyVoiceChange();
  }

  private setupLocalAudioAnalyser(): void {
    if (!this.localAudioStream) return;
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.localAudioContext || this.localAudioContext.state === 'closed') {
        this.localAudioContext = new AudioContextClass();
      }
      if (this.localAudioContext.state === 'suspended') {
        this.localAudioContext.resume().catch(() => {});
      }
      const source = this.localAudioContext.createMediaStreamSource(this.localAudioStream);
      this.localAnalyser = this.localAudioContext.createAnalyser();
      this.localAnalyser.fftSize = 256;
      source.connect(this.localAnalyser);
      // Note: do not connect local mic to destination to avoid feedback echo
    } catch (e) {
      console.warn('[MultiplayerService] AudioContext analyser init failed:', e);
    }
  }

  private setupRemoteAudioAnalyser(stream: MediaStream): void {
    // Handled directly inside attachRemoteAudio via Web Audio graph
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
    this.remoteVoiceActive = false;

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
