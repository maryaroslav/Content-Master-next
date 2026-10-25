'use client';

import { useTranslations } from 'next-intl';
import { loginWithTwoFactor } from '@cm/auth';
import { TwoFactorLoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { Alert, Button, Form, TextField, TextLink } from '@cm/ui';
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

    const formError = errorText.form(errors.root?.server);

    return (
        <Form onSubmit={onSubmit}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
                label={t('twoFactor.code')}
                hint={t('twoFactor.hint')}
                error={errorText.field(errors.code, 'code')}
                code
                size="large"
                placeholder="123456"
                autoFocus
                {...register('code')}
            />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>{t('login.submit')}</Button>
            <TextLink onClick={onCancel}>{t('twoFactor.back')}</TextLink>
        </Form>
    );
}
