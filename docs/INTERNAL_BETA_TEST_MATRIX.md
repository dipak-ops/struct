# Struct — Internal Beta Test Matrix

> **AUDIT MANDATE**: Results remain blank or marked `NOT TESTED` until physically executed by the beta cohort on physical hardware.

---

## 1. Multi-Device Beta Matrix

| Test Case | Device A | Device B | Device C | Network State | Bluetooth State | Foreground / Background | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| **BM-01** | Pixel 8 | Galaxy S23 | None | Wi-Fi / Cell OFF | BLE ON | FG -> FG | Direct delivery in < 3s | — | **NOT TESTED** | Physical run pending |
| **BM-02** | Pixel 8 | Galaxy S23 | Xiaomi 13 | Wi-Fi / Cell OFF | BLE ON | FG -> BG -> FG | Multi-hop A->B->C | — | **NOT TESTED** | Physical run pending |
| **BM-03** | Pixel 8 | iPhone 15 | None | Wi-Fi / Cell OFF | BLE ON | FG -> FG | Cross-platform direct | — | **NOT TESTED** | Physical run pending |
| **BM-04** | iPhone 15 | Pixel 8 | None | Wi-Fi / Cell OFF | BLE ON | FG -> FG | Reverse cross-platform | — | **NOT TESTED** | Physical run pending |
| **BM-05** | iPhone 15 | iPhone 14 | None | Wi-Fi / Cell OFF | BLE ON | FG -> FG | Apple-to-Apple link | — | **NOT TESTED** | Physical run pending |
| **BM-06** | Pixel 8 | Galaxy S23 | None | Wi-Fi / Cell OFF | BLE ON | Screen Locked (B) | Background relay | — | **NOT TESTED** | Physical run pending |
| **BM-07** | Pixel 8 | None | None | Radio Toggled | BLE OFF->ON | FG | Seamless auto-reconnect | — | **NOT TESTED** | Physical run pending |
| **BM-08** | Pixel 8 | Galaxy S23 | None | App Killed (A) | BLE ON | Fresh Launch | SQLite history intact | — | **NOT TESTED** | Physical run pending |
