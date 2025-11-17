import Image from 'next/image'
import Link from 'next/link'
import '@/styles/headerWelcome.css';
import logo from '../../images/logo/logo.svg'

const HeaderWelcome = () => {
    return (
        <header className='header'>
            <div className='logo'>
                <Image src={logo} alt="logo"></Image>
                <p>Content Master</p>
            </div>
            <nav className='nav'>
                <Link href="/login" className='link'>Sign In</Link>
                <Link href="/register" className='link special'>Sign Up</Link>
            </nav>
        </header>
    );
}

export default HeaderWelcome;