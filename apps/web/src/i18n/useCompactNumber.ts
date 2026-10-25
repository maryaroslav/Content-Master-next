'use client';

import { useFormatter } from 'next-intl';

export function useCompactNumber() {
    const format = useFormatter();
    return (value: number) => format.number(value, { notation: 'compact' });
}
