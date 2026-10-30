import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface HintConfirmModalProps {
  isOpen: boolean;
  hintNumber: number;
  levelNumber: number;
  penaltyPoints: number;
  currentPuzzleScore: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const HintConfirmModal: React.FC<HintConfirmModalProps> = ({
  isOpen,
  hintNumber,
  levelNumber,
  penaltyPoints,
  currentPuzzleScore,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const scoreAfter = Math.max(0, currentPuzzleScore - penaltyPoints);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/60 bg-gray-950 p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-amber-300">
                TACTICAL INTELLIGENCE REQUEST
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Level {levelNumber} // Hint #{hintNumber}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cyberAudio.playKeyClick();
              onCancel();
            }}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning text */}
        <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-950/30 text-xs font-mono text-amber-200/90 leading-relaxed">
          Revealing this hint incurs a penalty of <strong className="text-amber-300 underline font-bold">-{penaltyPoints} POINTS</strong> on this puzzle.
        </div>

        {/* Score comparison pill */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-gray-900/80 font-mono text-xs">
          <div>
            <span className="text-slate-400">Current Puzzle Score: </span>
            <span className="font-bold text-slate-200">{currentPuzzleScore} pts</span>
          </div>
          <span className="text-amber-400 font-bold">→</span>
          <div>
            <span className="text-slate-400">After Hint: </span>
            <span className="font-bold text-amber-400">{scoreAfter} pts</span>
          </div>
        </div>

        <p className="text-xs font-mono text-slate-400">
          ForensiXplore advises teams to analyze the intercepted payload carefully before tapping hints. Are you sure you want to proceed?
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onCancel();
            }}
            className="px-4 py-2 rounded-lg font-mono text-xs text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-colors"
          >
            CANCEL // KEEP TRYING
          </button>
          <button
            type="button"
            onClick={() => {
              cyberAudio.playHintSound();
              onConfirm();
            }}
            className="px-5 py-2.5 rounded-lg font-mono text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>CONFIRM & REVEAL (-{penaltyPoints} PTS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
