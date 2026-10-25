'use client';

import { useTranslations } from 'next-intl';
import { getErrorCode, getErrorMessage } from '@cm/api-client';

type ErrorLike = { type?: string | number; message?: string } | undefined;

export function useErrorText(scope?: string) {
    const t = useTranslations();

    const translate = (keys: string[], fallback?: string): string | undefined => {
        const key = keys.find((candidate) => t.has(candidate as never));
        return key ? t(key as never) : fallback;
    };

    return {
        field: (error: ErrorLike, field: string) =>
            error && translate(
                [...(scope ? [`validation.${scope}.${field}.${error.type}`] : []), `validation.${field}.${error.type}`],
                error.message,
            ),
        form: (error: ErrorLike) => error && translate([`errors.${error.type}`], error.message),
        request: (error: unknown) => translate([`errors.${getErrorCode(error) ?? 'server'}`], getErrorMessage(error)),
    };
}
