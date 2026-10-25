'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { register as registerAccount } from '@cm/auth';
import { RegisterRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { TextField } from '@cm/ui';
import { useErrorText } from '@/i18n/useErrorText';

export default function RegisterForm() {
    const t = useTranslations('auth');
    const errorText = useErrorText();
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useZodForm(RegisterRequestSchema, {
        defaultValues: { email: '', password: '', username: '' },
    });

    const onSubmit = handleSubmit(async (data) => {
        try {
            await registerAccount(data);
        } catch (err) {
            applyServerErrors(setError, err, ['email', 'password', 'username']);
        }
    });

    const formError = errorText.form(errors.root?.server);

    return (
        <Stack component="form" onSubmit={onSubmit} noValidate spacing={4}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label={t('email')} type="email" size="large" autoComplete="email" error={errorText.field(errors.email, 'email')} {...register('email')} />
            <TextField label={t('password')} type="password" size="large" autoComplete="new-password" error={errorText.field(errors.password, 'password')} {...register('password')} />
            <TextField label={t('username')} size="large" autoComplete="username" error={errorText.field(errors.username, 'username')} {...register('username')} />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>{t('register.submit')}</Button>
            <Typography variant="body2" color="text.secondary">
                {t('register.haveAccount')} <Link href="/login">{t('register.signIn')}</Link>
            </Typography>
        </Stack>
    );
}
