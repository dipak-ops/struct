import 'dart:typed_data';
import 'package:cryptography/cryptography.dart';
import '../core/errors.dart';

class SecureSession {
  final String peerId;
  final SecretKey sendKey;
  final SecretKey recvKey;
  int sendNonceCounter = 0;
  int lastRecvNonce = -1;
  final DateTime establishedAt;

  SecureSession({
    required this.peerId,
    required this.sendKey,
    required this.recvKey,
    required this.establishedAt,
  });

  Uint8List generateSendNonce() {
    sendNonceCounter += 1;
    final nonce = Uint8List(12);
    final bdata = ByteData.view(nonce.buffer);
    bdata.setUint64(4, sendNonceCounter, Endian.big);
    return nonce;
  }

  void validateRecvNonce(Uint8List nonce) {
    if (nonce.length != 12) {
      throw const SecurityError('Invalid nonce length (must be 12 bytes)');
    }
    final bdata = ByteData.view(nonce.buffer);
    final counter = bdata.getUint64(4, Endian.big);
    if (counter <= lastRecvNonce) {
      throw SecurityError('Replay or out-of-order packet detected (nonce: $counter <= last: $lastRecvNonce)');
    }
    lastRecvNonce = counter;
  }

  bool get isExpired => DateTime.now().difference(establishedAt) > const Duration(hours: 24);
}

class SessionManager {
  final Map<String, SecureSession> _sessions = {};

  SecureSession? getSession(String peerId) {
    final session = _sessions[peerId];
    if (session != null && session.isExpired) {
      _sessions.remove(peerId);
      return null;
    }
    return session;
  }

  void saveSession(SecureSession session) {
    _sessions[session.peerId] = session;
  }

  void terminateSession(String peerId) {
    _sessions.remove(peerId);
  }

  void clearAll() {
    _sessions.clear();
  }
}
