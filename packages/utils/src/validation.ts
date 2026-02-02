import { z } from 'zod';

// ============== БАЗОВЫЕ СХЕМЫ ==============

/**
 * Email валидация
 */
export const emailSchema = z
  .string()
  .email('Некорректный email')
  .toLowerCase()
  .trim();

/**
 * Пароль валидация (минимум 8 символов, буквы и цифры)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен быть минимум 8 символов')
  .regex(/[a-zA-Z]/, 'Пароль должен содержать буквы')
  .regex(/[0-9]/, 'Пароль должен содержать цифры');

/**
 * Телефон валидация
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{10,14}$/, 'Некорректный номер телефона');

/**
 * UUID валидация
 */
export const uuidSchema = z.string().uuid('Некорректный UUID');

/**
 * Subdomain валидация (только буквы, цифры, дефис)
 */
export const subdomainSchema = z
  .string()
  .min(3, 'Минимум 3 символа')
  .max(63, 'Максимум 63 символа')
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Только буквы, цифры и дефис')
  .refine(
    (val) => !val.includes('--'),
    'Двойной дефис не разрешен'
  );

/**
 * Slug валидация
 */
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Некорректный slug');

// ============== ХЕЛПЕРЫ ==============

/**
 * Проверка email
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Проверка телефона
 */
export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

/**
 * Проверка UUID
 */
export function isValidUUID(uuid: string): boolean {
  return uuidSchema.safeParse(uuid).success;
}

/**
 * Проверка subdomain
 */
export function isValidSubdomain(subdomain: string): boolean {
  return subdomainSchema.safeParse(subdomain).success;
}

/**
 * Нормализация email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Нормализация телефона (убирает всё кроме цифр и +)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

// ============== ЗАРЕЗЕРВИРОВАННЫЕ SUBDOMAINS ==============

export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'app',
  'admin',
  'portal',
  'dashboard',
  'login',
  'register',
  'signup',
  'signin',
  'auth',
  'oauth',
  'mail',
  'email',
  'smtp',
  'imap',
  'pop',
  'ftp',
  'sftp',
  'cdn',
  'static',
  'assets',
  'media',
  'images',
  'img',
  'files',
  'uploads',
  'download',
  'docs',
  'documentation',
  'help',
  'support',
  'status',
  'blog',
  'news',
  'legal',
  'privacy',
  'terms',
  'billing',
  'pay',
  'payment',
  'checkout',
  'shop',
  'store',
  'crm',
  'erp',
  'hr',
  'test',
  'dev',
  'staging',
  'demo',
  'sandbox',
  'arzan',
  'arzancloud',
];

/**
 * Проверка что subdomain не зарезервирован
 */
export function isSubdomainAvailable(subdomain: string): boolean {
  return !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}
