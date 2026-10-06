'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    getErrorMessage,
    useAuthTwoFactorDisable,
    useAuthTwoFactorEnable,
    useAuthTwoFactorSetup,
} from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { TwoFactorCodeRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';

type Step = { kind: 'idle' } | { kind: 'enabling'; qrCode: string } | { kind: 'disabling' };

export default function TwoFactorSettings() {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>({ kind: 'idle' });
    const [setupError, setSetupError] = useState<string | null>(null);
    const { register, handleSubmit, setError, reset, formState: { errors } } = useZodForm(TwoFactorCodeRequestSchema, {
        defaultValues: { code: '' },
    });

    const setup = useAuthTwoFactorSetup({
        mutation: {
            onSuccess: ({ qrCode }) => setStep({ kind: 'enabling', qrCode }),
            onError: (err) => setSetupError(getErrorMessage(err)),
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

    const error = setupError ?? errors.code?.message ?? errors.root?.server?.message;

    return (
        <section className="settings-card">
            <h2>Two-factor authentication</h2>
            <p className="settings-text">
                {user.twoFactorEnabled
                    ? 'On: signing in asks for a code from your authenticator app.'
                    : 'Off: signing in needs only your password.'}
            </p>

            {step.kind === 'idle' && (
                user.twoFactorEnabled
                    ? <button type="button" onClick={() => setStep({ kind: 'disabling' })}>Turn off</button>
                    : <button type="button" onClick={() => { setSetupError(null); setup.mutate(); }} disabled={pending}>Set up</button>
            )}

            {step.kind !== 'idle' && (
                <form className="settings-form" onSubmit={onSubmit} noValidate>
                    {step.kind === 'enabling' ? (
                        <>
                            <p className="settings-text">Scan the QR code with your authenticator app, then enter the code it shows.</p>
                            <Image src={step.qrCode} alt="QR code for the authenticator app" width={150} height={150} />
                        </>
                    ) : (
                        <p className="settings-text">Enter the code from your authenticator app to turn two-factor authentication off.</p>
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
                        <button type="submit" disabled={pending}>{step.kind === 'enabling' ? 'Enable' : 'Turn off'}</button>
                        <button type="button" className="secondary" onClick={close}>Cancel</button>
                    </div>
                </form>
            )}

            {error && <p className="settings-error">{error}</p>}
        </section>
    );
}
