import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = {
  N: 16384, // CPU/memory cost parameter
  r: 8, // Block size
  p: 1, // Parallelization parameter
};

/**
 * Хеширование пароля с использованием scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);

  const derivedKey = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH,
    SCRYPT_PARAMS
  )) as Buffer;

  // Формат: salt:hash (оба в hex)
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

/**
 * Проверка пароля
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const [saltHex, hashHex] = hashedPassword.split(':');

    if (!saltHex || !hashHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const storedHash = Buffer.from(hashHex, 'hex');

    const derivedKey = (await scryptAsync(
      password,
      salt,
      KEY_LENGTH,
      SCRYPT_PARAMS
    )) as Buffer;

    // Безопасное сравнение для предотвращения timing attacks
    return timingSafeEqual(derivedKey, storedHash);
  } catch {
    return false;
  }
}

/**
 * Проверка силы пароля
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Пароль должен быть минимум 8 символов');
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Используйте заглавные и строчные буквы');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Добавьте цифры');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Добавьте специальные символы');
  }

  // Проверка на распространённые пароли
  const commonPasswords = [
    'password',
    '123456',
    'qwerty',
    'admin',
    'letmein',
    'welcome',
  ];
  if (commonPasswords.some((p) => password.toLowerCase().includes(p))) {
    score = Math.max(0, score - 2);
    feedback.push('Не используйте распространённые пароли');
  }

  return { score: Math.min(4, score), feedback };
}
