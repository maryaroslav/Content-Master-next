'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { logout, useAuth } from '@cm/auth';

import userImg from '@images/icons/user.svg';
import arrowDown from '@images/icons/arrow-down.svg';

export default function UserMenu() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('pointerdown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [open]);

    if (!user) return null;

    const handleLogout = async () => {
        setOpen(false);
        try {
            await logout();
        } catch {
            // logout() ends the local session even when the request fails, and the protected layout redirects either way.
        }
    };

    return (
        <div className="user-container" ref={containerRef}>
            <button
                type="button"
                className="user"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className="user-img">
                    {user.profilePicture
                        ? <Image src={user.profilePicture} alt="" width={48} height={48} />
                        : <Image src={userImg} alt="" />}
                </span>
                <span className="user-name">{user.username}</span>
                <span className="user-modal">
                    <Image src={arrowDown} alt="" className={open ? 'rotated' : undefined} />
                </span>
            </button>
            {open && (
                <div className="user-menu" role="menu">
                    <Link href={`/profile/${user.username}`} role="menuitem" onClick={() => setOpen(false)}>
                        My profile
                    </Link>
                    <button type="button" role="menuitem" onClick={handleLogout}>Log out</button>
                </div>
            )}
        </div>
    );
}
