import HeaderMain from '@/components/headers/HeaderMain';
import NavBar from '@/components/navbars/NavBar';
import NavBarLeft from '@/components/navbars/NavBarLeft';
import NavBarRight from '@/components/navbars/NavBarRight';

import { getAccessTokenOrRedirect } from '../lib/apiClient.server';
import '../../styles/main.css';

async function getUserCommunities() {
    const accessToken = await getAccessTokenOrRedirect();

    const res = await fetch('http://localhost:5000/api/user/usercommunities', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Failed to fetch communities.');
    }

    return res.json();
}

async function getUserEvents() {
    const accessToken = await getAccessTokenOrRedirect();

    const res = await fetch('http://localhost:5000/api/user/userevents', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new Error('Failed to fetch events');
    }

    return res.json();
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const communities = await getUserCommunities();
    const events = await getUserEvents();

    return (
        <div className="page-layout">
            <HeaderMain />
            <NavBar />
            <div className="main-info-container">
                <div className="sidebar-fixed">
                    <NavBarLeft communities={communities} events={events} />
                </div>
                <div className="content-scrollable">
                    {children}
                </div>
                <NavBarRight />
            </div>
        </div>
    );
}
