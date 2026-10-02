# Struct 1.0.0 — Release Notes

**Application:** Struct — Offline Decentralized Mesh Messenger  
**Creator:** Dipak Bhondekar  
**Version:** `1.0.0` (Build `1`)  
**Protocol:** `STRUCT-MESH-V1` (Magic: 0x53, Version: 0x01)  

---

## What's New in Struct 1.0.0

### Decentralized Offline Mesh Communication
- Direct device-to-device communication over Bluetooth Low Energy (BLE) without cellular service, Wi-Fi hotspots, or internet access.
- Multi-hop packet relaying: messages travel across intermediate Struct nodes to extend local radio reach.
- Bounded store-and-forward queuing: packets destined for offline peers are securely retained and forwarded when the destination reconnects.

### Cryptographic Security & Local Privacy
- Authenticated end-to-end encryption using ChaCha20-Poly1305 AEAD with ephemeral X25519 key agreements. Intermediate relays forward opaque bytes and cannot inspect message contents.
- Hardware-isolated Ed25519 cryptographic identities stored in Android Keystore / iOS Keychain.
- Out-of-band peer verification via Base32 Crockford safety fingerprints and QR code comparison.
- Monotonic nonce counters and 10,000-entry LRU deduplication window to prevent replay attacks and routing loops.
- Local-first storage: messages saved solely to an on-device SQLite database with zero cloud synchronization.

### Interface & Network Diagnostics
- High-contrast, terminal-inspired black (`#000000`) and neon green (`#00FF66`) interface designed for field readability.
- Live mesh topology visualizer displaying active radio links, node roles, and signal strength in dBm.
- Expandable message telemetry panel with packet ID, hop count, and cryptographic cipher suite verification.
- Emergency SOS mesh broadcast mode with priority routing.

---

## Operating Realities & Known Limitations
- Radio range is governed by 2.4 GHz physical propagation and obstacles (typical indoor range: 10–25 meters; outdoor line-of-sight: 40–70 meters).
- Apple iOS throttles background Bluetooth peripheral advertising when the device is locked and the application is suspended.
- Background relaying on Android requires exempting Struct from aggressive OEM battery-saving policies.
- Struct SOS relies on nearby physical Struct nodes and does **not** replace official emergency services (911/112).
