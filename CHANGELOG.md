# Changelog — Struct

All notable changes to the Struct offline decentralized mesh messenger are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-rc1] - 2026-10-02

### Added
- **Feature Freeze**: Protocol v1 frozen (`STRUCT-MESH-V1`, Magic byte 0x53, Version 0x01).
- **Core Security**: Hardware enclave key store isolation (`FlutterSecureStorage`), prohibiting private keys from entering SQLite tables.
- **Wire Codec**: Strict binary frame serializer and deserializer with CRC-16 CCITT validation and bounds checking.
- **Deduplication Engine**: Bounded 10,000-entry LRU cache with a 30-minute sliding window preventing forwarding storms.
- **Hop Limit & TTL**: Hop limit decrement ceiling (7 hops max) dropping packets when $TTL \le 1$.
- **MTU Framing**: Packet fragmentation and reassembly engine with 15-second buffer timeout and 64-chunk ceiling.
- **Store-and-Forward**: Bounded offline queue (15 MB total limit, 500 pkts/peer) with exponential retry backoff.
- **Android Native BLE**: Foreground Service with `connectedDevice` type and modern Android 12+ permissions (`BLUETOOTH_SCAN`, `BLUETOOTH_ADVERTISE`, `BLUETOOTH_CONNECT`).
- **iOS CoreBluetooth**: Dual-role central and peripheral manager with state-restoration handles.
- **Out-of-Band Verification**: Base32 Crockford safety number fingerprints and QR code scanner architecture.
- **Disappearing Messages**: Bounded local database purge timers (5 minutes, 1 hour, 24 hours).
- **Emergency Distress**: SOS distress mode with slide-to-arm trigger guard and priority TTL 7 propagation.
- **Field Testing Package**: Comprehensive physical multi-device checklist (`docs/DEVICE_TEST_CHECKLIST.md`).

### Fixed
- **SEC-01**: Eliminated accidental session persistence into SQLite; session secrets reside exclusively in volatile memory.
- **NET-02**: Eliminated multi-path broadcast loops via cryptographic deduplication and jittered backoff.
- **BLE-03**: Reassembly buffer exhaustion mitigated via strict 15-second expiration sweeps.
- **CRYP-04**: Monotonic 96-bit nonces preventing ChaCha20-Poly1305 nonce reuse and replay attacks.
- **DB-05**: Composite indices added to `pending_messages` table for low-latency store-and-forward sweeps.
- **PRIV-07**: Sanitized lock screen notifications to generic `"New Struct message"` with zero plaintext preview.

### Security Status
- Reviewed against RFC 8439 (ChaCha20-Poly1305), RFC 8032 (Ed25519), and RFC 7748 (X25519).
- Ready for controlled real-device beta testing. Not yet evaluated by an independent commercial auditing firm.
