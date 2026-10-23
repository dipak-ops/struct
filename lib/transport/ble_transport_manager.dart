import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/services.dart';
import '../mesh/models/packet.dart';
import '../mesh/packet_codec.dart';
import '../transport/fragmenter.dart';
import '../transport/reassembler.dart';
import '../mesh/mesh_router.dart';
import '../messaging/encrypted_message_service.dart';
import '../messaging/store_and_forward.dart';
import '../database/app_database.dart';
import '../core/constants.dart';
import '../core/errors.dart';

class DiscoveredPeer {
  final String address;
  final String name;
  final int rssi;
  final DateTime lastSeen;
  bool isConnected;
  bool isProtocolReady;

  DiscoveredPeer({
    required this.address,
    required this.name,
    required this.rssi,
    required this.lastSeen,
    this.isConnected = false,
    this.isProtocolReady = false,
  });
}

/// Central BLE Transport Manager coordinating Native BLE, Packet Codec,
/// MTU Fragmentation/Reassembly, and the Mesh Routing Engine.
class BleTransportManager implements MeshTransportAdapter {
  static const MethodChannel _methodChannel = MethodChannel('com.struct.app/ble_mesh');
  static const EventChannel _eventChannel = EventChannel('com.struct.app/ble_events');

  final String localNodeId;
  final EncryptedMessageService messageService;
  final MeshRouter meshRouter;
  final StoreAndForwardManager storeAndForward;
  final AppDatabase database;

  final PacketReassembler _reassembler = PacketReassembler();
  final Map<String, DiscoveredPeer> _peers = {};
  final StreamController<List<DiscoveredPeer>> _peersController = StreamController.broadcast();
  final StreamController<MeshPacket> _inboundPacketController = StreamController.broadcast();
  final StreamController<String> _deliveryAckController = StreamController.broadcast();

  StreamSubscription? _eventSubscription;
  bool _isServiceStarted = false;

  BleTransportManager({
    required this.localNodeId,
    required this.messageService,
    required this.meshRouter,
    required this.storeAndForward,
    required this.database,
  });

  Stream<List<DiscoveredPeer>> get peersStream => _peersController.stream;
  Stream<MeshPacket> get inboundPacketStream => _inboundPacketController.stream;
  Stream<String> get deliveryAckStream => _deliveryAckController.stream;

  List<DiscoveredPeer> get discoveredPeers => _peers.values.toList();

  Future<void> initialize() async {
    if (_isServiceStarted) return;

    _eventSubscription = _eventChannel.receiveBroadcastStream().listen(
      _handleBleEvent,
      onError: (err) {
        // Log BLE stream error safely
      },
    );

    try {
      await _methodChannel.invokeMethod('startMeshService');
      _isServiceStarted = true;
    } catch (_) {
      // Running in test or platform without background BLE service
    }
  }

  void _handleBleEvent(dynamic event) {
    if (event is! Map) return;

    final type = event['type'] as String?;
    switch (type) {
      case 'peerDiscovered':
        final address = event['address'] as String;
        final name = event['name'] as String? ?? 'Peer';
        final rssi = event['rssi'] as int? ?? -80;

        _peers[address] = DiscoveredPeer(
          address: address,
          name: name,
          rssi: rssi,
          lastSeen: DateTime.now(),
          isConnected: _peers[address]?.isConnected ?? false,
          isProtocolReady: _peers[address]?.isProtocolReady ?? false,
        );
        _peersController.add(_peers.values.toList());
        break;

      case 'connectionStateChange':
        final address = event['address'] as String;
        final connected = event['connected'] as bool? ?? false;
        if (_peers.containsKey(address)) {
          _peers[address]!.isConnected = connected;
          if (!connected) {
            _peers[address]!.isProtocolReady = false;
          }
          _peersController.add(_peers.values.toList());
        }

        if (connected) {
          // Drain pending store-and-forward messages for this peer
          _drainPendingForPeer(address);
        }
        break;

      case 'mtuChanged':
        final address = event['address'] as String;
        if (_peers.containsKey(address)) {
          _peers[address]!.isProtocolReady = true;
          _peersController.add(_peers.values.toList());
        }
        break;

      case 'dataReceived':
        final data = event['data'] as Uint8List?;
        if (data != null && data.length >= 24) {
          try {
            final fragment = BleFragmentFrame.fromBytes(data);
            final assembledBytes = _reassembler.ingestFragment(fragment);
            if (assembledBytes != null) {
              _processAssembledPacketBytes(assembledBytes);
            }
          } catch (_) {
            // Drop invalid/corrupt fragments
          }
        }
        break;
    }
  }

  void _processAssembledPacketBytes(Uint8List rawBytes) async {
    try {
      final packet = PacketCodec.decode(rawBytes);

      // Route through MeshRouter
      final decision = meshRouter.routeInboundPacket(
        packet,
        connectedPeerIds: getConnectedPeerIds(),
      );

      if (decision.shouldDeliverLocal) {
        if (packet.packetType == PacketType.deliveryAck) {
          // Delivery ACK received! Correlate with original messageId
          String? ackMsgId;
          try {
            final json = jsonDecode(utf8.decode(packet.encryptedPayload));
            if (json is Map && json.containsKey('ack_for')) {
              ackMsgId = json['ack_for'] as String?;
            }
          } catch (_) {}
          _deliveryAckController.add(ackMsgId ?? packet.packetId);
        } else {
          _inboundPacketController.add(packet);
        }
      } else if (decision.shouldForward && decision.targetPeers.isNotEmpty) {
        // Forward along next hops
        final reEncoded = PacketCodec.encode(packet);
        for (final targetPeer in decision.targetPeers) {
          await sendPacketToPeer(targetPeer, reEncoded, packetId: packet.packetId);
        }
      }
    } catch (_) {
      // Drop packets failing checksum, version, or format
    }
  }

  @override
  Future<void> sendPacketToPeer(String peerId, Uint8List rawPacketBytes, {String packetId = 'pkt_out'}) async {
    final mtu = await getDeviceMtu(peerId);
    final fragments = PacketFragmenter.fragment(packetId, rawPacketBytes, mtu: mtu);

    for (final frag in fragments) {
      final frameBytes = frag.toBytes();
      await _methodChannel.invokeMethod('sendData', {
        'address': peerId,
        'data': frameBytes,
      });
    }
  }

  @override
  List<String> getConnectedPeerIds() {
    return _peers.values
        .where((p) => p.isConnected)
        .map((p) => p.address)
        .toList();
  }

  Future<int> getDeviceMtu(String peerAddress) async {
    try {
      final result = await _methodChannel.invokeMethod<int>('getDeviceMtu', {
        'address': peerAddress,
      });
      return result ?? AppConstants.preferredMtu;
    } catch (_) {
      return 240;
    }
  }

  Future<bool> connectPeer(String address) async {
    try {
      final ok = await _methodChannel.invokeMethod<bool>('connectPeer', {'address': address});
      return ok ?? false;
    } catch (_) {
      return false;
    }
  }

  Future<void> disconnectPeer(String address) async {
    try {
      await _methodChannel.invokeMethod('disconnectPeer', {'address': address});
    } catch (_) {}
  }

  void _drainPendingForPeer(String peerId) async {
    final readyRecords = storeAndForward.drainPendingForPeer(peerId);
    for (final record in readyRecords) {
      try {
        await sendPacketToPeer(peerId, record.rawPacketBytes, packetId: record.messageId);
        storeAndForward.acknowledgeDelivered(record.messageId);
      } catch (_) {
        storeAndForward.recordFailedAttempt(record.messageId);
      }
    }
  }

  void dispose() {
    _eventSubscription?.cancel();
    _peersController.close();
    _inboundPacketController.close();
    _deliveryAckController.close();
  }
}
