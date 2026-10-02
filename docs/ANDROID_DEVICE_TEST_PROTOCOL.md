# Struct — Android Physical Device Test Protocol

**Document Version:** 1.0.0  
**Target Release:** `1.0.0-rc1` / `1.0.0-beta.1`  
**Protocol:** `STRUCT-MESH-V1`  

---

## 1. Hardware Test Cohort Requirements

Prepare at least three physical Android devices from different manufacturers to validate cross-OEM BLE stack interoperability:
- **Device A (Primary Sender)**: Google Pixel (e.g., Pixel 7/8, Android 14/15, BLE 5.2+)
- **Device B (Intermediate Relay)**: Samsung Galaxy (e.g., S23/S24 or A54, Android 14 OneUI 6, BLE 5.3)
- **Device C (Destination Recipient)**: Motorola / Xiaomi / OnePlus (Android 13/14, MediaTek or Qualcomm BLE chipset)

---

## 2. 26-Step Sequential Execution Checklist

```text
[ ] STEP 01: Fresh Install via adb install struct-1.0.0-beta-arm64.apk
[ ] STEP 02: First Launch & Splash Boot Sequence verification
[ ] STEP 03: Bluetooth Permission prompt (BLUETOOTH_SCAN, CONNECT, ADVERTISE on API 31+)
[ ] STEP 04: Notification Permission prompt (POST_NOTIFICATIONS on API 33+)
[ ] STEP 05: Disable Bluetooth radio in OS Quick Settings -> Verify UI indicates "BLE RADIO DISABLED"
[ ] STEP 06: Re-enable Bluetooth radio -> Verify automatic GATT server re-initialization
[ ] STEP 07: Device Discovery -> Place Phone A & B within 2m -> Verify node appears in "NODES" tab
[ ] STEP 08: Peer Identity -> Verify pseudonymous Node ID derived from Ed25519 public key
[ ] STEP 09: Out-of-band Verification -> Scan QR code -> Verify status transitions to "VERIFIED"
[ ] STEP 10: Direct Messaging (A -> B) -> Send "STRUCT TEST 001" -> Verify delivery status "✓"
[ ] STEP 11: Two-Hop Relay (A -> B -> C) -> Place A & C out of mutual radio range with B centered
[ ] STEP 12: Delivery ACK -> Verify reverse route acknowledgement returns from C to A through B
[ ] STEP 13: Duplicate Suppression -> Broadcast packet simultaneously -> Verify LRU deduplication drops duplicates
[ ] STEP 14: TTL Enforcement -> Verify intermediate node B decrements packet TTL (5 -> 4)
[ ] STEP 15: Fragmentation -> Send 10 KB payload -> Verify MTU frame slicing into 23-byte chunks
[ ] STEP 16: Reassembly -> Verify recipient C reconstructs full payload and validates CRC-16 checksum
[ ] STEP 17: Store-and-Forward -> Power off Phone C -> Send message -> Phone B queues packet -> Power on C -> Delivered
[ ] STEP 18: Disconnect & Reconnect -> Walk Phone A out of range (30m) -> Return -> Link restores automatically
[ ] STEP 19: Screen Locked Relay -> Lock Phone B screen for 15 mins -> Send A -> C -> Verify background relay succeeds
[ ] STEP 20: Android Doze Mode -> Leave Phone B idle for 1 hour -> Verify Foreground Service keeps relay responsive
[ ] STEP 21: App Relaunch -> Force-kill Struct on Phone A -> Relaunch -> Verify SQLite message history intact
[ ] STEP 22: Device Restart -> Reboot Phone B -> Verify pending store-and-forward queue survives in SQLite
[ ] STEP 23: Malformed Packet Handling -> Transmit randomized frame -> Verify app safely drops packet without crash
[ ] STEP 24: Oversized Frame Rejection -> Transmit frame > 32 KB -> Verify buffer limit drops oversized packet
[ ] STEP 25: Nonce Replay Rejection -> Retransmit captured ciphertext -> Verify monotonic nonce rejects replay
[ ] STEP 26: Battery Endurance Observation -> Monitor battery drain over 4-hour active relay period
```

---

## 3. Data Recording Rule
Record all actual field measurements (latency in ms, RSSI in dBm, battery drop in %/hr) directly into `docs/FINAL_PHYSICAL_TEST_RESULTS.md`. **Never fabricate results.**
