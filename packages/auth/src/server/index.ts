// Session management
export {
  createSessionToken,
  verifySessionToken,
  generateSessionId,
  hashSessionToken,
  isSessionExpired,
  getSessionCookieOptions,
  type SessionPayload,
  type SessionConfig,
} from './session';

// Password utilities
export {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
} from './password';

// Security utilities
export {
  // Password validation
  validatePassword,
  type PasswordValidationResult,
  type PasswordRequirements,
  // Account lockout
  isAccountLocked,
  recordFailedLogin,
  clearLoginAttempts,
  unlockAccount,
  // TOTP (2FA)
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  generateTotpUri,
  generateBackupCodes,
} from './security';

// Module auth middleware
export {
  checkAccess,
  createHonoAuthMiddleware,
  createExpressAuthMiddleware,
  hasPermission,
  checkLimit,
  requirePermission,
  requireLimit,
  type ModuleAuthConfig,
  type AuthContext,
  type AccessCheckResponse,
} from './middleware';
