'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    getErrorMessage,
    getUsersProfileQueryKey,
    useUsersFollow,
    useUsersUnfollow,
    type FollowStatus,
    type UserProfile,
} from '@cm/api-client';

export default function FollowButton({ profile }: { profile: UserProfile }) {
    const queryClient = useQueryClient();
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
            setError(getErrorMessage(err));
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
                {profile.isFollowing ? 'Unfriend' : 'Add to friends'}
            </button>
            {error && <p className="profile-error">{error}</p>}
        </>
    );
}
