# Struct — Cross-Platform Interoperability Test Results

> **AUDIT MANDATE**: Results below must reflect actual physical observations. All test entries are initialized to `NOT TESTED` until physically executed on hardware devices.

---

## 1. Test Matrix Overview

| Test ID | Sender Device | Intermediate Relay | Receiver Device | State (FG/BG) | Execution Status | Latency (ms) | Observed Failure Reason | Notes |
|---|---|---|---|---|---|---|---|---|
| **XP-01** | Android (Pixel 8) | None (Direct Link) | Android (Galaxy S23) | FG -> FG | **NOT TESTED** | — | — | Awaiting hardware run |
| **XP-02** | Android (Pixel 8) | Android (Galaxy S23)| Android (OnePlus 11) | FG -> BG -> FG| **NOT TESTED** | — | — | Awaiting hardware run |
| **XP-03** | Android (Pixel 8) | None (Direct Link) | iPhone (15 Pro) | FG -> FG | **NOT TESTED** | — | — | Awaiting hardware run |
| **XP-04** | iPhone (15 Pro) | None (Direct Link) | Android (Pixel 8) | FG -> FG | **NOT TESTED** | — | — | Awaiting hardware run |
| **XP-05** | Android (Pixel 8) | iPhone (15 Pro Relay)| Android (Galaxy S23) | FG -> BG -> FG| **NOT TESTED** | — | — | Awaiting hardware run |
| **XP-06** | iPhone (15 Pro) | Android (Pixel 8 Relay)| iPhone (14) | FG -> FG -> FG| **NOT TESTED** | — | — | Awaiting hardware run |
| **XP-07** | iPhone (15 Pro) | None (Direct Link) | iPhone (14) | FG -> Screen Lock | **NOT TESTED** | — | — | Awaiting hardware run |
| **XP-08** | Android (Pixel 8) | None (Direct Link) | iPhone (15 Pro) | FG -> Screen Lock | **NOT TESTED** | — | — | Awaiting hardware run |

---

## 2. Cross-Vendor GATT Interoperability Notes
- MTU Negotiation: Android supports MTU up to 517 bytes; iOS CoreBluetooth limits typical GATT characteristic writes to 185–512 bytes depending on device model.
- Struct's `PacketFragmenter` slices payloads into MTU-safe fragments (default 23-byte MTU baseline, dynamically expanding upon successful negotiation).
