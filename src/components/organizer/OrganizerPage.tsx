import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  PlusCircle, 
  Eye, 
  EyeOff, 
  FileText, 
  Download, 
  ArrowLeft,
  RefreshCw,
  LogOut,
  Edit3,
  Award,
  Terminal,
  ChevronDown,
  ChevronUp,
  Radio,
  Search,
  Users,
  LayoutGrid,
  List
} from 'lucide-react';
import { api } from '../../services/api';
import type { OrganizerDashboardData } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface OrganizerPageProps {
  onBackToGame: () => void;
}

export const OrganizerPage: React.FC<OrganizerPageProps> = ({ onBackToGame }) => {
  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('shadowbyte_organizer_token');
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState<OrganizerDashboardData | null>(null);
  const [answerKey, setAnswerKey] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'answers' | 'teams' | 'scoreboard' | 'controls'>('teams');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live Teams Filter & View States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PLAYING' | 'REGISTERED' | 'PAUSED' | 'COMPLETED' | 'INACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'level' | 'activity' | 'name' | 'station'>('score');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Manual Score Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustTeamId, setAdjustTeamId] = useState('');
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');

  // Reset Confirmation State
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Expanded Team History Rows
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Fetch Dashboard and Answer Key
  const refreshDashboard = useCallback(async (token: string) => {
    setIsLoading(true);
    try {
      const [dashRes, keyRes] = await Promise.all([
        api.getOrganizerDashboard(token),
        api.getPrivateAnswerKey(token),
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardData(dashRes.data);
        setLastUpdated(new Date());
        setRefreshError(null);
      } else if (dashRes.error === 'Unauthorized' || dashRes.error?.includes('Unauthorized')) {
        // Token expired
        sessionStorage.removeItem('shadowbyte_organizer_token');
        setAuthToken(null);
        setLoginError('Session expired. Please log in again.');
      } else {
        setRefreshError(dashRes.error || 'Failed to sync with backend');
      }

      if (keyRes.success && keyRes.data) {
        setAnswerKey(keyRes.data);
      }
    } catch {
      setRefreshError('Network error connecting to backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll dashboard data every 2.5 seconds when authenticated
  useEffect(() => {
    if (!authToken) return;

    refreshDashboard(authToken);
    const interval = setInterval(() => {
      refreshDashboard(authToken);
    }, 2500);

    return () => clearInterval(interval);
  }, [authToken, refreshDashboard]);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLoginError('Password is required.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);
    cyberAudio.playKeyClick();

    const res = await api.organizerLogin(username, password);

    if (res.success && res.token) {
      cyberAudio.playAccessGranted();
      sessionStorage.setItem('shadowbyte_organizer_token', res.token);
      setAuthToken(res.token);
      setPassword('');
      refreshDashboard(res.token);
    } else {
      cyberAudio.playAccessDenied();
      setLoginError(res.error || 'Invalid username or password.');
    }
    setIsLoggingIn(false);
  };

  // Logout Handler
  const handleLogout = () => {
    cyberAudio.playKeyClick();
    sessionStorage.removeItem('shadowbyte_organizer_token');
    setAuthToken(null);
    setDashboardData(null);
    setAnswerKey(null);
  };

  // Event Control Actions
  const handleEventAction = async (action: string, params: Record<string, any> = {}) => {
    if (!authToken) return;
    cyberAudio.playKeyClick();

    const res = await api.sendEventControl(authToken, action, params);
    if (res.success) {
      setActionFeedback({ type: 'success', message: res.message || 'Action executed successfully.' });
      refreshDashboard(authToken);
    } else {
      setActionFeedback({ type: 'error', message: res.error || 'Failed to execute event action.' });
    }

    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Handle Manual Score Adjustment Submit
  const handleScoreAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTeamId || !adjustReason.trim()) {
      alert('Please select a team and provide an audit reason for the score adjustment.');
      return;
    }

    await handleEventAction('manual_score_adjust', {
      teamId: adjustTeamId,
      scoreDelta: adjustDelta,
      reason: adjustReason.trim(),
    });

    setAdjustModalOpen(false);
    setAdjustDelta(0);
    setAdjustReason('');
  };

  // Export Scoreboard to CSV
  const handleExportCSV = () => {
    if (!dashboardData?.scoreboard || dashboardData.scoreboard.length === 0) return;
    cyberAudio.playKeyClick();

    const headers = ['Rank', 'Team Name', 'Members', 'Station ID', 'Total Score', 'Current Level', 'Time (s)', 'Status'];
    const rows = dashboardData.scoreboard.map((t, idx) => [
      idx + 1,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.members.join('; ').replace(/"/g, '""')}"`,
      t.stationId,
      t.totalScore,
      t.currentLevel,
      t.timeElapsedSeconds,
      t.completionStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OPERATION_SHADOWBYTE_SCORES_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // VIEW A: ORGANIZER LOGIN SCREEN
  // -------------------------------------------------------------
  if (!authToken) {
    return (
      <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-mono relative overflow-hidden">
        {/* Background Grids */}
        <div className="fixed inset-0 cyber-grid pointer-events-none opacity-30"></div>
        <div className="fixed inset-0 scanlines pointer-events-none opacity-25"></div>

        <div className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-gray-950/95 p-8 shadow-[0_0_50px_rgba(0,240,255,0.2)] z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black font-heading text-cyan-400 tracking-wider">
              ORGANIZER ACCESS PORTAL
            </h1>
            <p className="text-xs text-slate-400">
              OPERATION SHADOWBYTE // FORENSIEXPLORE R201D
            </p>
          </div>

          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Server-Enforced Authentication. The Private Answer Key and event controls are cryptographically secured via signed JWT tokens.
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg border border-red-500/50 bg-red-950/50 text-red-300 text-xs flex items-center gap-2 animate-shake">
                <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                ORGANIZER USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter organizer username..."
                className="w-full px-4 py-2.5 rounded-lg border border-cyan-500/30 bg-gray-900 text-slate-100 text-sm focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                MASTER SECURITY PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter organizer password..."
                className="w-full px-4 py-2.5 rounded-lg border border-cyan-500/30 bg-gray-900 text-slate-100 text-sm focus:outline-none focus:border-cyan-400"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl font-heading text-sm font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-50 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isLoggingIn ? (
                <>
                  <Lock className="w-4 h-4 animate-spin" />
                  <span>VERIFYING CLEARANCE...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>AUTHENTICATE & ENTER DASHBOARD</span>
                </>
              )}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onBackToGame}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Participant Escape Room</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: AUTHENTICATED ORGANIZER DASHBOARD
  // -------------------------------------------------------------
  const overview = dashboardData?.overview;
  const teams = dashboardData?.liveTeams || [];
  const scoreboard = dashboardData?.scoreboard || [];

  // Timing helper
  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return 'No activity yet';
    const ms = new Date(iso).getTime();
    if (isNaN(ms)) return 'Unknown';
    const diffSec = Math.floor((Date.now() - ms) / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  const formatClockTime = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const res = {
      all: teams.length,
      playing: 0,
      registered: 0,
      paused: 0,
      completed: 0,
      inactive: 0,
    };
    for (const t of teams) {
      const s = (t.liveStatus || 'REGISTERED').toLowerCase();
      if (s === 'playing') res.playing++;
      else if (s === 'registered') res.registered++;
      else if (s === 'paused') res.paused++;
      else if (s === 'completed') res.completed++;
      else if (s === 'inactive') res.inactive++;
    }
    return res;
  }, [teams]);

  // Filtered and sorted teams
  const filteredAndSortedTeams = useMemo(() => {
    let list = [...teams];

    // Status Filter
    if (statusFilter !== 'ALL') {
      list = list.filter((t) => (t.liveStatus || 'REGISTERED') === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.stationId.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.members.some((m) => m.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'score') {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.timeElapsedSeconds - b.timeElapsedSeconds;
      }
      if (sortBy === 'level') {
        if (b.currentLevel !== a.currentLevel) return b.currentLevel - a.currentLevel;
        return b.totalScore - a.totalScore;
      }
      if (sortBy === 'activity') {
        const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return bTime - aTime;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'station') {
        return a.stationId.localeCompare(b.stationId);
      }
      return 0;
    });

    return list;
  }, [teams, statusFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 flex flex-col font-mono relative selection:bg-cyan-500 selection:text-black">
      {/* Background Grids */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-25"></div>
      <div className="fixed inset-0 scanlines pointer-events-none opacity-20"></div>

      {/* Organizer Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/40 bg-gray-950/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-400/50 text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-heading text-cyan-400 tracking-wider">
                  OPERATION SHADOWBYTE // COMMAND CONSOLE
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  PROCTOR CLEARANCE
                </span>
              </div>
              <div className="text-xs text-slate-400">
                KL University • Lab R201D • 30 Oct 2026
              </div>
            </div>
          </div>

          {/* Quick HUD Timer Capsule */}
          {overview && (
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-mono text-sm font-bold ${
                  overview.gameStatus === 'RUNNING'
                    ? 'border-cyan-500 text-cyan-300 bg-cyan-950/50 glow-cyan'
                    : overview.gameStatus === 'PAUSED'
                    ? 'border-amber-500 text-amber-300 bg-amber-950/50'
                    : 'border-slate-700 text-slate-400 bg-gray-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(overview.remainingSeconds)}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  ({overview.gameStatus})
                </span>
              </div>
            </div>
          )}

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshDashboard(authToken)}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-slate-800 bg-gray-900 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
              title="Refresh Dashboard Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={onBackToGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs border border-slate-700 bg-gray-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Participant Game</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/50 hover:border-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 z-10 flex-1">
        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 animate-fade-in ${
              actionFeedback.type === 'error'
                ? 'border-red-500/60 bg-red-950/60 text-red-200'
                : 'border-emerald-500/60 bg-emerald-950/60 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionFeedback.type === 'error' ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button
              onClick={() => setActionFeedback(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'overview', label: '1. Event Overview', icon: Clock },
            { id: 'answers', label: '2. Private Answer Key', icon: KeyRound },
            { id: 'teams', label: '3. Live Team Monitor', icon: Radio },
            { id: 'scoreboard', label: '4. Scoreboard', icon: Award },
            { id: 'controls', label: '5. Event Controls', icon: Play },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-gray-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: EVENT OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-gray-950/80 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">GAME STATUS</div>
                <div className="text-xl font-black text-cyan-300 font-heading">
                  {overview.gameStatus}
                </div>
                <div className="text-[10px] text-slate-500">
                  {overview.gameStatus === 'RUNNING' ? 'Synchronized Clock Ticking' : 'Awaiting start trigger'}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-cyan-500/30 bg-gray-950/80 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">TIME REMAINING</div>
                <div className="text-xl font-black text-slate-100 font-heading">
                  {formatTime(overview.remainingSeconds)}
                </div>
                <div className="text-[10px] text-slate-500">
                  Elapsed: {formatTime(overview.elapsedSeconds)} / 60:00
                </div>
              </div>

              <div className="p-4 rounded-xl border border-cyan-500/30 bg-gray-950/80 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">REGISTERED TEAMS</div>
                <div className="text-xl font-black text-amber-300 font-heading">
                  {overview.registeredTeams} <span className="text-xs text-slate-500">/ 20</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Active in Lab: {overview.activeTeams} units
                </div>
              </div>

              <div className="p-4 rounded-xl border border-cyan-500/30 bg-gray-950/80 space-y-1">
                <div className="text-[11px] text-slate-400 uppercase">COMPLETED / DISARMED</div>
                <div className="text-xl font-black text-emerald-400 font-heading">
                  {overview.completedTeams}
                </div>
                <div className="text-[10px] text-slate-500">
                  Success rate: {overview.registeredTeams > 0 ? Math.round((overview.completedTeams / overview.registeredTeams) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-gray-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                EVENT CONFIGURATION & SPECIFICATIONS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2 border-r border-slate-800/80 pr-4">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Event Title:</span>
                    <span className="font-bold text-slate-100">{overview.eventName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-200">{overview.eventDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Venue:</span>
                    <span className="text-cyan-300 font-bold">{overview.venue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Official Duration:</span>
                    <span className="text-slate-200">Exactly 60 Minutes (3,600s)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Organization:</span>
                    <span className="font-bold text-cyan-400">ForensiXplore Club, KL University</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Max Participants:</span>
                    <span className="text-slate-200">20 Analysts (Stations 01–20)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Scoring Ceiling:</span>
                    <span className="text-emerald-400 font-bold">32 Base + 3 Bonus = 35 Max</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Public Leaderboard Status:</span>
                    <span className={overview.showLeaderboard ? 'text-emerald-400' : 'text-amber-400'}>
                      {overview.showLeaderboard ? 'Visible to participants' : 'Hidden by organizer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRIVATE ANSWER KEY */}
        {/* ========================================================= */}
        {activeTab === 'answers' && answerKey && (
          <div className="space-y-6 animate-fade-in font-mono text-xs">
            <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/20 text-red-200 flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <strong>CONFIDENTIAL PROCTOR CHEAT SHEET:</strong> This data is restricted to authorized ForensiXplore proctors. It is securely delivered via authenticated backend session and never bundled into participant client builds.
              </div>
            </div>

            {/* Level by Level Answer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level 1 */}
              <div className="p-5 rounded-xl border border-cyan-500/40 bg-gray-900/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-400">LEVEL 1: BINARY PAYLOAD DECODE</span>
                  <span className="text-slate-400 font-bold">10 PTS</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div>
                    <span className="text-slate-500">Binary Input: </span>
                    <code className="text-cyan-300 bg-black/60 px-2 py-0.5 rounded">01010011 01000001 01000110 01000101</code>
                  </div>
                  <div>
                    <span className="text-slate-500">Correct Primary Answer: </span>
                    <strong className="text-emerald-400 text-sm">SAFE</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Acceptable Variants: </span>
                    <span className="text-slate-300">{answerKey.levels[1].acceptableVariants.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Token Awarded: </span>
                    <span className="text-emerald-400 font-bold">[SAFE]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    {answerKey.levels[1].explanation}
                  </p>
                </div>
              </div>

              {/* Level 2 */}
              <div className="p-5 rounded-xl border border-cyan-500/40 bg-gray-900/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-400">LEVEL 2: PHISHING VECTOR TRIAGE</span>
                  <span className="text-slate-400 font-bold">6 PTS</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div>
                    <span className="text-slate-500">Malicious Message: </span>
                    <strong className="text-emerald-400 text-sm">EMAIL A</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Critical Warning Signs: </span>
                    <span className="text-amber-300">Urgency, Unfamiliar Domain, Credential Request</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Token Awarded: </span>
                    <span className="text-emerald-400 font-bold">[URGENCY]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    {answerKey.levels[2].explanation}
                  </p>
                </div>
              </div>

              {/* Level 3 */}
              <div className="p-5 rounded-xl border border-cyan-500/40 bg-gray-900/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-400">LEVEL 3: SIEM LOG FORENSICS</span>
                  <span className="text-slate-400 font-bold">8 PTS</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div>
                    <span className="text-slate-500">Suspicious Account: </span>
                    <strong className="text-emerald-400 text-sm">ARUN</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Identified Reason: </span>
                    <span className="text-slate-300">Repeated failed logins followed by a successful login from an unknown device</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Safe Next Step: </span>
                    <span className="text-emerald-300">Verify the activity with the account owner and investigate relevant logs using authorized procedures</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Token Awarded: </span>
                    <span className="text-emerald-400 font-bold">[ARUN]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    {answerKey.levels[3].explanation}
                  </p>
                </div>
              </div>

              {/* Level 4 */}
              <div className="p-5 rounded-xl border border-cyan-500/40 bg-gray-900/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-400">LEVEL 4: IDENTITY DEFENSE ARCHITECTURE</span>
                  <span className="text-slate-400 font-bold">8 PTS</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div>
                    <span className="text-slate-500">Security Concept: </span>
                    <strong className="text-emerald-400 text-sm">MFA</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Acceptable Variants: </span>
                    <span className="text-slate-300">{answerKey.levels[4].acceptableVariants.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Token Awarded: </span>
                    <span className="text-emerald-400 font-bold">[MFA]</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    {answerKey.levels[4].explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Master Override & Bonus Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-emerald-500/50 bg-emerald-950/20 space-y-2">
                <span className="font-bold text-emerald-400 text-xs">MASTER DISARM SEQUENCE (ALL 4 TOKENS)</span>
                <div className="text-xl font-black font-mono tracking-widest text-emerald-300 text-glow-green select-all">
                  {answerKey.masterOverride.code}
                </div>
                <p className="text-[11px] text-slate-400">
                  {answerKey.masterOverride.explanation}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-purple-500/50 bg-purple-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-xs">OPTIONAL CAESAR BONUS</span>
                  <span className="text-purple-400 font-bold">+3 PTS</span>
                </div>
                <div>
                  <span className="text-slate-500">Ciphertext: </span>
                  <code className="text-purple-300 bg-black/60 px-2 py-0.5 rounded font-bold">FUBSWR</code>
                </div>
                <div>
                  <span className="text-slate-500">Decrypted Answer: </span>
                  <strong className="text-purple-300 text-base font-black">CRYPTO</strong>
                </div>
                <p className="text-[11px] text-slate-400">
                  {answerKey.bonusPuzzle.rule}
                </p>
              </div>
            </div>

            {/* Question Bank (24 Cyber Drills) Section */}
            {answerKey.questionBank && answerKey.questionBank.length > 0 && (
              <div className="pt-8 border-t border-slate-800 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-cyan-500/30 bg-gray-900/60">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-cyan-300 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-cyan-400" />
                      <span>QUESTION BANK: 24 CYBERSECURITY DRILLS (PRIVATE ORGANIZER KEY)</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 font-semibold">
                      Total Challenge Score: 180 PTS • 12 Beginner (5 pts) • 12 Intermediate (10 pts) • 4 Challenge Rooms
                    </p>
                  </div>

                  {/* Question Difficulty Config Selector */}
                  <div className="flex items-center gap-2 bg-gray-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 pl-2">Active Challenge Filter:</span>
                    {(['all', 'beginner', 'intermediate'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={async () => {
                          if (authToken) {
                            await api.setQuestionFilter(authToken, mode);
                            refreshDashboard(authToken);
                            setActionFeedback({ type: 'success', message: `Question filter set to ${mode.toUpperCase()}` });
                          }
                        }}
                        className={`px-3 py-1 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                          (overview as any)?.activeQuestionFilter === mode || (!overview?.activeQuestionFilter && mode === 'all')
                            ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {answerKey.questionBank.map((q: any) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border border-slate-800 bg-gray-900/70 hover:border-cyan-500/40 space-y-3 transition-colors text-xs font-mono"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-300">{q.id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                            {q.roomName}
                          </span>
                        </div>
                        <span className="text-amber-400 font-bold">{q.points} PTS ({q.difficulty})</span>
                      </div>

                      <div className="text-slate-200 font-semibold">{q.topic}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-3">{q.scenario}</p>

                      <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800/80 space-y-2">
                        <div>
                          <span className="text-slate-500">Correct Answer: </span>
                          <strong className="text-emerald-400 text-xs font-mono">
                            {Array.isArray(q.primaryAnswer) ? q.primaryAnswer.join(', ') : String(q.primaryAnswer)}
                          </strong>
                        </div>
                        {q.acceptableVariants && q.acceptableVariants.length > 0 && (
                          <div className="text-[11px] text-slate-400">
                            <span className="text-slate-500">Variants: </span>
                            <span>{q.acceptableVariants.join(' | ')}</span>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-300 pt-1">
                          <span className="text-slate-500">Explanation: </span>
                          <span>{q.explanation}</span>
                        </div>
                        {q.hint && (
                          <div className="text-[11px] text-amber-300/80 pt-1.5 border-t border-slate-800">
                            <span className="text-amber-400 font-bold">Hint (-{q.hint.penalty} pt): </span>
                            <span>{q.hint.text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LIVE TEAM MONITOR */}
        {/* ========================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-4 animate-fade-in font-mono text-xs">
            {/* Header Telemetry Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-cyan-500/30 bg-gray-900/80 shadow-[0_0_20px_rgba(0,240,255,0.08)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-cyan-300 tracking-wider">
                      LIVE ENCLAVE TELEMETRY
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                      {teams.length} / 20 REGISTERED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Real-time participant workstations in Lab R201D • Server authoritative state
                  </p>
                </div>
              </div>

              {/* Status & Sync Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-gray-950 text-[11px] text-slate-300">
                  <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${refreshError ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${refreshError ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                  </span>
                  <span>{lastUpdated ? `Synced: ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-cyan-400 font-bold">2.5s Polling</span>
                </div>

                {/* View Switcher: Cards vs Table */}
                <div className="flex items-center rounded-lg border border-slate-800 bg-gray-950 p-0.5">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Pills & Search Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-gray-900/60">
              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'ALL', count: statusCounts.all },
                  { id: 'PLAYING', label: 'PLAYING', count: statusCounts.playing },
                  { id: 'REGISTERED', label: 'REGISTERED', count: statusCounts.registered },
                  { id: 'PAUSED', label: 'PAUSED', count: statusCounts.paused },
                  { id: 'COMPLETED', label: 'COMPLETED', count: statusCounts.completed },
                  { id: 'INACTIVE', label: 'INACTIVE', count: statusCounts.inactive },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === f.id
                        ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-gray-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/60 text-slate-300">
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar & Sort Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search teams or analysts..."
                    className="w-48 sm:w-56 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 bg-gray-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 bg-gray-950 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="score">Sort: Highest Score</option>
                  <option value="level">Sort: Current Level</option>
                  <option value="activity">Sort: Recent Activity</option>
                  <option value="name">Sort: Team Name</option>
                  <option value="station">Sort: Station ID</option>
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {refreshError && (
              <div className="p-3.5 rounded-xl border border-red-500/50 bg-red-950/40 text-red-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{refreshError}. Reconnection retries active every 2.5 seconds.</span>
                </div>
                <button
                  onClick={() => refreshDashboard(authToken)}
                  className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 border border-red-500 text-white text-xs cursor-pointer"
                >
                  Reconnect Now
                </button>
              </div>
            )}

            {/* Teams Content */}
            {teams.length === 0 ? (
              <div className="p-12 rounded-2xl border border-cyan-500/30 bg-gray-900/40 text-center space-y-3">
                <div className="inline-flex p-3 rounded-2xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                  <Radio className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="font-heading text-base font-bold text-cyan-300 tracking-wide">
                  AWAITING ACTIVE ENCLAVES
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  No participant teams are currently registered on this server. Workstations 01 through 20 in Lab R201D are standing by. When participants initialize their enclaves, their live telemetry, puzzle submissions, hints, and scores will appear here in real time.
                </p>
              </div>
            ) : filteredAndSortedTeams.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-800 bg-gray-900/40 text-center text-slate-400 space-y-2">
                <div>No teams match the filter criteria (Status: {statusFilter}, Search: "{searchQuery}").</div>
                <button
                  onClick={() => { setStatusFilter('ALL'); setSearchQuery(''); }}
                  className="text-cyan-400 hover:underline text-xs cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'cards' ? (
              /* RESPONSIVE CARDS VIEW */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAndSortedTeams.map((t) => {
                  const isExpanded = expandedTeamId === t.id;
                  const lastSub = t.lastSubmission;
                  const totalHints = (t.hintsUsed[1] || 0) + (t.hintsUsed[2] || 0) + (t.hintsUsed[3] || 0) + (t.hintsUsed[4] || 0);
                  const status = t.liveStatus || 'REGISTERED';

                  return (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-slate-800 bg-gray-900/80 p-5 space-y-4 transition-all hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(0,240,255,0.08)]"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold text-xs shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                            {t.stationId}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-100">{t.name}</h4>
                              <span className="text-[10px] text-slate-500 font-mono" title="Team ID">
                                #{t.id.slice(0, 16)}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Users className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span>{t.members.length} {t.members.length === 1 ? 'Analyst' : 'Analysts'}:</span>
                              <span className="text-slate-300 font-semibold">{t.members.join(', ') || 'Anonymous'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Score Pill */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              status === 'PLAYING'
                                ? 'border-emerald-500/60 bg-emerald-950/70 text-emerald-300 animate-pulse'
                                : status === 'COMPLETED'
                                ? 'border-green-500/60 bg-green-950/70 text-green-300'
                                : status === 'PAUSED'
                                ? 'border-amber-500/60 bg-amber-950/70 text-amber-300'
                                : status === 'INACTIVE'
                                ? 'border-slate-700 bg-slate-900 text-slate-400'
                                : 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300'
                            }`}
                          >
                            ● {status}
                          </span>
                          <span className="font-black text-cyan-400 text-base font-mono">
                            {t.totalScore} PTS
                          </span>
                        </div>
                      </div>

                      {/* Level Progression Indicator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>STAGE PROGRESSION:</span>
                          <span className="font-bold text-cyan-300">
                            {t.currentLevel > 4 ? 'DISARM SEQUENCE' : `LEVEL ${t.currentLevel} OF 4`}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { num: 1, name: 'L1: BINARY', score: t.scores[1] },
                            { num: 2, name: 'L2: PHISH', score: t.scores[2] },
                            { num: 3, name: 'L3: SIEM', score: t.scores[3] },
                            { num: 4, name: 'L4: MFA', score: t.scores[4] },
                            { num: 5, name: 'BONUS', score: t.bonusSolved ? t.scores.bonus : 0, isBonus: true },
                          ].map((lvl) => {
                            const isSolved = lvl.isBonus ? t.bonusSolved : t.currentLevel > lvl.num || (lvl.num === 4 && t.completionStatus === 'SUCCESS');
                            const isCurrent = !lvl.isBonus && t.currentLevel === lvl.num;

                            return (
                              <div
                                key={lvl.num}
                                className={`p-1.5 rounded-lg border text-center transition-all ${
                                  isSolved
                                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                                    : isCurrent
                                    ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300 animate-pulse'
                                    : 'border-slate-800 bg-gray-950/60 text-slate-600'
                                }`}
                              >
                                <div className="text-[10px] font-bold">{lvl.name}</div>
                                <div className="text-[10px]">
                                  {isSolved ? `+${lvl.score} PTS` : isCurrent ? 'ACTIVE' : 'LOCKED'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Telemetry Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl border border-slate-800/80 bg-gray-950/60 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">START TIME</span>
                          <span className="text-slate-200 font-semibold">{formatClockTime(t.startedAt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">ELAPSED TIME</span>
                          <span className="text-slate-200 font-semibold">
                            {Math.floor(t.timeElapsedSeconds / 60)}m {(t.timeElapsedSeconds % 60).toString().padStart(2, '0')}s
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">HINTS USED</span>
                          <span className={totalHints > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                            {totalHints} ({totalHints * -2} pts)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">LAST ACTIVITY</span>
                          <span className="text-cyan-300 font-semibold">{formatRelativeTime(t.lastActiveAt)}</span>
                        </div>
                      </div>

                      {/* Completion Time Badge if completed */}
                      {t.completedAt && (
                        <div className="p-2 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            MISSION COMPLETED:
                          </span>
                          <span>
                            {formatClockTime(t.completedAt)} ({Math.floor(t.timeElapsedSeconds / 60)}m {t.timeElapsedSeconds % 60}s)
                          </span>
                        </div>
                      )}

                      {/* Last Submission Row */}
                      <div className="p-2.5 rounded-lg bg-gray-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                          <span className="text-slate-500 shrink-0">Last Attempt:</span>
                          {lastSub ? (
                            <>
                              <code className="text-slate-200 bg-gray-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                                {lastSub.answerText}
                              </code>
                              {lastSub.isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  CORRECT (L{lastSub.level})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-400 font-bold shrink-0">
                                  <XCircle className="w-3.5 h-3.5" />
                                  INCORRECT (L{lastSub.level})
                                </span>
                              )}
                              <span className="text-slate-400 text-[10px] truncate max-w-xs">{lastSub.message}</span>
                            </>
                          ) : (
                            <span className="text-slate-500 italic">No submissions yet (Awaiting answer)</span>
                          )}
                        </div>

                        {/* Expand history button */}
                        <button
                          onClick={() => setExpandedTeamId(isExpanded ? null : t.id)}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <span>{t.submissionHistory.length} Attempts</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Expanded History Drawer */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] animate-fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">
                              Submission Audit Log:
                            </span>
                            <button
                              onClick={() => {
                                setAdjustTeamId(t.id);
                                setAdjustModalOpen(true);
                              }}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Manual Score Adjustment</span>
                            </button>
                          </div>

                          {t.submissionHistory.length === 0 ? (
                            <div className="text-slate-600 italic">No submissions recorded.</div>
                          ) : (
                            t.submissionHistory.map((sub, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded bg-gray-950 border border-slate-800/80"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 font-mono font-bold">L{sub.level}</span>
                                  <code className="text-slate-200 bg-gray-900 px-2 py-0.5 rounded border border-slate-800">
                                    {sub.answerText}
                                  </code>
                                  <span className={sub.isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                    [{sub.status}]
                                  </span>
                                  {sub.scoreDelta > 0 && (
                                    <span className="text-cyan-300 font-bold">+{sub.scoreDelta} PTS</span>
                                  )}
                                </div>
                                <span className="text-slate-500 text-[10px]">
                                  {formatClockTime(sub.timestamp)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-gray-900/60">
                <table className="w-full text-left divide-y divide-slate-800 text-xs">
                  <thead className="bg-gray-900 text-slate-400 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Station</th>
                      <th className="py-3 px-3">Team Call Sign & ID</th>
                      <th className="py-3 px-3">Analysts</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Level</th>
                      <th className="py-3 px-3 text-center">Score</th>
                      <th className="py-3 px-3 text-center">Hints</th>
                      <th className="py-3 px-3">Elapsed</th>
                      <th className="py-3 px-3">Last Active</th>
                      <th className="py-3 px-3">Completed At</th>
                      <th className="py-3 px-3">Last Attempt</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-gray-950 font-mono">
                    {filteredAndSortedTeams.map((t) => {
                      const totalHints = (t.hintsUsed[1] || 0) + (t.hintsUsed[2] || 0) + (t.hintsUsed[3] || 0) + (t.hintsUsed[4] || 0);
                      const status = t.liveStatus || 'REGISTERED';
                      const lastSub = t.lastSubmission;

                      return (
                        <tr key={t.id} className="hover:bg-gray-900/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                              {t.stationId}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-100">{t.name}</div>
                            <div className="text-[10px] text-slate-500">#{t.id.slice(0, 16)}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            <div>{t.members.length} {t.members.length === 1 ? 'Player' : 'Players'}</div>
                            <div className="text-[10px] text-slate-500">{t.members.join(', ')}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                status === 'PLAYING'
                                  ? 'border-emerald-500/60 bg-emerald-950/70 text-emerald-300 animate-pulse'
                                  : status === 'COMPLETED'
                                  ? 'border-green-500/60 bg-green-950/70 text-green-300'
                                  : status === 'PAUSED'
                                  ? 'border-amber-500/60 bg-amber-950/70 text-amber-300'
                                  : status === 'INACTIVE'
                                  ? 'border-slate-700 bg-slate-900 text-slate-400'
                                  : 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-cyan-300">
                              {t.currentLevel > 4 ? 'DISARM' : `L${t.currentLevel}`}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-black text-cyan-400">
                            {t.totalScore}
                          </td>
                          <td className="py-3 px-3 text-center text-amber-400">
                            {totalHints > 0 ? `${totalHints} (-${totalHints * 2})` : '0'}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {Math.floor(t.timeElapsedSeconds / 60)}m {(t.timeElapsedSeconds % 60).toString().padStart(2, '0')}s
                          </td>
                          <td className="py-3 px-3 text-cyan-300">
                            {formatRelativeTime(t.lastActiveAt)}
                          </td>
                          <td className="py-3 px-3 text-emerald-400">
                            {formatClockTime(t.completedAt)}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {lastSub ? (
                              <div className="flex items-center gap-1.5">
                                <code className="bg-gray-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                                  {lastSub.answerText}
                                </code>
                                <span className={lastSub.isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                  [{lastSub.status}]
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-600 italic">None</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setAdjustTeamId(t.id);
                                setAdjustModalOpen(true);
                              }}
                              className="px-2 py-1 rounded border border-slate-700 bg-gray-900 hover:border-cyan-400 hover:text-cyan-300 text-[10px] cursor-pointer"
                            >
                              Adjust Score
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SCOREBOARD */}
        {/* ========================================================= */}
        {activeTab === 'scoreboard' && (
          <div className="space-y-4 animate-fade-in font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="font-bold">OFFICIAL SCOREBOARD (SORTED BY SCORE & EFFICIENCY)</span>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-gray-900 text-cyan-300 hover:bg-cyan-950/60 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>EXPORT CSV SPREADSHEET</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-gray-900/50">
              <table className="w-full text-left divide-y divide-slate-800">
                <thead className="bg-gray-900 text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Team Call Sign</th>
                    <th className="py-3 px-3">Station</th>
                    <th className="py-3 px-3 text-center">R1 (10)</th>
                    <th className="py-3 px-3 text-center">R2 (6)</th>
                    <th className="py-3 px-3 text-center">R3 (8)</th>
                    <th className="py-3 px-3 text-center">R4 (8)</th>
                    <th className="py-3 px-3 text-center">Bonus (+3)</th>
                    <th className="py-3 px-3 text-center">Hints</th>
                    <th className="py-3 px-3">Total Score</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-gray-950">
                  {scoreboard.map((t, idx) => {
                    const totalHints = t.hintsUsed[1] + t.hintsUsed[2] + t.hintsUsed[3] + t.hintsUsed[4];
                    return (
                      <tr key={t.id} className="hover:bg-gray-900/40 transition-colors">
                        <td className="py-3 px-3 font-black text-amber-400">#{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-100">{t.name}</td>
                        <td className="py-3 px-3 text-slate-400">{t.stationId}</td>
                        <td className="py-3 px-3 text-center text-cyan-300">{t.scores[1]}</td>
                        <td className="py-3 px-3 text-center text-cyan-300">{t.scores[2]}</td>
                        <td className="py-3 px-3 text-center text-cyan-300">{t.scores[3]}</td>
                        <td className="py-3 px-3 text-center text-cyan-300">{t.scores[4]}</td>
                        <td className="py-3 px-3 text-center text-purple-400 font-bold">
                          {t.bonusSolved ? `+${t.scores.bonus}` : '0'}
                        </td>
                        <td className="py-3 px-3 text-center text-red-400">
                          {totalHints > 0 ? `-${totalHints * 2}` : '0'}
                        </td>
                        <td className="py-3 px-3 font-black text-cyan-400 text-sm">
                          {t.totalScore} PTS
                        </td>
                        <td className="py-3 px-3 text-slate-300">{formatTime(t.timeElapsedSeconds)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              t.completionStatus === 'SUCCESS'
                                ? 'border-emerald-500/50 bg-emerald-950 text-emerald-400'
                                : t.completionStatus === 'TIMED_OUT'
                                ? 'border-red-500/50 bg-red-950 text-red-400'
                                : 'border-slate-700 bg-gray-900 text-slate-400'
                            }`}
                          >
                            {t.completionStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: EVENT CONTROLS */}
        {/* ========================================================= */}
        {activeTab === 'controls' && overview && (
          <div className="space-y-6 animate-fade-in font-mono text-xs">
            {/* Timer Control Panel */}
            <div className="p-5 rounded-2xl border border-cyan-500/40 bg-gray-900/80 space-y-4">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                CENTRAL TIMER SYNCHRONIZATION CONTROLS
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleEventAction('start')}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START 60:00 CLOCK</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEventAction('pause')}
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-black" />
                  <span>PAUSE COUNTDOWN</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEventAction('resume')}
                  className="px-5 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>RESUME COUNTDOWN</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEventAction('add_time', { seconds: 300 })}
                  className="px-4 py-2.5 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+5 MINUTES</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEventAction('add_time', { seconds: 600 })}
                  className="px-4 py-2.5 rounded-xl border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+10 MINUTES</span>
                </button>
              </div>
            </div>

            {/* Score Correction & Proctor Interventions */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-gray-900/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                MANUAL SCORE AUDIT & INTERVENTION
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-cyan-500/50 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/60 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Manual Score Correction (With Reason)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleEventAction('toggle_leaderboard', {
                      showLeaderboard: !overview.showLeaderboard,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-gray-950 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {overview.showLeaderboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>
                    {overview.showLeaderboard ? 'Hide Public Leaderboard' : 'Reveal Public Leaderboard'}
                  </span>
                </button>
              </div>
            </div>

            {/* Destructive Action: Reset Event Data */}
            <div className="p-5 rounded-2xl border border-red-500/40 bg-red-950/20 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>DESTRUCTIVE ACTION: RESET EVENT & CLEAR ALL TEAMS</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Clears all registered teams, submissions, audit trails, and resets the 60-minute countdown timer back to the 3:50 PM start state. Requires explicit confirmation.
              </p>

              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-lg border border-red-500/50 bg-red-950/60 text-red-300 hover:bg-red-900/80 font-bold transition-colors cursor-pointer"
                >
                  RESET EVENT DATA...
                </button>
              ) : (
                <div className="p-3.5 rounded-xl border border-red-500 bg-red-950/80 space-y-2">
                  <div className="text-red-200 font-bold">
                    ⚠️ ARE YOU 100% SURE? All participant scores in Lab R201D will be erased.
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleEventAction('reset', { confirm: true });
                        setShowResetConfirm(false);
                      }}
                      className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                    >
                      CONFIRM RESET ALL DATA
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 rounded border border-slate-700 text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Manual Score Adjustment Modal */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono text-xs">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-gray-950 p-6 shadow-[0_0_40px_rgba(0,240,255,0.2)] space-y-4">
            <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              MANUAL SCORE ADJUSTMENT
            </h3>

            <form onSubmit={handleScoreAdjustSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">SELECT TARGET TEAM *</label>
                <select
                  value={adjustTeamId}
                  onChange={(e) => setAdjustTeamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-gray-900 text-slate-100"
                  required
                >
                  <option value="">-- Choose Team --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.stationId}) - Currently {t.totalScore} pts
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">
                  POINT DELTA (+ or -) *
                </label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. 5 or -2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-gray-900 text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">AUDIT REASON *</label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Workstation network disconnect compensation; verified manual decrypt."
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-gray-900 text-slate-100 h-20 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold"
                >
                  Apply Correction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
