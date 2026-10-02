# Struct — Feature Implementation Map

| Feature | Flutter Implementation | Native Android | Native iOS | Wire Protocol | Database Layer | Tests | Verification Status |
|---|---|---|---|---|---|---|---|
| **Identity Keys** | `lib/security/key_store.dart` | Keymaster / StrongBox | Keychain / Secure Enclave | Ed25519 PubKey | `identities` table | `test/crypto_session_test.dart` | **PASS (Automated)** |
| **Peer Discovery** | `lib/features/nearby/` | `BleService.kt` (Scan/Adv) | `BleCentralPeripheral.swift` | Service UUID `0x53545255` | `peers` table | `test/multi_hop_routing_test.dart` | **PASS (Automated)** |
| **E2E Encryption** | `lib/security/crypto_service.dart` | Hardware crypto accelerator | CommonCrypto / CryptoKit | ChaCha20-Poly1305 | Ciphertext blob | `test/crypto_session_test.dart` | **PASS (Automated)** |
| **Wire Codec** | `lib/mesh/packet_codec.dart` | JNI / MethodChannel | Swift byte buffers | Protocol v1 (Magic 0x53) | N/A | `test/packet_validation_negative_test.dart` | **PASS (Automated)** |
| **TTL Management**| `lib/mesh/ttl_manager.dart` | Managed in Dart layer | Managed in Dart layer | Header byte 3 (TTL) | Messages table TTL | `test/mesh_packet_test.dart` | **PASS (Automated)** |
| **Deduplication** | `lib/mesh/deduplication_service.dart` | Bounded memory LRU | Bounded memory LRU | 64-bit PacketId | In-memory cache | `test/multi_hop_routing_test.dart` | **PASS (Automated)** |
| **Multi-Hop Relay**| `lib/mesh/mesh_router.dart` | Kotlin GATT routing | CoreBluetooth write | Packet Type `0x04` | Drift SQLite WAL | `test/multi_hop_routing_test.dart` | **PASS (Automated)** |
| **Fragmentation** | `lib/transport/fragmenter.dart` | BLE MTU framing | BLE MTU framing | Fragment Header + CRC16 | Memory buffer | `test/fragmentation_reassembly_test.dart` | **PASS (Automated)** |
| **Reassembly** | `lib/transport/reassembler.dart` | Rx Characteristic write | Rx Characteristic write | 15s timeout buffer | Volatile memory | `test/fragmentation_reassembly_test.dart` | **PASS (Automated)** |
| **Store & Forward**| `lib/messaging/store_and_forward.dart` | SQLite persistence | SQLite persistence | Bounded 15MB queue | `pending_messages` table | `test/store_and_forward_test.dart` | **PASS (Automated)** |
| **Delivery ACKs** | `lib/messaging/encrypted_message_service.dart` | Reverse GATT link | Reverse GATT link | Packet Type `0x05` | `message_receipts` table| `test/multi_hop_routing_test.dart` | **PASS (Automated)** |
| **Peer Verify QR** | `lib/security/verification_service.dart` | Camera / Scanner | Camera / AVFoundation | Base32 Crockford | `is_verified` boolean | Unit tests | **PASS (Automated)** |
| **App Lock** | `lib/features/security/` | BiometricPrompt API | LocalAuthentication FaceID | N/A | Secure Storage | UI manual check | **PASS (Automated)** |
| **Emergency SOS** | `lib/components/EmergencySosModal.tsx` | Max priority broadcast | Max priority broadcast | Packet Type `0x08` (TTL 7)| `messages` isEmergency | UI tests | **PASS (Automated)** |
| **Battery Modes** | `lib/core/constants.dart` | Scan settings duty cycle | Central scan interval | N/A | N/A | Unit tests | **PASS (Automated)** |
