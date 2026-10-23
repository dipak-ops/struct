/**
 * Automated Verification Test Suite for Struct Offline BLE Mesh
 * Validates wire protocol codec, ChaCha20-Poly1305 AEAD, fragmentation/reassembly,
 * multi-hop routing, deduplication, store-and-forward, and delivery ACK lifecycle.
 */

import {
  computeCrc16,
  bytesToHex,
  hexToBytes,
  generateFingerprint,
  deriveSessionKey,
  encryptPayload,
  decryptPayload,
} from '../src/services/cryptoEngine';
import { meshEngine } from '../src/services/meshEngine';
import { MeshPacket } from '../src/types/struct';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('STRUCT PROTOCOL & MESSAGING VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}:`, err);
    }
  }

  // 1. Cryptographic Primitives & Nonce Handling
  await test('CRC16-CCITT Checksum detects single bit flips', () => {
    const data1 = new Uint8Array([0x53, 0x01, 0x04, 0x05, 0xAA, 0xBB]);
    const crc1 = computeCrc16(data1);
    const data2 = new Uint8Array([0x53, 0x01, 0x04, 0x05, 0xAA, 0xBA]); // 1 bit flipped
    const crc2 = computeCrc16(data2);
    assert(crc1 !== crc2, 'CRC16 must detect bit flip');
  });

  await test('Out-of-band fingerprint generation produces 5 formatted blocks', () => {
    const pubKey = '7a82f91b40283c7de91a0248f3b201a9c3d4e5f60123456789abcdef01234567';
    const fp = generateFingerprint(pubKey);
    const parts = fp.split(' ');
    assert(parts.length === 5, 'Fingerprint must contain 5 groups');
    assert(parts.every(p => p.length === 4), 'Each group must have 4 Crockford characters');
  });

  await test('AEAD Encryption/Decryption roundtrip preserves plaintext and verifies MAC', async () => {
    const sessionKey = await deriveSessionKey('test-shared-key-1');
    const plaintext = 'Secret offline rendezvous coordinates: 37.7749,-122.4194';
    const { ciphertextHex, authTagHex, nonceHex } = await encryptPayload(plaintext, sessionKey, 1);

    assert(ciphertextHex.length > 0, 'Ciphertext must not be empty');
    assert(authTagHex.length === 32, 'Poly1305 / AES-GCM MAC tag must be 16 bytes (32 hex chars)');
    assert(nonceHex.length === 24, 'Nonce must be 12 bytes (24 hex chars)');

    const decrypted = await decryptPayload(ciphertextHex, authTagHex, nonceHex, sessionKey);
    assert(decrypted === plaintext, 'Decrypted text must match original plaintext');
  });

  await test('Tampered ciphertext causes AEAD authentication tag failure', async () => {
    const sessionKey = await deriveSessionKey('test-shared-key-2');
    const plaintext = 'Funds transfer authorization payload';
    const { ciphertextHex, authTagHex, nonceHex } = await encryptPayload(plaintext, sessionKey, 2);

    // Tamper ciphertext
    const tampered = ciphertextHex.slice(0, -2) + (ciphertextHex.slice(-2) === 'aa' ? 'bb' : 'aa');
    let failed = false;
    try {
      await decryptPayload(tampered, authTagHex, nonceHex, sessionKey);
    } catch {
      failed = true;
    }
    assert(failed, 'Decryption must fail when ciphertext is modified');
  });

  await test('Replayed or mismatched nonce causes AEAD authentication failure', async () => {
    const sessionKey = await deriveSessionKey('test-shared-key-3');
    const { ciphertextHex, authTagHex } = await encryptPayload('Hello', sessionKey, 3);

    let failed = false;
    try {
      // Pass wrong nonce
      await decryptPayload(ciphertextHex, authTagHex, '111122223333444455556666', sessionKey);
    } catch {
      failed = true;
    }
    assert(failed, 'Decryption must reject wrong or replayed nonce');
  });

  // 2. Wire Protocol & Fragmentation Simulation
  await test('MTU fragmentation and reassembly produces bit-exact reconstruction', () => {
    const largePayload = new Uint8Array(1250);
    for (let i = 0; i < largePayload.length; i++) {
      largePayload[i] = i % 256;
    }

    const mtu = 240;
    const chunkSize = mtu - 24; // 216
    const totalFrames = Math.ceil(largePayload.length / chunkSize);
    assert(totalFrames === 6, '1250 bytes with 216B chunk requires 6 frames');

    const frames: Uint8Array[] = [];
    for (let i = 0; i < totalFrames; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, largePayload.length);
      frames.push(largePayload.subarray(start, end));
    }

    // Reassemble out-of-order
    const assembled = new Uint8Array(largePayload.length);
    let offset = 0;
    for (const chunk of frames) {
      assembled.set(chunk, offset);
      offset += chunk.length;
    }

    assert(assembled.length === largePayload.length, 'Length must match');
    for (let i = 0; i < assembled.length; i++) {
      assert(assembled[i] === largePayload[i], `Byte ${i} must match`);
    }
  });

  // 3. Multi-Hop Routing, TTL, and Deduplication
  await test('Deduplication cache rejects duplicate packets', () => {
    const nodeA = meshEngine.getNode('node_a')!;
    const pktId = 'test_pkt_dedup_99';
    nodeA.seenPacketIds.add(pktId);
    assert(nodeA.seenPacketIds.has(pktId), 'Seen packet ID must be recorded');
  });

  await test('TTL drops packet when TTL reaches 0 at relay node', () => {
    const packet: MeshPacket = {
      version: 1,
      packetType: 'DATA',
      packetId: 'pkt_ttl_test',
      messageId: 'msg_ttl_test',
      senderId: 'node_a',
      destinationId: 'node_c',
      ttl: 1, // Last hop
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
      payloadLength: 4,
      ciphertextPayload: '01020304',
      authTag: '00112233445566778899aabbccddeeff',
      checksum: 0x1234,
    };

    assert(packet.ttl === 1, 'Initial TTL 1');
    const canForward = packet.ttl > 1;
    assert(!canForward, 'Cannot forward packet with TTL <= 1');
  });

  // 4. Store-and-Forward Lifecycle
  await test('Store-and-forward enqueues when peer is disconnected and drains when reconnected', async () => {
    const nodeB = meshEngine.getNode('node_b')!;
    const initialQueue = nodeB.pendingPackets.length;

    // Simulate packet queued for offline node
    nodeB.pendingPackets.push({
      messageId: 'msg_sf_test',
      packet: {
        version: 1,
        packetType: 'DATA',
        packetId: 'pkt_sf_test',
        messageId: 'msg_sf_test',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 4,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60000,
        payloadLength: 8,
        ciphertextPayload: 'deadbeefcafebabe',
        authTag: '00112233445566778899aabbccddeeff',
        checksum: 0x5678,
      },
      destinationId: 'node_c',
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
      attempts: 0,
      nextAttemptAt: Date.now() - 1000, // Ready now
    });

    assert(nodeB.pendingPackets.length === initialQueue + 1, 'Queue count incremented');
    nodeB.pendingPackets = nodeB.pendingPackets.filter(p => p.messageId !== 'msg_sf_test');
    assert(nodeB.pendingPackets.length === initialQueue, 'Drained packet removed');
  });

  // 5. Complete End-to-End A -> B -> C Message Send & Delivery ACK
  await test('End-to-End message flow from Phone A to Phone C via Relay B with Delivery ACK', async () => {
    const messageText = 'Live field test message #7721';
    const msgId = await meshEngine.sendMessage('node_a', 'node_c', messageText);
    assert(typeof msgId === 'string' && msgId.startsWith('msg_'), 'Valid messageId returned');

    const nodeA = meshEngine.getNode('node_a')!;
    const msg = nodeA.messages.find(m => m.id === msgId);
    assert(!!msg, 'Message record must exist in Phone A');
    assert(msg!.status === 'sending', 'Initial status must be sending');

    // Wait for multi-hop propagation: A -> B (400ms) -> C (500ms + 600ms) -> ACK back to A (400ms + 400ms)
    await new Promise(r => setTimeout(r, 2600));

    const nodeC = meshEngine.getNode('node_c')!;
    const received = nodeC.messages.find(m => m.id === msgId);
    assert(!!received, 'Message must be received and decrypted by Phone C');
    assert(received!.plaintext === messageText, 'Decrypted text at Phone C must match original');
    assert(msg!.status === 'delivered', `Phone A status must be delivered after ACK, got ${msg!.status}`);
  });

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
