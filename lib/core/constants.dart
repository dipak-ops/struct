// Core Constants for Struct Mesh Application
// Author: Dipak Bhondekar

class AppConstants {
  static const String appName = 'Struct';
  static const String creatorCredit = 'Dipak Bhondekar created';
  static const String protocolVersion = '1.0.0';

  // BLE GATT UUIDs
  static const String bleServiceUuid = '00005752-5543-5400-8000-00805F9B34FB';
  static const String bleDataRxUuid = '00005752-5543-5401-8000-00805F9B34FB';
  static const String bleDataTxUuid = '00005752-5543-5402-8000-00805F9B34FB';
  static const String bleBeaconUuid = '00005752-5543-5403-8000-00805F9B34FB';

  // Mesh Limits & Constraints
  static const int maxHopLimit = 7;
  static const int defaultTtl = 5;
  static const int maxPacketBytes = 32768; // 32 KB max
  static const int maxFragmentCount = 64;
  static const int defaultAttMtu = 23;
  static const int preferredMtu = 512;
  static const int deduplicationWindowMinutes = 30;
  static const int maxPendingStorageBytes = 15728640; // 15 MB relay storage ceiling
  static const int maxPendingPacketsPerPeer = 500;
  
  // Rate Limits
  static const int maxPacketsPerSecondPerPeer = 10;
  static const int globalIngressCeilingPerSec = 50;

  // Timeouts
  static const Duration reassemblyTimeout = Duration(seconds: 15);
  static const Duration connectionTimeout = Duration(seconds: 10);
  static const Duration peerStaleDuration = Duration(minutes: 5);
}
