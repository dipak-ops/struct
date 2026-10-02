import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import '../lib/messaging/store_and_forward.dart';

void main() {
  group('Store-and-Forward Bounded Queue Tests', () {
    test('Stores and drains packets when peer reconnects', () {
      final sf = StoreAndForwardManager();

      final record = PendingMessageRecord(
        messageId: 'msg_offline_001',
        destinationId: 'peer_c',
        rawPacketBytes: Uint8List.fromList([1, 2, 3, 4]),
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        nextAttemptAt: DateTime.now().subtract(const Duration(seconds: 1)),
      );

      sf.enqueue(record);
      expect(sf.pendingCount, equals(1));
      expect(sf.totalStorageBytes, equals(4));

      // Drain for peer_c
      final ready = sf.drainPendingForPeer('peer_c');
      expect(ready.length, equals(1));
      expect(ready.first.messageId, equals('msg_offline_001'));

      // Drain for unrelated peer
      final empty = sf.drainPendingForPeer('peer_other');
      expect(empty.isEmpty, isTrue);

      // Acknowledge delivery
      sf.acknowledgeDelivered('msg_offline_001');
      expect(sf.pendingCount, equals(0));
      expect(sf.totalStorageBytes, equals(0));
    });

    test('Exponential backoff increments on failed attempts', () {
      final sf = StoreAndForwardManager();
      final record = PendingMessageRecord(
        messageId: 'msg_fail_002',
        destinationId: 'peer_c',
        rawPacketBytes: Uint8List(10),
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        nextAttemptAt: DateTime.now(),
      );

      sf.enqueue(record);
      expect(record.attemptCount, equals(0));

      sf.recordFailedAttempt('msg_fail_002');
      expect(record.attemptCount, equals(1));
      expect(record.nextAttemptAt.isAfter(DateTime.now()), isTrue);
    });
  });
}
