// Re-export client (React hooks)
export * from './client';

// Types
export type { SessionPayload, SessionConfig } from './server/session';
export type { User, Portal, AuthContextValue } from './client/AuthContext';
export type { PasswordValidationResult, PasswordRequirements } from './server/security';
