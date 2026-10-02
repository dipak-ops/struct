# Struct — Final Physical Test Checklist

> **INSTRUCTION**: Execute these tests sequentially on physical Android and iOS hardware. Do not mark tests passed until physically observed in the field.

---

### TEST A — Direct BLE Link
- **Path**: `Phone A → Phone B`
- **Verification**:
  1. Phone A discovers Phone B via BLE Service `0x53545255`.
  2. GATT connection establishes within 3 seconds.
  3. Session key exchange completes via X25519.
  4. Phone A sends encrypted message.
  5. Phone B authenticates Poly1305 MAC and displays plaintext.
  6. Phone B returns `DELIVERY_ACK`.
  7. Phone A status transitions to `Delivered ✓`.

### TEST B — Two-Hop Relay
- **Path**: `Phone A → Phone B (Relay) → Phone C (Recipient)`
- **Condition**: Phone A and Phone C are placed out of direct radio range.
- **Verification**:
  1. Phone B receives packet, validates CRC-16, checks deduplication cache.
  2. Phone B decrements TTL ($5 \to 4$).
  3. Phone B forwards encrypted payload to Phone C without access to plaintext.
  4. Phone C authenticates and decrypts message.
  5. Reverse ACK traverses `Phone C → Phone B → Phone A`.

### TEST C — Three-Hop Relay
- **Path**: `Phone A → Phone B → Phone C → Phone D`
- **Condition**: Linear chain where each phone only connects to immediate neighbors.
- **Verification**:
  1. Packet traverses 3 hops.
  2. Phone D receives and verifies delivery.

### TEST D — Store-and-Forward Retention
- **Path**: `Phone A → Phone B` while Phone C is offline.
- **Verification**:
  1. Phone B holds packet in `pending_messages` table.
  2. Restart Phone B.
  3. Power on Phone C.
  4. Phone B discovers Phone C and drains stored packet.
  5. Phone C decrypts and acknowledges delivery.

### TEST E — Relay Failure Recovery
- **Condition**: Power off Phone B during transit.
- **Verification**:
  1. Phone A gracefully queues packet without crashing.
  2. Alternate route used if available; otherwise packet remains queued until expiration.

### TEST F — Duplicate Packet Suppression
- **Condition**: Diamond topology (`A -> B -> D` and `A -> C -> D`).
- **Verification**:
  1. Node D receives packet from B first, processes it.
  2. Node D receives duplicate packet from C, suppresses it via LRU deduplication cache.

### TEST G — Replay Attack Rejection
- **Condition**: Retransmit captured raw packet.
- **Verification**:
  1. Monotonic nonce check fails or deduplication cache drops packet safely.

### TEST H — Large Payload Fragmentation
- **Condition**: Transmit 10 KB text file.
- **Verification**:
  1. Packet sliced into ~45 BLE MTU fragments.
  2. Reassembler reconstructs complete buffer and validates CRC-16.

### TEST I — BLE Reconnection
- **Condition**: Toggle Bluetooth radio off then on.
- **Verification**:
  1. App re-initializes GATT server and scanner automatically.

### TEST J — Background / Locked Screen Relay
- **Condition**: Screen locked on Phone B for 30 minutes.
- **Verification**:
  1. Foreground service maintains relay capability on Android.
  2. CoreBluetooth background modes handle write on iOS.

### TEST K — Identity Fingerprint Verification
- **Condition**: Compare Base32 Crockford fingerprints and scan QR code.
- **Verification**:
  1. Peer status updates to `Verified`.

### TEST L — Emergency SOS Distress
- **Condition**: Slide to arm and transmit SOS distress signal.
- **Verification**:
  1. Priority TTL 7 packet broadcasts to all peers in range.

### TEST M — Database Recovery
- **Condition**: Kill app process during message write.
- **Verification**:
  1. WAL journal recovers cleanly on relaunch with zero SQLite corruption.
