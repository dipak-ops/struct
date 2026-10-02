import React, { useState } from 'react';
import { MeshNode, Peer } from '../types/struct';

interface ChatViewProps {
  currentNode: MeshNode;
  peer: Peer;
  onBack: () => void;
  onSendMessage: (text: string, disappearingSec?: number) => void;
  onVerifyPeer: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentNode,
  peer,
  onBack,
  onSendMessage,
  onVerifyPeer,
}) => {
  const [inputText, setInputText] = useState('');
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);
  const [disappearingMode, setDisappearingMode] = useState<number | undefined>(undefined);

  const pseudonymousId = peer.id === 'node_b'
    ? 'NODE-B912'
    : peer.id === 'node_c'
    ? 'NODE-C104'
    : peer.id === 'node_d'
    ? 'NODE-F442'
    : 'NODE-7A31';

  const messages = currentNode.messages.filter(
    m =>
      (m.senderId === currentNode.id && m.recipientId === peer.id) ||
      (m.senderId === peer.id && m.recipientId === currentNode.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), disappearingMode);
    setInputText('');
  };

  const getStatusSymbol = (status: string) => {
    switch (status) {
      case 'queued':
        return '…';
      case 'sending':
        return '↑';
      case 'relayed':
        return '↗';
      case 'delivered':
      case 'read':
        return '✓';
      case 'failed':
        return '×';
      case 'expired':
        return '⌛';
      default:
        return '✓';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] font-mono select-none">
      {/* Top Header */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-xs text-[#8A8A8A] hover:text-white px-2 py-1 border border-[#202020] bg-black cursor-pointer"
          >
            &lt; ESC
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">{pseudonymousId}</span>
              <span className="text-[10px] text-[#8A8A8A]">({peer.displayName})</span>
              <span className="text-[10px] text-[#00FF66]">
                {peer.connectionState === 'connected' ? '● CONNECTED' : '○ DISCOVERED'}
              </span>
            </div>
            <div className="text-[10px] text-[#8A8A8A] flex items-center gap-2">
              <span>{peer.id === 'node_c' ? '2 HOPS (A→B→C)' : '1 HOP DIRECT'}</span>
              <span>·</span>
              <span>E2E</span>
              {peer.isVerified && <span className="text-[#00FF66]">· VERIFIED</span>}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
          className="text-[10px] px-2 py-1 border border-[#202020] hover:border-[#00FF66] text-[#8A8A8A] hover:text-[#00FF66] cursor-pointer"
        >
          [ INFO ]
        </button>
      </div>

      {/* Expandable Technical Info Panel (Instruction #10) */}
      {showTechnicalInfo && (
        <div className="p-3 bg-[#080808] border-b border-[#202020] text-[11px] space-y-1.5">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider border-b border-[#202020] pb-1">
            MESSAGE INFO
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">STATUS</span>
              <span className="text-[#00FF66]">DELIVERED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">HOPS</span>
              <span className="text-white">{peer.id === 'node_c' ? '2' : '1'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">PACKET</span>
              <span className="text-white">8F31...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">ENCRYPTION</span>
              <span className="text-[#00FF66]">CHACHA20-POLY1305</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">TTL</span>
              <span className="text-white">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">VERIFICATION</span>
              <span className={peer.isVerified ? 'text-[#00FF66]' : 'text-[#FFD600]'}>
                {peer.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8A8A8A] font-mono text-xs">
            <div className="border border-[#202020] bg-[#080808] p-4 text-center space-y-1">
              <div className="text-white">NO MESSAGES</div>
              <div className="text-[10px] text-[#00FF66]">END-TO-END ENCRYPTED VIA BLE</div>
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentNode.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] border px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#0a2012] border-[#00FF66]/40 text-[#F5F5F5]'
                      : 'bg-[#080808] border-[#202020] text-[#F5F5F5]'
                  }`}
                >
                  <p className="break-words font-sans">{msg.plaintext || '[Encrypted]'}</p>
                </div>

                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#8A8A8A] font-mono">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <span className="text-[#00FF66]">
                      E2E {getStatusSymbol(msg.status)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSend} className="p-2 border-t border-[#202020] bg-[#080808] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Message ${pseudonymousId}...`}
          className="flex-1 px-3 py-2 bg-black border border-[#202020] text-xs text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00FF66] font-sans"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2 bg-[#080808] hover:bg-[#111111] border border-[#00FF66] text-[#00FF66] text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-40 transition-colors"
        >
          SEND
        </button>
      </form>
    </div>
  );
};
