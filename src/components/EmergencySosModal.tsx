import React, { useState } from 'react';

interface EmergencySosModalProps {
  onClose: () => void;
  onSendSos: (customText: string) => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({ onClose, onSendSos }) => {
  const [sosActive, setSosActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const handleHoldStart = () => {
    let current = 0;
    const interval = setInterval(() => {
      current += 25;
      setHoldProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setSosActive(true);
        onSendSos('EMERGENCY: Assistance needed at this node.');
      }
    }, 100);

    const cleanup = () => {
      clearInterval(interval);
      setHoldProgress(0);
    };

    window.addEventListener('mouseup', cleanup, { once: true });
    window.addEventListener('touchend', cleanup, { once: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-sm border-2 border-[#FF3B30] bg-black p-5 text-xs space-y-4">
        <div className="border-b border-[#202020] pb-2 flex items-center justify-between">
          <span className="text-[#FF3B30] font-bold uppercase">▲ EMERGENCY MESH</span>
          <button onClick={onClose} className="text-[#8A8A8A] hover:text-white cursor-pointer">
            [ ESC ]
          </button>
        </div>

        {!sosActive ? (
          <div className="space-y-4 py-2 text-center">
            <div className="text-[#8A8A8A]">SOS NOT ACTIVE</div>

            <p className="text-xs text-[#F5F5F5] font-sans leading-relaxed">
              Your device can transmit an emergency packet through available Struct nodes.
            </p>

            <div className="p-3 border border-[#202020] bg-[#080808] text-[10px] text-[#8A8A8A]">
              PRIORITY TTL 7 · BROADCAST FLOOD · LOCAL RADIOS
            </div>

            <button
              onMouseDown={handleHoldStart}
              onTouchStart={handleHoldStart}
              className="w-full py-4 border-2 border-[#FF3B30] bg-[#1a0808] hover:bg-[#2a0808] text-[#FF3B30] font-bold text-xs tracking-widest uppercase cursor-pointer relative overflow-hidden"
            >
              {holdProgress > 0 && (
                <div
                  className="absolute inset-0 bg-[#FF3B30]/30 transition-all"
                  style={{ width: `${holdProgress}%` }}
                />
              )}
              <span className="relative z-10">
                {holdProgress > 0 ? `ARMING... ${holdProgress}%` : '[ HOLD TO ACTIVATE ]'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-3 border border-[#FF3B30] bg-[#1a0808] space-y-2 text-[11px]">
              <div className="text-[#FF3B30] font-bold">● SOS ACTIVE</div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">PACKET ID:</span>
                <span className="text-white">91A7-F421</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">HOPS:</span>
                <span className="text-white">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">TTL:</span>
                <span className="text-white">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A8A8A]">STATUS:</span>
                <span className="text-[#FF3B30]">TRANSMITTING</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSosActive(false);
                setHoldProgress(0);
              }}
              className="w-full py-2.5 border border-[#202020] text-[#8A8A8A] hover:text-white text-xs uppercase"
            >
              CANCEL DISTRESS SIGNAL
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-[#202020] text-[10px] text-[#8A8A8A] leading-tight">
          SOS delivery depends on nearby Struct devices and available mesh connectivity. Does not replace emergency services.
        </div>
      </div>
    </div>
  );
};
