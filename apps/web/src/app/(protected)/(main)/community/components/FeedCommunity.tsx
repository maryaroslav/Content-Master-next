'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
    getUsersMyCommunitiesQueryKey,
    useCommunitiesLeave,
    useCommunitiesListOwned,
    useUsersMyCommunities,
    type CommunitySummary,
} from '@cm/api-client';
import { Alert, Button, Card, EmptyState, EntityList, EntityRow, ErrorState, LoadingState, SectionCard, Stack, Typography } from '@cm/ui';
import CreateCommunityDialog from './modal/Modal';
import { useCompactNumber } from '@/i18n/useCompactNumber';
import { useErrorText } from '@/i18n/useErrorText';

const memberListKey = getUsersMyCommunitiesQueryKey();

function CommunityRow({ community, action }: { community: CommunitySummary; action?: React.ReactNode }) {
    const t = useTranslations('common');
    const compact = useCompactNumber();
    return (
        <EntityRow
            image={community.photo}
            imageSize="lg"
            overline={t(community.privacy === 'private' ? 'privacy.private' : 'privacy.public')}
            title={community.name}
            meta={t('members', { count: community.membersCount, formatted: compact(community.membersCount) })}
            action={action}
        />
    );
}

export default function FeedCommunity() {
    const queryClient = useQueryClient();
    const t = useTranslations();
    const errorText = useErrorText();
    const [creating, setCreating] = useState(false);
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
    const loaded = owned.isSuccess && member.isSuccess;
    const createButton = <Button size="small" onClick={() => setCreating(true)}>{t('community.create')}</Button>;

    return (
        <Stack gap={4}>
            {(owned.isPending || member.isPending) && <LoadingState label={t('community.loading')} />}
            {loadError && (
                <ErrorState message={errorText.request(loadError)} retryLabel={t('common.tryAgain')} onRetry={() => { void owned.refetch(); void member.refetch(); }} />
            )}

            {loaded && owned.data.length === 0 && joined.length === 0 ? (
                <Card>
                    <EmptyState title={t('community.empty')} action={createButton}>{t('community.emptyText')}</EmptyState>
                </Card>
            ) : null}

            {loaded && (owned.data.length > 0 || joined.length > 0) ? (
                <>
                    <SectionCard title={t('community.owned')} action={createButton} flush={owned.data.length > 0}>
                        {owned.data.length > 0 ? (
                            <EntityList label={t('community.owned')}>
                                {owned.data.map((community) => <CommunityRow key={community.id} community={community} />)}
                            </EntityList>
                        ) : (
                            <Typography variant="small" color="muted">{t('community.ownedEmpty')}</Typography>
                        )}
                    </SectionCard>
                    {joined.length > 0 && (
                        <SectionCard title={t('community.joined')} flush>
                            {leaveError && <Alert severity="error">{leaveError}</Alert>}
                            <EntityList label={t('community.joined')}>
                                {joined.map((community) => (
                                    <CommunityRow
                                        key={community.id}
                                        community={community}
                                        action={
                                            <Button variant="secondary" size="small" disabled={leaving} onClick={() => leave({ communityId: community.id })} aria-label={`${t('community.leave')}: ${community.name}`}>
                                                {t('community.leave')}
                                            </Button>
                                        }
                                    />
                                ))}
                            </EntityList>
                        </SectionCard>
                    )}
                </>
            ) : null}

            <CreateCommunityDialog open={creating} onClose={() => setCreating(false)} />
        </Stack>
    );
}
