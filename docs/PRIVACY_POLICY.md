# Privacy Policy — Struct

**Effective Date:** October 2026  
**Application:** Struct — Offline Decentralized Mesh Messenger  
**Creator:** Dipak Bhondekar (`struct.support@gmail.com`)  

---

## 1. Core Principle: Zero Central Servers

Struct is an **offline-first, decentralized communication tool**. It does not operate user accounts, central message servers, telemetry brokers, or cloud analytics databases.

We do **not** collect, sell, lease, or monetize your personal information.

---

## 2. Information Architecture & Handling

### A. Information Processed & Stored Locally
- **Cryptographic Identity Keypair**: An Ed25519 signing keypair and X25519 key agreement pair are generated on your device using the platform's hardware CSPRNG. Private keys are stored in the device's hardware enclave (Android Keystore / iOS Keychain). They never leave your device.
- **Local Message History**: Encrypted message contents and delivery records are stored in a local SQLite database on your device. They are never uploaded to a cloud service.
- **Node Identifier**: A pseudonymous 16-character identifier derived from your public key is broadcast to nearby Bluetooth radios to allow devices to route messages to you.

### B. Information Transmitted Over Bluetooth (Nearby Only)
- **Opaque Ciphertext Packets**: When you send a message, it is encrypted end-to-end using ChaCha20-Poly1305. Intermediate relay devices forward these encrypted bytes to reach the recipient. Relay devices cannot decrypt or read the plaintext.
- **Packet Metadata**: Intermediate relays can observe the packet's length, time of transit, hop limit (TTL), and 16-byte source and destination routing identifiers. Struct does not claim anonymous onion routing.

### C. Information Sent to Remote Cloud Servers
- **NONE**. Struct does not establish internet connections to cloud servers for its core messaging functionality.

---

## 3. Permissions Used
- **Bluetooth**: Required to discover, connect to, and relay encrypted packets between nearby devices.
- **Camera (Optional)**: Used solely to scan peer safety fingerprints via QR codes. Camera frames are processed strictly in volatile memory and never saved to disk.
- **Notifications (Optional)**: Used to display delivery receipts and alert you to incoming mesh messages.

---

## 4. Data Deletion
You can permanently delete all local messages, pending packets, and cryptographic keys at any time via **Security Center > [ Clear Local Data ]** or by uninstalling the application.

---

## 5. Contact
For security questions or privacy inquiries: **`struct.support@gmail.com`**
