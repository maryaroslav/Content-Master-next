'use client';

import { useTranslations } from 'next-intl';
import { register as registerAccount } from '@cm/auth';
import { RegisterRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { Alert, Button, Form, TextField, TextLink, Typography } from '@cm/ui';
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
        <Form onSubmit={onSubmit}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label={t('email')} type="email" size="large" autoComplete="email" error={errorText.field(errors.email, 'email')} {...register('email')} />
            <TextField label={t('password')} type="password" size="large" autoComplete="new-password" error={errorText.field(errors.password, 'password')} {...register('password')} />
            <TextField label={t('username')} size="large" autoComplete="username" error={errorText.field(errors.username, 'username')} {...register('username')} />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>{t('register.submit')}</Button>
            <Typography variant="small" color="muted">
                {t('register.haveAccount')} <TextLink href="/login">{t('register.signIn')}</TextLink>
            </Typography>
        </Form>
    );
}
