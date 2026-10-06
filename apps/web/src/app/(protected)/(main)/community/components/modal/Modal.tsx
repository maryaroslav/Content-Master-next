"use client";

import '@/styles/createCommunity.css'
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    getCommunitiesListOwnedQueryKey,
    getErrorMessage,
    getUsersMyCommunitiesQueryKey,
    useCommunitiesCreate,
} from '@cm/api-client';
import { CreateCommunityRequestSchema } from '@cm/contracts';
import StepGoal from './StepGoal';
import StepName from './StepName';
import StepTwo from './StepTwo';
import StepDescription from './StepDescript';
import StepPhoto from './StepPhoto';

type Privacy = 'public' | 'private';

interface CommunityFormData {
    name?: string;
    privacy?: Privacy;
    theme?: string;
    description?: string;
    photo?: File | null;
}

interface ModalProps {
    closeModal: () => void;
}

const Modal = ({ closeModal }: ModalProps) => {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<number>(1);
    const [isStepValid, setIsStepValid] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<CommunityFormData>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [closeModal]);

    const { mutate: create, isPending } = useCommunitiesCreate({
        mutation: {
            onSuccess: () => {
                void queryClient.invalidateQueries({ queryKey: getCommunitiesListOwnedQueryKey({ owner: 'me' }) });
                void queryClient.invalidateQueries({ queryKey: getUsersMyCommunitiesQueryKey() });
                closeModal();
            },
            onError: (err) => setError(getErrorMessage(err)),
        },
    });

    const nextStep = () => {
        if (step !== 1 && !isStepValid) return;
        setStep((prev) => Math.min(prev + 1, 6));
        setIsStepValid(false);
    }

    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
        setIsStepValid(false);
        setError(null);
    }

    const createCommunity = () => {
        const parsed = CreateCommunityRequestSchema.safeParse({
            name: formData.name,
            privacy: formData.privacy,
            theme: formData.theme,
            description: formData.description || undefined,
        });
        if (!parsed.success || !formData.photo) {
            setError(parsed.error?.issues[0]?.message ?? 'Community photo is required');
            return;
        }
        setError(null);
        create({ data: { ...parsed.data, photo: formData.photo } });
    };

    const getStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <StepGoal
                        nextStep={nextStep}
                        onValidChange={setIsStepValid}
                    />
                );
            case 2:
                return (
                    <StepName
                        onValidChange={setIsStepValid}
                        onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                        initialName={formData.name || ''}
                        initialPrivacy={formData.privacy || 'public'}
                    />
                );
            case 3:
                return (
                    <StepTwo
                        initialTheme={formData.theme ?? null}
                        onValidChange={setIsStepValid}
                        onSelect={(theme) => setFormData(prev => ({ ...prev, theme }))}
                    />
                );
            case 4:
                return (
                    <StepDescription
                        onValidChange={setIsStepValid}
                        onChange={(description) => setFormData(prev => ({ ...prev, description }))}
                        initialDes={formData.description || ''}
                    />
                );
            case 5:
                return (
                    <StepPhoto
                        onValidChange={setIsStepValid}
                        onChange={(photoData) => setFormData(prev => ({ ...prev, ...photoData }))}
                        initialPhoto={formData.photo || null}
                    />
                );

            default:
                break;
        }
    }

    return (
        <div className="createcommunity-modal-overlay">
            <div className="createcommunity-modal-content">
                {step > 1 && (
                    <h2 className='createcommunity-step'>Step {step - 1} of 4</h2>
                )}

                <div className="createcommunity-step-content">
                    {getStepContent()}
                </div>

                {error && <p className="createcommunity-error">{error}</p>}

                <div className="createcommunity-modal-footer">
                    {step > 1 && (
                        <button className="createcommunity-button-back" onClick={prevStep}>Back</button>
                    )}
                    {step > 1 && step < 5 && (
                        <button className="createcommunity-button-continue" onClick={nextStep}>Continue</button>
                    )}
                    {step === 5 &&
                        (
                            <button className="createcommunity-button-create" onClick={createCommunity} disabled={isPending}>
                                {isPending ? 'Creating...' : 'Create'}
                            </button>
                        )
                    }
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

