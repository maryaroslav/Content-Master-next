'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { fetchWithAuth } from '@/app/lib/apiClient';
import HeaderMain from '@/components/headers/HeaderMain';
import chatBtn from '@images/icons/chat.svg';
import '@/styles/profileUser.css';

interface User {
    user_id: string | number;
    username: string;
    full_name?: string;
    profile_picture?: string | null;
    bio?: string;
    twoFactorEnabled?: boolean;
};

const ProfilePage = () => {
    const { username } = useParams()
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false)
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [twoFAToken, setTwoFAToken] = useState('');
    const [secret, setSecret] = useState('');
    const modalRef = useRef<HTMLDivElement | null>(null);
    const prevTwoFARef = useRef<boolean | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        // Инициализация prev при первом рендере/загрузке пользователя
        if (prevTwoFARef.current === undefined) {
            prevTwoFARef.current = currentUser?.twoFactorEnabled;
            return;
        }

        // Закрываем модал только если флаг сменился с false -> true (т.е. 2FA только что активировали)
        if (!prevTwoFARef.current && currentUser?.twoFactorEnabled) {
            setQrCode(null);
            setTwoFAToken('');
            setSecret('');
            setShow2FAModal(false);
        }

        prevTwoFARef.current = currentUser?.twoFactorEnabled;
    }, [currentUser?.twoFactorEnabled]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const current = await fetchWithAuth('http://localhost:5000/api/user/me') as User;
                setCurrentUser(current)

                const user = await fetchWithAuth(`http://localhost:5000/api/user/byusername/${username}`) as User;
                setProfileUser(user)

                if (user.user_id !== current.user_id) {
                    const followStatus = (await fetchWithAuth(`http://localhost:5000/api/follow/status/${user.user_id}`)) as { isFollowing?: boolean };
                    setIsFollowing(followStatus?.isFollowing || false)
                }
            } catch (err) {
                console.error(err)
            }
        }

        fetchData()
    }, [username])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (modalRef.current && !modalRef.current.contains(target)) {
                setShow2FAModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleFollow = async () => {
        if (!profileUser) return
        try {
            setLoadingFollow(true)
            const endpoint = isFollowing ? 'unfollow' : 'follow'
            await fetchWithAuth(`http://localhost:5000/api/follow/${endpoint}/${profileUser.user_id}`, {
                method: 'POST'
            })
            setIsFollowing(!isFollowing)
        } catch (err) {
            console.error('Error follow:', err)
        } finally {
            setLoadingFollow(false)
        }
    }

    const renderButtons = () => {
        if (!currentUser || !profileUser) return null
        if (currentUser.user_id === profileUser.user_id) {
            return (
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShow2FAModal(prev => !prev)}>Edit profile</button>
                    {show2FAModal && (
                        <div
                            ref={modalRef}
                            style={{
                                position: 'absolute',
                                top: '40px',
                                left: 0,
                                backgroundColor: '#fff',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                padding: '10px',
                                zIndex: 1000,
                                borderRadius: '10px',
                                minWidth: '220px'
                            }}
                        >
                            <p style={{ marginBottom: '10px' }}>Two-Factor Auth</p>

                            {currentUser.twoFactorEnabled ? (
                                <button
                                    onClick={async () => {
                                        try {
                                            const session = await getSession();
                                            const token = session?.accessToken;
                                            if (!token) throw new Error('No token found');

                                            const res = await fetch('http://localhost:5000/api/auth/2fa/disable', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    Authorization: `Bearer ${token}`
                                                }
                                            });

                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.message);

                                            alert('2FA deactivated');
                                            setShow2FAModal(false);
                                            const updatedUser = await fetchWithAuth('http://localhost:5000/api/user/me') as User;
                                            setCurrentUser(updatedUser);
                                        } catch (err: unknown) {
                                            const message = err instanceof Error ? err.message : String(err);
                                            alert('Error: ' + message);
                                        }
                                    }}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#f44336',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Disable 2FA
                                </button>
                            ) : !qrCode ? (
                                <button
                                    onClick={async () => {
                                        try {
                                            const session = await getSession();
                                            const token = session?.accessToken;
                                            if (!token) throw new Error('No token found');

                                            const res = await fetch('http://localhost:5000/api/auth/2fa/setup', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    Authorization: `Bearer ${token}`
                                                }
                                            });

                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.message);

                                            setQrCode(data.qrCode);
                                            setSecret(data.secret);
                                        } catch (err: unknown) {
                                            const message = err instanceof Error ? err.message : String(err);
                                            alert('Error: ' + message);
                                        }
                                    }}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#4CAF50',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Start 2FA setup
                                </button>
                            ) : (
                                <>
                                    <img src={qrCode} alt="2FA QR Code" style={{ width: '150px', marginBottom: '10px' }} />
                                    <input
                                        type="text"
                                        placeholder="Enter 2FA code"
                                        value={twoFAToken}
                                        onChange={(e) => setTwoFAToken(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '6px',
                                            marginBottom: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <button
                                        onClick={async () => {
                                            try {
                                                const session = await getSession();
                                                const token = session?.accessToken;
                                                if (!token) throw new Error('No token found');

                                                const res = await fetch('http://localhost:5000/api/auth/2fa/verify', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify({ token: twoFAToken })
                                                });

                                                const data = await res.json();
                                                if (!res.ok || !data.verified) throw new Error(data.message || 'Verification failed');

                                                alert('2FA successfully activated!');
                                                const updatedUser = await fetchWithAuth('http://localhost:5000/api/user/me') as User;
                                                console.log('updatedUser:', updatedUser);
                                                setCurrentUser(updatedUser);
                                                setQrCode(null);
                                                setTwoFAToken('');
                                                setSecret('');
                                                setTimeout(() => setShow2FAModal(false), 100);
                                            } catch (err: unknown) {
                                                const message = err instanceof Error ? err.message : String(err);
                                                alert('Verification Error: ' + message);
                                            }
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#2196F3',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Verify 2FA
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    <button style={{ marginLeft: '8px' }}>More</button>
                </div>
            );
        }

        return (
            <>
                <button
                    onClick={toggleFollow}
                    disabled={loadingFollow}
                    style={{
                        backgroundColor: isFollowing ? '#ddd' : '#0094FF',
                        color: isFollowing ? '#333' : '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: '6px'
                    }}
                >
                    {loadingFollow
                        ? 'Loading...'
                        : isFollowing
                            ? 'Unfriend'
                            : 'Add to friends'}
                </button>

                <button
                    onClick={() => router.push(`/chat?to=${profileUser.user_id}`)}
                    style={{
                        color: '#0094FF',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '22px',
                        width: '30px',
                        marginRight: '6px'
                    }}
                >
                    <Image src={chatBtn} alt="chat" width={16} height={16} />
                </button>

                <button>More</button>
            </>
        )

    }

    if (!profileUser) return <p>Loading...</p>

    return (
        <div>
            <HeaderMain />
            <div className="profile-wrapper">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-header-info">
                            <div className="profile-info-image-user">
                                {profileUser.profile_picture ? (
                                    <Image
                                        src={`http://localhost:5000/uploads/${profileUser.profile_picture}`}
                                        width={100}
                                        height={100}
                                        alt={profileUser.username}
                                        style={{ borderRadius: '50%' }}
                                    />
                                ) : (
                                    <Image
                                        src="/img/icons/user.svg"
                                        alt="default"
                                        width={100}
                                        height={100}
                                        style={{ borderRadius: '50%' }}
                                    />
                                )}
                            </div>
                            <div className='profile-info-username-bio'>
                                <div className="profile-info-username">
                                    <p>{profileUser.full_name}</p>
                                </div>
                                <div className='profile-info-bio'>
                                    <p>{profileUser.bio}</p>
                                </div>
                            </div>
                            <div className='profile-buttons'>
                                {renderButtons()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage;