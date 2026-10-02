# Struct — Mesh Wire Protocol v1 Specification Freeze

**Protocol Identifier**: `STRUCT-MESH-V1`  
**Specification Status**: **FROZEN**  
**Magic Byte**: `0x53` (ASCII 'S')  
**Version Byte**: `0x01`  
**Endianness**: Network Byte Order (Big-Endian)  

---

## 1. Frame Header Specification (62 Bytes Base + Payload + 2 Bytes CRC)

```text
Offset (Bytes) | Field Name       | Type    | Size    | Description
---------------+------------------+---------+---------+----------------------------------------------
0              | Magic            | Uint8   | 1       | Must be strictly 0x53 ('S').
1              | Version          | Uint8   | 1       | Must be strictly 0x01.
2              | PacketType       | Uint8   | 1       | Defined in PacketType Enum (0x01 - 0x08).
3              | TTL              | Uint8   | 1       | Hop limit (0..7). Max ceiling: 7.
4..7           | CreatedAt        | Uint32  | 4       | Creation timestamp (Unix Epoch seconds).
8..11          | ExpiresAt        | Uint32  | 4       | Expiration timestamp (Unix Epoch seconds).
12..27         | PacketId         | Char[16]| 16      | Cryptographically random 16-character identifier.
28..43         | SenderId         | Char[16]| 16      | Originating device identifier (Hash/UUID).
44..59         | DestinationId    | Char[16]| 16      | Target device identifier (Hash/UUID).
60..61         | PayloadLength    | Uint16  | 2       | Length of following encrypted payload (0..32768).
62..(62+Len-1) | EncryptedPayload | Bytes   | Len     | ChaCha20 Ciphertext + 16-Byte Poly1305 MAC tag.
(62+Len)..(+1) | CRC16 Checksum   | Uint16  | 2       | CRC-16 CCITT (0x1021) over all preceding bytes.
```

---

## 2. Invariable Protocol Rules

1. **Protocol Immutability**: No new fields may be appended without incrementing the `Version` byte to `0x02`. Any node receiving `Version != 0x01` must reject the frame with `PacketValidationError`.
2. **Hop Ceiling Invariant**: `TTL` must never be initialized higher than 7. Any node decrementing TTL must drop the packet if $TTL \le 1$.
3. **Payload Ceiling Invariant**: Total encrypted payload length must never exceed 32,768 bytes (32 KB).
4. **Zero Plaintext Invariant**: Relay nodes forward `EncryptedPayload` untouched. Relays do NOT possess the session key and cannot decrypt or modify the payload without invalidating the Poly1305 MAC.
