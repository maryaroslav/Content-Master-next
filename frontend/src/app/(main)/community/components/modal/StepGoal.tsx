import Image from 'next/image';

import blogImg from '@images/modal-create-community/blog-type.svg';
import businessImg from '@images/modal-create-community/business-type.svg';
import eventsImg from '@images/modal-create-community/events-type.svg';

interface StepGoalProps {
    onValidChange?: (valid: boolean) => void;
    nextStep: () => void;
}

const StepGoal = ({ nextStep, onValidChange }: StepGoalProps) => {
    const handleSelect = () => {
        onValidChange?.(true);
        nextStep();
    }

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>What is your goal?</h1>
                <p>Monetization, promotion, and other community features are available in any case.</p>
            </div>
            <div className="createcommunity-type-content">
                <div className="type-content-blog createcommunity-card-type" onClick={handleSelect}>
                    <Image src={blogImg} alt='blog' />
                    <div className="blog-title createcommunity-card-title">
                        <h2>Share content and communicate</h2>
                        <p>Run a blog, a local community, a creative project, or an interest group.</p>
                    </div>
                </div>
                <div className="type-content-business createcommunity-card-type" onClick={handleSelect}>
                    <Image src={businessImg} alt='business' />
                    <div className="business-title createcommunity-card-title">
                        <h2>Grow your business</h2>
                        <p>Sell products, provide services, or promote an organization or brand.</p>
                    </div>
                </div>
                <div className="type-content-events createcommunity-card-type" onClick={handleSelect}>
                    <Image src={eventsImg} alt='events' />
                    <div className="events-title createcommunity-card-title">
                        <h2>Organize an event</h2>
                        <p>Host a concert, lecture, party, workshop, or conference.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StepGoal;