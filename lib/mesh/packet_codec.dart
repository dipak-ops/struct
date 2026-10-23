import 'dart:typed_data';
import 'dart:convert';
import 'models/packet.dart';
import '../core/errors.dart';
import '../core/constants.dart';

/// Binary Serializer & Deserializer for Struct Mesh Wire Protocol v1
class PacketCodec {
  static const int magicByte = 0x53; // 'S'
  static const int currentVersion = 0x01;
  static const int minHeaderLength = 62; // Minimum header before payload

  /// Compute CRC-16 CCITT (0x1021)
  static int computeCrc16(Uint8List data, [int offset = 0, int? length]) {
    int crc = 0xFFFF;
    final end = offset + (length ?? (data.length - offset));
    for (int i = offset; i < end; i++) {
      crc ^= data[i] << 8;
      for (int j = 0; j < 8; j++) {
        if ((crc & 0x8000) != 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    return crc;
  }

  /// Encodes a MeshPacket into a canonical wire-format binary byte buffer
  static Uint8List encode(MeshPacket packet) {
    if (packet.encryptedPayload.length > AppConstants.maxPacketBytes) {
      throw PacketValidationError(
        'Payload exceeds maximum allowed bytes: ${packet.encryptedPayload.length} > ${AppConstants.maxPacketBytes}',
      );
    }
    if (packet.ttl < 0 || packet.ttl > AppConstants.maxHopLimit) {
      throw PacketValidationError(
        'TTL out of bounds (0..${AppConstants.maxHopLimit}): ${packet.ttl}',
      );
    }

    final pIdBytes = utf8.encode(packet.packetId.padRight(16).substring(0, 16));
    final sIdBytes = utf8.encode(packet.senderId.padRight(16).substring(0, 16));
    final dIdBytes = utf8.encode(packet.destinationId.padRight(16).substring(0, 16));

    final totalLen = minHeaderLength + packet.encryptedPayload.length + 2; // +2 for CRC
    final buffer = Uint8List(totalLen);
    final bdata = ByteData.view(buffer.buffer);

    // Header layout
    bdata.setUint8(0, magicByte);
    bdata.setUint8(1, packet.version);
    bdata.setUint8(2, packet.packetType.value);
    bdata.setUint8(3, packet.ttl);

    // Timestamps
    bdata.setUint32(4, packet.createdAt.millisecondsSinceEpoch ~/ 1000);
    bdata.setUint32(8, packet.expiresAt.millisecondsSinceEpoch ~/ 1000);

    // Identifiers (16 bytes each)
    buffer.setRange(12, 28, pIdBytes);
    buffer.setRange(28, 44, sIdBytes);
    buffer.setRange(44, 60, dIdBytes);

    // Payload length
    bdata.setUint16(60, packet.encryptedPayload.length);

    // Encrypted payload
    buffer.setRange(62, 62 + packet.encryptedPayload.length, packet.encryptedPayload);

    // Checksum over all preceding bytes
    final crc = computeCrc16(buffer, 0, 62 + packet.encryptedPayload.length);
    bdata.setUint16(62 + packet.encryptedPayload.length, crc);

    return buffer;
  }

  /// Decodes and validates a raw byte buffer into a MeshPacket
  static MeshPacket decode(Uint8List rawBytes) {
    if (rawBytes.length < minHeaderLength + 2) {
      throw const PacketValidationError('Packet too short to contain valid header and checksum');
    }

    final bdata = ByteData.view(rawBytes.buffer, rawBytes.offsetInBytes, rawBytes.length);

    final magic = bdata.getUint8(0);
    if (magic != magicByte) {
      throw PacketValidationError('Invalid magic byte: 0x${magic.toRadixString(16)} != 0x53');
    }

    final version = bdata.getUint8(1);
    if (version != currentVersion) {
      throw PacketValidationError('Unsupported protocol version: $version (expected $currentVersion)');
    }

    final typeVal = bdata.getUint8(2);
    final packetType = PacketType.fromValue(typeVal);

    final ttl = bdata.getUint8(3);
    if (ttl > AppConstants.maxHopLimit) {
      throw PacketValidationError('Packet TTL exceeds maximum hop ceiling: $ttl > ${AppConstants.maxHopLimit}');
    }

    final createdSec = bdata.getUint32(4);
    final expiresSec = bdata.getUint32(8);
    final createdAt = DateTime.fromMillisecondsSinceEpoch(createdSec * 1000);
    final expiresAt = DateTime.fromMillisecondsSinceEpoch(expiresSec * 1000);

    final packetId = utf8.decode(rawBytes.sublist(12, 28)).trim();
    final senderId = utf8.decode(rawBytes.sublist(28, 44)).trim();
    final destinationId = utf8.decode(rawBytes.sublist(44, 60)).trim();

    final payloadLen = bdata.getUint16(60);
    final expectedTotal = 62 + payloadLen + 2;
    if (rawBytes.length != expectedTotal) {
      throw PacketValidationError(
        'Length mismatch: expected $expectedTotal bytes, got ${rawBytes.length}',
      );
    }

    final payload = Uint8List.fromList(rawBytes.sublist(62, 62 + payloadLen));
    final expectedCrc = computeCrc16(rawBytes, 0, 62 + payloadLen);
    final actualCrc = bdata.getUint16(62 + payloadLen);

    if (expectedCrc != actualCrc) {
      throw PacketValidationError(
        'Checksum verification failed (CRC16): expected 0x${expectedCrc.toRadixString(16)} != 0x${actualCrc.toRadixString(16)}',
      );
    }

    return MeshPacket(
      version: version,
      packetType: packetType,
      packetId: packetId,
      senderId: senderId,
      destinationId: destinationId,
      ttl: ttl,
      createdAt: createdAt,
      expiresAt: expiresAt,
      encryptedPayload: payload,
      checksum: actualCrc,
    );
  }
}
