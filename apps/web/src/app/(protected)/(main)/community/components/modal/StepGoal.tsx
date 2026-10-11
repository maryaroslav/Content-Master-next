import Image from 'next/image';
import { useTranslations } from 'next-intl';

import blogImg from '@images/modal-create-community/blog-type.svg';
import businessImg from '@images/modal-create-community/business-type.svg';
import eventsImg from '@images/modal-create-community/events-type.svg';

interface StepGoalProps {
    onSelect: () => void;
}

const StepGoal = ({ onSelect }: StepGoalProps) => {
    const t = useTranslations('community.wizard.goal');
    const handleSelect = onSelect;

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>{t('title')}</h1>
                <p>{t('text')}</p>
            </div>
            <div className="createcommunity-type-content">
                <div className="type-content-blog createcommunity-card-type" onClick={handleSelect}>
                    <Image src={blogImg} alt="" />
                    <div className="blog-title createcommunity-card-title">
                        <h2>{t('blogTitle')}</h2>
                        <p>{t('blogText')}</p>
                    </div>
                </div>
                <div className="type-content-business createcommunity-card-type" onClick={handleSelect}>
                    <Image src={businessImg} alt="" />
                    <div className="business-title createcommunity-card-title">
                        <h2>{t('businessTitle')}</h2>
                        <p>{t('businessText')}</p>
                    </div>
                </div>
                <div className="type-content-events createcommunity-card-type" onClick={handleSelect}>
                    <Image src={eventsImg} alt="" />
                    <div className="events-title createcommunity-card-title">
                        <h2>{t('eventsTitle')}</h2>
                        <p>{t('eventsText')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StepGoal;