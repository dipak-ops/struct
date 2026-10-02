import React, { useState } from 'react';
import { Channel } from '../types/struct';

interface ChannelsViewProps {
  channels: Channel[];
  onBroadcastToChannel: (channelId: string, text: string) => void;
  onOpenSos: () => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  onBroadcastToChannel,
  onOpenSos,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('chan_local_general');
  const [broadcastText, setBroadcastText] = useState('');

  const activeChannel = channels.find(c => c.id === selectedChannelId) || channels[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    if (activeChannel.type === 'emergency') {
      onOpenSos();
    } else {
      onBroadcastToChannel(activeChannel.id, broadcastText.trim());
      setBroadcastText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] font-mono select-none">
      {/* Top Header */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold uppercase text-white">CHANNELS</div>
          <div className="text-[10px] text-[#8A8A8A]">MESH BROADCAST ROOMS</div>
        </div>
        <span className="text-[10px] text-[#00FF66]">CONTROLLED FLOOD</span>
      </div>

      {/* Channel List (Instruction #15) */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => setSelectedChannelId('chan_local_general')}
            className={`p-2 border text-left cursor-pointer transition-colors ${
              selectedChannelId === 'chan_local_general'
                ? 'border-[#00FF66] bg-[#0a2012] text-white'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            <div className="font-bold"># LOCAL</div>
            <div className="text-[10px] text-[#8A8A8A]">4 NODES</div>
          </button>

          <button
            onClick={() => setSelectedChannelId('chan_field_ops')}
            className={`p-2 border text-left cursor-pointer transition-colors ${
              selectedChannelId === 'chan_field_ops'
                ? 'border-[#00FF66] bg-[#0a2012] text-white'
                : 'border-[#202020] bg-black text-[#8A8A8A] hover:text-white'
            }`}
          >
            <div className="font-bold"># TEAM</div>
            <div className="text-[10px] text-[#8A8A8A]">3 VERIFIED</div>
          </button>

          <button
            onClick={onOpenSos}
            className="p-2 border border-[#FF3B30] bg-[#1a0808] text-left cursor-pointer hover:bg-[#250a0a] transition-colors"
          >
            <div className="font-bold text-[#FF3B30]"># EMERGENCY</div>
            <div className="text-[10px] text-[#8A8A8A]">PRIORITY</div>
          </button>
        </div>
      </div>

      {/* Channel Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
        <div className="p-3 border border-[#202020] bg-[#080808] font-mono text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-white font-bold">{activeChannel.name}</span>
            <span className="text-[#00FF66] text-[10px] uppercase">
              {activeChannel.type === 'public' ? 'PUBLIC LOCAL ROOM' : 'PRIVATE VERIFIED GROUP'}
            </span>
          </div>
          <div className="text-[11px] text-[#8A8A8A]">{activeChannel.description}</div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 border border-[#202020] bg-[#080808] space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-[#8A8A8A]">
              <span className="text-[#00FF66]">● NODE-B912</span>
              <span>10m ago</span>
            </div>
            <p className="text-white font-sans">
              Relay active on sector north. Multi-hop link available for outbound packets.
            </p>
          </div>

          <div className="p-3 border border-[#202020] bg-[#080808] space-y-1">
            <div className="flex justify-between font-mono text-[10px] text-[#8A8A8A]">
              <span className="text-[#00FF66]">● NODE-F442</span>
              <span>22m ago</span>
            </div>
            <p className="text-white font-sans">
              Offline local mesh operational. Battery saver profile active.
            </p>
          </div>
        </div>
      </div>

      {/* Message Composer */}
      {activeChannel.type !== 'emergency' && (
        <form onSubmit={handleSend} className="p-2 border-t border-[#202020] bg-[#080808] flex items-center gap-2">
          <input
            type="text"
            value={broadcastText}
            onChange={e => setBroadcastText(e.target.value)}
            placeholder={`Broadcast to ${activeChannel.name}...`}
            className="flex-1 px-3 py-2 bg-black border border-[#202020] text-xs text-white placeholder-[#8A8A8A] focus:outline-none focus:border-[#00FF66] font-sans"
          />

          <button
            type="submit"
            disabled={!broadcastText.trim()}
            className="px-4 py-2 bg-[#080808] hover:bg-[#111111] border border-[#00FF66] text-[#00FF66] text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-40"
          >
            BROADCAST
          </button>
        </form>
      )}
    </div>
  );
};
