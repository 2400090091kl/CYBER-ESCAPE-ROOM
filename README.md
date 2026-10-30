# OPERATION SHADOWBYTE
### Cybersecurity Escape Room // ForensiXplore, KL University

> **Event Date:** 30 October 2026  
> **Event Time:** 1:50 PM – 3:50 PM  
> **Venue:** Lab R201D  
> **Duration:** Exactly 60 Minutes (Synchronized Countdown)  
> **Maximum Participants:** 20 Analysts  
> **Difficulty:** Mixed (Beginner to Intermediate)  

---

## 🛡️ Overview

**OPERATION SHADOWBYTE** is an enterprise-grade, browser-based cybersecurity incident response escape room engineered for **ForensiXplore**, Department of Computer Science & Cybersecurity at **KL University**.

The platform is designed to run in **Lab R201D**, providing both a cinematic participant workstation interface and a separate, server-enforced **Organizer Dashboard & Private Answer Key** accessible only via signed cryptographic tokens.

---

## 🚀 Architecture & Security Model

```
                    ┌───────────────────────────────────────────────┐
                    │               Express Backend                 │
                    │               (Port 3001)                     │
                    └───────┬───────────────────────────────┬───────┘
                            │                               │
            Public / Game   │               JWT Protected   │
            Endpoints       │               Organizer Route │
                            ▼                               ▼
               ┌────────────────────────┐      ┌────────────────────────┐
               │   Participant Game     │      │   Organizer Dashboard  │
               │   Route: /             │      │   Route: /organizer    │
               └────────────────────────┘      └────────────────────────┘
```

### Key Capabilities
1. **Server-Enforced Data Privacy:** 
   The private answer key, explanations, and event controls are never delivered to participant bundles or public API responses. Requests to `/api/organizer/*` strictly require a valid signed `Bearer <JWT_TOKEN>`.
2. **Dedicated `/organizer` Route:** 
   A dedicated page with a cybersecurity login portal verifying credentials against server environment secrets (`ORGANIZER_USERNAME` and `ORGANIZER_PASSWORD`).
3. **Real-Time Live Team Monitor:** 
   Live telemetry showing team call signs, station IDs, current levels, last submitted answers, correct/incorrect status badges, hint penalties, and completion state.
4. **Official Scoreboard:** 
   Sorts teams by: Total Score $\to$ Fewer Hints $\to$ Earlier Completion Time. Includes 1-click CSV spreadsheet export for faculty grading.
5. **Centralized Event Controls:** 
   Proctors can start, pause, resume, extend ($+5$m, $+10$m), or reset the countdown timer across all connected lab workstations simultaneously. Also supports manual score corrections with required audit logs.
6. **Data & Synchronization (Local + Supabase):** 
   Works out of the box with zero external configuration using atomic file-backed persistence (`server/data/store.json`). It also includes optional Supabase integration (free tier) by providing `SUPABASE_URL` and `SUPABASE_KEY` in `.env`.

---

## 🛠️ Quick Start & Setup

### Prerequisites
- Node.js (v18 or higher; tested on v25.6.1)
- npm (v9 or higher)

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure credentials in `.env`:
```env
PORT=3001
ORGANIZER_USERNAME=admin
ORGANIZER_PASSWORD=your_secure_organizer_password_here
JWT_SECRET=your_random_secret_token_here
```

### 2. Launching Server & Client Together
Run both the backend API server (port 3001) and Vite frontend client (port 5173):
```powershell
cd C:\Users\kowsh\.gemini\antigravity\scratch\operation-shadowbyte
npm run dev
```

- **Participant Game Workstation:** Open [http://localhost:5173/](http://localhost:5173/)
- **Organizer Command Console:** Open [http://localhost:5173/organizer](http://localhost:5173/organizer)

### 3. Hosting Across Lab R201D (Local Network)
To let all 20 participants and the proctor connect across the R201D network:
```powershell
npm run dev -- --host
```
Vite and Express will output your local IPv4 address (e.g., `http://192.168.1.15:5173`).
- Write `http://192.168.1.15:5173` on the lab whiteboard for participants.
- The organizer accesses `http://192.168.1.15:5173/organizer` and logs in with their password.

---

## 🔑 Official Private Answer Key

*Confidential proctor reference:*

| Level | Objective | Correct Answer & Acceptable Variants | Token Awarded | Scoring |
| :--- | :--- | :--- | :--- | :--- |
| **Level 1** | Binary ASCII Payload (`01010011 01000001 01000110 01000101`) | **`SAFE`** (Accepts `safe`, quotes `"SAFE"`, `S A F E`) | `SAFE` | 10 pts (-2/hint) |
| **Level 2** | Spear-Phishing Triage | **`Email A`** (Warning signs: urgency, unfamiliar domain `klu-security-portal-auth.com`, credential request) | `URGENCY` | 6 pts (-2/hint) |
| **Level 3** | SIEM Log Forensics | Account: **`ARUN`**; Reason: Repeated failed logins followed by successful login from unknown device; Safe Next Step: Verify activity with account owner & investigate logs using authorized procedures | `ARUN` | 8 pts (-2/hint) |
| **Level 4** | Identity Defense (Something you know + something you have) | **`MFA`** (Accepts `Multi-Factor Authentication`, `2FA`) | `MFA` | 8 pts (-2/hint) |
| **Disarm** | Master Override Terminal | **`SAFE-URGENCY-ARUN-MFA`** (Accepts dashes, spaces, concatenation) | `DISARMED` | Neutralizes Breach |
| **Bonus** | Caesar Cipher Cryptanalysis (`FUBSWR` with shift -3) | **`CRYPTO`** (F-3=C, U-3=R, B-3=Y, S-3=P, W-3=T, R-3=O) | `CRYPTO` | +3 pts (Bonus) |

---

## 🧪 Security & Verification Test Suites

Run the 75-point automated security, live telemetry, and validation test suite:
```powershell
npm run test:security
```

Tests verify:
- Complete removal and absence of hardcoded passwords/PINs in source and production builds.
- Fail-secure behavior (`SERVER_CREDENTIALS_NOT_CONFIGURED`) when environment secrets are unset.
- `401 Unauthorized` enforcement across all `/api/organizer/*` endpoints without a signed JWT.
- Zero answer leaks in participant-facing API responses or client bundles.
- Real-time team registration, multi-player same-team deduplication, and multi-team enclave isolation.
- Telemetry synchronization of live submissions, level advances, scores, and hint penalties.
- Validation of all acceptable answer variants across Levels 1–4, Master Override, and Bonus.
- Level 1 bugfix (strips quotes, normalizes spaces, case-insensitivity).
- Timer controls (`start`, `pause`, `resume`, `add_time`) and confirmed reset safeguard.

---

## 🎓 Credits & Integrity

Engineered for **ForensiXplore Club**, Department of Computer Science & Cybersecurity, **KL University**.  
*All scenarios, IPs, logs, and emails are 100% simulated models for educational cyber training.*
