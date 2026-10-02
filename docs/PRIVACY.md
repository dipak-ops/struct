# Struct — Privacy Specification & Technical Data Policy

*(Draft for Technical Review — Not a formal legal substitute for jurisdictional counsel)*

## 1. Zero Cloud Architecture
Struct does not run a central backend server, database, or analytics collector. No user accounts, phone numbers, email addresses, or contact lists are collected, uploaded, or transmitted across the internet.

## 2. Local Identity & Keys
- Your cryptographic identity (Ed25519 identity key and X25519 DH key) is generated locally on your physical smartphone using the operating system's hardware random number generator.
- Your private key never leaves your phone's hardware Keystore (Android) or Keychain (iOS).

## 3. Local Storage & Message Erasure
- Messages, peers, and receipts are stored locally on your device in a private SQLite database managed via Drift.
- **Disappearing Messages**: When an expiration timer is set (e.g., 5 min, 1 hour, 24 hours), the local database securely deletes the message row and triggers SQLite vacuum sweeps.
- **Clear Local Data**: A single-tap action completely wipes all cached messages, peer lists, and pending relay queues.

## 4. Metadata in Mesh Forwarding
When participating as a relay node, intermediate smartphones inspect only the packet's destination identifier and TTL hop limit in order to route it toward the recipient. **Relay phones have no technical ability to decrypt or read message text, photos, or voice notes.**
