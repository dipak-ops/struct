# Struct — Technical Data Flow & Boundary Architecture

---

## 1. Local Storage Boundary (On-Device Sandbox)

```text
[ Hardware Enclave ] ──────> Ed25519 Private Key (NEVER LEAVES ENCLAVE)
                                    │
                                    ▼
[ Application Memory ] ───> Ephemeral X25519 Session Keys (Volatile RAM Only)
                                    │
                                    ▼
[ SQLite Sandboxed DB ] ──> Local Messages & Delivery Receipts (Plaintext at Rest)
                            Pending Store-and-Forward Relays (Opaque Ciphertext Only)
```

---

## 2. Radio Transmission Boundary (Bluetooth Low Energy)

```text
[ Phone A (Sender) ]
       │ Plaintext "Hello" encrypted with ChaCha20-Poly1305
       ▼
   [ Opaque Wire Packet ] (Magic 0x53, Header, Ciphertext, Poly1305 MAC, CRC16)
       │
       ▼ (BLE GATT Write)
[ Phone B (Relay) ]
       │ - Checks CRC16 Checksum
       │ - Checks LRU Deduplication Cache
       │ - Decrements TTL (5 -> 4)
       │ - DOES NOT POSSESS SESSION KEY (Cannot decrypt payload)
       │ - Forwards Opaque Bytes
       ▼ (BLE GATT Write)
[ Phone C (Recipient) ]
       │ - Verifies Poly1305 MAC with Session Key
       │ - Authenticates and Decrypts Plaintext
       │ - Generates DELIVERY_ACK packet
       ▼
[ Phone A (Sender) ] <─── Reverse Route ACK ─── [ Phone B ] <─── [ Phone C ]
       │ Status -> Delivered ✓
```
