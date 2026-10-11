import { useTranslations } from 'next-intl';
import { useFormContext } from '@cm/forms';
import type { CreateCommunityRequest } from '@cm/contracts';

const NAME_LIMIT = 48;

const StepName = () => {
    const t = useTranslations();
    const { register, watch } = useFormContext<CreateCommunityRequest>();
    const name = watch('name') ?? '';

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>{t('community.wizard.name.title')}</h1>
                <p>{t('community.wizard.name.text')}</p>
            </div>
            <div className="createcommunity-type-content">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='type-content-name-counter'>
                        <label htmlFor="community-name">{t('community.wizard.name.label')}</label>
                        <p>{t('community.wizard.counter', { current: name.length, max: NAME_LIMIT })}</p>
                    </div>
                    <input id="community-name" type="text" placeholder={t('community.wizard.name.placeholder')} maxLength={NAME_LIMIT} {...register('name')} />
                    <label htmlFor="community-privacy">{t('community.wizard.name.privacy')}</label>
                    <select id="community-privacy" {...register('privacy')}>
                        <option value="public">{t('common.privacy.public')}</option>
                        <option value="private">{t('common.privacy.private')}</option>
                    </select>
                </form>
            </div>
        </div>
    );
}

export default StepName;
