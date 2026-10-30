import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { PRIVATE_ANSWER_KEY } from './answerKey';
import { store } from './store';
import { generateOrganizerToken, requireOrganizerAuth } from './auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'OPERATION SHADOWBYTE SOC BACKEND',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 1. ORGANIZER AUTHENTICATION (SERVER-ENFORCED)
// ==========================================
app.post('/api/organizer/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  const validUsername = process.env.ORGANIZER_USERNAME?.trim();
  const validPassword = process.env.ORGANIZER_PASSWORD;

  // Fail securely if environment variables are missing or unconfigured
  if (!validUsername || !validPassword || validPassword.trim().length === 0) {
    console.error('[SECURITY ALERT] ORGANIZER_USERNAME or ORGANIZER_PASSWORD is not configured in server environment.');
    res.status(500).json({
      error: 'Authentication unavailable: Server credentials are not securely configured in environment.',
      code: 'SERVER_CREDENTIALS_NOT_CONFIGURED',
    });
    return;
  }

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  if (username.trim() === validUsername && password === validPassword) {
    const token = generateOrganizerToken(username.trim());
    res.json({
      success: true,
      token,
      user: {
        username: username.trim(),
        role: 'ORGANIZER',
      },
      message: 'Organizer clearance authenticated.',
    });
    return;
  }

  res.status(401).json({
    error: 'Access Denied: Invalid organizer credentials.',
    code: 'INVALID_CREDENTIALS',
  });
});

// ==========================================
// 2. PRIVATE ANSWER KEY (AUTHENTICATED ONLY)
// ==========================================
app.get('/api/organizer/answer-key', requireOrganizerAuth, (_req: Request, res: Response) => {
  // Returns complete private solutions, variants, explanations, and hints
  res.json({
    success: true,
    data: PRIVATE_ANSWER_KEY,
  });
});

// ==========================================
// 3. ORGANIZER DASHBOARD TELEMETRY & TEAMS
// ==========================================
app.get('/api/organizer/dashboard', requireOrganizerAuth, (_req: Request, res: Response) => {
  const event = store.getEventState();
  const teams = store.getTeams();
  const scoreboard = store.getScoreboard();

  // Overview metrics
  const registeredCount = teams.length;
  const activeCount = teams.filter((t) => t.liveStatus === 'PLAYING').length;
  const completedCount = teams.filter((t) => t.liveStatus === 'COMPLETED').length;

  res.json({
    success: true,
    overview: {
      eventName: event.name,
      eventDate: event.date,
      venue: event.venue,
      gameStatus: event.status,
      elapsedSeconds: event.elapsedSeconds,
      remainingSeconds: event.timeRemaining,
      totalDurationSeconds: event.totalDurationSeconds,
      registeredTeams: registeredCount,
      activeTeams: activeCount,
      completedTeams: completedCount,
      showLeaderboard: event.showLeaderboard,
      activeQuestionFilter: event.activeQuestionFilter || 'all',
      totalQuestionsInBank: PRIVATE_ANSWER_KEY.questionBank.length,
      startedAt: event.startedAt,
      pausedAt: event.pausedAt,
    },
    liveTeams: teams,
    scoreboard,
  });
});

// Authenticated Team List Endpoint
app.get('/api/organizer/teams', requireOrganizerAuth, (_req: Request, res: Response) => {
  const teams = store.getTeams();
  res.json({
    success: true,
    totalTeams: teams.length,
    teams,
  });
});

// Authenticated Single Team Detailed Progress Endpoint
app.get('/api/organizer/teams/:teamId', requireOrganizerAuth, (req: Request, res: Response) => {
  const team = store.getTeam(req.params.teamId);
  if (!team) {
    res.status(404).json({ error: 'Team enclave not found.' });
    return;
  }
  res.json({
    success: true,
    team,
  });
});

// ==========================================
// 4. ORGANIZER EVENT CONTROLS
// ==========================================
app.post('/api/organizer/event-control', requireOrganizerAuth, (req: Request, res: Response) => {
  const { action, confirm, seconds, teamId, scoreDelta, reason, showLeaderboard } = req.body;
  const organizerUser = (req as any).organizer?.username || 'admin';

  switch (action) {
    case 'start': {
      const state = store.startTimer();
      res.json({ success: true, message: '60-minute synchronized countdown initiated.', state });
      return;
    }

    case 'pause': {
      const state = store.pauseTimer();
      res.json({ success: true, message: 'Event countdown paused.', state });
      return;
    }

    case 'resume': {
      const state = store.resumeTimer();
      res.json({ success: true, message: 'Event countdown resumed.', state });
      return;
    }

    case 'add_time': {
      const addedSeconds = parseInt(seconds, 10) || 300;
      const state = store.addTime(addedSeconds);
      res.json({
        success: true,
        message: `Added ${Math.floor(addedSeconds / 60)} minutes to countdown.`,
        state,
      });
      return;
    }

    case 'reset': {
      if (!confirm) {
        res.status(400).json({
          error: 'Destructive action: reset requires explicit confirmation { confirm: true }.',
        });
        return;
      }
      store.resetEvent(true);
      res.json({ success: true, message: 'Event session and team data reset to clean baseline.' });
      return;
    }

    case 'manual_score_adjust': {
      if (!teamId || typeof scoreDelta !== 'number' || !reason) {
        res.status(400).json({
          error: 'Missing required parameters: teamId, scoreDelta (number), and reason are required.',
        });
        return;
      }
      const updated = store.manualScoreCorrection(teamId, scoreDelta, reason, organizerUser);
      if (!updated) {
        res.status(404).json({ error: 'Team not found.' });
        return;
      }
      res.json({
        success: true,
        message: `Score adjusted by ${scoreDelta > 0 ? '+' : ''}${scoreDelta} points for team ${updated.name}.`,
        team: updated,
      });
      return;
    }

    case 'toggle_leaderboard': {
      const isVisible = store.toggleLeaderboardDisplay(Boolean(showLeaderboard));
      res.json({
        success: true,
        message: `Public leaderboard display set to ${isVisible ? 'VISIBLE' : 'HIDDEN'}.`,
        showLeaderboard: isVisible,
      });
      return;
    }

    case 'set_question_filter': {
      const filter = req.body.filter === 'beginner' || req.body.filter === 'intermediate' ? req.body.filter : 'all';
      const state = store.setQuestionFilter(filter);
      res.json({
        success: true,
        message: `Question difficulty filter set to ${filter.toUpperCase()}.`,
        state,
      });
      return;
    }

    default:
      res.status(400).json({ error: `Unknown event control action: ${action}` });
  }
});

// ==========================================
// 5. PARTICIPANT GAME ROUTES
// ==========================================

// Register Team Enclave
app.post('/api/game/register-team', (req: Request, res: Response) => {
  const { name, members, stationId } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Team name is required.' });
    return;
  }
  const cleanMembers = Array.isArray(members) && members.length > 0 ? members : ['Lead Analyst'];
  const cleanStation = stationId || 'Station-01';

  const team = store.registerTeam(name, cleanMembers, cleanStation);
  res.json({ success: true, team });
});

// Update Team Game Status (Started, Playing, Completed, Timed Out)
app.post('/api/game/team-status', (req: Request, res: Response) => {
  const { teamId, status } = req.body;
  if (!teamId || !status) {
    res.status(400).json({ error: 'teamId and status are required.' });
    return;
  }
  const updated = store.updateTeamStatus(teamId, status);
  if (!updated) {
    res.status(404).json({ error: 'Team enclave not found.' });
    return;
  }
  res.json({ success: true, team: updated });
});

// Periodic Team Heartbeat / Activity Ping
app.post('/api/game/heartbeat', (req: Request, res: Response) => {
  const { teamId } = req.body;
  if (!teamId) {
    res.status(400).json({ error: 'teamId is required.' });
    return;
  }
  const touched = store.touchTeamActivity(teamId);
  res.json({ success: touched });
});

// Public Team List (Names & Stations for Reconnection - No Private Data)
app.get('/api/game/teams', (_req: Request, res: Response) => {
  const teams = store.getTeams().map((t) => ({
    id: t.id,
    name: t.name,
    stationId: t.stationId,
    memberCount: t.members.length,
    currentLevel: t.currentLevel,
    liveStatus: t.liveStatus,
  }));
  res.json({ success: true, teams });
});

// Synchronized Event State & Public Timer
app.get('/api/game/event-state', (_req: Request, res: Response) => {
  const event = store.getEventState();
  res.json({
    name: event.name,
    date: event.date,
    venue: event.venue,
    status: event.status,
    timeRemaining: event.timeRemaining,
    totalDurationSeconds: event.totalDurationSeconds,
    showLeaderboard: event.showLeaderboard,
  });
});

// Public Leaderboard
app.get('/api/game/leaderboard', (_req: Request, res: Response) => {
  const event = store.getEventState();
  if (!event.showLeaderboard) {
    res.json({
      visible: false,
      message: 'Leaderboard is currently paused by the event organizer.',
      scoreboard: [],
    });
    return;
  }

  const scoreboard = store.getScoreboard().map((t, idx) => ({
    rank: idx + 1,
    id: t.id,
    teamName: t.name,
    members: t.members,
    stationId: t.stationId,
    totalScore: t.totalScore,
    currentLevel: t.currentLevel,
    timeElapsedSeconds: t.timeElapsedSeconds,
    completionStatus: t.completionStatus,
    bonusSolved: t.bonusSolved,
    hintsUsedCount: t.hintsUsed[1] + t.hintsUsed[2] + t.hintsUsed[3] + t.hintsUsed[4],
  }));

  res.json({ visible: true, scoreboard });
});

// Participant Answer Validation (Server-Side: Never returns actual answers!)
app.post('/api/game/validate', (req: Request, res: Response) => {
  const { teamId, level, answer, selectedEmail, selectedIndicators, whySuspicious, safeAction } = req.body;

  let isValid = false;
  let feedbackMessage = '';
  let tokenAwarded = '';
  let scoreDelta = 0;

  // Level 1: Binary ASCII Payload
  if (level === 1) {
    const raw = String(answer || '')
      .trim()
      .toUpperCase()
      .replace(/['"“”]/g, '');

    const acceptable = PRIVATE_ANSWER_KEY.levels[1].acceptableVariants.map((v) =>
      v.toUpperCase().replace(/['"“”]/g, '')
    );

    if (acceptable.includes(raw) || raw === 'SAFE' || raw === 'S A F E') {
      isValid = true;
      tokenAwarded = 'SAFE';
      feedbackMessage =
        'TRANSLATION VERIFIED: "SAFE". Decoded 4 ASCII octets successfully. Decryption token acquired.';
      const team = teamId ? store.getTeam(teamId) : null;
      const hintsCount = team ? team.hintsUsed[1] : 0;
      scoreDelta = Math.max(0, 10 - hintsCount * 2);
    } else {
      feedbackMessage = 'DECRYPTION FAILED: Byte sequence translation mismatch. Verify each 8-bit octet.';
    }
  }

  // Level 2: Phishing Triage
  else if (level === 2) {
    const emailChoice = String(selectedEmail || '').trim().toUpperCase();
    const indicators: string[] = Array.isArray(selectedIndicators) ? selectedIndicators : [];

    const reqKeys = ['urgency', 'domain', 'credentials'];
    const matched = reqKeys.filter((k) => indicators.includes(k));

    if (emailChoice === 'A' && matched.length >= 2) {
      isValid = true;
      tokenAwarded = 'URGENCY';
      feedbackMessage =
        'PHISHING VECTOR ISOLATED: Email A identified with spoofed domain, artificial urgency, and credential harvesting payload. Token [URGENCY] acquired.';
      const team = teamId ? store.getTeam(teamId) : null;
      const hintsCount = team ? team.hintsUsed[2] : 0;
      scoreDelta = Math.max(0, 6 - hintsCount * 2);
    } else if (emailChoice !== 'A') {
      feedbackMessage = 'ALERT: Selected email is not the primary threat. Review the sender domain and intent.';
    } else {
      feedbackMessage =
        'THREAT DETECTED BUT INCOMPLETE ANALYSIS: You identified Email A, but you must identify at least 2 critical warning signs (Urgency, Unfamiliar Domain, Credential Request).';
    }
  }

  // Level 3: SIEM Log Forensics
  else if (level === 3) {
    const normUser = String(answer || '')
      .trim()
      .toUpperCase();
    const isUserArun = normUser === 'ARUN';
    const isWhyValid = whySuspicious === 'bruteforce_pattern';
    const isActionValid = safeAction === 'isolate_remediate' || safeAction === 'verify_owner_investigate';

    if (isUserArun && isWhyValid && isActionValid) {
      isValid = true;
      tokenAwarded = 'ARUN';
      feedbackMessage =
        'SIEM TRIAGE CONFIRMED: Account ARUN identified under credential brute-force from foreign IP 185.220.101.42. Authorized investigation protocol initiated. Token [ARUN] acquired.';
      const team = teamId ? store.getTeam(teamId) : null;
      const hintsCount = team ? team.hintsUsed[3] : 0;
      scoreDelta = Math.max(0, 8 - hintsCount * 2);
    } else if (!isUserArun) {
      feedbackMessage = `ACCOUNT AUDIT FAILED: Account "${normUser || 'NONE'}" does not match the brute-force pattern. Look for repeated failed attempts followed immediately by a foreign IP success.`;
    } else if (!isWhyValid) {
      feedbackMessage = 'ANALYSIS REQUIRED: Select the primary anomalous pattern observed in the SIEM logs.';
    } else {
      feedbackMessage = 'RESPONSE REQUIRED: Select the safe authorized incident response action.';
    }
  }

  // Level 4: Identity Defense (MFA)
  else if (level === 4) {
    const norm = String(answer || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const acceptableVariants = [
      'MFA',
      '2FA',
      'MULTIFACTORAUTHENTICATION',
      'MULTIFACTORAUTH',
      'MULTIFACTOR',
      'TWOFACTORAUTHENTICATION',
      'TWOFACTORAUTH',
      'TWOFACTOR',
    ];

    if (acceptableVariants.includes(norm)) {
      isValid = true;
      tokenAwarded = 'MFA';
      feedbackMessage =
        'IDENTITY DEFENSE VERIFIED: Multi-Factor Authentication (MFA) combines Knowledge (password) with Possession (hardware key/app). Token [MFA] acquired.';
      const team = teamId ? store.getTeam(teamId) : null;
      const hintsCount = team ? team.hintsUsed[4] : 0;
      scoreDelta = Math.max(0, 8 - hintsCount * 2);
    } else {
      feedbackMessage =
        'CONCEPT MISMATCH: Hint: Think of the standard acronym for requiring more than one factor of verification (Knowledge + Possession).';
    }
  }

  // Level 5: Master Disarm Override Sequence
  else if (level === 5) {
    const clean = String(answer || '')
      .trim()
      .toUpperCase()
      .replace(/[\s\-_]+/g, '-');

    if (clean === 'SAFE-URGENCY-ARUN-MFA' || clean === 'SAFEURGENCYARUNMFA') {
      isValid = true;
      tokenAwarded = 'DISARMED';
      feedbackMessage =
        'MASTER OVERRIDE CODE ACCEPTED! Disarm sequence initiated. Rogue enclave neutralized.';
      scoreDelta = 0; // Completion marker
    } else {
      feedbackMessage =
        'ACCESS DENIED: Master override sequence invalid. Sequence format: TOKEN1-TOKEN2-TOKEN3-TOKEN4';
    }
  }

  // Level 99: Caesar Cipher Bonus Puzzle
  else if (level === 99) {
    const norm = String(answer || '')
      .trim()
      .toUpperCase()
      .replace(/['"“”\s]/g, '');

    if (norm === 'CRYPTO' || norm === 'SHADOW') {
      isValid = true;
      tokenAwarded = 'CRYPTO';
      feedbackMessage =
        'BONUS CIPHER CRACKED: Transmitted keyword successfully deciphered! +3 Bonus points awarded.';
      scoreDelta = 3;
    } else {
      feedbackMessage =
        'CIPHER MISMATCH: Incorrect plaintext. Shift each letter three positions backward from "FUBSWR" (F-3=C, U-3=R, B-3=Y, S-3=P, W-3=T, R-3=O).';
    }
  }

  // Record submission on live monitor if teamId is provided
  if (teamId) {
    store.recordSubmission(
      teamId,
      level,
      String(answer || selectedEmail || 'Submission'),
      isValid,
      scoreDelta,
      tokenAwarded,
      feedbackMessage
    );
  }

  // Return validation result (DOES NOT EXPOSE PRIVATE ANSWER KEY)
  res.json({
    isValid,
    message: feedbackMessage,
    tokenAwarded: isValid ? tokenAwarded : undefined,
    scoreAwarded: isValid ? scoreDelta : 0,
    nextLevel: isValid && level >= 1 && level <= 4 ? level + 1 : undefined,
  });
});

// Participant Hint Request (Deducts 2 Points on Server)
app.post('/api/game/request-hint', (req: Request, res: Response) => {
  const { teamId, level, hintNumber } = req.body;
  const lvlNum = parseInt(level, 10);
  const hNum = parseInt(hintNumber, 10);

  if (![1, 2, 3, 4].includes(lvlNum) || ![1, 2].includes(hNum)) {
    res.status(400).json({ error: 'Invalid level or hint index.' });
    return;
  }

  const lvlKey = lvlNum as 1 | 2 | 3 | 4;
  const hintObj = PRIVATE_ANSWER_KEY.levels[lvlKey].hints.find((h) => h.number === hNum);

  if (!hintObj) {
    res.status(404).json({ error: 'Hint not found.' });
    return;
  }

  if (teamId) {
    store.recordHint(teamId, lvlNum, hNum);
  }

  res.json({
    success: true,
    level: lvlNum,
    hintNumber: hNum,
    penalty: 2,
    hintText: hintObj.text,
  });
});

// ==========================================
// 6. EXPANDED CYBERSECURITY QUESTION BANK
// ==========================================

// Public Question Bank (NEVER returns solutions or explanations in advance!)
app.get('/api/game/questions', (_req: Request, res: Response) => {
  const event = store.getEventState();
  const filter = event.activeQuestionFilter || 'all';

  let filtered = PRIVATE_ANSWER_KEY.questionBank;
  if (filter === 'beginner') {
    filtered = filtered.filter((q) => q.difficulty === 'BEGINNER');
  } else if (filter === 'intermediate') {
    filtered = filtered.filter((q) => q.difficulty === 'INTERMEDIATE');
  }

  // Sanitize: strip primaryAnswer, acceptableVariants, and explanation
  const sanitized = filtered.map((q) => ({
    id: q.id,
    room: q.room,
    roomName: q.roomName,
    topic: q.topic,
    difficulty: q.difficulty,
    points: q.points,
    format: q.format,
    scenario: q.scenario,
    question: q.question,
    options: q.options,
    hasHint: Boolean(q.hint),
    hintPenalty: q.hint?.penalty || 1,
  }));

  res.json({
    success: true,
    totalQuestions: sanitized.length,
    activeFilter: filter,
    questions: sanitized,
  });
});

// Submit Answer for Question Bank Challenge
app.post('/api/game/submit-question', (req: Request, res: Response) => {
  const { teamId, questionId, answer } = req.body;
  if (!questionId) {
    res.status(400).json({ error: 'questionId is required.' });
    return;
  }

  const q = PRIVATE_ANSWER_KEY.questionBank.find((item) => item.id === questionId);
  if (!q) {
    res.status(404).json({ error: 'Question not found in question bank.' });
    return;
  }

  // Answer validation
  let isCorrect = false;
  if (q.format === 'SELECT_ALL') {
    const userAnswers: string[] = Array.isArray(answer)
      ? answer.map((a) => String(a).trim().toUpperCase()).sort()
      : [String(answer).trim().toUpperCase()];
    const correctAnswers: string[] = Array.isArray(q.primaryAnswer)
      ? q.primaryAnswer.map((a) => String(a).trim().toUpperCase()).sort()
      : [String(q.primaryAnswer).trim().toUpperCase()];

    isCorrect =
      userAnswers.length === correctAnswers.length &&
      userAnswers.every((val, idx) => val === correctAnswers[idx]);
  } else if (q.format === 'SHORT_ANSWER') {
    const raw = String(answer || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const variants = q.acceptableVariants.map((v) =>
      v
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    );
    const primary = String(q.primaryAnswer)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    isCorrect = variants.includes(raw) || raw === primary;
  } else {
    // MULTIPLE_CHOICE, SCENARIO, INVESTIGATION
    const raw = String(answer || '').trim().toUpperCase();
    const primary = String(q.primaryAnswer).trim().toUpperCase();
    const variants = q.acceptableVariants.map((v) => v.trim().toUpperCase());
    isCorrect = raw === primary || variants.includes(raw);
  }

  // Calculate score with hint penalty
  const team = teamId ? store.getTeam(teamId) : null;
  const hintUsed = team?.challengeProgress?.[questionId]?.hintUsed || false;
  const scoreAwarded = isCorrect ? Math.max(1, q.points - (hintUsed ? q.hint.penalty : 0)) : 0;

  let alreadySolved = false;
  if (teamId) {
    const recordResult = store.recordQuestionSubmission(
      teamId,
      questionId,
      Array.isArray(answer) ? answer.join(', ') : String(answer),
      isCorrect,
      scoreAwarded,
      isCorrect ? q.successMessage : q.retryMessage
    );
    if (recordResult) {
      alreadySolved = recordResult.alreadySolved;
    }
  }

  res.json({
    success: true,
    isValid: isCorrect,
    isAlreadySolved: alreadySolved,
    scoreAwarded: alreadySolved ? 0 : scoreAwarded,
    message: isCorrect ? q.successMessage : q.retryMessage,
    explanation: isCorrect ? q.explanation : undefined,
  });
});

// Request Question Bank Hint
app.post('/api/game/request-question-hint', (req: Request, res: Response) => {
  const { teamId, questionId } = req.body;
  if (!questionId) {
    res.status(400).json({ error: 'questionId is required.' });
    return;
  }

  const q = PRIVATE_ANSWER_KEY.questionBank.find((item) => item.id === questionId);
  if (!q) {
    res.status(404).json({ error: 'Question not found in question bank.' });
    return;
  }

  if (teamId) {
    store.recordQuestionHint(teamId, questionId, q.hint.penalty);
  }

  res.json({
    success: true,
    questionId,
    penalty: q.hint.penalty,
    hintText: q.hint.text,
  });
});

// Serve frontend static files in production if built
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback SPA routing for client-side routes (including /organizer) - Express 5 compatible syntax
app.get('/{*path}', (_req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('OPERATION SHADOWBYTE Server running. Run frontend client on port 5173.');
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`[SHADOWBYTE BACKEND] SOC Server active on http://localhost:${PORT}`);
  console.log(`[SHADOWBYTE BACKEND] Health: http://localhost:${PORT}/api/health`);
  console.log(`[SHADOWBYTE BACKEND] Protected Organizer API: http://localhost:${PORT}/api/organizer/dashboard`);
});

// Explicit error handler for port conflicts or network errors
server.on('error', (err: any) => {
  console.error('[SHADOWBYTE BACKEND] Server fatal listener error:', err);
  process.exit(1);
});

// Keep-alive handle to guarantee Node.js event loop remains permanently active
const keepAliveInterval = setInterval(() => {}, 60000);

// Graceful process lifecycle handlers for local development and production
const gracefulShutdown = (signal: string) => {
  console.log(`\n[SHADOWBYTE BACKEND] Received ${signal}. Terminating server gracefully...`);
  clearInterval(keepAliveInterval);
  store.destroy();
  server.close(() => {
    console.log('[SHADOWBYTE BACKEND] SOC Server successfully closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { app, server };
export default app;

