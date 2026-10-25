'use client';

import SmsRounded from '@mui/icons-material/SmsRounded';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { logout, useAuth } from '@cm/auth';
import { SearchQuerySchema } from '@cm/contracts';
import { Header, SearchField, UserMenu } from '@cm/ui';
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
                    <IconButton href="/chat" aria-label={hasUnread ? t('chatUnread') : t('chat')}>
                        <Badge variant="dot" overlap="circular" invisible={!hasUnread}>
                            <SmsRounded />
                        </Badge>
                    </IconButton>
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
