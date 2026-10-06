'use client';

import { useState } from 'react';
import { useUsersChangeEmail } from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { ChangeEmailRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';

export default function AccountSettings() {
    const { user } = useAuth();
    const [success, setSuccess] = useState<string | null>(null);
    const { register, handleSubmit, setError, reset, formState: { errors } } = useZodForm(ChangeEmailRequestSchema, {
        defaultValues: { email: '', currentPassword: '' },
    });
    const changeEmail = useUsersChangeEmail();

    if (!user) return null;

    const onSubmit = handleSubmit(async (data) => {
        setSuccess(null);
        try {
            updateUser(await changeEmail.mutateAsync({ data }));
            reset();
            setSuccess('Email changed');
        } catch (err) {
            applyServerErrors(setError, err, ['email', 'currentPassword']);
        }
    });

    const error = errors.email?.message ?? errors.currentPassword?.message ?? errors.root?.server?.message;

    return (
        <section className="settings-card">
            <h2>Account</h2>
            <p className="settings-text">Signed in as {user.email}</p>
            <form className="settings-form" onSubmit={onSubmit} noValidate>
                <div className="settings-field">
                    <label htmlFor="settings-email">New email</label>
                    <input id="settings-email" type="email" autoComplete="email" {...register('email')} />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-password">Current password</label>
                    <input id="settings-password" type="password" autoComplete="current-password" {...register('currentPassword')} />
                </div>
                <button type="submit" disabled={changeEmail.isPending}>Change email</button>
            </form>
            {error && <p className="settings-error">{error}</p>}
            {!error && success && <p className="settings-success">{success}</p>}
        </section>
    );
}
