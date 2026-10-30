import React, { useState, useEffect } from 'react';
import type { 
  GameState, 
  TeamInfo, 
  LeaderboardEntry,
  GamePhase,
  TeamChallengeState
} from './types';
import { 
  INITIAL_GAME_STATE, 
  saveGameState, 
  loadGameState, 
  clearGameState,
  loadLeaderboard,
  saveLeaderboardEntry,
  clearLeaderboard
} from './utils/storage';
import { cyberAudio } from './utils/audio';
import { api } from './services/api';

// Components
import { MatrixBackground } from './components/MatrixBackground';
import { Navbar } from './components/Navbar';
import { IntroScreen } from './components/IntroScreen';
import { TeamSetupScreen } from './components/TeamSetupScreen';
import { RulesScreen } from './components/RulesScreen';
import { Level1Binary } from './components/levels/Level1Binary';
import { Level2Phishing } from './components/levels/Level2Phishing';
import { Level3Logs } from './components/levels/Level3Logs';
import { Level4MFA } from './components/levels/Level4MFA';
import { MasterOverride } from './components/levels/MasterOverride';
import { BonusCaesar } from './components/levels/BonusCaesar';
import { FinalDebriefScreen } from './components/FinalDebriefScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HintConfirmModal } from './components/HintConfirmModal';
import { OrganizerPage } from './components/organizer/OrganizerPage';
import { MissionSidebar } from './components/MissionSidebar';
import { ChallengeMatrix } from './components/challenges/ChallengeMatrix';

export const App: React.FC = () => {
  // Routing State: /organizer vs /
  const [currentRoute, setCurrentRoute] = useState<'game' | 'organizer'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/organizer' || window.location.hash === '#/organizer') {
        return 'organizer';
      }
    }
    return 'game';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/organizer' || window.location.hash === '#/organizer') {
        setCurrentRoute('organizer');
      } else {
        setCurrentRoute('game');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToOrganizer = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/organizer');
    }
    setCurrentRoute('organizer');
  };

  const navigateToGame = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    setCurrentRoute('game');
  };

  // Main Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameState();
    return saved ? saved : INITIAL_GAME_STATE;
  });

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard());

  // Modal Visibility States
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const [pendingHint, setPendingHint] = useState<{ level: number; hintIndex: number } | null>(null);

  // Auto-save state to localStorage whenever gameState changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  // Sync sound settings with audio utility
  useEffect(() => {
    cyberAudio.setMuted(!gameState.soundEnabled);
  }, [gameState.soundEnabled]);

  // Master 60-Minute Countdown Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (gameState.isRunning && !gameState.isCompleted && !gameState.isTimedOut) {
      timer = setInterval(() => {
        setGameState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Timer expired!
            clearInterval(timer);
            cyberAudio.playAlarm();

            // Calculate current partial score
            const baseScore = 
              prev.levels[1].score + 
              prev.levels[2].score + 
              prev.levels[3].score + 
              prev.levels[4].score;
            const drillScore = Object.values(prev.challengeProgress || {}).reduce(
              (acc, curr) => acc + (curr.solved ? curr.score : 0),
              0
            );
            const totalScore = baseScore + prev.bonusScore + drillScore;
            const totalHints = 
              prev.levels[1].hintsUsed + 
              prev.levels[2].hintsUsed + 
              prev.levels[3].hintsUsed + 
              prev.levels[4].hintsUsed;

            // Record to leaderboard as timeout
            const entry: LeaderboardEntry = {
              id: `team-${Date.now()}`,
              teamName: prev.team.name || 'Anonymous Unit',
              members: prev.team.members,
              stationId: prev.team.stationId,
              score: totalScore,
              maxPossibleScore: 155,
              timeElapsedSeconds: prev.totalDurationSeconds,
              formattedTime: '60m 00s (Limit)',
              completedAt: new Date().toISOString(),
              isSuccess: false,
              hintsUsedCount: totalHints,
              bonusSolved: prev.bonusSolved,
            };

            const updated = saveLeaderboardEntry(entry);
            setLeaderboard(updated);

            return {
              ...prev,
              timeRemaining: 0,
              isRunning: false,
              isCompleted: true,
              isTimedOut: true,
              phase: 'debrief',
            };
          }

          // Periodic countdown tick sound when time is low (< 5 minutes)
          if (prev.timeRemaining <= 300 && prev.timeRemaining % 10 === 0) {
            cyberAudio.playTick();
          }

          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [gameState.isRunning, gameState.isCompleted, gameState.isTimedOut]);

  // Navigation handlers
  const handleStartMissionIntro = () => {
    setGameState((prev) => ({
      ...prev,
      phase: 'setup',
    }));
  };

  const handleConfirmTeam = async (team: TeamInfo) => {
    let assignedId = team.id;
    try {
      const res = await api.registerTeam(team.name, team.members, team.stationId);
      if (res.success && res.team) {
        assignedId = res.team.id;
        // If rejoining an existing team on same enclave that already progressed:
        if (res.team.currentLevel && res.team.currentLevel > 1) {
          setGameState((prev) => ({
            ...prev,
            team: {
              ...team,
              id: assignedId,
              members: res.team.members,
            },
            currentLevel: Math.min(4, res.team.currentLevel),
            phase: 'rules',
            bonusSolved: Boolean(res.team.bonusSolved),
            tokens: {
              level1: res.team.tokens.level1 || prev.tokens.level1,
              level2: res.team.tokens.level2 || prev.tokens.level2,
              level3: res.team.tokens.level3 || prev.tokens.level3,
              level4: res.team.tokens.level4 || prev.tokens.level4,
            },
          }));
          return;
        }
      }
    } catch (e) {
      console.warn('Backend team registration offline fallback', e);
    }

    setGameState((prev) => ({
      ...prev,
      team: {
        ...team,
        id: assignedId || `team-local-${Date.now()}`,
      },
      phase: 'rules',
    }));
  };

  const handleStartMissionTimer = () => {
    if (gameState.team.id) {
      api.updateTeamStatus(gameState.team.id, 'IN_PROGRESS').catch(() => {});
    }
    setGameState((prev) => ({
      ...prev,
      phase: 'level1',
      isRunning: true,
      startTime: Date.now(),
      currentLevel: 1,
    }));
  };

  // Heartbeat effect to keep telemetry alive on server while playing
  useEffect(() => {
    if (!gameState.isRunning || !gameState.team.id) return;

    const interval = setInterval(() => {
      if (gameState.team.id) {
        api.sendHeartbeat(gameState.team.id).catch(() => {});
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.team.id]);

  // Solve a specific level
  const handleSolveLevel = (levelNum: 1 | 2 | 3 | 4, score: number, token: string) => {
    setGameState((prev) => {
      const updatedLevels = {
        ...prev.levels,
        [levelNum]: {
          ...prev.levels[levelNum],
          solved: true,
          score: score,
        },
      };

      const tokenKey = `level${levelNum}` as 'level1' | 'level2' | 'level3' | 'level4';
      const updatedTokens = {
        ...prev.tokens,
        [tokenKey]: token,
      };

      return {
        ...prev,
        levels: updatedLevels,
        tokens: updatedTokens,
      };
    });
  };

  // Advance to next level
  const handleNextLevel = (nextLevel: 2 | 3 | 4) => {
    const phaseKey = `level${nextLevel}` as GamePhase;
    setGameState((prev) => ({
      ...prev,
      currentLevel: nextLevel,
      phase: phaseKey,
    }));
  };

  const handleProceedToOverride = () => {
    setGameState((prev) => ({
      ...prev,
      phase: 'override',
    }));
  };

  // Complete mission via master disarm
  const handleCompleteMission = () => {
    setGameState((prev) => {
      const baseScore = 
        prev.levels[1].score + 
        prev.levels[2].score + 
        prev.levels[3].score + 
        prev.levels[4].score;
      const drillScore = Object.values(prev.challengeProgress || {}).reduce(
        (acc, curr) => acc + (curr.solved ? curr.score : 0),
        0
      );
      const totalScore = baseScore + prev.bonusScore + drillScore;
      const totalHints = 
        prev.levels[1].hintsUsed + 
        prev.levels[2].hintsUsed + 
        prev.levels[3].hintsUsed + 
        prev.levels[4].hintsUsed;

      const timeElapsedSeconds = prev.totalDurationSeconds - prev.timeRemaining;
      const elapsedMins = Math.floor(timeElapsedSeconds / 60);
      const elapsedSecs = timeElapsedSeconds % 60;
      const formattedTime = `${elapsedMins}m ${elapsedSecs.toString().padStart(2, '0')}s`;

      const entry: LeaderboardEntry = {
        id: `team-${Date.now()}`,
        teamName: prev.team.name || 'Anonymous Unit',
        members: prev.team.members,
        stationId: prev.team.stationId,
        score: totalScore,
        maxPossibleScore: 155,
        timeElapsedSeconds: timeElapsedSeconds,
        formattedTime: formattedTime,
        completedAt: new Date().toISOString(),
        isSuccess: true,
        hintsUsedCount: totalHints,
        bonusSolved: prev.bonusSolved,
      };

      const updated = saveLeaderboardEntry(entry);
      setLeaderboard(updated);

      if (prev.team.id) {
        api.updateTeamStatus(prev.team.id, 'SUCCESS').catch(() => {});
      }

      return {
        ...prev,
        isRunning: false,
        isCompleted: true,
        finalCodeSubmitted: true,
        phase: 'debrief',
      };
    });
  };

  // Solve Bonus Caesar Puzzle
  const handleSolveBonus = () => {
    if (gameState.team.id) {
      api.validateSubmission({
        teamId: gameState.team.id,
        level: 99,
        answer: 'CRYPTO',
      }).catch(() => {});
    }
    setGameState((prev) => ({
      ...prev,
      bonusSolved: true,
      bonusScore: 3,
    }));
  };

  // Switch between Core Story and Challenge Matrix
  const handleSwitchView = (view: 'core' | 'challenges') => {
    cyberAudio.playKeyClick();
    setGameState((prev) => ({
      ...prev,
      activeView: view,
    }));
  };

  // Update Challenge Question Progress
  const handleUpdateChallengeProgress = (
    questionId: string,
    challengeState: TeamChallengeState,
    _scoreDelta: number
  ) => {
    setGameState((prev) => {
      const updated = {
        ...prev.challengeProgress,
        [questionId]: challengeState,
      };
      return {
        ...prev,
        challengeProgress: updated,
      };
    });
  };

  // Hint management
  const handleRequestHint = (level: number, hintIndex: number) => {
    setPendingHint({ level, hintIndex });
  };

  const handleConfirmHint = () => {
    if (!pendingHint) return;
    const { level, hintIndex } = pendingHint;
    const lvlKey = level as 1 | 2 | 3 | 4;

    if (gameState.team.id) {
      api.requestHint(gameState.team.id, level, hintIndex).catch(() => {});
    }

    setGameState((prev) => {
      const currentLvl = prev.levels[lvlKey];
      if (currentLvl.revealedHints.includes(hintIndex)) return prev;

      const updatedHints = [...currentLvl.revealedHints, hintIndex];
      const updatedHintsCount = currentLvl.hintsUsed + 1;
      const updatedScore = Math.max(0, currentLvl.maxPoints - updatedHintsCount * 2);

      return {
        ...prev,
        levels: {
          ...prev.levels,
          [lvlKey]: {
            ...currentLvl,
            hintsUsed: updatedHintsCount,
            revealedHints: updatedHints,
            score: updatedScore,
          },
        },
      };
    });

    setPendingHint(null);
  };

  // Restart enclave session
  const handleRestart = () => {
    clearGameState();
    setGameState(INITIAL_GAME_STATE);
  };

  const handleClearLeaderboard = () => {
    clearLeaderboard();
    setLeaderboard([]);
  };

  if (currentRoute === 'organizer') {
    return <OrganizerPage onBackToGame={navigateToGame} />;
  }

  return (
    <div className="relative min-h-screen bg-gray-950 text-slate-100 flex flex-col font-mono selection:bg-cyan-500 selection:text-black">
      {/* Background Matrix Rain */}
      <MatrixBackground enabled={gameState.matrixEnabled} />

      {/* Cyber Grid Lines & Scanlines Overlay */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0 opacity-40"></div>
      <div className="fixed inset-0 scanlines pointer-events-none z-30 opacity-35"></div>

      {/* Top Cyber Navigation & Status Bar */}
      <Navbar
        state={gameState}
        onToggleSound={() =>
          setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onToggleMatrix={() =>
          setGameState((prev) => ({ ...prev, matrixEnabled: !prev.matrixEnabled }))
        }
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenOrganizer={navigateToOrganizer}
        onOpenBonus={() => setIsBonusOpen(true)}
        onSwitchView={handleSwitchView}
      />

      {/* Main Mission Workstation Content */}
      <main className="relative z-10 flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full flex flex-col justify-center">
        {/* Step 1: Mission Briefing */}
        {gameState.phase === 'intro' && (
          <IntroScreen
            onStart={handleStartMissionIntro}
            onOpenOrganizer={navigateToOrganizer}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {/* Step 2: Team Enclave Setup */}
        {gameState.phase === 'setup' && (
          <TeamSetupScreen
            initialTeam={gameState.team}
            onConfirmTeam={handleConfirmTeam}
            onBack={() => setGameState((prev) => ({ ...prev, phase: 'intro' }))}
          />
        )}

        {/* Step 3: Rules & Protocol Briefing */}
        {gameState.phase === 'rules' && (
          <RulesScreen
            state={gameState}
            onStartMission={handleStartMissionTimer}
            onBack={() => setGameState((prev) => ({ ...prev, phase: 'setup' }))}
          />
        )}

        {/* Active Mission Play Area with Responsive 2-Column Desktop Grid & Mission Sidebar */}
        {['level1', 'level2', 'level3', 'level4', 'override'].includes(gameState.phase) && (
          <div className="w-full lg:grid lg:grid-cols-12 lg:gap-8 items-start animate-fadeIn">
            {/* Left/Main Tactical Workstation */}
            <div className="lg:col-span-8 xl:col-span-9 w-full space-y-6">
              {gameState.activeView === 'challenges' ? (
                <ChallengeMatrix
                  teamId={gameState.team.id}
                  challengeProgress={gameState.challengeProgress}
                  onUpdateProgress={handleUpdateChallengeProgress}
                  onSwitchToCore={() => handleSwitchView('core')}
                />
              ) : (
                <>
                  {/* Level 1: Binary ASCII Payload */}
                  {gameState.phase === 'level1' && (
                    <Level1Binary
                      levelData={gameState.levels[1]}
                      teamId={gameState.team.id}
                      onSolve={(score, token) => handleSolveLevel(1, score, token)}
                      onRequestHint={(hintIdx) => handleRequestHint(1, hintIdx)}
                      onNextLevel={() => handleNextLevel(2)}
                    />
                  )}

                  {/* Level 2: Phishing Triage */}
                  {gameState.phase === 'level2' && (
                    <Level2Phishing
                      levelData={gameState.levels[2]}
                      teamId={gameState.team.id}
                      onSolve={(score, token) => handleSolveLevel(2, score, token)}
                      onRequestHint={(hintIdx) => handleRequestHint(2, hintIdx)}
                      onNextLevel={() => handleNextLevel(3)}
                    />
                  )}

                  {/* Level 3: SIEM Log Forensics */}
                  {gameState.phase === 'level3' && (
                    <Level3Logs
                      levelData={gameState.levels[3]}
                      teamId={gameState.team.id}
                      onSolve={(score, token) => handleSolveLevel(3, score, token)}
                      onRequestHint={(hintIdx) => handleRequestHint(3, hintIdx)}
                      onNextLevel={() => handleNextLevel(4)}
                    />
                  )}

                  {/* Level 4: Identity Defense (MFA) */}
                  {gameState.phase === 'level4' && (
                    <Level4MFA
                      levelData={gameState.levels[4]}
                      teamId={gameState.team.id}
                      onSolve={(score, token) => handleSolveLevel(4, score, token)}
                      onRequestHint={(hintIdx) => handleRequestHint(4, hintIdx)}
                      onProceedToOverride={handleProceedToOverride}
                    />
                  )}

                  {/* Master Disarm Override Sequence */}
                  {gameState.phase === 'override' && (
                    <MasterOverride
                      state={gameState}
                      onCompleteMission={handleCompleteMission}
                    />
                  )}
                </>
              )}
            </div>

            {/* Right Tactical Telemetry & HUD Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3 w-full mt-8 lg:mt-0 lg:sticky lg:top-24">
              <MissionSidebar
                state={gameState}
                onSwitchView={handleSwitchView}
                onOpenBonus={() => setIsBonusOpen(true)}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onToggleSound={() =>
                  setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
                }
              />
            </div>
          </div>
        )}

        {/* Final Debrief & Scoring */}
        {gameState.phase === 'debrief' && (
          <FinalDebriefScreen
            state={gameState}
            onRestart={handleRestart}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        entries={leaderboard}
        currentTeamName={gameState.team.name}
        onClose={() => setIsLeaderboardOpen(false)}
        onClearLeaderboard={handleClearLeaderboard}
      />

      <BonusCaesar
        isOpen={isBonusOpen}
        bonusSolved={gameState.bonusSolved}
        teamId={gameState.team.id}
        onClose={() => setIsBonusOpen(false)}
        onSolveBonus={handleSolveBonus}
      />

      {pendingHint && (
        <HintConfirmModal
          isOpen={true}
          hintNumber={pendingHint.hintIndex}
          levelNumber={pendingHint.level}
          penaltyPoints={2}
          currentPuzzleScore={gameState.levels[pendingHint.level as 1|2|3|4].score || gameState.levels[pendingHint.level as 1|2|3|4].maxPoints}
          onConfirm={handleConfirmHint}
          onCancel={() => setPendingHint(null)}
        />
      )}
    </div>
  );
};

export default App;
