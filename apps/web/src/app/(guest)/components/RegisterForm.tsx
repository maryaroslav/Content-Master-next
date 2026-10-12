'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { register as registerAccount } from '@cm/auth';
import { RegisterRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import Field from './Field';
import FormMessage from './FormMessage';
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

    const message = errorText.field(errors.email, 'email')
        ?? errorText.field(errors.password, 'password')
        ?? errorText.field(errors.username, 'username')
        ?? errorText.form(errors.root?.server);

    return (
        <form onSubmit={onSubmit} noValidate>
            <h1>{t('register.title')}</h1>
            {message && <FormMessage message={message} />}
            <Field label={t('email')} type="email" placeholder={t('email')} autoComplete="email" invalid={!!errors.email} {...register('email')} />
            <Field
                label={t('password')}
                type="password"
                placeholder={t('password')}
                autoComplete="new-password"
                invalid={!!errors.password}
                {...register('password')}
            />
            <Field
                label={t('username')}
                type="text"
                placeholder={t('username')}
                autoComplete="username"
                invalid={!!errors.username}
                {...register('username')}
            />
            <button className="btn-authForm" type="submit" disabled={isSubmitting}>{t('register.submit')}</button>
            <div className="register">
                <p>{t('register.haveAccount')} <Link href="/login">{t('register.signIn')}</Link></p>
            </div>
        </form>
    );
}
