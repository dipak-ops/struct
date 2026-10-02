# Struct — Known Limitations & Realities

Honest engineering transparency regarding physical, operating system, and architectural realities of decentralized BLE mesh messaging:

---

## 1. Physical Radio Range & Attenuation
- **Line of Sight**: Up to 40–70 meters between modern smartphones with BLE 5.0 in open outdoor conditions.
- **Indoor Environments**: Typical range drops to 10–25 meters due to concrete walls, reinforced metal pillars, and human bodies (which absorb 2.4 GHz RF).
- **Physical Multi-hop Required**: Reliable transmission across multi-room or multi-floor buildings strictly requires intermediate physical relay nodes.

---

## 2. Operating System Background Constraints
- **Android**:
  - Requires a Persistent Foreground Service with an ongoing notification to guarantee continuous BLE scanning and relaying when the screen is turned off.
  - If Android Battery Optimization (Doze Mode) terminates the background service, the device ceases relaying until awakened by the user.
- **iOS**:
  - Apple severely curtails continuous background Bluetooth operation. When an iOS device screen is locked and the app is backgrounded, CoreBluetooth limits peripheral advertising to an Apple-specific background state and throttles scanning.
  - Sustained continuous relay duty is significantly more reliable when devices are foregrounded or active.

---

## 3. Scalability & Sparse Mesh Partitions
- **High-Density Saturation**: If $>50$ devices are within 10 meters of each other transmitting simultaneously, 2.4 GHz spectrum contention causes packet collision and increased latency.
- **Sparse Partitions (Store-and-Forward Reliance)**: If there is no continuous physical chain of relays between Phone A and Phone C, delivery is delayed until a mobile node physically travels between partitions and unloads stored packets.

---

## 4. Metadata Visibility to Relays
- While message payloads are 100% encrypted end-to-end (relays cannot read text or attachments), intermediate relays **can observe**:
  - Source Node ID (or ephemeral alias)
  - Destination Node ID
  - Packet size and timestamp
  - Approximate physical proximity based on BLE RSSI signal strength.
- Struct does **not** claim complete anonymity or onion-routing anonymity over BLE.

---

## 5. Emergency SOS Disclaimers
- Struct SOS is a local peer-to-peer distress broadcast.
- **Struct does NOT replace government emergency response services (911, 112, 999).**
- If no other Struct nodes are within physical radio range, an SOS broadcast cannot be forwarded until a peer comes into range.
