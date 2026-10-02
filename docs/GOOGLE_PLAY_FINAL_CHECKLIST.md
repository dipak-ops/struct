# Google Play Store Final Submission Checklist & Guide

---

## 1. Store Identity & Technical Metadata

- **Application Name**: `Struct`
- **Package Identifier**: `com.struct.app`
- **Release Version**: `1.0.0-rc1` (VersionCode: `1`)
- **Compile SDK**: `36` (Android 16 readiness)
- **Target SDK**: `36` (Google Play 2026 Submission Standard)
- **Minimum SDK**: `26` (Android 8.0 Oreo)
- **Primary Release Artifact**: `struct-1.0.0-beta.aab`
- **Standalone Beta APK**: `struct-1.0.0-beta-arm64.apk`
- **Target Track**: **Internal Testing** (Do NOT publish directly to Production)

---

## 2. Mandatory Google Play Console Form Declarations

### A. Data Safety Form
- Data Collected or Shared: **No**
- All cryptographic keys and message history remain strictly local on device.
- Bluetooth scanning flagged with `neverForLocation` (zero GPS coordinates captured).

### B. Permissions Declarations
- `BLUETOOTH_SCAN`: Needed to discover nearby Struct nodes transmitting GATT Service UUID `0x53545255`.
- `BLUETOOTH_CONNECT`: Needed to transmit and receive ChaCha20-Poly1305 encrypted packet frames.
- `BLUETOOTH_ADVERTISE`: Needed for dual-role local mesh relaying.
- `FOREGROUND_SERVICE_CONNECTED_DEVICE`: Needed to maintain active GATT server for multi-hop packet forwarding while screen is locked.
- `CAMERA`: Optional permission used strictly to scan peer QR safety fingerprints.

### C. Content Rating & Target Audience
- Age Rating: **Everyone / PEGI 3 / 4+**
- Ads: **Contains NO ads**
- In-App Purchases: **Contains NO in-app purchases**

---

## 3. Reviewer Testing Instructions (Paste into Console)

```text
Struct is an offline peer-to-peer decentralized mesh messenger operating over Bluetooth Low Energy (BLE).
No central servers, phone numbers, or cloud accounts are used.

TESTING INSTRUCTIONS FOR GOOGLE PLAY REVIEWERS:
1. Install Struct on two test devices (Device A and Device B).
2. Open the app on both devices and accept the Bluetooth permissions prompt.
3. Bring devices within 2–5 meters.
4. Navigate to the "NODES" tab to observe automatic mutual BLE node discovery.
5. Tap the discovered node to open the chat view.
6. Type a message and tap "SEND":
   - The status glyph transitions from "↑" (Transmitted over BLE) to "✓" (Delivered).
7. Tap the "[ INFO ]" button on the message to inspect the wire packet ID, hop count, and ChaCha20-Poly1305 encryption verification.
```

---

## 4. Status Check
- [x] Target SDK 36 verified
- [x] ProGuard/R8 optimization rules verified
- [x] Zero API keys or cloud secrets in codebase
- [ ] Release signing keystore: **MANUAL ACTION REQUIRED** (Developer must sign with private release key)
- [ ] Privacy Policy live at `https://struct.network/privacy`: **MANUAL ACTION REQUIRED** (Must be hosted prior to submission)
