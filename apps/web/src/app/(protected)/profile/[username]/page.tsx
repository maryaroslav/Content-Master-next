import AppHeader from '@/components/shell/AppHeader';
import ProfileView from './components/ProfileView';

import '@/styles/profileUser.css';

export default async function ProfilePage({ params }: PageProps<'/profile/[username]'>) {
    const { username } = await params;
    return (
        <div>
            <AppHeader />
            <ProfileView username={username} />
        </div>
    );
}
