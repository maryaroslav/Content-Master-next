'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { login } from '@cm/auth';
import { LoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { TextField } from '@cm/ui';
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
        <Stack component="form" onSubmit={onSubmit} noValidate spacing={4}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label={t('email')} type="email" size="large" autoComplete="email" error={errorText.field(errors.email, 'email')} {...register('email')} />
            <TextField label={t('password')} type="password" size="large" autoComplete="current-password" error={errorText.field(errors.password, 'password')} {...register('password')} />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>{t('login.submit')}</Button>
            <Typography variant="body2" color="text.secondary">
                {t('login.noAccount')} <Link href="/register">{t('login.createAccount')}</Link>
            </Typography>
        </Stack>
    );
}
