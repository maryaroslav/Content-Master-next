'use client';

import { useFormatter, useNow, useTranslations } from 'next-intl';

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;

export function useDateText() {
    const format = useFormatter();
    const t = useTranslations('dates');
    const now = useNow({ updateInterval: 60_000 });

    const dayKey = (value: string | Date) => format.dateTime(new Date(value), 'date');

    return {
        date: (value: string) => format.dateTime(new Date(value), 'date'),
        time: (value: string) => format.dateTime(new Date(value), 'time'),
        dayKey,
        dayLabel: (value: string) => {
            const date = new Date(value);
            if (dayKey(date) === dayKey(now)) return t('today');
            if (dayKey(date) === dayKey(new Date(now.getTime() - DAY))) return t('yesterday');
            const sameYear = format.dateTime(date, { year: 'numeric' }) === format.dateTime(now, { year: 'numeric' });
            return format.dateTime(date, sameYear ? 'dayMonth' : 'dayMonthYear');
        },
        relative: (value: string) => {
            const date = new Date(value);
            return now.getTime() - date.getTime() < WEEK ? format.relativeTime(date, now) : format.dateTime(date, 'date');
        },
        dateTime: (value: string) => format.dateTime(new Date(value), 'dateTime'),
    };
}
