import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Key, 
  Send, 
  Terminal, 
  ArrowRight, 
  AlertTriangle, 
  User, 
  Activity
} from 'lucide-react';
import type { LevelData, LogEntry } from '../../types';
import { validateLevel3 } from '../../utils/validation';
import { cyberAudio } from '../../utils/audio';
import { api } from '../../services/api';

interface Level3Props {
  levelData: LevelData;
  teamId?: string;
  onSolve: (score: number, token: string) => void;
  onRequestHint: (hintIndex: number) => void;
  onNextLevel: () => void;
}

export const Level3Logs: React.FC<Level3Props> = ({
  levelData,
  teamId,
  onSolve,
  onRequestHint,
  onNextLevel,
}) => {
  const [accountInput, setAccountInput] = useState('');
  const [selectedWhy, setSelectedWhy] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fictional SIEM Authentication Logs
  const logs: LogEntry[] = [
    {
      id: 'LOG-101',
      timestamp: '13:35:04',
      username: 'PRIYA',
      ipAddress: '10.20.1.15',
      location: 'KL Lab R201D Workstation 03',
      device: 'Windows 11 / Chrome 122',
      status: 'SUCCESS',
      action: 'SSO Login Verified',
    },
    {
      id: 'LOG-102',
      timestamp: '13:36:19',
      username: 'KOWSHIK',
      ipAddress: '10.20.1.28',
      location: 'KL Lab R201D Workstation 09',
      device: 'macOS Sonoma / Safari',
      status: 'SUCCESS',
      action: 'Lab Portal Authenticated',
    },
    {
      id: 'LOG-103',
      timestamp: '13:37:02',
      username: 'SNEHA',
      ipAddress: '10.20.1.44',
      location: 'KL Lab R201D Workstation 14',
      device: 'Ubuntu 24.04 / Firefox',
      status: 'SUCCESS',
      action: 'Single Sign-On Verified',
    },
    // Arun Attack Sequence
    {
      id: 'LOG-104',
      timestamp: '13:38:12',
      username: 'ARUN',
      ipAddress: '185.220.101.42',
      location: 'Foreign Exit Node / Unknown Host',
      device: 'Kali Linux / Automated Python',
      status: 'FAILED',
      action: 'Password rejected (Attempt 1)',
      reason: 'Bad Credentials',
    },
    {
      id: 'LOG-105',
      timestamp: '13:38:18',
      username: 'ARUN',
      ipAddress: '185.220.101.42',
      location: 'Foreign Exit Node / Unknown Host',
      device: 'Kali Linux / Automated Python',
      status: 'FAILED',
      action: 'Password rejected (Attempt 2)',
      reason: 'Bad Credentials',
    },
    {
      id: 'LOG-106',
      timestamp: '13:38:25',
      username: 'ARUN',
      ipAddress: '185.220.101.42',
      location: 'Foreign Exit Node / Unknown Host',
      device: 'Kali Linux / Automated Python',
      status: 'FAILED',
      action: 'Password rejected (Attempt 3)',
      reason: 'Bad Credentials',
    },
    {
      id: 'LOG-107',
      timestamp: '13:38:31',
      username: 'ARUN',
      ipAddress: '185.220.101.42',
      location: 'Foreign Exit Node / Unknown Host',
      device: 'Kali Linux / Automated Python',
      status: 'FAILED',
      action: 'Password rejected (Attempt 4)',
      reason: 'Bad Credentials',
    },
    {
      id: 'LOG-108',
      timestamp: '13:38:40',
      username: 'ARUN',
      ipAddress: '185.220.101.42',
      location: 'Foreign Exit Node / Unknown Host',
      device: 'Kali Linux / Unknown Session',
      status: 'SUCCESS',
      action: 'Session Token Issued (Brute Force Success)',
    },
    {
      id: 'LOG-109',
      timestamp: '13:39:15',
      username: 'VIKRAM',
      ipAddress: '10.20.1.52',
      location: 'KL Lab R201D Workstation 18',
      device: 'Windows 11 / Edge 122',
      status: 'SUCCESS',
      action: 'Intranet Portal Login',
    },
  ];

  const hints = [
    'Filter logs for multiple consecutive "FAILED" login attempts originating from the same foreign IP address (185.220.101.42).',
    'Look at the 4-letter user whose account failed 4 times in 20 seconds before suddenly succeeding from an unknown external device: ARUN.',
  ];

  // Filter logs based on user controls
  const filteredLogs = logs.filter((log) => {
    if (filterUser !== 'ALL' && log.username !== filterUser) return false;
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.username.toLowerCase().includes(term) ||
        log.ipAddress.toLowerCase().includes(term) ||
        log.location.toLowerCase().includes(term) ||
        log.device.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || levelData.solved) return;

    setIsSubmitting(true);
    cyberAudio.playKeyClick();

    const result = validateLevel3(accountInput, selectedWhy, selectedAction);

    // Sync attempt to live backend monitor
    if (teamId) {
      api.validateSubmission({
        teamId,
        level: 3,
        answer: accountInput,
        whySuspicious: selectedWhy,
        safeAction: selectedAction,
      }).catch(console.error);
    }

    if (result.isValid) {
      cyberAudio.playAccessGranted();
      setFeedback({ type: 'success', message: result.message });
      const finalScore = Math.max(0, levelData.maxPoints - levelData.hintsUsed * 2);
      onSolve(finalScore, 'ARUN');
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
              <FileText className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  STAGE 03 // SIEM LOG AUDIT
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ALLOCATION: {levelData.maxPoints} PTS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-slate-100 tracking-wide mt-1.5">
                SIEM INCIDENT FORENSICS & LOG CORRELATION
              </h2>
            </div>
          </div>

          {levelData.solved ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 text-emerald-400 font-mono text-xs font-bold glow-green">
              <CheckCircle2 className="w-4 h-4" />
              <span>TOKEN UNLOCKED: [ARUN] (+{levelData.score} PTS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-mono text-xs">
              <Key className="w-3.5 h-3.5" />
              <span>TOKEN 3 OF 4</span>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs sm:text-sm font-mono text-slate-300 space-y-2 leading-relaxed">
          <p>
            Central SOC authentication telemetries recorded during the breach window have been retrieved from the KL University authentication server. 
          </p>
          <div className="p-3 rounded-lg border border-cyan-500/20 bg-gray-900/60 text-xs text-slate-300">
            <strong className="text-cyan-400 uppercase">Mission Objective:</strong> Audit the authentication logs below to discover which account was compromised through credential brute-forcing, explain why, and execute the proper safe incident response action.
          </div>
        </div>
      </div>

      {/* SIEM Terminal Log Viewer */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/95 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)]">
        {/* Terminal Header & Filter Bar */}
        <div className="bg-gray-900 px-4 py-3 border-b border-cyan-500/30 space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">SIEM AUTHENTICATION TELEMETRY // CORRELATION ENGINE</span>
            </div>
            <span className="text-slate-400 text-[11px]">RANGE: 13:35:00 - 13:40:00 UTC</span>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, IP, device..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 bg-gray-950 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* User Filter */}
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-gray-950 font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Users</option>
              <option value="ARUN">User: ARUN</option>
              <option value="PRIYA">User: PRIYA</option>
              <option value="KOWSHIK">User: KOWSHIK</option>
              <option value="SNEHA">User: SNEHA</option>
              <option value="VIKRAM">User: VIKRAM</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-gray-950 font-mono text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="FAILED">FAILED only</option>
              <option value="SUCCESS">SUCCESS only</option>
            </select>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs divide-y divide-slate-800">
            <thead className="bg-gray-900/90 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Location / Device</th>
                <th className="py-2.5 px-3">Event Status</th>
                <th className="py-2.5 px-3">Telemetry Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-gray-950">
              {filteredLogs.map((log) => {
                const isArun = log.username === 'ARUN';
                const isFailed = log.status === 'FAILED';

                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      isArun
                        ? isFailed
                          ? 'bg-red-950/20 hover:bg-red-950/30'
                          : 'bg-amber-950/20 hover:bg-amber-950/30'
                        : 'hover:bg-gray-900/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400 font-mono whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded ${
                          isArun
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'text-slate-200'
                        }`}
                      >
                        {log.username}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                      <span className={log.ipAddress.startsWith('185.') ? 'text-amber-400 font-bold' : ''}>
                        {log.ipAddress}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                      {log.location}
                      <span className="block text-slate-500 text-[10px]">{log.device}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-500/40 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                      {log.action}
                      {log.reason && (
                        <span className="text-red-400 ml-1">({log.reason})</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Triage Form */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/90 p-6 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-6">
        <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4" />
          INCIDENT CORRELATION & RESPONSE DIRECTIVES
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Username */}
          <div className="space-y-2.5">
            <label className="block text-sm font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
              1. WHICH ACCOUNT IS SUSPICIOUS? (INPUT USERNAME) *
            </label>
            <div className="relative max-w-md">
              <input
                type="text"
                value={accountInput}
                onChange={(e) => {
                  setAccountInput(e.target.value);
                  if (feedback.type) setFeedback({ type: null, message: '' });
                }}
                placeholder="e.g. ARUN"
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-600 bg-slate-900 font-mono text-base tracking-widest text-[#F8FAFC] uppercase placeholder:text-slate-400 focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-cyan-400/40"
                maxLength={20}
                disabled={levelData.solved}
              />
              <User className="w-5 h-5 absolute right-4 top-4 text-slate-400" />
            </div>
          </div>

          {/* Question 2: Why */}
          <div className="space-y-2.5">
            <label className="block text-sm font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
              2. WHY IS THIS ACCOUNT IDENTIFIED AS COMPROMISED? *
            </label>
            <div className="space-y-3 font-mono">
              {[
                {
                  id: 'bruteforce_pattern',
                  label: 'Repeated failed logins followed by a successful login from an unknown device (credential stuffing / brute force)',
                },
                {
                  id: 'single_login',
                  label: 'Logged in from a regular university workstation during standard lab hours (Distractor)',
                },
                {
                  id: 'safari_browser',
                  label: 'Connected using an unrecognized mobile browser without failing passwords (Distractor)',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    selectedWhy === opt.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-2 ring-cyan-400/40'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="whySuspicious"
                    value={opt.id}
                    checked={selectedWhy === opt.id}
                    onChange={() => {
                      cyberAudio.playKeyClick();
                      setSelectedWhy(opt.id);
                    }}
                    disabled={levelData.solved}
                    className="w-5 h-5 accent-cyan-400"
                  />
                  <span className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 3: Remediation */}
          <div className="space-y-2.5">
            <label className="block text-sm font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
              3. WHAT IS THE SAFE IMMEDIATE INCIDENT RESPONSE ACTION? *
            </label>
            <div className="space-y-3 font-mono">
              {[
                {
                  id: 'verify_owner_investigate',
                  label: 'Verify the activity with the account owner and investigate relevant logs using authorized procedures',
                },
                {
                  id: 'ignore',
                  label: 'Ignore the event since the final login status reported SUCCESS (Distractor)',
                },
                {
                  id: 'email_password',
                  label: 'Email the plaintext password to the user asking if they were on Linux (Distractor)',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    selectedAction === opt.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-2 ring-cyan-400/40'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="safeAction"
                    value={opt.id}
                    checked={selectedAction === opt.id}
                    onChange={() => {
                      cyberAudio.playKeyClick();
                      setSelectedAction(opt.id);
                    }}
                    disabled={levelData.solved}
                    className="accent-cyan-400"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          {!levelData.solved ? (
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !accountInput.trim()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading text-sm font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'CORRELATING LOGS...' : 'CONFIRM AUDIT TRIAGE'}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>SIEM INCIDENT VERIFIED // TOKEN [ARUN] UNLOCKED</span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Account <strong className="text-emerald-300">ARUN</strong> suffered 4 rapid password brute-force failures within 28 seconds, followed by a malicious takeover from foreign proxy IP <code className="text-emerald-300">185.220.101.42</code>. Revoking sessions and resetting credentials neutralized the active foothold.
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
                  <span>PROCEED TO LEVEL 4: IDENTITY DEFENSE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>

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
