# Struct 1.0.0 Release Readiness

## Build
**PASS**

## Automated Tests
**PASS**

## Android Release Build
**PASS** (API 36 targetSdk, API 26 minSdk, ProGuard rules verified)

## iOS Release Build
**READY FOR MAC HOST BUILD** (CoreBluetooth configurations, PrivacyInfo.xcprivacy)

## Permissions
**PASS** (Least privilege verified, camera optional, zero GPS location requests)

## Android Compatibility
**SUPPORTED / PHYSICAL TESTING PENDING** (API 26 through API 36)

## iOS Compatibility
**SUPPORTED / PHYSICAL TESTING PENDING** (iOS 14.0 through iOS 17.5+)

## BLE
**PASS (AUTOMATED & CODEC VERIFIED / PHYSICAL PENDING)**

## Multi-Hop
**PASS (DETERMINISTIC ROUTER & DEDUP VERIFIED / PHYSICAL PENDING)**

## Store-and-Forward
**PASS (15 MB BOUNDED QUEUE & TIMEOUT VERIFIED / PHYSICAL PENDING)**

## Security
**PASS** (Ed25519, X25519, ChaCha20-Poly1305 AEAD, hardware enclave storage)

## Privacy
**PASS** (Zero telemetry, zero cloud backends, local-first storage)

## UI
**FROZEN** (Pure black `#000000` + neon green `#00FF66` terminal interface)

## Protocol
**FROZEN** (`STRUCT-MESH-V1`, Magic: 0x53, Version: 0x01)

## Physical Device Testing
**NOT TESTED** (Hardware field run pending according to `docs/FINAL_PHYSICAL_TEST_CHECKLIST.md`)

## Google Play Readiness
**READY FOR SUBMISSION** (Requires developer account credentials and physical test sign-off)

## Apple App Store Readiness
**READY FOR SUBMISSION** (Requires macOS Xcode archive signing and physical test sign-off)

## Known Limitations

1. **RF Propagation & Attenuation**: BLE 2.4 GHz signal drops across physical obstacles (typical indoor range: 10–25 meters; outdoor line-of-sight: 40–70 meters).
2. **iOS Background Peripheral Advertising**: Apple severely restricts peripheral advertising when an iOS app is suspended and the screen is locked. Real-time multi-hop forwarding is most responsive when at least one node in the chain is active or awakened.
3. **Android Battery Optimization / Doze**: Aggressive OEM battery killers (Samsung Device Care, Xiaomi MIUI) will throttle background BLE scanning unless exempted in Android OS settings.
4. **Metadata Visibility to Relays**: While message payloads are 100% end-to-end encrypted, intermediate relays can observe transmission timestamps, packet sizes, and 16-byte source/destination hashes (anonymity is not claimed).
5. **Emergency Distress (SOS) Disclaimer**: Struct SOS relies on nearby physical devices within radio hop range. It does NOT replace official government emergency services (911/112).

## Required Manual Actions

The following tasks must be completed manually by Dipak Bhondekar on physical hardware and store portals:
1. **Physical Device Execution**: Install release APK on 3 physical devices and record actual measurements in `docs/FINAL_PHYSICAL_TEST_RESULTS.md`.
2. **Release Keystore Generation**: Generate production Android release signing key (`keytool`) and create untracked `android/key.properties`.
3. **Apple Developer Certificates**: Import iOS Distribution Certificate and App Store Provisioning Profile into Xcode on a Mac workstation.
4. **Google Play Console Setup**: Create App record under Google Play Developer Account, upload `struct-1.0.0-beta.aab` to Internal Testing track.
5. **App Store Connect Setup**: Create iOS App record, upload TestFlight build via Xcode Organizer or Transporter.
6. **Privacy Policy Hosting**: Host `docs/PRIVACY_POLICY.md` at public domain `https://struct.network/privacy`.
7. **Store Screenshots**: Capture real 16:9 / 18:9 screenshots from physical test smartphones for store listings.
