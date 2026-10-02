# Struct — Architecture & System Design

```text
+-----------------------------------------------------------------------------------+
|                                  FLUTTER UI                                       |
|  - Splash Screen (Dipak Bhondekar created)   - Onboarding Flow (4 Screens)        |
|  - Home / Mesh Status Card                   - Chats & Direct Messaging UI        |
|  - Nearby Peers Scanner                      - Local & Emergency Channels         |
|  - Network Topology Graph                    - Security Center & QR Verification  |
|  - App Lock (PIN / Biometrics)               - Diagnostics & Battery Mode Profiles|
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                             APPLICATION LAYER / PROVIDERS                         |
|  - MessagingNotifier   - PeerDiscoveryNotifier   - MeshStatusNotifier             |
|  - SecurityNotifier    - SessionNotifier         - BatteryPolicyController        |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                                REPOSITORIES & DRIFT DB                            |
|  - PeerRepository           - MessageRepository         - ChannelRepository       |
|  - PendingMessageRepository - VerificationRepository    - KeyStore (Keystore/Sec) |
|  - AppDatabase (SQLite with WAL mode, composite indexes, encrypted column blobs)  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                         CORE SECURITY & ENCRYPTION DOMAIN                         |
|  - CryptoService (Ed25519 identity, X25519 DH, ChaCha20-Poly1305 AEAD, HKDF)     |
|  - SessionManager (Directional sliding window nonces, forward secrecy rotation)   |
|  - VerificationService (Safety fingerprints, QR encode/decode, identity mismatch) |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                           MESH ROUTING & PROTOCOL ENGINE                          |
|  - MeshRouter (Controlled flooding, destination dispatch, relay forwarding)      |
|  - PacketCodec (Strict binary serializer / deserializer with CRC16)               |
|  - DeduplicationService (LRU packet cache, 30m window, anti-storm suppression)   |
|  - TtlManager (Hop decrement ceiling, max TTL 7, loop drop)                       |
|  - StoreAndForwardEngine (Bounded offline queue, exponential backoff retries)     |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                        TRANSPORT & BLE FRAGMENTATION LAYER                        |
|  - PacketFragmenter (Splits MeshPacket into 18-500 byte BLE frames with CRC16)    |
|  - PacketReassembler (Buffer with 15s expiration window & memory bounds)          |
|  - BleTransport (Abstract transport interface supporting swap/mocking)            |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|                           PLATFORM BLE IMPLEMENTATION                             |
|         Android: Kotlin GATT Server/Client + Foreground BLE Service               |
|         iOS: Swift CoreBluetooth Central & Peripheral Manager                     |
+-----------------------------------------------------------------------------------+
```

---

## The $A \to B \to C$ Multi-Hop Flow

```text
[PHONE A - Dipak]                      [PHONE B - Ankit / Relay]                  [PHONE C - Rahul]
       │                                           │                                      │
  1. User sends "Hello C"                          │                                      │
  2. Encrypts payload with                         │                                      │
     SessionKey(A->C) via ChaCha20-Poly1305        │                                      │
  3. Builds MeshPacket:                            │                                      │
     - packetId: 0x8F4A21                          │                                      │
     - sender: A (Dipak)                           │                                      │
     - dest: C (Rahul)                             │                                      │
     - ttl: 5                                      │                                      │
     - payload: [Encrypted Ciphertext]             │                                      │
  4. Fragments packet into BLE chunks              │                                      │
  5. Transmits over BLE GATT Characteristic ─────> │                                      │
                                                   │ 6. Reassembles fragments             │
                                                   │ 7. Checks DeduplicationCache:        │
                                                   │    0x8F4A21 is new (store in LRU)    │
                                                   │ 8. Checks Destination != B           │
                                                   │ 9. CANNOT DECRYPT (No session key!)  │
                                                   │ 10. Decrements TTL: 5 -> 4           │
                                                   │ 11. Queues for forwarding            │
                                                   │ 12. Retransmits BLE chunks ────────> │
                                                   │                                      │ 13. Reassembles fragments
                                                   │                                      │ 14. Checks Destination == C (Me!)
                                                   │                                      │ 15. Decrypts with SessionKey(A->C)
                                                   │                                      │ 16. Verifies Poly1305 MAC tag
                                                   │                                      │ 17. Inserts into Drift SQLite
                                                   │                                      │ 18. UI renders "Hello C"
                                                   │                                      │ 19. Generates DELIVERY_RECEIPT
                                                   │ <─────────────────────────────────── │     (dest: A, messageId: 0x8F4A21)
                                                   │ 20. B relays ACK back to A           │
  22. Receives DELIVERY_RECEIPT <───────────────── │                                      │
  23. Updates UI: "Delivered ✓"                    │                                      │
```
