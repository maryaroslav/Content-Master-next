"use client";

import Link from 'next/link'
import { usePathname } from "next/navigation";
import '../../styles/navBar.css';


const NavBar = () => {
    const pathname = usePathname();
    return (
        <div className="navbar-container">
            <div className="navbar">
                <nav>
                    <ul>
                        <li>
                            <Link href='/explore' className={pathname === "/explore" ? "active" : ""}>Explore</Link>
                        </li>
                        <li>
                            <Link href='/community' className={pathname === '/community' ? "active" : ""}>My Community</Link>
                        </li>
                        <li>
                            <Link href='/events' className={pathname === '/events' ? "active" : ""}>Events</Link>
                        </li>
                        <li>
                            <Link href='/settings' className={pathname === '/settings' ? "active" : ""}>Settings</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default NavBar;