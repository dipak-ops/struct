import React, { useState, useEffect } from 'react';

interface SplashViewProps {
  onFinish: () => void;
}

const BOOT_LOGS = [
  '> INITIALIZING STRUCT',
  '> LOADING IDENTITY [ED25519]',
  '> INITIALIZING MESH [BLE GATT]',
  '> READY',
];

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex(prev => {
        if (prev < BOOT_LOGS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    const autoTimer = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(autoTimer);
    };
  }, [onFinish]);

  return (
    <div className="relative flex flex-col justify-between h-full w-full bg-black text-[#F5F5F5] p-6 select-none font-mono">
      {/* Top Header */}
      <div className="flex items-center justify-between text-[11px] text-[#8A8A8A]">
        <span>STRUCT-OS // 1.0.0</span>
        <span className="text-[#00FF66]">● ONLINE</span>
      </div>

      {/* Center Branding */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Minimal connected-network S symbol */}
        <div className="w-16 h-16 border border-[#202020] bg-[#080808] flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-[#00FF66]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hex node points */}
            <circle cx="70" cy="25" r="5" fill="#00FF66" />
            <circle cx="30" cy="25" r="5" fill="#00FF66" />
            <circle cx="30" cy="50" r="5" fill="#00FF66" />
            <circle cx="70" cy="50" r="5" fill="#00FF66" />
            <circle cx="70" cy="75" r="5" fill="#00FF66" />
            <circle cx="30" cy="75" r="5" fill="#00FF66" />

            {/* S-bus wire path */}
            <path
              d="M 70 25 L 30 25 L 30 50 L 70 50 L 70 75 L 30 75"
              stroke="#00FF66"
              strokeWidth="4"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-[0.2em] text-[#F5F5F5]">
          STRUCT
        </h1>

        <p className="text-[11px] tracking-widest text-[#00FF66] mt-2 font-mono uppercase">
          OFFLINE MESH COMMUNICATION
        </p>

        <p className="text-[11px] text-[#8A8A8A] mt-3">
          Created by Dipak Bhondekar
        </p>
      </div>

      {/* Terminal Boot Sequence */}
      <div className="w-full space-y-3 pb-4">
        <div className="p-3 bg-[#080808] border border-[#202020] text-[11px] font-mono space-y-1">
          {BOOT_LOGS.slice(0, logIndex + 1).map((line, i) => (
            <div key={i} className={i === logIndex ? 'text-[#00FF66]' : 'text-[#8A8A8A]'}>
              {line}
            </div>
          ))}
        </div>

        <button
          onClick={onFinish}
          className="w-full py-2.5 bg-[#080808] hover:bg-[#111111] border border-[#202020] text-[#00FF66] text-xs font-mono tracking-wider uppercase cursor-pointer transition-colors"
        >
          [ ENTER NODE ]
        </button>
      </div>
    </div>
  );
};
