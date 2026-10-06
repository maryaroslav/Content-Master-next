"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { SearchQuerySchema } from "@cm/contracts";
import { useZodForm } from "@cm/forms";
import UserMenu from "./UserMenu";

import '@/styles/headerMain.css';
import logo from '@images/logo/logo.svg';
import search from '@images/icons/search.svg';
import message from '@images/icons/message.svg';
import kolokolchik from '@images/icons/notification.svg';

const HeaderMain = () => {
    const router = useRouter();
    const { register, handleSubmit } = useZodForm(SearchQuerySchema, { defaultValues: { q: '' } });
    const onSearch = handleSubmit(({ q }) => router.push(`/search?q=${encodeURIComponent(q)}`));

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
                <form className="search" role="search" onSubmit={onSearch}>
                    <Image src={search} alt="" />
                    <input type="text" placeholder="Search" {...register('q')} />
                </form>
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