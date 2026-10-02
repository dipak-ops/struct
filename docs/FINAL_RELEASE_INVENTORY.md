# Struct — Final Release Inventory & Audit

**Release Version:** `1.0.0-rc1`  
**Protocol Version:** `STRUCT-MESH-V1` (Magic: 0x53, Version: 0x01)  
**Status:** **AUDITED & FEATURE FROZEN**  

---

## 1. Source Tree Verification

| Path | Description | Audit Status |
|---|---|---|
| `lib/core/constants.dart` | Wire limits, hop limits, buffer sizes | **CLEAN** |
| `lib/core/errors.dart` | Strongly typed domain exception hierarchy | **CLEAN** |
| `lib/mesh/models/packet.dart` | MeshPacket and PacketType definitions | **CLEAN** |
| `lib/mesh/packet_codec.dart` | Binary canonical encoder/decoder & CRC16 | **CLEAN** |
| `lib/mesh/deduplication_service.dart` | 10k-entry LRU sliding window deduplication | **CLEAN** |
| `lib/mesh/ttl_manager.dart` | Hop decrement and 7-hop limit ceiling | **CLEAN** |
| `lib/mesh/mesh_router.dart` | Destination dispatch and multi-hop forwarding | **CLEAN** |
| `lib/transport/fragmenter.dart` | BLE MTU frame slicing | **CLEAN** |
| `lib/transport/reassembler.dart` | 15s timeout bounded fragment reassembler | **CLEAN** |
| `lib/security/key_store.dart` | Hardware Keystore / Keychain enclave storage | **CLEAN** |
| `lib/security/crypto_service.dart` | Ed25519, X25519, ChaCha20-Poly1305 AEAD | **CLEAN** |
| `lib/security/session_manager.dart` | Monotonic 96-bit nonces, forward secrecy | **CLEAN** |
| `lib/security/verification_service.dart` | Base32 Crockford fingerprints and QR schemas | **CLEAN** |
| `lib/database/app_database.dart` | Drift SQLite tables (WAL mode, composite indices) | **CLEAN** |
| `lib/messaging/store_and_forward.dart` | Bounded 15 MB queue with backoff sweeps | **CLEAN** |
| `lib/messaging/encrypted_message_service.dart`| End-to-end encryption and delivery ACKs | **CLEAN** |
| `android/app/src/main/kotlin/com/struct/app/BleService.kt` | Foreground BLE central/peripheral service | **CLEAN** |
| `android/app/src/main/kotlin/com/struct/app/MainActivity.kt` | Android MethodChannel bridge | **CLEAN** |
| `android/app/src/main/AndroidManifest.xml` | Modern BLE API 31+ permissions | **CLEAN** |
| `android/app/build.gradle` | API 36 compile/target SDK, ProGuard enabled | **CLEAN** |
| `ios/Runner/BleCentralPeripheralManager.swift` | Swift CoreBluetooth central/peripheral restoration | **CLEAN** |
| `ios/Runner/Info.plist` | CoreBluetooth usage strings & background modes | **CLEAN** |
| `ios/Runner/PrivacyInfo.xcprivacy` | Apple iOS Privacy Manifest | **CLEAN** |
| `test/packet_validation_negative_test.dart` | Corrupted packet, wrong magic/version tests | **PASS** |
| `test/multi_hop_routing_test.dart` | $A \to B \to C$ routing & loop suppression | **PASS** |
| `test/fragmentation_reassembly_test.dart` | Out-of-order reassembly and MTU slicing | **PASS** |
| `test/store_and_forward_test.dart` | Offline retention and drain retries | **PASS** |
| `test/mesh_packet_test.dart` | TTL ceiling and expiration tests | **PASS** |

---

## 2. Secrets & Credential Scan Results

- Real API Keys: **NONE**
- Real Private Keys: **NONE**
- Cloud Tokens: **NONE**
- Keystores in Git: **NONE** (Excluded via `.gitignore`)
- Plaintext Databases in Git: **NONE** (Excluded via `.gitignore`)
- Debug / Simulator Leakage in User UI: **CLEANED**
