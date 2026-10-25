import AppHeader from '@/components/shell/AppHeader';
import { TabsBar } from '@cm/ui';
import AppNavTabs from '@/components/shell/AppNavTabs';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
import AccountSettings from './components/AccountSettings';
import ProfileSettings from './components/ProfileSettings';
import TwoFactorSettings from './components/TwoFactorSettings';

import '@/styles/settings.css';

export default function SettingsPage() {
    return (
        <div>
            <AppHeader />
            <TabsBar>
                <AppNavTabs />
            </TabsBar>
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
