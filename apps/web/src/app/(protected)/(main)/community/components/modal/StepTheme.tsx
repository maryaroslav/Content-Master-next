import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CreateCommunityRequest } from '@cm/contracts';
import { useFormContext } from '@cm/forms';
import { RadioList, TextField } from '@cm/ui';
import { useErrorText } from '@/i18n/useErrorText';

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

export default function StepTheme() {
    const t = useTranslations('community');
    const errorText = useErrorText();
    const { watch, setValue, formState: { errors } } = useFormContext<CreateCommunityRequest>();
    const [search, setSearch] = useState('');

    const groups = useMemo(() => {
        const query = search.trim().toLowerCase();
        return themeGroups
            .map((group) => ({
                label: group.key === 'general' ? undefined : t(`themeGroups.${group.key}`),
                options: group.themes
                    .map((theme) => ({ value: theme.value, label: t(`themes.${theme.key}`) }))
                    .filter((option) => option.label.toLowerCase().includes(query)),
            }))
            .filter((group) => group.options.length > 0);
    }, [search, t]);

    return (
        <>
            <TextField label={t('wizard.theme.search')} type="search" icon="search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <RadioList
                label={t('wizard.theme.label')}
                value={watch('theme')}
                onChange={(value) => setValue('theme', value, { shouldValidate: true })}
                groups={groups}
                error={errorText.field(errors.theme, 'theme')}
                scroll
            />
        </>
    );
}
