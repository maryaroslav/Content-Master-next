'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { getCommunitiesListOwnedQueryKey, getUsersMyCommunitiesQueryKey, useCommunitiesCreate } from '@cm/api-client';
import { CreateCommunityRequestSchema, type CreateCommunityRequest } from '@cm/contracts';
import { applyServerErrors, FormProvider, useZodForm } from '@cm/forms';
import { WizardDialog } from '@cm/ui';
import { useErrorText } from '@/i18n/useErrorText';
import StepDescription from './StepDescript';
import StepGoal from './StepGoal';
import StepName from './StepName';
import StepPhoto from './StepPhoto';
import StepTheme from './StepTheme';

const STEPS = 4;
const stepFields: Record<number, (keyof CreateCommunityRequest)[]> = {
    2: ['name', 'privacy'],
    3: ['theme'],
    4: ['description'],
};
const stepKeys = { 1: 'goal', 2: 'name', 3: 'theme', 4: 'description', 5: 'photo' } as const;
const defaultValues: CreateCommunityRequest = { name: '', privacy: 'public', theme: '', description: '' };

interface CreateCommunityDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateCommunityDialog({ open, onClose }: CreateCommunityDialogProps) {
    const queryClient = useQueryClient();
    const t = useTranslations();
    const errorText = useErrorText();
    const [step, setStep] = useState(1);
    const [photo, setPhoto] = useState<File | null>(null);
    const form = useZodForm(CreateCommunityRequestSchema, { mode: 'onChange', defaultValues });
    const { handleSubmit, trigger, setError, clearErrors, reset, formState: { errors, isSubmitting } } = form;
    const { mutateAsync: create } = useCommunitiesCreate();

    const startOver = () => {
        reset(defaultValues);
        setPhoto(null);
        setStep(1);
    };

    const nextStep = async () => {
        if (await trigger(stepFields[step] ?? [])) setStep(step + 1);
    };

    const prevStep = () => {
        clearErrors();
        setStep(Math.max(step - 1, 1));
    };

    const createCommunity = handleSubmit(async (data) => {
        if (!photo) {
            setError('root.server', { type: 'PHOTO_REQUIRED' });
            return;
        }
        try {
            await create({ data: { ...data, description: data.description || undefined, photo } });
            void queryClient.invalidateQueries({ queryKey: getCommunitiesListOwnedQueryKey({ owner: 'me' }) });
            void queryClient.invalidateQueries({ queryKey: getUsersMyCommunitiesQueryKey() });
            onClose();
        } catch (err) {
            applyServerErrors(setError, err, ['name', 'privacy', 'theme', 'description']);
        }
    });

    const key = stepKeys[step as keyof typeof stepKeys];

    return (
        <WizardDialog
            open={open}
            onClose={onClose}
            onExited={startOver}
            closeLabel={t('common.close')}
            title={t(`community.wizard.${key}.title`)}
            description={t(`community.wizard.${key}.text`)}
            progress={step > 1 ? { current: step - 1, total: STEPS, label: t('community.wizard.step', { current: step - 1, total: STEPS }) } : undefined}
            error={errorText.form(errors.root?.server)}
            back={step > 1 ? { label: t('community.wizard.back'), onClick: prevStep } : undefined}
            next={
                step === 1 ? undefined
                    : step < 5 ? { label: t('community.wizard.continue'), onClick: () => void nextStep() }
                        : { label: t('community.wizard.create'), onClick: () => void createCommunity(), loading: isSubmitting }
            }
        >
            <FormProvider {...form}>
                {step === 1 && <StepGoal onSelect={() => setStep(2)} />}
                {step === 2 && <StepName />}
                {step === 3 && <StepTheme />}
                {step === 4 && <StepDescription />}
                {step === 5 && <StepPhoto photo={photo} onChange={setPhoto} />}
            </FormProvider>
        </WizardDialog>
    );
}
