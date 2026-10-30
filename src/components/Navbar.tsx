import React from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Volume2, 
  VolumeX, 
  Trophy, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles
} from 'lucide-react';
import type { GameState } from '../types';
import { cyberAudio } from '../utils/audio';

interface NavbarProps {
  state: GameState;
  onToggleSound: () => void;
  onToggleMatrix: () => void;
  onOpenLeaderboard: () => void;
  onOpenOrganizer: () => void;
  onOpenBonus: () => void;
  onSwitchView?: (view: 'core' | 'challenges') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  onToggleSound,
  onToggleMatrix,
  onOpenLeaderboard,
  onOpenOrganizer,
  onOpenBonus,
  onSwitchView,
}) => {
  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current total score including core, bonus, and challenge drills
  const coreScore =
    state.levels[1].score +
    state.levels[2].score +
    state.levels[3].score +
    state.levels[4].score;
  const drillScore = Object.values(state.challengeProgress || {}).reduce(
    (acc, curr) => acc + (curr.solved ? curr.score : 0),
    0
  );
  const totalScore = coreScore + state.bonusScore + drillScore;
  const solvedDrillsCount = Object.values(state.challengeProgress || {}).filter((p) => p.solved).length;

  // Determine timer color theme based on urgency
  const getTimerStyles = () => {
    if (!state.isRunning && state.timeRemaining === 3600) {
      return 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40';
    }
    if (state.timeRemaining <= 300) {
      return 'border-red-500 text-red-400 bg-red-950/60 animate-pulse glow-red';
    }
    if (state.timeRemaining <= 600) {
      return 'border-amber-500/80 text-amber-300 bg-amber-950/50';
    }
    return 'border-cyan-500/60 text-cyan-300 bg-cyan-950/40 glow-cyan';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/30 bg-gray-950/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Mission Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-black tracking-widest text-cyan-300 font-heading text-glow-cyan">
                OPERATION SHADOWBYTE
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[11px] font-bold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg">
                FORENSIEXPLORE // KLU
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>VENUE: LAB R201D</span>
              <span className="text-cyan-500">•</span>
              <span>30 OCT 2026</span>
              {state.team.name && (
                <>
                  <span className="text-cyan-500">•</span>
                  <span className="text-cyan-300 font-semibold truncate max-w-[140px] sm:max-w-[220px]">
                    TEAM: {state.team.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Workspace Navigation & Countdown HUD */}
        {state.phase !== 'intro' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher Pills */}
            {onSwitchView && (
              <div className="hidden sm:flex items-center p-1 rounded-xl bg-gray-900 border border-slate-800 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => onSwitchView('core')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    state.activeView === 'core'
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CORE MISSION
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchView('challenges')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    state.activeView === 'challenges'
                      ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>SOC DRILLS</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-bold border border-purple-400/30">
                    {solvedDrillsCount}/24
                  </span>
                </button>
              </div>
            )}

            {/* Timer Capsule */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono text-base font-black shadow-sm transition-all ${getTimerStyles()}`}
              title="Countdown remaining for Operation Shadowbyte (60m total)"
            >
              <Clock className={`w-4 h-4 ${state.timeRemaining <= 300 ? 'animate-spin' : ''}`} />
              <span className="tracking-widest">{formatTime(state.timeRemaining)}</span>
              {state.timeRemaining <= 300 && (
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 animate-pulse">
                  CRITICAL
                </span>
              )}
            </div>

            {/* Score Capsule */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-cyan-500/40 bg-slate-900/90 font-mono text-sm">
              <span className="text-slate-300 font-bold">SCORE:</span>
              <span className="font-black text-[#22D3EE] text-base">
                {totalScore}
              </span>
              <span className="text-slate-300 text-xs font-semibold">/ 215 PTS</span>
            </div>
          </div>
        )}

        {/* Right HUD Controls: Sound, Matrix, Bonus, Leaderboard, Organizer */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Optional Bonus Puzzle Quick Access */}
          {state.phase !== 'intro' && (
            <button
              onClick={() => {
                cyberAudio.playKeyClick();
                onOpenBonus();
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono border transition-all ${
                state.bonusSolved
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'border-purple-500/40 bg-purple-950/30 text-purple-300 hover:border-purple-400 hover:bg-purple-900/40'
              }`}
              title="Optional Caesar Cipher Bonus Puzzle (+3 pts)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">BONUS</span>
              <span>{state.bonusSolved ? '+3✓' : '+3'}</span>
            </button>
          )}

          {/* Matrix Canvas Rain Toggle */}
          <button
            onClick={() => {
              cyberAudio.playKeyClick();
              onToggleMatrix();
            }}
            className="p-1.5 rounded-md border border-slate-800 bg-gray-900/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title={state.matrixEnabled ? 'Disable Matrix Rain background' : 'Enable Matrix Rain background'}
            aria-label="Toggle Matrix rain"
          >
            {state.matrixEnabled ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              cyberAudio.playKeyClick();
              onToggleSound();
            }}
            className="p-1.5 rounded-md border border-slate-800 bg-gray-900/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title={state.soundEnabled ? 'Mute Cyber Audio' : 'Unmute Cyber Audio'}
            aria-label="Toggle Sound"
          >
            {state.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              cyberAudio.playKeyClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-700 bg-gray-900/80 text-xs font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            title="View Enclave Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">LEADERBOARD</span>
          </button>

          {/* Organizer Mode Access Button */}
          <button
            onClick={() => {
              cyberAudio.playKeyClick();
              onOpenOrganizer();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-cyan-800/60 bg-cyan-950/50 text-xs font-mono text-cyan-400 hover:bg-cyan-900/60 hover:border-cyan-400 transition-colors"
            title="Organizer Dashboard"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ORGANIZER</span>
          </button>
        </div>
      </div>
    </header>
  );
};
