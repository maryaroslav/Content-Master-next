'use client';

import { useState } from 'react';
import { useUsersChangeEmail } from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { useTranslations } from 'next-intl';
import { ChangeEmailRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { useErrorText } from '@/i18n/useErrorText';

export default function AccountSettings() {
    const { user } = useAuth();
    const t = useTranslations('settings.account');
    const errorText = useErrorText();
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
            setSuccess(t('changed'));
        } catch (err) {
            applyServerErrors(setError, err, ['email', 'currentPassword']);
        }
    });

    const error = errorText.field(errors.email, 'email')
        ?? errorText.field(errors.currentPassword, 'currentPassword')
        ?? errorText.form(errors.root?.server);

    return (
        <section className="settings-card">
            <h2>{t('title')}</h2>
            <p className="settings-text">{t('signedInAs', { email: user.email })}</p>
            <form className="settings-form" onSubmit={onSubmit} noValidate>
                <div className="settings-field">
                    <label htmlFor="settings-email">{t('newEmail')}</label>
                    <input id="settings-email" type="email" autoComplete="email" {...register('email')} />
                </div>
                <div className="settings-field">
                    <label htmlFor="settings-password">{t('currentPassword')}</label>
                    <input id="settings-password" type="password" autoComplete="current-password" {...register('currentPassword')} />
                </div>
                <button type="submit" disabled={changeEmail.isPending}>{t('submit')}</button>
            </form>
            {error && <p className="settings-error">{error}</p>}
            {!error && success && <p className="settings-success">{success}</p>}
        </section>
    );
}
