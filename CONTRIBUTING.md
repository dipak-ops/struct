# Contributing to Struct

Thank you for your interest in contributing to **Struct**! Struct is an offline-first decentralized mesh messenger created by **Dipak Bhondekar**.

---

## 1. Feature & Protocol Freeze Notice

> **IMPORTANT**: The core wire protocol (`STRUCT-MESH-V1`), cryptographic primitives (Ed25519, X25519, ChaCha20-Poly1305 AEAD), and black/neon-green UI design system are currently **FROZEN**.

Contributions are strictly limited to:
- Real-device hardware bug fixes and platform compatibility edge cases
- Bluetooth radio driver error recovery and MTU negotiation improvements
- Battery consumption profiling and optimizations
- Security hardening and regression test cases

**Do NOT submit PRs adding:**
- Cloud backends or centralized relay servers
- Additional messaging protocols or breaking packet changes
- Social-media features, telemetry, or analytics tracking
- Unbounded live media streaming over low-bandwidth BLE channels

---

## 2. Development Setup

```bash
# 1. Clone repository
git clone https://github.com/dipakbhondekar/struct.git
cd struct

# 2. Retrieve Flutter dependencies
flutter pub get

# 3. Generate Drift SQLite code
dart run build_runner build --delete-conflicting-outputs

# 4. Verify static analysis and tests
flutter analyze
flutter test
```

---

## 3. Pull Request Guidelines

1. Every bug fix must include an automated test (unit or protocol test in `test/`).
2. Changes must preserve zero-cloud, local-first privacy guarantees.
3. Code must conform to standard Dart formatting (`dart format .`).
4. Keep commit messages concise and descriptive.
