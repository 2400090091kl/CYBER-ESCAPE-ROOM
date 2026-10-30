import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sliders
} from 'lucide-react';
import { validateBonusCaesar } from '../../utils/validation';
import { cyberAudio } from '../../utils/audio';
import { api } from '../../services/api';

interface BonusCaesarProps {
  isOpen: boolean;
  bonusSolved: boolean;
  teamId?: string;
  onClose: () => void;
  onSolveBonus: () => void;
}

export const BonusCaesar: React.FC<BonusCaesarProps> = ({
  isOpen,
  bonusSolved,
  teamId,
  onClose,
  onSolveBonus,
}) => {
  const [inputPlaintext, setInputPlaintext] = useState('');
  const [shiftOffset, setShiftOffset] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  if (!isOpen) return null;

  const ciphertext = 'FUBSWR';

  // Realtime Caesar shift preview helper
  const applyCaesarShift = (text: string, shift: number) => {
    return text
      .split('')
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
        }
        return char;
      })
      .join('');
  };

  const previewShiftText = applyCaesarShift(ciphertext, -shiftOffset);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bonusSolved) return;

    cyberAudio.playKeyClick();
    const result = validateBonusCaesar(inputPlaintext);

    if (teamId) {
      api.validateSubmission({
        teamId,
        level: 99,
        answer: inputPlaintext,
      }).catch(console.error);
    }

    if (result.isValid) {
      cyberAudio.playAccessGranted();
      setFeedback({ type: 'success', message: result.message });
      onSolveBonus();
    } else {
      cyberAudio.playAccessDenied();
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-purple-500/50 bg-gray-950 p-6 shadow-[0_0_50px_rgba(168,85,247,0.25)] space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-500/50 text-purple-300">
                  OPTIONAL BONUS // CRYPTANALYSIS
                </span>
                <span className="text-xs font-mono text-purple-400 font-bold">+3 PTS</span>
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-100">
                CAESAR CIPHER OVERRIDE BEACON
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative */}
        <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 text-xs font-mono text-slate-300 leading-relaxed space-y-1.5">
          <p>
            ForensiXplore signals analysts intercepted a dormant auxiliary transmission left behind by the adversary. The packet payload was obfuscated using an ancient <strong>Caesar Shift Cipher (Shift +3)</strong>.
          </p>
          <p className="text-purple-300">
            <strong>Target Objective:</strong> Decrypt the intercepted string <code className="bg-black/50 px-2 py-0.5 rounded font-bold text-cyan-300">{ciphertext}</code> by shifting the alphabet backward to reveal the plaintext.
          </p>
        </div>

        {/* Intercept Card */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-gray-900/80 text-center space-y-3 font-mono">
          <div className="text-[11px] text-slate-400">INTERCEPTED CIPHERTEXT:</div>
          <div className="text-3xl font-black tracking-widest text-purple-300 text-glow-cyan select-all">
            {ciphertext}
          </div>

          {/* Interactive Shift Slider Tool */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Sliders className="w-3.5 h-3.5" />
                Interactive Shift Visualizer:
              </span>
              <span className="font-bold text-purple-300">
                Current Shift: -{shiftOffset}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={25}
              value={shiftOffset}
              onChange={(e) => {
                setShiftOffset(parseInt(e.target.value, 10));
                cyberAudio.playKeyClick();
              }}
              className="w-full accent-purple-400 cursor-pointer"
            />

            <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Decoded with shift -{shiftOffset}:</span>
              <code className="text-base font-bold tracking-widest text-emerald-400">
                {previewShiftText}
              </code>
            </div>
          </div>
        </div>

        {/* Form */}
        {!bonusSolved ? (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                ENTER DECRYPTED PLAINTEXT KEYWORD:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputPlaintext}
                  onChange={(e) => {
                    setInputPlaintext(e.target.value);
                    if (feedback.type) setFeedback({ type: null, message: '' });
                  }}
                  placeholder="e.g. CRYPTO"
                  className="flex-1 px-4 py-3 rounded-xl border border-purple-500/40 bg-gray-900 text-slate-100 uppercase font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:border-purple-400"
                  maxLength={15}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!inputPlaintext.trim()}
                  className="px-6 py-3 rounded-xl font-heading text-xs font-bold tracking-wider text-black bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-300 hover:to-pink-300 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>DECRYPT</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>BONUS CIPHER SOLVED (+3 BONUS POINTS SECURED!)</span>
            </div>
            <p className="text-slate-300">
              Plaintext: <strong className="text-emerald-300">CRYPTO</strong>. Caesar shift -3 transformed F→C, U→R, B→Y, S→P, W→T, R→O.
            </p>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback.message && !bonusSolved && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
              feedback.type === 'error'
                ? 'border-red-500/50 bg-red-950/40 text-red-300'
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

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg font-mono text-xs text-slate-400 border border-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
          >
            CLOSE BONUS WINDOW
          </button>
        </div>
      </div>
    </div>
  );
};
