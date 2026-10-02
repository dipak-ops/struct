# Struct — Cryptographic Architecture Specification

**System**: Struct Decentralized Mesh Messaging  
**Standard**: Noise Protocol Framework Inspired (Noise_NK & Noise_XX Patterns)  
**Security Level**: ~128-bit modern authenticated encryption  
**Audit Status**: Verified against known primitives; pending third-party external evaluation.

---

## 1. Cryptographic Primitives Selection

Struct relies exclusively on established, standardized, and battle-tested primitives. **No custom or proprietary cryptographic algorithms are used anywhere in the codebase.**

| Function | Primitive | Standard / Reference | Library Implementation |
| :--- | :--- | :--- | :--- |
| **Long-Term Identity** | Ed25519 (Edwards-curve Digital Signature) | RFC 8032 | `cryptography` / libsodium wrapper |
| **Key Agreement** | X25519 (ECDH over Curve25519) | RFC 7748 | `cryptography` / libsodium wrapper |
| **Authenticated Encryption** | ChaCha20-Poly1305 AEAD | RFC 8439 (IETF variant) | `cryptography` (Dart native & hardware-accel) |
| **Key Derivation** | HKDF-SHA256 | RFC 5869 | `cryptography` |
| **Identity Fingerprint** | BLAKE2b-256 / SHA-256 | RFC 7693 / FIPS 180-4 | Base32 Crockford formatted |
| **Entropy / RNG** | Platform Secure RNG | Android `/dev/urandom` / iOS `SecRandomCopyBytes` | Platform CSPRNG via Dart `Random.secure()` |

---

## 2. Key Hierarchy & Lifecycle

```text
+-----------------------------------------------------------+
|                   DEVICE HARDWARE ENCLAVE                 |
|             (Android Keystore / iOS Keychain)             |
|                                                           |
|  Long-Term Identity Keypair:                              |
|   - Ed25519 Private Key (Non-exportable)                  |
|   - Ed25519 Public Key  (Identity fingerprint base)       |
|                                                           |
|  Long-Term Diffie-Hellman Keypair:                        |
|   - X25519 Static Private Key                             |
|   - X25519 Static Public Key                              |
+-----------------------------------------------------------+
                             │
                             ▼
+-----------------------------------------------------------+
|                    VOLATILE MEMORY ONLY                   |
|                                                           |
|  Ephemeral Session Keypair:                               |
|   - X25519 Ephemeral Private Key (Zeroized on session end)|
|   - X25519 Ephemeral Public Key                           |
|                                                           |
|  Shared Secret Derivation:                                |
|   SS = HKDF-Extract(Salt, X25519(Priv_EphA, Pub_StatB))   |
|   (K_Send, K_Recv) = HKDF-Expand(SS, "Struct-Session-v1") |
|                                                           |
|  Directional 96-Bit Nonce Counters:                       |
|   Counter_Send (Monotonic, increments per packet)         |
|   Counter_Recv (Monotonic, rejects replays <= last_seen)  |
+-----------------------------------------------------------+
                             │
                             ▼
+-----------------------------------------------------------+
|                    SQLITE STORAGE (DRIFT)                 |
|                                                           |
|  - Encrypted Ciphertext + 16-byte Poly1305 MAC            |
|  - 12-byte Invariant Nonce (Derived from session counter) |
|  - Message IDs, Timestamps, Verification Status           |
|  * NEVER stores private keys or raw session secrets!      *
+-----------------------------------------------------------+
```

---

## 3. Session Handshake & Forward Secrecy

1. **Discovery (Unauthenticated)**: Peer A and Peer B discover each other via BLE advertisement packets containing an ephemeral 16-byte service token (rotated every 15 minutes to reduce Bluetooth tracking).
2. **Session Init (Noise_NK / Out-of-Band Verified)**:
   - When Peer A initiates contact with known Peer B, A generates an ephemeral keypair $(e_{priv}, e_{pub})$.
   - A computes Diffie-Hellman: $dh_1 = ECDH(e_{priv}, B_{static\_pub})$.
   - $K_{init} = HKDF(dh_1, \text{"Struct-Init-Handshake"})$.
   - Payload encrypted with $K_{init}$ containing A's Ed25519 signature over $(e_{pub} \parallel B_{static\_pub})$.
3. **Session Established**:
   - Both nodes compute symmetric directional keys $(K_{AB}, K_{BA})$.
   - Compromise of long-term identity keys in the future **cannot** decrypt past conversations because ephemeral keys are discarded after session closure.

---

## 4. Replay & Modification Protection

- **Replay Protection**: Each session maintains an in-memory 64-bit sliding window bitmap for nonces. Nonce values equal to or lower than the window lower-bound are dropped without decryption attempts.
- **Integrity Validation**: Poly1305 128-bit authentication tag is checked *before* any plaintext copy is produced. If authentication fails, the frame is dropped and a `SecurityEvent.decryptionFailed` event is recorded.

---

## 5. Security Storage Guarantees

- **Android Keystore**: Cryptographic keys generated inside the Android hardware-backed Keymaster / StrongBox. Key aliases protected with `PURPOSE_SIGN | PURPOSE_DECRYPT`.
- **iOS Keychain**: Attributes configured with `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` and backed by the Secure Enclave processor where available.
