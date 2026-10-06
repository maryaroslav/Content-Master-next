'use client';

import { loginWithTwoFactor } from '@cm/auth';
import { TwoFactorLoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import Field from './Field';
import FormMessage from './FormMessage';

interface TwoFactorStepProps {
    challengeToken: string;
    onCancel: () => void;
}

export default function TwoFactorStep({ challengeToken, onCancel }: TwoFactorStepProps) {
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

    const message = errors.code?.message ?? errors.root?.server?.message;

    return (
        <form onSubmit={onSubmit} noValidate>
            <h1>Sign In to your account</h1>
            {message
                ? <FormMessage message={message} />
                : <FormMessage message="Enter the code from your authenticator app" variant="hint" />}
            <Field
                label="2FA code"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                autoComplete="one-time-code"
                autoFocus
                invalid={!!message}
                {...register('code')}
            />
            <button className="btn-authForm" type="submit" disabled={isSubmitting}>Sign In</button>
            <div className="register">
                <p><button type="button" className="link-button" onClick={onCancel}>Back to sign in</button></p>
            </div>
        </form>
    );
}
