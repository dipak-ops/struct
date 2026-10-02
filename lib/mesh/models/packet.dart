import 'dart:typed_data';

enum PacketType {
  hello(0x01),
  sessionInit(0x02),
  sessionResp(0x03),
  data(0x04),
  deliveryAck(0x05),
  readReceipt(0x06),
  channelData(0x07),
  emergencySos(0x08);

  final int value;
  const PacketType(this.value);

  static PacketType fromValue(int val) {
    return PacketType.values.firstWhere(
      (e) => e.value == val,
      orElse: () => throw ArgumentError('Unknown packet type: $val'),
    );
  }
}

class MeshPacket {
  final int version;
  final PacketType packetType;
  final String packetId;
  final String senderId;
  final String destinationId;
  int ttl;
  final DateTime createdAt;
  final DateTime expiresAt;
  final Uint8List encryptedPayload;
  final int checksum;

  MeshPacket({
    this.version = 1,
    required this.packetType,
    required this.packetId,
    required this.senderId,
    required this.destinationId,
    required this.ttl,
    required this.createdAt,
    required this.expiresAt,
    required this.encryptedPayload,
    required this.checksum,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get canForward => ttl > 0 && !isExpired;

  void decrementTtl() {
    if (ttl > 0) {
      ttl -= 1;
    }
  }
}
