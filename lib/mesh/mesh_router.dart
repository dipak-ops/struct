import 'dart:typed_data';
import 'models/packet.dart';
import 'deduplication_service.dart';
import 'ttl_manager.dart';
import '../core/errors.dart';

abstract class MeshTransportAdapter {
  Future<void> sendPacketToPeer(String peerId, Uint8List rawPacketBytes);
  List<String> getConnectedPeerIds();
}

class RoutingDecision {
  final bool shouldDeliverLocal;
  final bool shouldForward;
  final List<String> targetPeers;
  final String? dropReason;

  const RoutingDecision({
    this.shouldDeliverLocal = false,
    this.shouldForward = false,
    this.targetPeers = const [],
    this.dropReason,
  });
}

class MeshRouter {
  final String localNodeId;
  final DeduplicationService deduplicationService;

  MeshRouter({
    required this.localNodeId,
    DeduplicationService? deduplicationService,
  }) : deduplicationService = deduplicationService ?? DeduplicationService();

  /// Evaluates an inbound MeshPacket and produces a deterministic routing decision
  RoutingDecision routeInboundPacket(
    MeshPacket packet, {
    required List<String> connectedPeerIds,
  }) {
    // 1. Deduplication check
    if (deduplicationService.isDuplicate(packet.packetId)) {
      return const RoutingDecision(dropReason: 'DUPLICATE_PACKET_IGNORED');
    }

    // 2. Expiration check
    if (DateTime.now().isAfter(packet.expiresAt)) {
      return const RoutingDecision(dropReason: 'PACKET_EXPIRED');
    }

    // 3. Destination check
    if (packet.destinationId == localNodeId) {
      return const RoutingDecision(shouldDeliverLocal: true);
    }

    // 4. Relay check: TTL decrement
    final canRelay = TtlManager.prepareForRelay(packet);
    if (!canRelay) {
      return const RoutingDecision(dropReason: 'TTL_EXPIRED_OR_ZERO');
    }

    // 5. Eligible forwarding targets (exclude the sender node if direct)
    final targets = connectedPeerIds.where((p) => p != packet.senderId).toList();
    if (targets.isEmpty) {
      return const RoutingDecision(dropReason: 'NO_REACHABLE_NEXT_HOP_QUEUE_STORE_FORWARD');
    }

    return RoutingDecision(shouldForward: true, targetPeers: targets);
  }
}
