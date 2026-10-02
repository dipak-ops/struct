# Apple App Store & TestFlight Final Submission Checklist

---

## 1. Bundle & Build Identification
- **App Name**: `Struct`
- **Bundle Identifier**: `com.struct.app`
- **Version Number**: `1.0.0`
- **Build Number**: `1`
- **iOS Deployment Target**: `iOS 14.0` (Supports iPhone 8 through iPhone 16 Pro)
- **Primary Architecture**: `arm64`

---

## 2. Xcode & Signing Configuration
- [x] Info.plist contains `NSBluetoothAlwaysUsageDescription`
- [x] Info.plist contains `NSBluetoothPeripheralUsageDescription`
- [x] Info.plist contains `NSCameraUsageDescription`
- [x] Info.plist contains `NSFaceIDUsageDescription`
- [x] `UIBackgroundModes` declares `bluetooth-central` and `bluetooth-peripheral`
- [x] `PrivacyInfo.xcprivacy` verified with `NSPrivacyTracking: false` and timestamp/user-defaults categories
- [ ] Apple Developer Team selected: **MANUAL MAC/XCODE ACTION REQUIRED**
- [ ] Distribution Provisioning Profile: **MANUAL MAC/XCODE ACTION REQUIRED**

---

## 3. TestFlight Reviewer Instructions
```text
Struct is an offline peer-to-peer decentralized mesh communication app.
It operates without user accounts, phone numbers, or cloud servers.

To test peer discovery and messaging:
1. Install the TestFlight build on two iPhone test devices.
2. Launch Struct and grant Bluetooth access when prompted.
3. Bring devices within Bluetooth range (1–5 meters).
4. Discovered peers appear under the "NODES" tab.
5. Tap a node to start an end-to-end encrypted chat session.
6. Messages transmit directly over CoreBluetooth GATT characteristics.
```
