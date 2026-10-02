# Struct — Part 4 Final Technical & Security Audit

**Application**: Struct (Decentralized Offline BLE Mesh Messenger)  
**Version**: 1.0.0-rc1 (Post-Part 3 Hardening)  
**Audit Conducted**: Engineering & Reliability Audit  
**Author**: Lead Software Architect & Security Engineering Review  
**Date**: October 2026  
**Status**: Ready for Controlled Real-Device Lab & Field Beta Testing  

---

## 1. Executive Summary & Disclaimer

> **IMPORTANT DISCLAIMER**: This document represents an internal engineering and architecture audit focusing on protocol correctness, memory safety, cryptographic sanity, BLE state machine resilience, and abuse mitigation. Struct has **not** yet been certified by an accredited third-party security firm. It is strictly designated for controlled beta testing.

Struct implements a decentralized, offline-first mesh protocol designed to operate over Bluetooth Low Energy (BLE) without reliance on cellular data, Wi-Fi infrastructure, or cloud servers. The multi-hop relay mechanism allows packets to traverse intermediate nodes ($A \to B \to C$) with end-to-end encrypted payloads and authenticated headers.

---

## 2. Audit Severity Classification

| Severity | Description | Criteria |
| :--- | :--- | :--- |
| **CRITICAL** | Potential remote code execution, private key exposure, authentication bypass | Immediate fix required |
| **HIGH** | Packet loop storms, unauthorized decryption, replay attack acceptance | Must be resolved before testing |
| **MEDIUM** | Relay memory exhaustion, unindexed DB queries under heavy load, race condition in GATT reconnect | Addressed in this hardening cycle |
| **LOW** | Minor UI state inconsistency, non-leaking diagnostic log formatting | Polish & code cleanliness |
| **INFO** | Architectural notes, OS-level background constraints, documentation | Clarifications |

---

## 3. Findings & Resolution Matrix

### Finding SEC-01 [CRITICAL] — Separation of Long-Term Identity & Ephemeral Session Material
- **Location**: `lib/security/key_store.dart`, `lib/security/crypto_service.dart`
- **Issue**: Initial prototype designs could inadvertently persist ephemeral session keys into SQLite alongside message metadata.
- **Impact**: Extraction of the SQLite database file would allow retroactive decryption of historical sessions.
- **Root Cause & Fix**: Hardened the architecture. The long-term Ed25519 identity key and X25519 key-agreement material are stored strictly in hardware-backed secure storage (`FlutterSecureStorage` utilizing Android Keystore / iOS Keychain with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`). SQLite Drift tables store only peer public keys and message ciphertexts with associated nonces. Ephemeral session state resides strictly in volatile memory.
- **Status**: **RESOLVED**

---

### Finding NET-02 [HIGH] — Forwarding Storms in Multi-Path Topologies ($A \to B, A \to C, B \to D, C \to D$)
- **Location**: `lib/mesh/mesh_router.dart`, `lib/mesh/deduplication_service.dart`
- **Issue**: In diamond and cyclic mesh topologies, a packet transmitted by A could be received simultaneously by B and C, both attempting to forward it to D and back to each other, multiplying airtime contention.
- **Impact**: BLE characteristic congestion, high packet drop rates, rapid battery depletion.
- **Fix Implemented**:
  1. Strict 64-bit cryptographic `packetId` deduplication using an LRU cache with a sliding time window (default 30 minutes, bounded at 10,000 entries).
  2. Jittered retransmission delay: Relays inject a pseudorandom backoff (150ms–400ms) before broadcasting forwarding fragments.
  3. Strict TTL decrement ($TTL_{new} = TTL_{in} - 1$). If $TTL \le 0$, the packet is dropped immediately.
  4. Max hop limit hard ceiling enforced at 7 hops.
- **Status**: **RESOLVED**

---

### Finding BLE-03 [HIGH] — GATT MTU Fragmentation & Incomplete Frame Deserialization
- **Location**: `lib/transport/fragmenter.dart`, `lib/transport/reassembler.dart`
- **Issue**: Standard BLE attributes often have an effective payload limit of 20 bytes (with 23-byte default ATT MTU) or up to 512 bytes with MTU negotiation. Dropped packets mid-stream could stall reassembly buffers indefinitely.
- **Impact**: Memory leaks from abandoned fragment sequences; buffer desynchronization.
- **Fix Implemented**:
  1. Packet fragmentation frames now carry: `[packetId (8B) | seqIndex (2B) | totalCount (2B) | payloadLength (2B) | chunkData (NB) | crc16 (2B)]`.
  2. Every pending reassembly buffer has a strict 15-second TTL. Unfinished sequences are evicted and safely deallocated.
  3. Max fragments per packet capped at 64 (limiting max mesh payload size to 32 KB, preventing heap exhaustion).
- **Status**: **RESOLVED**

---

### Finding CRYP-04 [HIGH] — Nonce Management in ChaCha20-Poly1305 Sessions
- **Location**: `lib/security/session_manager.dart`
- **Issue**: Nonce reuse under ChaCha20-Poly1305 is catastrophic to confidentiality.
- **Impact**: Potential plaintext recovery if the same 96-bit nonce is used twice with the same symmetric key.
- **Fix Implemented**:
  1. Switched to established AEAD construction utilizing a 96-bit monotonically increasing counter combined with a 32-bit random salt per session direction (Noise Framework pattern).
  2. Automatic session re-keying triggered after $2^{16}$ messages or 24 hours of inactivity.
  3. Inbound packets with duplicate or backwards nonces are discarded to prevent replay attacks.
- **Status**: **RESOLVED**

---

### Finding DB-05 [MEDIUM] — Query Latency on High-Volume Pending Message Relays
- **Location**: `lib/database/tables/pending_messages.dart`, `lib/database/app_database.dart`
- **Issue**: `pending_messages` table scans without composite indexes caused UI jitter during periodic store-and-forward sweeps when storing >5,000 relayed messages.
- **Fix Implemented**:
  Added composite database indexes:
  `CREATE INDEX idx_pending_delivery ON pending_messages (destination_id, next_attempt_at, expires_at);`
  `CREATE INDEX idx_messages_channel_created ON messages (channel_id, created_at DESC);`
- **Status**: **RESOLVED**

---

### Finding BAT-06 [MEDIUM] — Unbounded BLE Scanning Duty Cycle
- **Location**: `lib/transport/ble_transport.dart`, `lib/settings/models/battery_mode.dart`
- **Issue**: Continuous 100% duty-cycle scanning drains smartphone batteries in 4–6 hours.
- **Fix Implemented**:
  Introduced 3 explicit user-configurable operating profiles:
  - **Performance**: 80% scan duty cycle (scan 4s, pause 1s), advertisement interval 250ms.
  - **Balanced (Default)**: 40% scan duty cycle (scan 2s, pause 3s), advertisement interval 650ms.
  - **Battery Saver**: 15% scan duty cycle (scan 1.5s, pause 8.5s), advertisement interval 1200ms.
- **Status**: **RESOLVED**

---

### Finding PRIV-07 [LOW] — OS Notification Preview Information Leakage
- **Location**: `lib/features/settings/privacy_settings.dart`, `lib/messaging/delivery_service.dart`
- **Issue**: Lock screen notifications displayed sender name and partial message preview, leaking metadata to bystander observation.
- **Fix Implemented**:
  Default notification payload sanitized to generic `"New Struct message"` with no peer display name or preview snippet unless the user explicitly toggles on `"Show Previews"` under Privacy Settings.
- **Status**: **RESOLVED**

---

## 4. Final Quality & Hardening Verification Checklist

- [x] Zero hardcoded secrets, private keys, or API tokens in codebase
- [x] Zero plain private keys stored in SQLite/Drift databases
- [x] Zero plaintext messages logged in release logging targets
- [x] Strict input validation for all inbound BLE byte arrays before allocation
- [x] Cryptographic deduplication cache with sliding expiration window
- [x] Hop limit / TTL ceiling enforced and verified
- [x] Store-and-Forward bounded storage (max 15 MB / max 500 packets per peer)
- [x] Identity verification fingerprint generation (RFC-4648 Base32 human-readable words & QR)
- [x] Android 12+ modern Bluetooth permissions (`BLUETOOTH_SCAN`, `BLUETOOTH_ADVERTISE`, `BLUETOOTH_CONNECT`)
- [x] iOS CoreBluetooth peripheral & central manager state-restoration handles implemented
- [x] All automated unit and protocol tests passing
