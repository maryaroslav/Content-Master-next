import HeaderMain from '@/components/headers/HeaderMain';
import NavBar from '@/components/navbars/NavBar';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
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
                <section className="settings-card">
                    <LanguageSwitcher />
                </section>
            </div>
        </div>
    );
}
