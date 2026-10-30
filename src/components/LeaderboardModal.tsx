import React from 'react';
import { 
  Trophy, 
  X, 
  Medal, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { cyberAudio } from '../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  entries: LeaderboardEntry[];
  currentTeamName?: string;
  onClose: () => void;
  onClearLeaderboard: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  entries,
  currentTeamName,
  onClose,
  onClearLeaderboard,
}) => {
  if (!isOpen) return null;

  // Export to CSV for ForensiXplore coordinators
  const handleExportCSV = () => {
    cyberAudio.playKeyClick();
    if (entries.length === 0) return;

    const headers = ['Rank', 'Team Name', 'Members', 'Station ID', 'Score', 'Max Score', 'Time Taken', 'Status', 'Bonus Solved', 'Hints Used', 'Completed At'];
    const rows = entries.map((entry, idx) => [
      idx + 1,
      `"${entry.teamName.replace(/"/g, '""')}"`,
      `"${entry.members.join('; ').replace(/"/g, '""')}"`,
      entry.stationId,
      entry.score,
      entry.maxPossibleScore,
      entry.formattedTime,
      entry.isSuccess ? 'SUCCESS' : 'FAILED',
      entry.bonusSolved ? 'YES' : 'NO',
      entry.hintsUsedCount,
      entry.completedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OPERATION_SHADOWBYTE_LEADERBOARD_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl rounded-2xl border border-cyan-500/50 bg-gray-950 p-6 shadow-[0_0_50px_rgba(0,240,255,0.2)] space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300">
              <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  VENUE R201D // FORENSIEXPLORE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  TOTAL ENROLLED: {entries.length} UNITS
                </span>
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-100">
                OPERATION SHADOWBYTE LEADERBOARD
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-cyan-300 border border-cyan-500/40 bg-gray-900 hover:bg-cyan-950/50 transition-colors cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                cyberAudio.playKeyClick();
                onClose();
              }}
              className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-y-auto overflow-x-auto flex-1 font-mono text-xs rounded-xl border border-slate-800 bg-gray-900/50">
          <table className="w-full text-left divide-y divide-slate-800">
            <thead className="bg-gray-900 sticky top-0 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Rank</th>
                <th className="py-3 px-3.5">Team Call Sign</th>
                <th className="py-3 px-3.5">Analysts</th>
                <th className="py-3 px-3.5">Station</th>
                <th className="py-3 px-3.5">Score</th>
                <th className="py-3 px-3.5">Time Taken</th>
                <th className="py-3 px-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-gray-950">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No forensic units have completed the operation yet. Be the first to disarm ShadowByte!
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => {
                  const isCurrent = currentTeamName && entry.teamName.toLowerCase() === currentTeamName.toLowerCase();
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const isThird = idx === 2;

                  return (
                    <tr
                      key={entry.id || idx}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-cyan-950/50 border-l-4 border-cyan-400'
                          : 'hover:bg-gray-900/40'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isFirst && <Medal className="w-4 h-4 text-amber-400 shrink-0" />}
                          {isSecond && <Medal className="w-4 h-4 text-slate-300 shrink-0" />}
                          {isThird && <Medal className="w-4 h-4 text-amber-600 shrink-0" />}
                          <span
                            className={`font-black ${
                              isFirst
                                ? 'text-amber-400'
                                : isSecond
                                ? 'text-slate-200'
                                : isThird
                                ? 'text-amber-500'
                                : 'text-slate-400'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </div>
                      </td>

                      {/* Team Name */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`font-bold ${isCurrent ? 'text-cyan-300' : 'text-slate-100'}`}>
                          {entry.teamName}
                        </span>
                        {isCurrent && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                            YOU
                          </span>
                        )}
                      </td>

                      {/* Members */}
                      <td className="py-3 px-3.5 text-slate-300 text-xs max-w-xs truncate font-medium">
                        {entry.members.join(', ') || 'Anonymous Unit'}
                      </td>

                      {/* Station */}
                      <td className="py-3 px-3.5 text-slate-300 font-semibold whitespace-nowrap">
                        {entry.stationId}
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-black text-[#22D3EE] text-sm">
                          {entry.score}
                        </span>
                        <span className="text-slate-300 text-xs font-semibold"> / {entry.maxPossibleScore || 215}</span>
                        {entry.bonusSolved && (
                          <span className="ml-1 text-xs text-[#C084FC] font-bold" title="Caesar cipher bonus included">
                            (+3★)
                          </span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-200">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{entry.formattedTime}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {entry.isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" />
                            SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-500/40">
                            <XCircle className="w-3 h-3" />
                            TIMEOUT
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 shrink-0 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all leaderboard records? This cannot be undone.')) {
                cyberAudio.playKeyClick();
                onClearLeaderboard();
              }
            }}
            className="text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Leaderboard Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
