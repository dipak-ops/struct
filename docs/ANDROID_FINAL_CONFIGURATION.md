# Struct — Android Final Release Configuration

**Target Platform:** Android (Google Play 2026 Store Compliance)  
**Configuration Date:** October 2026  
**Status:** **FROZEN**  

---

## 1. Toolchain & SDK Lock

```groovy
compileSdk = 36          // Android 16 Readiness
targetSdk = 36           // Required for 2026 Google Play Submissions
minSdk = 26              // Android 8.0 Oreo minimum (Covers 98%+ of active Android devices)
ndkVersion = "26.3.11579264"
javaVersion = JavaVersion.VERSION_17
kotlinVersion = "1.9.23"
gradlePlugin = "8.3.1"
gradleWrapper = "8.4"
```

---

## 2. Permissions Declared in `AndroidManifest.xml`

```xml
<!-- Modern Bluetooth Permissions (Android 12+ / API 31+) -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- Legacy Fallback (API <= 30) -->
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />

<!-- Foreground Service for Continuous Offline Mesh Relay -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

---

## 3. R8 / ProGuard Optimization Rules

All native cryptographic primitives and SQLite bindings are explicitly preserved in `android/app/proguard-rules.pro`:
- `-keep class com.struct.app.** { *; }`
- `-keep class com.cryptography.** { *; }`
- `-keep class androidx.security.crypto.** { *; }`
- `-keep class androidx.room.** { *; }`
- `-keep class org.sqlite.** { *; }`
