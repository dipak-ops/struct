# Struct — Store Privacy Declarations & Data Safety

---

## 1. Google Play Data Safety Form Responses

- **Does the app collect or share any user data?**
  - **No**. All user communications and cryptographic keys remain local on the user's device and within peer-to-peer radio range.
- **Data Types Declared**:
  - Personal Info: **None collected**
  - Financial Info: **None collected**
  - Location: **None collected** (uses `neverForLocation` flag on Bluetooth)
  - Messages / SMS: **Not uploaded to servers** (transmitted strictly peer-to-peer via BLE)
  - Photos / Videos: **None collected**
  - Audio: **None collected**
  - Health & Fitness: **None collected**
  - Device or other IDs: **None collected** (Pseudonymous node IDs derived locally from public keys)
- **Security Practices**:
  - Data is encrypted in transit over BLE using ChaCha20-Poly1305 AEAD.
  - Users can request deletion of all local data via Security Center in-app.

---

## 2. Apple App Store Privacy Nutrition Labels

- **Data Used to Track You**: **None** (No third-party ad networks, no tracking SDKs).
- **Data Linked to You**: **None**.
- **Data Not Linked to You**: **None**.
- **Tracking Transparency**: Struct does not call Apple App Tracking Transparency APIs because zero tracking occurs.
- **Privacy Manifest**: Conforms with `NSPrivacyTracking: false` and declares required reason APIs in `ios/Runner/PrivacyInfo.xcprivacy`.
