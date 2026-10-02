import React, { useState, useEffect } from 'react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { MultiDeviceStudio } from './components/MultiDeviceStudio';
import { NetworkTopologyView } from './components/NetworkTopologyView';
import { CodeDocsViewer } from './components/CodeDocsViewer';
import { MeshInspectorModal } from './components/MeshInspectorModal';
import { meshEngine } from './services/meshEngine';
import { MeshPacket, NetworkLogEvent } from './types/struct';

export default function App() {
  const [viewMode, setViewMode] = useState<'single' | 'studio' | 'topology' | 'docs'>('single');
  const [activeNodeId, setActiveNodeId] = useState<string>('node_a');
  const [inspectedPacket, setInspectedPacket] = useState<MeshPacket | null>(null);
  const [inspectedStage, setInspectedStage] = useState<string>('Originated');
  const [logs, setLogs] = useState<NetworkLogEvent[]>([]);

  useEffect(() => {
    const unsubInspect = meshEngine.subscribePacketInspect((pkt, stage) => {
      setInspectedPacket(pkt);
      setInspectedStage(stage);
    });

    const unsubLogs = meshEngine.subscribeLogs(logEvent => {
      setLogs(prev => [...prev.slice(-25), logEvent]);
    });

    return () => {
      unsubInspect();
      unsubLogs();
    };
  }, []);

  const nodes = meshEngine.getNodes();

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-[#F5F5F5] font-mono select-none overflow-hidden">
      {/* Top Terminal Command Bar */}
      <header className="h-12 border-b border-[#202020] bg-[#080808] px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm tracking-widest text-[#F5F5F5]">STRUCT</span>
          <span className="text-[10px] text-[#00FF66] font-bold">● MESH CONSOLE</span>
          <span className="text-[10px] text-[#8A8A8A] hidden sm:inline">[v1.0.0-rc1]</span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1 border cursor-pointer transition-colors ${
              viewMode === 'single'
                ? 'border-[#00FF66] bg-[#0a2012] text-[#00FF66] font-bold'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            [ PHONE ]
          </button>

          <button
            onClick={() => setViewMode('studio')}
            className={`px-3 py-1 border cursor-pointer transition-colors ${
              viewMode === 'studio'
                ? 'border-[#00FF66] bg-[#0a2012] text-[#00FF66] font-bold'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            [ RELAY A→B→C ]
          </button>

          <button
            onClick={() => setViewMode('topology')}
            className={`px-3 py-1 border cursor-pointer transition-colors ${
              viewMode === 'topology'
                ? 'border-[#00FF66] bg-[#0a2012] text-[#00FF66] font-bold'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            [ TOPOLOGY ]
          </button>

          <button
            onClick={() => setViewMode('docs')}
            className={`px-3 py-1 border cursor-pointer transition-colors ${
              viewMode === 'docs'
                ? 'border-[#00FF66] bg-[#0a2012] text-[#00FF66] font-bold'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            [ SPECS &amp; CODE ]
          </button>
        </div>

        {/* Node Switcher & Packet Trigger */}
        <div className="flex items-center gap-2 text-xs">
          {viewMode === 'single' && (
            <div className="flex items-center gap-1 bg-black border border-[#202020] px-2 py-0.5 text-[10px]">
              <span className="text-[#8A8A8A]">NODE:</span>
              <select
                value={activeNodeId}
                onChange={e => setActiveNodeId(e.target.value)}
                className="bg-transparent text-[#00FF66] font-bold focus:outline-none cursor-pointer"
              >
                <option value="node_a" className="bg-black text-white">
                  NODE-A (SENDER)
                </option>
                <option value="node_b" className="bg-black text-white">
                  NODE-B (RELAY)
                </option>
                <option value="node_c" className="bg-black text-white">
                  NODE-C (DEST)
                </option>
              </select>
            </div>
          )}

          {inspectedPacket && (
            <button
              onClick={() => setInspectedPacket(inspectedPacket)}
              className="text-[10px] px-2 py-1 border border-[#00FF66] text-[#00FF66] hover:bg-[#0a2012] cursor-pointer"
            >
              [ PKT #{inspectedPacket.packetId.slice(-6)} ]
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden relative">
        {viewMode === 'single' && (
          <div className="h-full flex items-center justify-center p-2 overflow-y-auto">
            <PhoneSimulator
              activeNodeId={activeNodeId}
              onOpenInspector={() => {
                if (inspectedPacket) setInspectedPacket(inspectedPacket);
              }}
            />
          </div>
        )}

        {viewMode === 'studio' && (
          <MultiDeviceStudio
            nodes={nodes}
            logs={logs}
            onSendMessageFromA={text => {
              meshEngine.sendMessage('node_a', 'node_c', text);
            }}
            onToggleBluetooth={id => meshEngine.toggleNodeBluetooth(id)}
            onOpenInspector={() => {}}
          />
        )}

        {viewMode === 'topology' && (
          <div className="h-full p-4 max-w-4xl mx-auto flex flex-col justify-center">
            <NetworkTopologyView nodes={nodes} onSelectNode={id => setActiveNodeId(id)} />
          </div>
        )}

        {viewMode === 'docs' && <CodeDocsViewer />}
      </main>

      {/* Wire Packet Inspector Modal */}
      {inspectedPacket && (
        <MeshInspectorModal
          packet={inspectedPacket}
          stageDescription={inspectedStage}
          onClose={() => setInspectedPacket(null)}
        />
      )}
    </div>
  );
}
