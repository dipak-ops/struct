# Google Play Data Safety Final Declarations — Struct

This document outlines the exact questionnaire responses to submit in the **Google Play Console > Policy and Programs > App Content > Data Safety** section.

---

## 1. Overview Questions

- **Does your app collect or share any user data?**
  - **NO**.
  - All communication is strictly peer-to-peer over local Bluetooth Low Energy.
  - No data is uploaded to remote servers or shared with third parties.

---

## 2. Category by Category Audit

| Data Category | Specific Type | Collected? | Shared? | Handled Locally? | Purpose |
|---|---|---|---|---|---|
| **Location** | Approximate / Precise | **NO** | **NO** | NO | Bluetooth scanning uses `neverForLocation` flag. |
| **Personal Info** | Name / Email / Phone / Address | **NO** | **NO** | NO | Node IDs derived from cryptographic public keys. |
| **Financial Info** | Credit card / Bank details | **NO** | **NO** | NO | Free, open-source tool; zero purchases. |
| **Health & Fitness** | Health metrics | **NO** | **NO** | NO | Not applicable. |
| **Messages** | Emails / SMS / In-app messages | **NO** | **NO** | **YES** | Messages stored locally in SQLite; transmitted over BLE. |
| **Photos / Videos** | Media files | **NO** | **NO** | NO | Not supported in v1. |
| **Audio Files** | Voice recordings | **NO** | **NO** | NO | Not supported in v1. |
| **Files & Docs** | Document files | **NO** | **NO** | NO | Not supported in v1. |
| **Device or Other IDs** | IMEI / MAC / Advertising ID | **NO** | **NO** | NO | Zero tracking IDs. |

---

## 3. Security Practices
- **Data Encrypted in Transit?** -> **YES** (End-to-end encrypted across Bluetooth hops via ChaCha20-Poly1305 AEAD).
- **Users can request data deletion?** -> **YES** (Via in-app Security Center > [ Clear Local Data ] button).
