import React from 'react';
import {
  Shield,
  Clock,
  Key,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Radio,
  Compass
} from 'lucide-react';
import type { GameState } from '../types';

interface MissionSidebarProps {
  state: GameState;
  onSwitchView: (view: 'core' | 'challenges') => void;
  onOpenBonus: () => void;
  onOpenLeaderboard: () => void;
  onToggleSound: () => void;
}

export const MissionSidebar: React.FC<MissionSidebarProps> = ({
  state,
  onSwitchView,
  onOpenBonus,
  onOpenLeaderboard,
  onToggleSound,
}) => {
  // Format MM:SS
  const mins = Math.floor(state.timeRemaining / 60);
  const secs = state.timeRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const isTimeCritical = state.timeRemaining <= 300 && state.isRunning;

  // Calculate live scores
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

  const totalHintsUsed =
    state.levels[1].hintsUsed +
    state.levels[2].hintsUsed +
    state.levels[3].hintsUsed +
    state.levels[4].hintsUsed;

  const solvedDrillsCount = Object.values(state.challengeProgress || {}).filter(
    (p) => p.solved
  ).length;

  const tokens = [
    { level: 1, key: 'level1', label: 'L1: BINARY', token: state.tokens.level1 || 'SAFE', unlocked: state.levels[1].solved },
    { level: 2, key: 'level2', label: 'L2: PHISHING', token: state.tokens.level2 || 'URGENCY', unlocked: state.levels[2].solved },
    { level: 3, key: 'level3', label: 'L3: SIEM LOGS', token: state.tokens.level3 || 'ARUN', unlocked: state.levels[3].solved },
    { level: 4, key: 'level4', label: 'L4: MFA DEFENSE', token: state.tokens.level4 || 'MFA', unlocked: state.levels[4].solved },
  ];

  return (
    <aside className="w-full space-y-6 font-mono">
      {/* 1. Master Countdown Timer Card */}
      <div
        className={`p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
          isTimeCritical
            ? 'border-rose-500 bg-rose-950/60 shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse'
            : 'border-cyan-500/50 bg-slate-950/95 shadow-[0_0_35px_rgba(0,240,255,0.18)]'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-700">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#22D3EE]">
            <Clock className="w-4 h-4 text-[#22D3EE]" />
            MISSION CLOCK (60 MIN)
          </span>
          <span className={`text-xs font-black ${state.isRunning ? 'text-emerald-400' : state.isCompleted ? 'text-cyan-300' : 'text-amber-300'}`}>
            {state.isRunning ? '● SYNCHRONIZED' : state.isCompleted ? 'MISSION END' : 'STANDBY'}
          </span>
        </div>

        <div className="py-4 text-center">
          <div
            className={`text-5xl sm:text-6xl font-black tracking-widest ${
              isTimeCritical ? 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.9)]' : 'text-[#22D3EE] drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]'
            }`}
          >
            {timeFormatted}
          </div>
          <div className="text-xs text-slate-300 font-semibold mt-1 uppercase tracking-wider">
            60:00 Window • Venue: Lab R201D
          </div>
        </div>

        {/* Pacing Advice Bar */}
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] text-slate-300 text-center font-semibold">
          ⏱ 15m Core • 35m Drills • 10m Override
        </div>

        {/* Progress Bar of Time Elapsed */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
          <div
            className={`h-full transition-all duration-1000 ${
              isTimeCritical ? 'bg-rose-500' : 'bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400'
            }`}
            style={{ width: `${(state.timeRemaining / state.totalDurationSeconds) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 2. Tactical View Switcher (Core vs Question Drills) */}
      <div className="p-5 rounded-3xl border-2 border-purple-500/50 bg-slate-950/95 shadow-[0_0_30px_rgba(168,85,247,0.2)] space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#C084FC] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#C084FC]" />
          <span>TACTICAL MISSION WORKSPACES</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onSwitchView('core')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              state.activeView === 'core'
                ? 'border-cyan-400 bg-cyan-950/70 text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.4)] ring-2 ring-cyan-400/50 font-black'
                : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="text-xs font-bold tracking-wider flex items-center justify-between">
              <span>CORE ESCAPE</span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
            <div className="text-xs text-slate-300 mt-1">4 Story Levels</div>
          </button>

          <button
            type="button"
            onClick={() => onSwitchView('challenges')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              state.activeView === 'challenges'
                ? 'border-purple-400 bg-purple-950/70 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/50 font-black'
                : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="text-xs font-bold tracking-wider flex items-center justify-between">
              <span>SOC DRILLS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/40 text-purple-200 font-bold border border-purple-400/40">
                {solvedDrillsCount}/24
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1">24 Question Bank</div>
          </button>
        </div>
      </div>

      {/* 3. Team Enclave Telemetry Card */}
      <div className="p-6 rounded-3xl border-2 border-slate-700 bg-slate-950/95 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#22D3EE]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">TEAM ENCLAVE</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400/50 text-[#22D3EE] font-black">
            {state.team.stationId || 'Station-01'}
          </span>
        </div>

        <div>
          <div className="text-xl font-black text-[#F8FAFC] tracking-wide truncate">
            {state.team.name || 'Anonymous Unit'}
          </div>
          <div className="text-xs text-slate-300 mt-1.5 flex flex-wrap gap-1.5 font-semibold">
            {state.team.members && state.team.members.length > 0 ? (
              state.team.members.map((m, idx) => (
                <span key={idx} className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700 text-xs text-slate-200">
                  {m}
                </span>
              ))
            ) : (
              <span className="text-slate-400">Lead Analyst</span>
            )}
          </div>
        </div>

        {/* Scoreboard Breakdown */}
        <div className="p-4 rounded-2xl border-2 border-slate-700 bg-slate-900/90 space-y-2.5 text-xs sm:text-sm font-semibold">
          <div className="flex justify-between items-center text-slate-200">
            <span>Core Levels (1–4):</span>
            <span className="font-bold text-white">{coreScore} / 32 pts</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span>Caesar Bonus:</span>
            <span className="font-bold text-amber-300">+{state.bonusScore} / 3 pts</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span>SOC Tactical Drills (24):</span>
            <span className="font-bold text-[#C084FC]">+{drillScore} / 180 pts</span>
          </div>
          <div className="flex justify-between items-center text-slate-200 pt-2 border-t border-slate-700">
            <span>Hints Deductions:</span>
            <span className="font-bold text-rose-400">-{totalHintsUsed * 2} pts</span>
          </div>
          <div className="flex justify-between items-center pt-2.5 border-t border-slate-700 text-base font-black">
            <span className="text-[#22D3EE]">TOTAL SCORE:</span>
            <span className="text-[#22D3EE] text-lg font-black">{totalScore} <span className="text-xs text-slate-300 font-normal">/ 215 PTS</span></span>
          </div>
        </div>
      </div>

      {/* 4. Master Token Vault (Core Disarm Tokens) */}
      <div className="p-6 rounded-3xl border-2 border-cyan-500/40 bg-slate-950/95 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider text-[#22D3EE] flex items-center gap-1.5">
            <Key className="w-4 h-4 text-[#22D3EE]" />
            TOKEN VAULT
          </span>
          <span className="text-xs text-slate-300 font-bold">
            {tokens.filter((t) => t.unlocked).length} / 4 RECOVERED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tokens.map((tok) => (
            <div
              key={tok.key}
              className={`p-3.5 rounded-2xl border-2 transition-all text-center ${
                tok.unlocked
                  ? 'border-emerald-400/60 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'border-slate-700 bg-slate-900/80 text-slate-500'
              }`}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 text-slate-300">
                {tok.unlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>{tok.label}</span>
              </div>
              <div className="text-sm sm:text-base font-black tracking-widest mt-1 text-white">
                {tok.unlocked ? tok.token : '••••'}
              </div>
            </div>
          ))}
        </div>

        {/* Master Override Disarm Code Preview */}
        <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-900 text-center text-xs">
          <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">Disarm Sequence Format</div>
          <div className="text-sm font-bold text-[#22D3EE] tracking-wider mt-1 select-all">
            {state.levels[1].solved ? 'SAFE' : '????'}-{state.levels[2].solved ? 'URGENCY' : '????'}-{state.levels[3].solved ? 'ARUN' : '????'}-{state.levels[4].solved ? 'MFA' : '????'}
          </div>
        </div>
      </div>

      {/* 5. Tactical Utility Actions */}
      <div className="p-5 rounded-3xl border-2 border-slate-700 bg-slate-950/95 space-y-2.5">
        <button
          type="button"
          onClick={onOpenBonus}
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 text-xs sm:text-sm font-bold tracking-wider flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CAESAR CIPHER BONUS</span>
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-black border border-amber-400/40">
            {state.bonusSolved ? '+3 PTS EARNED' : '+3 PTS'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-700 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold tracking-wider flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#22D3EE]" />
            <span>VIEW LIVE SCOREBOARD</span>
          </span>
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          className="w-full px-4 py-2.5 rounded-2xl text-slate-300 hover:text-white text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {state.soundEnabled ? <Volume2 className="w-4 h-4 text-[#22D3EE]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span>{state.soundEnabled ? 'AUDIO EFFECTS ACTIVE' : 'AUDIO MUTED'}</span>
        </button>
      </div>
    </aside>
  );
};
