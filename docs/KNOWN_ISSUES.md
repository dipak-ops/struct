# Struct — Known Issues & Technical Realities

The following known edge cases and physical realities have been verified and documented for the v1.0.0-rc1 Release Candidate:

---

## 1. Operating System Background Limitations
- **Issue**: When an iOS device has been locked and backgrounded for over 15 minutes, CoreBluetooth throttles central scanning. Inbound packets addressed to this device will be held in the nearest intermediate Android or active iOS relay's `pending_messages` table until the user unlocks their phone or another packet triggers wake.
- **Classification**: **PLATFORM-LIMITED** (By Apple OS design).
- **Status**: Documented; store-and-forward queue absorbs latency.

---

## 2. RF Spectrum Contention in Crowded 2.4 GHz Environments
- **Issue**: In environments with $>30$ transmitting Wi-Fi routers and active Bluetooth peripherals, packet collision rates increase.
- **Mitigation**: Struct implements jittered retransmission delay (150ms–400ms) and automatic frame retries.
- **Classification**: **PHYSICAL REALITY**.

---

## 3. Clock Skew on Offline Devices Without NTP
- **Issue**: If two offline smartphones have internal RTC clocks that differ by $>30$ minutes, a freshly generated packet from one device may appear expired to the other.
- **Mitigation**: Bounded timestamp tolerance window (45 minutes grace) applied in `PacketCodec.decode()`.
- **Classification**: **RESOLVED VIA PROTOCOL TOLERANCE**.

---

## 4. Sparse Partitions Without Continuous Relay Chain
- **Issue**: If Device A and Device C are 200 meters apart and no intermediate Device B exists, transmission fails to deliver in real-time.
- **Mitigation**: Mobile nodes act as store-and-forward "data mules", delivering packets when physical proximity is subsequently achieved.
- **Classification**: **PHYSICAL REALITY**.
