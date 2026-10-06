import HeaderMain from '@/components/headers/HeaderMain';
import ProfileView from './components/ProfileView';

import '@/styles/profileUser.css';

export default async function ProfilePage({ params }: PageProps<'/profile/[username]'>) {
    const { username } = await params;
    return (
        <div>
            <HeaderMain />
            <ProfileView username={username} />
        </div>
    );
}
