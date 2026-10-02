# Struct — Release Build & Signing Engineering Guide

This document specifies the exact, reproducible commands and security configurations required to build Struct Release Candidate binaries.

---

## 1. Environment Requirements
- Flutter SDK: `3.22.x` or later
- Dart SDK: `3.4.x` or later
- Android NDK: `26.x`
- Java JDK: OpenJDK 17
- Xcode: 15.x+ (for iOS release builds)

---

## 2. Android Release Build

### Signing Separation
Release signing keys must **never** be placed in the Git repository. Place the keystore outside the source tree:

Create `android/key.properties` (ignored by `.gitignore`):
```properties
storePassword=SECURE_PASSWORD_HERE
keyPassword=SECURE_PASSWORD_HERE
keyAlias=struct_release_key
storeFile=/path/to/external/keystores/struct_release.jks
```

### Build Commands:
```bash
# 1. Clean workspace
flutter clean

# 2. Retrieve dependencies
flutter pub get

# 3. Generate Drift SQLite code
dart run build_runner build --delete-conflicting-outputs

# 4. Verify static analysis
flutter analyze

# 5. Execute all unit and security test suites
flutter test

# 6. Build production APK
flutter build apk --release --split-per-abi

# 7. Build Android App Bundle (for Play Store Distribution)
flutter build appbundle --release
```

### ProGuard / R8 Rules (`android/app/proguard-rules.pro`)
Ensure cryptographic primitives and Drift SQLite tables are preserved:
```proguard
-keep class com.struct.app.** { *; }
-keep class com.cryptography.** { *; }
-keep class androidx.room.** { *; }
-dontwarn okio.**
```

---

## 3. iOS Release Build

```bash
# 1. Prepare pods
cd ios && pod install --repo-update && cd ..

# 2. Build iOS Archive
flutter build ipa --release --export-options-plist=ios/ExportOptions.plist
```
