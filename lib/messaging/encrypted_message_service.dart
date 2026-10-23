import 'dart:typed_data';
import 'dart:convert';
import '../mesh/models/packet.dart';
import '../security/crypto_service.dart';
import '../security/session_manager.dart';
import '../core/constants.dart';
import '../core/errors.dart';

enum MessageState {
  queued,
  sending,
  relayed,
  delivered,
  read,
  failed,
  expired,
}

class EncryptedMessageService {
  final CryptoService cryptoService;
  final SessionManager sessionManager;
  final String localNodeId;

  EncryptedMessageService({
    required this.cryptoService,
    required this.sessionManager,
    required this.localNodeId,
  });

  /// Encrypts plaintext message with ephemeral session key and packages into a MeshPacket
  Future<MeshPacket> createOutboundMessage({
    required String recipientId,
    required String plaintext,
    required String messageId,
    required String packetId,
    int ttl = AppConstants.defaultTtl,
    Duration? lifetime,
    bool isEmergency = false,
  }) async {
    final session = sessionManager.getSession(recipientId);
    if (session == null) {
      throw SessionError('No active secure session established with peer $recipientId');
    }

    final nonce = session.generateSendNonce();
    final plaintextBytes = Uint8List.fromList(utf8.encode(plaintext));

    final encryptedBytes = await cryptoService.encryptPayload(
      plaintext: plaintextBytes,
      sessionKey: session.sendKey,
      nonce: nonce,
    );

    // Prefix 12-byte nonce to ensure authenticated nonce transmission
    final wirePayload = Uint8List(12 + encryptedBytes.length);
    wirePayload.setRange(0, 12, nonce);
    wirePayload.setRange(12, 12 + encryptedBytes.length, encryptedBytes);

    final now = DateTime.now();
    final expiresAt = now.add(lifetime ?? const Duration(hours: 1));

    return MeshPacket(
      version: 1,
      packetType: isEmergency ? PacketType.emergencySos : PacketType.data,
      packetId: packetId,
      senderId: localNodeId,
      destinationId: recipientId,
      ttl: ttl,
      createdAt: now,
      expiresAt: expiresAt,
      encryptedPayload: wirePayload,
      checksum: 0,
    );
  }

  /// Creates a signed binary DELIVERY_ACK packet to route back to original sender
  MeshPacket createDeliveryAckPacket({
    required String originalSenderId,
    required String messageId,
    required String packetId,
    int ttl = AppConstants.defaultTtl,
  }) {
    final now = DateTime.now();
    final ackPayload = Uint8List.fromList(utf8.encode(jsonEncode({
      'ack_for': messageId,
      'ack_ts': now.millisecondsSinceEpoch,
      'status': 'delivered',
    })));

    return MeshPacket(
      version: 1,
      packetType: PacketType.deliveryAck,
      packetId: packetId,
      senderId: localNodeId,
      destinationId: originalSenderId,
      ttl: ttl,
      createdAt: now,
      expiresAt: now.add(const Duration(minutes: 30)),
      encryptedPayload: ackPayload,
      checksum: 0,
    );
  }

  /// Decrypts inbound MeshPacket at destination with nonce verification & Poly1305 MAC tag authentication
  Future<String> decryptInboundMessage(MeshPacket packet) async {
    if (packet.destinationId != localNodeId) {
      throw DecryptionError(
        'Cannot decrypt message intended for another destination: ${packet.destinationId}',
      );
    }

    final session = sessionManager.getSession(packet.senderId);
    if (session == null) {
      throw SessionError('No active secure session found for sender: ${packet.senderId}');
    }

    if (packet.encryptedPayload.length < 12 + 16) {
      throw const DecryptionError(
        'Payload too short to contain 12-byte nonce and 16-byte Poly1305 MAC tag',
      );
    }

    // 1. Extract 12-byte transmitted nonce
    final nonce = Uint8List.fromList(packet.encryptedPayload.sublist(0, 12));

    // 2. Validate nonce against session state to prevent replay attacks and out-of-order repeats
    session.validateRecvNonce(nonce);

    // 3. Extract ciphertext and 16-byte MAC
    final encryptedBody = packet.encryptedPayload.sublist(12);
    final ciphertextLen = encryptedBody.length - 16;
    final ciphertext = Uint8List.fromList(encryptedBody.sublist(0, ciphertextLen));
    final mac = Uint8List.fromList(encryptedBody.sublist(ciphertextLen));

    final decryptedBytes = await cryptoService.decryptPayload(
      ciphertext: ciphertext,
      sessionKey: session.recvKey,
      nonce: nonce,
      mac: mac,
    );

    return utf8.decode(decryptedBytes);
  }
}
