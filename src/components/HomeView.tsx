import React from 'react';
import { MeshNode, Peer } from '../types/struct';

interface HomeViewProps {
  currentNode: MeshNode;
  peers: Peer[];
  onOpenChat: (peerId: string) => void;
  onNavigateTab: (tab: 'chats' | 'nearby' | 'channels' | 'security' | 'topology' | 'diagnostics') => void;
  onOpenSos: () => void;
  onOpenNetworkMap: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentNode,
  peers,
  onOpenChat,
  onNavigateTab,
  onOpenSos,
}) => {
  const activePeers = peers.filter(p => p.connectionState === 'connected');

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] overflow-y-auto font-mono select-none">
      {/* Top Terminal Status Header */}
      <div className="p-4 border-b border-[#202020] bg-[#080808] flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-[#F5F5F5]">STRUCT</span>
            <span className="text-[10px] text-[#8A8A8A]">[{currentNode.identity.id}]</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#00FF66] font-bold">
            {currentNode.isOnline ? '● MESH ACTIVE' : '○ OFFLINE'}
          </span>
          <span className="text-[11px] text-[#8A8A8A]">{currentNode.batteryLevel}%</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Terminal Node Status Area (Required by prompt) */}
        <div className="border border-[#202020] bg-[#080808] p-3 text-xs space-y-2">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-widest border-b border-[#202020] pb-1.5 flex justify-between">
            <span>&gt; NODE STATUS</span>
            <span className="text-[#00FF66]">READY</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">IDENTITY</span>
              <span className="text-[#00FF66]">VERIFIED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">MESH</span>
              <span className="text-[#00FF66]">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">PEERS</span>
              <span className="text-white">0{peers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">ROUTE</span>
              <span className="text-[#00FF66]">AVAILABLE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">RELAY</span>
              <span className="text-[#00FF66]">ENABLED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">ENCRYPTION</span>
              <span className="text-[#00FF66]">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Compact Live Mesh Topology Mini-View */}
        <div className="border border-[#202020] bg-[#080808] p-3">
          <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-2 border-b border-[#202020] pb-1">
            <span>MESH TOPOLOGY</span>
            <span className="text-[#00FF66]">4 NODES · 3 LINKS · 2 ROUTES</span>
          </div>

          <div className="h-20 relative flex items-center justify-between px-3 text-[10px]">
            {/* SVG Link lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="20%" y1="50%" x2="50%" y2="25%" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="50%" y1="25%" x2="80%" y2="50%" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="20%" y1="50%" x2="50%" y2="75%" stroke="#00FF66" strokeWidth="1" strokeDasharray="2 2" />
            </svg>

            <div className="relative z-10 border border-[#00FF66] bg-black px-2 py-1 text-white">
              [ YOU ]
            </div>

            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="border border-[#202020] bg-black px-1.5 py-0.5 text-[#00FF66]">
                NODE-B
              </div>
              <div className="border border-[#202020] bg-black px-1.5 py-0.5 text-[#8A8A8A]">
                NODE-D
              </div>
            </div>

            <div className="relative z-10 border border-[#202020] bg-black px-2 py-1 text-white">
              NODE-C
            </div>
          </div>
        </div>

        {/* Nearby Nodes List (Compact per prompt) */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#8A8A8A] mb-2 px-1">
            <span className="uppercase tracking-wider">[ {peers.length} NEARBY NODES ]</span>
            <button
              onClick={() => onNavigateTab('nearby')}
              className="text-[#00FF66] hover:underline cursor-pointer text-[11px]"
            >
              RADAR &gt;
            </button>
          </div>

          <div className="border border-[#202020] bg-[#080808] divide-y divide-[#202020] text-xs">
            {peers.map(peer => {
              const isDirect = peer.connectionState === 'connected';
              const pseudonymousId = peer.id === 'node_b'
                ? 'NODE-B912'
                : peer.id === 'node_c'
                ? 'NODE-C104'
                : peer.id === 'node_d'
                ? 'NODE-F442'
                : 'NODE-7A31';

              return (
                <div
                  key={peer.id}
                  onClick={() => onOpenChat(peer.id)}
                  className="p-2.5 flex items-center justify-between hover:bg-[#111111] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={isDirect ? 'text-[#00FF66]' : 'text-[#8A8A8A]'}>
                      {isDirect ? '●' : '○'}
                    </span>
                    <span className="font-bold text-white">{pseudonymousId}</span>
                    <span className="text-[10px] text-[#8A8A8A]">({peer.displayName})</span>
                    {peer.isVerified && (
                      <span className="text-[9px] text-[#00FF66] border border-[#00FF66]/30 px-1 py-0.2">
                        VERIFIED
                      </span>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-[#8A8A8A]">
                    {peer.signalRssi} dBm
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency SOS Banner (Black + Red per prompt) */}
        <div
          onClick={onOpenSos}
          className="border border-[#FF3B30] bg-[#080808] p-3 flex items-center justify-between cursor-pointer hover:bg-[#111111] transition-colors"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#FF3B30] font-bold">▲ EMERGENCY MESH</span>
            <span className="text-[10px] text-[#8A8A8A]">PRIORITY FLOOD</span>
          </div>
          <span className="text-[11px] text-[#FF3B30] font-bold">[ ARM ]</span>
        </div>

        {/* Recent Messages Technical List (Compact per prompt) */}
        <div>
          <div className="text-xs text-[#8A8A8A] uppercase tracking-wider mb-2 px-1">
            MESSAGES
          </div>

          <div className="border border-[#202020] bg-[#080808] divide-y divide-[#202020] text-xs">
            {peers.map(peer => {
              const lastMsg = currentNode.messages
                .filter(m => m.senderId === peer.id || m.recipientId === peer.id)
                .slice(-1)[0];

              const pseudonymousId = peer.id === 'node_b'
                ? 'NODE-B912'
                : peer.id === 'node_c'
                ? 'NODE-C104'
                : peer.id === 'node_d'
                ? 'NODE-F442'
                : 'NODE-7A31';

              return (
                <div
                  key={peer.id}
                  onClick={() => onOpenChat(peer.id)}
                  className="p-3 hover:bg-[#111111] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00FF66]">●</span>
                      <span className="font-bold text-white">{pseudonymousId}</span>
                      <span className="text-[10px] text-[#8A8A8A] font-sans">
                        {peer.id === 'node_c' ? 'relay → 2 hops' : 'direct link'}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#8A8A8A]">
                      {lastMsg
                        ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '20:41'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-[#8A8A8A] truncate max-w-[220px] font-sans">
                      {lastMsg ? lastMsg.plaintext : 'encrypted message'}
                    </span>
                    <span className="text-[#00FF66] text-[10px]">
                      {lastMsg ? (lastMsg.status === 'delivered' ? 'delivered ✓' : lastMsg.status) : 'E2E ✓'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
