import React from 'react';
import { 
  Terminal, 
  Radio, 
  Clock, 
  Users, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Lock, 
  Zap,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { cyberAudio } from '../utils/audio';

interface IntroScreenProps {
  onStart: () => void;
  onOpenOrganizer: () => void;
  onOpenLeaderboard: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStart,
  onOpenOrganizer,
  onOpenLeaderboard,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 max-w-5xl mx-auto z-10">
      {/* Top Badge: ForensiXplore & KL University */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 animate-fade-in">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          FORENSIEXPLORE FORENSIC LABS
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-950/80 border border-blue-400/50 text-blue-300">
          KL UNIVERSITY
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-purple-950/80 border border-purple-400/50 text-purple-300">
          DEFENSE SIMULATION // CODE: SHADOWBYTE
        </span>
      </div>

      {/* Main Glitch Title */}
      <div className="text-center mb-8 relative">
        <div className="inline-block relative">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-cyan-500 glitch-hover">
            OPERATION SHADOWBYTE
          </h1>
          <div className="absolute -inset-1 blur-xl bg-cyan-500/20 -z-10 rounded-full"></div>
        </div>
        <p className="mt-3 text-sm sm:text-base text-cyan-300/80 font-mono tracking-widest max-w-2xl mx-auto">
          BROWSER-BASED CYBERSECURITY INCIDENT ESCAPE ROOM // VENUE R201D
        </p>
      </div>

      {/* Event Details Grid Card */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center text-center">
          <Calendar className="w-5 h-5 text-cyan-400 mb-1.5" />
          <span className="text-[10px] text-slate-400 font-mono uppercase">DATE</span>
          <span className="text-xs sm:text-sm font-bold text-slate-100 font-mono">30 OCT 2026</span>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center text-center">
          <Clock className="w-5 h-5 text-cyan-400 mb-1.5" />
          <span className="text-[10px] text-slate-400 font-mono uppercase">EVENT TIME</span>
          <span className="text-xs sm:text-sm font-bold text-slate-100 font-mono">1:50–3:50 PM</span>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center text-center">
          <MapPin className="w-5 h-5 text-cyan-400 mb-1.5" />
          <span className="text-[10px] text-slate-400 font-mono uppercase">VENUE</span>
          <span className="text-xs sm:text-sm font-bold text-slate-100 font-mono">LAB R201D</span>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center text-center">
          <Zap className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-[10px] text-slate-400 font-mono uppercase">GAMEPLAY DURATION</span>
          <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">EXACTLY 60 MIN</span>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center text-center">
          <Users className="w-5 h-5 text-cyan-400 mb-1.5" />
          <span className="text-[10px] text-slate-400 font-mono uppercase">MAX PARTICIPANTS</span>
          <span className="text-xs sm:text-sm font-bold text-slate-100 font-mono">20 ANALYSTS</span>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-500/25 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center text-center">
          <Cpu className="w-5 h-5 text-purple-400 mb-1.5" />
          <span className="text-[10px] text-slate-400 font-mono uppercase">DIFFICULTY</span>
          <span className="text-xs sm:text-sm font-bold text-purple-300 font-mono">BEGINNER → INT</span>
        </div>
      </div>

      {/* Mission Briefing Terminal Window */}
      <div className="w-full mb-8 rounded-xl border border-cyan-500/40 bg-gray-950/90 shadow-[0_0_30px_rgba(0,240,255,0.12)] overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-gray-900/90 px-4 py-2.5 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-2 text-xs font-mono text-cyan-300">
              SEC-OPS://INCIDENT_BRIEF_2026-10-30.log
            </span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80 uppercase">
            STATUS: ACTIVE BREACH IN PROGRESS
          </span>
        </div>

        {/* Terminal Content */}
        <div className="p-5 sm:p-6 font-mono text-xs sm:text-sm space-y-4 text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2 text-red-400">
            <Radio className="w-4 h-4 mt-0.5 animate-pulse shrink-0" />
            <p className="font-semibold">
              [ALERT 13:42:09 UTC] Unauthorized persistence beacon discovered within the R201D campus subnet.
            </p>
          </div>

          <p>
            An automated advanced threat script known as <strong className="text-cyan-300 font-bold">SHADOWBYTE</strong> has infiltrated our sandbox perimeter. It has locked administrative authentication channels behind four encrypted forensic gating layers.
          </p>

          <div className="bg-gray-900/90 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              ANALYST DIRECTIVE & OBJECTIVES:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong className="text-slate-100">Level 1 (10 pts):</strong> Decode raw binary ASCII packets intercepted from rogue network traffic.</li>
              <li><strong className="text-slate-100">Level 2 (6 pts):</strong> Triage employee inboxes to flag deceptive spear-phishing attack vectors.</li>
              <li><strong className="text-slate-100">Level 3 (8 pts):</strong> Investigate SIEM authentication logs to uncover brute-force compromised user credentials.</li>
              <li><strong className="text-slate-100">Level 4 (8 pts):</strong> Identify core multi-factor authentication defensive architectures.</li>
              <li><strong className="text-slate-100">Disarm Terminal:</strong> Assemble the master override sequence <code className="text-cyan-300 bg-cyan-950/70 px-1 py-0.5 rounded">TOKEN1-TOKEN2-TOKEN3-TOKEN4</code> to neutralize the breach.</li>
            </ul>
          </div>

          <p className="text-amber-300/90 text-xs">
            ⚠️ <strong>CRITICAL TIME LIMIT:</strong> You will have exactly <strong>60 minutes</strong> to complete all 4 investigative layers once your team initiates the protocol.
          </p>
        </div>
      </div>

      {/* Primary CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
        <button
          onClick={() => {
            cyberAudio.playAccessGranted();
            onStart();
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-xl font-heading text-base font-bold tracking-widest text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_25px_rgba(0,240,255,0.6)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>START MISSION // SETUP TEAM</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => {
            cyberAudio.playKeyClick();
            onOpenLeaderboard();
          }}
          className="w-full sm:w-auto px-6 py-4 rounded-xl font-mono text-sm font-semibold tracking-wider text-cyan-300 border border-cyan-500/40 bg-gray-900/80 hover:bg-cyan-950/50 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>VIEW LEADERBOARD</span>
        </button>

        <button
          onClick={() => {
            cyberAudio.playKeyClick();
            onOpenOrganizer();
          }}
          className="w-full sm:w-auto px-5 py-4 rounded-xl font-mono text-xs font-semibold tracking-wider text-slate-400 border border-slate-800 bg-gray-950/80 hover:text-cyan-300 hover:border-cyan-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>ORGANIZER ACCESS</span>
        </button>
      </div>

      {/* Footer credits */}
      <div className="mt-12 text-center text-[11px] font-mono text-slate-500">
        Engineered for ForensiXplore • Department of Computer Science & Cybersecurity • KL University
      </div>
    </div>
  );
};
