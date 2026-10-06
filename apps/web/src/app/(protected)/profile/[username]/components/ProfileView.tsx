'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getErrorMessage, useUsersProfile } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import FollowButton from './FollowButton';
import ProfileHeader from './ProfileHeader';
import TwoFactorSettings from './TwoFactorSettings';

import chatBtn from '@images/icons/chat.svg';

export default function ProfileView({ username }: { username: string }) {
    const { user } = useAuth();
    const { data: profile, error, status, refetch } = useUsersProfile(username);

    if (status === 'pending') return <p className="profile-status">Loading...</p>;
    if (status === 'error') {
        return (
            <div className="profile-status">
                <p>{getErrorMessage(error)}</p>
                <button type="button" onClick={() => void refetch()}>Try again</button>
            </div>
        );
    }

    const isOwnProfile = user?.id === profile.id;

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <ProfileHeader profile={profile}>
                    {!isOwnProfile && (
                        <>
                            <FollowButton profile={profile} />
                            <Link href={`/chat?to=${profile.id}`} className="profile-chat-link" aria-label="Send a message">
                                <Image src={chatBtn} alt="" width={16} height={16} />
                            </Link>
                        </>
                    )}
                </ProfileHeader>
                {isOwnProfile && <TwoFactorSettings />}
            </div>
        </div>
    );
}
