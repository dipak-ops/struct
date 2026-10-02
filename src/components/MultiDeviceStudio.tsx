import React, { useState } from 'react';
import { MeshNode, NetworkLogEvent } from '../types/struct';

interface MultiDeviceStudioProps {
  nodes: MeshNode[];
  logs: NetworkLogEvent[];
  onSendMessageFromA: (text: string) => void;
  onToggleBluetooth: (nodeId: string) => void;
  onOpenInspector: (packetId: string) => void;
}

export const MultiDeviceStudio: React.FC<MultiDeviceStudioProps> = ({
  nodes,
  logs,
  onSendMessageFromA,
  onToggleBluetooth,
}) => {
  const [inputText, setInputText] = useState('Packet relay test through intermediate node.');

  const nodeA = nodes.find(n => n.id === 'node_a')!;
  const nodeB = nodes.find(n => n.id === 'node_b')!;
  const nodeC = nodes.find(n => n.id === 'node_c')!;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessageFromA(inputText.trim());
  };

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] font-mono select-none overflow-hidden">
      {/* Top Banner */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white uppercase">
            MULTI-NODE RELAY CONSOLE // [A] ──► [B] ──► [C]
          </div>
          <div className="text-[10px] text-[#8A8A8A]">
            DETERMINISTIC MULTI-HOP PACKET FORWARDING (CHACHA20-POLY1305)
          </div>
        </div>

        {/* Transmission Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Payload from Node A..."
            className="flex-1 px-3 py-1.5 bg-black border border-[#202020] text-xs text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00FF66]"
          />
          <button
            type="submit"
            className="py-1.5 px-3 border border-[#00FF66] bg-[#0a2012] hover:bg-[#103018] text-[#00FF66] font-bold text-xs cursor-pointer uppercase whitespace-nowrap"
          >
            TRANSMIT &gt;
          </button>
        </form>
      </div>

      {/* 3 Devices Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 overflow-y-auto">
        {/* Device A */}
        <div className="border border-[#202020] bg-[#080808] flex flex-col overflow-hidden text-xs">
          <div className="p-2.5 bg-black border-b border-[#202020] flex items-center justify-between">
            <span className="font-bold text-white">● NODE-A [SENDER]</span>
            <button
              onClick={() => onToggleBluetooth('node_a')}
              className={`text-[10px] px-2 py-0.5 border cursor-pointer ${
                nodeA.isOnline ? 'border-[#00FF66] text-[#00FF66]' : 'border-[#FF3B30] text-[#FF3B30]'
              }`}
            >
              BLE: {nodeA.isOnline ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 space-y-2 flex-1 overflow-y-auto text-[11px]">
            <div className="flex justify-between text-[#8A8A8A]">
              <span>ID</span>
              <span className="text-white">{nodeA.identity.id}</span>
            </div>
            <div className="flex justify-between text-[#8A8A8A]">
              <span>NEXT HOP</span>
              <span className="text-[#00FF66]">NODE-B (DIRECT)</span>
            </div>

            <div className="border-t border-[#202020] pt-2 space-y-1.5">
              <span className="text-[10px] text-[#8A8A8A] uppercase">OUTBOUND PACKETS:</span>
              {nodeA.messages.slice(-4).map(m => (
                <div key={m.id} className="p-2 border border-[#202020] bg-black text-[10px] space-y-0.5">
                  <div className="text-white">{m.plaintext}</div>
                  <div className="text-[#00FF66]">STATUS: {m.status.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device B (Relay) */}
        <div className="border border-[#202020] bg-[#080808] flex flex-col overflow-hidden text-xs">
          <div className="p-2.5 bg-black border-b border-[#202020] flex items-center justify-between">
            <span className="font-bold text-[#00FF66]">● NODE-B [RELAY]</span>
            <button
              onClick={() => onToggleBluetooth('node_b')}
              className={`text-[10px] px-2 py-0.5 border cursor-pointer ${
                nodeB.isOnline ? 'border-[#00FF66] text-[#00FF66]' : 'border-[#FF3B30] text-[#FF3B30]'
              }`}
            >
              BLE: {nodeB.isOnline ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 space-y-2 flex-1 overflow-y-auto text-[11px]">
            <div className="p-2 border border-[#202020] bg-black text-[10px] space-y-1 text-[#8A8A8A]">
              <div className="text-[#00FF66] font-bold">ZERO-PLAINTEXT RELAY</div>
              <div>Node B inspects opaque bytes, checks dedup cache, and decrements TTL ($5 \to 4$).</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
              <div className="p-2 border border-[#202020] bg-black">
                <span className="text-[#8A8A8A] block">RELAYED</span>
                <span className="text-[#00FF66] font-bold text-xs">{nodeB.diagnostics.packetsForwarded}</span>
              </div>
              <div className="p-2 border border-[#202020] bg-black">
                <span className="text-[#8A8A8A] block">QUEUED</span>
                <span className="text-white font-bold text-xs">{nodeB.pendingPackets.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Device C (Recipient) */}
        <div className="border border-[#202020] bg-[#080808] flex flex-col overflow-hidden text-xs">
          <div className="p-2.5 bg-black border-b border-[#202020] flex items-center justify-between">
            <span className="font-bold text-white">● NODE-C [DEST]</span>
            <button
              onClick={() => onToggleBluetooth('node_c')}
              className={`text-[10px] px-2 py-0.5 border cursor-pointer ${
                nodeC.isOnline ? 'border-[#00FF66] text-[#00FF66]' : 'border-[#FF3B30] text-[#FF3B30]'
              }`}
            >
              BLE: {nodeC.isOnline ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 space-y-2 flex-1 overflow-y-auto text-[11px]">
            <div className="flex justify-between text-[#8A8A8A]">
              <span>ID</span>
              <span className="text-white">{nodeC.identity.id}</span>
            </div>
            <div className="flex justify-between text-[#8A8A8A]">
              <span>AUTH TAG</span>
              <span className="text-[#00FF66]">POLY1305 VERIFIED</span>
            </div>

            <div className="border-t border-[#202020] pt-2 space-y-1.5">
              <span className="text-[10px] text-[#8A8A8A] uppercase">DECRYPTED INBOX:</span>
              {nodeC.messages.slice(-4).map(m => (
                <div key={m.id} className="p-2 border border-[#202020] bg-black text-[10px] space-y-0.5">
                  <div className="text-white">{m.plaintext}</div>
                  <div className="text-[#00FF66]">FROM: {m.senderName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wire Logs Console */}
      <div className="h-44 border-t border-[#202020] bg-black p-3 flex flex-col text-[11px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#202020] text-[10px] text-[#8A8A8A]">
          <span className="text-[#00FF66] font-bold">&gt; WIRE LOGS // REAL-TIME MESH FRAMES</span>
          <span>TELEMETRY STREAM</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pt-1.5">
          {logs.slice(-10).map(log => (
            <div key={log.id} className="flex items-start gap-2 leading-tight">
              <span className="text-[#8A8A8A] shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span
                className={`font-semibold shrink-0 ${
                  log.level === 'success'
                    ? 'text-[#00FF66]'
                    : log.level === 'warn'
                    ? 'text-[#FFD600]'
                    : log.level === 'security'
                    ? 'text-[#FF3B30]'
                    : 'text-white'
                }`}
              >
                [{log.nodeName}]
              </span>
              <span className="text-[#F5F5F5]">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
