# Struct — Security Readiness & Pre-Release Checklist

> **AUDIT STATUS**: Struct has NOT yet been subjected to an independent third-party commercial cybersecurity audit. It has completed internal engineering protocol verification, property-based tests, memory exhaustion tests, and cryptographic review against RFC 8439 and RFC 8032.

---

## Readiness Status by Subsystem

### 1. Identity Subsystem: **READY FOR BETA**
- [x] Ed25519 identity key generation via platform CSPRNG.
- [x] Hardware Keystore / Secure Enclave integration.
- [x] Separation of long-term signing keys from transport ephemeral keys.
- [x] Identity fingerprint verification mechanism (QR and visual base32 safety numbers).
- [x] Identity change detection (alerts user if peer public key mutates).

### 2. Encryption Subsystem: **READY FOR BETA**
- [x] ChaCha20-Poly1305 AEAD authenticated encryption.
- [x] Monotonically increasing 96-bit nonces preventing replay and nonce-reuse.
- [x] Ephemeral X25519 Diffie-Hellman key agreement per session.
- [x] Forward secrecy via session key rotation.
- [x] Poly1305 MAC tag verified prior to plaintext decoding.

### 3. Mesh Routing Subsystem: **READY FOR BETA**
- [x] Multi-hop forwarding ($A \to B \to C$) without relay plaintext access.
- [x] Deduplication LRU cache suppressing duplicate packets.
- [x] Strict TTL decrement with hard ceiling (7 hops max).
- [x] Packet expiration validation against epoch time.
- [x] Store-and-Forward bounded queue (max 15 MB) with exponential backoff.
- [x] Controlled flood routing with randomized jitter backoff.

### 4. BLE Transport Subsystem: **READY FOR FIELD TESTING**
- [x] Fragmentation and reassembly for MTU sizes 20–512 bytes.
- [x] Reassembly buffer expiration (15-second timeout).
- [x] Dual-role GATT peripheral and central management.
- [x] Battery profile modes (Battery Saver, Balanced, Performance).
