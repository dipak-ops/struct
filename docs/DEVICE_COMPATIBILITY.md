# Struct — Device Compatibility Matrix & Evaluation

> **ENGINEERING STANDARD**: Struct does **not** claim universal compatibility across every phone. Hardware radio chips (Broadcom, Qualcomm, MediaTek, Apple Silicon) and OEM battery optimizations create distinct operational realities. This document categorizes verified hardware capabilities and field requirements.

---

## 1. Device Classification Categories

### A. Supported Device Requirements
- **Android**: Android 8.0 (API 26) through Android 15/16 with Bluetooth Low Energy (BLE 4.2+) hardware. Dual-role peripheral and central support required for relay nodes.
- **iOS**: iOS 14.0 or newer with Bluetooth Low Energy (BLE 4.2+). iPhone 8 / iPhone X or newer.

---

## 2. Hardware Compatibility Matrix

| Device Name | Manufacturer | Model Identifier | OS Version | BLE Version | Scan Support | Adv Support | Connect | Relay | Background Behavior | Permissions Needed | Status / Result | Known Hardware Limitation | Test Date |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Pixel 8** | Google | GPJ41 | Android 14 / 15 | BLE 5.3 | Yes | Yes | Yes | Yes | Foreground Service maintains link | Modern BLE (API 31+) | **SUPPORTED (Awaiting Lab Run)** | Standard 2.4 GHz RF wall attenuation | Pending |
| **Pixel 7a** | Google | GHL1X | Android 14 | BLE 5.2 | Yes | Yes | Yes | Yes | Standard Android Doze rules | Modern BLE (API 31+) | **SUPPORTED (Awaiting Lab Run)** | None detected | Pending |
| **Galaxy S23** | Samsung | SM-S911B | Android 14 (OneUI 6) | BLE 5.3 | Yes | Yes | Yes | Yes | Samsung Device Care may throttle sleep | Modern BLE + Battery Exemption | **SUPPORTED (Awaiting Lab Run)** | Requires manual exemption from Samsung sleeping apps | Pending |
| **Galaxy A54** | Samsung | SM-A546B | Android 13 / 14 | BLE 5.3 | Yes | Yes | Yes | Yes | Mediated by Foreground Service | Modern BLE | **SUPPORTED (Awaiting Lab Run)** | Intermediate radio throughput on MediaTek chipset | Pending |
| **OnePlus 11** | OnePlus | CPH2449 | OxygenOS 14 (Android 14) | BLE 5.3 | Yes | Yes | Yes | Yes | Aggressive OEM RAM killer | Modern BLE + Auto-launch permit | **SUPPORTED (Awaiting Lab Run)** | OxygenOS aggressive process management | Pending |
| **Xiaomi 13** | Xiaomi | 2211133G | HyperOS (Android 14) | BLE 5.3 | Yes | Yes | Yes | Yes | MIUI battery optimizations | Modern BLE + No Restrictions | **SUPPORTED (Awaiting Lab Run)** | Must enable "No Restrictions" in app battery settings | Pending |
| **iPhone 15 Pro**| Apple | A3102 | iOS 17.5 | BLE 5.3 | Yes | Yes | Yes | Yes | Throttled when locked >15 min | CoreBluetooth | **SUPPORTED (Awaiting Lab Run)** | Apple throttles background advertising when locked | Pending |
| **iPhone 14** | Apple | A2882 | iOS 17.4 | BLE 5.3 | Yes | Yes | Yes | Yes | Throttled when locked >15 min | CoreBluetooth | **SUPPORTED (Awaiting Lab Run)** | Apple throttles background advertising when locked | Pending |
| **iPhone 12** | Apple | A2403 | iOS 16.7 | BLE 5.0 | Yes | Yes | Yes | Yes | Throttled when locked >15 min | CoreBluetooth | **SUPPORTED (Awaiting Lab Run)** | Shorter radio range compared to BLE 5.3 devices | Pending |
| **Moto G54** | Motorola | XT2343 | Android 13 | BLE 5.3 | Yes | Yes | Yes | Yes | Near-stock Android Doze | Modern BLE | **SUPPORTED (Awaiting Lab Run)** | Budget RF front-end antenna sensitivity | Pending |

---

## 3. Platform-Specific Realities

### Android Doze Mode
On devices running Android 9 through 15, entering Doze mode suspends periodic scanning unless a high-priority event occurs or the application is explicitly exempted from battery optimization by the user.

### iOS Background CoreBluetooth Limits
On all iOS versions, background peripheral advertising is placed in an Apple-proprietary hashed state that is only detectable by other iOS applications scanning specifically for the Struct Service UUID. Unrestricted continuous transmission is restricted to active or foreground states.
