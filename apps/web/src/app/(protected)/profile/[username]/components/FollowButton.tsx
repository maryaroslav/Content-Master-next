'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import {
    getUsersProfileQueryKey,
    useUsersFollow,
    useUsersUnfollow,
    type FollowStatus,
    type UserProfile,
} from '@cm/api-client';
import { useErrorText } from '@/i18n/useErrorText';

export default function FollowButton({ profile }: { profile: UserProfile }) {
    const queryClient = useQueryClient();
    const t = useTranslations('profile');
    const errorText = useErrorText();
    const queryKey = getUsersProfileQueryKey(profile.username);
    const [error, setError] = useState<string | null>(null);

    const mutation = {
        onMutate: async () => {
            setError(null);
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData<UserProfile>(queryKey);
            queryClient.setQueryData<UserProfile>(queryKey, (current) => current && {
                ...current,
                isFollowing: !current.isFollowing,
                followersCount: current.followersCount + (current.isFollowing ? -1 : 1),
            });
            return { previous };
        },
        onSuccess: (status: FollowStatus) => {
            queryClient.setQueryData<UserProfile>(queryKey, (current) => current && { ...current, ...status });
        },
        onError: (err: unknown, _variables: unknown, context: { previous?: UserProfile } | undefined) => {
            queryClient.setQueryData(queryKey, context?.previous);
            setError(errorText.request(err) ?? null);
        },
    };
    const follow = useUsersFollow({ mutation });
    const unfollow = useUsersUnfollow({ mutation });

    const toggle = () => (profile.isFollowing ? unfollow : follow).mutate({ userId: profile.id });

    return (
        <>
            <button
                type="button"
                className={`follow-button${profile.isFollowing ? ' following' : ''}`}
                onClick={toggle}
                disabled={follow.isPending || unfollow.isPending}
            >
                {profile.isFollowing ? t('unfollow') : t('follow')}
            </button>
            {error && <p className="profile-error">{error}</p>}
        </>
    );
}
