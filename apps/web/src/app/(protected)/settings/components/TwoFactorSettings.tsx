'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    useAuthTwoFactorDisable,
    useAuthTwoFactorEnable,
    useAuthTwoFactorSetup,
} from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { useTranslations } from 'next-intl';
import { TwoFactorCodeRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { useErrorText } from '@/i18n/useErrorText';

type Step = { kind: 'idle' } | { kind: 'enabling'; qrCode: string; secret: string } | { kind: 'disabling' };

export default function TwoFactorSettings() {
    const { user } = useAuth();
    const t = useTranslations('settings.twoFactor');
    const errorText = useErrorText();
    const [step, setStep] = useState<Step>({ kind: 'idle' });
    const [setupError, setSetupError] = useState<string | null>(null);
    const { register, handleSubmit, setError, reset, formState: { errors } } = useZodForm(TwoFactorCodeRequestSchema, {
        defaultValues: { code: '' },
    });

    const setup = useAuthTwoFactorSetup({
        mutation: {
            onSuccess: ({ qrCode, secret }) => setStep({ kind: 'enabling', qrCode, secret }),
            onError: (err) => setSetupError(errorText.request(err) ?? null),
        },
    });
    const enable = useAuthTwoFactorEnable();
    const disable = useAuthTwoFactorDisable();
    const pending = setup.isPending || enable.isPending || disable.isPending;

    if (!user) return null;

    const close = () => {
        setStep({ kind: 'idle' });
        reset();
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            updateUser(await (step.kind === 'disabling' ? disable : enable).mutateAsync({ data }));
            close();
        } catch (err) {
            applyServerErrors(setError, err, ['code']);
        }
    });

    const error = setupError ?? errorText.field(errors.code, 'code') ?? errorText.form(errors.root?.server);

    return (
        <section className="settings-card">
            <h2>{t('title')}</h2>
            <p className="settings-text">
                {user.twoFactorEnabled ? t('on') : t('off')}
            </p>

            {step.kind === 'idle' && (
                user.twoFactorEnabled
                    ? <button type="button" onClick={() => setStep({ kind: 'disabling' })}>{t('turnOff')}</button>
                    : <button type="button" onClick={() => { setSetupError(null); setup.mutate(); }} disabled={pending}>{t('setUp')}</button>
            )}

            {step.kind !== 'idle' && (
                <form className="settings-form" onSubmit={onSubmit} noValidate>
                    {step.kind === 'enabling' ? (
                        <>
                            <p className="settings-text">{t('scan')}</p>
                            <Image src={step.qrCode} alt={t('qrAlt')} width={150} height={150} />
                            <p className="settings-text">{t('manualKey')}</p>
                            <code className="settings-secret">{step.secret}</code>
                        </>
                    ) : (
                        <p className="settings-text">{t('disablePrompt')}</p>
                    )}
                    <input
                        type="text"
                        className="settings-code-input"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        autoFocus
                        {...register('code')}
                    />
                    <div className="settings-actions">
                        <button type="submit" disabled={pending}>{step.kind === 'enabling' ? t('enable') : t('turnOff')}</button>
                        <button type="button" className="secondary" onClick={close}>{t('cancel')}</button>
                    </div>
                </form>
            )}

            {error && <p className="settings-error">{error}</p>}
        </section>
    );
}
