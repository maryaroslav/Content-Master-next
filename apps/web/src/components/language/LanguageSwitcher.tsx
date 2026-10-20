'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { setLocale } from '@/i18n/actions';
import { localeNames, locales } from '@/i18n/config';

export default function LanguageSwitcher({ className }: { className?: string }) {
    const t = useTranslations('language');
    const locale = useLocale();
    const [pending, startTransition] = useTransition();

    return (
        <label className={`language-switcher${className ? ` ${className}` : ''}`}>
            <span>{t('label')}</span>
            <select
                value={locale}
                disabled={pending}
                onChange={(event) => startTransition(() => setLocale(event.target.value))}
            >
                {locales.map((value) => <option key={value} value={value}>{localeNames[value]}</option>)}
            </select>
        </label>
    );
}
