import { SignJWT, jwtVerify } from 'jose';
import { generateToken, hashSHA256 } from '@arzan/utils';

export interface SessionPayload {
  userId: string;
  portalId?: string;
  email: string;
  role?: string;
  expiresAt: Date;
}

export interface SessionConfig {
  secret: string;
  maxAge?: number; // в секундах, по умолчанию 7 дней
  cookieName?: string;
}

const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60; // 7 дней

/**
 * Создание JWT токена сессии
 */
export async function createSessionToken(
  payload: Omit<SessionPayload, 'expiresAt'>,
  config: SessionConfig
): Promise<{ token: string; expiresAt: Date }> {
  const maxAge = config.maxAge ?? DEFAULT_MAX_AGE;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  const secret = new TextEncoder().encode(config.secret);

  const token = await new SignJWT({
    ...payload,
    expiresAt: expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  return { token, expiresAt };
}

/**
 * Верификация JWT токена сессии
 */
export async function verifySessionToken(
  token: string,
  config: SessionConfig
): Promise<SessionPayload | null> {
  try {
    const secret = new TextEncoder().encode(config.secret);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      portalId: payload.portalId as string | undefined,
      email: payload.email as string,
      role: payload.role as string | undefined,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}

/**
 * Генерация токена для cookie (более короткий)
 */
export function generateSessionId(): string {
  return generateToken(32);
}

/**
 * Хеширование токена сессии для хранения в БД
 */
export function hashSessionToken(token: string): string {
  return hashSHA256(token);
}

/**
 * Проверка истечения сессии
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}

/**
 * Создание cookie options
 */
export function getSessionCookieOptions(
  expiresAt: Date,
  secure = true
): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  expires: Date;
  path: string;
} {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  };
}
