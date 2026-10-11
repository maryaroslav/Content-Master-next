import { useTranslations } from 'next-intl';
import { useFormContext } from '@cm/forms';
import type { CreateCommunityRequest } from '@cm/contracts';

const DESCRIPTION_LIMIT = 350;

const StepDescription = () => {
    const t = useTranslations('community.wizard');
    const { register, watch } = useFormContext<CreateCommunityRequest>();
    const description = watch('description') ?? '';

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>{t('description.title')}</h1>
                <p>{t('description.text')}</p>
            </div>
            <div className="createcommunity-type-content">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='type-content-name-counter'>
                        <label htmlFor="community-description">{t('description.label')}</label>
                        <p>{t('counter', { current: description.length, max: DESCRIPTION_LIMIT })}</p>
                    </div>
                    <textarea
                        id="community-description"
                        className='createcommunity-type-content-textarea'
                        maxLength={DESCRIPTION_LIMIT}
                        {...register('description')}
                    />
                </form>
            </div>
        </div>
    );
};

export default StepDescription;
