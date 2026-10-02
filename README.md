# Struct — Decentralized Offline Mesh Messenger

**Created by Dipak Bhondekar**  
*Resilient, privacy-first peer-to-peer communication without cellular internet or central servers.*

---

## Overview

**Struct** allows nearby smartphones to communicate directly and relay encrypted messages through intermediate devices over Bluetooth Low Energy (BLE). In disaster zones, remote expeditions, cellular outages, or high-surveillance environments, Struct forms a decentralized ad-hoc local mesh network:

$$\text{Phone A} \xrightarrow{\text{BLE}} \text{Phone B (Relay)} \xrightarrow{\text{BLE}} \text{Phone C (Recipient)}$$

Intermediate nodes relay packets using packet IDs, TTL hop limits, and destination hashes **without ever possessing the cryptographic keys to read or tamper with the user's plaintext message.**

---

## Core Capabilities

- **Offline-First**: Operates seamlessly with Wi-Fi and Cellular data turned completely off.
- **End-to-End Encryption**: ChaCha20-Poly1305 AEAD with ephemeral X25519 key exchange.
- **Multi-Hop Relaying**: Automatic routing across up to 7 hops with controlled forwarding and storm prevention.
- **Store-and-Forward**: Intermediate relays hold encrypted packets until unreachable destinations come back into radio range.
- **Cryptographic Device Identities**: Hardware-backed Ed25519 identity keypairs (Android Keystore / iOS Keychain).
- **Out-of-Band Verification**: Compare human-readable 6-word safety fingerprints or scan peer QR codes.
- **Emergency / SOS Broadcast**: High-priority mesh flood for distress coordination with cancellation tokens.
- **Local SQLite Storage (Drift)**: Reactive local database with zero cloud synchronization.
- **Battery Optimization Profiles**: Configurable scan duty cycles (Battery Saver, Balanced, Performance).

---

## Project Structure

```text
lib/
  app/              # App routing, themes, dependency injection
  core/             # Constants, error types, structured logging, CRC16 utils
  database/         # Drift SQLite tables (identities, peers, messages, pending_messages)
  identity/         # Ed25519 identity generation, peer repository
  security/         # ChaCha20-Poly1305 AEAD, X25519 ECDH, SecureKeyStore, QR verification
  mesh/             # MeshRouter, PacketCodec, Deduplication LRU, TTL manager
  transport/        # BleTransport interface, PacketFragmenter, Reassembler
  messaging/        # EncryptedMessageService, StoreAndForwardEngine, DeliveryService
  channels/         # Public local channels, Emergency channel
  features/         # Splash, Onboarding, Home, Chats, Nearby, Security Center, SOS, Diagnostics
android/            # Kotlin BleService foreground service & GATT management
ios/                # Swift CoreBluetooth Central & Peripheral Manager
docs/               # Technical specs, threat model, cryptographic audit, test plans
```

---

## Getting Started

### Prerequisites
- Flutter SDK `>=3.22.0`
- Android Studio / Xcode

### Commands
```bash
# 1. Fetch dependencies
flutter pub get

# 2. Run code generation for Drift SQLite
flutter pub run build_runner build --delete-conflicting-outputs

# 3. Run full unit, security, and protocol test suite
flutter test

# 4. Analyze codebase
flutter analyze

# 5. Run on attached physical device
flutter run --release
```
