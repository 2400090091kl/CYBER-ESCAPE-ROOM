import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Award, 
  AlertTriangle, 
  Play, 
  ArrowLeft,
  Sparkles,
  Terminal
} from 'lucide-react';
import type { GameState } from '../types';
import { cyberAudio } from '../utils/audio';

interface RulesScreenProps {
  state: GameState;
  onStartMission: () => void;
  onBack: () => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({
  state,
  onStartMission,
  onBack,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto z-10">
      <div className="w-full rounded-2xl border border-cyan-500/40 bg-gray-950/90 shadow-[0_0_35px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-cyan-950/50 to-gray-900 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-cyan-300">
                RULES OF ENGAGEMENT // OPERATION PROTOCOL
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Unit: <span className="text-cyan-400 font-bold">{state.team.name}</span> | Terminal: <span className="text-cyan-400 font-bold">{state.team.stationId}</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950 text-cyan-300">
            STEP 2 OF 2
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Top Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timer Rule */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex gap-3.5">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 h-fit">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-heading text-amber-300">
                  60-MINUTE COUNTDOWN TIMER
                </h3>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  As soon as you click <strong>"COMMENCE CHALLENGE"</strong>, the synchronized 60-minute clock initiates. If the timer runs out before disarming the rogue system, the enclave triggers total security lockdown.
                </p>
              </div>
            </div>

            {/* Hint & Penalty Rule */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 flex gap-3.5">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0 h-fit">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-heading text-cyan-300">
                  HINTS & SCORE PENALTIES
                </h3>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  Each puzzle has 2 intelligence hints. Revealing a hint deducts <strong>2 points</strong> from your puzzle score. Think through each problem as a forensic team before requesting tactical support!
                </p>
              </div>
            </div>
          </div>

          {/* Scoring Matrix */}
          <div className="rounded-xl border border-slate-800 bg-gray-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                SCORING MATRIX & TIER BREAKDOWN
              </h3>
              <span className="text-xs font-mono text-slate-300">
                CORE: <strong className="text-cyan-300">32 PTS</strong> • BONUS: <strong className="text-purple-300">+3</strong> • DRILLS: <strong className="text-[#22D3EE]">+180</strong> = <strong className="text-white">215 MAX</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono text-xs">
              <div className="p-3 rounded-lg border border-cyan-500/20 bg-gray-950/60">
                <div className="text-slate-300 text-[11px] font-bold">LEVEL 1: BINARY</div>
                <div className="text-base font-bold text-cyan-400 mt-1">10 PTS</div>
                <div className="text-xs text-slate-300">ASCII Octet Decode</div>
              </div>

              <div className="p-3 rounded-lg border border-cyan-500/20 bg-gray-950/60">
                <div className="text-slate-300 text-[11px] font-bold">LEVEL 2: PHISHING</div>
                <div className="text-base font-bold text-cyan-400 mt-1">6 PTS</div>
                <div className="text-xs text-slate-300">Threat Vector Triage</div>
              </div>

              <div className="p-3 rounded-lg border border-cyan-500/20 bg-gray-950/60">
                <div className="text-slate-300 text-[11px] font-bold">LEVEL 3: SIEM LOGS</div>
                <div className="text-base font-bold text-cyan-400 mt-1">8 PTS</div>
                <div className="text-xs text-slate-300">Auth Incident Audit</div>
              </div>

              <div className="p-3 rounded-lg border border-cyan-500/20 bg-gray-950/60">
                <div className="text-slate-300 text-[11px] font-bold">LEVEL 4: MFA DEFENSE</div>
                <div className="text-base font-bold text-cyan-400 mt-1">8 PTS</div>
                <div className="text-xs text-slate-300">Security Architecture</div>
              </div>
            </div>

            {/* Bonus & Drills explanation */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-200">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Caesar Cipher Bonus:</span>
                </div>
                <span className="font-bold text-purple-200 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-400/30">
                  +3 PTS
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-200">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>24 SOC Drills (4 Rooms):</span>
                </div>
                <span className="font-bold text-cyan-200 bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-400/30">
                  +180 PTS
                </span>
              </div>
            </div>
          </div>

          {/* Operational Guidelines */}
          <div className="p-4 rounded-xl border border-slate-800 bg-gray-900/40 text-xs font-mono space-y-2 text-slate-300">
            <div className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              KEYBOARD & ACCESSIBILITY DIRECTIVES:
            </div>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>Answers are case-insensitive with automatic whitespace trimming.</li>
              <li>Input fields accept standard keyboard entry and Enter key submission.</li>
              <li>Local session auto-saves automatically to prevent progress loss on page refresh.</li>
              <li>Anti-brute force cooldowns prevent accidental rapid duplicate submissions.</li>
            </ul>
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-lg border border-slate-800 bg-black/40 text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>ETHICAL NOTICE:</strong> All data, emails, IP addresses, and logs simulated in OPERATION SHADOWBYTE are strictly fictional educational models for ForensiXplore, KL University.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                cyberAudio.playKeyClick();
                onBack();
              }}
              className="px-4 py-2.5 rounded-lg font-mono text-xs text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>EDIT TEAM DETAILS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cyberAudio.playAccessGranted();
                onStartMission();
              }}
              className="px-8 py-3.5 rounded-xl font-heading text-sm font-black tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(0,240,255,0.5)] transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>COMMENCE CHALLENGE // START 60:00 TIMER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
