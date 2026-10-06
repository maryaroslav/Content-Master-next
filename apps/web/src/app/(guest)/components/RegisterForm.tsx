'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getErrorMessage } from '@cm/api-client';
import { register } from '@cm/auth';
import { RegisterRequestSchema } from '@cm/contracts';
import Field from './Field';
import FormMessage from './FormMessage';
import { firstIssue, type FormError } from './formError';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState<FormError | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = RegisterRequestSchema.safeParse({ email, password, username });
        if (!parsed.success) {
            setError(firstIssue(parsed.error.issues));
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            await register(parsed.data);
        } catch (err: unknown) {
            setError({ message: getErrorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h1>Create your account</h1>
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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                invalid={error?.field === 'password'}
            />
            <Field
                label="Username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                invalid={error?.field === 'username'}
            />
            <button className="btn-authForm" type="submit" disabled={submitting}>Sign Up</button>
            <div className="register">
                <p>Already have an account? <Link href="/login">Sign in</Link></p>
            </div>
        </form>
    );
}
