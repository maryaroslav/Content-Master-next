'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { login } from '@cm/auth';
import { LoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { Alert, Button, Form, TextField, TextLink, Typography } from '@cm/ui';
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

    const formError = errorText.form(errors.root?.server);

    return (
        <Form onSubmit={onSubmit}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label={t('email')} type="email" size="large" autoComplete="email" error={errorText.field(errors.email, 'email')} {...register('email')} />
            <TextField label={t('password')} type="password" size="large" autoComplete="current-password" error={errorText.field(errors.password, 'password')} {...register('password')} />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>{t('login.submit')}</Button>
            <Typography variant="small" color="muted">
                {t('login.noAccount')} <TextLink href="/register">{t('login.createAccount')}</TextLink>
            </Typography>
        </Form>
    );
}
