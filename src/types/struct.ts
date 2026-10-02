export type PacketType =
  | 'HELLO'
  | 'SESSION_INIT'
  | 'SESSION_RESP'
  | 'DATA'
  | 'DELIVERY_ACK'
  | 'READ_RECEIPT'
  | 'CHANNEL_DATA'
  | 'EMERGENCY_SOS';

export type MessageStatus =
  | 'queued'
  | 'sending'
  | 'relayed'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'expired';

export type PeerConnectionState =
  | 'unknown'
  | 'discovering'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed';

export type BatteryMode = 'saver' | 'balanced' | 'performance';

export interface Identity {
  id: string;
  displayName: string;
  publicKey: string;
  fingerprint: string;
  createdAt: number;
  isVerified: boolean;
}

export interface Peer {
  id: string;
  displayName: string;
  publicKey: string;
  fingerprint: string;
  lastSeen: number;
  signalRssi: number; // e.g. -58 dBm
  connectionState: PeerConnectionState;
  isVerified: boolean;
  distanceEstimateMeters: number;
  isRelayCapable: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  channelId?: string;
  ciphertext: string;
  plaintext?: string; // Decrypted on sender & destination only! Relays never see this.
  createdAt: number;
  expiresAt?: number;
  ttl: number;
  status: MessageStatus;
  relayedVia?: string; // e.g. 'Ankit (Phone B)'
  isEmergency?: boolean;
}

export interface MeshPacket {
  version: number;
  packetType: PacketType;
  packetId: string;
  messageId: string;
  senderId: string;
  destinationId: string;
  ttl: number;
  createdAt: number;
  expiresAt: number;
  payloadLength: number;
  ciphertextPayload: string; // Base64 or Hex
  authTag: string; // Poly1305 16-byte MAC
  checksum: number; // CRC-16
}

export interface BleFragment {
  packetId: string;
  seqIndex: number;
  totalCount: number;
  dataChunk: string;
  checksum: number;
}

export interface PendingRelayItem {
  messageId: string;
  packet: MeshPacket;
  destinationId: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  nextAttemptAt: number;
}

export interface MeshNode {
  id: string;
  name: string;
  role: 'sender' | 'relay' | 'recipient' | 'peer';
  identity: Identity;
  isOnline: boolean;
  batteryLevel: number;
  batteryMode: BatteryMode;
  connectedPeerIds: string[];
  pendingPackets: PendingRelayItem[];
  seenPacketIds: Set<string>;
  messages: Message[];
  diagnostics: {
    packetsReceived: number;
    packetsForwarded: number;
    packetsDelivered: number;
    packetsDropped: number;
    duplicatesRejected: number;
    ttlExpirations: number;
    queueDepth: number;
  };
}

export interface NetworkLogEvent {
  id: string;
  timestamp: number;
  nodeId: string;
  nodeName: string;
  level: 'info' | 'warn' | 'success' | 'security';
  message: string;
  packetId?: string;
  details?: Record<string, unknown>;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'emergency';
  unreadCount: number;
}
