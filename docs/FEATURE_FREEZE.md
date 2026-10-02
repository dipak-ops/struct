# Struct — Feature Freeze Specification (v1.0.0-rc1)

**Application**: Struct  
**Feature Freeze Status**: **ACTIVE — NO NEW MAJOR FEATURES ALLOWED**  
**Engineering Directive**: All efforts are restricted to bug fixing, test coverage, static analysis, performance profiling, and controlled real-device validation.

---

## 1. CORE FEATURES — MUST WORK (RELEASE BLOCKERS)

These components are fully implemented and must pass all automated and real-device acceptance criteria:

1. **Local Cryptographic Identity**: Ed25519 identity key generation via platform CSPRNG; persistent secure storage in hardware enclave (Android Keystore / iOS Keychain).
2. **Peer Discovery**: Dual-role BLE advertisement and scanning for Struct Service UUID `00005752-5543-5400-8000-00805F9B34FB`.
3. **End-to-End Encryption**: ChaCha20-Poly1305 AEAD with ephemeral X25519 key agreement and monotonic nonces.
4. **Packet Validation & Codec**: Wire Protocol v1 binary encoding/decoding, magic byte check, length bounds, and CRC-16 integrity check.
5. **Fragmentation & Reassembly**: Automatic slicing of large packets to fit BLE MTU (20–512 bytes) with 15-second reassembly buffer expiration and 64-chunk ceiling.
6. **Hop Limit & TTL**: Hop limit decrement ($TTL - 1$) with hard ceiling of 7 hops. Dropped when $TTL \le 1$.
7. **Deduplication**: In-memory LRU cache (10,000 entries) with 30-minute sliding window to suppress loops and packet storms.
8. **Multi-Hop Relay ($A \to B \to C$)**: Intermediate relays forward encrypted packets without plaintext access.
9. **Store-and-Forward**: Bounded pending message queue (15 MB total ceiling, 500 pkts/peer) with exponential retry backoff.
10. **Delivery Acknowledgements**: Lightweight reverse ACK packets ($C \to B \to A$) that update sender status to `Delivered ✓`.
11. **Local Drift/SQLite Persistence**: Foreign keys enabled, WAL journaling mode, composite indexes on pending tables.
12. **Peer Verification**: Base32 Crockford safety number fingerprints and out-of-band QR code validation.
13. **Local Disappearing Messages**: Timed purge of local SQLite records (5m, 1h, 24h).

---

## 2. SECONDARY FEATURES — POLISHED & BOUNDED

1. **Network Topology Graph**: Interactive visualization of locally discovered radio links and hops.
2. **Emergency SOS Mode**: Priority mesh distress broadcast with accidental slide-to-arm trigger protection.
3. **Battery Profiles**: Battery Saver (15% duty cycle), Balanced (40%), and Performance (80%).
4. **App Lock**: Biometric and device PIN authentication via platform security APIs.
5. **Notification Privacy**: Lock screen notifications sanitized to generic `"New Struct message"` with zero plaintext leak.

---

## 3. FUTURE / OPTIONAL (DEFERRED TO POST-BETA)

- Wi-Fi Direct / P2P transport adapter.
- LoRa physical hardware bridge adapter.
- High-bandwidth audio voice note streaming over mesh.
- Optional internet gateway fallback.
