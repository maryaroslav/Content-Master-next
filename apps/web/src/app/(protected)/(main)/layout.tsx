import { getTranslations } from 'next-intl/server';
import { AppShell } from '@cm/ui';
import AppHeader from '@/components/shell/AppHeader';
import AppNavTabs from '@/components/shell/AppNavTabs';
import DiscoverSidebar from '@/components/shell/DiscoverSidebar';
import MainSidebar from '@/components/shell/MainSidebar';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const t = await getTranslations('nav');
    return (
        <AppShell
            header={<AppHeader />}
            tabs={<AppNavTabs />}
            start={<MainSidebar />}
            startLabel={t('sidebar')}
            end={<DiscoverSidebar />}
            endLabel={t('discover')}
        >
            {children}
        </AppShell>
    );
}
