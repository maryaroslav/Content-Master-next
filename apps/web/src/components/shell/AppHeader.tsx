'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { logout, useAuth } from '@cm/auth';
import { SearchQuerySchema } from '@cm/contracts';
import { Header, IconButton, SearchField, UserMenu } from '@cm/ui';
import { useUnread } from '@/chat/chatCache';

export default function AppHeader() {
    const t = useTranslations('header');
    const router = useRouter();
    const { user } = useAuth();
    const hasUnread = useUnread().length > 0;

    const search = (q: string) => {
        if (SearchQuerySchema.safeParse({ q }).success) router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <Header
            homeHref="/explore"
            homeLabel={t('home')}
            search={<SearchField placeholder={t('search')} onSearch={search} />}
            actions={
                <>
                    <IconButton href="/chat" icon="messages" label={hasUnread ? t('chatUnread') : t('chat')} dot={hasUnread} />
                    {user && (
                        <UserMenu
                            user={{ username: user.username, avatar: user.profilePicture }}
                            items={[
                                { label: t('myProfile'), href: `/profile/${user.username}` },
                                { label: t('logOut'), onClick: logout, divider: true },
                            ]}
                        />
                    )}
                </>
            }
        />
    );
}
