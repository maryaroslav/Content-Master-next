'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { loginWithTwoFactor } from '@cm/auth';
import { TwoFactorLoginRequestSchema } from '@cm/contracts';
import { applyServerErrors, useZodForm } from '@cm/forms';
import { TextField } from '@cm/ui';
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
        <Stack component="form" onSubmit={onSubmit} noValidate spacing={4}>
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
            <Link component="button" type="button" onClick={onCancel} sx={{ alignSelf: 'flex-start' }}>{t('twoFactor.back')}</Link>
        </Stack>
    );
}
