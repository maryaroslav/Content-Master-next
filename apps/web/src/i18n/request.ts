import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import type en from '../../messages/en.json';
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from './config';

const messages: Record<Locale, () => Promise<typeof en>> = {
    en: () => import('../../messages/en.json').then((m) => m.default),
    cs: () => import('../../messages/cs.json').then((m) => m.default),
};

function fromAcceptLanguage(header: string | null): Locale {
    for (const part of (header ?? '').split(',')) {
        const language = part.split(';')[0]?.trim().toLowerCase().split('-')[0];
        if (isLocale(language)) return language;
    }
    return defaultLocale;
}

export default getRequestConfig(async () => {
    const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
    const locale = isLocale(saved) ? saved : fromAcceptLanguage((await headers()).get('accept-language'));
    return { locale, messages: await messages[locale]() };
});
