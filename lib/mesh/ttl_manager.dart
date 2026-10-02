import 'models/packet.dart';
import '../core/constants.dart';

class TtlManager {
  static const int maxAllowedTtl = AppConstants.maxHopLimit;

  /// Validates whether a packet can be processed or forwarded based on TTL and expiration
  static bool canProcess(MeshPacket packet) {
    if (packet.ttl <= 0) return false;
    if (packet.ttl > maxAllowedTtl) return false;
    if (DateTime.now().isAfter(packet.expiresAt)) return false;
    return true;
  }

  /// Decrements TTL safely for an outbound relay forwarding hop
  static bool prepareForRelay(MeshPacket packet) {
    if (!canProcess(packet)) return false;
    if (packet.ttl <= 1) {
      packet.ttl = 0;
      return false; // Reached zero, must not forward
    }
    packet.ttl -= 1;
    return true;
  }
}
