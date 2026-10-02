# Struct — Internal Beta Test Plan

---

## 1. Beta Distribution Strategy

The initial beta cohort will consist of 5–10 trusted field testers operating physical Android and iOS hardware.

### Installation Instructions
- **Android**: Download build via **Google Play Internal Testing link** or sideload `struct-1.0.0-beta-arm64.apk`.
- **iOS**: Accept TestFlight invitation link on physical iPhone running iOS 14.0+.

---

## 2. Testing Scenarios

```text
SCENARIO 1: Field Radio Range Benchmark
- Walk across open field / warehouse while sending periodic messages.
- Note distance where link transitions from Direct (1 hop) to Disconnected.

SCENARIO 2: Concrete Obstruction & Multi-Hop Relay
- Place Sender in Room 1 and Recipient in Room 3 with reinforced concrete walls.
- Place Relay Phone in hallway (Room 2).
- Confirm message traverses Sender -> Hallway Relay -> Recipient.

SCENARIO 3: Store-and-Forward Reconnect
- Walk Recipient 100 meters away.
- Sender sends 3 messages.
- Recipient walks back within radio range.
- Confirm all 3 messages drain and arrive in proper sequence.

SCENARIO 4: Overnight Battery Observation
- Leave Relay device running Struct on "Balanced" battery mode overnight (8 hours).
- Record battery percentage drop.
```

---

## 3. Bug Reporting Format

When an issue occurs during testing, submit report to `struct.support@gmail.com` using:

```text
Device: [e.g. Samsung Galaxy S23]
Manufacturer: [Samsung]
Model: [SM-S911B]
OS: [Android 14 OneUI 6.1]
Struct Version: [1.0.0-rc1]
Build: [1]
Test Scenario: [Scenario 2: Multi-Hop Relay]
Expected: [Message delivered across relay in < 3 seconds]
Actual: [Status remained "… Queued" for 45 seconds]
Crash Occurred: [No / Yes]
Battery Observation: [2% drop over 1 hour]
BLE Behavior: [GATT disconnect occurred during reassembly]
Steps to Reproduce:
1. Walk into basement
2. Send 5 messages rapidly
3. Return to hallway
Attached Logs / Screenshots: [Attach sanitized export from DIAG tab]
```
