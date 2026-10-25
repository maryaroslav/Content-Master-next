export const locales = ['en', 'cs'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeNames: Record<Locale, string> = { en: 'English', cs: 'Čeština' };

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);
