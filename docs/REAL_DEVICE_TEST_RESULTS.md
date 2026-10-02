# Struct — Real-Device Field Test Results Matrix

> **NOTE**: In accordance with the engineering audit guidelines, this matrix records actual physical hardware testing runs. Values are NOT fabricated or filled with simulator assumptions.

---

## Controlled Multi-Device Field Matrix

| Test ID | Scenario | Android A | Android B (Relay) | Android C | iPhone A | iPhone B | Result | Notes / Latency |
|---|---|---|---|---|---|---|---|---|
| **A-01** | Direct $A \to B$ | Pixel 8 | Galaxy S23 | — | — | — | **PENDING LAB RUN** | Target $< 1.2$s |
| **A-02** | Direct iOS $\to$ iOS | — | — | — | iPhone 15 | iPhone 14 | **PENDING LAB RUN** | Target $< 1.5$s |
| **A-03** | Cross-Platform Direct | Pixel 8 | — | — | — | iPhone 15 | **PENDING LAB RUN** | MTU negotiation focus |
| **B-01** | 2-Hop Android ($A \to B \to C$) | Pixel 8 | Pixel 7a | Galaxy A54 | — | — | **PENDING LAB RUN** | Verified A cannot see C directly |
| **B-02** | 2-Hop Cross ($A \to B \to \text{iOS}$) | Pixel 8 | Pixel 7a | — | — | iPhone 15 | **PENDING LAB RUN** | Pixel relays to iPhone |
| **C-01** | 3-Hop Chain ($A \to B \to C \to D$) | Pixel 8 | Pixel 7a | Galaxy A54 | iPhone 15 | — | **PENDING LAB RUN** | Tests TTL 5 -> 2 |
| **D-01** | Store-and-Forward Offline Retention | Pixel 8 | Pixel 7a | — | — | iPhone 15 (Off) | **PENDING LAB RUN** | C turned off, then on |
| **E-01** | Intermediate Relay Power Disconnect | Pixel 8 | Galaxy S23 (Kill)| — | — | iPhone 15 | **PENDING LAB RUN** | Tests safe queueing |
| **F-01** | Duplicate Packet Storm Rejection | Pixel 8 | Pixel 7a | Galaxy A54 | — | — | **PENDING LAB RUN** | Diamond topology loop |
| **G-01** | Replay Packet Injection | Pixel 8 | Pixel 7a | Galaxy A54 | — | — | **PENDING LAB RUN** | Replay packet drop |
| **H-01** | Bounded Large Payload (15 KB) | Pixel 8 | Pixel 7a | — | — | iPhone 15 | **PENDING LAB RUN** | Tests 32 MTU frames |
| **I-01** | Background Locked Screen Relay | Pixel 8 | Galaxy S23 (Lock)| — | — | iPhone 15 | **PENDING LAB RUN** | Android Doze impact |
| **J-01** | 4-Hour Continuous Battery Impact | Pixel 8 | Pixel 7a | Galaxy A54 | iPhone 15 | iPhone 14 | **PENDING LAB RUN** | Balanced mode target $<2.5\%$/hr |
| **K-01** | Out-of-Band QR Fingerprint Verify | Pixel 8 | — | — | — | iPhone 15 | **PENDING LAB RUN** | Camera scanner check |
| **L-01** | Emergency SOS Mesh Flood & Cancel | Pixel 8 | Pixel 7a | Galaxy A54 | iPhone 15 | — | **PENDING LAB RUN** | Max priority broadcast |
