'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import {
    getSearchSearchQueryKey,
    getUsersMyCommunitiesQueryKey,
    useCommunitiesJoin,
    useCommunitiesLeave,
    type CommunitySearchItem,
    type MembershipStatus,
    type SearchResponse,
} from '@cm/api-client';
import { useErrorText } from '@/i18n/useErrorText';

interface MembershipButtonProps {
    community: CommunitySearchItem;
    query: string;
}

export default function MembershipButton({ community, query }: MembershipButtonProps) {
    const queryClient = useQueryClient();
    const t = useTranslations();
    const errorText = useErrorText();
    const [error, setError] = useState<string | null>(null);

    const mutation = {
        onMutate: () => setError(null),
        onSuccess: (status: MembershipStatus) => {
            queryClient.setQueryData<SearchResponse>(getSearchSearchQueryKey({ q: query }), (current) => current && {
                ...current,
                communities: current.communities.map((c) => (c.id === community.id ? { ...c, ...status } : c)),
            });
            void queryClient.invalidateQueries({ queryKey: getUsersMyCommunitiesQueryKey() });
        },
        onError: (err: unknown) => setError(errorText.request(err) ?? null),
    };
    const join = useCommunitiesJoin({ mutation });
    const leave = useCommunitiesLeave({ mutation });
    const pending = join.isPending || leave.isPending;

    if (!community.isMember && community.privacy === 'private') {
        return <span className="search-membership-note">{t('common.privacy.private')}</span>;
    }

    return (
        <div className="search-membership">
            <button
                type="button"
                className={community.isMember ? 'secondary' : undefined}
                disabled={pending}
                onClick={() => (community.isMember ? leave : join).mutate({ communityId: community.id })}
            >
                {community.isMember ? t('community.leave') : t('community.join')}
            </button>
            {error && <p className="search-error">{error}</p>}
        </div>
    );
}
