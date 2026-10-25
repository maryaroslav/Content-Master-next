'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUsersProfile } from '@cm/api-client';
import { useAuth } from '@cm/auth';
import FollowButton from './FollowButton';
import ProfileHeader from './ProfileHeader';
import { useErrorText } from '@/i18n/useErrorText';

import chatBtn from '@images/icons/chat.svg';

export default function ProfileView({ username }: { username: string }) {
    const { user } = useAuth();
    const t = useTranslations();
    const errorText = useErrorText();
    const { data: profile, error, status, refetch } = useUsersProfile(username);

    if (status === 'pending') return <p className="profile-status">{t('common.loading')}</p>;
    if (status === 'error') {
        return (
            <div className="profile-status">
                <p>{errorText.request(error)}</p>
                <button type="button" onClick={() => void refetch()}>{t('common.tryAgain')}</button>
            </div>
        );
    }

    const isOwnProfile = user?.id === profile.id;

    return (
        <div className="profile-wrapper">
            <div className="profile-container">
                <ProfileHeader profile={profile}>
                    {isOwnProfile ? (
                        <Link href="/settings" className="profile-edit-link">{t('profile.edit')}</Link>
                    ) : (
                        <>
                            <FollowButton profile={profile} />
                            <Link href={`/chat?to=${profile.id}`} className="profile-chat-link" aria-label={t('profile.sendMessage')}>
                                <Image src={chatBtn} alt="" width={16} height={16} />
                            </Link>
                        </>
                    )}
                </ProfileHeader>
            </div>
        </div>
    );
}
