import Image from 'next/image';
import type { UserProfile } from '@cm/api-client';

import userImg from '@images/icons/user.svg';

interface ProfileHeaderProps {
    profile: UserProfile;
    children?: React.ReactNode;
}

export default function ProfileHeader({ profile, children }: ProfileHeaderProps) {
    const followers = `${profile.followersCount} follower${profile.followersCount === 1 ? '' : 's'}`;

    return (
        <div className="profile-header">
            <div className="profile-header-info">
                <div className="profile-info-image-user">
                    <Image src={profile.profilePicture ?? userImg} width={100} height={100} alt={profile.username} />
                </div>
                <div className="profile-info-username-bio">
                    <div className="profile-info-username">
                        <p>{profile.fullName ?? profile.username}</p>
                    </div>
                    <p className="profile-info-handle">@{profile.username} · {followers}</p>
                    {profile.bio && (
                        <div className="profile-info-bio">
                            <p>{profile.bio}</p>
                        </div>
                    )}
                </div>
                <div className="profile-buttons">{children}</div>
            </div>
        </div>
    );
}
