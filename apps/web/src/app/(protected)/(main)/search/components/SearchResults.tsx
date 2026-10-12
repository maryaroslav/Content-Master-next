'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchSearch } from '@cm/api-client';
import { SearchQuerySchema } from '@cm/contracts';
import MembershipButton from './MembershipButton';
import { useCompactNumber } from '@/i18n/useCompactNumber';
import { useErrorText } from '@/i18n/useErrorText';

import '@/styles/feedCommunity.css';
import '@/styles/searchResults.css';
import arrowDown from '@images/icons/arrow-down.svg';
import userImg from '@images/icons/user.svg';

type Filter = 'all' | 'users' | 'communities';

export default function SearchResults({ query }: { query: string }) {
    const t = useTranslations();
    const errorText = useErrorText();
    const compact = useCompactNumber();
    const [filter, setFilter] = useState<Filter>('all');
    const parsed = SearchQuerySchema.safeParse({ q: query });
    const params = parsed.success ? parsed.data : { q: '' };
    const { data, error, status, refetch } = useSearchSearch(params, { query: { enabled: parsed.success } });

    const users = filter === 'communities' ? [] : data?.users ?? [];
    const communities = filter === 'users' ? [] : data?.communities ?? [];

    return (
        <div className="search-container">
            <h1 className="search-title">{t('search.title', { query })}</h1>
            <div className="search-buttons-container">
                {(['all', 'users', 'communities'] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={filter === value ? 'active' : undefined}
                        onClick={() => setFilter(value)}
                    >
                        {t(`search.filters.${value}`)}
                    </button>
                ))}
            </div>

            {!parsed.success && (
                <p className="search-status">
                    {errorText.field({ type: parsed.error.issues[0]?.code, message: parsed.error.issues[0]?.message }, 'q')}
                </p>
            )}
            {parsed.success && status === 'pending' && <p className="search-status">{t('search.searching')}</p>}
            {status === 'error' && (
                <div className="search-status">
                    <p>{errorText.request(error)}</p>
                    <button type="button" onClick={() => void refetch()}>{t('common.tryAgain')}</button>
                </div>
            )}
            {status === 'success' && users.length === 0 && communities.length === 0 && (
                <p className="search-status">{t('search.nothing')}</p>
            )}

            {users.map((user) => (
                <Link key={user.id} href={`/profile/${user.username}`}>
                    <div className="feedcommunity-my-community-container">
                        <div className="feedcommunity-item">
                            <Image src={user.profilePicture ?? userImg} alt={user.username} width={100} height={100} style={{ borderRadius: '50%' }} />
                            <div className="feedcommunity-item-title">
                                <p className="feedcommunity-type">{t('search.user')}</p>
                                <p className="feedcommunity-name">{user.username}</p>
                                {user.bio && <p className="feedcommunity-members">{user.bio}</p>}
                            </div>
                            <div className="feedcommunity-arrow">
                                <Image src={arrowDown} alt="" />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}

            {communities.map((community) => (
                <div key={community.id} className="feedcommunity-my-community-container">
                    <div className="feedcommunity-item">
                        <Image src={community.photo} alt={community.name} width={100} height={100} />
                        <div className="feedcommunity-item-title">
                            <p className="feedcommunity-type">{t(community.privacy === 'private' ? 'common.privacy.private' : 'common.privacy.public')}</p>
                            <p className="feedcommunity-name">{community.name}</p>
                            <p className="feedcommunity-members">{t('common.members', { count: community.membersCount, formatted: compact(community.membersCount) })}</p>
                        </div>
                        <MembershipButton community={community} query={params.q} />
                    </div>
                </div>
            ))}
        </div>
    );
}
