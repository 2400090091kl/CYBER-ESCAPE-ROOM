import type { GameState, LeaderboardEntry } from '../types';

const STATE_KEY = 'operation_shadowbyte_state_v1';
const LEADERBOARD_KEY = 'operation_shadowbyte_leaderboard_v1';

export const INITIAL_GAME_STATE: GameState = {
  phase: 'intro',
  activeView: 'core',
  team: {
    name: '',
    members: [],
    stationId: 'Station-01',
  },
  startTime: null,
  endTime: null,
  timeRemaining: 3600, // 60 minutes
  totalDurationSeconds: 3600,
  isRunning: false,
  isCompleted: false,
  isTimedOut: false,
  currentLevel: 1,
  levels: {
    1: {
      id: 1,
      title: 'Packet Sniffer: Binary Payload Decode',
      maxPoints: 10,
      solved: false,
      score: 0,
      hintsUsed: 0,
      revealedHints: [],
      token: 'SAFE',
    },
    2: {
      id: 2,
      title: 'Phishing Vector Triage & Analysis',
      maxPoints: 6,
      solved: false,
      score: 0,
      hintsUsed: 0,
      revealedHints: [],
      token: 'URGENCY',
    },
    3: {
      id: 3,
      title: 'SIEM Incident Forensics & Log Correlation',
      maxPoints: 8,
      solved: false,
      score: 0,
      hintsUsed: 0,
      revealedHints: [],
      token: 'ARUN',
    },
    4: {
      id: 4,
      title: 'Identity Defense Architecture',
      maxPoints: 8,
      solved: false,
      score: 0,
      hintsUsed: 0,
      revealedHints: [],
      token: 'MFA',
    },
  },
  bonusSolved: false,
  bonusScore: 0,
  tokens: {
    level1: '',
    level2: '',
    level3: '',
    level4: '',
  },
  challengeProgress: {},
  finalCodeSubmitted: false,
  soundEnabled: true,
  matrixEnabled: true,
};

// State persistence
export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.challengeProgress) parsed.challengeProgress = {};
    if (!parsed.activeView) parsed.activeView = 'core';
    return parsed;
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch (e) {
    console.error('Failed to clear state from localStorage', e);
  }
}

// Leaderboard persistence
export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return getSampleLeaderboard();
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load leaderboard', e);
    return getSampleLeaderboard();
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  try {
    const current = loadLeaderboard();
    // Check if team already exists, replace or append
    const existingIndex = current.findIndex(e => e.id === entry.id || (e.teamName.toLowerCase() === entry.teamName.toLowerCase() && e.stationId === entry.stationId));
    let updated: LeaderboardEntry[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...current];
    }
    // Sort by: highest score first, then lowest timeElapsedSeconds
    updated.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeElapsedSeconds - b.timeElapsedSeconds;
    });

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save leaderboard', e);
    return [];
  }
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (e) {
    console.error('Failed to clear leaderboard', e);
  }
}

// Sample mock teams for ForensiXplore R201D event immersion
function getSampleLeaderboard(): LeaderboardEntry[] {
  return [
    {
      id: 'sample-1',
      teamName: 'CyberGuardians_KL',
      members: ['Vikram R.', 'Sneha P.', 'Rahul K.'],
      stationId: 'Station-03',
      score: 35,
      maxPossibleScore: 35,
      timeElapsedSeconds: 2240, // 37m 20s
      formattedTime: '37m 20s',
      completedAt: '2026-10-30T14:28:00',
      isSuccess: true,
      hintsUsedCount: 0,
      bonusSolved: true,
    },
    {
      id: 'sample-2',
      teamName: 'BitShifters_R201',
      members: ['Aditya M.', 'Tanvi S.'],
      stationId: 'Station-08',
      score: 30,
      maxPossibleScore: 35,
      timeElapsedSeconds: 2650, // 44m 10s
      formattedTime: '44m 10s',
      completedAt: '2026-10-30T14:35:10',
      isSuccess: true,
      hintsUsedCount: 1,
      bonusSolved: true,
    },
    {
      id: 'sample-3',
      teamName: 'ZeroDay_Hunters',
      members: ['Rohan V.', 'Kavya B.', 'Deepak N.'],
      stationId: 'Station-12',
      score: 28,
      maxPossibleScore: 35,
      timeElapsedSeconds: 3120, // 52m 00s
      formattedTime: '52m 00s',
      completedAt: '2026-10-30T14:43:00',
      isSuccess: true,
      hintsUsedCount: 2,
      bonusSolved: false,
    },
  ];
}
