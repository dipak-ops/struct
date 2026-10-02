# Struct — App Store & Google Play Submission Checklist

---

## 1. App Store Metadata

- **App Name**: `Struct`
- **Subtitle**: `Offline Decentralized Mesh`
- **Short Description**: `Offline decentralized mesh messaging without cellular internet.`
- **Category**: Social Networking / Utilities / Emergency Communications
- **Content Rating**: 4+ / Everyone
- **Support Contact**: `struct.support@gmail.com`
- **Privacy Policy URL**: `https://struct.network/privacy`

---

## 2. Reviewer Testing Instructions (App Store Review & Google Play)

```text
Struct is an offline-first peer-to-peer mesh messenger that operates over Bluetooth Low Energy (BLE).
No central messaging server or cloud account is required for core communication.

To test offline direct and multi-hop messaging:
1. Install Struct on Device A (Android or iPhone).
2. Install Struct on Device B (Android or iPhone).
3. Open Struct on both devices and grant requested Bluetooth permissions.
4. Keep devices within Bluetooth range (1–10 meters).
5. Open the "NODES" tab to observe automatic peer discovery.
6. Tap a discovered node to initiate an end-to-end encrypted session.
7. Send a message: Observe the status change from "↑" (transmitted) to "✓" (delivered).

To test multi-hop relay (Device A -> Device B -> Device C):
1. Place Device A and Device C outside of mutual radio range.
2. Place Device B in the middle.
3. Message sent from Device A will traverse Device B to reach Device C.
```

---

## 3. Play Store Compliance Checklist
- [x] Target SDK: `36` (Android 16 readiness)
- [x] Compile SDK: `36`
- [x] 64-bit ABI support (`arm64-v8a`, `x86_64`)
- [x] Sensitive permissions (`BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `FOREGROUND_SERVICE`) justified with user-facing descriptions
- [x] Zero cloud tracking or analytics SDKs present
- [x] Apple Privacy Manifest (`PrivacyInfo.xcprivacy`) included
