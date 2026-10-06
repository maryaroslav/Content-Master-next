'use client';

import { useState } from 'react';
import { getErrorMessage, useUsersChangeEmail } from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { ChangeEmailRequestSchema } from '@cm/contracts';

type Status = { kind: 'error' | 'success'; message: string } | null;

export default function AccountSettings() {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [status, setStatus] = useState<Status>(null);

    const changeEmail = useUsersChangeEmail({
        mutation: {
            onSuccess: (updated) => {
                updateUser(updated);
                setEmail('');
                setCurrentPassword('');
                setStatus({ kind: 'success', message: 'Email changed' });
            },
            onError: (err) => setStatus({ kind: 'error', message: getErrorMessage(err) }),
        },
    });

    if (!user) return null;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = ChangeEmailRequestSchema.safeParse({ email: email.trim(), currentPassword });
        if (!parsed.success) {
            setStatus({ kind: 'error', message: parsed.error.issues[0]?.message ?? 'Please check the form' });
            return;
        }
        setStatus(null);
        changeEmail.mutate({ data: parsed.data });
    };

    return (
        <section className="settings-card">
            <h2>Account</h2>
            <p className="settings-text">Signed in as {user.email}</p>
            <form className="settings-form" onSubmit={handleSubmit} noValidate>
                <div className="settings-field">
                    <label htmlFor="settings-email">New email</label>
                    <input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-password">Current password</label>
                    <input
                        id="settings-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit" disabled={changeEmail.isPending}>Change email</button>
            </form>
            {status && <p className={`settings-${status.kind}`}>{status.message}</p>}
        </section>
    );
}
