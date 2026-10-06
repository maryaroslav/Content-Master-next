'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@cm/auth';
import { LoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import Field from './Field';
import FormMessage from './FormMessage';
import TwoFactorStep from './TwoFactorStep';

export default function LoginForm() {
    const [challengeToken, setChallengeToken] = useState<string | null>(null);
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useZodForm(LoginRequestSchema, {
        defaultValues: { email: '', password: '' },
    });

    if (challengeToken) {
        return <TwoFactorStep challengeToken={challengeToken} onCancel={() => setChallengeToken(null)} />;
    }

    const onSubmit = handleSubmit(async (data) => {
        try {
            const result = await login(data);
            if (result.status === 'twoFactorRequired') setChallengeToken(result.challengeToken);
        } catch (err) {
            applyServerErrors(setError, err, ['email', 'password']);
        }
    });

    const message = errors.email?.message ?? errors.password?.message ?? errors.root?.server?.message;

    return (
        <form onSubmit={onSubmit} noValidate>
            <h1>Sign In to your account</h1>
            {message && <FormMessage message={message} />}
            <Field label="Email" type="email" placeholder="Email" autoComplete="email" invalid={!!errors.email} {...register('email')} />
            <Field
                label="Password"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                invalid={!!errors.password}
                {...register('password')}
            />
            <button className="btn-authForm" type="submit" disabled={isSubmitting}>Sign In</button>
            <div className="register">
                <p>Don’t have an account? <Link href="/register">Create account</Link></p>
            </div>
        </form>
    );
}
