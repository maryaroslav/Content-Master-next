import Box from '@mui/material/Box';
import AppHeader from '@/components/shell/AppHeader';
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
            <Box sx={{ bgcolor: 'background.paper', px: { xs: 4, sm: 6 } }}>
                <AppNavTabs />
            </Box>
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
