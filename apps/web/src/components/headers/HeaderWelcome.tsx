import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server';
import '@/styles/headerWelcome.css';
import logo from '@images/logo/logo.svg'

const HeaderWelcome = async () => {
    const t = await getTranslations('welcome');
    return (
        <header className='header'>
            <div className='logo'>
                <Image src={logo} alt="logo"></Image>
                <p>Content Master</p>
            </div>
            <nav className='nav'>
                <Link href="/login" className='link'>{t('signIn')}</Link>
                <Link href="/register" className='link special'>{t('signUp')}</Link>
            </nav>
        </header>
    );
}

export default HeaderWelcome;