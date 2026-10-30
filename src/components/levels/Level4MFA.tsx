import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Send, 
  Lock, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import type { LevelData } from '../../types';
import { validateLevel4 } from '../../utils/validation';
import { cyberAudio } from '../../utils/audio';
import { api } from '../../services/api';

interface Level4Props {
  levelData: LevelData;
  teamId?: string;
  onSolve: (score: number, token: string) => void;
  onRequestHint: (hintIndex: number) => void;
  onProceedToOverride: () => void;
}

export const Level4MFA: React.FC<Level4Props> = ({
  levelData,
  teamId,
  onSolve,
  onRequestHint,
  onProceedToOverride,
}) => {
  const [conceptInput, setConceptInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hints = [
    'Think about an authentication method that requires two or more distinct verification factors before granting access.',
    'It is widely abbreviated as a 3-letter acronym: M _ _ (Multi-Factor...).',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || levelData.solved) return;

    setIsSubmitting(true);
    cyberAudio.playKeyClick();

    const result = validateLevel4(conceptInput);

    // Sync attempt to live backend monitor
    if (teamId) {
      api.validateSubmission({
        teamId,
        level: 4,
        answer: conceptInput,
      }).catch(console.error);
    }

    if (result.isValid) {
      cyberAudio.playAccessGranted();
      setFeedback({ type: 'success', message: result.message });
      const finalScore = Math.max(0, levelData.maxPoints - levelData.hintsUsed * 2);
      onSolve(finalScore, 'MFA');
    } else {
      cyberAudio.playAccessDenied();
      setFeedback({ type: 'error', message: result.message });
      setTimeout(() => setIsSubmitting(false), 800);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-cyan-500/40 bg-gray-950/90 p-6 sm:p-8 shadow-[0_0_35px_rgba(0,240,255,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <ShieldCheck className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  STAGE 04 // DEFENSE ARCHITECTURE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ALLOCATION: {levelData.maxPoints} PTS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-slate-100 tracking-wide mt-1.5">
                IDENTITY DEFENSE & AUTHENTICATION CONCEPTS
              </h2>
            </div>
          </div>

          {levelData.solved ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 text-emerald-400 font-mono text-xs font-bold glow-green">
              <CheckCircle2 className="w-4 h-4" />
              <span>TOKEN UNLOCKED: [MFA] (+{levelData.score} PTS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-mono text-xs">
              <Key className="w-3.5 h-3.5" />
              <span>TOKEN 4 OF 4</span>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs sm:text-sm font-mono text-slate-300 space-y-2 leading-relaxed">
          <p>
            The final firewall layer requires activating the universal identity defense paradigm to patch the vulnerability that allowed Arun's account to be breached.
          </p>
          <div className="p-3 rounded-lg border border-cyan-500/20 bg-gray-900/60 text-xs text-slate-300">
            <strong className="text-cyan-400 uppercase">Mission Objective:</strong> Identify the fundamental cybersecurity security concept that combines <em>"something you know"</em> with <em>"something you have"</em> to unlock Token #4.
          </div>
        </div>
      </div>

      {/* Visual Authentication Architecture Diagram */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/90 p-6 shadow-[0_0_30px_rgba(0,240,255,0.15)] space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" />
            CLASSICAL AUTHENTICATION FACTOR TAXONOMY
          </span>
          <span className="text-[11px] font-mono text-slate-500">NIST SP 800-63B</span>
        </div>

        {/* 3 Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono">
          {/* Factor 1: Knowledge */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-gray-900/80 space-y-2 hover:border-cyan-400/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-cyan-400" />
                FACTOR 1: KNOWLEDGE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                REQUIRED
              </span>
            </div>
            <div className="text-base font-bold text-slate-100">
              "Something You Know"
            </div>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Passphrases & Passwords</li>
              <li>Secret PINs</li>
              <li>Security Questions</li>
            </ul>
            <div className="pt-2 text-[10px] text-amber-400/80">
              ⚠️ Vulnerable on its own to phishing and credential stuffing.
            </div>
          </div>

          {/* Factor 2: Possession */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-gray-900/80 space-y-2 hover:border-cyan-400/60 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                FACTOR 2: POSSESSION
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                REQUIRED
              </span>
            </div>
            <div className="text-base font-bold text-slate-100">
              "Something You Have"
            </div>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Authenticator App (TOTP)</li>
              <li>Hardware FIDO2 Security Key</li>
              <li>Smartcard / Push Notification</li>
            </ul>
            <div className="pt-2 text-[10px] text-emerald-400">
              ✓ Stops remote attackers who stole passwords.
            </div>
          </div>

          {/* Factor 3: Inherence */}
          <div className="p-4 rounded-xl border border-slate-800 bg-gray-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-slate-500" />
                FACTOR 3: INHERENCE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900 border border-slate-700 text-slate-500">
                BIOMETRICS
              </span>
            </div>
            <div className="text-base font-bold text-slate-300">
              "Something You Are"
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>Fingerprint Recognition</li>
              <li>Facial Geometry (FaceID)</li>
              <li>Retina / Voice Scan</li>
            </ul>
            <div className="pt-2 text-[10px] text-slate-500">
              Biological hardware-bound trait.
            </div>
          </div>
        </div>

        {/* Question & Input Form */}
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/90 space-y-3.5 font-mono">
          <div className="text-xs font-bold text-[#22D3EE] uppercase tracking-wider">
            FORENSIC QUERY:
          </div>
          <p className="text-sm sm:text-base text-[#F8FAFC] leading-relaxed font-semibold">
            Which cybersecurity concept or acronym describes combining <strong>"something you know"</strong> (e.g. password) with <strong>"something you have"</strong> (e.g. authenticator app / security key) to safeguard accounts?
          </p>

          {!levelData.solved ? (
            <form onSubmit={handleSubmit} className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={conceptInput}
                  onChange={(e) => {
                    setConceptInput(e.target.value);
                    if (feedback.type) setFeedback({ type: null, message: '' });
                  }}
                  placeholder="e.g. MFA (or Multi-Factor Authentication)"
                  className="flex-1 px-5 py-4 rounded-2xl border-2 border-slate-600 bg-slate-950 font-mono text-lg font-bold tracking-widest text-white uppercase placeholder:text-slate-400 focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-cyan-400/40"
                  maxLength={35}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !conceptInput.trim()}
                  className="px-8 py-4 rounded-2xl font-heading text-base font-black tracking-wider text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'VALIDATING...' : 'SUBMIT DEFENSE'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>DEFENSE ARCHITECTURE CONFIRMED // TOKEN [MFA] UNLOCKED</span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Multi-Factor Authentication (<strong className="text-emerald-300">MFA</strong>) ensures that even if an attacker tricks a user into surrendering their password (via phishing as in Level 2) or attempts credential guessing (as in Level 3), access is blocked without possession of the second factor.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    cyberAudio.playAccessGranted();
                    onProceedToOverride();
                  }}
                  className="px-6 py-3 rounded-xl font-heading text-sm font-black tracking-wider text-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>INITIALIZE MASTER DISARM TERMINAL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback.message && !levelData.solved && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
              feedback.type === 'error'
                ? 'border-red-500/50 bg-red-950/40 text-red-300 animate-shake'
                : 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Hints */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              INTELLIGENCE HINTS (PENALTY: -2 PTS PER HINT)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Used: {levelData.hintsUsed} / 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hints.map((hintText, idx) => {
              const hintNum = idx + 1;
              const isRevealed = levelData.revealedHints.includes(hintNum);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    isRevealed
                      ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-200'
                      : 'border-slate-800 bg-gray-900/50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-400">HINT #{hintNum}</span>
                    {isRevealed ? (
                      <span className="text-[10px] text-cyan-400 font-bold">REVEALED (-2 PTS)</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRequestHint(hintNum)}
                        disabled={levelData.solved}
                        className="text-[10px] px-2 py-0.5 rounded border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition-colors cursor-pointer"
                      >
                        REVEAL (-2 PTS)
                      </button>
                    )}
                  </div>
                  <p className={isRevealed ? 'text-slate-300' : 'text-slate-600 italic'}>
                    {isRevealed ? hintText : 'Intelligence encrypted. Click reveal to decrypt hint.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
