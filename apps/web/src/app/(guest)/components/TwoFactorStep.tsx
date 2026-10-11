'use client';

import { useTranslations } from 'next-intl';
import { loginWithTwoFactor } from '@cm/auth';
import { TwoFactorLoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import Field from './Field';
import FormMessage from './FormMessage';
import { useErrorText } from '@/i18n/useErrorText';

interface TwoFactorStepProps {
    challengeToken: string;
    onCancel: () => void;
}

export default function TwoFactorStep({ challengeToken, onCancel }: TwoFactorStepProps) {
    const t = useTranslations('auth');
    const errorText = useErrorText();
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useZodForm(TwoFactorLoginRequestSchema, {
        defaultValues: { challengeToken, code: '' },
    });

    const onSubmit = handleSubmit(async (data) => {
        try {
            await loginWithTwoFactor(data);
        } catch (err) {
            applyServerErrors(setError, err, ['code']);
        }
    });

    const message = errorText.field(errors.code, 'code') ?? errorText.form(errors.root?.server);

    return (
        <form onSubmit={onSubmit} noValidate>
            <h1>{t('login.title')}</h1>
            {message
                ? <FormMessage message={message} />
                : <FormMessage message={t('twoFactor.hint')} variant="hint" />}
            <Field
                label={t('twoFactor.code')}
                type="text"
                inputMode="numeric"
                placeholder="123456"
                autoComplete="one-time-code"
                autoFocus
                invalid={!!message}
                {...register('code')}
            />
            <button className="btn-authForm" type="submit" disabled={isSubmitting}>{t('login.submit')}</button>
            <div className="register">
                <p><button type="button" className="link-button" onClick={onCancel}>{t('twoFactor.back')}</button></p>
            </div>
        </form>
    );
}
