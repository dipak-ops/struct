import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import '../lib/mesh/models/packet.dart';
import '../lib/mesh/packet_codec.dart';
import '../lib/core/errors.dart';

void main() {
  group('Packet Validation & Wire Protocol Negative Security Tests', () {
    test('Rejects packet with corrupted magic byte', () {
      final valid = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_sec_001',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 5,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        encryptedPayload: Uint8List.fromList([1, 2, 3, 4, 5, 6, 7, 8]),
        checksum: 0,
      );

      final encoded = PacketCodec.encode(valid);
      // Corrupt magic byte (index 0)
      encoded[0] = 0xAA;

      expect(
        () => PacketCodec.decode(encoded),
        throwsA(isA<PacketValidationError>()),
      );
    });

    test('Rejects packet with unsupported protocol version', () {
      final valid = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_sec_002',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 5,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        encryptedPayload: Uint8List.fromList([10, 20, 30]),
        checksum: 0,
      );

      final encoded = PacketCodec.encode(valid);
      // Change version from 1 to 99
      encoded[1] = 99;

      expect(
        () => PacketCodec.decode(encoded),
        throwsA(isA<PacketValidationError>()),
      );
    });

    test('Rejects packet with TTL exceeding hop ceiling of 7', () {
      expect(
        () => MeshPacket(
          packetType: PacketType.data,
          packetId: 'pkt_sec_003',
          senderId: 'node_a',
          destinationId: 'node_c',
          ttl: 8, // Exceeds ceiling
          createdAt: DateTime.now(),
          expiresAt: DateTime.now().add(const Duration(hours: 1)),
          encryptedPayload: Uint8List(16),
          checksum: 0,
        ),
        returnsNormally,
      );

      final packet = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_sec_003',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 8,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        encryptedPayload: Uint8List(16),
        checksum: 0,
      );

      expect(
        () => PacketCodec.encode(packet),
        throwsA(isA<PacketValidationError>()),
      );
    });

    test('Rejects packet with corrupted CRC16 checksum', () {
      final valid = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_sec_004',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 3,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        encryptedPayload: Uint8List.fromList([0xDE, 0xAD, 0xBE, 0xEF]),
        checksum: 0,
      );

      final encoded = PacketCodec.encode(valid);
      // Flip a bit in the encrypted payload
      encoded[63] ^= 0x01;

      expect(
        () => PacketCodec.decode(encoded),
        throwsA(isA<PacketValidationError>()),
      );
    });

    test('Rejects truncated packet shorter than minimum header', () {
      final truncated = Uint8List.fromList([0x53, 0x01, 0x04]);
      expect(
        () => PacketCodec.decode(truncated),
        throwsA(isA<PacketValidationError>()),
      );
    });
  });
}
