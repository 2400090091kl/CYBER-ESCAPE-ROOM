# FORENSIEXPLORE // PROCTOR & ORGANIZER GUIDE
## OPERATION SHADOWBYTE ESCAPE ROOM
**KL University — Venue R201D (30 October 2026, 1:50 PM – 3:50 PM)**

---

## 🔒 Accessing the Secure Organizer Dashboard

The Organizer Dashboard is accessible at the dedicated route:
👉 **`http://localhost:5173/organizer`**  
*(Or `http://<YOUR_IP>:5173/organizer` over the R201D local network)*

### Organizer Login Credentials
- **Username:** Configured via `ORGANIZER_USERNAME` in `.env` (default: `admin`)
- **Password:** Configured via `ORGANIZER_PASSWORD` in `.env` (configured securely on your server)
- *Authentication Model:* The frontend performs a secure `POST /api/organizer/login` to the Express backend. The server validates against server-side environment variables and issues an authenticated JSON Web Token (JWT) signed by `JWT_SECRET`. Unauthorized requests to `/api/organizer/*` return `401 Unauthorized`. If server credentials are unset, the server fails securely with HTTP 500.

---

## 📋 Dashboard Features Walkthrough

### 1. Event Overview
- **Live Status Badge:** Indicates whether the synchronized timer is `NOT_STARTED`, `RUNNING`, `PAUSED`, or `COMPLETED`.
- **Live Clocks:** Displays synchronized remaining and elapsed times for the 60-minute session.
- **Participation Telemetry:** Real-time counters for registered teams, active teams currently investigating, and teams that successfully disarmed the system.

### 2. Private Answer Key (Server-Enforced)
- **Level 1 (Binary Decode - 10 Pts):**
  - Cipher: `01010011 01000001 01000110 01000101`
  - Answer: `SAFE`
  - Variants: `SAFE`, `safe`, `"SAFE"`, `'SAFE'`, `S A F E`
  - Rationale: 4 ASCII octets (83='S', 65='A', 70='F', 69='E').
- **Level 2 (Phishing Triage - 6 Pts):**
  - Phishing Email: `Email A`
  - Warning Signs: Urgency (15-min countdown threat), unfamiliar domain (`klu-security-portal-auth.com` vs official `kluniversity.in`), credential harvesting request.
  - Token Awarded: `URGENCY`
- **Level 3 (SIEM Log Forensics - 8 Pts):**
  - Compromised Account: `ARUN`
  - Pattern: Repeated failed logins followed by a successful login from an unknown device (`185.220.101.42`).
  - Safe Next Step: Verify the activity with the account owner and investigate relevant logs using authorized procedures.
  - Token Awarded: `ARUN`
- **Level 4 (Identity Defense - 8 Pts):**
  - Concept: `MFA` (Accepts `Multi-Factor Authentication`, `2FA`, `Two-Factor Authentication`).
  - Definition: Combines Knowledge (password) with Possession (hardware key/app).
  - Token Awarded: `MFA`
- **Master Disarm Sequence:** `SAFE-URGENCY-ARUN-MFA`
- **Optional Bonus (Caesar Cipher - +3 Pts):**
  - Ciphertext: `FUBSWR`
  - Rule: Shift each letter three positions backward: F(-3)=C, U(-3)=R, B(-3)=Y, S(-3)=P, W(-3)=T, R(-3)=O.
  - Answer: `CRYPTO`

### 3. Live Team Monitor
- **Active Enclaves & Status Pips:** Real-time view of every workstation in Lab R201D (Stations 01–20).
- **Auto-Refresh Telemetry:** Polls backend every 2.5 seconds with live sync timestamp and status indicator.
- **Status Filtering:** One-click filter pills for `ALL`, `PLAYING`, `REGISTERED`, `PAUSED`, `COMPLETED`, and `INACTIVE`.
- **Flexible Sorting:** Sort live teams by Highest Score, Current Level, Recent Activity, Team Name, or Station ID.
- **Dual Display Modes:** Instant toggle between detailed Responsive Cards View and dense Table View.
- **Comprehensive Station Telemetry:**
  - Station ID (e.g., `Station-04`) and unique system ID (`team-179329...`).
  - Analyst team roster (e.g., `2 Analysts: Ananya S., Rohan M.`).
  - Stage progression pips for Level 1 (Binary), Level 2 (Phishing), Level 3 (SIEM Logs), Level 4 (MFA), and Bonus (+3).
  - Scoring & hint deductions (-2 pts per hint).
  - Clocks: Start Time, Elapsed Time, and relative Last Activity (e.g., `4s ago`).
  - Completion Time: Exact finish timestamp and total duration when escaped.
- **Last Attempt Telemetry:** Displays the team's most recent answer submission, timestamp, evaluator message, and visual status (`CORRECT` in green, `INCORRECT` in red).
- **Expandable Audit Trail:** Click any team to inspect their complete submission history and score changes.
- **Proctor Shortcut:** Quick "Adjust Score" button directly on each team to correct scores with mandatory audit logging.

### 4. Official Scoreboard
- **Ranking Criteria:**
  1. Highest Total Score (32 base + 3 bonus max).
  2. Fewer hints requested.
  3. Earlier completion timestamp.
- **Round-by-Round Breakdown:** Individual columns for Rounds 1–4, Bonus, and Hint Deductions (-2 pts each).
- **Export CSV:** One-click spreadsheet download for event coordinator archives.

### 5. Centralized Event Controls
- **Synchronized Countdown:** Click **START 60:00 CLOCK** to trigger the synchronized timer across all participant screens.
- **Pause & Resume:** Freeze or continue the session clock during lab announcements.
- **Add Time:** Add `+5 Minutes` or `+10 Minutes` to all teams if technical or network interruptions occur in the lab.
- **Manual Score Adjustment:** Select a team, input a score adjustment (e.g., $+2$ or $-2$), and enter an audit reason.
- **Toggle Leaderboard:** Hide or reveal the public leaderboard on participant screens.
- **Reset Event Data:** Destructive reset that wipes test teams and restores baseline timer. Protected by an explicit confirmation safeguard.

---

## 🌐 Multi-Device Synchronization & LAN Hosting (Lab R201D)

- **Authoritative Backend Server:** The organizer's machine runs the backend API and database on port 3001. All participant devices communicate with this single server.
- **Local Network Hosting:**
  1. Proctor machine runs:
     ```powershell
     npm run dev -- --host
     ```
  2. Vite outputs your LAN address (e.g., `http://192.168.1.15:5173`).
  3. Participants connect on their laptops/phones via:
     `http://192.168.1.15:5173/`
  4. Organizer accesses:
     `http://localhost:5173/organizer` (or `http://192.168.1.15:5173/organizer`).
- **Same-Team Multi-Analyst Sync:** When analysts on the same team enter the same Team Call Sign (e.g. `ShadowHunters`), the server merges them into the same team enclave ID, keeping scores and progress synchronized across devices.
- **Cloud Persistence (Optional Hosted Event):** If hosting across separate internet networks, provide `SUPABASE_URL` and `SUPABASE_KEY` in `.env`. Local file persistence (`server/data/store.json`) is the default and requires zero internet connection.

---

## 🧪 Verification Commands

To verify security, authorization, and answer checking before the event:
```powershell
npm run test:security
```
Expected output: **`TEST RESULTS: 55 PASSED, 0 FAILED`**.
