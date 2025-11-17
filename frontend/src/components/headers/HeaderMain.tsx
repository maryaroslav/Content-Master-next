"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/lib/apiClient";

import '@/styles/headerMain.css';
import logo from '@images/logo/logo.svg';
import search from '@images/icons/search.svg';
import message from '@images/icons/message.svg';
import kolokolchik from '@images/icons/notification.svg';
import userImg from '@images/icons/user.svg';
import arrowDown from '@images/icons/arrow-down.svg';

interface User {
    username?: string;
    profile_picture?: string;
}

const HeaderMain = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await fetchWithAuth("http://localhost:5000/api/user/me");
                if (data) setUser(data);
            } catch (err) {
                console.error("Error loading user", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);


    const handleToMain = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push('/explore');
    }

    const handleToProfileUser = (event: React.MouseEvent) => {
        event.preventDefault();
        if (user?.username) {
            router.push(`/profile/${user.username}`);
        }
    }

    return (
        <header className='header-main'>
            <div className='logo' onClick={handleToMain}>
                <Image src={logo} alt="logo" />
                <p>Content Master</p>
            </div>
            <div className="search-container">
                <div className="search">
                    <Image src={search} alt="" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter' && searchInput.trim()) {
                                router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
                            }
                        }}
                    />
                </div>
            </div>
            <nav className='nav'>
                <Link href="/chat" className='link'><Image src={message} alt="" /></Link>
                <Link href="/" className='link'><Image src={kolokolchik} alt="" /></Link>
                <div className="user-container">
                    <div className="user">
                        <div className="user-img" onClick={handleToProfileUser}>
                            {user?.profile_picture ? (
                                <Image src={`http://localhost:5000/uploads/${user.profile_picture}`} alt="user avatar" width={100} height={100} />
                            ) : (
                                <Image src={userImg} alt="Default user icon" />
                            )}

                        </div>
                        <div className="user-name">
                            <p>{loading ? 'Loading...' : user ? user.username : '...'}</p>
                        </div>
                        <div className="user-modal" onClick={() => setIsOpen((prev) => !prev)}>
                            <Image src={arrowDown} alt="toggle" />
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default HeaderMain;