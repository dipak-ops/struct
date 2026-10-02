# Struct — Real-Device Testing Matrix & Field Test Plan

This manual field testing checklist validates physical multi-phone mesh operation before release.

---

## Required Hardware Setup
- **Phone A (Sender)**: Android (Pixel / Samsung) or iPhone
- **Phone B (Relay)**: Physically positioned between Phone A and Phone C (~25m from each)
- **Phone C (Recipient)**: Positioned out of direct radio range of Phone A (>50m or separated by a wall)
- *Ensure Wi-Fi and Cellular Mobile Data are turned OFF on all three devices.*

---

## Test Scenarios

### Test A: Direct Single-Hop ($A \to B$)
1. Bring Phone A and Phone B within 5 meters.
2. Confirm Phone B appears on Phone A's "Nearby" screen with Green status.
3. Send "Direct test 1".
4. Expected: Instant delivery on Phone B (< 1.2s), checkmark turns to "Delivered ✓".

### Test B: Multi-Hop Relay ($A \to B \to C$)
1. Move Phone C out of direct range of Phone A (verify A's Nearby screen does *not* list C).
2. Position Phone B midway so A sees B, and B sees C.
3. On Phone A, send "Hello from A to C through B".
4. Expected:
   - Phone A UI transitions: "Queued" $\to$ "Sending" $\to$ "Relayed via B" $\to$ "Delivered ✓".
   - Phone B's Diagnostics log shows: "Packet 0x... relayed (TTL 5 -> 4, no decryption)".
   - Phone C decrypts and displays "Hello from A to C through B".

### Test C: Intermediate Node Disappearance & Store-and-Forward
1. Turn Bluetooth OFF on Phone C.
2. Phone A sends "Pending note for C".
3. Phone B receives packet, notes destination C is unreachable, and stores it in `pending_messages` table.
4. Turn Bluetooth ON on Phone C.
5. Phone B detects C, performs store-and-forward sweep, and transmits packet.
6. Phone C receives and decrypts message; delivery ACK routes back to A.

### Test D: BLE Disconnection & Reconnection Recovery
1. During active conversation, turn Bluetooth OFF on Phone B for 10 seconds.
2. Turn Bluetooth back ON.
3. Send message from A.
4. Verify GATT connection recovers automatically without requiring app restart.

### Test E: Battery Impact Over 4 Hours
1. Place 3 devices in "Balanced" mode.
2. Leave active mesh running for 4 hours with periodic background beaconing.
3. Measure battery consumption (target: $< 2.5\%$ battery drain per hour on modern devices).
