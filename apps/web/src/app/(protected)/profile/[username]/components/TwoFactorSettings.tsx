'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    getErrorMessage,
    useAuthTwoFactorDisable,
    useAuthTwoFactorEnable,
    useAuthTwoFactorSetup,
    type User,
} from '@cm/api-client';
import { updateUser, useAuth } from '@cm/auth';
import { TotpCodeSchema } from '@cm/contracts';

type Step = { kind: 'idle' } | { kind: 'enabling'; qrCode: string } | { kind: 'disabling' };

export default function TwoFactorSettings() {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>({ kind: 'idle' });
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setStep({ kind: 'idle' });
        setCode('');
        setError(null);
    };
    const onError = (err: unknown) => setError(getErrorMessage(err));
    const onFinished = (updated: User) => {
        updateUser(updated);
        reset();
    };

    const setup = useAuthTwoFactorSetup({
        mutation: { onSuccess: ({ qrCode }) => { setError(null); setStep({ kind: 'enabling', qrCode }); }, onError },
    });
    const enable = useAuthTwoFactorEnable({ mutation: { onSuccess: onFinished, onError } });
    const disable = useAuthTwoFactorDisable({ mutation: { onSuccess: onFinished, onError } });
    const pending = setup.isPending || enable.isPending || disable.isPending;

    if (!user) return null;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = TotpCodeSchema.safeParse(code);
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'Please check the code');
            return;
        }
        (step.kind === 'disabling' ? disable : enable).mutate({ data: { code: parsed.data } });
    };

    return (
        <section className="profile-card">
            <h2>Two-factor authentication</h2>
            <p className="profile-card-text">
                {user.twoFactorEnabled
                    ? 'On: signing in asks for a code from your authenticator app.'
                    : 'Off: signing in needs only your password.'}
            </p>

            {step.kind === 'idle' && (
                user.twoFactorEnabled
                    ? <button type="button" onClick={() => setStep({ kind: 'disabling' })}>Turn off</button>
                    : <button type="button" onClick={() => setup.mutate()} disabled={pending}>Set up</button>
            )}

            {step.kind !== 'idle' && (
                <form className="profile-card-form" onSubmit={handleSubmit} noValidate>
                    {step.kind === 'enabling' ? (
                        <>
                            <p className="profile-card-text">Scan the QR code with your authenticator app, then enter the code it shows.</p>
                            <Image src={step.qrCode} alt="QR code for the authenticator app" width={150} height={150} />
                        </>
                    ) : (
                        <p className="profile-card-text">Enter the code from your authenticator app to turn two-factor authentication off.</p>
                    )}
                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        autoFocus
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                    />
                    <div className="profile-card-actions">
                        <button type="submit" disabled={pending}>{step.kind === 'enabling' ? 'Enable' : 'Turn off'}</button>
                        <button type="button" className="secondary" onClick={reset}>Cancel</button>
                    </div>
                </form>
            )}

            {error && <p className="profile-error">{error}</p>}
        </section>
    );
}
