import React, { useState } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  HelpCircle, 
  Key, 
  ExternalLink, 
  Send, 
  ShieldAlert,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import type { LevelData, EmailData } from '../../types';
import { validateLevel2 } from '../../utils/validation';
import { cyberAudio } from '../../utils/audio';
import { api } from '../../services/api';

interface Level2Props {
  levelData: LevelData;
  teamId?: string;
  onSolve: (score: number, token: string) => void;
  onRequestHint: (hintIndex: number) => void;
  onNextLevel: () => void;
}

export const Level2Phishing: React.FC<Level2Props> = ({
  levelData,
  teamId,
  onSolve,
  onRequestHint,
  onNextLevel,
}) => {
  const [activeEmailId, setActiveEmailId] = useState<'A' | 'B' | 'C'>('A');
  const [selectedPhishEmail, setSelectedPhishEmail] = useState<'A' | 'B' | 'C' | null>(null);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated email dataset
  const emails: Record<'A' | 'B' | 'C', EmailData> = {
    A: {
      id: 'A',
      from: 'KL University IT Security <admin-verification@klu-security-portal-auth.com>',
      replyTo: 'harvester-relay@foreign-proxy.net',
      to: 'staff-all@kluniversity.in',
      subject: '⚠️ CRITICAL: KL University SSO Account Suspension in 15 Minutes!',
      date: '30 Oct 2026, 13:30:14 (12m prior to incident)',
      preview: 'URGENT SECURITY ALERT: Immediate verification required to prevent permanent termination...',
      body: `URGENT SECURITY ADVISORY // KL UNIVERSITY INFORMATION SERVICES

Dear Campus User,

We have detected suspicious unauthorized authentication attempts originating from a foreign IP address targeting your KL University portal account. 

Pursuant to Campus Security Policy 4.19, your Single Sign-On (SSO) credentials and student/staff access will be PERMANENTLY TERMINATED in 15 MINUTES if you do not immediately verify your account identity.

Click the official secure resolution portal link below to re-authenticate and confirm your password:

>>> http://klu-security-portal-auth.com/sso-verification/login.php <<<

Failure to act immediately will require an in-person clearance with Dean Office administration.

KL University Central Cyber Operations Helpdesk
(This is an automated security broadcast)`,
      isPhishing: true,
      indicators: [
        'Artificial high urgency & coercive time countdown (15 minutes)',
        'Unfamiliar & spoofed lookalike domain (klu-security-portal-auth.com instead of kluniversity.in)',
        'Direct request to input sensitive login credentials on an unverified link',
        'Suspicious external Reply-To header',
      ],
      links: [
        {
          text: 'http://klu-security-portal-auth.com/sso-verification/login.php',
          displayUrl: 'http://klu-security-portal-auth.com/...',
          actualUrl: 'http://klu-security-portal-auth.com/sso-verification/login.php (External Domain / Not kluniversity.in)',
        },
      ],
    },
    B: {
      id: 'B',
      from: 'Registrar Academic Office <academic-calendar@kluniversity.in>',
      to: 'students-all@kluniversity.in',
      subject: 'Notice: Mid-Term Laboratory Exam Timetable Published (Oct/Nov 2026)',
      date: '30 Oct 2026, 10:15:00',
      preview: 'Dear Students, the revised schedule for R201 & R202 laboratory assessments is now available...',
      body: `Dear Students and Faculty,

The revised examination schedule for mid-term laboratory assessments (including Department of Computer Science practicals in R201D) is now accessible via the student intranet.

You may review the timetable by navigating directly to the official campus portal at your regular intranet portal address: https://intranet.kluniversity.in/exams

No credential changes or urgent updates are requested. Please refer questions to the departmental coordinator.

Warm regards,
Office of the Academic Registrar
KL University`,
      isPhishing: false,
      indicators: [
        'Official university domain (kluniversity.in)',
        'No artificial urgency or countdown threats',
        'Directs users to navigate through standard official portal; no credential harvesting',
      ],
      links: [
        {
          text: 'https://intranet.kluniversity.in/exams',
          displayUrl: 'https://intranet.kluniversity.in/exams',
          actualUrl: 'https://intranet.kluniversity.in/exams (Authentic campus intranet)',
        },
      ],
    },
    C: {
      id: 'C',
      from: 'Campus IT Helpdesk <helpdesk@kluniversity.in>',
      to: 'staff-all@kluniversity.in',
      subject: 'Advisory: Scheduled Campus Wi-Fi & Switch Maintenance - Friday 11:00 PM',
      date: '30 Oct 2026, 09:00:22',
      preview: 'Please be advised that core network switches in Block R will undergo routine firmware maintenance...',
      body: `Dear Campus Community,

Please be advised that our IT infrastructure team will perform scheduled firmware patching on campus switches and access points serving Block R on Friday, 31 October 2026, between 11:00 PM and 1:00 AM.

During this window, wireless connectivity in room R201D may experience intermittent disconnects of up to 10 minutes.

This is routine maintenance. No action is required on your part. Do NOT share your login credentials with anyone claiming to perform Wi-Fi optimization.

Sincerely,
Campus Network Operations Center
helpdesk@kluniversity.in`,
      isPhishing: false,
      indicators: [
        'Legitimate internal advisory from official domain',
        'Standard advance maintenance notice with zero credential requests',
        'Explicitly reminds users NOT to share credentials',
      ],
      links: [],
    },
  };

  const hints = [
    'Inspect the sender domain of each email. Does "admin-verification@klu-security-portal-auth.com" match the authentic domain "kluniversity.in"?',
    'Phishing attacks exploit psychological pressure: notice which email uses severe artificial urgency (15-minute suspension) to force victims into clicking a link that asks for credentials.',
  ];

  const handleIndicatorToggle = (indicatorId: string) => {
    cyberAudio.playKeyClick();
    if (selectedIndicators.includes(indicatorId)) {
      setSelectedIndicators(selectedIndicators.filter((i) => i !== indicatorId));
    } else {
      setSelectedIndicators([...selectedIndicators, indicatorId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || levelData.solved) return;

    if (!selectedPhishEmail) {
      setFeedback({
        type: 'error',
        message: 'Please select which email (A, B, or C) represents the phishing attempt.',
      });
      cyberAudio.playAccessDenied();
      return;
    }

    setIsSubmitting(true);
    cyberAudio.playKeyClick();

    const result = validateLevel2(selectedPhishEmail, selectedIndicators);

    // Sync attempt to live backend monitor
    if (teamId) {
      api.validateSubmission({
        teamId,
        level: 2,
        selectedEmail: selectedPhishEmail,
        selectedIndicators: selectedIndicators,
      }).catch(console.error);
    }

    if (result.isValid) {
      cyberAudio.playAccessGranted();
      setFeedback({ type: 'success', message: result.message });
      const finalScore = Math.max(0, levelData.maxPoints - levelData.hintsUsed * 2);
      onSolve(finalScore, 'URGENCY');
    } else {
      cyberAudio.playAccessDenied();
      setFeedback({ type: 'error', message: result.message });
      setTimeout(() => setIsSubmitting(false), 800);
    }
  };

  const currentEmail = emails[activeEmailId];

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl border border-cyan-500/40 bg-gray-950/90 p-6 sm:p-8 shadow-[0_0_35px_rgba(0,240,255,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Mail className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                  STAGE 02 // THREAT TRIAGE
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ALLOCATION: {levelData.maxPoints} PTS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-slate-100 tracking-wide mt-1.5">
                PHISHING VECTOR TRIAGE & ANALYSIS
              </h2>
            </div>
          </div>

          {levelData.solved ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/60 text-emerald-400 font-mono text-xs font-bold glow-green">
              <CheckCircle2 className="w-4 h-4" />
              <span>TOKEN UNLOCKED: [URGENCY] (+{levelData.score} PTS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-mono text-xs">
              <Key className="w-3.5 h-3.5" />
              <span>TOKEN 2 OF 4</span>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs sm:text-sm font-mono text-slate-300 space-y-2 leading-relaxed">
          <p>
            Forensic analysis revealed that the initial breach in R201D was preceded by a targeted spear-phishing wave delivered to staff inboxes. 
          </p>
          <div className="p-3 rounded-lg border border-cyan-500/20 bg-gray-900/60 text-xs text-slate-300">
            <strong className="text-cyan-400 uppercase">Mission Objective:</strong> Audit the 3 intercepted messages in the inbox below. Identify the malicious email and select the critical warning signs that betray the attacker.
          </div>
        </div>
      </div>

      {/* Simulated Email Client UI */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/95 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)]">
        {/* Email Client Topbar */}
        <div className="bg-gray-900 px-4 py-2.5 border-b border-cyan-500/30 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400">
            <Mail className="w-4 h-4" />
            <span className="font-bold">FORENSIC MAIL INTERCEPTOR // INBOX (3 MESSAGES)</span>
          </div>
          <span className="text-slate-400 text-[11px]">TARGET: user-inbox@kluniversity.in</span>
        </div>

        {/* Email Client Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* Left Email List Column (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 bg-gray-950/80 divide-y divide-slate-800/80">
            {(['A', 'B', 'C'] as const).map((id) => {
              const item = emails[id];
              const isSelected = activeEmailId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    cyberAudio.playKeyClick();
                    setActiveEmailId(id);
                  }}
                  className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 border-l-4 border-cyan-400 text-slate-100'
                      : 'hover:bg-gray-900/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-gray-900 text-slate-400'
                    }`}>
                      EMAIL {id}
                    </span>
                    <span className="text-slate-500 text-[10px]">{item.date.split(',')[1]?.trim() || item.date}</span>
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-200">
                    {item.from.split('<')[0]}
                  </div>
                  <div className="text-xs truncate text-cyan-300/90 font-medium">
                    {item.subject}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-1">
                    {item.preview}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Email Preview Reading Pane (7 cols) */}
          <div className="md:col-span-7 p-5 bg-gray-950/60 flex flex-col justify-between space-y-4 font-mono text-xs">
            <div className="space-y-4">
              {/* Header Box */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-gray-900/70 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-sm text-cyan-300">{currentEmail.subject}</span>
                  <span className="text-[10px] text-slate-500">{currentEmail.date}</span>
                </div>
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <div>
                    <span className="text-slate-500">From: </span>
                    <span className="text-slate-200 select-all font-semibold">{currentEmail.from}</span>
                  </div>
                  {currentEmail.replyTo && (
                    <div>
                      <span className="text-amber-400/80 font-bold">Reply-To: </span>
                      <span className="text-amber-300 select-all">{currentEmail.replyTo}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">To: </span>
                    <span className="text-slate-300">{currentEmail.to}</span>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-gray-900/40 whitespace-pre-line text-slate-300 leading-relaxed text-xs">
                {currentEmail.body}
              </div>

              {/* URL Inspection Hover Banner */}
              {currentEmail.links.length > 0 && (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-950/20 text-[11px] text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    EMBEDDED HYPERLINK FORENSIC INSPECTION:
                  </div>
                  {currentEmail.links.map((link, idx) => (
                    <div key={idx} className="break-all text-slate-300 font-mono">
                      <span>Destination URL: </span>
                      <code className="text-amber-400 font-bold bg-black/60 px-2 py-0.5 rounded">{link.actualUrl}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Email Selection Tag */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Currently viewing Email {currentEmail.id}</span>
              <button
                type="button"
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setSelectedPhishEmail(currentEmail.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  selectedPhishEmail === currentEmail.id
                    ? 'bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/60'
                }`}
              >
                {selectedPhishEmail === currentEmail.id
                  ? `EMAIL ${currentEmail.id} MARKED AS THREAT ✓`
                  : `MARK EMAIL ${currentEmail.id} AS THREAT`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Analysis Triage Questions */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gray-950/90 p-6 shadow-[0_0_25px_rgba(0,240,255,0.12)] space-y-6">
        <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          INCIDENT INVESTIGATION CHECKLIST
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Select Email */}
          <div className="space-y-3">
            <label className="block text-sm font-mono font-bold text-[#F8FAFC]">
              1. WHICH MESSAGE IS THE PHISHING ATTEMPT? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono">
              {(['A', 'B', 'C'] as const).map((id) => (
                <label
                  key={id}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    selectedPhishEmail === id
                      ? 'border-red-500 bg-red-950/60 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] ring-2 ring-red-400/50'
                      : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="phishEmail"
                    value={id}
                    checked={selectedPhishEmail === id}
                    onChange={() => {
                      cyberAudio.playKeyClick();
                      setSelectedPhishEmail(id);
                      if (feedback.type) setFeedback({ type: null, message: '' });
                    }}
                    disabled={levelData.solved}
                    className="w-5 h-5 accent-red-500"
                  />
                  <div>
                    <div className="font-black text-base text-[#F8FAFC]">EMAIL {id}</div>
                    <div className="text-xs text-slate-300 truncate max-w-[180px] font-medium">
                      {emails[id].subject}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Question 2: Warning Signs (Urgency, Unfamiliar Domain, Credential Request) */}
          <div className="space-y-3">
            <label className="block text-sm font-mono font-bold text-[#F8FAFC]">
              2. IDENTIFY THE CRITICAL WARNING SIGNS OBSERVED (SELECT ALL THAT APPLY): *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              {[
                {
                  id: 'urgency',
                  label: 'Extreme artificial urgency & coercive countdown threat (15 minutes)',
                },
                {
                  id: 'domain',
                  label: 'Unfamiliar / lookalike domain ("klu-security-portal-auth.com" vs "kluniversity.in")',
                },
                {
                  id: 'credentials',
                  label: 'Direct request to enter passwords / credentials via unverified link',
                },
                {
                  id: 'maintenance',
                  label: 'Routine scheduled maintenance window (Distractor)',
                },
              ].map((item) => {
                const isChecked = selectedIndicators.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-2 ring-cyan-400/40'
                        : 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleIndicatorToggle(item.id)}
                      disabled={levelData.solved}
                      className="w-5 h-5 mt-0.5 accent-cyan-400"
                    />
                    <span className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          {!levelData.solved ? (
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedPhishEmail}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading text-sm font-bold tracking-wider text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'VALIDATING TRIAGE...' : 'SUBMIT PHISHING TRIAGE'}</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>PHISHING VECTOR ISOLATED // TOKEN [URGENCY] UNLOCKED</span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                Email A was an active spear-phishing attack attempting credential harvesting. Attackers spoofed KL University identity using an lookalike domain (<code className="text-emerald-300">klu-security-portal-auth.com</code>) combined with manufactured panic (<strong className="text-emerald-300">URGENCY</strong>) to bypass vigilance.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    cyberAudio.playKeyClick();
                    onNextLevel();
                  }}
                  className="px-6 py-2.5 rounded-lg font-heading text-xs font-bold tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>PROCEED TO LEVEL 3: SIEM LOG ANALYSIS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Feedback Alert */}
        {feedback.message && !levelData.solved && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
              feedback.type === 'error'
                ? 'border-red-500/50 bg-red-950/40 text-red-300 animate-shake'
                : 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Hints */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              INTELLIGENCE HINTS (PENALTY: -2 PTS PER HINT)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Used: {levelData.hintsUsed} / 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hints.map((hintText, idx) => {
              const hintNum = idx + 1;
              const isRevealed = levelData.revealedHints.includes(hintNum);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                    isRevealed
                      ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-200'
                      : 'border-slate-800 bg-gray-900/50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-400">HINT #{hintNum}</span>
                    {isRevealed ? (
                      <span className="text-[10px] text-cyan-400 font-bold">REVEALED (-2 PTS)</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRequestHint(hintNum)}
                        disabled={levelData.solved}
                        className="text-[10px] px-2 py-0.5 rounded border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition-colors cursor-pointer"
                      >
                        REVEAL (-2 PTS)
                      </button>
                    )}
                  </div>
                  <p className={isRevealed ? 'text-slate-300' : 'text-slate-600 italic'}>
                    {isRevealed ? hintText : 'Intelligence encrypted. Click reveal to decrypt hint.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
