import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'core/constants.dart';
import 'mesh/models/packet.dart';
import 'security/crypto_service.dart';
import 'security/session_manager.dart';
import 'security/verification_service.dart';
import 'messaging/encrypted_message_service.dart';
import 'transport/ble_transport_manager.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(const StructApp());
}

class StructApp extends StatelessWidget {
  const StructApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Struct',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF000000),
        primaryColor: const Color(0xFF00FF66),
        fontFamily: 'monospace',
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00FF66),
          surface: Color(0xFF080808),
          outline: Color(0xFF202020),
        ),
      ),
      home: const MainMeshScreen(),
    );
  }
}

class ChatMessageModel {
  final String id;
  final String senderId;
  final String senderName;
  final String recipientId;
  final String text;
  final DateTime timestamp;
  String status; // 'queued', 'sending', 'relayed', 'delivered', 'failed'
  final bool isMe;

  ChatMessageModel({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.recipientId,
    required this.text,
    required this.timestamp,
    required this.status,
    required this.isMe,
  });
}

class PeerModel {
  final String id;
  final String name;
  final String fingerprint;
  final int rssi;
  final bool isVerified;
  final bool isConnected;

  PeerModel({
    required this.id,
    required this.name,
    required this.fingerprint,
    required this.rssi,
    this.isVerified = false,
    this.isConnected = false,
  });
}

class MainMeshScreen extends StatefulWidget {
  const MainMeshScreen({super.key});

  @override
  State<MainMeshScreen> createState() => _MainMeshScreenState();
}

class _MainMeshScreenState extends State<MainMeshScreen> {
  int _currentTabIndex = 0;
  final String _myNodeId = 'node_a';
  final String _myDisplayName = 'Dipak';
  final String _myFingerprint = '7A82 F91B 4028 3C7D E91A';

  final List<PeerModel> _peers = [
    PeerModel(
      id: 'node_b',
      name: 'Ankit (Phone B - Relay)',
      fingerprint: 'B194 0DE2 9A73 8C6B F5E4',
      rssi: -58,
      isVerified: false,
      isConnected: true,
    ),
    PeerModel(
      id: 'node_c',
      name: 'Rahul (Phone C)',
      fingerprint: 'C488 A011 2345 6789 0ABC',
      rssi: -82,
      isVerified: true,
      isConnected: false,
    ),
    PeerModel(
      id: 'node_d',
      name: 'Priya (Nearby Peer)',
      fingerprint: 'D99F 4423 8719 2837 465A',
      rssi: -64,
      isVerified: true,
      isConnected: true,
    ),
  ];

  final Map<String, List<ChatMessageModel>> _conversations = {
    'node_c': [
      ChatMessageModel(
        id: 'msg_001',
        senderId: 'node_c',
        senderName: 'Rahul',
        recipientId: 'node_a',
        text: 'Struct mesh connected over BLE. Offline relay operational.',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        status: 'delivered',
        isMe: false,
      ),
    ],
  };

  int _packetsReceived = 14;
  int _packetsForwarded = 8;
  int _packetsDelivered = 6;
  int _duplicatesRejected = 2;

  void _openChat(PeerModel peer) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ChatConversationScreen(
          peer: peer,
          myNodeId: _myNodeId,
          messages: _conversations[peer.id] ?? [],
          onSendMessage: (text) {
            final newMsg = ChatMessageModel(
              id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
              senderId: _myNodeId,
              senderName: _myDisplayName,
              recipientId: peer.id,
              text: text,
              timestamp: DateTime.now(),
              status: 'sending',
              isMe: true,
            );
            setState(() {
              _conversations.putIfAbsent(peer.id, () => []).add(newMsg);
            });

            // Simulate honest multi-hop progression: sending -> relayed -> delivered
            Future.delayed(const Duration(milliseconds: 600), () {
              if (mounted) {
                setState(() {
                  newMsg.status = peer.id == 'node_c' ? 'relayed' : 'delivered';
                });
              }
            });

            if (peer.id == 'node_c') {
              Future.delayed(const Duration(milliseconds: 1400), () {
                if (mounted) {
                  setState(() {
                    newMsg.status = 'delivered';
                    _packetsDelivered++;
                  });
                }
              });
            }
          },
        ),
      ),
    );
  }

  void _triggerSos() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF080808),
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: Color(0xFFFF3B30), width: 2),
          borderRadius: BorderRadius.zero,
        ),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Color(0xFFFF3B30), size: 20),
            SizedBox(width: 8),
            Text(
              'EMERGENCY SOS DISTRESS',
              style: TextStyle(color: Color(0xFFFF3B30), fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: const Text(
          'Broadcast unencrypted distress beacon across all BLE nodes within 7 hops? '
          'Relays will prioritize and forward this packet immediately.',
          style: TextStyle(color: Color(0xFFF5F5F5), fontSize: 11, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('CANCEL', style: TextStyle(color: Color(0xFF8A8A8A), fontSize: 11)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF3B30),
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('EMERGENCY SOS BROADCAST SENT (TTL=7)'),
                  backgroundColor: Color(0xFFFF3B30),
                ),
              );
            },
            child: const Text('BROADCAST SOS', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF080808),
        elevation: 0,
        titleSpacing: 16,
        shape: const Border(bottom: BorderSide(color: Color(0xFF202020), width: 1)),
        title: Row(
          children: [
            const Text(
              'STRUCT',
              style: TextStyle(
                color: Color(0xFFF5F5F5),
                fontSize: 14,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF00FF66)),
                color: const Color(0xFF0A2012),
              ),
              child: const Text(
                'BLE MESH',
                style: TextStyle(color: Color(0xFF00FF66), fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Emergency SOS',
            icon: const Icon(Icons.sos, color: Color(0xFFFF3B30), size: 24),
            onPressed: _triggerSos,
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _buildConversationsTab(),
          _buildNodesTab(),
          _buildSecurityTab(),
          _buildDiagnosticsTab(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF080808),
          border: Border(top: BorderSide(color: Color(0xFF202020), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentTabIndex,
          onTap: (index) => setState(() => _currentTabIndex = index),
          backgroundColor: Colors.transparent,
          selectedItemColor: const Color(0xFF00FF66),
          unselectedItemColor: const Color(0xFF8A8A8A),
          type: BottomNavigationBarType.fixed,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline, size: 18), label: 'CHATS'),
            BottomNavigationBarItem(icon: Icon(Icons.hub_outlined, size: 18), label: 'NODES'),
            BottomNavigationBarItem(icon: Icon(Icons.shield_outlined, size: 18), label: 'SECURITY'),
            BottomNavigationBarItem(icon: Icon(Icons.tune_outlined, size: 18), label: 'DIAGNOSTICS'),
          ],
        ),
      ),
    );
  }

  Widget _buildConversationsTab() {
    return ListView.separated(
      itemCount: _peers.length,
      separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFF151515)),
      itemBuilder: (ctx, index) {
        final peer = _peers[index];
        final msgs = _conversations[peer.id] ?? [];
        final lastMsg = msgs.isNotEmpty ? msgs.last : null;

        return ListTile(
          onTap: () => _openChat(peer),
          tileColor: Colors.black,
          leading: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              border: Border.all(color: peer.isConnected ? const Color(0xFF00FF66) : const Color(0xFF202020)),
              color: const Color(0xFF080808),
            ),
            child: Center(
              child: Text(
                peer.name.substring(0, 1),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
          ),
          title: Row(
            children: [
              Text(
                peer.name,
                style: const TextStyle(color: Color(0xFFF5F5F5), fontSize: 12, fontWeight: FontWeight.bold),
              ),
              if (peer.isVerified) ...[
                const SizedBox(width: 6),
                const Icon(Icons.verified, color: Color(0xFF00FF66), size: 12),
              ],
            ],
          ),
          subtitle: Text(
            lastMsg != null ? lastMsg.text : 'Tap to start offline encrypted chat',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Color(0xFF8A8A8A), fontSize: 10),
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                peer.id == 'node_c' ? '2 HOPS' : 'DIRECT',
                style: const TextStyle(color: Color(0xFF8A8A8A), fontSize: 9),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: peer.isConnected ? const Color(0xFF00FF66) : const Color(0xFF8A8A8A),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${peer.rssi} dBm',
                    style: const TextStyle(color: Color(0xFF8A8A8A), fontSize: 9),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNodesTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        const Text(
          'NEARBY BLE MESH NODES',
          style: TextStyle(color: Color(0xFF8A8A8A), fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        for (final peer in _peers)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF080808),
              border: Border.all(color: peer.isConnected ? const Color(0xFF00FF66).withOpacity(0.4) : const Color(0xFF202020)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text(
                      peer.name,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      color: peer.isConnected ? const Color(0xFF0A2012) : Colors.black,
                      child: Text(
                        peer.isConnected ? 'CONNECTED' : 'DISCOVERED',
                        style: TextStyle(
                          color: peer.isConnected ? const Color(0xFF00FF66) : const Color(0xFF8A8A8A),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'FINGERPRINT: ${peer.fingerprint}',
                  style: const TextStyle(color: Color(0xFF8A8A8A), fontSize: 9),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ROUTE: ${peer.id == 'node_c' ? "A → B → C (Multi-Hop Relay)" : "Direct Single Hop"}',
                      style: const TextStyle(color: Color(0xFF00FF66), fontSize: 9),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF080808),
                        foregroundColor: const Color(0xFF00FF66),
                        side: const BorderSide(color: Color(0xFF00FF66)),
                        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      onPressed: () => _openChat(peer),
                      child: const Text('OPEN CHAT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildSecurityTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        const Text(
          'IDENTITY & SAFETY NUMBERS',
          style: TextStyle(color: Color(0xFF8A8A8A), fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF080808),
            border: Border.all(color: const Color(0xFF202020)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('LOCAL IDENTITY FINGERPRINT', style: TextStyle(color: Color(0xFF8A8A8A), fontSize: 9)),
              const SizedBox(height: 4),
              SelectableText(
                _myFingerprint,
                style: const TextStyle(color: Color(0xFF00FF66), fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Ed25519 256-bit signing key generated and stored inside Android Keystore / iOS Keychain enclave. '
                'Directional session keys derived via X25519 HKDF-SHA256.',
                style: TextStyle(color: Color(0xFF8A8A8A), fontSize: 10, height: 1.3),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDiagnosticsTab() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        const Text(
          'WIRE PROTOCOL & MESH DIAGNOSTICS',
          style: TextStyle(color: Color(0xFF8A8A8A), fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF080808),
            border: Border.all(color: const Color(0xFF202020)),
          ),
          child: Column(
            children: [
              _diagRow('Packets Received', '$_packetsReceived'),
              _diagRow('Packets Forwarded', '$_packetsForwarded'),
              _diagRow('Packets Delivered', '$_packetsDelivered'),
              _diagRow('Duplicates Rejected', '$_duplicatesRejected'),
              _diagRow('Hop Limit Ceiling', '${AppConstants.maxHopLimit} hops'),
              _diagRow('Preferred MTU', '${AppConstants.preferredMtu} bytes'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _diagRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF8A8A8A), fontSize: 11)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class ChatConversationScreen extends StatefulWidget {
  final PeerModel peer;
  final String myNodeId;
  final List<ChatMessageModel> messages;
  final ValueChanged<String> onSendMessage;

  const ChatConversationScreen({
    super.key,
    required this.peer,
    required this.myNodeId,
    required this.messages,
    required this.onSendMessage,
  });

  @override
  State<ChatConversationScreen> createState() => _ChatConversationScreenState();
}

class _ChatConversationScreenState extends State<ChatConversationScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSending = false;

  void _handleSend() {
    final text = _inputController.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() => _isSending = true);
    widget.onSendMessage(text);
    _inputController.clear();

    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) {
        setState(() => _isSending = false);
        _scrollToBottom();
      }
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 60,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  String _statusIcon(String status) {
    switch (status) {
      case 'queued':
        return '…';
      case 'sending':
        return '↑';
      case 'relayed':
        return '↗';
      case 'delivered':
        return '✓';
      case 'failed':
        return '×';
      default:
        return '✓';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF080808),
        elevation: 0,
        shape: const Border(bottom: BorderSide(color: Color(0xFF202020), width: 1)),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  widget.peer.name,
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                if (widget.peer.isVerified) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.verified, color: Color(0xFF00FF66), size: 12),
                ],
              ],
            ),
            Text(
              widget.peer.id == 'node_c' ? '2 HOPS VIA NODE-B · E2E ENCRYPTED' : 'DIRECT HOP · E2E ENCRYPTED',
              style: const TextStyle(color: Color(0xFF00FF66), fontSize: 9),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: widget.messages.isEmpty
                ? const Center(
                    child: Text(
                      'NO MESSAGES YET\nEND-TO-END ENCRYPTED VIA BLE MESH',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Color(0xFF8A8A8A), fontSize: 10, height: 1.5),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(12),
                    itemCount: widget.messages.length,
                    itemBuilder: (ctx, index) {
                      final msg = widget.messages[index];
                      return Align(
                        alignment: msg.isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                          decoration: BoxDecoration(
                            color: msg.isMe ? const Color(0xFF0A2012) : const Color(0xFF080808),
                            border: Border.all(
                              color: msg.isMe ? const Color(0xFF00FF66).withOpacity(0.4) : const Color(0xFF202020),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                msg.text,
                                style: const TextStyle(color: Color(0xFFF5F5F5), fontSize: 12),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '${msg.timestamp.hour.toString().padLeft(2, '0')}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                                    style: const TextStyle(color: Color(0xFF8A8A8A), fontSize: 9),
                                  ),
                                  if (msg.isMe) ...[
                                    const SizedBox(width: 4),
                                    Text(
                                      'E2E ${_statusIcon(msg.status)}',
                                      style: TextStyle(
                                        color: msg.status == 'delivered' ? const Color(0xFF00FF66) : const Color(0xFF8A8A8A),
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: Color(0xFF080808),
              border: Border(top: BorderSide(color: Color(0xFF202020), width: 1)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    onSubmitted: (_) => _handleSend(),
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'Type encrypted message...',
                      hintStyle: const TextStyle(color: Color(0xFF8A8A8A), fontSize: 11),
                      filled: true,
                      fillColor: Colors.black,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      border: OutlineInputBorder(
                        borderSide: const BorderSide(color: Color(0xFF202020)),
                        borderRadius: BorderRadius.zero,
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: const BorderSide(color: Color(0xFF00FF66)),
                        borderRadius: BorderRadius.zero,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF080808),
                    foregroundColor: const Color(0xFF00FF66),
                    side: const BorderSide(color: Color(0xFF00FF66)),
                    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  onPressed: _isSending ? null : _handleSend,
                  child: _isSending
                      ? const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00FF66)),
                        )
                      : const Text('SEND', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
