import type { Formats } from 'next-intl';

export const formats = {
    dateTime: {
        date: { dateStyle: 'medium' },
        time: { timeStyle: 'short' },
        dateTime: { dateStyle: 'medium', timeStyle: 'short' },
        dayMonth: { day: 'numeric', month: 'long' },
        dayMonthYear: { day: 'numeric', month: 'long', year: 'numeric' },
    },
} satisfies Formats;

export const timeZone = 'Europe/Prague';
