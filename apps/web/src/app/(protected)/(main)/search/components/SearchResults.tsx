'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getErrorMessage, useSearchSearch } from '@cm/api-client';
import { SearchQuerySchema } from '@cm/contracts';
import MembershipButton from './MembershipButton';
import { formatMembersCount } from '@/app/utils/FormatMembersCount';

import '@/styles/feedCommunity.css';
import '@/styles/searchResults.css';
import arrowDown from '@images/icons/arrow-down.svg';
import userImg from '@images/icons/user.svg';

type Filter = 'all' | 'users' | 'communities';

export default function SearchResults({ query }: { query: string }) {
    const [filter, setFilter] = useState<Filter>('all');
    const parsed = SearchQuerySchema.safeParse({ q: query });
    const params = parsed.success ? parsed.data : { q: '' };
    const { data, error, status, refetch } = useSearchSearch(params, { query: { enabled: parsed.success } });

    const users = filter === 'communities' ? [] : data?.users ?? [];
    const communities = filter === 'users' ? [] : data?.communities ?? [];

    return (
        <div className="search-container">
            <h1 className="search-title">Search results for &quot;{query}&quot;</h1>
            <div className="search-buttons-container">
                {(['all', 'users', 'communities'] as const).map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={filter === value ? 'active' : undefined}
                        onClick={() => setFilter(value)}
                    >
                        {value[0]!.toUpperCase() + value.slice(1)}
                    </button>
                ))}
            </div>

            {!parsed.success && <p className="search-status">{parsed.error.issues[0]?.message}</p>}
            {parsed.success && status === 'pending' && <p className="search-status">Searching...</p>}
            {status === 'error' && (
                <div className="search-status">
                    <p>{getErrorMessage(error)}</p>
                    <button type="button" onClick={() => void refetch()}>Try again</button>
                </div>
            )}
            {status === 'success' && users.length === 0 && communities.length === 0 && (
                <p className="search-status">Nothing found.</p>
            )}

            {users.map((user) => (
                <Link key={user.id} href={`/profile/${user.username}`}>
                    <div className="feedcommunity-my-community-container">
                        <div className="feedcommunity-item">
                            <Image src={user.profilePicture ?? userImg} alt={user.username} width={100} height={100} style={{ borderRadius: '50%' }} />
                            <div className="feedcommunity-item-title">
                                <p className="feedcommunity-type">USER</p>
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
                            <p className="feedcommunity-type">{community.privacy}</p>
                            <p className="feedcommunity-name">{community.name}</p>
                            <p className="feedcommunity-members">{formatMembersCount(community.membersCount)} Members</p>
                        </div>
                        <MembershipButton community={community} query={params.q} />
                    </div>
                </div>
            ))}
        </div>
    );
}
