# Struct — Comprehensive Permission Matrix

Struct adheres strictly to the **principle of least privilege**. It never requests permissions that are not strictly necessary for local peer discovery, offline packet relaying, or security functions.

---

## Permission Audit Matrix

| Permission | Platform | OS Version | Why Struct Needs It | When Requested | If Denied | Recovery Action | Classification |
|---|---|---|---|---|---|---|---|
| `BLUETOOTH_SCAN` | Android | API 31+ (Android 12+) | Discovers nearby Struct mesh nodes transmitting Service UUID `0x53545255` | On first app launch or when opening the Radar screen | Cannot discover nearby nodes; incoming packets from new nodes not received | Show in-app banner explaining necessity; direct user to App Settings | **REQUIRED** |
| `BLUETOOTH_ADVERTISE` | Android | API 31+ (Android 12+) | Broadcasts local node presence so nearby devices can establish links | On first app launch or when relay mode is activated | Other nodes cannot initiate connections to this device | Show banner: *"Node unadvertised: nearby devices cannot see you"*; link to Settings | **REQUIRED** |
| `BLUETOOTH_CONNECT` | Android | API 31+ (Android 12+) | Connects to discovered GATT servers to transmit or receive encrypted packets | On first connection attempt to a nearby node | Cannot send or receive messages across Bluetooth | Prompt user to grant permission in Settings | **REQUIRED** |
| `ACCESS_FINE_LOCATION` | Android | API 26–30 (Android 8–11) | Required by legacy Android OS for BLE beacon/GATT scanning | Only on devices running Android 11 or older | Cannot scan for Bluetooth peripherals on legacy Android | Explain legacy OS requirement; explicitly state GPS coordinates are NOT collected | **REQUIRED (Legacy only)** |
| `POST_NOTIFICATIONS` | Android | API 33+ (Android 13+) | Displays ongoing foreground service notification and incoming message alerts | On first app launch when background relay starts | Ongoing service runs silently; user will not receive background delivery alerts | In-app notification prompt explaining background relay visibility | **OPTIONAL (Recommended)** |
| `FOREGROUND_SERVICE` / `CONNECTED_DEVICE` | Android | API 26+ / API 34+ | Keeps BLE GATT server active to relay encrypted packets when screen is off | System permission granted upon app installation | OS terminates background mesh relay during screen sleep | User warned that background relaying will pause when screen locks | **REQUIRED (Manifest)** |
| `WAKE_LOCK` | Android | API 26+ | Briefly holds CPU awake during active packet reassembly and cryptographic decryption | System permission granted upon app installation | Fragment reassembly drops if CPU immediately enters deep sleep | Internal timeout and store-and-forward absorbs drop | **REQUIRED (Manifest)** |
| `CAMERA` | Android | API 26+ | Scans peer QR codes for out-of-band Ed25519 identity verification | Only when user taps `[ SCAN QR ]` in Verification screen | Cannot scan QR code; manual Base32 safety word comparison remains available | User can still compare 6-block Base32 safety words manually | **OPTIONAL** |
| `NSBluetoothAlwaysUsageDescription` | iOS | iOS 13+ | Discovers and communicates with nearby Struct devices over CoreBluetooth | On first app launch | App cannot access Bluetooth radio; mesh functionality completely disabled | Guide user to iOS Settings > Struct > Bluetooth toggle | **REQUIRED** |
| `NSBluetoothPeripheralUsageDescription` | iOS | iOS 13+ | Advertises local Struct mesh service to nearby devices | On first app launch | Other iOS/Android nodes cannot initiate links | Guide user to iOS Settings > Struct > Bluetooth toggle | **REQUIRED** |
| `NSCameraUsageDescription` | iOS | iOS 13+ | Scans peer QR codes for out-of-band identity verification | Only when user taps `[ SCAN QR ]` | Camera viewfinder does not open; user must compare fingerprints manually | User can still compare safety words manually | **OPTIONAL** |
| `NSFaceIDUsageDescription` | iOS | iOS 13+ | Authenticates local user to unlock app when App Lock is enabled | When user enables Biometric App Lock in Security Center | Biometrics unavailable; falls back to device passcode or PIN | Re-prompt in Security Center | **OPTIONAL** |

---

## Least-Privilege Verification
- **Microphone**: **NEVER REQUESTED** (Voice notes and audio streaming are omitted in v1).
- **Contacts / Address Book**: **NEVER REQUESTED** (Struct uses pseudonymous cryptographic node IDs).
- **External Storage / Photos**: **NEVER REQUESTED** (Data stored purely in local encrypted SQLite sandbox).
- **Precise Location (GPS)**: **EXPLICITLY DISCLAIMED** via `neverForLocation` flag on `BLUETOOTH_SCAN`.
