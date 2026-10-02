import 'dart:typed_data';
import 'fragmenter.dart';
import '../core/constants.dart';
import '../core/errors.dart';

class PendingReassembly {
  final String packetId;
  final int totalCount;
  final DateTime createdAt;
  final Map<int, Uint8List> chunks = {};

  PendingReassembly({
    required this.packetId,
    required this.totalCount,
    required this.createdAt,
  });

  bool get isComplete => chunks.length == totalCount;
  bool get isExpired => DateTime.now().difference(createdAt) > AppConstants.reassemblyTimeout;

  Uint8List buildAssembledBuffer() {
    int totalBytes = 0;
    for (int i = 0; i < totalCount; i++) {
      final chunk = chunks[i];
      if (chunk == null) {
        throw PacketValidationError('Missing fragment sequence $i for packet $packetId');
      }
      totalBytes += chunk.length;
    }

    final assembled = Uint8List(totalBytes);
    int offset = 0;
    for (int i = 0; i < totalCount; i++) {
      final chunk = chunks[i]!;
      assembled.setRange(offset, offset + chunk.length, chunk);
      offset += chunk.length;
    }
    return assembled;
  }
}

class PacketReassembler {
  final Map<String, PendingReassembly> _pending = {};

  /// Ingests an incoming BLE fragment frame. Returns complete assembled bytes if all fragments arrived, or null if waiting.
  Uint8List? ingestFragment(BleFragmentFrame frame) {
    _pruneExpired();

    var pending = _pending[frame.packetId];
    if (pending == null) {
      if (_pending.length >= 256) {
        // Drop oldest pending buffer to prevent memory exhaustion
        _pending.remove(_pending.keys.first);
      }
      pending = PendingReassembly(
        packetId: frame.packetId,
        totalCount: frame.totalCount,
        createdAt: DateTime.now(),
      );
      _pending[frame.packetId] = pending;
    }

    if (pending.totalCount != frame.totalCount) {
      _pending.remove(frame.packetId);
      throw PacketValidationError('Total fragment count changed mid-stream for packet ${frame.packetId}');
    }

    // Insert chunk (idempotent for duplicate fragments)
    pending.chunks[frame.seqIndex] = frame.dataChunk;

    if (pending.isComplete) {
      _pending.remove(frame.packetId);
      return pending.buildAssembledBuffer();
    }

    return null;
  }

  void _pruneExpired() {
    _pending.removeWhere((_, buffer) => buffer.isExpired);
  }

  int get pendingBufferCount => _pending.length;

  void clear() => _pending.clear();
}
