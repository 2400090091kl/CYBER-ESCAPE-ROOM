// Client-side answer verification utility for Operation Shadowbyte
// Sanitizes, normalizes, and validates user inputs with rich educational feedback

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateLevel1(input: string): ValidationResult {
  if (!input) {
    return { isValid: false, message: 'Please enter the decoded ASCII keyword.' };
  }

  // Normalize: Trim, remove all quotes (single, double, curly), normalize spaces
  const clean = input
    .trim()
    .toUpperCase()
    .replace(/['"“”`]/g, '')
    .replace(/\s+/g, ' ');

  if (!clean) {
    return { isValid: false, message: 'Please enter the decoded ASCII keyword.' };
  }

  // Acceptable variants: "SAFE", "S A F E", or the full binary stream itself
  if (
    clean === 'SAFE' ||
    clean === 'S A F E' ||
    clean === '01010011 01000001 01000110 01000101' ||
    clean === 'SAFE.'
  ) {
    return {
      isValid: true,
      message: 'TRANSLATION VERIFIED: "SAFE". Decoded 4 ASCII octets successfully. Decryption token acquired.',
    };
  }

  return {
    isValid: false,
    message: 'DECRYPTION FAILED: Byte sequence translation mismatch. Verify each 8-bit octet.',
  };
}

export function validateLevel2(
  selectedEmail: string,
  selectedIndicators: string[]
): ValidationResult {
  if (selectedEmail !== 'A') {
    return {
      isValid: false,
      message: 'ALERT: Selected email is not the primary threat. Review the sender domain and intent closely.',
    };
  }

  // Check if at least 2 key warning signs are marked (urgency, domain, credentials)
  const reqIndicators = ['urgency', 'domain', 'credentials'];
  const matched = reqIndicators.filter((r) => selectedIndicators.includes(r));

  if (matched.length < 2) {
    return {
      isValid: false,
      message:
        'THREAT DETECTED BUT INCOMPLETE ANALYSIS: You identified Email A, but you must identify at least 2 critical warning signs (e.g. Urgency, Unfamiliar Domain, Credential Request).',
    };
  }

  return {
    isValid: true,
    message:
      'PHISHING VECTOR ISOLATED: Email A identified with spoofed domain, artificial urgency, and credential harvesting payload. Token [URGENCY] acquired.',
  };
}

export function validateLevel3(
  accountInput: string,
  indicatorChoice: string,
  remediationChoice: string
): ValidationResult {
  const normAccount = accountInput.trim().toUpperCase().replace(/['"“”`]/g, '');

  if (normAccount !== 'ARUN') {
    return {
      isValid: false,
      message: `ACCOUNT AUDIT FAILED: Account "${normAccount || 'NONE'}" does not match the brute-force pattern. Look for repeated failed attempts followed immediately by a foreign IP success.`,
    };
  }

  if (indicatorChoice !== 'bruteforce_pattern') {
    return {
      isValid: false,
      message:
        'ANALYSIS REQUIRED: Select the primary anomalous pattern observed in the SIEM logs (repeated failed logins followed by a successful login from an unknown device).',
    };
  }

  if (
    remediationChoice !== 'verify_owner_investigate' &&
    remediationChoice !== 'isolate_remediate'
  ) {
    return {
      isValid: false,
      message:
        'RESPONSE REQUIRED: Select the safe authorized incident response action (verify the activity with the account owner and investigate relevant logs using authorized procedures).',
    };
  }

  return {
    isValid: true,
    message:
      'SIEM TRIAGE CONFIRMED: Account ARUN identified under credential brute-force from foreign IP 185.220.101.42. Authorized investigation protocol initiated. Token [ARUN] acquired.',
  };
}

export function validateLevel4(input: string): ValidationResult {
  const norm = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const accepted = [
    'MFA',
    '2FA',
    'MULTIFACTORAUTHENTICATION',
    'MULTIFACTORAUTH',
    'MULTIFACTOR',
    'TWOFACTORAUTHENTICATION',
    'TWOFACTORAUTH',
    'TWOFACTOR',
  ];

  if (!norm) {
    return { isValid: false, message: 'Please enter the cybersecurity concept name or acronym.' };
  }

  if (accepted.includes(norm)) {
    return {
      isValid: true,
      message:
        'IDENTITY DEFENSE VERIFIED: Multi-Factor Authentication (MFA) combines Knowledge (password) with Possession (hardware key/app). Token [MFA] acquired.',
    };
  }

  return {
    isValid: false,
    message:
      'CONCEPT MISMATCH: Hint: Think of the standard acronym for requiring more than one factor of verification (Knowledge + Possession).',
  };
}

export function validateMasterOverride(input: string): ValidationResult {
  const clean = input.trim().toUpperCase().replace(/[\s\-_]+/g, '-');
  const target = 'SAFE-URGENCY-ARUN-MFA';

  if (clean === target || clean === 'SAFEURGENCYARUNMFA') {
    return {
      isValid: true,
      message: 'MASTER OVERRIDE CODE ACCEPTED! Disarm sequence initiated. Rogue enclave neutralized.',
    };
  }

  return {
    isValid: false,
    message:
      'ACCESS DENIED: Master override sequence invalid. Sequence format: TOKEN1-TOKEN2-TOKEN3-TOKEN4',
  };
}

export function validateBonusCaesar(input: string): ValidationResult {
  const norm = input.trim().toUpperCase().replace(/['"“”`\s]/g, '');
  if (norm === 'CRYPTO' || norm === 'SHADOW') {
    return {
      isValid: true,
      message:
        'BONUS CIPHER CRACKED: Transmitted keyword "CRYPTO" successfully deciphered! +3 Bonus points awarded.',
    };
  }
  return {
    isValid: false,
    message:
      'CIPHER MISMATCH: Incorrect plaintext. Shift each letter in "FUBSWR" three positions backward (F-3=C, U-3=R, B-3=Y, S-3=P, W-3=T, R-3=O).',
  };
}
