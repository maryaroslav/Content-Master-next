import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from '@cm/forms';
import type { CreateCommunityRequest } from '@cm/contracts';
import '@/styles/createCommunity.css'
import Image from 'next/image';

import searchIcon from '@/images/icons/search.svg';

type ThemeKey = 'business' | 'cooking' | 'medicine' | 'realEstate' | 'programming' | 'design'
    | 'software' | 'websites' | 'animation' | 'games' | 'concerts' | 'humor';

// `value` is what the API stores, so it stays the same in every language.
const themeGroups: { key: 'general' | 'computer' | 'entertainment'; themes: { key: ThemeKey; value: string }[] }[] = [
    {
        key: 'general',
        themes: [
            { key: 'business', value: 'Business' },
            { key: 'cooking', value: 'Cooking and Recipes' },
            { key: 'medicine', value: 'Medicine' },
            { key: 'realEstate', value: 'Real Estate' },
        ],
    },
    {
        key: 'computer',
        themes: [
            { key: 'programming', value: 'Programming' },
            { key: 'design', value: 'Design' },
            { key: 'software', value: 'Software' },
            { key: 'websites', value: 'Websites' },
        ],
    },
    {
        key: 'entertainment',
        themes: [
            { key: 'animation', value: 'Animation' },
            { key: 'games', value: 'Games' },
            { key: 'concerts', value: 'Concerts' },
            { key: 'humor', value: 'Humor' },
        ],
    },
];

const StepTwo = () => {
    const t = useTranslations('community');
    const { register } = useFormContext<CreateCommunityRequest>();
    const [search, setSearch] = useState<string>('');

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return themeGroups
            .map((group) => ({
                ...group,
                themes: group.themes.filter((theme) => t(`themes.${theme.key}`).toLowerCase().includes(query)),
            }))
            .filter((group) => group.themes.length > 0);
    }, [search, t]);

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>{t('wizard.theme.title')}</h1>
                <p>{t('wizard.theme.text')}</p>
            </div>
            <div className="createcommunity-type-content">
                <div className="createcommunity-search-container">
                    <div className="createcommunity-type-content-search">
                        <Image src={searchIcon} alt="" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder={t('wizard.theme.search')}
                        />
                    </div>
                </div>
                <div className="createcommunity-theme-list">
                    {filtered.map((group) => (
                        <div key={group.key}>
                            {group.key !== 'general' && (
                                <h3 className='createcommunity-theme-category-heading'>{t(`themeGroups.${group.key}`)}</h3>
                            )}
                            {group.themes.map((theme) => (
                                <label key={theme.key} className="createcommunity-theme-item">
                                    <input
                                        type="radio"
                                        value={theme.value}
                                        className="createcommunity-theme-radio"
                                        {...register('theme')}
                                    />
                                    <span className='createcommunity-theme-item-span'>{t(`themes.${theme.key}`)}</span>
                                </label>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StepTwo;
