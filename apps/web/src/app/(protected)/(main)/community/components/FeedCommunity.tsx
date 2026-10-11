'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
    getUsersMyCommunitiesQueryKey,
    useCommunitiesLeave,
    useCommunitiesListOwned,
    useUsersMyCommunities,
    type CommunitySummary,
} from '@cm/api-client';
import Modal from './modal/Modal';
import { useCompactNumber } from '@/i18n/useCompactNumber';
import { useErrorText } from '@/i18n/useErrorText';

import '@/styles/feedCommunity.css';
import arrowDown from '@images/icons/arrow-down.svg';

const memberListKey = getUsersMyCommunitiesQueryKey();

interface CommunityCardProps {
    community: CommunitySummary;
    owned?: boolean;
    action?: React.ReactNode;
}

function CommunityCard({ community, owned = false, action }: CommunityCardProps) {
    const t = useTranslations('common');
    const compact = useCompactNumber();
    const withOwned = (base: string) => (owned ? `feedcommunity-${base} my-community-${base}` : `feedcommunity-${base}`);
    return (
        <div className={withOwned('item')}>
            <Image src={community.photo} alt={community.name} width={100} height={100} />
            <div className="feedcommunity-item-title">
                <p className={withOwned('type')}>{t(community.privacy === 'private' ? 'privacy.private' : 'privacy.public')}</p>
                <p className={withOwned('name')}>{community.name}</p>
                <p className={withOwned('members')}>{t('members', { count: community.membersCount, formatted: compact(community.membersCount) })}</p>
            </div>
            {action ?? (
                <div className="feedcommunity-arrow">
                    <Image src={arrowDown} alt="" />
                </div>
            )}
        </div>
    );
}

export default function FeedCommunity() {
    const queryClient = useQueryClient();
    const t = useTranslations();
    const errorText = useErrorText();
    const [isOpen, setIsOpen] = useState(false);
    const [leaveError, setLeaveError] = useState<string | null>(null);
    const owned = useCommunitiesListOwned({ owner: 'me' });
    const member = useUsersMyCommunities();

    const { mutate: leave, isPending: leaving } = useCommunitiesLeave({
        mutation: {
            onMutate: async ({ communityId }) => {
                setLeaveError(null);
                await queryClient.cancelQueries({ queryKey: memberListKey });
                const previous = queryClient.getQueryData<CommunitySummary[]>(memberListKey);
                queryClient.setQueryData<CommunitySummary[]>(memberListKey, (list) => list?.filter((c) => c.id !== communityId));
                return { previous };
            },
            onError: (err, _variables, context) => {
                queryClient.setQueryData(memberListKey, context?.previous);
                setLeaveError(errorText.request(err) ?? null);
            },
        },
    });

    const ownedIds = new Set(owned.data?.map((c) => c.id));
    const joined = member.data?.filter((c) => !ownedIds.has(c.id)) ?? [];
    const loadError = owned.error ?? member.error;

    return (
        <div className="feedcomunnity-grey">
            <div className="feedcommunity-container">
                <div className="button-feedcommunity">
                    <button type="button" onClick={() => setIsOpen(true)}>{t('community.create')}</button>
                </div>

                {(owned.isPending || member.isPending) && <p className="feedcommunity-status">{t('community.loading')}</p>}
                {loadError && (
                    <div className="feedcommunity-status">
                        <p>{errorText.request(loadError)}</p>
                        <button type="button" onClick={() => { void owned.refetch(); void member.refetch(); }}>{t('common.tryAgain')}</button>
                    </div>
                )}

                {owned.data && owned.data.length > 0 && (
                    <div className="feedcommunity-my-community-container">
                        <h2 className="feedcomunity-section-title">{t('community.owned')}</h2>
                        <div className="feedcommunity-my-community-item">
                            {owned.data.map((community) => <CommunityCard key={community.id} community={community} owned />)}
                        </div>
                    </div>
                )}

                {joined.length > 0 && (
                    <div className="feedcommunity-my-community-container">
                        <h2 className="feedcomunity-section-title">{t('community.joined')}</h2>
                        {leaveError && <p className="feedcommunity-error">{leaveError}</p>}
                        {joined.map((community) => (
                            <CommunityCard
                                key={community.id}
                                community={community}
                                action={(
                                    <button
                                        type="button"
                                        className="feedcommunity-leave"
                                        disabled={leaving}
                                        onClick={() => leave({ communityId: community.id })}
                                    >
                                        {t('community.leave')}
                                    </button>
                                )}
                            />
                        ))}
                    </div>
                )}

                {owned.isSuccess && member.isSuccess && owned.data.length === 0 && joined.length === 0 && (
                    <p className="feedcommunity-status">{t('community.empty')}</p>
                )}

                {isOpen && <Modal closeModal={() => setIsOpen(false)} />}
            </div>
        </div>
    );
}
