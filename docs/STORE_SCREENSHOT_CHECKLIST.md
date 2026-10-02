# Struct — Store Screenshot Checklist & Guidelines

All screenshots for Google Play and Apple App Store must be captured from the actual release build running on physical devices. **Never use mock data, fake device frames, or simulator overlays.**

---

## 1. Required Screenshot Catalog (Min 1080 x 1920 px / 16:9 or 19.5:9)

| Screenshot # | View Name | Key Visible UI Elements | Purpose |
|---|---|---|---|
| **01** | **Mesh Console (Home)** | Compact terminal status area (`IDENTITY VERIFIED`, `MESH ACTIVE`, `04 PEERS`, `ROUTE AVAILABLE`), live topology mini-map | Demonstrates decentralized node architecture |
| **02** | **Nearby Radar (Nodes)** | `SCANNING ●`, list of nearby nodes (`NODE-7A31`, `NODE-B912`) with signal in dBm and verification badges | Shows automatic local radio discovery |
| **03** | **Encrypted Chat** | Black background, dark green outgoing bubbles, minimal timestamps (`20:41 ✓`), technical status glyphs | Shows clean, readable messaging interface |
| **04** | **Message Technical Info** | Expanded `[ INFO ]` panel displaying packet ID (`8F31...`), 2 hops, ChaCha20-Poly1305 cipher suite, TTL 5 | Proves real cryptographic multi-hop routing |
| **05** | **Mesh Diagnostic Topology** | Fullscreen network map with green dashed link lines between `[ YOU ] ── [ NODE-B ] ── [ NODE-C ]` | Highlights multi-hop relay forwarding |
| **06** | **Security Center** | Terminal checklist: `IDENTITY ✓ PROTECTED`, `ENCRYPTION ✓ ACTIVE`, `APP LOCK ● ENABLED`, `STORAGE ✓ LOCAL` | Communicates local-first security stance |
| **07** | **Out-of-Band Verification** | Base32 Crockford safety fingerprint blocks (`AB7K 19QX 72PM 4K8D 91FA 2L7C`) and QR code scanner | Demonstrates impersonation protection |
| **08** | **Protocol Diagnostics** | Network console: packets TX/RX counters, relayed packets count, queue status, battery profile switcher | Demonstrates robust technical engineering |

---

## 2. Privacy & Quality Invariants
- [x] No private keys or raw nonces exposed in UI
- [x] No real phone numbers or personal names shown (uses pseudonymous IDs: `NODE-7A31`, `NODE-B912`)
- [x] Zero debug banners or development overlays
- [x] Clean black `#000000` canvas with `#00FF66` neon green accents
