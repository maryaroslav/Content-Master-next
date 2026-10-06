'use client';

import { useState } from 'react';
import { getErrorMessage } from '@cm/api-client';
import { loginWithTwoFactor } from '@cm/auth';
import { TotpCodeSchema } from '@cm/contracts';
import Field from './Field';
import FormMessage from './FormMessage';
import { firstIssue, type FormError } from './formError';

interface TwoFactorStepProps {
    challengeToken: string;
    onCancel: () => void;
}

export default function TwoFactorStep({ challengeToken, onCancel }: TwoFactorStepProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState<FormError | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = TotpCodeSchema.safeParse(code);
        if (!parsed.success) {
            setError(firstIssue(parsed.error.issues));
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            await loginWithTwoFactor({ challengeToken, code: parsed.data });
        } catch (err: unknown) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1>Sign In to your account</h1>
            {error
                ? <FormMessage message={error.message} />
                : <FormMessage message="Enter the code from your authenticator app" variant="hint" />}
            <Field
                label="2FA code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
                invalid={Boolean(error)}
            />
            <button className="btn-authForm" type="submit" disabled={submitting}>Sign In</button>
            <div className="register">
                <p><button type="button" className="link-button" onClick={onCancel}>Back to sign in</button></p>
            </div>
        </form>
    );
}
