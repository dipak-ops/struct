# Struct — Final Physical Test Results (Field Log)

> **MANDATORY AUDIT RULE**: All fields below are left unpopulated until physical devices are tested in the lab. Data must NEVER be fabricated or derived from simulators.

---

### Record Entry Template (To be filled during physical testing)

```text
Test ID: TEST-A (Direct BLE Link)
Device A: [e.g. Google Pixel 8, Android 14, Build UP1A.231005.007]
Device B: [e.g. Samsung Galaxy S23, Android 14, Build OneUI 6.0]
OS Version A: 
OS Version B: 
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Latency (ms): 
RSSI (dBm): 
Hops: 
Battery Drain (%/hr): 
Notes: 
Evidence / Log Reference: 
─────────────────────────────────────────────────────────────
Test ID: TEST-B (Two-Hop Relay)
Device A: 
Device B (Relay): 
Device C (Dest): 
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Latency (ms): 
RSSI (dBm): 
Hops: 2
Battery Drain (%/hr): 
Notes: 
Evidence / Log Reference: 
─────────────────────────────────────────────────────────────
Test ID: TEST-C (Three-Hop Relay)
Device A: 
Device B (Relay): 
Device C (Relay): 
Device D (Dest): 
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Latency (ms): 
Hops: 3
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-D (Store-and-Forward Retention)
Device A: 
Device B (Relay): 
Device C (Dest): 
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Storage Duration (mins): 
Delivered After Reconnect: 
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-E (Relay Failure Recovery)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Crash Observed: [No / Yes]
Graceful Queueing: 
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-F (Duplicate Packet Suppression)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Duplicates Dropped: 
Loop Formed: [No / Yes]
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-G (Replay Attack Rejection)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Replay Rejected: [Yes / No]
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-H (Fragmentation & MTU)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Payload Size (Bytes): 
Fragments Created: 
Reassembly Success: 
CRC Valid: 
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-I (BLE Reconnection)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Reconnection Time (s): 
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-J (Background / Screen Locked)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Android Background Relay: 
iOS Background Relay: 
Doze Throttling Observed: 
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-K (Identity QR Verification)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Camera Scan Speed: 
Fingerprint Match: 
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-L (Emergency SOS Propagation)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Priority Routing Active: 
Broadcast Received by Nodes: 
Notes: 
─────────────────────────────────────────────────────────────
Test ID: TEST-M (Database SQLite Crash Recovery)
App Version: 1.0.0-rc1
Test Date: 
Result: [PENDING PHYSICAL EXECUTION]
Database Integrity Checked: 
Uncorrupted Records: 
Notes: 
```
