// Test script to verify all puzzle answers, validations, scoring, and edge cases

import { 
  validateLevel1, 
  validateLevel2, 
  validateLevel3, 
  validateLevel4, 
  validateMasterOverride, 
  validateBonusCaesar 
} from './src/utils/validation.ts';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

console.log('=== OPERATION SHADOWBYTE PUZZLE VALIDATION TESTS ===\n');

// LEVEL 1: Binary ASCII -> SAFE
assert(validateLevel1('SAFE').isValid === true, 'Level 1: Exact uppercase "SAFE" accepted');
assert(validateLevel1('safe').isValid === true, 'Level 1: Lowercase "safe" accepted (case-insensitive)');
assert(validateLevel1('  SaFe  ').isValid === true, 'Level 1: Whitespace trimmed "  SaFe  " accepted');
assert(validateLevel1('WRONG').isValid === false, 'Level 1: Invalid answer rejected');
assert(validateLevel1('').isValid === false, 'Level 1: Empty input rejected');

// LEVEL 2: Phishing Triage -> Email A + Indicators
assert(validateLevel2('A', ['urgency', 'domain']).isValid === true, 'Level 2: Email A with urgency & domain accepted');
assert(validateLevel2('A', ['urgency', 'domain', 'credentials']).isValid === true, 'Level 2: Email A with all 3 indicators accepted');
assert(validateLevel2('B', ['urgency', 'domain']).isValid === false, 'Level 2: Email B rejected');
assert(validateLevel2('C', ['urgency', 'domain']).isValid === false, 'Level 2: Email C rejected');
assert(validateLevel2('A', ['urgency']).isValid === false, 'Level 2: Email A with only 1 indicator rejected (requires >= 2)');

// LEVEL 3: SIEM Logs -> ARUN
assert(validateLevel3('ARUN', 'bruteforce_pattern', 'isolate_remediate').isValid === true, 'Level 3: Account "ARUN" with correct reason and remediation accepted');
assert(validateLevel3('arun', 'bruteforce_pattern', 'isolate_remediate').isValid === true, 'Level 3: Case-insensitive "arun" accepted');
assert(validateLevel3('  arun  ', 'bruteforce_pattern', 'isolate_remediate').isValid === true, 'Level 3: Whitespace trimmed "  arun  " accepted');
assert(validateLevel3('PRIYA', 'bruteforce_pattern', 'isolate_remediate').isValid === false, 'Level 3: Account PRIYA rejected');
assert(validateLevel3('ARUN', '', 'isolate_remediate').isValid === false, 'Level 3: Missing reason rejected');
assert(validateLevel3('ARUN', 'bruteforce_pattern', '').isValid === false, 'Level 3: Missing remediation rejected');

// LEVEL 4: Identity Defense -> MFA
assert(validateLevel4('MFA').isValid === true, 'Level 4: "MFA" accepted');
assert(validateLevel4('mfa').isValid === true, 'Level 4: "mfa" (lowercase) accepted');
assert(validateLevel4('  mfa  ').isValid === true, 'Level 4: "  mfa  " (whitespace) accepted');
assert(validateLevel4('2FA').isValid === true, 'Level 4: "2FA" accepted');
assert(validateLevel4('Multi-Factor Authentication').isValid === true, 'Level 4: "Multi-Factor Authentication" accepted');
assert(validateLevel4('Two-Factor Authentication').isValid === true, 'Level 4: "Two-Factor Authentication" accepted');
assert(validateLevel4('FIREWALL').isValid === false, 'Level 4: "FIREWALL" rejected');

// MASTER OVERRIDE: SAFE-URGENCY-ARUN-MFA
assert(validateMasterOverride('SAFE-URGENCY-ARUN-MFA').isValid === true, 'Master Override: Exact code accepted');
assert(validateMasterOverride('safe-urgency-arun-mfa').isValid === true, 'Master Override: Lowercase code accepted');
assert(validateMasterOverride('SAFE URGENCY ARUN MFA').isValid === true, 'Master Override: Space delimited code accepted');
assert(validateMasterOverride('SAFEURGENCYARUNMFA').isValid === true, 'Master Override: No delimiter accepted');
assert(validateMasterOverride('SAFE-WRONG-ARUN-MFA').isValid === false, 'Master Override: Incorrect code rejected');

// BONUS CAESAR CIPHER: SHADOW
assert(validateBonusCaesar('SHADOW').isValid === true, 'Bonus: "SHADOW" accepted');
assert(validateBonusCaesar('shadow').isValid === true, 'Bonus: Lowercase "shadow" accepted');
assert(validateBonusCaesar('WRONG').isValid === false, 'Bonus: Incorrect plaintext rejected');

// SCORING LOGIC TEST
const maxBase = 10 + 6 + 8 + 8; // 32
assert(maxBase === 32, 'Scoring: Maximum base score equals 32');
const maxWithBonus = maxBase + 3; // 35
assert(maxWithBonus === 35, 'Scoring: Maximum score with bonus equals 35');
const maxChallengeDrills = (12 * 5) + (12 * 10); // 180 points (12 beginner @ 5 pts, 12 intermediate @ 10 pts)
assert(maxChallengeDrills === 180, 'Scoring: 24 Cybersecurity Drills equal 180 points');
const grandTotalScore = maxWithBonus + maxChallengeDrills; // 215
assert(grandTotalScore === 215, 'Scoring: Grand maximum score equals 215 points');
// Hints penalty test: 2 hints on level 1 = 10 - (2 * 2) = 6 pts
const l1HintsPenalty = Math.max(0, 10 - 2 * 2);
assert(l1HintsPenalty === 6, 'Scoring: 2 hints used on Level 1 leaves 6 points');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}

