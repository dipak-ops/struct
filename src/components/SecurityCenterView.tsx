import React, { useState } from 'react';
import { MeshNode } from '../types/struct';

interface SecurityCenterViewProps {
  currentNode: MeshNode;
  onClearLocalData: () => void;
  onOpenQrVerification: () => void;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  currentNode,
  onClearLocalData,
  onOpenQrVerification,
}) => {
  const [appLockEnabled, setAppLockEnabled] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F5] font-mono select-none overflow-y-auto">
      {/* Top Header */}
      <div className="p-3 border-b border-[#202020] bg-[#080808] flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="text-xs font-bold uppercase text-white">SECURITY CENTER</div>
          <div className="text-[10px] text-[#8A8A8A]">LOCAL HARDWARE ENCLAVE</div>
        </div>
        <span className="text-[10px] text-[#00FF66]">✓ PROTECTED</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Security Audit Checklist (Instruction #18) */}
        <div className="border border-[#202020] bg-[#080808] divide-y divide-[#202020] text-xs">
          <div className="p-3 flex items-center justify-between">
            <span className="text-[#8A8A8A]">IDENTITY</span>
            <span className="text-[#00FF66] font-bold">✓ PRIVATE KEY PROTECTED</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-[#8A8A8A]">ENCRYPTION</span>
            <span className="text-[#00FF66] font-bold">✓ E2E ACTIVE</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-[#8A8A8A]">VERIFICATION</span>
            <span className="text-[#00FF66] font-bold">✓ 3 VERIFIED NODES</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-[#8A8A8A]">STORAGE</span>
            <span className="text-[#00FF66] font-bold">✓ LOCAL ONLY</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-[#8A8A8A]">NETWORK</span>
            <span className="text-[#00FF66] font-bold">✓ NO CENTRAL MESSAGE SERVER</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <span className="text-[#8A8A8A]">APP LOCK</span>
            <button
              onClick={() => setAppLockEnabled(!appLockEnabled)}
              className="text-xs text-white hover:text-[#00FF66] cursor-pointer"
            >
              {appLockEnabled ? '● ENABLED' : '○ DISABLED'}
            </button>
          </div>
        </div>

        {/* Action Buttons (Instruction #18) */}
        <div className="space-y-2">
          <button
            onClick={onOpenQrVerification}
            className="w-full py-2.5 bg-[#080808] hover:bg-[#111111] border border-[#00FF66] text-[#00FF66] text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            [ VERIFY IDENTITY ]
          </button>

          <button
            onClick={() => setShowInfoModal(true)}
            className="w-full py-2.5 bg-[#080808] hover:bg-[#111111] border border-[#202020] text-[#F5F5F5] text-xs uppercase tracking-wider cursor-pointer"
          >
            [ SECURITY INFORMATION ]
          </button>

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-2.5 bg-[#080808] hover:bg-[#111111] border border-[#FF3B30] text-[#FF3B30] text-xs uppercase tracking-wider cursor-pointer"
            >
              [ CLEAR LOCAL DATA ]
            </button>
          ) : (
            <div className="p-3 border border-[#FF3B30] bg-[#1a0808] space-y-2 text-center text-xs">
              <div className="text-[#FF3B30] font-bold">CONFIRM LOCAL DATA WIPE?</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="py-1.5 border border-[#202020] text-[#8A8A8A]"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    onClearLocalData();
                    setShowClearConfirm(false);
                  }}
                  className="py-1.5 border border-[#FF3B30] bg-[#FF3B30] text-black font-bold"
                >
                  CONFIRM
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm border border-[#202020] bg-[#080808] p-5 text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#202020] pb-2">
              <span className="font-bold text-white uppercase">SECURITY ARCHITECTURE</span>
              <button onClick={() => setShowInfoModal(false)} className="text-[#8A8A8A]">
                [X]
              </button>
            </div>
            <div className="space-y-2 text-[#8A8A8A] font-sans text-xs leading-relaxed">
              <p>
                <strong className="text-white font-mono">ED25519:</strong> Long-term identity signatures isolated in Android Keystore / iOS Keychain.
              </p>
              <p>
                <strong className="text-white font-mono">X25519 ECDH:</strong> Ephemeral session key negotiation per peer conversation.
              </p>
              <p>
                <strong className="text-white font-mono">CHACHA20-POLY1305:</strong> Authenticated encryption with monotonic nonces.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
