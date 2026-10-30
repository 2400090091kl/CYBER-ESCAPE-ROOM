import React from 'react';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileDown, 
  ListOrdered, 
  Award, 
  Terminal, 
  BookOpen
} from 'lucide-react';
import type { GameState } from '../types';
import { cyberAudio } from '../utils/audio';

interface FinalDebriefScreenProps {
  state: GameState;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
}

export const FinalDebriefScreen: React.FC<FinalDebriefScreenProps> = ({
  state,
  onRestart,
  onOpenLeaderboard,
}) => {
  const isSuccess = !state.isTimedOut && state.finalCodeSubmitted;

  // Calculate elapsed time
  const timeElapsedSeconds = state.totalDurationSeconds - state.timeRemaining;
  const elapsedMins = Math.floor(timeElapsedSeconds / 60);
  const elapsedSecs = timeElapsedSeconds % 60;
  const formattedTimeElapsed = `${elapsedMins}m ${elapsedSecs.toString().padStart(2, '0')}s`;

  // Calculate total score
  const baseScore = 
    state.levels[1].score + 
    state.levels[2].score + 
    state.levels[3].score + 
    state.levels[4].score;
  const drillScore = Object.values(state.challengeProgress || {}).reduce(
    (acc, curr) => acc + (curr.solved ? curr.score : 0),
    0
  );
  const totalScore = baseScore + state.bonusScore + drillScore;
  const maxPossible = 215; // 32 base + 3 bonus + 180 drills

  // Total hints used across all levels
  const totalHintsUsed = 
    state.levels[1].hintsUsed + 
    state.levels[2].hintsUsed + 
    state.levels[3].hintsUsed + 
    state.levels[4].hintsUsed;
  const totalPenalty = totalHintsUsed * 2;

  // Determine Analyst Rank Badge based on score
  const getRankBadge = () => {
    if (totalScore >= 170) return { title: 'ELITE FORENSIC SPECIALIST (TIER 1)', color: 'text-amber-300 border-amber-400 bg-amber-950/60 font-black' };
    if (totalScore >= 110) return { title: 'SENIOR INCIDENT RESPONDER (TIER 2)', color: 'text-cyan-300 border-cyan-400 bg-cyan-950/60 font-black' };
    if (totalScore >= 50) return { title: 'CYBER DEFENSE ANALYST (TIER 3)', color: 'text-sky-300 border-sky-400 bg-sky-950/60 font-bold' };
    return { title: 'APPRENTICE SOC OPERATOR', color: 'text-slate-200 border-slate-500 bg-slate-900 font-bold' };
  };

  const rank = getRankBadge();

  // Export Forensic Incident Debrief as a text file
  const handleExportReport = () => {
    cyberAudio.playKeyClick();
    const reportText = `===============================================================
       FORENSIEXPLORE // OPERATION SHADOWBYTE INCIDENT DEBRIEF
               KL UNIVERSITY - VENUE R201D
===============================================================

DATE: 30 October 2026
SESSION STATUS: ${isSuccess ? 'OPERATION SUCCESSFUL // BREACH CONTAINED' : 'MISSION TIMED OUT // PROTOCOL LOCKDOWN'}
TEAM CALL SIGN: ${state.team.name}
WORKSTATION: ${state.team.stationId}
ANALYST UNIT: ${state.team.members.join(', ') || 'Anonymous Unit'}

TIMING TELEMETRY:
- Allowed Time: 60:00 (3600 seconds)
- Time Taken: ${formattedTimeElapsed}
- Time Remaining: ${Math.floor(state.timeRemaining / 60)}m ${state.timeRemaining % 60}s

SCORE MATRIX:
- Level 1 (Binary Decode): ${state.levels[1].score} / 10 pts (Hints used: ${state.levels[1].hintsUsed})
- Level 2 (Phishing Triage): ${state.levels[2].score} / 6 pts (Hints used: ${state.levels[2].hintsUsed})
- Level 3 (SIEM Log Forensics): ${state.levels[3].score} / 8 pts (Hints used: ${state.levels[3].hintsUsed})
- Level 4 (Identity Defense): ${state.levels[4].score} / 8 pts (Hints used: ${state.levels[4].hintsUsed})
- Caesar Cipher Bonus: ${state.bonusScore} / 3 pts
---------------------------------------------------------------
TOTAL SCORE: ${totalScore} / ${maxPossible} PTS
ANALYST TIER: ${rank.title}

FORENSIC TOKENS ACQUIRED:
1. Level 1: SAFE (Decoded from binary 01010011 01000001 01000110 01000101)
2. Level 2: URGENCY (Phishing vector isolated: spoofed domain + panic countdown)
3. Level 3: ARUN (Compromised account under credential brute-force)
4. Level 4: MFA (Multi-Factor Authentication defense)
MASTER DISARM KEY: SAFE-URGENCY-ARUN-MFA

EDUCATIONAL LESSONS:
- Packet Sniffing: Binary and hex representations underpin network protocols.
- Phishing Awareness: Attackers exploit emotional urgency and spoof lookalike domains.
- Log Correlation: Automated brute-force attacks generate bursts of failed logins followed by foreign IP successes.
- Defense Architecture: Passwords alone are fragile; MFA with possession factors stops credential attacks.

Verified by ForensiXplore Security Operations Center, KL University
===============================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OPERATION_SHADOWBYTE_${state.team.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_REPORT.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-8 animate-fadeIn">
      {/* Mission Outcome Hero Card */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 text-center space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
          isSuccess
            ? 'border-emerald-500/60 bg-gray-950/95 glow-green'
            : 'border-red-500/60 bg-gray-950/95 glow-red'
        }`}
      >
        <div className="inline-flex p-4 rounded-2xl bg-gray-900 border border-slate-800 shadow-inner">
          {isSuccess ? (
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
          ) : (
            <XCircle className="w-16 h-16 text-red-400 animate-pulse" />
          )}
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
            INCIDENT RESOLUTION STATUS
          </span>
          <h1
            className={`text-3xl sm:text-5xl font-black font-heading tracking-wider ${
              isSuccess ? 'text-emerald-300 text-glow-green' : 'text-red-400 text-glow-red'
            }`}
          >
            {isSuccess ? 'BREACH NEUTRALIZED // MISSION ACCOMPLISHED' : 'FAILSAFE TIMED OUT // ENCLAVE LOCKDOWN'}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-2xl mx-auto pt-1">
            {isSuccess
              ? `Congratulations Unit ${state.team.name}! All four forensic barriers were solved and the master disarm key neutralized ShadowByte-X in Lab R201D.`
              : `The 60-minute containment window elapsed before disarming the rogue system. The enclave initiated autonomous failsafe lockdown.`}
          </p>
        </div>

        {/* Tier Rank Chip */}
        <div className="pt-2">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider ${rank.color}`}>
            <Award className="w-4 h-4" />
            <span>ASSIGNED RANK: {rank.title}</span>
          </span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        {/* Score Card */}
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gray-950/90 text-center space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>FINAL MISSION SCORE</span>
          </div>
          <div className="text-4xl font-black text-cyan-300 text-glow-cyan py-1">
            {totalScore}
            <span className="text-lg text-slate-500 font-normal"> / {maxPossible}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Base: {baseScore}/32 | Bonus: +{state.bonusScore} | Hints: -{totalPenalty}
          </div>
        </div>

        {/* Time Card */}
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gray-950/90 text-center space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>COMPLETION TIME</span>
          </div>
          <div className="text-4xl font-black text-slate-100 py-1">
            {formattedTimeElapsed}
          </div>
          <div className="text-[11px] text-slate-400">
            {state.isTimedOut ? 'Hard limit 60:00 reached' : `${Math.floor(state.timeRemaining / 60)}m ${state.timeRemaining % 60}s remaining`}
          </div>
        </div>

        {/* Team Card */}
        <div className="p-5 rounded-2xl border border-cyan-500/30 bg-gray-950/90 text-center space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>TEAM IDENTITY</span>
          </div>
          <div className="text-2xl font-black text-cyan-300 truncate py-1">
            {state.team.name}
          </div>
          <div className="text-[11px] text-slate-400">
            {state.team.stationId} • {state.team.members.length} Analysts
          </div>
        </div>
      </div>

      {/* Comprehensive Score Breakdown Table */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/95 p-6 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <ListOrdered className="w-4 h-4" />
          FORENSIC SCORING & AUDIT MATRIX
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-800">
            <thead className="bg-gray-900 text-slate-400 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Stage / Objective</th>
                <th className="py-2.5 px-3">Max Pts</th>
                <th className="py-2.5 px-3">Hints Used</th>
                <th className="py-2.5 px-3">Penalty</th>
                <th className="py-2.5 px-3">Awarded Pts</th>
                <th className="py-2.5 px-3">Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-gray-950">
              <tr>
                <td className="py-2.5 px-3 text-slate-200 font-bold">Level 1: Binary ASCII Decode</td>
                <td className="py-2.5 px-3 text-slate-400">10</td>
                <td className="py-2.5 px-3 text-slate-400">{state.levels[1].hintsUsed} / 2</td>
                <td className="py-2.5 px-3 text-red-400">-{state.levels[1].hintsUsed * 2}</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">{state.levels[1].score}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">[SAFE]</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-200 font-bold">Level 2: Phishing Triage</td>
                <td className="py-2.5 px-3 text-slate-400">6</td>
                <td className="py-2.5 px-3 text-slate-400">{state.levels[2].hintsUsed} / 2</td>
                <td className="py-2.5 px-3 text-red-400">-{state.levels[2].hintsUsed * 2}</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">{state.levels[2].score}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">[URGENCY]</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-200 font-bold">Level 3: SIEM Log Forensics</td>
                <td className="py-2.5 px-3 text-slate-400">8</td>
                <td className="py-2.5 px-3 text-slate-400">{state.levels[3].hintsUsed} / 2</td>
                <td className="py-2.5 px-3 text-red-400">-{state.levels[3].hintsUsed * 2}</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">{state.levels[3].score}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">[ARUN]</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-200 font-bold">Level 4: Identity Defense (MFA)</td>
                <td className="py-2.5 px-3 text-slate-400">8</td>
                <td className="py-2.5 px-3 text-slate-400">{state.levels[4].hintsUsed} / 2</td>
                <td className="py-2.5 px-3 text-red-400">-{state.levels[4].hintsUsed * 2}</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">{state.levels[4].score}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">[MFA]</td>
              </tr>
              <tr className="bg-purple-950/20">
                <td className="py-2.5 px-3 text-purple-300 font-bold">Bonus: Caesar Cipher Cryptanalysis</td>
                <td className="py-2.5 px-3 text-purple-400">3</td>
                <td className="py-2.5 px-3 text-slate-400">-</td>
                <td className="py-2.5 px-3 text-slate-400">0</td>
                <td className="py-2.5 px-3 text-purple-300 font-bold">+{state.bonusScore}</td>
                <td className="py-2.5 px-3 text-purple-300 font-bold">{state.bonusSolved ? '[CRYPTO]' : 'Unsolved'}</td>
              </tr>
              <tr className="bg-cyan-950/20">
                <td className="py-2.5 px-3 text-[#22D3EE] font-bold">SOC Tactical Drills (24 Modules)</td>
                <td className="py-2.5 px-3 text-[#22D3EE]">180</td>
                <td className="py-2.5 px-3 text-slate-400">-</td>
                <td className="py-2.5 px-3 text-slate-400">Var</td>
                <td className="py-2.5 px-3 text-[#22D3EE] font-bold">+{drillScore}</td>
                <td className="py-2.5 px-3 text-[#22D3EE] font-bold">[24 DRILLS]</td>
              </tr>
              <tr className="bg-slate-900 font-bold text-sm">
                <td className="py-3 px-3 text-cyan-400">TOTAL COMBINED SCORE</td>
                <td className="py-3 px-3 text-slate-200">215 Max</td>
                <td className="py-3 px-3 text-slate-300">{totalHintsUsed} Total</td>
                <td className="py-3 px-3 text-red-400">-{totalPenalty}</td>
                <td className="py-3 px-3 text-cyan-300 text-glow-cyan">{totalScore} PTS</td>
                <td className="py-3 px-3 text-emerald-400">SAFE-URGENCY-ARUN-MFA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cyber Incident Debrief & Key Learnings */}
      <div className="rounded-2xl border border-slate-800 bg-gray-950/90 p-6 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          FORENSIEXPLORE INCIDENT POST-MORTEM & CORE TAKEAWAYS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-gray-900/60 space-y-1.5">
            <div className="font-bold text-slate-200 text-xs">1. Low-Level Network Forensics</div>
            <p className="text-slate-400 leading-relaxed">
              Every data frame transmitting over campus switches consists of raw binary octets. Packet sniffers (like Wireshark) decode 8-bit bytes into ASCII/Unicode protocols.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-gray-900/60 space-y-1.5">
            <div className="font-bold text-slate-200 text-xs">2. Social Engineering & Phishing</div>
            <p className="text-slate-400 leading-relaxed">
              Over 80% of security breaches begin with spear-phishing. Attackers use lookalike typosquatted domains and artificial urgency to induce panic and steal credentials.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-gray-900/60 space-y-1.5">
            <div className="font-bold text-slate-200 text-xs">3. SIEM Authentication Correlation</div>
            <p className="text-slate-400 leading-relaxed">
              Automated credential-stuffing tools generate distinct telemetry patterns: multiple rapid failed authentications immediately preceding a foreign IP success.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-gray-900/60 space-y-1.5">
            <div className="font-bold text-slate-200 text-xs">4. Multi-Factor Identity Defense</div>
            <p className="text-slate-400 leading-relaxed">
              MFA effectively thwarts credential theft. Even if an adversary captures a password through phishing, they cannot authenticate without the possession factor (FIDO2 or TOTP).
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleExportReport}
          className="px-5 py-3 rounded-xl font-mono text-xs font-bold text-slate-100 border border-cyan-500/50 bg-gray-900 hover:bg-cyan-950/40 hover:border-cyan-400 transition-all flex items-center gap-2 cursor-pointer"
        >
          <FileDown className="w-4 h-4 text-cyan-400" />
          <span>DOWNLOAD INCIDENT REPORT (.TXT)</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onOpenLeaderboard();
            }}
            className="px-5 py-3 rounded-xl font-mono text-xs font-bold text-slate-100 border border-amber-500/50 bg-amber-950/30 hover:bg-amber-900/40 hover:border-amber-400 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>VIEW LEADERBOARD</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset this station session and return to the mission briefing?')) {
                cyberAudio.playKeyClick();
                onRestart();
              }
            }}
            className="px-5 py-3 rounded-xl font-mono text-xs font-bold text-red-300 border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 hover:border-red-400 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>RESET ENCLAVE SESSION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
