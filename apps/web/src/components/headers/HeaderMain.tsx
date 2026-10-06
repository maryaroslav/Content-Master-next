"use client";

import { useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import UserMenu from "./UserMenu";

import '@/styles/headerMain.css';
import logo from '@images/logo/logo.svg';
import search from '@images/icons/search.svg';
import message from '@images/icons/message.svg';
import kolokolchik from '@images/icons/notification.svg';

const HeaderMain = () => {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');

    const handleToMain = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push('/explore');
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
                <UserMenu />
            </nav>
        </header>
    );
}

export default HeaderMain;