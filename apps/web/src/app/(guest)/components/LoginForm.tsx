'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { login } from '@cm/auth';
import { LoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import Field from './Field';
import FormMessage from './FormMessage';
import TwoFactorStep from './TwoFactorStep';
import { useErrorText } from '@/i18n/useErrorText';

export default function LoginForm() {
    const t = useTranslations('auth');
    const errorText = useErrorText('login');
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

    const message = errorText.field(errors.email, 'email') ?? errorText.field(errors.password, 'password') ?? errorText.form(errors.root?.server);

    return (
        <form onSubmit={onSubmit} noValidate>
            <h1>{t('login.title')}</h1>
            {message && <FormMessage message={message} />}
            <Field label={t('email')} type="email" placeholder={t('email')} autoComplete="email" invalid={!!errors.email} {...register('email')} />
            <Field
                label={t('password')}
                type="password"
                placeholder={t('password')}
                autoComplete="current-password"
                invalid={!!errors.password}
                {...register('password')}
            />
            <button className="btn-authForm" type="submit" disabled={isSubmitting}>{t('login.submit')}</button>
            <div className="register">
                <p>{t('login.noAccount')} <Link href="/register">{t('login.createAccount')}</Link></p>
            </div>
        </form>
    );
}
