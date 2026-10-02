# Struct — iOS Physical Device Test Protocol

**Document Version:** 1.0.0  
**Target Release:** `1.0.0-rc1` / `1.0.0-beta.1`  
**Platform Target:** Apple iOS 14.0 through iOS 17.5+  

---

## 1. Hardware Cohort

Prepare at least two physical iPhone devices:
- **iPhone Model A**: iPhone 14 / 15 / 15 Pro (iOS 17.4+, BLE 5.3)
- **iPhone Model B**: iPhone 11 / 12 / 13 / SE 3rd Gen (iOS 16.7–17.5, BLE 5.0+)

---

## 2. iOS CoreBluetooth Test Sequence

```text
[ ] STEP 01: Install via Apple TestFlight internal testing build.
[ ] STEP 02: Initial launch -> Verify Bluetooth permission prompt (NSBluetoothAlwaysUsageDescription).
[ ] STEP 03: Radio disabled -> Toggle Bluetooth off in iOS Control Center -> Verify UI alerts user.
[ ] STEP 04: Radio enabled -> Turn Bluetooth on -> Verify CBCentralManager state changes to .poweredOn.
[ ] STEP 05: Foreground discovery -> Discover nearby Android and iOS nodes advertising Service 0x53545255.
[ ] STEP 06: Pair & Verify -> Tap QR verification -> Verify NSCameraUsageDescription prompt and camera feed.
[ ] STEP 07: Direct Messaging -> Transmit encrypted ChaCha20-Poly1305 packet -> Verify delivery ACK.
[ ] STEP 08: App Backgrounding -> Move Struct to background -> Send message from peer -> Verify reception.
[ ] STEP 09: Screen Locked Test -> Lock iPhone screen -> Send message -> Verify behavior within 10 minutes.
[ ] STEP 10: State Restoration -> Force app memory eviction by opening heavy games -> Verify central restoration.
```

---

## 3. Mandatory iOS Background Operating Realities

> **PLATFORM RESTRICTION DISCLAIMER**: Apple iOS strictly regulates background Bluetooth peripheral advertising. When an iOS device has its screen locked and Struct is suspended:
> 1. Peripheral advertisements move to a proprietary "overflow area" only discoverable by iOS devices explicitly scanning for the primary Service UUID.
> 2. Advertisement intervals are throttled by iOS power management.
> 3. Android devices scanning without targeted Service UUID filters cannot discover suspended iOS nodes.
> 4. **Never claim unrestricted background relaying on iOS.** Struct multi-hop relay operates most reliably when at least one node in the chain is active or awakened.
