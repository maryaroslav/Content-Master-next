import HeaderWelcome from '@/components/headers/HeaderWelcome';
import JoinButton from '@/components/welcome/JoinButton';
import WelcomeCircles from '@/components/welcome/WelcomeCircles';

import '@/styles/welcome.css';

export default function WelcomePage() {
    return (
        <div className="welcome">
            <HeaderWelcome />
            <div className="info-container">
                <div className="info">
                    <div className="info-title">
                        <h1>Join the Chatvolution</h1>
                    </div>
                    <div className="info-text">
                        <p>Ask questions, share ideas, and build connections with each other.</p>
                    </div>
                    <JoinButton />
                </div>
            </div>
            <WelcomeCircles />
        </div>
    );
}
