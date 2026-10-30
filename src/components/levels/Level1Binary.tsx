import React, { useState } from 'react';
import { 
  Binary, 
  HelpCircle, 
  Key, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Calculator, 
  ChevronDown, 
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import type { LevelData } from '../../types';
import { validateLevel1 } from '../../utils/validation';
import { cyberAudio } from '../../utils/audio';
import { api } from '../../services/api';

interface Level1Props {
  levelData: LevelData;
  teamId?: string;
  onSolve: (score: number, token: string) => void;
  onRequestHint: (hintIndex: number) => void;
  onNextLevel: () => void;
}

export const Level1Binary: React.FC<Level1Props> = ({
  levelData,
  teamId,
  onSolve,
  onRequestHint,
  onNextLevel,
}) => {
  const [inputAnswer, setInputAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Binary stream from the challenge
  const octets = [
    { binary: '01010011', decimal: 83, ascii: 'S', byte: 1 },
    { binary: '01000001', decimal: 65, ascii: 'A', byte: 2 },
    { binary: '01000110', decimal: 70, ascii: 'F', byte: 3 },
    { binary: '01000101', decimal: 69, ascii: 'E', byte: 4 },
  ];

  const hints = [
    'Split the continuous stream into 4 distinct 8-bit octets: 01010011 | 01000001 | 01000110 | 01000101. Each byte represents a single ASCII uppercase character.',
    'Binary place values are [128, 64, 32, 16, 8, 4, 2, 1]. For example: 01010011 = 64 + 16 + 2 + 1 = 83 in decimal, which is the ASCII code for "S". Repeat for the other 3 bytes.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || levelData.solved) return;

    setIsSubmitting(true);
    cyberAudio.playKeyClick();

    const result = validateLevel1(inputAnswer);

    // Sync attempt to live backend monitor
    if (teamId) {
      api.validateSubmission({
        teamId,
        level: 1,
        answer: inputAnswer,
      }).catch(console.error);
    }

    if (result.isValid) {
      cyberAudio.playAccessGranted();
      setFeedback({ type: 'success', message: result.message });
      // Calculate score: 10 base minus 2 per hint used
      const finalScore = Math.max(0, levelData.maxPoints - levelData.hintsUsed * 2);
      onSolve(finalScore, 'SAFE');
      setIsSubmitting(false);
    } else {
      cyberAudio.playAccessDenied();
      setFeedback({ type: 'error', message: result.message });
      setTimeout(() => setIsSubmitting(false), 800);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Level Header Banner */}
      <div className="rounded-3xl border border-cyan-500/40 bg-gray-950/90 p-6 sm:p-8 shadow-[0_0_35px_rgba(0,240,255,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Binary className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  STAGE 01 // FORENSICS
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ALLOCATION: {levelData.maxPoints} PTS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-slate-100 tracking-wide mt-1.5">
                PACKET SNIFFER: BINARY PAYLOAD DECODE
              </h2>
            </div>
          </div>

          {/* Solved Status or Token Badge */}
          {levelData.solved ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 text-emerald-400 font-mono text-xs font-bold glow-green">
              <CheckCircle2 className="w-4 h-4" />
              <span>TOKEN UNLOCKED: [SAFE] (+{levelData.score} PTS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-mono text-xs">
              <Key className="w-3.5 h-3.5" />
              <span>TOKEN 1 OF 4</span>
            </div>
          )}
        </div>

        {/* Narrative & Scenario */}
        <div className="mt-4 text-sm sm:text-base font-mono text-[#CBD5E1] space-y-3 leading-relaxed">
          <p>
            ForensiXplore network probes in Lab R201D captured a raw beacon transmission emitted by the rogue <strong className="text-[#22D3EE] font-bold">ShadowByte-X</strong> malware. The malware embedded its initial handshake authorization key in an unencrypted 32-bit ASCII binary stream.
          </p>
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 text-sm text-[#F8FAFC]">
            <strong className="text-[#22D3EE] uppercase font-black">Mission Objective:</strong> Convert the 4-byte binary stream below into human-readable ASCII text to retrieve Master Token #1.
          </div>
        </div>
      </div>

      {/* Intercepted Binary Stream Display */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/90 p-6 shadow-[0_0_30px_rgba(0,240,255,0.15)] space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            SNIFFED RAW DATA STREAM (32 BITS / 4 OCTETS)
          </span>
          <span className="text-[11px] font-mono text-slate-500">ENCODING: 8-BIT ASCII</span>
        </div>

        {/* Binary Octet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {octets.map((oct, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all text-center ${
                levelData.solved
                  ? 'border-emerald-500/40 bg-emerald-950/30'
                  : 'border-cyan-500/30 bg-gray-900/80 hover:border-cyan-400/60'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>OCTET #{oct.byte}</span>
                <span className="text-cyan-500">8 BITS</span>
              </div>
              <div className="font-mono text-lg font-bold tracking-widest text-cyan-300 text-glow-cyan my-1 select-all">
                {oct.binary}
              </div>
              {levelData.solved ? (
                <div className="text-xs font-mono font-bold text-emerald-400 mt-2 border-t border-emerald-500/30 pt-1">
                  ASCII: <span className="text-base text-emerald-300 font-black">'{oct.ascii}'</span> (0x{oct.decimal.toString(16).toUpperCase()})
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-500 mt-1">
                  Dec: ??? | ASCII: ?
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continuous Stream Callout */}
        <div className="p-3 rounded-lg border border-slate-800 bg-gray-900/50 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <span className="text-slate-400">Raw Intercept:</span>
          <code className="text-cyan-300 font-bold tracking-widest select-all bg-black/60 px-3 py-1.5 rounded border border-cyan-500/30">
            01010011 01000001 01000110 01000101
          </code>
        </div>

        {/* Interactive Binary-to-ASCII Helper Drawer */}
        <div className="rounded-xl border border-slate-800 bg-gray-900/40 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              setShowHelper(!showHelper);
            }}
            className="w-full px-4 py-2.5 flex items-center justify-between font-mono text-xs text-slate-400 hover:text-cyan-300 hover:bg-gray-900/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>FORENSIC TOOLKIT: Binary Octet Place Values Reference</span>
            </span>
            {showHelper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHelper && (
            <div className="p-4 border-t border-slate-800 bg-gray-950 font-mono text-xs text-slate-300 space-y-3">
              <p className="text-slate-400">
                Each 8-bit octet represents numbers from left to right as powers of 2:
              </p>
              <div className="grid grid-cols-8 gap-1 text-center font-bold">
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^7</div>128</div>
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^6</div>64</div>
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^5</div>32</div>
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^4</div>16</div>
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^3</div>8</div>
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^2</div>4</div>
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^1</div>2</div>
                <div className="p-1.5 bg-gray-900 rounded border border-slate-800"><div className="text-slate-500 text-[10px]">2^0</div>1</div>
              </div>
              <p className="text-[11px] text-slate-400">
                Sum up the positions where a '1' is present, then find the corresponding letter in the standard ASCII table ('A' = 65, 'B' = 66, ... 'Z' = 90).
              </p>
            </div>
          )}
        </div>

        {/* Answer Submission Form */}
        {!levelData.solved ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider mb-2">
                ENTER DECODED KEYWORD (CASE-INSENSITIVE)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={inputAnswer}
                  onChange={(e) => {
                    setInputAnswer(e.target.value);
                    if (feedback.type) setFeedback({ type: null, message: '' });
                  }}
                  placeholder="e.g. SAFE"
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-600 bg-slate-900 font-mono text-xl font-bold tracking-widest text-[#F8FAFC] uppercase placeholder:text-slate-400 focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-cyan-400 shadow-inner"
                  maxLength={10}
                  autoComplete="off"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !inputAnswer.trim()}
                  className="px-8 py-4 rounded-2xl font-heading text-base font-black tracking-wider text-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(0,240,255,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'VERIFYING...' : 'TRANSMIT KEY'}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Solved Victory Box */
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>PAYLOAD SUCCESSFULLY DECODED // TOKEN [SAFE] UNLOCKED</span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              01010011 (83='S') + 01000001 (65='A') + 01000110 (70='F') + 01000101 (69='E') = <strong className="text-emerald-300">SAFE</strong>. 
              The initial failsafe handshake has passed. Level 2 (Phishing Vector Triage) is now accessible.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  cyberAudio.playKeyClick();
                  onNextLevel();
                }}
                className="px-6 py-2.5 rounded-lg font-heading text-xs font-bold tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>PROCEED TO LEVEL 2: PHISHING TRIAGE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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

        {/* Hints Section */}
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
