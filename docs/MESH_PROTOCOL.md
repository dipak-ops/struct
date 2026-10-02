# Struct — Mesh Packet & Wire Protocol Specification

**Protocol Version**: `0x01`  
**Max Packet Payload**: 32,768 Bytes (32 KB)  
**Max BLE Fragment Size**: 20 Bytes (default ATT MTU 23) up to 512 Bytes (negotiated MTU)  
**Standard TTL**: 5 Hops (Hard maximum limit: 7 Hops)

---

## 1. Binary Packet Header Layout (MeshPacket)

Every packet serialized by `PacketCodec` adheres to a compact, non-padded binary schema:

```text
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Magic (0x53) |  Version (1)  |   PacketType  |   TTL (0-7)   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Packet ID (High 32)                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Packet ID (Low 32)                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                   Sender ID (16-Byte UUID/Hash)               +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                 Destination ID (16-Byte UUID/Hash)            +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Created At (Unix Epoch Sec)               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Expires At (Unix Epoch Sec)               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Payload Length (Uint16)              |   Flags       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Encrypted Payload ...                   |
|                      (ChaCha20 Ciphertext)                    |
|                               +                               |
|                  Poly1305 Auth Tag (16 Bytes)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     CRC-16 Checksum (Uint16)                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

---

## 2. Packet Types

| Code | Name | Routing Behavior | Description |
| :--- | :--- | :--- | :--- |
| `0x01` | `HELLO` | Single-hop | Direct neighbor beacon, contains peer ephemeral public key |
| `0x02` | `SESSION_INIT` | Multi-hop | Ephemeral DH handshake initiation to target node |
| `0x03` | `SESSION_RESP` | Multi-hop | Handshake response completing two-way forward secrecy |
| `0x04` | `DATA` | Multi-hop | End-to-end encrypted user text or media chunk |
| `0x05` | `DELIVERY_ACK` | Multi-hop | Lightweight delivery receipt routed back to origin |
| `0x06` | `READ_RECEIPT` | Multi-hop | Explicit read state (only if user enabled in privacy) |
| `0x07` | `CHANNEL_DATA`| Multi-hop (Flood)| Broadcast channel packet with channel-specific HMAC |
| `0x08` | `EMERGENCY_SOS`| Multi-hop (Urgent)| Priority broadcast flood across all connected nodes |

---

## 3. BLE Fragmentation Framing

When a serialized `MeshPacket` exceeds the MTU of the active BLE GATT link, `PacketFragmenter` splits it into sequential frames:

```text
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Packet ID (High 32)                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Packet ID (Low 32)                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Seq Index (Uint16)        |     Total Count (Uint16)      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Fragment Length (Uint16)  |     Chunk Data ...            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    CRC-16 Frame Check (Uint16)                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Safety Invariants:
1. `Total Count` must never exceed 64 (maximum 32 KB payload).
2. `Seq Index` must be strictly $< \text{Total Count}$.
3. Incomplete fragments expire from the reassembly map after 15 seconds.
4. CRC-16 is verified before reassembled packet is passed to `PacketCodec`.
