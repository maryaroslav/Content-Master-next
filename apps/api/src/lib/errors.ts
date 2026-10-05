import type { ErrorResponse } from '@cm/contracts';

export class AppError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        message: string,
        readonly details?: ErrorResponse['details'],
    ) {
        super(message);
        this.name = 'AppError';
    }
}
