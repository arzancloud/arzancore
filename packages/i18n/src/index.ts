/**
 * @arzan/i18n - Internationalization package for Arzan ecosystem
 */

export {
  translations,
  DEFAULT_LANGUAGE,
  type SupportedLanguage,
} from './translations';

import { translations, DEFAULT_LANGUAGE, type SupportedLanguage } from './translations';

/**
 * Get translation for a key
 */
export function t(
  key: string,
  lang?: SupportedLanguage,
  params?: Record<string, string | number>
): string {
  const language = lang || DEFAULT_LANGUAGE;
  const langTranslations = translations[language] || translations[DEFAULT_LANGUAGE];
  let text = langTranslations[key] || translations[DEFAULT_LANGUAGE][key] || key;

  // Replace parameters like {{name}} with actual values
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
    });
  }

  return text;
}

/**
 * Create a translator function bound to a specific language
 */
export function createTranslator(lang: SupportedLanguage) {
  return (key: string, params?: Record<string, string | number>) => t(key, lang, params);
}

/**
 * Parse Accept-Language header to get preferred language
 */
export function parseAcceptLanguage(header?: string): SupportedLanguage {
  if (!header) return DEFAULT_LANGUAGE;

  const languages = header.split(',').map(lang => {
    const [code, qValue] = lang.trim().split(';q=');
    return {
      code: code.split('-')[0].toLowerCase(),
      q: qValue ? parseFloat(qValue) : 1,
    };
  }).sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (code in translations) {
      return code as SupportedLanguage;
    }
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get language from request context
 * For use in server-side code (Hono, Express, etc.)
 */
export function getLanguageFromRequest(c: {
  req: {
    header: (name: string) => string | undefined;
    query: (name: string) => string | undefined;
  }
}): SupportedLanguage {
  // Check query param first (for explicit override)
  const queryLang = c.req.query('lang');
  if (queryLang && queryLang in translations) {
    return queryLang as SupportedLanguage;
  }

  // Check Accept-Language header
  const acceptLanguage = c.req.header('Accept-Language');
  return parseAcceptLanguage(acceptLanguage);
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(lang: string): lang is SupportedLanguage {
  return lang in translations;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): SupportedLanguage[] {
  return Object.keys(translations) as SupportedLanguage[];
}

/**
 * Get language name in its native form
 */
export function getLanguageName(lang: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    ru: 'Русский',
    kk: 'Қазақша',
    tr: 'Türkçe',
    uz: 'O\'zbekcha',
  };
  return names[lang] || lang;
}

/**
 * Add or override translations for a language
 */
export function extendTranslations(
  lang: SupportedLanguage,
  newTranslations: Record<string, string>
): void {
  translations[lang] = {
    ...translations[lang],
    ...newTranslations,
  };
}
