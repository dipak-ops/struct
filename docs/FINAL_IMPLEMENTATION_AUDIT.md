# Struct — Final Implementation Forensic Audit

**Application**: Struct (Decentralized Offline BLE Mesh Messenger)  
**Version**: 1.0.0-rc1 (Feature Freeze)  
**Date**: October 2026  
**Auditor**: Senior Software Architect & Security Engineering Review  
**Status**: Ready for Controlled Real-Device Field Beta Testing  

---

## Forensic Verification Matrix

| Area | Expected Behavior | Actual Implementation | Status | Risk | Required Action |
|---|---|---|---|---|---|
| **Identity Keys** | Ed25519 key generation via platform CSPRNG; private key stored in hardware enclave only | Generated via `cryptography` Ed25519; private keys stored in `FlutterSecureStorage` (Keystore/Keychain); zero private keys in SQLite | **PASS** | LOW | Audit platform key extraction on rooted devices in field testing |
| **Key Agreement** | Ephemeral X25519 ECDH + HKDF session key derivation | Implemented in `CryptoService` & `SessionManager`; ephemeral session keys maintained in volatile memory | **PASS** | LOW | Complete out-of-band identity verification before trusting session |
| **AEAD Encryption** | ChaCha20-Poly1305 with unique nonces per message; Poly1305 MAC tag checked before decode | 96-bit monotonic counter + salt; MAC tag checked prior to producing plaintext; failed MAC safely rejected | **PASS** | LOW | Monitor monotonic counter persistence across forced process kill |
| **Wire Protocol** | Canonical binary frame with magic byte `0x53`, version 1, CRC-16 check, bounded length | Fully implemented in `PacketCodec`; checks magic, version, TTL ceiling, CRC-16; throws `PacketValidationError` | **PASS** | LOW | Freeze protocol v1; do not mutate existing fields |
| **Multi-Hop Relay** | $A \to B \to C$ where Relay B decrements TTL, checks dedup, and forwards without plaintext | Implemented in `MeshRouter` & simulator; B inspects opaque ciphertext; destination checked; delivery ACK routed back | **PASS** | MEDIUM | Physical multi-device field testing required |
| **Deduplication** | LRU cache with sliding window suppressing duplicate packets and loops | `DeduplicationService` bounded at 10,000 items with 30-min window; drops duplicate packets immediately | **PASS** | LOW | Verified via `test/multi_hop_routing_test.dart` |
| **Hop Limit / TTL** | Strict decrement ($TTL - 1$); drops packet when TTL reaches 0; ceiling 7 | Enforced in `TtlManager` and `MeshPacket`; drops at TTL $\le 1$ when preparing outbound relay | **PASS** | LOW | Verified via `test/mesh_packet_test.dart` |
| **Fragmentation** | Splits packets into BLE MTU chunks (20-512B) with reassembly timeout | `PacketFragmenter` & `PacketReassembler` implemented with 15s timeout and 64 fragment ceiling | **PASS** | MEDIUM | Validate varying physical MTU negotiation across Android/iOS radios |
| **Store & Forward** | Intermediate relay holds packet for offline peer; max 15MB storage; backoff retries | `StoreAndForwardManager` enforces 15MB total limit and 500 pkts/peer; drains when peer reconnects | **PASS** | MEDIUM | Test relay restart persistence in physical SQLite tables |
| **Android BLE** | Dual-role peripheral and central; Foreground service with ongoing notification | Implemented in Kotlin `BleService.kt` and `MainActivity.kt` with modern Android 12+ permissions | **PLATFORM-LIMITED** | MEDIUM | Android Doze mode can throttle background execution if exempted battery is revoked |
| **iOS CoreBluetooth**| Central & Peripheral state restoration; background BLE advertising | Implemented in Swift `BleCentralPeripheralManager.swift` and `Info.plist` | **PLATFORM-LIMITED** | HIGH | iOS severely curtails background peripheral advertising when screen is locked |
| **App Lock** | Local PIN/Biometric lock without plaintext PIN storage | PBKDF2/SHA256 derived verifier + `local_auth` platform biometrics | **PASS** | LOW | Physical biometric hardware verification |
| **Emergency SOS** | High-priority mesh flood with slide-to-confirm accidental guard | Implemented in `EmergencySosModal` with TTL 7 and priority routing | **DOCUMENTED LIMITATION** | HIGH | SOS relies strictly on nearby devices; does NOT replace emergency services |
| **Media / Files** | Bounded chunked file transfer | Architecture defined in documentation; full streaming omitted to prevent RF saturation | **DOCUMENTED LIMITATION** | LOW | Marked as Future/Secondary; voice notes and large media restricted in v1 |
| **Analytics/Cloud** | Zero telemetry, zero cloud accounts, zero analytics servers | Entirely offline; zero HTTP/HTTPS tracking; zero remote database synchronization | **PASS** | NONE | Verified offline architecture |
