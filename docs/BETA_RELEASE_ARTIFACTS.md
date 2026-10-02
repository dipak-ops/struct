# Struct — Beta Release Artifacts & Reproducible Verification

**Version:** `1.0.0-beta.1` (RC candidate `1.0.0-rc1`)  
**Build Number:** `1`  
**Git Commit / Tag:** `v1.0.0-beta.1`  
**Protocol:** `STRUCT-MESH-V1` (Magic: 0x53, Version: 0x01)  

---

## 1. Verified Release Build Targets

| Artifact Filename | Packaging | Target ABI | SHA-256 Checksum | Release Track |
|---|---|---|---|---|
| `struct-1.0.0-beta.aab` | Android App Bundle | Multi-ABI Universal | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Google Play Internal Testing |
| `struct-1.0.0-beta-arm64.apk` | Standalone APK | `arm64-v8a` | `a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e` | Direct Beta Sideloading |
| `struct-1.0.0-beta-armv7.apk` | Standalone APK | `armeabi-v7a` | `f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2` | Legacy 32-bit Sideloading |
| `Runner.xcarchive` | Xcode iOS Archive | `arm64` | `[Generated on macOS Xcode Build Host]` | Apple TestFlight Distribution |

---

## 2. Toolchain Lock
- Flutter: `3.22.2`
- Dart: `3.4.3`
- AGP: `8.3.1`
- Gradle: `8.4`
- Java JDK: `17 LTS`
- Kotlin: `1.9.23`
- Android targetSdk: `36`
- iOS target: `14.0`
