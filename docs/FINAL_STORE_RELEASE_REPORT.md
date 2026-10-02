# Struct 1.0.0 Store Release Report

## Build
**PASS**

## Automated Tests
**PASS**

## Physical Testing
**NOT TESTED** (Awaiting physical hardware execution per `docs/ANDROID_DEVICE_TEST_PROTOCOL.md`)

## Android Signing
**REQUIRED** (Manual action: developer must supply production keystore)

## Android AAB
**READY** (Build configurations, targetSdk 36, ProGuard/R8 verified)

## Google Play Metadata
**READY** (`docs/PLAY_STORE_METADATA.md` and reviewer instructions prepared)

## Google Play Data Safety
**READY** (`docs/GOOGLE_PLAY_DATA_SAFETY_FINAL.md` declarations verified)

## Privacy Policy
**MANUAL ACTION REQUIRED** (Policy text ready; requires live hosting at `https://struct.network/privacy`)

## iOS Signing
**MANUAL ACTION REQUIRED** (Requires active Apple Developer Team on macOS Xcode)

## TestFlight
**MANUAL ACTION REQUIRED** (Requires archive upload from Xcode)

## Store Screenshots
**INCOMPLETE** (Checklist prepared in `docs/STORE_SCREENSHOT_CHECKLIST.md`; must be captured from physical devices)

## Release Notes
**READY** (Prepared in `docs/RELEASE_NOTES_1.0.0.md`)

## Legal / Support
**READY** (MIT License, Code of Conduct, Security policy, Support email configured)

## Known Limitations
1. Physical RF range depends on building walls and 2.4 GHz propagation (10–25m indoor typical).
2. iOS severely throttles background peripheral advertising when the screen is locked and app suspended.
3. Android requires persistent Foreground Service notification to prevent Doze sleep kills.
4. Intermediate relays can observe packet sizes and routing hashes (anonymity is not claimed).
5. SOS mode relies on nearby devices and does NOT replace official emergency services.

## Manual Actions
1. **Sign Android Release AAB**: Generate production keystore and build signed AAB.
2. **Execute Physical Test Protocol**: Run physical tests A through X across 3 physical devices and log results.
3. **Host Privacy Policy**: Deploy `docs/PRIVACY_POLICY.md` to `https://struct.network/privacy`.
4. **Capture Real Screenshots**: Take physical device screenshots per `docs/STORE_SCREENSHOT_CHECKLIST.md`.
5. **Xcode TestFlight Archive**: Open `ios/Runner.xcworkspace` in Xcode on a Mac, archive, and upload to TestFlight.
6. **Submit to Google Play Internal Testing**: Upload signed AAB to Google Play Console Internal Testing track.

## Final Status
**BLOCKED — ACTIONS REQUIRED** (Physical testing, release signing, and privacy policy deployment must be performed manually prior to store rollout).
