'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/app/lib/apiClient';
import arrowDown from '@images/icons/arrow-down.svg';
import Link from 'next/link';
import Image from 'next/image';
import { formatMembersCount } from '@/app/utils/FormatMembersCount';
import '@/styles/feedCommunity.css';
import '@/styles/searchResults.css';

interface UserProps {
    user_id: number;
    profile_picture: string;
    username: string;
    bio: string;
}

interface CommunityProps {
    community_id: number;
    photo: string;
    name: string;
    privacy: string;
    members_count: number;
}

type SearchResponse = {
    users?: unknown;
    communities?: unknown;
};

export default function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [users, setUsers] = useState<UserProps[]>([]);
    const [communities, setCommunities] = useState<CommunityProps[]>([]);
    const [filter, setFilter] = useState('all');
    console.log(users);
    console.log(communities);

    useEffect(() => {
        if (!query) return;

        (async () => {
            try {
                const res: unknown = await fetchWithAuth(`http://localhost:5000/api/search?q=${query}`);

                const data = res as SearchResponse;
                if (typeof data !== 'object' || data === null) {
                    console.error('Invalid search response', res);
                    return;
                }

                if (Array.isArray(data.users)) {
                    const validUsers = data.users.filter(
                        (u): u is UserProps =>
                            typeof u === 'object' &&
                            u !== null &&
                            'user_id' in u &&
                            'username' in u
                    );
                    setUsers(validUsers);
                } else {
                    setUsers([]);
                }

                if (Array.isArray(data.communities)) {
                    const validCommunities = data.communities.filter(
                        (c): c is CommunityProps =>
                            typeof c === 'object' &&
                            c !== null &&
                            'community_id' in c &&
                            'name' in c
                    );
                    setCommunities(validCommunities);
                } else {
                    setCommunities([]);
                }
            } catch (err) {
                console.error('Search request failed', err);
            }
        })();
    }, [query]);

    return (
        <div style={{ marginTop: '43px', padding: '20px', borderRadius: '10px', backgroundColor: '#fafafa' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Search results for &quot;{query}&quot;</h1>
            <div className='search-buttons-container' style={{ marginBottom: '15px' }}>
                <button onClick={() => setFilter('all')}>All</button>
                <button onClick={() => setFilter('users')}>Users</button>
                <button onClick={() => setFilter('communities')}>Communities</button>
            </div>

            {filter !== 'communities' && users.map(u => (
                <Link key={u.user_id} href={`/profile/${u.username}`}>
                    <div className='feedcommunity-my-community-container'>
                        <div className="feedcommunity-item">
                            {u.profile_picture ? (
                                <Image src={`http://localhost:5000/uploads/${u.profile_picture}`} alt={u.username} width={100} height={100} style={{ borderRadius: '50%' }} />
                            ) : (
                                <Image src="/img/icons/user.svg" alt="default" width={100} height={100} style={{ borderRadius: '50%' }} />
                            )}
                            <div className="feedcommunity-item-title">
                                <p className="feedcommunity-type">USER</p>
                                <p className="feedcommunity-name">{u.username}</p>
                                <p className="feedcommunity-members">{u.bio}</p>
                            </div>
                            <div className='feedcommunity-arrow'>
                                <Image src={arrowDown} alt="" />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}

            {filter !== 'users' && communities.map(c => (
                <Link key={c.community_id} href={`/community/${c.community_id}`}>
                    <div className='feedcommunity-my-community-container'>
                        <div className="feedcommunity-item">
                            <Image src={`http://localhost:5000${c.photo}`} alt={c.name} width={100} height={100} />
                            <div className="feedcommunity-item-title">
                                <p className="feedcommunity-type">{c.privacy}</p>
                                <p className="feedcommunity-name">{c.name}</p>
                                <p className="feedcommunity-members">{formatMembersCount(c.members_count)} Members</p>
                            </div>
                            <div className='feedcommunity-arrow'>
                                <Image src={arrowDown} alt="" />
                            </div>
                        </div>
                    </div>
                </Link>

            ))}
        </div>
    );
}
