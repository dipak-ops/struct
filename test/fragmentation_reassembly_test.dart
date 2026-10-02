import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import '../lib/transport/fragmenter.dart';
import '../lib/transport/reassembler.dart';
import '../lib/core/errors.dart';

void main() {
  group('BLE MTU Fragmentation & Out-of-Order Reassembly Tests', () {
    test('Splits and correctly reassembles data with small MTU', () {
      final originalBytes = Uint8List(500);
      for (int i = 0; i < 500; i++) {
        originalBytes[i] = (i % 256);
      }

      // Fragment with MTU 100 (chunk size = 100 - 24 = 76 bytes)
      final fragments = PacketFragmenter.fragment('pkt_frag_001', originalBytes, mtu: 100);
      expect(fragments.length, equals(7)); // ceil(500 / 76) = 7

      final reassembler = PacketReassembler();
      Uint8List? completed;

      // Ingest in reverse order to test out-of-order reassembly resilience
      for (int i = fragments.length - 1; i >= 0; i--) {
        final frameBytes = fragments[i].toBytes();
        final decodedFrame = BleFragmentFrame.fromBytes(frameBytes);
        final result = reassembler.ingestFragment(decodedFrame);
        if (result != null) {
          completed = result;
        }
      }

      expect(completed, isNotNull);
      expect(completed!.length, equals(originalBytes.length));
      expect(completed, equals(originalBytes));
    });

    test('Duplicate fragment frames are ignored safely', () {
      final data = Uint8List.fromList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      final fragments = PacketFragmenter.fragment('pkt_dup_002', data, mtu: 50);

      final reassembler = PacketReassembler();
      // Ingest fragment 0 twice
      reassembler.ingestFragment(fragments[0]);
      reassembler.ingestFragment(fragments[0]); // Duplicate

      // Ingest fragment 1
      final completed = reassembler.ingestFragment(fragments[1]);
      expect(completed, isNotNull);
      expect(completed, equals(data));
    });

    test('Rejects malformed fragment with index >= totalCount', () {
      expect(
        () => BleFragmentFrame(
          packetId: 'pkt_bad',
          seqIndex: 5,
          totalCount: 3, // Invalid: index 5 >= total 3
          dataChunk: Uint8List(10),
          checksum: 0,
        ),
        returnsNormally,
      );

      final badFrame = BleFragmentFrame(
        packetId: 'pkt_bad',
        seqIndex: 5,
        totalCount: 3,
        dataChunk: Uint8List(10),
        checksum: 0,
      );

      final bytes = badFrame.toBytes();
      expect(
        () => BleFragmentFrame.fromBytes(bytes),
        throwsA(isA<PacketValidationError>()),
      );
    });
  });
}
