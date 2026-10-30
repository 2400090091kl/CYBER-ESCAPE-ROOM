import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export interface TeamSubmissionRecord {
  level: number;
  answerText: string;
  isCorrect: boolean;
  status: 'CORRECT' | 'INCORRECT' | 'PENDING';
  timestamp: string;
  scoreDelta: number;
}

export interface ManualScoreAdjustment {
  scoreDelta: number;
  reason: string;
  timestamp: string;
  by: string;
}

export type LiveTeamStatus = 'REGISTERED' | 'PLAYING' | 'PAUSED' | 'COMPLETED' | 'INACTIVE';

export interface ServerTeam {
  id: string;
  name: string;
  members: string[];
  stationId: string;
  registeredAt: string;
  startedAt: string | null;
  lastActiveAt: string;
  currentLevel: number;
  scores: {
    1: number;
    2: number;
    3: number;
    4: number;
    bonus: number;
  };
  bonusSolved: boolean;
  hintsUsed: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
  revealedHints: {
    1: number[];
    2: number[];
    3: number[];
    4: number[];
  };
  tokens: {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
  };
  totalScore: number;
  timeElapsedSeconds: number;
  completionStatus: 'REGISTERED' | 'IN_PROGRESS' | 'PAUSED' | 'SUCCESS' | 'TIMED_OUT' | 'COMPLETED' | 'NOT_STARTED';
  completedAt: string | null;
  lastSubmission: {
    level: number;
    answerText: string;
    isCorrect: boolean;
    status: 'CORRECT' | 'INCORRECT' | 'PENDING';
    timestamp: string;
    message: string;
  } | null;
  submissionHistory: TeamSubmissionRecord[];
  manualAdjustments: ManualScoreAdjustment[];
  challengeProgress: Record<string, {
    solved: boolean;
    score: number;
    hintUsed: boolean;
    answeredAt?: string;
    lastAnswer?: string;
  }>;
  liveStatus?: LiveTeamStatus;
}

export interface EventState {
  name: string;
  date: string;
  venue: string;
  status: 'NOT_STARTED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  totalDurationSeconds: number; // 3600
  timeRemaining: number;
  elapsedSeconds: number;
  startedAt: string | null;
  pausedAt: string | null;
  showLeaderboard: boolean;
  activeQuestionFilter: 'all' | 'beginner' | 'intermediate';
}

export interface StoreData {
  event: EventState;
  teams: ServerTeam[];
}

const DEFAULT_EVENT_STATE: EventState = {
  name: 'OPERATION SHADOWBYTE',
  date: '30 October 2026',
  venue: 'Lab R201D',
  status: 'NOT_STARTED',
  totalDurationSeconds: 3600, // 60 minutes
  timeRemaining: 3600,
  elapsedSeconds: 0,
  startedAt: null,
  pausedAt: null,
  showLeaderboard: true,
  activeQuestionFilter: 'all',
};

export class GameStore {
  private data: StoreData;
  private filePath: string;
  private supabase: SupabaseClient | null = null;
  private timerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.filePath = path.join(process.cwd(), 'server', 'data', 'store.json');
    this.data = this.loadFromFile();
    this.initSupabase();
    this.startServerTimer();
  }

  private initSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (url && key && url.startsWith('http')) {
      try {
        this.supabase = createClient(url, key);
        console.log('[STORE] Connected to Supabase remote synchronization.');
      } catch (e) {
        console.warn('[STORE] Could not connect to Supabase, falling back to local file store.', e);
      }
    }
  }

  private loadFromFile(): StoreData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.teams) {
          parsed.teams.forEach((t: ServerTeam) => {
            if (!t.challengeProgress) t.challengeProgress = {};
          });
        }
        if (parsed.event && !parsed.event.activeQuestionFilter) {
          parsed.event.activeQuestionFilter = 'all';
        }
        return parsed;
      }
    } catch (e) {
      console.warn('[STORE] Could not read store.json, using defaults.', e);
    }

    return {
      event: { ...DEFAULT_EVENT_STATE },
      teams: [],
    };
  }

  private saveToFile() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[STORE] Failed to persist data to store.json', e);
    }
  }

  private startServerTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.data.event.status === 'RUNNING') {
        if (this.data.event.timeRemaining > 0) {
          this.data.event.timeRemaining -= 1;
          this.data.event.elapsedSeconds += 1;

          // Update active teams' elapsed times
          this.data.teams.forEach((t) => {
            if (t.completionStatus === 'IN_PROGRESS') {
              t.timeElapsedSeconds += 1;
            }
          });
        } else {
          // Timer reached 0!
          this.data.event.status = 'COMPLETED';
          this.data.event.timeRemaining = 0;
          this.data.teams.forEach((t) => {
            if (t.completionStatus === 'IN_PROGRESS') {
              t.completionStatus = 'TIMED_OUT';
              t.completedAt = new Date().toISOString();
            }
          });
          this.saveToFile();
        }
      }
    }, 1000);
  }

  public destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // EVENT STATE ACCESSORS
  public getEventState(): EventState {
    return { ...this.data.event };
  }

  public startTimer(): EventState {
    this.data.event.status = 'RUNNING';
    if (!this.data.event.startedAt) {
      this.data.event.startedAt = new Date().toISOString();
    }
    this.saveToFile();
    return this.getEventState();
  }

  public pauseTimer(): EventState {
    if (this.data.event.status === 'RUNNING') {
      this.data.event.status = 'PAUSED';
      this.data.event.pausedAt = new Date().toISOString();
      this.saveToFile();
    }
    return this.getEventState();
  }

  public resumeTimer(): EventState {
    if (this.data.event.status === 'PAUSED' || this.data.event.status === 'NOT_STARTED') {
      this.data.event.status = 'RUNNING';
      if (!this.data.event.startedAt) {
        this.data.event.startedAt = new Date().toISOString();
      }
      this.saveToFile();
    }
    return this.getEventState();
  }

  public addTime(seconds: number): EventState {
    this.data.event.timeRemaining += seconds;
    this.data.event.totalDurationSeconds += seconds;
    if (this.data.event.status === 'COMPLETED' && this.data.event.timeRemaining > 0) {
      this.data.event.status = 'RUNNING';
    }
    this.saveToFile();
    return this.getEventState();
  }

  public resetEvent(confirm: boolean): boolean {
    if (!confirm) return false;

    this.data.event = { ...DEFAULT_EVENT_STATE };
    this.data.teams = [];
    this.saveToFile();
    return true;
  }

  public toggleLeaderboardDisplay(show: boolean): boolean {
    this.data.event.showLeaderboard = show;
    this.saveToFile();
    return this.data.event.showLeaderboard;
  }

  // TEAM MANAGEMENT & LIVE MONITORING
  public getDerivedStatus(team: ServerTeam): LiveTeamStatus {
    if (
      team.completionStatus === 'SUCCESS' ||
      team.completionStatus === 'TIMED_OUT' ||
      team.completionStatus === 'COMPLETED'
    ) {
      return 'COMPLETED';
    }

    if (this.data.event.status === 'PAUSED' && team.completionStatus === 'IN_PROGRESS') {
      return 'PAUSED';
    }

    if (team.completionStatus === 'REGISTERED' || team.completionStatus === 'NOT_STARTED') {
      return 'REGISTERED';
    }

    // Check inactivity: 15 minutes of silence while IN_PROGRESS
    if (team.lastActiveAt) {
      const lastActiveMs = new Date(team.lastActiveAt).getTime();
      const now = Date.now();
      if (!isNaN(lastActiveMs) && now - lastActiveMs > 15 * 60 * 1000) {
        return 'INACTIVE';
      }
    }

    return 'PLAYING';
  }

  public getTeams(): ServerTeam[] {
    return this.data.teams.map((t) => ({
      ...t,
      liveStatus: this.getDerivedStatus(t),
    }));
  }

  public getTeam(id: string): ServerTeam | undefined {
    const team = this.data.teams.find((t) => t.id === id);
    if (!team) return undefined;
    return {
      ...team,
      liveStatus: this.getDerivedStatus(team),
    };
  }

  public registerTeam(name: string, members: string[], stationId: string): ServerTeam {
    const trimmedName = name.trim().toLowerCase();
    const existing = this.data.teams.find(
      (t) => t.name.toLowerCase() === trimmedName
    );

    if (existing) {
      const incomingMembers = Array.isArray(members) ? members : [];
      for (const m of incomingMembers) {
        const clean = m.trim();
        if (clean && !existing.members.includes(clean)) {
          existing.members.push(clean);
        }
      }
      if (stationId && stationId.trim()) {
        existing.stationId = stationId.trim();
      }
      existing.lastActiveAt = new Date().toISOString();
      this.saveToFile();
      return {
        ...existing,
        liveStatus: this.getDerivedStatus(existing),
      };
    }

    const newTeam: ServerTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      members: Array.isArray(members) && members.length > 0 ? members.map((m) => m.trim()) : ['Lead Analyst'],
      stationId: stationId ? stationId.trim() : 'Station-01',
      registeredAt: new Date().toISOString(),
      startedAt: null,
      lastActiveAt: new Date().toISOString(),
      currentLevel: 1,
      scores: { 1: 0, 2: 0, 3: 0, 4: 0, bonus: 0 },
      bonusSolved: false,
      hintsUsed: { 1: 0, 2: 0, 3: 0, 4: 0 },
      revealedHints: { 1: [], 2: [], 3: [], 4: [] },
      tokens: { level1: '', level2: '', level3: '', level4: '' },
      totalScore: 0,
      timeElapsedSeconds: 0,
      completionStatus: 'REGISTERED',
      completedAt: null,
      lastSubmission: null,
      submissionHistory: [],
      manualAdjustments: [],
      challengeProgress: {},
    };

    newTeam.liveStatus = this.getDerivedStatus(newTeam);
    this.data.teams.push(newTeam);
    this.saveToFile();
    return newTeam;
  }

  public updateTeamStatus(
    teamId: string,
    status: 'REGISTERED' | 'IN_PROGRESS' | 'PAUSED' | 'SUCCESS' | 'TIMED_OUT' | 'COMPLETED'
  ): ServerTeam | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    team.completionStatus = status;
    team.lastActiveAt = new Date().toISOString();

    if (status === 'IN_PROGRESS' && !team.startedAt) {
      team.startedAt = new Date().toISOString();
    }
    if ((status === 'SUCCESS' || status === 'COMPLETED' || status === 'TIMED_OUT') && !team.completedAt) {
      team.completedAt = new Date().toISOString();
    }

    this.saveToFile();
    return {
      ...team,
      liveStatus: this.getDerivedStatus(team),
    };
  }

  public touchTeamActivity(teamId: string): boolean {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return false;
    team.lastActiveAt = new Date().toISOString();
    this.saveToFile();
    return true;
  }

  public recordSubmission(
    teamId: string,
    level: number,
    answerText: string,
    isCorrect: boolean,
    scoreDelta: number,
    tokenAwarded?: string,
    message: string = ''
  ): ServerTeam | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    team.lastActiveAt = new Date().toISOString();
    if (!team.startedAt) {
      team.startedAt = new Date().toISOString();
    }

    const record: TeamSubmissionRecord = {
      level,
      answerText,
      isCorrect,
      status: isCorrect ? 'CORRECT' : 'INCORRECT',
      timestamp: new Date().toISOString(),
      scoreDelta,
    };

    team.submissionHistory.unshift(record);
    team.lastSubmission = {
      level,
      answerText,
      isCorrect,
      status: isCorrect ? 'CORRECT' : 'INCORRECT',
      timestamp: record.timestamp,
      message,
    };

    if (team.completionStatus === 'REGISTERED' || team.completionStatus === 'NOT_STARTED') {
      team.completionStatus = 'IN_PROGRESS';
    }

    if (isCorrect) {
      const lvlKey = level as 1 | 2 | 3 | 4;
      if (level >= 1 && level <= 4) {
        team.scores[lvlKey] = scoreDelta;
        if (tokenAwarded) {
          const tKey = `level${level}` as 'level1' | 'level2' | 'level3' | 'level4';
          team.tokens[tKey] = tokenAwarded;
        }
        team.currentLevel = Math.min(5, level + 1);
      } else if (level === 5) {
        // Master Override Disarm
        team.completionStatus = 'SUCCESS';
        team.completedAt = new Date().toISOString();
      } else if (level === 99) {
        // Bonus Caesar Cipher
        team.bonusSolved = true;
        team.scores.bonus = scoreDelta;
      }

      this.recalculateTeamTotal(team);
    }

    this.saveToFile();
    return {
      ...team,
      liveStatus: this.getDerivedStatus(team),
    };
  }

  public recordHint(teamId: string, level: number, hintNumber: number): { team: ServerTeam; penalty: number } | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    team.lastActiveAt = new Date().toISOString();
    const lvlKey = level as 1 | 2 | 3 | 4;
    if (!team.revealedHints[lvlKey].includes(hintNumber)) {
      team.revealedHints[lvlKey].push(hintNumber);
      team.hintsUsed[lvlKey] += 1;
      this.recalculateTeamTotal(team);
      this.saveToFile();
    }

    return {
      team: {
        ...team,
        liveStatus: this.getDerivedStatus(team),
      },
      penalty: 2,
    };
  }

  public manualScoreCorrection(
    teamId: string,
    scoreDelta: number,
    reason: string,
    organizerUser: string
  ): ServerTeam | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    team.lastActiveAt = new Date().toISOString();
    team.manualAdjustments.push({
      scoreDelta,
      reason,
      timestamp: new Date().toISOString(),
      by: organizerUser,
    });

    this.recalculateTeamTotal(team);
    this.saveToFile();
    return {
      ...team,
      liveStatus: this.getDerivedStatus(team),
    };
  }

  public recordQuestionSubmission(
    teamId: string,
    questionId: string,
    answerText: string,
    isCorrect: boolean,
    scoreDelta: number,
    message: string
  ): { team: ServerTeam; alreadySolved: boolean; scoreAwarded: number } | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    if (!team.challengeProgress) {
      team.challengeProgress = {};
    }

    team.lastActiveAt = new Date().toISOString();
    const existing = team.challengeProgress[questionId];
    if (existing && existing.solved) {
      return { team, alreadySolved: true, scoreAwarded: 0 };
    }

    const hintUsed = existing?.hintUsed || false;
    const actualScore = isCorrect ? scoreDelta : 0;

    if (isCorrect) {
      team.challengeProgress[questionId] = {
        solved: true,
        score: actualScore,
        hintUsed,
        answeredAt: new Date().toISOString(),
        lastAnswer: answerText,
      };
      this.recalculateTeamTotal(team);
    } else {
      team.challengeProgress[questionId] = {
        solved: false,
        score: 0,
        hintUsed,
        lastAnswer: answerText,
      };
    }

    const record: TeamSubmissionRecord = {
      level: 100, // Challenge question code
      answerText: `[${questionId}] ${answerText}`,
      isCorrect,
      status: isCorrect ? 'CORRECT' : 'INCORRECT',
      timestamp: new Date().toISOString(),
      scoreDelta: actualScore,
    };
    team.submissionHistory.unshift(record);

    this.saveToFile();
    return {
      team: {
        ...team,
        liveStatus: this.getDerivedStatus(team),
      },
      alreadySolved: false,
      scoreAwarded: actualScore,
    };
  }

  public recordQuestionHint(teamId: string, questionId: string, penalty: number): { team: ServerTeam; penalty: number } | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    if (!team.challengeProgress) {
      team.challengeProgress = {};
    }

    team.lastActiveAt = new Date().toISOString();
    const existing = team.challengeProgress[questionId] || { solved: false, score: 0, hintUsed: false };
    if (!existing.hintUsed) {
      existing.hintUsed = true;
      team.challengeProgress[questionId] = existing;
      this.saveToFile();
    }

    return {
      team: {
        ...team,
        liveStatus: this.getDerivedStatus(team),
      },
      penalty,
    };
  }

  public setQuestionFilter(filter: 'all' | 'beginner' | 'intermediate'): EventState {
    this.data.event.activeQuestionFilter = filter;
    this.saveToFile();
    return this.getEventState();
  }

  private recalculateTeamTotal(team: ServerTeam) {
    const base = team.scores[1] + team.scores[2] + team.scores[3] + team.scores[4];
    const bonus = team.bonusSolved ? team.scores.bonus : 0;
    let challengeScore = 0;
    if (team.challengeProgress) {
      Object.values(team.challengeProgress).forEach((cp) => {
        if (cp.solved) {
          challengeScore += cp.score;
        }
      });
    }
    const adjustments = team.manualAdjustments.reduce((acc, curr) => acc + curr.scoreDelta, 0);

    team.totalScore = Math.max(0, base + bonus + challengeScore + adjustments);
  }

  // Sorted Scoreboard: Total score desc -> Fewer hints asc -> Earlier completion asc
  public getScoreboard(): ServerTeam[] {
    const sorted = [...this.data.teams];
    sorted.sort((a, b) => {
      // 1. Total score descending
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // 2. Fewer hints ascending
      const aHints = a.hintsUsed[1] + a.hintsUsed[2] + a.hintsUsed[3] + a.hintsUsed[4];
      const bHints = b.hintsUsed[1] + b.hintsUsed[2] + b.hintsUsed[3] + b.hintsUsed[4];
      if (aHints !== bHints) {
        return aHints - bHints;
      }
      // 3. Earlier completion time ascending
      return a.timeElapsedSeconds - b.timeElapsedSeconds;
    });
    return sorted;
  }

  private getDefaultSampleTeams(): ServerTeam[] {
    return [
      {
        id: 'sample-team-01',
        name: 'CyberGuardians_KL',
        members: ['Vikram R.', 'Sneha P.', 'Rahul K.'],
        stationId: 'Station-03',
        registeredAt: '2026-10-30T13:40:00Z',
        currentLevel: 5,
        scores: { 1: 10, 2: 6, 3: 8, 4: 8, bonus: 3 },
        bonusSolved: true,
        hintsUsed: { 1: 0, 2: 0, 3: 0, 4: 0 },
        revealedHints: { 1: [], 2: [], 3: [], 4: [] },
        tokens: { level1: 'SAFE', level2: 'URGENCY', level3: 'ARUN', level4: 'MFA' },
        totalScore: 35,
        timeElapsedSeconds: 2240,
        completionStatus: 'SUCCESS',
        completedAt: '2026-10-30T14:28:00Z',
        lastSubmission: {
          level: 5,
          answerText: 'SAFE-URGENCY-ARUN-MFA',
          isCorrect: true,
          status: 'CORRECT',
          timestamp: '2026-10-30T14:28:00Z',
          message: 'MASTER OVERRIDE ACCEPTED: ShadowByte neutralized.',
        },
        submissionHistory: [],
        manualAdjustments: [],
      },
      {
        id: 'sample-team-02',
        name: 'BitShifters_R201',
        members: ['Aditya M.', 'Tanvi S.'],
        stationId: 'Station-08',
        registeredAt: '2026-10-30T13:42:00Z',
        currentLevel: 4,
        scores: { 1: 10, 2: 6, 3: 8, 4: 0, bonus: 3 },
        bonusSolved: true,
        hintsUsed: { 1: 0, 2: 1, 3: 0, 4: 0 },
        revealedHints: { 1: [], 2: [1], 3: [], 4: [] },
        tokens: { level1: 'SAFE', level2: 'URGENCY', level3: 'ARUN', level4: '' },
        totalScore: 25,
        timeElapsedSeconds: 2650,
        completionStatus: 'IN_PROGRESS',
        completedAt: null,
        lastSubmission: {
          level: 4,
          answerText: 'FIREWALL',
          isCorrect: false,
          status: 'INCORRECT',
          timestamp: '2026-10-30T14:32:00Z',
          message: 'CONCEPT MISMATCH: Hint: Multi-Factor Authentication',
        },
        submissionHistory: [],
        manualAdjustments: [],
      },
    ];
  }
}

export const store = new GameStore();

