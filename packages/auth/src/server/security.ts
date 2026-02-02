import { createHmac, randomBytes } from 'crypto';

/**
 * Authentication Security Utilities
 * - Password complexity validation
 * - Account lockout after failed attempts
 * - TOTP (2FA) support
 */

// ============================================
// PASSWORD COMPLEXITY VALIDATION
// ============================================

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength: number;
}

const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'password1',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master',
];

/**
 * Validate password complexity
 */
export function validatePassword(
  password: string,
  requirements: Partial<PasswordRequirements> = {}
): PasswordValidationResult {
  const reqs = { ...DEFAULT_PASSWORD_REQUIREMENTS, ...requirements };
  const errors: string[] = [];
  let score = 0;

  // Length checks
  if (password.length < reqs.minLength) {
    errors.push(`Password must contain at least ${reqs.minLength} characters`);
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  if (password.length > reqs.maxLength) {
    errors.push(`Password cannot be longer than ${reqs.maxLength} characters`);
  }

  // Uppercase check
  if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // Lowercase check
  if (reqs.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }

  // Number check
  if (reqs.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  } else if (/[0-9]/.test(password)) {
    score += 1;
  }

  // Special character check
  if (reqs.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    score += 1;
  }

  // Common password check
  if (COMMON_PASSWORDS.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too simple or common');
    score = Math.max(0, score - 2);
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain three identical characters in a row');
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2 || errors.length > 0) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

// ============================================
// ACCOUNT LOCKOUT
// ============================================

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

// In-memory store for login attempts (should be Redis in production)
const loginAttempts = new Map<string, LoginAttempt>();

// Configuration
const LOCKOUT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes
  progressiveLockout: true,
};

/**
 * Get the key for tracking login attempts
 */
function getAttemptKey(email: string, ip: string): string {
  return `${email.toLowerCase()}:${ip}`;
}

/**
 * Check if account is locked
 */
export function isAccountLocked(email: string, ip: string): {
  locked: boolean;
  remainingMs?: number;
  attemptsRemaining?: number;
} {
  const key = getAttemptKey(email, ip);
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return { locked: false, attemptsRemaining: LOCKOUT_CONFIG.maxAttempts };
  }

  const now = Date.now();

  // Check if locked
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      locked: true,
      remainingMs: attempt.lockedUntil - now,
    };
  }

  // Check if window expired - reset attempts
  if (now - attempt.firstAttempt > LOCKOUT_CONFIG.windowMs) {
    loginAttempts.delete(key);
    return { locked: false, attemptsRemaining: LOCKOUT_CONFIG.maxAttempts };
  }

  const attemptsRemaining = Math.max(0, LOCKOUT_CONFIG.maxAttempts - attempt.count);
  return { locked: false, attemptsRemaining };
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(email: string, ip: string): {
  locked: boolean;
  remainingAttempts: number;
  lockoutMs?: number;
} {
  const key = getAttemptKey(email, ip);
  const now = Date.now();
  let attempt = loginAttempts.get(key);

  if (!attempt || now - attempt.firstAttempt > LOCKOUT_CONFIG.windowMs) {
    attempt = {
      count: 1,
      firstAttempt: now,
      lockedUntil: null,
    };
  } else {
    attempt.count += 1;
  }

  // Check if should lock
  if (attempt.count >= LOCKOUT_CONFIG.maxAttempts) {
    let lockoutDuration = LOCKOUT_CONFIG.lockoutMs;
    if (LOCKOUT_CONFIG.progressiveLockout && attempt.lockedUntil) {
      lockoutDuration = Math.min(lockoutDuration * 2, 24 * 60 * 60 * 1000); // Max 24 hours
    }

    attempt.lockedUntil = now + lockoutDuration;
    loginAttempts.set(key, attempt);

    return {
      locked: true,
      remainingAttempts: 0,
      lockoutMs: lockoutDuration,
    };
  }

  loginAttempts.set(key, attempt);

  return {
    locked: false,
    remainingAttempts: LOCKOUT_CONFIG.maxAttempts - attempt.count,
  };
}

/**
 * Clear login attempts after successful login
 */
export function clearLoginAttempts(email: string, ip: string): void {
  const key = getAttemptKey(email, ip);
  loginAttempts.delete(key);
}

/**
 * Manually unlock an account (admin function)
 */
export function unlockAccount(email: string): void {
  for (const [key] of loginAttempts.entries()) {
    if (key.startsWith(email.toLowerCase() + ':')) {
      loginAttempts.delete(key);
    }
  }
}

// ============================================
// 2FA TOTP UTILITIES
// ============================================

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let result = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      result += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return result;
}

function base32Decode(str: string): Buffer {
  const cleanStr = str.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleanStr.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleanStr[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a random TOTP secret (base32 encoded)
 */
export function generateTotpSecret(): string {
  const buffer = randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generate TOTP code for a given secret and time
 */
export function generateTotpCode(secret: string, time?: number): string {
  const now = time || Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(now / 30);

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep));

  const decodedSecret = base32Decode(secret);
  const hmac = createHmac('sha1', decodedSecret);
  hmac.update(timeBuffer);
  const hash = hmac.digest();

  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verify TOTP code with time window tolerance
 */
export function verifyTotpCode(secret: string, code: string, window: number = 1): boolean {
  const now = Math.floor(Date.now() / 1000);

  for (let i = -window; i <= window; i++) {
    const time = now + (i * 30);
    const expectedCode = generateTotpCode(secret, time);
    if (timingSafeEqual(code, expectedCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate TOTP URI for authenticator apps
 */
export function generateTotpUri(
  secret: string,
  email: string,
  issuer: string = 'Arzan'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate backup codes for 2FA recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}
