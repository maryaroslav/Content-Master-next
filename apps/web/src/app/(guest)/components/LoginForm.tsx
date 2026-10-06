'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getErrorMessage } from '@cm/api-client';
import { login } from '@cm/auth';
import { LoginRequestSchema } from '@cm/contracts';
import Field from './Field';
import FormMessage from './FormMessage';
import TwoFactorStep from './TwoFactorStep';
import { firstIssue, type FormError } from './formError';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<FormError | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [challengeToken, setChallengeToken] = useState<string | null>(null);

    if (challengeToken) {
        return <TwoFactorStep challengeToken={challengeToken} onCancel={() => setChallengeToken(null)} />;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = LoginRequestSchema.safeParse({ email, password });
        if (!parsed.success) {
            setError(firstIssue(parsed.error.issues));
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            const result = await login(parsed.data);
            if (result.status === 'twoFactorRequired') setChallengeToken(result.challengeToken);
        } catch (err: unknown) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1>Sign In to your account</h1>
            {error && <FormMessage message={error.message} />}
            <Field
                label="Email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                invalid={error?.field === 'email'}
            />
            <Field
                label="Password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                invalid={error?.field === 'password'}
            />
            <button className="btn-authForm" type="submit" disabled={submitting}>Sign In</button>
            <div className="register">
                <p>Don’t have an account? <Link href="/register">Create account</Link></p>
            </div>
        </form>
    );
}
