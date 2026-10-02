import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import '../lib/mesh/models/packet.dart';
import '../lib/mesh/mesh_router.dart';
import '../lib/mesh/deduplication_service.dart';

void main() {
  group('Deterministic Multi-Hop Routing Tests (A -> B -> C)', () {
    test('Router correctly identifies destination vs relay node', () {
      final routerB = MeshRouter(localNodeId: 'node_b');
      final routerC = MeshRouter(localNodeId: 'node_c');

      final packet = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_route_001',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 5,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        encryptedPayload: Uint8List.fromList([0xAA, 0xBB]),
        checksum: 0,
      );

      // Node B evaluates packet -> destination != B -> shouldForward
      final decisionB = routerB.routeInboundPacket(
        packet,
        connectedPeerIds: ['node_a', 'node_c'],
      );

      expect(decisionB.shouldDeliverLocal, isFalse);
      expect(decisionB.shouldForward, isTrue);
      expect(decisionB.targetPeers, contains('node_c'));
      expect(decisionB.targetPeers, isNot(contains('node_a'))); // Excludes sender

      // Node B decremented TTL from 5 to 4
      expect(packet.ttl, equals(4));

      // Node C evaluates packet -> destination == C -> shouldDeliverLocal
      final decisionC = routerC.routeInboundPacket(
        packet,
        connectedPeerIds: ['node_b'],
      );

      expect(decisionC.shouldDeliverLocal, isTrue);
      expect(decisionC.shouldForward, isFalse);
    });

    test('Deduplication prevents broadcast loops and redundant forwarding', () {
      final dedup = DeduplicationService();
      final router = MeshRouter(localNodeId: 'node_b', deduplicationService: dedup);

      final packet = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_loop_002',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 4,
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        encryptedPayload: Uint8List.fromList([1, 2, 3]),
        checksum: 0,
      );

      // First arrival -> forwards
      final first = router.routeInboundPacket(packet, connectedPeerIds: ['node_c']);
      expect(first.shouldForward, isTrue);

      // Second arrival of same packetId (loop from another peer) -> ignored
      final second = router.routeInboundPacket(packet, connectedPeerIds: ['node_c']);
      expect(second.shouldForward, isFalse);
      expect(second.dropReason, equals('DUPLICATE_PACKET_IGNORED'));
    });

    test('Packets drop when TTL reaches 1 and cannot forward with TTL 0', () {
      final router = MeshRouter(localNodeId: 'node_b');
      final packet = MeshPacket(
        packetType: PacketType.data,
        packetId: 'pkt_ttl_003',
        senderId: 'node_a',
        destinationId: 'node_c',
        ttl: 1, // Last hop
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        encryptedPayload: Uint8List.fromList([9, 9]),
        checksum: 0,
      );

      final decision = router.routeInboundPacket(packet, connectedPeerIds: ['node_c']);
      expect(decision.shouldForward, isFalse);
      expect(decision.dropReason, equals('TTL_EXPIRED_OR_ZERO'));
      expect(packet.ttl, equals(0));
    });
  });
}
