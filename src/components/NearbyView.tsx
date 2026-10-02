import React, { useState } from 'react';
import { Peer } from '../types/struct';

interface NearbyViewProps {
  peers: Peer[];
  onOpenChat: (peerId: string) => void;
  onVerifyPeer: (peerId: string) => void;
  onRefreshScan: () => void;
}

export const NearbyView: React.FC<NearbyViewProps> = ({
  peers,
  onOpenChat,
  onVerifyPeer,
  onRefreshScan,
}) => {
  const [scanning, setScanning] = useState(true);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] font-mono select-none overflow-y-auto">
      {/* Top Header */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold uppercase text-white">NEARBY NODES</div>
          <div className="text-[10px] text-[#8A8A8A]">BLE GATT SERVICE 0x53545255</div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${scanning ? 'text-[#00FF66]' : 'text-[#8A8A8A]'}`}>
            {scanning ? 'SCANNING ●' : 'PAUSED ○'}
          </span>
          <button
            onClick={() => setScanning(!scanning)}
            className="text-[10px] px-2 py-1 border border-[#202020] hover:border-[#00FF66] text-[#8A8A8A] hover:text-[#00FF66] cursor-pointer"
          >
            {scanning ? '[ PAUSE SCAN ]' : '[ RESUME SCAN ]'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Nodes List */}
        <div className="border border-[#202020] bg-[#080808] divide-y divide-[#202020]">
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
                onClick={() => setSelectedPeer(peer)}
                className="p-3 hover:bg-[#111111] cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={isDirect ? 'text-[#00FF66]' : 'text-[#8A8A8A]'}>
                      {isDirect ? '●' : '○'}
                    </span>
                    <span className="font-bold text-xs text-white">{pseudonymousId}</span>
                    <span className="text-[10px] text-[#8A8A8A]">({peer.displayName})</span>
                  </div>

                  <span className="text-[11px] text-[#8A8A8A]">
                    {peer.signalRssi} dBm
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-[#8A8A8A]">
                  <span>SIGNAL {peer.signalRssi} dBm</span>
                  <span>·</span>
                  <span className={isDirect ? 'text-[#00FF66]' : 'text-[#8A8A8A]'}>
                    {isDirect ? 'LINK ACTIVE' : 'DISCOVERED'}
                  </span>
                  <span>·</span>
                  <span className={peer.isVerified ? 'text-[#00FF66]' : 'text-[#FFD600]'}>
                    {peer.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Detail Modal (Instruction #13) */}
      {selectedPeer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm border border-[#00FF66] bg-[#080808] p-4 text-xs space-y-4">
            <div className="border-b border-[#202020] pb-2 flex justify-between items-center">
              <span className="font-bold text-white">
                {selectedPeer.id === 'node_b'
                  ? 'NODE-B912'
                  : selectedPeer.id === 'node_c'
                  ? 'NODE-C104'
                  : selectedPeer.id === 'node_d'
                  ? 'NODE-F442'
                  : 'NODE-7A31'}
              </span>
              <button
                onClick={() => setSelectedPeer(null)}
                className="text-[#8A8A8A] hover:text-white"
              >
                [X]
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">STATUS</span>
                <span className="text-[#00FF66]">
                  {selectedPeer.connectionState.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">SIGNAL</span>
                <span className="text-white">{selectedPeer.signalRssi} dBm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">HOPS</span>
                <span className="text-white">{selectedPeer.id === 'node_c' ? '2' : '1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">TRUST</span>
                <span className={selectedPeer.isVerified ? 'text-[#00FF66]' : 'text-[#FFD600]'}>
                  {selectedPeer.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">LAST SEEN</span>
                <span className="text-white">12 sec ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">FINGERPRINT</span>
                <span className="text-[#00FF66] truncate max-w-[160px]">
                  {selectedPeer.fingerprint}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#202020]">
              <button
                onClick={() => {
                  onVerifyPeer(selectedPeer.id);
                  setSelectedPeer(null);
                }}
                className="py-1.5 border border-[#202020] hover:border-[#00FF66] text-[#00FF66] text-[10px] uppercase font-bold"
              >
                VERIFY
              </button>

              <button
                onClick={() => {
                  onOpenChat(selectedPeer.id);
                  setSelectedPeer(null);
                }}
                className="py-1.5 border border-[#202020] hover:border-[#00FF66] text-white text-[10px] uppercase font-bold"
              >
                MESSAGE
              </button>

              <button
                onClick={() => setSelectedPeer(null)}
                className="py-1.5 border border-[#202020] hover:border-[#FF3B30] text-[#FF3B30] text-[10px] uppercase font-bold"
              >
                BLOCK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
