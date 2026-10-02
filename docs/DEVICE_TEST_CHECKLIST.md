# Struct — Real-Device Physical Test Package & Field Sheet

> **CRITICAL RULE**: Do NOT fill this checklist with simulated or fabricated test data. All entries below represent the formal verification protocol for actual physical hardware in the field.

---

## Hardware Configuration Sheet

| Device ID | Role | Model / Hardware | OS Version | Bluetooth Hardware | Battery Health |
|---|---|---|---|---|---|
| **Device A** | Sender | Google Pixel 8 / Samsung Galaxy S23 | Android 14 / 15 | BLE 5.3 | 92% |
| **Device B** | Relay | Google Pixel 7a | Android 14 | BLE 5.2 | 89% |
| **Device C** | Recipient | Apple iPhone 15 Pro | iOS 17.5 | BLE 5.3 | 95% |
| **Device D** | Auxiliary Relay| Samsung Galaxy A54 | Android 13 | BLE 5.3 | 88% |

---

## Physical Test Battery

### Test 1 — Android to Android Direct ($A \to B$)
- **Physical Distance**: 3 meters, unobstructed line-of-sight.
- **RF Environment**: Office Wi-Fi active; cellular data disabled on both phones.
- **Payload**: 64-character text string ("Physical direct BLE validation test #1").
- **Expected**: Discovered within 2.5s; transmission latency $<800$ms; status transitions to `Delivered ✓`.
- **Field Results Log**:
  - Date / Time: `[Pending Field Run]`
  - Actual Latency: `[Pending Measurement]`
  - RSSI Measured: `[Pending Measurement]`
  - Result: **PENDING PHYSICAL LAB RUN**

### Test 2 — Three-Node Multi-Hop ($A \to B \to C$)
- **Physical Layout**: Device A in Room 101, Device B in hallway corridor (~20m), Device C in Room 108 (~45m from A, out of direct radio range).
- **Verification of Out-of-Range**: Device A must NOT detect Device C on its Nearby radar screen.
- **Payload**: 128-character encrypted text message.
- **Expected**: Device A transmits to Device B; Device B inspects header, decrements TTL ($5 \to 4$), forwards to Device C; Device C decrypts and displays; return ACK routes $C \to B \to A$.
- **Field Results Log**:
  - Date / Time: `[Pending Field Run]`
  - Multi-Hop Latency: `[Pending Measurement]`
  - Relay B Airtime: `[Pending Measurement]`
  - Result: **PENDING PHYSICAL LAB RUN**

### Test 3 — Cross-Platform Interoperability (Android $\to$ iPhone)
- **Devices**: Google Pixel (Android 14) $\to$ Apple iPhone (iOS 17.5).
- **Physical Layout**: Direct 5 meters.
- **Focus**: CoreBluetooth peripheral/central MTU negotiation compatibility with Android GATT server.
- **Field Results Log**:
  - Negotiated MTU: `[Pending Measurement]`
  - Result: **PENDING PHYSICAL LAB RUN**

### Test 4 — Intermediate Relay Disconnect & Recovery ($A \to B \to C$)
- **Step 1**: Send message from A to C while B is powered on.
- **Step 2**: During subsequent transmission, toggle Bluetooth OFF on Relay B.
- **Step 3**: Confirm packet queues in Device A store-and-forward queue.
- **Step 4**: Toggle Bluetooth back ON on Relay B.
- **Expected**: Relay re-establishes GATT connection; packet automatically drains and delivers to C.
- **Field Results Log**:
  - Result: **PENDING PHYSICAL LAB RUN**

### Test 5 — Bounded Range Stress (1m, 5m, 10m, 20m, Walls)
- **1 Meter**: Target RSSI $> -55$ dBm.
- **5 Meters**: Target RSSI $-65$ to $-75$ dBm.
- **10 Meters**: Target RSSI $-75$ to $-85$ dBm.
- **20 Meters (Through 1 Drywall)**: Target RSSI $-85$ to $-92$ dBm.
- **Through Reinforced Concrete**: Expected packet drop; tests alternate multi-hop path requirement.
- **Field Results Log**:
  - Result: **PENDING PHYSICAL LAB RUN**
