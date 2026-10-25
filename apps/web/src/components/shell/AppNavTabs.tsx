'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NavTabs } from '@cm/ui';

export default function AppNavTabs() {
    const t = useTranslations('nav');
    const pathname = usePathname();
    return (
        <NavTabs
            label={t('label')}
            current={pathname}
            items={[
                { label: t('explore'), href: '/explore' },
                { label: t('myCommunity'), href: '/community' },
                { label: t('events'), href: '/events' },
                { label: t('settings'), href: '/settings' },
            ]}
        />
    );
}
