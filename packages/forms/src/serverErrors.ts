import { getErrorDetails, getErrorMessage } from '@cm/api-client';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export interface ServerErrors {
    fields: Record<string, string>;
    message: string;
}

export function parseServerErrors(error: unknown): ServerErrors {
    const fields: Record<string, string> = {};
    for (const { path, message } of getErrorDetails(error)) {
        const field = path.split('.').slice(1).join('.');
        if (field && !(field in fields)) fields[field] = message;
    }
    return { fields, message: getErrorMessage(error) };
}

export function applyServerErrors<T extends FieldValues>(
    setError: UseFormSetError<T>,
    error: unknown,
    knownFields: readonly Path<T>[],
): void {
    const { fields, message } = parseServerErrors(error);
    let placed = false;
    for (const field of knownFields) {
        const fieldMessage = fields[field];
        if (fieldMessage) {
            setError(field, { type: 'server', message: fieldMessage });
            placed = true;
        }
    }
    if (!placed) setError('root.server', { type: 'server', message });
}
