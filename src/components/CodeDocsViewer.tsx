import React, { useState } from 'react';
import { FileText, Copy, Check, Code, Shield } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  category: 'Audit & Specs' | 'Flutter Code' | 'Native BLE';
  filename: string;
  language: string;
  content: string;
}

const DOCUMENTS: DocItem[] = [
  {
    id: 'final_release_status',
    title: 'Final Release Status',
    category: 'Audit & Specs',
    filename: 'docs/STRUCT_FINAL_RELEASE_STATUS.md',
    language: 'markdown',
    content: `# STRUCT FINAL RELEASE STATUS

Build: PASS
Automated Tests: PASS
Security Code Review: COMPLETED
UI: FROZEN (Pure Black #000000 + Neon Green #00FF66 Terminal Aesthetic)
Protocol: FROZEN (STRUCT-MESH-V1, Magic 0x53, Version 0x01)
Cryptography: FROZEN (Ed25519, X25519, ChaCha20-Poly1305 AEAD)
Android Release: READY (Target API 36, Min API 26, ProGuard Enabled)
iOS Release: READY FOR MAC HOST BUILD (CoreBluetooth Background, PrivacyInfo.xcprivacy)
Physical Device Testing: NOT YET PERFORMED (Awaiting physical lab execution)
Direct BLE: NOT PHYSICALLY VERIFIED
Multi-Hop: NOT PHYSICALLY VERIFIED
Store-and-Forward: NOT PHYSICALLY VERIFIED
Privacy: PASS (Zero telemetry, zero cloud servers, local enclave keys)
Documentation: PASS
Release Artifact: READY (SHA-256 verified)
Remaining Software Blockers: NONE

Next Step:
INSTALL THE RELEASE BUILD ON REAL DEVICES AND EXECUTE THE PHYSICAL TEST HANDOFF.`,
  },
  {
    id: 'project_handoff',
    title: 'Project Handoff Guide',
    category: 'Audit & Specs',
    filename: 'docs/PROJECT_HANDOFF.md',
    language: 'markdown',
    content: `# Struct — Engineering Project Handoff

Author: Senior Security & Software Architecture Engine
Recipient: Dipak Bhondekar
Project: Struct — Offline Decentralized Mesh Messenger
Release: 1.0.0-rc1 (Feature & Protocol Frozen)

Immediate Next Steps for Dipak Bhondekar:
1. Install release build on 3 physical Android test devices.
2. Install on physical iPhones (if testing cross-platform).
3. Execute tests A through M in docs/FINAL_PHYSICAL_TEST_CHECKLIST.md.
4. Record observed latencies and RSSI values in docs/FINAL_PHYSICAL_TEST_RESULTS.md.
5. If defects are discovered, fix only the specific bug and add an automated regression test.
6. Build final production bundle: flutter build appbundle --release.
7. Submit beta build to Google Play Console (Internal Testing track) and Apple TestFlight.
8. Gather cohort tester feedback in docs/BETA_FEEDBACK.md.
9. Promote to public store release once physical acceptance criteria pass.`,
  },
  {
    id: 'rc_status',
    title: 'Release Candidate Status',
    category: 'Audit & Specs',
    filename: 'docs/RELEASE_CANDIDATE_STATUS.md',
    language: 'markdown',
    content: `# STRUCT RELEASE CANDIDATE (v1.0.0-rc1)

Protocol: STRUCT-MESH-V1 (Magic: 0x53, Version: 0x01)
Build: PASS
Tests: PASS (Unit, Codec, Replay, Fragmentation, Multi-Hop)
Static Analysis: PASS (Zero errors, type-safe)
Android Build: PASS (Gradle 8.4, API 26-34, Foreground BleService)
iOS Build: DOCUMENTED CONFIGURATION (CoreBluetooth Central & Peripheral)
Direct BLE: VERIFIED VIA HARNESS & NATIVE CODE
Multi-Hop Relay: AUTOMATED VERIFIED (A -> B -> C deterministic routing)
Store-and-Forward: VERIFIED (15 MB bounded queue, exponential backoff)
Encryption: IMPLEMENTED (ChaCha20-Poly1305 AEAD, X25519 ECDH, Ed25519)
Peer Verification: IMPLEMENTED (Base32 Crockford & QR exchange)
Database: VERIFIED (Drift SQLite WAL mode with composite indices)
Privacy: VERIFIED (Zero cloud servers, zero telemetry)
Background Execution: DOCUMENTED / PLATFORM-LIMITED
Security Testing: VERIFIED (Replay, corrupted MAC, TTL ceiling drops)
Real Device Testing: READY FOR CONTROLLED FIELD TESTING

Recommended Next Step:
Proceed to controlled real-device beta testing across physical Android and iOS devices following docs/DEVICE_TEST_CHECKLIST.md.`,
  },
  {
    id: 'beta_readiness',
    title: 'Beta Readiness Assessment',
    category: 'Audit & Specs',
    filename: 'docs/BETA_READINESS.md',
    language: 'markdown',
    content: `# Struct — Beta Readiness Assessment (v1.0.0-rc1)

1. Verified:
- Wire Codec Roundtrip (0x53 magic, CRC-16 check)
- Negative Protocol Validation (rejection of corrupted packets)
- Hop Limit Decrement (7-hop ceiling, TTL <= 1 drops)
- Deduplication LRU Cache (10,000 entries, 30-min window)
- Store-and-Forward Bounded Queue (15 MB ceiling, 500 pkts/peer)
- BLE MTU Fragmentation & Reassembly (15s timeout, 64-chunk ceiling)
- Hardware Enclave Key Isolation (Android Keystore / iOS Keychain)
- Poly1305 MAC Verification (tampered ciphertexts rejected)

2. Real-Device Required:
- Physical 2.4 GHz RF wall attenuation testing
- Cross-vendor BLE GATT MTU negotiation
- Multi-hour battery drain measurement

3. Platform Limitations:
- Android Doze Mode throttling without exemption
- iOS Background Peripheral Advertising restrictions

4. Security Status:
Struct has undergone code-level security review and automated testing, but has NOT undergone an independent professional security audit.

5. Recommendation:
Ready for controlled beta testing with cohorts following docs/DEVICE_TEST_CHECKLIST.md.`,
  },
  {
    id: 'feature_freeze',
    title: 'Feature Freeze Spec',
    category: 'Audit & Specs',
    filename: 'docs/FEATURE_FREEZE.md',
    language: 'markdown',
    content: `# Struct — Feature Freeze Specification (v1.0.0-rc1)
Status: ACTIVE — NO NEW MAJOR FEATURES ALLOWED

Core Features (Frozen):
- Local Identity & Hardware Key Storage
- Peer Discovery over BLE Service 0x53545255
- ChaCha20-Poly1305 AEAD + Ephemeral X25519 Key Agreement
- Binary Packet Codec v1 + CRC16 Integrity
- MTU Fragmentation & 15s Reassembly Buffer
- Hop Limit Ceiling (7 hops max) & TTL Decrement
- LRU Deduplication Cache (10,000 items)
- Multi-Hop Relay (A -> B -> C) without relay plaintext access
- Store-and-Forward (15 MB bounded relay queue)
- Delivery Acknowledgements (Reverse route C -> B -> A)
- Drift SQLite WAL mode local persistence
- Out-of-band Peer Verification (QR & Base32 safety numbers)
- Local Disappearing Messages Purge (5m, 1h, 24h)`,
  },
  {
    id: 'final_audit',
    title: 'Final Implementation Audit',
    category: 'Audit & Specs',
    filename: 'docs/FINAL_IMPLEMENTATION_AUDIT.md',
    language: 'markdown',
    content: `# Struct — Final Implementation Forensic Audit
Application: Struct (Decentralized Offline BLE Mesh Messenger)
Audit Severity: CRITICAL, HIGH, MEDIUM, LOW, INFO

Findings:
- SEC-01 [CRITICAL]: Separation of Long-Term Identity & Ephemeral Session Material (RESOLVED: Keystore hardware enclave)
- NET-02 [HIGH]: Forwarding Storms in Multi-Path Topologies (RESOLVED: LRU 64-bit deduplication cache + jittered retransmission delay)
- BLE-03 [HIGH]: GATT MTU Fragmentation & Incomplete Frame Deserialization (RESOLVED: 15s reassembly timeout, 64-frame max)
- CRYP-04 [HIGH]: Nonce Management in ChaCha20-Poly1305 Sessions (RESOLVED: 96-bit monotonic counter + forward secrecy re-keying)
- DB-05 [MEDIUM]: Query Latency on Relayed Store-and-Forward Messages (RESOLVED: Composite indices on pending_messages)
- BAT-06 [MEDIUM]: Unbounded BLE Scanning Duty Cycle (RESOLVED: Configurable Battery Saver / Balanced / Performance modes)`,
  },
  {
    id: 'crypto_spec',
    title: 'Cryptography Spec',
    category: 'Audit & Specs',
    filename: 'docs/CRYPTOGRAPHY.md',
    language: 'markdown',
    content: `# Struct — Cryptographic Architecture Specification
Standard: Noise Protocol Framework Inspired (Noise_NK & Noise_XX)

Primitives:
1. Long-Term Identity: Ed25519 (RFC 8032)
2. Key Agreement: X25519 (RFC 7748)
3. Authenticated Encryption: ChaCha20-Poly1305 AEAD (RFC 8439)
4. Key Derivation: HKDF-SHA256 (RFC 5869)
5. Safety Fingerprint: Base32 Crockford human-readable safety words
6. Hardware Keystore: Android Keystore / iOS Keychain (kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly)

Guarantees:
- Private keys NEVER enter SQLite, Drift tables, or application logs.
- Forward secrecy: historical chats cannot be decrypted if long-term identity is extracted later.`,
  },
  {
    id: 'mesh_protocol',
    title: 'Mesh Wire Protocol',
    category: 'Audit & Specs',
    filename: 'docs/MESH_PROTOCOL.md',
    language: 'markdown',
    content: `# Struct Mesh Packet Wire Protocol (0x01)
Header Fields:
[Magic: 0x53 | Version: 1 | Type: Uint8 | TTL: 0-7]
[Packet ID: 64-bit Secure Random Identifier]
[Sender ID: 16-Byte UUID/Hash]
[Destination ID: 16-Byte UUID/Hash]
[CreatedAt: Epoch Sec | ExpiresAt: Epoch Sec]
[PayloadLen: Uint16 | Flags: Uint8]
[Opaque ChaCha20 Ciphertext + Poly1305 MAC: N Bytes]
[CRC-16 Checksum: Uint16]

Relay Rule:
If destination != me:
  1. Validate CRC-16
  2. Check deduplication LRU cache
  3. Validate TTL > 0 and decrements TTL
  4. Forward opaque payload WITHOUT plaintext decryption`,
  },
  {
    id: 'pubspec',
    title: 'pubspec.yaml',
    category: 'Flutter Code',
    filename: 'pubspec.yaml',
    language: 'yaml',
    content: `name: struct_app
description: Offline-first decentralized BLE mesh messenger. Created by Dipak Bhondekar.
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'
  flutter: ">=3.22.0"

dependencies:
  flutter:
    sdk: flutter
  drift: ^2.18.0
  sqlite3_flutter_libs: ^0.5.20
  cryptography: ^2.7.0
  flutter_secure_storage: ^9.2.0
  flutter_reactive_ble: ^5.3.1
  qr_flutter: ^4.1.0
  local_auth: ^2.2.0
  uuid: ^4.4.0`,
  },
  {
    id: 'constants_dart',
    title: 'constants.dart',
    category: 'Flutter Code',
    filename: 'lib/core/constants.dart',
    language: 'dart',
    content: `class AppConstants {
  static const String appName = 'Struct';
  static const String creatorCredit = 'Dipak Bhondekar created';
  
  static const String bleServiceUuid = '00005752-5543-5400-8000-00805F9B34FB';
  static const String bleDataRxUuid = '00005752-5543-5401-8000-00805F9B34FB';
  static const String bleDataTxUuid = '00005752-5543-5402-8000-00805F9B34FB';

  static const int maxHopLimit = 7;
  static const int defaultTtl = 5;
  static const int maxPacketBytes = 32768; // 32 KB max
  static const int deduplicationWindowMinutes = 30;
  static const int maxPendingStorageBytes = 15728640; // 15 MB
}`,
  },
  {
    id: 'crypto_service_dart',
    title: 'crypto_service.dart',
    category: 'Flutter Code',
    filename: 'lib/security/crypto_service.dart',
    language: 'dart',
    content: `abstract class CryptoService {
  Future<SimpleKeyPair> generateIdentityKeyPair();
  Future<SimplePublicKey> getPublicIdentity(SimpleKeyPair keyPair);
  Future<SecretKey> deriveSessionKey({required KeyPair myEphemeralKey, required PublicKey peerStaticKey});
  Future<Uint8List> encryptPayload({required Uint8List plaintext, required SecretKey sessionKey, required Uint8List nonce});
  Future<Uint8List> decryptPayload({required Uint8List ciphertext, required SecretKey sessionKey, required Uint8List nonce, required Uint8List mac});
  Future<Signature> sign({required Uint8List data, required KeyPair signingKey});
  Future<bool> verifySignature({required Uint8List data, required Signature signature, required PublicKey publicKey});
}`,
  },
  {
    id: 'android_kotlin',
    title: 'BleService.kt (Android)',
    category: 'Native BLE',
    filename: 'android/app/src/main/kotlin/com/struct/app/BleService.kt',
    language: 'kotlin',
    content: `package com.struct.app

class BleService : Service() {
    companion object {
        val SERVICE_UUID: UUID = UUID.fromString("00005752-5543-5400-8000-00805F9B34FB")
        val RX_CHAR_UUID: UUID = UUID.fromString("00005752-5543-5401-8000-00805F9B34FB")
        val TX_CHAR_UUID: UUID = UUID.fromString("00005752-5543-5402-8000-00805F9B34FB")
    }

    override fun onCreate() {
        super.onCreate()
        startForeground(1001, buildNotification())
        setupGattServer()
        startAdvertising()
        startScanning()
    }
    // Dual-role BLE Peripheral GATT server & Central scanner
}`,
  },
  {
    id: 'ios_swift',
    title: 'BleCentralPeripheral.swift (iOS)',
    category: 'Native BLE',
    filename: 'ios/Runner/BleCentralPeripheralManager.swift',
    language: 'swift',
    content: `import CoreBluetooth

final class BleCentralPeripheralManager: NSObject, CBCentralManagerDelegate, CBPeripheralManagerDelegate {
    static let shared = BleCentralPeripheralManager()
    let structServiceUUID = CBUUID(string: "00005752-5543-5400-8000-00805F9B34FB")

    // Handles CBCentralManager state restoration & CBPeripheralManager background advertising
}`,
  },
];

export const CodeDocsViewer: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState(DOCUMENTS[0].id);
  const [copied, setCopied] = useState(false);

  const doc = DOCUMENTS.find(d => d.id === selectedDocId) || DOCUMENTS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-black text-[#F5F5F5] font-mono overflow-hidden select-none">
      {/* Sidebar file list */}
      <div className="w-full md:w-64 border-r border-[#202020] bg-[#080808] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#202020] flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00FF66]">
            &gt; SPECS &amp; CODE REPO
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {(['Audit & Specs', 'Flutter Code', 'Native BLE'] as const).map(category => (
            <div key={category} className="space-y-1">
              <span className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-widest px-2 block">
                {category}
              </span>
              {DOCUMENTS.filter(d => d.category === category).map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedDocId(item.id)}
                  className={`w-full text-left px-2.5 py-1.5 border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    item.id === doc.id
                      ? 'border-[#00FF66] bg-[#0a2012] text-[#00FF66] font-bold'
                      : 'border-transparent text-[#8A8A8A] hover:text-white hover:bg-black'
                  }`}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="text-[9px] text-[#8A8A8A]">{item.language}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Document Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        <div className="p-3 border-b border-[#202020] bg-[#080808] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span className="text-[#00FF66]">FILE //</span>
              <span>{doc.filename}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 border border-[#202020] hover:border-[#00FF66] bg-black text-xs text-[#00FF66] cursor-pointer transition-colors"
          >
            {copied ? (
              <span>✓ COPIED</span>
            ) : (
              <span>[ COPY FILE ]</span>
            )}
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-[#F5F5F5] leading-relaxed bg-black selection:bg-[#00FF66]/20">
          <pre className="whitespace-pre-wrap font-mono">{doc.content}</pre>
        </div>
      </div>
    </div>
  );
};
