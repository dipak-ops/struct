# Struct — UI Design System & Mesh-Native Interface Guidelines

**Application:** Struct — Offline Decentralized Mesh Messenger  
**Visual Direction:** Terminal-inspired decentralized network console  
**Theme:** Pure Black (`#000000`) + Neon Green (`#00FF66`)  
**Design Principle:** *"This phone is a node in a decentralized network."*  

---

## 1. Color Palette

| Token | Hex Value | Usage |
|---|---|---|
| **Primary Accent** | `#00FF66` | Neon green active status, verified badges, action buttons, active links |
| **Secondary Green** | `#00C853` | Outgoing message surface tint, secondary active states |
| **Background** | `#000000` | Deep pure black canvas, zero distraction |
| **Primary Surface** | `#080808` | Panels, cards, header containers |
| **Secondary Surface**| `#111111` | Hover states, secondary panel backgrounds |
| **Borders** | `#202020` | Thin structural boundaries, separators |
| **Primary Text** | `#F5F5F5` | Main headings, message bodies, node IDs |
| **Secondary Text** | `#8A8A8A` | Timestamps, metadata, labels, inactive indicators |
| **Warning** | `#FFD600` | Unverified identity, low signal, degraded routes |
| **Emergency** | `#FF3B30` | SOS distress broadcast, danger actions (wipe data) |

---

## 2. Typography Rules

- **Technical Monospace Font** (`ui-monospace`, `Menlo`, `Consolas`, `Courier New`):
  - Used for: Node IDs (`NODE-7A31`), safety fingerprints, wire logs, packet headers, diagnostics, timestamps, and protocol states.
- **Readable System Sans-Serif Font** (`system-ui`, `-apple-system`, `sans-serif`):
  - Used for: Message bubble text, onboarding descriptions, and accessibility body text.

---

## 3. Status Symbols & Microcopy

```text
Status Indicator   Symbol   Meaning
──────────────────────────────────────────────────────────
Queued             …        Stored in local buffer waiting for link
Sent               ↑        Transmitted to direct neighbor over BLE
Relayed            ↗        Forwarded by intermediate mesh node
Delivered          ✓        Recipient generated DELIVERY_ACK packet
Failed             ×        Hop timeout or link disconnected
Expired            ⌛       Message TTL or timestamp window elapsed
```

---

## 4. Mesh Terminology Standard

| Avoid (Social Messaging) | Prefer (Mesh Native) |
|---|---|
| Friends / Contacts | **Nodes / Peers** |
| Online / Offline (Server) | **Mesh Active / Offline** |
| Groups / Rooms | **Channels / Mesh Rooms** |
| Typing... | *Omitted (Preserves RF bandwidth & privacy)* |
| Message Sent | **Packet Transmitted** |
| Last Seen | **Last Radio Contact** |

---

## 5. Creator Credit Placement Rule

Per Section 19 of the UX Specification:
- **Splash Screen**: `"Created by Dipak Bhondekar"` (Centered below subtitle)
- **About Page / Documentation**: `"Created by Dipak Bhondekar"`
- **Prohibited Locations**: Must **NOT** appear on Home, Chats, Nearby radar, Network topology, Security center, Diagnostics, or Settings screens.

---

## 6. Motion & Battery Budget

- Avoid continuous glowing effects, canvas loops, or excessive transitions.
- Animate only when meaningful (e.g., active packet transit, SOS confirmation, hold-to-activate progress).
- Preserves mobile battery life during extended offline field operations.
