import { getTranslations } from 'next-intl/server';
import { SectionCard } from '@cm/ui';

export default async function DiscoverSidebar() {
    const t = await getTranslations('nav');
    return (
        <>
            <SectionCard title={t('popularTags')} />
            <SectionCard title={t('podcasts')} />
        </>
    );
}
