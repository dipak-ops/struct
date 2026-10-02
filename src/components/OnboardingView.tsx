import React, { useState } from 'react';

interface OnboardingViewProps {
  onComplete: () => void;
}

const SCREENS = [
  {
    tag: 'ARCHITECTURE // 01',
    header: 'DECENTRALIZED OFFLINE COMMUNICATION',
    body: 'Communicate with nearby Struct nodes without requiring a central messaging server.',
    visual: (
      <div className="font-mono text-xs text-[#00FF66] border border-[#202020] bg-[#080808] p-4 text-center space-y-1">
        <div>[ NODE-A ] ◄─ BLE ─► [ NODE-B ]</div>
        <div className="text-[10px] text-[#8A8A8A]">ZERO CENTRAL SERVERS</div>
      </div>
    ),
  },
  {
    tag: 'ROUTING // 02',
    header: 'MULTI-HOP MESH',
    body: 'Messages can travel through nearby Struct devices to reach another node. Relays forward packets without plaintext access.',
    visual: (
      <div className="font-mono text-[11px] text-[#00FF66] border border-[#202020] bg-[#080808] p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-1">
          <span className="text-white border border-[#202020] px-1.5 py-0.5">[ YOU ]</span>
          <span>──</span>
          <span className="border border-[#202020] px-1.5 py-0.5">[ NODE ]</span>
          <span>──</span>
          <span className="text-white border border-[#202020] px-1.5 py-0.5">[ DEST ]</span>
        </div>
        <div className="text-[10px] text-[#8A8A8A]">HOP LIMIT (TTL) CONTROLLED</div>
      </div>
    ),
  },
  {
    tag: 'SECURITY // 03',
    header: 'PRIVATE BY DESIGN',
    body: 'Struct enforces authenticated end-to-end encryption with local-first storage. Private keys remain in hardware storage.',
    visual: (
      <div className="font-mono text-xs border border-[#202020] bg-[#080808] p-4 space-y-1.5 text-left">
        <div className="text-[#00FF66]">✓ END-TO-END ENCRYPTED</div>
        <div className="text-[#00FF66]">✓ LOCAL STORAGE ONLY</div>
        <div className="text-[#00FF66]">✓ ZERO CLOUD TELEMETRY</div>
      </div>
    ),
  },
  {
    tag: 'NETWORK // 04',
    header: 'YOUR DEVICE IS A NODE',
    body: 'Your phone can discover nearby nodes, send messages, and relay encrypted packets to extend local reach.',
    visual: (
      <div className="font-mono text-xs border border-[#202020] bg-[#080808] p-4 text-center space-y-1">
        <div className="text-white">NODE ID // READY</div>
        <div className="text-[#00FF66] text-[10px]">DISCOVER · COMMUNICATE · RELAY</div>
      </div>
    ),
  },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const screen = SCREENS[currentStep];
  const isLast = currentStep === SCREENS.length - 1;

  return (
    <div className="flex flex-col justify-between h-full w-full bg-black text-[#F5F5F5] p-6 select-none font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs text-[#8A8A8A] border-b border-[#202020] pb-3">
        <span className="text-[#00FF66]">{screen.tag}</span>
        {!isLast && (
          <button
            onClick={onComplete}
            className="text-[#8A8A8A] hover:text-[#F5F5F5] cursor-pointer"
          >
            SKIP [ESC]
          </button>
        )}
      </div>

      {/* Screen Body */}
      <div className="my-auto space-y-6">
        {screen.visual}

        <div className="space-y-3">
          <h2 className="text-base font-bold tracking-wider text-[#F5F5F5] uppercase">
            {screen.header}
          </h2>
          <p className="text-xs text-[#8A8A8A] leading-relaxed font-sans">
            {screen.body}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 pt-2">
          {SCREENS.map((_, i) => (
            <div
              key={i}
              className={`h-1 transition-all ${
                i === currentStep ? 'w-8 bg-[#00FF66]' : 'w-3 bg-[#202020]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#202020]">
        <button
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setCurrentStep(prev => prev + 1);
            }
          }}
          className="w-full py-3 bg-[#080808] hover:bg-[#111111] border border-[#00FF66] text-[#00FF66] font-bold text-xs tracking-widest uppercase cursor-pointer transition-colors"
        >
          {isLast ? 'INITIALIZE NODE' : 'NEXT STEP >'}
        </button>
      </div>
    </div>
  );
};
