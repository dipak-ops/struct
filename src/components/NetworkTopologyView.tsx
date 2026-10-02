import React, { useState } from 'react';
import { MeshNode } from '../types/struct';

interface NetworkTopologyViewProps {
  nodes: MeshNode[];
  onSelectNode?: (nodeId: string) => void;
}

export const NetworkTopologyView: React.FC<NetworkTopologyViewProps> = ({ nodes, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_c');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const pseudonymousId = selectedNode.id === 'node_b'
    ? 'NODE-B912'
    : selectedNode.id === 'node_c'
    ? 'NODE-C104'
    : selectedNode.id === 'node_d'
    ? 'NODE-F442'
    : 'NODE-7A31';

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] font-mono select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold uppercase text-white">MESH TOPOLOGY</div>
          <div className="text-[10px] text-[#00FF66]">04 NODES · 03 LINKS · 02 ROUTES</div>
        </div>
        <span className="text-[10px] text-[#8A8A8A]">DIAGNOSTIC VIEW</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Topology Diagnostic Canvas */}
        <div className="relative w-full h-72 border border-[#202020] bg-[#080808] flex items-center justify-center p-4">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #00FF66 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* SVG Links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Link 1: YOU <-> NODE-B */}
            <line x1="22%" y1="50%" x2="50%" y2="28%" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Link 2: NODE-B <-> NODE-C */}
            <line x1="50%" y1="28%" x2="78%" y2="50%" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Link 3: YOU <-> NODE-D */}
            <line x1="22%" y1="50%" x2="45%" y2="76%" stroke="#00FF66" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>

          {/* Node 1: YOU (Phone A) */}
          <button
            onClick={() => {
              setSelectedNodeId('node_a');
              onSelectNode?.('node_a');
            }}
            className={`absolute left-[10%] top-[40%] px-2.5 py-1.5 border text-xs cursor-pointer transition-colors ${
              selectedNodeId === 'node_a'
                ? 'border-[#00FF66] bg-[#0a2012] text-white'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            <div>[ YOU ]</div>
            <div className="text-[9px] text-[#00FF66]">SENDER</div>
          </button>

          {/* Node 2: NODE-B (Relay) */}
          <button
            onClick={() => {
              setSelectedNodeId('node_b');
              onSelectNode?.('node_b');
            }}
            className={`absolute left-[40%] top-[14%] px-2.5 py-1.5 border text-xs cursor-pointer transition-colors ${
              selectedNodeId === 'node_b'
                ? 'border-[#00FF66] bg-[#0a2012] text-white'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            <div>NODE-B</div>
            <div className="text-[9px] text-[#00FF66]">RELAY</div>
          </button>

          {/* Node 3: NODE-C (Recipient) */}
          <button
            onClick={() => {
              setSelectedNodeId('node_c');
              onSelectNode?.('node_c');
            }}
            className={`absolute right-[10%] top-[40%] px-2.5 py-1.5 border text-xs cursor-pointer transition-colors ${
              selectedNodeId === 'node_c'
                ? 'border-[#00FF66] bg-[#0a2012] text-white'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            <div>NODE-C</div>
            <div className="text-[9px] text-[#00FF66]">2 HOPS</div>
          </button>

          {/* Node 4: NODE-D */}
          <button
            onClick={() => {
              setSelectedNodeId('node_d');
              onSelectNode?.('node_d');
            }}
            className={`absolute left-[38%] bottom-[12%] px-2 py-1 border text-xs cursor-pointer transition-colors ${
              selectedNodeId === 'node_d'
                ? 'border-[#00FF66] bg-[#0a2012] text-white'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            <div>NODE-D</div>
            <div className="text-[9px] text-[#8A8A8A]">DIRECT</div>
          </button>
        </div>

        {/* Selected Node Telemetry Inspector */}
        <div className="border border-[#202020] bg-[#080808] p-3 text-xs space-y-2">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider border-b border-[#202020] pb-1 flex justify-between">
            <span>NODE TELEMETRY // {pseudonymousId}</span>
            <span className="text-[#00FF66]">ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">RSSI</span>
              <span className="text-white">
                {selectedNode.id === 'node_b' ? '-58 dBm' : selectedNode.id === 'node_c' ? '-72 dBm' : '-64 dBm'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">HOPS</span>
              <span className="text-white">{selectedNode.id === 'node_c' ? '2' : '1'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">STATUS</span>
              <span className="text-[#00FF66]">
                {selectedNode.role === 'relay' ? 'RELAY' : 'DIRECT'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">TRUST</span>
              <span className={selectedNode.identity.isVerified ? 'text-[#00FF66]' : 'text-[#FFD600]'}>
                {selectedNode.identity.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
