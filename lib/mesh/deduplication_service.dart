import 'dart:collection';
import '../core/constants.dart';

class DeduplicationEntry {
  final String packetId;
  final DateTime firstSeenAt;

  DeduplicationEntry({required this.packetId, required this.firstSeenAt});
}

class DeduplicationService {
  final int maxEntries;
  final Duration windowDuration;
  final LinkedHashMap<String, DateTime> _seenCache = LinkedHashMap();

  DeduplicationService({
    this.maxEntries = 10000,
    this.windowDuration = const Duration(minutes: AppConstants.deduplicationWindowMinutes),
  });

  /// Returns true if packet was already seen (duplicate), false if new.
  bool isDuplicate(String packetId) {
    _pruneExpired();
    if (_seenCache.containsKey(packetId)) {
      return true;
    }
    // Record new packet
    if (_seenCache.length >= maxEntries) {
      _seenCache.remove(_seenCache.keys.first); // Evict oldest
    }
    _seenCache[packetId] = DateTime.now();
    return false;
  }

  /// Clean entries older than sliding window
  void _pruneExpired() {
    final cutoff = DateTime.now().subtract(windowDuration);
    final toRemove = <String>[];
    for (final entry in _seenCache.entries) {
      if (entry.value.isBefore(cutoff)) {
        toRemove.add(entry.key);
      } else {
        break; // LinkedHashMap maintains insertion order
      }
    }
    for (final key in toRemove) {
      _seenCache.remove(key);
    }
  }

  int get cachedCount => _seenCache.length;

  void clear() => _seenCache.clear();
}
