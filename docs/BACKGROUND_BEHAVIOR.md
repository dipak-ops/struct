# Struct — Mobile Operating System Background Execution Realities

Decentralized BLE mesh messaging faces distinct platform-level constraints imposed by modern mobile operating systems. Struct documents these operational realities transparently rather than claiming unsupportable guarantees.

---

## 1. Android Background Execution Matrix

| App State | BLE Scanning Behavior | BLE Advertising Behavior | Relay Capability | Notes |
|---|---|---|---|---|
| **Foreground (Active)** | 100% duty cycle (or configured profile) | Continuous connectable advertisements | Full real-time relay | Optimal performance |
| **Background (Screen On)** | Controlled by Foreground Service (`connectedDevice`) | Continuous | Full real-time relay | Ongoing notification displayed |
| **Background (Screen Locked)** | Periodic scanning duty cycle | Continuous | Full real-time relay | Requires battery optimization exemption |
| **Android Doze Mode (Deep Sleep)**| Throttled to OS maintenance windows | Intermittent | Store-and-forward latency increases | OS awakens app during maintenance windows |
| **Process Force-Stopped by User**| Terminated | Terminated | Offline until manually launched | OS blocks broadcasts |
| **Device Rebooted** | Auto-starts via `BOOT_COMPLETED` service (if enabled) | Resumed | Restored | Requires device unlock on Android FBE |

### Android Mitigations Implemented:
- Persistent Foreground Service with ongoing notification: `"Struct Mesh Active • Relaying offline encrypted packets nearby"`.
- Uses `usesPermissionFlags="neverForLocation"` to avoid continuous GPS location wakeups.
- Requests user exemption from aggressive OEM battery management (Samsung Device Care, Xiaomi MIUI optimizations).

---

## 2. iOS CoreBluetooth Background Execution Matrix

| App State | Central Scanning Behavior | Peripheral Advertising Behavior | Relay Capability | Notes |
|---|---|---|---|---|
| **Foreground (Active)** | Full continuous scanning for Service UUID | Standard connectable advertising | Full real-time relay | Optimal performance |
| **Background (Screen On)** | Throttled scanning interval | Apple-proprietary hashed background state | Functional | Only detectable by other iOS apps scanning for Struct UUID |
| **Background (Screen Locked)**| Significantly throttled | Restricted to background payload | Latency increases (~10-30s) | Inbound packets queued |
| **App Suspended (Memory Pressure)**| Suspended until CoreBluetooth event | State restoration handles wakeup | Passive | OS wakes process briefly to handle write events |
| **App Terminated by User Swipe**| Completely terminated | Terminated | Inactive | Apple policy prohibits background execution after explicit user force-quit |

### iOS Mitigations Implemented:
- Instantiates `CBCentralManager` and `CBPeripheralManager` with `CBCentralManagerOptionRestoreIdentifierKey: "struct_mesh_central"`.
- Uses `UIBackgroundModes: ["bluetooth-central", "bluetooth-peripheral"]`.
- Informs user via onboarding that maintaining foreground or wake state on at least one relay node optimizes multi-hop packet throughput.
