import 'dart:convert';
import 'package:crypto/crypto.dart';

class VerificationService {
  static const String crockfordAlphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  /// Generates human-readable safety words / fingerprint from public key bytes
  static String generateSafetyFingerprint(List<int> publicKeyBytes) {
    final digest = sha256.convert(publicKeyBytes).bytes;
    final b32 = _bytesToBase32(digest);
    final chunks = <String>[];
    for (int i = 0; i < 20; i += 4) {
      chunks.add(b32.substring(i, i + 4));
    }
    return chunks.join(' ');
  }

  static String _bytesToBase32(List<int> bytes) {
    int bits = 0;
    int value = 0;
    final buffer = StringBuffer();

    for (int byte in bytes) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        buffer.write(crockfordAlphabet[(value >>> (bits - 5)) & 31]);
        bits -= 5;
      }
    }
    if (bits > 0) {
      buffer.write(crockfordAlphabet[(value << (5 - bits)) & 31]);
    }
    return buffer.toString();
  }

  /// Encodes peer verification payload for QR display
  static String encodeQrVerificationPayload({
    required String peerId,
    required String displayName,
    required String publicKeyHex,
  }) {
    final map = {
      'struct_v': 1,
      'id': peerId,
      'name': displayName,
      'pk': publicKeyHex,
    };
    return jsonEncode(map);
  }

  /// Decodes and verifies inbound QR verification scan
  static Map<String, dynamic>? decodeQrVerificationPayload(String rawQrText) {
    try {
      final decoded = jsonDecode(rawQrText);
      if (decoded is Map<String, dynamic> && decoded['struct_v'] == 1 && decoded.containsKey('pk')) {
        return decoded;
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}
