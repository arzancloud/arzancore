/**
 * Задержка выполнения
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry с экспоненциальным backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
  } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      await sleep(Math.min(delay, maxDelay));
      delay *= factor;
    }
  }

  throw lastError;
}

/**
 * Debounce функция
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle функция
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Глубокое клонирование объекта
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Проверка что объект пустой
 */
export function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Удаление undefined значений из объекта
 */
export function removeUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Группировка массива по ключу
 */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey =
        typeof key === 'function' ? key(item) : String(item[key]);

      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);

      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Уникальные значения массива
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Пагинация массива
 */
export function paginate<T>(
  array: T[],
  page: number,
  limit: number
): { data: T[]; total: number; pages: number; page: number } {
  const total = array.length;
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = array.slice(offset, offset + limit);

  return { data, total, pages, page };
}

/**
 * Форматирование числа с разделителями
 */
export function formatNumber(num: number, locale = 'ru-RU'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Форматирование денег
 */
export function formatMoney(
  amount: number,
  currency = 'KZT',
  locale = 'ru-RU'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Форматирование даты
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'ru-RU'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Относительное время (5 минут назад, через 2 часа)
 */
export function formatRelativeTime(
  date: Date | string,
  locale = 'ru-RU'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) {
    return rtf.format(diffSec, 'second');
  }
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute');
  }
  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour');
  }
  return rtf.format(diffDay, 'day');
}

/**
 * Truncate строки
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Capitalize первой буквы
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * CamelCase to kebab-case
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * kebab-case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Генерация slug из строки
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Парсинг query string
 */
export function parseQueryString(query: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(query));
}

/**
 * Построение query string
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== ''
  );
  return new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)])
  ).toString();
}

/**
 * Omit keys from object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

/**
 * Pick keys from object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}
