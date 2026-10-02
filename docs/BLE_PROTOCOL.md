# Struct — BLE Platform & GATT Specification

**Service UUID**: `00005752-5543-5400-8000-00805F9B34FB` (Mnemonic: `STRUCT`)  
**Data Rx Characteristic (Write Without Response)**: `00005752-5543-5401-8000-00805F9B34FB`  
**Data Tx Characteristic (Notify / Indicate)**: `00005752-5543-5402-8000-00805F9B34FB`  
**Identity Beacon Characteristic (Read)**: `00005752-5543-5403-8000-00805F9B34FB`

---

## 1. Operating Modes & Dual Role Operation

Struct operates each device simultaneously as a **GATT Peripheral** (Advertising & Server) and a **GATT Central** (Scanning & Client):

```text
                  +---------------------------+
                  |   DEVICE (DUAL ROLE BLE)  |
                  +-------------+-------------+
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
+-----------------------------+   +-----------------------------+
|        GATT PERIPHERAL      |   |         GATT CENTRAL        |
|  - Advertises STRUCT UUID   |   |  - Scans for STRUCT UUID    |
|  - Broadcasts ephemeral ID  |   |  - Connects to discovered   |
|  - Listens on Rx char write |   |  - Requests MTU update (512)|
|  - Notifies inbound peers   |   |  - Subscribes to Tx notify  |
+-----------------------------+   +-----------------------------+
```

---

## 2. Platform Nuances & Restrictions

### Android
- **API Levels**: 26+ (Android 8.0 Oreo minimum, optimized for Android 12+ / 14 / 15).
- **Permissions**:
  - `android.permission.BLUETOOTH_SCAN` (`usesPermissionFlags="neverForLocation"`)
  - `android.permission.BLUETOOTH_ADVERTISE`
  - `android.permission.BLUETOOTH_CONNECT`
  - `android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE`
- **Foreground Service**: Android aggressively restricts background BLE scanning unless run with a Foreground Service with an ongoing notification (`"Struct Mesh Active"`).
- **MTU**: Requests `requestMtu(512)` immediately upon GATT connection callback.

### iOS
- **CoreBluetooth**:
  - `CBCentralManager` instantiated with `CBCentralManagerOptionRestoreIdentifierKey: "struct_mesh_central"`
  - `CBPeripheralManager` with `CBPeripheralManagerOptionRestoreIdentifierKey: "struct_mesh_peripheral"`
- **Background Limitations**:
  - iOS restricts BLE advertising when an app is suspended in the background. Peripheral advertising continues only in an Apple-proprietary hashed format detectable only by other iOS devices scanning for the specific service UUID.
  - Background scanning intervals are throttled by iOS. Real-world delivery to an iOS device with the screen locked relies on active iOS-to-iOS mesh chains or foregrounding upon wake.
