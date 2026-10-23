import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import '../lib/mesh/models/packet.dart';
import '../lib/mesh/packet_codec.dart';
import '../lib/core/constants.dart';

void main() {
  group('MeshPacket Validation & Lifecycle Tests', () {
    test('Packet drops when TTL reaches zero', () {
      final packet = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_test_001',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 1,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(minutes: 10)),
        encryptedPayload: Uint8List.fromList([1, 2, 3, 4]),
        checksum: 0x1234,
      );

      expect(packet.canForward, isTrue);
      packet.decrementTtl();
      expect(packet.ttl, equals(0));
      expect(packet.canForward, isFalse);
    });

    test('Expired packets are rejected', () {
      final packet = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_test_002',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 5,
        createdAt: DateTime.now().subtract(const Duration(minutes: 40)),
        expiresAt: DateTime.now().subtract(const Duration(minutes: 10)), // Already expired
        encryptedPayload: Uint8List.fromList([0xAA, 0xBB]),
        checksum: 0x5678,
      );

      expect(packet.isExpired, isTrue);
      expect(packet.canForward, isFalse);
    });

    test('TTL cannot exceed maximum hop limit of 7', () {
      expect(AppConstants.maxHopLimit, equals(7));
    });

    test('PacketCodec encodes and decodes wire-format buffer roundtrip faithfully', () {
      final payload = Uint8List.fromList([10, 20, 30, 40, 50, 60, 70, 80]);
      final now = DateTime.now();
      final packet = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_roundtrip_01',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 5,
        createdAt: now,
        expiresAt: now.add(const Duration(hours: 1)),
        encryptedPayload: payload,
        checksum: 0,
      );

      final encoded = PacketCodec.encode(packet);
      // Header 62 bytes + payload 8 bytes + CRC 2 bytes = 72 bytes
      expect(encoded.length, equals(62 + 8 + 2));

      final decoded = PacketCodec.decode(encoded);
      expect(decoded.packetId, equals(packet.packetId));
      expect(decoded.senderId, equals(packet.senderId));
      expect(decoded.destinationId, equals(packet.destinationId));
      expect(decoded.ttl, equals(5));
      expect(decoded.packetType, equals(PacketType.data));
      expect(decoded.encryptedPayload, equals(payload));
      expect(decoded.checksum, isNonZero);
    });

    test('PacketCodec handles zero-length payload correctly', () {
      final now = DateTime.now();
      final emptyPacket = MeshPacket(
        packetType: PacketType.hello,
        packetId: 'pkt_empty_002',
        senderId: 'node_a',
        destinationId: 'node_b',
        ttl: 1,
        createdAt: now,
        expiresAt: now.add(const Duration(minutes: 5)),
        encryptedPayload: Uint8List(0),
        checksum: 0,
      );

      final encoded = PacketCodec.encode(emptyPacket);
      expect(encoded.length, equals(64)); // 62 header + 0 payload + 2 CRC

      final decoded = PacketCodec.decode(encoded);
      expect(decoded.packetId, equals('pkt_empty_002'));
      expect(decoded.encryptedPayload.isEmpty, isTrue);
    });
  });
}
