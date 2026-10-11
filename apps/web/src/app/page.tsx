import { getTranslations } from 'next-intl/server';
import HeaderWelcome from '@/components/headers/HeaderWelcome';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';
import JoinButton from '@/components/welcome/JoinButton';
import WelcomeCircles from '@/components/welcome/WelcomeCircles';

import '@/styles/welcome.css';

export default async function WelcomePage() {
    const t = await getTranslations('welcome');
    return (
        <div className="welcome">
            <HeaderWelcome />
            <div className="info-container">
                <div className="info">
                    <div className="info-title">
                        <h1>{t('title')}</h1>
                    </div>
                    <div className="info-text">
                        <p>{t('text')}</p>
                    </div>
                    <JoinButton />
                    <LanguageSwitcher className="welcome-language" />
                </div>
            </div>
            <WelcomeCircles />
        </div>
    );
}
