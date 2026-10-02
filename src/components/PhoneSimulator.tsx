import React, { useState, useEffect } from 'react';
import { MeshNode, Peer } from '../types/struct';
import { SplashView } from './SplashView';
import { OnboardingView } from './OnboardingView';
import { IdentitySetupModal } from './IdentitySetupModal';
import { HomeView } from './HomeView';
import { ChatView } from './ChatView';
import { NearbyView } from './NearbyView';
import { ChannelsView } from './ChannelsView';
import { NetworkTopologyView } from './NetworkTopologyView';
import { SecurityCenterView } from './SecurityCenterView';
import { DiagnosticsView } from './DiagnosticsView';
import { EmergencySosModal } from './EmergencySosModal';
import { meshEngine } from '../services/meshEngine';

interface PhoneSimulatorProps {
  activeNodeId: string;
  onOpenInspector: (packetId: string) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  activeNodeId,
  onOpenInspector,
}) => {
  const [appStage, setAppStage] = useState<'splash' | 'onboarding' | 'identity' | 'main'>('splash');
  const [activeTab, setActiveTab] = useState<'home' | 'chats' | 'nearby' | 'channels' | 'security' | 'topology' | 'diagnostics'>('home');
  const [activeChatPeerId, setActiveChatPeerId] = useState<string | null>(null);
  const [showSosModal, setShowSosModal] = useState(false);

  const [node, setNode] = useState<MeshNode>(meshEngine.getNode(activeNodeId)!);
  const [peers, setPeers] = useState<Peer[]>(meshEngine.getPeersForNode(activeNodeId));

  useEffect(() => {
    const unsub = meshEngine.subscribe(() => {
      const updatedNode = meshEngine.getNode(activeNodeId);
      if (updatedNode) {
        setNode({ ...updatedNode });
        setPeers([...meshEngine.getPeersForNode(activeNodeId)]);
      }
    });
    return unsub;
  }, [activeNodeId]);

  useEffect(() => {
    const n = meshEngine.getNode(activeNodeId);
    if (n) {
      setNode({ ...n });
      setPeers([...meshEngine.getPeersForNode(activeNodeId)]);
    }
  }, [activeNodeId]);

  const handleSendMessage = async (text: string, disappearingSec?: number) => {
    if (!activeChatPeerId) return;
    await meshEngine.sendMessage(node.id, activeChatPeerId, text, {
      disappearingSeconds: disappearingSec,
    });
  };

  const activeChatPeer = peers.find(p => p.id === activeChatPeerId);

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none font-mono">
      {/* Terminal Hardware Enclosure */}
      <div className="relative w-full max-w-[390px] h-[780px] bg-black border-2 border-[#202020] flex flex-col overflow-hidden shadow-2xl">
        {/* Minimal hardware top status bar */}
        <div className="h-8 px-4 bg-[#080808] border-b border-[#202020] flex items-center justify-between text-[11px] text-[#8A8A8A] shrink-0">
          <span className="font-bold text-white">9:41</span>
          <div className="flex items-center gap-3">
            <span className="text-[#00FF66] font-bold">● BLE</span>
            <span>{node.batteryLevel}%</span>
          </div>
        </div>

        {/* Screen Container */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-black">
          {appStage === 'splash' && (
            <SplashView onFinish={() => setAppStage('onboarding')} />
          )}

          {appStage === 'onboarding' && (
            <OnboardingView onComplete={() => setAppStage('identity')} />
          )}

          {appStage === 'identity' && (
            <IdentitySetupModal
              onComplete={displayName => {
                node.identity.displayName = displayName;
                setAppStage('main');
              }}
            />
          )}

          {appStage === 'main' && (
            <>
              {activeChatPeerId && activeChatPeer ? (
                <ChatView
                  currentNode={node}
                  peer={activeChatPeer}
                  onBack={() => setActiveChatPeerId(null)}
                  onSendMessage={handleSendMessage}
                  onVerifyPeer={() => meshEngine.verifyPeer(activeChatPeer.id)}
                />
              ) : (
                <>
                  {activeTab === 'home' && (
                    <HomeView
                      currentNode={node}
                      peers={peers}
                      onOpenChat={peerId => setActiveChatPeerId(peerId)}
                      onNavigateTab={tab => setActiveTab(tab)}
                      onOpenSos={() => setShowSosModal(true)}
                      onOpenNetworkMap={() => setActiveTab('topology')}
                    />
                  )}

                  {activeTab === 'nearby' && (
                    <NearbyView
                      peers={peers}
                      onOpenChat={peerId => setActiveChatPeerId(peerId)}
                      onVerifyPeer={peerId => meshEngine.verifyPeer(peerId)}
                      onRefreshScan={() => {}}
                    />
                  )}

                  {activeTab === 'channels' && (
                    <ChannelsView
                      channels={meshEngine.channels}
                      onBroadcastToChannel={() => {}}
                      onOpenSos={() => setShowSosModal(true)}
                    />
                  )}

                  {activeTab === 'topology' && (
                    <NetworkTopologyView nodes={meshEngine.getNodes()} />
                  )}

                  {activeTab === 'security' && (
                    <SecurityCenterView
                      currentNode={node}
                      onClearLocalData={() => {
                        node.messages = [];
                        node.pendingPackets = [];
                      }}
                      onOpenQrVerification={() => {}}
                    />
                  )}

                  {activeTab === 'diagnostics' && (
                    <DiagnosticsView
                      currentNode={node}
                      onSetBatteryMode={m => meshEngine.setBatteryMode(node.id, m)}
                      onToggleBluetooth={() => meshEngine.toggleNodeBluetooth(node.id)}
                      onInjectReplay={() => meshEngine.injectReplayAttack(node.id)}
                      onInjectCorrupted={() => meshEngine.injectCorruptedCiphertext(node.id)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Bottom Navigation (Terminal Monospace Tabs) */}
        {appStage === 'main' && !activeChatPeerId && (
          <div className="h-12 border-t border-[#202020] bg-[#080808] grid grid-cols-6 text-[10px] text-center font-mono shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center justify-center cursor-pointer transition-colors ${
                activeTab === 'home' ? 'text-[#00FF66] bg-black font-bold' : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              HOME
            </button>

            <button
              onClick={() => setActiveTab('nearby')}
              className={`flex items-center justify-center cursor-pointer transition-colors ${
                activeTab === 'nearby' ? 'text-[#00FF66] bg-black font-bold' : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              NODES
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`flex items-center justify-center cursor-pointer transition-colors ${
                activeTab === 'channels' ? 'text-[#00FF66] bg-black font-bold' : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              ROOMS
            </button>

            <button
              onClick={() => setActiveTab('topology')}
              className={`flex items-center justify-center cursor-pointer transition-colors ${
                activeTab === 'topology' ? 'text-[#00FF66] bg-black font-bold' : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              MESH
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center justify-center cursor-pointer transition-colors ${
                activeTab === 'security' ? 'text-[#00FF66] bg-black font-bold' : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              SEC
            </button>

            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`flex items-center justify-center cursor-pointer transition-colors ${
                activeTab === 'diagnostics' ? 'text-[#00FF66] bg-black font-bold' : 'text-[#8A8A8A] hover:text-white'
              }`}
            >
              DIAG
            </button>
          </div>
        )}
      </div>

      {/* Emergency SOS Modal overlay */}
      {showSosModal && (
        <EmergencySosModal
          onClose={() => setShowSosModal(false)}
          onSendSos={text => {
            meshEngine.sendMessage(node.id, 'node_c', text, { isEmergency: true });
            setShowSosModal(false);
          }}
        />
      )}
    </div>
  );
};
