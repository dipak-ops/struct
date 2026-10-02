# Struct — Final Dependency Audit

All third-party packages in `pubspec.yaml` have been audited for runtime safety, license compatibility, and security criticality:

| Package | Version | License | Security Criticality | Purpose |
|---|---|---|---|---|
| `flutter` | `>=3.22.0` | BSD-3-Clause | CORE | Cross-platform UI framework |
| `cryptography` | `^2.7.0` | Apache-2.0 | CRITICAL | Ed25519, X25519, ChaCha20-Poly1305 AEAD, HKDF |
| `flutter_secure_storage` | `^9.2.0` | BSD-3-Clause | CRITICAL | Android Keystore / iOS Keychain hardware enclave |
| `drift` | `^2.18.0` | MIT | HIGH | Local-first reactive SQLite database (WAL mode) |
| `sqlite3_flutter_libs` | `^0.5.20` | MIT | HIGH | Bundled native SQLite C-libraries |
| `flutter_reactive_ble` | `^5.3.1` | Apache-2.0 | HIGH | Reactive BLE GATT scanning & characteristic transfers |
| `local_auth` | `^2.2.0` | BSD-3-Clause | MEDIUM | Biometric App Lock authentication |
| `qr_flutter` | `^4.1.0` | BSD-3-Clause | LOW | Out-of-band identity safety number QR rendering |
| `uuid` | `^4.4.0` | MIT | LOW | Cryptographically secure random packet UUIDs |
| `crypto` | `^3.0.3` | BSD-3-Clause | MEDIUM | SHA-256 fingerprint generation |
