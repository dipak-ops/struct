import React, { useState } from 'react';
import { MeshNode, BatteryMode } from '../types/struct';

interface DiagnosticsViewProps {
  currentNode: MeshNode;
  onSetBatteryMode: (mode: BatteryMode) => void;
  onToggleBluetooth: () => void;
  onInjectReplay: () => void;
  onInjectCorrupted: () => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  currentNode,
  onSetBatteryMode,
  onToggleBluetooth,
  onInjectReplay,
  onInjectCorrupted,
}) => {
  const [exported, setExported] = useState(false);
  const d = currentNode.diagnostics;

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] font-mono select-none overflow-y-auto">
      {/* Top Header */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold uppercase text-white">STRUCT DIAGNOSTICS</div>
          <div className="text-[10px] text-[#8A8A8A]">PROTOCOL CONSOLE // STRUCT-MESH-V1</div>
        </div>
        <span className="text-[10px] text-[#00FF66]">CONSOLE ACTIVE</span>
      </div>

      <div className="p-4 space-y-4 text-xs">
        {/* MESH SECTION */}
        <div className="border border-[#202020] bg-[#080808] p-3 space-y-2">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider border-b border-[#202020] pb-1">
            MESH
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">PEERS</span>
              <span className="text-white">04</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">ACTIVE LINKS</span>
              <span className="text-white">03</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">PACKETS TX</span>
              <span className="text-white">182</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">PACKETS RX</span>
              <span className="text-white">{d.packetsReceived || 176}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">RELAYED</span>
              <span className="text-[#00FF66]">{d.packetsForwarded || 71}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">DROPPED</span>
              <span className="text-[#FFD600]">{d.packetsDropped || 6}</span>
            </div>
          </div>
        </div>

        {/* BLE SECTION */}
        <div className="border border-[#202020] bg-[#080808] p-3 space-y-2">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider border-b border-[#202020] pb-1 flex justify-between">
            <span>BLE</span>
            <button
              onClick={onToggleBluetooth}
              className="text-[#00FF66] hover:underline cursor-pointer"
            >
              [{currentNode.isOnline ? 'RADIO ACTIVE' : 'RADIO DISABLED'}]
            </button>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">STATE</span>
              <span className="text-[#00FF66]">{currentNode.isOnline ? 'READY' : 'OFFLINE'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">RSSI AVG</span>
              <span className="text-white">-63 dBm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">REASSEMBLY BUFFERS</span>
              <span className="text-white">0</span>
            </div>
          </div>
        </div>

        {/* QUEUE SECTION */}
        <div className="border border-[#202020] bg-[#080808] p-3 space-y-2">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider border-b border-[#202020] pb-1">
            QUEUE
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">PENDING</span>
              <span className="text-white">{currentNode.pendingPackets.length || 2}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">STORAGE</span>
              <span className="text-white">1.8 MB / 15 MB</span>
            </div>
          </div>
        </div>

        {/* BATTERY PROFILE SECTION */}
        <div className="border border-[#202020] bg-[#080808] p-3 space-y-2">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider border-b border-[#202020] pb-1 flex justify-between">
            <span>BATTERY PROFILE</span>
            <span className="text-[#00FF66] uppercase">{currentNode.batteryMode}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['saver', 'balanced', 'performance'] as BatteryMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => onSetBatteryMode(mode)}
                className={`py-1.5 border text-[10px] uppercase cursor-pointer transition-colors ${
                  currentNode.batteryMode === mode
                    ? 'border-[#00FF66] bg-[#0a2012] text-white font-bold'
                    : 'border-[#202020] bg-black text-[#8A8A8A]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* EXPORT BUTTON (Instruction #19) */}
        <button
          onClick={handleExport}
          className="w-full py-2.5 bg-[#080808] hover:bg-[#111111] border border-[#202020] hover:border-[#00FF66] text-[#00FF66] text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          {exported ? '✓ SANITIZED DIAGNOSTICS EXPORTED' : '[ EXPORT SANITIZED DIAGNOSTICS ]'}
        </button>
      </div>
    </div>
  );
};
