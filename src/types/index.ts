export type GamePhase = 
  | 'intro'
  | 'setup'
  | 'rules'
  | 'level1'
  | 'level2'
  | 'level3'
  | 'level4'
  | 'override'
  | 'debrief'
  | 'leaderboard';

export type LiveTeamStatus = 'REGISTERED' | 'PLAYING' | 'PAUSED' | 'COMPLETED' | 'INACTIVE';

export interface TeamInfo {
  id?: string;
  name: string;
  members: string[];
  stationId: string;
}

export interface LevelData {
  id: number;
  title: string;
  maxPoints: number;
  solved: boolean;
  score: number;
  hintsUsed: number;
  revealedHints: number[];
  token: string;
}

export interface PublicQuestion {
  id: string;
  room: 'alpha' | 'bravo' | 'charlie' | 'delta';
  roomName: string;
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE';
  points: number;
  format: 'MULTIPLE_CHOICE' | 'SELECT_ALL' | 'SHORT_ANSWER' | 'SCENARIO' | 'INVESTIGATION';
  scenario: string;
  question: string;
  options?: { id: string; label: string; text: string }[];
  hasHint: boolean;
  hintPenalty: number;
}

export interface TeamChallengeState {
  solved: boolean;
  score: number;
  hintUsed: boolean;
  revealedHintText?: string;
  answeredAt?: string;
  lastAnswer?: string;
  explanation?: string;
}

export interface GameState {
  phase: GamePhase;
  activeView: 'core' | 'challenges';
  team: TeamInfo;
  startTime: number | null;
  endTime: number | null;
  timeRemaining: number; // in seconds (initial: 3600)
  totalDurationSeconds: number; // 3600 (60 minutes)
  isRunning: boolean;
  isCompleted: boolean;
  isTimedOut: boolean;
  currentLevel: number; // 1 to 4
  levels: {
    1: LevelData;
    2: LevelData;
    3: LevelData;
    4: LevelData;
  };
  bonusSolved: boolean;
  bonusScore: number;
  tokens: {
    level1: string; // "SAFE"
    level2: string; // "URGENCY"
    level3: string; // "ARUN"
    level4: string; // "MFA"
  };
  challengeProgress: Record<string, TeamChallengeState>;
  finalCodeSubmitted: boolean;
  soundEnabled: boolean;
  matrixEnabled: boolean;
}

export interface LeaderboardEntry {
  id: string;
  teamName: string;
  members: string[];
  stationId: string;
  score: number;
  maxPossibleScore: number;
  timeElapsedSeconds: number;
  formattedTime: string;
  completedAt: string;
  isSuccess: boolean;
  hintsUsedCount: number;
  bonusSolved: boolean;
}

export interface EmailData {
  id: 'A' | 'B' | 'C';
  from: string;
  replyTo?: string;
  to: string;
  subject: string;
  date: string;
  preview: string;
  body: string;
  isPhishing: boolean;
  indicators: string[];
  links: { text: string; displayUrl: string; actualUrl: string }[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  username: string;
  ipAddress: string;
  location: string;
  device: string;
  status: 'SUCCESS' | 'FAILED';
  action: string;
  reason?: string;
}

