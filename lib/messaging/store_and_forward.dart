import 'dart:typed_data';
import '../core/constants.dart';
import '../core/errors.dart';

class PendingMessageRecord {
  final String messageId;
  final String destinationId;
  final Uint8List rawPacketBytes;
  final DateTime createdAt;
  final DateTime expiresAt;
  DateTime nextAttemptAt;
  int attemptCount;

  PendingMessageRecord({
    required this.messageId,
    required this.destinationId,
    required this.rawPacketBytes,
    required this.createdAt,
    required this.expiresAt,
    required this.nextAttemptAt,
    this.attemptCount = 0,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

class StoreAndForwardManager {
  final Map<String, PendingMessageRecord> _pendingQueue = {};
  int _totalStorageBytes = 0;

  /// Enqueue an encrypted packet for offline store-and-forward relaying
  void enqueue(PendingMessageRecord record) {
    _pruneExpired();

    if (record.rawPacketBytes.length > AppConstants.maxPacketBytes) {
      throw const StorageError('Packet exceeds max allowed relay packet size');
    }

    // Check per-peer pending count
    final peerCount = _pendingQueue.values.where((r) => r.destinationId == record.destinationId).length;
    if (peerCount >= AppConstants.maxPendingPacketsPerPeer) {
      throw StorageError('Per-peer pending queue full for destination: ${record.destinationId}');
    }

    // Enforce 15 MB total storage ceiling
    if (_totalStorageBytes + record.rawPacketBytes.length > AppConstants.maxPendingStorageBytes) {
      // Evict oldest record
      _evictOldest();
    }

    _pendingQueue[record.messageId] = record;
    _totalStorageBytes += record.rawPacketBytes.length;
  }

  /// Finds all pending records ready for delivery to a specific reconnected peer
  List<PendingMessageRecord> drainPendingForPeer(String peerId) {
    _pruneExpired();
    final now = DateTime.now();
    final ready = <PendingMessageRecord>[];

    for (final record in _pendingQueue.values) {
      if (record.destinationId == peerId && now.isAfter(record.nextAttemptAt)) {
        ready.add(record);
      }
    }
    return ready;
  }

  void acknowledgeDelivered(String messageId) {
    final removed = _pendingQueue.remove(messageId);
    if (removed != null) {
      _totalStorageBytes -= removed.rawPacketBytes.length;
    }
  }

  void recordFailedAttempt(String messageId) {
    final record = _pendingQueue[messageId];
    if (record != null) {
      record.attemptCount += 1;
      // Exponential backoff: 2s, 4s, 8s, 16s, max 60s
      final backoffSeconds = (2 << record.attemptCount).clamp(2, 60);
      record.nextAttemptAt = DateTime.now().add(Duration(seconds: backoffSeconds));
    }
  }

  void _pruneExpired() {
    _pendingQueue.removeWhere((_, r) {
      if (r.isExpired) {
        _totalStorageBytes -= r.rawPacketBytes.length;
        return true;
      }
      return false;
    });
  }

  void _evictOldest() {
    if (_pendingQueue.isEmpty) return;
    final oldestKey = _pendingQueue.keys.first;
    final removed = _pendingQueue.remove(oldestKey);
    if (removed != null) {
      _totalStorageBytes -= removed.rawPacketBytes.length;
    }
  }

  int get pendingCount => _pendingQueue.length;
  int get totalStorageBytes => _totalStorageBytes;

  void clear() {
    _pendingQueue.clear();
    _totalStorageBytes = 0;
  }
}
