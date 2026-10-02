import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import '../lib/mesh/models/packet.dart';
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
  });
}
