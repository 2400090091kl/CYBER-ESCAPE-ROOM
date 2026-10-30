import React, { useState } from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Zap, 
  Lock, 
  Unlock, 
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import type { GameState } from '../../types';
import { validateMasterOverride } from '../../utils/validation';
import { cyberAudio } from '../../utils/audio';

interface MasterOverrideProps {
  state: GameState;
  onCompleteMission: () => void;
}

export const MasterOverride: React.FC<MasterOverrideProps> = ({
  state,
  onCompleteMission,
}) => {
  const [overrideInput, setOverrideInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isDisarming, setIsDisarming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const tokens = [
    { level: 1, label: 'L1: PACKET DECODE', token: state.tokens.level1 || 'SAFE' },
    { level: 2, label: 'L2: PHISHING VECTOR', token: state.tokens.level2 || 'URGENCY' },
    { level: 3, label: 'L3: SIEM LOG AUDIT', token: state.tokens.level3 || 'ARUN' },
    { level: 4, label: 'L4: IDENTITY DEFENSE', token: state.tokens.level4 || 'MFA' },
  ];

  const handleInsertAssembled = () => {
    cyberAudio.playKeyClick();
    setOverrideInput('SAFE-URGENCY-ARUN-MFA');
  };

  const handleDisarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisarming || isSuccess) return;

    setIsDisarming(true);
    cyberAudio.playKeyClick();

    const result = validateMasterOverride(overrideInput);

    if (state.team.id) {
      api.validateSubmission({
        teamId: state.team.id,
        level: 5,
        answer: overrideInput,
      }).catch(console.error);
    }

    if (result.isValid) {
      cyberAudio.playMasterOverrideSuccess();
      setIsSuccess(true);
      setFeedback({ type: 'success', message: result.message });

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#38bdf8', '#a855f7', '#ffffff', '#10b981'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00f0ff', '#38bdf8'],
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#10b981', '#ffffff'],
          });
        }, 300);
      } catch (err) {
        // Confetti gracefully skipped if canvas not ready
      }

      setTimeout(() => {
        onCompleteMission();
      }, 2500);
    } else {
      cyberAudio.playAccessDenied();
      setFeedback({ type: 'error', message: result.message });
      setTimeout(() => setIsDisarming(false), 900);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl border border-cyan-500/50 bg-gray-950/90 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
              <KeyRound className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  FINAL CLEARANCE // MASTER TERMINAL
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  ALL 4 TOKENS ACQUIRED
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-slate-100 tracking-wide mt-1.5">
                SHADOWBYTE-X MASTER DISARM PROTOCOL
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 text-amber-300 font-mono text-xs animate-pulse">
            <Radio className="w-4 h-4" />
            <span>DISARM SEQUENCE PENDING</span>
          </div>
        </div>

        <p className="mt-4 text-sm sm:text-base font-mono text-[#CBD5E1] leading-relaxed">
          The four security enclaves have verified your forensic analysis. Combine the retrieved forensic tokens into the master authorization string to trigger the failsafe shutdown and liberate the KL University enclave.
        </p>
      </div>

      {/* 4 Forensic Token Slot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tokens.map((t, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-cyan-500/40 bg-gray-900/80 text-center space-y-1 shadow-[0_0_15px_rgba(0,240,255,0.1)] relative overflow-hidden"
          >
            <div className="text-[10px] font-mono text-slate-400 font-semibold">{t.label}</div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-widest text-cyan-300 text-glow-cyan py-1">
              {t.token}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3" />
              SLOT #{idx + 1} VERIFIED
            </div>
            <div className="absolute top-0 right-0 w-2 h-2 rounded-bl bg-cyan-400"></div>
          </div>
        ))}
      </div>

      {/* Disarm Terminal */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/95 p-6 shadow-[0_0_40px_rgba(0,240,255,0.2)] space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            MASTER OVERRIDE INJECTION INTERFACE
          </span>
          <button
            type="button"
            onClick={handleInsertAssembled}
            className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
          >
            Auto-fill Assembled Tokens
          </button>
        </div>

        <form onSubmit={handleDisarm} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-2">
              FORMAT: TOKEN1-TOKEN2-TOKEN3-TOKEN4
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={overrideInput}
                onChange={(e) => {
                  setOverrideInput(e.target.value);
                  if (feedback.type) setFeedback({ type: null, message: '' });
                }}
                placeholder="SAFE-URGENCY-ARUN-MFA"
                className="flex-1 px-4 py-3.5 rounded-xl border border-cyan-500/50 bg-gray-900 font-mono text-base tracking-widest text-slate-100 uppercase placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
                maxLength={40}
                disabled={isDisarming || isSuccess}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isDisarming || isSuccess || !overrideInput.trim()}
                className="px-8 py-3.5 rounded-xl font-heading text-sm font-black tracking-widest text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 hover:from-emerald-300 hover:to-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
              >
                {isSuccess ? (
                  <>
                    <Unlock className="w-5 h-5 animate-bounce" />
                    <span>OVERRIDE ACCEPTED!</span>
                  </>
                ) : isDisarming ? (
                  <>
                    <Lock className="w-5 h-5 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-black" />
                    <span>DISARM SHADOWBYTE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono flex items-start gap-3 ${
              feedback.type === 'error'
                ? 'border-red-500/60 bg-red-950/40 text-red-300 animate-shake'
                : 'border-emerald-500/60 bg-emerald-950/50 text-emerald-200 glow-green'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm">
                {feedback.type === 'error' ? 'AUTHENTICATION REJECTED' : 'SYSTEM OVERRIDE SUCCESSFUL!'}
              </div>
              <p className="mt-1">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
