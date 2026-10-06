"use client";

import '@/styles/createCommunity.css'
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCommunitiesListOwnedQueryKey, getUsersMyCommunitiesQueryKey, useCommunitiesCreate } from '@cm/api-client';
import { CreateCommunityRequestSchema, type CreateCommunityRequest } from '@cm/contracts';
import { applyServerErrors, FormProvider, useZodForm } from '@cm/forms';
import StepGoal from './StepGoal';
import StepName from './StepName';
import StepTwo from './StepTwo';
import StepDescription from './StepDescript';
import StepPhoto from './StepPhoto';

const stepFields: Record<number, (keyof CreateCommunityRequest)[]> = {
    2: ['name', 'privacy'],
    3: ['theme'],
    4: ['description'],
};

interface ModalProps {
    closeModal: () => void;
}

const Modal = ({ closeModal }: ModalProps) => {
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [photo, setPhoto] = useState<File | null>(null);
    const form = useZodForm(CreateCommunityRequestSchema, {
        mode: 'onChange',
        defaultValues: { name: '', privacy: 'public', theme: '', description: '' },
    });
    const { handleSubmit, trigger, setError, clearErrors, formState: { errors, isSubmitting } } = form;
    const { mutateAsync: create } = useCommunitiesCreate();

    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [closeModal]);

    const nextStep = async () => {
        if (await trigger(stepFields[step] ?? [])) setStep(step + 1);
    };

    const prevStep = () => {
        clearErrors();
        setStep(Math.max(step - 1, 1));
    };

    const createCommunity = handleSubmit(async (data) => {
        if (!photo) {
            setError('root.server', { message: 'Community photo is required' });
            return;
        }
        try {
            await create({ data: { ...data, description: data.description || undefined, photo } });
            void queryClient.invalidateQueries({ queryKey: getCommunitiesListOwnedQueryKey({ owner: 'me' }) });
            void queryClient.invalidateQueries({ queryKey: getUsersMyCommunitiesQueryKey() });
            closeModal();
        } catch (err) {
            applyServerErrors(setError, err, ['name', 'privacy', 'theme', 'description']);
        }
    });

    const error = (stepFields[step] ?? []).map((field) => errors[field]?.message).find(Boolean) ?? errors.root?.server?.message;

    return (
        <div className="createcommunity-modal-overlay">
            <div className="createcommunity-modal-content">
                {step > 1 && (
                    <h2 className='createcommunity-step'>Step {step - 1} of 4</h2>
                )}

                <FormProvider {...form}>
                    <div className="createcommunity-step-content">
                        {step === 1 && <StepGoal onSelect={() => setStep(2)} />}
                        {step === 2 && <StepName />}
                        {step === 3 && <StepTwo />}
                        {step === 4 && <StepDescription />}
                        {step === 5 && <StepPhoto photo={photo} onChange={setPhoto} />}
                    </div>
                </FormProvider>

                {error && <p className="createcommunity-error">{error}</p>}

                <div className="createcommunity-modal-footer">
                    {step > 1 && (
                        <button className="createcommunity-button-back" onClick={prevStep}>Back</button>
                    )}
                    {step > 1 && step < 5 && (
                        <button className="createcommunity-button-continue" onClick={() => void nextStep()}>Continue</button>
                    )}
                    {step === 5 && (
                        <button className="createcommunity-button-create" onClick={() => void createCommunity()} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    )}
                </div>
            </div>
            <div className='community-modal-close-container'>
                <button className="button community-modal-close" onClick={closeModal} aria-label="Close">
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z" fill="#BDBDBD" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Modal;
