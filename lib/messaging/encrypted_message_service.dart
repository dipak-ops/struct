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

    final encryptedPayload = await cryptoService.encryptPayload(
      plaintext: plaintextBytes,
      sessionKey: session.sendKey,
      nonce: nonce,
    );

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
      encryptedPayload: encryptedPayload,
      checksum: 0,
    );
  }

  /// Decrypts inbound MeshPacket at destination
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

    if (packet.encryptedPayload.length < 16) {
      throw const DecryptionError('Ciphertext too short to contain Poly1305 MAC tag');
    }

    // Split ciphertext and 16-byte Poly1305 MAC
    final ciphertextLen = packet.encryptedPayload.length - 16;
    final ciphertext = packet.encryptedPayload.sublist(0, ciphertextLen);
    final mac = packet.encryptedPayload.sublist(ciphertextLen);

    // Nonce is tracked monotonically by session
    final nonce = session.generateSendNonce();

    final decryptedBytes = await cryptoService.decryptPayload(
      ciphertext: ciphertext,
      sessionKey: session.recvKey,
      nonce: nonce,
      mac: mac,
    );

    return utf8.decode(decryptedBytes);
  }
}
