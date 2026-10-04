import { useState, useMemo, useEffect } from 'react';
import '@/styles/createCommunity.css'
import Image from 'next/image';

import searchIcon from '@/images/icons/search.svg';

export const themeData = [
    {
        title: '',
        items: ['Business', 'Cooking and Recipes', 'Medicine', 'Real Estate']
    },
    {
        title: 'Computer, Internet',
        items: ['Programming', 'Design', 'Software', 'Websites']
    },
    {
        title: 'Entertainment',
        items: ['Animation', 'Games', 'Concerts', 'Humor']
    },
]

interface StepTwoProps {
    initialTheme?: string | null;
    onSelect?: (theme: string) => void;
    onValidChange?: (v: boolean) => void;
}

const StepTwo = ({ initialTheme = null, onSelect, onValidChange }: StepTwoProps) => {
    const [search, setSearch] = useState<string>('');
    const [selectedTheme, setSelectedTheme] = useState<string | null>(initialTheme);

    const normalized = (s: string) => s.trim().toLowerCase();

    const filtered = useMemo(() => {
        return themeData.map((cat) => {
            const items = cat.items.filter((it) =>
                normalized(it).includes(normalized(search))
            );
            return items.length ? { ...cat, items } : null;
        }).filter(Boolean) as { title: string; items: string[] }[];
    }, [search]);

    useEffect(() => {
        onValidChange?.(!!selectedTheme);
    }, [onValidChange, selectedTheme])


    const handleSelect = (theme: string) => {
        setSelectedTheme(theme);
        onSelect?.(theme);
        onValidChange?.(true);
    }

    return (
        <div>
            <div className='createcommunity-title'>
                <h1>Choose a theme</h1>
                <p>The choice does not affect the community&apos;s capabilities. You can change the theme at any time.</p>
            </div>
            <div className="createcommunity-type-content">
                <div className="createcommunity-search-container">
                    <div className="createcommunity-type-content-search">
                        <Image src={searchIcon} alt="" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search for a theme"
                        />
                    </div>
                </div>
                <div className="createcommunity-theme-list">
                    {filtered.map((cat) => (
                        <div key={cat.title || 'root'}>
                            {cat.title && <h3 className='createcommunity-theme-category-heading'>{cat.title}</h3>}
                            {cat.items.map((item) => (
                                <label key={item} className="createcommunity-theme-item">
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={item}
                                        checked={item === selectedTheme}
                                        onChange={() => handleSelect(item)}
                                        className="createcommunity-theme-radio"
                                    />
                                    <span className='createcommunity-theme-item-span'>{item}</span>
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