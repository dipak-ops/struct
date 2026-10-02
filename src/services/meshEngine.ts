import {
  MeshNode,
  MeshPacket,
  Message,
  NetworkLogEvent,
  Peer,
  Channel,
} from '../types/struct';
import {
  deriveSessionKey,
  encryptPayload,
  decryptPayload,
  computeCrc16,
  hexToBytes,
} from './cryptoEngine';

export class MeshNetworkEngine {
  private nodes: Map<string, MeshNode> = new Map();
  private listeners: Array<() => void> = [];
  private logListeners: Array<(log: NetworkLogEvent) => void> = [];
  private packetInspectListeners: Array<(pkt: MeshPacket, stage: string) => void> = [];
  private sessionKeys: Map<string, CryptoKey> = new Map();
  private nonceCounters: Map<string, number> = new Map();

  // Channels
  public channels: Channel[] = [
    {
      id: 'chan_emergency',
      name: '🚨 Emergency Channel',
      description: 'Priority broadcast channel for distress signals in range',
      type: 'emergency',
      unreadCount: 0,
    },
    {
      id: 'chan_local_general',
      name: '# Local Mesh General',
      description: 'Nearby peer discussions within 2 hops',
      type: 'public',
      unreadCount: 2,
    },
    {
      id: 'chan_field_ops',
      name: '# Field Operations',
      description: 'Private team coordination',
      type: 'private',
      unreadCount: 0,
    },
  ];

  constructor() {
    this.initDefaultNodes();
  }

  private initDefaultNodes() {
    // Phone A (Dipak - User / Sender)
    const nodeA: MeshNode = {
      id: 'node_a',
      name: 'Dipak (Phone A)',
      role: 'sender',
      identity: {
        id: 'S7A82F91',
        displayName: 'Dipak',
        publicKey: '7a82f91b40283c7de91a0248f3b201a9c3d4e5f60123456789abcdef01234567',
        fingerprint: '7A82 F91B 4028 3C7D E91A',
        createdAt: Date.now() - 3600000 * 24,
        isVerified: true,
      },
      isOnline: true,
      batteryLevel: 88,
      batteryMode: 'balanced',
      connectedPeerIds: ['node_b'], // A can reach B directly
      pendingPackets: [],
      seenPacketIds: new Set(),
      messages: [],
      diagnostics: {
        packetsReceived: 0,
        packetsForwarded: 0,
        packetsDelivered: 0,
        packetsDropped: 0,
        duplicatesRejected: 0,
        ttlExpirations: 0,
        queueDepth: 0,
      },
    };

    // Phone B (Ankit - Intermediate Relay)
    const nodeB: MeshNode = {
      id: 'node_b',
      name: 'Ankit (Phone B - Relay)',
      role: 'relay',
      identity: {
        id: 'SB1940DE',
        displayName: 'Ankit (Relay)',
        publicKey: 'b1940de29a738c6bf5e4d3c2b1a09876543210fedcba9876543210fedcba9876',
        fingerprint: 'B194 0DE2 9A73 8C6B F5E4',
        createdAt: Date.now() - 3600000 * 12,
        isVerified: false,
      },
      isOnline: true,
      batteryLevel: 94,
      batteryMode: 'balanced',
      connectedPeerIds: ['node_a', 'node_c'], // B connects to both A and C
      pendingPackets: [],
      seenPacketIds: new Set(),
      messages: [],
      diagnostics: {
        packetsReceived: 0,
        packetsForwarded: 0,
        packetsDelivered: 0,
        packetsDropped: 0,
        duplicatesRejected: 0,
        ttlExpirations: 0,
        queueDepth: 0,
      },
    };

    // Phone C (Rahul - Recipient)
    const nodeC: MeshNode = {
      id: 'node_c',
      name: 'Rahul (Phone C)',
      role: 'recipient',
      identity: {
        id: 'SC488A01',
        displayName: 'Rahul',
        publicKey: 'c488a011234567890abcdef1234567890abcdef1234567890abcdef123456789',
        fingerprint: 'C488 A011 2345 6789 0ABC',
        createdAt: Date.now() - 3600000 * 48,
        isVerified: true,
      },
      isOnline: true,
      batteryLevel: 76,
      batteryMode: 'balanced',
      connectedPeerIds: ['node_b'], // C only connects to B directly! Not directly to A!
      pendingPackets: [],
      seenPacketIds: new Set(),
      messages: [],
      diagnostics: {
        packetsReceived: 0,
        packetsForwarded: 0,
        packetsDelivered: 0,
        packetsDropped: 0,
        duplicatesRejected: 0,
        ttlExpirations: 0,
        queueDepth: 0,
      },
    };

    // Phone D (Priya - Local Peer)
    const nodeD: MeshNode = {
      id: 'node_d',
      name: 'Priya (Nearby Peer)',
      role: 'peer',
      identity: {
        id: 'SD99F442',
        displayName: 'Priya',
        publicKey: 'd99f442387192837465abcde98765432101234567890abcdef1234567890abcd',
        fingerprint: 'D99F 4423 8719 2837 465A',
        createdAt: Date.now() - 3600000 * 5,
        isVerified: true,
      },
      isOnline: true,
      batteryLevel: 62,
      batteryMode: 'balanced',
      connectedPeerIds: ['node_a'],
      pendingPackets: [],
      seenPacketIds: new Set(),
      messages: [],
      diagnostics: {
        packetsReceived: 0,
        packetsForwarded: 0,
        packetsDelivered: 0,
        packetsDropped: 0,
        duplicatesRejected: 0,
        ttlExpirations: 0,
        queueDepth: 0,
      },
    };

    this.nodes.set(nodeA.id, nodeA);
    this.nodes.set(nodeB.id, nodeB);
    this.nodes.set(nodeC.id, nodeC);
    this.nodes.set(nodeD.id, nodeD);

    // Initial greeting in channel
    this.log({
      id: 'init_log_1',
      timestamp: Date.now(),
      nodeId: 'node_a',
      nodeName: 'Dipak (Phone A)',
      level: 'info',
      message: 'Struct Mesh initialized. Dual-role BLE scanning active on service UUID 0x53545255.',
    });
  }

  public getNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(id: string): MeshNode | undefined {
    return this.nodes.get(id);
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeLogs(listener: (log: NetworkLogEvent) => void) {
    this.logListeners.push(listener);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
    };
  }

  public subscribePacketInspect(listener: (pkt: MeshPacket, stage: string) => void) {
    this.packetInspectListeners.push(listener);
    return () => {
      this.packetInspectListeners = this.packetInspectListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private log(event: NetworkLogEvent) {
    this.logListeners.forEach(l => l(event));
  }

  private inspectPacket(pkt: MeshPacket, stage: string) {
    this.packetInspectListeners.forEach(l => l(pkt, stage));
  }

  // Get shared cryptographic session key between sender and recipient
  private async getOrCreateSessionKey(peerAId: string, peerBId: string): Promise<CryptoKey> {
    const pairKey = [peerAId, peerBId].sort().join(':');
    if (!this.sessionKeys.has(pairKey)) {
      const derived = await deriveSessionKey(`Struct-Session-${pairKey}`);
      this.sessionKeys.set(pairKey, derived);
    }
    return this.sessionKeys.get(pairKey)!;
  }

  // Get active peers for a specific node
  public getPeersForNode(nodeId: string): Peer[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const peers: Peer[] = [];
    for (const other of this.nodes.values()) {
      if (other.id === nodeId) continue;

      const isDirectlyConnected = node.connectedPeerIds.includes(other.id) && other.isOnline;
      const isMultiHopRelayed = !isDirectlyConnected && other.isOnline;

      let rssi = -95;
      let dist = 35;
      if (isDirectlyConnected) {
        rssi = nodeId === 'node_a' && other.id === 'node_b' ? -58 : -64;
        dist = 8;
      } else if (isMultiHopRelayed) {
        rssi = -82;
        dist = 22; // Multi-hop via intermediate
      }

      peers.push({
        id: other.id,
        displayName: other.identity.displayName,
        publicKey: other.identity.publicKey,
        fingerprint: other.identity.fingerprint,
        lastSeen: other.isOnline ? Date.now() : Date.now() - 3600000,
        signalRssi: rssi,
        connectionState: isDirectlyConnected ? 'connected' : (other.isOnline ? 'discovering' : 'disconnected'),
        isVerified: other.identity.isVerified,
        distanceEstimateMeters: dist,
        isRelayCapable: other.role === 'relay' || other.role === 'sender',
      });
    }

    return peers;
  }

  // Set node online/offline (Bluetooth toggle simulation)
  public toggleNodeBluetooth(nodeId: string) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    node.isOnline = !node.isOnline;
    this.log({
      id: `bt_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: node.id,
      nodeName: node.name,
      level: node.isOnline ? 'info' : 'warn',
      message: `Bluetooth radio ${node.isOnline ? 'ENABLED' : 'DISABLED'}. BLE GATT connection state changed.`,
    });

    // If node came back online, check store-and-forward sweeps
    if (node.isOnline) {
      this.sweepStoreAndForward();
    }

    this.notify();
  }

  // Update battery mode
  public setBatteryMode(nodeId: string, mode: 'saver' | 'balanced' | 'performance') {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    node.batteryMode = mode;
    this.log({
      id: `bat_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: node.id,
      nodeName: node.name,
      level: 'info',
      message: `Battery operating profile updated to ${mode.toUpperCase()}. Scan interval adjusted.`,
    });
    this.notify();
  }

  // Verify peer identity
  public verifyPeer(targetNodeId: string) {
    const node = this.nodes.get(targetNodeId);
    if (!node) return;
    node.identity.isVerified = true;
    this.log({
      id: `ver_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: targetNodeId,
      nodeName: node.name,
      level: 'security',
      message: `Identity verified via Out-Of-Band Safety Numbers Fingerprint: ${node.identity.fingerprint}.`,
    });
    this.notify();
  }

  /**
   * PRIMARY CORE FUNCTION: Send an end-to-end encrypted multi-hop message
   * Phone A -> Phone B (Relay) -> Phone C (Recipient)
   */
  public async sendMessage(
    senderId: string,
    recipientId: string,
    text: string,
    options: { isEmergency?: boolean; disappearingSeconds?: number } = {}
  ): Promise<string> {
    const sender = this.nodes.get(senderId);
    const recipient = this.nodes.get(recipientId);

    if (!sender || !recipient) {
      throw new Error('Sender or recipient node not found in mesh');
    }

    const messageId = `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const packetId = `pkt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Get or derive End-to-End Cryptographic Session Key (Shared between A and C ONLY)
    const sessionKey = await this.getOrCreateSessionKey(senderId, recipientId);
    const counter = (this.nonceCounters.get(senderId) || 0) + 1;
    this.nonceCounters.set(senderId, counter);

    // 2. Encrypt payload with AEAD (Simulating ChaCha20-Poly1305)
    const { ciphertextHex, authTagHex } = await encryptPayload(text, sessionKey, counter);

    // 3. Build MeshPacket
    const packetBytes = hexToBytes(ciphertextHex);
    const crc = computeCrc16(packetBytes);

    const expiresAt = options.disappearingSeconds
      ? Date.now() + options.disappearingSeconds * 1000
      : Date.now() + 3600000; // 1 hour default

    const packet: MeshPacket = {
      version: 1,
      packetType: options.isEmergency ? 'EMERGENCY_SOS' : 'DATA',
      packetId,
      messageId,
      senderId,
      destinationId: recipientId,
      ttl: 5, // Standard starting TTL
      createdAt: Date.now(),
      expiresAt,
      payloadLength: packetBytes.length,
      ciphertextPayload: ciphertextHex,
      authTag: authTagHex,
      checksum: crc,
    };

    // 4. Create local message record in sender's database
    const localMsg: Message = {
      id: messageId,
      senderId,
      senderName: sender.identity.displayName,
      recipientId,
      recipientName: recipient.identity.displayName,
      ciphertext: ciphertextHex,
      plaintext: text, // Sender knows what they typed
      createdAt: Date.now(),
      expiresAt,
      ttl: packet.ttl,
      status: 'sending',
      isEmergency: options.isEmergency,
    };

    sender.messages.push(localMsg);
    sender.seenPacketIds.add(packetId);
    this.notify();

    this.log({
      id: `snd_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: sender.id,
      nodeName: sender.name,
      level: 'info',
      message: `[Phone A] Encrypted message with ChaCha20-Poly1305. Packet #${packetId.slice(-6)} created (TTL=5, Dest=${recipient.identity.displayName}).`,
      packetId,
    });
    this.inspectPacket(packet, 'Originated at Phone A (Encrypted)');

    // 5. Simulate BLE link transmission to next hop
    setTimeout(() => {
      this.routePacketToNextHops(sender, packet, localMsg);
    }, 400);

    return messageId;
  }

  /**
   * Routing logic: Controlled multi-hop forwarding
   */
  private async routePacketToNextHops(
    sourceNode: MeshNode,
    packet: MeshPacket,
    originatingMsg?: Message
  ) {
    // Find eligible connected peers that are online
    const connectedPeers = sourceNode.connectedPeerIds
      .map(id => this.nodes.get(id))
      .filter((n): n is MeshNode => !!n && n.isOnline);

    if (connectedPeers.length === 0) {
      this.log({
        id: `drop_${Date.now()}`,
        timestamp: Date.now(),
        nodeId: sourceNode.id,
        nodeName: sourceNode.name,
        level: 'warn',
        message: `No active BLE peers connected to ${sourceNode.name}. Storing packet in local pending queue.`,
        packetId: packet.packetId,
      });

      // Save to store-and-forward queue
      sourceNode.pendingPackets.push({
        messageId: packet.messageId,
        packet: { ...packet },
        destinationId: packet.destinationId,
        createdAt: Date.now(),
        expiresAt: packet.expiresAt,
        attempts: 1,
        nextAttemptAt: Date.now() + 5000,
      });
      sourceNode.diagnostics.queueDepth = sourceNode.pendingPackets.length;
      if (originatingMsg) {
        originatingMsg.status = 'queued';
      }
      this.notify();
      return;
    }

    // Transmit over BLE GATT to each connected peer
    for (const peer of connectedPeers) {
      this.log({
        id: `tx_${Date.now()}_${peer.id}`,
        timestamp: Date.now(),
        nodeId: sourceNode.id,
        nodeName: sourceNode.name,
        level: 'info',
        message: `Transmitting BLE GATT fragments for Packet #${packet.packetId.slice(-6)} to ${peer.name}...`,
        packetId: packet.packetId,
      });

      setTimeout(() => {
        this.processInboundPacket(peer, { ...packet }, originatingMsg);
      }, 500);
    }
  }

  /**
   * Node receives inbound BLE packet
   */
  private async processInboundPacket(
    node: MeshNode,
    packet: MeshPacket,
    originatingMsg?: Message
  ) {
    node.diagnostics.packetsReceived++;

    // 1. Check Deduplication Cache
    if (node.seenPacketIds.has(packet.packetId)) {
      node.diagnostics.duplicatesRejected++;
      this.log({
        id: `dedup_${Date.now()}`,
        timestamp: Date.now(),
        nodeId: node.id,
        nodeName: node.name,
        level: 'warn',
        message: `[Deduplication] Packet #${packet.packetId.slice(-6)} was already seen in LRU cache. Silently dropping to prevent broadcast storm.`,
        packetId: packet.packetId,
      });
      return;
    }

    // Add to seen cache
    node.seenPacketIds.add(packet.packetId);

    // 2. Check Expiration
    if (Date.now() > packet.expiresAt) {
      node.diagnostics.packetsDropped++;
      this.log({
        id: `exp_${Date.now()}`,
        timestamp: Date.now(),
        nodeId: node.id,
        nodeName: node.name,
        level: 'warn',
        message: `Packet #${packet.packetId.slice(-6)} has expired. Dropped.`,
        packetId: packet.packetId,
      });
      return;
    }

    // 3. CASE A: THIS NODE IS THE DESTINATION! (Phone C)
    if (node.id === packet.destinationId) {
      node.diagnostics.packetsDelivered++;
      this.inspectPacket(packet, `Delivered to Destination (${node.name})`);

      try {
        // Derive session key to decrypt
        const sessionKey = await this.getOrCreateSessionKey(packet.senderId, node.id);
        const decryptedText = await decryptPayload(
          packet.ciphertextPayload,
          packet.authTag,
          '000000000000000000000001', // Monotonic nonce reference
          sessionKey
        );

        const sender = this.nodes.get(packet.senderId);
        const receivedMsg: Message = {
          id: packet.messageId,
          senderId: packet.senderId,
          senderName: sender?.identity.displayName || 'Unknown Sender',
          recipientId: node.id,
          recipientName: node.identity.displayName,
          ciphertext: packet.ciphertextPayload,
          plaintext: decryptedText,
          createdAt: packet.createdAt,
          expiresAt: packet.expiresAt,
          ttl: packet.ttl,
          status: 'delivered',
          isEmergency: packet.packetType === 'EMERGENCY_SOS',
        };

        node.messages.push(receivedMsg);

        this.log({
          id: `deliv_${Date.now()}`,
          timestamp: Date.now(),
          nodeId: node.id,
          nodeName: node.name,
          level: 'success',
          message: `[Phone C] Destination reached! Poly1305 MAC verified. Decrypted message from ${sender?.identity.displayName}: "${decryptedText}"`,
          packetId: packet.packetId,
        });

        // Send DELIVERY_ACK back through mesh
        this.sendDeliveryAck(node, packet.senderId, packet.messageId, originatingMsg);
      } catch (err) {
        this.log({
          id: `err_${Date.now()}`,
          timestamp: Date.now(),
          nodeId: node.id,
          nodeName: node.name,
          level: 'security',
          message: `[Security Error] Decryption or Poly1305 authentication failed! Rejecting packet. Error: ${err}`,
          packetId: packet.packetId,
        });
      }

      this.notify();
      return;
    }

    // 4. CASE B: THIS NODE IS AN INTERMEDIATE RELAY! (Phone B)
    // CRITICAL: Phone B does NOT possess the session key and CANNOT decrypt the message!
    this.log({
      id: `relay_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: node.id,
      nodeName: node.name,
      level: 'info',
      message: `[Phone B - Relay] Received Packet #${packet.packetId.slice(-6)}. Destination is ${packet.destinationId} != me. Validating header...`,
      packetId: packet.packetId,
    });

    if (originatingMsg) {
      originatingMsg.status = 'relayed';
      originatingMsg.relayedVia = node.identity.displayName;
      this.notify();
    }

    // Decrement TTL
    if (packet.ttl <= 1) {
      node.diagnostics.ttlExpirations++;
      node.diagnostics.packetsDropped++;
      this.log({
        id: `ttl0_${Date.now()}`,
        timestamp: Date.now(),
        nodeId: node.id,
        nodeName: node.name,
        level: 'warn',
        message: `[TTL Reached Zero] Packet #${packet.packetId.slice(-6)} dropped. Exceeded max hop limit.`,
        packetId: packet.packetId,
      });
      return;
    }

    packet.ttl -= 1;
    this.inspectPacket(packet, `Relayed at Phone B (TTL decremented to ${packet.ttl})`);

    // Check if recipient (Phone C) is currently reachable from Relay B
    const recipientNode = this.nodes.get(packet.destinationId);
    const isRecipientConnected = node.connectedPeerIds.includes(packet.destinationId) && recipientNode?.isOnline;

    if (!isRecipientConnected) {
      // Store and forward!
      node.pendingPackets.push({
        messageId: packet.messageId,
        packet: { ...packet },
        destinationId: packet.destinationId,
        createdAt: Date.now(),
        expiresAt: packet.expiresAt,
        attempts: 1,
        nextAttemptAt: Date.now() + 5000,
      });
      node.diagnostics.queueDepth = node.pendingPackets.length;

      this.log({
        id: `sf_${Date.now()}`,
        timestamp: Date.now(),
        nodeId: node.id,
        nodeName: node.name,
        level: 'warn',
        message: `[Store-and-Forward] Destination ${recipientNode?.name || packet.destinationId} is currently offline/unreachable. Stored in Phone B relay queue.`,
        packetId: packet.packetId,
      });
      this.notify();
      return;
    }

    // Forward to next hop (Phone C)
    node.diagnostics.packetsForwarded++;
    this.log({
      id: `fwd_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: node.id,
      nodeName: node.name,
      level: 'info',
      message: `[Phone B - Relay] Forwarding encrypted payload (${packet.payloadLength} bytes) to Phone C over BLE... (Relay has NO access to plaintext)`,
      packetId: packet.packetId,
    });

    setTimeout(() => {
      this.processInboundPacket(recipientNode, { ...packet }, originatingMsg);
    }, 600);

    this.notify();
  }

  /**
   * Recipient generates DELIVERY_ACK and routes it back: C -> B -> A
   */
  private async sendDeliveryAck(
    recipientNode: MeshNode,
    originalSenderId: string,
    messageId: string,
    originatingMsg?: Message
  ) {
    this.log({
      id: `ack_gen_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: recipientNode.id,
      nodeName: recipientNode.name,
      level: 'info',
      message: `[Phone C] Generating binary DELIVERY_ACK packet for Message #${messageId.slice(-6)} to route back to Phone A.`,
    });

    // Simulate roundtrip route back through Relay B
    setTimeout(() => {
      const relayNode = this.nodes.get('node_b');
      if (relayNode && relayNode.isOnline) {
        this.log({
          id: `ack_relay_${Date.now()}`,
          timestamp: Date.now(),
          nodeId: relayNode.id,
          nodeName: relayNode.name,
          level: 'info',
          message: `[Phone B - Relay] Relaying DELIVERY_ACK from Phone C back to Phone A.`,
        });
      }

      setTimeout(() => {
        const sender = this.nodes.get(originalSenderId);
        if (sender) {
          if (originatingMsg) {
            originatingMsg.status = 'delivered';
          }
          sender.diagnostics.packetsDelivered++;
          this.log({
            id: `ack_rcv_${Date.now()}`,
            timestamp: Date.now(),
            nodeId: sender.id,
            nodeName: sender.name,
            level: 'success',
            message: `[Phone A] Received DELIVERY_ACK confirmation! Message status updated to: Delivered ✓`,
          });
          this.notify();
        }
      }, 400);
    }, 400);
  }

  /**
   * Periodic sweep of pending store-and-forward messages
   */
  public sweepStoreAndForward() {
    for (const node of this.nodes.values()) {
      if (!node.isOnline || node.pendingPackets.length === 0) continue;

      const remaining: typeof node.pendingPackets = [];
      for (const item of node.pendingPackets) {
        const dest = this.nodes.get(item.destinationId);
        if (dest && dest.isOnline && node.connectedPeerIds.includes(dest.id)) {
          // Destination is reachable now! Forward packet!
          this.log({
            id: `sf_drain_${Date.now()}`,
            timestamp: Date.now(),
            nodeId: node.id,
            nodeName: node.name,
            level: 'info',
            message: `[Store-and-Forward] Reconnected to ${dest.name}! Delivering queued packet #${item.packet.packetId.slice(-6)}...`,
            packetId: item.packet.packetId,
          });
          setTimeout(() => {
            this.processInboundPacket(dest, item.packet);
          }, 400);
        } else {
          remaining.push(item);
        }
      }
      node.pendingPackets = remaining;
      node.diagnostics.queueDepth = remaining.length;
    }
    this.notify();
  }

  /**
   * Test Attacks / Fault Injection
   */
  public injectReplayAttack(nodeId: string) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Use a packetId already in node's seen set
    const seenPktId = Array.from(node.seenPacketIds)[0] || 'pkt_replayed_old';
    node.seenPacketIds.add(seenPktId);

    const replayedPacket: MeshPacket = {
      version: 1,
      packetType: 'DATA',
      packetId: seenPktId,
      messageId: 'msg_stale_replay',
      senderId: 'node_a',
      destinationId: 'node_c',
      ttl: 5,
      createdAt: Date.now() - 3600000,
      expiresAt: Date.now() + 60000,
      payloadLength: 16,
      ciphertextPayload: 'deadbeefcafebabe',
      authTag: '0102030405060708090a0b0c0d0e0f10',
      checksum: 0x1234,
    };

    this.log({
      id: `atk_replay_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: node.id,
      nodeName: node.name,
      level: 'security',
      message: `[ATTACK INJECTION] Injected replayed packet #${seenPktId.slice(-6)} into ${node.name}. Expecting immediate deduplication drop!`,
    });

    this.processInboundPacket(node, replayedPacket);
  }

  public injectCorruptedCiphertext(targetNodeId: string) {
    const node = this.nodes.get(targetNodeId);
    if (!node) return;

    const corruptedPacket: MeshPacket = {
      version: 1,
      packetType: 'DATA',
      packetId: `pkt_corrupt_${Date.now()}`,
      messageId: `msg_corrupt_${Date.now()}`,
      senderId: 'node_a',
      destinationId: targetNodeId,
      ttl: 5,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
      payloadLength: 20,
      ciphertextPayload: 'badbadbadbadbadbadbadbadbadbad',
      authTag: '00000000000000000000000000000000', // Invalid Poly1305 MAC!
      checksum: 0x9999,
    };

    this.log({
      id: `atk_tamper_${Date.now()}`,
      timestamp: Date.now(),
      nodeId: node.id,
      nodeName: node.name,
      level: 'security',
      message: `[ATTACK INJECTION] Injected tampered ciphertext with forged MAC into ${node.name}. Expecting AEAD verification failure!`,
    });

    this.processInboundPacket(node, corruptedPacket);
  }
}

// Global singleton instance
export const meshEngine = new MeshNetworkEngine();
