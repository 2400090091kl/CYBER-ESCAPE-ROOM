// API Service for Operation Shadowbyte (Client <-> Backend)

const API_BASE = ''; // Relies on Vite proxy to http://localhost:3001 or same-origin in production

export interface OrganizerLoginResponse {
  success: boolean;
  token?: string;
  user?: {
    username: string;
    role: string;
  };
  error?: string;
}

export type LiveTeamStatus = 'REGISTERED' | 'PLAYING' | 'PAUSED' | 'COMPLETED' | 'INACTIVE';

export interface ServerLiveTeam {
  id: string;
  name: string;
  members: string[];
  stationId: string;
  registeredAt: string;
  startedAt: string | null;
  lastActiveAt: string;
  currentLevel: number;
  scores: { 1: number; 2: number; 3: number; 4: number; bonus: number };
  bonusSolved: boolean;
  hintsUsed: { 1: number; 2: number; 3: number; 4: number };
  tokens: { level1: string; level2: string; level3: string; level4: string };
  totalScore: number;
  timeElapsedSeconds: number;
  completionStatus: 'REGISTERED' | 'IN_PROGRESS' | 'PAUSED' | 'SUCCESS' | 'TIMED_OUT' | 'COMPLETED' | 'NOT_STARTED';
  completedAt: string | null;
  liveStatus?: LiveTeamStatus;
  lastSubmission: {
    level: number;
    answerText: string;
    isCorrect: boolean;
    status: 'CORRECT' | 'INCORRECT' | 'PENDING';
    timestamp: string;
    message: string;
  } | null;
  submissionHistory: Array<{
    level: number;
    answerText: string;
    isCorrect: boolean;
    status: 'CORRECT' | 'INCORRECT' | 'PENDING';
    timestamp: string;
    scoreDelta: number;
  }>;
  manualAdjustments: Array<{
    scoreDelta: number;
    reason: string;
    timestamp: string;
    by: string;
  }>;
}

export interface OrganizerDashboardData {
  overview: {
    eventName: string;
    eventDate: string;
    venue: string;
    gameStatus: 'NOT_STARTED' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
    elapsedSeconds: number;
    remainingSeconds: number;
    totalDurationSeconds: number;
    registeredTeams: number;
    activeTeams: number;
    completedTeams: number;
    showLeaderboard: boolean;
    activeQuestionFilter?: 'all' | 'beginner' | 'intermediate';
    totalQuestionsInBank?: number;
    startedAt: string | null;
    pausedAt: string | null;
  };
  liveTeams: ServerLiveTeam[];
  scoreboard: Array<any>;
}

export const api = {
  // Organizer Auth
  async organizerLogin(username: string, password: string): Promise<OrganizerLoginResponse> {
    try {
      const res = await fetch(`${API_BASE}/api/organizer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Could not connect to backend server. Make sure it is running on port 3001.' };
    }
  },

  // Private Answer Key (Server-Enforced)
  async getPrivateAnswerKey(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/organizer/answer-key`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
        return { success: false, error: err.error || 'Failed to fetch answer key.' };
      }
      return await res.json();
    } catch {
      return { success: false, error: 'Network error connecting to backend.' };
    }
  },

  // Organizer Dashboard Telemetry
  async getOrganizerDashboard(token: string): Promise<{ success: boolean; data?: OrganizerDashboardData; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/organizer/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
        return { success: false, error: err.error || 'Unauthorized dashboard request.' };
      }
      const data = await res.json();
      return { success: true, data };
    } catch {
      return { success: false, error: 'Network error connecting to backend.' };
    }
  },

  // Organizer Event Control (Start, Pause, Resume, Reset, Adjust Score)
  async sendEventControl(
    token: string,
    action: string,
    params: Record<string, any> = {}
  ): Promise<{ success: boolean; message?: string; error?: string; [key: string]: any }> {
    try {
      const res = await fetch(`${API_BASE}/api/organizer/event-control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...params }),
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Network error executing event control.' };
    }
  },

  // Participant Registration
  async registerTeam(name: string, members: string[], stationId: string): Promise<{ success: boolean; team?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/register-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, members, stationId }),
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Offline mode active.' };
    }
  },

  // Participant Answer Validation (Server-Validated)
  async validateSubmission(payload: {
    teamId?: string;
    level: number;
    answer?: string;
    selectedEmail?: string;
    selectedIndicators?: string[];
    whySuspicious?: string;
    safeAction?: string;
  }): Promise<{
    isValid: boolean;
    message: string;
    tokenAwarded?: string;
    scoreAwarded?: number;
    nextLevel?: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      // Offline fallback: Use localized verification if server not yet started
      return {
        isValid: false,
        message: 'Backend server validation unreachable. Ensure backend server is running.',
      };
    }
  },

  // Participant Hint Request
  async requestHint(teamId: string, level: number, hintNumber: number): Promise<{ success: boolean; hintText?: string; penalty?: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/request-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, level, hintNumber }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Organizer Authenticated Team List
  async getOrganizerTeams(token: string): Promise<{ success: boolean; totalTeams?: number; teams?: ServerLiveTeam[]; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/organizer/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        return { success: false, error: 'Unauthorized' };
      }
      return await res.json();
    } catch {
      return { success: false, error: 'Network error connecting to backend.' };
    }
  },

  // Organizer Authenticated Single Team Details
  async getOrganizerTeamDetails(token: string, teamId: string): Promise<{ success: boolean; team?: ServerLiveTeam; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/organizer/teams/${encodeURIComponent(teamId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        return { success: false, error: 'Unauthorized or not found' };
      }
      return await res.json();
    } catch {
      return { success: false, error: 'Network error connecting to backend.' };
    }
  },

  // Public Event State
  async getEventState(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/game/event-state`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Update Team Status (Client -> Server)
  async updateTeamStatus(teamId: string, status: string): Promise<{ success: boolean; team?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/team-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, status }),
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Network error updating team status.' };
    }
  },

  // Team Heartbeat Ping
  async sendHeartbeat(teamId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Public Registered Teams (Names only)
  async getPublicTeams(): Promise<{ success: boolean; teams?: Array<{ id: string; name: string; stationId: string }> }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/teams`);
      return await res.json();
    } catch {
      return { success: false, teams: [] };
    }
  },

  // Public Leaderboard
  async getLeaderboard(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/game/leaderboard`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // Question Bank: Fetch Public Questions
  async getQuestions(): Promise<{ success: boolean; totalQuestions?: number; activeFilter?: string; questions?: any[] }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/questions`);
      return await res.json();
    } catch {
      return { success: false, questions: [] };
    }
  },

  // Question Bank: Submit Answer
  async submitQuestion(
    teamId: string,
    questionId: string,
    answer: string | string[]
  ): Promise<{ success: boolean; isValid: boolean; isAlreadySolved: boolean; scoreAwarded: number; message: string; explanation?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/submit-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, questionId, answer }),
      });
      return await res.json();
    } catch {
      return {
        success: false,
        isValid: false,
        isAlreadySolved: false,
        scoreAwarded: 0,
        message: 'Network error submitting answer. Please retry.',
      };
    }
  },

  // Question Bank: Request Hint
  async requestQuestionHint(
    teamId: string,
    questionId: string
  ): Promise<{ success: boolean; hintText?: string; penalty?: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/game/request-question-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, questionId }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Organizer: Set Question Filter
  async setQuestionFilter(
    token: string,
    filter: 'all' | 'beginner' | 'intermediate'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/api/organizer/event-control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'set_question_filter', filter }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },
};

