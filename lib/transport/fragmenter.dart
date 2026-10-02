import 'dart:typed_data';
import 'dart:convert';
import '../core/constants.dart';
import '../core/errors.dart';
import '../mesh/packet_codec.dart';

class BleFragmentFrame {
  final String packetId;
  final int seqIndex;
  final int totalCount;
  final Uint8List dataChunk;
  final int checksum;

  BleFragmentFrame({
    required this.packetId,
    required this.seqIndex,
    required this.totalCount,
    required this.dataChunk,
    required this.checksum,
  });

  Uint8List toBytes() {
    final pIdBytes = utf8.encode(packetId.padRight(16).substring(0, 16));
    final frameLen = 16 + 2 + 2 + 2 + dataChunk.length + 2;
    final buffer = Uint8List(frameLen);
    final bdata = ByteData.view(buffer.buffer);

    buffer.setRange(0, 16, pIdBytes);
    bdata.setUint16(16, seqIndex);
    bdata.setUint16(18, totalCount);
    bdata.setUint16(20, dataChunk.length);
    buffer.setRange(22, 22 + dataChunk.length, dataChunk);

    final crc = PacketCodec.computeCrc16(buffer, 0, 22 + dataChunk.length);
    bdata.setUint16(22 + dataChunk.length, crc);

    return buffer;
  }

  static BleFragmentFrame fromBytes(Uint8List rawBytes) {
    if (rawBytes.length < 24) {
      throw const PacketValidationError('Fragment frame too small');
    }
    final bdata = ByteData.view(rawBytes.buffer, rawBytes.offsetInBytes, rawBytes.length);

    final packetId = utf8.decode(rawBytes.sublist(0, 16)).trim();
    final seqIndex = bdata.getUint16(16);
    final totalCount = bdata.getUint16(18);
    final chunkLen = bdata.getUint16(20);

    if (seqIndex >= totalCount) {
      throw PacketValidationError('Invalid fragment sequence index: $seqIndex >= $totalCount');
    }
    if (totalCount > AppConstants.maxFragmentCount) {
      throw PacketValidationError('Fragment count exceeds maximum allowed: $totalCount > ${AppConstants.maxFragmentCount}');
    }

    final expectedTotal = 22 + chunkLen + 2;
    if (rawBytes.length != expectedTotal) {
      throw PacketValidationError('Fragment frame length mismatch: expected $expectedTotal, got ${rawBytes.length}');
    }

    final chunkData = Uint8List.fromList(rawBytes.sublist(22, 22 + chunkLen));
    final expectedCrc = PacketCodec.computeCrc16(rawBytes, 0, 22 + chunkLen);
    final actualCrc = bdata.getUint16(22 + chunkLen);

    if (expectedCrc != actualCrc) {
      throw const PacketValidationError('Fragment CRC16 checksum verification failed');
    }

    return BleFragmentFrame(
      packetId: packetId,
      seqIndex: seqIndex,
      totalCount: totalCount,
      dataChunk: chunkData,
      checksum: actualCrc,
    );
  }
}

class PacketFragmenter {
  /// Splits raw packet bytes into sequential BLE GATT fragment frames
  static List<BleFragmentFrame> fragment(String packetId, Uint8List packetBytes, {int mtu = 240}) {
    final maxChunkSize = mtu - 24; // 24 bytes overhead for fragment header & CRC
    if (maxChunkSize <= 0) {
      throw const BleError('MTU too small to fit BLE fragment header');
    }

    final totalCount = (packetBytes.length + maxChunkSize - 1) ~/ maxChunkSize;
    if (totalCount > AppConstants.maxFragmentCount) {
      throw PacketValidationError(
        'Packet requires $totalCount fragments, which exceeds limit of ${AppConstants.maxFragmentCount}',
      );
    }

    final fragments = <BleFragmentFrame>[];
    for (int i = 0; i < totalCount; i++) {
      final start = i * maxChunkSize;
      final end = (start + maxChunkSize > packetBytes.length) ? packetBytes.length : (start + maxChunkSize);
      final chunk = Uint8List.fromList(packetBytes.sublist(start, end));

      fragments.add(BleFragmentFrame(
        packetId: packetId,
        seqIndex: i,
        totalCount: totalCount,
        dataChunk: chunk,
        checksum: 0,
      ));
    }

    return fragments;
  }
}
