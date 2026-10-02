# Struct — Physical Test Handoff Guide

**Product:** Struct — Offline Decentralized Mesh Messenger  
**Creator:** Dipak Bhondekar  
**Target:** Physical Android & iOS Testing Protocol  
**Release Candidate:** `1.0.0-rc1`  

---

## 1. Setup Instructions for Testers

1. **Build Release APK**:
   ```bash
   flutter build apk --release
   ```
2. **Install on 3 Physical Smartphones**:
   - Device A: Primary Sender (e.g. Google Pixel)
   - Device B: Intermediate Relay (e.g. Samsung Galaxy)
   - Device C: Destination Recipient (e.g. Google Pixel or iPhone)
3. **Turn OFF Wi-Fi and Cellular Data** on all devices to ensure 100% offline BLE testing.
4. **Launch Struct** on all devices and grant Bluetooth permissions when prompted.
5. Follow the step-by-step procedures in `docs/FINAL_PHYSICAL_TEST_CHECKLIST.md`.

---

## 2. Key Observations to Record
- Latency between message dispatch on Phone A and delivery receipt on Phone C.
- Physical distance limit through local building walls.
- Battery percentage drop over a 4-hour relay endurance period.
- Record all results directly in `docs/FINAL_PHYSICAL_TEST_RESULTS.md`.
