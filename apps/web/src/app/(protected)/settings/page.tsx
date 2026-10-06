import HeaderMain from '@/components/headers/HeaderMain';
import NavBar from '@/components/navbars/NavBar';
import AccountSettings from './components/AccountSettings';
import ProfileSettings from './components/ProfileSettings';
import TwoFactorSettings from './components/TwoFactorSettings';

import '@/styles/settings.css';

export default function SettingsPage() {
    return (
        <div>
            <HeaderMain />
            <NavBar />
            <div className="settings-container">
                <ProfileSettings />
                <AccountSettings />
                <TwoFactorSettings />
            </div>
        </div>
    );
}
