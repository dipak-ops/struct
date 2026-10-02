# STRUCT RELEASE CANDIDATE

## Version
`1.0.0-rc1`

## Protocol
`STRUCT-MESH-V1` (Magic: 0x53, Version: 0x01)

## Build
**PASS**

## Tests
**PASS**

## Static Analysis
**PASS**

## Android Build
**PASS**

## iOS Build
**DOCUMENTED CONFIGURATION / MAC-HOST REQUIRED**

## Direct BLE
**VERIFIED VIA PROTOCOL HARNESS & NATIVE CODE**

## Multi-Hop
**AUTOMATED VERIFIED**

## Store-and-Forward
**VERIFIED**

## Encryption
**IMPLEMENTED** (Ed25519, X25519, ChaCha20-Poly1305 AEAD)

## Peer Verification
**IMPLEMENTED** (Base32 Crockford safety words & QR exchange)

## Database
**VERIFIED** (Drift SQLite with WAL mode & composite indexes)

## Privacy
**VERIFIED** (Zero cloud accounts, zero telemetry, local enclave keys)

## Background Operation
**DOCUMENTED / PLATFORM-LIMITED** (Android Foreground Service vs iOS CoreBluetooth throttled background)

## Security Testing
**VERIFIED** (Replay, corrupted checksum, TTL ceiling, duplicate drops tested)

## Accessibility
**VERIFIED** (High contrast black & neon green, scalable typography, tactile confirmation)

## UI Design System
**VERIFIED** (Pure black `#000000` + neon green `#00FF66` terminal aesthetic; zero social-app clutter; mesh-native microcopy)

## Real Device Testing
**READY FOR CONTROLLED BETA TESTING**

## Remaining Blockers
None for code freeze. Multi-phone physical RF test execution is the next phase.

## Known Limitations
1. Physical RF range depends on building walls (10-25m indoor typical).
2. iOS severely throttles peripheral advertising when suspended with screen locked.
3. Android requires persistent Foreground Service notification to prevent Doze sleep kills.
4. Intermediate relays can observe packet sizes and routing hashes (anonymity is not claimed).
5. SOS mode relies on nearby devices and does NOT replace official emergency services.

## Recommended Next Step
Proceed to controlled real-device beta testing across physical Android and iOS devices following `docs/DEVICE_TEST_CHECKLIST.md`.
