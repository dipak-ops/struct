# Security Policy — Struct

**Application:** Struct — Offline Decentralized Mesh Messenger  
**Security Status:** Code-Level Cryptographic Audit Completed  
**Independent Evaluation:** Struct has **NOT** undergone an independent commercial third-party security audit.  

---

## 1. Supported Versions

| Version | Supported | Status |
|---|---|---|
| `1.0.0-rc1` / `1.0.0-beta.1` | **YES** | Active Security Maintenance |
| `< 1.0.0` | **NO** | Obsolete Pre-Release |

---

## 2. Reporting a Vulnerability

If you discover a cryptographic vulnerability, memory-safety defect, or identity bypass in Struct:

1. **Do NOT open a public GitHub issue.**
2. Send a detailed report directly to: **`struct.support@gmail.com`**
3. Include:
   - Specific component (e.g. `PacketCodec`, `SessionManager`, `CryptoService`)
   - Reproduction steps or proof-of-concept packet frame
   - Device model, OS version, and toolchain environment
4. The maintainers will respond within 48 hours to acknowledge receipt and coordinate a remediation patch.

---

## 3. Threat Model & Security Invariants

- **Zero Plaintext Relaying**: Intermediate nodes forward encrypted ciphertext packets without possessing decryption keys.
- **Hardware Key Enclave**: Private keys reside strictly in `FlutterSecureStorage` (Android Keystore / iOS Keychain) and never enter SQLite or persistent logs.
- **Monotonic Nonce Counters**: Replay packets and out-of-order counter replays are dropped prior to Poly1305 verification.
- **Deduplication Sliding Window**: Prevents broadcast storms and cyclic multi-hop packet duplication.
- **Metadata Disclaimer**: Struct does **not** claim complete traffic anonymity; intermediate relays observe packet lengths, timestamps, and 16-byte source/destination routing hashes.
