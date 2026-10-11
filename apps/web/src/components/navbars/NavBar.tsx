"use client";

import Link from 'next/link'
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import '../../styles/navBar.css';


const NavBar = () => {
    const pathname = usePathname();
    const t = useTranslations('nav');
    return (
        <div className="navbar-container">
            <div className="navbar">
                <nav>
                    <ul>
                        <li>
                            <Link href='/explore' className={pathname === "/explore" ? "active" : ""}>{t('explore')}</Link>
                        </li>
                        <li>
                            <Link href='/community' className={pathname === '/community' ? "active" : ""}>{t('myCommunity')}</Link>
                        </li>
                        <li>
                            <Link href='/events' className={pathname === '/events' ? "active" : ""}>{t('events')}</Link>
                        </li>
                        <li>
                            <Link href='/settings' className={pathname === '/settings' ? "active" : ""}>{t('settings')}</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default NavBar;