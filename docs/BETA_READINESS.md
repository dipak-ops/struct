# Struct — Beta Readiness Assessment (v1.0.0-rc1)

---

## 1. Verified

The following capabilities have been verified via automated unit, protocol, property, and integration tests:

- **Wire Codec Roundtrip**: Canonical binary encoding and decoding with CRC-16 check.
- **Negative Protocol Validation**: Rejection of corrupted magic bytes, unsupported versions, TTL $> 7$, and invalid checksums.
- **Hop Limit Decrement**: Accurate $TTL - 1$ decrement and safe dropping when $TTL \le 1$.
- **Deduplication LRU Cache**: Suppression of duplicate packets in looping/diamond topologies.
- **Store-and-Forward Bounded Queue**: Enforced 15 MB / 500 pkts/peer storage limits and exponential backoff retry schedules.
- **BLE MTU Fragmentation**: Slicing and out-of-order reassembly of multi-frame packets.
- **Cryptographic Separation**: Hardware enclave key isolation; zero private keys in SQLite tables.
- **Poly1305 MAC Verification**: Tampered ciphertexts safely rejected without producing plaintext copies.

---

## 2. Real-Device Required

The following behaviors require physical multi-phone validation:

- Physical 2.4 GHz RF attenuation through building drywall and reinforced concrete.
- Actual cross-vendor BLE GATT MTU negotiation between Qualcomm, MediaTek, and Apple silicon.
- Multi-hour battery drain measurement on physical hardware under varying duty cycles.
- Acoustic / physical notification delivery when smartphones are in deep sleep pockets.

---

## 3. Platform Limitations

- **Android Doze Mode**: When an Android device enters un-exempted deep sleep, continuous scanning pauses until maintenance windows or high-priority FCM wakeups occur.
- **iOS Background Peripheral Advertising**: Apple severely restricts peripheral advertising when the app is suspended and the screen is locked. Sustained real-time relay duty operates best when devices are foregrounded or active.

---

## 4. Known Risks

- In dense RF environments (stadiums, tech conferences), 2.4 GHz packet collisions increase latency.
- Clock skew exceeding 45 minutes on offline devices with unsynchronized hardware clocks can cause false expiration drops.
- Relay nodes can observe transmission timing, packet size, and source/destination hashes (anonymity is not claimed).

---

## 5. Not Implemented

The following are intentionally deferred beyond v1.0.0-rc1:

- Wi-Fi Direct / P2P transport integration.
- LoRa physical radio bridging.
- Unbounded media / high-bandwidth live voice streaming over BLE mesh.
- Central cloud gateway synchronizers.

---

## 6. Security Status

> **Struct has undergone extensive code-level security review, threat modeling, and automated testing, but has NOT undergone an independent professional third-party commercial security audit.**

---

## 7. Beta Recommendation

**The Struct codebase is technically prepared and recommended for controlled real-device field beta testing with test cohorts using physical Android and iOS devices following `docs/DEVICE_TEST_CHECKLIST.md`.**
