import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Search,
  Filter,
  Flame,
  ArrowRight,
  Clock,
  Award,
  Check
} from 'lucide-react';
import type { PublicQuestion, TeamChallengeState } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface ChallengeMatrixProps {
  teamId?: string;
  challengeProgress: Record<string, TeamChallengeState>;
  onUpdateProgress: (questionId: string, state: TeamChallengeState, scoreDelta: number) => void;
  onSwitchToCore?: () => void;
}

export const ChallengeMatrix: React.FC<ChallengeMatrixProps> = ({
  teamId,
  challengeProgress,
  onUpdateProgress,
  onSwitchToCore,
}) => {
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<string>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<'all' | 'BEGINNER' | 'INTERMEDIATE'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive inputs per question: { [questionId]: string | string[] }
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, { type: 'success' | 'error' | null; message: string }>>({});
  const [hintConfirmId, setHintConfirmId] = useState<string | null>(null);

  // Fetch public question bank from server
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    api.getQuestions()
      .then((res) => {
        if (isMounted && res.success && res.questions) {
          setQuestions(res.questions);
        }
      })
      .catch((err) => console.error('Failed to load questions', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter questions based on selected room, difficulty, and search term
  const filteredQuestions = questions.filter((q) => {
    if (activeRoom !== 'all' && q.room !== activeRoom) return false;
    if (activeDifficulty !== 'all' && q.difficulty !== activeDifficulty) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTopic = q.topic.toLowerCase().includes(query);
      const matchScenario = q.scenario.toLowerCase().includes(query);
      const matchQuestion = q.question.toLowerCase().includes(query);
      if (!matchTopic && !matchScenario && !matchQuestion) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalQuestions = questions.length || 24;
  const solvedQuestions = Object.values(challengeProgress).filter((p) => p.solved).length;
  const remainingQuestions = Math.max(0, totalQuestions - solvedQuestions);
  const totalScoreEarned = Object.values(challengeProgress).reduce((acc, curr) => acc + (curr.solved ? curr.score : 0), 0);
  const maxPossibleScore = questions.reduce((acc, q) => acc + q.points, 0) || 180;

  const beginnerQuestions = questions.filter((q) => q.difficulty === 'BEGINNER');
  const beginnerCount = beginnerQuestions.length || 12;
  const beginnerSolved = beginnerQuestions.filter((q) => challengeProgress[q.id]?.solved).length;

  const intermediateQuestions = questions.filter((q) => q.difficulty === 'INTERMEDIATE');
  const intermediateCount = intermediateQuestions.length || 12;
  const intermediateSolved = intermediateQuestions.filter((q) => challengeProgress[q.id]?.solved).length;

  // Handle single selection (Multiple Choice / Scenario)
  const handleSelectOption = (questionId: string, optionId: string) => {
    cyberAudio.playKeyClick();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Handle multi-selection (Select All That Apply)
  const handleToggleSelectAll = (questionId: string, optionId: string) => {
    cyberAudio.playKeyClick();
    setAnswers((prev) => {
      const current: string[] = Array.isArray(prev[questionId]) ? prev[questionId] : [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [questionId]: updated,
      };
    });
  };

  // Handle short answer input change
  const handleTextChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  // Submit Answer
  const handleSubmitAnswer = async (question: PublicQuestion) => {
    const rawAnswer = answers[question.id];
    if (!rawAnswer || (Array.isArray(rawAnswer) && rawAnswer.length === 0)) {
      setFeedback((prev) => ({
        ...prev,
        [question.id]: { type: 'error', message: 'Please select or enter an answer before submitting.' },
      }));
      return;
    }

    setSubmittingId(question.id);
    cyberAudio.playKeyClick();

    try {
      const res = await api.submitQuestion(teamId || 'local', question.id, rawAnswer);
      if (res.isValid) {
        cyberAudio.playAccessGranted();
        setFeedback((prev) => ({
          ...prev,
          [question.id]: { type: 'success', message: res.message },
        }));

        const existingState = challengeProgress[question.id];
        const updatedState: TeamChallengeState = {
          solved: true,
          score: res.scoreAwarded,
          hintUsed: existingState?.hintUsed || false,
          revealedHintText: existingState?.revealedHintText,
          answeredAt: new Date().toISOString(),
          lastAnswer: Array.isArray(rawAnswer) ? rawAnswer.join(', ') : String(rawAnswer),
          explanation: res.explanation,
        };

        onUpdateProgress(question.id, updatedState, res.scoreAwarded);
      } else {
        cyberAudio.playAccessDenied();
        setFeedback((prev) => ({
          ...prev,
          [question.id]: { type: 'error', message: res.message || 'Incorrect determination. Review the forensic indicators and retry.' },
        }));
      }
    } catch {
      setFeedback((prev) => ({
        ...prev,
        [question.id]: { type: 'error', message: 'Network error transmitting solution. Please retry.' },
      }));
    } finally {
      setSubmittingId(null);
    }
  };

  // Request Hint
  const handleConfirmHint = async (question: PublicQuestion) => {
    setHintConfirmId(null);
    cyberAudio.playKeyClick();

    try {
      const res = await api.requestQuestionHint(teamId || 'local', question.id);
      if (res.success && res.hintText) {
        const existing = challengeProgress[question.id] || { solved: false, score: 0, hintUsed: false };
        const updatedState: TeamChallengeState = {
          ...existing,
          hintUsed: true,
          revealedHintText: res.hintText,
        };
        onUpdateProgress(question.id, updatedState, 0);
      }
    } catch {
      console.error('Failed to request hint');
    }
  };

  const roomLabels: Record<string, { name: string; tag: string; border: string; accent: string }> = {
    alpha: { name: 'Room Alpha', tag: 'Social Engineering & Phishing', border: 'border-cyan-500/40', accent: 'text-cyan-400' },
    bravo: { name: 'Room Bravo', tag: 'Password & Identity Security', border: 'border-purple-500/40', accent: 'text-purple-400' },
    charlie: { name: 'Room Charlie', tag: 'SOC Forensics & Incident Response', border: 'border-amber-500/40', accent: 'text-amber-400' },
    delta: { name: 'Room Delta', tag: 'Application & Network Security', border: 'border-emerald-500/40', accent: 'text-emerald-400' },
  };

  // Check room status
  const getRoomStats = (roomKey: 'alpha' | 'bravo' | 'charlie' | 'delta') => {
    const rQs = questions.filter((q) => q.room === roomKey);
    const count = rQs.length || 6;
    const solved = rQs.filter((q) => challengeProgress[q.id]?.solved).length;
    const isCompleted = count > 0 && solved === count;
    return { count, solved, isCompleted };
  };

  const activeRoomMeta = activeRoom !== 'all' ? roomLabels[activeRoom] : null;
  const activeRoomStats = activeRoom !== 'all' ? getRoomStats(activeRoom as any) : null;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner & Enclave HUD Header */}
      <div className="rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-r from-gray-950 via-slate-900 to-indigo-950/50 p-6 sm:p-8 lg:p-10 shadow-[0_0_60px_rgba(0,240,255,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold tracking-widest uppercase bg-cyan-500/20 text-[#22D3EE] border-2 border-cyan-400/50 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#22D3EE]" />
                SOC TACTICAL DRILLS (24 MODULES)
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold tracking-widest uppercase bg-purple-500/20 text-[#C084FC] border-2 border-purple-400/50">
                4 SPECIALIZED CYBER ENCLAVES
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F8FAFC] tracking-wide font-mono flex items-center gap-3">
              <span>CYBER DEFENSE CHALLENGE MATRIX</span>
              <Sparkles className="w-8 h-8 text-[#22D3EE] hidden sm:inline-block animate-pulse" />
            </h1>
            <p className="text-base sm:text-lg text-[#CBD5E1] font-mono max-w-3xl leading-relaxed">
              ForensiXplore interactive cybersecurity challenge modules across 4 specialized tactical enclaves. Investigate threat vectors, audit identity protocols, parse SIEM forensics, and defend application infrastructure.
            </p>

            {/* Pacing Guide Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono text-slate-300">
              <span className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-[#CBD5E1] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#22D3EE]" />
                <span className="font-semibold text-white">Suggested 60m Pacing:</span>
                <span>15m Core Levels</span>
                <span className="text-slate-500">•</span>
                <span className="text-[#22D3EE] font-bold">35m 24 SOC Drills</span>
                <span className="text-slate-500">•</span>
                <span>10m Override & Bonus</span>
              </span>
            </div>
          </div>

          {/* Quick Stats Pill & Switch to Core Mission */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="p-5 rounded-2xl border-2 border-cyan-500/40 bg-slate-900/90 text-center min-w-[200px] shadow-lg">
              <div className="text-xs font-mono text-[#CBD5E1] uppercase font-bold tracking-wider">Drills Score Earned</div>
              <div className="text-3xl lg:text-4xl font-black text-[#22D3EE] font-mono mt-1">
                {totalScoreEarned} <span className="text-base text-slate-300 font-normal">/ {maxPossibleScore} PTS</span>
              </div>
              <div className="text-xs font-mono text-emerald-300 mt-2 flex items-center justify-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{solvedQuestions} of {totalQuestions} Solved</span>
              </div>
            </div>

            {onSwitchToCore && (
              <button
                type="button"
                onClick={onSwitchToCore}
                className="px-6 py-5 rounded-2xl border-2 border-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/80 text-[#22D3EE] font-mono font-black text-sm tracking-widest flex items-center justify-center gap-2.5 transition-all hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] cursor-pointer"
              >
                <span>RETURN TO CORE MISSION</span>
                <ArrowRight className="w-5 h-5 text-[#22D3EE]" />
              </button>
            )}
          </div>
        </div>

        {/* Detailed Telemetry Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs font-mono text-slate-300">Total Solved / Remaining</div>
            <div className="text-lg font-bold font-mono text-[#F8FAFC] mt-0.5">
              <span className="text-emerald-400">{solvedQuestions}</span> Solved <span className="text-slate-400">/ {remainingQuestions} Left</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs font-mono text-slate-300">Beginner Drills (5 pts)</div>
            <div className="text-lg font-bold font-mono text-[#22D3EE] mt-0.5">
              {beginnerSolved} / {beginnerCount} <span className="text-xs text-slate-400 font-normal">({beginnerSolved * 5} pts)</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs font-mono text-slate-300">Intermediate Drills (10 pts)</div>
            <div className="text-lg font-bold font-mono text-[#C084FC] mt-0.5">
              {intermediateSolved} / {intermediateCount} <span className="text-xs text-slate-400 font-normal">({intermediateSolved * 10} pts)</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs font-mono text-slate-300">Overall Drills Completion</div>
            <div className="text-lg font-bold font-mono text-emerald-300 mt-0.5">
              {totalQuestions > 0 ? Math.round((solvedQuestions / totalQuestions) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Tactical Progress Meter */}
        <div className="mt-4 space-y-2">
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(34,211,238,0.6)]"
              style={{ width: `${totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Room Completion Notification Banner */}
      {activeRoomStats?.isCompleted && (
        <div className="p-6 rounded-3xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 shadow-[0_0_35px_rgba(16,185,129,0.3)] flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">ENCLAVE SECURED</div>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#F8FAFC]">
                {activeRoomMeta?.name}: ALL {activeRoomStats.count} THREAT VECTORS NEUTRALIZED!
              </h2>
              <p className="text-sm font-mono text-[#CBD5E1]">
                Full enclave mastery achieved (+45 Points awarded). Proceed to next room or return to the Core Mission.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-mono text-xs font-bold uppercase tracking-wider shrink-0 hidden sm:inline-block">
            100% COMPLETE
          </span>
        </div>
      )}

      {/* Navigation Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-2xl border-2 border-slate-700 bg-slate-950/90 backdrop-blur-md shadow-lg">
        {/* Room Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveRoom('all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider transition-all cursor-pointer ${
              activeRoom === 'all'
                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.5)] font-black'
                : 'bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700'
            }`}
          >
            All Rooms ({questions.length})
          </button>
          {(['alpha', 'bravo', 'charlie', 'delta'] as const).map((r) => {
            const count = questions.filter((q) => q.room === r).length;
            const solvedCount = questions.filter((q) => q.room === r && challengeProgress[q.id]?.solved).length;
            const info = roomLabels[r];
            const isFinished = count > 0 && solvedCount === count;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRoom(r)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeRoom === r
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] font-black'
                    : 'bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700'
                }`}
              >
                <span>{info.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isFinished ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {isFinished ? '✓ 6/6' : `${solvedCount}/${count}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Difficulty & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700">
            <Filter className="w-4 h-4 text-[#22D3EE]" />
            <select
              value={activeDifficulty}
              onChange={(e) => setActiveDifficulty(e.target.value as any)}
              aria-label="Filter questions by difficulty"
              className="bg-transparent text-xs sm:text-sm font-mono text-white font-semibold outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-950 text-white">All Levels ({totalQuestions})</option>
              <option value="BEGINNER" className="bg-slate-950 text-white">Beginner (5 pts)</option>
              <option value="INTERMEDIATE" className="bg-slate-950 text-white">Intermediate (10 pts)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-700 text-xs sm:text-sm font-mono text-white placeholder:text-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="p-16 text-center space-y-4">
          <div className="inline-block w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-base font-mono text-slate-200 font-bold">Synchronizing ForensiXplore 24-Question Bank Telemetry...</div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border-2 border-slate-800 bg-slate-950/70 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-xl font-mono font-bold text-white">No matching cybersecurity drills found</h3>
          <p className="text-sm font-mono text-slate-300">Adjust your room filter or clear your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredQuestions.map((q, index) => {
            const prog = challengeProgress[q.id];
            const isSolved = prog?.solved || false;
            const hintRevealed = prog?.revealedHintText;
            const currentFeedback = feedback[q.id];
            const roomMeta = roomLabels[q.room] || { name: q.roomName, tag: q.topic, border: 'border-cyan-500/40', accent: 'text-cyan-400' };

            return (
              <div
                key={q.id}
                id={q.id}
                className={`rounded-3xl border-2 transition-all duration-300 p-6 sm:p-8 lg:p-10 space-y-6 ${
                  isSolved
                    ? 'border-emerald-500/50 bg-gradient-to-b from-slate-950 via-emerald-950/20 to-slate-950 shadow-[0_0_35px_rgba(16,185,129,0.2)]'
                    : 'border-slate-700 bg-slate-950/95 hover:border-cyan-500/50 shadow-[0_0_35px_rgba(0,0,0,0.8)]'
                }`}
              >
                {/* Header: Badges & Points */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-black uppercase tracking-wider bg-slate-900 border border-slate-600 text-white">
                      DRILL #{index + 1}: {q.id}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-bold uppercase tracking-wider bg-purple-950/70 border border-purple-500/50 text-[#C084FC]">
                      {roomMeta.name}: {q.topic}
                    </span>
                    <span
                      className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-black uppercase tracking-wider ${
                        q.difficulty === 'BEGINNER'
                          ? 'bg-cyan-950/70 border border-cyan-400/50 text-[#22D3EE]'
                          : 'bg-amber-950/70 border border-amber-400/50 text-amber-300'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm sm:text-base font-mono font-black text-[#22D3EE] flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#22D3EE]" />
                      <span>{q.points} POINTS</span>
                    </div>

                    {isSolved && (
                      <span className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-black tracking-wider bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>SOLVED (+{prog.score} PTS)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Scenario Briefing Card - High Contrast */}
                <div className="rounded-2xl border-2 border-slate-700 bg-slate-900/90 p-5 sm:p-6 space-y-3 font-mono">
                  <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#22D3EE] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>FORENSIC SCENARIO TELEMETRY:</span>
                  </div>
                  <p className="whitespace-pre-line text-[#CBD5E1] text-base sm:text-lg leading-relaxed">
                    {q.scenario}
                  </p>
                </div>

                {/* Question Prompt - Bright White & Large Font */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#C084FC]">
                    INVESTIGATION PROMPT:
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-mono text-[#F8FAFC] leading-relaxed tracking-wide">
                    {q.question}
                  </h3>
                </div>

                {/* Answer Options / Input Area */}
                {!isSolved && (
                  <div className="space-y-5 pt-2">
                    {/* Multiple Choice / Scenario Selection */}
                    {(q.format === 'MULTIPLE_CHOICE' || q.format === 'SCENARIO' || q.format === 'INVESTIGATION') && q.options && (
                      <div className="grid grid-cols-1 gap-3.5">
                        {q.options.map((opt) => {
                          const isSelected = answers[q.id] === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt.id)}
                              className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 font-mono text-base sm:text-lg flex items-start gap-4 cursor-pointer group ${
                                isSelected
                                  ? 'border-[#22D3EE] bg-cyan-950/60 text-white ring-2 ring-[#22D3EE]/50 shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                                  : 'border-slate-700 bg-slate-900/80 text-[#F8FAFC] hover:border-slate-500 hover:bg-slate-800/90'
                              }`}
                            >
                              <span
                                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border-2 transition-transform duration-150 ${
                                  isSelected
                                    ? 'bg-[#22D3EE] text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)] scale-105'
                                    : 'bg-slate-800 text-white border-slate-500 group-hover:border-slate-400'
                                }`}
                              >
                                {opt.label}
                              </span>
                              <span className="pt-1.5 leading-relaxed text-slate-100 font-medium">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Select All That Apply */}
                    {q.format === 'SELECT_ALL' && q.options && (
                      <div className="space-y-3.5">
                        <div className="text-sm font-mono text-slate-300 font-semibold">
                          (Select all applicable options before transmitting):
                        </div>
                        <div className="grid grid-cols-1 gap-3.5">
                          {q.options.map((opt) => {
                            const isSelected = Array.isArray(answers[q.id]) && answers[q.id].includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleToggleSelectAll(q.id, opt.id)}
                                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 font-mono text-base sm:text-lg flex items-start gap-4 cursor-pointer group ${
                                  isSelected
                                    ? 'border-[#C084FC] bg-purple-950/60 text-white ring-2 ring-[#C084FC]/50 shadow-[0_0_25px_rgba(192,132,252,0.25)]'
                                    : 'border-slate-700 bg-slate-900/80 text-[#F8FAFC] hover:border-slate-500 hover:bg-slate-800/90'
                                }`}
                              >
                                <span
                                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 border-2 transition-transform duration-150 ${
                                    isSelected
                                      ? 'bg-[#C084FC] text-slate-950 border-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.6)] scale-105'
                                      : 'bg-slate-800 text-white border-slate-500 group-hover:border-slate-400'
                                  }`}
                                >
                                  {isSelected ? <Check className="w-6 h-6 stroke-[3]" /> : opt.label.slice(0, 2)}
                                </span>
                                <span className="pt-1.5 leading-relaxed text-slate-100 font-medium">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Short Answer Input */}
                    {q.format === 'SHORT_ANSWER' && (
                      <div className="space-y-2.5">
                        <label className="text-sm font-mono text-slate-200 font-bold">
                          Enter your forensic determination (case-insensitive):
                        </label>
                        <input
                          type="text"
                          value={answers[q.id] || ''}
                          onChange={(e) => handleTextChange(q.id, e.target.value)}
                          placeholder="Type forensic answer here..."
                          className="w-full bg-slate-950 border-2 border-slate-600 focus:border-[#22D3EE] focus:ring-2 focus:ring-cyan-400/40 rounded-2xl px-6 py-4 font-mono text-base sm:text-lg text-white outline-none placeholder:text-slate-400 tracking-wider shadow-inner"
                        />
                      </div>
                    )}

                    {/* Action Bar: Submit & Request Hint */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
                      <div>
                        {q.hasHint && !hintRevealed && (
                          <button
                            type="button"
                            onClick={() => setHintConfirmId(q.id)}
                            className="px-5 py-3 rounded-xl border-2 border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 text-xs sm:text-sm font-mono font-bold tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span>REQUEST HINT (-{q.hintPenalty} PT)</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(q)}
                        disabled={submittingId === q.id}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-mono font-black text-sm sm:text-base tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Send className="w-4 h-4 stroke-[3]" />
                        <span>{submittingId === q.id ? 'VERIFYING...' : 'TRANSMIT ANSWER'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Hint Confirmation Dialog */}
                {hintConfirmId === q.id && (
                  <div className="p-5 rounded-2xl border-2 border-amber-500 bg-amber-950/70 space-y-3 font-mono text-sm text-amber-100 animate-fadeIn shadow-xl">
                    <div className="flex items-center gap-2 font-bold text-amber-300 text-base">
                      <AlertTriangle className="w-5 h-5" />
                      <span>CONFIRM HINT REQUEST</span>
                    </div>
                    <p className="leading-relaxed">
                      Accessing this tactical intelligence hint will apply a permanent <span className="font-bold underline">{q.hintPenalty}-point penalty</span> to this question upon correct completion.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmHint(q)}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black tracking-wider hover:bg-amber-300 cursor-pointer text-sm"
                      >
                        CONFIRM & REVEAL
                      </button>
                      <button
                        type="button"
                        onClick={() => setHintConfirmId(null)}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-600 cursor-pointer text-sm font-bold"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}

                {/* Revealed Hint Card */}
                {hintRevealed && (
                  <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-950/30 space-y-2 font-mono text-sm text-amber-200">
                    <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wider text-xs sm:text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>TACTICAL INTEL HINT (PENALTY APPLIED):</span>
                    </div>
                    <p className="text-slate-200 text-base leading-relaxed">{hintRevealed}</p>
                  </div>
                )}

                {/* Submission Feedback Message */}
                {currentFeedback?.message && !isSolved && (
                  <div
                    className={`p-5 rounded-2xl border-2 font-mono text-sm sm:text-base flex items-start gap-3 animate-shake ${
                      currentFeedback.type === 'success'
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200'
                        : 'border-rose-500 bg-rose-950/50 text-rose-200'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                    <span className="font-semibold leading-relaxed">{currentFeedback.message}</span>
                  </div>
                )}

                {/* Solved Educational Debrief Card - Visible once solved */}
                {isSolved && (
                  <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/30 p-6 space-y-3 font-mono animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm uppercase tracking-wider">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>FORENSIC LESSON & REMEDIATION DEBRIEF:</span>
                    </div>
                    {prog.explanation ? (
                      <p className="text-slate-100 text-base sm:text-lg leading-relaxed">
                        {prog.explanation}
                      </p>
                    ) : (
                      <p className="text-slate-100 text-base leading-relaxed">
                        Threat vector successfully isolated and remediated. Protocol defense standards recorded on the SOC live scoreboard.
                      </p>
                    )}
                    <div className="pt-2 text-xs font-semibold text-emerald-400/90">
                      Answered: {prog.lastAnswer ? `[${prog.lastAnswer}]` : 'Verified'} • Telemetry Synchronized to Event Enclave
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
