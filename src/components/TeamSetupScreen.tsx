import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  X, 
  Terminal, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Monitor,
  Shield
} from 'lucide-react';
import type { TeamInfo } from '../types';
import { cyberAudio } from '../utils/audio';

interface TeamSetupScreenProps {
  initialTeam: TeamInfo;
  onConfirmTeam: (team: TeamInfo) => void;
  onBack: () => void;
}

export const TeamSetupScreen: React.FC<TeamSetupScreenProps> = ({
  initialTeam,
  onConfirmTeam,
  onBack,
}) => {
  const [teamName, setTeamName] = useState(initialTeam.name || '');
  const [stationId, setStationId] = useState(initialTeam.stationId || 'Station-01');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>(
    initialTeam.members.length > 0 ? initialTeam.members : []
  );
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = () => {
    const trimmed = memberInput.trim();
    if (!trimmed) return;
    if (members.length >= 5) {
      setError('Maximum 5 analysts allowed per team enclave.');
      cyberAudio.playAccessDenied();
      return;
    }
    if (members.includes(trimmed)) {
      setError('Member name is already registered.');
      cyberAudio.playAccessDenied();
      return;
    }
    cyberAudio.playKeyClick();
    setMembers([...members, trimmed]);
    setMemberInput('');
    setError(null);
  };

  const handleRemoveMember = (indexToRemove: number) => {
    cyberAudio.playKeyClick();
    setMembers(members.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('Team Call Sign / Name is required to initialize enclave.');
      cyberAudio.playAccessDenied();
      return;
    }
    if (members.length === 0) {
      setError('Please add at least one analyst member to the team.');
      cyberAudio.playAccessDenied();
      return;
    }

    cyberAudio.playAccessGranted();
    onConfirmTeam({
      name: teamName.trim(),
      members: members,
      stationId: stationId,
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 max-w-2xl mx-auto z-10">
      <div className="w-full rounded-2xl border border-cyan-500/40 bg-gray-950/90 shadow-[0_0_35px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-900 via-cyan-950/40 to-gray-900 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-cyan-300">
                FORENSIC UNIT ENCLAVE SETUP
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Register analyst credentials for the R201D terminal session
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950 text-cyan-300">
            STEP 1 OF 2
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/50 bg-red-950/40 text-red-300 text-xs font-mono animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Team Name */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">
              TEAM CALL SIGN / NAME *
            </label>
            <div className="relative">
              <input
                type="text"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. CyberGuardians, HexHunters, ByteForce"
                className="w-full px-5 py-3.5 rounded-xl border-2 border-slate-600 bg-slate-900 font-mono text-base font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-cyan-400 transition-colors"
                maxLength={30}
                required
              />
              <Terminal className="w-4 h-4 absolute right-3.5 top-3.5 text-cyan-500/50" />
            </div>
          </div>

          {/* Station Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5" />
              ASSIGNED LAB TERMINAL (R201D)
            </label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-cyan-500/30 bg-gray-900 font-mono text-sm text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {Array.from({ length: 20 }, (_, i) => {
                const num = (i + 1).toString().padStart(2, '0');
                return (
                  <option key={`station-${num}`} value={`Station-${num}`}>
                    Station-{num} (Lab R201D Workstation #{num})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">
                ANALYST MEMBERS ({members.length}/5) *
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Max 5 per unit (Room capacity: 20)
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                placeholder="Enter analyst name & press Add (or Enter)"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 font-mono text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-cyan-400"
                maxLength={25}
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2.5 rounded-lg font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-black flex items-center gap-1 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>ADD</span>
              </button>
            </div>

            {/* Member Chips */}
            <div className="flex flex-wrap gap-2 pt-2 min-h-[44px] items-center">
              {members.length === 0 ? (
                <span className="text-xs font-mono text-slate-600 italic">
                  No analysts added yet. Add at least one member.
                </span>
              ) : (
                members.map((m, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs font-mono animate-fade-in"
                  >
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>{m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="ml-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                cyberAudio.playKeyClick();
                onBack();
              }}
              className="px-4 py-2.5 rounded-lg font-mono text-xs text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO BRIEFING</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-heading text-sm font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>PROCEED TO PROTOCOL RULES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
