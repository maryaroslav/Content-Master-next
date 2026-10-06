import { isAxiosError } from 'axios';
import type { ErrorResponse } from '@cm/contracts';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong, please try again.'): string {
    if (isAxiosError<ErrorResponse>(error)) return error.response?.data?.message ?? fallback;
    return error instanceof Error && error.message ? error.message : fallback;
}

export function getErrorDetails(error: unknown): NonNullable<ErrorResponse['details']> {
    return isAxiosError<ErrorResponse>(error) ? error.response?.data?.details ?? [] : [];
}
