import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'crypto';

/**
 * Генерация случайного токена
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Генерация UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Хеширование SHA-256
 */
export function hashSHA256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Шифрование AES-256-GCM
 */
export function encrypt(text: string, secret: string): string {
  const key = createHash('sha256').update(secret).digest();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Дешифрование AES-256-GCM
 */
export function decrypt(encryptedData: string, secret: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const key = createHash('sha256').update(secret).digest();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Генерация случайного кода (для OTP, verification)
 */
export function generateCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  const bytes = randomBytes(length);

  for (let i = 0; i < length; i++) {
    code += digits[bytes[i] % 10];
  }

  return code;
}

/**
 * Безопасное сравнение строк (timing-safe)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return require('crypto').timingSafeEqual(bufA, bufB);
}
