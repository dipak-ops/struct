import React, { useState } from 'react';
import { generateIdentityKeys } from '../services/cryptoEngine';

interface IdentitySetupModalProps {
  onComplete: (displayName: string) => void;
}

export const IdentitySetupModal: React.FC<IdentitySetupModalProps> = ({ onComplete }) => {
  const [displayName, setDisplayName] = useState('Dipak');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdentity, setGeneratedIdentity] = useState<{
    id: string;
    fingerprint: string;
  } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsGenerating(true);
    const idData = await generateIdentityKeys();
    setTimeout(() => {
      setGeneratedIdentity({
        id: idData.id,
        fingerprint: idData.fingerprint,
      });
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="flex flex-col justify-between h-full w-full bg-black text-[#F5F5F5] p-6 font-mono select-none">
      <div className="border-b border-[#202020] pb-3">
        <div className="text-[11px] text-[#00FF66] uppercase tracking-wider">
          INIT // IDENTITY SETUP
        </div>
        <h2 className="text-base font-bold text-white mt-1">GENERATE NODE IDENTITY</h2>
        <p className="text-xs text-[#8A8A8A] font-sans mt-1">
          Cryptographic Ed25519 identity stored locally in hardware enclave. No phone number or cloud account.
        </p>
      </div>

      {!generatedIdentity ? (
        <form onSubmit={handleGenerate} className="my-auto space-y-4">
          <div>
            <label className="block text-[11px] text-[#8A8A8A] uppercase tracking-wider mb-2">
              NODE DISPLAY ALIAS
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Dipak"
              maxLength={20}
              required
              className="w-full px-3 py-2.5 bg-[#080808] border border-[#202020] text-white text-xs font-mono focus:outline-none focus:border-[#00FF66] transition-colors"
            />
          </div>

          <div className="p-3 bg-[#080808] border border-[#202020] text-[11px] text-[#8A8A8A] space-y-1">
            <div className="text-[#00FF66]">KEY STORAGE POLICY</div>
            <p className="font-sans leading-relaxed">
              Ed25519 signing keypair generated via platform CSPRNG and isolated in hardware keystore.
            </p>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !displayName.trim()}
            className="w-full py-3 bg-[#080808] hover:bg-[#111111] border border-[#00FF66] text-[#00FF66] text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isGenerating ? '> GENERATING KEYS...' : '> GENERATE ED25519 IDENTITY'}
          </button>
        </form>
      ) : (
        <div className="my-auto space-y-4">
          <div className="p-4 bg-[#080808] border border-[#00FF66] space-y-3">
            <div className="text-xs text-[#00FF66] font-bold">● IDENTITY INITIALIZED</div>

            <div>
              <div className="text-[10px] text-[#8A8A8A]">NODE ID</div>
              <div className="text-sm font-bold text-white">{generatedIdentity.id}</div>
            </div>

            <div>
              <div className="text-[10px] text-[#8A8A8A]">SAFETY FINGERPRINT</div>
              <div className="text-xs text-[#00FF66] tracking-wider">
                {generatedIdentity.fingerprint}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#8A8A8A]">KEY STORAGE</div>
              <div className="text-xs text-white">HARDWARE ENCLAVE SECURED</div>
            </div>
          </div>

          <button
            onClick={() => onComplete(displayName.trim())}
            className="w-full py-3 bg-[#080808] hover:bg-[#111111] border border-[#00FF66] text-[#00FF66] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            [ LAUNCH NODE ]
          </button>
        </div>
      )}

      <div className="pt-3 border-t border-[#202020] text-center text-[10px] text-[#8A8A8A]">
        STRUCT-MESH-V1 // LOCAL CRYPTO ENCLAVE
      </div>
    </div>
  );
};
