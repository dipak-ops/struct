# Struct — Beta Tester Feedback Template

Please fill out this form when reporting behavior during physical device testing:

```text
Tester Name / Identifier: 
Test Date: 
Device Manufacturer: 
Device Model Identifier: 
Operating System & Version: 
Struct Version & Build: 1.0.0-beta.1 (Build 1)

Test Scenario:
[ ] Direct Peer Messaging (A -> B)
[ ] Multi-Hop Relay (A -> B -> C)
[ ] Store-and-Forward Retention
[ ] Disconnect & Reconnect
[ ] Background / Screen Locked Operation
[ ] Out-of-band QR Verification
[ ] Emergency SOS Broadcast
[ ] Radio Disabled Recovery

Test Environment:
[ ] Indoors (Direct Line of Sight)
[ ] Indoors (Through Walls / Floors)
[ ] Outdoors (Open Field)
[ ] High RF Interference (Crowded Office / Public Area)

Observation Summary:
Expected Behavior:
Actual Behavior:

Result: [ PASS / FAIL / DEGRADED ]

Did the application crash or freeze? [ YES / NO ]
If yes, attach stack trace or log export:

Observed Latency (approximate seconds):
Observed Signal Strength (RSSI dBm if known):
Battery Impact (% drop over test duration):

Detailed Steps to Reproduce (if reporting a bug):
1. 
2. 
3. 

Screenshot / Screen Recording / Sanitized Wire Log attached: [ YES / NO ]
```
