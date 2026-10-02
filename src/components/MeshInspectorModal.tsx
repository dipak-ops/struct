import React from 'react';
import { MeshPacket } from '../types/struct';

interface MeshInspectorModalProps {
  packet: MeshPacket | null;
  stageDescription: string;
  onClose: () => void;
}

export const MeshInspectorModal: React.FC<MeshInspectorModalProps> = ({
  packet,
  stageDescription,
  onClose,
}) => {
  if (!packet) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-lg border border-[#00FF66] bg-black p-5 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#202020] pb-2">
          <div>
            <div className="font-bold text-white uppercase text-xs">
              PACKET INSPECTOR // #{packet.packetId.slice(-6)}
            </div>
            <div className="text-[10px] text-[#00FF66]">
              PROTOCOL V{packet.version} · {packet.packetType}
            </div>
          </div>
          <button onClick={onClose} className="text-[#8A8A8A] hover:text-white cursor-pointer">
            [ ESC ]
          </button>
        </div>

        <div className="space-y-3 text-[11px]">
          {/* Stage */}
          <div className="p-2 border border-[#202020] bg-[#080808] flex justify-between">
            <span className="text-[#8A8A8A]">STAGE</span>
            <span className="text-[#00FF66]">{stageDescription}</span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-[#202020] bg-[#080808]">
              <span className="text-[10px] text-[#8A8A8A] block">PACKET ID</span>
              <span className="text-white">{packet.packetId}</span>
            </div>
            <div className="p-2 border border-[#202020] bg-[#080808]">
              <span className="text-[10px] text-[#8A8A8A] block">TTL REMAINING</span>
              <span className="text-[#00FF66]">{packet.ttl} HOPS</span>
            </div>
            <div className="p-2 border border-[#202020] bg-[#080808]">
              <span className="text-[10px] text-[#8A8A8A] block">SENDER</span>
              <span className="text-white">{packet.senderId}</span>
            </div>
            <div className="p-2 border border-[#202020] bg-[#080808]">
              <span className="text-[10px] text-[#8A8A8A] block">DESTINATION</span>
              <span className="text-white">{packet.destinationId}</span>
            </div>
          </div>

          {/* Opaque Ciphertext Hex */}
          <div>
            <div className="flex justify-between text-[10px] text-[#8A8A8A] mb-1">
              <span>OPAQUE CIPHERTEXT (HEX)</span>
              <span className="text-[#00FF66]">RELAY CANNOT READ</span>
            </div>
            <div className="p-2.5 border border-[#202020] bg-[#080808] text-[10px] text-[#00FF66] break-all leading-tight select-all">
              {packet.ciphertextPayload}
            </div>
          </div>

          {/* Poly1305 MAC and Checksum */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 border border-[#202020] bg-[#080808]">
              <span className="text-[#8A8A8A] block">POLY1305 MAC (16B)</span>
              <span className="text-white truncate block">{packet.authTag}</span>
            </div>
            <div className="p-2 border border-[#202020] bg-[#080808]">
              <span className="text-[#8A8A8A] block">CRC-16 FRAME CHECK</span>
              <span className="text-[#00FF66]">0x{packet.checksum.toString(16).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#080808] hover:bg-[#111111] border border-[#202020] text-white text-xs uppercase"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
